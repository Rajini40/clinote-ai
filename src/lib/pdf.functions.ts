import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "generated-pdfs";

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

async function buildPdf(input: {
  consultation: any;
  soap: any;
  patient: any;
  doctor: any;
}): Promise<Uint8Array> {
  const { consultation, soap, patient, doctor } = input;
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pageSize: [number, number] = [595.28, 841.89]; // A4
  const margin = 50;
  const maxWidth = pageSize[0] - margin * 2;
  const primary = rgb(0.05, 0.4, 0.7);
  const text = rgb(0.1, 0.12, 0.18);
  const muted = rgb(0.42, 0.45, 0.52);
  const line = rgb(0.85, 0.87, 0.92);

  let page = pdf.addPage(pageSize);
  let y = pageSize[1] - margin;

  const wrap = (str: string, size: number, f = font): string[] => {
    const words = (str ?? "").replace(/\r/g, "").split(/(\n| )/);
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      if (w === "\n") { lines.push(cur); cur = ""; continue; }
      const test = cur + w;
      if (f.widthOfTextAtSize(test, size) > maxWidth) {
        if (cur) lines.push(cur);
        cur = w.trimStart();
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  };

  const ensure = (h: number) => {
    if (y - h < margin) {
      page = pdf.addPage(pageSize);
      y = pageSize[1] - margin;
    }
  };

  const drawText = (str: string, opts: { size?: number; f?: any; color?: any; gap?: number } = {}) => {
    const size = opts.size ?? 10;
    const f = opts.f ?? font;
    const color = opts.color ?? text;
    const lines = wrap(str || "—", size, f);
    for (const ln of lines) {
      ensure(size + 4);
      page.drawText(ln, { x: margin, y: y - size, size, font: f, color });
      y -= size + 3;
    }
    y -= opts.gap ?? 4;
  };

  const hr = () => {
    ensure(10);
    page.drawLine({
      start: { x: margin, y: y - 2 },
      end: { x: pageSize[0] - margin, y: y - 2 },
      thickness: 0.5, color: line,
    });
    y -= 10;
  };

  const section = (label: string) => {
    ensure(22);
    page.drawText(label.toUpperCase(), {
      x: margin, y: y - 12, size: 10, font: bold, color: primary,
    });
    y -= 18;
    hr();
  };

  // Header
  page.drawRectangle({
    x: 0, y: pageSize[1] - 70, width: pageSize[0], height: 70,
    color: rgb(0.95, 0.97, 1),
  });
  page.drawText(doctor?.hospital || doctor?.clinic || "MediScribe Medical Report", {
    x: margin, y: pageSize[1] - 35, size: 16, font: bold, color: primary,
  });
  page.drawText("Clinical SOAP Note", {
    x: margin, y: pageSize[1] - 55, size: 10, font, color: muted,
  });
  const idLabel = `Report ID: ${consultation.id.slice(0, 8).toUpperCase()}`;
  page.drawText(idLabel, {
    x: pageSize[0] - margin - font.widthOfTextAtSize(idLabel, 9),
    y: pageSize[1] - 35, size: 9, font, color: muted,
  });
  const dLabel = `Date: ${fmtDate(consultation.created_at)}`;
  page.drawText(dLabel, {
    x: pageSize[0] - margin - font.widthOfTextAtSize(dLabel, 9),
    y: pageSize[1] - 50, size: 9, font, color: muted,
  });
  y = pageSize[1] - 90;

  // Patient info
  section("Patient Information");
  const pInfo = [
    ["Name", patient?.full_name || consultation.patient_name || "—"],
    ["Age", patient?.age != null ? String(patient.age) : "—"],
    ["Gender", patient?.gender || "—"],
    ["Blood Group", patient?.blood_group || "—"],
    ["Contact", patient?.contact || "—"],
    ["Allergies", patient?.allergies || "—"],
  ];
  for (const [k, v] of pInfo) {
    ensure(14);
    page.drawText(`${k}:`, { x: margin, y: y - 10, size: 9, font: bold, color });
    page.drawText(String(v), { x: margin + 90, y: y - 10, size: 9, font, color: text });
    y -= 14;
  }
  y -= 6;

  // Consultation meta
  section("Consultation");
  drawText(`Chief Complaint: ${consultation.chief_complaint || "—"}`, { size: 10 });
  drawText(`Language: ${consultation.language || "—"}`, { size: 10 });
  if (consultation.diagnosis) drawText(`Diagnosis: ${consultation.diagnosis}`, { size: 10 });

  // SOAP
  const sections: Array<[string, string]> = [
    ["Subjective", soap?.subjective || ""],
    ["Objective", soap?.objective || ""],
    ["Assessment", soap?.assessment || ""],
    ["Plan", soap?.plan || ""],
    ["Medication", soap?.medication || ""],
    ["Summary", soap?.summary || ""],
  ];
  for (const [label, body] of sections) {
    section(label);
    drawText(body || "—", { size: 10, gap: 6 });
  }

  // Doctor info
  section("Attending Physician");
  const dInfo = [
    ["Name", doctor?.full_name || "—"],
    ["Specialty", doctor?.specialty || "—"],
    ["Hospital", doctor?.hospital || "—"],
    ["Clinic", doctor?.clinic || "—"],
    ["Contact", doctor?.phone || "—"],
  ];
  for (const [k, v] of dInfo) {
    ensure(14);
    page.drawText(`${k}:`, { x: margin, y: y - 10, size: 9, font: bold, color });
    page.drawText(String(v), { x: margin + 90, y: y - 10, size: 9, font, color: text });
    y -= 14;
  }
  y -= 20;
  ensure(40);
  page.drawLine({
    start: { x: margin, y: y }, end: { x: margin + 200, y },
    thickness: 0.5, color: text,
  });
  page.drawText("Doctor's Signature", { x: margin, y: y - 12, size: 8, font, color: muted });

  // Footer on all pages
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    const footer = `MediScribe — Generated ${fmtDate(new Date().toISOString())}   ·   Page ${i + 1} of ${pages.length}`;
    p.drawText(footer, {
      x: margin, y: 24, size: 8, font, color: muted,
    });
  });

  return await pdf.save();
}

export const generateSoapPdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ consultation_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: consultation, error: cErr } = await supabase
      .from("consultations").select("*").eq("id", data.consultation_id).single();
    if (cErr || !consultation) throw new Error(cErr?.message ?? "Consultation not found");

    const { data: soap } = await supabase
      .from("soap_notes").select("*")
      .eq("consultation_id", data.consultation_id)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();

    let patient: any = null;
    if (consultation.patient_id) {
      const { data: p } = await supabase
        .from("patients").select("*").eq("id", consultation.patient_id).maybeSingle();
      patient = p;
    }

    const { data: doctor } = await supabase
      .from("profiles").select("*").eq("id", userId).maybeSingle();

    const bytes = await buildPdf({ consultation, soap, patient, doctor });

    const path = `${userId}/soap-${consultation.id}-${Date.now()}.pdf`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: "application/pdf", upsert: true });
    if (upErr) throw new Error(`PDF upload failed: ${upErr.message}`);

    await supabase.from("consultations")
      .update({ pdf_path: path }).eq("id", consultation.id);

    await supabase.from("reports").insert({
      doctor_id: userId,
      consultation_id: consultation.id,
      kind: "soap",
      storage_path: path,
    });

    const { data: signed, error: sErr } = await supabase.storage
      .from(BUCKET).createSignedUrl(path, 3600);
    if (sErr) throw new Error(sErr.message);

    await supabase.from("activity_logs").insert({
      doctor_id: userId, action: "pdf.generated",
      entity: "consultation", entity_id: consultation.id,
    });

    return { path, url: signed.signedUrl };
  });

export const getSoapPdfUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ consultation_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: consult } = await context.supabase
      .from("consultations").select("pdf_path")
      .eq("id", data.consultation_id).maybeSingle();
    if (!consult?.pdf_path) return { url: null as string | null, path: null as string | null };
    const { data: signed, error } = await context.supabase.storage
      .from(BUCKET).createSignedUrl(consult.pdf_path, 3600);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl, path: consult.pdf_path };
  });

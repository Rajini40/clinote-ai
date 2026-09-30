/**
 * AI provider boundary (server-only).
 *
 * This is the ONLY place in the app that talks to an AI service.
 * Currently backed by the Lovable AI Gateway. In the next step this file
 * will be replaced by calls to the MediScribe FastAPI backend
 * (e.g. POST /transcribe and POST /soap) — callers stay unchanged.
 */

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";

export type SoapFields = {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  medication: string;
  summary: string;
};

function getApiKey(): string {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI backend is not configured (missing LOVABLE_API_KEY).");
  return apiKey;
}

/** Speech-to-text for an uploaded consultation recording. */
export async function transcribeAudio(audio: Blob, filename: string): Promise<string> {
  const form = new FormData();
  form.append("file", audio, filename);
  form.append("model", "openai/gpt-4o-transcribe");

  const res = await fetch(`${GATEWAY_URL}/audio/transcriptions`, {
    method: "POST",
    headers: { "Lovable-API-Key": getApiKey() },
    body: form,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Transcription failed (${res.status}): ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as { text?: string };
  const text = (json.text ?? "").trim();
  if (!text) throw new Error("Transcription returned empty text.");
  return text;
}

/** Structured SOAP note generation from a transcript. */
export async function generateSoapNote(input: {
  patientName: string;
  language: string;
  chiefComplaint: string | null;
  transcript: string;
}): Promise<SoapFields> {
  const systemPrompt = `You are a senior clinical documentation assistant. Given a raw doctor-patient consultation transcript (which may be multilingual), produce a concise, accurate SOAP note in English. Never invent findings, medications, or diagnoses that are not supported by the transcript. If a section has no information, return an empty string.`;
  const userPrompt = `Patient: ${input.patientName}
Consultation language: ${input.language}
Chief complaint (doctor-entered): ${input.chiefComplaint ?? "(none)"}

Transcript:
"""
${input.transcript}
"""

Return a JSON object with these string fields:
- subjective: patient-reported history, symptoms, context.
- objective: exam findings, vitals, observed signs.
- assessment: clinical impression / differential / diagnosis.
- plan: investigations, procedures, follow-up.
- medication: prescribed drugs with dose, route, frequency, duration (one per line).
- summary: 2-4 sentence lay summary the patient can understand.`;

  const res = await fetch(`${GATEWAY_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": getApiKey() },
    body: JSON.stringify({
      model: "openai/gpt-5.5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "soap_note",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["subjective", "objective", "assessment", "plan", "medication", "summary"],
            properties: {
              subjective: { type: "string" },
              objective: { type: "string" },
              assessment: { type: "string" },
              plan: { type: "string" },
              medication: { type: "string" },
              summary: { type: "string" },
            },
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("AI rate limit reached. Please retry shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits to continue.");
    throw new Error(`SOAP generation failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = json.choices?.[0]?.message?.content ?? "";
  try {
    return JSON.parse(raw) as SoapFields;
  } catch {
    throw new Error("AI returned malformed SOAP JSON.");
  }
}

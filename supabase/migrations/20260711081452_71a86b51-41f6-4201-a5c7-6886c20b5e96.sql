
DO $$
DECLARE b text;
BEGIN
  FOR b IN SELECT unnest(ARRAY['consultation-audio','generated-pdfs','patient-documents','profile-images'])
  LOOP
    EXECUTE format($f$
      DROP POLICY IF EXISTS "own-read-%1$s" ON storage.objects;
      CREATE POLICY "own-read-%1$s" ON storage.objects FOR SELECT TO authenticated
        USING (bucket_id = %1$L AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(),'admin')));
      DROP POLICY IF EXISTS "own-insert-%1$s" ON storage.objects;
      CREATE POLICY "own-insert-%1$s" ON storage.objects FOR INSERT TO authenticated
        WITH CHECK (bucket_id = %1$L AND auth.uid()::text = (storage.foldername(name))[1]);
      DROP POLICY IF EXISTS "own-update-%1$s" ON storage.objects;
      CREATE POLICY "own-update-%1$s" ON storage.objects FOR UPDATE TO authenticated
        USING (bucket_id = %1$L AND auth.uid()::text = (storage.foldername(name))[1]);
      DROP POLICY IF EXISTS "own-delete-%1$s" ON storage.objects;
      CREATE POLICY "own-delete-%1$s" ON storage.objects FOR DELETE TO authenticated
        USING (bucket_id = %1$L AND auth.uid()::text = (storage.foldername(name))[1]);
    $f$, b);
  END LOOP;
END $$;

CREATE TABLE public.shared_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_content text NOT NULL,
  image_url text,
  mode text DEFAULT 'chat',
  original_prompt text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.shared_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shared responses"
  ON public.shared_responses FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert shared responses"
  ON public.shared_responses FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
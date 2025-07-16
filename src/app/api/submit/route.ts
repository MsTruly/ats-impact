import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role for storage + inserts
);

const resend = new Resend(process.env.BREVO_API_KEY); // Or use fetch() with Brevo REST API

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const pastedText = formData.get('pastedText') as string | null;
  const email = formData.get('email') as string | null;

  if (!email || (!file && !pastedText)) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  let resumeUrl = '';
  const id = crypto.randomUUID();

  try {
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(`submissions/${id}/${file.name}`, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('resumes')
        .getPublicUrl(`submissions/${id}/${file.name}`);

      resumeUrl = publicUrl.publicUrl;
    } else if (pastedText) {
      // Save as .txt file to Supabase
      const filename = `submissions/${id}/resume.txt`;
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(filename, pastedText, {
          contentType: 'text/plain',
          upsert: true,
        });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('resumes')
        .getPublicUrl(filename);

      resumeUrl = publicUrl.publicUrl;
    }

    // ✅ Insert metadata into Supabase table
    await supabase.from('submissions').insert({
      id,
      email,
      resume_url: resumeUrl,
    });

    // ✅ Send Brevo confirmation email (optional)
    await resend.emails.send({
      from: 'no-reply@atsimpact.com',
      to: email,
      subject: 'Resume Received ✔️',
      html: `<p>Thanks for submitting your resume! Our analysis is underway.</p>`,
    });

    return NextResponse.json({ success: true, resumeUrl });
  } catch (err: any) {
    console.error('Submit error:', err.message);
    return NextResponse.json({ error: 'Server error. Try again.' }, { status: 500 });
  }
}

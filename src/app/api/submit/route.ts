import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.BREVO_API_KEY);

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const pastedText = formData.get('pastedText') as string | null;
  const email = formData.get('email') as string | null;

  if (!email || (!file && !pastedText)) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  const id = crypto.randomUUID();
  let resumeUrl = '';

  try {
    // 1. Upload file if it exists
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
    }

    // 2. Insert into Supabase DB
    const { error: insertError } = await supabase.from('submissions').insert([
      {
        id,
        email,
        resume_url: resumeUrl,
        pasted_text: pastedText,
      },
    ]);

    if (insertError) throw insertError;

    // 3. Send confirmation email
    await resend.emails.send({
      from: 'ATS Impact <noreply@atsimpact.com>', // Update domain if verified
      to: email,
      subject: 'Your resume was received!',
      html: `
        <p>Thank you for submitting your resume to ATS Impact.</p>
        ${resumeUrl ? `<p><a href="${resumeUrl}">View Uploaded Resume</a></p>` : ''}
        ${pastedText ? `<p><strong>Text Submitted:</strong><br>${pastedText}</p>` : ''}
        <p>We’ll analyze it and get back to you shortly.</p>
      `,
    });

    return NextResponse.json({ message: 'Resume submitted successfully' }, { status: 200 });
  } catch (err: any) {
    console.error('Submission error:', err);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';

// ✅ Runtime-only environment access
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resendApiKey = process.env.BREVO_API_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey || !resendApiKey) {
  console.error('❌ Missing required environment variables');
  throw new Error('Missing Supabase or Brevo credentials');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
const resend = new Resend(resendApiKey);

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('resumeFile') as File | null;
  const pastedText = formData.get('resumeText') as string | null;
  const email = formData.get('email') as string | null;

  if (!email || (!file && !pastedText)) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  const id = crypto.randomUUID();
  let resumeUrl = '';

  try {
    // ✅ Upload resume file
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error } = await supabase.storage
        .from('resumes')
        .upload(`submissions/${id}/${file.name}`, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (error) throw error;

      resumeUrl = `https://${supabaseUrl.replace(
        'https://',
        ''
      )}/storage/v1/object/public/resumes/submissions/${id}/${file.name}`;
    }

    // ✅ Save metadata
    const { error: insertError } = await supabase.from('Submissions').insert({
      id,
      email,
      resume_url: resumeUrl || null,
      pasted_text: pastedText || null,
    });

    if (insertError) throw insertError;

    // ✅ Email confirmation
    await resend.emails.send({
      from: 'noreply@atsimpact.com',
      to: email,
      subject: 'Resume Received - ATS Impact',
      html: `
        <p>Hi,</p>
        <p>We've successfully received your resume. Thank you for using ATS Impact!</p>
        ${
          resumeUrl
            ? `<p><a href="${resumeUrl}">View Uploaded Resume</a></p>`
            : ''
        }
        <p>We’ll be in touch soon with your ATS report.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('❌ Submission Error:', err.message);
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}

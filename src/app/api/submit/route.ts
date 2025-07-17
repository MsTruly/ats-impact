export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';

// ✅ Environment fallback logic
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  '';

const supabaseServiceRoleKey =
  process.env.NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY || // 👈 NEW recommended key
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  '';

// ✅ TEMP DEBUG LOGS (remove after fixing)
console.log('SUPABASE_URL:', supabaseUrl);
console.log(
  'SUPABASE_SERVICE_ROLE_KEY:',
  supabaseServiceRoleKey ? 'Loaded ✅' : 'Missing ❌'
);

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

// ✅ Supabase + Resend clients
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
const resend = new Resend(process.env.BREVO_API_KEY);

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
    // ✅ Upload file to Supabase Storage
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error } = await supabase.storage
        .from('resumes')
        .upload(`submissions/${id}/${file.name}`, buffer, {
          contentType: file.type,
          upsert: true
        });

      if (error) throw error;

      resumeUrl = `https://${supabaseUrl.replace(
        'https://',
        ''
      )}/storage/v1/object/public/resumes/submissions/${id}/${file.name}`;
    }

    // ✅ Save metadata to DB
    const { error: insertError } = await supabase.from('Submissions').insert({
      id,
      email,
      resume_url: resumeUrl || null,
      pasted_text: pastedText || null
    });

    if (insertError) throw insertError;

    // ✅ Email user confirmation
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
      `
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Submission Error:', err.message);
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}

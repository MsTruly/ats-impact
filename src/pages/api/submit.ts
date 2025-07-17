import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resendApiKey = process.env.BREVO_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
const resend = new Resend(resendApiKey);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // ✅ Parse form data from the raw request
    const chunks: Uint8Array[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const buffer = Buffer.concat(chunks);

    // ✅ Use Web API to parse form data
    const formData = await new Response(buffer).formData();
    const email = formData.get('email') as string | null;
    const file = formData.get('resumeFile') as File | null;
    const pastedText = formData.get('resumeText') as string | null;

    if (!email || (!file && !pastedText)) {
      return res.status(400).json({ error: 'Missing data' });
    }

    const id = crypto.randomUUID();
    let resumeUrl = '';

    // ✅ Upload file to Supabase Storage
    if (file) {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(`submissions/${id}/${file.name}`, fileBuffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      resumeUrl = `https://${supabaseUrl.replace(
        'https://',
        ''
      )}/storage/v1/object/public/resumes/submissions/${id}/${file.name}`;
    }

    // ✅ Save submission in DB
    const { error: dbError } = await supabase.from('Submissions').insert({
      id,
      email,
      resume_url: resumeUrl || null,
      pasted_text: pastedText || null,
    });

    if (dbError) throw dbError;

    // ✅ Send confirmation email
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

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('❌ Submission Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

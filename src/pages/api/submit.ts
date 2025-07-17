import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.BREVO_API_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = formidable({
    multiples: false,
    maxFileSize: 10 * 1024 * 1024, // ✅ Limit file size to 10MB
  });

  form.parse(req, async (err: any, fields: formidable.Fields, files: formidable.Files) => {
    if (err) {
      console.error('❌ Form parse error:', err);
      return res.status(500).json({ error: 'Form parse failed' });
    }

    const email = fields.email?.toString() || '';
    const pastedText = fields.resumeText?.toString() || '';
    const file = files.resumeFile as formidable.File | undefined;

    if (!email || (!file && !pastedText)) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    const id = crypto.randomUUID();
    let resumeUrl = '';

    try {
      if (file && file.filepath) {
        try {
          const fileBuffer = fs.readFileSync(file.filepath);
          const { error } = await supabase.storage
            .from('resumes')
            .upload(`submissions/${id}/${file.originalFilename}`, fileBuffer, {
              contentType: file.mimetype || 'application/octet-stream',
              upsert: true,
            });

          if (error) throw error;

          resumeUrl = `https://${process.env.SUPABASE_URL!.replace(
            'https://',
            ''
          )}/storage/v1/object/public/resumes/submissions/${id}/${file.originalFilename}`;
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          return res.status(500).json({ error: 'File upload failed' });
        }
      }

      const { error: dbError } = await supabase.from('Submissions').insert({
        id,
        email,
        resume_url: resumeUrl || null,
        pasted_text: pastedText || null,
      });

      if (dbError) throw dbError;

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
    } catch (error: any) {
      console.error('❌ API Error:', error.message);
      return res.status(500).json({ error: error.message || 'Server error' });
    }
  });
}
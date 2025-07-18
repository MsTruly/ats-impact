// src/app/api/submit/route.ts

import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Disables Next.js default body parsing (required for file uploads)
export const config = {
  api: { bodyParser: false }
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Parse form using formidable
    const form = formidable({ multiples: false });
    const fieldsAndFiles = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const fields = fieldsAndFiles.fields;
    const files = fieldsAndFiles.files;

    const email = Array.isArray(fields.email) ? fields.email[0] : fields.email || '';
    const pastedText = Array.isArray(fields.pastedText) ? fields.pastedText[0] : fields.pastedText || '';
    let resumeUrl = null;

    if (files.resume) {
      const resumeFile = Array.isArray(files.resume) ? files.resume[0] : files.resume;
      const filePath = resumeFile.filepath;
      const fileBuffer = fs.readFileSync(filePath);
      const fileExt = path.extname(resumeFile.originalFilename || '.pdf');
      const fileName = `${Date.now()}_${resumeFile.newFilename}${fileExt}`;

      const { error } = await supabase.storage
        .from('resumes')
        .upload(fileName, fileBuffer, {
          contentType: resumeFile.mimetype || 'application/pdf',
        });

      if (error) {
        console.error('❌ Resume upload failed:', error.message);
        return NextResponse.json({ error: 'Resume upload failed' }, { status: 500 });
      }

      resumeUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/resumes/${fileName}`;
    }

    // Save to Supabase
    const { error: dbError } = await supabase.from('Submissions').insert([
      {
        email,
        pasted_text: pastedText,
        resume_url: resumeUrl,
      },
    ]);

    if (dbError) {
      console.error('❌ Database insert error:', dbError.message);
      return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
    }

    // Send notification email via Brevo
    const brevoResponse = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'ATS Impact', email: 'cs@atsimpact.com' },
        to: [{ email }],
        subject: 'ATS Impact Submission Received',
        htmlContent: `
          <p>Hi there,</p>
          <p>We received your resume and submission. Thank you!</p>
          <p>We'll analyze your resume and send back a report shortly.</p>
          <p>- The ATS Impact Team</p>
        `,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY || '',
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Brevo email sent:', brevoResponse.data);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Submit handler error:', error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
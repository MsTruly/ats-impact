// src/app/api/submit/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import { Readable } from 'stream';
import fs from 'fs/promises';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Parse the form data (we'll use formidable)
    const formData = await req.formData();
    const email = formData.get('email');
    const file = formData.get('resume'); // File or null

    let resumeUrl = null;

    if (file && typeof file === 'object') {
      // @ts-ignore
      const arrayBuffer = await file.arrayBuffer();
      // @ts-ignore
      const buffer = Buffer.from(arrayBuffer);

      const fileName = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from('resumes')
        .upload(fileName, buffer, {
          contentType: file.type,
        });

      if (error) {
        console.error('❌ Resume upload failed:', error.message);
        return NextResponse.json({ error: 'Resume upload failed' }, { status: 500 });
      }

      resumeUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/resumes/${fileName}`;
    }

    // Save submission to Supabase table
    const { error: dbError } = await supabase.from('Submissions').insert([
      {
        email,
        resume_url: resumeUrl,
      },
    ]);

    if (dbError) {
      console.error('❌ Database insert error:', dbError.message);
      return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
    }

    // Send notification email via Brevo
    await axios.post(
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Submit handler error:', error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}


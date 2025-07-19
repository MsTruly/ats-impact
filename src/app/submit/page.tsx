/// src/app/submit/page.tsx
'use client';

import { useState } from 'react';

export default function SubmitPage() {
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    setSubmitStatus('Uploading...');

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unknown error');
      }

      setSubmitStatus('Resume submitted successfully!');
    } catch (error: any) {
      setSubmitStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ margin: '40px auto', maxWidth: 600 }}>
      <h1>Submit Your Resume</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>
          Email:
          <input
            type="email"
            name="email"
            required
            style={{ display: 'block', margin: '10px 0' }}
          />
        </label>

        <label>
          Resume (PDF or DOCX):
          <input
            type="file"
            name="resume"
            required
            accept=".pdf,.doc,.docx"
            style={{ display: 'block', margin: '10px 0' }}
          />
        </label>

        <button type="submit">Submit</button>
      </form>

      {submitStatus && (
        <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{submitStatus}</p>
      )}
    </div>
  );
}

'use client'

import { useState } from 'react'

export default function ResumeSubmitPage() {
  const [email, setEmail] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [pastedText, setPastedText] = useState('')
  const [submitStatus, setSubmitStatus] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitStatus('Uploading...')

    const formData = new FormData()
    formData.append('email', email)

    if (file) {
      formData.append('file', file)
    }

    if (pastedText.trim()) {
      formData.append('pastedText', pastedText)
    }

    const response = await fetch('/api/submit', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (response.ok) {
      setSubmitStatus('✅ Resume submitted successfully!')
    } else {
      setSubmitStatus(`❌ Error: ${result.error}`)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Submit Your Resume</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Your Email:</label><br />
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>Upload Resume (PDF or DOCX):</label><br />
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
        </div>

        <div style={{ margin: '20px 0' }}>
          <label>Or Paste Resume Text:</label><br />
          <textarea
            rows={10}
            style={{ width: '100%' }}
            value={pastedText}
            onChange={e => setPastedText(e.target.value)}
            placeholder="Paste your resume text here"
          />
        </div>

        <button type="submit">Submit Resume</button>
      </form>

      {submitStatus && <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{submitStatus}</p>}
    </div>
  )
}

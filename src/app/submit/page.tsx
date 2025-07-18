// src/app/submit/page.tsx

export default function SubmitPage() {
  return (
    <div style={{ margin: '40px auto', maxWidth: 600 }}>
      <h1>Submit Your Resume</h1>
      <form method="POST" action="/api/submit" encType="multipart/form-data">
        <label>
          Email:
          <input type="email" name="email" required style={{ display: 'block', margin: '10px 0' }}/>
        </label>
        <label>
          Resume (PDF or DOCX):
          <input type="file" name="resume" required accept=".pdf,.doc,.docx" />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

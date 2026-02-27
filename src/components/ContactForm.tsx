import { useState } from 'react';

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong');
      }

      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="contact" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>Get in touch</h2>
          <p>Using BananaKit? Running into something? Building something cool? We want to hear about it.</p>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-field">
            <label className="contact-label">Email</label>
            <input className="contact-input" type="email" name="email" placeholder="you@example.com" required />
          </div>
          <div className="contact-field">
            <label className="contact-label">Subject</label>
            <input className="contact-input" type="text" name="subject" placeholder="Bug report, question, showcase..." />
          </div>
          <div className="contact-field">
            <label className="contact-label">Message</label>
            <textarea className="contact-textarea" name="message" placeholder="What's on your mind?" required />
          </div>
          {error && <p style={{ color: '#ff4444', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
          <button className="contact-submit" type="submit" disabled={sent || sending}>
            {sent ? "Sent! We'll get back to you." : sending ? 'Sending...' : 'Send Message'}
          </button>
          <p className="contact-note">
            Or email us directly at{' '}
            <a href="mailto:hello@bananalabs.gg" style={{ color: 'var(--accent)' }}>
              hello@bananalabs.gg
            </a>
          </p>
          <p className="contact-note">
            Or open an issue on{' '}
            <a href="https://github.com/BananaLabs-OSS" style={{ color: 'var(--accent)' }}>
              GitHub
            </a>
          </p>
        </form>
      </div>
    </section>
  );
}

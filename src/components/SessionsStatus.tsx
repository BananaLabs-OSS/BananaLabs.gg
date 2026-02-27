import { useState, useEffect } from 'react';

const SESSIONS_API = import.meta.env.DEV ? 'http://localhost:8080' : 'https://sessions.gg';

export default function SessionsStatus() {
  const [status, setStatus] = useState<'loading' | 'live' | 'queue' | 'down'>('loading');
  const [label, setLabel] = useState('Checking...');

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch(`${SESSIONS_API}/api/queue/status`);
        if (!res.ok) throw new Error();
        const data = await res.json();

        const stripeDown = data.stripe_status !== 'reachable';
        const bananagineDown = data.bananagine_status !== 'reachable';
        const full = data.active_servers >= data.max_servers;

        if (stripeDown) {
          setStatus('down');
          setLabel('Payments down');
        } else if (bananagineDown || full) {
          setStatus('queue');
          setLabel('Queue active');
        } else {
          setStatus('live');
          setLabel('Live');
        }
      } catch {
        setStatus('down');
        setLabel('Unreachable');
      }
    }

    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []);

  const cls = status === 'live' ? 'green' : status === 'queue' ? 'yellow' : status === 'down' ? 'red' : '';

  return (
    <span className={`status-dot ${cls}`} style={{ color: 'var(--muted)' }}>
      {label}
    </span>
  );
}

import { useState, useEffect } from 'react';

const SESSIONS_API = import.meta.env.PUBLIC_API_URL || 'https://api.sessions.gg';

function updateAlerts(data: any) {
  const container = document.getElementById('status-alerts');
  if (!container) return;

  const alerts: { text: string; cls: string }[] = [];
  if (data.stripe_status !== 'reachable')
    alerts.push({ text: '\u2715 Payments Down', cls: 'alert-red' });
  if (data.bananagine_status !== 'reachable')
    alerts.push({ text: '\u2715 Provisioning Down', cls: 'alert-orange' });
  if (data.resend_status !== 'reachable')
    alerts.push({ text: '\u2715 Email Down', cls: 'alert-red' });

  if (alerts.length === 0) {
    container.style.display = 'none';
    container.innerHTML = '';
  } else {
    container.innerHTML = alerts
      .map((a) => `<span class="status-alert ${a.cls}">${a.text}</span>`)
      .join('');
    container.style.display = 'inline-flex';
  }
}

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

        updateAlerts(data);

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

  const color = status === 'live' ? 'var(--g)' : status === 'queue' ? 'var(--y)' : status === 'down' ? 'var(--r)' : 'var(--dim)';
  const bg = status === 'live' ? 'var(--gd)' : status === 'queue' ? 'var(--yd)' : status === 'down' ? 'var(--rd)' : 'rgba(255,255,255,.04)';
  const border = status === 'live' ? 'rgba(34,197,94,.2)' : status === 'queue' ? 'rgba(232,185,49,.2)' : status === 'down' ? 'rgba(248,113,113,.2)' : 'var(--border)';

  return (
    <span className="status-pill" style={{ background: bg, borderColor: border, fontSize: '10px', padding: '4px 12px', gap: '6px' }}>
      <span className="pill-dot" style={{ background: color, width: '6px', height: '6px' }} />
      {label}
    </span>
  );
}

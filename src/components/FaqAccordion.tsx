import { useState } from 'react';

const faqs = [
  {
    q: "Is this actually free?",
    a: "Yes. MIT licensed. Use it, fork it, sell products built on it. No license fees, no \"open core\" bait-and-switch.",
  },
  {
    q: "What's the difference between BananaLabs and MonkeyLabs?",
    a: "BananaLabs is the open-source org — it maintains BananaKit. MonkeyLabs LLC is the commercial entity — it builds paid products on top. Revenue from MonkeyLabs funds the open-source work.",
  },
  {
    q: "Do I need all 8 packages?",
    a: "No. Every piece is independent. Need just matchmaking? Use Bananasplit. Just auth? Use BananAuth. They work together but don't require each other.",
  },
  {
    q: "What games does it support?",
    a: "BananaKit is game-agnostic — it orchestrates containers, not game logic. If your game runs in Docker, BananaKit can manage it.",
  },
  {
    q: "Who maintains this?",
    a: "One engineer, building in public. Every component runs on real hardware before it gets a version number. Years of running game servers taught what actually matters.",
  },
  {
    q: "Can I contribute?",
    a: "Everything's on GitHub. PRs welcome. Issues welcome. If you're building something cool on BananaKit, we want to hear about it.",
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="section section-alt">
      <div className="section-inner">
        <div className="section-header">
          <h2>FAQ</h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`faq-item${open === i ? ' open' : ''}`}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div className="faq-q">
                <span>{faq.q}</span>
                <button className="faq-toggle">+</button>
              </div>
              <div className="faq-a">{faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

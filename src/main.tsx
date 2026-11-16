import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const portfolio = 'https://aofanwang.github.io/projects/teacher-decision-lab';
const screens = ['Welcome', 'Learning journey', 'Scenario introduction'] as const;
const classroom = import.meta.env.BASE_URL + 'classroom.jpg';

function Course() {
  const [step, setStep] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const changed = useRef(false);
  useEffect(() => {
    if (changed.current) heading.current?.focus();
  }, [step]);

  function goTo(next: number) {
    if (next < 0 || next >= screens.length || next === step) return;
    changed.current = true;
    setStep(next);
  }

  return <>
    <a className="skip" href="#lesson">Skip to lesson</a>
    <header className="shell header"><span>Teacher Decision Lab</span><a href={portfolio}><span aria-hidden="true">↖</span> Back to Portfolio</a></header>
    <main id="lesson" className="shell">
      <nav aria-label="Lesson progress">
        <ol className="progress">{screens.map((label, index) => (
          <li key={label}><button type="button" aria-current={step === index ? 'step' : undefined} onClick={() => goTo(index)}>
            <span className="number" aria-hidden="true">0{index + 1}</span>{label}
          </button></li>
        ))}</ol>
      </nav>

      {step === 0 ? <>
        <section className="split" aria-labelledby="screen-title">
          <div>
            <p className="eyebrow">WELCOME TO THE LAB</p>
            <h1 id="screen-title" ref={heading} tabIndex={-1}>Teaching isn't always about knowing the answer.</h1>
            <p className="deck">It's about knowing how to respond.</p>
            <p>Real classrooms are unpredictable. Children have different needs, emotions, and experiences, and the same strategy may not work in every situation.</p>
            <p>Teacher Decision Lab is a scenario-based learning experience designed to help new preschool teachers practice decisions before facing similar moments in the classroom.</p>
          </div>
          <img src={classroom} alt="" width="1536" height="1024" />
        </section>
        <dl className="facts">
          <div><dt>Audience</dt><dd>Novice preschool teachers</dd></div>
          <div><dt>Format</dt><dd>Self-paced scenario practice</dd></div>
          <div><dt>Scope</dt><dd>One classroom case</dd></div>
        </dl>
      </> : step === 1 ? (
        <section className="reading" aria-labelledby="screen-title">
          <h1 id="screen-title" ref={heading} tabIndex={-1}>Your learning journey</h1>
          <h2>Learning objectives</h2>
          <ol className="objectives">
            <li>Recognize relevant information before making a classroom decision.</li>
            <li>Compare possible responses and explain their trade-offs.</li>
            <li>Adapt an approach when new contextual information becomes available.</li>
          </ol>
          <h2>How it works</h2>
          <p>You'll encounter a classroom situation, choose how to respond, explore possible consequences, and reconsider your decision. At the end, you'll reflect on what you might apply in your own teaching.</p>
          <aside className="callout"><p>This is a learning space, not a performance test. Some decisions have multiple reasonable approaches, but children's safety and well-being always come first.</p></aside>
        </section>
      ) : (
        <section className="split" aria-labelledby="screen-title">
          <div>
            <p className="eyebrow">SCENARIO 01 · CLASSROOM CONFLICT</p>
            <h1 id="screen-title" ref={heading} tabIndex={-1}>One toy. Two perspectives.</h1>
            <p>It's a busy morning in a preschool classroom. Two children are playing near the same shelf when a disagreement begins.</p>
            <p>Both children can communicate verbally. Each says they had the toy first. You're nearby, but you didn't see who was using it before the conflict.</p>
            <aside className="callout"><h2>Pause and reflect</h2><p>What do you know for certain? What information might you still need?</p></aside>
          </div>
          <img src={classroom} alt="Editorial illustration of two children near a low classroom shelf with a toy between them." width="1536" height="1024" />
        </section>
      )}

      <div className="controls">
        {step > 0 && <button type="button" onClick={() => goTo(step - 1)}><span aria-hidden="true">←</span> Back</button>}
        {step < 2 && <button className="primary" type="button" onClick={() => goTo(step + 1)}>{step === 0 ? 'Continue' : 'Enter the Classroom'} <span aria-hidden="true">→</span></button>}
      </div>
      <footer>{step === 2 ? 'This preview ends before the decision activity.' : 'Teacher Decision Lab · Course preview'}</footer>
    </main>
  </>;
}

createRoot(document.getElementById('root')!).render(<Course />);

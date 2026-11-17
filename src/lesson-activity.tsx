import { useRef, useState, type ReactNode } from 'react';
import { adaptations, branches, colleague, facts, integration, questions, strategies, takeaways } from './lesson-content';
import { chooseInitial, finish, observeBranch, required, reviewBranch, type Activity, type LessonState, type Screen, type Strategy } from './lesson-state';

type Props = {
  screen: Exclude<Screen, 'landing' | 'lesson'>;
  state: LessonState;
  setState: (state: LessonState) => void;
  go: (screen: Screen, state?: LessonState) => void;
  restart: () => void;
};

function Action({ children, onClick, disabled = false }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button className="primary" type="button" onClick={onClick} disabled={disabled}>{children}</button>;
}

function Dialogue({ name, children }: { name: string; children: ReactNode }) {
  return <blockquote className="dialogue"><cite>{name}</cite><p>“{children}”</p></blockquote>;
}

function Scene({ file, alt }: { file: string; alt: string }) {
  const [missing, setMissing] = useState(false);
  return missing ? <figure className="scene-fallback"><img className="panorama lesson-image" src={import.meta.env.BASE_URL + 'classroom-conflict.jpg'} alt="" /><figcaption>Classroom reference illustration. This moment is described below.</figcaption></figure>
    : <img className="panorama lesson-image" src={import.meta.env.BASE_URL + file} alt={alt} width={2137} height={736} onError={() => setMissing(true)} />;
}

function Choices({ label, name, options, selected, select, exclude }: {
  label: string; name: string; options: Record<Strategy, { name: string; response: string }>;
  selected: Strategy | null; select: (id: Strategy) => void; exclude?: Strategy | null;
}) {
  return <fieldset className="choice-group"><legend className="sr-only">{label}</legend>
    {strategies.filter(id => id !== exclude).map(id => <label className="choice" key={id}>
      <input type="radio" name={name} checked={selected === id} onChange={() => select(id)} />
      <span><strong>{options[id].name}</strong><span className="response">“{options[id].response}”</span></span>
    </label>)}
  </fieldset>;
}

function ClassificationActivity({ state, setState, advance }: { state: LessonState; setState: Props['setState']; advance: () => void }) {
  const allAnswered = facts.every((_, index) => state.facts[index]);
  const feedback = useRef<HTMLParagraphElement>(null);
  function check() {
    setState({ ...state, checked: true });
    feedback.current?.focus();
  }
  return <>
    <h1>What do you actually know?</h1>
    <p>Before deciding how to respond, separate what you have directly observed from what you might be assuming.</p>
    <p className="feedback-summary" tabIndex={-1} ref={feedback} aria-live="polite">{state.checked ? 'Separating observations from interpretations helps teachers make more informed and fair decisions.' : ''}</p>
    <div className="fact-list">
      {facts.map((fact, index) => <fieldset key={fact.text} className="fact">
        <legend>{index + 1}. {fact.text}</legend>
        <div className="classification-options">
          {(['Fact', 'Assumption'] as const).map(value => <label key={value}>
            <input type="radio" name={'fact-' + index} checked={state.facts[index] === value} disabled={state.checked}
              onChange={() => setState({ ...state, facts: { ...state.facts, [index]: value } })} />{value}
          </label>)}
        </div>
        {state.checked && <p className="feedback-detail"><strong>{fact.correct}</strong> · {state.facts[index] === fact.correct ? 'Your classification matches.' : 'You selected ' + state.facts[index] + '.'} {fact.feedback}</p>}
      </fieldset>)}
    </div>
    <div className="activity-actions">
      {state.checked ? <>
        <button type="button" className="text-button" onClick={() => setState({ ...state, checked: false })}>Review and Retry</button>
        <Action onClick={advance}>Continue to Your Decision</Action>
      </> : <Action disabled={!allAnswered} onClick={check}>Check Your Understanding</Action>}
    </div>
  </>;
}

function DecisionActivity({ initial, alternate, confirm }: { initial: Strategy | null; alternate: boolean; confirm: (id: Strategy) => void }) {
  const [choice, setChoice] = useState<Strategy | null>(alternate ? null : initial);
  return <>
    <h1>{alternate ? 'Explore another approach' : 'What would you do first?'}</h1>
    <p>Both children are upset and continue holding the truck. You need to respond to the situation.</p>
    <p className="small-note">{alternate ? 'Exploring another approach does not replace your initial decision.' : 'If a situation becomes physically unsafe, preventing injury takes priority.'}</p>
    <Choices label="Teaching response" name="initial-decision" options={branches} selected={choice} select={setChoice} exclude={alternate ? initial : null} />
    <Action disabled={!choice} onClick={() => choice && confirm(choice)}>{alternate ? 'See What Happens' : 'Confirm My Decision'}</Action>
  </>;
}

function AdaptationActivity({ state, setState, advance }: { state: LessonState; setState: Props['setState']; advance: () => void }) {
  const [choice, setChoice] = useState(state.revised);
  const [submitted, setSubmitted] = useState(state.done.includes('adapt') && state.revised !== null);
  const result = useRef<HTMLDivElement>(null);
  return <>
    <h1>How would you respond now?</h1>
    <InitialReview state={state} />
    <p className="small-note">{colleague}</p>
    <Choices label="Revised teaching response" name="revised-decision" options={adaptations} selected={choice} select={id => { setChoice(id); setSubmitted(false); }} />
    <label className="writing">Why did you choose this approach? <span>Optional</span>
      <textarea value={state.reasoning} onChange={event => setState({ ...state, reasoning: event.target.value })} rows={3} />
    </label>
    <div className="adapt-result" ref={result} tabIndex={-1} aria-live="polite">
      {submitted && state.revised && <>
        <h2>Consider your approach</h2>
        <p>{state.initial === state.revised ? 'You kept a similar approach. Retaining a strategy can be appropriate when your reasoning accounts for the new information.' : 'You shifted your approach. A change is not automatically better; consider what the new information makes appropriate.'}</p>
        <p>{adaptations[state.revised].feedback}</p>
        <aside className="reflection"><p>{integration}</p><p>Children's safety, dignity, and developmental needs remain non-negotiable.</p></aside>
      </>}
    </div>
    {submitted ? <Action onClick={advance}>Continue to Reflection</Action> : <Action disabled={!choice} onClick={() => {
      if (!choice) return;
      setState({
        ...state, revised: choice,
        done: state.revised === choice ? state.done : state.done.filter(stage => stage !== 'adapt' && stage !== 'reflection' && stage !== 'summary'),
      });
      setSubmitted(true);
      result.current?.focus();
    }}>Confirm My Response</Action>}
  </>;
}

function InitialReview({ state }: { state: LessonState }) {
  return state.initial && <aside className="review"><p className="eyebrow">Your initial decision</p><p>{branches[state.initial].name}</p></aside>;
}

function decisionReview(state: LessonState) {
  return [
    ['Your initial decision', state.initial ? branches[state.initial].name : ''],
    ['Your predicted outcome', state.prediction.trim()],
    ['Your revised decision', state.revised ? adaptations[state.revised].name : ''],
    ['Your reasoning', state.reasoning.trim()],
  ].filter(([, value]) => value);
}

function ReflectionActivity({ state, setState, advance }: { state: LessonState; setState: Props['setState']; advance: () => void }) {
  const [message, setMessage] = useState('');
  const [manual, setManual] = useState('');
  const review = decisionReview(state);
  async function copy() {
    const text = ['Navigating Classroom Conflict', ...review.map(([label, answer]) => label + ': ' + answer),
      ...questions.flatMap((question, index) => state.reflections[index].trim() ? [question + '\n' + state.reflections[index].trim()] : [])].join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      setManual('');
      setMessage('Reflection copied.');
    } catch {
      setManual(text);
      setMessage('Clipboard access was unavailable. You can copy the text below.');
    }
  }
  return <>
    <h1>From this scenario to your classroom.</h1>
    <p>Take a moment to reflect on your decisions and consider what you might apply in your own teaching practice.</p>
    <dl className="decision-review">{review.map(([label, answer]) => <div key={label}><dt>{label}</dt><dd>{answer}</dd></div>)}</dl>
    <p className="small-note">Optional. Keep your notes anonymous. Responses stay in this tab while the lesson is open.</p>
    {questions.map((question, index) => <label key={question} className="writing">{question}
      <textarea rows={3} value={state.reflections[index]} onChange={event => setState({ ...state, reflections: state.reflections.map((value, i) => i === index ? event.target.value : value) })} />
    </label>)}
    <div className="activity-actions"><button className="text-button" type="button" onClick={() => void copy()}>Copy My Reflection</button><Action onClick={advance}>Review Key Takeaways</Action></div>
    <p className="small-note" role="status">{message}</p>
    {manual && <label className="writing">Reflection to copy<textarea readOnly value={manual} rows={5} onFocus={event => event.currentTarget.select()} /></label>}
  </>;
}

export default function LessonActivity({ screen, state, setState, go, restart }: Props) {
  const branch = state.branch && branches[state.branch];
  const index = screen === 'alternatives' ? required.indexOf('feedback') : required.indexOf(screen as Activity);
  function advance(stage: Activity, next: Screen) {
    go(next, finish(state, stage));
  }
  let previous: Screen = index > 0 ? required[index - 1] : 'lesson';
  if (screen === 'alternatives') previous = 'feedback';
  if (screen === 'outcome' && state.branch !== state.initial) previous = 'alternatives';
  let body: ReactNode;
  switch (screen) {
    case 'scenario':
      body = <>
        <p className="eyebrow">Scenario 01 · Free Play</p>
        <h1>One toy. Two perspectives.</h1>
        <Scene file="classroom-conflict.jpg" alt="Two preschool children hold the same wooden truck while a teacher observes nearby." />
        <p>It's 10:15 a.m. during free play. You hear two children arguing in the block area.</p>
        <Dialogue name="Oliver · Age 4">I had it first! She took it!</Dialogue>
        <Dialogue name="Emma · Age 3">No! I was playing with it!</Dialogue>
        <p>Both children are holding the same wooden truck. Neither child is letting go at this moment. You did not see how the conflict started.</p>
        <p>Both children can communicate verbally, and neither child has been injured.</p>
        <aside className="reflection"><h2>Pause and reflect</h2><p>What do you know for certain? What information might you still need?</p></aside>
        <Action onClick={() => advance('scenario', 'facts')}>Take a Closer Look</Action>
      </>;
      break;
    case 'facts':
      body = <ClassificationActivity state={state} setState={setState} advance={() => advance('facts', 'decision')} />;
      break;
    case 'decision':
    case 'alternatives':
      body = <DecisionActivity initial={state.initial} alternate={screen === 'alternatives'} confirm={id => {
        if (screen === 'alternatives') {
          go('outcome', { ...state, branch: id });
          return;
        }
        if (state.initial && state.initial !== id && !window.confirm('Changing your initial decision clears the prediction, explored approaches, and revised response. Your personal reflections will be kept. Continue?')) return;
        go('prediction', chooseInitial(state, id));
      }} />;
      break;
    case 'prediction':
      body = <>
        <h1>What do you think will happen next?</h1>
        {state.initial && <Dialogue name={branches[state.initial].name}>{branches[state.initial].response}</Dialogue>}
        <label className="writing">Think about how each child might respond to your approach. What might improve? What challenges could remain? <span>Optional</span>
          <textarea rows={4} placeholder="I think the children might..." value={state.prediction} onChange={event => setState({ ...state, prediction: event.target.value })} />
        </label>
        <Action onClick={() => go('outcome', finish({ ...state, branch: state.initial }, 'prediction'))}>See What Happens</Action>
      </>;
      break;
    case 'outcome':
      body = branch && <>
        <p className="eyebrow">Possible Outcome</p><h1>{branch.name}</h1>
        <Scene file={branch.scene} alt={branch.alt} />
        <p>{branch.opening}</p>
        {branch.dialogue.map(([name, quote]) => <Dialogue key={name} name={name}>{quote}</Dialogue>)}
        <p>{branch.closing}</p>
        <p className="small-note">One possible outcome, not a prediction of how every child will respond.</p>
        <Action onClick={() => go('feedback', observeBranch(state))}>Explore Your Approach</Action>
      </>;
      break;
    case 'feedback':
      body = branch && <>
        <p className="eyebrow">{branch.name}</p><h1>Understand the trade-offs</h1>
        <h2>What this approach supports</h2><p>{branch.supports}</p>
        <h2>What to consider</h2><p>{branch.consider}</p>
        <aside className="reflection"><h2>Takeaway</h2><p>{branch.takeaway}</p></aside>
        <div className="activity-actions">
          <button type="button" className="text-button" onClick={() => go('alternatives', reviewBranch(state))}>Explore Another Approach</button>
          <Action onClick={() => go('context', reviewBranch(state))}>Continue the Scenario</Action>
        </div>
      </>;
      break;
    case 'context':
      body = <>
        <p className="eyebrow">New Information</p><h1>There's more to the story.</h1>
        <Scene file="scene-context.jpg" alt="A colleague shares what happened earlier while both children remain near the truck." />
        <p>Another teacher approaches you and shares something you didn't see.</p>
        <Dialogue name="Colleague">{colleague}</Dialogue>
        <p>Emma may have expected to return to her play. Oliver may have thought the truck was available because no one was using it.</p>
        <aside className="reflection"><h2>Does this information change your understanding of the conflict?</h2><p>Consider each child's perspective before deciding what to do next.</p></aside>
        <InitialReview state={state} />
        <Action onClick={() => advance('context', 'adapt')}>Reconsider Your Response</Action>
      </>;
      break;
    case 'adapt':
      body = <AdaptationActivity state={state} setState={setState} advance={() => advance('adapt', 'reflection')} />;
      break;
    case 'reflection':
      body = <ReflectionActivity state={state} setState={setState} advance={() => advance('reflection', 'summary')} />;
      break;
    case 'summary':
      body = <>
        <h1>Every decision begins with understanding.</h1>
        <ol className="takeaways">{takeaways.map(([title, text]) => <li key={title}><h2>{title}</h2><p>{text}</p></li>)}</ol>
        <p>There is rarely a single script for every classroom situation. Effective teaching involves observing carefully, responding intentionally, and adapting to the needs of the children involved.</p>
        <Action onClick={() => advance('summary', 'complete')}>Complete Lesson</Action>
      </>;
      break;
    case 'complete':
      return <>
        <p className="eyebrow">Lesson 01</p><h1>Lesson Complete</h1><h2>Navigating Classroom Conflict</h2>
        <p>You have explored how observation, contextual understanding, and reflection can inform classroom decision-making.</p>
        <div className="activity-actions"><Action onClick={() => go('scenario')}>Review Lesson</Action><button type="button" className="text-button" onClick={restart}>Restart Lesson</button><button type="button" className="text-button" onClick={() => go('landing')}>Back to Course Overview</button></div>
      </>;
  }
  return <div className="activity">
    <p className="activity-position">Activity {index + 1} of {required.length}</p>
    {body}
    <div className="activity-back"><button type="button" className="text-button" onClick={() => go(previous)}>← Back{previous === 'lesson' ? ' to Lesson' : ''}</button></div>
  </div>;
}

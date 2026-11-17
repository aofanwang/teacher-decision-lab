import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import LessonActivity from './lesson-activity';
import { canOpen, firstPending, freshLesson, progress, screenFromHash, type LessonState, type Screen } from './lesson-state';
import './style.css';

const portfolio = 'https://aofanwang.github.io/projects/teacher-decision-lab';
const title = 'Teacher Decision Lab';
const lesson = 'Navigating Classroom Conflict';
const asset = (file: string) => import.meta.env.BASE_URL + file;

const iconPaths = {
  book: 'M12 6v15M12 6C9 4 5 4 2 5v14c3-1 7-1 10 2 3-3 7-3 10-2V5c-3-1-7-1-10 1Z',
  clock: 'M12 7v5l4 3M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  menu: 'M3 6h18M3 12h18M3 18h18',
  close: 'm6 6 12 12M18 6 6 18',
  collapse: 'm15 6-6 6 6 6',
  right: 'M3 12h17m-7-7 7 7-7 7',
  left: 'M21 12H4m7-7-7 7 7 7',
  check: 'm5 12 4 4L19 6',
  external: 'M13 4h7v7m0-7-9 9m5 0v7H4V8h7',
  exit: 'M10 4H4v16h6m-1-8h12m-4-4 4 4-4 4',
};

function Icon({ name }: { name: keyof typeof iconPaths }) {
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[name]} /></svg>;
}

function CourseLanding({ start }: { start: () => void }) {
  return <>
    <header className="cover-header"><span>{title}</span><a href={portfolio}>Back to Portfolio <Icon name="external" /></a></header>
    <main id="content" className="cover enter" tabIndex={-1}>
      <p className="eyebrow cover-eyebrow">Professional Development</p>
      <h1>{title}</h1>
      <p className="tagline">Practice the decisions behind teaching.</p>
      <img className="panorama cover-image" src={asset('course-cover.jpg')} alt="A preschool teacher observing children as they build with wooden blocks." width={2079} height={756} />
      <p className="description">Step into realistic classroom situations, explore different ways to respond, and develop your professional judgment through practice and reflection.</p>
      <ul className="facts"><li><Icon name="book" />1 lesson</li><li><Icon name="clock" />Self-paced</li></ul>
      <button className="primary start" type="button" onClick={start}>Start Course <Icon name="right" /></button>
      <p className="audience">Designed for early childhood educators</p>
    </main>
  </>;
}

function CourseProgress({ completion }: { completion: number }) {
  return <div className="course-progress">
    <progress value={completion} max={100} aria-label="Course completion" />
    <p className="eyebrow">{completion}% Complete</p>
  </div>;
}

function CourseSidebar({ open, close, openLesson, completion }: { open: boolean; close: () => void; openLesson: () => void; completion: number }) {
  return <aside id="course-sidebar" className="sidebar" hidden={!open} aria-label="Course outline">
    <button className="icon-button collapse" type="button" aria-label="Collapse course sidebar" onClick={close}><Icon name="collapse" /></button>
    <p className="sidebar-title">{title}</p>
    <CourseProgress completion={completion} />
    <nav className="lesson-nav" aria-label="Lessons">
      <p className="eyebrow">Lessons</p>
      <button className="lesson-item" type="button" aria-current="true" onClick={openLesson}><span className="eyebrow">Lesson 01</span>{lesson}</button>
    </nav>
  </aside>;
}

function ClassroomImage() {
  return <img className="panorama lesson-image" src={asset('classroom-conflict.jpg')} alt="Two preschool children holding the same wooden toy truck while a teacher observes nearby." width={2137} height={736} />;
}

function LessonIntroduction({ begin }: { begin: () => void }) {
  return <>
    <p className="eyebrow">Lesson 1 of 1</p>
    <h1>{lesson}</h1>
    <ClassroomImage />
    <p>Conflict is a natural part of children's social development. But in the moment, deciding how to intervene is not always straightforward.</p>
    <h2>What you'll learn</h2>
    <ul className="objectives">
      {['Distinguish observable facts from assumptions in a classroom conflict.', "Compare teaching responses based on children's developmental and emotional needs.", 'Justify and adapt a teaching response when new contextual information becomes available.'].map(text => <li key={text}><span className="check"><Icon name="check" /></span>{text}</li>)}
    </ul>
    <button className="primary" type="button" onClick={begin}>Begin Scenario <Icon name="right" /></button>
  </>;
}

function CoursePlayer({ children, exit, openLesson, screen, completion }: { children: ReactNode; exit: () => void; openLesson: () => void; screen: Screen; completion: number }) {
  const [open, setOpen] = useState(() => !matchMedia('(max-width: 800px)').matches);
  const toggle = useRef<HTMLButtonElement>(null);
  function close() {
    setOpen(false);
    toggle.current?.focus();
  }
  return <div className="player" onKeyDown={event => {
    if (event.key === 'Escape' && open) close();
  }}>
    <header className="player-header">
      <button ref={toggle} className="icon-button" type="button" aria-label={open ? 'Hide course sidebar' : 'Show course sidebar'} aria-expanded={open} aria-controls="course-sidebar" onClick={() => setOpen(value => !value)}><Icon name="menu" /></button>
      <span>{title}</span>
      <button className="exit" type="button" onClick={exit}>Exit Course <Icon name="exit" /></button>
    </header>
    <div className={open ? 'player-layout sidebar-open' : 'player-layout'}>
      <CourseSidebar open={open} close={close} completion={completion} openLesson={() => {
        if (matchMedia('(max-width: 800px)').matches) close();
        openLesson();
      }} />
      <main id="content" className="lesson-content" tabIndex={-1}><div className="lesson-inner enter" key={screen}>{children}</div></main>
    </div>
  </div>;
}

function Course() {
  const [state, setState] = useState(freshLesson);
  const [screen, setScreen] = useState(() => screenFromHash(location.hash, state));
  const latest = useRef(state);
  latest.current = state;
  const moved = useRef(false);
  useEffect(() => {
    const update = () => { moved.current = true; setScreen(screenFromHash(location.hash, latest.current)); };
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);
  useEffect(() => {
    if (!moved.current) return;
    document.getElementById('content')?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [screen]);

  function go(next: Screen, updated: LessonState = state) {
    if (!canOpen(next, updated)) return;
    setState(updated);
    if (next === screen) return;
    history.pushState(null, '', next === 'landing' ? location.pathname + location.search : '#' + next);
    moved.current = true;
    setScreen(next);
  }

  return <>
    <a className="skip" href="#content" onClick={event => {
      event.preventDefault();
      document.getElementById('content')?.focus();
    }}>Skip to content</a>
    {screen === 'landing' ? <CourseLanding start={() => go('lesson')} /> :
      <CoursePlayer screen={screen} completion={progress(state)} exit={() => go('landing')} openLesson={() => go('lesson')}>
        {screen === 'lesson' ? <LessonIntroduction begin={() => go(firstPending(state))} /> :
          <LessonActivity key={screen} screen={screen} state={state} setState={setState} go={go} restart={() => {
            if (window.confirm('Restart Lesson 01? This clears your choices, notes, and progress in this tab.')) go('scenario', freshLesson());
          }} />}
      </CoursePlayer>}
  </>;
}

createRoot(document.getElementById('root')!).render(<Course />);

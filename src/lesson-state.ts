export const required = ['scenario', 'facts', 'decision', 'prediction', 'outcome', 'feedback', 'context', 'adapt', 'reflection', 'summary'] as const;
export type Activity = typeof required[number];
export type Screen = 'landing' | 'lesson' | 'alternatives' | 'complete' | Activity;
export type Strategy = 'A' | 'B' | 'C';
export type Classification = 'Fact' | 'Assumption';

export function freshLesson() {
  return {
    done: [] as Activity[],
    facts: {} as Record<number, Classification>,
    checked: false,
    initial: null as Strategy | null,
    branch: null as Strategy | null,
    observed: [] as Strategy[],
    explored: [] as Strategy[],
    prediction: '',
    revised: null as Strategy | null,
    reasoning: '',
    reflections: ['', '', ''],
  };
}
export type LessonState = ReturnType<typeof freshLesson>;
export function finish(state: LessonState, activity: Activity): LessonState {
  return state.done.includes(activity) ? state : { ...state, done: [...state.done, activity] };
}
export function chooseInitial(state: LessonState, initial: Strategy): LessonState {
  if (state.initial === initial) return finish({ ...state, branch: initial }, 'decision');
  return finish({
    ...state, initial, branch: initial, observed: [], explored: [], prediction: '', revised: null, reasoning: '',
    done: state.done.filter(stage => stage === 'scenario' || stage === 'facts'),
  }, 'decision');
}
export function observeBranch(state: LessonState): LessonState {
  const branch = state.branch;
  return branch === null ? state : finish({
    ...state, observed: state.observed.includes(branch) ? state.observed : [...state.observed, branch],
  }, 'outcome');
}
export function reviewBranch(state: LessonState): LessonState {
  const branch = state.branch;
  return branch === null || !state.observed.includes(branch) ? state : finish({
    ...state, explored: state.explored.includes(branch) ? state.explored : [...state.explored, branch],
  }, 'feedback');
}
export function progress(state: LessonState) {
  return Math.floor(required.filter(stage => state.done.includes(stage)).length * 100 / required.length);
}
export function canOpen(screen: Screen, state: LessonState): boolean {
  if (screen === 'landing' || screen === 'lesson' || screen === 'scenario') return true;
  if (screen === 'alternatives') return state.done.includes('feedback');
  if (screen === 'complete') return progress(state) === 100;
  const index = required.indexOf(screen);
  return index > 0 && required.slice(0, index).every(stage => state.done.includes(stage))
    && (screen !== 'outcome' || state.branch !== null)
    && (screen !== 'feedback' || state.branch !== null && state.observed.includes(state.branch));
}
export function firstPending(state: LessonState): Screen {
  return required.find(stage => !state.done.includes(stage)) ?? 'complete';
}
export function screenFromHash(hash: string, state: LessonState): Screen {
  const screen = hash.slice(1) as Screen;
  if (!screen) return 'landing';
  if (canOpen(screen, state)) return screen;
  if (screen === 'feedback' && canOpen('outcome', state)) return 'outcome';
  const pending = firstPending(state);
  return canOpen(pending, state) ? pending : 'scenario';
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { canOpen, chooseInitial, finish, firstPending, freshLesson, observeBranch, progress, required, reviewBranch, screenFromHash } from '../src/lesson-state.ts';

for (const initial of ['A', 'B', 'C']) {
  test(`branch ${initial}: outcome, alternatives, convergence and completion`, () => {
    let state = freshLesson();
    assert.equal(progress(state), 0);
    assert.equal(screenFromHash('#complete', state), 'scenario');
    assert.equal(canOpen('facts', state), false);
    state = finish(finish(state, 'scenario'), 'facts');
    state = { ...chooseInitial(state, initial), prediction: 'They may need a pause.' };
    assert.equal(canOpen('outcome', state), false);
    state = finish(state, 'prediction');
    assert.equal(canOpen('outcome', state), true);
    assert.equal(canOpen('feedback', state), false);
    state = reviewBranch(observeBranch(state));
    assert.equal(canOpen('context', state), true);
    const alternative = initial === 'A' ? 'B' : 'A';
    state = { ...state, branch: alternative };
    assert.equal(canOpen('feedback', state), false);
    assert.equal(screenFromHash('#feedback', state), 'outcome');
    state = reviewBranch(observeBranch(state));
    assert.deepEqual(state.explored, [initial, alternative]);
    assert.equal(state.initial, initial);
    assert.equal(state.prediction, 'They may need a pause.');
    state = finish(state, 'context');
    assert.equal(canOpen('reflection', state), false);
    state = finish(finish({ ...state, revised: alternative }, 'adapt'), 'reflection');
    assert.equal(canOpen('summary', state), true);
    assert.equal(canOpen('complete', state), false);
    assert.equal(progress(state), 90);
    state = finish(state, 'summary');
    assert.equal(progress(state), 100);
    assert.equal(canOpen('complete', state), true);
    assert.equal(firstPending(state), 'complete');
    assert.equal(state.reflections.every(value => !value), true);
    assert.equal(progress(freshLesson()), 0);
  });
}
test('changing the original decision preserves facts and personal reflections', () => {
  const state = { ...freshLesson(), done: [...required], initial: 'A', branch: 'C', observed: ['A', 'C'],
    explored: ['A', 'C'], checked: true, facts: { 0: 'Fact' }, prediction: 'old', revised: 'B', reasoning: 'old', reflections: ['keep', '', ''] };
  const unchanged = chooseInitial(state, 'A');
  assert.equal(progress(unchanged), 100);
  const changed = chooseInitial(state, 'B');
  assert.equal(changed.initial, 'B');
  assert.deepEqual(changed.done, ['scenario', 'facts', 'decision']);
  assert.equal(changed.checked, true);
  assert.equal(changed.facts[0], 'Fact');
  assert.deepEqual(changed.reflections, ['keep', '', '']);
  assert.equal(changed.prediction, '');
  assert.equal(changed.reasoning, '');
  assert.equal(changed.revised, null);
  assert.deepEqual(changed.explored, []);
  assert.equal(screenFromHash('#complete', changed), 'prediction');
});

import type { Classification, Strategy } from './lesson-state';

export const facts: readonly { text: string; correct: Classification; feedback: string }[] = [
  { text: 'Both children are holding the same toy.', correct: 'Fact', feedback: 'You can directly observe both children holding the truck.' },
  { text: 'Emma took the toy from Oliver.', correct: 'Assumption', feedback: 'You did not witness the beginning of the conflict.' },
  { text: 'Both children claim they had it first.', correct: 'Fact', feedback: 'You heard both children make this claim. However, hearing a claim does not establish that the claim is true.' },
  { text: 'Oliver is being selfish.', correct: 'Assumption', feedback: 'This assigns a motive or personal characteristic rather than describing observable behavior.' },
  { text: 'Neither child is letting go of the truck at this moment.', correct: 'Fact', feedback: 'This describes observable behavior in the current situation.' },
];

export type Branch = {
  name: string; response: string; scene: string; alt: string;
  opening: string; dialogue: readonly [string, string][]; closing: string;
  supports: string; consider: string; takeaway: string;
};

export const strategies: readonly Strategy[] = ['A', 'B', 'C'];
export const branches: Record<Strategy, Branch> = {
  A: {
    name: 'Listen before solving',
    response: 'I see you both want the truck. Can you tell me what happened?',
    scene: 'scene-listen.jpg', alt: 'The teacher listens at eye level as Oliver and Emma both try to explain.',
    opening: 'Oliver begins explaining what happened, but Emma interrupts him. Both children try to make themselves heard.',
    dialogue: [['Oliver', 'I was building a road!'], ['Emma', 'But I had it before you!']],
    closing: 'Both children become frustrated as they struggle to listen to each other.',
    supports: 'Listening gives both children an opportunity to express their perspectives without the teacher immediately assigning blame. It can help children feel heard and support communication and perspective-taking.',
    consider: 'When children are emotionally overwhelmed, they may struggle to listen or take turns speaking. They may need support regulating their emotions before they can engage in a productive conversation.',
    takeaway: 'Listening is valuable, but emotional readiness matters.',
  },
  B: {
    name: 'Pause the conflict',
    response: "I'm going to help you stop pulling the truck. Let's take a moment to calm down.",
    scene: 'scene-pause.jpg', alt: 'The truck rests on the table, Emma is tearful, and Oliver looks toward the teacher.',
    opening: 'You calmly help both children release the truck and place it on the table. The physical struggle stops, but Emma begins crying.',
    dialogue: [['Emma', 'But I still want it!']],
    closing: 'Oliver looks at you and waits for a decision.',
    supports: 'Pausing the conflict can reduce immediate tension and create space for emotional regulation. It allows the teacher to establish a safer and calmer environment.',
    consider: 'Stopping a conflict is not the same as resolving it. Children still need opportunities to express their needs and participate in finding a solution.',
    takeaway: 'Safety and regulation create the conditions for problem-solving.',
  },
  C: {
    name: 'Facilitate a solution',
    response: 'You both want to use the truck. What could we do so both of you get a turn?',
    scene: 'scene-negotiate.jpg', alt: 'Oliver proposes taking turns while Emma remains reluctant and the teacher listens.',
    opening: 'Oliver suggests using a timer to take turns.',
    dialogue: [['Oliver', 'I can play for five minutes!'], ['Emma', 'No! I want it now!']],
    closing: 'One child appears ready to negotiate, but the other is not yet ready to participate.',
    supports: 'Inviting children to propose solutions encourages autonomy, negotiation, and collaborative problem-solving.',
    consider: "Successful negotiation depends on children's readiness to participate. When a child is highly upset, emotional support may be needed before collaborative problem-solving becomes possible.",
    takeaway: 'Supporting independence requires recognizing when children are ready to solve a problem.',
  },
};

export const adaptations: Record<Strategy, { name: string; response: string; feedback: string }> = {
  A: {
    name: 'Acknowledge both perspectives',
    response: 'Emma, you were using the truck before you went to wash your hands. Oliver, you saw the truck when no one was using it. I can understand why both of you thought it was your turn.',
    feedback: "This response recognizes both children's perspectives without immediately assigning blame. It can help children understand how the disagreement happened. However, acknowledging perspectives does not resolve the question of how the truck will be shared.",
  },
  B: {
    name: 'Support emotional regulation first',
    response: "I can see that you're both upset. Let's make sure everyone is safe and help our bodies calm down. Then we can talk about what happened.",
    feedback: "This response recognizes that children may need emotional support before they are ready to communicate or negotiate. Once they are more regulated, the teacher can help them understand each other's perspectives and identify a fair solution.",
  },
  C: {
    name: 'Guide a collaborative solution',
    response: 'Now we understand what happened. Emma wanted to finish her play, and Oliver started playing while she was away. What could we do to make a plan that works for both of you?',
    feedback: 'This response invites children to participate in solving the problem. It supports autonomy and social problem-solving when both children are ready to engage. A teacher may still need to provide structure or emotional support.',
  },
};
export const colleague = 'Emma was playing with the truck earlier. She left to wash her hands, and Oliver started playing with it while she was away.';
export const integration = 'Professional judgment involves recognizing when different approaches are appropriate. In practice, teachers may combine emotional support, perspective-taking, and collaborative problem-solving.';
export const questions = [
  'What influenced your initial decision?',
  'How did the new information affect your understanding of the situation?',
  'What would you pay more attention to when handling a similar conflict in your own classroom?',
] as const;
export const takeaways = [
  ['Observe before making assumptions.', "Distinguish what you directly observe from what you infer about children's intentions."],
  ['Prioritize safety and emotional regulation.', 'Children may need support before they are ready to communicate or negotiate.'],
  ['Consider multiple perspectives.', "Understanding a conflict requires recognizing each child's experience and needs."],
  ["Support children's problem-solving.", 'Offer opportunities for children to participate in finding solutions when developmentally and emotionally ready.'],
  ['Adapt as new information emerges.', 'Effective teaching requires flexible professional judgment rather than rigidly applying one response.'],
] as const;

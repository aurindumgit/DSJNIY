export type AnswerOption = {
  label: string
  score: number
  note: string
  strength: number
  next: string | null
  boundary?: boolean
}

export type Question = {
  id: string
  short: string
  category: string
  question: string
  context: string
  options: AnswerOption[]
}

export type Verdict = {
  id: 'boundary' | 'delulu' | 'mixed' | 'potential' | 'chance'
  title: string
  subtitle: string
  color: 'pink' | 'yellow' | 'green' | 'blue'
  explanation: string
  advice: string
  roast: string
}

const a = (
  label: string,
  score: number,
  note: string,
  strength: number,
  next: string | null,
  boundary = false,
): AnswerOption => ({ label, score, note, strength, next, ...(boundary ? { boundary: true } : {}) })

const q = (
  id: string,
  short: string,
  category: string,
  question: string,
  context: string,
  options: AnswerOption[],
): Question => ({ id, short, category, question, context, options })

// 36-question adaptive graph. A normal route asks 6–10 questions; explicit rejection
// ends immediately. The graph is intentionally a DAG: no answer can send users backward
// or into a question they've already answered.
export const questions: Question[] = [
  // LEVEL 1 — opening question
  q('initiation', 'TEXTING', 'EXHIBIT A · TEXTING', 'Who usually starts the conversation?', 'Be honest: who puts in most of the effort?', [
    a('Me. I deserve a medal at this point.', -2, 'You usually have to start things.', 1, 'effort'),
    a('Mostly me, but she replies.', -1, 'She replies, but rarely starts the conversation.', 1, 'replyTempo'),
    a('Pretty equal, honestly.', 1, 'Initiation seems fairly balanced.', 1, 'initiative'),
    a('She texts first a lot.', 2, 'She chooses to start conversations too.', 2, 'initiative'),
  ]),

  // LEVEL 2
  q('effort', 'CHAT EFFORT', 'EXHIBIT B · THE CHAT', 'Are you doing all the talking?', 'Replying is good, but does she help keep the chat going?', [
    a('I ask all the questions. She just gives short answers.', -2, 'Most conversational effort comes from you.', 2, 'replyTempo'),
    a('She replies, but I have to keep asking questions.', -1, 'She answers but rarely asks much back.', 1, 'conversationBalance'),
    a('We both ask questions and keep it going.', 1, 'There is some two-way effort.', 1, 'conversationBalance'),
    a('She sends me stuff just to talk.', 2, 'She looks for reasons to connect.', 2, 'initiative'),
  ]),
  q('initiative', 'HER EFFORT', 'EXHIBIT B · HER SIDE OF THINGS', 'Does she ever make an effort on her own?', 'One good day is nice. We want to know what usually happens.', [
    a('Not really. I have to do almost everything.', -2, 'You seem to drive most interactions.', 2, 'plans'),
    a('Sometimes, but I still do most of it.', -1, 'There may be effort, but it sounds uneven.', 1, 'conversationBalance'),
    a('She checks in and remembers little things.', 1, 'She makes some effort on her own.', 1, 'inperson'),
    a('She starts chats and suggests stuff to do.', 2, 'She contributes to keeping the connection going.', 2, 'plans'),
  ]),

  // LEVEL 3
  q('replyTempo', 'REPLIES', 'EXHIBIT C · RESPONSE TIME', 'What are her replies usually like?', 'Slow replies do not automatically mean anything. What matters is how she talks to you overall.', [
    a('One-word replies. A brick wall would be more chatty.', -2, 'Replies sound consistently low-effort.', 1, 'doubleText'),
    a('Short replies, but she might just be busy.', -1, 'The replies feel limited, but context is missing.', 1, 'socialMedia'),
    a('Normal replies. Sometimes quick, sometimes not.', 0, 'Reply speed varies and is not a clear signal.', 1, 'consistency'),
    a('She gives proper replies and keeps it moving.', 2, 'She puts effort into the conversation itself.', 2, 'followupQuestions'),
  ]),
  q('conversationBalance', 'THE INTERVIEW', 'EXHIBIT C · CONVERSATION BALANCE', 'Does she ask about you, or do you ask all the questions?', 'It is a good sign when someone wants to know about you. One “wyd” does not mean they like you.', [
    a('I know loads about her. She barely knows anything about me.', -2, 'Interest in your life sounds one-sided.', 2, 'doubleText'),
    a('A little, if I bring it up first.', -1, 'Curiosity exists but may be mostly prompted.', 1, 'followupQuestions'),
    a('She asks about my day and remembers the answer.', 1, 'She shows some interest in your life.', 1, 'detailMemory'),
    a('She remembers what I tell her and asks more about it.', 2, 'She actively engages with what you tell her.', 2, 'detailMemory'),
  ]),
  q('plans', 'THE PLANS', 'EXHIBIT C · THE HANGOUT', 'When you ask her to hang out, what usually happens?', 'Making actual plans matters more than saying “we should hang out sometime.”', [
    a('She says “maybe sometime,” but never makes a plan.', -2, 'Repeated vagueness without follow-through suggests low reciprocity.', 2, 'cancellationPattern'),
    a('She is busy and leaves it there.', -1, 'There is no clear follow-through yet.', 1, 'availability'),
    a('She suggests another day if she cannot make it.', 2, 'Offering an alternative shows effort.', 2, 'reschedule'),
    a('We make plans, and she actually shows up.', 2, 'She follows through on plans.', 2, 'oneOnOne'),
  ]),
  q('inperson', 'IN PERSON', 'EXHIBIT C · IN PERSON', 'How does she act when you spend time together in person?', 'Tiny details like punctuation do not tell you whether someone likes you.', [
    a('She mostly avoids talking to me.', -2, 'There seems to be little engagement in person.', 2, 'groupBehavior'),
    a('Friendly, but the same with everyone.', 0, 'Friendliness alone does not establish attraction.', 1, 'groupBehavior'),
    a('She seeks me out and seems genuinely engaged.', 1, 'She seems to enjoy your company.', 1, 'oneOnOne'),
    a('There is actual flirting. Not just eye contact.', 2, 'You report behaviour that could be flirtatious.', 2, 'flirting'),
  ]),

  // LEVEL 4 — 8 branches
  q('doubleText', 'DOUBLE TEXTING', 'EXHIBIT D · THE FOLLOW-UP', 'When the conversation goes quiet, who starts it again?', 'Sending a second message is fine. Always being the one to restart the chat is different.', [
    a('Me. I keep trying even when the chat has clearly ended.', -2, 'You repeatedly revive conversations alone.', 2, 'reciprocity'),
    a('Usually me, but she does reply eventually.', -1, 'You do most of the follow-up work.', 1, 'storyViews'),
    a('It depends on who got busy first.', 0, 'The pattern is not clear enough yet.', 1, 'availability'),
    a('She follows up too if the chat drops.', 2, 'She also makes an effort to reconnect.', 2, 'offlineInitiative'),
  ]),
  q('followupQuestions', 'CURIOSITY', 'EXHIBIT D · THE QUESTIONS', 'Does she ask questions, or mostly just react to what you say?', 'A laugh or emoji is a reply, but it does not tell you much by itself.', [
    a('Mostly reactions. It feels like I am talking to myself.', -2, 'She rarely builds on the conversation.', 2, 'reciprocity'),
    a('Sometimes, but I lead most topics.', -1, 'The conversation may be uneven.', 1, 'detailMemory'),
    a('She asks questions when something interests her.', 1, 'There is some active curiosity.', 1, 'oneOnOne'),
    a('She remembers the details and asks later.', 2, 'She follows up on things that matter to you.', 2, 'detailMemory'),
  ]),
  q('consistency', 'CONSISTENCY', 'EXHIBIT D · THE PATTERN', 'Is she usually interested in talking, or only once in a while?', 'Think about how things usually go, not just one great conversation.', [
    a('Very interested one day, then disappears for weeks.', -2, 'Effort sounds inconsistent and difficult to read.', 2, 'cancellationPattern'),
    a('Mostly distant, occasionally very warm.', -1, 'There are mixed signals without much context.', 1, 'socialMedia'),
    a('Pretty steady, even when she is busy.', 1, 'Her effort sounds reasonably consistent.', 2, 'availability'),
    a('She makes time and follows through regularly.', 2, 'Repeated follow-through is a stronger signal than isolated moments.', 2, 'futurePlans'),
  ]),
  q('reschedule', 'RESCHEDULING', 'EXHIBIT D · THE CALENDAR', 'If she cannot meet, does she suggest another day?', 'People get busy. Notice whether she tries to make another plan.', [
    a('Nope. She cancels, and no new plan happens.', -2, 'She does not seem to help make plans happen.', 2, 'cancellationPattern'),
    a('She apologizes, but leaves it at that.', -1, 'There is no clear alternative offered.', 1, 'availability'),
    a('She suggests another day herself.', 2, 'She shows interest in making the plan happen.', 2, 'oneOnOne'),
    a('She rearranges things sometimes to make it work.', 2, 'She makes practical effort to spend time together.', 2, 'futurePlans'),
  ]),
  q('groupBehavior', 'THE GROUP CHAT', 'EXHIBIT D · SOCIAL SETTINGS', 'When you are with friends, does she treat you differently from others?', 'Being treated differently might mean something, but it is not proof she likes you.', [
    a('She barely acknowledges me.', -2, 'There is little engagement in this setting.', 1, 'socialMedia'),
    a('She is nice, but equally nice to everyone.', 0, 'This sounds like general friendliness.', 1, 'flirting'),
    a('She finds reasons to talk to me in the group.', 1, 'She seems to seek you out sometimes.', 1, 'oneOnOne'),
    a('We have our own jokes and she keeps looping me in.', 2, 'She appears to make a point of connecting with you.', 2, 'flirting'),
  ]),
  q('flirting', 'THE VIBE', 'EXHIBIT D · THE VIBE CHECK', 'Is she flirting, or might she just be friendly?', 'Be honest with yourself. Do not turn every small moment into a big sign.', [
    a('I am mostly reading into tiny things.', -1, 'The signs may come more from interpretation than clear behaviour.', 1, 'socialMedia'),
    a('Hard to tell. Could just be friendly.', 0, 'The vibe is ambiguous.', 1, 'direct'),
    a('She teases me and singles me out sometimes.', 1, 'There may be playful interest, but context matters.', 1, 'compliments'),
    a('She clearly flirts and keeps it going.', 2, 'You describe repeated, reciprocal flirting.', 2, 'compliments'),
  ]),
  q('direct', 'DIRECT SIGNAL', 'EXHIBIT D · THE DIRECT SIGNAL', 'Has she told you how she feels?', 'What she says matters more than social media clues. Always respect a clear no.', [
    a('She said no or that she only sees me as a friend.', -4, 'She has stated a boundary. The right move is to respect it.', 3, null, true),
    a('Nothing clear. I am connecting invisible dots.', -1, 'There is no direct statement to go on.', 1, 'reciprocity'),
    a('Some flirting, but no actual conversation about it.', 1, 'Flirting may be promising, but it is not a guarantee.', 1, 'date'),
    a('She said she likes me or wants to go on a date.', 3, 'Directly expressed interest is the clearest positive signal.', 3, 'date'),
  ]),
  q('socialMedia', 'SOCIAL MEDIA', 'EXHIBIT D · THE DIGITAL FORENSICS', 'What is your biggest sign that she might like you online?', 'Watching your story does not mean she has romantic feelings for you.', [
    a('Story views. She watched all three. ALL THREE.', -1, 'Views alone do not show romantic interest.', 1, 'storyViews'),
    a('Likes and reactions, but not much conversation.', 0, 'Online engagement can be friendly or casual.', 1, 'storyViews'),
    a('She messages me about things I post.', 1, 'She sometimes uses posts to start real conversations.', 1, 'detailMemory'),
    a('We talk online and make real plans too.', 2, 'Online contact is backed by real interaction.', 2, 'date'),
  ]),

  // LEVEL 5 — 9 questions
  q('detailMemory', 'THE DETAILS', 'EXHIBIT E · MEMORY LANE', 'Does she remember things you have told her?', 'Remembering details is thoughtful, but it does not prove romantic interest.', [
    a('I remember lots about her. She rarely remembers things about me.', -1, 'The attention may be one-sided.', 1, 'comfort'),
    a('Sometimes, if it was a big thing.', 0, 'There is not enough here to read much into.', 1, 'openness'),
    a('She remembers little things and asks about them later.', 1, 'She pays attention to details about your life.', 2, 'openness'),
    a('She remembers small details I told her ages ago.', 2, 'She shows sustained attention to what you share.', 2, 'futurePlans'),
  ]),
  q('availability', 'AVAILABILITY', 'EXHIBIT E · TIME & ATTENTION', 'When she is busy, does she still make time to talk or meet?', 'Nobody has to reply instantly. What matters is whether she makes time for you.', [
    a('Always busy. Somehow never too busy for everyone else.', -2, 'You do not seem to find much time together.', 2, 'friendZone'),
    a('Schedules are messy; we rarely pin anything down.', -1, 'Availability and follow-through remain unclear.', 1, 'relationshipStatus'),
    a('She is busy but gets back to me when she can.', 1, 'She communicates despite a busy schedule.', 1, 'comfort'),
    a('She makes time and sometimes suggests when.', 2, 'She actively helps make time together.', 2, 'futurePlans'),
  ]),
  q('oneOnOne', 'ONE-ON-ONE', 'EXHIBIT E · JUST THE TWO OF YOU', 'Does she want to spend time with you, just the two of you?', 'Group plans are fun, but one-on-one plans can tell you more.', [
    a('Only in a group, never just us.', 0, 'Group settings alone do not clarify romantic interest.', 1, 'friendZone'),
    a('We have not really tried.', 0, 'There is not enough evidence yet.', 0, 'askedClearly'),
    a('She seems happy to hang out just us.', 1, 'She appears comfortable spending one-on-one time.', 1, 'comfort'),
    a('She suggests one-on-one plans herself.', 2, 'She initiates time together directly.', 2, 'futurePlans'),
  ]),
  q('compliments', 'COMPLIMENTS', 'EXHIBIT E · FLIRTATION RECEIPTS', 'What kind of compliments does she give you?', 'Compliments can be friendly. Look at the overall pattern, not one compliment.', [
    a('None. I am still relying on one look from ages ago.', -1, 'There is little explicit flirtation in this area.', 1, 'friendZone'),
    a('Generic stuff, like “nice shirt”.', 0, 'That could simply be friendliness.', 1, 'comfort'),
    a('Personal compliments, sometimes a little flirty.', 1, 'There may be some flirtatious interest.', 1, 'askedClearly'),
    a('She openly flirts and makes it pretty obvious.', 2, 'You describe clearer signs of attraction, though direct communication matters most.', 2, 'askedClearly'),
  ]),
  q('date', 'THE DATE', 'EXHIBIT E · THE DATE QUESTION', 'Have you directly asked her on a date?', 'Saying “we should hang out sometime” is not the same as making a date plan.', [
    a('No. I keep trying to figure out the signs instead.', 0, 'You have not asked directly, so the answer is still unknown.', 1, 'askedClearly'),
    a('I hinted, but I never actually asked.', 0, 'Hints can be easy to miss; there is no clear answer yet.', 1, 'askedClearly'),
    a('I asked, and she said yes with a plan.', 3, 'She agreed to a date and helped make it happen.', 3, 'futurePlans'),
    a('I asked, and she declined without suggesting another time.', -2, 'She declined and did not suggest an alternative. Take that answer seriously.', 2, 'friendZone'),
  ]),
  q('reciprocity', 'RECIPROCITY', 'EXHIBIT E · THE RECEIPTS', 'If you stopped starting conversations, what do you think would happen?', 'Do not disappear to test her. Think about what usually happens naturally.', [
    a('We would probably stop talking.', -2, 'This connection may depend mostly on you making the effort.', 2, 'friendZone'),
    a('Honestly, I have never let it breathe.', 0, 'There is not enough evidence to know.', 0, 'askedClearly'),
    a('She checks in eventually.', 1, 'There is some reciprocal effort.', 1, 'mutualEffort'),
    a('She initiates and makes plans too.', 2, 'The effort seems more balanced.', 2, 'futurePlans'),
  ]),
  q('storyViews', 'STORY VIEWS', 'EXHIBIT E · DIGITAL EVIDENCE', 'How much do you rely on her watching your stories as a sign?', 'A story view only means she watched it. It does not tell you why.', [
    a('A lot. I treat every view like a major clue.', -1, 'You may be over-weighting weak evidence.', 1, 'friendZone'),
    a('I notice them, but I know they mean little.', 0, 'You recognize the limits of this evidence.', 1, 'askedClearly'),
    a('She replies to stories and starts actual chats.', 1, 'She sometimes turns online activity into conversation.', 1, 'mutualEffort'),
    a('We use stories to talk, then make plans offline.', 2, 'Online interaction is supported by real-world effort.', 2, 'futurePlans'),
  ]),
  q('offlineInitiative', 'OFFLINE INITIATIVE', 'EXHIBIT E · OUTSIDE THE PHONE', 'When you are in the same place, does she come over to talk to you?', 'In-person effort can be a useful sign, but it does not prove attraction by itself.', [
    a('No. She barely notices me.', -1, 'She rarely seems to seek you out.', 1, 'friendZone'),
    a('Only if we are already in the same conversation.', 0, 'There is no clear pattern of initiative.', 1, 'comfort'),
    a('She comes over to say hi or continue a conversation.', 1, 'She sometimes seeks you out in person.', 1, 'mutualEffort'),
    a('She actively finds me and makes time to talk.', 2, 'She makes deliberate effort to connect in person.', 2, 'futurePlans'),
  ]),
  q('cancellationPattern', 'CANCELLATIONS', 'EXHIBIT E · THE CANCELLATION LOG', 'How often does she cancel without suggesting another day?', 'One cancellation happens. Repeated cancellations without another plan may tell you more.', [
    a('Again and again. We never actually meet.', -2, 'Repeated cancellations without follow-through suggest low availability or interest.', 2, 'friendZone'),
    a('A few times; I am not sure why.', -1, 'The pattern is concerning but still unclear.', 1, 'relationshipStatus'),
    a('Rarely, and she explains or reschedules.', 1, 'She makes an effort to follow through.', 2, 'mutualEffort'),
    a('She is reliable and lets me know if things change.', 2, 'Her actions show consistency and consideration.', 2, 'futurePlans'),
  ]),

  // LEVEL 6 — five questions. Some answers can deliver a verdict at question 6.
  q('comfort', 'COMFORT', 'EXHIBIT F · COMFORT LEVEL', 'Does she seem relaxed and comfortable around you?', 'Feeling comfortable is positive, but it can mean friendship too.', [
    a('She seems uncomfortable or avoids being alone with me.', -1, 'She may not feel comfortable with this dynamic.', 1, null),
    a('Friendly, but I cannot tell what it means.', 0, 'Comfort alone does not establish romantic interest.', 1, null),
    a('She relaxes, jokes, and seems at ease.', 1, 'There is a comfortable connection.', 1, 'askedClearly'),
    a('She actively seeks time with me and seems at ease.', 2, 'Comfort is paired with deliberate effort.', 2, 'askedClearly'),
  ]),
  q('openness', 'OPENNESS', 'EXHIBIT F · PERSONAL CONVERSATIONS', 'Does she talk to you about more than everyday small talk?', 'Sharing personal things can mean trust, but it does not automatically mean romance.', [
    a('Not really. We barely get past “wyd”.', -1, 'The connection may be fairly surface-level.', 1, null),
    a('Sometimes, but mostly casual stuff.', 0, 'There is some openness, but little clarity.', 1, null),
    a('She shares things and asks about my perspective.', 1, 'There is some mutual trust and engagement.', 1, 'friendsPerspective'),
    a('We both open up and make time for real conversations.', 2, 'The connection seems meaningful, though its nature remains unclear.', 2, 'friendsPerspective'),
  ]),
  q('futurePlans', 'FUTURE PLANS', 'EXHIBIT F · THE FUTURE', 'Does she make plans with you in advance?', 'Saying “we should go sometime” matters less than actually setting a date.', [
    a('No. We cannot even secure Thursday.', -1, 'There is little evidence of plans moving forward.', 1, null),
    a('She says “sometime” but nothing gets booked.', 0, 'Future talk without follow-through is weak evidence.', 1, 'timePattern'),
    a('She follows up on things we said we would do.', 1, 'She shows some continuity and follow-through.', 2, 'timePattern'),
    a('She makes specific plans and checks in about them.', 2, 'She invests effort in seeing you again.', 2, 'mutualEffort'),
  ]),
  q('relationshipStatus', 'STATUS CHECK', 'EXHIBIT F · THE STATUS', 'Do you know whether she is single and open to dating?', 'Do not assume she is single. If you do not know, that part is still unclear.', [
    a('She is seeing someone or told me she is unavailable.', -2, 'She is unavailable; respect that and do not pursue her.', 3, null, true),
    a('I have no idea. I never asked or checked.', 0, 'An important piece of context is missing.', 0, null),
    a('As far as I know, she is single.', 0, 'Being single does not mean she is interested.', 1, 'askedClearly'),
    a('She has told me she is single and open to dating.', 2, 'She has shared that she is available, though interest still needs clarity.', 2, 'askedClearly'),
  ]),
  q('friendZone', 'THE FRIENDSHIP FILE', 'EXHIBIT F · FRIENDSHIP VS. FLIRTING', 'Has she clearly told you she sees you as a friend?', 'Friendship is valuable, but do not treat it as a hidden path to dating.', [
    a('Yes, she said she only sees me as a friend.', -4, 'She has stated how she sees the relationship. Respect it.', 3, null, true),
    a('She calls me bro, but nothing else is clear.', 0, 'A nickname alone does not settle anything.', 1, 'askedClearly'),
    a('She calls me a friend but also openly flirts.', 0, 'Her words and actions seem mixed. Do not assume flirting cancels out what she says.', 1, 'clarity'),
    a('She has not labelled it, and we have not talked.', 0, 'There is no clear label or direct conversation yet.', 0, 'askedClearly'),
  ]),

  // LEVEL 7 — three questions
  q('askedClearly', 'THE ACTUAL ASK', 'EXHIBIT G · DIRECT COMMUNICATION', 'Have you clearly asked her out, rather than just suggesting a hangout?', 'A clear, simple question is better than hints or confusing messages.', [
    a('No. I keep waiting for the perfect moment.', 0, 'You have not given either of you a clear answer yet.', 1, 'clarity'),
    a('I dropped hints, but never clearly said what I meant.', 0, 'Hints are easy to misunderstand.', 1, 'clarity'),
    a('Yes, and she said no or declined clearly.', -4, 'A clear no is the answer. Respect it and do not keep asking.', 3, null, true),
    a('Yes, and she said yes or suggested a real date.', 3, 'She has expressed clear interest in spending time romantically.', 3, 'mutualEffort'),
  ]),
  q('timePattern', 'THE TIMELINE', 'EXHIBIT G · THE TIMELINE', 'How long has this been happening?', 'One strange week may mean little. The same pattern for months matters more.', [
    a('Only a few days. It is too early to tell.', 0, 'There is little history to judge yet.', 0, null),
    a('A couple of weeks.', 0, 'The pattern is still developing.', 1, null),
    a('A few months, and it is always the same.', -1, 'A repeated pattern is more informative than a single interaction.', 2, 'clarity'),
    a('So long that my friends are tired of hearing about it.', -1, 'This has been taking up time without clear resolution.', 2, 'friendsPerspective'),
  ]),
  q('mutualEffort', 'MUTUAL EFFORT', 'EXHIBIT G · THE BALANCE SHEET', 'Over the last month, has the effort been equal?', 'No games or tests. Just look honestly at how things have been.', [
    a('I start most chats, make most plans, and check in first.', -2, 'The effort appears heavily one-sided.', 2, null),
    a('It swings back and forth; hard to call.', 0, 'The overall pattern is mixed.', 1, 'clarity'),
    a('We both initiate, plan, and follow through.', 2, 'Effort appears reciprocal.', 2, 'clarity'),
    a('She often makes more effort than I do.', 2, 'She seems to invest consistently in the connection.', 2, 'friendsPerspective'),
  ]),

  // LEVEL 8 — two questions
  q('clarity', 'THE CLARITY CHECK', 'EXHIBIT H · NO MORE GUESSING', 'What would help you know where you stand?', 'One honest conversation will tell you more than collecting dozens of clues.', [
    a('I keep collecting tiny signs instead of asking.', -1, 'You are stuck interpreting clues rather than seeking clarity.', 1, null),
    a('I am worried asking will make things awkward.', 0, 'That fear is understandable, but uncertainty can drag on.', 1, null),
    a('A calm, low-pressure question feels doable.', 1, 'You are open to direct communication.', 1, 'finalCheck'),
    a('We have talked honestly about what we want.', 2, 'Direct communication gives stronger evidence than guessing.', 2, 'finalCheck'),
  ]),
  q('friendsPerspective', 'THE FRIENDS', 'EXHIBIT H · OUTSIDE COUNSEL', 'What do your friends who know the situation think?', 'Friends may notice things, but they cannot know how she feels for sure.', [
    a('Everyone says I am reading too much into it.', -1, 'People close to the situation see a pattern worth reconsidering.', 1, null),
    a('My friends disagree about what is going on.', 0, 'Outside opinions are mixed too.', 1, null),
    a('They have noticed her making effort too.', 1, 'Others have observed some reciprocal behaviour.', 1, 'finalCheck'),
    a('They told me to ask her because the vibe seems mutual.', 1, 'Friends see encouraging signs, but her answer matters most.', 1, 'finalCheck'),
  ]),

  // LEVEL 9
  q('finalCheck', 'FINAL REVIEW', 'EXHIBIT I · FINAL REVIEW', 'Be honest: what is your strongest sign that she likes you?', 'Choose what really happened, not what you hope it meant.', [
    a('She has clearly said no or asked me to stop.', -4, 'If she clearly said no, accept it and respect her choice.', 3, null, true),
    a('Mostly story views, likes, short replies, and guesses.', -1, 'The strongest evidence is ambiguous and easy to overread.', 1, 'closingQuestion'),
    a('Consistent effort, but no direct conversation yet.', 1, 'There are encouraging patterns, but the answer is not confirmed.', 1, 'closingQuestion'),
    a('She directly said she likes me or agreed to a date.', 3, 'Directly expressed interest is the clearest positive evidence.', 3, 'closingQuestion'),
  ]),

  // LEVEL 10 — optional final exhibit for longer routes
  q('closingQuestion', 'THE LAST WORD', 'EXHIBIT J · THE LAST WORD', 'If you asked her out today, what do you genuinely expect?', 'This is not a prediction. It is a final check on whether your expectations match the evidence.', [
    a('A no, or another polite non-answer.', -1, 'Your own read is that the interest may not be mutual.', 1, null),
    a('Honestly, I have no idea.', 0, 'The situation remains uncertain.', 1, null),
    a('Maybe yes, but I would not bet rent on it.', 1, 'You see some potential but recognize the uncertainty.', 1, null),
    a('A yes feels plausible because she has shown clear interest.', 2, 'Your expectation is based on a pattern you perceive as reciprocal.', 2, null),
  ]),
]

export const verdicts: Record<Verdict['id'], Verdict> = {
  boundary: {
    id: 'boundary', title: 'THE COURT RESPECTS HER BOUNDARY', subtitle: 'Case closed. Do not ask again.', color: 'blue',
    explanation: 'She said no, said she sees you as a friend, or made it clear she is unavailable. That is the answer. It is not a puzzle to solve. Take her answer seriously.',
    advice: 'Respect what she said. Give yourself some space and put your energy where it is returned.',
    roast: 'The answer is clear. Stop treating every story view as a new sign.',
  },
  delulu: {
    id: 'delulu', title: 'BRO IS CONNECTING INVISIBLE DOTS', subtitle: 'You brought 47 screenshots. The court is still not convinced.', color: 'pink',
    explanation: 'Your answers suggest you are putting in most of the effort, with few clear signs that she feels the same. We cannot read her mind, but you do not have to keep doing all the work.',
    advice: 'Stop being the only one keeping the conversation going. Not to test her—just give both of you room to make an effort.',
    roast: 'Brother, this is a chat, not a detective case.',
  },
  mixed: {
    id: 'mixed', title: 'THE EVIDENCE IS A MESS', subtitle: 'Some signs, but nothing clear yet.', color: 'yellow',
    explanation: 'Some signs look promising, but others could just be friendly. Watching a story does not prove she likes you.',
    advice: 'If you like her, ask her out clearly and without pressure. A real answer is better than another month of guessing.',
    roast: 'You collected 18 screenshots and still do not know how she feels.',
  },
  potential: {
    id: 'potential', title: 'OKAY, THERE MAY BE SOMETHING HERE', subtitle: 'Proceed. Do not plan the wedding.', color: 'green',
    explanation: 'You describe effort from both sides. That is encouraging, but it does not prove she likes you romantically.',
    advice: 'Ask her out in a simple, low-pressure way. Let her answer without analysing every word.',
    roast: 'That is progress. Do not start planning the wedding yet.',
  },
  chance: {
    id: 'chance', title: 'BRO, ASK HER OUT ALREADY', subtitle: 'Time for one honest conversation.', color: 'green',
    explanation: 'Your answers include some clear or consistent signs of interest. The next step is to talk to her, not keep guessing.',
    advice: 'Try: “I like talking with you. Would you like to go on a date sometime?” Make it easy for her to say yes or no.',
    roast: 'You could have asked her in the time it took to analyse all these signs.',
  },
}

export function getVerdict(score: number, answeredCount: number, hasDirectYes: boolean): Verdict {
  const average = answeredCount ? score / answeredCount : 0
  if (hasDirectYes && average >= 0.2) return verdicts.chance
  if (average <= -0.8) return verdicts.delulu
  if (average < -0.2) return verdicts.delulu
  if (average < 0.55) return verdicts.mixed
  if (average < 1.15) return verdicts.potential
  return verdicts.chance
}

export function getConfidence(
  path: string[],
  answers: Record<string, number>,
  hasBoundary: boolean,
): number {
  if (hasBoundary) return 99
  const selected = path.map((id) => {
    const question = questions.find((item) => item.id === id)
    const option = question?.options[answers[id]]
    return question && option ? { question, option } : null
  }).filter((item): item is { question: Question; option: AnswerOption } => item !== null)
  if (!selected.length) return 0

  const scores = selected.map(({ option }) => option.score)
  const positive = scores.filter((score) => score > 0).length
  const negative = scores.filter((score) => score < 0).length
  const directional = positive + negative
  const agreement = directional ? Math.max(positive, negative) / directional : 0.5
  const avgStrength = selected.reduce((sum, item) => sum + item.option.strength, 0) / selected.length
  const hasDirectEvidence = selected.some(({ question }) => ['direct', 'date', 'askedClearly', 'finalCheck'].includes(question.id))
  const depth = Math.min(1, selected.length / 8)
  // Confidence describes how much/consistent evidence the quiz collected, not the odds she likes him.
  return Math.min(95, Math.round(25 + depth * 15 + (avgStrength / 3) * 20 + agreement * 15 + (hasDirectEvidence ? 20 : 7)))
}

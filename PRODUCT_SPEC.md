# Product Specification — Dude, She's Just Not Into You

## Product premise

A fast, funny courtroom-style quiz that helps users reflect on the signals and reciprocity they report in a crush situation. The tone is playful and punchy; it must not claim to know another person's private feelings.

## Experience principles

- One question per screen.
- The next question depends on the previous answer.
- Show the user's case path as a sequence of exhibits.
- Use a compact fixed-height layout on common phone and desktop viewports.
- Keep emojis to a minimum; use typography, color, and icons for personality.
- No login, no names, no screenshots, and no backend in the MVP.
- The confidence number means confidence in the evidence-based quiz ruling, not a probability that she likes the user.

## Page structure

### Landing
- Brand and courtroom stamp.
- Headline: “DUDE, SHE'S JUST NOT INTO YOU.”
- Hook: “You brought 19 screenshots. The court brought common sense.”
- CTA: “Present your case”.
- Brief explanation: adaptive 5–8 question path, no login.
- Small fictional case file visual.

### Adaptive quiz
- Back/exit control.
- Exhibit number and progress bar.
- Case path chips for already visited categories.
- One question, a short context line, four answers.
- Selection and “Next exhibit” action.
- Answers are stored in component state only.

### Decision tree
- Initiation → lower initiation goes to effort; balanced/high initiation goes to her initiative.
- Effort/initiative → lower reciprocity goes to plans; higher reciprocity goes to in-person behaviour.
- Plans → repeated vague/non-follow-through goes to direct signal; positive follow-through goes to the date question.
- In-person behaviour → low/ambiguous signal goes to direct signal; positive signal goes to flirting.
- Flirting → unclear signals go to direct signal; stronger signals go to the date question.
- Direct signal → an explicit “friends only” or “no” ends the quiz with a boundary verdict; unclear answers go to reciprocity; flirting/direct interest goes to the date question.
- Date question → then reciprocity or timeline based on answer.
- Reciprocity → timeline.
- Timeline → verdict.

### Verdict
- A share-card preview featuring the verdict, case reference, confidence in the ruling, roast, evidence/exhibits, and brand watermark.
- Download a 1080 × 1350 PNG for stories.
- Use Web Share API to share the image on supported browsers; otherwise download the image and copy verdict text.
- Expandable case notes show the answer evidence and a constructive next step.
- For clear negative/delusional outcomes, attempt to load Brooksie's “Not Into You” via YouTube embed with autoplay. If the browser blocks autoplay, provide a direct play link.

## Question bank and routing

Question text, answer options, scores, evidence strength, routing, and notes live in `lib/quiz.ts`. Each answer includes:
- `score`: playful signal direction.
- `strength`: how direct/useful that answer is as evidence.
- `note`: explanation surfaced in the case notes.
- `next`: next question ID or `null` to finish.
- `boundary`: ends the quiz immediately if the user reports an explicit rejection/friendship-only boundary.

## Scoring

- Sum scores from questions actually answered on the current path.
- Normalize by answered-question count for verdict selection, since path lengths vary.
- A direct stated boundary overrides the numeric score.
- Verdict bands are qualitative: strong negative reciprocity → delulu; mixed evidence → inconclusive; consistently reciprocal/direct evidence → potential/chance.
- Confidence score uses path depth, evidence strength, directional consistency, and directness. An explicit boundary receives a high confidence score because the reported statement is direct. It is not a chance-of-attraction percentage.

## Verdict copy

- Boundary: “THE COURT RESPECTS HER BOUNDARY” / “Case closed. No appeal.”
- Delulu: “BRO IS CONNECTING INVISIBLE DOTS” / “The prosecution has entered 47 screenshots.”
- Mixed: “THE EVIDENCE IS A MESS” / “Several vibes. Zero solid receipts.”
- Potential: “OKAY, THERE MAY BE SOMETHING HERE” / “Proceed. Do not plan the wedding.”
- Chance: “BRO, ASK HER OUT ALREADY” / “The plot needs one normal conversation.”

## Share card

- PNG canvas size: 1080 × 1350.
- Contains case reference, verdict title, confidence in ruling, roast, exhibits reviewed, brand footer, and watermark.
- Avoids names and personal message content.

## Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- lucide-react
- Browser Canvas API for PNG generation
- Web Share API with download fallback
- YouTube embed for the soundtrack

## Weekend implementation plan

1. Review the adaptive question tree and tone on mobile.
2. Test every branch, including direct rejection, mixed signals, and direct interest.
3. Test card download and image sharing on supported mobile browsers.
4. Verify autoplay fallback and the official YouTube embed.
5. Test at 360 × 640, 390 × 844, 768 × 1024, and desktop sizes; adjust fixed-height spacing without adding page scroll.
6. Replace Open Graph metadata with the deployed domain and publish.

## Limitations / guardrails

- The quiz is entertainment, not a psychological assessment or reliable prediction of attraction.
- A stated no or friendship-only boundary is respected immediately.
- Do not advise users to manipulate, test, stalk, or pressure someone.
- Autoplay can be blocked by browsers; song playback needs a visible fallback.
- Replace `example.com` metadata only when the real production domain is known.

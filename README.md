# Dude, She's Just Not Into You

A playful, courtroom-style dating-signal quiz built with Next.js, TypeScript, and Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## MVP features

- Adaptive decision tree: answers route the user to different follow-up questions.
- Case path shows the exhibits visited so far.
- Rule-based verdicts with an evidence-confidence score. This is confidence in the quiz's ruling, not a probability that someone is romantically interested.
- Directly stated boundaries end the quiz and are treated as decisive.
- Verdict card is generated as a 1080 × 1350 PNG with a case reference, exhibits, and brand watermark.
- Share API support for sharing the image where supported; download fallback elsewhere.
- On clearly negative results, the site attempts to play Brooksie's official YouTube upload of “Not Into You.” Browser autoplay policies may require the user to press play.
- Fixed viewport layout designed to avoid page scrolling on common desktop and mobile screens.
- No account, backend, or data collection.

## Important implementation notes

- The quiz is for entertainment and should not be presented as a real predictor of another person's feelings.
- The song is embedded from YouTube rather than bundled as an audio file. The video belongs to its rights holder and playback is subject to YouTube availability and browser autoplay rules.
- Update Open Graph metadata in `app/layout.tsx` with the production domain when deploying.

## Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- lucide-react

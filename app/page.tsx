'use client'

import { useEffect, useMemo,useRef, useState } from 'react'
import {
  ArrowLeft, ArrowRight, Check, Gavel, RotateCcw, Share2,
  Scale, Download, Volume2, ExternalLink, ShieldAlert, X
} from 'lucide-react'
import { getConfidence, getVerdict, questions, verdicts, type Verdict } from '@/lib/quiz'


type Phase = 'landing' | 'quiz' | 'verdict'
const SONG_URL = 'https://www.youtube.com/watch?v=sAd1wcYiFyU'
const SONG_EMBED = 'https://www.youtube-nocookie.com/embed/sAd1wcYiFyU?autoplay=1&controls=1&playsinline=1&rel=0'

export default function Home() {
  const [phase, setPhase] = useState<Phase>('landing')
  const [path, setPath] = useState<string[]>(['initiation'])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [forcedBoundary, setForcedBoundary] = useState(false)
  const [songEnabled, setSongEnabled] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareError, setShareError] = useState('')
  const casePathRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = casePathRef.current
    if (el) {
      el.scrollLeft = el.scrollWidth
    }
  }, [path])

  const currentId = path[path.length - 1]
  const currentQuestion = questions.find((q) => q.id === currentId) ?? questions[0]
  const selected = answers[currentQuestion.id]
  const answeredQuestions = path.filter((id) => answers[id] !== undefined)
  const score = useMemo(() => answeredQuestions.reduce((sum, id) => {
    const q = questions.find((item) => item.id === id)!
    return sum + q.options[answers[id]].score
  }, 0), [answers, path])
  const hasDirectYes = answers.direct === 3
  const verdict = forcedBoundary ? verdicts.boundary : getVerdict(score, answeredQuestions.length, hasDirectYes)
  const confidence = getConfidence(answeredQuestions, answers, forcedBoundary)
  const progress = Math.min(100, (answeredQuestions.length / 7) * 100)
  const shouldPlaySong = phase === 'verdict' && (verdict.id === 'boundary' || (verdict.id === 'delulu' && confidence >= 58))

  useEffect(() => {
    if (shouldPlaySong) setSongEnabled(true)
    else setSongEnabled(false)
  }, [shouldPlaySong])

  function startQuiz() {
    setAnswers({})
    setPath(['initiation'])
    setForcedBoundary(false)
    setSongEnabled(false)
    setCopied(false)
    setShareError('')
    setPhase('quiz')
  }

  function chooseAnswer(index: number) {
    setAnswers((prev) => {
      const visited = new Set(path)
      const clean = Object.fromEntries(Object.entries(prev).filter(([id]) => visited.has(id)))
      return { ...clean, [currentQuestion.id]: index }
    })
  }

  function nextQuestion() {
    if (selected === undefined) return
    const answer = currentQuestion.options[selected]
    if (answer.boundary) {
      setForcedBoundary(true)
      setPhase('verdict')
      return
    }
    if (!answer.next) {
      setPhase('verdict')
      return
    }
    setPath((prev) => [...prev, answer.next!])
  }

  function previousQuestion() {
    if (path.length <= 1) {
      setPhase('landing')
      return
    }
    setPath((prev) => prev.slice(0, -1))
  }

  function caseReference() {
    const seed = `${path.join('-')}-${Object.values(answers).join('')}`
    let hash = 0
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
    return `DS-${hash.toString(16).toUpperCase().slice(0, 4).padStart(4, '0')}`
  }

  function shareText(v: Verdict) {
    return `CASE ${caseReference()} · ${v.title}\nConfidence in this ruling: ${confidence}/100 (not a prediction of her feelings).\n${v.roast}\nDude, She's Just Not Into You.`
  }

  function drawShareCard(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1350
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas is unavailable'))
      const colors: Record<Verdict['color'], string> = { pink: '#ffb9d1', yellow: '#ffe17b', green: '#b8f7a8', blue: '#b8dfff' }
      ctx.fillStyle = colors[verdict.color]
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = '#171717'; ctx.lineWidth = 12; ctx.strokeRect(35, 35, 1010, 1280)
      ctx.fillStyle = '#171717'
      ctx.font = '900 30px Arial'
      ctx.fillText('SUPREME COURT OF SITUATIONSHIPS', 78, 105)
      ctx.font = '700 24px Arial'
      ctx.textAlign = 'right'; ctx.fillText(`CASE ${caseReference()}`, 1000, 105); ctx.textAlign = 'left'
      ctx.beginPath(); ctx.setLineDash([12, 12]); ctx.moveTo(78, 140); ctx.lineTo(1000, 140); ctx.stroke(); ctx.setLineDash([])
      ctx.fillStyle = '#fff'; ctx.fillRect(78, 180, 924, 60); ctx.strokeRect(78, 180, 924, 60)
      ctx.fillStyle = '#171717'; ctx.font = '900 25px Arial'; ctx.fillText('THE JURY HAS REACHED A VERDICT', 100, 220)
      ctx.font = '900 66px Arial'
      const titleLines = wrapCanvasText(ctx, verdict.title, 850)
      let y = 330
      titleLines.slice(0, 3).forEach((line) => { ctx.fillText(line, 78, y); y += 78 })
      ctx.font = '700 30px Arial'
      wrapCanvasText(ctx, verdict.subtitle, 850).slice(0, 2).forEach((line) => { ctx.fillText(line, 78, y + 10); y += 44 })
      y += 38
      ctx.fillStyle = '#171717'; ctx.fillRect(78, y, 924, 145)
      ctx.fillStyle = '#d8ff3e'; ctx.fillRect(95, y + 17, 890, 111)
      ctx.fillStyle = '#171717'; ctx.font = '900 25px Arial'; ctx.fillText('CONFIDENCE IN THIS RULING', 120, y + 53)
      ctx.font = '900 52px Arial'; ctx.textAlign = 'right'; ctx.fillText(`${confidence}/100`, 960, y + 105); ctx.textAlign = 'left'
      y += 195
      ctx.font = '900 26px Arial'; ctx.fillText('THE JUDGE SAYS', 78, y)
      ctx.font = '700 34px Arial'
      wrapCanvasText(ctx, verdict.roast, 850).slice(0, 3).forEach((line) => { y += 47; ctx.fillText(line, 78, y) })
      y += 65
      ctx.font = '900 24px Arial'; ctx.fillText('EXHIBITS REVIEWED', 78, y)
      ctx.font = '700 24px Arial'
      const exhibitLine = answeredQuestions.map((id) => questions.find((q) => q.id === id)?.short).filter(Boolean).join('  /  ')
      wrapCanvasText(ctx, exhibitLine || 'TEXTING / EFFORT / DIRECT SIGNALS', 850).slice(0, 2).forEach((line) => { y += 38; ctx.fillText(line, 78, y) })
      ctx.beginPath(); ctx.moveTo(78, 1190); ctx.lineTo(1000, 1190); ctx.stroke()
      ctx.font = '900 25px Arial'; ctx.fillText("DUDE, SHE'S JUST NOT INTO YOU", 78, 1235)
      ctx.font = '700 20px Arial'; ctx.fillText('FOR ENTERTAINMENT. NOT A MIND-READING DEVICE.', 78, 1274)
      ctx.textAlign = 'right'; ctx.fillText('TAKE THE TEST', 1000, 1274); ctx.textAlign = 'left'
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not create the image')), 'image/png')
    })
  }

  async function downloadCard() {
    setShareError('')
    try {
      const blob = await drawShareCard()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url; anchor.download = `verdict-${caseReference().toLowerCase()}.png`; anchor.click()
      URL.revokeObjectURL(url)
    } catch {
      setShareError('Could not make the card. Try taking a screenshot instead.')
    }
  }

  async function shareResult() {
    setShareError('')
    try {
      const blob = await drawShareCard()
      const file = new File([blob], `verdict-${caseReference().toLowerCase()}.png`, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({ title: "Dude, She's Just Not Into You", text: shareText(verdict), files: [file] })
        return
      }
      await downloadCard()
      try { await navigator.clipboard.writeText(`${shareText(verdict)}\n${window.location.href}`); setCopied(true) }
      catch { setCopied(false) }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      setShareError('Sharing is not supported here. Download the card and post it manually.')
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <button onClick={() => setPhase('landing')} className="brand" aria-label="Go to home">
          <span className="brand-mark">
            <img src="/icon.png" alt="" />
          </span>
          <span>Dude, She's Just Not Into You.</span>
        </button>
        <span className="header-stamp">THE PEOPLE VS. YOUR DELUSION</span>
      </header>

      {phase === 'landing' && <section className="landing paper-grid">
        <div className="landing-copy">
          <div className="eyebrow"><Gavel size={14}/> THE COURT IS IN SESSION</div>
          <h1>DUDE,<br/>SHE&apos;S JUST<br/><span>NOT<span className="highlight-text"> INTO YOU.</span></span></h1>
          <p className="landing-description">You brought 19 screenshots. The court brought common sense.</p>
          <button onClick={startQuiz} className="primary-button">Present your case <ArrowRight size={18}/></button>
          <p className="landing-note">5–8 questions, depending on your answers. No login. No names. No delusion left unexamined.</p>
        </div>
        <div className="landing-exhibit" aria-hidden="true">
          <div className="floating-stamp">EXHIBIT A</div>
          <div className="case-paper">
            <div className="case-paper-top"><span>SUPREME COURT OF SITUATIONSHIPS</span><Gavel size={20}/></div>
            <div className="case-paper-body"><div className="judge-icon"><Scale size={38}/></div><p>CASE FILE: CRUSH-001</p><h2>THE PEOPLE<br/>VS. YOUR CRUSH</h2><span>“She liked my story.”</span><strong>OBJECTION.</strong></div>
            <div className="case-paper-bottom"><span>VERDICT PENDING</span><span>FILED BY: YOU</span></div>
          </div>
          <div className="bottom-stamp">NO MORE LORE. JUST FACTS.</div>
        </div>
      </section>}

      {phase === 'quiz' && <section className="quiz-screen">
        <div className="quiz-topline">
          <button onClick={previousQuestion} className="text-button"><ArrowLeft size={16}/>{path.length === 1 ? 'Exit court' : 'Previous exhibit'}</button>
          <span>EXHIBIT {path.length} <span className="muted">· ADAPTIVE CASE</span></span>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }}/></div>
        <div className="case-path" ref={casePathRef}>
          <span>CASE PATH</span>
          {path.map((id, i) => (
            <span
              key={`${id}-${i}`}
              className={`path-chip ${i === path.length - 1 ? 'active' : ''}`}
            >
              {questions.find((q) => q.id === id)?.short}
            </span>
          ))}
        </div>
        <div className="question-card">
          <div className="question-label"><Gavel size={13}/>{currentQuestion.category}</div>
          <h2>{currentQuestion.question}</h2>
          <p className="question-context">{currentQuestion.context}</p>
          <div className="answer-grid">{currentQuestion.options.map((option, index) => {
            const isSelected = selected === index
            return <button key={option.label} onClick={() => chooseAnswer(index)} className={`answer-option ${isSelected ? 'selected' : ''}`}><span className="option-letter">{isSelected ? <Check size={15}/> : String.fromCharCode(65 + index)}</span><span>{option.label}</span></button>
          })}</div>
          <div className="question-footer"><span>Choose the closest answer. No essay required.</span><button onClick={nextQuestion} disabled={selected === undefined} className="primary-button compact">{currentQuestion.options[selected ?? 0]?.boundary || !currentQuestion.options[selected ?? 0]?.next ? 'Deliver verdict' : 'Next exhibit'} <ArrowRight size={16}/></button></div>
        </div>
        <div className="privacy-note"><ShieldAlert size={13}/> Your answers stay in this browser. No names or screenshots collected.</div>
      </section>}

      {phase === 'verdict' && <VerdictView verdict={verdict} confidence={confidence} caseReference={caseReference()} path={answeredQuestions} answers={answers} shouldPlaySong={shouldPlaySong} songEnabled={songEnabled} setSongEnabled={setSongEnabled} onShare={shareResult} onDownload={downloadCard} copied={copied} shareError={shareError} onRestart={startQuiz}/>}

      <footer className="app-footer"><strong>Dude, She's Just Not Into You.</strong><span>For entertainment. Respect boundaries. Touch grass when necessary.</span></footer>
    </main>
  )
}

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word }
    else line = test
  }
  if (line) lines.push(line)
  return lines
}

function VerdictView({ verdict, confidence, caseReference, path, answers, shouldPlaySong, songEnabled, setSongEnabled, onShare, onDownload, copied, shareError, onRestart }: {
  verdict: Verdict; confidence: number; caseReference: string; path: string[]; answers: Record<string, number>; shouldPlaySong: boolean; songEnabled: boolean; setSongEnabled: (value: boolean | ((prev: boolean) => boolean)) => void; onShare: () => void; onDownload: () => void; copied: boolean; shareError: string; onRestart: () => void
}) {
  const [showEvidence, setShowEvidence] = useState(false)
  const tone: Record<Verdict['color'], string> = { pink: 'tone-pink', yellow: 'tone-yellow', green: 'tone-green', blue: 'tone-blue' }
  const evidenceNotes = path.map((id) => {
    const q = questions.find((item) => item.id === id)!
    const option = q.options[answers[id]]
    return option ? { short: q.short, note: option.note } : null
  }).filter((item): item is { short: string; note: string } => Boolean(item))

  return <section className="verdict-screen">
    <div className="verdict-heading"><div className="eyebrow"><Scale size={14}/> THE JURY HAS RULED</div><h2>HERE&apos;S THE TEA.</h2></div>
    <div className={`share-card ${tone[verdict.color]}`} id="share-result">
      <div className="share-card-header"><span>SUPREME COURT OF SITUATIONSHIPS</span><span>{caseReference}</span></div>
      <div className="share-card-main">
        <div className="ruling-stamp">OFFICIAL-ISH RULING</div>
        <h3>{verdict.title}</h3>
        <p className="verdict-subtitle">{verdict.subtitle}</p>
        <div className="confidence-panel"><div><span>CONFIDENCE IN THIS RULING</span><small>Not a prediction of her feelings</small></div><strong>{confidence}<small>/100</small></strong></div>
        <p className="roast-label">THE JUDGE SAYS</p><p className="roast-copy">{verdict.roast}</p>
      </div>
      <div className="share-card-footer"><span>EXHIBITS: {path.map((id) => questions.find((q) => q.id === id)?.short).join(' / ')}</span><strong>DUDE, SHE&apos;S JUST NOT INTO YOU</strong></div>
      <div className="watermark">DSJNIY · THE INTERNET COURT</div>
    </div>

    <div className="verdict-actions">
      <button onClick={onDownload} className="primary-button"><Download size={16}/> Download story card</button>
      <button onClick={onShare} className="secondary-button"><Share2 size={16}/>{copied ? 'Card downloaded · text copied' : 'Share card'}</button>
      <button onClick={onRestart} className="icon-button" aria-label="Try again"><RotateCcw size={17}/></button>
    </div>
    {shareError && <p className="share-error">{shareError}</p>}
    <button className="evidence-toggle" onClick={() => setShowEvidence((value) => !value)}>{showEvidence ? 'Hide the case notes' : 'Open the case notes'} <ArrowRight size={14}/></button>
    {showEvidence && (
  <div
    className="evidence-popover"
    role="dialog"
    aria-label="Case notes and answers"
  >
    <div className="evidence-popover-header">
      <strong>THE EVIDENCE FILE</strong>
      <button
        type="button"
        className="evidence-close"
        onClick={() => setShowEvidence(false)}
        aria-label="Close case notes"
        title="Close"
      >
        <X size={17} />
      </button>
    </div>

    <div className="evidence-content">
      <p>{verdict.explanation}</p>
      <p><strong>Next move:</strong> {verdict.advice}</p>

      {evidenceNotes.map((item, index) => (
        <p key={`${item.short}-${index}`}>
          <strong>{item.short}:</strong> {item.note}
        </p>
      ))}
    </div>
  </div>
)}

    {shouldPlaySong && <div className="song-panel">
      <div className="song-copy"><Volume2 size={17}/><span><strong>Verdict soundtrack</strong><small>Brooksie — “Not Into You”</small></span></div>
      <button className="song-button" onClick={() => setSongEnabled((value) => !value)}>{songEnabled ? 'Hide player' : 'Play the anthem'} <ArrowRight size={14}/></button>
      {songEnabled && <div className="song-player"><iframe src={SONG_EMBED} title="Brooksie — Not Into You" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen/><a href={SONG_URL} target="_blank" rel="noreferrer">If autoplay is blocked, play it on YouTube <ExternalLink size={12}/></a></div>}
    </div>}
    <p className="disclaimer">This is a playful read of your answers, not mind-reading. A clear no is a no.</p>
  </section>
}

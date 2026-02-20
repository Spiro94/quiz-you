// src/pages/Signup.tsx
// No Screen/Signup exists in quiz-you.pen. Left panel mirrors Screen/Login (loginLeft) exactly.
// Auth card adapts the authCard spec for signup context.
import { SignupForm } from '../components/auth/SignupForm'

// Left panel feature list — identical to Login page (same quiz-you.pen loginFeatures)
const features = [
  {
    // feat1Icon: lucide "zap"
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    text: 'Realistic LLM-generated questions for any stack',
  },
  {
    // feat2Icon: lucide "target"
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    text: 'Instant answer evaluation with detailed feedback',
  },
  {
    // feat3Icon: lucide "trending-up"
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    text: 'Track progress and improve difficulty over time',
  },
]

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-background flex">
      {/* Left branding panel — mirrors quiz-you.pen loginLeft exactly: w-680, bg-surface, padding [64, 72], gap-32, justifyContent center */}
      <div
        className="hidden lg:flex lg:w-[680px] shrink-0 flex-col justify-center bg-surface"
        style={{ padding: '64px 72px', gap: '32px' }}
      >
        {/* Logo — loginLeftLogo: gap 10, alignItems center */}
        <div className="flex items-center" style={{ gap: '10px' }}>
          {/* loginLogoMark: 32×32, bg-primary, cornerRadius 8, zap icon 18×18 fill foreground */}
          <div
            className="bg-primary flex items-center justify-center text-foreground shrink-0"
            style={{ width: '32px', height: '32px', borderRadius: '8px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          {/* loginLogoText: "QuizYou", Inter 700, fontSize 20, fill foreground */}
          <span className="text-foreground" style={{ fontFamily: 'Inter, sans-serif', fontSize: '20px', fontWeight: 700 }}>
            QuizYou
          </span>
        </div>

        {/* Headline — loginHeadline: fontSize 44, fontWeight 800, letterSpacing -1px, lineHeight 1.15, fill foreground */}
        <h2
          className="text-foreground whitespace-pre-line"
          style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.15 }}
        >
          {'Ace Your Next\nTechnical Interview'}
        </h2>

        {/* Subtext — loginSubtext: fontSize 16, fontWeight normal, lineHeight 1.6, fill muted-foreground */}
        <p
          className="text-muted-foreground"
          style={{ fontSize: '16px', fontWeight: 400, lineHeight: 1.6 }}
        >
          Practice with AI-generated questions tailored to your tech stack and skill level. Get instant feedback and improve your scores.
        </p>

        {/* Features — loginFeatures: layout vertical, gap 16 */}
        <div className="flex flex-col" style={{ gap: '16px' }}>
          {features.map(({ icon, text }) => (
            // feat row: gap 12, alignItems center
            <div key={text} className="flex items-center" style={{ gap: '12px' }}>
              {/* feat icon box: 32×32, bg-primary-muted, cornerRadius 8, icon 16×16 fill primary */}
              <div
                className="bg-primary-muted text-primary flex items-center justify-center shrink-0"
                style={{ width: '32px', height: '32px', borderRadius: '8px' }}
              >
                {icon}
              </div>
              {/* feat text: fontSize 14, fontWeight normal, fill muted-foreground */}
              <span className="text-muted-foreground" style={{ fontSize: '14px', fontWeight: 400 }}>
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel — loginRight: fill_container, padding 48, justifyContent center, alignItems center */}
      <div className="flex flex-1 flex-col items-center justify-center" style={{ padding: '48px' }}>
        {/* Mobile-only logo (< lg) */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="bg-primary flex items-center justify-center text-foreground" style={{ width: '28px', height: '28px', borderRadius: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span className="text-foreground" style={{ fontSize: '17px', fontWeight: 700 }}>QuizYou</span>
        </div>

        {/* Auth card — authCard spec: w-440, bg-surface, cornerRadius 16, border border, padding 40, gap 24 */}
        <div className="w-full" style={{ maxWidth: '440px' }}>
          <SignupForm />
        </div>
      </div>
    </main>
  )
}

"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useI18n } from "@/lib/i18n";

/* ─── Typing animation hook ─── */
function useTypingAnimation(phrases: string[], typingSpeed = 60, deleteSpeed = 40, pauseDuration = 2000) {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex] || "";
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && text === currentPhrase) {
      timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    } else if (isDeleting) {
      timeout = setTimeout(() => setText(text.slice(0, -1)), deleteSpeed);
    } else {
      timeout = setTimeout(() => setText(currentPhrase.slice(0, text.length + 1)), typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, phraseIndex, phrases, typingSpeed, deleteSpeed, pauseDuration]);

  return text;
}

/* ─── Scroll fade-in hook ─── */
function useFadeInOnScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, style: { opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(48px)", transition: "opacity 0.8s cubic-bezier(.22,1,.36,1), transform 0.8s cubic-bezier(.22,1,.36,1)" } };
}

/* ─── FadeSection wrapper ─── */
function FadeSection({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { ref, style: fadeStyle } = useFadeInOnScroll();
  return <div ref={ref} style={{ ...fadeStyle, ...style }} {...props}>{children}</div>;
}

export default function Home() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [creating, setCreating] = useState(false);

  const isLoading = status === "loading";

  const typingPhrases = [
    "Build me a SaaS landing page...",
    "Create an e-commerce store...",
    "Design a portfolio website...",
    "Make a dashboard for my startup...",
  ];
  const typedText = useTypingAnimation(typingPhrases);

  async function handleStart() {
    const trimmed = prompt.trim();
    if (!trimmed || creating) return;
    if (!session) {
      sessionStorage.setItem("nova-pending-prompt", trimmed);
      router.push("/login");
      return;
    }
    setCreating(true);
    try {
      const name = trimmed.slice(0, 48) + (trimmed.length > 48 ? "…" : "");
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("failed");
      const { id } = (await res.json()) as { id: string };
      sessionStorage.setItem("nova-pending-prompt", trimmed);
      router.push(`/builder/${id}`);
    } catch {
      setCreating(false);
    }
  }

  return (
    <div className="origin-home">
      <PublicNav theme="dark" />

      {/* ═══════════════ HERO ═══════════════ */}
      <div className="origin-hero">
        <div className="origin-hero__site-wrapper">
          {/* Background clouds video */}
          <video
            autoPlay loop muted playsInline
            className="origin-hero__video"
            poster="https://cdn.prod.website-files.com/68acbc076b672f730e0c77b9%2F68bb73e8d95f81619ab0f106_Clouds1-poster-00001.jpg"
          >
            <source src="https://cdn.prod.website-files.com/68acbc076b672f730e0c77b9%2F68bb73e8d95f81619ab0f106_Clouds1-transcode.mp4" type="video/mp4" />
            <source src="https://cdn.prod.website-files.com/68acbc076b672f730e0c77b9%2F68bb73e8d95f81619ab0f106_Clouds1-transcode.webm" type="video/webm" />
          </video>
          <div className="origin-hero__overlay" />

          <div className="origin-container" style={{ position: "relative", zIndex: 2 }}>
            <div className="origin-hero__wrapper">
              {/* Promo badge */}
              <div className="origin-promo">
                <p className="origin-smalltext">{t.landing.badge}</p>
              </div>

              {/* Main heading */}
              <h1 className="origin-display-heading">
                <em>{t.landing.titleLead.split(" ")[0]}</em>{" "}
                {t.landing.titleLead.split(" ").slice(1).join(" ")}{" "}
                {t.landing.titleAccent}
              </h1>

              {/* Sub copy */}
              <div className="origin-hero__sub-wrapper">
                <p className="origin-body-white">{t.landing.subtitle}</p>
              </div>

              {/* CTA Button */}
              <Link href="/signup" className="origin-button origin-button--nav">
                <span>{t.landing.getStartedFree}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>

              {/* Typing search bar */}
              <button
                onClick={() => {
                  const el = document.getElementById("site-prompt");
                  if (el) el.focus();
                }}
                className="origin-search-bar"
              >
                <span className="origin-typed-words">{typedText}</span>
                <span className="origin-search-btn">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </span>
              </button>

              {/* Trust line */}
              <div className="origin-hero__trust">
                <p className="origin-p60">{t.landing.trustBadges.join("  ·  ")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ SIMPLIFY SECTION ═══════════════ */}
      <div className="origin-intro">
        <div className="origin-site-wrapper">
          <FadeSection>
            <div className="origin-container">
              <div className="origin-hero__wrapper">
                <h3 className="origin-large-heading">
                  <em className="origin-text-italics">{t.landing.simplifyDesignLead}</em> {t.landing.simplifyDesignAccent}
                </h3>
              </div>
            </div>
          </FadeSection>
        </div>
      </div>

      {/* ═══════════════ BUILD EVERYTHING — TRACK CARDS ═══════════════ */}
      <div className="origin-divider" />
      <div className="origin-intro">
        <div className="origin-site-wrapper">
          <FadeSection>
            <div className="origin-container">
              <div className="origin-hero__wrapper">
                <h2 className="origin-large-heading">
                  <em className="origin-text-italics">{t.landing.buildEverythingLead}</em> {t.landing.buildEverythingAccent}
                </h2>
                <div className="origin-hero__sub-wrapper">
                  <p className="origin-p60">{t.landing.buildEverythingDesc}</p>
                </div>
                <Link href="/signup" className="origin-button origin-button--dark">
                  {t.landing.getStartedFree.toUpperCase()}
                </Link>
              </div>
            </div>
          </FadeSection>

          {/* Track cards grid */}
          <FadeSection>
            <div className="origin-track-grid">
              {t.landing.features.slice(0, 2).map((feat, i) => (
                <div key={i} className="origin-track-card">
                  <div className="origin-track-card__image-wrapper">
                    <div className="origin-image-blur-bg">
                      <img
                        src={[
                          "https://cdn.prod.website-files.com/68acbc076b672f730e0c77b9/68bf6605b4df5f9a02f2489b_spend-this-month.avif",
                          "https://cdn.prod.website-files.com/68acbc076b672f730e0c77b9/68c02b1aa2d9315689379726_budgetcard.avif",
                        ][i]}
                        alt={feat.title}
                        loading="lazy"
                        className="origin-track-card__img"
                      />
                    </div>
                  </div>
                  <div className="origin-track-card__text">
                    <p className="origin-body-white">{feat.title}</p>
                    <p className="origin-p60">{feat.body}</p>
                  </div>
                  <div className="origin-track-card__gradient" />
                </div>
              ))}
            </div>
          </FadeSection>
        </div>
      </div>

      {/* ═══════════════ ASK ANYTHING — AI SECTION ═══════════════ */}
      <div className="origin-divider" />
      <div className="origin-ai-section">
        <div className="origin-intro origin-aigradient">
          <div className="origin-site-wrapper">
            <FadeSection>
              <div className="origin-container">
                <div className="origin-hero__wrapper">
                  <svg className="origin-star" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" fill="white" fillOpacity="0.6"/>
                  </svg>
                  <h2 className="origin-large-heading origin-font-weight-normal">
                    <span className="origin-text-span">
                      <em className="origin-text-italics">{t.landing.deployAnythingLead}</em> {t.landing.deployAnythingAccent}
                    </span>
                  </h2>
                  <div className="origin-hero__sub-wrapper">
                    <p className="origin-p60">{t.landing.deployAnythingDesc}</p>
                  </div>
                </div>
              </div>
            </FadeSection>

            {/* AI Prompt Input — prominent */}
            <FadeSection>
              <div className="origin-container">
                <div className="origin-ai-prompt-wrapper">
                  <div className="origin-ai-prompt">
                    <label htmlFor="site-prompt" className="sr-only">{t.landing.promptSrLabel}</label>
                    <textarea
                      id="site-prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleStart();
                        }
                      }}
                      placeholder={t.landing.promptPlaceholder}
                      rows={3}
                      className="origin-ai-prompt__textarea"
                    />
                    <div className="origin-ai-prompt__footer">
                      <span className="origin-ai-prompt__hint">{t.landing.pressEnter}</span>
                      <button
                        onClick={handleStart}
                        disabled={!prompt.trim() || creating || isLoading}
                        className="origin-ai-prompt__submit"
                      >
                        {creating ? (
                          <>
                            <span className="origin-spinner" />
                            {t.landing.building}
                          </>
                        ) : (
                          <>
                            {t.landing.startBuildingFree}
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Example chips */}
                  <div className="origin-examples">
                    <span className="origin-examples__label">{t.landing.tryLabel}</span>
                    {t.landing.examples.map((ex) => (
                      <button key={ex.label} onClick={() => setPrompt(ex.prompt)} className="origin-examples__chip">
                        {ex.icon} {ex.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </FadeSection>
          </div>
        </div>
      </div>

      {/* ═══════════════ DEPLOY — FEATURE CARDS (3-col) ═══════════════ */}
      <div className="origin-updates">
        <FadeSection>
          <div className="origin-container">
            <div className="origin-hero__wrapper">
              <h2 className="origin-large-heading">
                <em className="origin-text-italics">{t.landing.growProductTitle.split(" ")[0]}</em>{" "}
                {t.landing.growProductTitle.split(" ").slice(1).join(" ")}
              </h2>
              <div className="origin-hero__sub-wrapper">
                <p className="origin-p60">{t.landing.growProductDesc}</p>
              </div>
            </div>
          </div>
        </FadeSection>

        <FadeSection>
          <div className="origin-container">
            <div className="origin-3col-grid">
              {t.landing.features.map((feat, i) => (
                <div key={i} className="origin-update-card">
                  <div className="origin-product-update-title">{feat.icon}</div>
                  <h3 className="origin-update-card__title">{feat.title}</h3>
                  <p className="origin-p60">{feat.body}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeSection>
      </div>

      {/* ═══════════════ CONNECT SPHERE SECTION ═══════════════ */}
      <div className="origin-sphere-section">
        <div className="origin-sphere-bg" />
        <FadeSection>
          <div className="origin-sphere-center">
            <h2 className="origin-large-heading" style={{ fontSize: "clamp(32px, 5vw, 48px)" }}>
              <em className="origin-text-italics">Connect</em> your apps
            </h2>
            <div className="origin-hero__sub-wrapper" style={{ marginTop: 16 }}>
              <p className="origin-p60">
                Integrate with your favorite tools. Nova connects with Figma, GitHub, Vercel, and hundreds more.
              </p>
            </div>
            <Link href="/signup" className="origin-button origin-button--dark" style={{ marginTop: 24 }}>
              EXPLORE INTEGRATIONS
            </Link>
          </div>
        </FadeSection>
      </div>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <div className="origin-testimonials">
        <FadeSection>
          <div className="origin-container">
            <div className="origin-hero__wrapper" style={{ marginBottom: 60 }}>
              <h2 className="origin-large-heading">{t.landing.testimonialsTitle}</h2>
            </div>

            <div className="origin-testimonial-grid">
              {t.landing.testimonials.map((item, i) => (
                <div key={i} className={`origin-quote-card origin-quote-card--${i + 1}`}>
                  <div>
                    <img
                      src="https://cdn.prod.website-files.com/68acbc076b672f730e0c77b9/68acd3d1459c4533e7d4649a_stars.svg"
                      alt="5 stars"
                      className="origin-quote-card__stars"
                    />
                    <p className="origin-quote-card__text">&ldquo;{item.quote}&rdquo;</p>
                  </div>
                  <div className="origin-quote-card__author">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeSection>
      </div>

      {/* ═══════════════ BOTTOM CTA / FOOTER HERO ═══════════════ */}
      <div className="origin-forecast-section">
        <div className="origin-site-wrapper-forecast">
          <FadeSection>
            <div className="origin-container">
              <div className="origin-hero__wrapper">
                <div className="origin-hero-label">
                  <span className="origin-hero-label-text">{t.landing.newsEyebrow}</span>
                </div>
                <h2 className="origin-large-heading" style={{ color: "#ffffff" }}>
                  {t.landing.newsTitle}
                </h2>
                <div className="origin-hero__sub-wrapper" style={{ marginTop: 16 }}>
                  <p className="origin-p60" style={{ color: "rgba(255,255,255,0.7)" }}>{t.landing.ctaSubtitle}</p>
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 32 }}>
                  <Link href="/signup" className="origin-button origin-button--nav">
                    <span>{t.landing.getStartedFree}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>
                  <Link href="/builder/demo" className="origin-button origin-button--dark">
                    {t.landing.tryDemo}
                  </Link>
                </div>
              </div>
            </div>
          </FadeSection>
        </div>
      </div>

      <PublicFooter theme="dark" />

      {/* ═══════════════ STYLES ═══════════════ */}
      <style>{`
        /* ── Base ── */
        .origin-home {
          min-height: 100vh;
          background: #0f1011;
          color: #fff;
          font-family: var(--font-suisse-intl);
          overflow-x: hidden;
        }

        /* ── Typography ── */
        .origin-display-heading {
          font-family: var(--font-lyon-display);
          font-weight: 300;
          font-size: clamp(48px, 8vw, 96px);
          line-height: 0.92;
          color: #fafafa;
          margin: 0 0 24px;
          letter-spacing: -0.025em;
        }
        .origin-display-heading em {
          font-style: normal;
          font-weight: 300;
        }

        .origin-large-heading {
          font-family: var(--font-lyon-display);
          font-weight: 300;
          font-size: clamp(36px, 6vw, 64px);
          line-height: 0.95;
          color: #fafafa;
          margin: 0;
        }

        .origin-text-italics {
          font-family: var(--font-lyon-display);
          font-style: normal;
          font-weight: 300;
        }

        .origin-text-span { display: inline; }

        .origin-font-weight-normal { font-weight: 400; }

        .origin-body-white {
          color: #fafafa;
          font-family: var(--font-suisse-intl);
          font-size: 16px;
          font-weight: 400;
          line-height: 1.5;
          margin: 0;
        }

        .origin-p60 {
          color: rgba(255,255,255,0.6);
          font-family: var(--font-suisse-intl);
          font-weight: 300;
          font-size: 16px;
          line-height: 1.5;
          margin: 0;
        }

        .origin-smalltext {
          font-family: var(--font-roboto-mono);
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #fafafa;
          margin: 0;
        }

        /* ── Layout ── */
        .origin-container {
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
        }

        .origin-hero__wrapper {
          text-align: center;
          max-width: 980px;
          margin: 0 auto;
        }

        .origin-hero__sub-wrapper {
          max-width: 420px;
          margin: 0 auto 24px;
        }

        .origin-site-wrapper {
          padding: 0 32px;
        }

        .origin-divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ── Hero ── */
        .origin-hero {
          position: relative;
          background: transparent;
        }

        .origin-hero__site-wrapper {
          z-index: 10;
          background-image: linear-gradient(rgba(15,16,17,0), #0f1011);
          width: 100%;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 180px 100px 50px;
          position: relative;
          overflow: hidden;
        }

        .origin-hero__video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
          pointer-events: none;
        }

        .origin-hero__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(rgba(15,16,17,0.3), rgba(15,16,17,0.8));
          z-index: 1;
          pointer-events: none;
        }

        /* ── Promo badge ── */
        .origin-promo {
          display: inline-flex;
          align-items: center;
          padding: 8px 20px;
          border-radius: 88px;
          background-image: linear-gradient(rgba(49,44,0,1), rgba(49,44,0,0.24));
          backdrop-filter: blur(296px);
          -webkit-backdrop-filter: blur(296px);
          box-shadow: inset -0.96px -0.96px 7px rgba(255,255,255,0.15);
          margin-bottom: 48px;
        }

        /* ── Buttons ── */
        .origin-button {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 12px 18px;
          border-radius: 8px;
          font-family: var(--font-roboto-mono);
          font-size: 12px;
          font-weight: 500;
          text-decoration: none;
          text-transform: uppercase;
          cursor: pointer;
          border: none;
          transition: background-color 0.2s;
        }

        .origin-button--nav {
          background: #fff;
          color: #000;
        }
        .origin-button--nav:hover {
          background: rgba(255,255,255,0.86);
        }

        .origin-button--dark {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .origin-button--dark:hover {
          background: rgba(255,255,255,0.18);
        }

        /* ── Search bar (typing) ── */
        .origin-search-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 16px 14px 20px;
          max-width: 520px;
          width: 100%;
          margin: 24px auto 0;
          cursor: text;
          transition: border-color 0.3s;
        }
        .origin-search-bar:hover {
          border-color: rgba(255,255,255,0.2);
        }

        .origin-typed-words {
          color: #fff;
          font-family: var(--font-suisse-intl);
          font-size: 16px;
          font-weight: 300;
          line-height: 1;
          text-align: left;
        }
        .origin-typed-words::after {
          content: "|";
          display: inline;
          animation: origin-blink 1s infinite;
        }

        .origin-search-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255,255,255,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
        }

        /* ── Trust badges ── */
        .origin-hero__trust {
          margin-top: 32px;
        }

        /* ── Intro sections ── */
        .origin-intro {
          padding: 100px 32px;
        }

        /* ── Track cards ── */
        .origin-track-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 60px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }

        .origin-track-card {
          background-image: linear-gradient(135deg, #2b2b2c, #131313);
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          min-height: 500px;
          display: flex;
          flex-direction: column;
        }

        .origin-track-card__image-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 40px 0;
        }

        .origin-image-blur-bg {
          position: relative;
        }

        .origin-track-card__img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          display: block;
        }

        .origin-track-card__text {
          padding: 32px 40px;
          position: relative;
          z-index: 2;
        }
        .origin-track-card__text p:first-child {
          margin-bottom: 8px;
        }

        .origin-track-card__gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(19,19,19,0.9), transparent 60%);
          pointer-events: none;
          z-index: 1;
        }

        /* ── AI Section ── */
        .origin-ai-section {
          position: relative;
        }

        .origin-aigradient {
          background-image: linear-gradient(#0f1011, rgba(19,29,39,0.8) 30%, rgba(15,16,17,1));
        }

        .origin-star {
          margin-bottom: 32px;
          animation: origin-pulse 3s ease-in-out infinite;
        }

        .origin-ai-prompt-wrapper {
          max-width: 640px;
          margin: 48px auto 0;
        }

        .origin-ai-prompt {
          background: #000;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          overflow: hidden;
        }

        .origin-ai-prompt__textarea {
          width: 100%;
          background: transparent;
          border: none;
          padding: 20px 22px 12px;
          font-size: 16px;
          color: #fafafa;
          resize: none;
          outline: none;
          line-height: 1.6;
          font-family: var(--font-suisse-intl);
          font-weight: 300;
          box-sizing: border-box;
        }
        .origin-ai-prompt__textarea::placeholder {
          color: rgba(255,255,255,0.3);
        }

        .origin-ai-prompt__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px 16px 22px;
          gap: 12px;
        }

        .origin-ai-prompt__hint {
          font-size: 11px;
          color: var(--color-fog);
          font-family: var(--font-roboto-mono);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .origin-ai-prompt__submit {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 40px;
          padding: 0 18px;
          border-radius: 8px;
          border: none;
          background: #fff;
          color: #000;
          font-size: 12px;
          font-weight: 500;
          font-family: var(--font-roboto-mono);
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
        }
        .origin-ai-prompt__submit:hover {
          background: rgba(255,255,255,0.86);
        }
        .origin-ai-prompt__submit:disabled {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.4);
          cursor: not-allowed;
        }

        /* ── Examples ── */
        .origin-examples {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
        }
        .origin-examples__label {
          font-size: 13px;
          color: var(--color-fog);
          font-family: var(--font-suisse-intl);
          display: flex;
          align-items: center;
        }
        .origin-examples__chip {
          padding: 6px 14px;
          border-radius: 9999px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06);
          color: #fafafa;
          font-size: 13px;
          font-family: var(--font-suisse-intl);
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .origin-examples__chip:hover {
          background: rgba(255,255,255,0.14);
          border-color: rgba(255,255,255,0.2);
        }

        /* ── Updates / Feature cards ── */
        .origin-updates {
          z-index: 4;
          padding: 100px 32px;
          position: relative;
        }

        .origin-3col-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 72px;
        }

        .origin-update-card {
          background-image: linear-gradient(135deg, #2b2b2c, #131313);
          border-radius: 30px;
          padding: 96px 40px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-align: left;
          transition: transform 0.3s;
        }
        .origin-update-card:hover {
          transform: translateY(-4px);
        }

        .origin-product-update-title {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .origin-update-card__title {
          font-family: var(--font-lyon-display);
          font-weight: 300;
          font-size: 24px;
          line-height: 1.1;
          color: #fafafa;
          margin: 0;
        }

        /* ── Sphere / Connect section ── */
        .origin-sphere-section {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 600px;
          padding: 100px 32px;
          position: relative;
          overflow: hidden;
        }

        .origin-sphere-bg {
          position: absolute;
          inset: 0;
          background-image: url("https://cdn.prod.website-files.com/68acbc076b672f730e0c77b9/68af10558a04078593d8f7ce_Group%2048100214.avif");
          background-position: center;
          background-repeat: no-repeat;
          background-size: contain;
          opacity: 0.7;
          pointer-events: none;
        }

        .origin-sphere-center {
          z-index: 1;
          text-align: center;
          max-width: 500px;
          margin: 0 auto;
          position: relative;
        }

        /* ── Testimonials ── */
        .origin-testimonials {
          z-index: 4;
          padding: 100px 32px;
          position: relative;
          overflow: hidden;
        }

        .origin-testimonial-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .origin-quote-card {
          text-align: center;
          border-radius: 30px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          min-height: 440px;
          padding: 32px;
          background-color: #cacaca;
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
        }
        .origin-quote-card--1 {
          background-image: url("https://cdn.prod.website-files.com/68acbc076b672f730e0c77b9/68acd528c25e85a31ee91cea_aea62ac5e3b1a484ce8af496bc9356fd_Frame%201171277260.avif");
        }
        .origin-quote-card--2 {
          background-image: url("https://cdn.prod.website-files.com/68acbc076b672f730e0c77b9/68acd528eff05fd8f147b257_Frame%201171277261.avif");
        }
        .origin-quote-card--3 {
          background-image: url("https://cdn.prod.website-files.com/68acbc076b672f730e0c77b9/68acd5283e22423f13fa59a3_Frame%201171277263.avif");
        }

        .origin-quote-card__stars {
          width: 90px;
          margin-bottom: 20px;
        }

        .origin-quote-card__text {
          font-family: var(--font-suisse-intl);
          font-size: 18px;
          font-weight: 300;
          line-height: 1.5;
          color: #1a1a1a;
          flex: 1;
          display: flex;
          align-items: center;
          margin: 0 0 20px;
        }

        .origin-quote-card__author {
          font-family: var(--font-roboto-mono);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #555;
        }

        /* ── Forecast / CTA section ── */
        .origin-forecast-section {
          padding: 100px 32px;
        }

        .origin-site-wrapper-forecast {
          background-image: linear-gradient(#0f1011, #131d27 18%, #1a4788 37%, #408ac1 69%);
          border-radius: 16px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 124px 5%;
          overflow: hidden;
        }

        .origin-hero-label {
          display: inline-flex;
          backdrop-filter: blur(296px);
          -webkit-backdrop-filter: blur(296px);
          background-image: linear-gradient(rgba(49,44,0,1), rgba(49,44,0,0.24));
          border-radius: 88px;
          max-width: max-content;
          margin: 0 auto 48px;
          padding: 10px 18px;
          box-shadow: inset -0.96px -0.96px 7px rgba(255,255,255,0.15);
        }

        .origin-hero-label-text {
          font-family: var(--font-suisse-intl);
          font-weight: 300;
          font-size: 14px;
          color: #fafafa;
        }

        /* ── Animations ── */
        @keyframes origin-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes origin-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        @keyframes origin-spin {
          to { transform: rotate(360deg); }
        }

        .origin-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #000;
          border-radius: 50%;
          display: inline-block;
          animation: origin-spin 0.7s linear infinite;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0,0,0,0);
          white-space: nowrap;
          border: 0;
        }

        /* ── Responsive ── */
        @media screen and (max-width: 991px) {
          .origin-hero__site-wrapper {
            padding: 160px 32px 60px;
          }
          .origin-track-grid {
            grid-template-columns: 1fr;
          }
          .origin-3col-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media screen and (max-width: 767px) {
          .origin-hero__site-wrapper {
            padding: 140px 20px 40px;
          }
          .origin-intro {
            padding: 60px 20px;
          }
          .origin-updates {
            padding: 60px 20px;
          }
          .origin-testimonials {
            padding: 60px 20px;
          }
          .origin-forecast-section {
            padding: 60px 16px;
          }
          .origin-3col-grid {
            grid-template-columns: 1fr;
          }
          .origin-track-card {
            min-height: 400px;
          }
          .origin-sphere-section {
            min-height: 400px;
            padding: 60px 20px;
          }
          .origin-site-wrapper-forecast {
            padding: 80px 20px;
            border-radius: 12px;
          }
        }

        @media screen and (max-width: 479px) {
          .origin-display-heading {
            font-size: 40px;
          }
          .origin-large-heading {
            font-size: 32px;
          }
          .origin-quote-card {
            min-height: 320px;
          }
        }
      `}</style>
    </div>
  );
}

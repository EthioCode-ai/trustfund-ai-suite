"use client";

import { useState, useEffect, useCallback, use } from "react";
import { DeckData } from "@/lib/tools";
import { themes } from "@/lib/deck-themes";
import { Chart } from "@/components/Chart";
import { ChevronLeft, ChevronRight, X, Grid, Maximize } from "lucide-react";

export default function DeckViewer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [deck, setDeck] = useState<DeckData | null>(null);
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`deck-${id}`);
    if (stored) {
      try {
        setDeck(JSON.parse(stored));
      } catch {
        // invalid data
      }
    }
  }, [id]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!deck) return;
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setCurrent((c) => Math.min(deck.slides.length - 1, c + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrent((c) => Math.max(0, c - 1));
      } else if (e.key === "Escape") {
        if (document.fullscreenElement) document.exitFullscreen();
      }
    },
    [deck]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!deck) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "var(--text-secondary)",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <h2>Deck not found</h2>
        <p style={{ fontSize: "0.9rem" }}>
          Generate a deck from the chat first, then click &quot;Present&quot;.
        </p>
      </div>
    );
  }

  const theme = themes[deck.theme] || themes.investor;
  const slide = deck.slides[current];

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: theme.bg,
        display: "flex",
        flexDirection: "column",
        fontFamily: theme.fontFamily,
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px",
          background: `${theme.titleColor}08`,
          borderBottom: `1px solid ${theme.titleColor}10`,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: "0.8rem", color: theme.textColor, fontWeight: 500 }}>
          {deck.title}
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: `${theme.textColor}80` }}>
            {current + 1} / {deck.slides.length}
          </span>
          <button
            onClick={toggleFullscreen}
            style={{ background: "none", border: "none", cursor: "pointer", color: theme.textColor, display: "flex" }}
          >
            <Maximize size={16} />
          </button>
          <button
            onClick={() => window.close()}
            style={{ background: "none", border: "none", cursor: "pointer", color: theme.textColor, display: "flex" }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Slide area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
          position: "relative",
        }}
      >
        {/* Previous button */}
        <button
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
          style={{
            position: "absolute",
            left: 16,
            background: current === 0 ? "transparent" : `${theme.accentColor}15`,
            border: "none",
            borderRadius: "50%",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: current === 0 ? "default" : "pointer",
            color: current === 0 ? "transparent" : theme.accentColor,
            transition: "all 0.2s",
          }}
        >
          <ChevronLeft size={24} />
        </button>

        {/* Slide content */}
        <div
          key={current}
          style={{
            width: "min(900px, 80vw)",
            background: theme.bgSlide,
            borderRadius: theme.borderRadius,
            padding: "60px 72px",
            minHeight: "min(560px, 70vh)",
            display: "flex",
            flexDirection: "column",
            justifyContent:
              slide.layout === "title" || slide.layout === "closing" || slide.layout === "quote"
                ? "center"
                : "flex-start",
            alignItems:
              slide.layout === "title" || slide.layout === "closing" || slide.layout === "quote"
                ? "center"
                : "flex-start",
            textAlign:
              slide.layout === "title" || slide.layout === "closing" || slide.layout === "quote"
                ? "center"
                : "left",
            boxShadow: "0 8px 48px rgba(0,0,0,0.08)",
            border: `1px solid ${theme.accentColor}10`,
            position: "relative",
            overflow: "hidden",
            animation: "slideIn 0.4s ease-out",
          }}
        >
          {slide.layout !== "title" && slide.layout !== "closing" && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 5,
                background: theme.accentGradient,
              }}
            />
          )}

          {slide.layout === "title" && (
            <>
              <div style={{ width: 80, height: 4, background: theme.accentGradient, borderRadius: 2, marginBottom: 32 }} />
              <h1 style={{ fontSize: "2.8rem", fontWeight: theme.titleFontWeight, color: theme.titleColor, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                {slide.title}
              </h1>
              {slide.subtitle && <p style={{ fontSize: "1.3rem", color: theme.subtitleColor, fontWeight: 500, marginTop: 16 }}>{slide.subtitle}</p>}
            </>
          )}

          {slide.layout === "content" && (
            <>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: theme.titleColor, marginBottom: 28, letterSpacing: "-0.02em" }}>
                {slide.title}
              </h2>
              <ul style={{ listStyle: "none", padding: 0, width: "100%" }}>
                {slide.bullets?.map((b, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 18, fontSize: "1.15rem", color: theme.textColor, lineHeight: 1.6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: theme.bulletColor, marginTop: 8, flexShrink: 0 }} />
                    {b}
                  </li>
                ))}
              </ul>
            </>
          )}

          {slide.layout === "two-column" && (
            <>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: theme.titleColor, marginBottom: 28, width: "100%" }}>
                {slide.title}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, width: "100%" }}>
                <div>
                  {slide.bullets?.map((b, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14, fontSize: "1.05rem", color: theme.textColor, lineHeight: 1.5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.bulletColor, marginTop: 8, flexShrink: 0 }} />
                      {b}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: "1.05rem", color: theme.textColor, lineHeight: 1.6 }}>{slide.notes}</div>
              </div>
            </>
          )}

          {slide.layout === "chart" && (
            <>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: theme.titleColor, marginBottom: 20, width: "100%" }}>
                {slide.title}
              </h2>
              {slide.chartData && <Chart data={slide.chartData} colors={theme.chartColors} />}
            </>
          )}

          {slide.layout === "image" && (
            <>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: theme.titleColor, marginBottom: 20, width: "100%" }}>
                {slide.title}
              </h2>
              {slide.imageUrl ? (
                <img src={slide.imageUrl} alt={slide.title} style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 12, marginBottom: 16 }} />
              ) : (
                <div style={{ width: "100%", height: 260, background: `${theme.accentColor}08`, border: `2px dashed ${theme.accentColor}30`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: theme.subtitleColor, fontSize: "1rem", marginBottom: 16 }}>
                  {slide.imagePrompt || "Image placeholder"}
                </div>
              )}
              {slide.bullets?.map((b, i) => <p key={i} style={{ fontSize: "1.05rem", color: theme.textColor, marginBottom: 8 }}>{b}</p>)}
            </>
          )}

          {slide.layout === "quote" && (
            <>
              <div style={{ fontSize: "4rem", color: theme.accentColor, lineHeight: 1, marginBottom: 20 }}>&ldquo;</div>
              <p style={{ fontSize: "1.4rem", fontStyle: "italic", color: theme.titleColor, maxWidth: 600, lineHeight: 1.6, marginBottom: 20 }}>
                {slide.title}
              </p>
              {slide.subtitle && <p style={{ fontSize: "1rem", color: theme.subtitleColor, fontWeight: 500 }}>{slide.subtitle}</p>}
            </>
          )}

          {slide.layout === "team" && (
            <>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: theme.titleColor, marginBottom: 32, width: "100%" }}>
                {slide.title}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(slide.bullets?.length || 1, 3)}, 1fr)`, gap: 24, width: "100%" }}>
                {slide.bullets?.map((b, i) => {
                  const parts = b.split("—").map((s) => s.trim());
                  return (
                    <div key={i} style={{ textAlign: "center", padding: 20, background: `${theme.accentColor}05`, borderRadius: 12, border: `1px solid ${theme.accentColor}15` }}>
                      <div style={{ width: 56, height: 56, borderRadius: "50%", background: theme.accentGradient, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1.3rem" }}>
                        {parts[0]?.[0] || "?"}
                      </div>
                      <div style={{ fontWeight: 600, color: theme.titleColor, fontSize: "1rem" }}>{parts[0]}</div>
                      {parts[1] && <div style={{ color: theme.subtitleColor, fontSize: "0.85rem", marginTop: 4 }}>{parts[1]}</div>}
                      {parts[2] && <div style={{ color: theme.textColor, fontSize: "0.8rem", marginTop: 6 }}>{parts[2]}</div>}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {slide.layout === "closing" && (
            <>
              <h1 style={{ fontSize: "2.4rem", fontWeight: theme.titleFontWeight, color: theme.titleColor, marginBottom: 16 }}>
                {slide.title}
              </h1>
              {slide.subtitle && <p style={{ fontSize: "1.1rem", color: theme.subtitleColor, marginBottom: 20 }}>{slide.subtitle}</p>}
              {slide.bullets?.map((b, i) => (
                <div key={i} style={{ display: "inline-block", padding: "12px 28px", background: theme.accentGradient, color: "#fff", borderRadius: 10, fontWeight: 600, fontSize: "1.05rem", marginTop: 12 }}>
                  {b}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Next button */}
        <button
          onClick={() => setCurrent(Math.min(deck.slides.length - 1, current + 1))}
          disabled={current === deck.slides.length - 1}
          style={{
            position: "absolute",
            right: 16,
            background: current === deck.slides.length - 1 ? "transparent" : `${theme.accentColor}15`,
            border: "none",
            borderRadius: "50%",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: current === deck.slides.length - 1 ? "default" : "pointer",
            color: current === deck.slides.length - 1 ? "transparent" : theme.accentColor,
            transition: "all 0.2s",
          }}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Bottom slide strip */}
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "10px 40px",
          justifyContent: "center",
          background: `${theme.titleColor}05`,
          borderTop: `1px solid ${theme.titleColor}10`,
          overflowX: "auto",
          flexShrink: 0,
        }}
      >
        {deck.slides.map((s, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              minWidth: 64,
              padding: "6px 10px",
              borderRadius: 8,
              border: i === current ? `2px solid ${theme.accentColor}` : `1px solid ${theme.titleColor}15`,
              background: i === current ? `${theme.accentColor}10` : theme.bgSlide,
              cursor: "pointer",
              fontSize: "0.6rem",
              color: theme.textColor,
              textAlign: "center",
              transition: "all 0.15s",
            }}
          >
            {s.title?.slice(0, 12) || `Slide ${i + 1}`}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

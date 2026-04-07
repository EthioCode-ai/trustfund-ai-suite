"use client";

import { DeckData } from "@/lib/tools";
import { themes, ThemeConfig } from "@/lib/deck-themes";
import { Chart } from "./Chart";
import { Presentation, Download, ExternalLink } from "lucide-react";
import { useState } from "react";

function Slide({
  slide,
  theme,
  index,
  total,
}: {
  slide: DeckData["slides"][0];
  theme: ThemeConfig;
  index: number;
  total: number;
}) {
  // Max 6 bullets, enforce 6x6 rule at render level
  const bullets = slide.bullets?.slice(0, 6) || [];

  return (
    <div
      style={{
        background: theme.bgSlide,
        borderRadius: theme.borderRadius,
        padding: theme.slidePadding,
        minHeight: 420,
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
        position: "relative",
        border: `1px solid ${theme.accentColor}10`,
        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
        overflow: "hidden",
        fontFamily: theme.fontFamily,
      }}
    >
      {/* Subtle accent bar for non-title slides */}
      {slide.layout !== "title" && slide.layout !== "closing" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: theme.accentGradient,
          }}
        />
      )}

      {/* TITLE SLIDE */}
      {slide.layout === "title" && (
        <div style={{ maxWidth: 640 }}>
          <div
            style={{
              width: 60,
              height: 3,
              background: theme.accentGradient,
              borderRadius: 2,
              margin: "0 auto 40px",
            }}
          />
          <h2
            style={{
              fontSize: theme.titleSize,
              fontWeight: theme.headingWeight,
              color: theme.titleColor,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: 20,
            }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p style={{ fontSize: theme.bodySize, color: theme.accentColor, fontWeight: 500, lineHeight: 1.5 }}>
              {slide.subtitle}
            </p>
          )}
        </div>
      )}

      {/* CONTENT SLIDE */}
      {slide.layout === "content" && (
        <>
          <h3
            style={{
              fontSize: theme.headingSize,
              fontWeight: theme.headingWeight,
              color: theme.titleColor,
              marginBottom: theme.contentGap,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            {slide.title}
          </h3>
          <ul style={{ listStyle: "none", padding: 0, width: "100%" }}>
            {bullets.map((b, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  marginBottom: theme.bulletGap,
                  fontSize: theme.bulletSize,
                  color: theme.textColor,
                  lineHeight: 1.6,
                  fontWeight: theme.bodyWeight,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: theme.accentColor,
                    marginTop: 8,
                    flexShrink: 0,
                    opacity: 0.8,
                  }}
                />
                {b}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* TWO-COLUMN */}
      {slide.layout === "two-column" && (
        <>
          <h3
            style={{
              fontSize: theme.headingSize,
              fontWeight: theme.headingWeight,
              color: theme.titleColor,
              marginBottom: theme.contentGap,
              width: "100%",
              lineHeight: 1.2,
            }}
          >
            {slide.title}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, width: "100%" }}>
            <div>
              {bullets.map((b, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: theme.bulletGap,
                    fontSize: theme.bulletSize,
                    color: theme.textColor,
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: theme.accentColor, marginTop: 9, flexShrink: 0 }} />
                  {b}
                </div>
              ))}
            </div>
            <div style={{ fontSize: theme.bodySize, color: theme.textColor, lineHeight: 1.7 }}>
              {slide.notes}
            </div>
          </div>
        </>
      )}

      {/* CHART SLIDE */}
      {slide.layout === "chart" && (
        <>
          <h3
            style={{
              fontSize: theme.headingSize,
              fontWeight: theme.headingWeight,
              color: theme.titleColor,
              marginBottom: 24,
              width: "100%",
              lineHeight: 1.2,
            }}
          >
            {slide.title}
          </h3>
          <div style={{ width: "100%", flex: 1, display: "flex", alignItems: "center" }}>
            {slide.chartData && <Chart data={slide.chartData} colors={theme.chartColors} />}
          </div>
        </>
      )}

      {/* IMAGE SLIDE */}
      {slide.layout === "image" && (
        <>
          <h3
            style={{
              fontSize: theme.headingSize,
              fontWeight: theme.headingWeight,
              color: theme.titleColor,
              marginBottom: 24,
              width: "100%",
            }}
          >
            {slide.title}
          </h3>
          {slide.imageUrl ? (
            <img
              src={slide.imageUrl}
              alt={slide.title}
              style={{ width: "100%", maxHeight: 280, objectFit: "cover", borderRadius: 12, marginBottom: 20 }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: 240,
                background: `${theme.accentColor}06`,
                border: `1.5px dashed ${theme.accentColor}25`,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.mutedColor,
                fontSize: theme.captionSize,
                marginBottom: 20,
              }}
            >
              {slide.imagePrompt || "Visual placeholder"}
            </div>
          )}
          {bullets.slice(0, 3).map((b, i) => (
            <p key={i} style={{ fontSize: theme.bodySize, color: theme.textColor, marginBottom: 8, lineHeight: 1.6 }}>
              {b}
            </p>
          ))}
        </>
      )}

      {/* QUOTE */}
      {slide.layout === "quote" && (
        <div style={{ maxWidth: 560, padding: "20px 0" }}>
          <div style={{ fontSize: "3.5rem", color: theme.accentColor, lineHeight: 1, marginBottom: 24, opacity: 0.6 }}>&ldquo;</div>
          <p
            style={{
              fontSize: "1.3rem",
              fontStyle: "italic",
              color: theme.titleColor,
              lineHeight: 1.7,
              marginBottom: 24,
              fontWeight: 400,
            }}
          >
            {slide.title}
          </p>
          {slide.subtitle && (
            <p style={{ fontSize: theme.captionSize, color: theme.accentColor, fontWeight: 600, letterSpacing: "0.02em" }}>
              {slide.subtitle}
            </p>
          )}
        </div>
      )}

      {/* TEAM */}
      {slide.layout === "team" && (
        <>
          <h3
            style={{
              fontSize: theme.headingSize,
              fontWeight: theme.headingWeight,
              color: theme.titleColor,
              marginBottom: 36,
              width: "100%",
            }}
          >
            {slide.title}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(bullets.length, 3)}, 1fr)`, gap: 28, width: "100%" }}>
            {bullets.map((b, i) => {
              const parts = b.split("—").map((s) => s.trim());
              return (
                <div
                  key={i}
                  style={{
                    textAlign: "center",
                    padding: "28px 20px",
                    background: `${theme.accentColor}04`,
                    borderRadius: theme.borderRadius,
                    border: `1px solid ${theme.accentColor}10`,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: theme.accentGradient,
                      margin: "0 auto 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1.3rem",
                    }}
                  >
                    {parts[0]?.[0] || "?"}
                  </div>
                  <div style={{ fontWeight: 600, color: theme.titleColor, fontSize: theme.bodySize, marginBottom: 4 }}>
                    {parts[0]}
                  </div>
                  {parts[1] && (
                    <div style={{ color: theme.accentColor, fontSize: theme.captionSize, fontWeight: 500, marginBottom: 6 }}>
                      {parts[1]}
                    </div>
                  )}
                  {parts[2] && (
                    <div style={{ color: theme.mutedColor, fontSize: theme.captionSize, lineHeight: 1.5 }}>
                      {parts[2]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* CLOSING */}
      {slide.layout === "closing" && (
        <div style={{ maxWidth: 560 }}>
          <h2
            style={{
              fontSize: theme.titleSize,
              fontWeight: theme.headingWeight,
              color: theme.titleColor,
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p style={{ fontSize: theme.bodySize, color: theme.mutedColor, marginBottom: 28 }}>
              {slide.subtitle}
            </p>
          )}
          {bullets.slice(0, 2).map((b, i) => (
            <div
              key={i}
              style={{
                display: "inline-block",
                padding: "14px 32px",
                background: theme.accentGradient,
                color: "#fff",
                borderRadius: 10,
                fontWeight: 600,
                fontSize: theme.bodySize,
                marginTop: 8,
              }}
            >
              {b}
            </div>
          ))}
        </div>
      )}

      {/* Slide number — subtle */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          right: 20,
          fontSize: "0.7rem",
          color: theme.mutedColor,
          opacity: 0.5,
        }}
      >
        {index + 1} / {total}
      </div>
    </div>
  );
}

function getTheme(name: string): ThemeConfig {
  return themes[name] || themes.investor;
}

export function SlidePreview({ deck }: { deck: DeckData }) {
  const theme = getTheme(deck.theme);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel");

  const handleExportHTML = () => {
    const htmlContent = generateExportHTML(deck, theme);
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${deck.title.replace(/\s+/g, "-").toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ margin: "12px 0", borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)" }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "var(--bg-tertiary)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Presentation size={16} style={{ color: theme.accentColor }} />
          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{deck.title}</span>
          <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
            {deck.slides.length} slides
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setViewMode(viewMode === "carousel" ? "grid" : "carousel")}
            style={{
              fontSize: "0.7rem",
              padding: "4px 10px",
              borderRadius: 6,
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            {viewMode === "carousel" ? "Grid View" : "Slide View"}
          </button>
          <button
            onClick={() => {
              sessionStorage.setItem(`deck-${deck.id}`, JSON.stringify(deck));
              window.open(`/deck/${deck.id}`, "_blank");
            }}
            style={{
              fontSize: "0.7rem",
              padding: "4px 10px",
              borderRadius: 6,
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <ExternalLink size={12} /> Present
          </button>
          <button
            onClick={handleExportHTML}
            style={{
              fontSize: "0.7rem",
              padding: "4px 10px",
              borderRadius: 6,
              background: theme.accentColor,
              border: "none",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Download size={12} /> Export
          </button>
        </div>
      </div>

      {/* Carousel */}
      {viewMode === "carousel" && (
        <div style={{ background: theme.bg, padding: 28 }}>
          <Slide slide={deck.slides[currentSlide]} theme={theme} index={currentSlide} total={deck.slides.length} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 20 }}>
            <button
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              style={{
                padding: "6px 16px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg-secondary)",
                color: currentSlide === 0 ? "var(--text-secondary)" : "var(--text-primary)",
                cursor: currentSlide === 0 ? "not-allowed" : "pointer",
                fontSize: "0.8rem",
              }}
            >
              ← Prev
            </button>
            <div style={{ display: "flex", gap: 4 }}>
              {deck.slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  style={{
                    width: i === currentSlide ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    border: "none",
                    background: i === currentSlide ? theme.accentColor : `${theme.accentColor}30`,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentSlide(Math.min(deck.slides.length - 1, currentSlide + 1))}
              disabled={currentSlide === deck.slides.length - 1}
              style={{
                padding: "6px 16px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg-secondary)",
                color: currentSlide === deck.slides.length - 1 ? "var(--text-secondary)" : "var(--text-primary)",
                cursor: currentSlide === deck.slides.length - 1 ? "not-allowed" : "pointer",
                fontSize: "0.8rem",
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {viewMode === "grid" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
            padding: 28,
            background: theme.bg,
          }}
        >
          {deck.slides.map((slide, i) => (
            <div
              key={i}
              onClick={() => { setCurrentSlide(i); setViewMode("carousel"); }}
              style={{ cursor: "pointer", transition: "transform 0.2s" }}
            >
              <Slide slide={slide} theme={theme} index={i} total={deck.slides.length} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function generateExportHTML(deck: DeckData, theme: ThemeConfig): string {
  const slidesHTML = deck.slides
    .map((slide, i) => {
      const bullets = slide.bullets?.slice(0, 6) || [];
      let content = "";

      if (slide.layout === "title") {
        content = `<div class="slide slide-center"><div class="accent-bar-center"></div><h1>${slide.title}</h1>${slide.subtitle ? `<p class="subtitle">${slide.subtitle}</p>` : ""}</div>`;
      } else if (slide.layout === "content") {
        const lis = bullets.map((b) => `<li><span class="bullet"></span>${b}</li>`).join("");
        content = `<div class="slide"><div class="accent-bar"></div><h2>${slide.title}</h2><ul>${lis}</ul></div>`;
      } else if (slide.layout === "closing") {
        const ctas = bullets.slice(0, 2).map((b) => `<div class="cta">${b}</div>`).join("");
        content = `<div class="slide slide-center"><h1>${slide.title}</h1>${slide.subtitle ? `<p class="subtitle">${slide.subtitle}</p>` : ""}${ctas}</div>`;
      } else if (slide.layout === "quote") {
        content = `<div class="slide slide-center"><div class="quote-mark">&ldquo;</div><p class="quote-text">${slide.title}</p>${slide.subtitle ? `<p class="quote-author">${slide.subtitle}</p>` : ""}</div>`;
      } else {
        const lis = bullets.map((b) => `<li><span class="bullet"></span>${b}</li>`).join("");
        content = `<div class="slide"><div class="accent-bar"></div><h2>${slide.title}</h2>${lis ? `<ul>${lis}</ul>` : ""}${slide.notes ? `<p class="body-text">${slide.notes}</p>` : ""}</div>`;
      }
      content += `<div class="slide-num">${i + 1} / ${deck.slides.length}</div>`;
      return content;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${deck.title}</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: ${theme.fontFamily}; background: ${theme.bg}; }
.slide { background: ${theme.bgSlide}; padding: ${theme.slidePadding}; min-height: 100vh; display: flex; flex-direction: column; justify-content: flex-start; position: relative; page-break-after: always; }
.slide-center { justify-content: center; align-items: center; text-align: center; }
h1 { font-size: ${theme.titleSize}; font-weight: ${theme.headingWeight}; color: ${theme.titleColor}; letter-spacing: -0.03em; line-height: 1.15; margin-bottom: 20px; }
h2 { font-size: ${theme.headingSize}; font-weight: ${theme.headingWeight}; color: ${theme.titleColor}; margin-bottom: ${theme.contentGap}; letter-spacing: -0.02em; line-height: 1.2; }
.subtitle { font-size: ${theme.bodySize}; color: ${theme.accentColor}; font-weight: 500; }
.body-text { font-size: ${theme.bodySize}; color: ${theme.textColor}; line-height: 1.7; }
ul { list-style: none; padding: 0; }
li { display: flex; align-items: flex-start; gap: 16px; margin-bottom: ${theme.bulletGap}; font-size: ${theme.bulletSize}; color: ${theme.textColor}; line-height: 1.6; font-weight: ${theme.bodyWeight}; }
.bullet { width: 8px; height: 8px; border-radius: 50%; background: ${theme.accentColor}; margin-top: 8px; flex-shrink: 0; opacity: 0.8; display: inline-block; }
.accent-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: ${theme.accentGradient}; }
.accent-bar-center { width: 60px; height: 3px; background: ${theme.accentGradient}; border-radius: 2px; margin: 0 auto 40px; }
.cta { display: inline-block; padding: 14px 32px; background: ${theme.accentGradient}; color: #fff; border-radius: 10px; font-weight: 600; font-size: ${theme.bodySize}; margin-top: 16px; }
.quote-mark { font-size: 3.5rem; color: ${theme.accentColor}; opacity: 0.6; margin-bottom: 24px; }
.quote-text { font-size: 1.3rem; font-style: italic; color: ${theme.titleColor}; max-width: 560px; line-height: 1.7; margin-bottom: 24px; }
.quote-author { font-size: ${theme.captionSize}; color: ${theme.accentColor}; font-weight: 600; }
.slide-num { position: absolute; bottom: 16px; right: 20px; font-size: 0.7rem; color: ${theme.mutedColor}; opacity: 0.5; }
@media print { .slide { min-height: 100vh; } }
</style>
</head>
<body>
${slidesHTML}
</body>
</html>`;
}

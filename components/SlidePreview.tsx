"use client";

import { DeckData } from "@/lib/tools";
import { themes } from "@/lib/deck-themes";
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
  theme: ReturnType<typeof getTheme>;
  index: number;
  total: number;
}) {
  return (
    <div
      style={{
        background: theme.bgSlide,
        borderRadius: theme.borderRadius,
        padding: "40px 48px",
        minHeight: 360,
        display: "flex",
        flexDirection: "column",
        justifyContent: slide.layout === "title" || slide.layout === "closing" ? "center" : "flex-start",
        alignItems: slide.layout === "title" || slide.layout === "closing" ? "center" : "flex-start",
        textAlign: slide.layout === "title" || slide.layout === "closing" ? "center" : "left",
        position: "relative",
        border: `1px solid ${theme.accentColor}15`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      {/* Accent bar */}
      {slide.layout !== "title" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: theme.accentGradient,
          }}
        />
      )}

      {/* Title slide */}
      {slide.layout === "title" && (
        <>
          <div
            style={{
              width: 80,
              height: 4,
              background: theme.accentGradient,
              borderRadius: 2,
              marginBottom: 24,
            }}
          />
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: theme.titleFontWeight,
              color: theme.titleColor,
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p style={{ fontSize: "1.1rem", color: theme.subtitleColor, fontWeight: 500 }}>
              {slide.subtitle}
            </p>
          )}
        </>
      )}

      {/* Content slide */}
      {slide.layout === "content" && (
        <>
          <h3
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              color: theme.titleColor,
              marginBottom: 20,
              letterSpacing: "-0.02em",
            }}
          >
            {slide.title}
          </h3>
          {slide.bullets && (
            <ul style={{ listStyle: "none", padding: 0, width: "100%" }}>
              {slide.bullets.map((b, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 14,
                    fontSize: "0.95rem",
                    color: theme.textColor,
                    lineHeight: 1.6,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: theme.bulletColor,
                      marginTop: 7,
                      flexShrink: 0,
                    }}
                  />
                  {b}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* Two column */}
      {slide.layout === "two-column" && (
        <>
          <h3
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              color: theme.titleColor,
              marginBottom: 20,
              width: "100%",
            }}
          >
            {slide.title}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, width: "100%" }}>
            <div>
              {slide.bullets?.map((b, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 12,
                    fontSize: "0.9rem",
                    color: theme.textColor,
                    lineHeight: 1.5,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: theme.bulletColor,
                      marginTop: 7,
                      flexShrink: 0,
                    }}
                  />
                  {b}
                </div>
              ))}
            </div>
            <div style={{ fontSize: "0.9rem", color: theme.textColor, lineHeight: 1.6 }}>
              {slide.notes}
            </div>
          </div>
        </>
      )}

      {/* Chart slide */}
      {slide.layout === "chart" && (
        <>
          <h3
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              color: theme.titleColor,
              marginBottom: 16,
              width: "100%",
            }}
          >
            {slide.title}
          </h3>
          {slide.chartData && <Chart data={slide.chartData} colors={theme.chartColors} />}
        </>
      )}

      {/* Image slide */}
      {slide.layout === "image" && (
        <>
          <h3
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              color: theme.titleColor,
              marginBottom: 16,
              width: "100%",
            }}
          >
            {slide.title}
          </h3>
          {slide.imageUrl ? (
            <img
              src={slide.imageUrl}
              alt={slide.title}
              style={{ width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 12, marginBottom: 12 }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: 200,
                background: `${theme.accentColor}08`,
                border: `2px dashed ${theme.accentColor}30`,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.subtitleColor,
                fontSize: "0.85rem",
                marginBottom: 12,
              }}
            >
              {slide.imagePrompt || "Image placeholder"}
            </div>
          )}
          {slide.bullets?.map((b, i) => (
            <p key={i} style={{ fontSize: "0.9rem", color: theme.textColor, marginBottom: 6 }}>
              {b}
            </p>
          ))}
        </>
      )}

      {/* Quote */}
      {slide.layout === "quote" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
          <div style={{ fontSize: "3rem", color: theme.accentColor, lineHeight: 1, marginBottom: 16 }}>&ldquo;</div>
          <p
            style={{
              fontSize: "1.2rem",
              fontStyle: "italic",
              color: theme.titleColor,
              maxWidth: 500,
              textAlign: "center",
              lineHeight: 1.6,
              marginBottom: 16,
            }}
          >
            {slide.title}
          </p>
          {slide.subtitle && (
            <p style={{ fontSize: "0.9rem", color: theme.subtitleColor, fontWeight: 500 }}>
              {slide.subtitle}
            </p>
          )}
        </div>
      )}

      {/* Team */}
      {slide.layout === "team" && (
        <>
          <h3
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              color: theme.titleColor,
              marginBottom: 24,
              width: "100%",
            }}
          >
            {slide.title}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(slide.bullets?.length || 1, 3)}, 1fr)`, gap: 20, width: "100%" }}>
            {slide.bullets?.map((b, i) => {
              const parts = b.split("—").map((s) => s.trim());
              return (
                <div
                  key={i}
                  style={{
                    textAlign: "center",
                    padding: 16,
                    background: `${theme.accentColor}05`,
                    borderRadius: 12,
                    border: `1px solid ${theme.accentColor}15`,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: theme.accentGradient,
                      margin: "0 auto 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                    }}
                  >
                    {parts[0]?.[0] || "?"}
                  </div>
                  <div style={{ fontWeight: 600, color: theme.titleColor, fontSize: "0.9rem" }}>
                    {parts[0]}
                  </div>
                  {parts[1] && (
                    <div style={{ color: theme.subtitleColor, fontSize: "0.8rem", marginTop: 2 }}>
                      {parts[1]}
                    </div>
                  )}
                  {parts[2] && (
                    <div style={{ color: theme.textColor, fontSize: "0.75rem", marginTop: 4 }}>
                      {parts[2]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Closing */}
      {slide.layout === "closing" && (
        <>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: theme.titleFontWeight,
              color: theme.titleColor,
              marginBottom: 12,
            }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p style={{ fontSize: "1rem", color: theme.subtitleColor, marginBottom: 16 }}>
              {slide.subtitle}
            </p>
          )}
          {slide.bullets?.map((b, i) => (
            <div
              key={i}
              style={{
                display: "inline-block",
                padding: "10px 24px",
                background: theme.accentGradient,
                color: "#fff",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: "0.95rem",
                marginTop: 8,
              }}
            >
              {b}
            </div>
          ))}
        </>
      )}

      {/* Slide number */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 16,
          fontSize: "0.65rem",
          color: `${theme.textColor}60`,
        }}
      >
        {index + 1} / {total}
      </div>
    </div>
  );
}

function getTheme(name: string) {
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
            onClick={() => window.open(`/deck/${deck.id}`, "_blank")}
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

      {/* Carousel view */}
      {viewMode === "carousel" && (
        <div style={{ background: theme.bg, padding: 24 }}>
          <Slide
            slide={deck.slides[currentSlide]}
            theme={theme}
            index={currentSlide}
            total={deck.slides.length}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16 }}>
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

      {/* Grid view */}
      {viewMode === "grid" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
            padding: 24,
            background: theme.bg,
          }}
        >
          {deck.slides.map((slide, i) => (
            <div
              key={i}
              onClick={() => {
                setCurrentSlide(i);
                setViewMode("carousel");
              }}
              style={{ cursor: "pointer", transform: "scale(0.95)", transition: "transform 0.2s" }}
            >
              <Slide slide={slide} theme={theme} index={i} total={deck.slides.length} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function generateExportHTML(deck: DeckData, theme: ReturnType<typeof getTheme>): string {
  const slidesHTML = deck.slides
    .map((slide, i) => {
      let content = "";
      if (slide.layout === "title") {
        content = `<div class="slide slide-title"><div class="accent-bar-center"></div><h1>${slide.title}</h1>${slide.subtitle ? `<p class="subtitle">${slide.subtitle}</p>` : ""}</div>`;
      } else if (slide.layout === "content") {
        const bullets = slide.bullets?.map((b) => `<li>${b}</li>`).join("") || "";
        content = `<div class="slide"><div class="accent-bar"></div><h2>${slide.title}</h2><ul>${bullets}</ul></div>`;
      } else if (slide.layout === "closing") {
        const ctas = slide.bullets?.map((b) => `<div class="cta">${b}</div>`).join("") || "";
        content = `<div class="slide slide-title"><h1>${slide.title}</h1>${slide.subtitle ? `<p class="subtitle">${slide.subtitle}</p>` : ""}${ctas}</div>`;
      } else {
        const bullets = slide.bullets?.map((b) => `<li>${b}</li>`).join("") || "";
        content = `<div class="slide"><div class="accent-bar"></div><h2>${slide.title}</h2>${bullets ? `<ul>${bullets}</ul>` : ""}${slide.notes ? `<p>${slide.notes}</p>` : ""}</div>`;
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
.slide { background: ${theme.bgSlide}; padding: 60px 80px; min-height: 100vh; display: flex; flex-direction: column; justify-content: flex-start; position: relative; page-break-after: always; border-bottom: 1px solid #eee; }
.slide-title { justify-content: center; align-items: center; text-align: center; }
h1 { font-size: 3rem; font-weight: ${theme.titleFontWeight}; color: ${theme.titleColor}; letter-spacing: -0.03em; margin-bottom: 16px; }
h2 { font-size: 2rem; font-weight: 700; color: ${theme.titleColor}; margin-bottom: 32px; }
.subtitle { font-size: 1.3rem; color: ${theme.subtitleColor}; font-weight: 500; }
ul { list-style: none; padding: 0; }
li { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px; font-size: 1.2rem; color: ${theme.textColor}; line-height: 1.6; }
li::before { content: ""; width: 10px; height: 10px; border-radius: 50%; background: ${theme.bulletColor}; margin-top: 8px; flex-shrink: 0; }
.accent-bar { position: absolute; top: 0; left: 0; right: 0; height: 6px; background: ${theme.accentGradient}; }
.accent-bar-center { width: 100px; height: 6px; background: ${theme.accentGradient}; border-radius: 3px; margin-bottom: 32px; }
.cta { display: inline-block; padding: 14px 32px; background: ${theme.accentGradient}; color: #fff; border-radius: 10px; font-weight: 600; font-size: 1.1rem; margin-top: 24px; }
.slide-num { position: absolute; bottom: 20px; right: 30px; font-size: 0.8rem; color: #999; }
p { font-size: 1.1rem; color: ${theme.textColor}; line-height: 1.6; }
@media print { .slide { min-height: 100vh; } }
</style>
</head>
<body>
${slidesHTML}
</body>
</html>`;
}

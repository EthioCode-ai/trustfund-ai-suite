"use client";

import { useState } from "react";
import { Calendar, Download, ExternalLink, Clock, MapPin, Users } from "lucide-react";

interface CalendarEventProps {
  title: string;
  description?: string;
  startDate: string;
  startTime: string;
  endTime?: string;
  location?: string;
  attendees?: string[];
}

export function CalendarEvent(props: CalendarEventProps) {
  const [loading, setLoading] = useState(false);
  const [googleUrl, setGoogleUrl] = useState<string | null>(null);
  const [icsData, setIcsData] = useState<string | null>(null);

  const generate = async () => {
    if (googleUrl) return;
    setLoading(true);
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(props),
      });
      const data = await res.json();
      setGoogleUrl(data.googleCalUrl);
      setIcsData(data.icsContent);
    } catch {
      // failed
    } finally {
      setLoading(false);
    }
  };

  const downloadICS = () => {
    if (!icsData) return;
    const blob = new Blob([icsData], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${props.title.replace(/\s+/g, "-").toLowerCase()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 16,
        margin: "8px 0",
        borderLeft: "4px solid #6366f1",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Calendar size={16} style={{ color: "#6366f1" }} />
        <span style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.95rem" }}>
          {props.title}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.85rem", color: "#475569", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Clock size={13} />
          {props.startDate} at {props.startTime}{props.endTime ? ` — ${props.endTime}` : ""}
        </div>
        {props.location && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MapPin size={13} />
            {props.location}
          </div>
        )}
        {props.attendees && props.attendees.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Users size={13} />
            {props.attendees.join(", ")}
          </div>
        )}
        {props.description && (
          <p style={{ marginTop: 4, color: "#64748b", fontSize: "0.8rem" }}>{props.description}</p>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {!googleUrl ? (
          <button
            onClick={generate}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 8,
              border: "none",
              background: "#6366f1",
              color: "#fff",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            <Calendar size={13} />
            {loading ? "Generating..." : "Create Event"}
          </button>
        ) : (
          <>
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 8,
                border: "none",
                background: "#6366f1",
                color: "#fff",
                fontSize: "0.78rem",
                fontWeight: 600,
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              <ExternalLink size={13} />
              Add to Google Calendar
            </a>
            <button
              onClick={downloadICS}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: "#fff",
                color: "#475569",
                fontSize: "0.78rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <Download size={13} />
              Download .ics
            </button>
          </>
        )}
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { title, description, startDate, startTime, endTime, location, attendees } = await req.json();

  try {
    const start = formatICSDate(startDate, startTime);
    const end = formatICSDate(startDate, endTime || addHour(startTime));
    const uid = `${Date.now()}@neuromart.ai`;
    const now = formatICSDateNow();

    const attendeeLines = (attendees || [])
      .map((email: string) => `ATTENDEE;RSVP=TRUE:mailto:${email}`)
      .join("\r\n");

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Neuromart.ai//ExecSuite//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeICS(title)}`,
      `DESCRIPTION:${escapeICS(description || "")}`,
      location ? `LOCATION:${escapeICS(location)}` : "",
      attendeeLines,
      "STATUS:CONFIRMED",
      `ORGANIZER;CN=Neuromart.ai ExecSuite:mailto:${process.env.SENDER_EMAIL || "exec@neuromart.ai"}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT15M",
      "ACTION:DISPLAY",
      `DESCRIPTION:Reminder: ${escapeICS(title)}`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .filter(Boolean)
      .join("\r\n");

    // Google Calendar link
    const googleParams = new URLSearchParams({
      action: "TEMPLATE",
      text: title,
      dates: `${start}/${end}`,
      details: description || "",
      location: location || "",
    });
    if (attendees?.length) {
      googleParams.set("add", attendees.join(","));
    }
    const googleCalUrl = `https://calendar.google.com/calendar/render?${googleParams.toString()}`;

    return NextResponse.json({
      icsContent,
      googleCalUrl,
      event: { title, description, startDate, startTime, endTime, location, attendees },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Calendar event creation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function formatICSDate(date: string, time: string): string {
  const d = date.replace(/-/g, "");
  const t = time.replace(/:/g, "") + "00";
  return `${d}T${t}`;
}

function formatICSDateNow(): string {
  const now = new Date();
  return now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function addHour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function escapeICS(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

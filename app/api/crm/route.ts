import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), ".data");
const CRM_FILE = join(DATA_DIR, "investors.json");

export interface Investor {
  id: string;
  name: string;
  firm: string;
  email?: string;
  phone?: string;
  stage: "prospect" | "outreach" | "meeting" | "due-diligence" | "term-sheet" | "closed" | "passed";
  notes: string[];
  lastContact?: string;
  nextFollowUp?: string;
  verticalInterest?: string[];
  createdAt: string;
  updatedAt: string;
}

async function loadInvestors(): Promise<Investor[]> {
  try {
    const data = await readFile(CRM_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveInvestors(investors: Investor[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(CRM_FILE, JSON.stringify(investors, null, 2));
}

export async function GET() {
  const investors = await loadInvestors();
  return NextResponse.json({ investors });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  const investors = await loadInvestors();

  if (action === "add") {
    const investor: Investor = {
      id: Date.now().toString(),
      name: body.name,
      firm: body.firm,
      email: body.email,
      phone: body.phone,
      stage: body.stage || "prospect",
      notes: body.notes ? [body.notes] : [],
      lastContact: body.lastContact,
      nextFollowUp: body.nextFollowUp,
      verticalInterest: body.verticalInterest,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    investors.push(investor);
    await saveInvestors(investors);
    return NextResponse.json({ success: true, investor });
  }

  if (action === "update") {
    const idx = investors.findIndex((i) => i.id === body.id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (body.stage) investors[idx].stage = body.stage;
    if (body.notes) investors[idx].notes.push(body.notes);
    if (body.lastContact) investors[idx].lastContact = body.lastContact;
    if (body.nextFollowUp) investors[idx].nextFollowUp = body.nextFollowUp;
    if (body.email) investors[idx].email = body.email;
    if (body.phone) investors[idx].phone = body.phone;
    if (body.verticalInterest) investors[idx].verticalInterest = body.verticalInterest;
    investors[idx].updatedAt = new Date().toISOString();

    await saveInvestors(investors);
    return NextResponse.json({ success: true, investor: investors[idx] });
  }

  if (action === "delete") {
    const filtered = investors.filter((i) => i.id !== body.id);
    await saveInvestors(filtered);
    return NextResponse.json({ success: true });
  }

  if (action === "summary") {
    const stages = {
      prospect: investors.filter((i) => i.stage === "prospect").length,
      outreach: investors.filter((i) => i.stage === "outreach").length,
      meeting: investors.filter((i) => i.stage === "meeting").length,
      "due-diligence": investors.filter((i) => i.stage === "due-diligence").length,
      "term-sheet": investors.filter((i) => i.stage === "term-sheet").length,
      closed: investors.filter((i) => i.stage === "closed").length,
      passed: investors.filter((i) => i.stage === "passed").length,
    };
    const followUps = investors
      .filter((i) => i.nextFollowUp && new Date(i.nextFollowUp) <= new Date(Date.now() + 7 * 86400000))
      .map((i) => ({ name: i.name, firm: i.firm, date: i.nextFollowUp, stage: i.stage }));

    return NextResponse.json({ total: investors.length, stages, upcomingFollowUps: followUps });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

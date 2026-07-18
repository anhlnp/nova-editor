// Public API route — no auth required.
// Returns the hardcoded demo WebstudioData so /builder/demo works without a session.
import { NextResponse } from "next/server";
import { getDemoProjectJson } from "@/lib/demo-data";

export async function GET() {
  return NextResponse.json(getDemoProjectJson());
}

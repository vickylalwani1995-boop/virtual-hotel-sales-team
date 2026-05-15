import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export const dynamic = "force-dynamic"

export async function GET() {
  const filePath = path.join(process.cwd(), "sample-data", "backyard-scan-results.json")
  const raw = await fs.readFile(filePath, "utf-8")
  return new NextResponse(raw, {
    headers: { "Content-Type": "application/json" },
  })
}

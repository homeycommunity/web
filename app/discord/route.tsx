import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export const GET = () => {
  return NextResponse.redirect("https://discord.gg/wbVGSCByUu")
}

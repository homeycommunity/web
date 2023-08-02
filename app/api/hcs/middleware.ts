import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  // retrieve the current response
  const res = NextResponse.next()
  // set a header on the response
  res.headers.append("Access-Control-Allow-Credentials", "true")
  res.headers.append("Access-Control-Allow-Origin", "*")
  res.headers.append("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.headers.append(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Authorization"
  )

  // return the response to continue processing
  return res
}

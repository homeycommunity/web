"use client"

import Link from "next/link"
import { signIn } from "next-auth/react"

export default function SignIn() {
  return (
    <Link href="#" onClick={() => signIn("zitadel")}>
      Sign in
    </Link>
  )
}

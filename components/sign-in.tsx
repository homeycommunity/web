"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignIn () {
  return <Link href="#" onClick={() => signIn('authentik')}>Sign in</Link>
}

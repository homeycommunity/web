"use client"

import Link from "next/link"
import { LogIn } from "lucide-react"
import { signIn } from "next-auth/react"

import { buttonVariants } from "./ui/button"

export default function SignIn() {
  return (
    <Link
      href="#"
      onClick={() => signIn("logto")}
      className={buttonVariants({
        size: "sm",
        variant: "ghost",
        className:
          "rounded-full text-sm font-medium hover:bg-primary/10 transition-colors h-10 px-3 gap-3",
      })}
    >
      <LogIn className="h-6 w-6" />
      <span className="hidden sm:inline-block">Sign in</span>
    </Link>
  )
}

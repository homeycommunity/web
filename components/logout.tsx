"use client"

import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

import { DropdownMenuItem } from "./ui/dropdown-menu"

export default function Logout() {
  return (
    <DropdownMenuItem
      onClick={() => signOut()}
      className="cursor-pointer text-red-500 hover:text-red-500 focus:text-red-500 rounded-lg hover:bg-primary/10 transition-colors py-2.5 px-3 gap-3"
    >
      <LogOut className="h-5 w-5" />
      <span>Logout</span>
    </DropdownMenuItem>
  )
}

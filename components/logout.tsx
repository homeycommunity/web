"use client"

import { signOut } from "next-auth/react"

import { DropdownMenuItem } from "./ui/dropdown-menu"

export default function Logout() {
  return (
    <DropdownMenuItem
      onClick={() => {
        signOut()
      }}
    >
      Logout
    </DropdownMenuItem>
  )
}

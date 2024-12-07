"use client"

import { useRouter } from "next/navigation"
import { PlusCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export const AppPlus = () => {
  const router = useRouter()
  return (
    <Button
      className="ml-2"
      variant="teal"
      size="icon"
      onClick={(e) => {
        e.stopPropagation()
        router.push("/control/apps/new")
      }}
    >
      <PlusCircleIcon className="h-5 w-5" />
    </Button>
  )
}

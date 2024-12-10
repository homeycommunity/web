"use client"

import { useRouter } from "next/navigation"
import { Button } from "components/ui/button"
import { PlusCircleIcon } from "lucide-react"

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
      <PlusCircleIcon className="size-5" />
    </Button>
  )
}

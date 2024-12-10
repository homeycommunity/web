"use client"

import { useRouter } from "next/navigation"
import { BlocksIcon, Key, User, UserCog } from "lucide-react"

import Logout from "./logout"
import { buttonVariants } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

interface SessionMenuProps {
  session: {
    name?: string | null
  }
}

export const SessionMenu = ({ session }: SessionMenuProps) => {
  const router = useRouter()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={buttonVariants({
          size: "sm",
          variant: "ghost",
          className:
            "rounded-full text-sm font-medium hover:bg-primary/10 transition-colors h-10 px-3 gap-3",
        })}
      >
        <User className="h-6 w-6" />
        <span className="hidden sm:inline-block max-w-[100px] truncate">
          {session?.name || "Account"}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 mt-2 rounded-xl border border-primary/10 bg-primary/5 backdrop-blur-lg"
        sideOffset={8}
      >
        <DropdownMenuItem
          onClick={() => router.push("/control/settings/profile")}
          className="cursor-pointer rounded-lg hover:bg-primary/10 transition-colors py-2.5 px-3"
        >
          <UserCog className="h-4 w-4 mr-2" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/control/apps")}
          className="cursor-pointer rounded-lg hover:bg-primary/10 transition-colors py-2.5 px-3"
        >
          <BlocksIcon className="h-4 w-4 mr-2" />
          My Apps
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/control/settings/api-keys")}
          className="cursor-pointer rounded-lg hover:bg-primary/10 transition-colors py-2.5 px-3"
        >
          <Key className="h-4 w-4 mr-2" />
          API Keys
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-primary/10" />
        <Logout />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { buttonVariants } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={buttonVariants({
          size: "sm",
          variant: "ghost",
          className:
            "w-10 h-10 p-0 rounded-full hover:bg-primary/10 transition-colors",
        })}
      >
        <Sun className="h-6 w-6 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="rounded-xl border border-primary/10 bg-primary/5 backdrop-blur-lg"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center gap-3 text-sm cursor-pointer rounded-lg hover:bg-primary/10 transition-colors py-2.5 px-3"
        >
          <Sun className="h-5 w-5" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center gap-3 text-sm cursor-pointer rounded-lg hover:bg-primary/10 transition-colors py-2.5 px-3"
        >
          <Moon className="h-5 w-5" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center gap-3 text-sm cursor-pointer rounded-lg hover:bg-primary/10 transition-colors py-2.5 px-3"
        >
          <span className="h-5 w-5 flex items-center justify-center text-base">
            💻
          </span>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

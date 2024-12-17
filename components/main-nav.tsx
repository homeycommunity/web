"use client"

import Link from "next/link"
import { Menu } from "lucide-react"

import { siteConfig } from "../config/site"
import { cn } from "../lib/utils"
import { NavItem } from "../types/nav"
import { Icons } from "./icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

interface MainNavProps {
  items?: NavItem[]
}
interface SessionMenuProps {
  session: {
    name?: string | null
  }
}

export function MainNav({ items, session }: MainNavProps & SessionMenuProps) {
  return (
    <div className="flex gap-4 md:gap-8">
      <Link href="/" className="flex items-center space-x-2">
        <Icons.logo className="h-8 w-8" />
        <span className="hidden xxs:inline-block font-bold">
          {siteConfig.name}
        </span>
      </Link>

      {/* Mobile Navigation */}
      {items?.length ? (
        <div className="md:hidden relative">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/10 bg-primary/5 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 hover:bg-primary/10 transition-colors">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="mt-2 w-[180px] rounded-xl border border-primary/10 bg-primary/5 backdrop-blur-lg"
              sideOffset={8}
            >
              {items.map(
                (item, index) =>
                  item.href &&
                  (!item.needsAuth || session) &&
                  !item.disabled && (
                    <DropdownMenuItem key={index} asChild>
                      <Link
                        href={item.href}
                        target={item.target}
                        className={cn(
                          "w-full text-sm py-2.5 px-3 hover:bg-primary/10 transition-colors rounded-lg",
                          item.disabled && "cursor-not-allowed opacity-80"
                        )}
                      >
                        {item.title}
                      </Link>
                    </DropdownMenuItem>
                  )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}

      {/* Desktop Navigation */}
      {items?.length ? (
        <nav className="hidden md:flex gap-6">
          {items?.map(
            (item, index) =>
              item.href &&
              (!item.needsAuth || session) &&
              !item.disabled && (
                <Link
                  key={index}
                  href={item.href}
                  target={item.target}
                  className={cn(
                    "flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg px-3 py-2 hover:bg-primary/5",
                    item.disabled && "cursor-not-allowed opacity-80"
                  )}
                >
                  {item.title}
                </Link>
              )
          )}
        </nav>
      ) : null}
    </div>
  )
}

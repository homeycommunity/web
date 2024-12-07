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

export function MainNav({ items }: MainNavProps) {
  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Icons.logo className="h-6 w-6" />
        <span className="inline-block font-bold">{siteConfig.name}</span>
      </Link>

      {/* Mobile Navigation */}
      {items?.length ? (
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background p-2.5">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {items.map(
                (item, index) =>
                  item.href && (
                    <DropdownMenuItem key={index} asChild>
                      <Link
                        href={item.href}
                        target={item.target}
                        className={cn(
                          "w-full",
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
              item.href && (
                <Link
                  key={index}
                  href={item.href}
                  target={item.target}
                  className={cn(
                    "flex items-center text-sm font-medium text-muted-foreground",
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

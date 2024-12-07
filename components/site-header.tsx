"use server"

import { auth } from "@/auth"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { MainNav } from "@/components/main-nav"
import { SessionMenu } from "@/components/session-menu"
import SignIn from "@/components/sign-in"
import { ThemeToggle } from "@/components/theme-toggle"

export async function SiteHeader() {
  const session = await auth()
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="absolute inset-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="relative backdrop-blur-md border-b border-primary/10 bg-background/60 supports-[backdrop-filter]:bg-background/40">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-teal-500/5 opacity-30 animate-gradient-x" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/5 to-background/50" />

        <div className="container relative flex h-16 items-center justify-between">
          <div className="flex items-center space-x-6">
            <MainNav items={siteConfig.mainNav} />
          </div>

          <div className="flex items-center space-x-4">
            <nav className="flex items-center">
              <div className="flex items-center rounded-full bg-primary/5 backdrop-blur-sm border border-primary/10 p-1.5 gap-2">
                <a
                  href={siteConfig.links.discord}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                    className:
                      "rounded-full w-11 h-11 p-0 hover:bg-blue-500/10 hover:text-blue-400 transition-all duration-200 group relative flex items-center justify-center",
                  })}
                >
                  <Icons.discord className="size-6 transition-all duration-200 group-hover:scale-110" />
                  <span className="sr-only">Discord</span>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity bg-popover px-2.5 py-1.5 rounded-full whitespace-nowrap shadow-sm border border-border">
                    Join Discord
                  </span>
                </a>

                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                    className:
                      "rounded-full w-11 h-11 p-0 hover:bg-purple-500/10 hover:text-purple-400 transition-all duration-200 group relative flex items-center justify-center",
                  })}
                >
                  <Icons.gitHub className="size-6 transition-all duration-200 group-hover:scale-110" />
                  <span className="sr-only">GitHub</span>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity bg-popover px-2.5 py-1.5 rounded-full whitespace-nowrap shadow-sm border border-border">
                    View Source
                  </span>
                </a>

                <div className="w-px h-5 bg-primary/10 mx-0.5" />

                <ThemeToggle />
              </div>

              <div className="ml-4">
                {session ? (
                  <SessionMenu session={{ name: session?.user?.name }} />
                ) : (
                  <SignIn />
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </header>
  )
}

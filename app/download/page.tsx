import { Octokit } from "@octokit/rest"
import { Apple, Computer, Download, Globe, Shield, Zap } from "lucide-react"

import { siteConfig } from "@/config/site"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const fetchCache = "force-no-store"
export const dynamic = "force-dynamic"

export default async function DownloadPage() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  })

  const repo = await octokit.repos.getLatestRelease({
    repo: "desktop",
    owner: "homeycommunity",
  })

  const output = {
    version: repo.data.tag_name,
    windows: repo.data.assets.find((asset) => asset.name.endsWith("exe"))
      ?.browser_download_url,
    mac: repo.data.assets.find((asset) => asset.name.endsWith("dmg"))
      ?.browser_download_url,
  }

  return (
    <section className="container max-w-5xl mx-auto px-4 py-16 relative">
      <div className="text-center mb-16 relative">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-teal-400 [background-size:200%_auto] animate-text">
          Download Homey Community Space Installer
        </h1>
        <Badge className="text-lg px-4 py-1.5 bg-gradient-to-r from-blue-500/10 to-teal-500/10 backdrop-blur-sm border-blue-500/20">
          Version {output.version}
        </Badge>
        <p className="mt-8 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Get the most out of your Homey with our Homey Community Space
          Installer. Install the Homey Community Space Store directly from your
          computer unto your Homey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card className="bg-gradient-to-b from-background to-background/80 border-primary/10 hover:border-blue-500/30 transition-colors">
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold mb-2">Fast & Efficient</h3>
            <p className="text-muted-foreground">
              Quick installation and seamless updates for all your Homey
              Community Space apps
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-b from-background to-background/80 border-primary/10 hover:border-teal-500/30 transition-colors">
          <CardContent className="p-6 text-center">
            <Shield className="w-8 h-8 mx-auto mb-4 text-teal-500" />
            <h3 className="text-lg font-semibold mb-2">Secure</h3>
            <p className="text-muted-foreground">
              Safe and verified distribution of community apps
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-b from-background to-background/80 border-primary/10 hover:border-purple-500/30 transition-colors">
          <CardContent className="p-6 text-center">
            <Globe className="w-8 h-8 mx-auto mb-4 text-purple-500" />
            <h3 className="text-lg font-semibold mb-2">Community-Driven</h3>
            <p className="text-muted-foreground">
              Access to a growing library of community-created apps
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-b from-background to-background/80 border-primary/10">
          <CardContent className="p-8">
            <div className="text-center">
              <Computer className="w-16 h-16 mx-auto mb-6 text-blue-500" />
              <h2 className="text-2xl font-bold mb-4">Windows</h2>
              {output.windows ? (
                <Button
                  asChild
                  variant="blue"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 transition-all"
                  size="lg"
                >
                  <a
                    href={output.windows}
                    className="flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download for Windows
                  </a>
                </Button>
              ) : (
                <p className="text-red-500">
                  Windows download currently unavailable
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-b from-background to-background/80 border-primary/10">
          <CardContent className="p-8">
            <div className="text-center">
              <Apple className="w-16 h-16 mx-auto mb-6 text-blue-500" />
              <h2 className="text-2xl font-bold mb-4">macOS</h2>
              {output.mac ? (
                <Button
                  asChild
                  variant="blue"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 transition-all"
                  size="lg"
                >
                  <a
                    href={output.mac}
                    className="flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download for macOS
                  </a>
                </Button>
              ) : (
                <p className="text-red-500">
                  macOS download currently unavailable
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-16 text-center">
        <p className="text-lg text-muted-foreground">
          Need help? Join our{" "}
          <a
            target="_blank"
            href={siteConfig.links.discord}
            className="text-blue-500 hover:text-blue-600 underline transition-colors"
          >
            Discord
          </a>{" "}
          community for support.
        </p>
      </div>
    </section>
  )
}

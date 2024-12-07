import Link from "next/link"
import { Download, Gift, Heart, Package } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function IndexPage() {
  return (
    <section className="container relative">
      <div className="relative grid items-center gap-12 pb-8 pt-16 md:py-16">
        <div className="flex max-w-[980px] flex-col items-start gap-4">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-teal-400 [background-size:200%_auto] animate-text">
            Welcome to the Homey Community Space
          </h1>
          <p className="max-w-[700px] text-xl text-muted-foreground leading-relaxed">
            The Homey Community Space is a place where you can find third-party
            apps for Homey. We are currently working on the Homey Community
            Store, which will be the place where you can find all the apps.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card className="bg-gradient-to-b from-background to-background/80 border-primary/10 hover:border-blue-500/30 transition-colors">
            <CardContent className="p-6">
              <Package className="w-8 h-8 mb-4 text-blue-500" />
              <h3 className="text-lg font-semibold mb-2">Community Apps</h3>
              <p className="text-muted-foreground">
                Access a growing collection of third-party apps created by the
                Homey community
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-b from-background to-background/80 border-primary/10 hover:border-purple-500/30 transition-colors">
            <CardContent className="p-6">
              <Download className="w-8 h-8 mb-4 text-purple-500" />
              <h3 className="text-lg font-semibold mb-2">Easy Installation</h3>
              <p className="text-muted-foreground">
                Simple and straightforward installation process for all
                community apps
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-b from-background to-background/80 border-primary/10 hover:border-teal-500/30 transition-colors">
            <CardContent className="p-6">
              <Gift className="w-8 h-8 mb-4 text-teal-500" />
              <h3 className="text-lg font-semibold mb-2">Community Driven</h3>
              <p className="text-muted-foreground">
                Built by the community, for the community, ensuring continuous
                growth
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <Heart className="w-12 h-12 mb-4 text-red-500 animate-pulse" />
          <h2 className="text-2xl font-bold mb-4">Support the Community</h2>
          <p className="text-lg text-muted-foreground mb-8">
            To keep the store running, we need your help! You can support the
            Homey Community Space by making a donation. Your contribution helps
            us maintain and improve the platform for everyone.
          </p>
          <div className="flex gap-4">
            <Link
              href="https://paypal.me/dominicvonk"
              target="_blank"
              className={buttonVariants({
                variant: "blue",
                size: "lg",
                className:
                  "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 transition-all hover:scale-105",
              })}
            >
              Donate via PayPal
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

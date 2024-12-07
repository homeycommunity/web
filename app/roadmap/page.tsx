import { RocketIcon } from "lucide-react"

import { features } from "@/config/features"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function RoadmapPage() {
  return (
    <section className="container relative min-h-screen">
      <div className="relative grid items-center gap-10 pb-8 pt-6 md:py-10">
        <div className="flex max-w-[980px] flex-col items-start gap-4">
          <div className="flex items-center gap-3">
            <RocketIcon className="h-10 w-10 text-blue-500" />
            <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-teal-400 [background-size:200%_auto] animate-text">
              Roadmap
            </h1>
          </div>
          <p className="max-w-[700px] text-xl text-muted-foreground leading-relaxed">
            Discover what&apos;s next for the Homey Community Space. Track our
            progress and upcoming features.
          </p>
        </div>

        <Card className="bg-gradient-to-b from-background to-background/80 border-primary/10 hover:border-blue-500/30 transition-colors">
          <CardHeader>
            <CardTitle>Feature Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Feature</TableHead>
                  <TableHead className="w-[200px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {features.map((feature, index) => (
                  <TableRow key={index}>
                    <TableHead className="text-center">
                      <span
                        className="text-xl"
                        title={
                          feature.done
                            ? "Finished"
                            : feature.doing
                              ? "In progress"
                              : "Planned"
                        }
                      >
                        {feature.done ? "✅" : feature.doing ? "🏃" : "🗓️"}
                      </span>
                    </TableHead>
                    <TableHead className="font-medium">
                      {feature.feature}
                    </TableHead>
                    <TableHead>
                      <span
                        className={
                          feature.done
                            ? "text-green-500 dark:text-green-400"
                            : feature.doing
                              ? "text-blue-500 dark:text-blue-400"
                              : "text-muted-foreground"
                        }
                      >
                        {feature.done
                          ? "Finished"
                          : feature.doing
                            ? "In progress"
                            : "Not started"}
                      </span>
                    </TableHead>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="text-center text-muted-foreground">
          <p>
            Have a feature request? Join our Discord community to share your
            ideas!
          </p>
        </div>
      </div>
    </section>
  )
}

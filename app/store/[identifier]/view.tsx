"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { App, AppVersion, Homey, User } from "@prisma/client";

export function StoreIdentifierView ({ app, homeys }: { app: App & { versions: AppVersion[], author: User }, homeys: Homey[] }) {
  const { toast } = useToast();
  return <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
    <div className="flex max-w-[980px] flex-col items-start gap-2">
      <h1 className="text-3xl mb-4 font-extrabold leading-tight tracking-tighter md:text-4xl">
        {app.name + ' '}
        <Badge>{app.versions[0].version}</Badge>
        {' '}
        {app.versions[0].experimental ? <Badge variant="destructive">experimental</Badge> : null}
      </h1>
      <h2>{app.author.name}</h2>
      <p className="max-w-[700px] text-lg mb-4 text-muted-foreground">
        {app?.description}
      </p>
      {homeys.map((homey) => {
        return <Button variant="blue" onClick={(e) => {
          fetch('/store/' + app.identifier + '/install/' + homey.id + '?version=' + app.versions[0].version, {
            method: 'POST'
          }).then(() => {
            toast({
              title: 'App installed',
              description: 'The app has been installed on your Homey',

            })
          })
        }}>
          Install on {homey.name}
        </Button>
      })}
    </div>
  </section>
}

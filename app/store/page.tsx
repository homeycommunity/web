import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";


export const dynamic = 'force-dynamic';

export default async function StorePage () {
  const prisma = new PrismaClient();

  const apps = await prisma.app.findMany({
    where: {
      versions: {
        some: {}
      }
    },
    include: {
      versions: true
    }
  });

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Homey Community Store 🏬
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          The Homey Community Store is a place where you can find third-party apps for Homey.
        </p>
        <div className="grid-cols-3 gap-2">
          {apps.map(app =>
            <Card >
              <CardHeader>
                <CardTitle>{app.name}{app.versions[app.versions.length - 1]?.experimental ? <><br /><Badge variant="destructive">experimental</Badge></> : null}</CardTitle>
              </CardHeader>
              <CardContent>{app.description}</CardContent>
              <CardFooter>
                <Link href={'/store/' + app.identifier}><Button variant="blue">View</Button></Link>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </section >
  )
}

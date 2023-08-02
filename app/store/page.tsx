import { PrismaClient } from "@prisma/client";
import Link from "next/link";



export default async function StorePage () {
  const prisma = new PrismaClient();

  const apps = await prisma.app.findMany({
    where: {
      versions: {
        every: {}
      }
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
        {apps.map(app =>
          <Link href={'/store/' + app.identifier}>{app.name}</Link>
        )}
      </div>
    </section>
  )
}

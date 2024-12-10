import { redirect } from "next/navigation"
import { auth } from "auth"

import { ApiKeysForm } from "./api-keys-form"

export default async function ApiKeysPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/")
  }

  return (
    <section className="container relative min-h-screen isolate space-y-12 pb-20 pt-10">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_70%,transparent_100%)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />
      </div>

      <div className="flex max-w-[980px] flex-col items-start gap-8">
        <div className="w-full rounded-2xl border bg-card/50 backdrop-blur-sm p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent animate-gradient-x md:text-5xl">
                API Keys
              </h1>
              <p className="text-xl text-muted-foreground">
                Create and manage API keys for programmatic access to your
                account
              </p>
            </div>
          </div>
        </div>

        <ApiKeysForm />
      </div>
    </section>
  )
}

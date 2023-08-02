import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

export default function IndexPage () {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Welcome to the Homey Community Space 🚀
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          The Homey Community Space is a place where you can find third-party apps for Homey.
          We are currently working on the Homey Community Store, which will be the place where you can find all the apps.
        </p>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          To keep the store running, we need your help! You can help us by donating to the Homey Community Space.
          You can donate by clicking the buttons below.
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="https://paypal.me/dominicvonk"
          target="_blank" className={buttonVariants({
            variant: 'blue'
          })}>
          Donate via PayPal
        </Link>


      </div>
    </section>
  )
}

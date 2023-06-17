
const features = [
  {
    done: false,
    doing: true,
    feature: 'Create the login system with to allow users to login into the store with their Homey community account',
  },
  {
    done: false,
    doing: false,
    feature: 'Create the app submission system to allow developers to submit their apps to the store',
  },
  {
    done: false,
    doing: false,
    feature: 'Create the web store implementation to allow users to download apps from the store',
  },
  {
    done: false,
    doing: false,
    feature: 'Create the homey app store implementation to allow users to download apps from the store',
  }
]

export default function StorePage () {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Homey Community Store 🏬
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          The Homey Community Store is a place where you can find third-party apps for Homey.
        </p>
      </div>
    </section>
  )
}

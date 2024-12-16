import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { InstallHCS } from "./install-hcs"

interface PageProps {
  params: Promise<{
    homeyId: string
  }>
}

export default async function Page({ params: paramsPromise }: PageProps) {
  const params = await paramsPromise

  return (
    <div className="container mx-auto py-10">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Homey Apps</CardTitle>
            <CardDescription>
              Install and manage apps on your Homey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InstallHCS homeyId={params.homeyId} />
            <Separator className="my-4" />
            {/* Future: List of installed apps */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useCallback, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { controlAppsNewSchema } from "@/app/control/apps/new/schema"

export const dynamic = "force-dynamic"
export default function ControlAppsNewPage() {
  const form = useForm<z.infer<typeof controlAppsNewSchema>>({
    resolver: zodResolver(controlAppsNewSchema),
    defaultValues: {
      name: "",
      identifier: "",
      description: "",
    },
  })

  const [submitError, setSubmitError] = useState<string | null>(null)
  const onSubmit = useCallback(
    async (values: z.infer<typeof controlAppsNewSchema>) => {
      try {
        axios
          .post("/api/control/apps/new", values)
          .then((response) => {
            location.href = "/control/apps"
          })
          .catch((error) => {
            setSubmitError(error.response.data.message)
          })
      } catch (error) {
        console.log(error)
      }
    },
    []
  )

  return (
    <section className="container max-w-3xl mx-auto py-10">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_70%,transparent_100%)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            Create a new app
          </h1>
          <p className="text-muted-foreground">
            Fill in the details below to create your new application.
          </p>
        </div>

        {submitError && (
          <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-lg">
            {submitError}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>App Details</CardTitle>
            <CardDescription>
              Enter the basic information about your app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome App" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your app's features and functionality..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unique Identifier</FormLabel>
                      <FormControl>
                        <Input placeholder="com.developer.app" {...field} />
                      </FormControl>
                      <FormDescription>
                        Must match the identifier in your manifest.json file
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="blue"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 transition-all"
                  >
                    Create App
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

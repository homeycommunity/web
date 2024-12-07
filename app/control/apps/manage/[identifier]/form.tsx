"use client"

import { useCallback, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { App } from "@prisma/client"
import axios from "axios"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
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

import { controlAppsManageSchema } from "./schema"

export function PageForm({ app }: { app: App }) {
  const form = useForm<z.infer<typeof controlAppsManageSchema>>({
    resolver: zodResolver(controlAppsManageSchema),
    defaultValues: {
      name: app.name,
      description: app.description || "",
      id: app.id,
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const onSubmit = useCallback(
    async (values: z.infer<typeof controlAppsManageSchema>) => {
      setIsSubmitting(true)
      setSubmitError(null)

      try {
        await axios.post("/api/control/apps/manage/", values)
        location.href = "/control/apps"
      } catch (error: any) {
        setSubmitError(error.response?.data?.message || "Something went wrong")
        setIsSubmitting(false)
      }
    },
    []
  )

  return (
    <div className="space-y-6">
      {submitError && (
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-lg">
          {submitError}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            defaultValue={app.identifier}
            name="id"
            render={({ field }) => (
              <>
                <FormItem>
                  <FormLabel>Unique Identifier</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      name="_identifier"
                      value={app.identifier}
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormDescription>
                    This identifier matches your manifest.json and cannot be
                    changed
                  </FormDescription>
                  <FormMessage />
                </FormItem>
                <Input type="hidden" {...field} />
              </>
            )}
          />

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="blue"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

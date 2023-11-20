"use client";
import { controlAppsNewSchema } from "@/app/control/apps/new/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

export const dynamic = 'force-dynamic';
export default function ControlAppsNewPage () {
  const form = useForm<z.infer<typeof controlAppsNewSchema>>({
    resolver: zodResolver(controlAppsNewSchema),
    defaultValues: {
      name: "",
      identifier: "",
      description: "",
    }
  })

  const [submitError, setSubmitError] = useState<string | null>(null)
  const onSubmit = useCallback(async (values: z.infer<typeof controlAppsNewSchema>) => {
    try {
      axios.post("/api/control/apps/new", values).then((response) => {
        location.href = '/control/apps'
      }).catch((error) => {
        setSubmitError(error.response.data.message)
      })
    } catch (error) {
      console.log(error)
    }
  }, [])

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Create a new app
        </h1>
        {
          submitError && (
            <p className="text-red-500">
              {submitError}
            </p>
          )
        }
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea {...field} />
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
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>same as defined in manifest.json (used for validation later on)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Create app</Button>
          </form>
        </Form>
      </div>
    </section>
  )
}

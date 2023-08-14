"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { App } from "@prisma/client";
import axios from "axios";
import {
  useCallback,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../../../../components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../../components/ui/form";
import { Input } from "../../../../../components/ui/input";
import { Textarea } from "../../../../../components/ui/textarea";
import { controlAppsManageSchema } from "./schema";

export function PageForm ({ app }: { app: App }) {



  const form = useForm<z.infer<typeof controlAppsManageSchema>>({
    resolver: zodResolver(controlAppsManageSchema),
    defaultValues: {
      name: app.name,
      description: app.description || "",
      id: app.id
    }
  })

  const [submitError, setSubmitError] = useState<string | null>(null)
  const onSubmit = useCallback(async (values: z.infer<typeof controlAppsManageSchema>) => {
    try {
      axios.post("/api/control/apps/manage/", values).then((response) => {
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
          Edit your app
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
              defaultValue={app.identifier}
              name="id"
              render={({ field }) => (
                <>
                  <FormItem>
                    <FormLabel>Unique Identifier</FormLabel>
                    <FormControl>
                      <Input {...field} name='_identifier' value={app.identifier} readOnly />
                    </FormControl>
                    <FormDescription>same as defined in manifest.json (used for validation later on)</FormDescription>
                    <FormMessage />
                  </FormItem>
                  <Input type="hidden" {...field} />
                </>
              )}
            />

            <Button type="submit">Save app</Button>
          </form>
        </Form>
      </div>
    </section>
  )
}

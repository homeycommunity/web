"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "components/ui/form"
import { Input } from "components/ui/input"
import { ArrowRight } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  twoFactor: z.string().optional(),
})

interface HomeyConnectionFormProps {
  isConnected?: boolean
}

export default function HomeyConnectionForm({
  isConnected = false,
}: HomeyConnectionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      twoFactor: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      const response = await fetch("/api/homey/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          twoFactor: values.twoFactor || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to connect Homey account")
      }

      toast.success("Homey account connected successfully")
      router.refresh()
    } catch (error) {
      console.error("Error connecting Homey account:", error)
      toast.error("Failed to connect Homey account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDisconnect() {
    try {
      setIsLoading(true)
      const response = await fetch("/api/homey/disconnect", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to disconnect Homey account")
      }

      toast.success("Homey account disconnected successfully")
      router.refresh()
    } catch (error) {
      console.error("Error disconnecting Homey account:", error)
      toast.error("Failed to disconnect Homey account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isConnected) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <p className="text-sm text-muted-foreground">
            Your Homey account is connected. You can manage your devices and
            apps.
          </p>
          <Button size="lg" className="w-full" asChild>
            <Link
              href="/control/homeys"
              className="flex items-center justify-center gap-2"
            >
              My Homeys
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        <Button
          variant="destructive"
          onClick={handleDisconnect}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Disconnecting..." : "Disconnect Homey Account"}
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="twoFactor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Two-Factor Authentication Code</FormLabel>
              <FormControl>
                <Input placeholder="123456" {...field} />
              </FormControl>
              <FormDescription>
                Only enter this if you have two-factor authentication enabled on
                your Homey account
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Connecting..." : "Connect Homey Account"}
        </Button>
      </form>
    </Form>
  )
}

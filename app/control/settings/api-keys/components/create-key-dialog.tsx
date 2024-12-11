"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { addDays, addHours, format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"

import {
  API_SCOPES,
  getAllRequiredScopes,
  getIndentLevel,
  type ApiScope,
} from "@/config/api-scopes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { formSchema, FormValues } from "../types"

interface CreateKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: FormValues) => Promise<void>
  isSubmitting: boolean
}

const EXPIRY_PRESETS = [
  { label: "24 hours", value: "24h", getDate: () => addHours(new Date(), 24) },
  { label: "7 days", value: "7d", getDate: () => addDays(new Date(), 7) },
  { label: "30 days", value: "30d", getDate: () => addDays(new Date(), 30) },
  { label: "90 days", value: "90d", getDate: () => addDays(new Date(), 90) },
  { label: "No expiry", value: "no-expiry", getDate: () => null },
  { label: "Custom", value: "custom", getDate: () => null },
] as const

export function CreateKeyDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreateKeyDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      scopes: [],
      noExpiry: false,
      expiresAt: null,
      expiryPreset: "24h",
    },
  })

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
  }

  const handlePresetChange = (value: string) => {
    form.setValue("expiryPreset", value)
    if (value === "no-expiry") {
      form.setValue("noExpiry", true)
      form.setValue("expiresAt", null)
    } else {
      form.setValue("noExpiry", false)
      if (value === "custom") {
        form.setValue("expiresAt", null)
      } else {
        const preset = EXPIRY_PRESETS.find((p) => p.value === value)
        if (preset) {
          form.setValue("expiresAt", preset.getDate())
        }
      }
    }
  }

  const handleScopeChange = (scope: ApiScope, checked: boolean) => {
    const currentScopes = form.getValues("scopes")
    let newScopes: ApiScope[]

    if (checked) {
      // Include the selected scope and its dependencies
      newScopes = getAllRequiredScopes([...currentScopes, scope])
    } else {
      // Remove the scope, but keep other scopes and their dependencies
      const remainingScopes = currentScopes.filter((s) => s !== scope)
      newScopes = getAllRequiredScopes(remainingScopes)
    }

    form.setValue("scopes", newScopes)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Give your API key a name and select the scopes it needs.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <div className="space-y-4">
              <FormLabel className="text-base">Scopes</FormLabel>
              <FormField
                control={form.control}
                name="scopes"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-4 p-4 border rounded-lg bg-muted/50">
                      {API_SCOPES.map((scope) => {
                        const indent = getIndentLevel(scope.value) * 24
                        return (
                          <div
                            key={scope.value}
                            className="flex items-center space-x-2"
                            style={{ marginLeft: `${indent}px` }}
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(scope.value)}
                                onCheckedChange={(checked) => {
                                  handleScopeChange(scope.value, !!checked)
                                }}
                              />
                            </FormControl>
                            <div>
                              <FormLabel className="!mt-0 font-medium">
                                {scope.label}
                              </FormLabel>
                              <FormDescription>
                                {scope.description}
                              </FormDescription>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel className="text-base">Expiration</FormLabel>
              <div className="mt-4 grid gap-4 p-4 border rounded-lg bg-muted/50">
                <FormField
                  control={form.control}
                  name="expiryPreset"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <Select
                        onValueChange={handlePresetChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an expiry preset" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPIRY_PRESETS.map((preset) => (
                            <SelectItem
                              key={preset.value}
                              className="flex items-center space-x-3 space-y-0"
                              value={preset.value}
                            >
                              {preset.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {field.value === "custom" && (
                        <FormField
                          control={form.control}
                          name="expiresAt"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
                                    <Calendar
                                      mode="single"
                                      selected={field.value || undefined}
                                      onSelect={field.onChange}
                                      disabled={(date: Date) =>
                                        date < new Date()
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

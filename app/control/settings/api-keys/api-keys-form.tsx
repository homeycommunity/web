"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "components/ui/button"
import { Card, CardContent } from "components/ui/card"
import { Key } from "lucide-react"

import { ApiKeysTable } from "./components/api-keys-table"
import { CreateKeyDialog } from "./components/create-key-dialog"
import { SuccessKeyDialog } from "./components/success-key-dialog"
import { ApiKey, FormValues } from "./types"

export function ApiKeysForm() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [newKey, setNewKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/apikeys")
      if (!response.ok) throw new Error("Failed to fetch API keys")
      const data = await response.json()
      setApiKeys(data)
    } catch (error) {
      setError("Failed to load API keys")
      console.error("Error loading API keys:", error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setIsSubmitting(true)
      setError(null)

      try {
        const response = await fetch("/api/apikeys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            scopes: values.scopes,
            expiresAt: values.noExpiry ? null : values.expiresAt?.toISOString(),
          }),
        })

        if (!response.ok) throw new Error("Failed to create API key")

        const data = await response.json()
        setNewKey(data.key)
        setApiKeys([data, ...apiKeys])
        setOpen(false)
      } catch (error) {
        setError("Failed to create API key")
        console.error("Error creating API key:", error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [apiKeys]
  )

  const deleteApiKey = async (id: string) => {
    try {
      const response = await fetch(`/api/apikeys?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete API key")

      setApiKeys(apiKeys.filter((key) => key.id !== id))
    } catch (error) {
      setError("Failed to delete API key")
      console.error("Error deleting API key:", error)
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return "Never"
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleRevoke = async (key: ApiKey) => {
    await deleteApiKey(key.id)
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/10 w-full">
      <CardContent className="pt-6">
        {error && (
          <div className="mb-4 p-4 text-sm text-destructive bg-destructive/15 border border-destructive rounded-lg">
            {error}
          </div>
        )}
        <div className="mb-6">
          <Button
            onClick={() => setOpen(true)}
            variant="blue"
            className="group w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 transition-all"
          >
            <Key className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
            Create API Key
          </Button>
        </div>

        <ApiKeysTable
          apiKeys={apiKeys}
          loading={loading}
          onRevoke={handleRevoke}
          formatDate={formatDate}
        />
      </CardContent>

      <CreateKeyDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />

      <SuccessKeyDialog apiKey={newKey} onClose={() => setNewKey(null)} />
    </Card>
  )
}

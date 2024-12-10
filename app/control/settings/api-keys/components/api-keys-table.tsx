import { useState } from "react"
import { Button } from "components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table"
import { Loader2 } from "lucide-react"

import { ApiKey } from "../types"

interface ApiKeysTableProps {
  apiKeys: ApiKey[]
  loading: boolean
  onRevoke: (key: ApiKey) => void
  formatDate: (date: string | null) => string
}

export function ApiKeysTable({
  apiKeys,
  loading,
  onRevoke,
  formatDate,
}: ApiKeysTableProps) {
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null)

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Loading API keys...</p>
      </div>
    )
  }

  if (apiKeys.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="mb-2">No API keys found</p>
        <p className="text-sm">Create one to get started</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Scopes</TableHead>
              <TableHead className="hidden sm:table-cell">Created</TableHead>
              <TableHead className="hidden md:table-cell">Last Used</TableHead>
              <TableHead className="hidden sm:table-cell">Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((key) => (
              <TableRow key={key.id} className="group">
                <TableCell className="font-medium">{key.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                    {key.scopes?.map((scope) => (
                      <span
                        key={scope}
                        className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {formatDate(key.createdAt)}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {formatDate(key.lastUsedAt)}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {formatDate(key.expiresAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setKeyToRevoke(key)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Revoke
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!keyToRevoke}
        onOpenChange={(open) => !open && setKeyToRevoke(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this API key? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-2">
            <div>
              <span className="font-medium">Name: </span>
              <span className="text-muted-foreground">{keyToRevoke?.name}</span>
            </div>
            <div>
              <span className="font-medium">Created: </span>
              <span className="text-muted-foreground">
                {keyToRevoke && formatDate(keyToRevoke.createdAt)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKeyToRevoke(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (keyToRevoke) {
                  onRevoke(keyToRevoke)
                  setKeyToRevoke(null)
                }
              }}
            >
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

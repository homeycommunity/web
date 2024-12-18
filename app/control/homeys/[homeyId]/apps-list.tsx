"use client"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface HomeyApp {
  id: string
  name: string
  versions: string
  sdk: number
  compatibility: string
}

interface AppsListProps {
  homeyId: string
}

export function AppsList({ homeyId }: AppsListProps) {
  const {
    data: apps,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["homey-apps", homeyId],
    queryFn: async () => {
      const response = await axios.get<{ homey: { apps: HomeyApp[] } }>(
        `/api/homey/${homeyId}`
      )
      return response.data.homey.apps
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-center text-sm text-destructive">
        Failed to load apps
      </div>
    )
  }

  if (!apps || !apps?.length) {
    return (
      <div className="rounded-lg bg-muted p-4 text-center text-sm">
        No apps installed
      </div>
    )
  }

  return (
    <div className="relative">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Version</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apps.map((app) => (
            <TableRow key={app.id}>
              <TableCell>{app.name}</TableCell>
              <TableCell>{app.versions}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

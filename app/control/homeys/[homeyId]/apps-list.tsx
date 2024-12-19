"use client"

import { Homey, HomeyApp } from "@prisma/client"
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
      const response = await axios.get<{
        homey: Homey & { HomeyApp: HomeyApp[] }
      }>(`/api/homey/${homeyId}`)
      return response.data.homey.HomeyApp
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
            <TableHead>Origin</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Auto Update</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apps.map((app) => (
            <TableRow key={app.appId}>
              <TableCell>{app.name}</TableCell>
              <TableCell>{app.version}</TableCell>
              <TableCell>{app.origin}</TableCell>
              <TableCell>{app.channel}</TableCell>
              <TableCell>{app.autoUpdate ? "Yes" : "No"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

"use client";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { App, AppVersion, } from "@prisma/client";
import { UploadCloudIcon } from "lucide-react";
import { useRouter } from "next/navigation";



export function AppRow ({ app }: { app: App & { versions: AppVersion[] } }) {
  const router = useRouter()
  return (<TableRow onClick={() => {
    router.push(`/control/apps/manage/${app.identifier}`)
  }} key={app.id}>
    <TableCell>{app.name}</TableCell>
    <TableCell>{app.identifier}</TableCell>
    <TableCell>{app.versions.length ? app.versions[app.versions.length - 1].version : 'N/A'} </TableCell>
    <TableCell><Button size="sm" variant="outline" onClick={(e) => {
      e.stopPropagation()
      router.push(`/control/apps/manage/${app.identifier}/versions/create`)
    }}><UploadCloudIcon /></Button></TableCell>
  </TableRow>)
}

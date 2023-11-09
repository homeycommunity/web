"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { App, AppVersion, } from "@prisma/client";
import axios from "axios";
import { Trash, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AppRow ({ app }: { app: App & { versions: AppVersion[] } }) {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('');
  return (<TableRow key={app.id}>
    <TableCell onClick={() => {
      router.push(`/control/apps/manage/${app.identifier}`)
    }} >{app.name}</TableCell>
    <TableCell onClick={() => {
      router.push(`/control/apps/manage/${app.identifier}`)
    }} >{app.identifier}</TableCell>
    <TableCell>{app.versions.length ? app.versions[app.versions.length - 1].version : 'N/A'} </TableCell>
    <TableCell width="100"><Button size="sm" variant="outline" onClick={(e) => {
      e.stopPropagation()
      router.push(`/control/apps/manage/${app.identifier}/versions/create`)
    }}><UploadCloud /></Button>

    </TableCell>
    <TableCell width="100">
      <Dialog>
        <DialogTrigger asChild>
          <Button onClick={e => e.stopPropagation()} size="sm" variant="destructive"><Trash /></Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Remove app</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Identifier
              </Label>
              <Input value={identifier} onInput={(e) => setIdentifier(e.currentTarget.value)} className="col-span-3" />
            </div>

          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={(e) => {
              e.stopPropagation()
              if (identifier !== app.identifier) {
                toast({
                  title: 'Identifier does not match',
                  description: 'Please enter the correct identifier',
                  variant: 'destructive'
                })
              } else {
                axios.delete('/api/control/apps/remove', {
                  data: {
                    id: app.id
                  }
                }).then(() => {
                  router.refresh();
                })
              }
            }}>Confirm delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TableCell>
  </TableRow>)
}

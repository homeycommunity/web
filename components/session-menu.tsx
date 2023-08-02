"use client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
export const SessionMenu = (props: any) => {
  const router = useRouter()
  return <DropdownMenu>
    <DropdownMenuTrigger>{props.session?.name || 'No name'}</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={() => {
        router.push('/control/apps')
      }}>My Apps</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => {
        signOut()
      }}>Logout</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
}

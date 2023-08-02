"use client";

import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export const AppPlus = () => {
  const router = useRouter();
  return <Button style={{ marginLeft: 8 }} variant="teal" onClick={(e) => {
    e.stopPropagation()
    router.push('/control/apps/new');
  }}>
    <PlusCircleIcon />
  </Button>
}

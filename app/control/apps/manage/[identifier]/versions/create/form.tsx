"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { App } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PageForm ({ app }: { app: App }) {

  const [tarGz, setTarGz] = useState(null);
  const router = useRouter();
  const uploadToClient = (event: any) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];

      setTarGz(i);
    } else {
      setTarGz(null);
    }
  };


  const uploadToServer = async (event: any) => {
    const body = new FormData();
    body.append('id', app.id);
    body.append("file", tarGz!);
    const response = await fetch("/api/control/apps/upload", {
      method: "POST",
      body
    });
    const data = await response.json();
    if (data.status == 200) {
      router.push('/control/apps/manage')
    }
  };


  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">Select Image</h1>
        <Input type="file" name="myImage" accept="application/gzip" onChange={uploadToClient} />
        <Button
          disabled={!tarGz}
          type="submit"
          onClick={uploadToServer}
        >
          Send to server
        </Button>
      </div>
    </section>
  );
}

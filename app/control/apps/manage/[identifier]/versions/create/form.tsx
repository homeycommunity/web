"use client";
import { App } from "@prisma/client";
import { useState } from "react";

export function PageForm ({ app }: { app: App }) {

  const [zip, setZip] = useState(null);
  const uploadToClient = (event: any) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];

      setZip(i);
    } else {
      setZip(null);
    }
  };


  const uploadToServer = async (event: any) => {
    const body = new FormData();
    body.append('id', app.id);
    body.append("file", zip!);
    const response = await fetch("/api/control/apps/upload", {
      method: "POST",
      body
    });
    console.log(response);
  };


  return (
    <div>
      <div>
        <h4>Select Image</h4>
        <input type="file" name="myImage" onChange={uploadToClient} />
        <button
          disabled={!zip}
          className="btn btn-primary"
          type="submit"
          onClick={uploadToServer}
        >
          Send to server
        </button>
      </div>
    </div>
  );
}

import { useState } from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"

import { CodeBlock } from "./code-block"

interface CurlExampleProps {
  command: string
}

export function CurlExample({ command }: CurlExampleProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">cURL Example</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 hover:bg-primary/10"
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className="sr-only">Copy cURL command</span>
        </Button>
      </div>
      <CodeBlock
        language="bash"
        value={command}
        className="[&_pre]:max-h-[300px] [&_pre]:overflow-auto"
      />
    </div>
  )
}

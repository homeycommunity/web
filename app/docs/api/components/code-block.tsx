"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { highlight } from "sugar-high"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CodeBlockProps {
  language: string
  value: string
  className?: string
  title?: string
}

export function CodeBlock({
  language,
  value,
  className,
  title,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const onCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const codeHTML = highlight(value as string)

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {title && (
        <div className="absolute left-0 right-12 top-0 flex h-9 items-center border-b bg-muted/80 px-4 backdrop-blur-sm">
          <span className="font-mono text-sm text-muted-foreground">
            {title}
          </span>
        </div>
      )}
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-2 top-2 size-8 hover:bg-muted/80"
        onClick={onCopy}
      >
        {copied ? (
          <Check className="size-4 text-green-500" />
        ) : (
          <Copy className="size-4" />
        )}
        <span className="sr-only">Copy code</span>
      </Button>
      <div className="rounded-lg bg-gray-800 p-4">
        <code
          dangerouslySetInnerHTML={{ __html: codeHTML }}
          className="block h-[400px] w-full overflow-auto whitespace-pre pt-6"
        />
      </div>
    </div>
  )
}

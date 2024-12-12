"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"

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

  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      {title && (
        <div className="absolute top-0 left-0 right-12 h-9 px-4 flex items-center bg-muted/80 backdrop-blur-sm border-b">
          <span className="text-sm text-muted-foreground font-mono">
            {title}
          </span>
        </div>
      )}
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-2 top-2 h-8 w-8 hover:bg-muted/80"
        onClick={onCopy}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        <span className="sr-only">Copy code</span>
      </Button>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          paddingTop: title ? "2.75rem" : "1rem",
          borderRadius: "0.5rem",
        }}
        showLineNumbers={true}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}

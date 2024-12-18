"use client"

import { useConnection } from "@/effects/useConnection"
import { icons } from "lucide-react"

import { cn } from "@/lib/utils"

interface ConnectionStatusProps {
  urls: string | string[]
  className?: string
  label: string
  icon: keyof typeof icons
}

const Icon = ({
  name,
  color,
  size,
  className,
}: {
  name: string
  color?: string
  size?: number
  className?: string
}) => {
  const LucideIcon = icons[name as keyof typeof icons]

  return <LucideIcon color={color} size={size} className={className} />
}

export function ConnectionStatus({
  urls,
  className,
  icon,
  label,
}: ConnectionStatusProps) {
  const { isConnected, workingUrl } = useConnection(urls)

  if (!isConnected)
    return (
      <span className="text-muted-foreground">No connection to {label}</span>
    )

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground",
        className
      )}
    >
      <Icon
        name={icon}
        className={cn(
          "h-4 w-4",
          isConnected ? "text-green-500" : "text-muted-foreground"
        )}
      />
      <span>
        {label}: {workingUrl}
      </span>
    </div>
  )
}

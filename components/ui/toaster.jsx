"use client"

import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { X } from "lucide-react"

export function Toaster() {
  const { toasts, dismiss } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 p-4 max-h-screen overflow-hidden pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  )
}

function Toast({ toast, onDismiss }) {
  const { title, description, variant = "default" } = toast
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setIsVisible(true)
    }, 10)

    const hideTimer = setTimeout(() => {
      setIsVisible(false)
    }, 5000)

    const dismissTimer = setTimeout(() => {
      onDismiss()
    }, 5300)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
      clearTimeout(dismissTimer)
    }
  }, [onDismiss])

  const variantClasses = {
    default: "bg-background border-border",
    destructive: "bg-destructive text-destructive-foreground border-destructive",
    success: "bg-green-500 text-white border-green-600",
  }

  return (
    <div
      className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all duration-300 ${
        variantClasses[variant]
      } ${isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
    >
      <div className="flex p-4">
        <div className="flex-1">
          {title && <div className="font-medium">{title}</div>}
          {description && <div className="mt-1 text-sm opacity-90">{description}</div>}
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onDismiss, 300)
          }}
          className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
}

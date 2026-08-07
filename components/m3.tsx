"use client"

import type React from "react"
import { forwardRef, useId } from "react"
import { cn } from "@/lib/utils"

/* ---------------------------------- Button --------------------------------- */

type ButtonVariant = "filled" | "tonal" | "outlined" | "text"

export function M3Button({
  variant = "filled",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const base =
    "relative inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40"
  const variants: Record<ButtonVariant, string> = {
    filled: "bg-primary text-primary-foreground hover:brightness-110 active:brightness-95",
    tonal: "bg-primary-container text-on-primary-container hover:brightness-105 active:brightness-95",
    outlined: "border border-input text-primary hover:bg-primary/5 active:bg-primary/10",
    text: "px-4 text-primary hover:bg-primary/5 active:bg-primary/10",
  }
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  )
}

/* --------------------------------- FAB ------------------------------------- */

export function M3ExtendedFab({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-14 items-center gap-3 rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/* ------------------------------- Text Field -------------------------------- */

type FieldProps = {
  label: string
  error?: string
  helper?: string
  leading?: React.ReactNode
}

export const M3TextField = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & FieldProps
>(function M3TextField({ label, error, helper, leading, className, id, ...props }, ref) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  return (
    <div className="w-full">
      <div
        className={cn(
          "group relative rounded-t-md border-b-2 bg-muted/40 px-4 pt-6 pb-2 transition-colors focus-within:bg-muted/60",
          error ? "border-destructive" : "border-input focus-within:border-primary",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          {leading}
          <input
            ref={ref}
            id={fieldId}
            placeholder=" "
            className="peer w-full bg-transparent text-base text-foreground outline-none placeholder:text-transparent"
            {...props}
          />
        </div>
        <label
          htmlFor={fieldId}
          className={cn(
            "pointer-events-none absolute left-4 top-2 text-xs font-medium transition-all",
            "peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal",
            "peer-focus:top-2 peer-focus:text-xs peer-focus:font-medium",
            error ? "text-destructive" : "text-muted-foreground peer-focus:text-primary",
          )}
        >
          {label}
        </label>
      </div>
      {(error || helper) && (
        <p className={cn("mt-1 px-4 text-xs", error ? "text-destructive" : "text-muted-foreground")}>
          {error ?? helper}
        </p>
      )}
    </div>
  )
})

/* --------------------------------- Select ---------------------------------- */

export function M3Select({
  label,
  className,
  children,
  id,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  return (
    <div className="w-full">
      <label htmlFor={fieldId} className="mb-1 block px-1 text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <select
        id={fieldId}
        className={cn(
          "h-12 w-full rounded-md border border-input bg-muted/40 px-4 text-base text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

/* ------------------------------ Filter Chip -------------------------------- */

export function M3Chip({
  selected,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "border-primary bg-primary-container text-on-primary-container"
          : "border-input bg-transparent text-foreground hover:bg-muted/60",
        className,
      )}
      aria-pressed={selected}
      {...props}
    >
      {children}
    </button>
  )
}

/* ------------------------------ Top App Bar -------------------------------- */

export function M3TopAppBar({
  title,
  leading,
  actions,
}: {
  title: string
  leading?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-1 bg-surface-container px-2">
      {leading}
      <h1 className={cn("flex-1 truncate text-xl font-medium text-foreground", leading ? "px-1" : "px-3")}>
        {title}
      </h1>
      {actions}
    </header>
  )
}

export function M3IconButton({
  className,
  children,
  "aria-label": ariaLabel,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      aria-label={ariaLabel}
      className={cn(
        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/8 active:bg-foreground/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/* -------------------------------- Snackbar --------------------------------- */

export function M3Snackbar({ message }: { message: string }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div
        role="status"
        className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-xl bg-foreground px-4 py-3 text-sm text-background shadow-lg"
      >
        {message}
      </div>
    </div>
  )
}

/* --------------------------------- Dialog ---------------------------------- */

export function M3Dialog({
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  destructive,
}: {
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  destructive?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-foreground/40" onClick={onCancel} aria-hidden />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-sm rounded-3xl bg-card p-6 shadow-xl"
      >
        <h2 className="text-xl font-medium text-card-foreground">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <M3Button variant="text" onClick={onCancel}>
            {cancelLabel}
          </M3Button>
          <M3Button
            variant="text"
            onClick={onConfirm}
            className={destructive ? "text-destructive hover:bg-destructive/8" : ""}
          >
            {confirmLabel}
          </M3Button>
        </div>
      </div>
    </div>
  )
}

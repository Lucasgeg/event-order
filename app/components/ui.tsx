"use client";

import React from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/* ---------------------------------- Button --------------------------------- */

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary: "bg-gold-soft text-primary hover:bg-gold/25",
  outline: "border border-line bg-surface text-ink hover:bg-parchment",
  ghost: "text-ink-soft hover:bg-parchment hover:text-ink",
  danger: "bg-danger text-white hover:bg-danger-dark",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

/* ------------------------------- Icon button ------------------------------- */

export function IconButton({
  label,
  tone = "neutral",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  tone?: "neutral" | "danger" | "primary";
}) {
  const tones = {
    neutral: "text-ink-soft hover:bg-parchment hover:text-ink",
    danger: "text-ink-soft hover:bg-danger-soft hover:text-danger",
    primary: "text-ink-soft hover:bg-gold-soft hover:text-primary",
  };
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center h-9 w-9 rounded-lg transition-colors duration-200 cursor-pointer",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ink-soft",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ------------------------------ Form controls ------------------------------ */

const fieldBase =
  "w-full h-11 rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-soft/60 transition-colors duration-200 focus:border-gold focus:ring-2 focus:ring-gold/25 outline-none disabled:opacity-50 disabled:cursor-not-allowed";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldBase, "cursor-pointer", className)} {...props}>
      {children}
    </select>
  );
}

export function Label({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-sm font-semibold text-ink mb-1.5", className)}
      {...props}
    >
      {children}
    </label>
  );
}

/* ----------------------------------- Card ---------------------------------- */

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-surface rounded-xl border border-line shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-ink-soft">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ---------------------------------- Badge ---------------------------------- */

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: "neutral" | "gold" | "olive" | "danger";
  className?: string;
  children: React.ReactNode;
}) {
  const tones = {
    neutral: "bg-parchment text-ink-soft",
    gold: "bg-gold-soft text-gold-dark",
    olive: "bg-olive-soft text-olive-dark",
    danger: "bg-danger-soft text-danger",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* -------------------------------- Empty state ------------------------------ */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="h-full relative">
      <Image
        src="/logo.png"
        alt=""
        aria-hidden
        width={200}
        height={200}
        className="pointer-events-none absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 opacity-25"
      />
      <div className="relative flex flex-col items-center justify-center text-center py-12 px-4 overflow-hidden">
        {icon && (
          <div className="relative flex items-center justify-center h-12 w-12 rounded-full bg-parchment text-ink-soft mb-4">
            {icon}
          </div>
        )}
        <p className="relative font-semibold text-ink">{title}</p>
        {description && (
          <p className="relative mt-1 text-sm text-ink-soft max-w-sm">
            {description}
          </p>
        )}
        {action && <div className="relative mt-4">{action}</div>}
      </div>
    </div>
  );
}

/* ------------------------------ Segmented tabs ----------------------------- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg bg-parchment p-1 gap-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-9 px-4 rounded-md text-sm font-semibold transition-colors duration-200 cursor-pointer",
            value === option.value
              ? "bg-surface text-primary shadow-sm"
              : "text-ink-soft hover:text-ink",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------- Table bits ------------------------------- */

export function Th({
  className,
  children,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-bold text-ink-soft uppercase tracking-wider",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({
  className,
  children,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-4 py-3 text-sm text-ink", className)} {...props}>
      {children}
    </td>
  );
}

/* --------------------------------- Spinner --------------------------------- */

export function LoadingBlock({ label = "Chargement..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-ink-soft">
      <Image
        src="/logo.png"
        alt=""
        aria-hidden
        width={40}
        height={40}
        className="h-30 w-30 animate-pulse"
      />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-neutral-900 text-white shadow hover:bg-neutral-800": variant === "default",
          "border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-200": variant === "secondary",
          "border-transparent bg-red-100 text-red-800 border-red-200": variant === "destructive",
          "border-neutral-200 text-neutral-950": variant === "outline",
          "border-emerald-200 bg-emerald-50 text-emerald-700 font-medium": variant === "success",
          "border-amber-200 bg-amber-50 text-amber-700 font-medium": variant === "warning",
        },
        className
      )}
      {...props}
    />
  );
}

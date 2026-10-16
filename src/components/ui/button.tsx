import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "emerald";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          {
            "bg-[#11E97F] hover:bg-[#0ED071] text-[#0A0E1A] font-extrabold shadow-sm hover:shadow-md hover:shadow-[#11E97F]/30 active:scale-95":
              variant === "default",
            "bg-red-600 text-white shadow-sm hover:bg-red-700": variant === "destructive",
            "border border-slate-200 bg-white text-slate-800 shadow-2xs hover:bg-slate-50 hover:text-slate-900":
              variant === "outline",
            "bg-emerald-50 text-emerald-950 border border-emerald-200/80 shadow-2xs hover:bg-emerald-100":
              variant === "secondary",
            "hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50":
              variant === "ghost",
            "text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50": variant === "link",
            "bg-emerald-600 text-white shadow hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600":
              variant === "emerald",
            "h-9 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-10 rounded-lg px-8": size === "lg",
            "h-9 w-9": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "navy" | "coral" | "info";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "default",
  size = "md",
  ...props
}) => {
  const baseStyles = "inline-flex items-center font-semibold rounded-full";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  const variantStyles = {
    default: "bg-slate-100 text-slate-700 border border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-rose-50 text-rose-700 border border-rose-200",
    navy: "bg-[#00205B]/10 text-[#00205B] border border-[#00205B]/20",
    coral: "bg-[#E63956]/10 text-[#E63956] border border-[#E63956]/20",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
  };

  return (
    <span className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)} {...props}>
      {children}
    </span>
  );
};

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "coral" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const variantStyles = {
    primary:
      "bg-[#00205B] text-white hover:bg-[#0C3B8C] focus:ring-[#00205B] shadow-sm hover:shadow",
    coral:
      "bg-[#E63956] text-white hover:bg-[#D12946] focus:ring-[#E63956] shadow-sm hover:shadow",
    secondary:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400 border border-slate-200",
    outline:
      "border border-[#00205B] text-[#00205B] bg-transparent hover:bg-[#00205B]/5 focus:ring-[#00205B]",
    ghost:
      "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-300",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm",
  };

  const sizeStyles = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-5 py-2.5 gap-2.5",
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};

import type { FC, ReactNode } from "react";
import { TextStyle } from "./TextStyle";

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    variant?: Variant;
    icon?: ReactNode;
    fullWidth?: boolean;
    size?: Size;
    className?: string;
}

const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-2xl border transition-all duration-200";

const variantStyles: Record<Variant, string> = {
    solid:
        "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-fuchsia-500 shadow-lg shadow-fuchsia-500/30 lg:hover:scale-105",
    outline:
        "bg-transparent border-cyan-400 text-cyan-100 lg:hover:bg-cyan-900/30",
    ghost:
        "border-transparent text-slate-200 lg:hover:border-slate-500/40",
};

const sizeStyles: Record<Size, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
};

export const ButtonEl: FC<ButtonProps> = ({
    label,
    onClick,
    disabled = false,
    type = "button",
    variant = "solid",
    icon,
    fullWidth = false,
    size = "md",
    className = "",
}) => {
    const labelClassName =
        size === "sm"
            ? "!text-base !leading-6 tracking-[0.25em]"
            : size === "lg"
                ? "!text-3xl"
                : "";

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`
                ${baseStyles}
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                ${fullWidth ? "w-full" : "w-auto"}
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                ${className}
            `}
        >
            {icon}
            <TextStyle className={labelClassName}>{label}</TextStyle>
        </button>
    );
};

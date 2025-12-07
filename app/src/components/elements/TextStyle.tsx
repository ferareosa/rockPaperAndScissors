import type { FC, ReactNode } from "react";

interface TextStyleProps {
    children?: ReactNode;
    text?: string;
    className?: string;
}

export const TextStyle: FC<TextStyleProps> = ({ children, text, className = "" }) => {
    return (
        <span
            className={`
                text-2xl font-normal leading-10 tracking-[0.15em] text-blue-100
                ${className}
            `}
        >
            {children}
            {text}
        </span>
    );
};
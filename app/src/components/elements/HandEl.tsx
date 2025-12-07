import type { FC } from "react";
import type { Move } from "../../types";
import rockIconPath from "../../assets/icons/piedra.svg";
import paperIconPath from "../../assets/icons/papel.svg";
import scissorsIconPath from "../../assets/icons/tijera.svg";

interface HandProps {
    type: Move;
    selected?: boolean;
    disabled?: boolean;
    emphasis?: "normal" | "hero";
    onSelect?: (value: Move) => void;
}

const iconMap: Record<Move, string> = {
    rock: rockIconPath,
    paper: paperIconPath,
    scissors: scissorsIconPath,
};

export const HandEl: FC<HandProps> = ({
    type,
    selected = false,
    disabled = false,
    emphasis = "normal",
    onSelect,
}) => {
    return (
        <button
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => onSelect?.(type)}
            title={type}
            className={`
                rounded-3xl border-2 border-transparent bg-slate-900/40 p-3 shadow-inner transition-all duration-200
                ${selected ? "border-amber-300 shadow-amber-300/30 animate-pulse" : "lg:hover:border-white/40"}
                ${disabled ? "opacity-40 cursor-not-allowed" : ""}
                ${emphasis === "hero" ? "scale-110" : ""}
            `}
        >
            <img
                src={iconMap[type]}
                alt={`Opción ${type}`}
                className={`h-12 w-12 select-none ${selected ? "scale-110" : ""}`}
            />
        </button>
    );
};
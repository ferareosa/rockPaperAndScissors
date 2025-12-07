import type { FC } from "react";

interface LoadingElProps {
    message?: string;
}

export const LoadingEl: FC<LoadingElProps> = ({
    message = "Sincronizando la arena...",
}) => {
    return (
        <div className="flex flex-col items-center gap-4 text-white">
            <span className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-fuchsia-400" />
            <p className="text-sm tracking-widest text-white/80 uppercase">{message}</p>
        </div>
    );
};
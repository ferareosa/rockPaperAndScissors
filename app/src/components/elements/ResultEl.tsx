import type { FC } from "react";
import type { Move, RoundResult } from "../../types";

interface ResultElProps {
    result: RoundResult | null;
}

const moveEmoji: Record<Move, string> = {
    rock: "✊",
    paper: "🖐️",
    scissors: "✌️",
};

export const ResultEl: FC<ResultElProps> = ({ result }) => {
    if (!result) {
        return (
            <article className="rounded-3xl border border-white/20 bg-white/5 p-5 text-white sm:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                    Sin resultados
                </p>
                <h3 className="text-2xl font-semibold sm:text-3xl">Juega tu primera ronda</h3>
                <p className="mt-2 text-sm text-white/70 sm:text-base">
                    Selecciona un movimiento para cada jugador activo y pulsa
                    <strong className="ml-1 font-semibold text-fuchsia-300">
                        Revelar ronda
                    </strong>
                    .
                </p>
            </article>
        );
    }

    return (
        <article className="rounded-3xl border border-white/25 bg-slate-900/60 p-5 text-white shadow-2xl shadow-fuchsia-500/10 sm:p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50 sm:text-sm">
                Ronda {result.round}
            </p>
            <h3 className="text-2xl font-semibold text-fuchsia-200 sm:text-3xl">
                {result.headline}
            </h3>
            <p className="mt-2 text-sm text-white/80 sm:text-base">{result.flavor}</p>
            <ul className="mt-6 space-y-3">
                {result.breakdown.map((entry) => (
                    <li
                        key={entry.id}
                        className="grid gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm sm:grid-cols-[1.3fr,1fr,0.7fr] sm:items-center"
                    >
                        <span className="text-base font-semibold tracking-wide text-white sm:text-lg">
                            {entry.name}
                        </span>
                        <span className="text-sm text-white/80 sm:text-center sm:text-lg">
                            {moveEmoji[entry.move]} {entry.move}
                        </span>
                        <span className="text-left text-base font-semibold text-amber-300 sm:text-right">
                            {entry.delta > 0 ? `+${entry.delta}` : "0"}
                        </span>
                    </li>
                ))}
            </ul>
        </article>
    );
};
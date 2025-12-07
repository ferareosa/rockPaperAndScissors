import { type FC, useEffect, useState } from "react";
import type { PlayerData } from "../../types";

interface ScoreElProps {
    players: PlayerData[];
    activeIds: number[];
    onRemove?: (id: number) => void;
    onRename?: (id: number, name: string) => void;
}

export const ScoreEl: FC<ScoreElProps> = ({
    players,
    activeIds,
    onRemove,
    onRename,
}) => {
    if (!players.length) {
        return null;
    }

    const sorted = [...players].sort((a, b) => b.score - a.score);

    return (
        <section className="rounded-3xl border border-white/15 bg-slate-900/70 p-5 text-white shadow-inner shadow-black/40 sm:p-6">
            <header className="flex flex-col gap-1">
                <p className="text-xs uppercase tracking-[0.5em] text-white/60">
                    Marcador global
                </p>
                <h2 className="text-2xl font-semibold sm:text-3xl">Arena activa</h2>
            </header>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {sorted.map((player, index) => (
                    <ScoreCard
                        key={player.id}
                        player={player}
                        rank={index + 1}
                        isActive={activeIds.includes(player.id)}
                        onRemove={onRemove}
                        onRename={onRename}
                    />
                ))}
            </ul>
        </section>
    );
};

interface ScoreCardProps {
    player: PlayerData;
    rank: number;
    isActive: boolean;
    onRemove?: (id: number) => void;
    onRename?: (id: number, name: string) => void;
}

const ScoreCard: FC<ScoreCardProps> = ({
    player,
    rank,
    isActive,
    onRemove,
    onRename,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [draftName, setDraftName] = useState(player.name);

    useEffect(() => {
        setDraftName(player.name);
    }, [player.name]);

    const canRename = Boolean(onRename) && !player.isBot;
    const canRemove = Boolean(onRemove) && !player.isBot;

    const handleSave = () => {
        const trimmed = draftName.trim();
        if (!trimmed || !onRename) return;
        onRename(player.id, trimmed);
        setIsEditing(false);
    };

    const baseCardClasses = isActive
        ? "border-emerald-300/60 bg-emerald-500/10"
        : "border-white/10 bg-white/5";

    return (
        <li
            className={`relative overflow-hidden rounded-3xl border px-4 py-4 transition-all sm:px-5 ${baseCardClasses}`}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="w-full sm:pr-6">
                    {isEditing ? (
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-[0.4em] text-white/50">
                                Nuevo nombre
                            </label>
                            <input
                                autoFocus
                                value={draftName}
                                onChange={(event) => setDraftName(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") handleSave();
                                    if (event.key === "Escape") {
                                        setDraftName(player.name);
                                        setIsEditing(false);
                                    }
                                }}
                                className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-base text-white placeholder-white/40 focus:border-fuchsia-300 focus:outline-none"
                                placeholder="Nombre actualizado"
                            />
                        </div>
                    ) : (
                        <p className="text-lg font-semibold tracking-wide sm:text-xl">
                            {player.name}
                            {player.isBot && <span className="text-xs text-white/50"> · CPU</span>}
                        </p>
                    )}
                    <p className="text-sm text-white/70">
                        Puntos: <span className="text-amber-300">{player.score}</span>
                    </p>
                </div>
                <span className="text-sm text-white/50">#{rank}</span>
            </div>

            {(canRename || canRemove) && (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    {canRename && (
                        isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="w-full rounded-2xl border border-emerald-400/60 px-4 py-2 text-sm font-semibold text-emerald-200 transition lg:hover:bg-emerald-500/20 sm:w-auto"
                                >
                                    Guardar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDraftName(player.name);
                                        setIsEditing(false);
                                    }}
                                    className="w-full rounded-2xl border border-white/20 px-4 py-2 text-sm text-white/70 transition lg:hover:bg-white/10 sm:w-auto"
                                >
                                    Cancelar
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="w-full rounded-2xl border border-white/20 px-4 py-2 text-sm text-white/80 transition lg:hover:border-fuchsia-400 lg:hover:text-fuchsia-200 sm:w-auto"
                            >
                                Editar nombre
                            </button>
                        )
                    )}

                    {canRemove && (
                        <button
                            type="button"
                            aria-label={`Eliminar a ${player.name}`}
                            onClick={() => onRemove?.(player.id)}
                            className="w-full rounded-2xl border border-red-500/40 px-4 py-2 text-sm text-red-200 transition lg:hover:bg-red-500/20 sm:w-auto"
                        >
                            Eliminar
                        </button>
                    )}
                </div>
            )}
        </li>
    );
};
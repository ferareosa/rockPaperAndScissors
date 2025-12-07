import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
    ButtonEl,
    HandEl,
    LoadingEl,
    ResultEl,
    ScoreEl,
    TextStyle,
} from "../elements";
import {
    MOVES_ORDER,
    evaluateRound,
    getRandomMove,
} from "../../controllers/Game";
import type { Move, PlayerData, RoundResult } from "../../types";

const STORAGE_KEY = "rps:players";
const BOT_TEMPLATE: PlayerData = {
    id: 0,
    name: "CPU Nova",
    score: 0,
    isBot: true,
};

const ensureBotPresence = (players: PlayerData[]): PlayerData[] => {
    const hasBot = players.some((player) => player.isBot);
    if (hasBot) {
        return players.map((player) =>
            player.isBot ? { ...BOT_TEMPLATE, score: player.score } : player
        );
    }
    return [{ ...BOT_TEMPLATE }, ...players];
};

const sanitizePlayers = (raw: unknown): PlayerData[] => {
    if (!Array.isArray(raw)) return [{ ...BOT_TEMPLATE }];
    const cleaned = raw.reduce<PlayerData[]>((acc, entry) => {
        if (typeof entry?.id !== "number") return acc;
        const score = Number.isFinite(entry?.score) ? Number(entry.score) : 0;
        acc.push({
            id: entry.id,
            name:
                typeof entry?.name === "string" && entry.name.trim().length > 0
                    ? entry.name
                    : `Jugador ${entry.id}`,
            score,
            isBot: entry?.isBot === true,
        });
        return acc;
    }, []);

    return ensureBotPresence(cleaned);
};

const getNextId = (players: PlayerData[]): number =>
    players.reduce((max, player) => Math.max(max, player.id), 0) + 1;

export function MainPage() {
    const [players, setPlayers] = useState<PlayerData[]>([{ ...BOT_TEMPLATE }]);
    const [includeBot, setIncludeBot] = useState(true);
    const [pendingName, setPendingName] = useState("");
    const [selections, setSelections] = useState<Record<number, Move | null>>({});
    const [visibleSelections, setVisibleSelections] = useState<Record<number, Move | null>>({});
    const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
    const [isResultModalOpen, setResultModalOpen] = useState(false);
    const [roundNumber, setRoundNumber] = useState(1);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);
    const nameInputRef = useRef<HTMLInputElement | null>(null);
    const selectionTimers = useRef<Record<number, number>>({});

    const clearSelectionTimer = (playerId: number) => {
        const timerId = selectionTimers.current[playerId];
        if (timerId) {
            clearTimeout(timerId);
            delete selectionTimers.current[playerId];
        }
    };

    const flashSelection = (playerId: number, move: Move) => {
        setVisibleSelections((prev) => ({ ...prev, [playerId]: move }));
        clearSelectionTimer(playerId);
        if (typeof window === "undefined") return;
        const timeoutId = window.setTimeout(() => {
            setVisibleSelections((prev) => ({ ...prev, [playerId]: null }));
            delete selectionTimers.current[playerId];
        }, 1200);
        selectionTimers.current[playerId] = timeoutId;
    };

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const saved = window.localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setPlayers(sanitizePlayers(parsed));
            }
        } catch (error) {
            console.warn("No se pudieron recuperar los jugadores", error);
            setPlayers([{ ...BOT_TEMPLATE }]);
        } finally {
            setIsHydrated(true);
        }
    }, []);

    useEffect(() => {
        if (!isHydrated || typeof window === "undefined") return;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    }, [players, isHydrated]);

    useEffect(() => {
        const humanIds = new Set<number>();
        players.forEach((player) => {
            if (!player.isBot) {
                humanIds.add(player.id);
            }
        });

        setSelections((prev) => {
            const next: Record<number, Move | null> = {};
            players.forEach((player) => {
                if (!player.isBot) {
                    next[player.id] = prev[player.id] ?? null;
                }
            });
            return next;
        });

        setVisibleSelections((prev) => {
            const next: Record<number, Move | null> = {};
            players.forEach((player) => {
                if (!player.isBot) {
                    next[player.id] = prev[player.id] ?? null;
                }
            });
            return next;
        });

        Object.keys(selectionTimers.current).forEach((key) => {
            const id = Number(key);
            if (!humanIds.has(id)) {
                clearSelectionTimer(id);
            }
        });
    }, [players]);

    useEffect(() => {
        return () => {
            Object.values(selectionTimers.current).forEach((timerId) => {
                clearTimeout(timerId);
            });
        };
    }, []);

    const activePlayers = useMemo(
        () => players.filter((player) => (player.isBot ? includeBot : true)),
        [players, includeBot]
    );

    const activeIds = useMemo(
        () => activePlayers.map((player) => player.id),
        [activePlayers]
    );

    const humansReady = activePlayers
        .filter((player) => !player.isBot)
        .every((player) => selections[player.id]);

    const canPlayRound = activePlayers.length >= 2 && humansReady;

    const handleAddPlayer = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmed = pendingName.trim();
        const nextId = getNextId(players);
        const name = trimmed || `Jugador ${nextId}`;

        const newPlayer: PlayerData = {
            id: nextId,
            name,
            score: 0,
        };
        setPlayers((prev) => [...prev, newPlayer]);
        setSelections((prev) => ({ ...prev, [newPlayer.id]: null }));
        setVisibleSelections((prev) => ({ ...prev, [newPlayer.id]: null }));
        setPendingName("");
        nameInputRef.current?.focus();
    };

    const handleRemovePlayer = (id: number) => {
        setPlayers((prev) => prev.filter((player) => player.id !== id));
        setSelections((prev) => {
            const { [id]: _discarded, ...rest } = prev;
            return rest;
        });
        setVisibleSelections((prev) => {
            const { [id]: _removed, ...rest } = prev;
            return rest;
        });
        clearSelectionTimer(id);
    };

    const handleRenamePlayer = (id: number, nextName: string) => {
        setPlayers((prev) =>
            prev.map((player) =>
                player.id === id ? { ...player, name: nextName.trim() || player.name } : player
            )
        );
    };

    const handleResetScores = () => {
        setPlayers((prev) => prev.map((player) => ({ ...player, score: 0 })));
        setRoundResult(null);
        setRoundNumber(1);
        setStatusMessage("Marcador reiniciado");
        setResultModalOpen(false);
    };

    const handleToggleBot = () => {
        setIncludeBot((prev) => !prev);
        setStatusMessage(null);
    };

    const handlePlayerMove = (playerId: number, move: Move) => {
        setSelections((prev) => ({ ...prev, [playerId]: move }));
        flashSelection(playerId, move);
        setStatusMessage(null);
    };

    const closeResultModal = () => {
        setResultModalOpen(false);
    };

    const handlePlayRound = () => {
        if (!canPlayRound) {
            setStatusMessage("Faltan movimientos para lanzar la ronda.");
            return;
        }

        const choices = activePlayers.map((player) => ({
            id: player.id,
            move: player.isBot ? getRandomMove() : selections[player.id]!,
        }));

        const evaluation = evaluateRound(choices);

        setPlayers((prev) =>
            prev.map((player) => {
                const delta = evaluation.deltas.find((entry) => entry.id === player.id)?.delta ?? 0;
                if (!delta) return player;
                return { ...player, score: player.score + delta };
            })
        );

        const breakdown = evaluation.deltas.map((entry) => ({
            ...entry,
            name:
                activePlayers.find((player) => player.id === entry.id)?.name ||
                `Jugador ${entry.id}`,
        }));

        const winnerNames = evaluation.winners
            .map((id) => activePlayers.find((player) => player.id === id)?.name)
            .filter(Boolean)
            .join(" & ");

        const headline = evaluation.isDraw
            ? "Empate perfecto"
            : evaluation.winners.length === 1
                ? `${winnerNames} domina la arena`
                : `Victoria compartida de ${winnerNames}`;

        const flavor = evaluation.isDraw
            ? "Nadie cede terreno; preparen otra batalla."
            : `La mano ganadora sumó ${evaluation.deltas
                    .filter((entry) => evaluation.winners.includes(entry.id))
                    .map((entry) => entry.move)
                    .join(" y ")} para reclamar la ronda.`;

        setRoundResult({
            round: roundNumber,
            headline,
            flavor,
            breakdown,
        });
        setResultModalOpen(true);

        setRoundNumber((prev) => prev + 1);
        setSelections((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((key) => {
                const id = Number(key);
                const player = players.find((entry) => entry.id === id);
                if (!player?.isBot) {
                    next[id] = null;
                }
            });
            return next;
        });
        setVisibleSelections((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((key) => {
                const id = Number(key);
                const player = players.find((entry) => entry.id === id);
                if (!player?.isBot) {
                    next[id] = null;
                }
            });
            return next;
        });
        Object.keys(selectionTimers.current).forEach((key) => {
            const id = Number(key);
            const player = players.find((entry) => entry.id === id);
            if (!player?.isBot) {
                clearSelectionTimer(id);
            }
        });
        setStatusMessage(null);
    };

    const readyContent = (
        <div className="space-y-10">
            <section className="rounded-[2.5rem] border border-white/15 bg-gradient-to-br from-slate-900/70 via-indigo-900/50 to-slate-900/80 p-8 text-white shadow-2xl shadow-indigo-900/40">
                <p className="text-xs uppercase tracking-[0.6em] text-white/60">
                    Multijugador en vivo
                </p>
                <h1
                    className="mt-2 text-3xl uppercase leading-tight text-white sm:text-4xl lg:text-5xl"
                    style={{ fontFamily: "'Odibee Sans', cursive" }}
                >
                    Arena Piedra Papel Tijera
                </h1>
                <p className="mt-3 max-w-2xl text-base text-white/80 sm:text-lg">
                    Invita a tus amigas, asigna jugadas en paralelo y deja que la arena
                    decida. El bot <strong className="text-fuchsia-300">CPU Nova</strong>
                    puede sumarse para mantener la tensión en rondas con un solo
                    contrincante.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <ButtonEl
                        label={includeBot ? "CPU activa" : "CPU en pausa"}
                        onClick={handleToggleBot}
                        variant={includeBot ? "solid" : "outline"}
                        className="w-full sm:w-auto"
                    />
                    <ButtonEl
                        label="Reiniciar marcador"
                        onClick={handleResetScores}
                        variant="outline"
                        className="w-full sm:w-auto"
                    />
                </div>
                <form
                    onSubmit={handleAddPlayer}
                    className="mt-6 flex flex-col gap-4 md:flex-row md:items-center"
                >
                    <input
                        ref={nameInputRef}
                        type="text"
                        value={pendingName}
                        onChange={(event) => setPendingName(event.target.value)}
                        placeholder="Agrega un nuevo jugador"
                        className="flex-1 rounded-[2.5rem] border border-white/20 bg-white/10 px-6 py-4 text-xl uppercase tracking-[0.2em] text-white placeholder:text-white/40 shadow-inner focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none sm:px-7 sm:py-5 sm:text-2xl sm:tracking-[0.35em]"
                    />
                    <div className="w-full shrink-0 md:w-auto">
                        <ButtonEl
                            label="Sumar al lobby"
                            type="submit"
                            className="w-full md:w-auto"
                        />
                    </div>
                </form>
                {statusMessage && (
                    <p className="mt-3 text-sm text-amber-300">{statusMessage}</p>
                )}
            </section>

            <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-white shadow-xl shadow-black/30">
                    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                                Tablero de jugadas
                            </p>
                            <TextStyle className="text-3xl">
                                {activePlayers.length} jugadores activos
                            </TextStyle>
                        </div>
                        <ButtonEl
                            label="Revelar ronda"
                            onClick={handlePlayRound}
                            disabled={!canPlayRound}
                            className="w-full md:w-auto"
                        />
                    </header>

                    <div className="mt-6 space-y-4">
                        {activePlayers.map((player) => (
                            <div
                                key={player.id}
                                className="rounded-3xl border border-white/15 bg-slate-950/40 px-5 py-4"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-lg font-semibold text-white sm:text-xl">
                                            {player.name}
                                        </p>
                                        <p className="text-xs uppercase tracking-[0.35em] text-white/50 sm:tracking-[0.5em]">
                                            {player.isBot ? "CPU" : "Humano"}
                                        </p>
                                    </div>
                                    {!player.isBot && (
                                        <span className="text-base font-bold uppercase tracking-[0.2em] text-white">
                                            {selections[player.id] ? "Listo" : "Pendiente"}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                                    {MOVES_ORDER.map((move) => (
                                        <HandEl
                                            key={`${player.id}-${move}`}
                                            type={move}
                                            selected={visibleSelections[player.id] === move}
                                            disabled={player.isBot}
                                            onSelect={(value) => handlePlayerMove(player.id, value)}
                                        />
                                    ))}
                                    {player.isBot && (
                                        <span className="rounded-2xl border border-dashed border-white/30 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/60">
                                            Movimiento secreto
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="space-y-6">
                    <ResultEl result={roundResult} />
                    <ScoreEl
                        players={players}
                        activeIds={activeIds}
                        onRemove={handleRemovePlayer}
                        onRename={handleRenamePlayer}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 py-10 text-white">
            <div className="mx-auto max-w-6xl px-4 md:px-8">
                {isHydrated ? (
                    readyContent
                ) : (
                    <div className="flex min-h-[60vh] items-center justify-center">
                        <LoadingEl message="Acomodando la arena" />
                    </div>
                )}
            </div>
            {isResultModalOpen && roundResult && (
                <div
                    className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-black/80 px-4 py-8 backdrop-blur"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="flex w-full max-w-4xl flex-col gap-4 rounded-[2.5rem] border border-white/15 bg-slate-950/95 p-6 text-white shadow-[0_20px_80px_rgba(8,0,40,0.8)]">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-3xl uppercase tracking-[0.6em] text-white/60">
                                    Resultado inmediato
                                </p>
                            </div>
                            <ButtonEl label="Cerrar" onClick={closeResultModal} variant="outline" size="sm" />
                        </div>
                        <div className="max-h-[70vh] overflow-y-auto pr-1">
                            <ResultEl result={roundResult} />
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
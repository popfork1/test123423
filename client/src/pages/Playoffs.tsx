import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PlayoffMatch } from "@shared/schema";
import { TEAMS } from "@/lib/teams";

interface BracketTeam {
  id: string;
  name: string;
  seed: number;
}

interface BracketMatch {
  id: string;
  dbId?: string;
  team1?: BracketTeam;
  team2?: BracketTeam;
  winner?: string;
  round: "wildcard" | "divisional" | "conference" | "super_bowl";
  matchNumber: number;
}

interface BoxPosition {
  id: string;
  x: number;
  y: number;
}

const AVAILABLE_TEAMS = Object.keys(TEAMS);

// Seed pairings for wildcard round
const SEED_PAIRINGS = [
  { seeds: [5, 12], matchNumber: 1 },
  { seeds: [8, 9], matchNumber: 2 },
  { seeds: [6, 11], matchNumber: 3 },
  { seeds: [7, 10], matchNumber: 4 },
];

export default function Playoffs() {
  const { isAuthenticated } = useAuth();
  const dragStateRef = useRef<{ boxId: string; offsetX: number; offsetY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [seeds, setSeeds] = useState<BracketTeam[]>(
    Array.from({ length: 12 }, (_, i) => ({
      id: `seed-${i + 1}`,
      name: "",
      seed: i + 1,
    }))
  );
  const [matches, setMatches] = useState<BracketMatch[]>([
    { id: "wc1", round: "wildcard", matchNumber: 1, team1: undefined, team2: undefined },
    { id: "wc2", round: "wildcard", matchNumber: 2, team1: undefined, team2: undefined },
    { id: "wc3", round: "wildcard", matchNumber: 3, team1: undefined, team2: undefined },
    { id: "wc4", round: "wildcard", matchNumber: 4, team1: undefined, team2: undefined },
    { id: "div1", round: "divisional", matchNumber: 1, team1: undefined, team2: undefined },
    { id: "div2", round: "divisional", matchNumber: 2, team1: undefined, team2: undefined },
    { id: "div3", round: "divisional", matchNumber: 3, team1: undefined, team2: undefined },
    { id: "div4", round: "divisional", matchNumber: 4, team1: undefined, team2: undefined },
    { id: "conf1", round: "conference", matchNumber: 1, team1: undefined, team2: undefined },
    { id: "conf2", round: "conference", matchNumber: 2, team1: undefined, team2: undefined },
    { id: "sb", round: "super_bowl", matchNumber: 1, team1: undefined, team2: undefined },
  ]);
  const [boxPositions, setBoxPositions] = useState<Record<string, BoxPosition>>({});
  const [draggedBox, setDraggedBox] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const { data: dbMatches, refetch: refetchMatches } = useQuery<PlayoffMatch[]>({
    queryKey: ["/api/playoffs"],
    enabled: false,
  });

  useEffect(() => {
    const init = async () => {
      if (initialized) return;
      try {
        if (isAuthenticated) {
          await apiRequest("POST", "/api/playoffs/init");
        }
        await refetchMatches();
        setInitialized(true);
      } catch (error) {
        console.error("Error initializing bracket:", error);
      }
    };
    init();
  }, [isAuthenticated, initialized, refetchMatches]);

  useEffect(() => {
    if (!dbMatches || dbMatches.length === 0) return;
    
    const newMatches = matches.map((match) => {
      const dbMatch = dbMatches.find((m) => m.round === match.round && m.matchNumber === match.matchNumber);
      
      if (dbMatch) {
        return {
          ...match,
          dbId: dbMatch.id,
          team1: dbMatch.team1 ? { id: `${match.id}-t1`, name: dbMatch.team1, seed: 0 } : undefined,
          team2: dbMatch.team2 ? { id: `${match.id}-t2`, name: dbMatch.team2, seed: 0 } : undefined,
          winner: dbMatch.winner,
        };
      }
      return match;
    });
    setMatches(newMatches);
  }, [dbMatches]);

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; team1?: string; team2?: string; winner?: string }) => {
      const res = await apiRequest("PATCH", `/api/playoffs/${data.id}`, {
        team1: data.team1 || null,
        team2: data.team2 || null,
        winner: data.winner || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playoffs"] });
      refetchMatches();
    },
  });

  const updateMatch = (matchId: string, isTeam1: boolean, value: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match || !match.dbId) return;

    const updatedMatches = matches.map((m) =>
      m.id === matchId 
        ? { ...m, [isTeam1 ? "team1" : "team2"]: value ? { id: `${matchId}-t${isTeam1 ? 1 : 2}`, name: value, seed: 0 } : undefined }
        : m
    );
    setMatches(updatedMatches);

    const updated = updatedMatches.find((m) => m.id === matchId);
    if (updated) {
      updateMutation.mutate({
        id: updated.dbId,
        team1: updated.team1?.name,
        team2: updated.team2?.name,
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent, boxId: string) => {
    if (!isAuthenticated) return;
    e.preventDefault();
    e.stopPropagation();
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (!containerRect) return;

    dragStateRef.current = {
      boxId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    setDraggedBox(boxId);
  };

  useEffect(() => {
    if (!isAuthenticated || !draggedBox || !dragStateRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - containerRect.left - dragStateRef.current.offsetX;
      const y = e.clientY - containerRect.top - dragStateRef.current.offsetY;

      setBoxPositions(prev => ({
        ...prev,
        [dragStateRef.current!.boxId]: {
          id: dragStateRef.current!.boxId,
          x,
          y,
        }
      }));
    };

    const handleMouseUp = () => {
      dragStateRef.current = null;
      setDraggedBox(null);
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseup", handleMouseUp, { passive: true });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedBox, isAuthenticated]);

  const SeedBox = ({ seed }: { seed: BracketTeam }) => (
    <div className="border-2 border-border bg-card px-2 py-1 w-40 text-xs font-bold flex items-center gap-2 h-9 rounded flex-shrink-0" data-testid={`seed-${seed.seed}`}>
      <span className="text-muted-foreground text-xs">#{seed.seed}</span>
      <span className="truncate flex-1">{seed.name || "—"}</span>
    </div>
  );

  const MatchBox = ({ match, isTeam1, team }: { match: BracketMatch; isTeam1: boolean; team?: BracketTeam }) => {
    const logoUrl = team ? TEAMS[team.name as keyof typeof TEAMS] : undefined;
    const pos = boxPositions[match.id];
    const isDragging = draggedBox === match.id;
    
    const style = isAuthenticated && pos ? {
      position: "absolute" as const,
      left: `${pos.x}px`,
      top: `${pos.y}px`,
      zIndex: isDragging ? 50 : 10,
      transition: isDragging ? "none" : "transform 0.05s ease-out",
    } : {
      zIndex: isDragging ? 50 : 10,
    };
    
    return (
      <div 
        className={`border border-border bg-card px-2 py-1 w-40 text-xs font-medium flex items-center gap-2 h-9 rounded flex-shrink-0 ${isAuthenticated ? "cursor-grab active:cursor-grabbing" : ""} ${isDragging ? "opacity-90 shadow-lg" : ""}`}
        style={style}
        onMouseDown={(e) => handleMouseDown(e, match.id)}
        data-testid={isTeam1 ? `team1-${match.id}` : `team2-${match.id}`}
      >
        {logoUrl && (
          <img src={logoUrl} alt={team?.name} className="w-4 h-4 object-contain flex-shrink-0 pointer-events-none" />
        )}
        <div className="flex-1 min-w-0 pointer-events-none">
          {isAuthenticated ? (
            <div className="truncate">{team?.name || "—"}</div>
          ) : (
            <span className="truncate">{team?.name || "—"}</span>
          )}
        </div>
      </div>
    );
  };

  const EditableMatchBox = ({ match }: { match: BracketMatch }) => {
    const pos = boxPositions[match.id];
    const isDragging = draggedBox === match.id;
    const style = isAuthenticated && pos ? {
      position: "absolute" as const,
      left: `${pos.x}px`,
      top: `${pos.y}px`,
      zIndex: isDragging ? 51 : 11,
    } : {
      zIndex: isDragging ? 51 : 11,
    };

    return (
      <div style={style} className="flex flex-col gap-0.5" data-testid={`card-match-${match.id}`}>
        <div onMouseDown={(e) => { if (!isAuthenticated) return; e.stopPropagation(); handleMouseDown(e, match.id); }}>
          <MatchBox match={match} isTeam1={true} team={match.team1} />
        </div>
        <div 
          onMouseDown={(e) => { 
            if (!isAuthenticated) return; 
            e.stopPropagation(); 
            handleMouseDown(e, match.id); 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {isAuthenticated ? (
            <Select value={match.team1?.name || ""} onValueChange={(value) => {
              updateMatch(match.id, true, value);
            }}>
              <SelectTrigger className="h-5 border-0 p-0 text-xs bg-transparent focus:ring-0 w-40 px-2 py-1" data-testid={`input-team1-${match.id}`}>
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_TEAMS.map((t) => (
                  <SelectItem key={t} value={t}>
                    <div className="flex items-center gap-2">
                      <img src={TEAMS[t as keyof typeof TEAMS]} alt={t} className="w-4 h-4 object-contain" />
                      <span>{t}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="border border-border bg-card px-2 py-1 w-40 text-xs font-medium flex items-center gap-2 h-9 rounded">
              <span className="truncate">{match.team1?.name || "—"}</span>
            </div>
          )}
        </div>
        <div 
          onMouseDown={(e) => { 
            if (!isAuthenticated) return; 
            e.stopPropagation(); 
            handleMouseDown(e, match.id); 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {isAuthenticated ? (
            <Select value={match.team2?.name || ""} onValueChange={(value) => {
              updateMatch(match.id, false, value);
            }}>
              <SelectTrigger className="h-5 border-0 p-0 text-xs bg-transparent focus:ring-0 w-40 px-2 py-1" data-testid={`input-team2-${match.id}`}>
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_TEAMS.map((t) => (
                  <SelectItem key={t} value={t}>
                    <div className="flex items-center gap-2">
                      <img src={TEAMS[t as keyof typeof TEAMS]} alt={t} className="w-4 h-4 object-contain" />
                      <span>{t}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="border border-border bg-card px-2 py-1 w-40 text-xs font-medium flex items-center gap-2 h-9 rounded">
              <span className="truncate">{match.team2?.name || "—"}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getMatchesForRound = (round: "wildcard" | "divisional" | "conference" | "super_bowl") => {
    return matches.filter((m) => m.round === round).sort((a, b) => a.matchNumber - b.matchNumber);
  };

  const wcMatches = getMatchesForRound("wildcard");
  const divMatches = getMatchesForRound("divisional");
  const confMatches = getMatchesForRound("conference");
  const sbMatches = getMatchesForRound("super_bowl");

  return (
    <div className="min-h-screen bg-background py-12 flex flex-col items-center justify-center overflow-hidden">
      {isAuthenticated && (
        <div className="text-center mb-4 text-sm text-muted-foreground">
          Drag boxes to reposition bracket
        </div>
      )}
      <div 
        ref={containerRef}
        className="relative w-full overflow-auto flex justify-center"
        style={{ userSelect: draggedBox ? "none" : "auto" }}
      >
        <div className="flex gap-20 pb-8 pt-8" style={{ alignItems: "center", minHeight: "600px", position: "relative" }}>
          {/* SEEDS COLUMN */}
          <div className="flex flex-col gap-8 flex-shrink-0">
            {SEED_PAIRINGS.map((pairing, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <SeedBox seed={seeds[pairing.seeds[0] - 1]} />
                <SeedBox seed={seeds[pairing.seeds[1] - 1]} />
              </div>
            ))}
          </div>

          {/* WILDCARD COLUMN */}
          <div className="flex flex-col gap-20 flex-shrink-0 relative" style={{ minHeight: "500px" }}>
            {wcMatches.map((match) => (
              <EditableMatchBox key={match.id} match={match} />
            ))}
          </div>

          {/* DIVISIONAL COLUMN */}
          <div className="flex flex-col gap-20 flex-shrink-0 relative" style={{ minHeight: "500px" }}>
            {divMatches.map((match) => (
              <EditableMatchBox key={match.id} match={match} />
            ))}
          </div>

          {/* CONFERENCE COLUMN */}
          <div className="flex flex-col gap-32 flex-shrink-0 justify-center relative" style={{ minHeight: "500px" }}>
            {confMatches.map((match) => (
              <EditableMatchBox key={match.id} match={match} />
            ))}
          </div>

          {/* SUPER BOWL COLUMN */}
          <div className="flex flex-col gap-44 flex-shrink-0 justify-center relative" style={{ minHeight: "500px" }}>
            {sbMatches.map((match) => (
              <EditableMatchBox key={match.id} match={match} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

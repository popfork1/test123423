import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { RotateCcw } from "lucide-react";
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

const AVAILABLE_TEAMS = Object.keys(TEAMS);

export default function Playoffs() {
  const { isAuthenticated } = useAuth();
  const [seeds, setSeeds] = useState<BracketTeam[]>(
    Array.from({ length: 12 }, (_, i) => ({
      id: `seed-${i + 1}`,
      name: "",
      seed: i + 1,
    }))
  );
  const [matches, setMatches] = useState<BracketMatch[]>([
    // Wildcard round (4 matches)
    { id: "wc1", round: "wildcard", matchNumber: 1, team1: undefined, team2: undefined },
    { id: "wc2", round: "wildcard", matchNumber: 2, team1: undefined, team2: undefined },
    { id: "wc3", round: "wildcard", matchNumber: 3, team1: undefined, team2: undefined },
    { id: "wc4", round: "wildcard", matchNumber: 4, team1: undefined, team2: undefined },
    // Divisional round (4 matches)
    { id: "div1", round: "divisional", matchNumber: 1, team1: undefined, team2: undefined },
    { id: "div2", round: "divisional", matchNumber: 2, team1: undefined, team2: undefined },
    { id: "div3", round: "divisional", matchNumber: 3, team1: undefined, team2: undefined },
    { id: "div4", round: "divisional", matchNumber: 4, team1: undefined, team2: undefined },
    // Conference round (2 matches)
    { id: "conf1", round: "conference", matchNumber: 1, team1: undefined, team2: undefined },
    { id: "conf2", round: "conference", matchNumber: 2, team1: undefined, team2: undefined },
    // Super Bowl
    { id: "sb", round: "super_bowl", matchNumber: 1, team1: undefined, team2: undefined },
  ]);
  const [initialized, setInitialized] = useState(false);

  const { data: dbMatches, refetch: refetchMatches } = useQuery<PlayoffMatch[]>({
    queryKey: ["/api/playoffs"],
    enabled: false,
  });

  // Initialize and load bracket
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

  // Update bracket when dbMatches loads
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

  const resetMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/playoffs/reset");
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

  const handleReset = () => {
    if (confirm("Are you sure you want to reset the entire bracket?")) {
      resetMutation.mutate();
    }
  };

  const TeamBox = ({ team, matchId, isTeam1 }: { team?: BracketTeam; matchId: string; isTeam1: boolean }) => {
    const logoUrl = team ? TEAMS[team.name as keyof typeof TEAMS] : undefined;
    
    return (
      <div className="border border-border bg-card px-3 py-2 min-w-40 text-xs font-medium flex items-center gap-2 h-10 rounded" data-testid={isTeam1 ? `team1-${matchId}` : `team2-${matchId}`}>
        {logoUrl && (
          <img src={logoUrl} alt={team?.name} className="w-5 h-5 object-contain flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          {isAuthenticated ? (
            <Select value={team?.name || ""} onValueChange={(value) => {
              updateMatch(matchId, isTeam1, value);
            }}>
              <SelectTrigger className="h-5 border-0 p-0 text-xs bg-transparent focus:ring-0" data-testid={isTeam1 ? `input-team1-${matchId}` : `input-team2-${matchId}`}>
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
            <span className="truncate">{team?.name || "—"}</span>
          )}
        </div>
      </div>
    );
  };

  const MatchColumn = ({ round, title }: { round: "wildcard" | "divisional" | "conference" | "super_bowl"; title: string }) => {
    const roundMatches = matches.filter((m) => m.round === round);
    const spacing = round === "wildcard" ? "gap-8" : round === "divisional" ? "gap-12" : round === "conference" ? "gap-20" : "gap-32";
    
    return (
      <div className="flex flex-col items-center">
        <div className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider">{title}</div>
        <div className={`flex flex-col ${spacing}`}>
          {roundMatches.map((match) => (
            <div key={match.id} className="flex flex-col gap-0.5" data-testid={`card-match-${match.id}`}>
              <TeamBox team={match.team1} matchId={match.id} isTeam1={true} />
              <TeamBox team={match.team2} matchId={match.id} isTeam1={false} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold" data-testid="text-page-title">BFFL Playoff Bracket</h1>
        <p className="text-muted-foreground text-sm">12 Team Championship Bracket</p>
        {isAuthenticated && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="mt-4 gap-2"
            data-testid="button-reset-bracket"
            disabled={resetMutation.isPending}
          >
            <RotateCcw className="w-4 h-4" />
            Reset Bracket
          </Button>
        )}
      </div>

      <div className="overflow-x-auto px-4">
        <div className="flex gap-6 items-start min-w-max pb-8">
          {/* Seeds Column */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider">Seeds</div>
            <div className="flex flex-col gap-8">
              {seeds.map((seed) => (
                <div
                  key={seed.id}
                  className="border border-border bg-card px-3 py-2 min-w-40 text-xs font-medium flex items-center gap-2 h-10 rounded"
                  data-testid={`seed-${seed.seed}`}
                >
                  <div className="text-muted-foreground font-bold">#{seed.seed}</div>
                  <div className="flex-1 min-w-0 truncate">{seed.name || "—"}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Matchup Columns */}
          <MatchColumn round="wildcard" title="Wildcard" />
          <MatchColumn round="divisional" title="Divisional" />
          <MatchColumn round="conference" title="Conference" />
          <MatchColumn round="super_bowl" title="Super Bowl" />
        </div>
      </div>
    </div>
  );
}

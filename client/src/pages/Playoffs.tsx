import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { RotateCcw } from "lucide-react";
import type { PlayoffMatch } from "@shared/schema";

interface BracketTeam {
  id: string;
  name: string;
}

interface BracketMatch {
  id: string;
  dbId?: string;
  team1?: BracketTeam;
  team2?: BracketTeam;
  winner?: string;
  round: number;
  side: "left" | "right";
  position: number;
}

const AVAILABLE_TEAMS = [
  "Atlanta Falcons",
  "Tampa Bay Buccaneers",
  "Jacksonville Jaguars",
  "Los Angeles Rams",
  "Baltimore Ravens",
  "Miami Dolphins",
  "Chicago Bears",
  "Houston Texans",
  "New Orleans Saints",
  "San Francisco 49ers",
  "Kansas City Chiefs",
  "Detroit Lions",
  "Philadelphia Eagles",
  "Arizona Cardinals",
  "Dallas Cowboys",
  "Buffalo Bills",
];

function getMatchNumber(round: number, side: "left" | "right", position: number): number {
  if (round === 1) return side === "left" ? position + 1 : position + 3;
  if (round === 2) return side === "left" ? 1 : 2;
  if (round === 3) return side === "left" ? 1 : 2;
  return 1;
}

function getDBRound(round: number): string {
  if (round === 1) return "wildcard";
  if (round === 2) return "divisional";
  if (round === 3) return "conference";
  return "super_bowl";
}

export default function Playoffs() {
  const { isAuthenticated } = useAuth();
  const [bracket, setBracket] = useState<BracketMatch[]>([
    { id: "l1_m1", round: 1, side: "left", position: 0, team1: undefined, team2: undefined },
    { id: "l1_m2", round: 1, side: "left", position: 1, team1: undefined, team2: undefined },
    { id: "l2_m1", round: 2, side: "left", position: 0, team1: undefined, team2: undefined },
    { id: "l3_m1", round: 3, side: "left", position: 0, team1: undefined, team2: undefined },
    { id: "r3_m1", round: 3, side: "right", position: 0, team1: undefined, team2: undefined },
    { id: "r2_m1", round: 2, side: "right", position: 0, team1: undefined, team2: undefined },
    { id: "r1_m1", round: 1, side: "right", position: 0, team1: undefined, team2: undefined },
    { id: "r1_m2", round: 1, side: "right", position: 1, team1: undefined, team2: undefined },
    { id: "finals", round: 4, side: "left", position: 0, team1: undefined, team2: undefined },
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
        await apiRequest("POST", "/api/playoffs/init");
        await refetchMatches();
        setInitialized(true);
      } catch (error) {
        console.error("Error initializing bracket:", error);
      }
    };
    init();
  }, [initialized, refetchMatches]);

  // Update bracket when dbMatches loads
  useEffect(() => {
    if (!dbMatches || dbMatches.length === 0) return;
    
    const newBracket = bracket.map((match) => {
      const round = getDBRound(match.round);
      const matchNumber = getMatchNumber(match.round, match.side, match.position);
      const dbMatch = dbMatches.find((m) => m.round === round && m.matchNumber === matchNumber);
      
      if (dbMatch) {
        return {
          ...match,
          dbId: dbMatch.id,
          team1: dbMatch.team1 ? { id: `${match.id}-t1`, name: dbMatch.team1 } : undefined,
          team2: dbMatch.team2 ? { id: `${match.id}-t2`, name: dbMatch.team2 } : undefined,
          winner: dbMatch.winner,
        };
      }
      return match;
    });
    setBracket(newBracket);
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

  const updateMatch = (matchId: string, field: string, value: any) => {
    const match = bracket.find((m) => m.id === matchId);
    if (!match || !match.dbId) {
      console.warn(`Match ${matchId} not found or no dbId:`, match);
      return;
    }

    const updatedBracket = bracket.map((m) =>
      m.id === matchId ? { ...m, [field]: value } : m
    );
    setBracket(updatedBracket);

    const updated = updatedBracket.find((m) => m.id === matchId);
    if (updated) {
      updateMutation.mutate({
        id: updated.dbId,
        team1: updated.team1?.name,
        team2: updated.team2?.name,
        winner: updated.winner,
      });
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset the entire bracket?")) {
      resetMutation.mutate();
    }
  };

  const getMatches = (round: number, side: "left" | "right") => {
    return bracket.filter((m) => m.round === round && m.side === side).sort((a, b) => a.position - b.position);
  };

  const MatchCard = ({ match }: { match: BracketMatch }) => (
    <div className="flex flex-col gap-1" data-testid={`card-match-${match.id}`}>
      <div className="border border-border bg-card px-3 py-1 min-w-36 text-xs font-medium" data-testid={`team1-${match.id}`}>
        {isAuthenticated ? (
          <Select value={match.team1?.name || ""} onValueChange={(value) => {
            updateMatch(match.id, "team1", value ? { id: `${match.id}-t1`, name: value } : undefined);
          }}>
            <SelectTrigger className="h-6 border-0 p-0 text-xs bg-transparent focus:ring-0" data-testid={`input-team1-${match.id}`}>
              <SelectValue placeholder="Team" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_TEAMS.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span>{match.team1?.name || "TBD"}</span>
        )}
      </div>
      <div className="border border-border bg-card px-3 py-1 min-w-36 text-xs font-medium" data-testid={`team2-${match.id}`}>
        {isAuthenticated ? (
          <Select value={match.team2?.name || ""} onValueChange={(value) => {
            updateMatch(match.id, "team2", value ? { id: `${match.id}-t2`, name: value } : undefined);
          }}>
            <SelectTrigger className="h-6 border-0 p-0 text-xs bg-transparent focus:ring-0" data-testid={`input-team2-${match.id}`}>
              <SelectValue placeholder="Team" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_TEAMS.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span>{match.team2?.name || "TBD"}</span>
        )}
      </div>
      {isAuthenticated && match.team1 && match.team2 && (
        <div className="flex gap-1 mt-0.5">
          <Button variant={match.winner === match.team1.id ? "default" : "outline"} size="sm" onClick={() => updateMatch(match.id, "winner", match.team1?.id)} className="flex-1 h-5 text-xs px-1" data-testid={`button-winner1-${match.id}`}>W</Button>
          <Button variant={match.winner === match.team2?.id ? "default" : "outline"} size="sm" onClick={() => updateMatch(match.id, "winner", match.team2?.id)} className="flex-1 h-5 text-xs px-1" data-testid={`button-winner2-${match.id}`}>W</Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold" data-testid="text-page-title">BFFL Playoff Bracket</h1>
        <p className="text-muted-foreground text-sm">12 Team Bracket</p>
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
      </div>
      <div className="flex justify-center overflow-x-auto px-4">
        <div className="flex gap-4 items-center min-w-max">
          <div className="flex gap-2">
            <div className="flex flex-col gap-32">
              <div className="text-xs font-bold text-muted-foreground text-center mb-2">WILDCARD</div>
              {getMatches(1, "left").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
            
            <div className="flex flex-col gap-40 justify-center">
              <div className="text-xs font-bold text-muted-foreground text-center mb-2">DIVISIONAL</div>
              {getMatches(2, "left").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>

            <div className="flex flex-col justify-center">
              <div className="text-xs font-bold text-muted-foreground text-center mb-2">CONFERENCE</div>
              {getMatches(3, "left").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-6">
            <div className="text-lg font-bold text-primary">SUPER BOWL</div>
            {bracket.filter(m => m.id === "finals").map((m) => <MatchCard key={m.id} match={m} />)}
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col justify-center">
              <div className="text-xs font-bold text-muted-foreground text-center mb-2">CONFERENCE</div>
              {getMatches(3, "right").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>

            <div className="flex flex-col gap-40 justify-center">
              <div className="text-xs font-bold text-muted-foreground text-center mb-2">DIVISIONAL</div>
              {getMatches(2, "right").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
            
            <div className="flex flex-col gap-32">
              <div className="text-xs font-bold text-muted-foreground text-center mb-2">WILDCARD</div>
              {getMatches(1, "right").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

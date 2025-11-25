import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BracketTeam {
  id: string;
  name: string;
}

interface BracketMatch {
  id: string;
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

export default function Playoffs() {
  const { isAuthenticated } = useAuth();
  const [bracket, setBracket] = useState<BracketMatch[]>([
    // LEFT SIDE - Round 1 (2 matches - outermost)
    { id: "l1_m1", round: 1, side: "left", position: 0, team1: undefined, team2: undefined },
    { id: "l1_m2", round: 1, side: "left", position: 1, team1: undefined, team2: undefined },
    // LEFT SIDE - Round 2 (1 match)
    { id: "l2_m1", round: 2, side: "left", position: 0, team1: undefined, team2: undefined },
    // LEFT SIDE - Round 3 (1 match)
    { id: "l3_m1", round: 3, side: "left", position: 0, team1: undefined, team2: undefined },
    
    // RIGHT SIDE - Round 3 (1 match)
    { id: "r3_m1", round: 3, side: "right", position: 0, team1: undefined, team2: undefined },
    // RIGHT SIDE - Round 2 (1 match)
    { id: "r2_m1", round: 2, side: "right", position: 0, team1: undefined, team2: undefined },
    // RIGHT SIDE - Round 1 (2 matches - outermost)
    { id: "r1_m1", round: 1, side: "right", position: 0, team1: undefined, team2: undefined },
    { id: "r1_m2", round: 1, side: "right", position: 1, team1: undefined, team2: undefined },
    
    // FINALS (center)
    { id: "finals", round: 4, side: "left", position: 0, team1: undefined, team2: undefined },
  ]);

  const updateMatch = (matchId: string, field: string, value: any) => {
    if (!isAuthenticated) return;
    setBracket(
      bracket.map((match) =>
        match.id === matchId ? { ...match, [field]: value } : match
      )
    );
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
        <h1 className="text-4xl font-bold" data-testid="text-page-title">BFFL Playoff Bracket
</h1>
        <p className="text-muted-foreground text-sm">12 Team Bracket</p>
      </div>
      <div className="flex justify-center overflow-x-auto px-4">
        <div className="flex gap-4 items-center min-w-max">
          {/* LEFT SIDE - Outside to Inside */}
          <div className="flex gap-2">
            {/* Round 1 - Outermost */}
            <div className="flex flex-col gap-32">
              {getMatches(1, "left").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
            
            {/* Round 2 */}
            <div className="flex flex-col gap-40 justify-center">
              {getMatches(2, "left").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>

            {/* Round 3 - Innermost */}
            <div className="flex flex-col justify-center">
              {getMatches(3, "left").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </div>

          {/* CENTER - FINALS */}
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="text-lg font-bold text-primary">FINALS</div>
            {bracket.filter(m => m.id === "finals").map((m) => <MatchCard key={m.id} match={m} />)}
          </div>

          {/* RIGHT SIDE - Outside to Inside */}
          <div className="flex gap-2">
            {/* Round 3 - Innermost */}
            <div className="flex flex-col justify-center">
              {getMatches(3, "right").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>

            {/* Round 2 */}
            <div className="flex flex-col gap-40 justify-center">
              {getMatches(2, "right").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
            
            {/* Round 1 - Outermost */}
            <div className="flex flex-col gap-32">
              {getMatches(1, "right").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  "Oregon",
  "Missouri",
  "Michigan",
  "Alabama",
  "Florida State",
  "Liberty",
  "Penn State",
  "Ohio State",
  "Washington",
  "Texas",
  "Georgia",
  "Ole Miss",
];

export default function Playoffs() {
  const { isAuthenticated } = useAuth();
  const [bracket, setBracket] = useState<BracketMatch[]>([
    // LEFT SIDE - Round 1 (3 matches - outermost)
    { id: "l1_m1", round: 1, side: "left", position: 0, team1: undefined, team2: undefined },
    { id: "l1_m2", round: 1, side: "left", position: 1, team1: undefined, team2: undefined },
    { id: "l1_m3", round: 1, side: "left", position: 2, team1: undefined, team2: undefined },
    // LEFT SIDE - Round 2 (2 matches)
    { id: "l2_m1", round: 2, side: "left", position: 0, team1: undefined, team2: undefined },
    { id: "l2_m2", round: 2, side: "left", position: 1, team1: undefined, team2: undefined },
    // LEFT SIDE - Round 3 (1 match)
    { id: "l3_m1", round: 3, side: "left", position: 0, team1: undefined, team2: undefined },
    
    // RIGHT SIDE - Round 3 (1 match)
    { id: "r3_m1", round: 3, side: "right", position: 0, team1: undefined, team2: undefined },
    // RIGHT SIDE - Round 2 (2 matches)
    { id: "r2_m1", round: 2, side: "right", position: 0, team1: undefined, team2: undefined },
    { id: "r2_m2", round: 2, side: "right", position: 1, team1: undefined, team2: undefined },
    // RIGHT SIDE - Round 1 (3 matches - outermost)
    { id: "r1_m1", round: 1, side: "right", position: 0, team1: undefined, team2: undefined },
    { id: "r1_m2", round: 1, side: "right", position: 1, team1: undefined, team2: undefined },
    { id: "r1_m3", round: 1, side: "right", position: 2, team1: undefined, team2: undefined },
    
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
    <div className="bg-card border border-border rounded w-40 text-xs" data-testid={`card-match-${match.id}`}>
      <div className="p-2 space-y-1">
        <div>
          {isAuthenticated ? (
            <Input
              list={`teams-${match.id}-1`}
              value={match.team1?.name || ""}
              onChange={(e) => {
                updateMatch(match.id, "team1", e.target.value ? { id: `${match.id}-t1`, name: e.target.value } : undefined);
              }}
              placeholder="Team"
              className="text-xs h-7"
              data-testid={`input-team1-${match.id}`}
            />
          ) : (
            <div className="font-medium text-xs px-2 py-1">{match.team1?.name || "TBD"}</div>
          )}
          <datalist id={`teams-${match.id}-1`}>
            {AVAILABLE_TEAMS.map((t) => <option key={t} value={t} />)}
          </datalist>
        </div>
        <div className="h-px bg-border" />
        <div>
          {isAuthenticated ? (
            <Input
              list={`teams-${match.id}-2`}
              value={match.team2?.name || ""}
              onChange={(e) => {
                updateMatch(match.id, "team2", e.target.value ? { id: `${match.id}-t2`, name: e.target.value } : undefined);
              }}
              placeholder="Team"
              className="text-xs h-7"
              data-testid={`input-team2-${match.id}`}
            />
          ) : (
            <div className="font-medium text-xs px-2 py-1">{match.team2?.name || "TBD"}</div>
          )}
          <datalist id={`teams-${match.id}-2`}>
            {AVAILABLE_TEAMS.map((t) => <option key={t} value={t} />)}
          </datalist>
        </div>
      </div>
      {isAuthenticated && match.team1 && match.team2 && (
        <div className="flex gap-0.5 p-1 border-t">
          <Button variant={match.winner === match.team1.id ? "default" : "outline"} size="sm" onClick={() => updateMatch(match.id, "winner", match.team1?.id)} className="flex-1 h-6 text-xs" data-testid={`button-winner1-${match.id}`}>W</Button>
          <Button variant={match.winner === match.team2?.id ? "default" : "outline"} size="sm" onClick={() => updateMatch(match.id, "winner", match.team2?.id)} className="flex-1 h-6 text-xs" data-testid={`button-winner2-${match.id}`}>W</Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold" data-testid="text-page-title">College Football Playoff</h1>
        <p className="text-muted-foreground text-sm">12 Team Bracket</p>
      </div>

      <div className="flex justify-center overflow-x-auto px-4">
        <div className="flex gap-12 items-center min-w-max">
          {/* LEFT SIDE - Outside to Inside */}
          <div className="flex gap-8">
            {/* Round 1 - Outermost */}
            <div className="flex flex-col gap-12">
              {getMatches(1, "left").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
            
            {/* Round 2 */}
            <div className="flex flex-col gap-20 justify-center">
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
          <div className="flex gap-8">
            {/* Round 3 - Innermost */}
            <div className="flex flex-col justify-center">
              {getMatches(3, "right").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>

            {/* Round 2 */}
            <div className="flex flex-col gap-20 justify-center">
              {getMatches(2, "right").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
            
            {/* Round 1 - Outermost */}
            <div className="flex flex-col gap-12">
              {getMatches(1, "right").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

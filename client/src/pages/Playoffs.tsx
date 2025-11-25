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
    // LEFT SIDE - Round 1 (3 matches)
    { id: "l1_m1", round: 1, side: "left", position: 0, team1: undefined, team2: undefined },
    { id: "l1_m2", round: 1, side: "left", position: 1, team1: undefined, team2: undefined },
    { id: "l1_m3", round: 1, side: "left", position: 2, team1: undefined, team2: undefined },
    // LEFT SIDE - Round 2 (1 match)
    { id: "l2_m1", round: 2, side: "left", position: 0, team1: undefined, team2: undefined },
    
    // RIGHT SIDE - Round 1 (3 matches)
    { id: "r1_m1", round: 1, side: "right", position: 0, team1: undefined, team2: undefined },
    { id: "r1_m2", round: 1, side: "right", position: 1, team1: undefined, team2: undefined },
    { id: "r1_m3", round: 1, side: "right", position: 2, team1: undefined, team2: undefined },
    // RIGHT SIDE - Round 2 (1 match)
    { id: "r2_m1", round: 2, side: "right", position: 0, team1: undefined, team2: undefined },
    
    // CHAMPIONSHIP
    { id: "championship", round: 3, side: "left", position: 0, team1: undefined, team2: undefined },
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
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold" data-testid="text-page-title">College Football Playoff - 12 Team</h1>
        <p className="text-muted-foreground text-sm">BFFL Season 1 - Championship Bracket</p>
      </div>

      <div className="flex justify-center overflow-x-auto px-4">
        <div className="flex gap-8 items-center min-w-max py-8">
          {/* LEFT SIDE */}
          <div className="flex flex-col gap-8">
            {/* Left Round 1 */}
            <div className="flex flex-col gap-16">
              {getMatches(1, "left").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
            
            {/* Left Round 2 */}
            <div className="flex flex-col gap-16 justify-center">
              {getMatches(2, "left").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </div>

          {/* CENTER - Championship */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="text-sm font-bold text-primary">CHAMPIONSHIP</div>
            {bracket.filter(m => m.id === "championship").map((m) => <MatchCard key={m.id} match={m} />)}
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col gap-8">
            {/* Right Round 2 */}
            <div className="flex flex-col gap-16 justify-center">
              {getMatches(2, "right").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
            
            {/* Right Round 1 */}
            <div className="flex flex-col gap-16">
              {getMatches(1, "right").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

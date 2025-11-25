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
    // LEFT SIDE - 4 play-in matches
    { id: "l_pi1", round: 1, side: "left", team1: undefined, team2: undefined },
    { id: "l_pi2", round: 1, side: "left", team1: undefined, team2: undefined },
    { id: "l_pi3", round: 1, side: "left", team1: undefined, team2: undefined },
    { id: "l_pi4", round: 1, side: "left", team1: undefined, team2: undefined },
    // LEFT SIDE - 2 divisional matches
    { id: "l_div1", round: 2, side: "left", team1: undefined, team2: undefined },
    { id: "l_div2", round: 2, side: "left", team1: undefined, team2: undefined },
    // LEFT SIDE - 1 championship match
    { id: "l_conf", round: 3, side: "left", team1: undefined, team2: undefined },
    // RIGHT SIDE - 4 play-in matches
    { id: "r_pi1", round: 1, side: "right", team1: undefined, team2: undefined },
    { id: "r_pi2", round: 1, side: "right", team1: undefined, team2: undefined },
    { id: "r_pi3", round: 1, side: "right", team1: undefined, team2: undefined },
    { id: "r_pi4", round: 1, side: "right", team1: undefined, team2: undefined },
    // RIGHT SIDE - 2 divisional matches
    { id: "r_div1", round: 2, side: "right", team1: undefined, team2: undefined },
    { id: "r_div2", round: 2, side: "right", team1: undefined, team2: undefined },
    // RIGHT SIDE - 1 championship match
    { id: "r_conf", round: 3, side: "right", team1: undefined, team2: undefined },
    // SUPER BOWL
    { id: "sb", round: 4, side: "left", team1: undefined, team2: undefined },
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
    return bracket.filter((m) => m.round === round && m.side === side);
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
        <h1 className="text-4xl font-bold" data-testid="text-page-title">Playoff Bracket</h1>
        <p className="text-muted-foreground text-sm">BFFL Season 1 - 12 Team Playoff</p>
      </div>

      <div className="flex justify-center overflow-x-auto px-4">
        <div className="flex gap-12 items-center min-w-max">
          {/* LEFT SIDE - Flows up */}
          <div className="flex flex-col gap-8">
            {/* Round 1 */}
            <div className="flex flex-col gap-20">
              {getMatches(1, "left").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
            
            {/* Round 2 */}
            <div className="flex flex-col gap-32">
              {getMatches(2, "left").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
            
            {/* Round 3 */}
            <div className="flex flex-col justify-center">
              {getMatches(3, "left").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </div>

          {/* CENTER - Super Bowl */}
          <div className="flex flex-col items-center gap-4">
            <div className="text-xs font-bold text-muted-foreground">SUPER BOWL</div>
            <MatchCard match={bracket.find(m => m.id === "sb")!} />
          </div>

          {/* RIGHT SIDE - Flows down */}
          <div className="flex flex-col gap-8">
            {/* Round 3 */}
            <div className="flex flex-col justify-center">
              {getMatches(3, "right").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
            
            {/* Round 2 */}
            <div className="flex flex-col gap-32">
              {getMatches(2, "right").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
            
            {/* Round 1 */}
            <div className="flex flex-col gap-20">
              {getMatches(1, "right").map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

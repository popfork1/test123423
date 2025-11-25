import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    // Round 1 - Play-In (4 matches)
    { id: "pi1", round: 1, team1: undefined, team2: undefined },
    { id: "pi2", round: 1, team1: undefined, team2: undefined },
    { id: "pi3", round: 1, team1: undefined, team2: undefined },
    { id: "pi4", round: 1, team1: undefined, team2: undefined },
    // Round 2 - Divisional (4 matches)
    { id: "div1", round: 2, team1: undefined, team2: undefined },
    { id: "div2", round: 2, team1: undefined, team2: undefined },
    { id: "div3", round: 2, team1: undefined, team2: undefined },
    { id: "div4", round: 2, team1: undefined, team2: undefined },
    // Round 3 - Championship (2 matches)
    { id: "conf1", round: 3, team1: undefined, team2: undefined },
    { id: "conf2", round: 3, team1: undefined, team2: undefined },
    // Round 4 - Super Bowl (1 match)
    { id: "sb", round: 4, team1: undefined, team2: undefined },
  ]);

  const updateMatch = (matchId: string, field: string, value: any) => {
    if (!isAuthenticated) return;
    setBracket(
      bracket.map((match) =>
        match.id === matchId ? { ...match, [field]: value } : match
      )
    );
  };

  const getMatchesForRound = (round: number) => {
    return bracket.filter((m) => m.round === round);
  };

  const roundNames: Record<number, string> = {
    1: "Play-In",
    2: "Divisional",
    3: "Conference Championship",
    4: "Super Bowl",
  };

  const MatchBox = ({ match }: { match: BracketMatch }) => (
    <div className="bg-card border border-border rounded-md p-3 min-w-[200px] min-h-[120px] flex flex-col justify-between" data-testid={`card-match-${match.id}`}>
      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">Team 1</div>
        {isAuthenticated ? (
          <Input
            list={`teams-${match.id}-1`}
            value={match.team1?.name || ""}
            onChange={(e) => {
              const newTeam = e.target.value
                ? { id: `${match.id}-t1`, name: e.target.value }
                : undefined;
              updateMatch(match.id, "team1", newTeam);
            }}
            placeholder="Enter team"
            className="text-xs"
            data-testid={`input-team1-${match.id}`}
          />
        ) : (
          <div className="text-sm font-medium">{match.team1?.name || "TBD"}</div>
        )}
        <datalist id={`teams-${match.id}-1`}>
          {AVAILABLE_TEAMS.map((t) => <option key={t} value={t} />)}
        </datalist>
      </div>

      <div className="h-px bg-border my-2" />

      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">Team 2</div>
        {isAuthenticated ? (
          <Input
            list={`teams-${match.id}-2`}
            value={match.team2?.name || ""}
            onChange={(e) => {
              const newTeam = e.target.value
                ? { id: `${match.id}-t2`, name: e.target.value }
                : undefined;
              updateMatch(match.id, "team2", newTeam);
            }}
            placeholder="Enter team"
            className="text-xs"
            data-testid={`input-team2-${match.id}`}
          />
        ) : (
          <div className="text-sm font-medium">{match.team2?.name || "TBD"}</div>
        )}
        <datalist id={`teams-${match.id}-2`}>
          {AVAILABLE_TEAMS.map((t) => <option key={t} value={t} />)}
        </datalist>
      </div>

      {isAuthenticated && match.team1 && match.team2 && (
        <div className="flex gap-1 mt-2 pt-2 border-t">
          <Button
            variant={match.winner === match.team1.id ? "default" : "outline"}
            size="sm"
            onClick={() => updateMatch(match.id, "winner", match.team1?.id)}
            className="flex-1 text-xs"
            data-testid={`button-winner1-${match.id}`}
          >
            W
          </Button>
          <Button
            variant={match.winner === match.team2?.id ? "default" : "outline"}
            size="sm"
            onClick={() => updateMatch(match.id, "winner", match.team2?.id)}
            className="flex-1 text-xs"
            data-testid={`button-winner2-${match.id}`}
          >
            W
          </Button>
        </div>
      )}
    </div>
  );

  const RoundColumn = ({ round, title }: { round: number; title: string }) => {
    const matches = getMatchesForRound(round);
    const spacing = Math.pow(2, round - 1);

    return (
      <div className="flex flex-col items-center px-4">
        <div className="text-sm font-bold text-center mb-4 text-muted-foreground whitespace-nowrap">
          {title}
        </div>
        <div className="flex flex-col justify-center gap-12" style={{ minHeight: `${matches.length * (spacing * 100)}px` }}>
          {matches.map((match, idx) => (
            <div
              key={match.id}
              style={{
                marginTop: idx === 0 ? 0 : `${(spacing - 1) * 50}px`,
              }}
            >
              <MatchBox match={match} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-2" data-testid="text-page-title">
            Playoff Bracket
          </h1>
          <p className="text-muted-foreground">
            BFFL Season 1 - 12 Team Playoff
          </p>
        </div>

        <div className="overflow-x-auto pb-8">
          <div className="flex gap-2 min-w-max">
            <RoundColumn round={1} title="Play-In\n(4 matches)" />
            <RoundColumn round={2} title="Divisional\n(4 matches)" />
            <RoundColumn round={3} title="Conference\n(2 matches)" />
            <RoundColumn round={4} title="Super\nBowl" />
          </div>
        </div>
      </div>
    </div>
  );
}

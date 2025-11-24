import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

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

export default function Playoffs() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You must be logged in to manage the playoff bracket.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (!isAuthenticated) {
    return null;
  }

  const [bracket, setBracket] = useState<BracketMatch[]>([
    // Wildcard Round (4 matches)
    { id: "wc1", round: 1, team1: undefined, team2: undefined },
    { id: "wc2", round: 1, team1: undefined, team2: undefined },
    { id: "wc3", round: 1, team1: undefined, team2: undefined },
    { id: "wc4", round: 1, team1: undefined, team2: undefined },
    // Divisional Round (2 matches)
    { id: "div1", round: 2, team1: undefined, team2: undefined },
    { id: "div2", round: 2, team1: undefined, team2: undefined },
    // Championship Round (1 match)
    { id: "conf", round: 3, team1: undefined, team2: undefined },
    // Finals
    { id: "final", round: 4, team1: undefined, team2: undefined },
  ]);

  const updateMatch = (matchId: string, field: string, value: any) => {
    setBracket(
      bracket.map((match) =>
        match.id === matchId ? { ...match, [field]: value } : match
      )
    );
  };

  const roundNames: Record<number, string> = {
    1: "Wildcard Round",
    2: "Divisional Round",
    3: "Conference Championship",
    4: "Super Bowl",
  };

  const groupedByRound = bracket.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, BracketMatch[]>);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-4" data-testid="text-page-title">
          Playoff Bracket
        </h1>
        <p className="text-muted-foreground text-lg">
          Customize and track the BFFL playoff bracket
        </p>
      </div>

      <div className="space-y-8">
        {[1, 2, 3, 4].map((round) => (
          <Card key={round} className="p-6">
            <h2 className="text-2xl font-bold mb-6" data-testid={`text-round-${round}`}>
              {roundNames[round]}
            </h2>
            <div className="space-y-4">
              {groupedByRound[round]?.map((match) => (
                <div key={match.id} className="border rounded-lg p-4 bg-muted/30 space-y-3" data-testid={`match-${match.id}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((teamNum) => {
                      const teamKey = teamNum === 1 ? "team1" : "team2";
                      const team = match[teamKey as keyof BracketMatch] as BracketTeam | undefined;
                      return (
                        <div key={teamNum}>
                          <Label htmlFor={`${match.id}-team${teamNum}`}>
                            Team {teamNum}
                          </Label>
                          <Input
                            id={`${match.id}-team${teamNum}`}
                            value={team?.name || ""}
                            onChange={(e) => {
                              const newTeam = e.target.value
                                ? { id: `${match.id}-t${teamNum}`, name: e.target.value }
                                : undefined;
                              updateMatch(match.id, teamKey, newTeam);
                            }}
                            placeholder={`Enter team name`}
                            data-testid={`input-team-${match.id}-${teamNum}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {match.team1 && match.team2 && (
                    <div className="pt-3 border-t">
                      <Label className="mb-2 block">Winner</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={match.winner === match.team1.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateMatch(match.id, "winner", match.team1?.id)}
                          className="flex-1"
                          data-testid={`button-winner-${match.id}-1`}
                        >
                          {match.team1.name}
                        </Button>
                        <Button
                          variant={match.winner === match.team2?.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateMatch(match.id, "winner", match.team2?.id)}
                          className="flex-1"
                          data-testid={`button-winner-${match.id}-2`}
                        >
                          {match.team2.name}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

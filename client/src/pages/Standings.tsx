import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { TEAMS } from "@/lib/teams";

interface StandingsEntry {
  id: string;
  rank: number;
  team: string;
  wins: number;
  losses: number;
  pointDifferential?: number;
  division: "D1" | "D2" | "D3" | "D4";
}

const AVAILABLE_TEAMS = Object.keys(TEAMS);

const DIVISIONS = ["D1", "D2", "D3", "D4"] as const;

export default function Standings() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [standings, setStandings] = useState<StandingsEntry[]>([]);
  const [newTeam, setNewTeam] = useState("");
  const [newDivision, setNewDivision] = useState<"D1" | "D2" | "D3" | "D4">("D1");

  const { data: dbStandings, isLoading } = useQuery({
    queryKey: ["/api/standings"],
  });

  useEffect(() => {
    if (dbStandings) {
      setStandings(
        dbStandings.map((s: any) => ({
          id: s.id,
          rank: 0,
          team: s.team,
          wins: s.wins,
          losses: s.losses,
          pointDifferential: s.pointDifferential,
          division: s.division,
        }))
      );
    }
  }, [dbStandings]);

  const upsertMutation = useMutation({
    mutationFn: async (entry: StandingsEntry) => {
      await apiRequest("POST", "/api/standings", {
        team: entry.team,
        division: entry.division,
        wins: entry.wins,
        losses: entry.losses,
        pointDifferential: entry.pointDifferential,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/standings"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save standing", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/standings/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/standings"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete standing", variant: "destructive" });
    },
  });

  const addTeam = () => {
    if (!isAuthenticated || !newTeam.trim()) return;
    const newEntry: StandingsEntry = {
      id: Date.now().toString(),
      rank: standings.length + 1,
      team: newTeam,
      wins: 0,
      losses: 0,
      pointDifferential: 0,
      division: newDivision,
    };
    setStandings([...standings, newEntry]);
    upsertMutation.mutate(newEntry);
    setNewTeam("");
  };

  const updateEntry = (id: string, field: string, value: any) => {
    if (!isAuthenticated) return;
    const updated = standings.map((entry) =>
      entry.id === id ? { ...entry, [field]: value } : entry
    );
    setStandings(updated);
    const entry = updated.find(e => e.id === id);
    if (entry) {
      upsertMutation.mutate(entry);
    }
  };

  const deleteEntry = (id: string) => {
    if (!isAuthenticated) return;
    setStandings(standings.filter((entry) => entry.id !== id));
    deleteMutation.mutate(id);
  };

  const getDivisionStandings = (division: string) => {
    return [...standings]
      .filter((entry) => entry.division === division)
      .sort((a, b) => {
        const aWins = a.wins;
        const bWins = b.wins;
        if (aWins !== bWins) return bWins - aWins;
        return a.losses - b.losses;
      });
  };

  const getUsedTeams = standings.map(s => s.team);
  const availableTeams = AVAILABLE_TEAMS.filter(t => !getUsedTeams.includes(t));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-4" data-testid="text-page-title">
          Standings
        </h1>
        <p className="text-muted-foreground text-lg">
          BFFL Season 1 Standings
        </p>
      </div>

      {isAuthenticated && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Add Team</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="team-select">Team Name</Label>
                <Select value={newTeam} onValueChange={setNewTeam}>
                  <SelectTrigger id="team-select" data-testid="select-team">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeams.map((team) => (
                      <SelectItem key={team} value={team}>
                        <div className="flex items-center gap-2">
                          <img src={TEAMS[team as keyof typeof TEAMS]} alt={team} className="w-4 h-4 object-contain" />
                          <span>{team}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="division-select">Division</Label>
                <Select value={newDivision} onValueChange={(v) => setNewDivision(v as "D1" | "D2" | "D3" | "D4")}>
                  <SelectTrigger id="division-select" data-testid="select-division">
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIVISIONS.map((div) => (
                      <SelectItem key={div} value={div}>
                        {div}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={addTeam} className="w-full" data-testid="button-add-team">
                  Add Team
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-8">
        {DIVISIONS.map((division) => {
          const divisionStandings = getDivisionStandings(division);
          return (
            <div key={division}>
              <h2 className="text-2xl font-bold mb-4">{division}</h2>
              {divisionStandings.length > 0 ? (
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold">Rank</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold">Team</th>
                          <th className="px-6 py-3 text-center text-sm font-semibold">Wins</th>
                          <th className="px-6 py-3 text-center text-sm font-semibold">Losses</th>
                          <th className="px-6 py-3 text-center text-sm font-semibold">PD</th>
                          {isAuthenticated && <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {divisionStandings.map((entry, index) => (
                          <tr key={entry.id} data-testid={`row-team-${entry.id}`}>
                            <td className="px-6 py-4 text-sm font-bold">{index + 1}</td>
                            <td className="px-6 py-4 text-sm font-semibold">
                              <div className="flex items-center gap-3">
                                {TEAMS[entry.team as keyof typeof TEAMS] && (
                                  <img src={TEAMS[entry.team as keyof typeof TEAMS]} alt={entry.team} className="w-6 h-6 object-contain" />
                                )}
                                <span>{entry.team}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {isAuthenticated ? (
                                <Input
                                  type="number"
                                  min="0"
                                  value={entry.wins}
                                  onChange={(e) =>
                                    updateEntry(entry.id, "wins", parseInt(e.target.value) || 0)
                                  }
                                  className="w-16 text-center"
                                  data-testid={`input-wins-${entry.id}`}
                                />
                              ) : (
                                <div className="text-center">{entry.wins}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {isAuthenticated ? (
                                <Input
                                  type="number"
                                  min="0"
                                  value={entry.losses}
                                  onChange={(e) =>
                                    updateEntry(entry.id, "losses", parseInt(e.target.value) || 0)
                                  }
                                  className="w-16 text-center"
                                  data-testid={`input-losses-${entry.id}`}
                                />
                              ) : (
                                <div className="text-center">{entry.losses}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {isAuthenticated ? (
                                <Input
                                  type="text"
                                  inputMode="numeric"
                                  value={entry.pointDifferential || 0}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    // Allow empty string or valid integers (including negative)
                                    if (val === '' || val === '-' || /^-?\d+$/.test(val)) {
                                      updateEntry(entry.id, "pointDifferential", val === '' ? 0 : parseInt(val));
                                    }
                                  }}
                                  className="w-16 text-center"
                                  data-testid={`input-pd-${entry.id}`}
                                />
                              ) : (
                                <div className="text-center">{entry.pointDifferential || 0}</div>
                              )}
                            </td>
                            {isAuthenticated && (
                              <td className="px-6 py-4 text-sm text-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteEntry(entry.id)}
                                  data-testid={`button-delete-${entry.id}`}
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No teams in this division yet.</p>
                </Card>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface StandingsEntry {
  id: string;
  rank: number;
  team: string;
  wins: number;
  losses: number;
  ties?: number;
}

export default function Standings() {
  const [standings, setStandings] = useState<StandingsEntry[]>([]);
  const [newTeam, setNewTeam] = useState("");

  const addTeam = () => {
    if (newTeam.trim()) {
      const newEntry: StandingsEntry = {
        id: Date.now().toString(),
        rank: standings.length + 1,
        team: newTeam,
        wins: 0,
        losses: 0,
        ties: 0,
      };
      setStandings([...standings, newEntry]);
      setNewTeam("");
    }
  };

  const updateEntry = (id: string, field: string, value: any) => {
    setStandings(
      standings.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const deleteEntry = (id: string) => {
    setStandings(standings.filter((entry) => entry.id !== id));
  };

  const sortedStandings = [...standings].sort((a, b) => {
    const aWins = a.wins;
    const bWins = b.wins;
    if (aWins !== bWins) return bWins - aWins;
    return a.losses - b.losses;
  });

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Team Form */}
        <Card className="p-6 lg:col-span-1 h-fit">
          <h2 className="text-xl font-bold mb-4">Add Team</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={newTeam}
                onChange={(e) => setNewTeam(e.target.value)}
                placeholder="Enter team name"
                data-testid="input-team-name"
                onKeyPress={(e) => e.key === "Enter" && addTeam()}
              />
            </div>
            <Button onClick={addTeam} className="gap-2 w-full" data-testid="button-add-team">
              <Plus className="w-4 h-4" />
              Add Team
            </Button>
          </div>
        </Card>

        {/* Standings Table */}
        <div className="lg:col-span-2">
          {sortedStandings.length > 0 ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Rank</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Team</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold">Wins</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold">Losses</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold">Ties</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sortedStandings.map((entry, index) => (
                      <tr key={entry.id} data-testid={`row-team-${entry.id}`}>
                        <td className="px-6 py-4 text-sm font-bold">{index + 1}</td>
                        <td className="px-6 py-4 text-sm font-semibold">{entry.team}</td>
                        <td className="px-6 py-4 text-sm">
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
                        </td>
                        <td className="px-6 py-4 text-sm">
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
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Input
                            type="number"
                            min="0"
                            value={entry.ties || 0}
                            onChange={(e) =>
                              updateEntry(entry.id, "ties", parseInt(e.target.value) || 0)
                            }
                            className="w-16 text-center"
                            data-testid={`input-ties-${entry.id}`}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteEntry(entry.id)}
                            data-testid={`button-delete-${entry.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground text-lg">
                No teams added yet. Add teams to see standings.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

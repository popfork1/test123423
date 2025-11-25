import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import type { PlayoffMatch } from "@shared/schema";

export default function Playoffs() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: allMatches = [] } = useQuery<PlayoffMatch[]>({
    queryKey: ["/api/playoffs"],
  });

  const createMutation = useMutation({
    mutationFn: async (match: Partial<PlayoffMatch>) => {
      await apiRequest("POST", "/api/playoffs", match);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playoffs"] });
      toast({ title: "Match created" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PlayoffMatch> }) => {
      await apiRequest("PATCH", `/api/playoffs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playoffs"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/playoffs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playoffs"] });
    },
  });

  const setupPlayin = async () => {
    for (let i = 1; i <= 4; i++) {
      await createMutation.mutateAsync({
        round: "play_in",
        matchNumber: i,
        seed1: 12 - i,
        seed2: 5 + i,
      });
    }
  };

  const playinMatches = allMatches.filter(m => m.round === "play_in").sort((a, b) => a.matchNumber - b.matchNumber);
  const wildcardMatches = allMatches.filter(m => m.round === "wildcard").sort((a, b) => a.matchNumber - b.matchNumber);
  const divisionalMatches = allMatches.filter(m => m.round === "divisional").sort((a, b) => a.matchNumber - b.matchNumber);
  const conferenceMatches = allMatches.filter(m => m.round === "conference").sort((a, b) => a.matchNumber - b.matchNumber);
  const superBowlMatches = allMatches.filter(m => m.round === "super_bowl").sort((a, b) => a.matchNumber - b.matchNumber);

  const MatchBox = ({ match, onUpdate, onDelete }: { match: PlayoffMatch; onUpdate: (data: Partial<PlayoffMatch>) => void; onDelete: () => void }) => (
    <div className="border border-border rounded-md bg-card p-2 min-w-[160px] text-xs" data-testid={`card-match-${match.id}`}>
      {isAuthenticated ? (
        <div className="space-y-1">
          <Input
            size={1}
            placeholder="Team 1"
            value={match.team1 || ""}
            onChange={(e) => onUpdate({ team1: e.target.value })}
            className="text-xs h-6 p-1"
            data-testid={`input-team1-${match.id}`}
          />
          <Input
            size={1}
            placeholder="Team 2"
            value={match.team2 || ""}
            onChange={(e) => onUpdate({ team2: e.target.value })}
            className="text-xs h-6 p-1"
            data-testid={`input-team2-${match.id}`}
          />
          <div className="flex gap-1">
            <Input
              type="number"
              placeholder="S1"
              value={match.team1Score || ""}
              onChange={(e) => onUpdate({ team1Score: e.target.value ? parseInt(e.target.value) : null })}
              className="text-xs h-6 p-1 w-10"
              data-testid={`input-score1-${match.id}`}
            />
            <Input
              type="number"
              placeholder="S2"
              value={match.team2Score || ""}
              onChange={(e) => onUpdate({ team2Score: e.target.value ? parseInt(e.target.value) : null })}
              className="text-xs h-6 p-1 w-10"
              data-testid={`input-score2-${match.id}`}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={onDelete}
              className="h-6 w-6"
              data-testid={`button-delete-${match.id}`}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="font-semibold">{match.team1 || `#${match.seed1}`}</div>
          <div className="text-muted-foreground text-xs">vs</div>
          <div className="font-semibold">{match.team2 || `#${match.seed2}`}</div>
          {match.team1Score !== null && match.team2Score !== null && (
            <div className="mt-1 text-xs font-bold">
              {match.team1Score} - {match.team2Score}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const RoundColumn = ({ 
    matches, 
    title, 
    round 
  }: { 
    matches: PlayoffMatch[]; 
    title: string; 
    round: string;
  }) => {
    if (matches.length === 0 && !isAuthenticated) return null;
    
    return (
      <div className="flex flex-col justify-center items-center gap-6 flex-shrink-0">
        <div className="text-xs font-bold text-center uppercase tracking-wider text-muted-foreground">{title}</div>
        <div className="flex flex-col justify-center gap-8" style={{ minHeight: `${Math.max(200, matches.length * 100)}px` }}>
          {matches.map((match, idx) => {
            const spacing = matches.length > 1 ? Math.pow(2, Math.log2(matches.length)) : 1;
            return (
              <div key={match.id} style={{ marginTop: idx === 0 ? 0 : `${(spacing - 1) * 3}rem` }}>
                <MatchBox
                  match={match}
                  onUpdate={(data) => updateMutation.mutate({ id: match.id!, data })}
                  onDelete={() => deleteMutation.mutate(match.id!)}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-full px-4">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-2" data-testid="text-page-title">
            Playoff Bracket
          </h1>
          <p className="text-muted-foreground">BFFL Season 1 - 12 Team Playoff Format</p>
        </div>

        {isAuthenticated && playinMatches.length === 0 && (
          <Button onClick={setupPlayin} className="mb-8" data-testid="button-setup-playoff">
            Setup 12-Team Bracket (5v12, 6v11, 7v10, 8v9)
          </Button>
        )}

        {(playinMatches.length > 0 || isAuthenticated) && (
          <div className="overflow-x-auto pb-8">
            <div className="flex gap-6 justify-center items-stretch min-w-min px-4">
              {/* Play-In Round */}
              <RoundColumn matches={playinMatches} title="Play-In" round="play_in" />

              {/* Wildcard Round */}
              <RoundColumn matches={wildcardMatches} title="Wild Card" round="wildcard" />

              {/* Divisional Round */}
              <RoundColumn matches={divisionalMatches} title="Divisional" round="divisional" />

              {/* Conference Championship */}
              <RoundColumn matches={conferenceMatches} title="Conference" round="conference" />

              {/* Super Bowl */}
              <div className="flex flex-col justify-center items-center gap-6 flex-shrink-0">
                <div className="text-xs font-bold text-center uppercase tracking-wider text-muted-foreground">Champion</div>
                <div className="flex flex-col justify-center gap-8">
                  {superBowlMatches.length > 0 ? (
                    superBowlMatches.map((match) => (
                      <MatchBox
                        key={match.id}
                        match={match}
                        onUpdate={(data) => updateMutation.mutate({ id: match.id!, data })}
                        onDelete={() => deleteMutation.mutate(match.id!)}
                      />
                    ))
                  ) : isAuthenticated ? (
                    <div className="border border-dashed border-muted-foreground rounded-md p-4 text-center text-muted-foreground text-xs w-40">
                      Champion TBD
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}

        {playinMatches.length === 0 && !isAuthenticated && (
          <div className="text-center py-12 text-muted-foreground">
            Playoff bracket coming soon...
          </div>
        )}
      </div>
    </div>
  );
}

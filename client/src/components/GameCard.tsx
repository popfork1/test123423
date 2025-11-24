import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Game } from "@shared/schema";
import { format } from "date-fns";

interface GameCardProps {
  game: Game;
  onClick?: () => void;
}

export function GameCard({ game, onClick }: GameCardProps) {
  const isScheduled = game.quarter === "Scheduled";
  const showScores = !isScheduled;

  return (
    <Card
      className={`p-6 cursor-pointer hover-elevate active-elevate-2 ${game.isLive ? 'border-primary' : ''}`}
      onClick={onClick}
      data-testid={`card-game-${game.id}`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Badge
            variant={game.isLive ? "default" : game.isFinal ? "secondary" : "outline"}
            className={game.isLive ? "animate-pulse" : ""}
            data-testid={`badge-status-${game.id}`}
          >
            {game.isLive ? "LIVE" : game.isFinal ? "FINAL" : game.quarter}
          </Badge>
          <span className="text-xs text-muted-foreground" data-testid={`text-gametime-${game.id}`}>
            {format(new Date(game.gameTime), "EEE, MMM d 'at' h:mm a")}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-lg font-bold ${game.awayScore! > game.homeScore! && game.isFinal ? 'text-primary' : ''}`} data-testid={`text-away-team-${game.id}`}>
              {game.awayTeam}
            </span>
            {showScores && (
              <span className={`text-5xl font-black tabular-nums ${game.awayScore! > game.homeScore! && game.isFinal ? 'text-primary' : ''}`} data-testid={`text-away-score-${game.id}`}>
                {game.awayScore}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-lg font-bold ${game.homeScore! > game.awayScore! && game.isFinal ? 'text-primary' : ''}`} data-testid={`text-home-team-${game.id}`}>
              {game.homeTeam}
            </span>
            {showScores && (
              <span className={`text-5xl font-black tabular-nums ${game.homeScore! > game.awayScore! && game.isFinal ? 'text-primary' : ''}`} data-testid={`text-home-score-${game.id}`}>
                {game.homeScore}
              </span>
            )}
          </div>
        </div>

        {game.location && (
          <div className="text-sm text-muted-foreground" data-testid={`text-location-${game.id}`}>
            {game.location}
          </div>
        )}
      </div>
    </Card>
  );
}

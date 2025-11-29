import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TEAMS } from "@/lib/nflTeams";
import type { Game } from "@shared/schema";
import { formatInTimeZone } from "date-fns-tz";

interface GameCardProps {
  game: Game;
  onClick?: () => void;
}

export function GameCard({ game, onClick }: GameCardProps) {
  const team1Logo = TEAMS[game.team1 as keyof typeof TEAMS];
  const team2Logo = TEAMS[game.team2 as keyof typeof TEAMS];

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
            {game.gameTime ? formatInTimeZone(new Date(game.gameTime), "America/New_York", "EEE, MMM d 'at' h:mm a 'EST'") : "Time TBD"}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {team2Logo && <img src={team2Logo} alt={game.team2} className="w-8 h-8 object-contain flex-shrink-0" />}
              <span className={`text-lg font-bold truncate ${game.team2Score! > game.team1Score! && game.isFinal ? 'text-primary' : ''}`} data-testid={`text-team2-${game.id}`}>
                {game.team2}
              </span>
            </div>
            <span className={`text-5xl font-black tabular-nums flex-shrink-0 ${game.team2Score! > game.team1Score! && game.isFinal ? 'text-primary' : ''}`} data-testid={`text-team2-score-${game.id}`}>
              {game.team2Score}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {team1Logo && <img src={team1Logo} alt={game.team1} className="w-8 h-8 object-contain flex-shrink-0" />}
              <span className={`text-lg font-bold truncate ${game.team1Score! > game.team2Score! && game.isFinal ? 'text-primary' : ''}`} data-testid={`text-team1-${game.id}`}>
                {game.team1}
              </span>
            </div>
            <span className={`text-5xl font-black tabular-nums flex-shrink-0 ${game.team1Score! > game.team2Score! && game.isFinal ? 'text-primary' : ''}`} data-testid={`text-team1-score-${game.id}`}>
              {game.team1Score}
            </span>
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

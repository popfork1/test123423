import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Game } from "@shared/schema";
import { formatInTimeZone } from "date-fns-tz";
import { TEAMS } from "@/lib/teams";

interface GameCardProps {
  game: Game;
  onClick?: () => void;
}

export function GameCard({ game, onClick }: GameCardProps) {
  const team2Logo = TEAMS[game.team2 as keyof typeof TEAMS];
  const team1Logo = TEAMS[game.team1 as keyof typeof TEAMS];

  return (
    <div className="relative" style={{ margin: '12px' }}>
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
            {game.isLive ? `LIVE${game.quarter && game.quarter !== "Scheduled" ? ` - ${game.quarter}` : ""}` : game.isFinal ? "FINAL" : game.quarter || "Scheduled"}
          </Badge>
          <span className="text-xs text-muted-foreground" data-testid={`text-gametime-${game.id}`}>
            {game.gameTime ? formatInTimeZone(new Date(game.gameTime), "America/New_York", "EEE, MMM d 'at' h:mm a 'EST'") : "Time TBD"}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {team2Logo && <img src={team2Logo} alt={game.team2} className="w-8 h-8 object-contain flex-shrink-0" />}
              <span className={`text-lg font-bold truncate ${game.team2Score! > game.team1Score! && game.isFinal ? 'text-primary' : ''}`} data-testid={`text-team2-${game.id}`}>
                {game.team2}
              </span>
            </div>
            <span className={`text-4xl font-black tabular-nums flex-shrink-0 ${game.team2Score! > game.team1Score! && game.isFinal ? 'text-primary' : ''}`} data-testid={`text-team2-score-${game.id}`}>
              {game.team2Score}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {team1Logo && <img src={team1Logo} alt={game.team1} className="w-8 h-8 object-contain flex-shrink-0" />}
              <span className={`text-lg font-bold truncate ${game.team1Score! > game.team2Score! && game.isFinal ? 'text-primary' : ''}`} data-testid={`text-team1-${game.id}`}>
                {game.team1}
              </span>
            </div>
            <span className={`text-4xl font-black tabular-nums flex-shrink-0 ${game.team1Score! > game.team2Score! && game.isFinal ? 'text-primary' : ''}`} data-testid={`text-team1-score-${game.id}`}>
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

      {/* Twinkling lights hanging around card */}
      <div className="absolute -inset-3 pointer-events-none rounded-md" style={{ margin: '-12px' }}>
        {/* Top lights */}
        <div className="absolute -top-2 left-0 right-0 h-2 flex justify-around gap-0.5 px-1">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={`top-${i}`}
              className="flex-1 rounded-full"
              style={{
                animation: `twinkle 0.8s ease-in-out infinite`,
                animationDelay: (i * 0.08) + 's',
                backgroundColor: i % 3 === 0 ? 'hsl(0 78% 48%)' : i % 3 === 1 ? 'hsl(43 96% 56%)' : 'hsl(138 44% 32%)',
                boxShadow: `0 0 8px currentColor`,
                minHeight: '8px',
              }}
            />
          ))}
        </div>
        {/* Bottom lights */}
        <div className="absolute -bottom-2 left-0 right-0 h-2 flex justify-around gap-0.5 px-1">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={`bottom-${i}`}
              className="flex-1 rounded-full"
              style={{
                animation: `twinkle 0.8s ease-in-out infinite`,
                animationDelay: (i * 0.08 + 0.4) + 's',
                backgroundColor: i % 3 === 1 ? 'hsl(0 78% 48%)' : i % 3 === 2 ? 'hsl(43 96% 56%)' : 'hsl(138 44% 32%)',
                boxShadow: `0 0 8px currentColor`,
                minHeight: '8px',
              }}
            />
          ))}
        </div>
        {/* Left lights */}
        <div className="absolute left-0 top-0 bottom-0 -left-2 flex flex-col justify-around gap-0.5 py-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={`left-${i}`}
              className="rounded-full"
              style={{
                animation: `twinkle 0.8s ease-in-out infinite`,
                animationDelay: (i * 0.12) + 's',
                backgroundColor: i % 3 === 0 ? 'hsl(0 78% 48%)' : i % 3 === 1 ? 'hsl(43 96% 56%)' : 'hsl(138 44% 32%)',
                boxShadow: `0 0 8px currentColor`,
                width: '8px',
                height: '8px',
              }}
            />
          ))}
        </div>
        {/* Right lights */}
        <div className="absolute right-0 top-0 bottom-0 -right-2 flex flex-col justify-around gap-0.5 py-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={`right-${i}`}
              className="rounded-full"
              style={{
                animation: `twinkle 0.8s ease-in-out infinite`,
                animationDelay: (i * 0.12 + 0.4) + 's',
                backgroundColor: i % 3 === 1 ? 'hsl(0 78% 48%)' : i % 3 === 2 ? 'hsl(43 96% 56%)' : 'hsl(138 44% 32%)',
                boxShadow: `0 0 8px currentColor`,
                width: '8px',
                height: '8px',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

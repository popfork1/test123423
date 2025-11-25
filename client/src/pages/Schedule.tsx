import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { Game } from "@shared/schema";
import { isFuture, isPast } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Calendar, MapPin, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function Schedule() {
  const { data: allGames, isLoading, error } = useQuery<Game[]>({
    queryKey: ["/api/games/all"],
  });

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-3 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <p>Failed to load schedule</p>
        </div>
      </div>
    );
  }

  const gamesByWeek = allGames?.reduce((acc, game) => {
    if (!acc[game.week]) {
      acc[game.week] = [];
    }
    acc[game.week].push(game);
    return acc;
  }, {} as Record<number, Game[]>) || {};

  const weeks = Object.keys(gamesByWeek).map(Number).sort((a, b) => a - b);
  const regularSeasonWeeks = weeks.filter(w => w <= 10);
  const playoffWeeks = weeks.filter(w => w > 10);

  const getRoundName = (week: number) => {
    if (week === 11) return "WILDCARD";
    if (week === 12) return "DIVISIONAL";
    if (week === 13) return "CONFERENCE";
    if (week === 14) return "SUPER BOWL";
    return `Week ${week}`;
  };

  const GameCardSmall = ({ game }: { game: Game }) => {
    const gameDate = game.gameTime ? new Date(game.gameTime) : null;
    const isUpcoming = gameDate ? isFuture(gameDate) : false;
    const isCompleted = gameDate ? (isPast(gameDate) || game.isFinal) : game.isFinal;

    return (
      <Link href={`/game/${game.id}`}>
        <Card className="p-3 hover-elevate cursor-pointer" data-testid={`card-game-${game.id}`}>
          <div className="flex flex-col gap-2">
            <Badge
              variant={game.isLive ? "default" : game.isFinal ? "secondary" : "outline"}
              className="text-xs w-fit"
              data-testid={`badge-status-${game.id}`}
            >
              {game.isLive ? "LIVE" : game.isFinal ? "FINAL" : isUpcoming ? "Upcoming" : game.quarter}
            </Badge>
            <div className="text-xs font-semibold" data-testid={`text-matchup-${game.id}`}>
              <div>{game.team1}</div>
              <div className="text-center my-1">vs</div>
              <div>{game.team2}</div>
            </div>
            {game.isFinal && (
              <div className="text-xs text-muted-foreground font-semibold" data-testid={`text-score-${game.id}`}>
                <div className="text-center">{game.team1Score} - {game.team2Score}</div>
              </div>
            )}
          </div>
        </Card>
      </Link>
    );
  };

  return (
    <div className="max-w-full mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-4" data-testid="text-page-title">
          Full Schedule
        </h1>
        <p className="text-muted-foreground text-lg">
          Complete season schedule with dates, times, and locations
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-8 w-32 mb-4" />
              <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="h-24" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-16">
          {/* REGULAR SEASON */}
          {regularSeasonWeeks.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold mb-8 text-primary">Regular Season</h2>
              <div className="space-y-8">
                {regularSeasonWeeks.map((week) => (
                  <div key={week}>
                    <h3 className="text-2xl font-bold mb-4" data-testid={`text-week-${week}`}>
                      Week {week}
                    </h3>
                    <div className="space-y-3">
                      {gamesByWeek[week].map((game) => {
                        const gameDate = game.gameTime ? new Date(game.gameTime) : null;
                        const isUpcoming = gameDate ? isFuture(gameDate) : false;
                        const isCompleted = gameDate ? (isPast(gameDate) || game.isFinal) : game.isFinal;

                        return (
                          <Link key={game.id} href={`/game/${game.id}`}>
                            <Card className="p-4 hover-elevate cursor-pointer" data-testid={`card-game-${game.id}`}>
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Badge
                                      variant={game.isLive ? "default" : game.isFinal ? "secondary" : "outline"}
                                      data-testid={`badge-status-${game.id}`}
                                    >
                                      {game.isLive ? "LIVE" : game.isFinal ? "FINAL" : isUpcoming ? "Upcoming" : game.quarter}
                                    </Badge>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="font-semibold text-lg" data-testid={`text-matchup-${game.id}`}>
                                      {game.team2} vs {game.team1}
                                    </p>
                                    {game.isFinal && (
                                      <p className="text-muted-foreground" data-testid={`text-score-${game.id}`}>
                                        Final: {game.team2} {game.team2Score} - {game.team1Score} {game.team1}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-col gap-2 md:text-right">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span data-testid={`text-datetime-${game.id}`}>
                                      {gameDate ? formatInTimeZone(gameDate, "America/New_York", "EEE, MMM d 'at' h:mm a 'EST'") : "Time TBD"}
                                    </span>
                                  </div>
                                  {game.location && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <MapPin className="w-4 h-4" />
                                      <span data-testid={`text-location-${game.id}`}>{game.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PLAYOFFS */}
          {playoffWeeks.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold mb-8 text-primary">Playoffs</h2>
              <div className="flex justify-center overflow-x-auto px-4">
                <div className="flex gap-6 items-center min-w-max">
                  {playoffWeeks.map((week) => (
                    <div key={week} className="flex flex-col items-center gap-4">
                      <h3 className="text-lg font-bold text-muted-foreground">{getRoundName(week)}</h3>
                      <div className="flex flex-col gap-3">
                        {gamesByWeek[week].map((game) => (
                          <GameCardSmall key={game.id} game={game} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {weeks.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No games scheduled yet
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

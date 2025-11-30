import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatComponent } from "@/components/ChatComponent";
import { Skeleton } from "@/components/ui/skeleton";
import type { Game, ChatMessage, Prediction, Standings } from "@shared/schema";
import { formatInTimeZone } from "date-fns-tz";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { TEAMS } from "@/lib/teams";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function GameDetail() {
  const [, params] = useRoute("/game/:id");
  const gameId = params?.id;
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [celebrationTriggered, setCelebrationTriggered] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const confettiTimeoutsRef = useRef<number[]>([]);
  const { user } = useAuth();

  const { data: game, isLoading: gameLoading, error: gameError } = useQuery<Game>({
    queryKey: ["/api/games", gameId],
    enabled: !!gameId,
    refetchInterval: 15000,
  });

  const { data: initialMessages } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", gameId],
    enabled: !!gameId,
  });

  const { data: predictions, refetch: refetchPredictions } = useQuery<Prediction[]>({
    queryKey: ["/api/predictions", gameId],
    enabled: !!gameId,
  });

  const { data: standings } = useQuery<Standings[]>({
    queryKey: ["/api/standings"],
  });

  const voteMutation = useMutation({
    mutationFn: async (teamVote: string) => {
      return await apiRequest("POST", "/api/predictions", {
        gameId: gameId,
        votedFor: teamVote,
      });
    },
    onSuccess: () => {
      refetchPredictions();
    },
  });

  useEffect(() => {
    if (initialMessages) {
      setChatMessages(initialMessages);
    }
  }, [initialMessages]);

  // Cleanup confetti when component unmounts
  useEffect(() => {
    return () => {
      confettiTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      confettiTimeoutsRef.current = [];
      const containers = document.querySelectorAll('.confetti-container');
      containers.forEach(container => container.remove());
    };
  }, []);

  useEffect(() => {
    if (game?.isFinal && !celebrationTriggered) {
      setCelebrationTriggered(true);
      createConfetti();
    }
  }, [game?.isFinal, celebrationTriggered]);

  const createConfetti = () => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    // Create falling confetti - faster spawn for flash effect
    for (let i = 0; i < 400; i++) {
      const timeoutId = window.setTimeout(() => {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.top = -20 + 'px';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        // Mix of sizes - some bigger for impact
        const size = Math.random() > 0.8 ? Math.random() * 18 + 10 : Math.random() * 12 + 4;
        piece.style.width = size + 'px';
        piece.style.height = size + 'px';
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '20%';
        if (container.parentNode) {
          container.appendChild(piece);
        }
      }, i * 3);
      confettiTimeoutsRef.current.push(timeoutId);
    }

    const cleanupTimeoutId = window.setTimeout(() => {
      if (container.parentNode) {
        container.remove();
      }
    }, 5500);
    confettiTimeoutsRef.current.push(cleanupTimeoutId);
  };

  useEffect(() => {
    if (!gameId) return;
    
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const hostname = window.location.hostname;
      const port = window.location.port || "";
      
      if (!hostname) return;
      
      const wsUrl = port && port !== "" && port !== "undefined" ? `${protocol}//${hostname}:${port}/ws` : `${protocol}//${hostname}/ws`;
      if (wsUrl.includes("undefined") || wsUrl.includes("localhost:")) return;
      
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("WebSocket connected");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "chat" && data.gameId === gameId) {
            setChatMessages((prev) => [...prev, data.message]);
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected");
      };

      wsRef.current = socket;

      return () => {
        socket.close();
        confettiTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
        confettiTimeoutsRef.current = [];
      };
    } catch (err) {
      console.error("Failed to establish WebSocket:", err);
    }
  }, [gameId]);

  const handleSendMessage = (username: string, message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "chat",
          username,
          message,
          gameId,
        })
      );
    }
  };

  if (gameError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-3 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <p>Failed to load game details</p>
        </div>
      </div>
    );
  }

  if (gameLoading || !game) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-96 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[600px] lg:col-span-2" />
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    );
  }

  const isScheduled = game.quarter === "Scheduled";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/scores">
        <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back">
          <ArrowLeft className="w-4 h-4" />
          Back to Scores
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Badge
                variant={game.isLive ? "default" : game.isFinal ? "secondary" : "outline"}
                className={`text-lg px-4 py-2 ${game.isLive ? 'animate-pulse' : ''}`}
                data-testid="badge-game-status"
              >
                {game.isLive ? `LIVE${game.quarter && game.quarter !== "Scheduled" ? ` - ${game.quarter}` : ""}` : game.isFinal ? "FINAL" : game.quarter || "Scheduled"}
              </Badge>
              <span className="text-sm text-muted-foreground" data-testid="text-game-time">
                {game.gameTime ? formatInTimeZone(new Date(game.gameTime), "America/New_York", "EEEE, MMMM d 'at' h:mm a 'EST'") : "Time TBD"}
              </span>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b gap-4">
                <div className="flex-1 flex items-center gap-4 min-w-0">
                  {TEAMS[game.team2 as keyof typeof TEAMS] && (
                    <img src={TEAMS[game.team2 as keyof typeof TEAMS]} alt={game.team2} className="w-16 h-16 object-contain flex-shrink-0" />
                  )}
                  <h2 className={`text-2xl md:text-3xl font-bold truncate ${game.team2Score! > game.team1Score! && game.isFinal ? 'text-primary' : ''}`} data-testid="text-team2">
                    {game.team2}
                  </h2>
                </div>
                <div className={`text-6xl md:text-7xl font-black tabular-nums flex-shrink-0 ${game.team2Score! > game.team1Score! && game.isFinal ? 'text-primary celebration-score' : ''}`} data-testid="text-team2-score">
                  {game.team2Score}
                </div>
              </div>

              <div className="flex items-center justify-between py-4 gap-4">
                <div className="flex-1 flex items-center gap-4 min-w-0">
                  {TEAMS[game.team1 as keyof typeof TEAMS] && (
                    <img src={TEAMS[game.team1 as keyof typeof TEAMS]} alt={game.team1} className="w-16 h-16 object-contain flex-shrink-0" />
                  )}
                  <h2 className={`text-2xl md:text-3xl font-bold truncate ${game.team1Score! > game.team2Score! && game.isFinal ? 'text-primary' : ''}`} data-testid="text-team1">
                    {game.team1}
                  </h2>
                </div>
                <div className={`text-6xl md:text-7xl font-black tabular-nums flex-shrink-0 ${game.team1Score! > game.team2Score! && game.isFinal ? 'text-primary celebration-score' : ''}`} data-testid="text-team1-score">
                  {game.team1Score}
                </div>
              </div>
            </div>

            {game.location && (
              <div className="pt-4 border-t">
                <p className="text-muted-foreground" data-testid="text-game-location">
                  <span className="font-semibold">Location:</span> {game.location}
                </p>
              </div>
            )}

            {!game.isFinal && (isScheduled || game.isLive) && (
              <div className="pt-4 border-t">
                <p className="font-semibold mb-4">Win Probability & Predictions</p>
                
                {(() => {
                  // Get PD values from standings
                  const team1Standing = standings?.find(s => s.team === game.team1);
                  const team2Standing = standings?.find(s => s.team === game.team2);
                  
                  const team1PD = team1Standing?.pointDifferential || 0;
                  const team2PD = team2Standing?.pointDifferential || 0;
                  
                  // Calculate win probability based on PD difference
                  // Each 10 points of PD difference = ~5% win probability swing
                  const pdDifference = team1PD - team2PD;
                  const team1Percent = Math.max(15, Math.min(85, Math.round(50 + (pdDifference / 20))));
                  const team2Percent = 100 - team1Percent;
                  
                  return (
                    <div className="mb-6 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold">{game.team1}</span>
                          <span className="text-lg font-bold text-primary">{team1Percent}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-primary h-full transition-all duration-300"
                            style={{ width: `${team1Percent}%` }}
                            data-testid={`winprob-bar-${game.team1}`}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{team1Standing?.wins || 0}-{team1Standing?.losses || 0} (PD: {team1PD > 0 ? '+' : ''}{team1PD})</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold">{game.team2}</span>
                          <span className="text-lg font-bold text-primary">{team2Percent}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-primary h-full transition-all duration-300"
                            style={{ width: `${team2Percent}%` }}
                            data-testid={`winprob-bar-${game.team2}`}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{team2Standing?.wins || 0}-{team2Standing?.losses || 0} (PD: {team2PD > 0 ? '+' : ''}{team2PD})</p>
                      </div>
                      
                      <p className="text-xs text-muted-foreground text-center mt-3 pt-2 border-t">
                        Based on Point Differential rankings
                      </p>
                    </div>
                  );
                })()}
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => voteMutation.mutate(game.team2)}
                    disabled={voteMutation.isPending}
                    data-testid={`button-predict-${game.team2}`}
                  >
                    {game.team2}
                    <Badge variant="secondary" className="ml-auto">
                      {predictions?.filter(p => p.votedFor === game.team2).length || 0}
                    </Badge>
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => voteMutation.mutate(game.team1)}
                    disabled={voteMutation.isPending}
                    data-testid={`button-predict-${game.team1}`}
                  >
                    {game.team1}
                    <Badge variant="secondary" className="ml-auto">
                      {predictions?.filter(p => p.votedFor === game.team1).length || 0}
                    </Badge>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="h-[600px] flex flex-col overflow-hidden">
          <ChatComponent
            gameId={gameId}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
          />
        </Card>
      </div>
    </div>
  );
}

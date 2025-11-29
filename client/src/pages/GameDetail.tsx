import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatComponent } from "@/components/ChatComponent";
import { Skeleton } from "@/components/ui/skeleton";
import type { Game, ChatMessage } from "@shared/schema";
import { formatInTimeZone } from "date-fns-tz";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { TEAMS } from "@/lib/teams";

export default function GameDetail() {
  const [, params] = useRoute("/game/:id");
  const gameId = params?.id;
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [celebrationTriggered, setCelebrationTriggered] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const { data: game, isLoading: gameLoading, error: gameError } = useQuery<Game>({
    queryKey: ["/api/games", gameId],
    enabled: !!gameId,
    refetchInterval: 15000,
  });

  const { data: initialMessages } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", gameId],
    enabled: !!gameId,
  });

  useEffect(() => {
    if (initialMessages) {
      setChatMessages(initialMessages);
    }
  }, [initialMessages]);

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

    // Create flash overlay
    const flash = document.createElement('div');
    flash.className = 'flash-overlay';
    container.appendChild(flash);

    // Create falling confetti
    for (let i = 0; i < 80; i++) {
      setTimeout(() => {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.top = -20 + 'px';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.width = (Math.random() * 12 + 4) + 'px';
        piece.style.height = (Math.random() * 12 + 4) + 'px';
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '20%';
        piece.style.boxShadow = `0 0 10px ${colors[Math.floor(Math.random() * colors.length)]}`;
        container.appendChild(piece);
      }, i * 20);
    }

    // Create burst particles from center
    for (let i = 0; i < 40; i++) {
      setTimeout(() => {
        const angle = (Math.PI * 2 * i) / 40;
        const distance = 200 + Math.random() * 300;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        const piece = document.createElement('div');
        piece.className = 'burst-piece';
        piece.style.left = '50%';
        piece.style.top = '50%';
        piece.style.width = (Math.random() * 20 + 8) + 'px';
        piece.style.height = (Math.random() * 20 + 8) + 'px';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.borderRadius = '50%';
        piece.style.setProperty('--tx', tx + 'px');
        piece.style.setProperty('--ty', ty + 'px');
        piece.style.boxShadow = `0 0 15px ${colors[Math.floor(Math.random() * colors.length)]}`;
        container.appendChild(piece);
      }, i * 50 + 100);
    }

    // Create floating ribbon shapes
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const piece = document.createElement('div');
        piece.className = 'float-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.top = '50%';
        piece.style.width = (Math.random() * 40 + 20) + 'px';
        piece.style.height = (Math.random() * 8 + 3) + 'px';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.borderRadius = '50%';
        piece.style.opacity = '0.8';
        piece.style.boxShadow = `0 0 20px ${colors[Math.floor(Math.random() * colors.length)]}`;
        container.appendChild(piece);
      }, i * 60 + 200);
    }

    setTimeout(() => {
      container.remove();
    }, 3500);
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

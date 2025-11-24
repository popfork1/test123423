import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { Game, News as NewsType, Pickem, PickemRules } from "@shared/schema";
import { format } from "date-fns";
import { Plus, Trash2, Edit, Save } from "lucide-react";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl md:text-5xl font-black mb-8" data-testid="text-page-title">
        Admin Dashboard
      </h1>

      <Tabs defaultValue="games" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="games" data-testid="tab-games">Games</TabsTrigger>
          <TabsTrigger value="scores" data-testid="tab-scores">Scores</TabsTrigger>
          <TabsTrigger value="news" data-testid="tab-news">News</TabsTrigger>
          <TabsTrigger value="pickems" data-testid="tab-pickems">Pick'ems</TabsTrigger>
          <TabsTrigger value="rules" data-testid="tab-rules">Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="games">
          <GamesManager />
        </TabsContent>

        <TabsContent value="scores">
          <ScoresManager />
        </TabsContent>

        <TabsContent value="news">
          <NewsManager />
        </TabsContent>

        <TabsContent value="pickems">
          <PickemsManager />
        </TabsContent>

        <TabsContent value="rules">
          <RulesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GamesManager() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    week: 1,
    homeTeam: "",
    awayTeam: "",
    gameTime: "",
    location: "",
  });

  const { data: games } = useQuery<Game[]>({
    queryKey: ["/api/games/all"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("POST", "/api/games", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({ title: "Success", description: "Game added successfully" });
      setFormData({ week: 1, homeTeam: "", awayTeam: "", gameTime: "", location: "" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to add game", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/games/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({ title: "Success", description: "Game deleted successfully" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to delete game", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Add New Game</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="week">Week</Label>
              <Input
                id="week"
                type="number"
                min="1"
                max="18"
                value={formData.week}
                onChange={(e) => setFormData({ ...formData, week: parseInt(e.target.value) })}
                required
                data-testid="input-week"
              />
            </div>
            <div>
              <Label htmlFor="gameTime">Game Date & Time</Label>
              <Input
                id="gameTime"
                type="datetime-local"
                value={formData.gameTime}
                onChange={(e) => setFormData({ ...formData, gameTime: e.target.value })}
                required
                data-testid="input-gametime"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="awayTeam">Away Team</Label>
              <Input
                id="awayTeam"
                value={formData.awayTeam}
                onChange={(e) => setFormData({ ...formData, awayTeam: e.target.value })}
                required
                data-testid="input-away-team"
              />
            </div>
            <div>
              <Label htmlFor="homeTeam">Home Team</Label>
              <Input
                id="homeTeam"
                value={formData.homeTeam}
                onChange={(e) => setFormData({ ...formData, homeTeam: e.target.value })}
                required
                data-testid="input-home-team"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              data-testid="input-location"
            />
          </div>

          <Button type="submit" className="gap-2" disabled={createMutation.isPending} data-testid="button-add-game">
            <Plus className="w-4 h-4" />
            {createMutation.isPending ? "Adding..." : "Add Game"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">All Games</h2>
        <div className="space-y-3">
          {games?.map((game) => (
            <div key={game.id} className="flex items-center justify-between p-4 border rounded-md" data-testid={`game-item-${game.id}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge>Week {game.week}</Badge>
                  {game.isLive && <Badge variant="default">LIVE</Badge>}
                  {game.isFinal && <Badge variant="secondary">FINAL</Badge>}
                </div>
                <p className="font-semibold">{game.awayTeam} @ {game.homeTeam}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(game.gameTime), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => deleteMutation.mutate(game.id)}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-${game.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ScoresManager() {
  const { toast } = useToast();
  const { data: games } = useQuery<Game[]>({
    queryKey: ["/api/games/all"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Game> }) => {
      await apiRequest("PATCH", `/api/games/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({ title: "Success", description: "Score updated successfully" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update score", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Update Scores</h2>
        <div className="space-y-4">
          {games?.map((game) => (
            <Card key={game.id} className="p-4" data-testid={`score-card-${game.id}`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{game.awayTeam} @ {game.homeTeam}</p>
                    <p className="text-sm text-muted-foreground">Week {game.week}</p>
                  </div>
                  <Badge>{game.quarter}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor={`away-${game.id}`}>Away Score</Label>
                    <Input
                      id={`away-${game.id}`}
                      type="number"
                      min="0"
                      defaultValue={game.awayScore || 0}
                      onBlur={(e) => {
                        const newScore = parseInt(e.target.value) || 0;
                        if (newScore !== game.awayScore) {
                          updateMutation.mutate({ id: game.id, data: { awayScore: newScore } });
                        }
                      }}
                      data-testid={`input-away-score-${game.id}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`home-${game.id}`}>Home Score</Label>
                    <Input
                      id={`home-${game.id}`}
                      type="number"
                      min="0"
                      defaultValue={game.homeScore || 0}
                      onBlur={(e) => {
                        const newScore = parseInt(e.target.value) || 0;
                        if (newScore !== game.homeScore) {
                          updateMutation.mutate({ id: game.id, data: { homeScore: newScore } });
                        }
                      }}
                      data-testid={`input-home-score-${game.id}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`quarter-${game.id}`}>Quarter/Status</Label>
                    <Input
                      id={`quarter-${game.id}`}
                      defaultValue={game.quarter || "Scheduled"}
                      onBlur={(e) => {
                        if (e.target.value !== game.quarter) {
                          updateMutation.mutate({ id: game.id, data: { quarter: e.target.value } });
                        }
                      }}
                      data-testid={`input-quarter-${game.id}`}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={game.isLive || false}
                        onCheckedChange={(checked) => {
                          updateMutation.mutate({ id: game.id, data: { isLive: checked } });
                        }}
                        data-testid={`switch-live-${game.id}`}
                      />
                      <Label>Live</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={game.isFinal || false}
                        onCheckedChange={(checked) => {
                          updateMutation.mutate({ id: game.id, data: { isFinal: checked } });
                        }}
                        data-testid={`switch-final-${game.id}`}
                      />
                      <Label>Final</Label>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}

function NewsManager() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
  });

  const { data: news } = useQuery<NewsType[]>({
    queryKey: ["/api/news"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData & { authorId: string }) => {
      await apiRequest("POST", "/api/news", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "Success", description: "News posted successfully" });
      setFormData({ title: "", content: "", excerpt: "" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to post news", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/news/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "Success", description: "News deleted successfully" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to delete news", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.id) {
      createMutation.mutate({ ...formData, authorId: user.id });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Create News Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              data-testid="input-news-title"
            />
          </div>

          <div>
            <Label htmlFor="excerpt">Excerpt (Optional)</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              data-testid="input-news-excerpt"
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              required
              data-testid="input-news-content"
            />
          </div>

          <Button type="submit" className="gap-2" disabled={createMutation.isPending} data-testid="button-post-news">
            <Plus className="w-4 h-4" />
            {createMutation.isPending ? "Posting..." : "Post News"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">All News Posts</h2>
        <div className="space-y-3">
          {news?.map((post) => (
            <div key={post.id} className="flex items-start justify-between p-4 border rounded-md" data-testid={`news-item-${post.id}`}>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{post.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(post.createdAt!), "MMM d, yyyy")}
                </p>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => deleteMutation.mutate(post.id)}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-news-${post.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PickemsManager() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    week: 1,
    pickemUrl: "",
  });

  const { data: pickems } = useQuery<Pickem[]>({
    queryKey: ["/api/pickems"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("POST", "/api/pickems", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pickems"] });
      toast({ title: "Success", description: "Pick'em added successfully" });
      setFormData({ week: 1, pickemUrl: "" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to add pick'em", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/pickems/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pickems"] });
      toast({ title: "Success", description: "Pick'em deleted successfully" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to delete pick'em", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Add Pick'em Link</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="pickem-week">Week</Label>
            <Input
              id="pickem-week"
              type="number"
              min="1"
              max="18"
              value={formData.week}
              onChange={(e) => setFormData({ ...formData, week: parseInt(e.target.value) })}
              required
              data-testid="input-pickem-week"
            />
          </div>

          <div>
            <Label htmlFor="pickemUrl">Pick'em URL</Label>
            <Input
              id="pickemUrl"
              type="url"
              value={formData.pickemUrl}
              onChange={(e) => setFormData({ ...formData, pickemUrl: e.target.value })}
              placeholder="https://..."
              required
              data-testid="input-pickem-url"
            />
          </div>

          <Button type="submit" className="gap-2" disabled={createMutation.isPending} data-testid="button-add-pickem">
            <Plus className="w-4 h-4" />
            {createMutation.isPending ? "Adding..." : "Add Pick'em"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">All Pick'ems</h2>
        <div className="space-y-3">
          {pickems?.map((pickem) => (
            <div key={pickem.id} className="flex items-center justify-between p-4 border rounded-md" data-testid={`pickem-item-${pickem.id}`}>
              <div className="flex-1">
                <p className="font-semibold">Week {pickem.week}</p>
                <p className="text-sm text-muted-foreground truncate">{pickem.pickemUrl}</p>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => deleteMutation.mutate(pickem.id)}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-pickem-${pickem.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function RulesManager() {
  const { toast } = useToast();
  const [content, setContent] = useState("");

  const { data: rules } = useQuery<PickemRules>({
    queryKey: ["/api/pickems/rules"],
  });

  useEffect(() => {
    if (rules) {
      setContent(rules.content);
    }
  }, [rules]);

  const updateMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      await apiRequest("POST", "/api/pickems/rules", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pickems/rules"] });
      toast({ title: "Success", description: "Rules updated successfully" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update rules", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ content });
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Pick'em Rules</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="rules">Official Rules</Label>
          <Textarea
            id="rules"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            required
            data-testid="input-rules"
          />
        </div>

        <Button type="submit" className="gap-2" disabled={updateMutation.isPending} data-testid="button-save-rules">
          <Save className="w-4 h-4" />
          {updateMutation.isPending ? "Saving..." : "Save Rules"}
        </Button>
      </form>
    </Card>
  );
}

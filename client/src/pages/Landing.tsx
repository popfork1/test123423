import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GameCard } from "@/components/GameCard";
import type { Game, News as NewsType } from "@shared/schema";
import { useLocation, Link } from "wouter";
import { ArrowRight, Calendar, MessageSquare, Trophy, Newspaper, Target, Sparkles, TreePine, Star, Gift } from "lucide-react";
import { format } from "date-fns";

export default function Landing() {
  const [, setLocation] = useLocation();

  const { data: games, isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ["/api/games/current"],
  });

  const { data: news, isLoading: newsLoading } = useQuery<NewsType[]>({
    queryKey: ["/api/news"],
  });

  const currentWeek = games && games.length > 0 ? games[0].week : 1;
  const featuredNews = news?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background relative">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="absolute top-20 left-10 opacity-20 animate-pulse">
          <TreePine className="w-24 h-24 text-secondary" />
        </div>
        <div className="absolute top-32 right-16 opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>
          <TreePine className="w-16 h-16 text-secondary" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 pt-12 pb-20 md:pt-20 md:pb-28">
          <div className="text-center mb-16 relative">
            <div className="inline-flex items-center gap-2 mb-6">
              <Badge className="px-4 py-2 text-sm font-semibold bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                <Sparkles className="w-4 h-4 mr-2" />
                BFFL Season 1
              </Badge>
            </div>
            
            <div className="relative inline-block mb-6">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight" data-testid="text-hero-title">
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  BFFL
                </span>
                <span className="text-foreground"> Fan Hub</span>
              </h1>
              <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6">
                <Star className="w-8 h-8 md:w-12 md:h-12 text-accent animate-pulse" fill="currentColor" />
              </div>
            </div>
            
            <p className="text-lg text-primary font-semibold mb-2 tracking-wide">
              FFN Network
            </p>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Your ultimate destination for live scores, real-time discussion, and everything BFFL this holiday season
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => setLocation("/scores")} 
                className="gap-2 shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:scale-105 transition-all text-base px-8 py-6"
                data-testid="button-view-scores"
              >
                <Trophy className="w-5 h-5" />
                Live Scores
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => setLocation("/schedule")} 
                className="border-2 hover:bg-secondary/10 hover:border-secondary hover:scale-105 transition-all text-base px-8 py-6"
                data-testid="button-view-schedule"
              >
                <Calendar className="w-5 h-5 mr-2" />
                View Schedule
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black" data-testid="text-this-week">
                  Week {currentWeek} Games
                </h2>
                <p className="text-muted-foreground text-sm">Follow all the action this week</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => setLocation("/scores")} className="gap-2 hover:bg-primary/10">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {gamesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : games && games.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onClick={() => setLocation(`/game/${game.id}`)}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center rounded-2xl border-dashed border-2">
              <div className="text-4xl mb-4">🎄</div>
              <p className="text-muted-foreground text-lg">No games scheduled yet</p>
              <p className="text-sm text-muted-foreground mt-2">Check back soon for upcoming matchups!</p>
            </Card>
          )}
        </div>

        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-lg shadow-accent/20">
                <Newspaper className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black" data-testid="text-latest-news">
                  Latest News
                </h2>
                <p className="text-muted-foreground text-sm">Stay updated with the newest announcements</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => setLocation("/news")} className="gap-2 hover:bg-accent/10">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {newsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          ) : featuredNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredNews.map((post, index) => (
                <Link key={post.id} href={`/news/${post.id}`}>
                  <Card 
                    className="group p-6 flex flex-col cursor-pointer h-full rounded-2xl border-2 border-transparent hover:border-accent/30 hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 hover:-translate-y-1" 
                    data-testid={`news-card-${post.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{index === 0 ? '🎄' : index === 1 ? '🎁' : '⭐'}</span>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide" data-testid={`news-date-${post.id}`}>
                          {format(new Date(post.createdAt!), "MMM d, yyyy")}
                        </p>
                      </div>
                      <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors" data-testid={`news-title-${post.id}`}>
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1" data-testid={`news-excerpt-${post.id}`}>
                          {post.excerpt}
                        </p>
                      )}
                      <div className="prose prose-sm max-w-none line-clamp-3 text-muted-foreground text-sm" data-testid={`news-content-${post.id}`}>
                        {post.content}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <span className="text-sm text-primary font-medium group-hover:underline inline-flex items-center gap-1">
                        Read more <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center rounded-2xl border-dashed border-2">
              <div className="text-4xl mb-4">📰</div>
              <p className="text-muted-foreground text-lg">No news yet</p>
              <p className="text-sm text-muted-foreground mt-2">Stay tuned for updates!</p>
            </Card>
          )}
        </div>

        <div className="mb-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <Gift className="w-6 h-6 text-primary" />
              <h2 className="text-2xl md:text-3xl font-black">Everything You Need</h2>
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <p className="text-muted-foreground">All your BFFL essentials in one festive place</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="group p-6 rounded-2xl border-2 border-transparent hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer" onClick={() => setLocation("/scores")}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Trophy className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Live Scores</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                Follow every game with real-time score updates and live status indicators
              </p>
              <span className="text-primary text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                View <ArrowRight className="w-4 h-4" />
              </span>
            </Card>

            <Card className="group p-6 rounded-2xl border-2 border-transparent hover:border-secondary/20 hover:shadow-xl hover:shadow-secondary/5 transition-all duration-300 cursor-pointer" onClick={() => games?.length ? setLocation(`/game/${games[0].id}`) : null}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-secondary transition-colors">Live Chat</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                Join the conversation with fans in real-time during every game
              </p>
              <span className="text-secondary text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Chat <ArrowRight className="w-4 h-4" />
              </span>
            </Card>

            <Card className="group p-6 rounded-2xl border-2 border-transparent hover:border-accent/20 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 cursor-pointer" onClick={() => setLocation("/schedule")}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">Full Schedule</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                Never miss a game with our complete season schedule and results
              </p>
              <span className="text-accent text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Schedule <ArrowRight className="w-4 h-4" />
              </span>
            </Card>

            <Card className="group p-6 rounded-2xl border-2 border-transparent hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer" onClick={() => setLocation("/news")}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Newspaper className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Latest News</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                Stay updated with breaking news and important announcements
              </p>
              <span className="text-primary text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                News <ArrowRight className="w-4 h-4" />
              </span>
            </Card>

            <Card className="group p-6 rounded-2xl border-2 border-transparent hover:border-secondary/20 hover:shadow-xl hover:shadow-secondary/5 transition-all duration-300 cursor-pointer" onClick={() => setLocation("/pickems")}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-secondary transition-colors">Weekly Pick'ems</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                Test your predictions with our weekly pick'em challenges
              </p>
              <span className="text-secondary text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Pick'ems <ArrowRight className="w-4 h-4" />
              </span>
            </Card>

            <Card className="group p-6 rounded-2xl border-2 border-transparent hover:border-accent/20 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 cursor-pointer" onClick={() => setLocation("/previous-weeks")}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Trophy className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">Game Archives</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                Browse complete results from all previous weeks of the season
              </p>
              <span className="text-accent text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Archives <ArrowRight className="w-4 h-4" />
              </span>
            </Card>
          </div>
        </div>

        <div className="text-center py-16 border-t border-border/50">
          <div className="inline-block mb-6">
            <div className="flex items-center justify-center gap-4 text-4xl">
              <span>🎄</span>
              <span>🎅</span>
              <span>🎁</span>
            </div>
          </div>
          <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto">
            Ready to manage your BFFL content? Log in as admin to post games, news, and more.
          </p>
          <a href="/login">
            <Button size="lg" className="gap-2 shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:scale-105 transition-all" data-testid="button-admin-login">
              <span>🎅</span>
              Admin Login
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

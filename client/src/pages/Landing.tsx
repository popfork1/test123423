import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, MessageSquare, Trophy, Newspaper, Target } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black mb-6" data-testid="text-hero-title">
            NFL Fan Hub
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your ultimate destination for live scores, real-time discussion, and everything NFL
          </p>
          <a href="/api/login">
            <Button size="lg" className="text-lg px-8 py-6" data-testid="button-admin-login">
              Admin Login
            </Button>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Live Scores</h3>
            <p className="text-muted-foreground">
              Follow every game with real-time score updates and live status indicators
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Live Chat</h3>
            <p className="text-muted-foreground">
              Join the conversation with fans in real-time during every game
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Full Schedule</h3>
            <p className="text-muted-foreground">
              Never miss a game with our complete season schedule and results
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Latest News</h3>
            <p className="text-muted-foreground">
              Stay updated with breaking news and important announcements
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Weekly Pick'ems</h3>
            <p className="text-muted-foreground">
              Test your predictions with our weekly pick'em challenges
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Game Archives</h3>
            <p className="text-muted-foreground">
              Browse complete results from all previous weeks of the season
            </p>
          </Card>
        </div>

        <div className="text-center text-muted-foreground">
          <p>Welcome to NFL Fan Hub - where fans come together</p>
        </div>
      </div>
    </div>
  );
}

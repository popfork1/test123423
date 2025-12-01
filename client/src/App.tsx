import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import Landing from "@/pages/Landing";
import LiveScores from "@/pages/LiveScores";
import GameDetail from "@/pages/GameDetail";
import PreviousWeeks from "@/pages/PreviousWeeks";
import Schedule from "@/pages/Schedule";
import Playoffs from "@/pages/Playoffs";
import Standings from "@/pages/Standings";
import News from "@/pages/News";
import NewsDetail from "@/pages/NewsDetail";
import Pickems from "@/pages/Pickems";
import AdminDashboard from "@/pages/AdminDashboard";
import SocialLinks from "@/pages/SocialLinks";
import Changelogs from "@/pages/Changelogs";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Festive snowflakes */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-white opacity-80 select-none font-bold"
            style={{
              fontSize: Math.random() * 20 + 10 + 'px',
              left: Math.random() * 100 + '%',
              animation: i % 2 === 0 ? `snowfall ${Math.random() * 10 + 8}s linear infinite` : `snowfall-2 ${Math.random() * 10 + 8}s linear infinite`,
              animationDelay: Math.random() * 5 + 's',
              top: -20 + 'px',
              color: i % 3 === 0 ? 'hsl(0 78% 48%)' : i % 3 === 1 ? 'hsl(43 96% 56%)' : 'hsl(34 25% 96%)',
            }}
          >
            ❄
          </div>
        ))}
      </div>

      {/* Twinkling lights border */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-yellow-400 via-green-600 to-red-500 z-50 opacity-80">
        <div className="flex justify-around h-full">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="w-1 rounded-full"
              style={{
                animation: `twinkle ${1 + (i % 3) * 0.5}s ease-in-out infinite`,
                animationDelay: (i * 0.1) + 's',
                backgroundColor: i % 3 === 0 ? 'hsl(0 78% 48%)' : i % 3 === 1 ? 'hsl(43 96% 56%)' : 'hsl(138 44% 32%)',
              }}
            />
          ))}
        </div>
      </div>

      <Header />
      
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/scores" component={LiveScores} />
        <Route path="/game/:id" component={GameDetail} />
        <Route path="/previous-weeks" component={PreviousWeeks} />
        <Route path="/schedule" component={Schedule} />
        <Route path="/playoffs" component={Playoffs} />
        <Route path="/standings" component={Standings} />
        <Route path="/news" component={News} />
        <Route path="/news/:id" component={NewsDetail} />
        <Route path="/pickems" component={Pickems} />
        <Route path="/social" component={SocialLinks} />
        <Route path="/changelogs" component={Changelogs} />
        {isAuthenticated && <Route path="/admin" component={AdminDashboard} />}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

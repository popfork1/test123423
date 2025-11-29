import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Zap, Bug, Palette } from "lucide-react";

interface Changelog {
  version: string;
  date: string;
  status: "NEW" | "IMPROVED" | "FIXED" | "DESIGN";
  title: string;
  description: string;
  changes: string[];
}

export default function Changelogs() {
  const changelogs: Changelog[] = [
    {
      version: "1.3.0",
      date: "November 29, 2024",
      status: "NEW",
      title: "NFL Team Logos Added",
      description: "Enhanced visual experience across the app with official NFL team logos",
      changes: [
        "Added team logos to live scores",
        "Team logos in schedule view",
        "Logos in game details page",
        "Logos in standings table",
        "Logos in playoff bracket",
      ],
    },
    {
      version: "1.2.0",
      date: "November 28, 2024",
      status: "IMPROVED",
      title: "Playoff Bracket System",
      description: "Complete playoff bracket implementation with database persistence",
      changes: [
        "12-team playoff bracket visualization",
        "Week-by-week navigation (Wildcard, Divisional, Conference, Super Bowl)",
        "Team selection for authenticated users",
        "Public bracket viewing",
        "Bracket reset functionality",
      ],
    },
    {
      version: "1.1.0",
      date: "November 27, 2024",
      status: "IMPROVED",
      title: "News and Content Management",
      description: "Full-featured news system with admin dashboard",
      changes: [
        "Clickable news posts with detail pages",
        "News post creation and editing",
        "News excerpt display",
        "Dark mode support for content",
        "Admin dashboard for news management",
      ],
    },
    {
      version: "1.0.0",
      date: "November 25, 2024",
      status: "NEW",
      title: "BFFL Platform Launch",
      description: "Initial release of the BFFL Fantasy Football League web app",
      changes: [
        "Live scores and real-time updates",
        "Full season schedule view",
        "Team standings and rankings",
        "Week-by-week game navigation",
        "User authentication system",
        "Admin dashboard",
        "Dark mode support",
        "WebSocket chat integration",
        "Responsive design",
      ],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "NEW":
        return <Plus className="w-4 h-4" />;
      case "IMPROVED":
        return <Zap className="w-4 h-4" />;
      case "FIXED":
        return <Bug className="w-4 h-4" />;
      case "DESIGN":
        return <Palette className="w-4 h-4" />;
      default:
        return <Plus className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "IMPROVED":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "FIXED":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      case "DESIGN":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black mb-4" data-testid="text-page-title">
          Changelogs
        </h1>
        <p className="text-muted-foreground text-lg">
          Track all updates, improvements, and fixes to the BFFL platform
        </p>
      </div>

      <div className="space-y-8">
        {changelogs.map((changelog) => (
          <Card
            key={changelog.version}
            className="p-6 hover-elevate"
            data-testid={`card-changelog-${changelog.version}`}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold" data-testid={`text-version-${changelog.version}`}>
                    v{changelog.version}
                  </h2>
                  <Badge
                    className={`flex items-center gap-1 ${getStatusColor(changelog.status)}`}
                    data-testid={`badge-status-${changelog.version}`}
                  >
                    {getStatusIcon(changelog.status)}
                    {changelog.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground" data-testid={`text-date-${changelog.version}`}>
                  {changelog.date}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2" data-testid={`text-title-${changelog.version}`}>
                {changelog.title}
              </h3>
              <p className="text-muted-foreground" data-testid={`text-description-${changelog.version}`}>
                {changelog.description}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">What's Included:</h4>
              <ul className="space-y-2">
                {changelog.changes.map((change, index) => (
                  <li
                    key={index}
                    className="text-sm flex items-start gap-3"
                    data-testid={`text-change-${changelog.version}-${index}`}
                  >
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-8 bg-muted/50 mt-12">
        <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
        <p className="text-muted-foreground">
          We're constantly working on new features and improvements. Stay tuned for more updates!
        </p>
      </Card>
    </div>
  );
}

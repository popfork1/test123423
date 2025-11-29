import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Zap, Bug, Palette, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import type { Changelog } from "@shared/schema";

export default function Changelogs() {
  const { isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"NEW" | "IMPROVED" | "FIXED" | "DESIGN">("NEW");
  const [changesText, setChangesText] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));

  const { data: dbChangelogs = [], isLoading } = useQuery<Changelog[]>({
    queryKey: ["/api/changelogs"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!version || !title || !changesText) {
        throw new Error("Please fill in all required fields");
      }
      const changes = changesText.split("\n").filter(c => c.trim());
      await apiRequest("POST", "/api/changelogs", {
        version,
        title,
        description,
        status,
        changes: JSON.stringify(changes),
        date,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/changelogs"] });
      setVersion("");
      setTitle("");
      setDescription("");
      setChangesText("");
      setStatus("NEW");
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/changelogs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/changelogs"] });
    },
  });

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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl md:text-5xl font-black" data-testid="text-page-title">
            Changelogs
          </h1>
          {isAuthenticated && (
            <Button
              onClick={() => setShowForm(!showForm)}
              className="gap-2"
              data-testid="button-add-changelog"
            >
              <Plus className="w-4 h-4" />
              Add Changelog
            </Button>
          )}
        </div>
        <p className="text-muted-foreground text-lg">
          Track all updates, improvements, and fixes to the BFFL platform
        </p>
      </div>

      {isAuthenticated && showForm && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Create New Changelog</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="version">Version *</Label>
                <Input
                  id="version"
                  placeholder="1.4.0"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  data-testid="input-version"
                />
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                  <SelectTrigger id="status" data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">NEW</SelectItem>
                    <SelectItem value="IMPROVED">IMPROVED</SelectItem>
                    <SelectItem value="FIXED">FIXED</SelectItem>
                    <SelectItem value="DESIGN">DESIGN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Feature name or update title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  data-testid="input-title"
                />
              </div>
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  data-testid="input-date"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of this release"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-testid="input-description"
              />
            </div>

            <div>
              <Label htmlFor="changes">Changes (one per line) *</Label>
              <Textarea
                id="changes"
                placeholder="Added new feature&#10;Fixed bug&#10;Improved performance"
                value={changesText}
                onChange={(e) => setChangesText(e.target.value)}
                className="h-32"
                data-testid="textarea-changes"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                data-testid="button-create-changelog"
              >
                Create Changelog
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-8">
        {isLoading ? (
          <Card className="p-6"><div className="text-muted-foreground">Loading changelogs...</div></Card>
        ) : dbChangelogs.length > 0 ? (
          dbChangelogs.map((changelog) => (
            <Card
              key={changelog.id}
              className="p-6 hover-elevate"
              data-testid={`card-changelog-${changelog.version}`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex-1">
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
                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(changelog.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${changelog.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2" data-testid={`text-title-${changelog.version}`}>
                  {changelog.title}
                </h3>
                {changelog.description && (
                  <p className="text-muted-foreground" data-testid={`text-description-${changelog.version}`}>
                    {changelog.description}
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">What's Included:</h4>
                <ul className="space-y-2">
                  {JSON.parse(changelog.changes).map((change: string, index: number) => (
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
          ))
        ) : (
          <Card className="p-8 text-center bg-muted/50">
            <p className="text-muted-foreground">No changelogs yet. Create your first one!</p>
          </Card>
        )}
      </div>
    </div>
  );
}

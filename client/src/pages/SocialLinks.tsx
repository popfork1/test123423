import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Github, Twitter, Linkedin, Mail, Link2 } from "lucide-react";
import { Music, Youtube } from "lucide-react";

interface SocialLink {
  title: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  color: string;
}

export default function SocialLinks() {
  const socialLinks: SocialLink[] = [
    {
      title: "GitHub",
      description: "Follow our development on GitHub",
      icon: <Github className="w-8 h-8" />,
      url: "https://github.com",
      color: "hover:text-zinc-600 dark:hover:text-zinc-400",
    },
    {
      title: "Twitter",
      description: "Get the latest updates and news",
      icon: <Twitter className="w-8 h-8" />,
      url: "https://twitter.com",
      color: "hover:text-blue-400",
    },
    {
      title: "LinkedIn",
      description: "Connect with our team professionally",
      icon: <Linkedin className="w-8 h-8" />,
      url: "https://linkedin.com",
      color: "hover:text-blue-600",
    },
    {
      title: "Email",
      description: "Send us an email",
      icon: <Mail className="w-8 h-8" />,
      url: "mailto:contact@bffl.com",
      color: "hover:text-red-500",
    },
    {
      title: "Discord",
      description: "Join our Discord community",
      icon: <Music className="w-8 h-8" />,
      url: "https://discord.gg",
      color: "hover:text-indigo-500",
    },
    {
      title: "YouTube",
      description: "Subscribe to our YouTube channel",
      icon: <Youtube className="w-8 h-8" />,
      url: "https://youtube.com/@bffl",
      color: "hover:text-red-600",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black mb-4" data-testid="text-page-title">
          Connect With Us
        </h1>
        <p className="text-muted-foreground text-lg">
          Follow BFFL on social media and stay updated with the latest news, updates, and announcements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-12">
        {socialLinks.map((link) => (
          <Card
            key={link.title}
            className="p-8 flex flex-col items-center text-center hover-elevate cursor-pointer"
            onClick={() => window.open(link.url, "_blank")}
            data-testid={`card-social-${link.title.toLowerCase()}`}
          >
            <div className={`mb-4 transition-colors ${link.color}`}>
              {link.icon}
            </div>
            <h3 className="text-xl font-bold mb-2" data-testid={`text-${link.title.toLowerCase()}`}>
              {link.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 flex-1">
              {link.description}
            </p>
            <Button variant="outline" size="sm" className="gap-2" data-testid={`button-visit-${link.title.toLowerCase()}`}>
              <Link2 className="w-4 h-4" />
              Visit
            </Button>
          </Card>
        ))}
      </div>

      <Card className="p-8 bg-muted/50">
        <h2 className="text-2xl font-bold mb-4">Other Ways to Connect</h2>
        <p className="text-muted-foreground mb-6">
          Can't find what you're looking for? Reach out to us through our contact page or send us a direct message on any of our social channels. We'd love to hear from you!
        </p>
        <Button onClick={() => window.open("mailto:contact@bffl.com", "_blank")} className="gap-2" data-testid="button-contact-us">
          <Mail className="w-4 h-4" />
          Contact Us
        </Button>
      </Card>
    </div>
  );
}

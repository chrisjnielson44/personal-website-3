import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import { socialLinks } from "@/data/social";

const iconMap = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  mail: Mail,
} as const;

export function Footer() {
  return (
    <footer className="mt-auto py-8">
      <div className="mx-auto max-w-[var(--spacing-content)] px-6">
        <div className="flex justify-center">
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => {
              const Icon = iconMap[link.icon as keyof typeof iconMap];
              return (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted transition-colors hover:text-accent"
                  aria-label={link.name}
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

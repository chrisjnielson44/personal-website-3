"use client";

import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialIconProps {
  className?: string;
}

export function GitHubIcon({ className }: SocialIconProps) {
  return <Github className={cn("h-5 w-5", className)} />;
}

export function LinkedInIcon({ className }: SocialIconProps) {
  return <Linkedin className={cn("h-5 w-5", className)} />;
}

export function XIcon({ className }: SocialIconProps) {
  return <Twitter className={cn("h-5 w-5", className)} />;
}

export function MailIcon({ className }: SocialIconProps) {
  return <Mail className={cn("h-5 w-5", className)} />;
}

const iconMap = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  twitter: XIcon,
  mail: MailIcon,
} as const;

interface SocialLinkProps {
  href: string;
  icon: keyof typeof iconMap;
  label: string;
  className?: string;
}

export function SocialLink({ href, icon, label, className }: SocialLinkProps) {
  const Icon = iconMap[icon];

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "text-muted transition-colors duration-150 hover:text-accent",
        className,
      )}
    >
      <Icon />
    </a>
  );
}

interface SocialLinksProps {
  className?: string;
  iconClassName?: string;
}

export function SocialLinks({ className, iconClassName }: SocialLinksProps) {
  const links = [
    {
      href: "https://github.com/chrisjnielson44",
      icon: "github" as const,
      label: "Follow on GitHub",
    },
    {
      href: "https://www.linkedin.com/in/christopherjnielson/",
      icon: "linkedin" as const,
      label: "Connect on LinkedIn",
    },
    {
      href: "https://twitter.com/chrisjnielson",
      icon: "twitter" as const,
      label: "Follow on X",
    },
    {
      href: "mailto:cjnielson44@gmail.com",
      icon: "mail" as const,
      label: "Send an email",
    },
  ];

  return (
    <div className={cn("flex items-center gap-5", className)}>
      {links.map((link) => (
        <SocialLink
          key={link.icon}
          href={link.href}
          icon={link.icon}
          label={link.label}
          className={iconClassName}
        />
      ))}
    </div>
  );
}

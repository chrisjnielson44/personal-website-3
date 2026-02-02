export const socialLinks = [
  {
    name: "GitHub",
    url: "https://github.com/chrisjnielson44",
    icon: "github",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/christopherjnielson/",
    icon: "linkedin",
  },
  {
    name: "X",
    url: "https://twitter.com/chrisjnielson",
    icon: "twitter",
  },
  {
    name: "Email",
    url: "mailto:cjnielson44@gmail.com",
    icon: "mail",
  },
] as const;

export type SocialLink = (typeof socialLinks)[number];

export const socialLinks = [
  {
    name: "GitHub",
    url: "https://github.com/chrisjnielson44",
    icon: "github",
  },
  {
    name: "HuggingFace",
    url: "https://huggingface.co/cjnielson44",
    icon: "huggingface",
  },
  {
    name: "Email",
    url: "mailto:cjnielson44@gmail.com",
    icon: "mail",
  },
] as const;

export type SocialLink = (typeof socialLinks)[number];

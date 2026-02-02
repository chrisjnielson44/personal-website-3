export interface Project {
  name: string;
  description: string;
  link: {
    href: string;
    label: string;
  };
  tags?: string[];
}

export const projects: Project[] = [
  {
    name: "AMATS - Algorithmic Trading System",
    description:
      "A comprehensive algorithmic trading platform for multi-asset trading (equities, crypto) with dynamic strategy adaptation. Features 25+ specialized AI agents that debate and reach consensus on trading decisions, local LLM sentiment analysis via Ollama, and implemented strategies including Momentum, Mean Reversion, and Grid Trading with full backtesting support.",
    link: {
      href: "https://github.com/chrisjnielson44/amats-engine",
      label: "github.com/amats-engine",
    },
    tags: ["Python", "FastAPI", "LLM", "Trading"],
  },
];

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
    name: "ML Risk API",
    description:
      "A modular machine learning backend for risk analysis. Provides API routes for multiple risk-related applications, allowing them to trigger ML analysis (Best Features, Time Series, Anomaly Detection) via JSON config files. Returns serialized JSON results and supports scalable, secure analysis for diverse risk metrics across financial instruments.",
    link: {
      href: "https://github.com/chrisjnielson44/MLRiskAPI",
      label: "github.com/MLRiskAPI",
    },
    tags: ["Python", "FastAPI", "Machine Learning"],
  },
  {
    name: "Impact File Trade Analysis",
    description:
      "A risk metrics analysis system for financial products like FX, interest rates, and futures, comparing QUIC and Acadia engines. Incorporates machine learning and NLP to enhance risk data interpretation and improve financial risk assessment.",
    link: {
      href: "https://github.com/chrisjnielson44/impact-trade-file-analysis",
      label: "github.com/impact-trade-file-analysis",
    },
    tags: ["Python", "NLP", "Risk Analysis"],
  },
  {
    name: "Paywind - RIA Tool",
    description:
      "A comprehensive tool that helps financial advisors manage their clients and portfolios with modern web technologies.",
    link: {
      href: "https://paywind.io",
      label: "paywind.io",
    },
    tags: ["Next.js", "TypeScript", "Fintech"],
  },
  {
    name: "Paywind - Personal Finance Manager",
    description:
      "An open source personal finance manager that helps you track spending and budget your money effectively.",
    link: {
      href: "https://budget.paywind.io",
      label: "budget.paywind.io",
    },
    tags: ["React", "Open Source", "Finance"],
  },
];

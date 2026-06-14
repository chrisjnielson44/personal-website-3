export interface Project {
  name: string;
  description: string;
  link?: {
    href: string;
    label: string;
  };
  visibility: "Public" | "Private";
  status?: string;
  tags?: string[];
}

export const projects: Project[] = [
  {
    name: "AMATS - Adaptive Multi-Asset Trading System",
    description:
      "A multi-asset algorithmic trading platform for equities and crypto with dynamic asset discovery, paper and live execution, backtesting, risk controls, and 25+ specialized AI agents that debate decisions before a risk guardian can approve, modify, or veto them.",
    visibility: "Private",
    status: "Private GitHub repository",
    tags: ["Python", "FastAPI", "Multi-agent AI", "CCXT", "TimescaleDB"],
  },
  {
    name: "Auditable Entity Resolution Workbench",
    description:
      "A Python, FastAPI, and Next.js system for resolving procurement vendors against finance entities. It processes more than 76,000 vendor records and 196,000 finance records using multi-pass blocking, interpretable feature scoring, one-to-one resolution, review queues, and knowledge-graph audit components.",
    visibility: "Private",
    status: "Private GitHub repository",
    tags: ["Python", "FastAPI", "Next.js", "Entity Resolution", "Knowledge Graphs"],
  },
  {
    name: "Impact Trade File Analysis",
    description:
      "A multi-engine risk analysis platform for comparing QUIC and Acadia outputs across FX swaps and forwards. It combines Python data processing, PFE and risk metric calculations, decision-tree analysis, PostgreSQL persistence, interactive Next.js visualizations, and LLM-generated explanations.",
    link: {
      href: "https://github.com/chrisjnielson44/impact-trade-file-analysis",
      label: "github.com/impact-trade-file-analysis",
    },
    visibility: "Public",
    tags: ["Python", "Next.js", "D3", "Scikit-learn", "Financial Risk"],
  },
  {
    name: "Paywind",
    description:
      "A modular personal finance dashboard designed to bring banking, investments, and financial insights into one interface. The project explores secure Plaid connectivity, customizable dashboard modules, account aggregation, and a unified view of personal finances.",
    link: {
      href: "https://github.com/chrisjnielson44/paywind",
      label: "github.com/paywind",
    },
    visibility: "Public",
    tags: ["Next.js", "TypeScript", "Plaid", "Fintech"],
  },
  {
    name: "SmartRecipe",
    description:
      "A full-stack meal-planning application that recommends recipes from available ingredients and dietary preferences, builds weekly plans and shopping lists, evaluates nutrition, and includes an AI recipe assistant with persisted conversations and user settings.",
    link: {
      href: "https://github.com/chrisjnielson44/Group-20-SmartRecipeApp",
      label: "github.com/Group-20-SmartRecipeApp",
    },
    visibility: "Public",
    tags: ["Next.js", "Python", "OpenAI", "Prisma", "Full-stack"],
  },
  {
    name: "RiskEval",
    description:
      "A notebook-driven risk research project for comparing trade files and explaining changes in Potential Future Exposure. It uses feature analysis and decision trees to surface the trade, market-data, and risk-engine inputs most associated with material differences.",
    link: {
      href: "https://github.com/chrisjnielson44/RiskEval",
      label: "github.com/RiskEval",
    },
    visibility: "Public",
    tags: ["Python", "Jupyter", "Decision Trees", "PFE", "Risk"],
  },
  {
    name: "MLRiskAPI",
    description:
      "A compact machine-learning API project for reusable risk analytics workflows. It provides a backend surface for model-assisted investigation patterns such as anomaly detection, forecasting, clustering, dimensionality reduction, and feature importance.",
    link: {
      href: "https://github.com/chrisjnielson44/MLRiskAPI",
      label: "github.com/MLRiskAPI",
    },
    visibility: "Public",
    tags: ["Python", "Machine Learning", "API", "Scikit-learn"],
  },
  {
    name: "Personal Website Knowledge Graph",
    description:
      "This portfolio itself: a TanStack Start and React 19 application with an interactive D3 knowledge graph, motion-driven transitions, MDX articles, responsive project views, and a visual system built with Tailwind CSS v4.",
    link: {
      href: "https://github.com/chrisjnielson44/personal-website-3",
      label: "github.com/personal-website-3",
    },
    visibility: "Public",
    tags: ["TanStack Start", "React", "TypeScript", "D3", "Tailwind CSS"],
  },
];

export interface Experience {
  company: string;
  title: string;
  logo?: string;
  start: string;
  end: string;
  description?: string;
}

export const workExperience: Experience[] = [
  {
    company: "BNY",
    title: "Software Engineer",
    start: "Jun 2024",
    end: "Present",
    description:
      "Building governed infrastructure for production AI agents across financial risk, including MCP tool execution, FastAPI and TypeScript services, observability, evaluation, RBAC, audit logging, GraphRAG, and human-in-the-loop workflows.",
  },
  {
    company: "BNY",
    title: "Software Engineering Intern",
    start: "May 2023",
    end: "Aug 2023",
    description:
      "Developed machine learning-driven applications for risk engineering and improved frontend data presentation for risk sensitivity reporting tools.",
  },
  {
    company: "Isofy",
    title: "Software Engineering Intern",
    start: "May 2022",
    end: "Aug 2022",
    description:
      "Full-stack development contributing to network security management solutions.",
  },
];

export const education: Experience[] = [
  {
    company: "Carnegie Mellon University",
    title: "Graduate Certificate, Machine Learning & Data Science",
    start: "2025",
    end: "May 2026",
  },
  {
    company: "Florida State University",
    title: "BS, Computer Science",
    start: "Aug 2021",
    end: "Dec 2024",
    description: "Minor in Business and Mathematics",
  },
];

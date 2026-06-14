export type KnowledgeNodeKind =
  | "profile"
  | "experience"
  | "domain"
  | "concept"
  | "skill"
  | "project"
  | "article"
  | "resource"
  | "personal"
  | "course";

export interface KnowledgeNode {
  id: string;
  label: string;
  kind: KnowledgeNodeKind;
  description: string;
  tags: string[];
  eyebrow?: string;
  href?: string;
  importance?: 1 | 2 | 3 | 4;
  /** Optional cover image (path under /public) shown in the node inspector. */
  image?: string;
}

export interface KnowledgeLink {
  source: string;
  target: string;
  relation: string;
}

export const knowledgeKindLabels: Record<KnowledgeNodeKind, string> = {
  profile: "Profile",
  experience: "Experience",
  domain: "Domain",
  concept: "Capability",
  skill: "Technology",
  project: "Project",
  article: "Article",
  resource: "Resource",
  personal: "Personal",
  course: "Course",
};

interface TranscriptCourse {
  code: string;
  title: string;
  term: string;
  tags: string[];
  /** Institution node this course belongs to. Defaults to "fsu". */
  institution?: "fsu" | "cmu";
}

const transcriptCourses: TranscriptCourse[] = [
  {
    code: "CIS3250",
    title: "Ethics and Computer Science",
    term: "Fall 2021",
    tags: ["Computer Science", "Ethics"],
  },
  {
    code: "COP3353",
    title: "Introduction to Unix",
    term: "Fall 2021",
    tags: ["Computer Science", "Unix", "Systems"],
  },
  {
    code: "EGN1004L",
    title: "First Year Engineering Lab",
    term: "Fall 2021",
    tags: ["Engineering", "Lab"],
  },
  {
    code: "MAC1114",
    title: "Analytic Trigonometry",
    term: "Fall 2021",
    tags: ["Mathematics", "Trigonometry"],
  },
  {
    code: "PHI2635",
    title: "Bioethics",
    term: "Fall 2021",
    tags: ["Ethics", "Philosophy"],
  },
  {
    code: "REL1300",
    title: "Introduction to World Religions",
    term: "Fall 2021",
    tags: ["Humanities", "Religion"],
  },
  {
    code: "COP3014",
    title: "Programming I",
    term: "Spring 2022",
    tags: ["Computer Science", "Programming"],
  },
  {
    code: "EGS3045",
    title: "Global Grand Challenges of Engineering",
    term: "Spring 2022",
    tags: ["Engineering", "Global Systems"],
  },
  {
    code: "ENC2135",
    title: "Research, Genre, and Context",
    term: "Spring 2022",
    tags: ["Writing", "Research"],
  },
  {
    code: "MAC2311",
    title: "Calculus with Analytic Geometry I",
    term: "Spring 2022",
    tags: ["Mathematics", "Calculus"],
  },
  {
    code: "MUL2010",
    title: "Music Literature",
    term: "Spring 2022",
    tags: ["Humanities", "Music"],
  },
  {
    code: "EUH3930",
    title: "The Spanish Civil War",
    term: "Summer 2022",
    tags: ["History", "Spain", "Spanish"],
  },
  {
    code: "GEB3213",
    title: "Business Communication",
    term: "Summer 2022",
    tags: ["Business", "Communication"],
  },
  {
    code: "MAN3600",
    title: "Multinational Business Operations",
    term: "Summer 2022",
    tags: ["Business", "Global Operations"],
  },
  {
    code: "SPN3300",
    title: "Spanish Grammar and Composition",
    term: "Summer 2022",
    tags: ["Spanish", "Writing"],
  },
  {
    code: "COP3330",
    title: "Data, Algorithms, and Programming I",
    term: "Fall 2022",
    tags: ["Computer Science", "Algorithms", "Programming"],
  },
  {
    code: "MAC2312",
    title: "Calculus with Analytic Geometry II",
    term: "Transfer credit",
    tags: ["Mathematics", "Calculus", "Hillsborough Community College"],
  },
  {
    code: "PHY2048C",
    title: "General Physics A",
    term: "Fall 2022",
    tags: ["Physics", "Science"],
  },
  {
    code: "ACG2021",
    title: "Introduction to Financial Accounting",
    term: "Spring 2023",
    tags: ["Business", "Accounting", "Finance"],
  },
  {
    code: "CDA3100",
    title: "Computer Organization I",
    term: "Spring 2023",
    tags: ["Computer Science", "Computer Architecture"],
  },
  {
    code: "COP3252",
    title: "Advanced Programming with Java",
    term: "Spring 2023",
    tags: ["Computer Science", "Java", "Programming"],
  },
  {
    code: "MAD2104",
    title: "Discrete Mathematics I",
    term: "Spring 2023",
    tags: ["Mathematics", "Discrete Math"],
  },
  {
    code: "OCE1001",
    title: "Elementary Oceanography",
    term: "Spring 2023",
    tags: ["Science", "Oceanography"],
  },
  {
    code: "PEM1131",
    title: "Basic Weight Training",
    term: "Spring 2023",
    tags: ["Fitness", "Training"],
  },
  {
    code: "CNT4603",
    title: "Computer and Network Systems Administration",
    term: "Summer 2023",
    tags: ["Computer Science", "Networks", "Systems"],
  },
  {
    code: "COP4342",
    title: "Unix Tools",
    term: "Summer 2023",
    tags: ["Computer Science", "Unix", "Developer Tools"],
  },
  {
    code: "COP4530",
    title: "Data Structures II",
    term: "Summer and Fall 2023",
    tags: ["Computer Science", "Data Structures", "Algorithms"],
  },
  {
    code: "MAD3105",
    title: "Discrete Mathematics II",
    term: "Summer 2023",
    tags: ["Mathematics", "Discrete Math"],
  },
  {
    code: "CAP4601",
    title: "Introduction to Artificial Intelligence",
    term: "Fall 2023",
    tags: ["Computer Science", "Artificial Intelligence"],
  },
  {
    code: "CEN4020",
    title: "Software Engineering I",
    term: "Fall 2023",
    tags: ["Computer Science", "Software Engineering"],
  },
  {
    code: "COT4420",
    title: "Theory of Computation",
    term: "Fall 2023 and Fall 2024",
    tags: ["Computer Science", "Computation Theory"],
  },
  {
    code: "SDS3340",
    title: "Introduction to Career Development",
    term: "Fall 2023",
    tags: ["Career", "Professional Development"],
  },
  {
    code: "STA4442",
    title: "Introduction to Probability I",
    term: "Fall 2023",
    tags: ["Mathematics", "Probability", "Statistics"],
  },
  {
    code: "BSC2010",
    title: "Biological Science I",
    term: "Spring and Fall 2024",
    tags: ["Biology", "Science"],
  },
  {
    code: "BSC2010L",
    title: "Biological Science I Lab",
    term: "Spring 2024",
    tags: ["Biology", "Science", "Lab"],
  },
  {
    code: "CEN4090L",
    title: "Software Engineering Capstone",
    term: "Spring 2024",
    tags: ["Computer Science", "Software Engineering", "Capstone"],
  },
  {
    code: "COP4610",
    title: "Operating Systems",
    term: "Spring 2024",
    tags: ["Computer Science", "Operating Systems", "Systems"],
  },
  {
    code: "COP4710",
    title: "Databases",
    term: "Spring 2024",
    tags: ["Computer Science", "Databases", "SQL"],
  },
  {
    code: "COP4870",
    title: "Full-Stack Application Development in C#",
    term: "Spring 2024",
    tags: ["Computer Science", "Full-stack", "C#"],
  },
  {
    code: "SDS3802",
    title: "Experiential Learning",
    term: "Spring 2024",
    tags: ["Career", "Experiential Learning"],
  },
  {
    code: "CIS3943",
    title: "Computer Science Internship",
    term: "Summer 2024",
    tags: ["Computer Science", "Internship"],
  },
  {
    code: "CHM1045",
    title: "General Chemistry I",
    term: "Fall 2024",
    tags: ["Chemistry", "Science"],
  },
  {
    code: "CIS4385",
    title: "Cybercrime Forensics",
    term: "Fall 2024",
    tags: ["Computer Science", "Cybersecurity", "Forensics"],
  },
  {
    code: "CIS4930",
    title: "Python Programming",
    term: "Fall 2024",
    tags: ["Computer Science", "Python", "Programming"],
  },
  {
    code: "COP4521",
    title: "Secure, Parallel, and Distributed Applications",
    term: "Fall 2024",
    tags: ["Computer Science", "Distributed Systems", "Security"],
  },
  {
    code: "11-604",
    title: "Python for Data Science I",
    term: "Summer 2025",
    tags: ["Computer Science", "Python", "Data Science", "Machine Learning"],
    institution: "cmu",
  },
  {
    code: "11-605",
    title: "Python for Data Science II",
    term: "Summer 2025",
    tags: ["Computer Science", "Python", "Data Science", "Machine Learning"],
    institution: "cmu",
  },
  {
    code: "11-960",
    title: "Math Foundations for Machine Learning",
    term: "Fall 2025",
    tags: ["Mathematics", "Machine Learning", "Linear Algebra", "Probability"],
    institution: "cmu",
  },
  {
    code: "11-961",
    title: "Computational Foundations for Machine Learning",
    term: "Fall 2025",
    tags: ["Computer Science", "Machine Learning", "Algorithms"],
    institution: "cmu",
  },
  {
    code: "11-973",
    title: "Foundations of Computational Data Science",
    term: "Summer 2026 (in progress)",
    tags: ["Computer Science", "Data Science", "Machine Learning"],
    institution: "cmu",
  },
];

const transcriptCourseNodes: KnowledgeNode[] = transcriptCourses.map(
  (course) => {
    const isGraduate = course.institution === "cmu";
    const inProgress = course.term.includes("in progress");
    const record = isGraduate
      ? "Christopher's Carnegie Mellon graduate certificate"
      : "Christopher's undergraduate academic record";
    const status = inProgress ? "in progress as part of" : "completed as part of";

    return {
      id: `course-${course.code.toLowerCase()}`,
      label: course.title,
      kind: "course",
      eyebrow: `${course.code} · ${course.term}`,
      description: `${course.code}, ${course.title}, ${status} ${record}.`,
      tags: [course.code, course.term, ...course.tags],
      importance: isGraduate ? 2 : 1,
    };
  },
);

const coreKnowledgeNodes: KnowledgeNode[] = [
  {
    id: "christopher",
    label: "Christopher Nielson",
    kind: "profile",
    eyebrow: "Software engineer",
    description:
      "Builds infrastructure for production AI agents, governed tool execution, financial-risk systems, and context-rich workflows.",
    tags: ["Pittsburgh", "Production AI", "Risk Engineering", "Spanish"],
    importance: 4,
  },
  {
    id: "bny",
    label: "BNY",
    kind: "experience",
    eyebrow: "June 2024 - present",
    description:
      "Software Engineer in Risk Engineering, building agent platforms, backend APIs, evaluation systems, and governed AI workflows.",
    tags: ["Financial Risk", "Enterprise AI", "Platform Engineering"],
    importance: 4,
    image: "/logos/bny.svg",
  },
  {
    id: "cmu",
    label: "Carnegie Mellon",
    kind: "experience",
    eyebrow: "Completed May 2026",
    description:
      "Graduate Certificate in Machine Learning and Data Science from Carnegie Mellon University's School of Computer Science.",
    tags: ["Machine Learning", "Data Science", "Graduate Certificate"],
    importance: 3,
    image: "/logos/cmu.svg",
  },
  {
    id: "fsu",
    label: "Florida State",
    kind: "experience",
    eyebrow: "Completed December 2024",
    description:
      "Bachelor of Science in Computer Science with minors in Business and Mathematics.",
    tags: ["Computer Science", "Business", "Mathematics"],
    importance: 3,
    image: "/logos/fsu.svg",
  },
  {
    id: "agent-infrastructure",
    label: "Agent infrastructure",
    kind: "domain",
    description:
      "Secure orchestration, tools, context, evaluation, and runtime controls for production AI agents.",
    tags: ["Agents", "Governance", "Orchestration"],
  },
  {
    id: "financial-risk",
    label: "Financial risk",
    kind: "domain",
    description:
      "Systems for Credit, Market, Counterparty Credit, Treasury, Model, Operational, and Technology Risk.",
    tags: ["PFE", "Risk Engines", "Financial Data"],
  },
  {
    id: "knowledge-systems",
    label: "Knowledge systems",
    kind: "domain",
    description:
      "Graph and retrieval architectures that preserve relationships, provenance, and permission-aware context.",
    tags: ["Knowledge Graphs", "GraphRAG", "Retrieval"],
  },
  {
    id: "platform-engineering",
    label: "Platform engineering",
    kind: "domain",
    description:
      "Service boundaries, deployment patterns, CI/CD, observability, and reusable infrastructure for AI products.",
    tags: ["Microservices", "Containers", "Reliability"],
  },
  {
    id: "entity-resolution",
    label: "Entity resolution",
    kind: "domain",
    description:
      "Auditable record linkage using blocking, interpretable scoring, graph context, and human review.",
    tags: ["Record Linkage", "Data Quality", "Explainability"],
  },
  {
    id: "full-stack",
    label: "Full-stack products",
    kind: "domain",
    description:
      "Type-safe interfaces and APIs that turn complex data and operational workflows into usable products.",
    tags: ["Product Engineering", "APIs", "UX"],
  },
  {
    id: "mcp",
    label: "Model Context Protocol",
    kind: "concept",
    description:
      "Standardized agent access to enterprise data, analytical tools, and governed workflows.",
    tags: ["MCP Servers", "FastMCP", "Tool Interfaces"],
  },
  {
    id: "tool-execution",
    label: "Tool execution",
    kind: "concept",
    description:
      "Schema-validated tool calling with predictable contracts, error handling, authorization, and traceability.",
    tags: ["Tool Calling", "API Contracts", "Validation"],
  },
  {
    id: "multi-agent",
    label: "Multi-agent workflows",
    kind: "concept",
    description:
      "Coordinated agents that retrieve context, invoke tools, challenge outputs, and synthesize decisions.",
    tags: ["Orchestration", "Consensus", "Specialist Agents"],
  },
  {
    id: "hitl",
    label: "Human in the loop",
    kind: "concept",
    description:
      "Review gates and escalation paths that keep high-impact agent actions supervised and auditable.",
    tags: ["Review Gates", "Approvals", "Safety"],
  },
  {
    id: "structured-outputs",
    label: "Structured outputs",
    kind: "concept",
    description:
      "Typed generation and schema enforcement for reliable downstream processing and integration.",
    tags: ["Schemas", "Validation", "Deterministic Interfaces"],
  },
  {
    id: "rbac",
    label: "RBAC & entitlements",
    kind: "concept",
    description:
      "Permission-aware access controls that constrain data retrieval and tool execution by user and role.",
    tags: ["Authorization", "Entitlements", "Security"],
  },
  {
    id: "audit",
    label: "Audit logging",
    kind: "concept",
    description:
      "Traceable histories of agent reasoning, tool calls, permissions, inputs, outputs, and review decisions.",
    tags: ["Governance", "Lineage", "Compliance"],
  },
  {
    id: "agent-evaluation",
    label: "Agent evaluation",
    kind: "concept",
    description:
      "Scenario-based testing and failure analysis across retrieval, prompts, tool selection, and integrations.",
    tags: ["Evals", "Failure Analysis", "Quality"],
  },
  {
    id: "observability",
    label: "Observability",
    kind: "concept",
    description:
      "Logs, traces, telemetry, metrics, and agent histories used to debug and operate production AI.",
    tags: ["Tracing", "Monitoring", "Telemetry"],
  },
  {
    id: "rag",
    label: "RAG",
    kind: "concept",
    description:
      "Retrieval pipelines that ground generation in relevant enterprise and product context.",
    tags: ["Retrieval", "Grounding", "Search"],
  },
  {
    id: "graphrag",
    label: "GraphRAG",
    kind: "concept",
    description:
      "Graph-aware retrieval that uses entities and relationships to assemble precise, connected context.",
    tags: ["Graphs", "Context", "Reasoning"],
  },
  {
    id: "context-engineering",
    label: "Context engineering",
    kind: "concept",
    description:
      "Reconstructing small, high-signal context packets for each agent decision instead of accumulating full histories.",
    tags: ["Scoped Context", "Retrieval", "Agent Reliability"],
  },
  {
    id: "agent-memory",
    label: "Agent memory",
    kind: "concept",
    description:
      "Separating working context, episodic run state, and durable knowledge so agents can retain state without replaying everything.",
    tags: ["Long-term Memory", "State", "Context Rot"],
  },
  {
    id: "semantic-models",
    label: "Semantic models",
    kind: "concept",
    description:
      "A governed layer that maps database structures to business meaning, reusable metrics, and agent-readable definitions.",
    tags: ["Metrics", "Data Contracts", "Business Semantics"],
  },
  {
    id: "python",
    label: "Python",
    kind: "skill",
    description:
      "Primary language for agent services, machine learning, analytics, APIs, and data pipelines.",
    tags: ["Backend", "ML", "Data"],
  },
  {
    id: "typescript",
    label: "TypeScript",
    kind: "skill",
    description:
      "Type-safe product and platform development across interfaces, services, and shared contracts.",
    tags: ["Frontend", "Backend", "Type Safety"],
  },
  {
    id: "sql",
    label: "SQL",
    kind: "skill",
    description:
      "Data access, analytical queries, schema inspection, and production persistence workflows.",
    tags: ["Analytics", "Databases", "Queries"],
  },
  {
    id: "fastapi",
    label: "FastAPI",
    kind: "skill",
    description:
      "Python API services for agents, risk analytics, entity resolution, and internal platforms.",
    tags: ["REST APIs", "Pydantic", "Microservices"],
  },
  {
    id: "nextjs",
    label: "Next.js",
    kind: "skill",
    description:
      "Full-stack React applications for dashboards, workflow products, and AI-enabled interfaces.",
    tags: ["App Router", "Full-stack", "Web"],
  },
  {
    id: "react",
    label: "React",
    kind: "skill",
    description:
      "Composable interfaces for analytical tools, operations dashboards, and interactive visual systems.",
    tags: ["UI", "Components", "Data Products"],
  },
  {
    id: "langgraph",
    label: "LangGraph",
    kind: "skill",
    description:
      "Stateful orchestration for multi-step agents, tool calls, review gates, and resumable workflows.",
    tags: ["Agents", "State Machines", "HITL"],
  },
  {
    id: "openai-sdk",
    label: "OpenAI SDK",
    kind: "skill",
    description:
      "Model integration for tool calling, structured generation, reasoning, and agent workflows.",
    tags: ["LLMs", "Tools", "Structured Generation"],
  },
  {
    id: "claude-sdk",
    label: "Claude Agent SDK",
    kind: "skill",
    description:
      "Agent and model integration for tool-enabled workflows and multi-model platform patterns.",
    tags: ["LLMs", "Agents", "Tool Use"],
  },
  {
    id: "langfuse",
    label: "Langfuse",
    kind: "skill",
    description:
      "Tracing and evaluation support for understanding model behavior and agent execution.",
    tags: ["Tracing", "Evals", "Observability"],
  },
  {
    id: "scikit",
    label: "Scikit-learn",
    kind: "skill",
    description:
      "Classical machine learning for anomaly detection, decision trees, clustering, and feature analysis.",
    tags: ["Machine Learning", "Modeling", "Analytics"],
  },
  {
    id: "docker",
    label: "Docker",
    kind: "skill",
    description:
      "Reproducible packaging and deployment for APIs, databases, agents, and supporting services.",
    tags: ["Containers", "Deployment", "Development"],
  },
  {
    id: "kubernetes",
    label: "Kubernetes",
    kind: "skill",
    description:
      "Operating containerized AI services with health checks, scaling, and production controls.",
    tags: ["Orchestration", "Infrastructure", "Reliability"],
  },
  {
    id: "postgres",
    label: "PostgreSQL",
    kind: "skill",
    description:
      "Relational storage for application data, workflow state, audit records, and analytical products.",
    tags: ["Database", "Persistence", "SQL"],
  },
  {
    id: "snowflake",
    label: "Snowflake",
    kind: "skill",
    description:
      "Enterprise analytical data access for financial-risk reporting and agent context.",
    tags: ["Warehouse", "Financial Data", "Analytics"],
  },
  {
    id: "mongodb",
    label: "MongoDB",
    kind: "skill",
    description:
      "Document-oriented persistence for flexible application and AI workflow data.",
    tags: ["NoSQL", "Storage", "Applications"],
  },
  {
    id: "d3",
    label: "D3",
    kind: "skill",
    description:
      "Data-driven visualization for graphs, relationships, analytical exploration, and custom interfaces.",
    tags: ["Visualization", "SVG", "Interaction"],
  },
  {
    id: "neo4j",
    label: "Neo4j",
    kind: "skill",
    description:
      "Graph persistence and exploration for entity clusters and connected context.",
    tags: ["Graph Database", "Cypher", "Relationships"],
  },
  {
    id: "cicd",
    label: "CI/CD",
    kind: "skill",
    description:
      "GitHub and GitLab pipelines for testing, packaging, and deploying production services.",
    tags: ["GitHub Actions", "GitLab", "Automation"],
  },
  {
    id: "linux",
    label: "Linux",
    kind: "skill",
    description:
      "Development and operations environment for containerized services, GPU workloads, and automation.",
    tags: ["Systems", "Operations", "Nvidia CUDA"],
  },
  {
    id: "enterprise-risk-mcp",
    label: "Enterprise Risk MCP",
    kind: "project",
    eyebrow: "Professional system",
    description:
      "A secure orchestration platform enabling agents to retrieve financial-risk data, invoke governed analytical tools, and return structured outputs.",
    tags: ["MCP", "FastAPI", "RBAC", "Audit", "Agent Platform"],
    importance: 3,
  },
  {
    id: "amats",
    label: "AMATS",
    kind: "project",
    eyebrow: "Private GitHub project",
    description:
      "A multi-asset trading platform with 25+ specialist agents, dynamic research, risk vetoes, backtesting, and paper or live execution.",
    tags: ["Python", "Trading", "Multi-agent", "FastAPI", "TimescaleDB"],
  },
  {
    id: "entity-workbench",
    label: "Entity Resolution",
    kind: "project",
    eyebrow: "Private GitHub project",
    description:
      "An auditable vendor-to-entity matching system with 1.37M candidate pairs, interpretable scoring, review queues, and graph-based audit context.",
    tags: ["Python", "FastAPI", "Next.js", "Neo4j", "Data Quality"],
  },
  {
    id: "impact-analysis",
    label: "Impact Analysis",
    kind: "project",
    eyebrow: "Public GitHub project",
    description:
      "A multi-engine FX risk analysis platform combining PFE calculations, machine learning, visualization, and LLM explanations.",
    tags: ["Risk", "Python", "Next.js", "D3", "PostgreSQL"],
    href: "https://github.com/chrisjnielson44/impact-trade-file-analysis",
  },
  {
    id: "paywind",
    label: "Paywind",
    kind: "project",
    eyebrow: "Public GitHub project",
    description:
      "A modular personal-finance dashboard for unified account, investment, and insight workflows.",
    tags: ["Next.js", "TypeScript", "Plaid", "Fintech"],
    href: "https://github.com/chrisjnielson44/paywind",
  },
  {
    id: "smartrecipe",
    label: "SmartRecipe",
    kind: "project",
    eyebrow: "Public GitHub project",
    description:
      "A full-stack meal planner with recipe recommendations, nutrition analysis, shopping lists, and an AI assistant.",
    tags: ["Next.js", "Python", "OpenAI", "Prisma"],
    href: "https://github.com/chrisjnielson44/Group-20-SmartRecipeApp",
  },
  {
    id: "mlrisk",
    label: "MLRiskAPI",
    kind: "project",
    eyebrow: "Public GitHub project",
    description:
      "A reusable machine-learning API surface for risk investigation, anomaly detection, forecasting, and feature analysis.",
    tags: ["Python", "Machine Learning", "API", "Risk"],
    href: "https://github.com/chrisjnielson44/MLRiskAPI",
  },
  {
    id: "riskeval",
    label: "RiskEval",
    kind: "project",
    eyebrow: "Public GitHub project",
    description:
      "Notebook-driven analysis that uses decision trees and feature analysis to explain PFE movement across trade files.",
    tags: ["Jupyter", "Decision Trees", "PFE", "Python"],
    href: "https://github.com/chrisjnielson44/RiskEval",
  },
  {
    id: "portfolio",
    label: "Portfolio KG",
    kind: "project",
    eyebrow: "Public GitHub project",
    description:
      "This TanStack Start portfolio, including the interactive D3 knowledge graph and MDX publishing system.",
    tags: ["React", "TanStack Start", "D3", "TypeScript"],
    href: "https://github.com/chrisjnielson44/personal-website-3",
    importance: 3,
  },
  {
    id: "basketball",
    label: "Basketball",
    kind: "personal",
    eyebrow: "Favorite sport",
    description:
      "Christopher enjoys playing basketball as a competitive, social, and active counterbalance to engineering work.",
    tags: ["Sports", "Teamwork", "Fitness"],
    importance: 2,
  },
  {
    id: "grizzly",
    label: "Grizzly",
    kind: "personal",
    eyebrow: "Bernese Mountain Dog",
    description:
      "Grizzly is Christopher's Bernese Mountain Dog and an important part of life away from software.",
    tags: ["Bernese Mountain Dog", "Dog", "Family"],
    importance: 3,
    image: "/grizzly.jpg",
  },
  {
    id: "open-source",
    label: "Open-source contribution",
    kind: "personal",
    eyebrow: "Engineering practice",
    description:
      "Christopher likes contributing fixes, tools, examples, and ideas back to the software communities he builds with.",
    tags: ["Open Source", "GitHub", "Community"],
    importance: 3,
  },
  {
    id: "pc-building",
    label: "Building PCs",
    kind: "personal",
    eyebrow: "Hands-on systems",
    description:
      "Selecting components, assembling custom computers, tuning performance, and understanding systems from hardware upward.",
    tags: ["Hardware", "PC Building", "Performance"],
    importance: 2,
  },
  {
    id: "article-graphrag",
    label: "GraphRAG as Scoped Context",
    kind: "article",
    eyebrow: "Published June 2026",
    description:
      "How knowledge graphs can reconstruct permission-aware context packets for agents and reduce context rot.",
    tags: ["GraphRAG", "Agent Memory", "Context Engineering"],
    href: "/articles/knowledge-graphs-vs-rag",
  },
  {
    id: "article-production-agents",
    label: "Production AI Agents",
    kind: "article",
    eyebrow: "Published April 2026",
    description:
      "A practical architecture for agents that work with tools, data, permissions, durable state, and human review.",
    tags: ["AI Agents", "Architecture", "Enterprise"],
    href: "/articles/production-ai-agents-in-enterprise-systems",
  },
  {
    id: "article-semantic-models",
    label: "Semantic Models for Databases",
    kind: "article",
    eyebrow: "Published April 2026",
    description:
      "Why semantic models connect raw schemas, business meaning, analytics, and reliable AI systems.",
    tags: ["Databases", "Semantic Layer", "AI"],
    href: "/articles/semantic-models-for-databases",
  },
  {
    id: "resume",
    label: "Resume",
    kind: "resource",
    eyebrow: "Current profile",
    description:
      "Experience, education, technical work, and qualifications in a compact professional document.",
    tags: ["Experience", "Education", "PDF"],
    href: "/christopher-nielson-resume.pdf",
    importance: 4,
  },
  {
    id: "github",
    label: "GitHub",
    kind: "resource",
    eyebrow: "Public work",
    description:
      "Source code and public projects spanning AI agents, risk analytics, full-stack products, and visualization.",
    tags: ["Code", "Open Source", "Projects"],
    href: "https://github.com/chrisjnielson44",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    kind: "resource",
    eyebrow: "Professional network",
    description:
      "Professional experience, education, and updates about software engineering and production AI.",
    tags: ["Career", "Network", "Profile"],
    href: "https://www.linkedin.com/in/christopherjnielson/",
  },
  {
    id: "email",
    label: "Email",
    kind: "resource",
    eyebrow: "Direct contact",
    description:
      "The direct channel for conversations about software engineering, AI systems, and technical opportunities.",
    tags: ["Contact", "Collaboration"],
    href: "mailto:cjnielson44@gmail.com",
  },
];

export const knowledgeNodes: KnowledgeNode[] = [
  ...coreKnowledgeNodes,
  ...transcriptCourseNodes,
];

const courseLinks: KnowledgeLink[] = transcriptCourses.flatMap((course) => {
  const courseId = `course-${course.code.toLowerCase()}`;
  const institution = course.institution ?? "fsu";
  const links: KnowledgeLink[] = [
    {
      source: institution,
      target: courseId,
      relation:
        course.term === "Transfer credit" ? "accepted credit" : "coursework",
    },
  ];

  if (course.tags.includes("Python")) {
    links.push({ source: courseId, target: "python", relation: "used" });
  }
  if (course.tags.includes("SQL") || course.tags.includes("Databases")) {
    links.push({ source: courseId, target: "sql", relation: "applied" });
  }
  if (
    course.tags.includes("Unix") ||
    course.tags.includes("Operating Systems")
  ) {
    links.push({ source: courseId, target: "linux", relation: "studied" });
  }
  if (course.tags.includes("Artificial Intelligence")) {
    links.push({
      source: courseId,
      target: "agent-infrastructure",
      relation: "foundation for",
    });
  }
  const hasMath =
    course.tags.includes("Probability") ||
    course.tags.includes("Statistics") ||
    course.tags.includes("Linear Algebra");
  if (course.tags.includes("Machine Learning")) {
    links.push({ source: courseId, target: "scikit", relation: "studied" });
  } else if (hasMath) {
    links.push({ source: courseId, target: "scikit", relation: "grounds" });
  }
  if (course.tags.includes("Data Science")) {
    links.push({
      source: courseId,
      target: "knowledge-systems",
      relation: "informs",
    });
  }
  if (
    course.tags.includes("Software Engineering") ||
    course.tags.includes("Full-stack")
  ) {
    links.push({
      source: courseId,
      target: "full-stack",
      relation: "supports",
    });
  }

  return links;
});

const coreKnowledgeLinks: KnowledgeLink[] = [
  { source: "christopher", target: "bny", relation: "works at" },
  { source: "christopher", target: "cmu", relation: "studied at" },
  { source: "christopher", target: "fsu", relation: "studied at" },
  { source: "christopher", target: "agent-infrastructure", relation: "builds" },
  { source: "christopher", target: "financial-risk", relation: "specializes in" },
  { source: "christopher", target: "knowledge-systems", relation: "designs" },
  { source: "christopher", target: "platform-engineering", relation: "practices" },
  { source: "christopher", target: "entity-resolution", relation: "researches" },
  { source: "christopher", target: "full-stack", relation: "ships" },
  { source: "christopher", target: "basketball", relation: "plays" },
  { source: "christopher", target: "grizzly", relation: "lives with" },
  { source: "christopher", target: "open-source", relation: "contributes to" },
  { source: "christopher", target: "pc-building", relation: "builds" },
  { source: "bny", target: "enterprise-risk-mcp", relation: "professional work" },
  { source: "bny", target: "financial-risk", relation: "domain" },
  { source: "bny", target: "agent-infrastructure", relation: "platform focus" },
  { source: "cmu", target: "scikit", relation: "applied ML" },
  { source: "cmu", target: "knowledge-systems", relation: "coursework" },
  { source: "fsu", target: "full-stack", relation: "computer science" },
  { source: "agent-infrastructure", target: "mcp", relation: "standardizes" },
  { source: "agent-infrastructure", target: "tool-execution", relation: "enables" },
  { source: "agent-infrastructure", target: "multi-agent", relation: "coordinates" },
  { source: "agent-infrastructure", target: "hitl", relation: "governs with" },
  { source: "agent-infrastructure", target: "structured-outputs", relation: "validates" },
  { source: "agent-infrastructure", target: "agent-evaluation", relation: "measures" },
  { source: "agent-infrastructure", target: "observability", relation: "operates with" },
  { source: "agent-infrastructure", target: "langgraph", relation: "orchestrates with" },
  { source: "agent-infrastructure", target: "openai-sdk", relation: "integrates" },
  { source: "agent-infrastructure", target: "claude-sdk", relation: "integrates" },
  { source: "agent-infrastructure", target: "langfuse", relation: "traces with" },
  { source: "financial-risk", target: "snowflake", relation: "queries" },
  { source: "financial-risk", target: "sql", relation: "analyzes with" },
  { source: "financial-risk", target: "scikit", relation: "models with" },
  { source: "financial-risk", target: "impact-analysis", relation: "demonstrated by" },
  { source: "financial-risk", target: "riskeval", relation: "demonstrated by" },
  { source: "financial-risk", target: "mlrisk", relation: "demonstrated by" },
  { source: "knowledge-systems", target: "rag", relation: "grounds with" },
  { source: "knowledge-systems", target: "graphrag", relation: "connects with" },
  { source: "knowledge-systems", target: "context-engineering", relation: "scopes" },
  { source: "knowledge-systems", target: "agent-memory", relation: "organizes" },
  { source: "knowledge-systems", target: "semantic-models", relation: "defines meaning with" },
  { source: "knowledge-systems", target: "neo4j", relation: "stores in" },
  { source: "knowledge-systems", target: "d3", relation: "visualizes with" },
  { source: "platform-engineering", target: "docker", relation: "packages with" },
  { source: "platform-engineering", target: "kubernetes", relation: "operates on" },
  { source: "platform-engineering", target: "cicd", relation: "ships through" },
  { source: "platform-engineering", target: "linux", relation: "runs on" },
  { source: "platform-engineering", target: "observability", relation: "monitors with" },
  { source: "entity-resolution", target: "python", relation: "implemented in" },
  { source: "entity-resolution", target: "scikit", relation: "scores with" },
  { source: "entity-resolution", target: "neo4j", relation: "audits with" },
  { source: "entity-resolution", target: "entity-workbench", relation: "demonstrated by" },
  { source: "full-stack", target: "typescript", relation: "built with" },
  { source: "full-stack", target: "nextjs", relation: "built with" },
  { source: "full-stack", target: "react", relation: "built with" },
  { source: "full-stack", target: "fastapi", relation: "served by" },
  { source: "full-stack", target: "postgres", relation: "persists to" },
  { source: "full-stack", target: "mongodb", relation: "persists to" },
  { source: "mcp", target: "tool-execution", relation: "exposes" },
  { source: "mcp", target: "rbac", relation: "secured by" },
  { source: "mcp", target: "audit", relation: "recorded by" },
  { source: "tool-execution", target: "structured-outputs", relation: "returns" },
  { source: "tool-execution", target: "rbac", relation: "authorized by" },
  { source: "hitl", target: "audit", relation: "documents" },
  { source: "agent-evaluation", target: "observability", relation: "uses" },
  { source: "rag", target: "graphrag", relation: "extended by" },
  { source: "graphrag", target: "context-engineering", relation: "assembles" },
  { source: "context-engineering", target: "agent-memory", relation: "retrieves from" },
  { source: "enterprise-risk-mcp", target: "mcp", relation: "implements" },
  { source: "enterprise-risk-mcp", target: "fastapi", relation: "served by" },
  { source: "enterprise-risk-mcp", target: "rbac", relation: "enforces" },
  { source: "enterprise-risk-mcp", target: "audit", relation: "logs" },
  { source: "enterprise-risk-mcp", target: "structured-outputs", relation: "returns" },
  { source: "amats", target: "multi-agent", relation: "coordinates" },
  { source: "amats", target: "python", relation: "built with" },
  { source: "amats", target: "fastapi", relation: "exposes" },
  { source: "amats", target: "postgres", relation: "stores in" },
  { source: "entity-workbench", target: "fastapi", relation: "API" },
  { source: "entity-workbench", target: "nextjs", relation: "dashboard" },
  { source: "entity-workbench", target: "neo4j", relation: "exports to" },
  { source: "entity-workbench", target: "hitl", relation: "review queue" },
  { source: "impact-analysis", target: "python", relation: "calculates with" },
  { source: "impact-analysis", target: "nextjs", relation: "visualizes with" },
  { source: "impact-analysis", target: "d3", relation: "charts with" },
  { source: "impact-analysis", target: "postgres", relation: "persists to" },
  { source: "paywind", target: "nextjs", relation: "built with" },
  { source: "paywind", target: "typescript", relation: "built with" },
  { source: "smartrecipe", target: "nextjs", relation: "interface" },
  { source: "smartrecipe", target: "python", relation: "backend" },
  { source: "smartrecipe", target: "openai-sdk", relation: "assistant" },
  { source: "mlrisk", target: "python", relation: "built with" },
  { source: "mlrisk", target: "scikit", relation: "models with" },
  { source: "riskeval", target: "python", relation: "analyzes with" },
  { source: "riskeval", target: "scikit", relation: "explains with" },
  { source: "portfolio", target: "react", relation: "rendered with" },
  { source: "portfolio", target: "typescript", relation: "typed with" },
  { source: "portfolio", target: "d3", relation: "maps with" },
  { source: "christopher", target: "article-graphrag", relation: "wrote" },
  { source: "christopher", target: "article-production-agents", relation: "wrote" },
  { source: "christopher", target: "article-semantic-models", relation: "wrote" },
  { source: "christopher", target: "resume", relation: "summarized by" },
  { source: "christopher", target: "github", relation: "publishes on" },
  { source: "christopher", target: "linkedin", relation: "connects on" },
  { source: "christopher", target: "email", relation: "reachable by" },
  { source: "graphrag", target: "article-graphrag", relation: "explained in" },
  { source: "context-engineering", target: "article-graphrag", relation: "explained in" },
  { source: "agent-memory", target: "article-graphrag", relation: "explained in" },
  { source: "agent-infrastructure", target: "article-production-agents", relation: "explained in" },
  { source: "semantic-models", target: "article-semantic-models", relation: "explained in" },
  { source: "knowledge-systems", target: "article-semantic-models", relation: "connected in" },
  { source: "portfolio", target: "github", relation: "source hosted on" },
  { source: "open-source", target: "github", relation: "contributes through" },
  { source: "open-source", target: "portfolio", relation: "demonstrated by" },
  { source: "pc-building", target: "linux", relation: "runs" },
];

export const knowledgeLinks: KnowledgeLink[] = [
  ...coreKnowledgeLinks,
  ...courseLinks,
];

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
  | "course"
  | "model";

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
  /** Longer-form narrative paragraphs shown as an "Overview" section. */
  details?: string[];
  /** Quick scannable facts shown as a labelled grid ("At a glance"). */
  highlights?: Array<{ label: string; value: string }>;
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
  model: "Model",
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
      ? "my Carnegie Mellon graduate certificate"
      : "my Florida State undergraduate degree";
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
    eyebrow: "Full Stack SWE · Risk Engineering at BNY",
    description:
      "I'm a software engineer building infrastructure for production AI agents — governed tool execution, financial-risk systems, and context-rich, permission-aware workflows.",
    details: [
      "I'm a software engineer on BNY's Risk Engineering team, where I build agent platforms, backend APIs, evaluation systems, and governed AI workflows that put large language models to work safely inside an enterprise.",
      "My work centers on the infrastructure that makes production AI dependable: Model Context Protocol servers, schema-validated tool execution, role-based access control, audit logging, and human-in-the-loop review gates — the controls that let agents reach real financial-risk data without losing traceability.",
      "I earned a B.S. in Computer Science from Florida State (with minors in Business and Mathematics) and am finishing a graduate certificate in Machine Learning and Data Science at Carnegie Mellon. Away from the keyboard I play basketball, build PCs, contribute to open source, and spend time with my Bernese Mountain Dog, Grizzly.",
    ],
    highlights: [
      { label: "Based in", value: "Pittsburgh, PA" },
      { label: "Role", value: "Software Engineer, Risk Engineering" },
      {
        label: "Focus",
        value:
          "Production AI agent infra, knowledge systems & context engineering",
      },
      { label: "Education", value: "Carnegie Mellon · Florida State" },
      { label: "Languages", value: "English · Spanish" },
      { label: "Writing", value: "Agents, knowledge systems, risk" },
    ],
    tags: [
      "Pittsburgh",
      "Production AI",
      "Risk Engineering",
      "Agent Infrastructure",
      "Knowledge Graphs",
      "Full-stack",
      "Spanish",
    ],
    importance: 4,
  },
  {
    id: "bny",
    label: "BNY",
    kind: "experience",
    eyebrow: "June 2024 - present",
    description:
      "I'm a software engineer in Risk Engineering, building agent platforms, backend APIs, evaluation systems, and governed AI workflows.",
    details: [
      "On the Risk Engineering team, I build the platform layer that lets AI agents work safely against enterprise financial-risk data — Model Context Protocol servers, governed tool execution, evaluation harnesses, and the backend APIs that connect them.",
    ],
    highlights: [
      { label: "Team", value: "Risk Engineering" },
      { label: "Role", value: "Software Engineer" },
      { label: "Since", value: "June 2024" },
      { label: "Focus", value: "Agent platforms & governed AI" },
    ],
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
      "My graduate certificate in Machine Learning and Data Science from Carnegie Mellon University's School of Computer Science.",
    details: [
      "A graduate certificate from Carnegie Mellon's School of Computer Science focused on the mathematical and computational foundations of machine learning and data science, which I'm completing alongside full-time work.",
    ],
    highlights: [
      { label: "Program", value: "Graduate Certificate" },
      { label: "Field", value: "Machine Learning & Data Science" },
      { label: "School", value: "School of Computer Science" },
      { label: "Completed", value: "May 2026" },
    ],
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
      "My B.S. in Computer Science, with minors in Business and Mathematics.",
    details: [
      "My bachelor's in Computer Science with minors in Business and Mathematics — a foundation spanning algorithms, data structures, operating systems, databases, artificial intelligence, and software engineering.",
    ],
    highlights: [
      { label: "Degree", value: "B.S. Computer Science" },
      { label: "Minors", value: "Business · Mathematics" },
      { label: "Completed", value: "December 2024" },
      { label: "Coursework", value: "Algorithms, OS, AI, databases" },
    ],
    tags: ["Computer Science", "Business", "Mathematics"],
    importance: 3,
    image: "/logos/fsu.svg",
  },
  {
    id: "agent-infrastructure",
    label: "Agent infrastructure",
    kind: "domain",
    description:
      "I build secure orchestration, tools, context, evaluation, and runtime controls for production AI agents.",
    tags: ["Agents", "Governance", "Orchestration"],
  },
  {
    id: "financial-risk",
    label: "Financial risk",
    kind: "domain",
    description:
      "I build systems for Credit, Market, Counterparty Credit, Treasury, Model, Operational, and Technology Risk.",
    tags: ["PFE", "Risk Engines", "Financial Data"],
  },
  {
    id: "knowledge-systems",
    label: "Knowledge systems",
    kind: "domain",
    description:
      "I design graph and retrieval architectures that preserve relationships, provenance, and permission-aware context.",
    tags: ["Knowledge Graphs", "GraphRAG", "Retrieval"],
  },
  {
    id: "platform-engineering",
    label: "Platform engineering",
    kind: "domain",
    description:
      "I work on service boundaries, deployment patterns, CI/CD, observability, and reusable infrastructure for AI products.",
    tags: ["Microservices", "Containers", "Reliability"],
  },
  {
    id: "entity-resolution",
    label: "Entity resolution",
    kind: "domain",
    description:
      "I build auditable record linkage using blocking, interpretable scoring, graph context, and human review.",
    tags: ["Record Linkage", "Data Quality", "Explainability"],
  },
  {
    id: "full-stack",
    label: "Full-stack products",
    kind: "domain",
    description:
      "I build type-safe interfaces and APIs that turn complex data and operational workflows into usable products.",
    tags: ["Product Engineering", "APIs", "UX"],
  },
  {
    id: "mcp",
    label: "Model Context Protocol",
    kind: "concept",
    description:
      "I use the Model Context Protocol to give agents standardized access to enterprise data, analytical tools, and governed workflows.",
    tags: ["MCP Servers", "FastMCP", "Tool Interfaces"],
  },
  {
    id: "tool-execution",
    label: "Tool execution",
    kind: "concept",
    description:
      "I build schema-validated tool calling with predictable contracts, error handling, authorization, and traceability.",
    tags: ["Tool Calling", "API Contracts", "Validation"],
  },
  {
    id: "multi-agent",
    label: "Multi-agent workflows",
    kind: "concept",
    description:
      "I coordinate agents that retrieve context, invoke tools, challenge outputs, and synthesize decisions.",
    tags: ["Orchestration", "Consensus", "Specialist Agents"],
  },
  {
    id: "hitl",
    label: "Human in the loop",
    kind: "concept",
    description:
      "I add review gates and escalation paths that keep high-impact agent actions supervised and auditable.",
    tags: ["Review Gates", "Approvals", "Safety"],
  },
  {
    id: "structured-outputs",
    label: "Structured outputs",
    kind: "concept",
    description:
      "I rely on typed generation and schema enforcement for reliable downstream processing and integration.",
    tags: ["Schemas", "Validation", "Deterministic Interfaces"],
  },
  {
    id: "rbac",
    label: "RBAC & entitlements",
    kind: "concept",
    description:
      "I enforce permission-aware access controls that constrain data retrieval and tool execution by user and role.",
    tags: ["Authorization", "Entitlements", "Security"],
  },
  {
    id: "audit",
    label: "Audit logging",
    kind: "concept",
    description:
      "I keep traceable histories of agent reasoning, tool calls, permissions, inputs, outputs, and review decisions.",
    tags: ["Governance", "Lineage", "Compliance"],
  },
  {
    id: "agent-evaluation",
    label: "Agent evaluation",
    kind: "concept",
    description:
      "I run scenario-based testing and failure analysis across retrieval, prompts, tool selection, and integrations.",
    tags: ["Evals", "Failure Analysis", "Quality"],
  },
  {
    id: "observability",
    label: "Observability",
    kind: "concept",
    description:
      "I use logs, traces, telemetry, metrics, and agent histories to debug and operate production AI.",
    tags: ["Tracing", "Monitoring", "Telemetry"],
  },
  {
    id: "rag",
    label: "RAG",
    kind: "concept",
    description:
      "I build retrieval pipelines that ground generation in relevant enterprise and product context.",
    tags: ["Retrieval", "Grounding", "Search"],
  },
  {
    id: "graphrag",
    label: "GraphRAG",
    kind: "concept",
    description:
      "I use graph-aware retrieval — entities and relationships — to assemble precise, connected context.",
    tags: ["Graphs", "Context", "Reasoning"],
  },
  {
    id: "context-engineering",
    label: "Context engineering",
    kind: "concept",
    description:
      "I reconstruct small, high-signal context packets for each agent decision instead of accumulating full histories.",
    tags: ["Scoped Context", "Retrieval", "Agent Reliability"],
  },
  {
    id: "agent-memory",
    label: "Agent memory",
    kind: "concept",
    description:
      "I separate working context, episodic run state, and durable knowledge so agents can retain state without replaying everything.",
    tags: ["Long-term Memory", "State", "Context Rot"],
  },
  {
    id: "semantic-models",
    label: "Semantic models",
    kind: "concept",
    description:
      "I build a governed layer that maps database structures to business meaning, reusable metrics, and agent-readable definitions.",
    tags: ["Metrics", "Data Contracts", "Business Semantics"],
  },
  {
    id: "embeddings",
    label: "Embeddings & vector search",
    kind: "concept",
    description:
      "I use dense vector representations and similarity search to power semantic retrieval for RAG and knowledge systems.",
    tags: ["Vectors", "Semantic Search", "Retrieval"],
  },
  {
    id: "backtesting",
    label: "Backtesting",
    kind: "concept",
    description:
      "I replay strategies and models against historical market data to validate behavior before live execution.",
    tags: ["Simulation", "Validation", "Trading"],
  },
  {
    id: "anomaly-detection",
    label: "Anomaly detection",
    kind: "concept",
    description:
      "I surface outliers and unexpected movement in risk metrics, trade files, and operational data.",
    tags: ["Outliers", "Risk", "Machine Learning"],
  },
  {
    id: "python",
    label: "Python",
    kind: "skill",
    description:
      "My primary language for agent services, machine learning, analytics, APIs, and data pipelines — whitespace-sensitive, and frankly so am I.",
    tags: ["Backend", "ML", "Data"],
  },
  {
    id: "typescript",
    label: "TypeScript",
    kind: "skill",
    description:
      "I use it for type-safe product and platform work across interfaces, services, and shared contracts — and yes, reaching for `any` feels like giving up.",
    tags: ["Frontend", "Backend", "Type Safety"],
  },
  {
    id: "sql",
    label: "SQL",
    kind: "skill",
    description:
      "I use it for data access, analytical queries, schema inspection, and production persistence workflows.",
    tags: ["Analytics", "Databases", "Queries"],
  },
  {
    id: "fastapi",
    label: "FastAPI",
    kind: "skill",
    description:
      "I build Python API services with it — agents, risk analytics, entity resolution, and internal platforms.",
    tags: ["REST APIs", "Pydantic", "Microservices"],
  },
  {
    id: "nextjs",
    label: "Next.js",
    kind: "skill",
    description:
      "I build full-stack React applications with it — dashboards, workflow products, and AI-enabled interfaces.",
    tags: ["App Router", "Full-stack", "Web"],
  },
  {
    id: "react",
    label: "React",
    kind: "skill",
    description:
      "I build composable interfaces with it — analytical tools, operations dashboards, and interactive visual systems.",
    tags: ["UI", "Components", "Data Products"],
  },
  {
    id: "langgraph",
    label: "LangGraph",
    kind: "skill",
    description:
      "I use it for stateful orchestration of multi-step agents, tool calls, review gates, and resumable workflows.",
    tags: ["Agents", "State Machines", "HITL"],
  },
  {
    id: "openai-sdk",
    label: "OpenAI SDK",
    kind: "skill",
    description:
      "I use it for model integration — tool calling, structured generation, reasoning, and agent workflows.",
    tags: ["LLMs", "Tools", "Structured Generation"],
  },
  {
    id: "claude-sdk",
    label: "Claude Agent SDK",
    kind: "skill",
    description:
      "I use it for agent and model integration across tool-enabled workflows and multi-model platform patterns.",
    tags: ["LLMs", "Agents", "Tool Use"],
  },
  {
    id: "langfuse",
    label: "Langfuse",
    kind: "skill",
    description:
      "I use it for tracing and evaluation — understanding model behavior and agent execution.",
    tags: ["Tracing", "Evals", "Observability"],
  },
  {
    id: "scikit",
    label: "Scikit-learn",
    kind: "skill",
    description:
      "I use it for classical machine learning — anomaly detection, decision trees, clustering, and feature analysis.",
    tags: ["Machine Learning", "Modeling", "Analytics"],
  },
  {
    id: "docker",
    label: "Docker",
    kind: "skill",
    description:
      "I use it for reproducible packaging and deployment of APIs, databases, agents, and supporting services.",
    tags: ["Containers", "Deployment", "Development"],
  },
  {
    id: "kubernetes",
    label: "Kubernetes",
    kind: "skill",
    description:
      "I run containerized AI services on it — health checks, scaling, and production controls.",
    tags: ["Orchestration", "Infrastructure", "Reliability"],
  },
  {
    id: "postgres",
    label: "PostgreSQL",
    kind: "skill",
    description:
      "I use it for relational storage of application data, workflow state, audit records, and analytical products.",
    tags: ["Database", "Persistence", "SQL"],
  },
  {
    id: "snowflake",
    label: "Snowflake",
    kind: "skill",
    description:
      "I use it for enterprise analytical data access — financial-risk reporting and agent context.",
    tags: ["Warehouse", "Financial Data", "Analytics"],
  },
  {
    id: "mongodb",
    label: "MongoDB",
    kind: "skill",
    description:
      "I use it for document-oriented persistence of flexible application and AI workflow data.",
    tags: ["NoSQL", "Storage", "Applications"],
  },
  {
    id: "d3",
    label: "D3",
    kind: "skill",
    description:
      "I use it for data-driven visualization — graphs, relationships, analytical exploration, and custom interfaces.",
    tags: ["Visualization", "SVG", "Interaction"],
  },
  {
    id: "neo4j",
    label: "Neo4j",
    kind: "skill",
    description:
      "I use it for graph persistence and exploration of entity clusters and connected context.",
    tags: ["Graph Database", "Cypher", "Relationships"],
  },
  {
    id: "cicd",
    label: "CI/CD",
    kind: "skill",
    description:
      "I build GitHub and GitLab pipelines for testing, packaging, and deploying production services.",
    tags: ["GitHub Actions", "GitLab", "Automation"],
  },
  {
    id: "linux",
    label: "Linux",
    kind: "skill",
    description:
      "My development and operations home for containerized services, GPU workloads, and automation. The terminal is my comfort zone; the GUI is for guests.",
    tags: ["Systems", "Operations", "Nvidia CUDA"],
  },
  {
    id: "pydantic",
    label: "Pydantic",
    kind: "skill",
    description:
      "I use it for schema definition and validation — typed API contracts, tool inputs, and structured model outputs.",
    tags: ["Validation", "Schemas", "Type Safety"],
  },
  {
    id: "pandas",
    label: "pandas",
    kind: "skill",
    description:
      "I use it for tabular data wrangling — risk analytics, feature engineering, and exploratory analysis.",
    tags: ["Data", "Analytics", "DataFrames"],
  },
  {
    id: "numpy",
    label: "NumPy",
    kind: "skill",
    description:
      "My numerical computing foundation for machine learning, statistics, and vectorized analysis.",
    tags: ["Numerical", "Arrays", "Math"],
  },
  {
    id: "jupyter",
    label: "Jupyter",
    kind: "skill",
    description:
      "I work in notebooks for prototyping, model analysis, and explainable risk investigations.",
    tags: ["Notebooks", "Analysis", "Prototyping"],
  },
  {
    id: "timescaledb",
    label: "TimescaleDB",
    kind: "skill",
    description:
      "I use it for time-series storage on PostgreSQL — market data, trading history, and high-frequency analytics.",
    tags: ["Time-series", "PostgreSQL", "Market Data"],
  },
  {
    id: "plaid",
    label: "Plaid",
    kind: "skill",
    description:
      "I use it for financial account aggregation — unified balances, transactions, and personal-finance workflows.",
    tags: ["Fintech", "Banking APIs", "Aggregation"],
  },
  {
    id: "prisma",
    label: "Prisma",
    kind: "skill",
    description:
      "I use it for type-safe database access and schema modeling in full-stack TypeScript products.",
    tags: ["ORM", "TypeScript", "Databases"],
  },
  {
    id: "tanstack",
    label: "TanStack Start",
    kind: "skill",
    description:
      "The full-stack React framework I built this portfolio on — type-safe routing and server functions.",
    tags: ["React", "Routing", "Full-stack"],
  },
  {
    id: "tailwind",
    label: "Tailwind CSS",
    kind: "skill",
    description:
      "I use utility-first styling for fast, consistent interfaces across dashboards and products.",
    tags: ["CSS", "Design Systems", "UI"],
  },
  {
    id: "git",
    label: "Git",
    kind: "skill",
    description:
      "My version control and collaboration backbone for CI/CD pipelines and open-source work.",
    tags: ["Version Control", "Collaboration", "Workflow"],
  },
  {
    id: "spanish",
    label: "Spanish",
    kind: "skill",
    description:
      "I read and speak Spanish — grammar, composition, history, and multinational business from my coursework.",
    tags: ["Language", "Spanish", "Communication"],
    importance: 2,
  },
  {
    id: "enterprise-risk-mcp",
    label: "Enterprise Risk MCP",
    kind: "project",
    eyebrow: "Professional system",
    description:
      "A secure orchestration platform I built so agents can retrieve financial-risk data, invoke governed analytical tools, and return structured outputs.",
    highlights: [
      { label: "Type", value: "Professional system" },
      { label: "Surface", value: "Governed agent tools" },
      { label: "Stack", value: "FastAPI · MCP · RBAC" },
    ],
    tags: ["MCP", "FastAPI", "RBAC", "Audit", "Agent Platform"],
    importance: 3,
  },
  {
    id: "amats",
    label: "AMATS",
    kind: "project",
    eyebrow: "Private GitHub project",
    description:
      "A multi-asset trading platform I built with 25+ specialist agents, dynamic research, risk vetoes, backtesting, and paper or live execution.",
    highlights: [
      { label: "Type", value: "Multi-agent trading platform" },
      { label: "Scale", value: "25+ specialist agents" },
      { label: "Stack", value: "Python · FastAPI · TimescaleDB" },
    ],
    tags: ["Python", "Trading", "Multi-agent", "FastAPI", "TimescaleDB"],
  },
  {
    id: "entity-workbench",
    label: "Entity Resolution",
    kind: "project",
    eyebrow: "Private GitHub project",
    description:
      "An auditable vendor-to-entity matching system I built with 1.37M candidate pairs, interpretable scoring, review queues, and graph-based audit context.",
    highlights: [
      { label: "Scale", value: "1.37M candidate pairs" },
      { label: "Surface", value: "Auditable record linkage" },
      { label: "Stack", value: "FastAPI · Next.js · Neo4j" },
    ],
    tags: ["Python", "FastAPI", "Next.js", "Neo4j", "Data Quality"],
  },
  {
    id: "impact-analysis",
    label: "Impact Analysis",
    kind: "project",
    eyebrow: "Public GitHub project",
    description:
      "A multi-engine FX risk analysis platform I built that combines PFE calculations, machine learning, visualization, and LLM explanations.",
    highlights: [
      { label: "Type", value: "FX risk analysis platform" },
      { label: "Method", value: "PFE · ML · LLM explanations" },
      { label: "Stack", value: "Python · Next.js · D3" },
    ],
    tags: ["Risk", "Python", "Next.js", "D3", "PostgreSQL"],
    href: "https://github.com/chrisjnielson44/impact-trade-file-analysis",
  },
  {
    id: "paywind",
    label: "Paywind",
    kind: "project",
    eyebrow: "Public GitHub project",
    description:
      "A modular personal-finance dashboard I built for unified account, investment, and insight workflows.",
    tags: ["Next.js", "TypeScript", "Plaid", "Fintech"],
    href: "https://github.com/chrisjnielson44/paywind",
  },
  {
    id: "smartrecipe",
    label: "SmartRecipe",
    kind: "project",
    eyebrow: "Public GitHub project",
    description:
      "A full-stack meal planner I built with recipe recommendations, nutrition analysis, shopping lists, and an AI assistant.",
    tags: ["Next.js", "Python", "OpenAI", "Prisma"],
    href: "https://github.com/chrisjnielson44/Group-20-SmartRecipeApp",
  },
  {
    id: "mlrisk",
    label: "MLRiskAPI",
    kind: "project",
    eyebrow: "Public GitHub project",
    description:
      "A reusable machine-learning API I built for risk investigation, anomaly detection, forecasting, and feature analysis.",
    tags: ["Python", "Machine Learning", "API", "Risk"],
    href: "https://github.com/chrisjnielson44/MLRiskAPI",
  },
  {
    id: "riskeval",
    label: "RiskEval",
    kind: "project",
    eyebrow: "Public GitHub project",
    description:
      "A notebook-driven analysis I built that uses decision trees and feature analysis to explain PFE movement across trade files.",
    tags: ["Jupyter", "Decision Trees", "PFE", "Python"],
    href: "https://github.com/chrisjnielson44/RiskEval",
  },
  {
    id: "portfolio",
    label: "Portfolio KG",
    kind: "project",
    eyebrow: "Public GitHub project",
    description:
      "This TanStack Start portfolio I built, including the interactive D3 knowledge graph and MDX publishing system.",
    highlights: [
      { label: "Type", value: "This website" },
      { label: "Feature", value: "Interactive D3 knowledge graph" },
      { label: "Stack", value: "TanStack Start · React · D3" },
    ],
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
      "I play basketball — my favorite debugger for a long day, and the one place I'll happily take the L.",
    tags: ["Sports", "Teamwork", "Fitness"],
    importance: 2,
  },
  {
    id: "grizzly",
    label: "Grizzly",
    kind: "personal",
    eyebrow: "Bernese Mountain Dog",
    description:
      "Grizzly, my Bernese Mountain Dog — my most loyal (and by far furriest) rubber-duck debugger, and the best reason to close the laptop and go outside.",
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
      "I give fixes, tools, and examples back to the communities I build on — because someone else's weekend pull request has bailed me out more times than I can count.",
    tags: ["Open Source", "GitHub", "Community"],
    importance: 3,
  },
  {
    id: "pc-building",
    label: "Building PCs",
    kind: "personal",
    eyebrow: "Hands-on systems",
    description:
      "I build my own PCs — picking parts, cable-managing like it's an art form, and chasing performance from the silicon up. The RGB is non-negotiable.",
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
    id: "paper-context-engine",
    label: "The Context Engine",
    kind: "article",
    eyebrow: "Research paper · 2026",
    description:
      "A controlled, size-swept study I ran on-device: handing a small local LLM a pre-retrieved subgraph beats both a tuned bge-m3 vector RAG baseline and agentic graph tools, running air-gapped at $0.",
    tags: [
      "Research",
      "Context Engineering",
      "GraphRAG",
      "Local LLMs",
      "Evaluation",
    ],
    href: "/context-engine",
    importance: 3,
  },
  {
    id: "resume",
    label: "Resume",
    kind: "resource",
    eyebrow: "Current profile",
    description:
      "My experience, education, technical work, and qualifications in one compact document.",
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
      "My source code and public projects spanning AI agents, risk analytics, full-stack products, and visualization.",
    tags: ["Code", "Open Source", "Projects"],
    href: "https://github.com/chrisjnielson44",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    kind: "resource",
    eyebrow: "Professional network",
    description:
      "My professional experience, education, and updates on software engineering and production AI.",
    highlights: [
      { label: "Handle", value: "in/christopherjnielson" },
      { label: "Best for", value: "Experience, roles, and updates" },
    ],
    tags: ["Career", "Network", "Profile"],
    href: "https://www.linkedin.com/in/christopherjnielson/",
    importance: 3,
  },
  {
    id: "email",
    label: "Email",
    kind: "resource",
    eyebrow: "Direct contact",
    description:
      "The best way to reach me about software engineering, AI systems, and technical opportunities.",
    tags: ["Contact", "Collaboration"],
    href: "mailto:cjnielson44@gmail.com",
  },

  // Agentic + knowledge-graph capabilities (concept nodes).
  {
    id: "swarm-intelligence",
    label: "Swarm intelligence",
    kind: "concept",
    description:
      "I run swarms of role-specialized agents that reason together over a shared knowledge graph, surfacing conclusions no single agent reaches alone.",
    tags: ["Multi-Agent", "Collective Reasoning", "Emergence"],
  },
  {
    id: "agent-simulation",
    label: "Agent-based simulation",
    kind: "concept",
    description:
      "I build agent-based simulations where cooperative and adversarial agents interact to reveal emergent behavior and edge cases.",
    tags: ["Simulation", "Emergent Behavior", "Agents"],
  },
  {
    id: "persona-agents",
    label: "Persona agents",
    kind: "concept",
    description:
      "I give each agent a role, mandate, and lens so a panel can analyze a problem from multiple perspectives with evidence-cited findings.",
    tags: ["Perspectives", "Roles", "Evidence-Cited"],
  },
  {
    id: "kg-construction",
    label: "Knowledge graph construction",
    kind: "concept",
    description:
      "I build pipelines that turn heterogeneous seed data into provenance-tracked graphs through ingest, extract, resolve, upsert, index, and snapshot stages.",
    tags: ["Pipelines", "Provenance", "ETL"],
  },
  {
    id: "provenance",
    label: "Provenance",
    kind: "concept",
    description:
      "I attach a source and confidence to every fact so the graph stays auditable and each claim can be traced to its origin.",
    tags: ["Auditability", "Confidence", "Lineage"],
  },
  {
    id: "ontology-extraction",
    label: "Ontology-driven extraction",
    kind: "concept",
    description:
      "I guide LLM extraction with a declared set of allowed entity and edge types so the resulting graph stays consistent and queryable.",
    tags: ["Ontology", "Extraction", "Schema"],
  },
  {
    id: "narrative-generation",
    label: "Narrative generation",
    kind: "concept",
    description:
      "I generate natural-language explanations of metric movements, breaches, and themes so results read as a story instead of just numbers.",
    tags: ["Explanations", "Reporting", "Insights"],
  },
  {
    id: "scenario-simulation",
    label: "Scenario simulation",
    kind: "concept",
    description:
      "I build what-if engines that re-run metrics under hypothetical changes so I can compare outcomes across scenarios.",
    tags: ["What-If", "Scenarios", "Modeling"],
  },
  {
    id: "stress-testing",
    label: "Stress testing",
    kind: "concept",
    description:
      "I run sensitivity and stress analysis under adverse scenarios to find where systems and metrics break down.",
    tags: ["Sensitivity", "Adverse Scenarios", "Resilience"],
  },
  {
    id: "metric-lineage",
    label: "Metric lineage",
    kind: "concept",
    description:
      "I trace metrics back through their inputs and transformations so every number stays explainable and reproducible.",
    tags: ["Lineage", "Traceability", "Reproducibility"],
  },
  {
    id: "streaming-chat",
    label: "Streaming chat",
    kind: "concept",
    description:
      "I build streaming conversational interfaces over agents and governed tools so responses and tool calls render token by token.",
    tags: ["Streaming", "Conversational UI", "Realtime"],
  },
  {
    id: "elicitation",
    label: "Elicitation",
    kind: "concept",
    description:
      "I use MCP elicitation so tools can pause mid-run to request missing input from the user before continuing.",
    tags: ["MCP", "Interactive Tools", "Human Input"],
  },

  // Additional technologies (skill nodes).
  {
    id: "ai-sdk",
    label: "AI SDK",
    kind: "skill",
    description:
      "I use it for streaming chat interfaces and tool calling on the frontend.",
    tags: ["Streaming", "Frontend AI", "Tool Calling"],
  },
  {
    id: "fastmcp",
    label: "FastMCP",
    kind: "skill",
    description:
      "I use it to build Model Context Protocol servers that expose governed, schema-validated tools to agents.",
    tags: ["MCP", "Tool Servers", "Python"],
  },
  {
    id: "entra",
    label: "Microsoft Entra ID",
    kind: "skill",
    description:
      "I use it for identity, authentication, and role-based access control in enterprise apps.",
    tags: ["Identity", "Authentication", "RBAC"],
  },
  {
    id: "highcharts",
    label: "Highcharts",
    kind: "skill",
    description:
      "I use it for interactive charts and data visualization in analytical dashboards.",
    tags: ["Charts", "Visualization", "Dashboards"],
  },
  {
    id: "ag-grid",
    label: "AG Grid",
    kind: "skill",
    description:
      "I use it for high-performance data grids with sorting, filtering, and large datasets.",
    tags: ["Data Grid", "Tables", "UI"],
  },
  {
    id: "zustand",
    label: "Zustand",
    kind: "skill",
    description:
      "I use it for lightweight, ergonomic state management in React apps.",
    tags: ["State Management", "React", "Frontend"],
  },
  {
    id: "kuzu",
    label: "Kuzu",
    kind: "skill",
    description:
      "I use it as an embedded graph database for fast, local property-graph queries.",
    tags: ["Graph Database", "Embedded", "Cypher"],
  },
  {
    id: "graphiti",
    label: "Graphiti",
    kind: "skill",
    description:
      "I use it to build temporally-aware knowledge graphs for agent memory and retrieval.",
    tags: ["Knowledge Graphs", "Temporal", "Agent Memory"],
  },

  // Additional languages (from the résumé skills summary).
  {
    id: "java",
    label: "Java",
    kind: "skill",
    description:
      "I use it for object-oriented backend work and JVM systems — and it's where I first cut my teeth on data structures.",
    tags: ["Backend", "OOP", "JVM"],
  },
  {
    id: "cpp",
    label: "C++",
    kind: "skill",
    description:
      "I reach for it when performance and low-level control actually matter.",
    tags: ["Systems", "Performance", "Low-Level"],
  },
  {
    id: "csharp",
    label: "C#",
    kind: "skill",
    description: "I use it for .NET services and tooling.",
    tags: ["Backend", ".NET", "OOP"],
  },
  {
    id: "swift",
    label: "Swift",
    kind: "skill",
    description: "I use it for native iOS and Apple-platform apps.",
    tags: ["iOS", "Apple", "Mobile"],
  },

  // Additional frameworks / web tech (from the résumé).
  {
    id: "nodejs",
    label: "Node.js",
    kind: "skill",
    description:
      "I use it for JavaScript/TypeScript services, build tooling, and APIs.",
    tags: ["Backend", "JavaScript", "Runtime"],
  },
  {
    id: "django",
    label: "Django",
    kind: "skill",
    description: "I use it for batteries-included Python web backends.",
    tags: ["Python", "Web Framework", "Backend"],
  },
  {
    id: "angular",
    label: "Angular",
    kind: "skill",
    description: "I use it for structured, large-scale front-end applications.",
    tags: ["Frontend", "TypeScript", "SPA"],
  },
  {
    id: "graphql",
    label: "GraphQL",
    kind: "skill",
    description:
      "I use it for typed, client-driven APIs that fetch exactly what the UI needs.",
    tags: ["API", "Typed", "Querying"],
  },
  {
    id: "playwright",
    label: "Playwright",
    kind: "skill",
    description:
      "I use it to drive browsers so agents can operate enterprise systems that never shipped an API.",
    tags: ["Browser Automation", "Testing", "Agents"],
  },

  // Cloud platforms (from the résumé infrastructure list).
  {
    id: "aws",
    label: "AWS",
    kind: "skill",
    description: "I deploy and run production services on AWS.",
    tags: ["Cloud", "Infrastructure", "Deployment"],
  },
  {
    id: "gcp",
    label: "GCP",
    kind: "skill",
    description: "I deploy and run services on Google Cloud.",
    tags: ["Cloud", "Infrastructure", "Deployment"],
  },
  {
    id: "azure",
    label: "Microsoft Azure",
    kind: "skill",
    description: "I deploy and run enterprise services on Azure.",
    tags: ["Cloud", "Infrastructure", "Enterprise"],
  },

  // Additional AI/ML capabilities (from the résumé).
  {
    id: "bm25",
    label: "BM25",
    kind: "concept",
    description:
      "I use BM25 ranking to pick the right tools and documents out of large sets by relevance.",
    tags: ["Retrieval", "Ranking", "Search"],
  },
  {
    id: "nlp",
    label: "NLP",
    kind: "concept",
    description:
      "I apply natural-language processing to pull structure and meaning out of unstructured text.",
    tags: ["Language", "Extraction", "Text"],
  },
  {
    id: "ocr",
    label: "OCR",
    kind: "concept",
    description:
      "I use OCR and transcript extraction to turn recordings and documents into structured, searchable knowledge.",
    tags: ["Extraction", "Documents", "Vision"],
  },

  // Machines I own (from the old site's "Software and Tools I Use").
  {
    id: "macbook-pro",
    label: "MacBook Pro 16″",
    kind: "resource",
    description:
      "My daily driver — a 2019 16-inch on an Intel i7 that has stayed reliable through everything I've thrown at it.",
    tags: ["Workstation", "macOS", "Daily Driver"],
  },
  {
    id: "raspberry-pi",
    label: "Raspberry Pi 4",
    kind: "resource",
    description:
      "My tinkering box — running Debian for side projects and hands-on Linux administration.",
    tags: ["Hardware", "Linux", "Homelab"],
  },

  // Tools I use.
  {
    id: "zed",
    label: "Zed",
    kind: "resource",
    description: "My current editor — fast, modern, and out of the way.",
    tags: ["Editor", "IDE", "Productivity"],
    href: "https://zed.dev",
  },
  {
    id: "warp",
    label: "Warp",
    kind: "resource",
    description:
      "A modern terminal with AI command search and shared workflows.",
    tags: ["Terminal", "CLI", "Productivity"],
    href: "https://www.warp.dev",
  },
  {
    id: "obsidian",
    label: "Obsidian",
    kind: "resource",
    description:
      "My second brain — linked notes and a personal knowledge graph (yes, the inspiration for this page is showing).",
    tags: ["Notes", "Knowledge Graph", "PKM"],
    href: "https://obsidian.md",
  },
  {
    id: "notion",
    label: "Notion",
    kind: "resource",
    description: "Where I plan projects and keep shared documentation.",
    tags: ["Docs", "Planning", "Collaboration"],
    href: "https://notion.so",
  },
  {
    id: "things3",
    label: "Things 3",
    kind: "resource",
    description:
      "My task manager — clean enough that I actually keep using it.",
    tags: ["Tasks", "Productivity", "GTD"],
    href: "https://culturedcode.com/things/",
  },
  {
    id: "tableplus",
    label: "TablePlus",
    kind: "resource",
    description: "A clean GUI for poking at databases across engines.",
    tags: ["Database", "GUI", "Tooling"],
    href: "https://tableplus.com",
  },
  {
    id: "pnpm",
    label: "pnpm",
    kind: "resource",
    description:
      "Fast, disk-efficient package management — my default for Node monorepos.",
    tags: ["Package Manager", "Node.js", "Monorepo"],
    href: "https://pnpm.io",
  },
  {
    id: "sourcetree",
    label: "Sourcetree",
    kind: "resource",
    description:
      "A visual Git client for reviewing changes and untangling branches.",
    tags: ["Git", "GUI", "Version Control"],
    href: "https://www.sourcetreeapp.com",
  },
  {
    id: "vercel",
    label: "Vercel",
    kind: "resource",
    description:
      "Where I ship front-ends — zero-config deploys wired straight to GitHub.",
    tags: ["Deployment", "Hosting", "Frontend"],
    href: "https://vercel.com",
  },
  {
    id: "github-copilot",
    label: "GitHub Copilot",
    kind: "resource",
    description: "My AI pair programmer for boilerplate and the boring parts.",
    tags: ["AI", "Pair Programming", "Productivity"],
    href: "https://github.com/features/copilot",
  },

  // Learning resources I recommend.
  {
    id: "neetcode",
    label: "NeetCode",
    kind: "resource",
    description: "Where I keep my data-structures and algorithms sharp.",
    tags: ["Algorithms", "DSA", "Learning"],
    href: "https://neetcode.io/",
  },
  {
    id: "big-o-cheatsheet",
    label: "Big-O Cheat Sheet",
    kind: "resource",
    description:
      "My quick reference for the time and space complexity of common algorithms.",
    tags: ["Algorithms", "Complexity", "Reference"],
    href: "https://www.bigocheatsheet.com/",
  },
  {
    id: "visualgo",
    label: "VisuAlgo",
    kind: "resource",
    description: "Interactive visualizations that make data structures click.",
    tags: ["Algorithms", "Visualization", "Learning"],
    href: "https://visualgo.net/",
  },
  {
    id: "grokking-algorithms",
    label: "Grokking Algorithms",
    kind: "resource",
    description: "An illustrated guide that makes hard algorithms approachable.",
    tags: ["Algorithms", "Book", "Learning"],
    href: "https://www.manning.com/books/grokking-algorithms",
  },
  {
    id: "basecs",
    label: "BaseCS",
    kind: "resource",
    description: "Bite-sized essays on computer-science fundamentals.",
    tags: ["Computer Science", "Fundamentals", "Learning"],
    href: "https://medium.com/basecs",
  },

  // Local LLM inference — a personal obsession that feeds the day job.
  {
    id: "local-llm-inference",
    label: "Local LLM inference",
    kind: "concept",
    eyebrow: "What I tinker with after hours",
    description:
      "I run open-weight models on my own hardware — quantization, MLX and llama.cpp runtimes, KV-cache and context tricks — to see how far on-device inference can really go.",
    details: [
      "Local inference is where I do most of my own R&D: pulling open-weight models onto my Mac Studio, quantizing them, and measuring what actually holds up at 3B, 30B, and beyond — versus what only works because a frontier lab is paying the power bill.",
      "It keeps me honest about everything else I build. If a workflow only works with a 400B model behind an API, I haven't engineered the context well enough yet.",
    ],
    tags: ["Local Inference", "Open Weights", "Quantization", "On-Device"],
    importance: 3,
  },
  {
    id: "small-models-thesis",
    label: "Knowledge over scale",
    kind: "concept",
    eyebrow: "A bet I'm making",
    description:
      "I think knowledge systems — retrieval, graphs, and context engineering — will let small, local models match today's frontier models. The advantage moves to the context, not the parameter count.",
    details: [
      "My bet: most of what makes a frontier model feel smart is access to the right information at the right moment, not raw parameters. Give a 30B model a well-built knowledge system — clean retrieval, graph-structured context, scoped memory — and I think it closes most of the gap for real work.",
      "It's the throughline between my knowledge-systems work and my local-inference habit: if it holds, the future of genuinely capable AI is private, cheap, and running on hardware you already own.",
    ],
    tags: ["Thesis", "Small Models", "Knowledge Systems", "Context Engineering"],
    importance: 3,
  },

  // The local-inference stack and rig.
  {
    id: "ollama",
    label: "Ollama",
    kind: "skill",
    eyebrow: "Local model runtime",
    description:
      "How I pull, quantize, and serve open-weight models on my own hardware — a rotating shelf of models I keep around for coding, vision, embeddings, and experiments.",
    tags: ["Local Inference", "Open Weights", "GGUF", "MLX"],
    importance: 2,
  },
  {
    id: "mlx",
    label: "MLX",
    kind: "skill",
    eyebrow: "Apple-silicon ML",
    description:
      "Apple's array framework for ML on Apple silicon. I contribute to open-source MLX work on local-LLM optimizations — squeezing more tokens-per-second and bigger context out of unified memory.",
    tags: ["Apple Silicon", "Open Source", "Optimization", "Inference"],
    importance: 2,
  },
  {
    id: "mac-studio",
    label: "Mac Studio M3 Ultra",
    kind: "resource",
    eyebrow: "My local-inference rig",
    description:
      "My home lab for local LLMs — an M3 Ultra with 256 GB of unified memory, which is just a polite way of saying it can hold a 70 GB model and still let me open Chrome.",
    highlights: [
      { label: "Chip", value: "Apple M3 Ultra (28-core)" },
      { label: "Memory", value: "256 GB unified" },
      { label: "Runs", value: "Ollama · MLX · local LLMs" },
    ],
    tags: [
      "Apple Silicon",
      "256 GB Unified Memory",
      "Homelab",
      "Local Inference",
    ],
    importance: 3,
  },

  // Open-weight models I currently keep on the Mac Studio (from `ollama list`).
  {
    id: "model-gemma4",
    label: "Gemma 4 31B",
    kind: "model",
    eyebrow: "gemma4:31b-mlx · 20 GB",
    description:
      "My MLX-built Gemma 4 — the one I reach for first because it's tuned for Apple silicon and stays fast on the M3 Ultra.",
    tags: ["Gemma", "MLX", "31B", "General"],
  },
  {
    id: "model-qwen-coder",
    label: "Qwen3.6 35B Coder",
    kind: "model",
    eyebrow: "qwen3.6:35b-a3b-coding-bf16 · 70 GB",
    description:
      "My heaviest local model — a bf16 MoE coder I run when I want near-frontier code completion without a single token leaving the house.",
    tags: ["Qwen", "Coding", "MoE", "bf16"],
  },
  {
    id: "model-qwen-vl",
    label: "Qwen3-VL 32B",
    kind: "model",
    eyebrow: "qwen3-vl:32b · 20 GB",
    description:
      "My local vision-language model — for reading screenshots, diagrams, and documents without an API call.",
    tags: ["Qwen", "Vision-Language", "Multimodal", "32B"],
  },
  {
    id: "model-medgemma",
    label: "MedGemma 27B",
    kind: "model",
    eyebrow: "medgemma:27b · 17 GB",
    description:
      "A medical-domain Gemma I keep around to probe how well a specialized open model reasons inside a narrow field.",
    tags: ["Gemma", "Medical", "Domain-Specific", "27B"],
  },
  {
    id: "model-llama32",
    label: "Llama 3.2 3B",
    kind: "model",
    eyebrow: "llama3.2:3b · 2 GB",
    description:
      "My tiny, instant model — and my favorite proof of the thesis: with the right context, 3B parameters handle far more than they have any right to.",
    tags: ["Llama", "3B", "Small Model", "Fast"],
  },
  {
    id: "model-embeddinggemma",
    label: "EmbeddingGemma",
    kind: "model",
    eyebrow: "embeddinggemma · 621 MB",
    description:
      "My local embedding model — it turns documents into vectors for retrieval entirely on-device, no embedding API required.",
    tags: ["Gemma", "Embeddings", "Retrieval", "On-Device"],
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
  if (course.tags.includes("Spanish")) {
    links.push({ source: courseId, target: "spanish", relation: "developed" });
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
  { source: "christopher", target: "paper-context-engine", relation: "wrote" },
  {
    source: "context-engineering",
    target: "paper-context-engine",
    relation: "tested in",
  },
  {
    source: "graphrag",
    target: "paper-context-engine",
    relation: "evaluated in",
  },
  {
    source: "small-models-thesis",
    target: "paper-context-engine",
    relation: "tested in",
  },
  {
    source: "local-llm-inference",
    target: "paper-context-engine",
    relation: "benchmarked in",
  },
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
  // Additional technologies surfaced from projects and coursework.
  { source: "fastapi", target: "pydantic", relation: "validates with" },
  { source: "structured-outputs", target: "pydantic", relation: "enforced with" },
  { source: "enterprise-risk-mcp", target: "pydantic", relation: "schemas in" },
  { source: "financial-risk", target: "pandas", relation: "wrangles with" },
  { source: "impact-analysis", target: "pandas", relation: "processes with" },
  { source: "riskeval", target: "pandas", relation: "analyzes with" },
  { source: "mlrisk", target: "pandas", relation: "prepares data with" },
  { source: "scikit", target: "numpy", relation: "computes on" },
  { source: "pandas", target: "numpy", relation: "built on" },
  { source: "cmu", target: "numpy", relation: "applied" },
  { source: "riskeval", target: "jupyter", relation: "authored in" },
  { source: "mlrisk", target: "jupyter", relation: "prototyped in" },
  { source: "cmu", target: "jupyter", relation: "coursework in" },
  { source: "amats", target: "timescaledb", relation: "stores in" },
  { source: "timescaledb", target: "postgres", relation: "extends" },
  { source: "paywind", target: "plaid", relation: "integrates" },
  { source: "smartrecipe", target: "prisma", relation: "models data with" },
  { source: "prisma", target: "postgres", relation: "queries" },
  { source: "portfolio", target: "tanstack", relation: "built with" },
  { source: "tanstack", target: "react", relation: "built on" },
  { source: "tanstack", target: "typescript", relation: "typed with" },
  { source: "portfolio", target: "tailwind", relation: "styled with" },
  { source: "full-stack", target: "tailwind", relation: "styles with" },
  { source: "cicd", target: "git", relation: "triggered by" },
  { source: "github", target: "git", relation: "hosts" },
  { source: "open-source", target: "git", relation: "tracked with" },
  { source: "christopher", target: "spanish", relation: "speaks" },
  // Additional capabilities demonstrated across the work.
  { source: "knowledge-systems", target: "embeddings", relation: "retrieves with" },
  { source: "rag", target: "embeddings", relation: "ranks with" },
  { source: "embeddings", target: "graphrag", relation: "complements" },
  { source: "amats", target: "backtesting", relation: "validates with" },
  { source: "financial-risk", target: "backtesting", relation: "tests with" },
  { source: "backtesting", target: "python", relation: "implemented in" },
  { source: "mlrisk", target: "anomaly-detection", relation: "performs" },
  { source: "financial-risk", target: "anomaly-detection", relation: "monitors with" },
  { source: "anomaly-detection", target: "scikit", relation: "modeled with" },
  // Swarm intelligence, knowledge-graph construction, and the tools behind them.
  { source: "agent-infrastructure", target: "swarm-intelligence", relation: "runs" },
  { source: "swarm-intelligence", target: "multi-agent", relation: "builds on" },
  { source: "swarm-intelligence", target: "persona-agents", relation: "uses" },
  { source: "swarm-intelligence", target: "agent-simulation", relation: "drives" },
  { source: "knowledge-systems", target: "kg-construction", relation: "built with" },
  { source: "knowledge-systems", target: "provenance", relation: "tracks" },
  { source: "knowledge-systems", target: "kuzu", relation: "stored in" },
  { source: "kg-construction", target: "entity-resolution", relation: "uses" },
  { source: "kg-construction", target: "ontology-extraction", relation: "uses" },
  { source: "kg-construction", target: "provenance", relation: "records" },
  { source: "kg-construction", target: "graphrag", relation: "feeds" },
  { source: "kg-construction", target: "neo4j", relation: "writes to" },
  { source: "kg-construction", target: "graphiti", relation: "uses" },
  { source: "amats", target: "swarm-intelligence", relation: "applies" },
  { source: "amats", target: "agent-simulation", relation: "uses" },
  { source: "mcp", target: "fastmcp", relation: "built with" },
  { source: "mcp", target: "elicitation", relation: "supports" },
  { source: "full-stack", target: "highcharts", relation: "uses" },
  { source: "full-stack", target: "ag-grid", relation: "uses" },
  { source: "full-stack", target: "zustand", relation: "uses" },
  { source: "full-stack", target: "entra", relation: "secures with" },
  { source: "rbac", target: "entra", relation: "implemented with" },
  { source: "financial-risk", target: "narrative-generation", relation: "explained with" },
  { source: "financial-risk", target: "scenario-simulation", relation: "models with" },
  { source: "financial-risk", target: "stress-testing", relation: "validated with" },
  { source: "streaming-chat", target: "ai-sdk", relation: "built with" },
  { source: "streaming-chat", target: "mcp", relation: "calls" },
  { source: "metric-lineage", target: "audit", relation: "supports" },
  // Languages, frameworks, cloud, and AI capabilities from the résumé.
  { source: "fsu", target: "java", relation: "studied" },
  { source: "fsu", target: "cpp", relation: "studied" },
  { source: "christopher", target: "csharp", relation: "codes in" },
  { source: "christopher", target: "swift", relation: "codes in" },
  { source: "full-stack", target: "nodejs", relation: "runs on" },
  { source: "full-stack", target: "django", relation: "built with" },
  { source: "full-stack", target: "angular", relation: "built with" },
  { source: "full-stack", target: "graphql", relation: "queries with" },
  { source: "agent-infrastructure", target: "playwright", relation: "automates with" },
  { source: "platform-engineering", target: "aws", relation: "deploys on" },
  { source: "platform-engineering", target: "gcp", relation: "deploys on" },
  { source: "platform-engineering", target: "azure", relation: "deploys on" },
  { source: "agent-infrastructure", target: "bm25", relation: "selects tools with" },
  { source: "enterprise-risk-mcp", target: "bm25", relation: "ranks with" },
  { source: "knowledge-systems", target: "nlp", relation: "applies" },
  { source: "nlp", target: "embeddings", relation: "uses" },
  { source: "amats", target: "ocr", relation: "extracts with" },
  // Machines, tools, and learning resources (from the old site).
  { source: "christopher", target: "macbook-pro", relation: "works on" },
  { source: "raspberry-pi", target: "linux", relation: "runs" },
  { source: "christopher", target: "zed", relation: "writes code in" },
  { source: "warp", target: "linux", relation: "terminal for" },
  { source: "knowledge-systems", target: "obsidian", relation: "modeled on" },
  { source: "christopher", target: "notion", relation: "plans in" },
  { source: "christopher", target: "things3", relation: "organizes with" },
  { source: "tableplus", target: "postgres", relation: "manages" },
  { source: "full-stack", target: "pnpm", relation: "packages with" },
  { source: "git", target: "sourcetree", relation: "managed with" },
  { source: "nextjs", target: "vercel", relation: "deployed on" },
  { source: "christopher", target: "github-copilot", relation: "pairs with" },
  { source: "christopher", target: "neetcode", relation: "learns from" },
  { source: "neetcode", target: "visualgo", relation: "alongside" },
  { source: "neetcode", target: "big-o-cheatsheet", relation: "alongside" },
  { source: "neetcode", target: "grokking-algorithms", relation: "alongside" },
  { source: "neetcode", target: "basecs", relation: "alongside" },
  // Local LLM inference cluster.
  { source: "christopher", target: "local-llm-inference", relation: "tinkers with" },
  { source: "christopher", target: "mlx", relation: "contributes to" },
  { source: "christopher", target: "mac-studio", relation: "runs models on" },
  { source: "local-llm-inference", target: "small-models-thesis", relation: "motivates" },
  { source: "local-llm-inference", target: "ollama", relation: "runs with" },
  { source: "local-llm-inference", target: "mac-studio", relation: "runs on" },
  { source: "mlx", target: "local-llm-inference", relation: "accelerates" },
  { source: "open-source", target: "mlx", relation: "contributes to" },
  { source: "pc-building", target: "mac-studio", relation: "same itch as" },
  { source: "knowledge-systems", target: "local-llm-inference", relation: "feeds" },
  { source: "small-models-thesis", target: "knowledge-systems", relation: "builds on" },
  { source: "small-models-thesis", target: "context-engineering", relation: "relies on" },
  { source: "small-models-thesis", target: "graphrag", relation: "relies on" },
  { source: "mac-studio", target: "ollama", relation: "runs" },
  { source: "mac-studio", target: "mlx", relation: "accelerates with" },
  // Open-weight models Ollama serves on the Mac Studio.
  { source: "ollama", target: "model-gemma4", relation: "runs" },
  { source: "ollama", target: "model-qwen-coder", relation: "runs" },
  { source: "ollama", target: "model-qwen-vl", relation: "runs" },
  { source: "ollama", target: "model-medgemma", relation: "runs" },
  { source: "ollama", target: "model-llama32", relation: "runs" },
  { source: "ollama", target: "model-embeddinggemma", relation: "runs" },
  { source: "model-gemma4", target: "mlx", relation: "built with" },
  { source: "model-embeddinggemma", target: "embeddings", relation: "powers" },
  { source: "model-qwen-coder", target: "python", relation: "helps me write" },
  { source: "model-llama32", target: "small-models-thesis", relation: "evidence for" },
];

export const knowledgeLinks: KnowledgeLink[] = [
  ...coreKnowledgeLinks,
  ...courseLinks,
];

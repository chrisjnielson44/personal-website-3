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
      "Working on risk engineering applications and machine learning-driven solutions for financial risk assessment.",
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
    title: "Graduate Certificate",
    start: "2025",
    end: "Present",
  },
  {
    company: "Florida State University",
    title: "BS, Computer Science",
    start: "2021",
    end: "2024",
    description: "Minor in Business and Mathematics",
  },
];

import type { Job } from "@/types/candidate";

export const mockJobs: Job[] = [
  {
    id: "job-1",
    companyName: "TechCorp Solutions",
    title: "Senior Frontend Developer",
    location: "Lagos, NG (Hybrid)",
    description: "We're looking for an experienced frontend developer to join our growing team and help build amazing user experiences for our enterprise clients.",
    requirements: [
      "5+ years of React experience",
      "Strong TypeScript skills",
      "Experience with Next.js",
      "Knowledge of modern CSS frameworks",
      "Portfolio of live projects"
    ],
    salaryRange: "$3,000 - $4,500 / month",
    employmentType: "full_time",
    industry: "Technology",
    companySize: "50-200 employees",
    postedDate: "2 days ago",
    benefits: ["Health insurance", "Remote work", "Professional development", "Stock options"],
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL"]
  },
  {
    id: "job-2", 
    companyName: "FinTech Africa",
    title: "Backend Engineer",
    location: "Remote",
    description: "Join our backend team to build scalable financial systems that serve millions of users across Africa.",
    requirements: [
      "4+ years of Node.js experience",
      "Strong database design skills",
      "Experience with microservices",
      "Knowledge of cloud platforms",
      "Understanding of financial systems"
    ],
    salaryRange: "$2,800 - $4,000 / month",
    employmentType: "full_time",
    industry: "Financial Technology",
    companySize: "100-500 employees",
    postedDate: "1 week ago",
    benefits: ["Flexible hours", "Remote first", "Wellness stipend", "Learning budget"],
    skills: ["Node.js", "MongoDB", "AWS", "Docker", "REST APIs"]
  },
  {
    id: "job-3",
    companyName: "Design Studio Pro",
    title: "Product Designer",
    location: "Nairobi, KE (On-site)",
    description: "We're seeking a talented product designer to help create beautiful and functional digital experiences for our clients.",
    requirements: [
      "3+ years of UX/UI design experience",
      "Proficiency in Figma",
      "Strong portfolio demonstrating process",
      "Experience with design systems",
      "Understanding of user research"
    ],
    salaryRange: "$2,200 - $3,200 / month",
    employmentType: "full_time",
    industry: "Design & Creative",
    companySize: "10-50 employees",
    postedDate: "3 days ago",
    benefits: ["Creative environment", "Flexible schedule", "Design tools budget", "Team retreats"],
    skills: ["Figma", "Design Systems", "User Research", "Prototyping", "Adobe Creative Suite"]
  },
  {
    id: "job-4",
    companyName: "E-commerce Giant",
    title: "Full Stack Developer (Contract)",
    location: "Johannesburg, SA (Remote)",
    description: "Looking for a full stack developer to help scale our e-commerce platform during peak season.",
    requirements: [
      "4+ years full stack experience",
      "Strong React and Node.js skills",
      "E-commerce experience preferred",
      "Ability to work independently",
      "Good communication skills"
    ],
    salaryRange: "$3,500 - $4,200 / month",
    employmentType: "contract",
    industry: "E-commerce",
    companySize: "500+ employees", 
    postedDate: "5 days ago",
    benefits: ["Hourly rate", "Flexible schedule", "Remote work", "Project bonuses"],
    skills: ["React", "Node.js", "PostgreSQL", "Redis", "Docker"]
  }
];

import type { Job } from "@/types/job";

export const mockJobs: Job[] = [
  {
    _id: "job-1",
    title: "Senior Frontend Developer",
    location: "Lagos, NG (Hybrid)",
    description: "We're looking for an experienced frontend developer to join our growing team and help build amazing user experiences for our enterprise clients.",
    job_type: "full_time",
    experience_level: "senior",
    required_skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL"],
    salary_min: 3000,
    salary_max: 4500,
    employer_id: {
      _id: "emp-1",
      email: "hr@techcorp.com",
      profile: {
        business_name: "TechCorp Solutions",
        industry: "Technology",
        phone: "+234-800-000-0001",
        website_url: "https://techcorp.com",
        bio: "Leading technology solutions company in West Africa"
      }
    },
    employer_name: "TechCorp Solutions",
    status: "active",
    created_at: "2024-01-15T10:00:00Z",
    applications_count: 12,
    is_active: true
  },
  {
    _id: "job-2",
    title: "Backend Engineer",
    location: "Remote",
    description: "Join our backend team to build scalable financial systems that serve millions of users across Africa.",
    job_type: "full_time",
    experience_level: "mid",
    required_skills: ["Node.js", "MongoDB", "AWS", "Docker", "REST APIs"],
    salary_min: 2800,
    salary_max: 4000,
    employer_id: {
      _id: "emp-2",
      email: "careers@fintech.africa",
      profile: {
        business_name: "FinTech Africa",
        industry: "Financial Technology",
        phone: "+254-700-000-0002",
        website_url: "https://fintech.africa",
        bio: "Innovative financial technology platform serving African markets"
      }
    },
    employer_name: "FinTech Africa",
    status: "active",
    created_at: "2024-01-10T14:30:00Z",
    applications_count: 28,
    is_active: true
  },
  {
    _id: "job-3",
    title: "Product Designer",
    location: "Nairobi, KE (On-site)",
    description: "We're seeking a talented product designer to help create beautiful and functional digital experiences for our clients.",
    job_type: "full_time",
    experience_level: "mid",
    required_skills: ["Figma", "Design Systems", "User Research", "Prototyping", "Adobe Creative Suite"],
    salary_min: 2200,
    salary_max: 3200,
    employer_id: {
      _id: "emp-3",
      email: "hello@designstudio.pro",
      profile: {
        business_name: "Design Studio Pro",
        industry: "Design & Creative",
        phone: "+254-200-000-0003",
        website_url: "https://designstudio.pro",
        bio: "Creative design agency specializing in digital experiences"
      }
    },
    employer_name: "Design Studio Pro",
    status: "active",
    created_at: "2024-01-12T09:15:00Z",
    applications_count: 15,
    is_active: true
  },
  {
    _id: "job-4",
    title: "Full Stack Developer (Contract)",
    location: "Johannesburg, SA (Remote)",
    description: "Looking for a full stack developer to help scale our e-commerce platform during peak season.",
    job_type: "contract",
    experience_level: "mid",
    required_skills: ["React", "Node.js", "PostgreSQL", "Redis", "Docker"],
    salary_min: 3500,
    salary_max: 4200,
    employer_id: {
      _id: "emp-4",
      email: "jobs@ecommerce.co.za",
      profile: {
        business_name: "E-commerce Giant",
        industry: "E-commerce",
        phone: "+27-100-000-0004",
        website_url: "https://ecommerce.co.za",
        bio: "Leading e-commerce platform in Southern Africa"
      }
    },
    employer_name: "E-commerce Giant",
    status: "active",
    created_at: "2024-01-08T16:45:00Z",
    applications_count: 35,
    is_active: true
  }
];

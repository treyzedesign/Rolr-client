export interface Job {
  id: string;
  companyName: string;
  title: string;
  location: string;
  description: string;
  requirements: string[];
  salaryRange: string;
  employmentType: "full_time" | "part_time" | "contract";
  industry: string;
  companySize: string;
  postedDate: string;
  benefits: string[];
  skills: string[];
}

export interface JobSeekerPreferences {
  preferredLocation: string;
  employmentType: "full_time" | "part_time" | "contract" | "any";
  minSalary: string;
  industries: string[];
  remoteOption: boolean;
}

export interface JobSeekerProfile {
  id: string;
  fullName: string;
  title: string;
  location: string;
  bio: string;
  yearsExperience: number;
  skills: string[];
  expectedSalary: string;
  availability: string;
  education?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  preferences: JobSeekerPreferences;
}

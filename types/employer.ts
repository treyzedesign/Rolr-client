export interface Candidate {
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
  voiceSampleUrl?: string;
}

export interface EmployerPreferences {
  primarySkill: string;
  minYearsExperience: number;
  location: string;
  employmentType: "full_time" | "part_time" | "contract";
}

export interface EmployerProfileInput {
  companyName: string;
  industry: string;
  description: string;
  location: string;
  hiringFor: string;
  preferences: EmployerPreferences;
}

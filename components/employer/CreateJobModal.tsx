"use client";

import { useState, useEffect } from "react";
import { useJobStore } from "@/stores/job-store";
import { X, Loader2, ChevronDown, Search } from "lucide-react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "@/styles/ckeditor.css";
import type { CreateJobRequest, Job } from "@/types/job";

const JOB_TYPES = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry Level (0-2 years)" },
  { value: "mid", label: "Mid Level (3-5 years)" },
  { value: "senior", label: "Senior Level (6+ years)" },
];

const ALLOWED_JOB_TITLES = [
  "Administrative Assistant",
  "Brand & Communications Assistant",
  "Call Centre Agent",
  "Community Manager",
  "Community Support Specialist",
  "Customer Relations Officer",
  "Customer Success Associate",
  "Customer Support Representative",
  "Data Entry Clerk",
  "Email Marketing Assistant",
  "Growth & Marketing Analyst",
  "HR & Talent Acquisition Coordinator",
  "HR Assistant",
  "Junior AI/ML Data Annotator & Analyst",
  "Junior Backend Developer",
  "Junior Business Analyst",
  "Junior Copywriter & Brand Voice Specialist",
  "Junior DevOps / Cloud Support Engineer",
  "Junior Data Analyst",
  "Junior Frontend Developer",
  "Junior Product Manager / APM",
  "Junior UI/UX Designer",
  "Live Chat Support Agent",
  "Office Coordinator",
  "QA / Software Tester",
  "Records & Information Management Clerk",
  "Research Assistant",
  "Scheduling & Appointments Coordinator",
  "Social Media Assistant",
  "User Research Intern / Associate",
  "Virtual Assistant (VA)"
];

const COMMON_SKILLS = [
  // Hard/Technical Skills & Tools
  "A/B testing fundamentals",
  "ATS management",
  "Active listening",
  "Adobe XD proficiency",
  "Agile/Scrum methodology",
  "Analytical thinking",
  "Attention to formatting",
  "AWS basics (S3, EC2, RDS)",
  "Basic HTML for emails",
  "Basic Python",
  "Basic SQL for data queries",
  "Basic bookkeeping",
  "Basic product knowledge",
  "Basic product/service knowledge",
  "Basic research skills",
  "Basic scripting (Bash/Python)",
  "Basic understanding of APIs (Postman)",
  "Basic understanding of cloud (AWS/GCP)",
  "Basic understanding of data labeling",
  "Booking software",
  "Brand guidelines application",
  "Bug tracking (Jira/Linear)",
  "Budget tracking (Excel)",
  "CI/CD tools (GitHub Actions)",
  "CRM basics",
  "CRM data entry",
  "CRM software (Freshdesk/Zendesk)",
  "CRM tools",
  "CV screening techniques",
  "Call scripting",
  "Calendar management (Google/Outlook)",
  "Canva or basic graphic design",
  "Chat platform navigation",
  "Citation & referencing",
  "Clear spoken English & local languages",
  "Community building & management",
  "Community platform management",
  "Content creation basics",
  "Content scheduling",
  "Copywriting",
  "Copywriting for social media",
  "Correspondence & memo writing",
  "Customer feedback analysis",
  "Data accuracy & validation",
  "Data analysis basics",
  "Data entry",
  "Data literacy",
  "Data visualisation basics",
  "Database software basics",
  "Docker basics",
  "Document formatting",
  "Document management systems (DMS)",
  "Documentation & record keeping",
  "Documentation discipline",
  "Email analytics",
  "Email communication",
  "Email management",
  "Email & live chat communication",
  "Event coordination",
  "Event planning & logistics",
  "Excel (intermediate: pivot tables, VLOOKUP)",
  "FAQ knowledge management",
  "Fast typing (45+ WPM)",
  "Fast and accurate typing (50+ WPM)",
  "Figma or Adobe XD proficiency",
  "Filing methodologies",
  "Filing systems management",
  "Git & GitHub version control",
  "Google Analytics & Meta Ads basics",
  "Google Scholar/databases",
  "HRIS basics",
  "HTML5, CSS3, JavaScript (ES6+)",
  "Hashtag research",
  "Interview coordination",
  "Linux command line",
  "List segmentation",
  "Mailchimp or Brevo basics",
  "Manual testing methodologies",
  "Media monitoring basics",
  "MS Excel/Google Sheets",
  "MS Office & Google Workspace",
  "MS Office Suite (Word, Excel, PowerPoint)",
  "MS PowerPoint",
  "MS Word/Google Docs",
  "Multitasking across chat windows",
  "Node.js or Python/Django basics",
  "Online research methodologies",
  "Office logistics",
  "Platform analytics reading",
  "Process compliance",
  "Process mapping & documentation",
  "Proofreading & grammar mastery",
  "QA / Software Tester",
  "React.js or Vue.js basics",
  "Record keeping",
  "Recruitment & CV screening",
  "Report preparation",
  "Report writing",
  "Report & summary writing",
  "Requirements gathering techniques",
  "Responsive design principles",
  "REST API design",
  "SEO copywriting fundamentals",
  "Scanning & digitisation",
  "Scheduling & coordination",
  "Social media management",
  "SQL basics",
  "SQL (PostgreSQL/MySQL)",
  "Stakeholder communication",
  "Systems thinking",
  "Test case writing",
  "Ticketing system management",
  "Typing speed (40+ WPM)",
  "Typing while talking",
  "Typography & color theory",
  "UX writing basics",
  "Understading of UI design principles",
  "User interview facilitation",
  "User research basics",
  "User story & PRD writing",
  "Vendor management",
  "Wireframing (Figma basics)",
  "Wireframing & prototyping",
  "Write & editing",
  "Written & verbal communication",
  "Written clarity",

  // Soft Skills
  "Accuracy & thoroughness",
  "Adaptability",
  "Adaptability of voice/tone",
  "Analytical curiosity",
  "Attention to detail",
  "Bias for action",
  "Brand sensitivity",
  "Brand voice awareness",
  "Brand voice consistency",
  "Calm under volume pressure",
  "Calmness under pressure",
  "Charisma & energy",
  "Clear communication",
  "Clear communication of findings",
  "Composure under pressure",
  "Concentration",
  "Confidentiality",
  "Conflict resolution",
  "Consistency",
  "Constructive receptiveness to feedback",
  "Creativity",
  "Critical thinking",
  "Curiosity and skepticism",
  "Curiosity about systems",
  "Curiosity about trends",
  "Dependability",
  "Discretion",
  "Discretion & confidentiality",
  "Empathy",
  "Empathy for users",
  "Energy management",
  "Friendliness",
  "Hospitality",
  "Influence without authority",
  "Initiative",
  "Intellectual curiosity",
  "Interpersonal warmth",
  "Multitasking",
  "Methodical approach",
  "Networking",
  "Objectivity",
  "Organisation",
  "Organized and detail-oriented",
  "Ownership mindset",
  "Patience",
  "People orientation",
  "Persistence",
  "Persuasion",
  "Positive energy",
  "Precision",
  "Precision and care",
  "Prioritization",
  "Proactivity",
  "Problem-solving",
  "Professional communication",
  "Professional warmth",
  "Professionalism",
  "Relationship building",
  "Reliability",
  "Resilience",
  "Self-direction",
  "Self-motivation",
  "Strong analytical mindset",
  "Systematic troubleshooting",
  "Team collaboration",
  "Team player",
  "Time management",
  "Thoroughness",
  "Visual creativity",
  "Voice clarity",
  "Warmth & relatability"
];

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobToEdit?: Job | null;
}

export function CreateJobModal({ isOpen, onClose, jobToEdit }: CreateJobModalProps) {
  const { createJob, updateJob, isCreating, isUpdating } = useJobStore();
  
  const [formData, setFormData] = useState<CreateJobRequest>({
    title: "",
    description: "",
    location: "",
    job_type: "full_time",
    experience_level: "entry",
    required_skills: [],
    salary_min: undefined,
    salary_max: undefined,
  });

  // Autocomplete Search States
  const [titleSearch, setTitleSearch] = useState("");
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);

  const [skillsSearch, setSkillsSearch] = useState("");
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);

  useEffect(() => {
    if (jobToEdit) {
      setFormData({
        title: jobToEdit.title,
        description: jobToEdit.description,
        location: jobToEdit.location,
        job_type: jobToEdit.job_type,
        experience_level: jobToEdit.experience_level,
        required_skills: jobToEdit.required_skills || [],
        salary_min: jobToEdit.salary_min,
        salary_max: jobToEdit.salary_max,
      });
      setTitleSearch(jobToEdit.title);
    } else {
      setFormData({
        title: "",
        description: "",
        location: "",
        job_type: "full_time",
        experience_level: "entry",
        required_skills: [],
        salary_min: undefined,
        salary_max: undefined,
      });
      setTitleSearch("");
    }
  }, [jobToEdit]);

  const handleInputChange = (field: keyof CreateJobRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = formData.required_skills || [];
    handleInputChange("required_skills", currentSkills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (jobToEdit) {
        await updateJob(jobToEdit._id, formData);
      } else {
        await createJob(formData);
      }
      onClose();
    } catch (error) {
      // Error handled by store
    }
  };

  // Filtered lists for Autocomplete
  const filteredTitles = ALLOWED_JOB_TITLES.filter(title => 
    title.toLowerCase().includes(titleSearch.toLowerCase())
  );

  const filteredSkills = COMMON_SKILLS.filter(skill => 
    skill.toLowerCase().includes(skillsSearch.toLowerCase()) &&
    !(formData.required_skills || []).includes(skill)
  );

  const isLoading = isCreating || isUpdating;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl flex flex-col select-none">
        
        {/* Header Section */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
            {jobToEdit ? "Edit Job" : "Create New Job"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Searchable Job Title Input */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-500 mb-1">Job Title</label>
            <div className="relative">
              <input
                type="text"
                required
                value={titleSearch}
                onFocus={() => setShowTitleDropdown(true)}
                onBlur={() => setTimeout(() => setShowTitleDropdown(false), 250)}
                onChange={(e) => {
                  setTitleSearch(e.target.value);
                  handleInputChange("title", e.target.value);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                placeholder="Type to search and select job title..."
              />
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Dropdown Options List */}
            {showTitleDropdown && (
              <ul className="absolute left-0 right-0 z-50 mt-1 max-h-52 overflow-y-auto rounded-xl border border-slate-150 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-950">
                {filteredTitles.map((title) => (
                  <li
                    key={title}
                    onMouseDown={() => {
                      setTitleSearch(title);
                      handleInputChange("title", title);
                      setShowTitleDropdown(false);
                    }}
                    className="cursor-pointer px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-850 dark:hover:text-blue-400"
                  >
                    {title}
                  </li>
                ))}
                {filteredTitles.length === 0 && (
                  <li className="px-4 py-2.5 text-xs text-slate-450 italic select-none">
                    Use custom title "{titleSearch}"
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Job Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Job Summary</label>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
              <CKEditor
                editor={ClassicEditor as any}
                data={formData.description}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  handleInputChange("description", data);
                }}
                config={{
                  placeholder: "Describe the role summary...",
                  toolbar: [
                    "heading", "|", "bold", "italic", "link", "bulletedList", "numberedList", "|", "undo", "redo"
                  ]
                }}
              />
            </div>
          </div>

          {/* Location & Job Type (Two Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                placeholder="Lagos, Nigeria"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Job Type</label>
              <select
                required
                value={formData.job_type}
                onChange={(e) => handleInputChange("job_type", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              >
                {JOB_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Experience Level</label>
            <select
              required
              value={formData.experience_level}
              onChange={(e) => handleInputChange("experience_level", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            >
              {EXPERIENCE_LEVELS.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Salary Range (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Salary Range (Optional)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                value={formData.salary_min || ""}
                onChange={(e) => handleInputChange("salary_min", e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                placeholder="NGN 50,000"
              />
              <input
                type="number"
                value={formData.salary_max || ""}
                onChange={(e) => handleInputChange("salary_max", e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                placeholder="NGN 100,000"
              />
            </div>
          </div>

          {/* Autocomplete Searchable Skills Selector */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-500 mb-1">Skills</label>
            <div className="relative">
              <input
                type="text"
                value={skillsSearch}
                onFocus={() => setShowSkillsDropdown(true)}
                onBlur={() => setTimeout(() => setShowSkillsDropdown(false), 250)}
                onChange={(e) => setSkillsSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                placeholder="Type to search and add skills..."
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Skills Autocomplete Dropdown */}
            {showSkillsDropdown && (
              <ul className="absolute left-0 right-0 z-50 mt-1 max-h-52 overflow-y-auto rounded-xl border border-slate-150 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-950">
                {filteredSkills.map((skill) => (
                  <li
                    key={skill}
                    onMouseDown={() => {
                      const currentSkills = formData.required_skills || [];
                      handleInputChange("required_skills", [...currentSkills, skill]);
                      setSkillsSearch("");
                      setShowSkillsDropdown(false);
                    }}
                    className="cursor-pointer px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-850 dark:hover:text-blue-400"
                  >
                    {skill}
                  </li>
                ))}
                {filteredSkills.length === 0 && (
                  <li className="px-4 py-2.5 text-xs text-slate-450 italic select-none">
                    No matching skills found
                  </li>
                )}
              </ul>
            )}

            {/* Selected Skills Badges Wrap */}
            <div className="flex flex-wrap gap-2 mt-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80 p-3.5 rounded-xl">
              {(formData.required_skills || []).map((skill, index) => (
                <span
                  key={index}
                  onClick={() => removeSkill(skill)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50/80 hover:bg-blue-100/50 text-blue-650 border border-blue-100/50 rounded-full text-xs font-semibold cursor-pointer transition-colors"
                >
                  {skill}
                  <X className="w-3 h-3 text-blue-400 hover:text-blue-600" />
                </span>
              ))}
              {(formData.required_skills || []).length === 0 && (
                <span className="text-xs text-slate-400">No skills selected</span>
              )}
            </div>
          </div>

          {/* Form Actions Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-8 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer border-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? (jobToEdit ? "Updating..." : "Creating...") : (jobToEdit ? "Update" : "Create Job")}
          </button>

        </form>
      </div>
    </div>
  );
}

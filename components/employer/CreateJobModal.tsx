"use client";

import { useState, useEffect, useRef } from "react";
import { useJobStore } from "@/stores/job-store";
import { X, Loader2, ChevronDown, Search, Sparkles, RotateCcw } from "lucide-react";
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
  "Account Manager",
  "Admin Support",
  "Junior Website Manager",
] as const;

type AllowedJobTitle = typeof ALLOWED_JOB_TITLES[number];

const JOB_TEMPLATES: Record<AllowedJobTitle, {
  description: string;
  defaultSkills: string[];
}> = {
  "Account Manager": {
    description: `<h2>Role Summary</h2><p>We are seeking a driven, relationship-focused <strong>Account Manager</strong> to lead client communications, cultivate long-term partnerships, and ensure the consistent delivery of high-value solutions. You will act as the trusted strategic liaison between key accounts and internal teams, driving client satisfaction, retention, and account growth.</p><h2>Key Responsibilities</h2><ul><li>Serve as the primary point of contact and trusted advisor for assigned client accounts.</li><li>Build, nurture, and maintain strong, productive relationships with key stakeholders and decision-makers.</li><li>Understand client business objectives and challenges to provide tailored strategic recommendations.</li><li>Coordinate cross-functional teams to ensure milestones, deliverables, and service-level agreements (SLAs) are met on time.</li><li>Conduct regular client check-ins, performance reviews, and prepare comprehensive status reports.</li><li>Address client inquiries promptly, proactively resolve issues, and de-escalate sensitive situations.</li><li>Identify retention risks and uncover upsell/cross-sell opportunities to expand client lifetime value.</li></ul><h2>Qualifications & Requirements</h2><ul><li>Proven experience in account management, customer success, client relations, or business development.</li><li>Exceptional verbal and written communication, active listening, and relationship-building abilities.</li><li>Strong organizational and multitasking skills with the discipline to manage multiple client accounts concurrently.</li><li>Familiarity with CRM tools (such as HubSpot, Salesforce, or Zendesk) and productivity suites (Google Workspace / MS Office).</li><li>Demonstrated problem-solving acumen, commercial awareness, and professional negotiation skills.</li><li>Bachelor's degree or equivalent practical experience in business administration, marketing, or related field.</li></ul><h2>Key Skills & Competencies</h2><ul><li>Client Relationship Management & Retention</li><li>Strategic & Persuasive Communication</li><li>CRM Management & Pipeline Tracking</li><li>Stakeholder Alignment & Negotiation</li><li>Conflict Resolution & Problem-Solving</li></ul>`,
    defaultSkills: [
      "Relationship building",
      "CRM basics",
      "Written & verbal communication",
      "Clear communication",
      "Problem-solving",
      "Stakeholder communication",
      "Active listening"
    ]
  },
  "Admin Support": {
    description: `<h2>Role Summary</h2><p>We are looking for an organized, proactive, and dependable <strong>Admin Support</strong> professional to manage administrative, operational, and clerical workflows. In this role, you will provide critical support to leadership and the broader team, ensuring daily operations run smoothly, schedules are impeccably coordinated, and documentation remains accurate and secure.</p><h2>Key Responsibilities</h2><ul><li>Manage executive and departmental calendars, schedule meetings, coordinate appointments, and prepare meeting materials.</li><li>Monitor and prioritize incoming emails, correspondence, and client/internal inquiries.</li><li>Draft, format, proofread, and organize reports, spreadsheets, presentations, and official documentation.</li><li>Maintain digital filing systems, document archives, and execute fast, accurate data entry into company software.</li><li>Coordinate logistics for meetings, events, travel itineraries, and team operational requirements.</li><li>Handle sensitive and proprietary company information with strict confidentiality and discretion.</li><li>Collaborate with team members across departments to resolve administrative bottlenecks and support ad-hoc projects.</li></ul><h2>Qualifications & Requirements</h2><ul><li>Proven track record in administrative support, executive assistance, office coordination, or virtual assistance.</li><li>Proficiency in Google Workspace (Docs, Sheets, Slides, Drive) and Microsoft Office Suite (Word, Excel, PowerPoint).</li><li>Exceptional written and verbal communication skills with strong attention to spelling, grammar, and document formatting.</li><li>Outstanding time management and prioritization skills with the capacity to handle competing priorities.</li><li>High degree of integrity, professionalism, and commitment to confidentiality.</li><li>Fast and accurate typing speed (50+ WPM) with rigorous attention to detail.</li></ul><h2>Key Skills & Competencies</h2><ul><li>Calendar & Schedule Management</li><li>Email & Correspondence Handling</li><li>Data Entry & Document Formatting</li><li>MS Office & Google Workspace</li><li>Organization & Multitasking</li><li>Confidentiality & Discretion</li></ul>`,
    defaultSkills: [
      "Calendar management (Google/Outlook)",
      "Email management",
      "MS Office & Google Workspace",
      "Data entry",
      "Scheduling & coordination",
      "Organized and detail-oriented",
      "Confidentiality"
    ]
  },
  "Junior Website Manager": {
    description: `<h2>Role Summary</h2><p>We are seeking a detail-oriented and tech-savvy <strong>Junior Website Manager</strong> to maintain, update, and optimize our digital web platforms. You will collaborate closely with marketing, design, and development teams to ensure our websites deliver a seamless user experience, stay visually engaging, reflect current content, and perform reliably across all devices and browsers.</p><h2>Key Responsibilities</h2><ul><li>Manage day-to-day website updates, publish new landing pages, blog posts, banners, product listings, and multimedia assets.</li><li>Regularly monitor website performance, test site functionality, check for broken links, and verify cross-browser and mobile responsiveness.</li><li>Make foundational front-end modifications using HTML, CSS, and modern content management systems (CMS).</li><li>Implement on-page SEO best practices (meta descriptions, alt tags, URL structures) and optimize site media for fast loading speeds.</li><li>Track key website engagement metrics and visitor traffic using Google Analytics and search console tools.</li><li>Coordinate with UI/UX designers and copywriters to ensure consistent brand identity and layout fidelity.</li><li>Document, troubleshoot, and log bugs or technical discrepancies, following up until resolved.</li></ul><h2>Qualifications & Requirements</h2><ul><li>Demonstrated foundational knowledge of HTML5, CSS3, JavaScript basics, and CMS platforms (e.g., WordPress, Webflow, Shopify).</li><li>Understanding of responsive web design, mobile-first layouts, and cross-browser compatibility.</li><li>Familiarity with on-page SEO principles, web performance optimization, and basic web analytics (Google Analytics).</li><li>A keen visual eye for design layout, typography, branding consistency, and user experience.</li><li>Strong problem-solving instincts, methodical troubleshooting skills, and eagerness to learn new web technologies.</li><li>Educational background, certification, or bootcamp in Web Development, Digital Media, or related practical experience.</li></ul><h2>Key Skills & Competencies</h2><ul><li>HTML5, CSS3 & Web Fundamentals</li><li>CMS Management (WordPress / Webflow / Shopify)</li><li>Responsive Web Design & Mobile Optimization</li><li>On-Page SEO & Web Performance</li><li>QA Testing & Bug Tracking</li><li>Attention to Visual & Technical Detail</li></ul>`,
    defaultSkills: [
      "HTML5, CSS3, JavaScript (ES6+)",
      "Basic understanding of APIs (Postman)",
      "Content scheduling",
      "SEO copywriting fundamentals",
      "Bug tracking (Jira/Linear)",
      "QA / Software Tester",
      "Attention to detail"
    ]
  }
};

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
  const editorRef = useRef<any>(null);
  
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
      if (editorRef.current) {
        editorRef.current.setData(jobToEdit.description || "");
      }
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
      if (editorRef.current) {
        editorRef.current.setData("");
      }
    }
  }, [jobToEdit, isOpen]);

  const handleInputChange = (field: keyof CreateJobRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectJobTitle = (title: string) => {
    setTitleSearch(title);

    // Find matching template (case-insensitive check for resilience)
    const matchedKey = (ALLOWED_JOB_TITLES as readonly string[]).find(
      t => t.toLowerCase() === title.trim().toLowerCase()
    ) as AllowedJobTitle | undefined;

    const template = matchedKey ? JOB_TEMPLATES[matchedKey] : null;

    setFormData(prev => ({
      ...prev,
      title,
      description: template ? template.description : prev.description,
      required_skills: template ? template.defaultSkills : prev.required_skills,
    }));

    if (template && editorRef.current) {
      editorRef.current.setData(template.description);
    }
    setShowTitleDropdown(false);
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-500">Job Title</label>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                Select a title to auto-fill description & skills
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                required
                value={titleSearch}
                onFocus={() => setShowTitleDropdown(true)}
                onBlur={() => setTimeout(() => setShowTitleDropdown(false), 250)}
                onChange={(e) => {
                  const val = e.target.value;
                  setTitleSearch(val);
                  handleInputChange("title", val);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                placeholder="Type to search and select job title..."
              />
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Quick-Select Role Badges */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] font-semibold text-slate-400 mr-1 select-none">Quick roles:</span>
              {ALLOWED_JOB_TITLES.map((title) => {
                const isSelected = formData.title === title;
                return (
                  <button
                    key={title}
                    type="button"
                    onClick={() => handleSelectJobTitle(title)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/60 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-800"
                    }`}
                  >
                    <Sparkles className={`w-3 h-3 ${isSelected ? "text-blue-500" : "text-slate-400"}`} />
                    {title}
                  </button>
                );
              })}
            </div>

            {/* Dropdown Options List */}
            {showTitleDropdown && (
              <ul className="absolute left-0 right-0 z-50 mt-1 max-h-52 overflow-y-auto rounded-xl border border-slate-150 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-950">
                {filteredTitles.map((title) => (
                  <li
                    key={title}
                    onMouseDown={() => {
                      handleSelectJobTitle(title);
                    }}
                    className="cursor-pointer px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-850 dark:hover:text-blue-400 flex items-center justify-between"
                  >
                    <span>{title}</span>
                    <span className="text-[10px] text-blue-500 font-normal bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                      Auto-fills summary & skills
                    </span>
                  </li>
                ))}
                {filteredTitles.length === 0 && (
                  <li 
                    onMouseDown={() => {
                      handleInputChange("title", titleSearch);
                      setShowTitleDropdown(false);
                    }}
                    className="cursor-pointer px-4 py-2.5 text-xs text-slate-450 italic select-none"
                  >
                    Use custom title "{titleSearch}"
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Job Summary */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-500">Job Summary</label>
              {formData.title && JOB_TEMPLATES[formData.title as AllowedJobTitle] && (
                <button
                  type="button"
                  onClick={() => {
                    const template = JOB_TEMPLATES[formData.title as AllowedJobTitle];
                    if (template) {
                      handleInputChange("description", template.description);
                      if (editorRef.current) {
                        editorRef.current.setData(template.description);
                      }
                    }
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors bg-transparent border-none cursor-pointer"
                  title="Reset description to role template"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to role template
                </button>
              )}
            </div>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
              <CKEditor
                editor={ClassicEditor as any}
                data={formData.description}
                onReady={(editor: any) => {
                  editorRef.current = editor;
                  if (formData.description && editor.getData() !== formData.description) {
                    editor.setData(formData.description);
                  }
                }}
                onChange={(event: any, editor: any) => {
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

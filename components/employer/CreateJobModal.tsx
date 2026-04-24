"use client";

import { useState, useEffect } from "react";
import { useJobStore } from "@/stores/job-store";
import { X, Trash2, Loader2 } from "lucide-react";
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

const COMMON_SKILLS = [
  "Virtual Assistant",
  "Customer Service",
  "Communication",
  "Time Management",
  "Problem Solving",
  "Teamwork",
  "Leadership",
  "Project Management",
  "Data Analysis",
  "Microsoft Office",
  "Google Suite",
  "Social Media Management",
  "Content Writing",
  "Email Management",
  "Calendar Management",
  "Research",
  "Bookkeeping",
  "Sales",
  "Marketing",
  "Graphic Design",
  "Web Development",
  "Python",
  "JavaScript",
  "React",
  "Node.js",
  "SQL",
  "Excel",
  "PowerPoint",
  "Presentation Skills",
  "Negotiation",
  "Critical Thinking",
  "Adaptability",
  "Attention to Detail",
  "Multitasking",
  "Phone Support",
  "Technical Support",
  "Account Management",
  "Business Development",
  "Product Management",
  "Quality Assurance",
  "UI/UX Design",
  "Mobile Development",
  "Cloud Computing",
  "DevOps",
  "Machine Learning",
  "Artificial Intelligence",
  "Blockchain",
  "Cybersecurity",
  "Network Administration",
  "Database Management"
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

  const [skillsInput, setSkillsInput] = useState("");

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
      setSkillsInput(jobToEdit.required_skills?.join(", ") || "");
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
      setSkillsInput("");
    }
  }, [jobToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const jobData = {
      ...formData,
      required_skills: formData.required_skills || [],
    };

    try {
      if (jobToEdit) {
        await updateJob(jobToEdit._id, jobData);
      } else {
        await createJob(jobData);
      }
      onClose();
    } catch (error) {
      // Error handled by store
    }
  };

  const handleInputChange = (field: keyof CreateJobRequest, value: string | number | string[] | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    const newSkill = prompt("Enter a skill:");
    if (newSkill && newSkill.trim()) {
      const currentSkills = formData.required_skills || [];
      handleInputChange("required_skills", [...currentSkills, newSkill.trim()]);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = formData.required_skills || [];
    handleInputChange("required_skills", currentSkills.filter(skill => skill !== skillToRemove));
  };

  const isLoading = isCreating || isUpdating;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 border-2 border-blue-600 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto overscroll-contain">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 overflow-y">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {jobToEdit ? "Edit Job" : "Create New Job"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Lagos, Nigeria"
                />
              </div>

              {/* Job Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Job Type *
                </label>
                <select
                  required
                  value={formData.job_type}
                  onChange={(e) => handleInputChange("job_type", e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {JOB_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Experience Level *
                </label>
                <select
                  required
                  value={formData.experience_level}
                  onChange={(e) => handleInputChange("experience_level", e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {EXPERIENCE_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Salary Range (Optional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      value={formData.salary_min || ""}
                      onChange={(e) => handleInputChange("salary_min", e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Min salary"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={formData.salary_max || ""}
                      onChange={(e) => handleInputChange("salary_max", e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Max salary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Job Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Job Description *
                </label>
                <div className="border border-slate-300 dark:border-slate-600 rounded-lg overflow-auto max-h-96">
                  <CKEditor
                    editor={ClassicEditor as any}
                    data={formData.description}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      handleInputChange("description", data);
                    }}
                    config={{
                      placeholder: "Describe the role, responsibilities, and requirements...",
                      toolbar: [
                        "heading",
                        "|",
                        "bold",
                        "italic",
                        "link",
                        "bulletedList",
                        "numberedList",
                        "|",
                        "outdent",
                        "indent",
                        "|",
                        "blockQuote",
                        "insertTable",
                        "mediaEmbed",
                        "|",
                        "undo",
                        "redo"
                      ],
                      heading: {
                        options: [
                          { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
                          { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
                          { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
                          { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" }
                        ]
                      },
                      table: {
                        contentToolbar: [
                          "tableColumn",
                          "tableRow",
                          "mergeTableCells"
                        ]
                      }
                    }}
                  />
                </div>
              </div>

              {/* Required Skills */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Required Skills
                </label>
                <div className="space-y-3">
                  <select
                    value={skillsInput}
                    onChange={(e) => {
                      const selectedSkill = e.target.value;
                      if (selectedSkill.trim()) {
                        const currentSkills = formData.required_skills || [];
                        if (!currentSkills.includes(selectedSkill.trim())) {
                          handleInputChange("required_skills", [...currentSkills, selectedSkill.trim()]);
                        }
                      }
                      setSkillsInput("");
                    }}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a skill...</option>
                    {COMMON_SKILLS.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>

                  {/* Skills Tags */}
                  {(formData.required_skills || []).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(formData.required_skills || []).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {jobToEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                jobToEdit ? 'Update Job' : 'Create Job'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

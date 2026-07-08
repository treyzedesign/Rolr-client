"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";
import type { CandidateProfile } from "@/types/profile";
import { Edit, Camera, X, Check, Loader2, FileText, Upload, Eye, Mic, MapPin, Briefcase, CircleDollarSign, Bell, ChevronRight } from "lucide-react";
import { ImageCropModal } from "@/components/ui/ImageCropModal";
import { ImageViewerModal } from "@/components/ui/ImageViewerModal";
import { PDFViewerModal } from "@/components/ui/PDFViewerModal";
import { VoiceRecordingModal } from "@/components/ui/VoiceRecordingModal";

const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
];

const JOB_CATEGORIES = [
  "Software Development",
  "Design & Creative",
  "Marketing & Sales",
  "Customer Service",
  "Customer Support",
  "Finance & Accounting",
  "Finance",
  "HR & Recruitment",
  "Operations & Logistics",
  "Healthcare",
  "Education",
  "Engineering",
  "Other",
];

const ADMINISTRATIVE_SKILLS = [
  "Communication",
  "Humility",
  "Handwork",
  "Proactive",
  "Project Management",
  "Team Leadership",
  "Problem Solving",
  "Time Management",
  "Data Analysis",
  "Documentation"
];

const EDUCATION_LEVELS = [
  "High School",
  "Diploma/Certificate",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD/Doctorate",
  "Other",
];

const WORK_TYPES = [
  "On-site",
  "Remote",
  "Hybrid",
];

type SetupSection = "basic" | "voiceIntro" | "professional" | "education" | "jobPreferences" | "portfolio";

export default function CandidateProfile() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const { profile, isLoading, fetchProfile, updateProfile, uploadImage, getCandidateProfile } = useProfileStore();
  const candidateProfile = getCandidateProfile();
  
  const [editingSection, setEditingSection] = useState<SetupSection | null>(null);
  const [formData, setFormData] = useState<Partial<CandidateProfile>>({});
  const [skillsInput, setSkillsInput] = useState("");
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [showVoiceRecordingModal, setShowVoiceRecordingModal] = useState(false);
  const [voiceCurrentTime, setVoiceCurrentTime] = useState(0);
  const [voiceDuration, setVoiceDuration] = useState(0);

  useEffect(() => {
    setMounted(true);
    fetchProfile();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const editParam = params.get("edit");
      if (editParam && ["basic", "voiceIntro", "professional", "education", "jobPreferences", "portfolio"].includes(editParam)) {
        setEditingSection(editParam as SetupSection);
      }
    }
  }, [fetchProfile]);

  useEffect(() => {
    return () => {
      const audio = (window as any).currentVoiceAudio;
      if (audio) {
        audio.pause();
        audio.src = '';
        (window as any).currentVoiceAudio = null;
      }
    };
  }, []);

  useEffect(() => {
    if (candidateProfile) {
      setFormData(candidateProfile);
      setSkillsInput(candidateProfile.skills?.join(", ") || "");
    }
  }, [candidateProfile]);

  const startEditingSection = (section: SetupSection) => {
    setEditingSection(section);
    if (candidateProfile) {
      setFormData(candidateProfile);
      setSkillsInput(candidateProfile.skills?.join(", ") || "");
    }
  };

  const cancelEditing = () => {
    setEditingSection(null);
    if (candidateProfile) {
      setFormData(candidateProfile);
      setSkillsInput(candidateProfile.skills?.join(", ") || "");
    }
  };

  const saveSection = async (section: SetupSection) => {
    setIsSaving(true);
    try {
      const currentSkills = formData.skills || [];
      let updateData: Partial<CandidateProfile> = { ...formData, skills: currentSkills };
      
      if (section === "professional" && resumeFile) {
        const formDataToSend = new FormData();
        
        if (candidateProfile?.first_name) formDataToSend.append('first_name', candidateProfile.first_name);
        if (candidateProfile?.last_name) formDataToSend.append('last_name', candidateProfile.last_name);
        if (candidateProfile?.location) formDataToSend.append('location', candidateProfile.location);
        if (candidateProfile?.phone) formDataToSend.append('phone', candidateProfile.phone);
        if (candidateProfile?.bio) formDataToSend.append('bio', candidateProfile.bio);
        
        if (formData.job_category) formDataToSend.append('job_category', formData.job_category);
        if (formData.experience_level) formDataToSend.append('experience_level', formData.experience_level);
        if (formData.experience_years !== undefined) formDataToSend.append('experience_years', formData.experience_years.toString());
        if (formData.employment_status) formDataToSend.append('employment_status', formData.employment_status);
        if (formData.work_experience) formDataToSend.append('work_experience', formData.work_experience);
        
        const finalSkillsArray = currentSkills.length > 0 ? currentSkills : (candidateProfile?.skills || []);
        if (finalSkillsArray.length > 0) {
          finalSkillsArray.forEach((skill, index) => {
            formDataToSend.append(`skills[${index}]`, skill);
          });
        }
        
        if (candidateProfile?.education_level) formDataToSend.append('education_level', candidateProfile.education_level);
        if (candidateProfile?.education_field) formDataToSend.append('education_field', candidateProfile.education_field);
        if (candidateProfile?.preferred_salary_min) formDataToSend.append('preferred_salary_min', candidateProfile.preferred_salary_min.toString());
        if (candidateProfile?.preferred_salary_max) formDataToSend.append('preferred_salary_max', candidateProfile.preferred_salary_max.toString());
        if (candidateProfile?.work_type_preference) formDataToSend.append('work_type_preference', candidateProfile.work_type_preference);
        if (candidateProfile?.availability) formDataToSend.append('availability', candidateProfile.availability);
        if (candidateProfile?.portfolio_url) formDataToSend.append('portfolio_url', candidateProfile.portfolio_url);
        if (candidateProfile?.linkedin_url) formDataToSend.append('linkedin_url', candidateProfile.linkedin_url);
        
        formDataToSend.append('resume', resumeFile);
        
        await updateProfile(formDataToSend as any);
        setResumeFile(null);
      } else {
        // Merge the active edits with the rest of the existing profile to prevent fields from being wiped out
        updateData = {
          ...(candidateProfile || {}),
          ...formData,
          skills: currentSkills,
        };

        // Remove read-only / metadata fields that should not be posted to the profile update endpoint
        delete (updateData as any)._id;
        delete (updateData as any).user_id;
        delete (updateData as any).created_at;
        delete (updateData as any).updated_at;
        delete (updateData as any).identity;
        delete (updateData as any).profile_image_url;
        delete (updateData as any).resume_url;
        delete (updateData as any).voice_intro_url;
        delete (updateData as any).video_intro_url;
        delete (updateData as any).audio_url;

        await updateProfile(updateData);
      }
      
      // Update form data in sync
      if (candidateProfile) {
        setFormData(candidateProfile);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setShowCropModal(true);
    }
  };

  const handleResumeSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
    } else if (file) {
      alert('Please select a PDF file for your resume.');
    }
  };

  const handleImageCropComplete = async (croppedBlob: Blob) => {
    if (selectedImageFile) {
      setIsUploading(true);
      try {
        const croppedFile = new File([croppedBlob], selectedImageFile.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        await uploadImage(croppedFile);
        setShowCropModal(false);
        setSelectedImageFile(null);
      } catch (error) {
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleVoiceRecordingComplete = async (audioBlob: Blob) => {
    const voiceFile = new File([audioBlob], 'voice-intro.webm', {
      type: 'audio/webm',
      lastModified: Date.now(),
    });
    setVoiceFile(voiceFile);
    
    try {
      setIsSaving(true);
      const formDataToSend = new FormData();
      
      if (candidateProfile?.first_name) formDataToSend.append('first_name', candidateProfile.first_name);
      if (candidateProfile?.last_name) formDataToSend.append('last_name', candidateProfile.last_name);
      if (candidateProfile?.location) formDataToSend.append('location', candidateProfile.location);
      if (candidateProfile?.phone) formDataToSend.append('phone', candidateProfile.phone);
      if (candidateProfile?.bio) formDataToSend.append('bio', candidateProfile.bio);
      if (candidateProfile?.job_category) formDataToSend.append('job_category', candidateProfile.job_category);
      if (candidateProfile?.experience_level) formDataToSend.append('experience_level', candidateProfile.experience_level);
      if (candidateProfile?.experience_years !== undefined) formDataToSend.append('experience_years', candidateProfile.experience_years.toString());
      if (candidateProfile?.employment_status) formDataToSend.append('employment_status', candidateProfile.employment_status);
      if (candidateProfile?.work_experience) formDataToSend.append('work_experience', candidateProfile.work_experience);
      if (candidateProfile?.education_level) formDataToSend.append('education_level', candidateProfile.education_level);
      if (candidateProfile?.education_field) formDataToSend.append('education_field', candidateProfile.education_field);
      if (candidateProfile?.preferred_salary_min) formDataToSend.append('preferred_salary_min', candidateProfile.preferred_salary_min.toString());
      if (candidateProfile?.preferred_salary_max) formDataToSend.append('preferred_salary_max', candidateProfile.preferred_salary_max.toString());
      if (candidateProfile?.work_type_preference) formDataToSend.append('work_type_preference', candidateProfile.work_type_preference);
      if (candidateProfile?.availability) formDataToSend.append('availability', candidateProfile.availability);
      if (candidateProfile?.portfolio_url) formDataToSend.append('portfolio_url', candidateProfile.portfolio_url);
      if (candidateProfile?.linkedin_url) formDataToSend.append('linkedin_url', candidateProfile.linkedin_url);
      
      if (candidateProfile?.skills && candidateProfile.skills.length > 0) {
        candidateProfile.skills.forEach((skill, index) => {
          formDataToSend.append(`skills[${index}]`, skill);
        });
      }
      
      formDataToSend.append('voice_intro', voiceFile);
      
      await updateProfile(formDataToSend as any);
      setVoiceFile(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVoicePlayback = () => {
    const voiceUrl = candidateProfile?.video_intro_url || candidateProfile?.voice_intro_url || candidateProfile?.audio_url;
    if (!voiceUrl) return;

    let audio = (window as any).currentVoiceAudio;
    
    if (!audio || audio.src !== voiceUrl) {
      audio = new Audio(voiceUrl);
      (window as any).currentVoiceAudio = audio;
      
      audio.addEventListener('play', () => setIsPlayingVoice(true));
      audio.addEventListener('pause', () => setIsPlayingVoice(false));
      audio.addEventListener('ended', () => {
        setIsPlayingVoice(false);
        setVoiceCurrentTime(0);
      });
      
      audio.addEventListener('loadedmetadata', () => {
        setVoiceDuration(audio.duration);
      });
      
      audio.addEventListener('timeupdate', () => {
        setVoiceCurrentTime(audio.currentTime);
      });
    }
    
    if (isPlayingVoice) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleInputChange = (field: keyof CandidateProfile, value: string | number | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Checklist items definitions
  const hasBasic = !!(candidateProfile?.first_name && candidateProfile?.last_name);
  const hasVoice = !!(candidateProfile?.voice_intro_url || candidateProfile?.video_intro_url || candidateProfile?.audio_url);
  const hasProfessional = !!candidateProfile?.job_category;
  const hasEducation = !!candidateProfile?.education_level;
  const hasJobPreference = !!candidateProfile?.preferred_salary_min;
  const hasPortfolio = !!(candidateProfile?.portfolio_url || candidateProfile?.linkedin_url);

  const checklistItems = [
    { id: "basic", label: "Add Basic Information", completed: hasBasic },
    { id: "voiceIntro", label: "Add Voice Introduction", completed: hasVoice },
    { id: "professional", label: "Add Professional Information", completed: hasProfessional },
    { id: "education", label: "Add Education", completed: hasEducation },
    { id: "jobPreferences", label: "Add Job Preference", completed: hasJobPreference },
    { id: "portfolio", label: "Add Portfolio & Links", completed: hasPortfolio },
  ];

  const totalStepsCount = checklistItems.length;
  const completedStepsCount = checklistItems.filter(item => item.completed).length;
  const setupPercentage = Math.round((completedStepsCount / totalStepsCount) * 100);
  const pendingStepsCount = totalStepsCount - completedStepsCount;

  // Active step index logic
  const sectionsOrdered: SetupSection[] = ["basic", "voiceIntro", "professional", "education", "jobPreferences", "portfolio"];
  const activeStepIndex = editingSection ? sectionsOrdered.indexOf(editingSection) : 0;

  const handleNextStep = async () => {
    if (!editingSection) return;
    
    // Save current step first
    await saveSection(editingSection);

    const nextIndex = activeStepIndex + 1;
    if (nextIndex < sectionsOrdered.length) {
      setEditingSection(sectionsOrdered[nextIndex]);
    } else {
      // Exit editing mode
      setEditingSection(null);
    }
  };

  const handleSaveAndExit = async () => {
    if (editingSection) {
      await saveSection(editingSection);
    }
    setEditingSection(null);
  };

  const candidateName = candidateProfile?.first_name && candidateProfile?.last_name
    ? `${candidateProfile.first_name} ${candidateProfile.last_name}`
    : user?.fullName || "Job Seeker";

  const emailDisplay = user?.email || "candidate@example.com";

  if (!mounted) return null;

  if (isLoading && !candidateProfile) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center pt-24 text-center">
        <div className="relative flex items-center justify-center w-12 h-12 mb-6">
          <div className="w-12 h-12 rounded-full border-[3px] border-blue-100 border-t-blue-500 animate-spin"></div>
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Loading Your Profile
        </h2>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Preparing your professional workspace.
        </p>
      </div>
    );
  }

  // 1. Profile Setup Editing Workspace (High-fidelity step form)
  if (editingSection !== null) {
    return (
      <div className="space-y-6 pb-12 flex flex-col min-h-full">
        {/* Setup Page Header */}
        <div className="hidden md:flex flex-col gap-6 md:flex-row md:items-center md:justify-between flex-shrink-0 select-none">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Profile Setup
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Discover your next opportunity with our swipe-based job discovery
            </p>
          </div>
          
          {/* Top actions bar */}
          <div className="flex items-center gap-4">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
            </button>
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-1.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                {candidateProfile?.profile_image_url ? (
                  <img src={candidateProfile.profile_image_url} alt="avatar" className="h-full w-full rounded-full object-cover" />
                ) : (
                  candidateName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{emailDisplay}</span>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Candidate</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard setup workspace grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto w-full flex-1">
          
          {/* Left panel: Complete Your Profile checklist */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-5 dark:bg-blue-950/15 dark:border-blue-900/25 shadow-[0_4px_20px_rgba(0,0,0,0.015)] select-none">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Complete Your Profile</h3>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5 leading-relaxed">
                Complete your profile to increase your chances of getting hired
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col gap-5 select-none">
              <div className="flex justify-between items-center border-b border-slate-150/60 dark:border-slate-800/80 pb-4">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Profile ({setupPercentage}%)
                </span>
                {pendingStepsCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm animate-pulse">
                    {pendingStepsCount}
                  </span>
                )}
              </div>

              {/* Steps Checklist items list */}
              <div className="space-y-4">
                {checklistItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => startEditingSection(item.id as SetupSection)}
                    className="flex w-full items-center justify-between py-1 bg-transparent border-none text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        item.completed
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-slate-350 bg-white text-transparent group-hover:border-blue-500"
                      }`}>
                        <Check className="h-3 w-3 stroke-[3.5]" />
                      </div>
                      <span className={`text-xs font-bold transition-colors ${
                        item.id === editingSection
                          ? "text-blue-600 dark:text-blue-400"
                          : item.completed
                            ? "text-slate-400 dark:text-slate-650"
                            : "text-slate-600 dark:text-slate-300 group-hover:text-blue-650"
                      }`}>
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-all ${
                      item.id === editingSection
                        ? "text-blue-500 translate-x-0.5"
                        : "text-slate-300 dark:text-slate-750 group-hover:text-blue-500"
                    }`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel: Active Step form container */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150/75 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-[0_12px_45px_rgba(0,0,0,0.015)] flex flex-col justify-between min-h-[480px]">
            <div>
              {/* Step indicator progress bars row */}
              <div className="flex gap-2.5 mb-8 select-none">
                {sectionsOrdered.map((sectName, index) => {
                  const isActiveOrCompleted = index <= activeStepIndex;
                  return (
                    <div
                      key={sectName}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        isActiveOrCompleted ? "bg-blue-600" : "bg-slate-100 dark:bg-slate-800"
                      }`}
                    />
                  );
                })}
              </div>

              {/* Active Step Heading */}
              <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 select-none mb-6">
                {editingSection === "basic" && "Basic Information"}
                {editingSection === "voiceIntro" && "Voice Introduction"}
                {editingSection === "professional" && "Professional Information"}
                {editingSection === "education" && "Education"}
                {editingSection === "jobPreferences" && "Job Preference"}
                {editingSection === "portfolio" && "Portfolio & Links"}
              </h2>

              {/* Render section inputs */}
              <div className="space-y-6">
                
                {/* A. BASIC SECTION */}
                {editingSection === "basic" && (
                  <div className="space-y-5">
                    {/* Centered Avatar Camera Upload block */}
                    <div className="flex flex-col items-center select-none py-2">
                      <div className="relative">
                        <div 
                          className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-95"
                          onClick={() => candidateProfile?.profile_image_url && setShowImageViewer(true)}
                        >
                          {candidateProfile?.profile_image_url ? (
                            <img src={candidateProfile.profile_image_url} alt="Profile" className="h-full w-full object-cover" />
                          ) : (
                            <div className="text-slate-400 text-3xl font-semibold select-none">
                              {candidateName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 w-8 h-8 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm transition-all hover:scale-105">
                          <Camera className="w-4 h-4" />
                          <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" onClick={(e) => e.stopPropagation()} />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 select-none">First Name</label>
                        <input
                          type="text"
                          value={formData.first_name || ""}
                          onChange={(e) => handleInputChange("first_name", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 select-none">Last Name</label>
                        <input
                          type="text"
                          value={formData.last_name || ""}
                          onChange={(e) => handleInputChange("last_name", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 select-none">Bio</label>
                      <textarea
                        rows={3}
                        value={formData.bio || ""}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        placeholder="Input a detailed introduction about yourself..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 select-none">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone || ""}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 select-none">Location</label>
                      <input
                        type="text"
                        value={formData.location || ""}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </div>
                  </div>
                )}

                {/* B. VOICE INTRO SECTION */}
                {editingSection === "voiceIntro" && (
                  <div className="space-y-6">
                    {voiceFile || hasVoice ? (
                      /* Waveform player state */
                      <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 text-center">
                        {/* Audio prompt text */}
                        <p className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl mx-auto mb-6 select-none italic bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-150/60 dark:border-slate-800 shadow-xs">
                          "Techies and creatives are the real deal. Imagine a world like this without brilliant minds flying around, honestly i feel pumped being a creative and impacting my world"
                        </p>
                        
                        <div className="max-w-xs mx-auto bg-white dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 flex flex-col items-center">
                          <span className="text-[10px] font-bold text-slate-400 font-mono select-none">
                            {isPlayingVoice ? formatTime(voiceCurrentTime) : formatTime(voiceDuration) || "00:03:36"}
                          </span>
                          
                          {/* Visualizer wave */}
                          <div className="h-8 flex items-center gap-[2px] select-none py-1.5 w-full justify-center overflow-hidden mt-2">
                            {Array.from({ length: 24 }).map((_, i) => {
                              const heights = [16, 24, 8, 12, 28, 20, 14, 18, 22, 10, 16, 24, 12, 18, 8, 20, 26, 14, 16, 10, 22, 18, 12, 24];
                              const height = heights[i % heights.length];
                              const progress = voiceDuration ? (voiceCurrentTime / voiceDuration) : 0;
                              const isPlayed = (i / 24) < progress;
                              return (
                                <div key={i} className={`w-[2.5px] rounded-full transition-all ${
                                  isPlayed ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
                                }`} style={{ height: `${height}px` }} />
                              );
                            })}
                          </div>
                          
                          {/* Playback Controls */}
                          <div className="flex items-center gap-4 mt-4">
                            <button
                              onClick={() => {
                                setVoiceFile(null);
                                // Delete logic
                              }}
                              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 border-none cursor-pointer"
                              title="Delete voice intro"
                            >
                              <X className="w-4 h-4 stroke-[2.5]" />
                            </button>
                            
                            <button
                              onClick={handleVoicePlayback}
                              className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 cursor-pointer shadow-sm border-none"
                            >
                              {isPlayingVoice ? (
                                <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                              ) : (
                                <svg className="w-3.5 h-3.5 fill-white ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                              )}
                            </button>
                            
                            <button
                              onClick={() => startEditingSection("voiceIntro")}
                              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 border-none cursor-pointer"
                              title="Rerecord voice"
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Audio recorder session setup */
                      <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 text-center select-none flex flex-col justify-center items-center py-10">
                        {/* Fake static wave outline */}
                        <div className="h-10 flex items-center gap-[2.5px] select-none py-1.5 w-full justify-center overflow-hidden mb-6">
                          {Array.from({ length: 32 }).map((_, i) => {
                            const heights = [12, 16, 8, 20, 24, 18, 10, 14, 22, 12, 16, 20, 8, 14, 18, 24, 12, 16, 8, 20, 24, 18, 10, 14, 22, 12, 16, 20, 8, 14, 18, 24];
                            return <div key={i} className="w-[3px] rounded-full bg-blue-300 dark:bg-blue-900/35" style={{ height: `${heights[i]}px` }} />;
                          })}
                        </div>
                        
                        <h3 className="text-md font-bold text-slate-900 dark:text-slate-100 mb-1">Voice Recording Assistant</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mb-6">
                          Record your voice by reading a professional text prompt. This help assess your speaking skills. Find a quiet environment ith minimal background noise, speak clearly at a natural pace, read the entire text for best assessment. Tap on the microphone to proceed
                        </p>
                        
                        <button
                          onClick={() => setShowVoiceRecordingModal(true)}
                          className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
                        >
                          <Mic className="w-5 h-5 stroke-[2.5]" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* C. PROFESSIONAL SECTION */}
                {editingSection === "professional" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 select-none">Job Category</label>
                        <select
                          value={formData.job_category || ""}
                          onChange={(e) => handleInputChange("job_category", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                        >
                          <option value="">Select category</option>
                          {JOB_CATEGORIES.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 select-none">Experience Level</label>
                        <select
                          value={formData.experience_level || ""}
                          onChange={(e) => handleInputChange("experience_level", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                        >
                          <option value="">Select level</option>
                          {EXPERIENCE_LEVELS.map(level => (
                            <option key={level.value} value={level.value}>{level.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 select-none">Years of Experience</label>
                      <input
                        type="number"
                        value={formData.experience_years || ""}
                        onChange={(e) => handleInputChange("experience_years", parseInt(e.target.value) || 0)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 select-none">Employment Status</label>
                      <input
                        type="text"
                        value={formData.employment_status || ""}
                        onChange={(e) => handleInputChange("employment_status", e.target.value)}
                        placeholder="Select status"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 select-none">Work Experience</label>
                      <textarea
                        rows={3}
                        value={formData.work_experience || ""}
                        onChange={(e) => handleInputChange("work_experience", e.target.value)}
                        placeholder="Describe your work experience..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 select-none">Resume File</label>
                      <div className="space-y-2">
                        {candidateProfile?.resume_url && (
                          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 select-none">
                            <span className="text-[10px] text-slate-500 font-bold">Current CV uploaded</span>
                            <button type="button" onClick={() => setShowPDFViewer(true)} className="text-blue-600 hover:text-blue-700 text-xs font-bold border-none bg-transparent">Preview</button>
                          </div>
                        )}
                        <label className="flex items-center justify-center gap-1.5 p-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-blue-400 select-none">
                          <Upload className="w-4 h-4 text-slate-450" />
                          <span className="text-xs text-slate-500 font-bold truncate max-w-[80%]">{resumeFile ? resumeFile.name : 'Upload PDF Resume'}</span>
                          <input type="file" accept=".pdf,application/pdf" onChange={handleResumeSelect} className="hidden" />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 select-none">Skills</label>
                      <select
                        value={""}
                        onChange={(e) => {
                          const selectedSkill = e.target.value;
                          if (selectedSkill && !(formData.skills || []).includes(selectedSkill)) {
                            setFormData(prev => {
                              const updatedSkills = [...(prev.skills || []), selectedSkill];
                              return { ...prev, skills: updatedSkills };
                            });
                          }
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 mb-2.5"
                      >
                        <option value="">Select skills</option>
                        {ADMINISTRATIVE_SKILLS.map(skill => (
                          <option key={skill} value={skill}>{skill}</option>
                        ))}
                      </select>
                      
                      {formData.skills && formData.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 max-h-[70px] overflow-y-auto select-none">
                          {formData.skills.map((skill, index) => (
                            <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full dark:bg-blue-955/20 dark:text-blue-400">
                              {skill}
                              <button 
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    skills: prev.skills?.filter((_, i) => i !== index) || []
                                  }));
                                }}
                                className="text-blue-400 hover:text-blue-600 border-none bg-transparent cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* D. EDUCATION SECTION */}
                {editingSection === "education" && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 select-none">Education Level</label>
                      <select
                        value={formData.education_level || ""}
                        onChange={(e) => handleInputChange("education_level", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                      >
                        <option value="">Select level</option>
                        {EDUCATION_LEVELS.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 select-none">Field of Study</label>
                      <input
                        type="text"
                        value={formData.education_field || ""}
                        onChange={(e) => handleInputChange("education_field", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </div>
                  </div>
                )}

                {/* E. JOB PREFERENCE SECTION */}
                {editingSection === "jobPreferences" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 select-none">Min Salary</label>
                        <input
                          type="number"
                          value={formData.preferred_salary_min || ""}
                          onChange={(e) => handleInputChange("preferred_salary_min", parseInt(e.target.value) || 0)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 select-none">Max Salary</label>
                        <input
                          type="number"
                          value={formData.preferred_salary_max || ""}
                          onChange={(e) => handleInputChange("preferred_salary_max", parseInt(e.target.value) || 0)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 select-none">Work Type Preference</label>
                      <select
                        value={formData.work_type_preference || ""}
                        onChange={(e) => handleInputChange("work_type_preference", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                      >
                        <option value="">Select preference</option>
                        {WORK_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 select-none">Availability</label>
                      <input
                        type="text"
                        value={formData.availability || ""}
                        onChange={(e) => handleInputChange("availability", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </div>
                  </div>
                )}

                {/* F. PORTFOLIO SECTION */}
                {editingSection === "portfolio" && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 select-none">Portfolio URL</label>
                      <input
                        type="url"
                        value={formData.portfolio_url || ""}
                        onChange={(e) => handleInputChange("portfolio_url", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 select-none">LinkedIn URL</label>
                      <input
                        type="url"
                        value={formData.linkedin_url || ""}
                        onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Step Action Footer controls */}
            <div className="flex gap-4 pt-6 border-t border-slate-100 dark:border-slate-800/80 mt-8 select-none">
              <button
                onClick={handleSaveAndExit}
                disabled={isSaving}
                className="flex-1 py-3 rounded-full border border-blue-600 text-blue-600 text-xs font-bold hover:bg-blue-50/50 active:scale-95 transition-all cursor-pointer border-solid bg-transparent dark:border-blue-500 dark:text-blue-400"
              >
                Save Changes & Exit
              </button>
              
              <button
                onClick={handleNextStep}
                disabled={isSaving}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full shadow-sm hover:scale-103 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    {activeStepIndex === sectionsOrdered.length - 1 ? "Complete Setup" : "Next"}
                    <span className="text-sm font-light mt-[-1px]">&rarr;</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Modal attachments */}
        {showCropModal && selectedImageFile && (
          <ImageCropModal imageFile={selectedImageFile} onCropComplete={handleImageCropComplete} onCancel={() => { setShowCropModal(false); setSelectedImageFile(null); }} isUploading={isUploading} />
        )}
        {showImageViewer && candidateProfile?.profile_image_url && (
          <ImageViewerModal imageUrl={candidateProfile.profile_image_url} alt={`${candidateProfile.first_name} ${candidateProfile.last_name} Profile`} onClose={() => setShowImageViewer(false)} />
        )}
        {showPDFViewer && candidateProfile?.resume_url && (
          <PDFViewerModal pdfUrl={candidateProfile.resume_url} onClose={() => setShowPDFViewer(false)} />
        )}
        <VoiceRecordingModal isOpen={showVoiceRecordingModal} onClose={() => setShowVoiceRecordingModal(false)} onRecordingComplete={handleVoiceRecordingComplete} existingVoiceUrl={candidateProfile?.video_intro_url || candidateProfile?.voice_intro_url || candidateProfile?.audio_url} />
      </div>
    );
  }

  // 2. Normal View Profile Screen (6-block detail layout we created earlier)
  return (
    <div className="space-y-6 pb-12 flex flex-col min-h-full">
      {/* Header section - Hidden on mobile, shown on desktop */}
      <div className="hidden md:flex flex-col gap-6 md:flex-row md:items-center md:justify-between flex-shrink-0 select-none">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your professional information
          </p>
        </div>
        
        {/* Top-Right Actions */}
        <div className="flex flex-wrap items-center gap-4">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-all shadow-sm">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
          </button>

          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-1.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/45 dark:text-blue-300">
              {candidateProfile?.profile_image_url ? (
                <img 
                  src={candidateProfile.profile_image_url} 
                  alt="avatar" 
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                candidateName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                {emailDisplay}
              </span>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Candidate
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile container */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-[0_15px_50px_rgba(0,0,0,0.02)] border border-slate-150/75 dark:border-slate-800 w-full max-w-4xl mx-auto flex-1 flex flex-col justify-start">
        {/* Profile Header Block */}
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 pb-8 border-b border-slate-100 dark:border-slate-800">
          {/* Avatar Picture */}
          <div className="relative">
            <div 
              className="h-24 w-24 md:h-28 md:w-28 rounded-full bg-purple-50 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-95 transition-opacity border border-slate-100 dark:border-slate-800"
              onClick={() => candidateProfile?.profile_image_url && setShowImageViewer(true)}
            >
              {candidateProfile?.profile_image_url ? (
                <img
                  src={candidateProfile.profile_image_url}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-slate-500 text-3xl font-semibold select-none">
                  {candidateName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors w-8 h-8 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
              <Camera className="w-4.5 h-4.5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                onClick={(e) => e.stopPropagation()}
              />
            </label>
          </div>

          {/* User Bio and Meta */}
          <div className="flex-1 text-center md:text-left flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 select-none tracking-tight">
              {candidateName}
            </h2>
            <p className="text-slate-500 font-semibold text-xs md:text-sm mt-1 flex flex-wrap items-center justify-center md:justify-start gap-1.5 select-none">
              <span>{candidateProfile?.job_category || "Job Category"}</span>
              <span>•</span>
              <span>{candidateProfile?.location || "Location"}</span>
              <span>•</span>
              <span>{candidateProfile?.experience_years ? `${candidateProfile.experience_years} Years` : "Experience N/A"}</span>
            </p>
            
            {/* Short professional description bio */}
            <p className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400 mt-4 leading-relaxed max-w-2xl">
              {candidateProfile?.bio || "A dedicated professional ready for new opportunities. Click basic details edit to update your bio."}
            </p>

            {/* Social pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mt-4 select-none">
              {candidateProfile?.linkedin_url ? (
                <a
                  href={candidateProfile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-50 border border-slate-100 text-slate-500 text-[11px] font-bold rounded-full dark:bg-slate-950/20 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  {candidateProfile.linkedin_url.replace("https://", "").replace("www.", "").split("/")[0]}
                </a>
              ) : (
                <span className="text-[10px] text-slate-400 font-semibold italic">No LinkedIn linked</span>
              )}
              {candidateProfile?.portfolio_url ? (
                <a
                  href={candidateProfile.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-50 border border-slate-100 text-slate-500 text-[11px] font-bold rounded-full dark:bg-slate-950/20 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  {candidateProfile.portfolio_url.replace("https://", "").replace("www.", "").split("/")[0]}
                </a>
              ) : (
                <span className="text-[10px] text-slate-400 font-semibold italic">No Portfolio linked</span>
              )}
            </div>
          </div>
        </div>

        {/* Two vertical flex columns side-by-side inside grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 items-start">
          
          {/* Left Column Stack */}
          <div className="flex flex-col gap-6 w-full">
            
            {/* Card 1: Basic Information */}
            <div className="bg-slate-50 dark:bg-slate-950/25 border border-slate-100/70 dark:border-slate-800/80 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] relative flex flex-col justify-start">
              <div className="flex justify-between items-center mb-5 select-none">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Basic Information</h3>
                <button
                  onClick={() => startEditingSection("basic")}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-50 bg-blue-50/10 text-blue-600 text-[10px] font-bold hover:bg-blue-50/30 transition-all border-solid cursor-pointer select-none"
                >
                  <Edit className="w-3 h-3 stroke-[2.5]" />
                  Edit
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">First Name</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{candidateProfile?.first_name || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last Name</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{candidateProfile?.last_name || "Not specified"}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{candidateProfile?.phone || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{candidateProfile?.location || "Not specified"}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Education */}
            <div className="bg-slate-50 dark:bg-slate-955/25 border border-slate-100/70 dark:border-slate-800/80 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] relative flex flex-col justify-start">
              <div className="flex justify-between items-center mb-5 select-none">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Education</h3>
                <button
                  onClick={() => startEditingSection("education")}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-50 bg-blue-50/10 text-blue-600 text-[10px] font-bold hover:bg-blue-50/30 transition-all border-solid cursor-pointer select-none"
                >
                  <Edit className="w-3 h-3 stroke-[2.5]" />
                  Edit
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Education Level</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{candidateProfile?.education_level || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Field of Study</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{candidateProfile?.education_field || "Not specified"}</span>
                </div>
              </div>
            </div>

            {/* Card 5: Job Preference */}
            <div className="bg-slate-50 dark:bg-slate-950/25 border border-slate-100/70 dark:border-slate-800/80 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] relative flex flex-col justify-start">
              <div className="flex justify-between items-center mb-5 select-none">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Job Preference</h3>
                <button
                  onClick={() => startEditingSection("jobPreferences")}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-50 bg-blue-50/10 text-blue-600 text-[10px] font-bold hover:bg-blue-50/30 transition-all border-solid cursor-pointer select-none"
                >
                  <Edit className="w-3 h-3 stroke-[2.5]" />
                  Edit
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Min Salary</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {candidateProfile?.preferred_salary_min ? `NGN ${candidateProfile.preferred_salary_min.toLocaleString()}` : "Not specified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Max Salary</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {candidateProfile?.preferred_salary_max ? `NGN ${candidateProfile.preferred_salary_max.toLocaleString()}` : "Not specified"}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Work Type Preference</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{candidateProfile?.work_type_preference || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Availability</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{candidateProfile?.availability || "Not specified"}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column Stack */}
          <div className="flex flex-col gap-6 w-full">
            
            {/* Card 2: Voice Introduction */}
            <div className="bg-slate-50 dark:bg-slate-950/25 border border-slate-100/70 dark:border-slate-800/80 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] relative flex flex-col justify-start">
              <div className="flex justify-between items-center mb-5 select-none">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Voice Introduction</h3>
                <button
                  onClick={() => startEditingSection("voiceIntro")}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-50 bg-blue-50/10 text-blue-600 text-[10px] font-bold hover:bg-blue-50/30 transition-all border-solid cursor-pointer select-none"
                >
                  <Edit className="w-3 h-3 stroke-[2.5]" />
                  Edit
                </button>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {(candidateProfile?.video_intro_url || candidateProfile?.voice_intro_url || candidateProfile?.audio_url) ? (
                  <div className="mt-4 flex items-center gap-3 bg-blue-50/40 dark:bg-blue-955/10 rounded-2xl p-4 border border-blue-50 dark:border-blue-955/20">
                    <button
                      onClick={handleVoicePlayback}
                      className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-sm active:scale-95 cursor-pointer border-none"
                    >
                      {isPlayingVoice ? (
                        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 fill-white ml-0.5" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                    
                    <div className="flex-1 h-8 flex items-center gap-[2px] select-none px-2 overflow-hidden">
                      {Array.from({ length: 28 }).map((_, i) => {
                        const heights = [16, 24, 8, 12, 28, 20, 14, 18, 22, 10, 16, 24, 12, 18, 8, 20, 26, 14, 16, 10, 22, 18, 12, 24, 8, 14, 20, 16];
                        const height = heights[i % heights.length];
                        const progress = voiceDuration ? (voiceCurrentTime / voiceDuration) : 0;
                        const isPlayed = (i / 28) < progress;
                        return (
                          <div 
                            key={i} 
                            className={`w-[3px] rounded-full transition-all duration-300 ${
                              isPlayed ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
                            }`}
                            style={{ height: `${height}px` }}
                          />
                        );
                      })}
                    </div>
                    
                    <span className="text-[10px] font-bold text-slate-400 font-mono select-none flex-shrink-0">
                      {isPlayingVoice ? formatTime(voiceCurrentTime) : formatTime(voiceDuration) || "2:22"}
                    </span>
                  </div>
                ) : (
                  <div className="text-center py-4 select-none">
                    <Mic className="w-8 h-8 text-slate-350 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-400 font-semibold">No voice intro uploaded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Card 4: Professional Information */}
            <div className="bg-slate-50 dark:bg-slate-950/25 border border-slate-100/70 dark:border-slate-800/80 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] relative flex flex-col justify-start">
              <div className="flex justify-between items-center mb-5 select-none">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Professional Information</h3>
                <button
                  onClick={() => startEditingSection("professional")}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-50 bg-blue-50/10 text-blue-600 text-[10px] font-bold hover:bg-blue-50/30 transition-all border-solid cursor-pointer select-none"
                >
                  <Edit className="w-3 h-3 stroke-[2.5]" />
                  Edit
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Job Category</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{candidateProfile?.job_category || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Experience Level</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {candidateProfile?.experience_level ? EXPERIENCE_LEVELS.find(l => l.value === candidateProfile.experience_level)?.label : "Not specified"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Years of Experience</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{candidateProfile?.experience_years ? `${candidateProfile.experience_years} years` : "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Employment Status</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{candidateProfile?.employment_status || "Not specified"}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Work Experience</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block whitespace-pre-wrap leading-relaxed">{candidateProfile?.work_experience || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resume</span>
                  {candidateProfile?.resume_url ? (
                    <button onClick={() => setShowPDFViewer(true)} className="mt-1 flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-xs font-bold bg-transparent border-none cursor-pointer">
                      <FileText className="w-4 h-4" />
                      View Resume
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 block mt-0.5">No resume uploaded</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {candidateProfile?.skills?.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full dark:bg-blue-955/20 dark:text-blue-400 select-none">
                        {skill}
                      </span>
                    )) || <span className="text-xs font-semibold text-slate-400">Not specified</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 6: Portfolio & Links */}
            <div className="bg-slate-50 dark:bg-slate-955/25 border border-slate-100/70 dark:border-slate-800/80 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] relative flex flex-col justify-start">
              <div className="flex justify-between items-center mb-5 select-none">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Portfolio & Links</h3>
                <button
                  onClick={() => startEditingSection("portfolio")}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-50 bg-blue-50/10 text-blue-600 text-[10px] font-bold hover:bg-blue-50/30 transition-all border-solid cursor-pointer select-none"
                >
                  <Edit className="w-3 h-3 stroke-[2.5]" />
                  Edit
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Portfolio URL</span>
                  {candidateProfile?.portfolio_url ? (
                    <a href={candidateProfile.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-600 hover:underline mt-0.5 block truncate">
                      {candidateProfile.portfolio_url}
                    </a>
                  ) : (
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">Not specified</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">LinkedIn</span>
                  {candidateProfile?.linkedin_url ? (
                    <a href={candidateProfile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-600 hover:underline mt-0.5 block truncate">
                      {candidateProfile.linkedin_url}
                    </a>
                  ) : (
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">Not specified</span>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Image Crop Modal */}
      {showCropModal && selectedImageFile && (
        <ImageCropModal
          imageFile={selectedImageFile}
          onCropComplete={handleImageCropComplete}
          onCancel={() => {
            setShowCropModal(false);
            setSelectedImageFile(null);
          }}
          isUploading={isUploading}
        />
      )}

      {/* Image Viewer Modal */}
      {showImageViewer && candidateProfile?.profile_image_url && (
        <ImageViewerModal
          imageUrl={candidateProfile.profile_image_url}
          alt={`${candidateProfile.first_name} ${candidateProfile.last_name} Profile`}
          onClose={() => setShowImageViewer(false)}
        />
      )}

      {/* PDF Viewer Modal */}
      {showPDFViewer && candidateProfile?.resume_url && (
        <PDFViewerModal
          pdfUrl={candidateProfile.resume_url}
          onClose={() => setShowPDFViewer(false)}
        />
      )}

      {/* Voice Recording Modal */}
      <VoiceRecordingModal
        isOpen={showVoiceRecordingModal}
        onClose={() => setShowVoiceRecordingModal(false)}
        onRecordingComplete={handleVoiceRecordingComplete}
        existingVoiceUrl={candidateProfile?.video_intro_url || candidateProfile?.voice_intro_url || candidateProfile?.audio_url}
      />
    </div>
  );
}

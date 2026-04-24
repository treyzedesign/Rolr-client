"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";
import type { CandidateProfile } from "@/types/profile";
import { Edit, Camera, X, Check, Loader2, FileText, Upload, Eye, Mic, Play, Volume2 } from "lucide-react";
import { ImageCropModal } from "@/components/ui/ImageCropModal";
import { ImageViewerModal } from "@/components/ui/ImageViewerModal";
import { PDFViewerModal } from "@/components/ui/PDFViewerModal";
import { VoiceRecorder } from "@/components/ui/VoiceRecorder";
import { AudioEqualizer } from "@/components/ui/AudioEqualizer";
import { VoiceRecordingModal } from "@/components/ui/VoiceRecordingModal";

const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry Level (0-2 years)" },
  { value: "mid", label: "Mid Level (3-5 years)" },
  { value: "senior", label: "Senior Level (6+ years)" },
];

const JOB_CATEGORIES = [
  "Software Development",
  "Design & Creative",
  "Marketing & Sales",
  "Customer Service",
  "Finance & Accounting",
  "HR & Recruitment",
  "Operations & Logistics",
  "Healthcare",
  "Education",
  "Engineering",
  "Other",
];

const ADMINISTRATIVE_SKILLS = [
  "Project Management",
  "Team Leadership",
  "Communication",
  "Problem Solving",
  "Time Management",
  "Strategic Planning",
  "Budget Management",
  "Data Analysis",
  "Report Writing",
  "Training & Development",
  "Quality Assurance",
  "Risk Management",
  "Vendor Management",
  "Process Improvement",
  "Stakeholder Management",
  "Resource Allocation",
  "Performance Management",
  "Change Management",
  "Documentation",
  "Presentation Skills"
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

type EditingSection = "basic" | "professional" | "education" | "jobPreferences" | "portfolio" | "voiceIntro" | null;

export default function CandidateProfile() {
  const { user } = useAuthStore();
  const { profile, isLoading, fetchProfile, updateProfile, uploadImage, getCandidateProfile } = useProfileStore();
  const candidateProfile = getCandidateProfile();
  const [editingSection, setEditingSection] = useState<EditingSection>(null);
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
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [showVoiceRecordingModal, setShowVoiceRecordingModal] = useState(false);
  const [voiceCurrentTime, setVoiceCurrentTime] = useState(0);
  const [voiceDuration, setVoiceDuration] = useState(0);

  const getCompletionData = () => {
    if (!candidateProfile) return { percentage: 0, missingPriorityField: null };
    
    const priorityFields: { field: keyof CandidateProfile; label: string; boost: number }[] = [
      { field: 'resume_url', label: 'Resume', boost: 20 },
      { field: 'video_intro_url', label: 'Voice Introduction', boost: 20 },
      { field: 'skills', label: 'Skills', boost: 15 },
      { field: 'work_experience', label: 'Work Experience', boost: 15 },
      { field: 'profile_image_url', label: 'Profile Picture', boost: 10 },
      { field: 'bio', label: 'Professional Bio', boost: 10 },
      { field: 'location', label: 'Location', boost: 5 },
      { field: 'job_category', label: 'Job Category', boost: 5 },
    ];

    const allFields: (keyof CandidateProfile)[] = [
      'first_name', 'last_name', 'phone', 'location', 'bio', 
      'profile_image_url', 'job_category', 'experience_level', 
      'experience_years', 'skills', 'work_experience', 
      'education_level', 'education_field', 'preferred_salary_min', 
      'preferred_salary_max', 'work_type_preference', 'availability', 
      'resume_url', 'voice_intro_url'
    ];

    const isCompleted = (field: keyof CandidateProfile) => {
      // Special handling for voice introduction as it can be in multiple fields
      if (field === 'voice_intro_url' || field === 'video_intro_url') {
        return !!(candidateProfile.voice_intro_url || candidateProfile.video_intro_url || candidateProfile.audio_url);
      }
      
      const value = candidateProfile[field];
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== "";
    };

    const completedFieldsCount = allFields.filter(isCompleted).length;
    const percentage = Math.round((completedFieldsCount / allFields.length) * 100);

    const missingPriorityField = priorityFields.find(f => {
      // For priority check, also use the special logic for voice intro
      if (f.field === 'video_intro_url' || f.field === 'voice_intro_url') {
        return !isCompleted('voice_intro_url');
      }
      return !isCompleted(f.field);
    });

    return { percentage, missingPriorityField };
  };

  const { percentage: completionPercentage, missingPriorityField } = getCompletionData();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Cleanup audio on unmount
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

  const startEditingSection = (section: EditingSection) => {
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

  const saveSection = async (section: string) => {
    setIsSaving(true);
    try {
      // Ensure skillsInput is in sync with formData.skills
      const currentSkills = formData.skills || [];
      setSkillsInput(currentSkills.join(", "));
      
      // Handle resume upload if in professional section
      let updateData: Partial<CandidateProfile> = { ...formData, skills: currentSkills };
      
      if (section === "professional" && resumeFile) {
        // Create FormData for file upload
        const formDataToSend = new FormData();
        
        // Add all required fields to avoid backend validation errors
        if (candidateProfile?.first_name) formDataToSend.append('first_name', candidateProfile.first_name);
        if (candidateProfile?.last_name) formDataToSend.append('last_name', candidateProfile.last_name);
        if (candidateProfile?.location) formDataToSend.append('location', candidateProfile.location);
        
        // Add all other profile fields
        if (candidateProfile?.phone) formDataToSend.append('phone', candidateProfile.phone);
        if (candidateProfile?.bio) formDataToSend.append('bio', candidateProfile.bio);
        
        // Add professional fields
        if (formData.job_category) formDataToSend.append('job_category', formData.job_category);
        else if (candidateProfile?.job_category) formDataToSend.append('job_category', candidateProfile.job_category);
        
        if (formData.experience_level) formDataToSend.append('experience_level', formData.experience_level);
        else if (candidateProfile?.experience_level) formDataToSend.append('experience_level', candidateProfile.experience_level);
        
        if (formData.experience_years) formDataToSend.append('experience_years', formData.experience_years.toString());
        else if (candidateProfile?.experience_years) formDataToSend.append('experience_years', candidateProfile.experience_years.toString());
        
        if (formData.employment_status) formDataToSend.append('employment_status', formData.employment_status);
        else if (candidateProfile?.employment_status) formDataToSend.append('employment_status', candidateProfile.employment_status);
        
        if (formData.work_experience) formDataToSend.append('work_experience', formData.work_experience);
        else if (candidateProfile?.work_experience) formDataToSend.append('work_experience', candidateProfile.work_experience);
        
        // Add skills (either new ones or existing)
        const finalSkillsArray = currentSkills.length > 0 ? currentSkills : (candidateProfile?.skills || []);
        if (finalSkillsArray.length > 0) {
          finalSkillsArray.forEach((skill, index) => {
            formDataToSend.append(`skills[${index}]`, skill);
          });
        }
        
        // Add other sections
        if (candidateProfile?.education_level) formDataToSend.append('education_level', candidateProfile.education_level);
        if (candidateProfile?.education_field) formDataToSend.append('education_field', candidateProfile.education_field);
        if (candidateProfile?.preferred_salary_min) formDataToSend.append('preferred_salary_min', candidateProfile.preferred_salary_min.toString());
        if (candidateProfile?.preferred_salary_max) formDataToSend.append('preferred_salary_max', candidateProfile.preferred_salary_max.toString());
        if (candidateProfile?.work_type_preference) formDataToSend.append('work_type_preference', candidateProfile.work_type_preference);
        if (candidateProfile?.availability) formDataToSend.append('availability', candidateProfile.availability);
        if (candidateProfile?.portfolio_url) formDataToSend.append('portfolio_url', candidateProfile.portfolio_url);
        if (candidateProfile?.linkedin_url) formDataToSend.append('linkedin_url', candidateProfile.linkedin_url);
        
        // Add resume file
        formDataToSend.append('resume', resumeFile);
        
        await updateProfile(formDataToSend as any);
        setResumeFile(null);
      } else {
        // Filter data based on section for regular updates
        switch (section) {
          case "basic":
            updateData = {
              first_name: formData.first_name,
              last_name: formData.last_name,
              phone: formData.phone,
              location: formData.location,
              bio: formData.bio,
            };
            break;
          case "professional":
            updateData = {
              job_category: formData.job_category,
              experience_level: formData.experience_level,
              experience_years: formData.experience_years,
              employment_status: formData.employment_status,
              skills: currentSkills,
              work_experience: formData.work_experience,
            };
            break;
          case "education":
            updateData = {
              education_level: formData.education_level,
              education_field: formData.education_field,
            };
            break;
          case "jobPreferences":
            updateData = {
              preferred_salary_min: formData.preferred_salary_min,
              preferred_salary_max: formData.preferred_salary_max,
              work_type_preference: formData.work_type_preference,
              availability: formData.availability,
            };
            break;
          case "portfolio":
            updateData = {
              portfolio_url: formData.portfolio_url,
              linkedin_url: formData.linkedin_url,
            };
            break;
          case "voiceIntro":
            // Handle voice upload with FormData
            if (voiceFile) {
              const formDataToSend = new FormData();
              
              // Add all required fields to avoid backend validation errors
              if (candidateProfile?.first_name) formDataToSend.append('first_name', candidateProfile.first_name);
              if (candidateProfile?.last_name) formDataToSend.append('last_name', candidateProfile.last_name);
              if (candidateProfile?.location) formDataToSend.append('location', candidateProfile.location);
              
              // Add all other profile fields
              if (candidateProfile?.phone) formDataToSend.append('phone', candidateProfile.phone);
              if (candidateProfile?.bio) formDataToSend.append('bio', candidateProfile.bio);
              if (candidateProfile?.job_category) formDataToSend.append('job_category', candidateProfile.job_category);
              if (candidateProfile?.experience_level) formDataToSend.append('experience_level', candidateProfile.experience_level);
              if (candidateProfile?.experience_years) formDataToSend.append('experience_years', candidateProfile.experience_years.toString());
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
              
              // Add skills
              if (candidateProfile?.skills && candidateProfile.skills.length > 0) {
                candidateProfile.skills.forEach((skill, index) => {
                  formDataToSend.append(`skills[${index}]`, skill);
                });
              }
              
              // Add voice file
              formDataToSend.append('voice_intro', voiceFile);
              
              await updateProfile(formDataToSend as any);
              setVoiceFile(null);
            }
            break;
        }

        await updateProfile(updateData);
      }
      
      setEditingSection(null);
    } catch (error) {
      // Error handled by store
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
      // Handle invalid file type
      alert('Please select a PDF file for your resume.');
    }
  };

  const handleImageCropComplete = async (croppedBlob: Blob) => {
    if (selectedImageFile) {
      setIsUploading(true);
      try {
        // Create a new File object from the cropped blob
        const croppedFile = new File([croppedBlob], selectedImageFile.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        await uploadImage(croppedFile);
        setShowCropModal(false);
        setSelectedImageFile(null);
      } catch (error) {
        // Error handled by store
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
    
    // Automatically save the voice recording
    try {
      setIsSaving(true);
      
      const formDataToSend = new FormData();
      
      // Add all required fields to avoid backend validation errors
      if (candidateProfile?.first_name) formDataToSend.append('first_name', candidateProfile.first_name);
      if (candidateProfile?.last_name) formDataToSend.append('last_name', candidateProfile.last_name);
      if (candidateProfile?.location) formDataToSend.append('location', candidateProfile.location);
      
      // Add all other profile fields
      if (candidateProfile?.phone) formDataToSend.append('phone', candidateProfile.phone);
      if (candidateProfile?.bio) formDataToSend.append('bio', candidateProfile.bio);
      if (candidateProfile?.job_category) formDataToSend.append('job_category', candidateProfile.job_category);
      if (candidateProfile?.experience_level) formDataToSend.append('experience_level', candidateProfile.experience_level);
      if (candidateProfile?.experience_years) formDataToSend.append('experience_years', candidateProfile.experience_years.toString());
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
      
      // Add skills
      if (candidateProfile?.skills && candidateProfile.skills.length > 0) {
        candidateProfile.skills.forEach((skill, index) => {
          formDataToSend.append(`skills[${index}]`, skill);
        });
      }
      
      // Add voice file
      formDataToSend.append('voice_intro', voiceFile);
      
      await updateProfile(formDataToSend as any);
      setVoiceFile(null);
      setEditingSection(null);
    } catch (error) {
      // Error handled by store
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVoicePlayback = () => {
    const voiceUrl = candidateProfile?.video_intro_url || candidateProfile?.voice_intro_url || candidateProfile?.audio_url;
    if (!voiceUrl) return;

    // Create or reuse audio element
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
      
      // Update duration when metadata is loaded
      audio.addEventListener('loadedmetadata', () => {
        setVoiceDuration(audio.duration);
      });
      
      // Update current time during playback
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

  if (isLoading && !candidateProfile) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Completion Indicator */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Profile Completion
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {completionPercentage === 100 
                  ? "Your profile is fully complete! You're ready to apply." 
                  : "Complete your profile to increase your chances of getting hired."}
              </p>
            </div>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {completionPercentage}%
            </span>
          </div>
          
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {completionPercentage < 100 && missingPriorityField && (
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
              <Volume2 className="w-4 h-4" />
              <span>
                Tip: Add your <span className="underline decoration-2">{missingPriorityField.label}</span> to boost your profile by {missingPriorityField.boost}%!
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            My Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage your professional information
          </p>
        </div>
      </div>

      {/* Profile Image Section */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div 
              className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => candidateProfile?.profile_image_url && setShowImageViewer(true)}
            >
              {candidateProfile?.profile_image_url ? (
                <img
                  src={candidateProfile.profile_image_url}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-slate-500 text-2xl font-semibold">
                  {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  onClick={(e) => e.stopPropagation()}
                />
              </label>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {candidateProfile?.first_name && candidateProfile?.last_name 
                ? `${candidateProfile.first_name} ${candidateProfile.last_name}`
                : user?.fullName || "Complete your profile"}
            </h2>
            <p className="text-slate-600 dark:text-slate-300">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Basic Information</h3>
          {editingSection !== "basic" && (
            <button
              onClick={() => startEditingSection("basic")}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
        {editingSection === "basic" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.first_name || ""}
                  onChange={(e) => handleInputChange("first_name", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.last_name || ""}
                  onChange={(e) => handleInputChange("last_name", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location || ""}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="City, Country"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Bio
              </label>
              <textarea
                rows={3}
                value={formData.bio || ""}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Tell us about yourself and your experience..."
                maxLength={150}
              />
            </div>
            
            {/* Section Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={cancelEditing}
                disabled={isSaving}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={() => saveSection("basic")}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                First Name
              </label>
              <p className="text-slate-900 dark:text-slate-100">
                {candidateProfile?.first_name || "Not specified"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Last Name
              </label>
              <p className="text-slate-900 dark:text-slate-100">
                {candidateProfile?.last_name || "Not specified"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Phone
              </label>
              <p className="text-slate-900 dark:text-slate-100">
                {candidateProfile?.phone || "Not specified"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Location
              </label>
              <p className="text-slate-900 dark:text-slate-100">
                {candidateProfile?.location || "Not specified"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Bio
              </label>
              <p className="text-slate-900 dark:text-slate-100">
                {candidateProfile?.bio || "Not specified"}
              </p>
            </div>
          </div>
        )}       
      </div>

      {/* Voice Introduction */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Voice Introduction</h3>
            <Mic className="w-4 h-4 text-slate-400" />
          </div>
          {editingSection !== "voiceIntro" && (
            <button
              onClick={() => startEditingSection("voiceIntro")}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {editingSection === "voiceIntro" ? (
          <div className="text-center py-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <Mic className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Voice Recording Assessment
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Record your voice by reading a professional text prompt. This helps assess your speaking skills.
              </p>
              <button
                onClick={() => setShowVoiceRecordingModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mic className="w-5 h-5" />
                Start Recording Session
              </button>
            </div>
          </div>
        ) : (
          <div>
            {(candidateProfile?.video_intro_url || candidateProfile?.voice_intro_url || candidateProfile?.audio_url) ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <span className="text-sm font-medium">Voice introduction available</span>
                    </div>
                    <AudioEqualizer isPlaying={isPlayingVoice} size="sm" showStatic={true} />
                    {(voiceDuration > 0 || isPlayingVoice) && (
                      <span className="text-xs text-slate-500 font-mono">
                        {formatTime(voiceCurrentTime)} / {formatTime(voiceDuration)}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={handleVoicePlayback}
                    className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    {isPlayingVoice ? (
                      <Volume2 className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </button>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Volume2 className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Voice Introduction
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Employers can listen to your voice introduction when viewing your profile. Click the play button to preview.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                <Mic className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-2">No voice introduction recorded</p>
                <p className="text-sm text-slate-400">
                  Add a personal touch to your profile with a voice message
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Professional Information */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Professional Information</h3>
          {editingSection !== "professional" && (
            <button
              onClick={() => startEditingSection("professional")}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Job Category
            </label>
            {editingSection === "professional" ? (
              <select
                value={formData.job_category || ""}
                onChange={(e) => handleInputChange("job_category", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Select category</option>
                {JOB_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            ) : (
              <p className="text-slate-900 dark:text-slate-100">
                {candidateProfile?.job_category || "Not specified"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Experience Level
            </label>
            {editingSection === "professional" ? (
              <select
                value={formData.experience_level || ""}
                onChange={(e) => handleInputChange("experience_level", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Select level</option>
                {EXPERIENCE_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            ) : (
              <p className="text-slate-900 dark:text-slate-100">
                {candidateProfile?.experience_level ? EXPERIENCE_LEVELS.find(l => l.value === candidateProfile.experience_level)?.label : "Not specified"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Years of Experience
            </label>
            {editingSection === "professional" ? (
              <input
                type="number"
                value={formData.experience_years || ""}
                onChange={(e) => handleInputChange("experience_years", parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                min="0"
              />
            ) : (
              <p className="text-slate-900 dark:text-slate-100">
                {candidateProfile?.experience_years ? `${candidateProfile.experience_years} years` : "Not specified"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Employment Status
            </label>
            {editingSection === "professional" ? (
              <input
                type="text"
                value={formData.employment_status || ""}
                onChange={(e) => handleInputChange("employment_status", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="e.g. Employed, Unemployed, Student"
              />
            ) : (
              <p className="text-slate-900 dark:text-slate-100">
                {candidateProfile?.employment_status || "Not specified"}
              </p>
            )}
          </div>
          <div className="col-span-full">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Work Experience
            </label>
            {editingSection === "professional" ? (
              <textarea
                rows={3}
                value={formData.work_experience || ""}
                onChange={(e) => handleInputChange("work_experience", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Describe your work experience..."
              />
            ) : (
              <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                {candidateProfile?.work_experience || "Not specified"}
              </p>
            )}
          </div>
          <div className="col-span-full">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Resume/CV
            </label>
            {editingSection === "professional" ? (
              <div className="space-y-3">
                {candidateProfile?.resume_url && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Current Resume</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPDFViewer(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {resumeFile ? resumeFile.name : 'Upload PDF Resume'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleResumeSelect}
                    disabled={isSaving}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div>
                {candidateProfile?.resume_url ? (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <button
                      onClick={() => setShowPDFViewer(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View Resume
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">No resume uploaded</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Skills
          </label>
          {editingSection === "professional" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <select
                    value={""}
                    onChange={(e) => {
                      const selectedSkill = e.target.value;
                      if (selectedSkill && !(formData.skills || []).includes(selectedSkill)) {
                        setFormData(prev => {
                          const updatedSkills = [...(prev.skills || []), selectedSkill];
                          setSkillsInput(updatedSkills.join(", "));
                          return { ...prev, skills: updatedSkills };
                        });
                      }
                    }}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 appearance-none"
                  >
                    <option value="">Select skills...</option>
                    {[...ADMINISTRATIVE_SKILLS.slice(0, 8), ...ADMINISTRATIVE_SKILLS.slice(8)].map((skill, index) => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Selected Skills Display */}
              {formData.skills && formData.skills.length > 0 && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {skill}
                        <button
                          onClick={() => {
                            setFormData(prev => {
                              const updatedSkills = prev.skills?.filter((_, i) => i !== index) || [];
                              setSkillsInput(updatedSkills.join(", "));
                              return { ...prev, skills: updatedSkills };
                            });
                          }}
                          className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {candidateProfile?.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {skill}
                </span>
              )) || <p className="text-slate-900 dark:text-slate-100">Not specified</p>}
            </div>
          )}
        </div>

        {editingSection === "professional" && (
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={cancelEditing}
              disabled={isSaving}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={() => saveSection("professional")}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Education */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Education</h3>
          {editingSection !== "education" && (
            <button
              onClick={() => startEditingSection("education")}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 ">
          <div>
            {editingSection === "education" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Education Level
                    </label>
                    <select
                      value={formData.education_level || ""}
                      onChange={(e) => handleInputChange("education_level", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                      <option value="">Select level</option>
                      {EDUCATION_LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Field of Study
                    </label>
                    <input
                      type="text"
                      value={formData.education_field || ""}
                      onChange={(e) => handleInputChange("education_field", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                </div>
                
                {/* Section Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={cancelEditing}
                    disabled={isSaving}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={() => saveSection("education")}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Education Level
                  </label>
                  <p className="text-slate-900 dark:text-slate-100">
                    {candidateProfile?.education_level || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Field of Study
                  </label>
                  <p className="text-slate-900 dark:text-slate-100">
                    {candidateProfile?.education_field || "Not specified"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Preferences */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Job Preferences</h3>
          {editingSection !== "jobPreferences" && (
            <button
              onClick={() => startEditingSection("jobPreferences")}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Preferred Salary Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              {editingSection === "jobPreferences" ? (
                <>
                  <input
                    type="number"
                    value={formData.preferred_salary_min || ""}
                    onChange={(e) => handleInputChange("preferred_salary_min", parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={formData.preferred_salary_max || ""}
                    onChange={(e) => handleInputChange("preferred_salary_max", parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="Max"
                  />
                </>
              ) : (
                <p className="text-slate-900 dark:text-slate-100 col-span-2">
                  {candidateProfile?.preferred_salary_min && candidateProfile?.preferred_salary_max
                    ? `$${candidateProfile.preferred_salary_min.toLocaleString()} - $${candidateProfile.preferred_salary_max.toLocaleString()}`
                    : "Not specified"}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium font-extrabold text-slate-700 dark:text-slate-300 mb-1">
              Work Type Preference
            </label>
            {editingSection === "jobPreferences" ? (
              <select
                value={formData.work_type_preference || ""}
                onChange={(e) => handleInputChange("work_type_preference", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Select preference</option>
                {WORK_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            ) : (
              <p className="text-slate-900 dark:text-slate-100">
                {candidateProfile?.work_type_preference || "Not specified"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Availability
            </label>
            {editingSection === "jobPreferences" ? (
              <input
                type="text"
                value={formData.availability || ""}
                onChange={(e) => handleInputChange("availability", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="e.g. Immediate, 2 weeks notice"
              />
            ) : (
              <p className="text-slate-900 dark:text-slate-100">
                {candidateProfile?.availability || "Not specified"}
              </p>
            )}
          </div>
        </div>
        {editingSection === "jobPreferences" && (
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={cancelEditing}
              disabled={isSaving}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={() => saveSection("jobPreferences")}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Portfolio & Links */}
      <div className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Portfolio & Links</h3>
          {editingSection !== "portfolio" && (
            <button
              onClick={() => startEditingSection("portfolio")}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4">
          {/* <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Portfolio URL
            </label>
            {editingSection === "portfolio" ? (
              <input
                type="url"
                value={formData.portfolio_url || ""}
                onChange={(e) => handleInputChange("portfolio_url", e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="https://yourportfolio.com"
              />
            ) : (
              <p className="text-slate-900 dark:text-slate-100">
                {candidateProfile?.portfolio_url ? (
                  <a href={candidateProfile.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {candidateProfile.portfolio_url}
                  </a>
                ) : "Not specified"}
              </p>
            )}
          </div> */}
          <div>

            {editingSection === "portfolio" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Portfolio URL
                    </label>
                    <input
                      type="url"
                      value={formData.portfolio_url || ""}
                      onChange={(e) => handleInputChange("portfolio_url", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={formData.linkedin_url || ""}
                      onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>
                
                {/* Section Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={cancelEditing}
                    disabled={isSaving}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={() => saveSection("portfolio")}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Portfolio URL
                  </label>
                  <p className="text-slate-900 dark:text-slate-100">
                    {candidateProfile?.portfolio_url ? (
                      <a href={candidateProfile.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {candidateProfile.portfolio_url}
                      </a>
                    ) : "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    LinkedIn URL
                  </label>
                  <p className="text-slate-900 dark:text-slate-100">
                    {candidateProfile?.linkedin_url ? (
                      <a href={candidateProfile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {candidateProfile.linkedin_url}
                      </a>
                    ) : "Not specified"}
                  </p>
                </div>
              </div>
            )}
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

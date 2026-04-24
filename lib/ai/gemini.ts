import { generateVoicePrompt, type VoicePromptResponse } from "@/lib/api/profile";

export async function generateSpeakingPrompt(): Promise<VoicePromptResponse> {
  try {
    const response = await generateVoicePrompt();
    return response;
  } catch (error) {
    console.error('Error generating voice prompt:', error);
    // Fallback to static prompts if API fails
    const fallbackPrompt = getFallbackPrompt();
    return {
      message: 'Using fallback prompt',
      prompt: fallbackPrompt,
      word_count: fallbackPrompt.split(' ').length,
      estimated_duration_seconds: Math.ceil(fallbackPrompt.split(' ').length / 2.5) // Average speaking speed
    };
  }
}

function getFallbackPrompt(): string {
  const fallbackPrompts = [
    "I am passionate about technology and enjoy solving complex problems through innovative solutions.",
    "Throughout my career, I have consistently demonstrated strong communication skills and adaptability.",
    "My approach to work combines analytical thinking with creative problem-solving.",
    "I am dedicated to delivering high-quality results and take pride in my attention to detail.",
    "With a strong foundation in my field, I am eager to apply my skills to challenging projects."
  ];
  
  return fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
}


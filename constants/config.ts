import Constants from 'expo-constants';

export const OPENAI_API_KEY = 
  process.env.EXPO_PUBLIC_OPENAI_API_KEY;
export const ELEVEN_LABS_API_KEY = 
  process.env.EXPO_PUBLIC_ELEVEN_LABS_API_KEY;
  
  console.log('[Config] Environment check:', {
  hasOpenAIKey: !!OPENAI_API_KEY,
  openAIKeyLength: OPENAI_API_KEY.length,
  hasElevenLabsKey: !!ELEVEN_LABS_API_KEY,
  elevenLabsKeyLength: ELEVEN_LABS_API_KEY.length,
});

export const ELEVEN_LABS_VOICES = {
  en: 'dNRYyzNgFzPG20ytwO6Z',
  ja: '2RDgfQpBoY6uQtJmOjEQ',
  ko: '2RDgfQpBoY6uQtJmOjEQ',
  'zh-TW': '2RDgfQpBoY6uQtJmOjEQ',
  es: 'dNRYyzNgFzPG20ytwO6Z',
  it: 'dNRYyzNgFzPG20ytwO6Z',
} as const;

export const OPENAI_REALTIME_VOICES = {
  en: 'shimmer' as const,
  ja: 'ballad' as const,
} as const;

export const OPENAI_FEMALE_VOICES = ['alloy', 'shimmer', 'coral'] as const;
export const OPENAI_MALE_VOICES = ['echo', 'ash'] as const;
export const OPENAI_ALL_VOICES = ['alloy', 'ash', 'coral', 'echo', 'shimmer'] as const;

export const OPENAI_API_URL = 'https://api.openai.com/v1';
export const ELEVEN_LABS_API_URL = 'https://api.elevenlabs.io/v1';
export const ELEVEN_LABS_VOICE_ID = 
  process.env.EXPO_PUBLIC_ELEVEN_LABS_VOICE_ID ||
  Constants.expoConfig?.extra?.ELEVEN_LABS_VOICE_ID ||
  ELEVEN_LABS_VOICES.en;

export const PROJECT_ID = 'v1vlm2bs3ghg2a069f3qe';

export const WELCOME_AUDIO_URLS = {
  en_first: 'https://hvuwfvxedfrmynqnriza.supabase.co/storage/v1/object/public/Tomo%20Voice/Tomo%20English/Welcome%20Message%201_Tomo%20American%20Female%20(new).mp3',
  en_morning: 'https://hvuwfvxedfrmynqnriza.supabase.co/storage/v1/object/public/Tomo%20Voice/Tomo%20English/Morning%20Message_Demo.mp3',
  en_afternoon: 'https://hvuwfvxedfrmynqnriza.supabase.co/storage/v1/object/public/Tomo%20Voice/Tomo%20English/After%20Message_Demo.mp3',
  en_evening: 'https://hvuwfvxedfrmynqnriza.supabase.co/storage/v1/object/public/Tomo%20Voice/Tomo%20English/Evening%20Message_Demo.mp3',
  ja_first: 'https://hvuwfvxedfrmynqnriza.supabase.co/storage/v1/object/public/Tomo%20Voice/Tomo%20Japanese/Welcome%201st%20Message%20-%20Tomo%20Japanese.mp3',
  ja_morning: 'https://hvuwfvxedfrmynqnriza.supabase.co/storage/v1/object/public/Tomo%20Voice/Tomo%20Japanese/Morning%20Message%20-%20Tomo%20Japanese.mp3',
  ja_afternoon: 'https://hvuwfvxedfrmynqnriza.supabase.co/storage/v1/object/public/Tomo%20Voice/Tomo%20Japanese/Welcome%201st%20Message%20-%20Tomo%20Japanese.mp3',
  ja_evening: 'https://hvuwfvxedfrmynqnriza.supabase.co/storage/v1/object/public/Tomo%20Voice/Tomo%20Japanese/Evening%20Message%20-%20Tomo%20Japanese.mp3',
  zh_first: '',
  zh_morning: '',
  zh_afternoon: '',
  zh_evening: '',
  it_first: '',
  it_morning: '',
  it_afternoon: '',
  it_evening: '',
  es_first: '',
  es_morning: '',
  es_afternoon: '',
  es_evening: '',
  ko_first: '',
  ko_morning: '',
  ko_afternoon: '',
  ko_evening: '',
} as const;

export const FEATURE_AUDIO_URLS = {
  en: {
    daily: 'https://hvuwfvxedfrmynqnriza.supabase.co/storage/v1/object/public/Tomo%20Voice/Tomo%20English/Tomo%20Features/ElevenLabs_2025-11-08T14_04_32_Tomo%20American%20Female%20(new)_gen_sp100_s50_sb75_v3.mp3',
    coordination: 'https://hvuwfvxedfrmynqnriza.supabase.co/storage/v1/object/public/Tomo%20Voice/Tomo%20English/Tomo%20Features/ElevenLabs_2025-11-08T14_07_23_Tomo%20American%20Female%20(new)_gen_sp100_s50_sb75_v3.mp3',
    health: 'https://hvuwfvxedfrmynqnriza.supabase.co/storage/v1/object/public/Tomo%20Voice/Tomo%20English/Tomo%20Features/ElevenLabs_2025-11-08T14_07_23_Tomo%20American%20Female%20(new)_gen_sp100_s50_sb75_v3.mp3',
    guardian: 'https://hvuwfvxedfrmynqnriza.supabase.co/storage/v1/object/public/Tomo%20Voice/Tomo%20English/Tomo%20Features/ElevenLabs_2025-11-08T14_11_41_Tomo%20American%20Female%20(new)_gen_sp100_s50_sb75_v3.mp3',
    social: 'https://hvuwfvxedfrmynqnriza.supabase.co/storage/v1/object/public/Tomo%20Voice/Tomo%20English/Tomo%20Features/ElevenLabs_2025-11-08T14_13_08_Tomo%20American%20Female%20(new)_gen_sp100_s50_sb75_v3.mp3',
    cognitive: 'https://hvuwfvxedfrmynqnriza.supabase.co/storage/v1/object/public/Tomo%20Voice/Tomo%20English/Tomo%20Features/ElevenLabs_2025-11-08T14_14_31_Tomo%20American%20Female%20(new)_gen_sp100_s50_sb75_v3.mp3',
    wellness: 'https://hvuwfvxedfrmynqnriza.supabase.co/storage/v1/object/public/Tomo%20Voice/Tomo%20English/Tomo%20Features/ElevenLabs_2025-11-08T14_15_35_Tomo%20American%20Female%20(new)_gen_sp100_s50_sb75_v3.mp3',
    spiritual: 'https://hvuwfvxedfrmynqnriza.supabase.co/storage/v1/object/public/Tomo%20Voice/Tomo%20English/Tomo%20Features/ElevenLabs_2025-11-08T14_16_19_Tomo%20American%20Female%20(new)_gen_sp100_s50_sb75_v3.mp3',
  },
  ja: {
    daily: '',
    coordination: '',
    health: '',
    guardian: '',
    social: '',
    cognitive: '',
    wellness: '',
    spiritual: '',
  },
  zh: {
    daily: '',
    coordination: '',
    health: '',
    guardian: '',
    social: '',
    cognitive: '',
    wellness: '',
    spiritual: '',
  },
  it: {
    daily: '',
    coordination: '',
    health: '',
    guardian: '',
    social: '',
    cognitive: '',
    wellness: '',
    spiritual: '',
  },
  es: {
    daily: '',
    coordination: '',
    health: '',
    guardian: '',
    social: '',
    cognitive: '',
    wellness: '',
    spiritual: '',
  },
  ko: {
    daily: '',
    coordination: '',
    health: '',
    guardian: '',
    social: '',
    cognitive: '',
    wellness: '',
    spiritual: '',
  },
} as const;



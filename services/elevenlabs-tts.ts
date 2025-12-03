import { Audio } from 'expo-av';
import { ELEVEN_LABS_API_KEY, ELEVEN_LABS_API_URL, ELEVEN_LABS_VOICE_ID, ELEVEN_LABS_VOICES } from '@/constants/config';

export interface TTSOptions {
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
  language?: string;
}

export async function textToSpeech(
  text: string,
  options: TTSOptions = {}
): Promise<string> {
  try {
    console.log('[Eleven Labs TTS] Converting text to speech:', text, 'Language:', options.language);

    let defaultVoiceId = ELEVEN_LABS_VOICE_ID;
    if (options.language && options.language in ELEVEN_LABS_VOICES) {
      defaultVoiceId = ELEVEN_LABS_VOICES[options.language as keyof typeof ELEVEN_LABS_VOICES];
      console.log('[Eleven Labs TTS] Using voice ID for language:', options.language, '-> Voice ID:', defaultVoiceId);
    }

    const {
      voiceId = defaultVoiceId,
      stability = 0.5,
      similarityBoost = 0.75,
      style = 0,
      useSpeakerBoost = true,
    } = options;

    const response = await fetch(
      `${ELEVEN_LABS_API_URL}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVEN_LABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: useSpeakerBoost,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Eleven Labs API error: ${response.status} - ${errorText}`);
    }

    const audioBlob = await response.blob();
    console.log('[Eleven Labs TTS] Audio generated, size:', audioBlob.size);

    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
    });

    reader.readAsDataURL(audioBlob);
    const base64Audio = await base64Promise;

    return base64Audio;
  } catch (error) {
    console.error('[Eleven Labs TTS] Error:', error);
    throw error;
  }
}

export async function playAudio(audioBase64: string): Promise<Audio.Sound> {
  try {
    console.log('[Audio Player] Loading audio...');

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    const { sound } = await Audio.Sound.createAsync(
      { uri: audioBase64 },
      { shouldPlay: true }
    );

    console.log('[Audio Player] Playing audio...');

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        if (status.didJustFinish) {
          console.log('[Audio Player] Playback finished');
          sound.unloadAsync();
        }
      }
    });

    return sound;
  } catch (error) {
    console.error('[Audio Player] Error:', error);
    throw error;
  }
}

export async function getVoices(): Promise<any[]> {
  try {
    console.log('[Eleven Labs] Fetching available voices...');

    const response = await fetch(`${ELEVEN_LABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVEN_LABS_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Eleven Labs API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[Eleven Labs] Voices fetched:', data.voices?.length || 0);

    return data.voices || [];
  } catch (error) {
    console.error('[Eleven Labs] Error fetching voices:', error);
    throw error;
  }
}

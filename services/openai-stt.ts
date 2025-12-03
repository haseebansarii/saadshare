import { Platform } from 'react-native';
import { OPENAI_API_KEY, OPENAI_API_URL } from '@/constants/config';
import { Audio } from 'expo-av';

export interface TranscriptionResult {
  text: string;
  language?: string;
}

interface WebRecording {
  mediaRecorder: MediaRecorder;
  stream: MediaStream;
  chunks: Blob[];
  analyser: AnalyserNode | null;
  dataArray: Uint8Array | null;
}

let webRecording: WebRecording | null = null;

export async function transcribeAudio(audioUri: string, language?: string): Promise<TranscriptionResult> {
  try {
    console.log('[OpenAI STT] Transcribing audio:', audioUri);

    const formData = new FormData();
    
    if (Platform.OS === 'web') {
      const response = await fetch(audioUri);
      const blob = await response.blob();
      formData.append('file', blob, 'recording.webm');
    } else {
      const uriParts = audioUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      formData.append('file', {
        uri: audioUri,
        name: `recording.${fileType}`,
        type: `audio/${fileType}`,
      } as any);
    }
    
    formData.append('model', 'whisper-1');
    if (language) {
      formData.append('language', language);
    }

    const response = await fetch(`${OPENAI_API_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[OpenAI STT] Transcription result:', data.text);

    return {
      text: data.text,
      language: data.language,
    };
  } catch (error) {
    console.error('[OpenAI STT] Transcription error:', error);
    throw error;
  }
}

export async function startRecording(): Promise<Audio.Recording | WebRecording> {
  if (Platform.OS === 'web') {
    return startWebRecording();
  }
  
  try {
    console.log('[Audio] Platform:', Platform.OS);
    console.log('[Audio] Checking permissions...');
    const { status } = await Audio.getPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('[Audio] Permission not granted, requesting...');
      const permission = await Audio.requestPermissionsAsync();
      console.log('[Audio] Permission request result:', permission);
      if (!permission.granted) {
        throw new Error('Microphone permission is required for voice recording');
      }
    }

    console.log('[Audio] Setting audio mode for native...');
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    console.log('[Audio] Creating recording instance...');
    const recording = new Audio.Recording();
    
    console.log('[Audio] Preparing to record...');
    const recordingOptions: any = {
      isMeteringEnabled: true,
      android: {
        extension: '.m4a',
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
      },
      ios: {
        extension: '.wav',
        outputFormat: Audio.IOSOutputFormat.LINEARPCM,
        audioQuality: Audio.IOSAudioQuality.MAX,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
    };

    console.log('[Audio] Recording options prepared:', JSON.stringify(recordingOptions, null, 2));
    await recording.prepareToRecordAsync(recordingOptions);

    console.log('[Audio] Starting recording...');
    await recording.startAsync();
    console.log('[Audio] Recording started successfully');
    
    return recording;
  } catch (error) {
    console.error('[Audio] Error starting recording:', error);
    console.error('[Audio] Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}

async function startWebRecording(): Promise<WebRecording> {
  try {
    console.log('[Audio Web] Requesting microphone access...');
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: false,
        sampleRate: 44100,
      } 
    });
    console.log('[Audio Web] Microphone access granted');

    const audioContext = new AudioContext({ sampleRate: 44100 });
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    source.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';
    console.log('[Audio Web] Using mime type:', mimeType);

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      audioBitsPerSecond: 128000,
    });

    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
        console.log('[Audio Web] Received chunk:', event.data.size, 'bytes');
      }
    };

    mediaRecorder.start(100);
    console.log('[Audio Web] Recording started with proper audio analysis');

    webRecording = {
      mediaRecorder,
      stream,
      chunks,
      analyser,
      dataArray,
    };

    return webRecording;
  } catch (error) {
    console.error('[Audio Web] Error starting recording:', error);
    throw error;
  }
}

export async function stopRecording(recording: Audio.Recording | WebRecording): Promise<string> {
  if (Platform.OS === 'web' && webRecording) {
    return stopWebRecording();
  }
  
  try {
    console.log('[Audio] Stopping recording...');
    await (recording as Audio.Recording).stopAndUnloadAsync();
    
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    
    const uri = (recording as Audio.Recording).getURI();
    console.log('[Audio] Recording stopped, URI:', uri);
    
    if (!uri) {
      throw new Error('Recording URI is null');
    }
    
    return uri;
  } catch (error) {
    console.error('[Audio] Error stopping recording:', error);
    throw error;
  }
}

async function stopWebRecording(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!webRecording) {
      reject(new Error('No web recording in progress'));
      return;
    }

    const { mediaRecorder, stream, chunks } = webRecording;

    mediaRecorder.onstop = () => {
      console.log('[Audio Web] Recording stopped, creating blob...');
      const blob = new Blob(chunks, { type: 'audio/webm' });
      console.log('[Audio Web] Blob created:', blob.size, 'bytes');
      
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('[Audio Web] Track stopped');
      });

      const url = URL.createObjectURL(blob);
      console.log('[Audio Web] Blob URL created:', url);
      webRecording = null;
      resolve(url);
    };

    mediaRecorder.onerror = (error) => {
      console.error('[Audio Web] MediaRecorder error:', error);
      stream.getTracks().forEach(track => track.stop());
      webRecording = null;
      reject(error);
    };

    mediaRecorder.stop();
  });
}

export function getWebAudioLevel(): number {
  if (!webRecording || !webRecording.analyser || !webRecording.dataArray) {
    return -160;
  }

  webRecording.analyser.getByteTimeDomainData(webRecording.dataArray as any);
  
  let sum = 0;
  for (let i = 0; i < webRecording.dataArray.length; i++) {
    const normalized = (webRecording.dataArray[i] - 128) / 128;
    sum += normalized * normalized;
  }
  
  const rms = Math.sqrt(sum / webRecording.dataArray.length);
  
  if (rms < 0.001) {
    return -160;
  }
  
  const db = 20 * Math.log10(rms);
  
  return Math.max(Math.min(db, 0), -160);
}

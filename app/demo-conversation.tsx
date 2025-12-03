import { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { spacing } from '@/constants/colors';
import { OPENAI_API_KEY } from '@/constants/config'; 
import { textToSpeech } from '@/services/elevenlabs-tts';

export default function DemoConversationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState('Initializing...');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const orbScale = useRef(new Animated.Value(1)).current;
  const innerPulse = useRef(new Animated.Value(1)).current;
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessingRef = useRef(false);
  const monitoringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSpeakingRef = useRef(false);
  
  // Voice activity detection state
  const vadHistoryRef = useRef<number[]>([]);
  const speechDetectionCountRef = useRef(0);
  const noiseFloorRef = useRef<number>(-60); // Dynamic noise floor
  const lastSpeechTimeRef = useRef<number>(0);

  // Initialize audio permissions
  useEffect(() => {
    initAudio();
    return () => {
      cleanup();
    };
  }, []);

  // Animated orb effects
  useEffect(() => {
    if (isListening || isSpeaking) {
      const outerPulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1500,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: true,
          }),
        ])
      );

      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.6,
            duration: 1200,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.2,
            duration: 1200,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: true,
          }),
        ])
      );

      const innerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(innerPulse, {
            toValue: 1.08,
            duration: 800,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
          }),
          Animated.timing(innerPulse, {
            toValue: 1,
            duration: 800,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
          }),
        ])
      );

      const scaleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(orbScale, {
            toValue: 1.05,
            duration: 2000,
            easing: Easing.bezier(0.4, 0.0, 0.6, 1),
            useNativeDriver: true,
          }),
          Animated.timing(orbScale, {
            toValue: 0.98,
            duration: 2000,
            easing: Easing.bezier(0.4, 0.0, 0.6, 1),
            useNativeDriver: true,
          }),
        ])
      );

      outerPulse.start();
      glowAnimation.start();
      innerAnimation.start();
      scaleAnimation.start();

      return () => {
        outerPulse.stop();
        glowAnimation.stop();
        innerAnimation.stop();
        scaleAnimation.stop();
      };
    } else {
      Animated.parallel([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.3,
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(orbScale, {
          toValue: 1,
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(innerPulse, {
          toValue: 1,
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isListening, isSpeaking, pulseAnim, glowOpacity, orbScale, innerPulse]);

  const cleanup = async () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (monitoringIntervalRef.current) clearInterval(monitoringIntervalRef.current);
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (e) {}
    }
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch (e) {}
    }
    
    // Reset VAD state
    vadHistoryRef.current = [];
    speechDetectionCountRef.current = 0;
    noiseFloorRef.current = -60;
    lastSpeechTimeRef.current = 0;
  };

  const initAudio = async () => {
    try {
      const { status: permStatus } = await Audio.requestPermissionsAsync();
      if (permStatus !== 'granted') {
        setStatus('Microphone permission denied');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      setStatus('Ready');
      startListening();
    } catch (error) {
      console.error('[Init Error]', error);
      setStatus('Error: ' + (error as Error).message);
    }
  };

  const startListening = async () => {
    if (isProcessingRef.current) return;
    
    try {
      setStatus('Ready - Say something...');

      const recording = new Audio.Recording();
      
      // Use simpler iOS configuration
      const recordingOptions = {
        isMeteringEnabled: true,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };

      await recording.prepareToRecordAsync(recordingOptions);
      console.log('[Recording] Prepared successfully');
      
      await recording.startAsync();
      console.log('[Recording] Started successfully');
      
      recordingRef.current = recording;
      isSpeakingRef.current = false;

      // Monitor audio levels for voice activity with improved detection
      monitoringIntervalRef.current = setInterval(async () => {
        if (!recordingRef.current) return;

        try {
          const status = await recordingRef.current.getStatusAsync();
          if (status.isRecording && status.metering !== undefined) {
            const metering = status.metering;
            const currentTime = Date.now();
            
            // Update VAD history (keep last 10 readings for analysis)
            vadHistoryRef.current.push(metering);
            if (vadHistoryRef.current.length > 10) {
              vadHistoryRef.current.shift();
            }

            // Update dynamic noise floor (adapt to environment) - more conservative
            if (vadHistoryRef.current.length >= 8) {
              const sortedHistory = [...vadHistoryRef.current].sort((a, b) => a - b);
              // Use lower quartile instead of median for noise floor
              const lowerQuartile = sortedHistory[Math.floor(sortedHistory.length * 0.25)];
              noiseFloorRef.current = Math.max(noiseFloorRef.current * 0.98 + lowerQuartile * 0.02, -80);
            }

            // Enhanced speech detection logic with balanced thresholds
            const speechThreshold = Math.max(noiseFloorRef.current + 12, -50); // 12dB above noise floor, min -50dB
            const minSpeechLevel = -55; // More sensitive minimum for speech
            const maxNoiseLevel = -25; // Higher ceiling to allow louder speech
            
            // Check if current level indicates speech
            const isSpeechLevel = metering > speechThreshold && metering > minSpeechLevel;
            
            // Analyze recent history for speech patterns (more lenient)
            const recentHighLevels = vadHistoryRef.current.filter(level => 
              level > speechThreshold && level > minSpeechLevel
            ).length;
            
            // Log all audio levels for debugging
            // console.log('[VAD Debug] Level:', metering.toFixed(1), 'Threshold:', speechThreshold.toFixed(1), 'Noise Floor:', noiseFloorRef.current.toFixed(1), 'Recent High:', recentHighLevels);
            
            // Speech detection with more balanced pattern analysis
            if (isSpeechLevel && recentHighLevels >= 2) {
              speechDetectionCountRef.current++;
              
              // Require less sustained detection for initial trigger
              if (speechDetectionCountRef.current >= 2 && !isSpeakingRef.current) {
                isSpeakingRef.current = true;
                setIsListening(true);
                setStatus('Listening...');
                lastSpeechTimeRef.current = currentTime;
                console.log('[VAD] Speech detected - Level:', metering, 'Threshold:', speechThreshold, 'Noise Floor:', noiseFloorRef.current);
              }
              
              // Reset silence timer while speaking
              if (isSpeakingRef.current) {
                lastSpeechTimeRef.current = currentTime;
                if (silenceTimerRef.current) {
                  clearTimeout(silenceTimerRef.current);
                }
                
                // Set silence timer (1.5 seconds of silence to stop)
                silenceTimerRef.current = setTimeout(() => {
                  if (isSpeakingRef.current) {
                    console.log('[VAD] Silence detected');
                    stopListeningAndProcess();
                  }
                }, 1500);
              }
            } else {
              // More gradual reset of speech detection counter
              if (speechDetectionCountRef.current > 0 && !isSpeechLevel) {
                speechDetectionCountRef.current = Math.max(0, speechDetectionCountRef.current - 1);
              }
              
              // Only log very loud background noise
              if (metering > -25 && !isSpeechLevel) {
                console.log('[VAD] Loud noise detected (ignored) - Level:', metering, 'Type: Likely background noise');
              }
            }
          }
        } catch (error) {
          console.error('[VAD Error]', error);
        }
      }, 150); // Check every 150ms (slightly less frequent to reduce processing)

    } catch (error) {
      console.error('[Recording Error]', error);
      console.error('[Recording Error Details]', JSON.stringify(error));
      setStatus('Recording failed: ' + (error as Error).message);
      setIsListening(false);
      
      // Retry after a moment
      setTimeout(() => {
        console.log('[Recording] Retrying...');
        if (!isProcessingRef.current) {
          startListening();
        }
      }, 2000);
    }
  };

  const stopListeningAndProcess = async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      setIsListening(false);
      setIsProcessing(true);
      setStatus('Processing...');

      // Stop monitoring
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
        monitoringIntervalRef.current = null;
      }

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      // Reset VAD counters
      speechDetectionCountRef.current = 0;
      vadHistoryRef.current = [];

      const recording = recordingRef.current;
      if (!recording) {
        isProcessingRef.current = false;
        isSpeakingRef.current = false;
        startListening();
        return;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;
      isSpeakingRef.current = false;

      if (!uri) {
        isProcessingRef.current = false;
        startListening();
        return;
      }

      // Send to API
      const transcript = await sendAudioToAPI(uri);
      
      if (!transcript || transcript.trim().length === 0 || transcript.trim().length < 3) {
        console.log('[Transcript] Empty, too short, or no speech detected:', transcript);
        isProcessingRef.current = false;
        startListening();
        return;
      }

      // Additional filter for common noise transcriptions
      const noisePatterns = [
        /^[.,-\s]*$/,  // Just punctuation and spaces
        /^(uh|um|hmm|ah|eh)[\s.,-]*$/i,  // Common filler sounds
        /^[a-z]{1,2}[\s.,-]*$/i,  // Very short single letters
        /^\d+[\s.,-]*$/,  // Just numbers (often from noise)
        /^(the|a|an|and|or|but|in|on|at|to|for|of|with|by)[\s.,-]*$/i,  // Single common words
      ];
      
      if (noisePatterns.some(pattern => pattern.test(transcript.trim()))) {
        console.log('[Transcript] Filtered out noise/gibberish:', transcript);
        isProcessingRef.current = false;
        startListening();
        return;
      }

      console.log('[Transcript]', transcript);

      // Play response
      setIsProcessing(false);
      await playResponse(transcript);

      // Restart listening loop
      isProcessingRef.current = false;
      startListening();

    } catch (error) {
      console.error('[Processing Error]', error);
      isProcessingRef.current = false;
      isSpeakingRef.current = false;
      setStatus('Error - Retrying...');
      setTimeout(() => startListening(), 1000);
    }
  };

  const sendAudioToAPI = async (audioUri: string): Promise<string> => {
    try {
      // Step 1: Transcribe audio with Whisper
      const formData = new FormData();
      const uriParts = audioUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      formData.append('file', {
        uri: audioUri,
        name: `recording.${fileType}`,
        type: `audio/${fileType}`,
      } as any);
      
      formData.append('model', 'whisper-1');

      const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData,
      });

      const transcriptionData = await transcriptionResponse.json();
      const userText = transcriptionData.text || '';
      
      if (!userText) return '';
      
      console.log('[User said]', userText);

      // Step 2: Get response from ChatGPT
      const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful voice assistant. Keep responses brief and conversational.'
            },
            {
              role: 'user',
              content: userText
            }
          ],
        }),
      });

      const chatData = await chatResponse.json();
      const aiResponse = chatData.choices?.[0]?.message?.content || '';
      
      console.log('[AI response]', aiResponse);
      return aiResponse;
    } catch (error) {
      console.error('[API Error]', error);
      return '';
    }
  };

  const playResponse = async (text: string) => {
    try {
      setIsSpeaking(true);
      setStatus('Speaking...');

      // Generate TTS
      const audioUri = await textToSpeech(text);
      
      // Play audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      soundRef.current = sound;

      // Wait for playback to finish
      return new Promise<void>((resolve) => {
        sound.setOnPlaybackStatusUpdate((stat) => {
          if (stat.isLoaded && stat.didJustFinish) {
            setIsSpeaking(false);
            sound.unloadAsync();
            soundRef.current = null;
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('[TTS Error]', error);
      setIsSpeaking(false);
    }
  };

  const getOrbColors = (): [string, string, string] => {
    if (isListening) return ['#FF8A80', '#FF6B6B', '#8B4A6F'];
    if (isSpeaking) return ['#66BB6A', '#4CAF50', '#388E3C'];
    if (isProcessing) return ['#FFA726', '#FF9800', '#F57C00'];
    return ['#FF8A80', '#FF6B6B', '#8B4A6F'];
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <LinearGradient
          colors={['#0A0B1E', '#1A1B2E']}
          style={StyleSheet.absoluteFill}
        />
        
        <View style={[styles.header, { top: insets.top + spacing.md }]}>
          <TouchableOpacity
            onPress={() => {
              cleanup();
              router.back();
            }}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <X size={24} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.statusText}>{status}</Text>
          
          <View style={styles.orbContainer}>
            <Animated.View
              style={[
                styles.orbGlow,
                {
                  opacity: glowOpacity,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={getOrbColors()}
                style={styles.orbGlowGradient}
              />
            </Animated.View>
            
            <Animated.View
              style={[
                styles.orbGlow2,
                {
                  opacity: (isListening || isSpeaking) ? 0.2 : 0.1,
                  transform: [{ scale: Animated.multiply(pulseAnim, 0.85) }],
                },
              ]}
            >
              <LinearGradient
                colors={getOrbColors()}
                style={styles.orbGlowGradient}
              />
            </Animated.View>
            
            <Animated.View
              style={[
                styles.orb,
                {
                  transform: [{ scale: Animated.multiply(orbScale, innerPulse) }],
                },
              ]}
            >
              <LinearGradient
                colors={getOrbColors()}
                style={styles.orbGradient}
              />
            </Animated.View>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    zIndex: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  content: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  statusText: {
    fontSize: 28,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center' as const,
    marginBottom: spacing.xl * 2,
    lineHeight: 36,
    paddingHorizontal: spacing.lg,
  },
  orbContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: '100%',
    height: Math.min(Dimensions.get('window').width * 0.85, 340),
  },
  orbGlow: {
    position: 'absolute' as const,
    width: Math.min(Dimensions.get('window').width * 0.85, 340),
    height: Math.min(Dimensions.get('window').width * 0.85, 340),
    borderRadius: Math.min(Dimensions.get('window').width * 0.85, 340) / 2,
  },
  orbGlow2: {
    position: 'absolute' as const,
    width: Math.min(Dimensions.get('window').width * 0.95, 380),
    height: Math.min(Dimensions.get('window').width * 0.95, 380),
    borderRadius: Math.min(Dimensions.get('window').width * 0.95, 380) / 2,
  },
  orbGlowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: Math.min(Dimensions.get('window').width * 0.85, 340) / 2,
  },
  orb: {
    width: Math.min(Dimensions.get('window').width * 0.55, 220),
    height: Math.min(Dimensions.get('window').width * 0.55, 220),
    borderRadius: Math.min(Dimensions.get('window').width * 0.55, 220) / 2,
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: Math.min(Dimensions.get('window').width * 0.55, 220) / 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});

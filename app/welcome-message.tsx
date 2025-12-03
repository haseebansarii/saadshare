import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Text,
  Dimensions,
  Easing,
  ScrollView,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';

import { spacing } from '@/constants/colors';
import { WELCOME_AUDIO_URLS, FEATURE_AUDIO_URLS } from '@/constants/config';

const FEATURES = [
  { key: 'daily', en: 'Daily Conversation', ja: '日常会話', zh: '日常對話', it: 'Conversazione Quotidiana', es: 'Conversación Diaria', ko: '일상 대화' },
  { key: 'coordination', en: 'Communication Coordination', ja: 'コミュニケーション調整', zh: '溝通協調', it: 'Coordinamento della Comunicazione', es: 'Coordinación de Comunicación', ko: '소통 조정' },
  { key: 'health', en: 'Health Monitoring', ja: '健康モニタリング', zh: '健康監測', it: 'Monitoraggio della Salute', es: 'Monitoreo de Salud', ko: '건강 모니터링' },
  { key: 'guardian', en: 'Guardian Mode', ja: '見守りモード', zh: '守護模式', it: 'Modalità Custode', es: 'Modo Guardián', ko: '보호자 모드' },
  { key: 'social', en: 'Social Engagement', ja: '社会的関与', zh: '社交參與', it: 'Coinvolgimento Sociale', es: 'Compromiso Social', ko: '사회적 참여' },
  { key: 'cognitive', en: 'Cognitive Stimulation', ja: '認知刺激', zh: '認知刺激', it: 'Stimolazione Cognitiva', es: 'Estimulación Cognitiva', ko: '인지 자극' },
  { key: 'wellness', en: 'Wellness Encouragement', ja: 'ウェルネス奨励', zh: '健康鼓勵', it: 'Incoraggiamento al Benessere', es: 'Estímulo de Bienestar', ko: '웰빙 격려' },
  { key: 'spiritual', en: 'Spiritual Support', ja: '精神的サポート', zh: '精神支持', it: 'Supporto Spirituale', es: 'Apoyo Espiritual', ko: '영적 지원' },
];

export default function WelcomeMessageScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ language?: string }>();
  const insets = useSafeAreaInsets();
  const [language] = useState<'en' | 'ja' | 'zh' | 'it' | 'es' | 'ko'>((params.language as 'en' | 'ja' | 'zh' | 'it' | 'es' | 'ko') || 'en');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const orbScale = useRef(new Animated.Value(1)).current;
  const innerPulse = useRef(new Animated.Value(1)).current;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const hasPlayedWelcomeRef = useRef(false);
  const welcomeSoundRef = useRef<Audio.Sound | null>(null);
  const featureSoundRef = useRef<Audio.Sound | null>(null);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(-1);
  const featureOpacities = useRef(FEATURES.map(() => new Animated.Value(0))).current;
  const featureScales = useRef(FEATURES.map(() => new Animated.Value(0.8))).current;
  const isPlayingFeaturesRef = useRef(false);

  console.log('[WelcomeMessage] Language:', language);



  useEffect(() => {
    if (isSpeaking) {
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
  }, [isSpeaking, pulseAnim, glowOpacity, orbScale, innerPulse]);

  const getOrbColors = (): [string, string, string] => {
    return ['#FF8A80', '#FF6B6B', '#8B4A6F'];
  };

  const playFeatureAudio = useCallback(async (featureIndex: number) => {
    if (featureIndex >= FEATURES.length) {
      console.log('[WelcomeMessage] All features played');
      setIsSpeaking(false);
      isPlayingFeaturesRef.current = false;
      return;
    }

    const feature = FEATURES[featureIndex];
    const audioUrl = FEATURE_AUDIO_URLS[language][feature.key as keyof typeof FEATURE_AUDIO_URLS.en];

    if (!audioUrl || audioUrl.trim() === '') {
      console.log(`[WelcomeMessage] No audio for feature ${feature.key}, showing feature and moving to next`);
      setCurrentFeatureIndex(featureIndex);
      setTimeout(() => playFeatureAudio(featureIndex + 1), 1500);
      return;
    }

    try {
      console.log(`[WelcomeMessage] Playing feature ${feature.key} audio from URL:`, audioUrl);
      setCurrentFeatureIndex(featureIndex);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: 1,
        shouldDuckAndroid: false,
        interruptionModeAndroid: 1,
        playThroughEarpieceAndroid: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false }
      );

      featureSoundRef.current = sound;

      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        console.log(`[WelcomeMessage] Feature ${feature.key} loaded successfully, starting playback`);
        await sound.playAsync();
      } else {
        throw new Error('Feature audio failed to load');
      }

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if ('error' in status && status.error) {
            console.error('[WelcomeMessage] Feature audio error:', status.error);
            sound.unloadAsync();
            featureSoundRef.current = null;
            setTimeout(() => playFeatureAudio(featureIndex + 1), 100);
            return;
          }
          if (status.didJustFinish) {
            console.log(`[WelcomeMessage] Feature ${feature.key} finished, moving to next`);
            sound.unloadAsync();
            featureSoundRef.current = null;
            setTimeout(() => playFeatureAudio(featureIndex + 1), 500);
          }
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[WelcomeMessage] Error playing feature ${feature.key}:`, errorMessage);
      if (featureSoundRef.current) {
        await featureSoundRef.current.unloadAsync();
        featureSoundRef.current = null;
      }
      setTimeout(() => playFeatureAudio(featureIndex + 1), 100);
    }
  }, [language]);

  const playWelcomeAudio = useCallback(async () => {
    if (hasPlayedWelcomeRef.current) {
      console.log('[WelcomeMessage] Welcome audio already played');
      return;
    }

    const welcomeAudioUri = (() => {
      switch (language) {
        case 'en': return WELCOME_AUDIO_URLS.en_first;
        case 'ja': return WELCOME_AUDIO_URLS.ja_first;
        case 'zh': return WELCOME_AUDIO_URLS.zh_first;
        case 'it': return WELCOME_AUDIO_URLS.it_first;
        case 'es': return WELCOME_AUDIO_URLS.es_first;
        case 'ko': return WELCOME_AUDIO_URLS.ko_first;
      }
    })();
    
    if (!welcomeAudioUri || welcomeAudioUri.trim() === '') {
      console.log('[WelcomeMessage] No audio URL available for language:', language);
      hasPlayedWelcomeRef.current = true;
      setIsSpeaking(false);
      return;
    }

    try {
      hasPlayedWelcomeRef.current = true;
      console.log('[WelcomeMessage] Playing welcome audio...');
      setIsSpeaking(true);
      setCurrentFeatureIndex(-1);
      
      console.log('[WelcomeMessage] Loading audio from:', welcomeAudioUri);
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: 1,
        shouldDuckAndroid: false,
        interruptionModeAndroid: 1,
        playThroughEarpieceAndroid: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: welcomeAudioUri },
        { shouldPlay: false }
      );

      console.log('[WelcomeMessage] Audio loaded');
      welcomeSoundRef.current = sound;

      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        console.log('[WelcomeMessage] Starting playback');
        await sound.playAsync();
        console.log('[WelcomeMessage] Audio playing');
      } else {
        throw new Error('Audio failed to load properly');
      }

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if ('error' in status && status.error) {
            console.error('[WelcomeMessage] Audio playback error:', status.error);
            setIsSpeaking(false);
            hasPlayedWelcomeRef.current = false;
            sound.unloadAsync();
            return;
          }
          if (status.didJustFinish) {
            console.log('[WelcomeMessage] Welcome audio finished, starting features');
            sound.unloadAsync();
            welcomeSoundRef.current = null;
            if (!isPlayingFeaturesRef.current) {
              isPlayingFeaturesRef.current = true;
              playFeatureAudio(0);
            }
          }
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[WelcomeMessage] Error playing welcome audio:', errorMessage);
      setIsSpeaking(false);
      hasPlayedWelcomeRef.current = false;
    }
  }, [language, playFeatureAudio]);

  useEffect(() => {
    playWelcomeAudio();
  }, [language, playWelcomeAudio]);

  useEffect(() => {
    if (currentFeatureIndex >= 0 && currentFeatureIndex < FEATURES.length) {
      Animated.parallel([
        Animated.timing(featureOpacities[currentFeatureIndex], {
          toValue: 1,
          duration: 400,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.spring(featureScales[currentFeatureIndex], {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();

      if (currentFeatureIndex > 0) {
        Animated.timing(featureOpacities[currentFeatureIndex - 1], {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [currentFeatureIndex, featureOpacities, featureScales]);

  const getStatusText = () => {
    const texts = {
      en: "Hi, I'm Tomō",
      ja: 'こんにちは、私はトモです',
      zh: '你好，我是Tomō',
      it: 'Ciao, sono Tomō',
      es: 'Hola, soy Tomō',
      ko: '안녕하세요, 저는 토모입니다',
    };
    return texts[language];
  };
  
  useEffect(() => {
    return () => {
      if (welcomeSoundRef.current) {
        welcomeSoundRef.current.stopAsync();
        welcomeSoundRef.current.unloadAsync();
      }
      if (featureSoundRef.current) {
        featureSoundRef.current.stopAsync();
        featureSoundRef.current.unloadAsync();
      }
    };
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <LinearGradient
          colors={['#0A0B1E', '#1A1B2E']}
          style={StyleSheet.absoluteFill}
        />
        
        <View style={[styles.header, { top: insets.top + spacing.md }]}>
          <TouchableOpacity
            onPress={() => {
              console.log('[WelcomeMessage] Navigating to demo-conversation with language:', language);
              router.push(`/demo-conversation?language=${language}`);
            }}
            style={styles.languageButton}
            accessibilityRole="button"
            accessibilityLabel="Try conversation demo"
          >
            <Text style={styles.languageFlag}>
              {language === 'en' ? '🇺🇸' : language === 'ja' ? '🇯🇵' : language === 'zh' ? '🇹🇼' : language === 'it' ? '🇮🇹' : language === 'es' ? '🇪🇸' : '🇰🇷'}
            </Text>
            <Text style={styles.languageCode}>
              {language.toUpperCase()}
            </Text>
            <Text style={styles.languageSwitch}>
              Try Conversation
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              router.back();
            }}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <X size={24} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        <View style={styles.centerContent}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          
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
                  opacity: isSpeaking ? 0.2 : 0.1,
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

        <ScrollView 
          style={styles.scrollContent}
          contentContainerStyle={styles.featuresContainer}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {FEATURES.map((feature, index) => (
            <Animated.View
              key={feature.key}
              style={[
                styles.featureItem,
                {
                  opacity: featureOpacities[index],
                  transform: [{ scale: featureScales[index] }],
                },
              ]}
            >
              <Text style={styles.featureText}>
                {feature[language as keyof typeof feature] as string}
              </Text>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    position: 'absolute' as const,
    top: '50%',
    left: 0,
    right: 0,
    transform: [{ translateY: -170 }],
    alignItems: 'center' as const,
    zIndex: 1,
  },
  scrollContent: {
    position: 'absolute' as const,
    top: '50%',
    left: 0,
    right: 0,
    bottom: 0,
    marginTop: 170,
    zIndex: 2,
  },
  header: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    zIndex: 10,
  },
  languageButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: 'rgba(157, 142, 241, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(157, 142, 241, 0.4)',
    alignItems: 'center' as const,
  },

  languageFlag: {
    fontSize: 20,
    marginBottom: 2,
  },
  languageCode: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.95)',
    marginBottom: 2,
  },
  languageSwitch: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.9)',
  },

  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
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

  statusText: {
    fontSize: 28,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center' as const,
    marginBottom: spacing.xl * 2,
    lineHeight: 36,
    paddingHorizontal: spacing.lg,
  },
  featuresContainer: {
    alignItems: 'center' as const,
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 3,
  },
  featureItem: {
    marginVertical: spacing.xs,
    paddingVertical: spacing.sm,
  },
  featureText: {
    fontSize: 18,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center' as const,
    letterSpacing: 0.3,
  },
});

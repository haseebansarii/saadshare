import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ChevronRight } from 'lucide-react-native';
import { requestMicrophonePermission } from '@/utils/permissions';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type LanguageContent = {
  code: string;
  line1: string;
  line2: string;
  line3: string;
  helpLink: string;
  joinButton: string;
  alreadyConnected: string;
  tapHere: string;
  login: string;
};

const LANGUAGES: LanguageContent[] = [
  {
    code: 'en',
    line1: "Hi, I'm Tomō.",
    line2: "I'm here to listen.",
    line3: "To help you throughout your day.",
    helpLink: "Learn more →",
    joinButton: "How I can Help",
    alreadyConnected: "Already connected?",
    tapHere: "Tap here",
    login: "Login",
  },
  {
    code: 'ja',
    line1: "こんにちは、私はトモです。",
    line2: "あなたの話を聞くためにここにいます。",
    line3: "一日を通してお手伝いします。",
    helpLink: "私ができること →",
    joinButton: "お手伝いできること",
    alreadyConnected: "すでに接続していますか？",
    tapHere: "こちらをタップ",
    login: "ログイン",
  },
  {
    code: 'ko',
    line1: "안녕하세요, 저는 토모입니다.",
    line2: "당신의 이야기를 듣기 위해 여기 있습니다.",
    line3: "하루 종일 도와드리겠습니다.",
    helpLink: "제가 도울 수 있는 방법 →",
    joinButton: "도움 방법",
    alreadyConnected: "이미 연결되어 있나요?",
    tapHere: "여기를 탭하세요",
    login: "로그인",
  },
  {
    code: 'zh',
    line1: "你好，我是Tomō。",
    line2: "我在这里倾听。",
    line3: "帮助您度过每一天。",
    helpLink: "我可以这样帮助您 →",
    joinButton: "我能帮什么",
    alreadyConnected: "已经连接？",
    tapHere: "点击这里",
    login: "登录",
  },
  {
    code: 'es',
    line1: "Hola, soy Tomō.",
    line2: "Estoy aquí para escuchar.",
    line3: "Para ayudarte durante todo el día.",
    helpLink: "Así es como puedo ayudar →",
    joinButton: "Cómo Puedo Ayudar",
    alreadyConnected: "¿Ya estás conectado?",
    tapHere: "Toca aquí",
    login: "Iniciar Sesión",
  },
  {
    code: 'it',
    line1: "Ciao, sono Tomō.",
    line2: "Sono qui per ascoltare.",
    line3: "Per aiutarti durante la giornata.",
    helpLink: "Ecco come posso aiutarti →",
    joinButton: "Come Posso Aiutare",
    alreadyConnected: "Già connesso?",
    tapHere: "Tocca qui",
    login: "Accedi",
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const heroFadeAnim = useRef(new Animated.Value(0)).current;
  const heroSlideAnim = useRef(new Animated.Value(30)).current;
  const line1FadeAnim = useRef(new Animated.Value(0)).current;
  const line2FadeAnim = useRef(new Animated.Value(0)).current;
  const line3FadeAnim = useRef(new Animated.Value(0)).current;
  const linkFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.8)).current;
  const loginLinkFadeAnim = useRef(new Animated.Value(0)).current;
  const arrowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(heroFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(heroSlideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(line1FadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(line2FadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(line3FadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(linkFadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(buttonFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
      ]),
      Animated.timing(loginLinkFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(arrowOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleNavigateToWelcomeMessage = async () => {
    const currentLang = LANGUAGES[currentIndex].code;
    console.log('[Welcome] Requesting microphone permission before navigation...');
    
    const permissionResult = await requestMicrophonePermission();
    
    if (permissionResult.granted) {
      console.log('[Welcome] Microphone permission granted, navigating to welcome message with language:', currentLang);
      router.push(`/welcome-message?language=${currentLang}`);
    } else {
      console.log('[Welcome] Microphone permission denied:', permissionResult.error);
    }
  };

  const handleJoinPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
    ]).start(() => {
      setTimeout(() => handleNavigateToWelcomeMessage(), 100);
    });
  };

  const handleNextLanguage = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    const nextIndex = (currentIndex + 1) % LANGUAGES.length;
    setCurrentIndex(nextIndex);
    scrollViewRef.current?.scrollTo({
      x: nextIndex * SCREEN_WIDTH,
      animated: true,
    });
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentIndex) {
      setCurrentIndex(index);
      setSelectedLanguage(LANGUAGES[index].code);
    }
  };

  const currentLanguage = LANGUAGES[currentIndex];

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.loginLinkContainer, { opacity: loginLinkFadeAnim }]}>
        <View style={styles.topButtonsRow}>
          <TouchableOpacity
            onPress={() => {
              const nextIndex = (currentIndex + 1) % LANGUAGES.length;
              setCurrentIndex(nextIndex);
              setSelectedLanguage(LANGUAGES[nextIndex].code);
              scrollViewRef.current?.scrollTo({
                x: nextIndex * SCREEN_WIDTH,
                animated: true,
              });
              console.log('[Welcome] Language changed to:', LANGUAGES[nextIndex].code);
              if (Platform.OS !== 'web') {
                Haptics.selectionAsync();
              }
            }}
            style={styles.languageToggleButton}
            accessibilityRole="button"
            accessibilityLabel="Change language"
          >
            <Text style={styles.languageToggleFlag}>
              {currentLanguage.code === 'en' ? '🇺🇸' : currentLanguage.code === 'ja' ? '🇯🇵' : currentLanguage.code === 'zh' ? '🇹🇼' : currentLanguage.code === 'it' ? '🇮🇹' : currentLanguage.code === 'es' ? '🇪🇸' : '🇰🇷'}
            </Text>
            <Text style={styles.languageToggleText}>
              {currentLanguage.code.toUpperCase()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              console.log('[Welcome] Navigating to login with language:', LANGUAGES[currentIndex].code);
              router.push(`/login?language=${LANGUAGES[currentIndex].code}`);
            }}
            activeOpacity={0.7}
            accessibilityRole="link"
            accessibilityLabel={currentLanguage.login}
          >
            <Text style={styles.loginLinkText}>
              {currentLanguage.login}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {LANGUAGES.map((language, index) => (
          <Animated.View
            key={language.code}
            style={[
              styles.heroSection,
              {
                opacity: heroFadeAnim,
                transform: [{ translateY: heroSlideAnim }],
              },
            ]}
          >
            <Animated.Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/6yzbx5t58j1xh1b7tvfgx' }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)']}
              style={styles.heroGradientOverlay}
            />
            
            <View style={styles.overlayContent}>
              <View style={styles.textContainer}>
                <Animated.Text style={[styles.textLineBold, { opacity: line1FadeAnim }]}>
                  {language.code === 'en' ? "Hi, I'm Tomō." : language.line1}
                </Animated.Text>
                <Animated.Text style={[styles.textLine, { opacity: line2FadeAnim }]}>
                  {language.line2}
                </Animated.Text>
                <Animated.Text style={[styles.textLine, { opacity: line3FadeAnim }]}>
                  {language.line3}
                </Animated.Text>


              </View>

              <Animated.View
                style={[
                  styles.buttonContainer,
                  {
                    opacity: buttonFadeAnim,
                    transform: [{ scale: buttonScale }],
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={handleJoinPress}
                  activeOpacity={0.9}
                  accessibilityRole="button"
                  accessibilityLabel={language.joinButton}
                >
                  <LinearGradient
                    colors={['#9D8EF1', '#7C6EE4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.joinButton}
                  >
                    <Text style={styles.joinButtonText}>
                      {language.joinButton}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={{ opacity: loginLinkFadeAnim, marginTop: 16 }}>
                <TouchableOpacity
                  onPress={() => {
                    console.log('[Welcome] Navigating to login from bottom link with language:', language.code);
                    router.push(`/login?language=${language.code}`);
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="link"
                  accessibilityLabel={`${language.alreadyConnected} ${language.tapHere}`}
                >
                  <Text style={styles.alreadyConnectedText}>
                    {`${language.alreadyConnected} `}
                    <Text style={styles.tapHereText}>{language.tapHere}</Text>
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      <Animated.View style={[styles.navigationArrow, { opacity: arrowOpacity }]}>
        <TouchableOpacity
          onPress={handleNextLanguage}
          activeOpacity={0.7}
          style={styles.arrowButton}
          accessibilityRole="button"
          accessibilityLabel="Next language"
        >
          <View style={styles.arrowCircle}>
            <ChevronRight size={24} color="rgba(255, 255, 255, 0.9)" strokeWidth={2} />
          </View>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.paginationDots}>
        {LANGUAGES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative' as const,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradientOverlay: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '75%',
  },
  overlayContent: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingBottom: 100,
  },
  textContainer: {
    marginBottom: 40,
  },
  textLine: {
    fontSize: 36,
    fontWeight: '400' as const,
    color: '#FFFFFF',
    lineHeight: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  textLineBold: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    lineHeight: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  buttonContainer: {
    width: '100%',
  },
  joinButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C6EE4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  joinButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  alreadyConnectedText: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center' as const,
  },
  tapHereText: {
    color: '#9D8EF1',
    fontWeight: '600' as const,
  },
  loginLinkContainer: {
    position: 'absolute' as const,
    top: Platform.select({ ios: 96, android: 84, default: 72 }),
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  topButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(157, 142, 241, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(157, 142, 241, 0.4)',
    borderRadius: 24,
    gap: 8,
  },
  languageToggleFlag: {
    fontSize: 20,
  },
  languageToggleText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  loginLinkText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  navigationArrow: {
    position: 'absolute' as const,
    right: 20,
    top: '50%',
    marginTop: -28,
    zIndex: 10,
  },
  arrowButton: {
    padding: 4,
  },
  arrowCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(157, 142, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(157, 142, 241, 0.3)',
  },
  paginationDots: {
    position: 'absolute' as const,
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    backgroundColor: '#9D8EF1',
    width: 24,
  },
});

import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Switch, ActivityIndicator, Platform, Animated } from "react-native";
import { useState, useEffect, useRef } from "react";
import { useRouter, Stack } from "expo-router";
import { LogOut, Globe, Type, AlertCircle, ArrowLeft } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import colors from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AssistanceItem {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  route?: string;
  action?: () => void;
  color?: string;
  voiceTrigger: string;
}

const translations = {
  en: {
    menu: 'Menu',
    back: 'Back',
    assistance: 'ASSISTANCE',
    settings: 'SETTINGS',
    callCaregiver: 'Call My Caregiver',
    urgent: 'For urgent assistance',
    language: 'Language',
    english: 'English',
    japanese: '日本語',
    korean: '한국어',
    chinese: '中文',
    spanish: 'Español',
    italian: 'Italiano',
    textVisibility: 'Text & Visibility',
    adjustReadability: 'Adjust readability',
    connectedAs: 'Connected as',
    yourCaregiver: 'Your caregiver',
    family: 'Family',
    logout: 'Log Out',
    version: 'Tomō v1.0.0',
    logoutConfirmTitle: 'Logout',
    logoutConfirmMessage: 'Are you sure you want to logout?',
    cancel: 'Cancel',
    emergencyTitle: 'Emergency Alert',
    emergencyMessage: 'This will notify your caregiver immediately. Continue?',
    callHelp: 'Call for Help',
    helpOnWay: 'Help is on the way!',
    caregiverNotified: 'Your caregiver has been notified.',
    languageChanged: 'Language Changed',
    languageSetTo: 'Language set to',
    error: 'Error',
    failedUpdate: 'Failed to update language. Please try again.',
    textSizeChanged: 'Text Size Changed',
    textSizeSetTo: 'Text size set to',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    highContrastMode: 'High Contrast Mode',
    highContrastEnabled: 'High contrast mode enabled',
    highContrastDisabled: 'High contrast mode disabled',
    changeLanguageVoice: 'Change my language',
    makeTextBiggerVoice: 'Make text bigger',
    turnOnHighContrastVoice: 'Turn on high contrast',
  },
  ja: {
    menu: 'メニュー',
    back: '戻る',
    assistance: 'サポート',
    settings: '設定',
    callCaregiver: '介護者に電話',
    urgent: '緊急時のサポート',
    language: '言語',
    english: 'English',
    japanese: '日本語',
    korean: '한국어',
    chinese: '中文',
    spanish: 'Español',
    italian: 'Italiano',
    textVisibility: 'テキストと表示',
    adjustReadability: '読みやすさを調整',
    connectedAs: '接続ユーザー',
    yourCaregiver: 'あなたの介護者',
    family: '家族',
    logout: 'ログアウト',
    version: 'Tomō v1.0.0',
    logoutConfirmTitle: 'ログアウト',
    logoutConfirmMessage: 'ログアウトしてもよろしいですか？',
    cancel: 'キャンセル',
    emergencyTitle: '緊急アラート',
    emergencyMessage: 'すぐに介護者に通知されます。続けますか？',
    callHelp: '助けを呼ぶ',
    helpOnWay: '助けが向かっています！',
    caregiverNotified: '介護者に通知されました。',
    languageChanged: '言語が変更されました',
    languageSetTo: '言語が次に設定されました',
    error: 'エラー',
    failedUpdate: '言語の更新に失敗しました。もう一度お試しください。',
    textSizeChanged: 'テキストサイズが変更されました',
    textSizeSetTo: 'テキストサイズが次に設定されました',
    small: '小',
    medium: '中',
    large: '大',
    highContrastMode: 'ハイコントラストモード',
    highContrastEnabled: 'ハイコントラストモードが有効になりました',
    highContrastDisabled: 'ハイコントラストモードが無効になりました',
    changeLanguageVoice: '言語を変更',
    makeTextBiggerVoice: 'テキストを大きくする',
    turnOnHighContrastVoice: 'ハイコントラストをオンにする',
  },
  ko: {
    menu: '메뉴',
    back: '뒤로',
    assistance: '지원',
    settings: '설정',
    callCaregiver: '보호자에게 전화',
    urgent: '긴급 지원',
    language: '언어',
    english: 'English',
    japanese: '日本語',
    korean: '한국어',
    chinese: '中文',
    spanish: 'Español',
    italian: 'Italiano',
    textVisibility: '텍스트 및 가시성',
    adjustReadability: '가독성 조정',
    connectedAs: '연결된 사용자',
    yourCaregiver: '보호자',
    family: '가족',
    logout: '로그아웃',
    version: 'Tomō v1.0.0',
    logoutConfirmTitle: '로그아웃',
    logoutConfirmMessage: '로그아웃하시겠습니까?',
    cancel: '취소',
    emergencyTitle: '긴급 알림',
    emergencyMessage: '보호자에게 즉시 알립니다. 계속하시겠습니까?',
    callHelp: '도움 요청',
    helpOnWay: '도움이 오고 있습니다!',
    caregiverNotified: '보호자에게 알림이 전송되었습니다.',
    languageChanged: '언어가 변경되었습니다',
    languageSetTo: '언어가 다음으로 설정되었습니다',
    error: '오류',
    failedUpdate: '언어 업데이트에 실패했습니다. 다시 시도해주세요.',
    textSizeChanged: '텍스트 크기가 변경되었습니다',
    textSizeSetTo: '텍스트 크기가 다음으로 설정되었습니다',
    small: '작게',
    medium: '중간',
    large: '크게',
    highContrastMode: '고대비 모드',
    highContrastEnabled: '고대비 모드가 활성화되었습니다',
    highContrastDisabled: '고대비 모드가 비활성화되었습니다',
    changeLanguageVoice: '언어 변경',
    makeTextBiggerVoice: '텍스트 크게',
    turnOnHighContrastVoice: '고대비 켜기',
  },
  zh: {
    menu: '選單',
    back: '返回',
    assistance: '協助',
    settings: '設定',
    callCaregiver: '致電照顧者',
    urgent: '緊急協助',
    language: '語言',
    english: 'English',
    japanese: '日本語',
    korean: '한국어',
    chinese: '中文',
    spanish: 'Español',
    italian: 'Italiano',
    textVisibility: '文字與顯示',
    adjustReadability: '調整可讀性',
    connectedAs: '連接身份',
    yourCaregiver: '您的照顧者',
    family: '家人',
    logout: '登出',
    version: 'Tomō v1.0.0',
    logoutConfirmTitle: '登出',
    logoutConfirmMessage: '確定要登出嗎？',
    cancel: '取消',
    emergencyTitle: '緊急警報',
    emergencyMessage: '這將立即通知您的照顧者。繼續嗎？',
    callHelp: '呼叫幫助',
    helpOnWay: '幫助正在路上！',
    caregiverNotified: '已通知您的照顧者。',
    languageChanged: '語言已更改',
    languageSetTo: '語言已設置為',
    error: '錯誤',
    failedUpdate: '更新語言失敗。請重試。',
    textSizeChanged: '文字大小已更改',
    textSizeSetTo: '文字大小已設置為',
    small: '小',
    medium: '中',
    large: '大',
    highContrastMode: '高對比模式',
    highContrastEnabled: '高對比模式已啟用',
    highContrastDisabled: '高對比模式已禁用',
    changeLanguageVoice: '更改語言',
    makeTextBiggerVoice: '放大文字',
    turnOnHighContrastVoice: '開啟高對比',
  },
  es: {
    menu: 'Menú',
    back: 'Atrás',
    assistance: 'ASISTENCIA',
    settings: 'CONFIGURACIÓN',
    callCaregiver: 'Llamar a Mi Cuidador',
    urgent: 'Para asistencia urgente',
    language: 'Idioma',
    english: 'English',
    japanese: '日本語',
    korean: '한국어',
    chinese: '中文',
    spanish: 'Español',
    italian: 'Italiano',
    textVisibility: 'Texto y Visibilidad',
    adjustReadability: 'Ajustar legibilidad',
    connectedAs: 'Conectado como',
    yourCaregiver: 'Tu cuidador',
    family: 'Familia',
    logout: 'Cerrar Sesión',
    version: 'Tomō v1.0.0',
    logoutConfirmTitle: 'Cerrar Sesión',
    logoutConfirmMessage: '¿Estás seguro de que quieres cerrar sesión?',
    cancel: 'Cancelar',
    emergencyTitle: 'Alerta de Emergencia',
    emergencyMessage: 'Esto notificará a tu cuidador inmediatamente. ¿Continuar?',
    callHelp: 'Pedir Ayuda',
    helpOnWay: '¡La ayuda está en camino!',
    caregiverNotified: 'Tu cuidador ha sido notificado.',
    languageChanged: 'Idioma Cambiado',
    languageSetTo: 'Idioma establecido a',
    error: 'Error',
    failedUpdate: 'Error al actualizar el idioma. Por favor, intenta de nuevo.',
    textSizeChanged: 'Tamaño de Texto Cambiado',
    textSizeSetTo: 'Tamaño de texto establecido a',
    small: 'Pequeño',
    medium: 'Mediano',
    large: 'Grande',
    highContrastMode: 'Modo de Alto Contraste',
    highContrastEnabled: 'Modo de alto contraste activado',
    highContrastDisabled: 'Modo de alto contraste desactivado',
    changeLanguageVoice: 'Cambiar idioma',
    makeTextBiggerVoice: 'Agrandar texto',
    turnOnHighContrastVoice: 'Activar alto contraste',
  },
  it: {
    menu: 'Menu',
    back: 'Indietro',
    assistance: 'ASSISTENZA',
    settings: 'IMPOSTAZIONI',
    callCaregiver: 'Chiama il Mio Assistente',
    urgent: 'Per assistenza urgente',
    language: 'Lingua',
    english: 'English',
    japanese: '日本語',
    korean: '한국어',
    chinese: '中文',
    spanish: 'Español',
    italian: 'Italiano',
    textVisibility: 'Testo e Visibilità',
    adjustReadability: 'Regola leggibilità',
    connectedAs: 'Connesso come',
    yourCaregiver: 'Il tuo assistente',
    family: 'Famiglia',
    logout: 'Disconnetti',
    version: 'Tomō v1.0.0',
    logoutConfirmTitle: 'Disconnetti',
    logoutConfirmMessage: 'Sei sicuro di voler disconnetterti?',
    cancel: 'Annulla',
    emergencyTitle: 'Allarme di Emergenza',
    emergencyMessage: 'Questo avviserà immediatamente il tuo assistente. Continuare?',
    callHelp: 'Chiedi Aiuto',
    helpOnWay: 'L\'aiuto è in arrivo!',
    caregiverNotified: 'Il tuo assistente è stato notificato.',
    languageChanged: 'Lingua Cambiata',
    languageSetTo: 'Lingua impostata su',
    error: 'Errore',
    failedUpdate: 'Aggiornamento lingua fallito. Riprova.',
    textSizeChanged: 'Dimensione Testo Cambiata',
    textSizeSetTo: 'Dimensione testo impostata su',
    small: 'Piccolo',
    medium: 'Medio',
    large: 'Grande',
    highContrastMode: 'Modalità Alto Contrasto',
    highContrastEnabled: 'Modalità alto contrasto attivata',
    highContrastDisabled: 'Modalità alto contrasto disattivata',
    changeLanguageVoice: 'Cambia lingua',
    makeTextBiggerVoice: 'Ingrandisci testo',
    turnOnHighContrastVoice: 'Attiva alto contrasto',
  },
};

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser } = useAuth();
  
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>('large');
  const [isUpdating, setIsUpdating] = useState(false);

  const [activeCard, setActiveCard] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const getCurrentLanguage = () => {
    const langMap: Record<string, keyof typeof translations> = {
      'en': 'en',
      'ja': 'ja',
      'ko': 'ko',
      'zh': 'zh',
      'zh-TW': 'zh',
      'es': 'es',
      'it': 'it',
    };
    return langMap[user?.language || 'en'] || 'en';
  };

  const t = translations[getCurrentLanguage()];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);



  const handleLogout = () => {
    Alert.alert(
      t.logoutConfirmTitle,
      t.logoutConfirmMessage,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.logout,
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login' as any);
          },
        },
      ]
    );
  };

  const handleEmergency = () => {
    Alert.alert(
      t.emergencyTitle,
      t.emergencyMessage,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.callHelp,
          style: 'destructive',
          onPress: () => {
            console.log('[Emergency] Alert triggered');
            Alert.alert(t.helpOnWay, t.caregiverNotified);
          },
        },
      ]
    );
  };

  const toggleLanguage = async () => {
    if (!user || isUpdating) return;
    
    try {
      setIsUpdating(true);
      const newLanguage = user.language === 'en' ? 'ja' : 'en';
      
      console.log('[Settings] Updating language to:', newLanguage);
      await updateUser({ language: newLanguage });
      
      const langName = newLanguage === 'en' ? t.english : t.japanese;
      Alert.alert(t.languageChanged, `${t.languageSetTo} ${langName}`);
      console.log('[Settings] Language updated successfully');
    } catch (error) {
      console.error('[Settings] Error updating language:', error);
      Alert.alert(t.error, t.failedUpdate);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTextSizeChange = () => {
    if (isUpdating) return;
    
    const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(textSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    const newSize = sizes[nextIndex];
    setTextSize(newSize);
    
    const sizeLabels = { small: t.small, medium: t.medium, large: t.large };
    Alert.alert(t.textSizeChanged, `${t.textSizeSetTo} ${sizeLabels[newSize]}`);
    console.log('[Settings] Text size changed to:', newSize);
  };

  const handleHighContrastToggle = (value: boolean) => {
    if (isUpdating) return;
    
    setHighContrast(value);
    Alert.alert(
      t.highContrastMode,
      value ? t.highContrastEnabled : t.highContrastDisabled
    );
    console.log('[Settings] High contrast mode:', value ? 'enabled' : 'disabled');
  };



  const handleCardPress = (itemId: string, action: () => void) => {
    setActiveCard(itemId);
    
    setTimeout(() => {
      setActiveCard(null);
    }, 300);
    
    action();
  };

  const assistanceItems: AssistanceItem[] = [
    {
      id: 'emergency',
      title: t.callCaregiver,
      subtitle: t.urgent,
      icon: AlertCircle,
      action: handleEmergency,
      color: '#E45858',
      voiceTrigger: '"Help me" or "Call my caregiver"',
    },

  ];

  const handleAssistancePress = (item: AssistanceItem) => {
    const action = () => {
      if (item.action) {
        item.action();
      } else if (item.route) {
        router.push(item.route as any);
      }
    };
    
    handleCardPress(item.id, action);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel={t.back}
          >
            <ArrowLeft size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.menu}</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionHeader}>{t.assistance}</Text>
          {assistanceItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = activeCard === item.id;
            
            return (
              <Animated.View
                key={item.id}
                style={[
                  styles.assistanceCard,
                  isActive && styles.assistanceCardActive,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: Animated.add(
                          slideAnim,
                          new Animated.Value(index * 10)
                        ),
                      },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleAssistancePress(item)}
                  style={styles.assistanceCardInner}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.title}. ${item.subtitle}. Voice command: ${item.voiceTrigger}`}
                >
                  <View style={[
                    styles.assistanceIcon,
                    { backgroundColor: item.id === 'emergency' ? '#FEE2E2' : '#F3F0FF' },
                  ]}>
                    <IconComponent
                      size={32}
                      color={item.color}
                      strokeWidth={2.5}
                    />
                  </View>
                  <View style={styles.assistanceText}>
                    <Text style={[
                      styles.assistanceTitle,
                      item.id === 'emergency' && { color: item.color },
                    ]}>
                      {item.title}
                    </Text>
                    <Text style={styles.assistanceSubtitle}>{item.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.sectionHeader}>{t.settings}</Text>
        
          <TouchableOpacity
            style={[styles.settingCard, isUpdating && styles.settingCardDisabled]}
            onPress={toggleLanguage}
            disabled={isUpdating}
            accessibilityRole="button"
            accessibilityLabel={`${t.language}. Voice command: ${t.changeLanguageVoice}`}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIconContainer}>
                <Globe size={24} color={isUpdating ? colors.disabled : '#666666'} strokeWidth={2} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, isUpdating && styles.textDisabled]}>{t.language}</Text>
                <Text style={[styles.settingValue, isUpdating && styles.textDisabled]}>
                  {user?.language === 'en' ? t.english : user?.language === 'ja' ? t.japanese : user?.language === 'ko' ? t.korean : user?.language === 'zh' ? t.chinese : user?.language === 'es' ? t.spanish : user?.language === 'it' ? t.italian : t.english}
                </Text>
              </View>
            </View>
            {isUpdating && <ActivityIndicator size="small" color="#7C6EE4" />}
          </TouchableOpacity>

          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconContainer}>
                <Type size={24} color="#666666" strokeWidth={2} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{t.textVisibility}</Text>
                <Text style={styles.settingValue}>{t.adjustReadability}</Text>
              </View>
            </View>
            <View style={styles.settingRight}>
              <TouchableOpacity
                onPress={handleTextSizeChange}
                style={styles.textSizeButton}
                accessibilityRole="button"
                accessibilityLabel={`Change text size. Voice command: ${t.makeTextBiggerVoice}`}
              >
                <Text style={styles.textSizeLabel}>
                  {textSize === 'small' ? 'A' : textSize === 'medium' ? 'A+' : 'A++'}
                </Text>
              </TouchableOpacity>
              <View style={styles.switchContainer}>
                <Switch
                  value={highContrast}
                  onValueChange={handleHighContrastToggle}
                  trackColor={{ false: '#E0E0E0', true: '#7C6EE4' }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#E0E0E0"
                  accessibilityLabel={`High contrast mode toggle. Voice command: ${t.turnOnHighContrastVoice}`}
                  style={styles.switch}
                />
              </View>
            </View>
          </View>
        </Animated.View>



        <View style={styles.divider} />

        <Animated.View
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.footerConnected}>{t.connectedAs} {user?.name || 'User'}</Text>
          <Text style={styles.footerCaregiver}>{t.yourCaregiver}: {t.family}</Text>
          
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel={t.logout}
          >
            <LogOut size={20} color="#999999" strokeWidth={2} />
            <Text style={styles.logoutText}>{t.logout}</Text>
          </TouchableOpacity>
          
          <Text style={styles.footerVersion}>{t.version}</Text>
        </Animated.View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F7',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FAF9F7',
  },
  backButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#999999',
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    marginBottom: 16,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 24,
  },
  assistanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  assistanceCardActive: {
    ...Platform.select({
      ios: {
        shadowColor: '#7C6EE4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(124, 110, 228, 0.2)',
      },
    }),
  },
  assistanceCardInner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 20,
    minHeight: 80,
  },
  assistanceIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 16,
  },
  assistanceText: {
    flex: 1,
  },
  assistanceTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#1A1A1A',
    marginBottom: 4,
    lineHeight: 28,
  },
  assistanceSubtitle: {
    fontSize: 18,
    color: '#666666',
    lineHeight: 24,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 12,
    minHeight: 80,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  settingCardDisabled: {
    opacity: 0.6,
  },
  settingLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  settingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#1A1A1A',
    marginBottom: 4,
    lineHeight: 26,
  },
  settingValue: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  settingRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  textSizeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F0FF',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  textSizeLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#7C6EE4',
  },
  switchContainer: {
    justifyContent: 'center' as const,
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  footer: {
    alignItems: 'center' as const,
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  footerConnected: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  footerCaregiver: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#999999',
  },
  footerVersion: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  textDisabled: {
    color: colors.disabled,
  },
});

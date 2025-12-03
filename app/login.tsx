import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import colors, { spacing, fontSize, borderRadius, touchTarget } from '@/constants/colors';

type LanguageContent = {
  code: string;
  welcomeTitle: string;
  subtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  loginButton: string;
  demoButton: string;
  missingInfoTitle: string;
  missingInfoMessage: string;
  loginFailedTitle: string;
  loginFailedMessage: string;
};

const LANGUAGE_CONTENT: Record<string, LanguageContent> = {
  en: {
    code: 'en',
    welcomeTitle: 'Welcome to Tomō',
    subtitle: 'Your caring companion',
    emailLabel: 'Email',
    emailPlaceholder: 'Enter your email',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    loginButton: 'Login',
    demoButton: 'Demo Conversation',
    missingInfoTitle: 'Missing Information',
    missingInfoMessage: 'Please enter your email and password.',
    loginFailedTitle: 'Login Failed',
    loginFailedMessage: 'Please try again.',
  },
  ja: {
    code: 'ja',
    welcomeTitle: 'トモーへようこそ',
    subtitle: 'あなたの優しい仲間',
    emailLabel: 'メールアドレス',
    emailPlaceholder: 'メールアドレスを入力',
    passwordLabel: 'パスワード',
    passwordPlaceholder: 'パスワードを入力',
    loginButton: 'ログイン',
    demoButton: 'デモ会話',
    missingInfoTitle: '情報が不足しています',
    missingInfoMessage: 'メールアドレスとパスワードを入力してください。',
    loginFailedTitle: 'ログイン失敗',
    loginFailedMessage: '再試行してください。',
  },
  ko: {
    code: 'ko',
    welcomeTitle: '토모에 오신 것을 환영합니다',
    subtitle: '당신의 따뜻한 동반자',
    emailLabel: '이메일',
    emailPlaceholder: '이메일을 입력하세요',
    passwordLabel: '비밀번호',
    passwordPlaceholder: '비밀번호를 입력하세요',
    loginButton: '로그인',
    demoButton: '데모 대화',
    missingInfoTitle: '정보 누락',
    missingInfoMessage: '이메일과 비밀번호를 입력하세요.',
    loginFailedTitle: '로그인 실패',
    loginFailedMessage: '다시 시도하세요.',
  },
  zh: {
    code: 'zh',
    welcomeTitle: '欢迎来到Tomō',
    subtitle: '您的贴心伙伴',
    emailLabel: '电子邮件',
    emailPlaceholder: '输入您的电子邮件',
    passwordLabel: '密码',
    passwordPlaceholder: '输入您的密码',
    loginButton: '登录',
    demoButton: '演示对话',
    missingInfoTitle: '信息缺失',
    missingInfoMessage: '请输入您的电子邮件和密码。',
    loginFailedTitle: '登录失败',
    loginFailedMessage: '请重试。',
  },
  es: {
    code: 'es',
    welcomeTitle: 'Bienvenido a Tomō',
    subtitle: 'Tu compañero cariñoso',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'Ingresa tu correo',
    passwordLabel: 'Contraseña',
    passwordPlaceholder: 'Ingresa tu contraseña',
    loginButton: 'Iniciar Sesión',
    demoButton: 'Conversación de Demostración',
    missingInfoTitle: 'Información Faltante',
    missingInfoMessage: 'Por favor ingresa tu correo y contraseña.',
    loginFailedTitle: 'Error de Inicio de Sesión',
    loginFailedMessage: 'Por favor intenta de nuevo.',
  },
  it: {
    code: 'it',
    welcomeTitle: 'Benvenuto su Tomō',
    subtitle: 'Il tuo compagno premuroso',
    emailLabel: 'Email',
    emailPlaceholder: 'Inserisci la tua email',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Inserisci la tua password',
    loginButton: 'Accedi',
    demoButton: 'Conversazione Demo',
    missingInfoTitle: 'Informazioni Mancanti',
    missingInfoMessage: 'Inserisci email e password.',
    loginFailedTitle: 'Accesso Fallito',
    loginFailedMessage: 'Riprova.',
  },
};

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');

  useEffect(() => {
    const langParam = params.language as string;
    if (langParam && LANGUAGE_CONTENT[langParam]) {
      console.log('[Login] Setting language to:', langParam);
      setCurrentLanguage(langParam);
    }
  }, [params.language]);

  const content = LANGUAGE_CONTENT[currentLanguage] || LANGUAGE_CONTENT.en;


  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(content.missingInfoTitle, content.missingInfoMessage);
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      console.log('[Login] Success, navigating to demo');
      router.replace('/demo' as any);
    } else {
      Alert.alert(content.loginFailedTitle, result.error || content.loginFailedMessage);
    }
  };



  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <TouchableOpacity
            onPress={() => router.push('/welcome' as any)}
            style={styles.logoContainer}
            accessibilityRole="button"
            accessibilityLabel="Return to home"
          >
            <Text style={styles.logoText}>Tomō</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              {content.welcomeTitle}
            </Text>
            <Text style={styles.subtitle}>
              {content.subtitle}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{content.emailLabel}</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder={content.emailPlaceholder}
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                accessibilityLabel={content.emailLabel}
                accessibilityHint={content.emailPlaceholder}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{content.passwordLabel}</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder={content.passwordPlaceholder}
                placeholderTextColor={colors.textTertiary}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                accessibilityLabel={content.passwordLabel}
                accessibilityHint={content.passwordPlaceholder}
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel={content.loginButton}
              accessibilityHint={content.loginButton}
            >
              <LinearGradient
                colors={colors.gradientPurple}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.textInverse} size="large" />
                ) : (
                  <Text style={styles.loginButtonText}>{content.loginButton}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>



            <TouchableOpacity
              style={styles.conversationButton}
              onPress={() => {
                console.log('[Login] Demo Conversation clicked, language:', currentLanguage);
                router.push(`/demo-conversation?language=${currentLanguage}` as any);
              }}
              accessibilityRole="button"
              accessibilityLabel={content.demoButton}
              disabled={isLoading}
            >
              <Text style={styles.conversationButtonText}>{content.demoButton}</Text>
            </TouchableOpacity>


          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
  },
  logoText: {
    fontSize: fontSize.display,
    fontWeight: '700' as const,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSize.display,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.large,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.body,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontSize: fontSize.body,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
    minHeight: touchTarget.comfortable,
  },
  loginButton: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    minHeight: touchTarget.large,
  },
  gradientButton: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touchTarget.large,
  },
  loginButtonText: {
    fontSize: fontSize.large,
    fontWeight: '700' as const,
    color: colors.textInverse,
  },

  conversationButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  conversationButtonText: {
    fontSize: fontSize.body,
    fontWeight: '700' as const,
    color: colors.info,
  },


});

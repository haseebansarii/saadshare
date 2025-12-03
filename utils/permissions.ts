import { Platform, Alert, Linking } from 'react-native';
import { Audio } from 'expo-av';

export interface PermissionResult {
  granted: boolean;
  error?: string;
}

export async function requestMicrophonePermission(): Promise<PermissionResult> {
  try {
    console.log('[Permissions] Requesting microphone permission...');
    
    const { status, canAskAgain } = await Audio.requestPermissionsAsync();
    
    if (status === 'granted') {
      console.log('[Permissions] Microphone permission granted');
      return { granted: true };
    }
    
    if (!canAskAgain) {
      Alert.alert(
        'Microphone Permission Required',
        'Tomō needs microphone access to have voice conversations. Please enable it in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }
          },
        ]
      );
      return { granted: false, error: 'Permission denied permanently' };
    }
    
    return { granted: false, error: 'Permission denied' };
  } catch (error) {
    console.error('[Permissions] Error requesting microphone permission:', error);
    return { 
      granted: false, 
      error: error instanceof Error ? error.message : 'Permission request failed' 
    };
  }
}

export async function checkMicrophonePermission(): Promise<boolean> {
  try {
    const { status } = await Audio.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('[Permissions] Error checking microphone permission:', error);
    return false;
  }
}

export async function ensureMicrophonePermission(): Promise<boolean> {
  const hasPermission = await checkMicrophonePermission();
  
  if (hasPermission) {
    return true;
  }
  
  const result = await requestMicrophonePermission();
  return result.granted;
}

export function showPermissionDeniedAlert(): void {
  Alert.alert(
    'Permission Required',
    'Tomō needs microphone access to work properly. Please enable microphone permission in your device settings.',
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Open Settings', 
        onPress: () => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.openSettings();
          }
        }
      },
    ]
  );
}

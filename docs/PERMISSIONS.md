# Permissions Configuration

This document explains all permissions configured for the Tomō app and how they're handled on different platforms.

## Configured Permissions

### iOS Permissions (in `app.json` > `ios.infoPlist`)

1. **NSMicrophoneUsageDescription**
   - **Purpose**: Access microphone for voice conversations with Tomō
   - **Message shown to user**: "Tomō needs microphone access to have voice conversations with you."
   - **Required for**: Voice recording, real-time voice conversations

2. **NSFaceIDUsageDescription**
   - **Purpose**: Secure authentication using Face ID
   - **Message shown to user**: "This app uses Face ID for secure authentication."
   - **Required for**: Biometric authentication (if implemented)

3. **NSSpeechRecognitionUsageDescription**
   - **Purpose**: Speech recognition for voice transcription
   - **Message shown to user**: "Tomō needs speech recognition to understand your voice."
   - **Required for**: Voice-to-text transcription

4. **UIBackgroundModes: ["audio"]**
   - **Purpose**: Continue audio playback in background
   - **Required for**: Playing Tomō's responses even when app is in background

### Android Permissions (in `app.json` > `android.permissions`)

1. **RECORD_AUDIO**
   - **Purpose**: Record audio for voice conversations
   - **Required for**: Microphone access on Android

2. **MODIFY_AUDIO_SETTINGS**
   - **Purpose**: Adjust audio settings for optimal recording quality
   - **Required for**: Audio configuration

3. **INTERNET**
   - **Purpose**: Network access for API calls
   - **Required for**: OpenAI API, audio file downloads

4. **WAKE_LOCK**
   - **Purpose**: Keep device awake during conversations
   - **Required for**: Prevent screen timeout during active conversations

### Expo Plugins Configuration

1. **expo-av**
   - Configured with microphone permission message
   - Handles both recording and playback
   - Used in: `services/openai-stt.ts`, `services/openai-realtime.ts`

2. **expo-secure-store**
   - Configured with Face ID permissions
   - Used for secure credential storage

3. **expo-local-authentication**
   - Configured for biometric authentication
   - Used for secure app access (if implemented)

## Runtime Permission Handling

### Permission Flow

1. **Check existing permissions** - Before requesting, check if already granted
2. **Request if needed** - Only request if not already granted
3. **Handle denial** - Show settings redirect if permanently denied
4. **User-friendly messages** - Clear explanations for why permissions are needed

### Implementation

The app uses `utils/permissions.ts` for centralized permission management:

```typescript
// Check if permission is granted
const hasPermission = await checkMicrophonePermission();

// Request permission with user-friendly prompts
const result = await requestMicrophonePermission();

// Ensure permission before proceeding
const granted = await ensureMicrophonePermission();
```

### Where Permissions Are Requested

1. **Demo Conversation Screen** (`app/demo-conversation.tsx`)
   - Microphone permission requested before initializing voice session
   - Shows error if permission denied

2. **Audio Recording Services**
   - `services/openai-realtime.ts` - Real-time voice conversations
   - `services/openai-stt.ts` - Speech-to-text recording

## Testing Permissions

### iOS Simulator
- Settings > Privacy & Security > Microphone > Tomō Clone
- Reset permissions: Delete app and reinstall

### Android Emulator  
- Settings > Apps > Tomō Clone > Permissions > Microphone
- Reset permissions: Long press app icon > App info > Storage > Clear data

### Physical Devices
- First launch will prompt for microphone permission
- If denied, app will show dialog to open Settings
- Users can manually enable in device Settings

## Permission Denied Handling

When users deny permissions, the app:
1. Shows an alert explaining why the permission is needed
2. Provides a button to open device Settings
3. Logs the denial for debugging
4. Prevents features requiring that permission from running

### User Experience

- **First denial**: User can retry by tapping feature again
- **Permanent denial**: Shows alert with "Open Settings" button
- **iOS**: Opens app-specific settings (`app-settings:`)
- **Android**: Opens app info screen (`Linking.openSettings()`)

## Web Platform

On web (React Native Web), microphone access uses browser APIs:
- Browser prompts for microphone permission automatically
- User must allow in browser popup
- Permission persists per-origin in browser settings

## Troubleshooting

### "Permission not granted" error
1. Check if permission is in `app.json`
2. Rebuild app after changing `app.json`
3. Clear app data and retry
4. Check device Settings for permission status

### iOS: "Microphone not available"
1. Check if permission message is in `Info.plist`
2. Ensure `expo-av` plugin is configured
3. Verify `UIBackgroundModes` includes "audio"

### Android: "Recording failed"
1. Check if `RECORD_AUDIO` is in AndroidManifest
2. Ensure permission is requested at runtime
3. Verify audio settings are configured correctly

## Security & Privacy

- **Minimal permissions**: Only request what's actually needed
- **Clear messaging**: Users understand why each permission is needed
- **No background recording**: Microphone only active during conversations
- **Secure storage**: Credentials stored using expo-secure-store
- **No tracking**: No location or contact permissions requested

## Future Enhancements

If adding new features that require permissions:
1. Add permission to `app.json`
2. Add user-facing description
3. Update `utils/permissions.ts`
4. Request permission before using feature
5. Handle denial gracefully
6. Update this documentation

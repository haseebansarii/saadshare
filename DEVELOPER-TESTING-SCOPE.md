# Developer Testing & Bug Fix Scope - Tomo Voice Companion

**Project:** Tomo - AI Voice Companion for Seniors  
**Last Updated:** December 30, 2025  
**Priority:** URGENT - iOS Testing Required  
**Status:** Production-Ready Code, Requires Physical Device Validation

---

## Executive Summary

The Tomo app is a hands-free voice AI companion for seniors, built with React Native + Expo. The codebase is **production-ready with no TypeScript errors**, but requires thorough testing on **physical iOS devices** to validate the hands-free voice conversation feature, which uses OpenAI's Realtime API with server-side Voice Activity Detection (VAD).

**Critical Requirement:** The app MUST provide a ChatGPT/Grok/Co-Pilot style hands-free audio experience. Push-to-talk (PTT) is NOT acceptable for the use case.

---

## 🎯 Core Functionality to Test

### 1. **Hands-Free Voice Conversation** (PRIMARY FEATURE)

**Location:** `app/demo-conversation.tsx`

**What It Should Do:**
- User speaks naturally without pressing any button
- AI automatically detects when user starts speaking (red pulsing orb)
- AI automatically detects when user stops speaking
- AI responds automatically (green pulsing orb)
- Cycle repeats continuously - completely hands-free

**Technology:**
- OpenAI Realtime API via WebSocket
- Server-side Voice Activity Detection (VAD)
- Continuous audio streaming (PCM16, 24kHz)
- expo-av for recording and playback

**Test Cases:**
1. **Initial Connection**
   - Open demo-conversation screen
   - Verify "Connecting..." status appears
   - Verify connection succeeds and status changes to "Ready - Speak anytime"
   - Check console logs for connection success

2. **Speech Detection**
   - Start speaking naturally (no button press)
   - Verify orb turns RED and pulses
   - Verify status text shows "Listening to you..."
   - Stop speaking
   - Verify orb stops pulsing red after ~400ms of silence

3. **AI Response**
   - After you stop speaking, AI should process and respond
   - Verify orb turns GREEN and pulses
   - Verify status text shows "Speaking..."
   - Verify audio plays clearly through device speakers
   - Verify orb returns to pink after response finishes

4. **Continuous Conversation**
   - After AI finishes speaking, speak again immediately
   - Verify orb turns red again and listening continues
   - Verify no button press is required
   - Test multiple back-and-forth exchanges (5+ turns)

5. **Microphone Permission**
   - On first launch, verify permission request appears
   - Grant permission and verify recording starts
   - If denied, verify error message and retry button work

---

### 2. **Welcome Message with Audio Sequence** (SECONDARY FEATURE)

**Location:** `app/welcome-message.tsx`

**What It Should Do:**
- Play welcome audio greeting in selected language
- Sequentially animate and play audio for 8 features:
  1. Daily Conversation
  2. Communication Coordination
  3. Health Monitoring
  4. Guardian Mode
  5. Social Engagement
  6. Cognitive Stimulation
  7. Wellness Encouragement
  8. Spiritual Support
- Show each feature with fade-in animation as its audio plays
- Dim previous features as new ones appear

**Test Cases:**
1. **Audio Sequence**
   - Navigate to welcome-message screen
   - Verify welcome audio plays first
   - Verify orb pulses green during audio playback
   - Verify each of 8 features appears sequentially
   - Verify audio plays for each feature
   - Verify animations are smooth

2. **Language Support**
   - Test all 6 languages: English, Japanese, Korean, Chinese (Traditional), Spanish, Italian
   - Verify welcome audio plays in correct language
   - Verify feature names display in correct language
   - Verify audio matches language selection

3. **Navigation**
   - Verify "Try Conversation" button opens demo-conversation screen
   - Verify language parameter passes correctly
   - Verify close button (X) returns to home screen

---

### 3. **Language Selection** (HOME SCREEN)

**Location:** `app/index.tsx`

**Test Cases:**
- Verify 6 language cards appear
- Tap each language and verify welcome-message opens
- Verify correct language code passes to next screen
- Verify smooth navigation animations

---

## 🐛 Known Issues to Verify Fixed

### Issue 1: "Recorder Not Prepared" Error

**Previous Error Message:**
```
[Audio] Error starting recording: Error: Prepare encountered an error: recorder not prepared.
[DemoConversation] Failed to initialize session: Error: Prepare encountered an error: recorder not prepared.
```

**Status:** Should be FIXED via:
- Added 200ms delay after `setAudioModeAsync()` before preparing recorder
- Proper audio mode configuration sequence
- Better error handling in `startAudioRecording()`

**Test:**
1. Open demo-conversation screen 5 times in a row
2. Verify NO "recorder not prepared" errors
3. Check console logs for successful recording initialization
4. If error occurs, document exact conditions and steps to reproduce

---

### Issue 2: iOS Audio Session Error (Code 1718449215)

**Previous Error Message:**
```
[Audio] Error starting recording: Error: Prepare encountered an error: Error Domain=NSOSStatusErrorDomain Code=1718449215 "(null)"
```

**Status:** Should be FIXED via:
- Proper audio session configuration for iOS
- Correct PCM16 audio format settings
- Better audio mode management

**Test:**
1. Test on multiple iOS devices (if available)
2. Test with silent mode ON and OFF
3. Test with headphones connected and disconnected
4. Test with Bluetooth headphones
5. Document any audio session errors with exact error codes

---

### Issue 3: Welcome Audio Not Playing

**Previous Issue:** "The previous How I can Help page played an animated sequence of audio supported content explaining how Tomo can work. It is no longer working."

**Status:** Should be FIXED via:
- Proper audio URL configuration in `constants/config.ts`
- Sequential playback logic with `playFeatureAudio()`
- Audio mode configuration before each playback
- Error handling and fallback logic

**Test:**
1. Navigate to welcome-message screen
2. Verify welcome audio plays immediately
3. Verify all 8 features play in sequence
4. Verify no audio skips or fails silently
5. Check console logs for any audio loading errors
6. If audio fails, verify URLs in `constants/config.ts` are valid

---

## 📱 Platform-Specific Testing

### iOS (PRIMARY PLATFORM - URGENT)

**Testing Environment:**
- iOS device running iOS 15.0 or later
- Test via Expo Go app
- QR code scan from Expo development server

**Critical iOS Tests:**
1. **Audio Permissions**
   - First launch permission flow
   - Settings app permission changes
   - Denied → granted recovery

2. **Audio Session Management**
   - Silent mode switch ON/OFF during conversation
   - Incoming phone call interruption
   - Lock screen behavior
   - Background/foreground transitions

3. **Recording Quality**
   - Test in quiet environment
   - Test in noisy environment (background TV, traffic)
   - Test with different speaking volumes
   - Test with accents and non-native speech

4. **Network Conditions**
   - Strong WiFi
   - Weak WiFi
   - 4G/5G cellular
   - Network switching mid-conversation
   - Airplane mode recovery

5. **Performance**
   - Response latency (target: <1 second)
   - Battery drain during 10-minute conversation
   - Memory usage over extended session
   - CPU usage during active recording

---

### Android (SECONDARY - If Time Permits)

**Testing Notes:**
- Android support exists but iOS is primary platform
- Similar test cases as iOS
- Additional test: different Android audio implementations (Samsung, Google, etc.)

---

### Web (TERTIARY - Basic Validation Only)

**Testing Notes:**
- Web support via React Native Web
- expo-av has limited web support
- Test basic navigation and UI only
- Voice features may have limitations

---

## 🔧 Technical Validation

### 1. **Console Log Verification**

**What to Look For:**

**GOOD Logs:**
```
[DemoConversation] Language from params: en Using: en
[DemoConversation] Initializing hands-free session...
[Audio] Permission already granted
[Audio] Setting audio mode for recording...
[Audio] Recording prepared
[Audio] Recording started successfully
[Realtime] Connecting to OpenAI Realtime API...
[Realtime] Connected
[Realtime] Speech detected
[Realtime] Speech ended
[Realtime] Audio response complete
```

**BAD Logs:**
```
[Audio] Error starting recording: <any error>
[DemoConversation] Failed to initialize session: <any error>
[Realtime] WebSocket error: <any error>
[Realtime] Connection failed: <any error>
```

### 2. **Network Inspection**

**WebSocket Connection:**
- URL: `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`
- Protocol: `realtime`, `openai-insecure-api-key.<KEY>`, `openai-beta.realtime-v1`
- Expected messages:
  - `session.update` (outgoing)
  - `input_audio_buffer.append` (outgoing, continuous)
  - `input_audio_buffer.speech_started` (incoming)
  - `input_audio_buffer.speech_stopped` (incoming)
  - `response.audio.delta` (incoming)
  - `response.audio.done` (incoming)

### 3. **Audio Format Validation**

**Expected Configuration:**
- Format: PCM16 (Linear PCM, 16-bit)
- Sample Rate: 24kHz
- Channels: 1 (Mono)
- Encoding: Little-endian

**iOS Specific:**
- Extension: `.wav`
- Output Format: `LINEARPCM`
- Bit Depth: 16
- Big Endian: false
- Float: false

**Android Specific:**
- Extension: `.m4a`
- Output Format: `MPEG_4`
- Audio Encoder: `AAC`
- Sample Rate: 24kHz

---

## 🔐 Environment Setup

### Required Environment Variables

**File:** `.env` (root directory)

```bash
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
EXPO_PUBLIC_ELEVENLABS_API_KEY=...
EXPO_PUBLIC_OPENAI_API_URL=https://api.openai.com/v1
```

**Validation Steps:**
1. Verify `.env` file exists in project root
2. Verify OpenAI API key starts with `sk-`
3. Verify OpenAI API key has Realtime API access
4. Test API key with curl:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $EXPO_PUBLIC_OPENAI_API_KEY"
   ```

**Note:** If API key is invalid or expired, you'll see WebSocket connection failures.

---

## 🎛️ Testing Configuration

### Audio URLs Configuration

**File:** `constants/config.ts`

Contains URLs for:
- Welcome audio (6 languages)
- Feature audio (8 features × 6 languages = 48 URLs)

**Validation:**
- All URLs should be valid HTTPS URLs
- URLs should point to accessible audio files
- Test by opening URLs in browser
- If URL returns 404 or is empty string, audio will skip

---

## 📊 Success Criteria

### Minimum Viable Testing (Must Pass)

- [ ] **Hands-free conversation works on iOS device**
  - Speech detection automatic (no button press)
  - AI responds automatically
  - Can sustain 5+ back-and-forth exchanges

- [ ] **Welcome audio sequence plays completely**
  - Welcome greeting audible
  - All 8 features animate and play audio
  - No crashes or silent failures

- [ ] **No critical errors in console**
  - No "recorder not prepared" errors
  - No audio session errors
  - No WebSocket connection failures

- [ ] **Microphone permissions work correctly**
  - First launch permission request
  - Proper error handling if denied
  - Retry functionality works

### Ideal Testing (Should Pass)

- [ ] **Works in various environments**
  - Quiet room
  - Noisy environment
  - With headphones

- [ ] **Network resilience**
  - Handles weak WiFi
  - Recovers from brief disconnections

- [ ] **All 6 languages tested**
  - Welcome audio in each language
  - Conversation in each language
  - Feature audio in each language

- [ ] **Performance acceptable**
  - <1 second response latency
  - No audio stuttering
  - No excessive battery drain

### Optional Testing (Nice to Have)

- [ ] Android device testing
- [ ] Web browser testing
- [ ] Long conversation (10+ minutes)
- [ ] Multiple consecutive sessions
- [ ] Interruption handling (speak while AI talks)

---

## 🐞 Bug Reporting Template

If you find a bug, please document using this format:

```markdown
### Bug: [Brief Description]

**Priority:** Critical / High / Medium / Low

**Component:** [File path, e.g., app/demo-conversation.tsx]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Console Logs:**
```
[Paste relevant console logs]
```

**Device Info:**
- Device: [e.g., iPhone 14 Pro]
- iOS Version: [e.g., 17.2]
- Expo Go Version: [e.g., 51.0.0]
- Network: [WiFi/4G/5G]

**Screenshots/Videos:**
[Attach if applicable]

**Reproducibility:** Always / Sometimes / Once

**Workaround:** [If any]

**Additional Notes:**
```

---

## 🔍 Debugging Tips

### 1. Enable Detailed Logging

The app has extensive console logging. Monitor these prefixes:
- `[DemoConversation]` - Main conversation flow
- `[Audio]` - Recording/playback operations
- `[Realtime]` - WebSocket API communication
- `[WelcomeMessage]` - Welcome screen audio

### 2. Check Audio Mode

If audio isn't working:
```javascript
const status = await Audio.getStatusAsync();
console.log('Audio mode:', status);
```

### 3. Test WebSocket Manually

Test OpenAI Realtime API separately:
```javascript
const ws = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17', [
  'realtime',
  `openai-insecure-api-key.${API_KEY}`,
  'openai-beta.realtime-v1'
]);

ws.onopen = () => console.log('Connected');
ws.onerror = (e) => console.error('Error:', e);
ws.onmessage = (e) => console.log('Message:', e.data);
```

### 4. Isolate Recording Issues

Test expo-av recording independently:
```javascript
const recording = new Audio.Recording();
await recording.prepareToRecordAsync({
  ios: {
    extension: '.wav',
    outputFormat: Audio.IOSOutputFormat.LINEARPCM,
    sampleRate: 24000,
    numberOfChannels: 1,
  }
});
await recording.startAsync();
```

### 5. Common Failure Points

**If "Connecting..." never progresses:**
- Check API key validity
- Check internet connection
- Check OpenAI service status

**If orb never turns red:**
- Check microphone permission
- Check recording started successfully
- Check WebSocket messages for VAD events

**If AI never responds:**
- Check audio chunks being sent
- Check WebSocket receiving `response.audio.delta`
- Check audio playback successful

---

## 📞 Key Code Locations

### Main Files
- `app/demo-conversation.tsx` - Hands-free conversation screen
- `app/welcome-message.tsx` - Welcome audio sequence
- `app/index.tsx` - Home/language selection
- `services/openai-realtime.ts` - WebSocket API + audio utilities
- `constants/config.ts` - Audio URLs and configuration
- `contexts/AuthContext.tsx` - Authentication state

### Helper Files
- `utils/permissions.ts` - Permission handling
- `constants/colors.ts` - Styling constants

### Documentation
- `PROJECT-STATUS.md` - Current implementation status
- `docs/PERMISSIONS.md` - Permission requirements
- `docs/AI-GUARDRAILS.md` - AI safety guidelines

---

## ⏱️ Estimated Testing Time

**Minimum Testing (Critical Path):**
- Environment setup: 15 minutes
- Hands-free conversation: 30 minutes
- Welcome audio: 15 minutes
- **Total: ~1 hour**

**Thorough Testing (Recommended):**
- Environment setup: 15 minutes
- Hands-free conversation (all scenarios): 1 hour
- Welcome audio (all languages): 45 minutes
- Permission flows: 20 minutes
- Network conditions: 30 minutes
- Bug documentation: 30 minutes
- **Total: ~3 hours**

**Complete Testing (Ideal):**
- All of thorough testing: 3 hours
- Android testing: 1 hour
- Web testing: 30 minutes
- Performance profiling: 1 hour
- Edge cases: 1 hour
- **Total: ~6.5 hours**

---

## 🚀 Next Steps After Testing

### If Tests Pass
1. Document test results
2. Update PROJECT-STATUS.md with device test confirmation
3. Prepare for App Store submission (requires EAS build)
4. Consider beta testing with real users

### If Tests Fail
1. Document all bugs using template above
2. Prioritize by severity (Critical > High > Medium > Low)
3. Fix critical bugs first
4. Re-test after fixes
5. Repeat until minimum viable criteria met

### If Intermittent Issues
1. Document exact conditions when failure occurs
2. Test reproducibility rate
3. Add more detailed logging
4. Consider environmental factors
5. Test on multiple devices

---

## 📋 Testing Checklist

Copy and use this checklist during testing:

```markdown
## Testing Session: [Date]

**Tester:** [Name]
**Device:** [Device model]
**iOS Version:** [Version]
**Expo Go:** [Version]

### Setup
- [ ] .env file configured
- [ ] API keys validated
- [ ] App loads without errors
- [ ] TypeScript compilation successful

### Hands-Free Conversation
- [ ] Initial connection successful
- [ ] Microphone permission granted
- [ ] Speech detection works (orb turns red)
- [ ] AI responds automatically (orb turns green)
- [ ] Audio playback clear and audible
- [ ] Can sustain 5+ conversation turns
- [ ] No "recorder not prepared" errors
- [ ] No audio session errors

### Welcome Audio
- [ ] Welcome greeting plays
- [ ] All 8 features display sequentially
- [ ] Feature audio plays for each item
- [ ] Animations smooth
- [ ] "Try Conversation" button works
- [ ] Language parameter passes correctly

### Languages
- [ ] English (en)
- [ ] Japanese (ja)
- [ ] Korean (ko)
- [ ] Chinese Traditional (zh-TW)
- [ ] Spanish (es)
- [ ] Italian (it)

### Edge Cases
- [ ] Silent mode ON
- [ ] Silent mode OFF
- [ ] Headphones connected
- [ ] Bluetooth headphones
- [ ] Weak network
- [ ] Network disconnection recovery
- [ ] Background/foreground transition
- [ ] Multiple consecutive sessions

### Performance
- [ ] Response latency <1 second
- [ ] No audio stuttering
- [ ] No app crashes
- [ ] Acceptable battery drain

### Bugs Found
[List any bugs using bug template]

### Overall Assessment
**Status:** Pass / Fail / Needs Work

**Notes:**
```

---

## 📚 Reference Documentation

### Related Documents
- `PROJECT-STATUS.md` - Implementation status and architecture
- `docs/PERMISSIONS.md` - Permission handling guide
- `docs/AI-GUARDRAILS.md` - AI safety guidelines
- `README.md` - Project overview

### External Resources
- [OpenAI Realtime API Docs](https://platform.openai.com/docs/guides/realtime)
- [Expo Audio Docs](https://docs.expo.dev/versions/latest/sdk/audio/)
- [React Native WebSocket](https://reactnative.dev/docs/network#websocket-support)

### Support Contacts
- For development issues: Check console logs first
- For API issues: Verify environment variables
- For audio issues: Check audio mode configuration
- For WebSocket issues: Verify network connectivity

---

**Document Maintained By:** Development Team  
**Last Review:** December 30, 2025  
**Next Review:** After physical device testing completion

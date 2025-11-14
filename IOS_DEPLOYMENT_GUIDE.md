# 📱 CalyMob iOS Deployment Guide

**Status**: ✅ Apple Developer Account Approved | 🚀 Ready for Codemagic Setup

---

## ✅ Completed

### Phase 1: Prerequisites
- ✅ Apple Developer Account approved ($99/year)
- ✅ iOS project configured
- ✅ Bundle ID: `be.calypsodc.calymob`
- ✅ App Name: CalyMob
- ✅ Firebase iOS configuration exists (`GoogleService-Info.plist`)
- ✅ Camera & Photo Library permissions in Info.plist
- ✅ Codemagic account ready
- ✅ Android build working in Codemagic

---

## 📋 Next Steps: iOS Deployment with Codemagic

### Step 1: Create App Store Connect API Key

This allows Codemagic to automatically upload builds to TestFlight.

**1.1 Go to App Store Connect**
- URL: https://appstoreconnect.apple.com/access/api
- Sign in with your Apple Developer account

**1.2 Generate API Key**
1. Click on the **"Keys"** tab
2. Click **"+"** to generate a new key
3. Fill in:
   - **Name**: `Codemagic CI/CD`
   - **Access**: **App Manager** (recommended) or Developer
4. Click **"Generate"**

**1.3 Download and Save** ⚠️ IMPORTANT
1. **Click "Download API Key" immediately** - you can only download once!
2. Save the `.p8` file securely (e.g., `/Users/jan/Documents/CalyMob_API_Key/`)
3. Note down from the page:
   - **Issuer ID** (at top, format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
   - **Key ID** (in key row, format: `XXXXXXXXXX`)

**Example**:
```
Issuer ID: 12345678-1234-1234-1234-123456789012
Key ID: ABC1234DEF
File: AuthKey_ABC1234DEF.p8
```

---

### Step 2: Add API Key to Codemagic

**2.1 Go to Codemagic Teams Settings**
- URL: https://codemagic.io/teams
- Click on your team name
- Navigate to **"Integrations"** in left sidebar

**2.2 Add App Store Connect Integration**
1. Scroll to **"App Store Connect"** section
2. Click **"Add key"** or **"Connect"**
3. Fill in the three values from Step 1:
   - **Issuer ID**: Paste the UUID from App Store Connect
   - **Key ID**: Paste the 10-character key ID  
   - **API Key**: Click "Choose file" and upload the `.p8` file
4. Click **"Save"**

✅ Codemagic can now automatically:
- Sign your iOS builds
- Upload to TestFlight
- Manage provisioning profiles
- Handle certificates

---

### Step 3: Update codemagic.yaml for iOS

I'll add an iOS build workflow to your `codemagic.yaml` file.

**What it will do**:
- Build iOS IPA file (signed for App Store)
- Upload to TestFlight automatically
- Email you when complete
- Manual trigger only (like Android)

---

### Step 4: Create App in App Store Connect

Before building, you need to create the app entry in App Store Connect.

**4.1 Go to App Store Connect**
- URL: https://appstoreconnect.apple.com
- Click **"My Apps"**

**4.2 Create New App**
1. Click **"+"** button → **"New App"**
2. Fill in:
   - **Platforms**: ☑️ iOS
   - **Name**: `CalyMob`
   - **Primary Language**: French (France)
   - **Bundle ID**: Select `be.calypsodc.calymob`
     - If not in dropdown, it will be registered on first build
   - **SKU**: `calymob-001` (internal identifier, your choice)
   - **User Access**: Full Access
3. Click **"Create"**

**4.3 App Information** (Basic, can complete later)
- **Subtitle** (optional): Calypso Diving Club
- **Category**: 
  - Primary: **Productivity**
  - Secondary: **Business** (optional)
- **Content Rights**: No third-party content

You can fill in detailed store listing later. For now, just create the app so Codemagic can upload builds.

---

### Step 5: Trigger iOS Build in Codemagic

Once Steps 1-4 are complete:

**5.1 Push Updated codemagic.yaml**
```bash
cd /Users/jan/Documents/GitHub/CalyMob
git add codemagic.yaml
git commit -m "Add iOS build workflow"
git push origin main
```

**5.2 Trigger Build in Codemagic**
1. Go to Codemagic app page
2. Click **"Start new build"**
3. Select workflow: `ios-manual-build`
4. Select branch: `main`
5. Click **"Start new build"**

**5.3 Wait for Build**
- Build time: ~15-30 minutes (first time)
- You'll receive email when complete
- Check for errors in build logs

**5.4 Check TestFlight**
1. Go to App Store Connect → Your App → **TestFlight** tab
2. Build will appear under **"iOS Builds"**
3. Wait for **"Processing"** to complete (~10-30 min)
4. Status will change to **"Ready to Submit"** or **"Ready to Test"**

---

### Step 6: Set Up TestFlight Testing

**6.1 Internal Testing** (Recommended First)
1. In App Store Connect → TestFlight
2. Click **"Internal Testing"** in sidebar
3. Click **"+"** next to "Internal Group"
4. Create group: **"Calypso DC Team"**
5. Add testers:
   - Click **"+"** next to Testers
   - Add email addresses (must have Apple IDs)
   - Up to 100 internal testers (free)
6. Enable **"Automatic Distribution"** for new builds
7. Click **"Save"**

**6.2 Testers Receive Email**
- Apple sends invitation automatically
- Testers must:
  1. Download **TestFlight** app from App Store
  2. Accept invitation from email
  3. Install CalyMob from TestFlight

**6.3 External Testing** (Optional - Public Beta)
- Requires App Review (1-2 days)
- Up to 10,000 external testers
- Can share public link
- Use for wider club member testing

---

### Step 7: Test the iOS App

**7.1 Install via TestFlight**
1. On your iPhone, open App Store
2. Search and install **"TestFlight"**
3. Open TestFlight
4. Accept invitation for CalyMob
5. Tap **"Install"**

**7.2 Test Core Features**
- ✅ Login with Firebase credentials
- ✅ View expenses list
- ✅ Add new expense
- ✅ Take photo with camera
- ✅ Upload receipt photo
- ✅ View operations list
- ✅ Sync with web app

**7.3 Report Issues**
- TestFlight has built-in feedback mechanism
- Take screenshots of issues
- TestFlight captures crash logs automatically

---

### Step 8: Submit to App Store (Optional)

If you want CalyMob publicly available in App Store (not just TestFlight):

**8.1 Complete Store Listing**
In App Store Connect → Your App:

1. **App Information**:
   - Privacy Policy URL (required)
   - Category: Productivity
   - Contact information

2. **Pricing and Availability**:
   - Price: Free
   - Availability: Belgium (or worldwide)

3. **App Privacy**:
   - Complete privacy questionnaire
   - Data types collected: Name, Email, Photos

4. **Prepare for Submission**:
   - Screenshots (minimum 1, max 10)
     - iPhone 6.7" (2796 x 1290 px)
   - App Description (in French)
   - Keywords
   - Support URL
   - Marketing URL (optional)

**8.2 Screenshots**

Take screenshots using iOS Simulator or real device:

**On Mac with Simulator**:
```bash
# Open simulator
open -a Simulator

# Select device: iPhone 15 Pro Max
# Run app
cd /Users/jan/Documents/GitHub/CalyMob
flutter run -d "iPhone 15 Pro Max"

# Take screenshots with Cmd+S
# Screenshots saved to Desktop
```

**Required Screenshots** (for 6.7" iPhone):
1. Login screen
2. Home/Dashboard
3. Expenses list
4. Add expense form
5. Operations view

**8.3 App Review Information**
- **Sign-in required**: Yes
- **Demo account**:
  - Email: [create demo account]
  - Password: [demo password]
- **Notes for reviewer**: "App for Calypso Diving Club members"

**8.4 Submit for Review**
1. Complete all required fields
2. Select build from TestFlight
3. Click **"Add for Review"**
4. Click **"Submit to App Review"**

**8.5 Review Timeline**
- Average: 24-48 hours
- Can take up to 7 days
- First submission often gets questions
- Be ready to respond quickly

---

## 🎯 Quick Summary

### What You Need:
1. ✅ Apple Developer Account ($99/year) - **DONE**
2. ⏳ App Store Connect API Key (.p8 file)
3. ⏳ API Key added to Codemagic
4. ⏳ App created in App Store Connect
5. ��� iOS workflow enabled in codemagic.yaml
6. ⏳ Build triggered in Codemagic
7. ⏳ TestFlight configured
8. ⏳ Testers invited

### Timeline:
- **API Key setup**: 10 minutes
- **Codemagic configuration**: 15 minutes
- **App Store Connect setup**: 20 minutes
- **First build**: 20-30 minutes
- **TestFlight processing**: 10-30 minutes
- **Ready for testing**: ~1.5-2 hours total

### Costs:
- Apple Developer: $99/year
- TestFlight: Free (unlimited)
- App Store publishing: Free (included)
- **Total**: $99/year

---

## 🔧 Troubleshooting

### "No App Store Connect API key found"
**Solution**: Add API key in Codemagic Teams → Integrations → App Store Connect

### "Bundle ID not found"
**Solution**: The bundle ID `be.calypsodc.calymob` will be auto-registered on first build

### "Code signing failed"
**Solution**: 
1. Verify API key is correctly added to Codemagic
2. Check that your Apple Developer account is active
3. Try automatic signing in Codemagic

### "Missing compliance"
**Question in App Store Connect**: "Does your app use encryption?"
**Answer**: Yes, but exempt (only uses standard HTTPS)
- Select "Yes" → "No" to custom encryption

### "Build processing failed"
**Solution**: Check build logs in Codemagic for specific error
- Common: Missing dependencies, CocoaPods issues
- Usually fixed by updating Podfile.lock

---

## 📞 Resources

- **App Store Connect**: https://appstoreconnect.apple.com
- **Apple Developer Portal**: https://developer.apple.com
- **Codemagic iOS Docs**: https://docs.codemagic.io/yaml-code-signing/signing-ios/
- **TestFlight Guide**: https://developer.apple.com/testflight/
- **Flutter iOS Deployment**: https://docs.flutter.dev/deployment/ios

---

## ✅ Current Status

- [x] Apple Developer Account approved
- [x] iOS project configured (bundle ID, Firebase)
- [ ] App Store Connect API key created
- [ ] API key added to Codemagic
- [ ] App created in App Store Connect
- [ ] iOS workflow enabled in codemagic.yaml
- [ ] First iOS build successful
- [ ] TestFlight configured
- [ ] App tested on iOS device
- [ ] **LIVE on TestFlight** 🎉

---

**Next Action**: Go to https://appstoreconnect.apple.com/access/api and create an API key for Codemagic.

**Document Created**: 2025-11-14
**Last Updated**: 2025-11-14

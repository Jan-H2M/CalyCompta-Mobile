# Google Play Store Setup Guide - CalyMob

## 📋 Overview

This guide walks you through publishing CalyMob to the Google Play Store.

**App Details:**
- **Package Name**: `be.calypsodc.calymob`
- **App Name**: CalyMob
- **Version**: 1.0.4 (Build 6)
- **Target**: Calypso Diving Club members

---

## Step 1: Create Google Play Developer Account

### 1.1 Registration
1. Go to: https://play.google.com/console/signup
2. Sign in with your Google account (preferably the club's email)
3. Pay the one-time registration fee: **$25 USD**
4. Complete your developer profile:
   - **Developer name**: Calypso DC
   - **Email address**: [Your contact email]
   - **Phone number**: [Your phone]
   - **Website**: [Club website if available]

### 1.2 Accept Terms
- Read and accept the Developer Distribution Agreement
- Complete account verification (may take 24-48 hours)

---

## Step 2: Create Your App

### 2.1 Basic Information
1. In Play Console, click **"Create app"**
2. Fill in:
   - **App name**: CalyMob
   - **Default language**: French (France) - fr-FR
   - **App or game**: App
   - **Free or paid**: Free
   - **Declarations**:
     - ☑️ I confirm this app complies with Google Play policies
     - ☑️ I confirm this app complies with US export laws

### 2.2 App Category
- **Category**: Productivity (or Business)
- **Tags**: diving, club management, expense tracking

---

## Step 3: Store Listing

### 3.1 App Details

**Short description** (80 characters max):
```
Application mobile pour la gestion du club de plongée Calypso DC
```

**Full description** (4000 characters max):
```
CalyMob - Application Mobile Calypso Diving Club

CalyMob est l'application officielle du club de plongée Calypso DC, conçue pour faciliter la gestion des dépenses et des opérations du club.

🌊 FONCTIONNALITÉS PRINCIPALES

📸 Gestion des Notes de Frais
• Soumettre des notes de frais avec photos
• Joindre des reçus directement depuis votre appareil photo
• Suivi du statut de vos demandes
• Historique complet de vos dépenses

🤿 Suivi des Opérations
• Consulter les opérations du club
• Informations en temps réel
• Historique des plongées et activités

☁️ Synchronisation en Temps Réel
• Données synchronisées avec l'application web CalyCompta
• Mises à jour instantanées
• Accès depuis n'importe où

📱 Support Hors Ligne
• Consultez vos données même sans connexion
• Synchronisation automatique dès que vous êtes en ligne

🔒 Sécurité
• Authentification Firebase
• Données sécurisées dans le cloud
• Protection de vos informations personnelles

📊 Interface Intuitive
• Design moderne et épuré
• Navigation facile
• Interface en français

Cette application est destinée aux membres du club de plongée Calypso DC pour gérer leurs activités et dépenses.

Pour plus d'informations sur le club Calypso DC, contactez-nous via l'application.
```

### 3.2 Graphics Assets

#### App Icon (512x512 PNG)
- Already available: `assets/images/logo-vertical.png`
- Resize to 512x512 if needed
- Must be PNG, 32-bit, no alpha channel

#### Feature Graphic (1024x500 JPG/PNG)
- Create a banner with Calypso logo and app name
- Required for store listing

#### Screenshots (Required)
Take 2-8 screenshots of the app:
1. **Login Screen** - Shows Calypso logo and login form
2. **Home/Landing Screen** - Main dashboard
3. **Expenses List** - Show expense tracking
4. **Add Expense** - Form with photo upload
5. **Operations List** - Operations tracking

**Screenshot Requirements:**
- Minimum: 320px
- Maximum: 3840px
- JPEG or 24-bit PNG (no alpha)
- At least 2 screenshots required

---

## Step 4: Content Rating

### 4.1 Questionnaire
Complete the content rating questionnaire:

**Category**: Utility/Productivity

**Questions** (expected answers for CalyMob):
- Violence: None
- Sexuality: None
- Profanity: None
- Controlled substances: None
- User interaction: No (members only)
- Shares user location: No
- Personal info access: Yes (email, name for Firebase Auth)

**Expected Rating**: PEGI 3 / Everyone

---

## Step 5: App Content

### 5.1 Privacy Policy
You need a privacy policy URL. Create a simple page explaining:
- What data you collect (email, name, expense photos)
- How you use it (club management)
- Firebase/Google services
- User rights

**Template location**: Create at `privacy-policy.html` and host it

### 5.2 App Access
- **Special access**: None required
- **App uses Google Play App Signing**: Yes (recommended)

### 5.3 Ads
- **Contains ads**: No
- **In-app purchases**: No

### 5.4 Target Audience
- **Target age group**: 18 and over
- **Appeals to children**: No

---

## Step 6: Upload App Bundle

### 6.1 Get the .aab File
After Codemagic build completes:
1. Go to Codemagic build page
2. Download the `.aab` file from artifacts
3. File will be named: `app-release.aab`

### 6.2 Create Release

#### Option A: Internal Testing (Recommended First)
1. Go to **Testing** → **Internal testing**
2. Click **"Create new release"**
3. Upload `app-release.aab`
4. Add release notes:
   ```
   Version 1.0.4
   • Première version publique de CalyMob
   • Gestion des notes de frais avec photos
   • Suivi des opérations du club
   • Synchronisation en temps réel avec CalyCompta
   • Support hors ligne
   ```
5. Click **"Save"** then **"Review release"**
6. Click **"Start rollout to Internal testing"**

#### Create Tester List
1. Go to **Testing** → **Internal testing** → **Testers**
2. Create a new list: "Calypso DC Members"
3. Add tester email addresses (Google accounts)
4. Save

**Sharing with testers:**
- Copy the opt-in URL provided by Google Play
- Send to club members via email
- They click the link and can install the app

#### Option B: Production Release
1. Complete ALL store listing requirements first
2. Go to **Production** → **Releases**
3. Click **"Create new release"**
4. Upload `app-release.aab`
5. Add release notes (same as above)
6. Submit for review

**Review time**: 1-7 days typically

---

## Step 7: App Signing

### 7.1 Google Play App Signing (Recommended)
- Let Google Play manage your app signing key
- Upload your keystore as "upload key"
- Google creates and manages the "app signing key"
- Benefit: Can reset upload key if lost

**Your current keystore:**
- Location: `android/calymob-release.keystore`
- Password: CalyMob2024!
- Alias: calymob

**This keystore will become your "upload key"**

---

## Step 8: Pre-Launch Checklist

Before submitting to production:

### Required
- ☑️ Google Play Developer account created ($25 paid)
- ☑️ App created in Play Console
- ☑️ Store listing completed (title, description, screenshots)
- ☑️ Content rating completed
- ☑️ Privacy policy URL provided
- ☑️ Target audience selected
- ☑️ App category selected
- ☑️ App icon uploaded (512x512)
- ☑️ Feature graphic uploaded (1024x500)
- ☑️ At least 2 screenshots uploaded
- ☑️ .aab file uploaded
- ☑️ Release notes added

### Recommended
- ☑️ Test in Internal Testing track first
- ☑️ Verify app works on multiple devices
- ☑️ Test all features (login, expenses, operations)
- ☑️ Verify Firebase connectivity
- ☑️ Test photo upload functionality

---

## Step 9: After Publication

### Internal Testing
- **Available**: Immediately after rollout
- **Access**: Via opt-in URL shared with testers
- **Updates**: Can update instantly without review

### Production
- **Available**: Within a few hours after approval
- **Updates**: Require review (typically 1-3 days)
- **Searchable**: Yes, in Google Play Store

### Updating the App
1. Increment version in `pubspec.yaml`:
   ```yaml
   version: 1.0.5+7  # Increment both numbers
   ```
2. Build new .aab via Codemagic
3. Upload to appropriate track
4. Add release notes describing changes

---

## Troubleshooting

### Common Issues

**Issue**: "Your app contains code that requests user data"
- **Solution**: Add privacy policy URL

**Issue**: "App bundle not signed correctly"
- **Solution**: Verify Codemagic keystore configuration

**Issue**: "Version code conflict"
- **Solution**: Increment version code in pubspec.yaml

**Issue**: "Missing required graphics"
- **Solution**: Upload app icon (512x512) and feature graphic (1024x500)

---

## Support Resources

- **Google Play Console**: https://play.google.com/console
- **Play Console Help**: https://support.google.com/googleplay/android-developer
- **Firebase Console**: https://console.firebase.google.com
- **Codemagic Builds**: https://codemagic.io

---

## Quick Reference

**App Package**: `be.calypsodc.calymob`
**Current Version**: 1.0.4 (Build 6)
**Firebase Project**: calycompta
**Keystore Password**: CalyMob2024!
**Keystore Alias**: calymob

---

## Next Steps

1. ✅ Codemagic build completes
2. ⏳ Create Google Play Developer account
3. ⏳ Complete store listing
4. ⏳ Upload .aab to Internal Testing
5. ⏳ Test with club members
6. ⏳ Promote to Production when ready

---

**Document Created**: 2025-11-13
**Last Updated**: 2025-11-13

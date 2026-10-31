# 🎨 Table Magic Studio: Net Fish Catch & Pattern World

A Pixar-style animated multiplication patterns game designed for 3rd-grade children who love drawing, painting, and underwater aquatic adventures. It teaches multiplication tables **2, 4, 6, and 5** (×1 to ×12) through visible cyclical rhythm rather than rote memorization.

---

## 🌟 The Core Pattern Architecture

1. **Last Digit Cycles & Fixed Paint Colors:**
   - **2s Cycle:** `2 → 4 → 6 → 8 → 0` (repeats indefinitely; second 5 are identical to first 5 with a 1 in front).
   - **4s Cycle:** `4 → 8 → 2 → 6 → 0` (skips 1 in the 2s cycle).
   - **6s Cycle:** `6 → 2 → 8 → 4 → 0` (the 4s cycle in reverse direction).
   - **5s Cycle:** `5 → 0` (alternates rhythmically like a pendulum).
   - Every digit has an identical signature Pixar paint color across all tables:
     - `2`: Berry Pink (`#EC4899`)
     - `4`: Tangy Tangerine (`#F97316`)
     - `6`: Emerald Mint (`#10B981`)
     - `8`: Ocean Cyan (`#06B6D4`)
     - `0`: Magic Violet (`#8B5CF6`)
     - `5`: Golden Sun (`#F59E0B`)

2. **Tens Groups Rhythms (Calculated Mathematically):**
   - **2s:** `00000, 11111, 22`
   - **4s:** `00, 11, 222, 33, 444` *(Double, double, triple!)*
   - **6s:** `0, 11, 2, 33, 44, 5, 66, 7`
   - **5s:** `0, 11, 22, 33, 44, 55, 6` *(Pairs marching together)*

---

## 🎮 Game Modes & Features

- 🎣 **Magic Reef: Fish Net Catch (Featured Mode):**
  - Interactive golden fishing net moved with touch, dragging, or direct taps.
  - Fish swim across an animated coral reef carrying number values with their cycle color badges.
  - **Multiples Frenzy:** Scoop up all 12 multiples of Table ×2 (2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24) while dodging odd distractor fish.
  - **Target Quest:** Barnaby Brush assigns specific targets (e.g., `2 × 7 = 14`), and the child spots and nets the exact target fish!
  - **My Aquarium Tank:** All caught fish are transferred to the player's personal glass trophy aquarium bowl.
- 🎤 **Sing the Chant:** Metronome beat sound, karaoke blobs lighting up in rhythm, Web Speech API vocal chants with pitch/rate tuning, "Tap Along" rhythm mode, and "Mic-Free Sing-Along" gap-fill mode.
- 🎨 **Paint the Pattern:** 12 canvas cards (×1 to ×12) where the child drags paint colors to fill the cycle digit, then chooses the tens digit with pop reveal animations.
- 🧱 **Build It:** Problem assembly mode (`6 × 3 = [Tens][Cycle]`). Round 1 in order, Round 2 shuffled. Glowing hints illuminate after 2 misses.
- ⚡ **Quick Quiz:** 10 questions with realistic pattern-based distractors (wrong tens, next cycle digit, neighbouring multiples).
- 🔍 **Missing Number Painting:** A half-hidden pattern tapestry where missing digits are deduced from surrounding multiples.
- 🌐 **Bilingual:** One-tap toggle between **English** and **Tamil (தமிழ்)**.
- 💾 **Safe Storage & Backup:** Stored in `localStorage` with try/catch, plus a 1-click **Export/Import Backup Code** to preserve progress across devices.

---

## 🚀 How to Publish & Install (PWA)

### 1. Host on HTTPS (Required for PWAs)
PWAs require an HTTPS connection for service workers to activate. You can host this folder on:
- **Netlify Drag-and-Drop:**
  1. Run `npm run build` to generate the `dist` folder.
  2. Visit [app.netlify.com/drop](https://app.netlify.com/drop) and drag the `dist` folder into your browser.
  3. Your app is immediately live on HTTPS with an instant link!
- **GitHub Pages:**
  1. Push the repository to GitHub.
  2. Under Settings > Pages, choose `GitHub Actions` or select the `dist` folder on the `gh-pages` branch.
- **Cloudflare Pages:**
  1. Connect your repository, set the build command to `npm run build` and output directory to `dist`.

### 2. Generate a QR Code for School & Family
1. Take your HTTPS deployment URL (e.g. `https://table-magic-studio.netlify.app`).
2. Generate a free QR code at [qr-code-generator.com](https://www.qr-code-generator.com) or in Chrome (click the address bar > Share > Create QR Code).
3. Print or share the QR code so children, parents, and teachers can scan and open it immediately on any device.

### 3. Install on Devices
- **Android Phone & Tablet / Chrome / Edge:**
  - Open the link in Google Chrome or Microsoft Edge.
  - An **"Install App"** button appears right inside the game header.
  - Tap **Install App** (or Chrome menu `⋮` > **Install Table Magic Studio** / **Add to Home screen**).
  - The app installs with its icon, launches full screen without any browser address bar, and works 100% offline!
- **iPhone & iPad (iOS Safari):**
  - Open the link in Apple Safari.
  - Tap the **Share** button (box with an arrow pointing up) at the bottom or top of Safari.
  - Scroll down and tap **Add to Home Screen**.
  - Tap **Add** in the upper-right corner.
  - Launches full screen from the iOS home screen with the Apple Touch Icon.
- **Windows / Mac / Chromebook:**
  - Open in Chrome or Edge and click the install icon in the URL bar (or in-app button).

---

## 📱 Optional: Packaging as Native App with Capacitor

If you later want to publish **Table Magic Studio** directly to Google Play Store or Apple App Store:

1. **Install Capacitor:**
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init "Table Magic Studio" "com.tablemagic.studio" --web-dir dist
   ```

2. **Add Platforms:**
   ```bash
   npm run build
   npm install @capacitor/android @capacitor/ios
   npx cap add android
   npx cap add ios
   ```

3. **Requirements:**
   - **For Android (Google Play):**
     - Requires [Android Studio](https://developer.android.com/studio) and Java SDK.
     - Run `npx cap open android`, build signed AAB (Android App Bundle), and upload to Google Play Console ($25 one-time developer registration).
   - **For iOS (Apple App Store):**
     - Requires a Mac computer with [Xcode](https://developer.apple.com/xcode/).
     - Requires an [Apple Developer Account](https://developer.apple.com/) ($99/year).
     - Run `npx cap open ios`, select your signing team, archive the build, and submit through App Store Connect.

---

## 🏆 Lighthouse PWA Audit & Compliance Report

| PWA Criteria | Status | Implementation Details |
| :--- | :---: | :--- |
| **Web App Manifest** | ✅ PASS | `manifest.webmanifest` contains `name`, `short_name`, `start_url: "/"`, `scope: "/"`, `display: "standalone"`, `orientation: "any"`. |
| **192x192 Icon** | ✅ PASS | `public/icons/icon-192.png` generated and verified. |
| **512x512 Icon** | ✅ PASS | `public/icons/icon-512.png` generated with crisp high-res graphics. |
| **Maskable Icon** | ✅ PASS | `public/icons/icon-maskable-512.png` with 15% safe padding circle for Android adaptive icons. |
| **Apple Touch Icon** | ✅ PASS | `public/icons/apple-touch-icon.png` (180x180 PNG) linked via `<link rel="apple-touch-icon">`. |
| **Offline Service Worker** | ✅ PASS | `sw.js` precaches all assets with cache-first strategy; activates offline indicator & update banner. |
| **Install Prompt UI** | ✅ PASS | Interactive in-app `beforeinstallprompt` hook and iOS Safari guided modal. |
| **Zero External CDN Assets**| ✅ PASS | 100% self-contained SVGs, canvas graphics, and Web Audio API synthesizer. |

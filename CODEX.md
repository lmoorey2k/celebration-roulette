# Celebration Restaurant Roller — Codex Context

> Use this file to brief Codex (or any AI coding agent) on the project.
> It captures the current state, recent design decisions, and the remaining task list.
> When asking another coding agent to continue work, point it here first.

---

## 1. Project Overview

**Name:** Celebration Restaurant Roller
**Purpose:** A slot-machine-style restaurant picker for visitors and locals in Celebration, Florida, intended for `visitcelebration.org` and later app adaptation.
**Target platform:** Expo / React Native with web as the current primary review surface.
**Current tone target:** playful, polished, tourism-friendly, and branded for Visit Celebration — **not** a literal casino clone.

### Naming note
The interaction is a **slot machine**, not a roulette wheel. The visible naming and brand language should move away from “roulette” over time, even if some technical config values still temporarily use older names.

### Cabinet direction note
The plain styled React Native cabinet approach was rejected. The new direction is to use a cabinet graphic as the primary visual layer and place live UI overlays inside it.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Expo SDK 54 + React Native |
| Routing | Expo Router v4 (`app/` directory) |
| Language | TypeScript |
| Animations | React Native `Animated` API |
| Audio | Web Audio API helpers in `utils/audio.ts` |
| Haptics | `expo-haptics` |
| Styling | `StyleSheet.create` + selective web-only inline styles |
| Data | Static JSON in `data/restaurants.json` |

Constraints still apply: no new npm dependencies, no external CSS files, and prefer existing component structure unless there is a strong UX reason to refactor.

---

## 3. File Map

```text
app/
  _layout.tsx
  index.tsx            Home screen
  list.tsx             Manage restaurant list
  result.tsx           Legacy / likely unused

components/
  SlotMachine.tsx      Main slot-machine UI and spin logic
  CategoryFilter.tsx   Category tabs / segmented control source
  WinnerModal.tsx      Legacy or alternate winner presentation
  Confetti.tsx         Confetti overlay
  RestaurantCard.tsx   Used in list screen
  RouletteWheel.tsx    Legacy / likely unused
  BackgroundPattern.tsx Legacy / likely unused
  SpinButton.tsx       Legacy / likely unused

constants/
  theme.ts             Shared colors, sizes, spacing, radii, shadows

context/
  RestaurantContext.tsx

hooks/
  useRestaurants.ts

utils/
  audio.ts
  maps.ts
  spin.ts              Legacy / likely unused

data/
  restaurants.json

assets/images/
  slot-machine-cabinet.png   Approved cabinet artwork to use as the visual source of truth
```

---

## 4. Current visual source of truth

The cabinet direction should now follow the latest AI-generated slot machine reference supplied by the user.

### Approved asset
Use this file as the source-of-truth cabinet image:
- `/Users/leemoore/Downloads/Celebration-Roulet/assets/images/slot-machine-cabinet.png`

### Visual characteristics to preserve
- front-facing slot machine silhouette
- Visit Celebration branding in the marquee
- `Food & Drink Pick` plaque
- large blank central reel window for live overlay
- attached right-side lever
- lower green panel suitable for result / CTA use

### What this means
Do **not** continue trying to recreate the cabinet look from generic rounded cards, soft panels, and improvised lever styling alone. The cabinet should now be treated as an art-directed asset-backed component.

---

## 5. New implementation direction

### Primary strategy
Use the slot machine image as a **static cabinet layer** and place live UI overlays inside it.

### Overlay regions to implement
1. **Cabinet image layer**
   - Render the approved cabinet image as the main machine visual.
   - It should define the silhouette and all decorative hardware.

2. **Reel overlay zone**
   - Place the actual spinning restaurant reels inside the large blank central window.
   - This is the main interactive viewport.
   - The reels should align precisely inside the framed opening.

3. **Lever interaction zone**
   - The visible lever may remain part of the cabinet image.
   - If interactive alignment is difficult, use an invisible press target over the lever region or let the spin button remain primary while the lever is decorative.

4. **Bottom result zone**
   - Use the lower green panel as a future result / CTA / winner name area if practical.
   - If not implemented immediately, keep it as visual support only.

---

## 6. What Codex should do next

### Primary file to edit
- `components/SlotMachine.tsx`

### Objective
Refactor `SlotMachine.tsx` so it stops trying to draw the cabinet entirely with styled blocks and instead uses the approved cabinet image-backed layout with live animated reels overlaid into the central opening.

### Required tasks
- Add support for the cabinet image asset at `assets/images/slot-machine-cabinet.png`.
- Size the cabinet image responsively for web/mobile.
- Define a positioned overlay container for the reel window.
- Preserve current reel spin logic and animation behavior.
- Remove or dramatically simplify the faux cabinet, faux marquee, and faux lever styling that is now obsolete.
- Keep categories above the machine unless a better integrated placement is implemented.
- Keep the winner/result behavior functioning.
- Make the overlay proportions visually match the approved cabinet reference.

### Interaction guidance
- If true lever interaction is too difficult in this pass, prioritize a working and beautiful reel overlay first.
- The lever can temporarily be decorative if needed, provided the spin button remains clear and premium.
- Do not sacrifice the cabinet look just to keep a technically interactive lever in this pass.

---

## 7. Recommended asset workflow

### Current status
The approved cabinet asset is now already present in the repo at:
- `assets/images/slot-machine-cabinet.png`

### Best-case implementation path
1. Use `slot-machine-cabinet.png` as the machine background layer.
2. Position the reel viewport with absolute layout over the blank center window.
3. Optionally add an invisible lever hit target over the artwork’s lever area.
4. Later, optionally replace with a transparent or better-cropped production asset if needed.

---

## 8. What not to do

- Do not continue polishing the fully CSS/StyleSheet-based faux cabinet as the main visual solution.
- Do not over-engineer the lever if the visible cabinet image already solves the silhouette problem.
- Do not reintroduce roulette-wheel language.
- Do not let the reel overlay spill beyond the image window bounds.

---

## 9. Codex continuation prompt template

Use this after reading this file:

```text
Using CODEX.md as the source of truth, refactor components/SlotMachine.tsx to use the approved slot machine cabinet image as the main visual layer.

Use this asset:
`/Users/leemoore/Downloads/Celebration-Roulet/assets/images/slot-machine-cabinet.png`

Goal:
Replace the current faux styled cabinet with an image-backed cabinet approach that matches the approved Visit Celebration slot machine artwork.

Primary tasks:
- use the cabinet image asset as the machine background
- position the live spinning reel overlay inside the blank central window
- preserve the current spin logic and reel animation behavior
- keep the component responsive on web/mobile
- simplify or remove obsolete fake cabinet / fake lever styling
- keep the spin interaction working even if the visible lever is only decorative for now
- avoid roulette language in visible copy

Constraints:
- Keep React Native / Expo compatibility
- Do not add new dependencies
- Keep TypeScript correctness
- Prefer small, targeted refactors rather than rewriting unrelated project files

Important:
The goal is visual credibility first. The approved cabinet image above is the visual source of truth.

After editing, update CODEX.md again with exactly what changed.
```

---

## 10. Run / validate

```bash
npm install
npx expo start
npx tsc --noEmit
```

When reviewing the result, check these specifically:
- Does the machine now visually match the approved cabinet direction?
- Are the live reels aligned cleanly inside the blank central window?
- Does the interaction still work even if the lever is decorative?
- Does mobile still feel usable and clean?
- Has visible wording moved away from the wrong roulette metaphor?

---

## 11. 2026-05-01 implementation update

### Changed
- `components/SlotMachine.tsx` now uses `assets/images/slot-machine-cabinet.png` as the primary cabinet visual layer.
- The old StyleSheet-drawn cabinet, custom faux marquee, and custom faux lever were removed from `SlotMachine.tsx`.
- The live restaurant reels are now absolutely positioned and clipped inside the cabinet artwork's blank central reel window.
- Reel item height now scales from the cabinet artwork size so the spin animation remains responsive on web and mobile.
- Existing reel spin behavior was preserved: randomized winner, randomized reel stop order, overshoot/spring finish, tick/stop/win sounds, and result callback.
- The visible lever in the cabinet image is decorative; an invisible press target over the lever area still starts a spin.
- The spin button is overlaid on the lower green cabinet panel so the image remains the visual source of truth.
- Category pills remain above the cabinet image.
- `app/index.tsx` page title was changed from “Restaurant Roulette” to “Restaurant Roller” to avoid visible roulette language.

### Remaining Issues
- The reel overlay coordinates are tuned by image proportions and may need minor pixel nudging if the cabinet artwork is cropped, replaced, or exported with transparency later.
- The lever does not animate independently because the approved cabinet image owns the visible lever silhouette in this pass.
- The lower cabinet panel is used for the spin button only; winner/result details still render in the existing result panel below the machine.

---

## 12. 2026-05-01 latest iteration notes

### Slot machine behavior
- The winner row now remains visible after the spin completes.
- Previous issue: when `spinning` changed from `true` to `false`, `SlotMachine.tsx` reset the reels back to the default preview state, causing the winning symbols to disappear.
- Fix: reel reset now happens only when the restaurant pool or selected category changes, not when the result state appears.
- The reel spin timing was lengthened for a more satisfying slot-machine feel:
  - `DURATIONS` changed from `[2100, 3400, 4700]` to `[3200, 4600, 6000]`.
  - `ROTATIONS` changed from `[9, 11, 13]` to `[12, 15, 18]`.
- Randomized reel stop order remains in place, so the first/second/third reel to lock can vary.

### Spin button
- The lower-panel button now always displays `SPIN`.
- It no longer changes to `SPINNING...` while the reels are moving.
- It no longer changes to `SPIN AGAIN` after a result.
- The button is still disabled during the spin to prevent double-spins, but it no longer visually dims or flashes.
- The button was moved upward inside the green lower panel so it is more visually centered.

### Logo sizing
- Base logo sizing inside reel cells was increased.
- Added `LOGO_SCALE_BY_ID` in `components/SlotMachine.tsx` for per-restaurant tuning.
- Purpose: some source logo files contain extra transparent/white padding, so they need individual scale boosts without making already-large logos too big.
- Examples of boosted smaller/padded logos include Ari Sushi, Mulligan's Pub, Fortuna Bakery, Fatburger, Lucky Goat Coffee, Slim Chickens, and others.

### Current validation
- `npx tsc --noEmit` passes after the latest changes.
- Browser checks were run on `http://localhost:8082/`.
- Confirmed:
  - cabinet image loads and remains the primary visual layer
  - reels stay clipped inside the central window
  - spin completes and winner remains visible
  - result panel appears below the machine
  - button remains labeled `SPIN`
  - no browser console errors were seen during the checked flows

### Sharing / testing context
- Current app is still being reviewed locally at `http://localhost:8082/`.
- For friends to test remotely, the app needs to be exposed or deployed.
- Likely paths:
  - Expo tunnel for quick temporary testing from the developer machine.
  - Publish/deploy the web build to a public host such as Vercel, Netlify, or another static web host.
  - Use EAS/Expo preview approaches later if native app testing is needed.

---

## 13. 2026-05-01 — Codex regression: settledLayer / SettledReelItem (DO NOT REPEAT)

### What happened
A Codex pass introduced a `SettledReelItem` component and a `settledLayer` overlay strategy. This produced two visible bugs:

1. **"Rows off"** — The settled layer uses percentage `left` values (`'33.33%'`, `'66.67%'`) for absolutely-positioned columns inside a `flexDirection: 'row'` container. React Native's `reelW` is computed with `Math.floor()` accounting for dividers, so percentage math never matches pixel widths — columns mis-align.

2. **"Blank at the end"** — `SettledReelItem` is `itemH` tall (one row) placed inside a `settledColumn` with `height: reelH` (three rows) and `justifyContent: 'center'`. Only the center row has content; the rest is white space. Looks like a glitched single-row display.

3. **Flash before blank** — Codex added `anims.forEach(anim => anim.setValue(0))` inside the last-reel completion callback (before calling `setSettledWinner`). This snaps all reels back to y=0 in the same frame, so users briefly see the pre-spin default state before the settled layer appears.

### Root cause
The `settledLayer` approach is fundamentally wrong. It tries to reconstruct what the reels look like using a separate component, which can never be pixel-perfect. It should never have been added.

### Correct approach (already proven to work)
**Do not reset animations after spin completes. Do not use a settledLayer, SettledReelItem, or any secondary overlay that replaces the reels.** The reels stay exactly where they landed — the winner symbol is already in the payline. A separate `WinnerOverlay` component pops up over the cabinet's reel window + lower panel to show the winner details and spin-again button.

---

## 14. 2026-05-01 — Required fix: WinnerOverlay inside the cabinet

### Goal
After the spin completes, display the winner's info INSIDE the cabinet area (over the reel window + lower green panel). Do not show a result panel below the machine — users miss it on small screens. The winner card should animate into view with a spring pop for big impact.

### Exact changes required

#### `components/SlotMachine.tsx`

**1. Add to react-native imports:**
```
Linking,
```

**2. Add new import after existing imports:**
```ts
import { openListing, openWebsite } from '@/utils/maps';
```

**3. Remove these things entirely:**
- `SettledReelItem` function (the entire component)
- `settledLayer`, `settledColumn`, `settledDivider` style entries in `StyleSheet.create`
- `const [settledWinner, setSettledWinner] = useState<Restaurant | null>(null);` state
- `setSettledWinner(null)` calls (there are two — one in the pool-change effect, one in handleSpin)
- The `anims.forEach((anim) => anim.setValue(0));` line inside the `finished === NUM_REELS` block
- The `setSettledWinner(picked)` call
- The `settledWinner ?` conditional that wraps the reel columns JSX — reels should always render
- The `!settledWinner` conditionals around payline, topShade, bottomShade — these should always render

**4. Add `winner` to Props interface:**
```ts
interface Props {
  pool: Restaurant[];
  spinning: boolean;
  spinLabel?: string;
  onSpinStart: () => void;
  onSpinComplete: (winner: Restaurant) => void;
  activeCategory: Category;
  onCategoryChange: (cat: Category) => void;
  /** Winner to display inside the cabinet. Null/undefined hides the overlay. */
  winner?: Restaurant | null;
}
```

**5. Destructure `winner = null` in the function signature:**
```ts
export function SlotMachine({
  pool,
  spinning,
  onSpinStart,
  onSpinComplete,
  spinLabel = 'SPIN',
  activeCategory,
  onCategoryChange,
  winner = null,
}: Props) {
```

**6. Add a new ref inside the function body (alongside existing refs):**
```ts
const winnerAnim = useRef(new Animated.Value(0)).current;
```

**7. Add a new computed value (alongside spinButtonTop etc.):**
```ts
// Overlay covers reel window + lower panel down to just past the spin button
const overlayH = Math.round(spinButtonTop + spinButtonH + 20 - reelTop);
const overlayBR = Math.max(14, Math.round(cabinetW * 0.025));
```

**8. Add a new useEffect that animates the overlay in/out:**
```ts
useEffect(() => {
  if (winner) {
    winnerAnim.setValue(0);
    Animated.spring(winnerAnim, {
      toValue: 1,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
  } else {
    winnerAnim.setValue(0);
  }
}, [winner, winnerAnim]);
```

**9. Inside the spin completion callback (`finished === NUM_REELS` block):**
Keep ONLY:
```ts
setShowGlow(true);
startGlow();
playWinDing();
setTimeout(() => onSpinComplete(picked), 1400);
```
Do NOT reset anims. Do NOT call setSettledWinner.

**10. In the JSX inside `<View style={[styles.cabinetStage, ...]}>`, add as the LAST child (after the spinButton Pressable):**
```tsx
{winner != null && (
  <WinnerOverlay
    winner={winner}
    anim={winnerAnim}
    left={reelLeft}
    top={reelTop}
    overlayW={reelTotalW}
    overlayH={overlayH}
    logoH={Math.round(itemH * 0.72)}
    borderRadius={overlayBR}
    onSpinAgain={() => handleSpin(true)}
  />
)}
```

**11. Add the `WinnerOverlay` component and its styles.** Place this above the `SlotMachine` function. The component is an `Animated.View` positioned absolutely inside `cabinetStage`:

```tsx
interface WinnerOverlayProps {
  winner: Restaurant;
  anim: Animated.Value;
  left: number;
  top: number;
  overlayW: number;
  overlayH: number;
  logoH: number;
  borderRadius: number;
  onSpinAgain: () => void;
}

function WinnerOverlay({
  winner,
  anim,
  left,
  top,
  overlayW,
  overlayH,
  logoH,
  borderRadius,
  onSpinAgain,
}: WinnerOverlayProps) {
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] });

  const handleMaps = () => openListing(winner.name, winner.address);
  const handlePhone = () => winner.phone && Linking.openURL(`tel:${winner.phone}`);
  const handleWebsite = () => winner.website_url && openWebsite(winner.website_url);

  return (
    <Animated.View
      style={[
        wStyles.overlay,
        {
          left,
          top,
          width: overlayW,
          height: overlayH,
          borderRadius,
          opacity: anim,
          transform: [{ scale }],
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={[wStyles.content, { minHeight: overlayH - 6 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={[wStyles.logoBox, { height: logoH }]}>
          {winner.logo_url ? (
            <Image source={{ uri: winner.logo_url }} style={wStyles.logo} resizeMode="contain" />
          ) : (
            <View style={wStyles.logoFallback}>
              <Text style={wStyles.logoFallbackText}>{winner.name.slice(0, 1)}</Text>
            </View>
          )}
        </View>

        <Text style={wStyles.name} numberOfLines={2}>{winner.name}</Text>
        <Text style={wStyles.address} numberOfLines={2}>{winner.address}</Text>

        <View style={wStyles.divider} />

        <View style={wStyles.row}>
          <Pressable
            onPress={handleMaps}
            style={({ pressed }) => [wStyles.primary, pressed && wStyles.pressed]}
          >
            <Text style={wStyles.primaryText}>Open in Maps</Text>
          </Pressable>
          {winner.phone ? (
            <Pressable
              onPress={handlePhone}
              style={({ pressed }) => [wStyles.secondary, pressed && wStyles.pressed]}
            >
              <Text style={wStyles.secondaryText}>Call</Text>
            </Pressable>
          ) : null}
        </View>

        <Pressable
          onPress={onSpinAgain}
          style={({ pressed }) => [wStyles.spinAgain, pressed && wStyles.pressed]}
        >
          <Text style={wStyles.spinAgainText}>Spin Again</Text>
        </Pressable>

        {winner.website_url ? (
          <Pressable onPress={handleWebsite} style={wStyles.website}>
            <Text style={wStyles.websiteText}>View website</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </Animated.View>
  );
}

const wStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 3,
    borderTopColor: '#0B5B45',
    borderWidth: 1,
    borderColor: 'rgba(11,91,69,0.14)',
    overflow: 'hidden',
    zIndex: 20,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 4px 20px rgba(11,91,69,0.18)' } as any)
      : {
          shadowColor: '#0A3328',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }),
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 5,
  },
  logoBox: { width: '80%', alignItems: 'center', justifyContent: 'center' },
  logo: { width: '100%', height: '100%' },
  logoFallback: {
    width: 52, height: 52, borderRadius: 10,
    backgroundColor: '#E6F0EC', alignItems: 'center', justifyContent: 'center',
  },
  logoFallbackText: { color: '#0B5B45', fontSize: 24, fontWeight: '900' },
  name: {
    color: '#0B5B45', fontSize: 15, fontWeight: '900',
    lineHeight: 18, textAlign: 'center',
  },
  address: { color: '#526C63', fontSize: 10, lineHeight: 13, textAlign: 'center' },
  divider: { width: '80%', height: 1, backgroundColor: 'rgba(11,91,69,0.10)', marginVertical: 2 },
  row: { flexDirection: 'row', gap: 6, width: '100%' },
  primary: {
    flex: 1.6, backgroundColor: '#0B5B45', borderRadius: 8,
    paddingVertical: 8, alignItems: 'center', justifyContent: 'center',
  },
  primaryText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  secondary: {
    flex: 1, borderWidth: 1.5, borderColor: '#0B5B45', borderRadius: 8,
    paddingVertical: 8, alignItems: 'center', justifyContent: 'center',
  },
  secondaryText: { color: '#0B5B45', fontSize: 11, fontWeight: '900' },
  spinAgain: {
    width: '100%', borderWidth: 1, borderColor: 'rgba(11,91,69,0.25)',
    borderRadius: 8, paddingVertical: 7, alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#E6F0EC',
  },
  spinAgainText: { color: '#0B5B45', fontSize: 11, fontWeight: '800' },
  website: { paddingVertical: 2 },
  websiteText: { color: '#526C63', fontSize: 9, textDecorationLine: 'underline' },
  pressed: { opacity: 0.78, transform: [{ scale: 0.97 }] },
});
```

#### `app/index.tsx`

**1. Pass `winner={winner}` to `<SlotMachine>`:**
```tsx
<SlotMachine
  pool={filteredPool}
  spinning={spinState === 'spinning'}
  onSpinStart={handleSpinStart}
  onSpinComplete={handleSpinComplete}
  activeCategory={activeCategory}
  onCategoryChange={setActiveCategory}
  winner={winner}
/>
```

**2. Remove the `{spinState === 'result' && winner && <ResultPanel winner={winner} />}` block** and the entire `ResultPanel` function below `HomeScreen`.

**3. Remove unused imports** (`Linking`, `openListing`, `openWebsite`, `Radii`, `Shadow`) that were only used by `ResultPanel`.

**4. Remove all `result*` entries from `StyleSheet.create`** (`resultPanel`, `resultCard`, `resultLogo`, etc.).

### What NOT to do
- Do NOT add `SettledReelItem`, `settledLayer`, `settledColumn`, or `settledDivider`.
- Do NOT call `anims.forEach(anim => anim.setValue(0))` after the spin completes.
- Do NOT use percentage strings (`'33.33%'`) for absolute left positions — always use pixel values.
- Do NOT render the winner below the machine (it gets cut off on small screens).

### How the flow works after the fix
1. Spin completes → `onSpinComplete(picked)` is called with a 1.4s delay.
2. `index.tsx` receives it via `handleSpinComplete` → sets `winner` state → passes as prop.
3. `SlotMachine` receives non-null `winner` → `useEffect` fires → spring animation → `WinnerOverlay` pops up inside the cabinet.
4. User taps "Spin Again" inside the overlay → `handleSpin(true)` is called → `onSpinStart()` → `index.tsx` sets `winner = null` → overlay instantly hides as new spin begins.
5. Reels are never reset to y=0 after a spin — they stay at their landed position behind the overlay.

### Validation after fixing
Run `npx tsc --noEmit` — must pass with no errors.
Check in browser:
- Spin completes → WinnerOverlay pops up inside the machine, covering the reel area
- Logo, name, address, Open in Maps, optional Call, Spin Again are all visible
- Tapping Spin Again dismisses overlay and starts a new spin
- No result panel visible below the machine

---

## 15. 2026-05-19 — Backend + Frontend deployed to Vercel (public URL)

### Backend: `celebration-backend`
- **Path:** `/Users/leemoore/Downloads/celebration-backend/`
- **Framework:** Next.js 14, Pages Router
- **Live URL:** `https://celebration-backend.vercel.app`
- **GitHub repo:** `https://github.com/lmoorey2k/celebration-backend`
- **Database:** Supabase PostgreSQL, project ID `dvwobegxzbekbhdbnnoj` (East US / Ohio)
- **Vercel env vars** (set via Vercel web UI dashboard — never commit actual values):
  ```
  NEXT_PUBLIC_SUPABASE_URL=<supabase project URL>
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<sb_publishable_... key>
  SUPABASE_SECRET_KEY=<sb_secret_... key>
  ADMIN_PASSWORD=<admin password>
  ```
  Real values live in `celebration-backend/.env.local` (in `.gitignore` — never committed) and in the Vercel project's Environment Variables dashboard.
- **Key routes:**
  - `GET /api/restaurants` — returns `{ restaurants: [...] }` from Supabase; Expo app fetches this on mount and falls back to static JSON on failure
  - `GET /api/admin` / `POST /api/admin` — admin restaurant management (requires `ADMIN_PASSWORD`)

### Frontend: `Celebration-Roulet` (Expo web)
- **Path:** `/Users/leemoore/Downloads/Celebration-Roulet/`
- **Live URL:** `https://celebration-roulette.vercel.app`
- **GitHub repo:** `https://github.com/lmoorey2k/celebration-roulette`
- **Build:** `npx expo export -p web` → outputs to `dist/`
- **`vercel.json`** (at project root):
  ```json
  { "buildCommand": "npx expo export -p web", "outputDirectory": "dist", "installCommand": "npm install" }
  ```
- **`.env.local`** (at project root, in `.gitignore`):
  ```
  EXPO_PUBLIC_API_URL=https://celebration-backend.vercel.app
  ```
  This env var is baked in at build time by Expo. Without it, the app falls back to `data/restaurants.json`.
- **GitHub PAT for git push** (only needed for CLI pushes, not Vercel):
  - Username: `lmoorey2k`
  - Token embedded in remote URL: `https://lmoorey2k:<PAT>@github.com/lmoorey2k/celebration-roulette.git`
  - Vercel auto-deploys whenever `main` branch is pushed.

### Deployment workflow
1. Make changes to source files.
2. Run `npx expo export -p web` locally to verify the build passes.
3. `git add <changed files> && git commit -m "..."` and `git push origin main`.
4. Vercel picks up the push and redeploys automatically within ~1 minute.
5. Hard-refresh the browser (Cmd+Shift+R) to bust the JS bundle cache.

---

## 16. 2026-05-19 — Safari bug fixes (sound, alignment, desktop sizing)

Three cross-browser bugs were identified after live testing at `https://celebration-roulette.vercel.app`.

### Bug 1: No sound on mobile Safari + mobile Chrome

**Root cause:** The `playWhenReady` function in `utils/audio.ts` was deferring the `play()` call into a `.then()` callback after `resumeAudio()` resolved. Both mobile Safari and mobile Chrome require a real `AudioContext` source to be `start()`-ed synchronously within the user-gesture call stack — a deferred Promise callback breaks out of that gesture context and the browser silently drops the audio.

**Fix (utils/audio.ts):**
- Added `let _unlocked = false;` module-level flag.
- Added `unlockAudio(c)` helper that on first call creates a 1-sample silent `BufferSource` and calls `src.start(0)` — this physically unlocks the browser audio policy.
- `playWhenReady` now:
  1. Calls `c.resume().catch(()=>{})` synchronously (fire-and-forget) if suspended.
  2. Calls `unlockAudio(c)` to do the one-time silent-buffer unlock.
  3. Immediately calls `play(c)` without any async gap.
- The old `resumeAudio().then(...)` pattern is gone.

### Bug 2: Reel icons misaligned after spin (winner not centered in payline)

**Root cause:** The spring animation (`Animated.spring`) decays asymptotically and leaves a tiny floating-point residual on Safari's CSS transform implementation. The winner logo lands a few subpixels off from the payline center.

**Fix (components/SlotMachine.tsx):**
- Replaced `Animated.spring(anims[i], { toValue: targetY, friction: 16, tension: 240 })` with `Animated.timing(anims[i], { toValue: targetY, duration: 280, easing: Easing.out(Easing.back(1.6)) })`.
- A timing animation always ends exactly at `toValue` — no decay residual possible.
- `Easing.out(Easing.back(1.6))` preserves the "settle into place with a slight overshoot" feel.
- As belt-and-braces, `anims[i].setValue(reelData.targetY)` still fires immediately after the callback to guarantee integer pixel alignment.

### Bug 3: Slot machine too small on desktop Safari

**Root cause:** `cabinetW = Math.min(Math.round(measuredW * 0.96), 520)` — the 520 px hard cap caused the machine to be undersized on wide desktop screens.

**Fix (components/SlotMachine.tsx):**
- Raised the cap to 680 px: `Math.min(Math.round(measuredW * 0.96), 680)`.
- Mobile screens are narrower than 680 px so the cap is never hit on phones — the visual change is desktop-only.

---

## 19. 2026-05-20 — Embedding, URL fixes, maps behavior, admin logo fetch, header cleanup

### iframe embedding enabled
- `vercel.json` now sets `X-Frame-Options: ALLOWALL` and `Content-Security-Policy: frame-ancestors *`
- The app can be embedded on visitcelebration.org (or anywhere) via a plain `<iframe>` tag
- Recommended placement: top of the `/food-drink/` page, before the alphabetical restaurant listing
- iframe snippet to hand to the Visit Celebration team:
  ```html
  <div style="text-align:center;margin:2rem 0;">
    <iframe src="https://celebration-roulette.vercel.app" width="100%" height="780"
      style="border:none;border-radius:16px;max-width:560px;display:block;margin:0 auto;"
      title="Celebration Restaurant Roller" loading="lazy" allow="autoplay"></iframe>
  </div>
  ```

### iOS maps fix (`utils/maps.ts`)
- Previous bug: app always used Google Maps on web because `Platform.OS === 'web'` bypassed the iOS branch
- Fix: `isIOSDevice()` helper sniffs `navigator.userAgent` for iPad/iPhone/iPod on web
- iOS users (Safari, Chrome on iPhone) now get `maps://` which opens their default maps app
- Android and desktop web still get Google Maps URL

### Restaurant data fixes (Supabase + `data/restaurants.json`)
- **Dom Helio** (id 13): logo_url was a dead 404 URL (March screenshot). Updated to the correct April 2026 upload: `DomHelioReversed.png`
- **Panera Bread** (id 34): base domain `panerabread.com` was unreachable. Changed to the Celebration location page URL
- **Peach Valley Café** (id 35): changed to location-specific URL `/celebration`
- **The Great Greek** (id 48): changed to location-specific URL `/celebration-fl`
- **Windmill Restaurant** (id 54): changed from golf club homepage to `/restaurant/` page per owner request
- All fixes applied to both Supabase (live) and `data/restaurants.json` (fallback)

### Admin panel: logo auto-fetch (`celebration-backend`)
- New API route: `GET /api/fetch-logo?url=<visitcelebration.org/business-directory/...>`
  - Admin-auth required (cookie `admin_session`)
  - Only accepts `visitcelebration.org` URLs (SSRF prevention)
  - Fetches the page server-side, parses `wpbdp-thumbnail` srcset, returns largest image URL
- Admin EditForm (`pages/admin/index.tsx`) updated:
  - Logo URL field now spans full width
  - "Fetch Logo" button below it: paste a business-directory URL, click/Enter → logo_url auto-fills
  - Live logo preview renders below the field after fetch or manual entry

### Header cleanup (`app/index.tsx`)
- Removed the Visit Celebration logo image that appeared above the machine (redundant when embedded on visitcelebration.org; the cabinet already carries the brand)
- "Where should we dine?" title: color changed from near-black (`textPrimary`) to brand green (`Colors.primary`) — consistent with category pills
- Hint text: updated from "Choose a category and let the machine make the pick." to "Pick a category and let the reels decide." — more slot-machine-appropriate
- Hint text color: changed from steel blue (`textSecondary`) to neutral gray (`textMuted`) — no more three mismatched colors above the machine

---

## 17. Quick-start handoff for a new coding agent

### To resume work on the frontend (Expo web app):
```
Project: /Users/leemoore/Downloads/Celebration-Roulet/
Live site: https://celebration-roulette.vercel.app
GitHub: https://github.com/lmoorey2k/celebration-roulette
Deploy: git push origin main → Vercel auto-deploys
Build locally: npx expo export -p web (reads .env.local for API URL)
Type-check: npx tsc --noEmit
```

### To resume work on the backend (Next.js API):
```
Project: /Users/leemoore/Downloads/celebration-backend/
Live API: https://celebration-backend.vercel.app
GitHub: https://github.com/lmoorey2k/celebration-backend
Deploy: git push origin main → Vercel auto-deploys
Run locally: npm run dev (reads .env.local for Supabase keys)
```

### Key invariants to preserve
- Do NOT call `anims.forEach(a => a.setValue(0))` after a spin completes — reels must stay at their landed position.
- Do NOT use `Animated.spring` for the reel landing step — use timing+back-easing to guarantee exact pixel alignment.
- Audio unlock MUST happen synchronously inside the user-gesture call stack — never defer to `.then()`.
- `EXPO_PUBLIC_API_URL` must be set in `.env.local` before building; it is baked in at build time.
- Env vars are never committed to git (`.gitignore` covers `.env`, `.env.local`, `.env.*.local`).

---

## 18. 2026-05-19 — Sunday Easter egg: Chick-fil-A guaranteed first-spin win + full-screen takeover

### Feature overview
On any Sunday, the **first spin of the session guarantees Chick-fil-A wins**, even though the reel animation appears random. When Chick-fil-A lands, instead of the normal celebration sound, a sad trombone plays. A full-screen dramatic overlay then covers the entire app with a dark blurred backdrop, a bold cream-colored card, a large dimmed Chick-fil-A logo, a red "CLOSED TODAY" rubber stamp that slams in with a wobble, and the joke message: "You ALWAYS want Chick-fil-A on a Sunday. It never fails. 🐔 Sorry — it's closed today 😅"

The feature resets daily — the next Sunday, the first spin is rigged again. Subsequent spins on the same day are fully random. Weekday spins are never affected.

### Design evolution
- **v1 (initial approach):** Small card overlay positioned at the bottom of the screen with a simple closed message and button. User feedback: "too subtle, not exciting enough."
- **v2 (final):** Full-screen takeover with dark blurred backdrop (`rgba(8,32,26,0.82)`), large bold headline, dimmed logo, dramatic red stamp slam animation (scale 3×→1× over ~150ms after 380ms delay), and card wobble shake synchronized with stamp landing. Much more delightful and memorable.

### Implementation details

#### `utils/audio.ts`
- **`isSunday()`** helper function that returns `new Date().getDay() === 0` — uses device local time for timezone awareness.
- **`playSadTrombone()`** function using Web Audio API:
  - Three descending sawtooth notes (A3→F3→D3-ish over ~1 second).
  - Quick attack, slow decay envelope for "vocal wah-wah" character.
  - Final note bends down 15% for trombone glissando effect.
  - Called instead of `playCelebration()` when Chick-fil-A wins on Sunday.

#### `components/SlotMachine.tsx`
- **New prop:** `shouldWinChickFilA?: boolean;` — signals when to rig the spin.
- **Rigging logic** in `handleSpin()` callback (~line 226):
  ```typescript
  const chickFilA = shouldWinChickFilA && pool.some(r => r.id === 9) ? pool.find(r => r.id === 9) : null;
  const picked = chickFilA ?? pool[Math.floor(Math.random() * pool.length)];
  ```
  Guarantees Chick-fil-A is selected as `picked` before animation timing is calculated. The reel animation still looks completely random — the rigging is invisible.

#### `app/index.tsx`
- **`CHICK_FIL_A_ID = 9`** constant (restaurant ID from `data/restaurants.json`).
- **`isSundayOrForced()`** helper that checks both `isSunday()` AND for `?testSunday=1` URL param. Enables testing without changing system time.
- **`sundayFirstSpinDone`** state (boolean) tracks whether the rigged first spin has been used this session. Resets to `false` at component unmount and also when a spin completes and the day changes (checked in `handleSpinStart`).
- **`shouldWinChickFilA`** computed value:
  ```typescript
  const shouldWinChickFilA = isSundayOrForced() && !sundayFirstSpinDone && !!spinPool.find(r => r.id === 9);
  ```
  Only true on Sunday, before first spin, and when Chick-fil-A is in the current pool (respects category filters).
- **Modified `handleSpinStart()`:** Sets `sundayFirstSpinDone = true` when about to do the rigged spin.
- **Modified `handleSpinComplete()`:** Checks if Chick-fil-A (id 9) won on Sunday → calls `playSadTrombone()` instead of `playCelebration()`.
- **Suppressed `WinnerCard`** when `SundayClosedOverlay` is showing to avoid duplicate UI.
- **`SundayClosedOverlay` component** (placed above `HomeScreen` function):
  - **Backdrop**: `StyleSheet.absoluteFill` + dark tint `rgba(8,32,26,0.82)` for full-screen coverage with slight blur effect (web-only via `backdropFilter: 'blur(2px)'`).
  - **Card**: Cream-colored rounded container with thick green border (3px) + gold inner accent (1px).
  - **Eyebrow**: Red text "ADMIT IT..." in small caps.
  - **Headline**: "You ALWAYS want Chick-fil-A on a Sunday." (bold, large).
  - **Subheadline**: "It never fails. 🐔" (supporting message).
  - **Logo box**: Large dimmed Chick-fil-A logo at 45% opacity as visual anchor.
  - **Red stamp**: "CLOSED TODAY" rubber-stamp text with skew + shadow, initially scaled to 3×.
  - **Stamp animation**: Scales from 3× → 1× over ~150ms, starting 380ms after card mounts. Uses spring animation for snappy landing feel.
  - **Card shake**: Simultaneous wobble on the card (translateX ±3% or ~10px) during stamp slam for comedic impact.
  - **Bottom message**: "Sorry — it's closed today 😅" in gray text below logo.
  - **Spin Again button**: Bold green button ("🎰 Spin Again") that calls `onSpinAgain()` to start a new spin (dismisses overlay instantly).
- **Animation choreography**:
  1. Card scales from 0.6 → 1 with spring (friction 6, tension 100) over ~460ms.
  2. Backdrop fades from 0 → 1 in parallel (260ms timing for quick appearance).
  3. 380ms after card mounts, stamp slides in with scale 3→1 spring and card shakes (3 wobble cycles).
  4. All animations use `useNativeDriver: true` for smooth 60fps performance.

### Testing the feature

#### Quick test: with `?testSunday=1` URL param
```
https://celebration-roulette.vercel.app?testSunday=1
```
1. Load the app with this param.
2. Tap SPIN.
3. Watch reels — Chick-fil-A **always** lands in center.
4. Sad trombone plays (not celebration).
5. Full-screen overlay appears with dramatic stamp slam.
6. Tapping "Spin Again" dismisses overlay and does a normal random spin.

#### Proper test: set device to a Sunday
1. Set device date/time to a Sunday (macOS: System Settings → Date & Time → Set manually).
2. Restart the app.
3. First spin → Chick-fil-A wins with sad trombone and overlay.
4. Second spin → fully random (no overlay).
5. Set device back to Monday → app works normally.
6. Set device forward to next Sunday → first spin is rigged again (feature resets daily).

### Key design decisions

1. **Invisible rigging** — The animation looks completely random. By the time users see the result, they believe the reels landed naturally. It's a delightful surprise, not obviously fake.

2. **Session-level state** — The `sundayFirstSpinDone` flag resets when the component unmounts. This means:
   - First load on Sunday → rigged spin.
   - After spin, hard-refresh page → rigged spin again (flag is gone).
   - App in background for 24+ hours → when reopened, new day → flag auto-resets.
   - Acceptable for a fun Easter egg (could add `localStorage` persistence for true "once per calendar day" if desired).

3. **Respects category filters** — If someone is in "breakfast" category and Chick-fil-A is not tagged as breakfast, the rigging won't trigger. Checks `spinPool.find(r => r.id === 9)` to ensure Chick-fil-A is available in current pool before rigging.

4. **Testing URL param** — `?testSunday=1` overrides the Sunday check so developers/testers don't have to change system time.

5. **Dark blurred backdrop** — Creates a theatrical "moment" effect, focusing attention entirely on the joke. The blur is CSS-only on web; React Native doesn't support blur so it's a simple solid backdrop on native.

6. **Sad trombone over celebration** — Subverts the expectation of a joyful win. Users won the jackpot (Chick-fil-A!) but the punchline is immediate disappointment. The sound + message + overlay work together to land the joke.

### Files involved
- `utils/audio.ts` — `isSunday()`, `playSadTrombone()`
- `components/SlotMachine.tsx` — `shouldWinChickFilA` prop, rigging logic
- `app/index.tsx` — state tracking, `SundayClosedOverlay` component, animation choreography, sound dispatch

### Edge cases handled
1. **Chick-fil-A filtered out** — If the current category doesn't include Chick-fil-A, the rigging silently doesn't trigger (graceful fallback).
2. **Pool changes mid-session** — `shouldWinChickFilA` is recalculated each render, so if Chick-fil-A is added/removed from the pool after first spin, subsequent spins remain random (correct behavior).
3. **Component unmount** — State resets, so reloading the app resets the daily flag (acceptable for session-level feature).
4. **Cross-timezone** — Uses `new Date().getDay()` (device local time), so Sunday is based on the user's timezone, not UTC (desired behavior).

### Rollout & observability
- Feature is live at `https://celebration-roulette.vercel.app` and deployed via `git push origin main`.
- Can be toggled off by removing `isSunday() &&` checks or setting `shouldWinChickFilA={false}` in code.
- Test param `?testSunday=1` is safe to leave in code — it's harmless and useful for future QA.

---

## 20. Session Changes — 2026-05-20 (audio debugging + fixes)

### Desktop spin button vertical position (tuning)
- Ratio adjusted from `0.845` → `0.827` in `components/SlotMachine.tsx`
- `0.812` was too high (original), `0.845` was too low; `0.827` splits the difference
- Mobile unaffected (ratio is `0.812` when `cabinetW < 680`)

### iOS audio — full diagnosis and final fix (`utils/audio.ts`)

This was a multi-step investigation. Summary of everything found and fixed:

#### Problem 1: React synthetic events block AudioContext unlock
iOS WebKit requires `AudioContext.resume()` inside a *direct* native gesture stack frame. React's `onPress` fires too late — iOS rejects it. Fixed by adding `setupIOSTouchUnlock()` with **capture-phase** `touchstart`/`touchend` listeners on `document`, which fire before React sees the event.

#### Problem 2: Silent switch / Action Button muting Web Audio
iOS classifies Web Audio API oscillators as "ambient" audio, which gets muted by the silent switch. Fixed by playing a programmatically-generated silent WAV through an `<audio>` element on first touch, which registers the page as "media playback" and bypasses the mute switch. The WAV is built using `DataView` (44-byte RIFF header + 1 silent PCM sample) — no external file needed.

#### Problem 3: Audio dies after screen lock / app switch / interruption
iOS can interrupt the AudioContext at any time (setting state to `'suspended'` or `'interrupted'`). The original code removed the touch listeners after first unlock, leaving no recovery path. Fixed by:
- Making touch listeners **permanent** (never removed)
- Adding a `statechange` listener on the AudioContext that resets `_unlocked = false` whenever state leaves `'running'`, triggering full re-unlock on next gesture
- Handling both `'suspended'` and `'interrupted'` states in `playWhenReady()` via `needsResume()` helper

#### Problem 4 (root cause of "starts working then stops"): AudioContext destination silently disconnects
**Key finding from debug panel:** `AudioContext.state === 'running'` and `_unlocked === true`, but **zero sound from oscillators** — while HTML `<audio>` elements played fine. This confirmed a known iOS Safari/WebKit bug: after repeated use or interruptions, `ctx.destination` silently disconnects from the hardware output while the context still reports `'running'`.

**Diagnostic approach:** Added a temporary debug panel to `app/index.tsx` (now removed) with two test buttons — one using Web Audio oscillators, one playing a WAV via `<audio>`. Oscillator: silent. WAV: audible. This isolated the bug precisely.

**Fix:** Introduced `audioOut(c)` in `utils/audio.ts`. On web, this creates a `MediaStreamAudioDestinationNode` and pipes its output through an `<audio>` element (`_streamEl.srcObject = _streamDest.stream`). Every oscillator and gain node in the app now connects to `audioOut(c)` instead of `c.destination`. Since HTML audio is reliably hardware-connected, this bypasses the WebKit bug entirely.

The MediaStream element is also re-kicked (`_streamEl.play()`) on every touch if iOS has paused it, and reset entirely (along with `_streamDest`) whenever the AudioContext is interrupted, so a fresh routing chain is built on the next gesture.

#### Key invariant for future agents
All sound functions **must** connect to `audioOut(c)`, not `c.destination`. The only exception is `unlockAudio()`, which intentionally connects to `c.destination` to perform the initial silent-buffer gesture unlock (this must hit the raw destination to satisfy iOS's unlock requirement before the stream is set up).

#### Audio hum fix
After deploying the MediaStream routing, the `<audio>` element played the open stream continuously — even with no oscillators active, the noise floor produced a constant audible hum. Fixed by adding auto-pause: `kickStream()` starts the `<audio>` element when a sound plays and schedules a `setTimeout` (2 seconds) to pause it after the last sound finishes. The touch unlock handler was also updated to avoid eagerly starting the stream on every tap — it now only calls `ensureStream()` to create the nodes without playing.

#### Files changed
- `utils/audio.ts` — all fixes above; `masterGain()` updated; `audioOut()` added; `kickStream()` auto-pause added
- `app/index.tsx` — debug panel added during investigation, then removed after fix confirmed

---

## 21. Weighted Spin Selection — 2026-05-20

### Problem
The admin panel had a weight slider (1–5) that saved to the database, but the slot machine's `Math.random()` selection treated every restaurant equally. Changing weight had zero effect on spin outcomes.

### Solution — Two-pool architecture
The `weight` field (1–5) now maps to a non-linear internal multiplier:

| Tier | Weight | Multiplier | Approx. odds (1 of 54 boosted) |
|------|--------|------------|-------------------------------|
| Normal | 1 | 1× | ~2% |
| Boosted | 2 | 2× | ~4% |
| Featured | 3 | 5× | ~9% |
| Hot Pick | 4 | 10× | ~16% |
| Sponsored | 5 | 50× | ~48% |

**Two separate pools** prevent boosted restaurants from flooding the reel visuals:
- **`spinPool`** — unique list of eligible restaurants. Used for reel display, category filtering, restaurant counts, and all visual UI.
- **`weightedPool`** — same restaurants duplicated by their multiplier. Used ONLY by `handleSpin()` when picking the winner via `Math.random()`.

Both pools are filtered by category. The `filteredWeightedPool` in `index.tsx` mirrors whatever category filter is active.

### Key invariant for future agents
- **Winner selection** must use `weightedPool` (or `pickPool` inside `handleSpin`), never `pool`.
- **Reel visuals, poolKey, defaultItems, restaurant count, and category filtering** must use `pool` (unique), never `weightedPool`.
- The multiplier map lives in `hooks/useRestaurants.ts` as `WEIGHT_MULTIPLIER`. To change odds, update that map — no other files need to change.
- The Chick-fil-A Sunday Easter egg (`shouldWinChickFilA`) takes priority over weighted selection — it overrides the random pick.

### Files changed
- `hooks/useRestaurants.ts` — `WEIGHT_MULTIPLIER` map; `weightedPool` built via `useMemo`
- `context/RestaurantContext.tsx` — `weightedPool` added to context interface
- `components/SlotMachine.tsx` — `weightedPool` prop; `pickPool` used in `handleSpin`
- `app/index.tsx` — `filteredWeightedPool` computed; passed to `<SlotMachine>`
- `celebration-backend/pages/admin/index.tsx` — slider labels updated with tier names and approximate odds; Hot Pick/Sponsored use orange/red accent colors

---

## 22. Vercel Deployment Fix — Git Email Mismatch — 2026-05-20

### Problem
Vercel blocked deployments for `celebration-backend` with the error: "The commit email lmoorey2k@github.com could not be matched to a GitHub account." Two consecutive deployments (the logo auto-fetch commit and the weight slider labels commit) were both blocked.

### Root cause
The local git config for the repo used `lmoorey2k@github.com` as the commit author email. This is a GitHub username-based alias that Vercel's Hobby plan cannot resolve to a GitHub account. The actual verified email on the GitHub account is `lmoore7@gmail.com`.

### Fix
1. Set the correct email in the repo's local git config: `git config user.email "lmoore7@gmail.com"`
2. Made a new commit with the correct email to trigger a fresh Vercel deployment
3. Also fixed the email in the `Celebration-Roulet` repo to prevent the same issue there

### Key note for future agents
- The git email for **both** repos (`celebration-backend` and `Celebration-Roulet`) must be `lmoore7@gmail.com` — this matches the verified email on the GitHub account `lmoorey2k`
- Never use `lmoorey2k@github.com` — Vercel cannot match it
- The GitHub noreply email `272659109+lmoorey2k@users.noreply.github.com` would also work if privacy is preferred

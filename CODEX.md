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

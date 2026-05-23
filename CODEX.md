# Celebration Restaurant Roller — Codex Context

> Use this file to brief Codex (or any AI coding agent) on the project.
> It captures the current state, recent design decisions, and the remaining task list.
> When asking another coding agent to continue work, point it here first.
> After any implementation, deployment, or admin-tooling change, append a dated note here before committing so the next agent has the latest decisions.

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
| Data | Static JSON fallback in `data/restaurants.json`; live API via `EXPO_PUBLIC_API_URL` when configured |

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

---

## 23. Two-Sided Admin Odds Slider — 2026-05-21

### Problem
The admin odds slider only boosted restaurants upward. That worked for preferred picks like Posto Pizza, but there was no way to leave a chain or lower-priority listing visible while making it less likely to win. The old labels also showed approximate percentages based on one full-pool size, which becomes misleading when category filters or hidden listings change the active pool.

### Solution
The admin slider now remains admin-only but supports lower and higher odds around the existing Normal value. Existing saved values keep their meanings:

| Tier | Weight | Multiplier | Meaning |
|------|--------|------------|---------|
| Rare | -2 | 0.1× | Much less likely |
| Low Priority | -1 | 0.25× | Less likely |
| Slightly Lower | 0 | 0.5× | A little less likely |
| Normal | 1 | 1× | Standard odds |
| Boosted | 2 | 2× | More likely |
| Featured | 3 | 5× | Strong boost |
| Hot Pick | 4 | 10× | Very likely |
| Sponsored | 5 | 50× | Highest priority |

### Key invariant for future agents
- Public users do **not** see or control odds. The slider is only in `celebration-backend/pages/admin/index.tsx`.
- Hide/show behavior stays separate from odds:
  - `active`, `eligible_for_wheel`, `default_excluded`, and `session_excluded` decide whether a restaurant can appear at all.
  - `weight` decides how likely an included restaurant is to win.
- Winner selection now uses a true weighted random roll with fractional multipliers, not duplicated entries in an array. This is required for lower-odds tiers like 0.25× and 0.1×.
- Reel visuals, poolKey, defaultItems, restaurant count, and category filtering still use the unique restaurant pool. Do not let odds weighting duplicate reel visuals.
- The Chick-fil-A Sunday Easter egg (`shouldWinChickFilA`) still takes priority over weighted selection.

### Files changed
- `hooks/useRestaurants.ts` — `ODDS_MULTIPLIER` map and `getOddsMultiplier()`
- `components/SlotMachine.tsx` — true weighted random winner picker
- `utils/spin.ts` — legacy/result picker updated to use odds multipliers
- `celebration-backend/pages/admin/index.tsx` — admin slider range, labels, and colors changed from boost-only to two-sided odds

---

## 24. Admin Pick Odds Slider Polish — 2026-05-21

### Problem
The two-sided odds slider worked, but the admin table could read a little busy. The column label `Odds` was also slightly vague because admins need to understand this affects winner selection, not whether a restaurant is visible.

### Polish
- Renamed the admin table column from `Odds` to `Pick Odds`.
- Renamed the edit modal section to `Pick Odds — chance after it is in the wheel`.
- Shortened row labels from long explanations like `Hot Pick · 10x · Very likely` to compact labels like `Hot Pick · 10x`.
- Kept the longer explanation in the slider tooltip/title.
- Tuned lower-odds colors toward cooler gray-blue so the scale reads visually as low/cool → normal → hot/boosted.
- Added a subtle ring around the Normal `1x` tick so admins can quickly see the home position.

### Key invariant for future agents
- This was a visual/admin-only polish pass in `celebration-backend/pages/admin/index.tsx`.
- It did **not** change saved values, odds multipliers, public app behavior, or hide/show behavior.
- Continue updating this `CODEX.md` file for every meaningful implementation, deployment, or admin-tooling change.

### Verification
- `npx tsc --noEmit` in `celebration-backend`
- `npm run build` in `celebration-backend`

---

## 25. Per-Reel Slot Machine Audio Pass — 2026-05-21

### Starting point / rollback
Before this sound-design pass, the app repo was clean at commit `f767c0e` (`Update CODEX for odds slider polish`). If the new audio direction is disliked, compare against or revert the commit that follows this note.

### Problem
The rolling sound felt flat because only the last-stopping reel produced tick sounds. The tick sound also stayed essentially the same whether three reels, two reels, or one reel remained in motion. Each reel did play a stop sound, but the stop sounds did not build much physical weight as the machine locked down.

### Solution
- `SlotMachine.tsx` now attaches tick listeners to all three reel animations instead of only the last-stopping reel.
- When a reel stops, its tick listener is cleared, so the rolling texture naturally thins from three reels to two reels to one reel.
- `utils/audio.ts` now lets `playTick(reel, activeReels)` vary tick pitch/timbre slightly per reel and reduce tick volume so combined multi-reel ticking is fuller without getting harsh.
- `playReelStop(reel, stopRank, isFinal)` now varies stop pitch/weight by stop order, with a heavier final clunk and a small latch click.

### Key invariant for future agents
- Keep the existing iOS/WebKit audio routing intact: sound functions must connect through `audioOut(c)`, not directly to `c.destination`, except for the documented unlock path.
- This pass intentionally did **not** add a continuous whirr bed. If more realism is needed later, add it as a separate, reversible pass after testing the per-reel tick/clunk feel.
- `RouletteWheel.tsx` is legacy and still calls `playTick()` with no args; the new audio helper defaults preserve compatibility.

### Files changed
- `components/SlotMachine.tsx` — per-reel tick listeners and stopped-reel tracking
- `utils/audio.ts` — per-reel tick variation and stepped stop/clunk variation

---

## 26. Audio Timing + Mobile Step-Down Tuning — 2026-05-21

### Starting point / rollback
This tuning pass follows `ef0fdd7` (`Improve per-reel slot machine audio`). If this pass feels worse, compare against or revert the commit that follows this note while keeping `ef0fdd7` as the first-pass baseline.

### Feedback addressed
- Tick sounds felt slightly late on both desktop and iPhone.
- Desktop had a noticeable rolling-sound step-down as reels stopped, but iPhone did not make that change obvious enough.
- The tick tone itself was not yet a favorite; it read a bit too sharp/electronic.

### Changes
- Added `TICK_LEAD_RATIO` in `SlotMachine.tsx` so tick sounds fire slightly before the visual row boundary. This compensates for browser/iOS audio output latency and should make ticks feel closer to the reel movement.
- Lowered tick frequencies and changed the tick oscillator to `triangle` for a softer, less piercing click.
- Replaced the old tick scaling with explicit active-reel volume levels:
  - 3 active reels: fuller tick level
  - 2 active reels: lower tick level
  - 1 active reel: clearly lower tick level
- Softened the high clack portion of reel-stop sounds by lowering high frequencies and gain, while keeping the final stop heavier than earlier stops.

### Key invariant for future agents
- If tick timing still feels late, tune `TICK_LEAD_RATIO` before changing animation timing.
- If iPhone still does not reveal the step-down, tune the `levelByActiveReels` values in `playTick()`.
- Keep this as a separate tuning commit so the first per-reel audio pass and this timing/tonal adjustment can be compared independently.

---

## 27. Mechanical Tick Timbre Tuning — 2026-05-21

### Starting point / rollback
This tuning pass follows `a12bed7` (`Tune slot audio timing and step-down`). The timing and 3→2→1 reel step-down were reported as much better on both desktop and iPhone, so this pass preserves those behaviors and changes only the tick timbre.

### Feedback addressed
- The timing felt better.
- The rolling sound now stepped down correctly on both desktop and iPhone.
- The overall rolling/tick sound was not liked; it felt too much like a whirling/tonal sound rather than a slot-machine reel turning.

### Changes
- Replaced the tonal triangle-oscillator tick with a short filtered noise click plus a very short low square-wave knock.
- Kept the existing `TICK_LEAD_RATIO` timing behavior from the previous pass.
- Kept the explicit active-reel volume levels so the mobile step-down remains obvious.
- Left reel-stop clunks mostly unchanged from the prior pass; the main disliked sound was the rolling/tick texture.

### Key invariant for future agents
- If the rolling sound still feels wrong, continue tuning `playTick()` in `utils/audio.ts` without changing `SlotMachine.tsx` timing unless the sync regresses.
- The current desired direction is mechanical reel teeth/clicks, not a pitched musical/whirring tone.

---

## 28. Decelerating Ratchet Tick Tuning — 2026-05-21

### Starting point / rollback
This pass follows `3b16ca3` (`Tune slot tick timbre`). The timing and mobile step-down remain good, but the tick still read too much like cards shuffling/fanning and did not make each reel's pre-stop slowdown obvious enough.

### Feedback addressed
- The sound gets lower/quieter as reels stop, which is good.
- What is missing is the sound of each individual reel slowing down right before it stops.
- The rolling sound still reads a little like a deck of cards instead of a slot-machine reel.

### Changes
- `SlotMachine.tsx` now computes each reel's progress toward its own stop target and passes a `slowdown` value to `playTick()`.
- `playTick(reel, activeReels, slowdown)` now uses that value to lower pitch and slightly lengthen tick duration as the reel approaches its stop.
- Removed the filtered-noise tick layer that could read like cards fanning.
- Replaced it with a short square-wave ratchet knock plus a tiny metal triangle click, keeping the existing active-reel volume steps.

### Key invariant for future agents
- Preserve the `TICK_LEAD_RATIO` timing unless sync becomes a problem again.
- If the reel slowdown still is not audible enough, tune the `slowdown` curve in `SlotMachine.tsx` or the pitch/duration changes in `playTick()`, not the visual animation.
- The target sound is mechanical ratchet/slot reel teeth, not card shuffle, fan noise, or musical whirr.

---

## 29. Real Reel Sample Attempt Reverted — 2026-05-21

### What happened
Commit `dfc99aa` added a CC0 Freesound/Pixabay reel recording as a looping spin bed. It was reverted in commit `a8b6967` because the sample was a full event-style recording with its own clunky startup and internal timing, so it did not line up cleanly with the app's reel animation.

### Key lesson
Do **not** use a full slot-machine spin recording as the reel bed. The app already controls lever pull, reel timing, step-down, and reel stops. A full recording fights that timing.

### Desired replacement asset
Look for a clean, steady loopable reel-running sound:
- 1-3 seconds is ideal
- no lever pull
- no startup clunk
- no reel stop
- no win/jackpot sound
- no built-in slowdown
- no complete spin event
- should loop without an obvious bump

Useful search terms:
- `slot machine reel loop`
- `slot machine reel spin loop`
- `mechanical reel loop`
- `slot reel running sound`
- `slot machine motor loop`
- `casino slot reel spinning loop`

### Next implementation note
When a good licensed loop is found, reintroduce sample-bed playback as a new isolated commit. Keep the existing timing/step-down code from `5098a7a`, but swap in the clean loop instead of a full event recording. Document source, license, and download URL here.

---

## 30. Approved Reel Sample Asset Pass — 2026-05-21

### Starting point / rollback
This pass follows `ea86ccb` and reintroduces sample-based reel audio, but uses user-provided/approved source clips instead of the rejected full-event Freesound sample. If disliked, revert the commit following this note; the synthesized fallback timing from `5098a7a` remains the baseline underneath.

### Source / approval
The user provided and approved these source files for use:
- `1-slot-machine-loose-4msgywok.wav` — 3.0s, stereo, 44.1kHz, 16-bit PCM
- `1-spin-reel-stop-vjal3u5g.wav` — 2.0s, stereo, 44.1kHz, 16-bit PCM

### Derived app assets
Generated under `public/audio/`:
- `slot-reel-start-approved.wav` — 0.38s startup/engage sound trimmed from the first source clip
- `slot-reel-spin-bed-approved.wav` — 7.2s extended spin bed created from the steady middle of the first source clip with overlap/crossfade extension
- `slot-reel-stop-approved.wav` — 0.325s stop hit trimmed around the useful transient in the second source clip

### Implementation
- `utils/audio.ts` adds HTML-audio sample helpers:
  - `startReelSampleSpin()`
  - `setReelSampleActiveReels()`
  - `stopReelSampleSpin()`
  - `playSampleReelStop()`
- `SlotMachine.tsx` starts the approved sample bed at spin start, lowers the bed level as reels stop, stops it after the final reel, and plays the approved stop sample per reel.
- The synthetic tick/clunk logic remains as fallback if sample playback fails or is unavailable.

### Key invariant for future agents
- Keep approved audio assets under `public/audio/` so Expo web can serve them directly.
- If the sample bed feels misaligned, tune the derived asset trim/crossfade or sample-bed volume/fade constants before changing reel animation timing.
- Do not remove the synthetic fallback unless native/mobile sample playback is fully implemented and tested.

---

## 31. Approved Reel Sample Timing/Level Tuning — 2026-05-21

### Starting point / rollback
This pass follows `4335750` (`Use approved reel audio samples`). The approved samples sounded much more real, but the sample bed started late, stop sounds felt late, and the spin bed did not drop enough in volume as reels stopped.

### Changes
- `utils/audio.ts`
  - Increased the 3-reel bed level and reduced 2-reel/1-reel levels for a more obvious 3→2→1 drop.
  - Shortened sample-bed fade durations so level changes happen closer to the visual reel stops.
  - Starts the derived spin bed at `0.12s` to skip the tiny leading fade-in and align the bed sooner with reel motion.
  - Final bed fade-out is faster so the stop sample is not masked.
- `SlotMachine.tsx`
  - Plays the reel-stop sample before stopping/fading the final bed, keeping the stop transient from feeling swallowed by the bed shutdown.

### Key invariant for future agents
- If the sample still feels late, first tune the derived asset start trim or the `el.currentTime` offset in `startReelSampleSpin()`.
- If the step-down is still too subtle, tune `SAMPLE_BED_VOLUME_BY_ACTIVE_REELS`.
- Keep the approved source asset documentation in section 30.

---

## 32. New Approved Spin Bed + Early Stop Scheduling — 2026-05-21

### Starting point / rollback
This pass follows `08fd74e` (`Tune approved reel sample timing`). The previous approved sample pass sounded real but the spin bed did not have the desired natural start/ramp, and the stop sample still felt late.

### Source / approval
The user provided and approved a new 10.0s source file for the spin sound:
- `1-slot-machine-reel-spinnin-xewzdgqk.wav`
- Stereo, 44.1kHz, 16-bit PCM
- The first sound in the clip is intended to happen immediately when the spin button is pressed.
- The clip includes a small natural delay/ramp before the reels reach full speed, which matches the desired slot-machine feel.

### Changes
- Replaced `public/audio/slot-reel-spin-bed-approved.wav` with a 9.45s trimmed version of the new approved spin source, preserving its startup/ramp and trimming trailing silence.
- `utils/audio.ts`
  - No longer plays the separate `slot-reel-start-approved.wav` during sample spins; the new spin bed includes the intended start.
  - Starts the spin bed at `currentTime = 0`.
  - Slightly adjusted bed volumes to preserve a strong 3→2→1 drop.
- `SlotMachine.tsx`
  - Added `SAMPLE_STOP_LEAD_MS = 130`.
  - Schedules the approved stop sample slightly before each reel's animation completion, while the animation callback still handles state, bed fade-down, and synthetic fallback.
  - Keeps fallback `playReelStop()` if the scheduled sample stop did not play.

### Key invariant for future agents
- If stop sounds still feel late, tune `SAMPLE_STOP_LEAD_MS` before changing animation duration or easing.
- If the spin start feels late, do **not** skip into this new bed unless the user says the startup transient is too early; the clip's natural start is intentional.
- Keep the previous `slot-reel-start-approved.wav` file for now, but sample spins no longer use it.

---

## 33. Mechanical Spin Preroll Delay — 2026-05-21

### Starting point / rollback
This pass follows `e74481a` (`Use new approved spin bed timing`). The new approved spin bed has the desired button/start transient and a small natural ramp before the reels get going. The visual reels, however, still began moving immediately, so they did not match the mechanical delay in the audio.

### Changes
- Added `SPIN_PREROLL_MS = 500` in `components/SlotMachine.tsx`.
- Reel animations now start 500ms after the audio/spin state begins, creating a short mechanical delay between pressing the button and visible reel motion.
- Scheduled sample stop sounds now include the same preroll offset, so the early stop lead remains aligned with the delayed animation.

### Key invariant for future agents
- If the start feels too sluggish or too quick, tune `SPIN_PREROLL_MS` first.
- If stop timing changes after adjusting preroll, make sure stop timers still include `SPIN_PREROLL_MS + duration - SAMPLE_STOP_LEAD_MS`.
- The goal is for the audio startup/ramp to lead the visual reels, like a mechanical machine engaging before the reels reach speed.

---

## 34. Audio V1 Mechanical Reset — 2026-05-21

### Starting point / rollback
This pass follows `7e55e46` (`Add mechanical preroll before reel motion`). The approved sample direction was rejected because the spin bed still did not feel right, so this reset returns the game to the synthetic mechanical baseline from `5098a7a` and keeps only the parts of the later work that still matched the desired feel.

### Version marker
- Current audio checkpoint: `audio-v1-mechanical-reset`
- The marker lives in `utils/audio.ts` as `SLOT_AUDIO_VERSION` so we can identify the deployed sound pass while tuning continues.

### Changes
- Removed the approved sample WAV assets from `public/audio/`.
- Removed sample-bed playback from the reel flow by restoring the synthetic `playLeverPull()`, `playTick()`, and `playReelStop()` path.
- Kept the 500ms spin preroll delay so pressing the button produces a mechanical engage moment before the reels visibly start moving.
- Added early scheduled synthetic stop sounds using `SYNTH_STOP_LEAD_MS = 120`, with callback fallback if a timer does not fire.
- Preserved per-reel tick slowdown and active-reel volume stepping so the rolling sound drops from 3 reels to 2 reels to 1 reel.

### Key invariant for future agents
- Treat `audio-v1-mechanical-reset` as the new named baseline while tuning.
- If the stop clunk feels early or late, tune `SYNTH_STOP_LEAD_MS` before changing reel animation durations.
- If the button-to-reel delay feels wrong, tune `SPIN_PREROLL_MS`.
- Do not reintroduce full-event slot-machine recordings unless they are split into controllable start, loop, and stop pieces that match the app's animation timing.

---

## 35. Audio V1.1 Preroll Visibility — 2026-05-21

### Starting point / rollback
This pass follows `46b811f` (`Reset slot audio to mechanical v1`). The next test is specifically about whether the button-to-reel delay should be longer and whether the active audio timing version should be visible during testing.

### Version marker
- Current audio checkpoint: `audio-v1.1-mechanical-1000ms`
- The visible slot screen label now shows the audio checkpoint and preroll value.

### Changes
- Doubled `SPIN_PREROLL_MS` from 500ms to 1000ms.
- Updated `SLOT_AUDIO_VERSION` to `audio-v1.1-mechanical-1000ms`.
- Added a small visible timing/version label below the slot machine: `audio-v1.1-mechanical-1000ms | preroll 1000ms`.
- Stop sound scheduling still uses `SPIN_PREROLL_MS + duration - SYNTH_STOP_LEAD_MS`, so the stop clunks remain aligned with the delayed reel motion.

### Key invariant for future agents
- While audio is being tuned, keep the visible label in sync with `SLOT_AUDIO_VERSION` and `SPIN_PREROLL_MS`.
- If the testing label should be removed for production later, remove only the visible label; keep `SLOT_AUDIO_VERSION` for rollback/debugging.

---

## 36. Mobile Audio Version Badge Placement — 2026-05-21

### Starting point / rollback
This pass follows `3168eff` (`Show audio timing version and double preroll`). The first visible test label was placed below the slot machine, but on iPhone it could sit too low in the page to be useful while checking the spin.

### Changes
- Moved the visible audio timing label onto the upper cabinet face where it should be visible in the first mobile viewport.
- Shortened the visible text to `v1.1 | 1000ms` for mobile readability.
- Kept the internal `SLOT_AUDIO_VERSION` value as `audio-v1.1-mechanical-1000ms`.

### Key invariant for future agents
- During audio testing, keep the visible badge near the cabinet top so iPhone checks can confirm the deployed version without scrolling.

---

## 37. Audio V1.2 Button Press + 1000ms Preroll — 2026-05-21

### Starting point / rollback
This pass follows `0649cb2` (`Move audio version badge onto cabinet`). The desired behavior is now explicit: pressing the spin button should make a distinct button sound immediately, then the reels should wait one second before rolling.

### Version marker
- Current audio checkpoint: `audio-v1.2-button-1000ms`
- Visible badge: `v1.2 | 1000ms`

### Changes
- Kept `SPIN_PREROLL_MS = 1000`.
- Reworked `playLeverPull()` into a short mechanical button press sound: button-down thunk, contact click, and small spring/release tick.
- Removed the longer sawtooth scrape from the initial press sound so the first second reads as button engagement, not reel movement.
- Left reel rolling and stop sounds unchanged from v1.1.

### Key invariant for future agents
- Keep the button sound short enough that the 1000ms preroll still feels like a pause before reel motion.
- If this works directionally but feels too quiet/loud on iPhone, tune only `playLeverPull()` gain values before changing reel timing.

---

## 38. Audio V1.3 Immediate Button Press + Persistent Spin Again — 2026-05-21

### Starting point / rollback
This pass follows `b22f940` (`Add button press sound before reel preroll`). iPhone testing showed the button sound still felt delayed/too subtle, and the cabinet button label changed back to `SPIN` during the next spin after a result.

### Version marker
- Current audio checkpoint: `audio-v1.3-button-immediate-1000ms`
- Visible badge: `v1.3 | 1000ms`

### Changes
- Moved the spin button sound to `onPressIn` so it fires on finger-down instead of waiting for the completed press.
- Kept a fallback in `handleSpin(true)` so keyboard/accessibility activation can still play the sound if `onPressIn` did not.
- Warms the web audio stream during touch unlock with `kickStream()` to reduce iPhone Safari startup latency.
- Made the button press sound louder and more distinct.
- Added `hasCompletedSpin` in `app/index.tsx`; the cabinet button starts as `SPIN` and stays `SPIN AGAIN` after the first completed spin, including during later spins.

### Key invariant for future agents
- Do not tie the main cabinet button label directly to `spinState === 'result'`; use the completed-spin history so it does not flicker back to `SPIN`.
- If the button sound still feels delayed on iPhone, keep investigating touch/audio unlock timing before changing the 1000ms reel preroll.

---

## 39. Audio V1.4 Two-Second Reel Preroll — 2026-05-21

### Starting point / rollback
This pass follows `8211777` (`Make spin press immediate and keep spin again label`). The next test doubles the pause between the immediate button press sound and the start of reel motion/rolling ticks.

### Version marker
- Current audio checkpoint: `audio-v1.4-button-immediate-2000ms`
- Visible badge: `v1.4 | 2000ms`

### Changes
- Doubled `SPIN_PREROLL_MS` from 1000ms to 2000ms.
- Kept the button press sound on `onPressIn`, so it still fires immediately on touch.
- Left the rolling/tick and stop sounds unchanged; because reel animation is delayed, rolling ticks also begin after the 2000ms preroll.
- Stop sound scheduling still uses `SPIN_PREROLL_MS + duration - SYNTH_STOP_LEAD_MS`, so stop clunks remain aligned after the longer delay.

### Key invariant for future agents
- If the pause feels too long, tune `SPIN_PREROLL_MS`; do not compensate by moving tick or stop scheduling separately.

---

## 40. Audio V1.5 Snappier Spin, Ramp-Up, Wider Reel Mix — 2026-05-21

### Starting point / rollback
This pass follows the v1.4 2000ms preroll, which felt too long after the button press. User feedback: the delay was too long, the spin didn't feel like it ramped up, and the volume difference between 1/2/3 active reels was too subtle.

### Version marker
- Current audio checkpoint: `audio-v1.5-snappier-spin-600ms`
- Visible badge: `v1.5 | 600ms`

### Changes
- `SPIN_PREROLL_MS` cut from 2000ms to 600ms so the spin follows the button press much more responsively. Stop scheduling still derives from `SPIN_PREROLL_MS + DURATIONS[...] - SYNTH_STOP_LEAD_MS`, so stop clunks remain aligned.
- Spin easing changed from `Easing.out(Easing.cubic)` to `Easing.bezier(0.22, 0.05, 0.25, 1)`. The first ~12% of progress now eases in, giving a real ramp-up feel before the trailing deceleration.
- `playTick()` now accepts a `rampup` argument (0–1, where 1 = very beginning of spin). Tick volume, duration and pitch are attenuated during the ramp so the reels audibly accelerate, not just visually. SlotMachine computes `rampup` from progress and `RAMPUP_PROGRESS = 0.12`.
- Tick volume scaling per active reel widened from `{1: 0.026, 2: 0.048, 3: 0.074}` to `{1: 0.020, 2: 0.052, 3: 0.105}` so 3 reels feel clearly louder than 1.
- `playLeverPull()` got a low-end sub-thud (150→58 Hz sine), a punchier square downstroke, a stronger contact click, and tighter spring timing — the button now feels more mechanical.

### Key invariant for future agents
- If the spin still feels slow to start, retune `RAMPUP_PROGRESS` or the bezier control points (especially the second X) before touching `DURATIONS`.
- Keep the `rampup` parameter passed from the animation listener in `SlotMachine.tsx`; removing it will silently re-flatten the ramp without breaking the build.
- If the v1.5 button thud is too boomy on iPhone, drop the `sub` oscillator gain in `playLeverPull()` first before reverting the rest.

---

## 41. Audio V1.6 Mechanical Tick (Filtered Noise + Body Thump) — 2026-05-21

### Starting point / rollback
This pass follows v1.5. The spin timing, preroll, ramp-up and reel-volume mapping all felt right, but the tick itself sounded buzzy/electronic — the square-wave + triangle "ratchet" gave away the synth. Goal: make each tick feel like a wooden pawl hitting a metal cog, not a tone.

### Version marker
- Current audio checkpoint: `audio-v1.6-mechanical-tick-600ms`
- Visible badge: `v1.6 | 600ms`

### Changes
- Added `_noiseBuffer` (lazy 80ms mono white-noise buffer) and `getNoiseBuffer(c)` helper in `utils/audio.ts`. Generated once per AudioContext and reused for every tick.
- Rewrote `playTick()` around three short layers instead of two oscillators:
  1. **Contact**: white-noise burst routed through a per-reel bandpass (centers 2400/2700/3050 Hz, Q ≈ 4–5) with random ±8% center jitter and 0.92–1.10× playback-rate jitter so consecutive ticks never sound identical.
  2. **Body**: low triangle (≈92/100/108 Hz per reel) with a fast downward pitch envelope (1.55× → 1×) — gives the click weight without becoming a bass note.
  3. **Tink**: very brief (≈9 ms) triangle at 1950–2450 Hz at ~16% relative gain — keeps a faint metallic seasoning without buzz.
- Slowdown still attenuates filter center + lowers body pitch. Rampup still attenuates overall level and the filter center, so the audible acceleration at spin start is preserved.
- Volume map `levelByActiveReels` unchanged from v1.5: `{1: 0.020, 2: 0.052, 3: 0.105}`.
- `playLeverPull()`, `playReelStop()`, win/lose sounds left alone — only the rolling tick is replaced.

### Key invariant for future agents
- Do not switch the contact layer back to a raw oscillator — the buzzy quality came from a tonal source. If the noise feels too "shh", lower the Q (less filter ringing) or shorten the gain envelope, don't reintroduce square waves.
- The per-tick random jitter (filter center, playback rate, Q) is what kills the robotic repetition. Keep it.
- `_noiseBuffer` is shared across calls — never mutate it after creation. If you change the buffer length, also update the 0.06s `noise.stop()` bound so it doesn't get truncated.
- If volume across reels feels off, retune `levelByActiveReels` first; the per-layer multipliers (4.6× noise, 1.45× body, 0.16× tink) were balanced against that map.

---

## 42. V1.6 Cleanup — Removed Debug Badge, UI Finalized — 2026-05-21

### Starting point
This pass follows v1.6 mechanical tick work. The sound design was complete and approved, but a temporary debug badge (`v1.6 | 600ms`) was still visible on the cabinet for testing and tuning purposes.

### Changes
- Removed the visible `<Text>` component from `components/SlotMachine.tsx` (lines 415–427) that displayed the `AUDIO_TEST_LABEL` badge.
- Removed the `AUDIO_TEST_LABEL` constant definition from `SlotMachine.tsx`.
- Removed the unused `SLOT_AUDIO_VERSION` import from `utils/audio.ts` in the component file (the constant remains in `audio.ts` for future rollback/debugging reference).
- No changes to sound synthesis, animation timing, or reel logic.

### Verification
- `npx tsc --noEmit` passes with no errors.
- Cabinet now displays cleanly without any version/timing text overlay.
- All sound behavior remains unchanged from v1.6.

### Key invariant for future agents
- The `SLOT_AUDIO_VERSION` constant in `utils/audio.ts` remains as an internal reference for debugging and rollback decisions. It is no longer displayed in the UI.
- If future audio tuning passes need a visible testing label, use a separate component prop or state to control visibility rather than hardcoding the label in the JSX.
- v1.6 is now the stable, UI-clean baseline for future sound design iterations.

---

## 43. Shareable Pick V1 — 2026-05-23

### Starting point
The app already had generic Open Graph / Twitter metadata in `app/+html.tsx`, but there was no in-app share action and no way to open a shared restaurant pick.

### Changes
- Added `Share this pick` to the winner card in `app/index.tsx`.
- Share messages now include the selected restaurant name and a link formatted as `/?pick={restaurantId}`.
- The home screen now reads the `pick` query param with Expo Router. If it matches a restaurant, the page opens in a shared-pick result state.
- Shared-pick results reuse the existing winner card, including restaurant logo / fallback initial, name, address, phone, Maps, and website actions.
- Shared-pick mode changes the eyebrow to `A Celebration dining pick` and adds a prominent `Spin your own pick` action so the recipient can enter the slot-machine flow.
- Starting a new spin clears the shared-pick state and removes `?pick=...` from the web URL.

### Verification
- `npx tsc --noEmit` passes with no errors.

### Key invariant for future agents
- V1 uses generic social preview metadata; restaurant-specific preview cards with logo/name in the message preview would require a backend or dynamic OG image route.
- The in-app shared landing state should continue to show the restaurant logo when `logo_url` exists.
- Keep the shared link as an app entry point, not only a restaurant outbound link, so sharing grows app usage while still supporting the concrete restaurant invite.

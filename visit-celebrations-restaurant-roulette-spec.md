# Visit Celebration’s Restaurant Roulette

## Overview

Visit Celebration’s Restaurant Roulette is a mobile-first app concept designed to help locals and visitors quickly choose a place to eat in Celebration, Florida from a curated list of participating restaurants maintained by Visit Celebration.[cite:1][cite:40] The core product loop is simple: open the app, spin a branded roulette wheel, land on one restaurant, and use a primary “Let’s go” action to launch directions in the user’s mapping app.[cite:52][cite:60]

The product is intentionally narrower than broad restaurant discovery apps. Instead of indexing all possible restaurants, it uses the Visit Celebration food-and-drink page as the editorial source list and then applies app-specific include/exclude logic so only eligible locations appear in the wheel.[cite:1]

## Product goals

The primary user goal is to remove decision fatigue by turning “Where should we eat?” into a quick, fun, low-friction action.[cite:16][cite:18] The primary organizational goal is to promote Celebration dining locations through a branded digital experience that can live as both a mobile app and a near-equivalent web experience.[cite:1][cite:40]

The launch version should optimize for:

- Fast and delightful restaurant selection.
- Strong Visit Celebration branding.
- Simple maintenance.
- Minimal operational burden.
- Shareable, repeatable daily use.

## Product positioning

The app should be positioned as a trusted local utility with playful touches rather than as a novelty game. That direction matches the desired brand tone and aligns with the broader Visit Celebration identity on the official website.[cite:40] Competing restaurant roulette apps validate the basic interaction model, but this concept differentiates itself by focusing on a single destination market and a curated tourism-backed restaurant pool.[cite:16][cite:18][cite:38]

**Working product name:** Visit Celebration’s Restaurant Roulette.

**Brand expression:** clean, local, trustworthy, and lightly playful.

## MVP definition

The MVP should be limited to one wheel, one winner, and one primary post-selection action. This keeps the first release focused and avoids turning the app into a full restaurant guide before the core roulette interaction is validated.[cite:16][cite:18]

### MVP features

- One roulette wheel using the eligible Celebration restaurant pool.[cite:1]
- One restaurant result at a time.
- Primary call to action: “Let’s go.”
- Directions handoff to Apple Maps or Google Maps using map URLs.[cite:52][cite:59][cite:60]
- Secondary action: “Spin again.”
- View-all-restaurants screen.
- Temporary user-side exclusion of restaurants from the current session’s spin pool.
- Admin-side include/exclude control via simple data flags.
- Web version with nearly the same functionality as mobile.

### Not required for MVP

- User accounts.
- Payments or subscriptions.
- Push notifications.
- Phone-call button.
- Favorites.
- Ratings/reviews.
- Live polling of the source website on every app launch.
- Real-time “open now” logic.
- Heavy restaurant photography requirements.

## Audience

The primary audience is the general public, especially Celebration residents and visitors trying to decide where to eat right now.[cite:1][cite:40] The app should work for spontaneous use cases such as family meal decisions, casual outings, and tourism discovery.[cite:40]

There is only one end-user type in the MVP: the diner. Admin behavior should remain behind the scenes and be handled through a simple data-management workflow rather than a complex back-office system.

## Core user flow

1. User opens the app.
2. User sees the branded wheel and a prominent spin action.
3. User optionally opens the restaurant list and temporarily excludes places from the current session.
4. User spins the wheel.
5. Wheel animation lands on one eligible restaurant.
6. Result screen shows the selected restaurant and next-step actions.
7. User taps “Let’s go” to open directions in Apple Maps or Google Maps.[cite:52][cite:59][cite:60]
8. User can instead tap “Spin again” and repeat.

This flow follows a good mobile-navigation principle: the next action after the decision is immediate and obvious, rather than hidden behind extra branching.[cite:45]

## Screen architecture

### Home / spin screen

The home screen should prioritize the wheel and the spin action over all other content. The screen should not be crowded with every restaurant name, because that would reduce the sense of simplicity and polish.

Suggested elements:

- App header with Visit Celebration branding.
- Wheel component.
- Primary spin button.
- Small link or button to view restaurant list.
- Optional small line of supportive copy.

### Result screen

The result screen should be lightweight and action-oriented, with the chosen restaurant as the clear focal point. Competing roulette apps commonly move directly into directions, details, or retry actions after selection, which supports this structure.[cite:18][cite:33][cite:34]

Suggested elements:

- Restaurant name.
- Short branded line such as “Your Celebration pick is…”
- Address.
- Primary button: “Let’s go.”
- Secondary button: “Spin again.”
- Tertiary text link: “More info.”

“More info” should hand off to the restaurant website or map listing rather than forcing the app to own every detail page at launch.[cite:52][cite:60]

### Restaurant list screen

The list screen should allow browsing all included locations and optionally letting the user temporarily exclude entries from the current session pool. This supports user control without cluttering the main wheel experience.

Suggested list features:

- Search or quick scan by name.
- Basic restaurant cards or rows.
- Temporary include/exclude toggle per restaurant for the current session only.
- Visual distinction between included and excluded entries.

### Optional lightweight settings/info screen

A small info area may be useful for:

- About Visit Celebration.
- How the roulette works.
- Data freshness note.
- Link back to Visit Celebration.[cite:40]

## Data model

The Visit Celebration food-and-drink page already provides a practical base dataset including restaurant names, website links, phone numbers, and addresses.[cite:1] The app should use those fields as the starting source, then add app-specific control fields.

### Recommended restaurant schema

| Field | Purpose |
|---|---|
| `id` | Unique internal identifier |
| `name` | Display name |
| `address` | Directions and display |
| `phone` | Stored for future use even if not surfaced in v1 |
| `website_url` | Restaurant site if available |
| `source_url` | Visit Celebration source page or item reference |
| `category` | Optional future grouping |
| `active` | Whether the listing is active |
| `eligible_for_wheel` | Master include/exclude flag |
| `default_excluded` | For entries like Publix, 7-Eleven, Domino’s |
| `session_excluded` | Runtime-only user exclusion state |
| `weight` | Default 1.0, reserved for future weighting |
| `notes` | Internal comments |
| `image_url` | Optional future enhancement |
| `last_verified_at` | Content maintenance tracking |

### Default exclusion policy

The current default exclusions should include Publix, 7-Eleven, and Domino’s unless manually changed later.[cite:1] Chain restaurants that are true restaurant experiences should remain included with equal odds for launch.

## Content source and update strategy

The Visit Celebration food-and-drink page should be treated as the editorial source of truth for the restaurant universe.[cite:1] However, the app should not depend on parsing that page live every time a user opens it.

The preferred v1 model is:

- Seed the app dataset from the Visit Celebration page.[cite:1]
- Store a cleaned copy in a hosted JSON file, CMS collection, or lightweight backend table.
- Refresh manually or via a simple import process when restaurants change.
- Keep include/exclude flags and future weighting controls in the app-owned dataset.

This avoids the brittleness of relying on public page structure at runtime while still keeping Visit Celebration’s website as the master editorial source.[cite:1]

## Maps and external handoff

The app’s main action should launch directions rather than trying to replicate full mapping functionality. Apple supports Maps links via URL parameters, and Google supports Maps URLs across platforms as well as its iOS URL scheme.[cite:52][cite:59][cite:60]

Recommended behavior:

- iOS: prefer Apple Maps by default, with optional Google Maps handling if desired.[cite:52][cite:59]
- Android/web: use Google Maps URLs.[cite:60]
- “More info” can open the place website or map listing for richer details.

This keeps the app focused on decision-making rather than replacing navigation tools.

## Mobile and web strategy

The product should be built mobile-first, but the web version should be functionally very close to the mobile app. That aligns with the goal of embedding or promoting the experience on the Visit Celebration website while still supporting native app distribution later.[cite:40]

Recommended platform strategy:

- Mobile app as the primary experience.
- Web app with nearly identical spin, result, and list functionality.
- Optional embed or landing-page integration on Visit Celebration’s food-and-drink page.[cite:1][cite:40]

## Technical recommendation

The strongest default technical path remains Expo with React Native and TypeScript, because it supports a mobile-first cross-platform build and has a clear path to later App Store and Play Store submission through Expo’s documented workflow.[cite:2][cite:3] React Native’s own publishing guidance also points Expo users toward Expo’s deployment path.[cite:3]

### Suggested stack

- **App framework:** Expo + React Native + TypeScript.[cite:2][cite:3]
- **Web support:** React Native Web or a parallel lightweight web shell using shared business logic.
- **Data source:** hosted JSON or lightweight API.
- **Maps handoff:** Apple Maps / Google Maps URLs.[cite:52][cite:59][cite:60]
- **Animation:** wheel animation with subtle sound/haptic support.
- **Storage:** lightweight local session state for temporary exclusions; no account system required.

### Why this fits

This product does not require payments, chat, advanced uploads, or deep native-only features. That makes it a strong fit for a cross-platform stack centered on interaction, animation, and external map handoff rather than native-heavy workflows.[cite:2][cite:3][cite:52]

## Admin and content control

The MVP does not need a full admin dashboard. A simple managed data file with yes/no flags is enough for launch and matches the desired maintenance model.

### Recommended admin fields

- `active`
- `eligible_for_wheel`
- `default_excluded`
- `weight`
- `notes`

This approach lets the organization suppress specific entries or experiment with weighting later without changing the core app logic.

## Design direction

The interface should visually align with Visit Celebration’s branding while allowing the wheel itself to feel a bit more lively than the surrounding UI.[cite:40] The requested tone sits around a 4 out of 10 on the playful scale, so the design should feel polished first and playful second.

### Design principles

- Clean layout.
- Strong readability.
- Celebration-aligned colors and typography where practical.[cite:40]
- Playful but restrained wheel motion.
- Minimal clutter.
- Clear primary action.
- Premium tourism-utility feel rather than game-show energy.

### Interaction tone

- Subtle sound and/or haptics.
- Smooth spin animation.
- A satisfying reveal state.
- No excessive gimmicks or visual noise.

## Future roadmap

These ideas should be documented as later-phase enhancements rather than included in MVP scope.

### Phase 2 candidates

- Open-now logic if reliable hours data becomes available.
- Restaurant weighting by campaign priority.
- Filters by breakfast, lunch, dinner, dessert, drinks.
- Restaurant photos.
- Favorites.
- “Not this one” memory logic across sessions.
- Promotions or offers tied to selected restaurants.
- Reservation links.
- Featured editorial copy and descriptions.

### Phase 3 candidates

- Lightweight admin UI.
- Analytics dashboard.
- Sponsored or featured placements.
- Seasonal campaigns.
- Social sharing or viral result cards.

## Risks and constraints

The biggest product risk is not technical; it is content consistency. The app experience depends on the restaurant dataset being accurate, clean, and intentionally curated.[cite:1] A second risk is overloading the MVP with too many features borrowed from broader roulette competitors before the core branded experience is proven.[cite:16][cite:18][cite:38]

Key constraints:

- Source page is editorial, not a formal API.[cite:1]
- Some listings may not fit the wheel experience and require manual exclusion.[cite:1]
- “Open now” and richer metadata are not dependable from the current source alone.[cite:1]
- Brand expression must stay aligned with Visit Celebration rather than leaning too far into novelty.[cite:40]

## Claude Code handoff package

The eventual handoff to Claude Code should include at least these files:

- `01-product-brief.md`
- `02-mvp-scope.md`
- `03-user-flows.md`
- `04-screen-architecture.md`
- `05-data-model.md`
- `06-content-update-strategy.md`
- `07-technical-architecture.md`
- `08-design-direction.md`
- `09-build-plan.md`
- `10-open-questions.md`

## Recommended build order

1. Create the cleaned restaurant dataset from the Visit Celebration page.[cite:1]
2. Define include/exclude defaults, including Publix, 7-Eleven, and Domino’s as excluded by default.[cite:1]
3. Build the core wheel interaction.
4. Build result screen with “Let’s go,” “Spin again,” and “More info.”
5. Implement Maps handoff using URLs.[cite:52][cite:59][cite:60]
6. Build restaurant list with temporary session exclusions.
7. Build near-equivalent web version.
8. Apply final Visit Celebration branding and polish.[cite:40]
9. Add optional sound, haptics, and accessibility refinements.
10. Prepare eventual store packaging later through Expo workflows when ready.[cite:2][cite:3]

## Open questions to preserve for later

Some decisions should remain explicitly open rather than guessed:

- Final public app-store naming convention.
- Exact source and handling of restaurant photos.
- Whether “More info” opens map listing, website, or both.
- Whether temporary user exclusions should persist only in-session or across sessions.
- Whether the web app should be embedded inline or launched as its own page on the Visit Celebration domain.[cite:1][cite:40]
- Whether weighting should become an internal campaign control later.

## Final recommendation

The best way to proceed is to treat this concept as a tightly scoped branded utility app, not a general restaurant platform. The project is strong precisely because it is local, curated, and simple.[cite:1][cite:40] A clean dataset, one polished wheel flow, and a frictionless “Let’s go” action are the right foundation for a first version that can later expand into richer restaurant discovery features.[cite:16][cite:18][cite:52][cite:60]

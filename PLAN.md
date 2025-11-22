# Cuphead-Inspired Browser Game - Development Plan

## 📋 Project Status: v2.1 - Production Ready

**Current Features**: 1 boss level, full combat system, sound effects, polish
**Next Milestone**: Bug fixes + Second boss level

---

## 🐛 CRITICAL BUGS TO FIX (Priority 1)

### Gameplay Bugs
- [ ] **Weapon UI not updating on switch**
  - **Issue**: `updateWeaponUI()` only called in `setupUI()`, not during gameplay
  - **Fix**: Call `updateWeaponUI()` in `updatePlaying()` after player update
  - **Location**: `main.js:159`
  - **Estimated Time**: 5 minutes

- [ ] **Super moves counter never increments**
  - **Issue**: `superMovesUsed` is initialized but never incremented
  - **Fix**: Add `this.superMovesUsed++` in `Player.activateSuper()`
  - **Location**: `Player.js:351`, `main.js:34`
  - **Estimated Time**: 5 minutes

- [ ] **Weapon switch flash not visualized**
  - **Issue**: `weaponSwitchFlash` timer exists but no visual feedback
  - **Fix**: Add glow/outline to weapon display when `weaponSwitchFlash > 0`
  - **Location**: `Player.js:321, 326`, `main.js:84-89`
  - **Estimated Time**: 15 minutes

### Technical Debt
- [ ] **setTimeout still used in 3 places**
  - **Issue**: Can cause timing bugs and memory leaks
  - **Locations**:
    - `Player.js:338-354` - Super Move Level I energy bullets
    - `FlowerBoss.js:754` - Boss death animation particles
    - `SoundSystem.js:215` - Victory sound stagger
  - **Fix**: Convert to frame-based timing systems
  - **Estimated Time**: 30 minutes

- [ ] **Charge weapon UX unclear**
  - **Issue**: No visual indicator when charging
  - **Fix**: Add charging animation/effect (already has some, needs enhancement)
  - **Location**: `Player.js:145-152, 368-374`
  - **Estimated Time**: 20 minutes

---

## ✨ POLISH & IMPROVEMENTS (Priority 2)

### UI/UX Enhancements
- [ ] **Add weapon switch indicator to UI**
  - Show current weapon with icon
  - Highlight when switching
  - **Location**: `index.html`, `styles.css`, `main.js`
  - **Estimated Time**: 30 minutes

- [ ] **Add super move level indicators**
  - Visual markers at 100/200/300 meter levels
  - Show which level can be activated
  - **Location**: `index.html`, `styles.css`
  - **Estimated Time**: 20 minutes

- [ ] **Add tutorial/help overlay**
  - Can be toggled with H key
  - Shows all controls and mechanics
  - **Estimated Time**: 45 minutes

- [ ] **Improve game over screen**
  - Add best attempt tracking
  - Show highest phase reached
  - **Location**: `main.js:366-381`
  - **Estimated Time**: 30 minutes

### Gameplay Polish
- [ ] **Add difficulty selection**
  - Simple/Regular/Expert modes
  - Affects boss HP, damage, attack speed
  - **Location**: New difficulty select screen
  - **Estimated Time**: 1 hour

- [ ] **Add health pickups**
  - Drop from destroyed minions (10% chance)
  - Heal 1 HP
  - **Location**: `FlowerBoss.js`, new `Pickup.js`
  - **Estimated Time**: 45 minutes

- [ ] **Add combo/score system**
  - Track consecutive hits without taking damage
  - Bonus points for parries
  - Display during gameplay
  - **Estimated Time**: 1 hour

### Visual Improvements
- [ ] **Add hit-stop/freeze frames**
  - Brief pause on big hits for impact
  - **Location**: `main.js`, `Player.js`
  - **Estimated Time**: 30 minutes

- [ ] **Improve particle effects**
  - Different colors per attack type
  - Bigger explosions for super moves
  - **Location**: `ParticleSystem.js`
  - **Estimated Time**: 45 minutes

- [ ] **Add background parallax layers**
  - Multiple cloud layers
  - Moving trees/plants
  - **Location**: `main.js:drawBackground()`
  - **Estimated Time**: 1 hour

---

## 🎮 LEVEL 2: DRAGON BOSS (Priority 3)

### Planning Phase
- [x] **Design document created** (see below)
- [ ] **Create sprite mockups/designs**
  - Dragon in different poses
  - Cloud platforms
  - Fire effects
  - **Estimated Time**: 2 hours

### Core Implementation
- [ ] **Create DragonBoss.js**
  - Extend Boss class
  - 3 phases with unique mechanics
  - Flying movement patterns
  - **Estimated Time**: 3 hours

- [ ] **Create Platform.js**
  - Cloud platforms that player can stand on
  - Platform collision detection
  - Moving platforms
  - **Estimated Time**: 2 hours

- [ ] **Create CloudMinion.js**
  - Flying enemy that shoots lightning
  - Can be destroyed
  - **Estimated Time**: 1 hour

- [ ] **Update Player.js for platforms**
  - Platform collision detection
  - Landing on platforms
  - Falling through platforms
  - **Estimated Time**: 1.5 hours

### Dragon Boss Attacks
- [ ] **Phase 1 Attacks**
  - Fireball spit (spread pattern)
  - Cloud summon (minions)
  - Tail swipe (ground attack)
  - **Estimated Time**: 2 hours

- [ ] **Phase 2 Attacks**
  - Flame breath (continuous stream)
  - Dive bomb with shockwave
  - Ring of fire (circular pattern)
  - Cloud barrier (obstacles)
  - **Estimated Time**: 2.5 hours

- [ ] **Phase 3 Attacks**
  - Meteor shower (from above)
  - Flame tornado (spiraling)
  - Desperation dives (rapid)
  - Fire wall (pushing hazard)
  - **Estimated Time**: 2 hours

### Level System
- [ ] **Create level selection screen**
  - Show unlocked levels
  - Display best grades
  - Level preview
  - **Location**: New `level-select.html` or in-game
  - **Estimated Time**: 2 hours

- [ ] **Save system for progression**
  - localStorage for unlocks
  - Best times and grades
  - **Location**: New `SaveSystem.js`
  - **Estimated Time**: 1.5 hours

- [ ] **Transition between levels**
  - Victory leads to level select
  - Smooth transitions
  - **Location**: `main.js`
  - **Estimated Time**: 1 hour

### Visual & Polish for Level 2
- [ ] **Sky/cloud background**
  - Parallax cloud layers
  - Sunset/storm effects
  - **Estimated Time**: 1.5 hours

- [ ] **Dragon animations**
  - Flying cycle
  - Attack animations
  - Damage/death sequences
  - **Estimated Time**: 2 hours

- [ ] **Fire/lightning effects**
  - Flame particles
  - Lightning bolt visuals
  - Burn effects
  - **Location**: `ParticleSystem.js`
  - **Estimated Time**: 1.5 hours

---

## 📝 LEVEL 2: DETAILED DESIGN SPEC

### Boss: Grim Matchstick (Dragon)
**Theme**: Sky battle, clouds and storms
**Difficulty**: Medium (harder than Flower Fiend)
**Duration**: 3-4 minutes
**Total HP**: 400 (vs Flower's 300)

### Arena Design
```
┌─────────────────────────────────────┐
│  ☁️        STORM CLOUDS       ☁️   │ <- Background
│                                     │
│     [Cloud Platform]    🐉          │ <- Boss flies here
│                                     │
│  [Cloud]          [Cloud]           │ <- Platforms
│                                     │
│         [Cloud Platform]            │
│                                     │
│═════════════════════════════════════│ <- Ground
└─────────────────────────────────────┘
```

### Phase 1: Cloud Hopper (100-66% HP)
**Behavior**: Dragon's head pokes through clouds at random positions

**Attack Pattern**:
1. **Fireball Spit** (every 3 seconds)
   - 3 fireballs in 30° spread
   - Speed: 6 pixels/frame
   - Damage: 1
   - Orange color

2. **Cloud Summon** (every 8 seconds)
   - Spawn 2 cloud minions
   - Clouds float horizontally
   - Shoot lightning every 4 seconds
   - Lightning is PINK (parryable)
   - Clouds have 3 HP

3. **Tail Swipe** (every 10 seconds)
   - Shadow appears on ground (1 second warning)
   - Tail sweeps from left to right
   - Width: 100px, Height: 80px
   - Must jump to avoid
   - Damage: 1

**Safe Zones**: Stay on platforms, use vertical space

### Phase 2: Full Flight (66-33% HP)
**Transition**: Dragon breaks free, full body visible

**Behavior**:
- Figure-8 flight pattern
- Speed increases
- Occasional dive attacks

**Attack Pattern**:
1. **Flame Breath** (every 6 seconds)
   - Continuous stream for 3 seconds
   - Sweeps horizontally at player's height
   - Width: 800px, Height: 60px
   - Damage: 1 per hit (can hit multiple times)
   - Must dash through or use platforms

2. **Dive Bomb** (every 9 seconds)
   - Dragon dives at player's X position
   - Shadow grows for 1 second (telegraph)
   - Creates shockwave on impact (radius: 150px)
   - Damage: 1 (direct), 1 (shockwave)
   - Dragon vulnerable for 2 seconds after

3. **Ring of Fire** (every 12 seconds)
   - 12 fireballs in circle expanding from dragon
   - Every 3rd fireball is PINK (parryable)
   - Gaps between fireballs to dodge
   - Speed: 5 pixels/frame
   - Damage: 1

4. **Cloud Barrier** (every 15 seconds)
   - Summons 3 thick clouds in line
   - Clouds block player bullets
   - Clouds have 10 HP each
   - Last for 8 seconds or until destroyed
   - No damage, just obstacles

### Phase 3: Desperate Inferno (33-0% HP)
**Transition**: Dragon turns red/orange, smoke effects

**Behavior**:
- Erratic movement
- All attacks 30% faster
- Multiple attacks can overlap

**Attack Pattern**:
1. **Meteor Shower** (every 5 seconds)
   - 8-12 fireballs fall from top
   - Random X positions
   - Every 4th is PINK (parryable)
   - Speed: 8 pixels/frame
   - Damage: 1

2. **Flame Tornado** (every 10 seconds)
   - Spiraling flames from screen center
   - 20 flames in spiral pattern
   - Rotates and expands
   - Pink flames at positions 5, 10, 15, 20
   - Safe in corners initially
   - Damage: 1

3. **Desperation Dive** (below 15% HP, repeating)
   - 4-5 consecutive dives
   - 0.5 second telegraph each
   - Small recovery windows
   - Damage: 1 each
   - Creates screen shake

4. **Fire Wall** (every 12 seconds)
   - Wall of flames moves from one side
   - Forces player to opposite side
   - Combined with other attacks
   - Width: full screen, Height: full screen
   - Speed: 3 pixels/frame
   - Damage: 1

**Desperation Mode** (below 10% HP):
- Meteor shower + Flame tornado together
- Dive attacks more frequent
- Fire walls from both sides

### Parry Opportunities Summary
- Cloud lightning bolts (Phase 1)
- Every 5th fireball (Phase 1)
- Ring of fire (every 3rd, Phase 2)
- Meteor shower (every 4th, Phase 3)
- Flame tornado (specific positions, Phase 3)

### Difficulty Comparison

| Metric | Flower Fiend | Dragon Boss |
|--------|--------------|-------------|
| HP | 300 | 400 |
| Phases | 3 | 3 |
| Parry Opportunities | Medium | High |
| Movement Required | Horizontal | Full 2D |
| Attack Speed | Medium | Fast |
| Minion Count | 2-4 flytraps | 2-3 clouds |
| Environmental Hazards | Ground spikes | Platforms, meteors |

---

## 🚀 FUTURE LEVELS & CONTENT

### Level 3: Ideas
- [ ] **Ocean Boss** - Underwater octopus with tentacles
- [ ] **Haunted House Boss** - Ghost with multiple forms
- [ ] **Candy Land Boss** - Giant gummy bear or candy cane

### Level 4+: Ideas
- [ ] **Final Boss** - Multi-phase epic battle
- [ ] **Secret Boss** - Unlock with perfect grades
- [ ] **Boss Rush Mode** - Fight all bosses in sequence

### Meta Progression
- [ ] **Shop System**
  - Spend coins earned from battles
  - Buy new weapons
  - Buy charms/upgrades
  - Buy cosmetic skins

- [ ] **Charm System**
  - Equip passive abilities
  - Examples: +1 HP, faster dash, auto-parry
  - Limited slots (2-3 charms)

- [ ] **Weapon Unlocks**
  - Start with peashooter only
  - Unlock spread after Level 1
  - Unlock charge after Level 2
  - Unlock special weapons from shop

### Quality of Life
- [ ] **Remappable controls**
- [ ] **Gamepad support**
- [ ] **Mobile touch controls**
- [ ] **Speedrun timer mode**
- [ ] **Practice mode** (test attacks without health loss)

---

## 🎨 ART & ASSETS

### Current State
- ✅ Programmer art (shapes and colors)
- ✅ Procedural drawing with Canvas 2D
- ✅ Particle effects

### Future Art Improvements
- [ ] **Sprite-based graphics**
  - Hand-drawn sprites
  - Animation frames
  - Sprite sheets

- [ ] **Background art**
  - Detailed parallax layers
  - Environmental details
  - Weather effects

- [ ] **UI Graphics**
  - Custom fonts
  - Decorative borders
  - Animated buttons

- [ ] **Character portraits**
  - Boss intro cards
  - Player expressions

---

## 🎵 AUDIO IMPROVEMENTS

### Current State
- ✅ Web Audio API synthesized sounds
- ✅ Basic SFX for all actions
- ❌ No background music
- ❌ No boss voice lines

### Future Audio
- [ ] **Background Music**
  - Jazzy 1930s style tracks
  - Dynamic music (changes with boss phase)
  - Victory jingles

- [ ] **Enhanced SFX**
  - Higher quality samples
  - Positional audio
  - Reverb/echo effects

- [ ] **Voice Lines**
  - Boss taunts
  - Player reactions
  - Announcer voice

---

## 📱 PLATFORM SUPPORT

### Current Support
- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)
- ✅ Keyboard controls
- ❌ Mobile devices
- ❌ Gamepad

### Future Platform Support
- [ ] **Mobile Optimization**
  - Touch controls
  - Responsive layout
  - Performance optimization
  - On-screen buttons

- [ ] **Gamepad Support**
  - Xbox controller
  - PlayStation controller
  - Generic USB gamepads
  - Button remapping

- [ ] **PWA (Progressive Web App)**
  - Install to home screen
  - Offline play
  - App-like experience

---

## 🏆 ACHIEVEMENTS & STATS

- [ ] **Achievement System**
  - Beat boss without taking damage
  - Get S rank on all levels
  - Perform 50 parries in one fight
  - Beat boss using only one weapon
  - Speedrun achievements

- [ ] **Statistics Tracking**
  - Total playtime
  - Total deaths
  - Best times per boss
  - Parries performed
  - Favorite weapon (most used)

- [ ] **Leaderboards**
  - Local high scores
  - Online leaderboards (optional)
  - Time attack mode

---

## 🧪 TESTING & QA

### Current Testing Status
- ✅ Basic gameplay tested
- ✅ Boss attacks functional
- ⚠️ Edge cases not fully tested

### Testing Checklist
- [ ] **Collision Edge Cases**
  - Player clipping through platforms
  - Bullet despawning issues
  - Hitbox accuracy

- [ ] **Performance Testing**
  - Test with 100+ particles
  - Test with multiple bosses (future)
  - Memory leak detection
  - Long play sessions (30+ minutes)

- [ ] **Browser Compatibility**
  - Chrome
  - Firefox
  - Safari
  - Edge
  - Mobile browsers

- [ ] **Balance Testing**
  - Boss difficulty curve
  - Weapon effectiveness
  - Health/damage values
  - Parry timing windows

---

## 📚 DOCUMENTATION

### Current Documentation
- ✅ README.md (comprehensive)
- ✅ Inline code comments
- ❌ API documentation
- ❌ Level creation guide

### Future Documentation
- [ ] **API Documentation**
  - JSDoc comments
  - Auto-generated docs
  - Class diagrams

- [ ] **Level Creation Guide**
  - How to create new bosses
  - Attack pattern design
  - Balancing guidelines

- [ ] **Contributing Guide**
  - Code style guide
  - Pull request template
  - Issue templates

---

## 🎯 MILESTONES

### ✅ Milestone 1: MVP (COMPLETED)
- First boss implemented
- Core gameplay loop
- Basic UI

### ✅ Milestone 2: Polish (COMPLETED)
- Sound effects
- Screen shake
- Boss intro
- Game over screen

### ✅ Milestone 3: Bug Fixes (COMPLETED v2.2)
**Completed**: 2025-11-22
**Tasks**:
- ✅ Fix weapon UI update bug
- ✅ Fix super moves counter
- ✅ Add weapon switch visual feedback
- ✅ Convert setTimeout to frame-based timing

**Definition of Done**:
- ✅ All Priority 1 bugs fixed
- ✅ Game tested for 30 minutes without crashes
- ✅ No console errors

### ✅ Milestone 4: Second Level (COMPLETED v3.0)
**Completed**: 2025-11-22
**Tasks**:
- ✅ Implement Dragon Boss (Grim Matchstick)
- ✅ Create platform system with collision detection
- ✅ Add cloud minions with tracking bullets
- ✅ Create level selection screen with difficulty modes
- ✅ Add boss intro sequences
- ✅ Implement meteor shower attack

**Definition of Done**:
- ✅ Dragon boss fully playable with 4 phases
- ✅ All 4 phases functional
- ✅ Platform jumping works with priority ordering
- ✅ Can switch between levels
- ✅ Progress persists via localStorage

### ✅ Milestone 4.1: Tutorial & Systems (COMPLETED v3.1)
**Completed**: 2025-11-22
**Tasks**:
- ✅ Tutorial/help overlay system (H key)
- ✅ Difficulty modes (Simple/Regular/Expert)
- ✅ Health pickup drops from enemies
- ✅ Stats tracking foundation

**Definition of Done**:
- ✅ Help overlay accessible anytime
- ✅ 3 difficulty modes with scaling
- ✅ Pickups spawn and restore health

### ✅ Milestone 4.2: Visual Polish (COMPLETED v3.2)
**Completed**: 2025-11-22
**Tasks**:
- ✅ Parallax backgrounds (6 layers)
- ✅ Freeze frames for hit-stop feedback
- ✅ Enhanced particle system (boss-specific, trails, charge effects)
- ✅ Super meter visual indicators
- ✅ Background music integration hooks

**Definition of Done**:
- ✅ Parallax scrolling on all levels
- ✅ Hit-stop feels impactful
- ✅ Particles enhance visual feedback
- ✅ Super moves have clear indicators

### ✅ Milestone 4.3: Scoring & Stats (COMPLETED v3.3)
**Completed**: 2025-11-22
**Tasks**:
- ✅ Combo system with multipliers (1.5x/2.0x/3.0x)
- ✅ Score tracking and display
- ✅ Max combo tracking
- ✅ Stats persistence across sessions
- ✅ Enhanced grading with score/combo

**Definition of Done**:
- ✅ Combo builds on consecutive hits
- ✅ Score multipliers work correctly
- ✅ Stats displayed on results screen
- ✅ Best runs saved per boss/difficulty

### ✅ Milestone 4.4: v1.0 Release Preparation (COMPLETED)
**Completed**: 2025-11-22
**Tasks**:
- ✅ Update README.md to v3.3 with full feature documentation
- ✅ Create favicon and meta tags for SEO
- ✅ Create deployment configuration (GitHub Pages, Netlify)
- ✅ Write DEPLOYMENT.md guide
- ✅ Code validation and quality checks
- ✅ All JavaScript files syntax-validated
- ✅ No critical issues found

**Definition of Done**:
- ✅ Documentation complete and accurate
- ✅ SEO/social sharing optimized
- ✅ Deployment configs ready
- ✅ Code validated and clean
- ✅ Ready for public deployment

### 📅 Milestone 5: Meta Progression (FUTURE)
**Target Date**: TBD
**Tasks**:
- Shop system
- Weapon unlocks
- Charm system
- Statistics tracking

### 📅 Milestone 6: Additional Content (FUTURE)
**Target Date**: TBD
**Tasks**:
- Levels 3-5
- Boss rush mode
- Achievements

### 📅 Milestone 7: Public Release (FUTURE)
**Target Date**: TBD
**Tasks**:
- Full art pass
- Background music
- Mobile support
- Deployment

---

## 📊 TIME ESTIMATES

### Bug Fixes (Milestone 3)
- Priority 1 Bugs: ~1.5 hours
- Priority 2 Polish: ~5 hours
- **Total**: ~6.5 hours

### Level 2 (Milestone 4)
- Planning & Design: ~2 hours (DONE)
- Core Implementation: ~6.5 hours
- Dragon Boss Attacks: ~6.5 hours
- Level System: ~4.5 hours
- Visual & Polish: ~5 hours
- **Total**: ~24.5 hours

### Meta Progression (Milestone 5)
- Shop System: ~4 hours
- Progression System: ~3 hours
- **Total**: ~7 hours

### Per Additional Level
- Boss Design: ~2 hours
- Implementation: ~6 hours
- Testing & Balance: ~2 hours
- **Total**: ~10 hours per level

---

## 💡 IMPLEMENTATION PRIORITIES

### ✅ v1.0 Release (READY FOR DEPLOYMENT)
**Status**: All critical milestones completed (v3.3)
**Current State**:
- 2 complete boss levels with 7 total phases
- 3 difficulty modes
- Full combat system (3 weapons, 3 super moves, parrying)
- Combo/scoring system
- Stats persistence
- Tutorial/help system
- Comprehensive documentation
- Deployment ready

### 🚀 Deployment Options
1. **GitHub Pages** - Free, simple, integrates with repo
2. **Netlify** - Advanced features, auto-deploy, free tier
3. **Vercel** - Alternative to Netlify, excellent performance

See `DEPLOYMENT.md` for detailed deployment guides.

### 📋 Post-v1.0 Priorities (Optional)
1. User testing and feedback collection
2. Balance adjustments based on player data
3. Additional polish based on feedback
4. Begin Milestone 5 (Meta Progression) if desired

### Future Sessions (Milestone 5+)
1. Meta progression system (coins, shop, unlocks)
2. Additional boss battles (Levels 3-5)
3. Boss rush mode
4. Achievement system
5. Full sprite artwork
6. Background music integration

---

## 📝 NOTES

- Keep commits atomic and well-documented
- Test each feature before moving to next
- Update README.md as features are added
- Consider performance with each addition
- Get user feedback early and often

---

**Last Updated**: 2025-11-22
**Game Version**: v3.3 (v1.0 Release Ready)
**Plan Version**: 3.0
**Status**: ✅ Ready for Public Deployment
**Next Review**: After v1.0 deployment and initial user feedback

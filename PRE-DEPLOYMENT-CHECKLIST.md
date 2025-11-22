# Pre-Deployment Checklist

Use this checklist to verify the game is ready for public deployment.

## 🔍 Code Quality

- [x] All JavaScript files pass syntax validation
- [x] No critical console errors
- [x] No TODO/FIXME comments in production code
- [x] ES6 module imports/exports are correct
- [x] All required files exist

**Status**: ✅ **PASSED** - All 12 JavaScript modules validated, 4,368 lines of code, no critical issues found.

---

## 📄 Documentation

- [x] README.md updated to current version (v3.3)
- [x] README.md documents all features accurately
- [x] README.md includes both boss levels
- [x] README.md has setup instructions
- [x] PLAN.md reflects current development status
- [x] DEPLOYMENT.md exists with deployment guides

**Status**: ✅ **PASSED** - All documentation complete and current.

---

## 🎨 Assets & SEO

- [x] Favicon created (favicon.svg)
- [x] Meta tags added to index.html
- [x] Open Graph tags for social sharing
- [x] Twitter Card metadata
- [x] Page title optimized for SEO
- [x] Meta description added

**Status**: ✅ **PASSED** - SEO and social sharing optimized.

---

## 🚀 Deployment Configuration

- [x] .nojekyll file created (for GitHub Pages)
- [x] netlify.toml configured
- [x] Security headers configured
- [x] Cache optimization settings
- [x] serve.py executable and working

**Status**: ✅ **PASSED** - Deployment configs ready for GitHub Pages and Netlify.

---

## 🎮 Game Features (Manual Testing Required)

The following should be tested manually before deployment:

### Level 1: Flower Boss
- [ ] Boss loads and renders correctly
- [ ] All 3 phases work (100-66%, 66-33%, 33-0%)
- [ ] Seed attacks spawn correctly
- [ ] Parryable pollen appears (pink particles)
- [ ] Venus flytrap minions spawn and can be destroyed
- [ ] Ground spikes damage player
- [ ] Petal shield rotates and shoots
- [ ] Mega chomp attack works
- [ ] Boss can be defeated

### Level 2: Dragon Boss
- [ ] Boss loads and renders correctly
- [ ] All 4 phases work (100-75%, 75-50%, 50-25%, 25-0%)
- [ ] Dragon flies and breathes fire
- [ ] Fireballs spawn with correct patterns
- [ ] Cloud minions spawn and shoot
- [ ] Platforms work for vertical movement
- [ ] Player can collide with platforms
- [ ] Meteor shower spawns from top
- [ ] Parryable fireballs appear (pink)
- [ ] Boss can be defeated

### Player Mechanics
- [ ] Movement works (WASD / Arrow Keys)
- [ ] Shooting works (J / Z)
- [ ] Jump works (K / X)
- [ ] Double jump works
- [ ] Dash works (L / C) with invincibility frames
- [ ] Dash has visual trail effect
- [ ] Parrying works on pink objects
- [ ] Super meter fills from damage and parries

### Weapons
- [ ] Peashooter fires straight shots
- [ ] Spread weapon fires in arc
- [ ] Charge weapon can be held and released
- [ ] Weapon switching works (Q / E)
- [ ] Weapon display updates in UI

### Super Moves
- [ ] Level I super (100 meter) - Dash with projectiles
- [ ] Level II super (200 meter) - Energy wave
- [ ] Level III super (300 meter) - Energy beam
- [ ] Super meter displays correctly
- [ ] Super counter shows available levels

### Difficulty Modes
- [ ] Simple mode: Player has more health, enemies deal less damage
- [ ] Regular mode: Balanced difficulty
- [ ] Expert mode: Player has less health, enemies deal more damage
- [ ] Difficulty can be changed from level select
- [ ] Difficulty persists between sessions

### Combo & Scoring System
- [ ] Combo counter increases when hitting enemies
- [ ] Combo breaks when missing or taking damage
- [ ] Score multipliers work (1.5x at 5, 2.0x at 10, 3.0x at 20)
- [ ] Score displays during combat
- [ ] Max combo is tracked
- [ ] Visual feedback on combo milestones (every 5)

### UI & Menus
- [ ] Start screen displays correctly
- [ ] Level selection screen works
- [ ] Level cards show grades
- [ ] Level 2 unlocks after beating Level 1
- [ ] Victory screen shows correct stats
- [ ] Grade calculation is accurate (S/A/B/C/D)
- [ ] Game over screen displays
- [ ] Help overlay appears (H key)
- [ ] Help overlay has all controls listed
- [ ] Pause works (ESC key)
- [ ] Pause dims the screen

### Visual Polish
- [ ] Parallax backgrounds scroll on all levels
- [ ] Freeze frames occur on boss hits
- [ ] Particles spawn on hits
- [ ] Boss-specific particle colors
- [ ] Weapon trails appear
- [ ] Charge weapon has glow effect
- [ ] Super move explosions are visible
- [ ] Screen shake on major impacts
- [ ] Health pickups drop from enemies
- [ ] Health pickups can be collected

### Stats & Persistence
- [ ] Stats are saved to localStorage
- [ ] Best runs display on level cards
- [ ] Stats persist after browser refresh
- [ ] Progress unlocks Level 2
- [ ] Difficulty stats tracked separately

### Sound
- [ ] Sound effects play on actions
- [ ] Parry sound plays
- [ ] Super move sounds play
- [ ] Boss hit sounds play
- [ ] No audio errors in console

---

## 🌐 Browser Compatibility

Test in multiple browsers:

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, if available)
- [ ] Mobile browser (optional, but recommended)

**Check for**:
- [ ] Game loads without errors
- [ ] Canvas renders correctly
- [ ] Controls respond
- [ ] No visual glitches
- [ ] Frame rate is smooth (target 60 FPS)

---

## 📊 Performance

- [ ] Game runs at 60 FPS on modern browsers
- [ ] No memory leaks (test with long play session)
- [ ] Particle system doesn't cause lag
- [ ] No stuttering during intense combat
- [ ] File sizes are reasonable (total ~150KB uncompressed)

**Current Stats**:
- Total JavaScript: 4,368 lines across 12 modules
- Total size: 141KB (js/), plus HTML/CSS
- Very lightweight and fast-loading ✅

---

## 🔧 Pre-Deployment Tasks

Before going live:

- [ ] Test locally using `python3 serve.py`
- [ ] Play through both levels at each difficulty
- [ ] Try to break the game (edge cases, rapid input, etc.)
- [ ] Check browser console for errors
- [ ] Verify all features work as documented
- [ ] Get someone else to playtest if possible
- [ ] Fix any critical bugs discovered

---

## 🚀 Deployment Steps

Once all checks pass:

### For GitHub Pages:
1. [ ] Push all code to main branch
2. [ ] Go to repo Settings → Pages
3. [ ] Select main branch, / (root) folder
4. [ ] Wait for deployment (2-5 minutes)
5. [ ] Visit `https://<username>.github.io/<repo-name>/`
6. [ ] Test deployed version
7. [ ] Update `og:url` meta tag in index.html with actual URL
8. [ ] Push updated meta tag

### For Netlify:
1. [ ] Connect repo to Netlify
2. [ ] Set build command: *(empty)*
3. [ ] Set publish directory: `.`
4. [ ] Deploy
5. [ ] Test deployed version
6. [ ] Update `og:url` meta tag in index.html with actual URL
7. [ ] Redeploy with updated meta tag

---

## ✅ Post-Deployment Verification

After deployment:

- [ ] Game loads on live URL
- [ ] No CORS errors
- [ ] All assets load correctly
- [ ] JavaScript modules load
- [ ] LocalStorage works
- [ ] Game plays identically to local version
- [ ] Share link on social media works (preview shows correctly)
- [ ] Mobile version is playable (if supporting mobile)

---

## 📋 Known Limitations (Not Blockers)

These are acceptable for v1.0:

- ✓ Geometric graphics (no sprites) - Intentional art style
- ✓ No background music - SFX only for v1.0
- ✓ No mobile touch controls - Keyboard only
- ✓ Only 2 boss levels - Sufficient for v1.0
- ✓ No meta progression - Can be added post-v1.0

---

## 🎯 Success Criteria for v1.0

The game is ready for v1.0 deployment when:

- ✅ All code quality checks pass
- ✅ All documentation is complete
- ✅ All deployment configs are ready
- ⏳ Manual testing confirms all features work
- ⏳ No critical bugs found during testing
- ⏳ Performance is acceptable (60 FPS target)
- ⏳ Deployed version verified

**Current Status**: 3/7 completed (automated checks), 4/7 require manual testing.

---

## 🐛 Bug Reporting

If bugs are found during testing:

1. Note the bug in a list
2. Assess severity (Critical/High/Medium/Low)
3. Fix critical and high bugs before deployment
4. Medium/low bugs can be addressed post-v1.0
5. Create GitHub issues for tracking (if using GitHub)

---

## 📝 Post-Launch Plan

After successful v1.0 deployment:

1. **Week 1**: Monitor for critical bugs, fix immediately
2. **Week 2-4**: Collect user feedback
3. **Month 2**: Consider balance adjustments
4. **Future**: Evaluate Milestone 5+ (meta progression, more levels)

---

**Checklist Version**: 1.0
**Last Updated**: 2025-11-22
**Game Version**: v3.3 (v1.0 Release Candidate)

---

## Quick Start Testing

To quickly test the game locally before deployment:

```bash
# Start local server
python3 serve.py

# Open browser to
http://localhost:8000

# Test checklist (5-10 minutes):
1. Play Level 1 on Simple difficulty
2. Try all weapons (Q/E to switch)
3. Test super moves (I/V)
4. Try parrying pink objects
5. Beat the boss, check victory screen
6. Play Level 2 on Regular difficulty
7. Test platforms, cloud minions, meteors
8. Beat dragon boss
9. Check stats persist (refresh browser)
10. Press H for help overlay
```

Good luck with deployment! 🎮🚀

# Cuphead-Inspired Boss Rush Game (v3.3)

A browser-based 2D boss battle game inspired by Cuphead's run-and-gun mechanics and 1930s rubber hose animation aesthetic. Features 2 complete boss battles with difficulty modes, combo system, and extensive polish.

## Features

### Player Mechanics
- **8-directional movement** (WASD / Arrow Keys)
- **Continuous shooting** with multiple weapon types
- **Double jump** with height control
- **Dash** with invincibility frames and trail effects
- **Parry system** - Jump on pink objects to gain super meter and bounce
- **Super meter** - Fill by dealing damage and parrying
- **3-Level Super Moves** - Use stored super meter for devastating attacks
- **Weapon Switching** - Cycle through all weapons during battle (Q/E)
- **Combo System** - Build combos by hitting enemies for score multipliers
- **Health Pickups** - Enemies drop hearts to restore health
- **Pause System** - Pause anytime during gameplay (ESC)
- **Tutorial/Help** - Press H anytime for control reference

### Weapons
- **Peashooter**: Default rapid-fire straight shots
- **Spread**: Wide arc, lower damage, great coverage
- **Charge**: Hold to charge, release for powerful blasts

### Super Moves
- **Level I (100 meter)**: Invincibility dash with energy projectiles
- **Level II (200 meter)**: Screen-clearing energy wave
- **Level III (300 meter)**: Massive energy beam attack

### Difficulty Modes
- **Simple**: 150% health, enemies deal 50% damage, slower patterns
- **Regular**: Standard balanced difficulty
- **Expert**: 75% health, enemies deal 150% damage, faster patterns

### Combo & Scoring System
- **Build Combos**: Hit enemies consecutively to increase combo counter
- **Score Multipliers**:
  - 5+ combo: 1.5x points
  - 10+ combo: 2.0x points
  - 20+ combo: 3.0x points
- **Combo Breaks**: Miss or take damage to reset combo
- **Grade Bonuses**: High scores improve final grade

## Boss Battles

### Level 1: "Cagney Carnation" (Flower Fiend)

A three-phase boss battle featuring:

#### Phase 1: Rooted Rage (100-66% HP)
- Seed spit attacks in arc patterns
- Parryable pollen clouds (pink particles)
- Venus flytrap minions that can be destroyed

#### Phase 2: Unrooted Fury (66-33% HP)
- Boss moves vertically on screen
- Homing seeds (parryable)
- **Ground spike waves with hitboxes** - Jump to avoid
- **Petal shield** - Rotating petals damage on contact, then shoot outward

#### Phase 3: Final Bloom (33-0% HP)
- Rapid seed barrage (every 3rd seed is parryable)
- **Mega chomp** - Screen-sweeping attack with visual warning
- Multiple minions spawned simultaneously
- Desperation mode below 10% HP with overlapping attacks

### Level 2: "Grim Matchstick" (Dragon Boss)

A four-phase platforming boss battle featuring:

#### Phase 1: Warming Up (100-75% HP)
- Dragon flies across screen breathing fire
- Fireball projectiles with varying patterns
- Cloud minions that shoot tracking bullets
- Platform-based arena requiring vertical movement

#### Phase 2: Heating Up (75-50% HP)
- Increased movement speed
- Faster fireball patterns
- More aggressive cloud minions
- Parryable fireballs (pink) appear in patterns

#### Phase 3: Dragon's Fury (50-25% HP)
- Multi-fireball bursts
- Swooping dive attacks
- Meteor shower from above (dodge between platforms)
- Dense bullet patterns requiring precise movement

#### Phase 4: Inferno (25-0% HP)
- Maximum speed and aggression
- Overlapping attack patterns
- Continuous meteor showers
- Desperation mode with screen-filling attacks

**Special Mechanics**:
- **Platforms**: Use vertical space to dodge attacks
- **Cloud Minions**: Destroy them or use as parry targets
- **Meteors**: Rain from top of screen, leave brief visual warnings

## Controls

| Action | Keys |
|--------|------|
| Move | WASD / Arrow Keys |
| Shoot | J / Z |
| Jump | K / X |
| Dash | L / C |
| Parry | Jump (K/X) on pink objects |
| Switch Weapon | Q / E |
| Super Move | I / V |
| Pause | ESC |
| Help | H |
| Start | Space |

## How to Play

### Option 1: Python Server (Recommended)

1. Make sure you have Python 3 installed
2. Run the server:
   ```bash
   python3 serve.py
   # or
   chmod +x serve.py && ./serve.py
   ```
3. Open your browser to `http://localhost:8000`

### Option 2: Node.js Server

If you have Node.js installed:
```bash
npx http-server -p 8000
```

### Option 3: VS Code Live Server

If using VS Code:
1. Install the "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

## Gameplay Tips

1. **Learn the Patterns**: Each boss attack has a telegraph - watch for visual cues
2. **Parry Often**: Pink objects can be parried for super meter and extra mobility
3. **Build Combos**: Keep hitting the boss without missing to multiply your score
4. **Use Dash Wisely**: The dash gives invincibility frames but has a cooldown
5. **Stay Mobile**: Constant movement is key to avoiding projectile patterns
6. **Target Minions**: Destroy minions for breathing room and health pickups
7. **Choose Your Difficulty**: Start with Simple mode to learn patterns
8. **Platform Movement**: On Level 2, use platforms to dodge vertical attacks
9. **Press H**: View the tutorial overlay anytime if you forget controls
10. **Super Moves**: Save Level III supers for desperate situations or phase transitions

## Grading System

After defeating the boss, you'll receive a grade based on:
- **Time**: How quickly you defeated the boss
- **HP Remaining**: How much health you had left
- **Parries**: Number of successful parries performed
- **Score**: Total points earned from combos and hits
- **Max Combo**: Highest combo chain achieved

### Grade Thresholds
- **S Rank**: 70+ points (Perfect run)
- **A Rank**: 60-69 points (Excellent)
- **B Rank**: 45-59 points (Good)
- **C Rank**: 30-44 points (Average)
- **D Rank**: Below 30 points (Needs practice)

### Stats Tracking
- View your best runs for each boss
- Track stats across difficulty modes
- Compare scores and improvement over time

## Technical Details

### Built With
- **HTML5 Canvas** for rendering
- **Vanilla JavaScript** (ES6 modules)
- **CSS3** for UI and effects

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with ES6 module support

### File Structure
```
game-jam/
├── index.html          # Main HTML file
├── styles.css          # Game styling and UI
├── js/
│   ├── main.js         # Game loop, state management, combos, parallax
│   ├── Input.js        # Keyboard input handling with help overlay
│   ├── Player.js       # Player character with super moves
│   ├── Boss.js         # Base boss class
│   ├── FlowerBoss.js   # Level 1: Flower Fiend boss
│   ├── DragonBoss.js   # Level 2: Dragon boss with platforms
│   ├── CloudMinion.js  # Dragon boss minion enemies
│   ├── Platform.js     # Platforming system for Level 2
│   ├── Bullet.js       # Projectile system (3 weapon types)
│   ├── Pickup.js       # Health pickup drops
│   ├── ParticleSystem.js # Visual effects and trails
│   └── SoundSystem.js  # Web Audio API sound effects
├── serve.py            # Development server
└── PLAN.md             # Development roadmap and milestones
```

## Development

### Extending the Game

The code is modular and easy to extend:

1. **Add New Weapons**: Edit `Player.js` and modify the weapon system
2. **Create New Bosses**: Extend the `Boss` class (see `FlowerBoss.js` as example)
3. **Add New Attacks**: Add methods to boss classes with custom bullet patterns
4. **Customize Visuals**: Modify draw methods or add sprite sheets

### Code Features
- Particle system for explosions, trails, and visual effects
- State machine for boss phases with smooth transitions
- Frame-based attack timing (no setTimeout issues)
- Comprehensive collision detection (bullets, hitboxes, platforms, contact damage)
- Animation framework with sprite scaling
- Input abstraction layer with help overlay
- **Screen shake** with freeze frames for impact feedback
- **Pause system** with visual dimming
- **Three weapon types** with switching (Q/E keys)
- **Three-level super move system** with visual indicators
- **Combo system** with score multipliers (1.5x/2.0x/3.0x)
- **Difficulty modes** with health/damage scaling
- **Level selection** with stats persistence
- **Health pickup system** with physics
- **Platform collision** with priority ordering
- **Parallax backgrounds** (6 layers)
- **Tutorial overlay** accessible anytime (H key)
- **Stats tracking** with localStorage persistence
- **Web Audio API** synthesized sound effects

## Version History

### v3.3 (Current) - Stats & Polish
- [x] **Stats tracking system** with localStorage persistence
- [x] **Combo system** with score multipliers (1.5x/2.0x/3.0x)
- [x] **Max combo tracking** displayed on results screen
- [x] **Enhanced grading** incorporating score and combos

### v3.2 - Visual Polish
- [x] **Parallax backgrounds** (6 scrolling layers)
- [x] **Freeze frames** for hit-stop impact feedback
- [x] **Enhanced particles** (boss-specific, weapon trails, charge effects)
- [x] **Super meter indicators** with visual glow effects
- [x] **Background music integration** hooks

### v3.1 - Tutorial & Difficulty
- [x] **Tutorial system** with help overlay (H key)
- [x] **Difficulty modes** (Simple/Regular/Expert)
- [x] **Health pickup system** with physics and lifetime
- [x] **Difficulty scaling** for health, damage, and patterns

### v3.0 - Dragon Boss Level
- [x] **Level 2: Dragon Boss** (Grim Matchstick)
- [x] **Platform system** with collision detection
- [x] **Cloud minions** with tracking bullets
- [x] **Meteor shower attack** with frame-based timing
- [x] **Level selection screen** with progress tracking
- [x] **Boss intro sequences**

### v2.2 - Critical Bug Fixes
- [x] **Fixed UI update bugs** (health bar, super meter)
- [x] **Fixed super counter display** during gameplay
- [x] **Fixed frame-based timing** issues throughout

### v2.0 - Core Features
- [x] **Weapon switching system** (Q/E keys)
- [x] **Super moves** (3 levels with different effects)
- [x] **Screen shake** on boss hits and mega attacks
- [x] **Pause functionality** (ESC key)
- [x] **Sound system foundation** - Web Audio API

## Future Enhancements

Post-v1.0 potential additions:
- [ ] Additional boss battles (Milestone 5-7)
- [ ] Meta progression system (coins, unlocks)
- [ ] Full BGM integration
- [ ] Sprite-based graphics
- [ ] Boss intro/outro cinematics
- [ ] Mobile touch controls
- [ ] Online leaderboard system

## Performance

Target: 60 FPS on modern browsers

The game uses:
- RequestAnimationFrame for smooth animation
- Efficient particle pooling
- Optimized collision detection
- Canvas rendering optimizations

## Credits

Inspired by **Cuphead** by Studio MDHR

This is a fan project created for educational purposes and game jam practice.

## License

This project is open source and available for educational purposes.

---

**Enjoy the boss rush!** 🎮🌻

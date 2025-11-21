# Cuphead-Inspired Boss Rush Game

A browser-based 2D boss battle game inspired by Cuphead's run-and-gun mechanics and 1930s rubber hose animation aesthetic.

## Features

### Player Mechanics
- **8-directional movement** (WASD / Arrow Keys)
- **Continuous shooting** with multiple weapon types
- **Double jump** with height control
- **Dash** with invincibility frames
- **Parry system** - Jump on pink objects to gain super meter and bounce
- **Super meter** - Fill by dealing damage and parrying
- **3-Level Super Moves** - Use stored super meter for devastating attacks
- **Weapon Switching** - Cycle through all weapons during battle
- **Pause System** - Pause anytime during gameplay

### Weapons
- **Peashooter**: Default rapid-fire straight shots
- **Spread**: Wide arc, lower damage, great coverage
- **Charge**: Hold to charge, release for powerful blasts

### Super Moves
- **Level I (100 meter)**: Invincibility dash with energy projectiles
- **Level II (200 meter)**: Screen-clearing energy wave
- **Level III (300 meter)**: Massive energy beam attack

### First Boss: "Cagney Carnation" (Flower Fiend)

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
3. **Use Dash Wisely**: The dash gives invincibility frames but has a cooldown
4. **Stay Mobile**: Constant movement is key to avoiding projectile patterns
5. **Target Minions**: Venus flytraps can be destroyed for breathing room

## Grading System

After defeating the boss, you'll receive a grade based on:
- **Time**: How quickly you defeated the boss
- **HP Remaining**: How much health you had left
- **Parries**: Number of successful parries performed

### Grade Thresholds
- **S Rank**: 70+ points (Perfect run)
- **A Rank**: 60-69 points (Excellent)
- **B Rank**: 45-59 points (Good)
- **C Rank**: 30-44 points (Average)
- **D Rank**: Below 30 points (Needs practice)

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
│   ├── main.js         # Game loop, state management, screen shake
│   ├── Input.js        # Keyboard input handling
│   ├── Player.js       # Player character with super moves
│   ├── Boss.js         # Base boss class
│   ├── FlowerBoss.js   # Flower Fiend with all attacks
│   ├── Bullet.js       # Projectile system (3 types)
│   ├── ParticleSystem.js # Visual effects
│   └── SoundSystem.js  # Web Audio API sound effects
└── serve.py            # Development server
```

## Development

### Extending the Game

The code is modular and easy to extend:

1. **Add New Weapons**: Edit `Player.js` and modify the weapon system
2. **Create New Bosses**: Extend the `Boss` class (see `FlowerBoss.js` as example)
3. **Add New Attacks**: Add methods to boss classes with custom bullet patterns
4. **Customize Visuals**: Modify draw methods or add sprite sheets

### Code Features
- Particle system for explosions and effects
- State machine for boss phases with transitions
- Frame-based attack timing (no setTimeout issues)
- Comprehensive collision detection (bullets, hitboxes, contact damage)
- Animation framework with sprite scaling
- Input abstraction layer
- **Screen shake** on impacts
- **Pause system**
- **Three weapon types** with switching
- **Three-level super move system**
- **Web Audio API** synthesized sound effects

## Recent Improvements (v2.0)

### ✅ Implemented
- [x] **Weapon switching system** (Q/E keys)
- [x] **Super moves** (3 levels with different effects)
- [x] **Screen shake** on boss hits and mega attacks
- [x] **Pause functionality** (ESC key)
- [x] **Fixed boss attack timing** (frame-based instead of setTimeout)
- [x] **Root spike hitboxes** - Actually damage the player now
- [x] **Mega chomp attack** - Full screen-sweeping implementation
- [x] **Petal shield contact damage** - Rotating petals hurt on touch
- [x] **Sound system foundation** - Web Audio API synthesized effects

## Future Enhancements

Potential additions:
- [ ] Multiple boss battles
- [ ] Shop and upgrade system
- [ ] Full sound integration (BGM + all SFX)
- [ ] Sprite-based graphics
- [ ] Boss intro/outro cinematics
- [ ] Mobile touch controls
- [ ] Leaderboard system
- [ ] Additional difficulty modes

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

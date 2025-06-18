# 🎀 Hell-of Kitty  

> *An FPS as cute as it is hellish. Brace yourself for pink-bow chaos.*  

🧠 Final Project for **Computer Graphics – 2024**  
🎮 Developed by **Ismael S., Ákyla, Gutemberg, and Anderson**  

---  

## 🍭 About the Game  

**Hell-of Kitty** is a 3D FPS where you fight for your life against hordes of **possessed Hello Kitties** on a psychedelic **candy island**.  

Your arsenal: a **Kawaii M4A1**.  
Your challenge: survive escalating rounds of chaos.  
Your destiny: face the final boss—**Salazar**, a floating professor with a pink bow who shoots **pink fireballs** from his hands.  

---  

## 🧠 Core Mechanics  

- 🌊 **Endlessly harder rounds** (capped at Round 5—for your GPU’s mercy).  
- 💣 **Enemies:**  
  - `Basic Hello Kitty`: Runs and slaps.  
  - `Bomb Kitty`: Carries a **C4 strapped to its back** (tick-tock, mate).  
- 💥 **Headshots?** Obviously.  
- 🔥 **Epic boss fight** against the course professor.  
- 🎵 **Music, HUD, physics, particles, cutscenes?** All included.  

---  

## 🌈 Setting  

- 🍬 **Map**: *Candy Island*—a Fall Guys-esque world full of sugar, colors, and bad intentions.  
- 😺 **Art style**: Kawaii pink, but with DOOM’s soul.  
- 🎯 **Inspirations**:  
  `DOOM` + `COD Zombies` + `Hello Kitty` + sleep-deprived devs.  

## 🔥 Gameplay  

<div align="center">  
  <img src="https://github.com/maelsilvatt/hell-of-kitty-cg/blob/main/images/gameplay.gif?raw=true" alt="Hell-of Kitty Demo" width="600"/>  
</div>  

---  

## 🔧 Tech Stack  

| 💻 Stack        | 💬 Purpose                                      |  
|----------------|------------------------------------------------|  
| `Three.js`     | 3D FPS engine                                  |  
| `Cannon.js`    | Physics (collisions, explosions, ragdolls)     |  
| `TWEEN.js`     | Cutscenes & camera transitions                 |  
| `Blender` / `Wings3D` | Character models (and Salazar’s fabulous bow) |  
| `Figma`        | HUD & menu design                              |  
| `Stats.js`     | FPS monitor (because this melts weak GPUs)     |  

---  

## 👥 Dev Team  

| Name         | Role                          |  
|--------------|-------------------------------|  
| 🎯 Ismael    | Physics & collision systems   |  
| 🔁 Ákyla     | Round system & enemy waves    |  
| 🎨 Gutemberg | Environment & art direction   |  
| 🧾 Anderson  | HUD & documentation           |  

---  

## 🗂️ Project Structure  

```  
📁 models/           → 3D models (GLB/GLTF)  
📁 sound_effects/    → SFX & soundtrack  
📁 src/              → Modular JS code  
│   ├── kitties.js         # Enemy AI  
│   ├── salazar.js         # Floating demon professor  
│   ├── weapons.js         # Guns & shooting mechanics  
│   ├── controls.js        # Player input  
│   └── ...etc  
📄 index.html        → Main page  
🎨 menu-style.css    → Cute main menu styling  
```  

---  

## 🔥 Boss: Salazar  

- Spawns in **Round 4**.  
- Wields **magic gloves** that shoot **pink fire**.  
- Floats around, laughing at your suffering.  
- Literally based on the course professor.  

---  

## 🚧 Technical Challenges  

- 🔄 Particles + physics + enemies = **chaos**.  
- 🧠 Cutscenes without freezing gameplay.  
- 🐱 Basic AI for the kitties.  
- ⚙️ Performance with multiple animated GLB models.  

---  

## 🎥 Gameplay Demo  

> *“DOOM meets Hello Kitty on acid.”*  
> —A traumatized player, 2024  

---  

## 🚀 How to Run Locally  

1. Clone the repo:  
```bash  
git clone https://github.com/your-username/hell-of-kitty.git  
cd hell-of-kitty  
```  

2. Start a local server:  
```bash  
npm install -g serve  
serve .  
```  

3. Open in browser:  
```  
http://localhost:3000  
```  

---  

## 📜 Legal Disclaimer  

This project is purely **educational and satirical**.  
Any use of *Hello Kitty*™ is non-commercial.  
Salazar (the professor) was notified and found it hilarious (probably).  

---  

> *Thank you, Professor Salazar.  
> Without you, there’d be no boss fight.* 🎀🔥  

---  

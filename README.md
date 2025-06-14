# 🎀 Hell-of Kitty

> *Um FPS tão fofo quanto infernal. Prepare-se pra encarar o caos de lacinho rosa.*

🧠 Projeto Final de **Computação Gráfica – 2024**  
🎮 Desenvolvido por **Ismael S., Ákyla, Gutemberg e Anderson**

---

## 🍭 Sobre o jogo

**Hell-of Kitty** é um FPS 3D onde você luta por sua vida contra hordas de **Hello Kitties possuídas** numa **ilha doce** psicodélica.

Seu arsenal: uma M4A1 Kawaii.  
Seu desafio: sobreviver a rounds crescentes de caos.  
Seu destino: enfrentar o chefão final — **Salazar**, um professor flutuante de lacinho rosa que taca **fogo rosa** com as mãos.

---

## 🧠 Mecânicas principais

- 🌊 **Rounds infinitamente mais difíceis** (até o 5º — por misericórdia da GPU)
- 💣 **Inimigas:**
  - `Hello Kitty padrão`: corre e bate.
  - `Bomb Kitty`: vem com **C4 nas costas** (sem tempo, irmão).
- 💥 **Tiro na cabeça**? Claro.
- 🔥 **Boss fight** com o professor da disciplina.
- 🎵 **Música, HUD, física, partículas, cutscene**? Tudo incluso.

---

## 🌈 Ambientação

- 🍬 **Cenário**: "Candy Island" — um mapa estilo Fall Guys com muita cor, açúcar e más intenções.
- 😺 **Estilo visual**: kawaii cor-de-rosa, mas com alma de DOOM.
- 🎯 **Inspirações**:  
  `DOOM` + `COD Zombies` + `Hello Kitty` + devs sem limites

---

## 🔧 Tecnologias

| 💻 Stack        | 💬 Pra quê serve?                                     |
|----------------|-------------------------------------------------------|
| `Three.js`     | Motor gráfico 3D FPS                                  |
| `Cannon.js`    | Física realista, colisões, impulsos e explosões       |
| `TWEEN.js`     | Cutscenes, transições de câmera                       |
| `Blender` / `Wings3D` | Modelagem dos personagens e... do Salazar 💅       |
| `Figma`        | Design da HUD e menu                                  |
| `Stats.js`     | Monitor de FPS (porque isso aqui explode GPUs fracas) |

---

## 👥 Time de desenvolvimento

| Nome       | Função                        |
|------------|-------------------------------|
| 🎯 Ismael  | Física & sistemas de colisão  |
| 🔁 Ákyla   | Sistema de rounds             |
| 🎨 Gutemberg | Pesquisa de cenários & visuais |
| 🧾 Anderson | HUD & documentação            |

---

## 🗂️ Estrutura do projeto

```

📁 models/           → Modelos 3D (GLB / GLTF)
📁 sound\_effects/    → Efeitos sonoros e trilha
📁 src/              → Código JS modularizado
│   ├── kitties.js         # Lógica dos inimigos
│   ├── salazar.js         # Chefão voador do capeta
│   ├── weapons.js         # Armas e sistema de tiro
│   ├── controls.js        # Input do jogador
│   └── ...etc
📄 index.html        → Estrutura da página
🎨 menu-style.css    → Menu principal com estilo fofo

````

---

## 🔥 Boss: Salazar

- Surge no **4º round**
- Tem **luvas mágicas** que lançam **fogo rosa**
- Flutua pelo mapa, rindo da sua cara
- Baseado (literalmente) no professor da disciplina

---

## 🚧 Desafios técnicos

- 🔄 Lidar com partículas + física + inimigos simultâneos = caos
- 🧠 Cutscenes sem travar o gameplay
- 🐱 Inteligência artificial básica pros kitties
- ⚙️ Performance com múltiplos modelos GLB animados

---

## 🎥 Gameplay demo

> “DOOM meets Hello Kitty on acid.”  
> – Um jogador traumatizado, 2024

---

## 🚀 Como rodar localmente

1. Clone o projeto:
```bash
git clone https://github.com/seu-usuario/hell-of-kitty.git
cd hell-of-kitty
````

2. Inicie um servidor local:

```bash
npm install -g serve
serve .
```

3. Acesse no navegador:

```
http://localhost:3000
```

---

## 📜 Aviso legal

Este projeto é puramente **educacional e paródico**.
Qualquer uso de marcas como *Hello Kitty* é feito sem fins comerciais.
O Iális (Salazar) foi avisado e achou engraçado (provavelmente).

---

> *Obrigado, professor Iális.
> Sem você, não haveria boss fight.* 🎀🔥

---

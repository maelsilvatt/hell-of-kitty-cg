// gameProgress.js

import { addKitties } from './kitties.js';
import { playBackgroundMusic, playSansDialogueSound } from './audio.js';
import { blackoutScreen, showNextDialogue } from './utils.js';
import { setupAmbientInfernal } from './level_design.js';

let isFinalBossIntroOn = false;

// Função para iniciar um round
export function startRound(kitties, scenes, world, camera, round) {
  if (!isFinalBossIntroOn){
        // Se chegou ao round 4, inicia a batalha final
        if (round == 2){
          isFinalBossIntroOn = true;
          playfinalBossCutscene(scenes);
          setTimeout(() => {
              isFinalBossIntroOn = false;              
            }, 24000);
          
          return kitties;
        }

        // Reinicia os inimigos para o novo round
        kitties = [];
    
        // Define a quantidade de inimigos com base no round (exemplo: round * 4)
        const numKitties = round * 4;
        for (let i = 0; i < numKitties; i++) {
          addKitties(kitties, scenes[0], world, camera);
    
          // Inicializa o cubo de debug se necessário
          // kitties[i].initKittyDebugCube(scene);
        }
    
        return kitties;
  }

  return kitties;
}

// Função que exibe a cutscene da boss fight
function playfinalBossCutscene(scenes){
  // Toca o som do diálogo
  playSansDialogueSound(24);

  // Inicia a música da boss fight
  playBackgroundMusic('sound_effects/Undertale - Megalovania.mp3', 0.7);

  // Deixa a tela preta
  blackoutScreen();

  // Lista de diálogos
  const dialogues = [
    'images/Final boss dialogues/Dialogue 1.mp4',
    'images/Final boss dialogues/Dialogue 2.mp4',
    'images/Final boss dialogues/Dialogue 3.mp4',
    'images/Final boss dialogues/Dialogue 4.mp4',
    'images/Final boss dialogues/Dialogue 5.mp4'
  ];

  // Exibe os diálogos um por vez
  showNextDialogue(dialogues, 0);

  // // Muda o tom do céu para vermelho
  setupAmbientInfernal(scenes[0]);
  setupAmbientInfernal(scenes[1], true);
}

export { isFinalBossIntroOn }
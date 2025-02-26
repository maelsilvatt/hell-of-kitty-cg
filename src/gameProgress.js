// gameProgress.js

import { addKitties } from './kitties.js';
import { animate } from './main.js';
import { addBombKitties } from './bombKitties.js';
import { playSansDialogueSound } from './audio.js';
import { blackoutScreen, showNextDialogue } from './utils.js';
import { setupAmbientInfernal } from './level_design.js';

let isFinalBossIntroOn = false;
let isFinalBossRound = false;
const finalBossRound = 3;

// Função para iniciar um round
export function startRound(kitties, scenes, world, camera, round) {
  if (!isFinalBossIntroOn){
        // Se chegou ao round 4, inicia a batalha final
        if (round == finalBossRound){
          isFinalBossIntroOn = true;
          playfinalBossCutscene(scenes, world, camera);
          setTimeout(() => {
              isFinalBossIntroOn = false;        
              animate();      
            }, 24000);
          
          return kitties;
        }

        // Reinicia os inimigos para o novo round
        kitties = [];
    
        // Define a quantidade de inimigos com base no round (exemplo: round * 4)
        const numKitties = round * 4;
        for (let i = 0; i < numKitties; i++) {
          if (Math.random() < 0.3) {
              // 30% de chance de ser um bombKitty
              addBombKitties(kitties, scenes[0], world, camera);
          } else {
              // Caso contrário, é um kitty normal
              addKitties(kitties, scenes[0], world, camera);
          }
        }
      
        return kitties;
  }

  return kitties;
}

// Função que exibe a cutscene da boss fight
function playfinalBossCutscene(scenes){
  const scene = scenes[0];
  const weaponScene = scenes[1];


  // Toca o som do diálogo
  playSansDialogueSound(24);

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
  setupAmbientInfernal(scene);
  setupAmbientInfernal(weaponScene, true);

  // Cria o Salazar no mundo
  isFinalBossRound = true;
}

// Tela de créditos do jogo
export function showCredits() {
  // Força o pause do jogo
  isFinalBossIntroOn = true;
  
  // Criar fundo preto
  const creditsScreen = document.createElement('div');
  creditsScreen.style.position = 'fixed';
  creditsScreen.style.top = '0';
  creditsScreen.style.left = '0';
  creditsScreen.style.width = '100vw';
  creditsScreen.style.height = '100vh';
  creditsScreen.style.backgroundColor = 'black';
  creditsScreen.style.display = 'flex';
  creditsScreen.style.flexDirection = 'column';
  creditsScreen.style.justifyContent = 'center';
  creditsScreen.style.alignItems = 'center';
  creditsScreen.style.color = 'white';
  creditsScreen.style.fontFamily = '"Press Start 2P", Arial, sans-serif';
  creditsScreen.style.textAlign = 'center';
  creditsScreen.style.zIndex = '9999';

  // Criar título "CRÉDITOS"
  const titleElement = document.createElement('div');
  titleElement.innerText = 'CRÉDITOS';
  titleElement.style.fontSize = '30px';
  titleElement.style.fontWeight = 'bold';
  titleElement.style.marginBottom = '20px';

  // Criar container para os créditos alinhados à esquerda
  const creditsContainer = document.createElement('div');
  creditsContainer.style.textAlign = 'left'; // Alinhar à esquerda
  creditsContainer.style.fontSize = '20px';
  creditsContainer.style.whiteSpace = 'pre-line'; // Mantém quebras de linha
  creditsContainer.style.maxWidth = '80vw'; // Evita que fique muito espalhado
  creditsContainer.style.lineHeight = '1.5';

  // Criar texto dos créditos
  creditsContainer.innerText = `
Ismael Soares – Física e Sistemas de Colisão
Ákyla de Aquino – Sistema de Rounds
Gutemberg Brito – Pesquisa de Cenário e Elementos
Anderson Ivanildo – Documentação e HUD
  `;

  // Adicionar elementos à tela
  creditsScreen.appendChild(titleElement);
  creditsScreen.appendChild(creditsContainer);
  document.body.appendChild(creditsScreen);
}

export function showGameOverScreen() {
  // Força o pause do jogo
  isFinalBossIntroOn = true;
  
  // Criar fundo preto
  const gameOverScreen = document.createElement('div');
  gameOverScreen.style.position = 'fixed';
  gameOverScreen.style.top = '0';
  gameOverScreen.style.left = '0';
  gameOverScreen.style.width = '100vw';
  gameOverScreen.style.height = '100vh';
  gameOverScreen.style.backgroundColor = 'black';
  gameOverScreen.style.display = 'flex';
  gameOverScreen.style.flexDirection = 'column';
  gameOverScreen.style.justifyContent = 'center';
  gameOverScreen.style.alignItems = 'center';
  gameOverScreen.style.color = 'red';
  gameOverScreen.style.fontFamily = '"Press Start 2P", Arial, sans-serif';
  gameOverScreen.style.fontSize = '40px';
  gameOverScreen.style.textAlign = 'center';
  gameOverScreen.style.zIndex = '9999';

  // Criar texto "VOCÊ MORREU"
  const gameOverText = document.createElement('div');
  gameOverText.innerText = 'VOCÊ MORREU';
  gameOverText.style.fontSize = '50px';
  gameOverText.style.fontWeight = 'bold';
  gameOverText.style.marginBottom = '20px';

  // Criar botão de reiniciar
  const restartButton = document.createElement('button');
  restartButton.innerText = 'Tentar novamente';
  restartButton.style.fontSize = '20px';
  restartButton.style.padding = '10px 20px';
  restartButton.style.marginTop = '20px';
  restartButton.style.border = 'none';
  restartButton.style.cursor = 'pointer';
  restartButton.style.fontFamily = '"Press Start 2P", Arial, sans-serif';
  restartButton.style.backgroundColor = 'white';
  restartButton.style.color = 'black';
  
  restartButton.addEventListener('click', () => {
    location.reload(); // Reinicia a página para recomeçar o jogo
  });

  // Adicionar elementos à tela
  gameOverScreen.appendChild(gameOverText);
  gameOverScreen.appendChild(restartButton);
  document.body.appendChild(gameOverScreen);
}

export { isFinalBossIntroOn, isFinalBossRound }
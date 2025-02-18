// gameProgress.js

import { addKitties } from './enemies.js';
import { playBackgroundMusic, playSansDialogueSound } from './audio.js';

// Função para iniciar um round
export function startRound(kitties, scene, world, camera, round) {
  // Reinicia os inimigos para o novo round
  kitties = [];

  // Define a quantidade de inimigos com base no round (exemplo: round * 4)
  const numKitties = round * 4;
  for (let i = 0; i < numKitties; i++) {
    addKitties(kitties, scene, world, camera);

    // Inicializa o cubo de debug se necessário
    // kitties[i].initKittyDebugCube(scene);
  }

  return kitties;
}

// Função que exibe a cutscene da boss fight
export function finalBoss(){
  // Toca o som do diálogo
  playSansDialogueSound(25);

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
}

// Função que exibe o próximo vídeo na lista
function showNextDialogue(dialogues, index){
  if (index >= dialogues.length) {
    // Quando todos os vídeos forem exibidos, remove a tela preta
    removeBlackout();
    return;
  }

  // Exibe o vídeo do diálogo atual
  showDialogue(dialogues[index], () => {
    // Quando o vídeo terminar, chama a próxima iteração
    showNextDialogue(dialogues, index + 1);
  });
}

// Função que exibe o vídeo do diálogo
function showDialogue(dialoguePath, callback){
  const videoContainer = document.createElement("div");
  videoContainer.style.position = "fixed";
  videoContainer.style.bottom = "20px"; // Ajuste a distância da parte inferior da tela
  videoContainer.style.left = "50%"; // Centraliza horizontalmente
  videoContainer.style.transform = "translateX(-50%)"; // Compensa o deslocamento para centralizar corretamente
  videoContainer.style.zIndex = "10000"; // Põe o vídeo acima da tela preta

  // Cria a tag de vídeo para o gif convertido
  const video = document.createElement("video");
  video.src = dialoguePath; // Caminho do diálogo
  video.style.width = "auto"; 
  video.style.height = "auto";
  video.loop = false; // Faz o vídeo não repetir
  video.autoplay = true; // Começa automaticamente
  video.muted = true; // Muta o áudio, caso você não precise

  // Adiciona o vídeo à div
  videoContainer.appendChild(video);

  // Adiciona o vídeo à tela
  document.body.appendChild(videoContainer);

  // Após a duração do vídeo, chama o callback para continuar com o próximo vídeo
  video.onended = () => {
    videoContainer.style.display = "none"; // Esconde o vídeo quando terminar
    if (callback) callback(); // Chama a função de callback para continuar
  };
}

// Função para remover a tela preta
function removeBlackout() {
  const blackout = document.getElementById("blackout");
  if (blackout) {
    blackout.style.display = "none"; // Esconde a tela preta
  }
}

// Função que deixa a tela preta
function blackoutScreen(){
    // Cria um elemento de tela preta
    const blackout = document.createElement("div");
    blackout.style.position = "fixed";
    blackout.style.top = "0";
    blackout.style.left = "0";
    blackout.style.width = "100vw";
    blackout.style.height = "100vh";
    blackout.style.backgroundColor = "black";
    blackout.style.zIndex = "9999";
    blackout.id = "blackout"; // Atribui um id para referenciar mais tarde
  
    // Adiciona a tela preta ao corpo do documento
    document.body.appendChild(blackout);
}


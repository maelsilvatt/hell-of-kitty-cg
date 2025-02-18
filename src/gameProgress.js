// gameProgress.js

import { addKitties } from './enemies.js';

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

// Função para verificar se o round acabou e iniciar o próximo
export function checkRound(kitties, scene, world, camera, round, roundInProgress) {
  if (roundInProgress && kitties.every(kitty => kitty.life < 1)) {
    roundInProgress = false;
    round++;

    // Aguarda 3 segundos e inicia o próximo round
    setTimeout(() => {
      kitties = startRound(kitties, scene, world, camera, round);
      roundInProgress = true;
    }, 5000);
  }

  return [round, roundInProgress, kitties];
}
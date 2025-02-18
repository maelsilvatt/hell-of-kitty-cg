import * as THREE from 'three';
import Stats from 'stats.js';
import { setupControls, handleGamepadInput, handleKeyboardInput } from './controls.js';
import { createWorld } from './level_design.js';
import { updateKitties } from './kitties.js';
import { playBackgroundMusic } from './audio.js';
import { Player } from './player_stats.js'
import { createWeapon, shoot } from './weapons.js';
import { isFinalBossIntroOn, startRound } from './gameProgress.js';

// Configuraçãso da cena
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
setupControls(camera);
camera.position.set(0, 5, 20);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Monitor de desempenho (FPS)
const stats = new Stats();
document.body.appendChild(stats.dom);

// Criação do mundo físico
const world = createWorld(scene);

// Criação do jogador
const player = new Player(scene, world, camera);

// Carrega a arma na cena
const weaponScene = new THREE.Scene(); // Cena exclusiva para a arma
createWeapon(weaponScene);

// Variável para garantir que a música toque apenas uma vez (configuração de debug)
let musicPlayed = true; 

// Dispara ao clicar na tela e toca a música de fundo (uma vez)
window.addEventListener('click', () => {
  // Bloqueira os tiros se estiver em cutscene
  if ( !isFinalBossIntroOn ){
    shoot(kitties, world, scene, camera);
  }

  if (!musicPlayed) {
    playBackgroundMusic();
    musicPlayed = true;
  }
});

// Inicia o jogo
let round = 1;
let roundInProgress = true;
let kitties = [];
kitties = startRound(kitties, scene, world, camera, round);

// Loop de animação
function animate() {
  requestAnimationFrame(animate);
  world.step(1 / 60);
  stats.update();

  // Movimentação com WASD
  handleKeyboardInput(camera);

  // Verifica se o controle está conectado e processa a entrada
  handleGamepadInput(kitties, world, scene, camera);

  // Sincronizar jogador com a caixa de colisáo
  player.updateBody(camera);

  // Atualiza todas as Kitties
  updateKitties(kitties, scene, camera);

  // Softlock no round 5
  if (round > 5){
    round = 5;
  }

  // Verifica se o round atual foi concluído
  if (roundInProgress && kitties.every(kitty => kitty.life < 1)) {
    roundInProgress = false;
    round++;

    // Aguarda 3 segundos e inicia o próximo round
    setTimeout(() => {
      kitties = startRound(kitties, scene, world, camera, round);
      roundInProgress = true;
    }, 2000);
  }

  // Renderiza a cena principal
  renderer.render(scene, camera);

  // Sincroniza a cena da arma com a câmera e renderiza sobre a cena principal
  weaponScene.position.copy(camera.position);
  weaponScene.quaternion.copy(camera.quaternion);
  renderer.autoClear = false;
  renderer.clearDepth();
  renderer.render(weaponScene, camera);
}

animate();

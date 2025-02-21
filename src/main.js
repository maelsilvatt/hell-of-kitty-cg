import * as THREE from 'three';
import Stats from 'stats.js';
import { setupControls, handleGamepadInput, handleKeyboardInput } from './controls.js';
import { createWorld } from './level_design.js';
import { updateKitties } from './kitties.js';
import { playBackgroundMusic } from './audio.js';
import { Player } from './player_stats.js'
import { createWeapon, shoot } from './weapons.js';
import { isFinalBossRound, isFinalBossIntroOn, startRound } from './gameProgress.js';
import { spawnSalazar, updateSalazar } from './salazar.js';

// Capturando os elementos do INDEX.HTML para manipular o comportamento do Menu
const sideBar = document.getElementById('sidebar');
const playButton = document.getElementById('playButton');

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
// Criar uma câmera ortográfica para a interface (HUD)
const aspect = window.innerWidth / window.innerHeight;
const uiCamera = new THREE.OrthographicCamera(
    -aspect, aspect, 1, -1, 0.1, 10
);
const uiScene = new THREE.Scene();
const player = new Player(scene, uiScene, uiCamera, world);

// Carrega a arma na cena
const weaponScene = new THREE.Scene(); // Cena exclusiva para a arma
createWeapon(weaponScene);

// Cria um array com as cenas
const scenes = [scene, weaponScene];

// Variável para garantir que a música toque apenas uma vez (configuração de debug)
let musicPlayed = true; 

// Dispara ao clicar na tela e toca a música de fundo (uma vez)
let salazar;

window.addEventListener('click', () => {
  // Bloqueira os tiros se estiver em cutscene
  if ( !isFinalBossIntroOn ){
    shoot(kitties, world, scene, camera, salazar);
  }

  if (!musicPlayed) {
    playBackgroundMusic();
    musicPlayed = true;
  }
});

// Inicia o jogo
let round = 1;
let roundInProgress = false;
let kitties = [];

// Criação do evento para iniciar o jogo quando o player clicar em jogar
playButton.addEventListener('click', () => {
  sideBar.classList.add('slide-out'); // Esconde a sidebar
  round = 1;
  roundInProgress = true;
  kitties = startRound(kitties, scenes, world, camera, round);
});

// Loop de animação
function animate() {
  requestAnimationFrame(animate);
  world.step(1 / 60);
  stats.update();

  // Movimentação com WASD
  handleKeyboardInput(camera);

  // Verifica se o controle está conectado e processa a entrada
  handleGamepadInput(kitties, world, scene, camera, salazar);

  // Sincronizar jogador com a caixa de colisáo
  player.updateBody(camera);

  // Atualiza todas as Kitties
  updateKitties(kitties, scene, camera);

  // Atualiza o Salazar
  updateSalazar(salazar, scene, camera);

  // Verifica se o round atual foi concluído
  if (roundInProgress && kitties.every(kitty => kitty.life < 1)) {
    roundInProgress = false;
    round++;

    // Aguarda alguns segundos e inicia o próximo round
    setTimeout(() => {
      kitties = startRound(kitties, scenes, world, camera, round);
      roundInProgress = true;
    }, 2000);

    // Verifica se está no round de batalha final
    if (isFinalBossRound){
      salazar = spawnSalazar(scene, world, camera);
      isFinalBossRound = false;
    }

    // Softlock no round 5 para não sobrecarregar o sistema
    if (round > 1){
      round = 1;
    }
  }

  // Renderiza todas as cenas
  render();
}

animate();

// Renderiza as cenas do jogo
function render() {
  renderer.autoClear = false;
  
  // Renderiza a cena principal do jogo
  renderer.render(scene, camera);

  // Renderiza a arma sincronizada com a câmera principal
  weaponScene.position.copy(camera.position);
  weaponScene.quaternion.copy(camera.quaternion);
  renderer.clearDepth(); 
  renderer.render(weaponScene, camera);

  // Renderiza a HUD
  renderer.clearDepth();  
  renderer.render(uiScene, uiCamera);
}
import * as THREE from 'three';
import Stats from 'stats.js';
import TWEEN from '@tweenjs/tween.js';
import { camera, setupControls, handleGamepadInput, handleKeyboardInput } from './controls.js';
import { scene, createWorld } from './level_design.js';
import { updateKitties } from './kitties.js';
import { playBackgroundMusic } from './audio.js';
import { Player, uiCamera, uiScene } from './player_stats.js'
import { weaponScene, createWeapon, shoot } from './weapons.js';
import { isFinalBossRound, isFinalBossIntroOn, startRound } from './gameProgress.js';
import { spawnSalazar, updateSalazar } from './salazar.js';

// Capturando os elementos do INDEX.HTML para manipular o comportamento do Menu
const sideBar = document.getElementById('sidebar');
const playButton = document.getElementById('playButton');
import { loadAllModels } from './loadModels.js';

// Inicialização
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Monitor de desempenho (FPS)
let monitoringFPS = false;
let stats;

if (monitoringFPS){
  stats = new Stats();
  document.body.appendChild(stats.dom);
}

// Criação do mundo físico
const world = createWorld(scene);

// Cria um array com as cenas
const scenes = [scene, weaponScene];

// Dispara ao clicar na tela
let salazar;
let player;
let inGameMenu = true;

window.addEventListener('click', () => {
  // Bloqueira os tiros se estiver em cutscene
  if ( !isFinalBossIntroOn && !inGameMenu){
    shoot(player, kitties, world, scene, camera, salazar);
  }
});

// Carrega assets do jogo
let round = 1;
let roundInProgress = false;
let kitties = [];

// Criação do evento para iniciar o jogo quando o player clicar em jogar
playButton.addEventListener('click', () => {
  sideBar.classList.add('slide-out'); // Esconde a sidebar

  round = 1;
  roundInProgress = true;
  
  loadGame();
});

// Função do loop de animação
export function animate(time) {
  // Se a intro do boss estiver ativa, o jogo pausa
  if (isFinalBossIntroOn) return;

  requestAnimationFrame(animate);
  world.step(1 / 60);
  TWEEN.update(time); // Atualiza as animações Tween

  // Atualiza o monitor de desempenho
  if (monitoringFPS){
    stats.update();
  }

  // Movimentação com WASD
  handleKeyboardInput(camera);

  // Verifica se o controle está conectado e processa a entrada
  handleGamepadInput(kitties, world, scene, camera, salazar);

  // Sincronizar jogador com a caixa de colisáo
  player.updateBody();

  // Atualiza todas as Kitties
  updateKitties(player, kitties, scene, camera);

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
    if (isFinalBossRound && !salazar){
      salazar = spawnSalazar(scene, world, camera);      
    }

    // Softlock no round 4 para não sobrecarregar o sistema
    if (round > 5){
      round = 5;
    }
  }

  // Renderiza todas as cenas
  render();
}

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

// Carrega os recursos do jogo
async function loadGame() {
  try {
    // Aguarda o carregamento de todos os modelos
    await loadAllModels();    

    // Agora que os modelos estão carregados, cria a arma
    createWeapon(weaponScene);

    // Inicializa os controles    
    inGameMenu = false;
    setupControls(camera);

    // Só inicia o jogo agora, após garantir que os modelos estão carregados
    startGame();

  } catch (error) {
    console.error('❌ Erro ao carregar os modelos:', error);
  }
}

// Inicia o primeiro round
function startGame() { 
  // Instancia o jogador
  player = new Player(scene, uiScene, uiCamera, world);

  // Inicia o primeiro round
  kitties = startRound(kitties, scenes, world, camera, round);  

  // Toca a música de fundo
  playBackgroundMusic();

  animate();
}

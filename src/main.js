import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Stats from 'stats.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { keys, moveSpeed, setupControls } from './controls.js';
import { createWorld, setupLighting } from './level_design.js';
import { HelloKitty } from './enemies.js';
import { playBackgroundMusic, stopBackgroundMusic, playGunshotSound, playKittyVoiceLine } from './audio.js';
import { Player } from './player_stats.js'

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

// Array para armazenar as Hello Kitties
let kitties = [];

// Função para adicionar uma Hello Kitty
function addHelloKitty(scene, world, camera, size = 8, life = 5, speed = 15) {
  const newKitty = new HelloKitty(scene, world, camera, size, life, speed);
  kitties.push(newKitty);
}

// --- Sistema de Rounds ---
let round = 1;
let roundInProgress = false;

// Função para iniciar um round
function startRound() {
  roundInProgress = true;
  // Reinicia os inimigos para o novo round
  kitties = [];

  // Define a quantidade de inimigos com base no round (exemplo: round * 9)
  const numKitties = round * 4;
  for (let i = 0; i < numKitties; i++) {
    addHelloKitty(scene, world, camera);

    // Inicializa o cubo de debug se necessário
    kitties[i].initKittyDebugCube(scene);
  }
}

// Inicia o primeiro round
startRound();
// -------------------------

// Variável para garantir que a música toque apenas uma vez (configuração de debug)
let musicPlayed = true; 

// Toca a música ao clicar na tela (apenas uma vez)
document.addEventListener('click', () => {
  if (!musicPlayed) {
    playBackgroundMusic();
    musicPlayed = true;
  }
});

// Desativa a música quando a tecla 'm' é pressionada
document.addEventListener('keydown', (event) => {
  if (event.key === 'm') {
    stopBackgroundMusic();
  }
});

// Carrega o modelo da arma
let gunMesh;
const weaponScene = new THREE.Scene(); // Cena exclusiva para a arma
setupLighting(weaponScene);

const weapon_loader = new GLTFLoader();
weapon_loader.load('models/kawaii gun/scene.gltf', (gltf) => {
    gunMesh = gltf.scene;
    let gun_size =  10;
    gunMesh.scale.set(gun_size, gun_size, gun_size); // Ajuste do tamanho da arma
    
    // Rotação para inclinar levemente para a esquerda
    gunMesh.rotation.set(0, (2/3.3) * Math.PI, 0);  

    // Posicionamento da arma no canto direito e um pouco abaixo
    gunMesh.position.set(2.3, -2.3, -5.5); 
    
    weaponScene.add(gunMesh); // Adiciona a arma na cena separada
});

// Função responsável pelos disparos
function shoot() {
  playGunshotSound();

  // Cria o projétil
  const projectileGeometry = new THREE.SphereGeometry(0.35, 16, 16);
  const projectileMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFF1493,
    emissive: 0xFF1493,
    emissiveIntensity: 10,
    metalness: 0.2,
    roughness: 0.5 
  });
  const projectileMesh = new THREE.Mesh(projectileGeometry, projectileMaterial);
  projectileMesh.rotation.x = Math.PI / 2;
  scene.add(projectileMesh);

  // Cria o corpo físico do projétil
  const projectileBody = new CANNON.Body({
    mass: 5,
    shape: new CANNON.Box(new CANNON.Vec3(0.2, 0.2, 0.5)),
  });

  // Pega a posição do cano da arma
  const muzzlePosition = new THREE.Vector3(0.65, 0.01, -0.0045);
  gunMesh.localToWorld(muzzlePosition);
  projectileBody.position.set(muzzlePosition.x, muzzlePosition.y, muzzlePosition.z);
  world.addBody(projectileBody);

  // Obtém a direção para disparo
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  direction.x -= 0.3;
  
  const fire_vel = 100;
  const velocity = new CANNON.Vec3(direction.x * fire_vel, direction.y * fire_vel, direction.z * fire_vel);
  projectileBody.velocity.copy(velocity);

  // Atualiza a posição do projétil e remove-o quando sair da área
  function updateProjectile() {
    projectileMesh.position.copy(projectileBody.position);
    if (projectileBody.position.z < -100) {
      removeProjectile();
    } else {
      requestAnimationFrame(updateProjectile);
    }
  }
  updateProjectile();

  // Define o tempo de vida do projétil
  setTimeout(() => {
    removeProjectile();
  }, 3000);

  // Função para remover o projétil
  function removeProjectile() {
    if (world.bodies.includes(projectileBody)) {
      world.removeBody(projectileBody);
    }
    scene.remove(projectileMesh);
  }

  // Detecta colisões entre o projétil e as Hello Kitties
  projectileBody.addEventListener("collide", (event) => {
    const collidedWith = event.body;
    for (const kitty of kitties) {
      if (collidedWith === kitty.body) {
        kitty.decreaseLife(1);
        removeProjectile();
        break;
      }
    }
  });
}

// Dispara ao clicar na tela
window.addEventListener('click', () => {
  shoot();
});

// Função para controlar o gamepad (exemplo com PS4)
let yaw = 0;
function handleGamepadInput() {
  const gamepad = navigator.getGamepads()[0];
  if (gamepad) {
    // Movimento com o analógico esquerdo
    const leftStickX = gamepad.axes[0];
    const leftStickY = gamepad.axes[1];
    const direction = new THREE.Vector3();
    direction.z = leftStickY;
    direction.x = leftStickX;
    camera.position.addScaledVector(direction, moveSpeed);

    // Controle da câmera com o analógico direito
    const rightStickX = gamepad.axes[2];
    const rightStickY = gamepad.axes[3];
    yaw += rightStickX * 0.1;
    camera.rotation.set(rightStickY * 0.1, yaw, 0);

    // Disparo com o botão R2 (índice 7)
    if (gamepad.buttons[7].pressed) {
      shoot();
    }
  }
}

// Loop de animação
function animate() {
  requestAnimationFrame(animate);
  world.step(1 / 60);
  stats.update();

  // Movimentação com WASD
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  direction.y = 0;
  direction.normalize();
  if (keys.w) camera.position.addScaledVector(direction, moveSpeed);
  if (keys.s) camera.position.addScaledVector(direction, -moveSpeed);

  const right = new THREE.Vector3();
  right.crossVectors(camera.up, direction).normalize();
  if (keys.a) camera.position.addScaledVector(right, moveSpeed);
  if (keys.d) camera.position.addScaledVector(right, -moveSpeed);

    // Verifica se o controle está conectado e processa a entrada
    handleGamepadInput();

    // Sincronizar jogador com a caixa de colisáo
    // player.updateBody(camera);

    // Atualizar todas as Hello Kitties
    for (const kitty of kitties) {
        // Atualiza o movimento da kitty
        if (!kitty.isDead){
            kitty.updateMovement(camera);

            // Toca um som aleatoriamente
            if (Math.random() < 0.0005) {
              playKittyVoiceLine();
          }
        }

        // DEBUG

        // Atualiza o cubo de debug
        kitty.updateDebugCube();
        // player.updateDebugCube();

    // Remove o cubo de debug se a kitty estiver morta
    if (kitty.isDead || kitty.life < 1) {
      if (kitty.debugCube) {
        scene.remove(kitty.debugCube);
        kitty.debugCube = null;
      }
    }
  }

  // Verifica se o round atual foi concluído
  if (roundInProgress && kitties.every(kitty => kitty.life < 1)) {
    roundInProgress = false;
    console.log(`Round ${round} completo!`);
    // Aguarda 3 segundos e inicia o próximo round
    setTimeout(() => {
      round++;
      startRound();
    }, 3000);
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

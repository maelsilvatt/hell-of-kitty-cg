import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Stats from 'stats.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { keys, moveSpeed, setupControls } from './controls.js';
import {createWorld, setupLighting} from './level_design.js';
import { HelloKitty } from './enemies.js';
import { playBackgroundMusic, stopBackgroundMusic, playGunshotSound} from './audio.js';

// Configuração da cena
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

// Criação do mundo
const world = createWorld(scene);

// Array para armazenar as Hello Kitties
let kitties = [];

function addHelloKitty(scene, world, camera, size = 1.5, life = 5, speed = 10) {
    // Criar uma nova instância de Hello Kitty
    const newKitty = new HelloKitty(scene, world, camera, size, life, speed);

    // Adicionar a nova Hello Kitty ao array
    kitties.push(newKitty);
}

const numKitties = 5;
for (let i = 0; i < numKitties; i++) {
    addHelloKitty(scene, world, camera);

    // DEBUG
    kitties[i].initKittyDebugCube(scene);
}

// Variável para garantir que a música só toque uma vez
let musicPlayed = true; // desativei por debug

// Espera o usuário clicar na tela para tocar a música, mas apenas uma vez
document.addEventListener('click', () => {
    if (!musicPlayed) {
        playBackgroundMusic(); // Toca a música pela primeira vez
        musicPlayed = true;     // Marca que a música já foi tocada
    }
});

// Desativa a música quando a tecla 'm' é pressionada
document.addEventListener('keydown', (event) => {
    if (event.key === 'm') {  // Verifica se a tecla pressionada foi 'm'
        stopBackgroundMusic();
    }
});

// Carregar o modelo da arma
let gunMesh;
const weaponScene = new THREE.Scene(); // Cena exclusiva para a arma
setupLighting(weaponScene);

const weapon_loader = new GLTFLoader();
weapon_loader.load('models/kawaii gun/scene.gltf', (gltf) => {
    gunMesh = gltf.scene;
    let gun_size =  10;
    gunMesh.scale.set(gun_size, gun_size, gun_size); // Ajuste do tamanho da arma
    
    // Rotação para inclinar levemente para a esquerda
    gunMesh.rotation.set(0, 2/3.3 * Math.PI, 0);  

    // Posicionamento da arma no canto direito e um pouco abaixo
    gunMesh.position.set(2.3, -2.3, -5.5); 
    
    weaponScene.add(gunMesh); // Adiciona a arma na cena separada
    
    console.log('Arma carregada com sucesso!');
}, (error) => {
    console.error('Erro ao carregar o modelo da arma:', error);
});

// Função responsável pelos disparos e verificações de colisões entre os projéteis e as kitties
function shoot() {
    // Toca o som de tiro
    playGunshotSound();

    // Geometria e material do projétil com efeito de traçador rosa e brilho
    const projectileGeometry = new THREE.SphereGeometry(0.35, 16, 16); // Esfera pequena
    const projectileMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFF1493, // Rosa
        emissive: 0xFF1493, // Emissão rosa
        emissiveIntensity: 1, // Intensidade do brilho
        metalness: 0.2, 
        roughness: 0.5 
    });
    const projectileMesh = new THREE.Mesh(projectileGeometry, projectileMaterial);
    projectileMesh.rotation.x = Math.PI / 2; // Rotação inicial para que o projétil fique no eixo certo
    scene.add(projectileMesh);

    // Corpo do projétil no mundo de física (CANNON.js)
    const projectileBody = new CANNON.Body({
        mass: 5,
        shape: new CANNON.Box(new CANNON.Vec3(0.2, 0.2, 0.5)),
    });

    const muzzlePosition = new THREE.Vector3(.65, 0.01, -.0045);
    gunMesh.localToWorld(muzzlePosition); // Converter para coordenadas globais

    projectileBody.position.set(muzzlePosition.x, muzzlePosition.y, muzzlePosition.z); // Posicionando o projétil
    world.addBody(projectileBody);

    // Obter a direção correta da arma
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    // Inverter o eixo (caso o modelo use o eixo X ou outro para frente)
    direction.x -= 0.3;
    
    // Aplicar velocidade na direção que a arma está apontando
    const fire_vel = 100;

    const velocity = new CANNON.Vec3(direction.x * fire_vel, direction.y * fire_vel, direction.z * fire_vel);
    projectileBody.velocity.copy(velocity);

    // Atualiza o projétil e verifica se houve colisão com alguma kitty
    function updateProjectile() {
        projectileMesh.position.copy(projectileBody.position);
    
        // Verifica colisão com cada Kitty
        for (const kitty of kitties) {
            if (checkCollision(projectileBody, kitty.body)) { 
                // kitty.decreaseLife(1); // diminui a quantidade de vida da kitty
                console.warn("Colisão funcionou!.");
                break;
            }
        }
    
        // Remove projétil caso saia da área
        if (projectileBody.position.z < -50) {
            removeProjectile();
        } else {
            requestAnimationFrame(updateProjectile);
        }
    }
    updateProjectile();

    // Define um tempo de vida para o projétil
    setTimeout(() => {
        removeProjectile();
    }, 3000); // 3 segundos

    // Função para remover o projétil
    function removeProjectile() {
        world.removeBody(projectileBody);
        scene.remove(projectileMesh);
    }
}

// Disparo ao clicar
window.addEventListener('click', () => {
    shoot();
});

// Função para verificar colisões entre dois objetos
function checkCollision(body1, body2) {
    return body1.aabb.overlaps(body2.aabb);
}

// Função para controlar o controle de PS4
let yaw = 0;
function handleGamepadInput() {
    const gamepad = navigator.getGamepads()[0]; // Pega o primeiro controle conectado

    if (gamepad) {
        // Analógico esquerdo para movimentação
        const leftStickX = gamepad.axes[0]; // Eixo X do analógico esquerdo
        const leftStickY = gamepad.axes[1]; // Eixo Y do analógico esquerdo

        // Movimentação
        const direction = new THREE.Vector3();
        direction.z = leftStickY; // Frente/trás
        direction.x = leftStickX; // Esquerda/direita
        camera.position.addScaledVector(direction, moveSpeed);

        // Analógico direito para controlar a câmera
        const rightStickX = gamepad.axes[2]; // Eixo X do analógico direito
        const rightStickY = gamepad.axes[3]; // Eixo Y do analógico direito

        yaw += rightStickX * 0.1; // Rotação horizontal da câmera
        camera.rotation.set(rightStickY * 0.1, yaw, 0); // Rotação vertical da câmera

        // R2 para disparar
        if (gamepad.buttons[7].pressed) { // R2 está no índice 7
            shoot();
        }
    }
}

// Loop de animação
function animate() {
    requestAnimationFrame(animate);
    world.step(1 / 60);

    stats.update();  // Atualiza o contador de FPS

    // Movimentação WASD
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0; // Mantém o movimento no plano horizontal
    direction.normalize();

    if (keys.w) camera.position.addScaledVector(direction, moveSpeed);
    if (keys.s) camera.position.addScaledVector(direction, -moveSpeed);

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, direction).normalize();
    if (keys.a) camera.position.addScaledVector(right, moveSpeed);
    if (keys.d) camera.position.addScaledVector(right, -moveSpeed);

    // Verifica se o controle está conectado e processa a entrada
    handleGamepadInput();

    // Atualizar todas as Hello Kitties
    for (const kitty of kitties) {
        // Atualiza o movimento da kitty
        kitty.updateMovement(camera);

        // DEBUG

        // Atualiza o cubo de debug
        kitty.updateDebugCube();

        // Se a kitty estiver morta, limpa o cubo de debug1
        if (kitty.isDead || kitty.life < 1){
            if (kitty.debugCube) {
                scene.remove(kitty.debugCube);  // Remove o cubo de debug da cena
                kitty.debugCube = null;  // Limpa a referência
            }
        }
    }
    
    renderer.render(scene, camera);

    // Sincronizar cena da arma com a câmera
    weaponScene.position.copy(camera.position);
    weaponScene.quaternion.copy(camera.quaternion);

    // Renderiza a cena da arma por cima
    renderer.autoClear = false;
    renderer.clearDepth(); // Limpa o buffer de profundidade para evitar clipping
    renderer.render(weaponScene, camera);
}

animate();

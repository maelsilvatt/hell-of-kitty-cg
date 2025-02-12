import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Stats from 'stats.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { keys, moveSpeed, setupControls } from './controls.js';
import {createWorld} from './level_design.js';
import { createHelloKitty, helloKitty, helloKittyBody, updateHelloKittyMovement, decreaseLife} from './enemies.js';
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

// Adiciona Hello Kitty ao mundo
createHelloKitty(scene, world, camera);

// // Variável para garantir que a música só toque uma vez
// let musicPlayed = false;

// // Espera o usuário clicar na tela para tocar a música, mas apenas uma vez
// document.addEventListener('click', () => {
//     if (!musicPlayed) {
//         playBackgroundMusic(); // Toca a música pela primeira vez
//         musicPlayed = true;     // Marca que a música já foi tocada
//     }
// });

// // Desativa a música quando a tecla 'm' é pressionada
// document.addEventListener('keydown', (event) => {
//     if (event.key === 'm') {  // Verifica se a tecla pressionada foi 'm'
//         stopBackgroundMusic();
//     }
// });

// Carregar o modelo da arma
let gunMesh;
let projectileBody;

const weapon_loader = new GLTFLoader();
weapon_loader.load('models/kawaii gun/scene.gltf', (gltf) => {
    gunMesh = gltf.scene;
    let gun_size =  10;
    gunMesh.scale.set(gun_size, gun_size, gun_size); // Ajuste do tamanho da arma
    
    // Rotação para inclinar levemente para a esquerda
    gunMesh.rotation.set(0, 2/3.3 * Math.PI, 0);  

    // Posicionamento da arma no canto direito e um pouco abaixo
    gunMesh.position.set(2.3, -2.3, -5.5); 
    
    camera.add(gunMesh); // Adiciona a arma à câmera
    scene.add(camera);
    
    console.log('Arma carregada com sucesso!');
}, (error) => {
    console.error('Erro ao carregar o modelo da arma:', error);
});

// Disparo ao clicar
window.addEventListener('click', () => {
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
        shape: new CANNON.Sphere(0.2),
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
    let fire_vel = 100;

    const velocity = new CANNON.Vec3(direction.x * fire_vel, direction.y * fire_vel, direction.z * fire_vel);
    projectileBody.velocity.copy(velocity);

    // Atualizando a posição do projétil
    function updateProjectile() {
        projectileMesh.position.copy(projectileBody.position);
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

    function removeProjectile() {
        world.removeBody(projectileBody);
        scene.remove(projectileMesh);
    }
});

// Adicionando um listener para colisões
world.addEventListener('postStep', checkCollisions);

// Função para verificar se o projétil atingiu a Hello Kitty
function checkCollisions() {
    if (!helloKittyBody || !projectileBody) return;

    // Verificar se o projétil colidiu com a hitbox da Hello Kitty
    if (projectileBody && helloKittyBody && projectileBody.position.distanceTo(helloKittyBody.position) < (projectileBody.shapes[0].radius + helloKittyBody.shapes[0].halfExtents.x)) {
        decreaseLife(1);
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

    
    // Sincroniza a posição e rotação do modelo 3D com o corpo físico
    if (helloKitty) {
        // Sincroniza a posição e rotação do modelo 3D com o corpo físico
        helloKitty.position.copy(helloKittyBody.position);
        helloKitty.quaternion.copy(helloKittyBody.quaternion);
    }

    // Atualizando o movimento do inimigo
    updateHelloKittyMovement();
    
    renderer.render(scene, camera);
}

animate();

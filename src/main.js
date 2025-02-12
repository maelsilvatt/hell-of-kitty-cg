import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Stats from 'stats.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { keys, moveSpeed, setupControls } from './controls.js';
import {createWorld} from './level_design.js';

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

// Adicionando a Hello Kitty à cena
let helloKitty;
let helloKittyBody; // Mantendo referência global ao corpo físico

const loader = new GLTFLoader();
loader.load('models/hello kitty/scene.gltf', function (gltf) {
    helloKitty = gltf.scene;
    let hello_kitty_size = 20;

    // Ajuste do tamanho (3 metros de altura)
    helloKitty.scale.set(hello_kitty_size, hello_kitty_size, hello_kitty_size);

    // Ajustando a posição inicial
    helloKitty.position.set(0, 1.5, -5); // Centralizando na base

    // Ajuste de rotação para garantir que ela olhe para frente
    helloKitty.rotation.set(0, Math.PI, 0); // Rotacionando 180 graus ao redor do eixo Y

    // Adiciona à cena
    scene.add(helloKitty);
}, undefined, function (error) {
    console.error('Erro ao carregar modelo:', error);
});

// Criando a física da Hello Kitty (corpo físico)
const helloKittyShape = new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 1.5)); // Ajuste para o tamanho real
helloKittyBody = new CANNON.Body({
    mass: 5, // Massa ajustada para o tamanho maior
    position: new CANNON.Vec3(0, 1.5, -5), // Inicializa posição correta
});
helloKittyBody.addShape(helloKittyShape);
helloKittyBody.linearDamping = 0.2; // Resistência ao movimento
helloKittyBody.angularDamping = 0.3; // Evita giros excessivos

world.addBody(helloKittyBody);

// Carregar o modelo da arma
let gunMesh;

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

    // Detecta colisão do projétil com o alvo
    projectileBody.addEventListener('collide', (event) => {
        if (event.body === helloKitty) {
            helloKitty.velocity.set(0, helloKitty.velocity.y, 0); // Para movimento para frente
            helloKitty.angularVelocity.set(Math.random(), Math.random(), Math.random()); // Dá um giro aleatório
        }
    });
});

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
    
    renderer.render(scene, camera);
}

animate();

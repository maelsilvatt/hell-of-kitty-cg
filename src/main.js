import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Stats from 'stats.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Monitor de desempenho (FPS)]
const stats = new Stats();
document.body.appendChild(stats.dom);

// Configuração da cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xff69b4); // Rosa vibrante

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 5, 20);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Iluminação
const ambientLight = new THREE.AmbientLight(0xffaacc, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(5, 20, 5);
scene.add(directionalLight);

// Mundo da física
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

const material = new CANNON.Material();

// Criando as paredes e o chão
const wallColor = 0xff1493; // Rosa mais vibrante
const floorColor = 0xff6eb4; // Rosa ainda mais forte
const wallMaterial = new THREE.MeshStandardMaterial({ color: wallColor });
const floorMaterial = new THREE.MeshStandardMaterial({ color: floorColor });

const wallSize = { width: 50, height: 10, depth: 0.2 };
const floorSize = { width: 50, height: 50 };

// Chão
const floorBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material });
floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(floorBody);
const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(floorSize.width, floorSize.height), floorMaterial);
floorMesh.rotation.x = -Math.PI / 2;
scene.add(floorMesh);

// Criar função para paredes
function createWall(x, y, z, rotationY = 0) {
    const wallBody = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(wallSize.width / 2, wallSize.height / 2, wallSize.depth / 2)), material });
    wallBody.position.set(x, y, z);
    world.addBody(wallBody);

    const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(wallSize.width, wallSize.height, wallSize.depth), wallMaterial);
    wallMesh.position.set(x, y, z);
    wallMesh.rotation.y = rotationY;
    scene.add(wallMesh);
}

// Criando as paredes
createWall(0, 5, -25); // Parede de trás
createWall(0, 5, 25); // Parede da frente
createWall(-25, 5, 0, Math.PI / 2); // Parede esquerda
createWall(25, 5, 0, Math.PI / 2); // Parede direita

// Adicionando a Hello Kitty à cena
let helloKitty;
let helloKittyBody; // Mantendo referência global ao corpo físico

const loader = new GLTFLoader();
loader.load('models/hello kitty/scene.gltf', function (gltf) {
    helloKitty = gltf.scene;

    // Ajuste do tamanho (3 metros de altura)
    helloKitty.scale.set(3, 3, 3);

    // Ajustando a posição inicial
    helloKitty.position.set(0, 1.5, -5); // Centralizando na base
    helloKitty.rotation.y = Math.PI;

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

// Variáveis de controle de movimento e câmera
const keys = { w: false, a: false, s: false, d: false };
let moveSpeed = 0.1;
let mouseSensitivity = 0.002;
let yaw = 0;

// Detecta teclas pressionadas
window.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.key)) keys[event.key] = true;
});

window.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.key)) keys[event.key] = false;
});

// Controle da câmera pelo mouse
document.body.requestPointerLock =
    document.body.requestPointerLock || document.body.mozRequestPointerLock;

document.addEventListener('click', () => {
    document.body.requestPointerLock();
});

document.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement === document.body) {
        yaw -= event.movementX * mouseSensitivity;
        camera.rotation.set(0, yaw, 0);
    }
});

// Disparo
window.addEventListener('click', () => {
    // Geometria e material do projétil
    const projectileGeometry = new THREE.SphereGeometry(0.05, 0.05, 1, 16);
    const projectileMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff, emissive: 0x0000ff });
    const projectileMesh = new THREE.Mesh(projectileGeometry, projectileMaterial);
    projectileMesh.rotation.x = Math.PI / 2; // Rotação inicial para que o projétil fique no eixo certo
    scene.add(projectileMesh);

    // Corpo do projétil no mundo de física (CANNON.js)
    const projectileBody = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Cylinder(0.05, 0.05, 0.05, 10),
    });
    projectileBody.position.set(camera.position.x, camera.position.y - 0.5, camera.position.z);
    world.addBody(projectileBody);

    // Direção para onde a câmera está olhando (normalizada)
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    // Definindo a velocidade do projétil na direção da câmera
    const velocity = new CANNON.Vec3(direction.x * 50, direction.y * 50, direction.z * 50);
    projectileBody.velocity.copy(velocity);

    // Ajustando a rotação do projétil para que ele aponte na direção do movimento
    const targetPosition = new THREE.Vector3(
        projectileBody.position.x + direction.x,
        projectileBody.position.y + direction.y,
        projectileBody.position.z + direction.z
    );
    projectileMesh.lookAt(direction); // Faz com que o projétil aponte para onde está indo

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
        if (event.body === targetBody) {
            targetBody.velocity.set(0, targetBody.velocity.y, 0); // Para movimento para frente
            targetBody.angularVelocity.set(Math.random(), Math.random(), Math.random()); // Dá um giro aleatório
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

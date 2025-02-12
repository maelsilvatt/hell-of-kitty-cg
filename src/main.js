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

let room_size = 60;
const wallSize = { width: room_size*2, height: 10, depth: 0.2};
const floorSize = { width: room_size*2, height: room_size*2};

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
createWall(0, 5, -room_size); // Parede de trás
createWall(0, 5, room_size); // Parede da frente
createWall(-room_size, 5, 0, Math.PI / 2); // Parede esquerda
createWall(room_size, 5, 0, Math.PI / 2); // Parede direita

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

// Variáveis de controle de movimento e câmera
const keys = { w: false, a: false, s: false, d: false };
let moveSpeed = 0.25;
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

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Configuração da cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 5);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Mundo da física
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// Chão
const groundMaterial = new CANNON.Material();
const groundBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: groundMaterial });
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);
const groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ color: 0x333333 }));
groundMesh.rotation.x = -Math.PI / 2;
scene.add(groundMesh);

let helloKitty; // Declarando a variável no escopo global
let targetBody; // Corpo físico no CANNON.js

const loader = new GLTFLoader();
loader.load('models/hello kitty/scene.gltf', function (gltf) {
    helloKitty = gltf.scene; // Agora está no escopo global

    // Ajuste o tamanho, posição e rotação conforme necessário
    helloKitty.scale.set(3, 3, 3);
    helloKitty.position.set(0, 0, -5);
    helloKitty.rotation.y = Math.PI;

    // Adiciona à cena
    scene.add(helloKitty);
}, undefined, function (error) {
    console.error('Erro ao carregar modelo:', error);
});


const helloKittyShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)); // Ajuste conforme o tamanho do modelo
const helloKittyBody = new CANNON.Body({ mass: 5 });
helloKittyBody.addShape(helloKittyShape);
helloKittyBody.position.set(0, 0, -4);
helloKittyBody.velocity.set(0, 0, 1);
helloKittyBody.linearDamping = 0.1;
helloKittyBody.angularDamping = 0.2;
world.addBody(helloKittyBody);


// Luz
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

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
        helloKitty.position.copy(helloKittyBody.position);
        helloKitty.quaternion.copy(helloKittyBody.quaternion);
    }
    
    renderer.render(scene, camera);
}

animate();

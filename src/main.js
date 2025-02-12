import * as THREE from 'three';
import * as CANNON from 'cannon-es';

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

// Alvo
const targetMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
const targetGeometry = new THREE.BoxGeometry(1, 1, 0.2);
const targetMesh = new THREE.Mesh(targetGeometry, targetMaterial);
targetMesh.position.set(0, 1, -5);
scene.add(targetMesh);

const targetBody = new CANNON.Body({ mass: 1, shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.1)) });
targetBody.position.set(0, 1, -5);
world.addBody(targetBody);

// Luz
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// Função de tiro
window.addEventListener('click', () => {
    const projectileGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const projectileMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const projectileMesh = new THREE.Mesh(projectileGeometry, projectileMaterial);
    scene.add(projectileMesh);
    
    const projectileBody = new CANNON.Body({ mass: 1, shape: new CANNON.Sphere(0.1) });
    projectileBody.position.copy(camera.position);
    world.addBody(projectileBody);

    const force = new CANNON.Vec3(0, 0, -20);
    projectileBody.applyImpulse(force, projectileBody.position);
    
    function updateProjectile() {
        projectileMesh.position.copy(projectileBody.position);
        if (projectileBody.position.y < -5) {
            world.removeBody(projectileBody);
            scene.remove(projectileMesh);
        } else {
            requestAnimationFrame(updateProjectile);
        }
    }
    updateProjectile();
});

// Loop de animação
function animate() {
    requestAnimationFrame(animate);
    world.step(1 / 60);
    targetMesh.position.copy(targetBody.position);
    targetMesh.quaternion.copy(targetBody.quaternion);
    renderer.render(scene, camera);
}
animate();

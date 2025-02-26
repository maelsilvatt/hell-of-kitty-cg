// weapons.js

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { setupLighting } from './level_design.js';
import { playGunshotSound } from './audio.js';
import { models } from './loadModels.js';

export let gunMesh = null;
const GUN_ROTATION = new THREE.Euler(0, (2 / 3.3) * Math.PI, 0);

export const weaponScene = new THREE.Scene(); // Cria uma cena separada para a arma

export async function createWeapon(weaponScene){
    // Carrega o modelo da arma
    setupLighting(weaponScene);

    // Acessa o modelo de arma já carregado
    gunMesh = await models.kawaiiGun;

    gunMesh = gunMesh.clone(true);

    let gun_size =  10;
    gunMesh.scale.set(gun_size, gun_size, gun_size); // Ajuste do tamanho da arma
    
    // Rotação para inclinar levemente para a esquerda
    gunMesh.rotation.copy(GUN_ROTATION);

    // Posicionamento da arma no canto direito e um pouco abaixo
    gunMesh.position.set(2.3, -2.3, -5.5); 
    
    weaponScene.add(gunMesh); // Adiciona a arma na cena separada
}

export function shoot(player, kitties, world, scene, camera, salazar = null){
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

    // Ajusta a direção dos disparos
    const direction = new THREE.Vector3(0, 0, -1);
    camera.getWorldDirection(direction);
    direction.normalize();
    
    // Cria um vetor de rotação ao redor do eixo Y para ajustar a direção
    const leftAdjustment = new THREE.Matrix4().makeRotationY(0.25);
    direction.applyMatrix4(leftAdjustment);

    const fire_vel = 100;
    const velocity = new CANNON.Vec3(direction.x * fire_vel, direction.y * fire_vel, direction.z * fire_vel);
    projectileBody.velocity.copy(velocity);

    // Atualiza a posição do projétil e remove-o quando sair da área
    function updateProjectile() {
        projectileMesh.position.copy(projectileBody.position);        
        requestAnimationFrame(updateProjectile);
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

    // Detecta colisões entre o projétil e os inimigos
    projectileBody.addEventListener("collide", (event) => {
        const collidedWith = event.body;

        if (salazar && collidedWith === salazar.body){
            salazar.decreaseLife(1);
            removeProjectile(); 
            player.increasePoints(20);           
        }

        for (const kitty of kitties) {
            if (collidedWith === kitty.body) {
                kitty.decreaseLife(1);
                removeProjectile();
                player.increasePoints(10);           
                break;
            }
        }
    });
}

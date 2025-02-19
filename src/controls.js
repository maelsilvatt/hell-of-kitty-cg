// controls.js

import { isFinalBossIntroOn } from './gameProgress.js';
import { shoot } from './weapons.js';
import * as THREE from 'three';

export const keys = { w: false, a: false, s: false, d: false };
export let moveSpeed = 0.35;
export let mouseSensitivity = 0.002;
export let yaw = 0;
let musicPlayed = false;

export function setupControls(camera) {
    window.addEventListener('keydown', (event) => {
        if (keys.hasOwnProperty(event.key)) keys[event.key] = true;
    });

    window.addEventListener('keyup', (event) => {
        if (keys.hasOwnProperty(event.key)) keys[event.key] = false;
    });

    document.addEventListener('click', () => {
        document.body.requestPointerLock();
    });

    document.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement === document.body) {
            yaw -= event.movementX * mouseSensitivity;
            camera.rotation.set(0, yaw, 0);
        }
    });
}

export function handleKeyboardInput(camera){
    if ( !isFinalBossIntroOn){   
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
    }
}

// Função para controlar o gamepad (exemplo com PS4)
let salazar;

export function handleGamepadInput(kitties, world, scene, camera, salazar) {
    const gamepad = navigator.getGamepads()[0]; // Pega o primeiro controle na lista de gamepads

    // Verifica se existe controle e se não está em cutscene
    if (gamepad && !isFinalBossIntroOn) {

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
            shoot(kitties, world, scene, camera, salazar);
        }
    } 
}

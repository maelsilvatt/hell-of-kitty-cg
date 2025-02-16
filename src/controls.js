// controls.js

export const keys = { w: false, a: false, s: false, d: false };
export let moveSpeed = 0.3;
export let mouseSensitivity = 0.002;
export let yaw = 0;

export function setupControls(camera) {
    window.addEventListener('keydown', (event) => {
        if (keys.hasOwnProperty(event.key)) keys[event.key] = true;
    });

    window.addEventListener('keyup', (event) => {
        if (keys.hasOwnProperty(event.key)) keys[event.key] = false;
    });

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
}
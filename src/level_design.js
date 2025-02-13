// level_design.js

import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export function setupLighting(scene) {
    // Iluminação
    const ambientLight = new THREE.AmbientLight(0xffaacc, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 20, 5);
    scene.add(directionalLight);
}

export function setupPhysicsWorld() {
    // Mundo da física
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);

    return world;
}

export function setupMaterials() {
    const material = new CANNON.Material();

    const wallColor = 0xff1493; // Rosa mais vibrante
    const floorColor = 0xff6eb4; // Rosa ainda mais forte

    const wallMaterial = new THREE.MeshStandardMaterial({ color: wallColor });
    const floorMaterial = new THREE.MeshStandardMaterial({ color: floorColor });

    return { material, wallMaterial, floorMaterial };
}

export function createFloor(world, scene, material, floorMaterial, room_size) {
    // Chão
    const floorBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material });
    floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(floorBody);

    const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(room_size * 2, room_size * 2), floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2;
    scene.add(floorMesh);
}

export function createWall(world, scene, material, wallSize, wallMaterial, x, y, z, rotationY = 0) {
    const wallBody = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(wallSize.width / 2, wallSize.height / 2, wallSize.depth / 2)), material });
    wallBody.position.set(x, y, z);
    world.addBody(wallBody);

    const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(wallSize.width, wallSize.height, wallSize.depth), wallMaterial);
    wallMesh.position.set(x, y, z);
    wallMesh.rotation.y = rotationY;
    scene.add(wallMesh);
}

export function createWalls(world, scene, material, wallSize, wallMaterial, room_size) {
    // Criando as paredes
    createWall(world, scene, material, wallSize, wallMaterial, 0, 5, -room_size); // Parede de trás
    createWall(world, scene, material, wallSize, wallMaterial, 0, 5, room_size); // Parede da frente
    createWall(world, scene, material, wallSize, wallMaterial, -room_size, 5, 0, Math.PI / 2); // Parede esquerda
    createWall(world, scene, material, wallSize, wallMaterial, room_size, 5, 0, Math.PI / 2); // Parede direita
}

export function createWorld(scene, room_size = 100) {
    // Configura o fundo da cena
    scene.background = new THREE.Color(0xff69b4); // Rosa vibrante
    
    // Configura a iluminação
    setupLighting(scene);

    // Configura o mundo físico
    const world = setupPhysicsWorld();

    // Configura os materiais
    const { material, wallMaterial, floorMaterial } = setupMaterials();

    // Definição do tamanho do ambiente
    const wallSize = { width: room_size * 2, height: 10, depth: 0.2 };

    // Cria o chão e as paredes
    createFloor(world, scene, material, floorMaterial, room_size);
    createWalls(world, scene, material, wallSize, wallMaterial, room_size);

    return world; // Retorna o mundo para ser utilizado no main.js
}

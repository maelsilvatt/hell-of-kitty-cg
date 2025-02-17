// level_design.js

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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

export function createFloor(world, scene) {
    const island_loader = new GLTFLoader();

    island_loader.load('models/candy island/candy island.glb', (gltf) => {
        const islandMesh = gltf.scene; // Variável local para evitar problemas

        let island_size = 4;
        islandMesh.scale.set(island_size, island_size, island_size); // Ajuste do tamanho da ilha

        islandMesh.position.set(0, -22, 0);

        scene.add(islandMesh);
    });

    // Criando o chão físico corretamente
    const floorBody = new CANNON.Body({
        mass: 0, // Chão estático
        shape: new CANNON.Plane()
    });

    floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(floorBody);
}

export function createWall(world, wallSize, x, y, z, rotationY = 0) {
    const wallBody = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(wallSize.width / 2, wallSize.height / 2, wallSize.depth / 2))});
    wallBody.position.set(x, y, z);
    wallBody.quaternion.setFromEuler(0, rotationY, 0);
    world.addBody(wallBody);
}

export function createWalls(world, wallSize, room_size) {
    // Criando as paredes
    createWall(world, wallSize, 0, 5, -room_size); // Parede de trás
    createWall(world, wallSize, 0, 5, room_size); // Parede da frente
    createWall(world, wallSize, -room_size, 5, 0, Math.PI / 2); // Parede esquerda
    createWall(world, wallSize, room_size, 5, 0, Math.PI / 2); // Parede direita
}

export function createWorld(scene, room_size = 100) {
    // Configura o fundo da cena
    scene.background = new THREE.Color(0xdcabd5); // Rosa pastel
    // scene.background = new THREE.Color(0x3ee4ed); // Azul celeste
    
    // Configura a iluminação
    setupLighting(scene);

    // Configura o mundo físico
    const world = setupPhysicsWorld();

    // Definição do tamanho do ambiente
    const wallSize = { width: room_size * 2, height: 10, depth: 0.2 };

    // Cria o chão e as paredes
    createFloor(world, scene, room_size);
    createWalls(world, scene, wallSize, room_size);

    return world; // Retorna o mundo para ser utilizado no main.js
}

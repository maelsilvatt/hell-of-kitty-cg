// enemies.js

import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Variáveis globais para o inimigo
let helloKitty;
let helloKittyBody; // Referência ao corpo físico

export function createHelloKitty(scene, world) {
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
}

// Exporta as variáveis para uso no main.js
export { helloKitty, helloKittyBody };

// player_stats.js

import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Player {
    constructor(scene, world, camera, life = 5) {
        this.scene = scene;
        this.world = world;
        this.camera = camera;
        this.life = life;
        this.isDead = false;
        this.lifeBar = null;
        this.body = null;

        // DEBUG
        this.debugCube = null; 

        this.init();
    }

    init() {
        // Criar o corpo físico
        this.createPhysicsBody();

        // Cria a barra de vida
        this.createLifeBar();

        // Adiciona a barra de vida ao cenário
        this.scene.add(this.lifeBar);
    }    

    // Cria o corpo físico do jogador
    createPhysicsBody() {
        // const position = this.camera.position;
        const position = new THREE.Vector3(0, 0, 0);
        const size = 8;

        const shape = new CANNON.Box(new CANNON.Vec3(size / 4, size / 2, size / 4));
        this.body = new CANNON.Body({ mass: 0, position, linearDamping: 0.4, angularDamping: 1 });
        this.body.addShape(shape);
        this.world.addBody(this.body);
    }

    createLifeBar(){
        // Criar barra de vida
        const lifeBarWidth = 2 * (this.size * 0.3); // Largura total da barra de vida
        const lifeBarHeight = 0.2; // Altura da barra de vida

        // Criar a geometria da barra de vida com a largura ajustada
        const lifeBarGeometry = new THREE.PlaneGeometry(lifeBarWidth, lifeBarHeight);
        this.lifeBarMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            side: THREE.DoubleSide
        });

        // Barra de vida
        this.lifeBar = new THREE.Mesh(lifeBarGeometry, this.lifeBarMaterial);

        // Posicionar a barra no canto inferior esquerdo da tela (ajustado com coordenadas de câmera)
        this.lifeBar.position.set(-window.innerWidth / 2 + lifeBarWidth / 2, -window.innerHeight / 2 + lifeBarHeight / 2, 0);
    }

    decreaseLife(amount) {
        if (this.isDead) return;

        this.life -= amount;

        // Se o jogador morreu
        if (this.life <= 0) {
            this.life = 0;
            this.isDead = true;
        }

        // Se o jogador está vivo, a barra de vida diminui
        this.lifeBar.scale.x = this.life / 5;
    }

    updateBody(player){
        // Sincroniza a posição do jogador com o corpo físico
        this.body.position.set(
            player.position.x,
            player.position.y - this.size / 2,
            player.position.z
        );
    }

    // DEBUG
    initDebugCube(scene){
        // Inicializando o cubo de debug na primeira vez
        if (!this.debugCube) {  // Verifica se o cubo de debug já foi criado
            this.debugCube = this.createDebugCube(this.body);  // Cria o cubo de debug
            scene.add(this.debugCube);  // Adiciona à cena
        }
    }

    updateDebugCube(){
        if (this.debugCube) {
            // Posiciona o cubo exatamente onde está o body
            this.debugCube.position.copy(this.body.position);
        }
    }

    createDebugCube() {
        // Cria uma geometria de linha (com bordas) com as dimensões do body
        const size = 8;
        const geometry = new THREE.BoxGeometry(size / 2, size, size / 2);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        const cube = new THREE.LineSegments(edges, material);

        // Posiciona o cubo exatamente onde está o body
        cube.position.copy(this.body.position);

        return cube;
    }
}

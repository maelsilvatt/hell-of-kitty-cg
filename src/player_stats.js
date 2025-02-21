// player_stats.js

import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Player {
    constructor(scene, uiScene, uiCamera, world, life = 100) {
        this.scene = scene;
        this.uiScene = uiScene;
        this.uiCamera = uiCamera;
        this.world = world;
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

    createLifeBar() {
        // Criar barra de vida
        const lifeBarWidth = 2 * (this.size * 0.3); // Largura da barra de vida
        const lifeBarHeight = 0.2; // Altura da barra de vida
    
        // Criar a geometria da barra de vida
        const lifeBarGeometry = new THREE.PlaneGeometry(lifeBarWidth, lifeBarHeight);
        this.lifeBarMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            side: THREE.DoubleSide
        });
    
        // Criar a barra de vida como um mesh
        this.lifeBar = new THREE.Mesh(lifeBarGeometry, this.lifeBarMaterial);
    
        // Posicionar a barra no canto inferior esquerdo da tela HUD
        const uiWidth = this.uiCamera.right - this.uiCamera.left;  // Largura da UI
        const uiHeight = this.uiCamera.top - this.uiCamera.bottom; // Altura da UI

        const offsetX = 0.05; // Pequeno deslocamento para não colar na borda
        const offsetY = 0.05;

        this.lifeBar.position.set(
            this.uiCamera.left + lifeBarWidth / 2 + offsetX,  // Lado esquerdo
            this.uiCamera.bottom + lifeBarHeight / 2 + offsetY, // Parte de baixo
            0
        );
    
        // Adicionar à cena de UI
        this.uiScene.add(this.lifeBar);
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
        this.lifeBar.scale.x = this.life / 100;
    }

    updateBody(camera){
        // Sincroniza a posição do jogador com o corpo físico
        this.body.position.set(
            camera.position.x,
            camera.position.y - this.size / 2,
            camera.position.z
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

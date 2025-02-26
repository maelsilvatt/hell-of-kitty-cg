import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

// Objeto models agora começa vazio
export let models = {};

// Função para carregar todos os modelos antes do jogo iniciar
export async function loadAllModels() {
    try {
        const modelPaths = {
            helloKitty: 'models/hello kitty/hello kitty.glb',
            bombKitty: 'models/bomb kitty/bomb kitty.glb',
            kawaiiGun: 'models/kawaii gun/scene.gltf',
            candyIsland: 'models/candy island/candy island.gltf'
        };

        // Carrega todos os modelos de uma vez
        const loadedModels = await Promise.all(
            Object.entries(modelPaths).map(async ([key, path]) => {
                const model = await loader.loadAsync(path);
                return [key, model.scene]; // Retorna um array [chave, modelo carregado]
            })
        );

        // Atualiza models apenas com modelos prontos para uso
        models = Object.fromEntries(loadedModels);

        console.log("🚀 Todos os modelos foram carregados!", models);
    } catch (error) {
        console.error('❌ Erro ao carregar os modelos:', error);
    }
}
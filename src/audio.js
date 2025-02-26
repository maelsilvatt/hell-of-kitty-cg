// audio.js

let backgroundMusic;

// Função para carregar e tocar a música
export function playBackgroundMusic(songPath, volume = 0.5) {
    // Criação de um novo objeto de áudio
    backgroundMusic = new Audio(songPath); 
    backgroundMusic.loop = true; 
    backgroundMusic.volume = volume;

    // Tocar a música
    backgroundMusic.play().catch(error => {
        console.error('Erro ao tentar reproduzir a música:', error);
    });
}

// Função para parar a música (caso precise)
export function stopBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0; // Reseta para o início da música
    }
}

// Função para carregar e tocar o efeito de tiro
export function playGunshotSound() {
    const gunshotSound = new Audio('sound_effects/gun_shot.mp3');  // Cria uma nova instância do áudio a cada chamada
    gunshotSound.volume = 0.4;  // Ajuste o volume conforme necessário

    // Toca o som de tiro imediatamente
    gunshotSound.play().catch(error => {
        console.error('Erro ao tentar reproduzir o som de tiro:', error);
    });
}

let isKittyVoicePlaying = false; // Variável para controlar se um som está em reprodução

export function playKittyVoiceLine() {
    if (isKittyVoicePlaying) return; // Impede que um novo som seja iniciado enquanto outro está tocando

    // Lista de sons disponíveis
    const kittyVoiceLines = [
        'sound_effects/hello this is kitty (demon).wav',
        'sound_effects/yeah (demon).wav'
    ];

    // Escolhe um dos sons aleatoriamente
    const randomSound = kittyVoiceLines[Math.floor(Math.random() * kittyVoiceLines.length)];

    // Cria uma nova instância do áudio com o som escolhido
    const kittyVoiceLine = new Audio(randomSound);
    kittyVoiceLine.volume = 0.4; 

    isKittyVoicePlaying = true;

    // Quando o som termina, libera para o próximo
    kittyVoiceLine.onended = () => {
        isKittyVoicePlaying = false;
    };

    // Toca o som e trata erros
    kittyVoiceLine.play().catch(error => {
        console.error('Erro ao tentar reproduzir o som da Kitty:', error);
        isKittyVoicePlaying = false;
    });
}

let isBombKittyVoicePlaying = false; // Variável para controlar se um som está em reprodução

export function playBombKittyVoiceLine() {
    if (isBombKittyVoicePlaying) return; // Impede que um novo som seja iniciado enquanto outro está tocando

    // Cria uma nova instância do áudio com o som escolhido
    const kittyVoiceLine = new Audio('sound_effects/explosion.mp3');
    kittyVoiceLine.volume = 0.5; 

    isBombKittyVoicePlaying = true;

    // Quando o som termina, libera para o próximo
    kittyVoiceLine.onended = () => {
        isBombKittyVoicePlaying = false;
    };

    // Toca o som e trata erros
    kittyVoiceLine.play().catch(error => {
        console.error('Erro ao tentar reproduzir o som da bomb kitty:', error);
        isBombKittyVoicePlaying = false;
    });
}

export function playSalazarVoiceLine(){
    
}

let isVoiceLinePlaying = false; // Variável para controlar se um som está em reprodução

export function playVoiceLine(voiceLines) {
    if (isVoiceLinePlaying) return; // Impede que um novo som seja iniciado enquanto outro está tocando

    // Escolhe um dos sons aleatoriamente
    const randomSound = voiceLines[Math.floor(Math.random() * kittyVoiceLines.length)];

    // Cria uma nova instância do áudio com o som escolhido
    const voiceLine = new Audio(randomSound);
    voiceLine.volume = 0.4; 

    isVoiceLinePlaying = true;

    // Quando o som termina, libera para o próximo
    voiceLine.onended = () => {
        isVoiceLinePlaying = false;
    };

    // Toca o som e trata erros
    voiceLine.play().catch(error => {
        console.error('Erro ao tentar reproduzir o som da Kitty:', error);
        isVoiceLinePlaying = false;
    });
}

// Variáveis para armazenar o efeito de som do Sans
let sansDialogueSound = null;  // Mantém a instância do som

// Função para carregar e tocar o som do Sans por um tempo específico
export function playSansDialogueSound(durationInSeconds) {
    // Verifica se já há um som tocando
    if (sansDialogueSound && !sansDialogueSound.paused) {
        sansDialogueSound.pause();  // Interrompe o som se ele estiver tocando
        sansDialogueSound.currentTime = 0;  // Reseta o som
    }

    // Cria uma nova instância do áudio caso não haja um som tocando
    sansDialogueSound = new Audio('sound_effects/Sans Dialogue Sound Effect.mp3');
    sansDialogueSound.volume = 0.6;
    sansDialogueSound.loop = true; 

    // Toca o som imediatamente
    sansDialogueSound.play().catch(error => {
        console.error('Erro ao tentar reproduzir o som do Sans:', error);
    });

    // Após o tempo especificado, para o som (corta imediatamente)
    setTimeout(() => {
        if (sansDialogueSound) {
            sansDialogueSound.pause();  // Interrompe o som imediatamente
            sansDialogueSound.currentTime = 0;  // Reseta o som para o início
        }
    }, durationInSeconds * 1000);  // Multiplica por 1000 para converter de segundos para milissegundos
}

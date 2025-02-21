// utils.js

// Função que exibe o próximo vídeo na lista
export function showNextDialogue(dialogues, index){
    if (index >= dialogues.length) {
      // Quando todos os vídeos forem exibidos, remove a tela preta
      removeBlackout();
      return;
    }
  
    // Exibe o vídeo do diálogo atual
    showDialogue(dialogues[index], () => {
      // Quando o vídeo terminar, chama a próxima iteração
      showNextDialogue(dialogues, index + 1);
    });
}
  
// Função que exibe o vídeo do diálogo
export function showDialogue(dialoguePath, callback){
    const videoContainer = document.createElement("div");
    videoContainer.style.position = "fixed";
    videoContainer.style.bottom = "20px"; // Ajuste a distância da parte inferior da tela
    videoContainer.style.left = "50%"; // Centraliza horizontalmente
    videoContainer.style.transform = "translateX(-50%)"; // Compensa o deslocamento para centralizar corretamente
    videoContainer.style.zIndex = "10000"; // Põe o vídeo acima da tela preta

    // Cria a tag de vídeo para o gif convertido
    const video = document.createElement("video");
    video.src = dialoguePath; // Caminho do diálogo
    video.style.width = "auto"; 
    video.style.height = "auto";
    video.loop = false; // Faz o vídeo não repetir
    video.autoplay = true; // Começa automaticamente
    video.muted = true; // Muta o áudio, caso você não precise

    // Adiciona o vídeo à div
    videoContainer.appendChild(video);

    // Adiciona o vídeo à tela
    document.body.appendChild(videoContainer);

    // Após a duração do vídeo, chama o callback para continuar com o próximo vídeo
    video.onended = () => {
        videoContainer.style.display = "none"; // Esconde o vídeo quando terminar
        if (callback) callback(); // Chama a função de callback para continuar
    };
}

// Função para remover a tela preta
export function removeBlackout() {
    const blackout = document.getElementById("blackout");
    if (blackout) {
        blackout.style.display = "none"; // Esconde a tela preta
    }
}

// Função que deixa a tela preta
export function blackoutScreen(){
    // Cria um elemento de tela preta
    const blackout = document.createElement("div");
    blackout.style.position = "fixed";
    blackout.style.top = "0";
    blackout.style.left = "0";
    blackout.style.width = "100vw";
    blackout.style.height = "100vh";
    blackout.style.backgroundColor = "black";
    blackout.style.zIndex = "9999";
    blackout.id = "blackout"; // Atribui um id para referenciar mais tarde

    // Adiciona a tela preta ao corpo do documento
    document.body.appendChild(blackout);
}

// Função para criar uma textura com base em um vídeo WebM
export function createVideoTexture(url) {
    const video = document.createElement('video');
    video.src = url;
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.setAttribute('playsinline', ''); // Necessário para funcionar no mobile
    video.play();

    const texture = new THREE.VideoTexture(video);
    texture.format = THREE.RGBAFormat; // Mantém transparência
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    return texture;
}

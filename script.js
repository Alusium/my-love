const introScreen = document.getElementById('intro-screen');
const introText = document.getElementById('intro-text');
const mainContent = document.getElementById('main-content');
const surprise = document.getElementById('surprise');
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const video = document.getElementById('myVideo');
const music = document.getElementById('bgMusic');

// Елементи гри
const gameContainer = document.getElementById('game-container');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Завантаження твоїх облич
const faceImages = [];
const faceSrcs = ['Media/face1.png', 'Media/face2.png', 'Media/face3.png'];

faceSrcs.forEach(src => {
    const img = new Image();
    img.src = src;
    faceImages.push(img);
});

// --- 1. ЛОГІКА ФРАЗ ---
const phrases = [
    { text: "Привіт, сонечко2222... ✨", duration: 3000 },
    { text: "Я довго думав, як тебе привітати...", duration: 3500 },
    { text: "Ти знаєш, як багато ти для мене значиш?", duration: 3500 },
    { text: "Тому я написав цей код для тебе.", duration: 3000 },
    { text: "Але спочатку — невеличка гра! ❤️", duration: 2500 },
    { text: "Лови мої усмішки, щоб відкрити сюрприз!", duration: 3000 }
];

let phraseIndex = 0;

function showNextPhrase() {
    if (phraseIndex < phrases.length) {
        introText.textContent = phrases[phraseIndex].text;
        introText.style.animation = 'none';
        introText.offsetHeight; 
        introText.style.animation = 'fadeInOut 3s forwards';

        setTimeout(() => {
            phraseIndex++;
            showNextPhrase();
        }, phrases[phraseIndex].duration);
    } else {
        introScreen.classList.add('hidden');
        setTimeout(() => {
            introScreen.style.display = 'none';
            startGame();
        }, 800);
    }
}

// --- 2. ЛОГІКА ГРИ "CATCH MY LOVE" ---
let score = 0;
let gameActive = false;
let objects = [];
let basket = { x: 0, y: 0, w: 80, h: 60 };

function startGame() {
    gameContainer.classList.remove('hidden');
    gameContainer.style.display = 'flex';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    basket.x = canvas.width / 2 - 40;
    basket.y = canvas.height - 150;
    gameActive = true;
    updateGame();
    setInterval(spawnObject, 400);
}

// Керування (Мишка + Тач)
function handleMove(clientX) {
    if(!gameActive) return;
    basket.x = clientX - basket.w / 2;
    // Обмеження екрану
    if (basket.x < 0) basket.x = 0;
    if (basket.x > canvas.width - basket.w) basket.x = canvas.width - basket.w;
}

window.addEventListener('touchmove', (e) => {
    handleMove(e.touches[0].clientX);
    e.preventDefault();
}, { passive: false });

window.addEventListener('mousemove', (e) => {
    handleMove(e.clientX);
});

function spawnObject() {
    if(!gameActive) return;
    const isFace = Math.random() > 0.3; // 70% шанс на твоє обличчя, 30% на сердечко
    objects.push({
        x: Math.random() * (canvas.width - 50) + 25,
        y: -60,
        speed: 4 + Math.random() * 4,
        type: isFace ? 'face' : 'heart',
        img: isFace ? faceImages[Math.floor(Math.random() * faceImages.length)] : null,
        size: isFace ? 50 : 30
    });
}

function updateGame() {
    if (!gameActive) return;

    if (score >= 2000) {
        gameActive = false;
        endGame();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Малюємо кошик (можна замінити на емоджі або іншу картинку)
    ctx.font = "60px Arial";
    ctx.fillText("🧺", basket.x, basket.y + 50);

    objects.forEach((obj, index) => {
        obj.y += obj.speed;

        if (obj.type === 'face' && obj.img.complete) {
            // Малюємо твоє фото
            ctx.drawImage(obj.img, obj.x - obj.size/2, obj.y, obj.size, obj.size);
        } else {
            // Малюємо сердечко, якщо фото ще не завантажилось або це бонус
            ctx.font = "30px Arial";
            ctx.fillText("❤️", obj.x - 15, obj.y + 20);
        }

        // Колізія
        if (obj.y > basket.y - 20 && obj.y < basket.y + 40 && 
            obj.x > basket.x && obj.x < basket.x + basket.w) {
            score += 100;
            scoreElement.innerText = score;
            objects.splice(index, 1);
        }

        // Видалення об'єктів за межами
        if (obj.y > canvas.height) {
            objects.splice(index, 1);
        }
    });

    requestAnimationFrame(updateGame);
}

function endGame() {
    gameContainer.classList.add('hidden');
    setTimeout(() => {
        gameContainer.style.display = 'none';
        mainContent.classList.remove('hidden');
        mainContent.style.display = 'flex';
        setTimeout(() => mainContent.style.opacity = '1', 50);
    }, 800);
}

// --- 3. ЛОГІКА КНОПОК ПИТАННЯ ---
function moveButton(e) {
    if (e) e.preventDefault();
    const padding = 100;
    const maxX = window.innerWidth - noBtn.offsetWidth - padding;
    const maxY = window.innerHeight - noBtn.offsetHeight - padding;
    const randomX = Math.max(padding/2, Math.random() * maxX);
    const randomY = Math.max(padding/2, Math.random() * maxY);
    
    noBtn.style.position = 'fixed';
    noBtn.style.left = `${randomX}px`;
    noBtn.style.top = `${randomY}px`;
}

noBtn.addEventListener('touchstart', moveButton);
noBtn.addEventListener('mouseover', moveButton);

yesBtn.addEventListener('click', () => {
    mainContent.classList.add('hidden');
    setTimeout(() => {
        mainContent.style.display = 'none';
        surprise.classList.remove('hidden');
        surprise.style.display = 'flex';
        music.play().catch(() => {});
        video.play();
    }, 800);
});

// --- 4. ФОНОВІ СЕРДЕЧКА (ЕФЕКТ ПРИ КЛІКУ НА ТАК) ---
function createBackgroundHeart() {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.innerHTML = '❤️';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = Math.random() * 3 + 2 + 's';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 5000);
}
setInterval(createBackgroundHeart, 400);

// СТАРТ
showNextPhrase();
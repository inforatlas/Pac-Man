const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let score = 0;
let lives = 3;
let gameRunning = false;
const tileSize = 20;

const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1,1],
    [2,2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2,2],
    [1,1,1,1,1,0,1,2,1,3,3,3,1,2,1,0,1,1,1,1,1],
    [2,2,2,2,2,0,2,2,1,2,2,2,1,2,2,0,2,2,2,2,2],
    [1,1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1,1],
    [2,2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2,2],
    [1,1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,2,0,0,0,0,0,1,0,0,0,1],
    [1,1,0,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,0,1,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let currentMap = map.map(row => [...row]);

const pacman = { x: 10, y: 16, dir: 0, nextDir: null, speed: 0.12 };

const ghosts = [
    { x: 10, y: 8, color: 'red', name: 'Blinky', dir: 0, speed: 0.075 },
    { x: 9, y: 10, color: 'pink', name: 'Pinky', dir: 1, speed: 0.075 },
    { x: 10, y: 10, color: 'cyan', name: 'Inky', dir: 2, speed: 0.075 },
    { x: 11, y: 10, color: 'orange', name: 'Clyde', dir: 3, speed: 0.075 }
];

const keys = {};

function startGame() {
    gameRunning = true;
    document.getElementById('start-screen').style.display = 'none';
    requestAnimationFrame(update);
}

function update() {
    if (!gameRunning) return;
    handleInput();
    movePacman();
    ghosts.forEach(moveGhostIA);
    checkCollisions();
    draw();
    requestAnimationFrame(update);
}

function handleInput() {
    if (keys["ArrowRight"]) pacman.nextDir = 0;
    else if (keys["ArrowLeft"]) pacman.nextDir = 1;
    else if (keys["ArrowUp"]) pacman.nextDir = 2;
    else if (keys["ArrowDown"]) pacman.nextDir = 3;
}

function movePacman() {
    if (pacman.nextDir !== null && canMove(pacman.x, pacman.y, pacman.nextDir)) {
        pacman.dir = pacman.nextDir;
    }

    if (canMove(pacman.x, pacman.y, pacman.dir) && keysArePressed()) {
        if (pacman.dir === 0) pacman.x += pacman.speed;
        if (pacman.dir === 1) pacman.x -= pacman.speed;
        if (pacman.dir === 2) pacman.y -= pacman.speed;
        if (pacman.dir === 3) pacman.y += pacman.speed;
    }

    let gx = Math.round(pacman.x), gy = Math.round(pacman.y);
    if (currentMap[gy] && currentMap[gy][gx] === 0) {
        currentMap[gy][gx] = 2;
        score += 10;
        document.getElementById('score').innerText = `PONTOS: ${score}`;
        checkWin();
    }
}

function keysArePressed() {
    return keys["ArrowRight"] || keys["ArrowLeft"] || keys["ArrowUp"] || keys["ArrowDown"];
}

function canMove(x, y, dir) {
    let nx = x, ny = y;
    let margin = 0.4;
    if (dir === 0) nx += margin;
    if (dir === 1) nx -= margin;
    if (dir === 2) ny -= margin;
    if (dir === 3) ny += margin;
    let cell = currentMap[Math.round(ny)][Math.round(nx)];
    return cell !== 1 && cell !== 3;
}

// --- NOVA INTELIGÊNCIA ARTIFICIAL ---
function moveGhostIA(ghost) {
    let gx = Math.round(ghost.x), gy = Math.round(ghost.y);

    if (Math.abs(ghost.x - gx) < 0.1 && Math.abs(ghost.y - gy) < 0.1) {
        let targetX, targetY;

        // Definir alvos baseados na "personalidade"
        if (ghost.name === 'Blinky') {
            targetX = pacman.x; targetY = pacman.y;
        } else if (ghost.name === 'Pinky') {
            // Mira 4 tiles à frente do Pac-Man
            targetX = pacman.x + (pacman.dir === 0 ? 4 : pacman.dir === 1 ? -4 : 0);
            targetY = pacman.y + (pacman.dir === 3 ? 4 : pacman.dir === 2 ? -4 : 0);
        } else if (ghost.name === 'Clyde') {
            // Persegue se estiver longe, foge se estiver perto (8 tiles)
            let dist = Math.hypot(ghost.x - pacman.x, ghost.y - pacman.y);
            targetX = dist > 8 ? pacman.x : 0; targetY = dist > 8 ? pacman.y : 21;
        } else {
            targetX = pacman.x; targetY = pacman.y; // Inky (simplificado)
        }

        // Escolher a melhor direção (menor distância euclidiana ao alvo)
        let directions = [0, 1, 2, 3].filter(d => {
            // Impede o fantasma de voltar para trás (180º)
            if (ghost.dir === 0 && d === 1) return false;
            if (ghost.dir === 1 && d === 0) return false;
            if (ghost.dir === 2 && d === 3) return false;
            if (ghost.dir === 3 && d === 2) return false;
            
            let nx = gx, ny = gy;
            if (d === 0) nx++; if (d === 1) nx--; if (d === 2) ny--; if (d === 3) ny++;
            return currentMap[ny] && currentMap[ny][nx] !== 1;
        });

        if (directions.length > 0) {
            directions.sort((a, b) => {
                let distA = getDist(gx, gy, a, targetX, targetY);
                let distB = getDist(gx, gy, b, targetX, targetY);
                return distA - distB;
            });
            ghost.dir = directions[0];
        }
    }

    if (ghost.dir === 0) ghost.x += ghost.speed;
    if (ghost.dir === 1) ghost.x -= ghost.speed;
    if (ghost.dir === 2) ghost.y -= ghost.speed;
    if (ghost.dir === 3) ghost.y += ghost.speed;
}

function getDist(x, y, dir, tx, ty) {
    if (dir === 0) x++; if (dir === 1) x--; if (dir === 2) y--; if (dir === 3) y++;
    return Math.hypot(x - tx, y - ty);
}

// --- RESTO DAS FUNÇÕES ---
function checkWin() {
    if (!currentMap.some(row => row.includes(0))) endGame("VITÓRIA! MAPA LIMPO!");
}

function checkCollisions() {
    ghosts.forEach(ghost => {
        if (Math.hypot(pacman.x - ghost.x, pacman.y - ghost.y) < 0.7) {
            lives--;
            document.getElementById('lives').innerText = `VIDAS: ${"❤️".repeat(lives) || "💀"}`;
            pacman.x = 10; pacman.y = 16;
            if (lives <= 0) endGame("FIM DE JOGO");
        }
    });
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < currentMap.length; y++) {
        for (let x = 0; x < currentMap[y].length; x++) {
            let cell = currentMap[y][x];
            if (cell === 1) { ctx.fillStyle = "#1919ff"; ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize); }
            else if (cell === 0) { ctx.fillStyle = "#ffb8ae"; ctx.beginPath(); ctx.arc(x * tileSize + 10, y * tileSize + 10, 2, 0, Math.PI * 2); ctx.fill(); }
            else if (cell === 3) { ctx.fillStyle = "#ffb8ff"; ctx.fillRect(x * tileSize, y * tileSize + 8, tileSize, 4); }
        }
    }
    ctx.fillStyle = "yellow"; ctx.beginPath();
    ctx.arc(pacman.x * tileSize + 10, pacman.y * tileSize + 10, 8, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.lineTo(pacman.x * tileSize + 10, pacman.y * tileSize + 10); ctx.fill();
    ghosts.forEach(ghost => {
        ctx.fillStyle = ghost.color; ctx.fillRect(ghost.x * tileSize + 2, ghost.y * tileSize + 2, 16, 16);
        ctx.fillStyle = "white"; ctx.fillRect(ghost.x * tileSize + 4, ghost.y * tileSize + 4, 4, 4);
        ctx.fillRect(ghost.x * tileSize + 10, ghost.y * tileSize + 4, 4, 4);
    });
}

function endGame(msg) {
    gameRunning = false;
    document.getElementById('game-over').style.display = 'flex';
    document.getElementById('status-text').innerText = msg;
    document.getElementById('final-score').innerText = score;
}

window.onkeydown = e => keys[e.key] = true;
window.onkeyup = e => { delete keys[e.key]; pacman.nextDir = null; };

const setupMobile = (id, dir) => {
    const btn = document.getElementById(id);
    btn.ontouchstart = (e) => { e.preventDefault(); keys[getArrowFromDir(dir)] = true; pacman.nextDir = dir; };
    btn.ontouchend = () => { delete keys[getArrowFromDir(dir)]; pacman.nextDir = null; };
};
function getArrowFromDir(d) { return d===0?"ArrowRight":d===1?"ArrowLeft":d===2?"ArrowUp":"ArrowDown"; }
setupMobile('btn-right', 0); setupMobile('btn-left', 1); setupMobile('btn-up', 2); setupMobile('btn-down', 3);

function saveScore() {
    const name = document.getElementById('player-name').value.toUpperCase() || 'AAA';
    let scores = JSON.parse(localStorage.getItem('pacScores') || '[]');
    scores.push({name, score});
    scores.sort((a,b) => b.score - a.score);
    localStorage.setItem('pacScores', JSON.stringify(scores.slice(0,5)));
    location.reload();
}
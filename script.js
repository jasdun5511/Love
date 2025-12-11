document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const worldElement = document.getElementById('world');
    const skyElement = document.getElementById('sky');
    const playerElement = document.getElementById('player');
    const timeDisplay = document.getElementById('time-display');

    const TILE_SIZE = 40; // 方块大小
    const WORLD_WIDTH_TILES = gameContainer.offsetWidth / TILE_SIZE; // 世界宽度（按方块数）
    const WORLD_HEIGHT_TILES = gameContainer.offsetHeight / TILE_SIZE; // 世界高度（按方块数）

    let worldMap = []; // 存储地形数据
    let playerPos = { x: 0, y: 0 }; // 玩家位置 (方块坐标)
    let mobs = []; // 存储生物对象

    let currentTime = 0; // 0 = 白天, 100 = 夜晚
    const DAY_LENGTH = 200; // 昼夜循环的总长度（数字越大，循环越慢）
    const DAY_SPEED = 0.5; // 昼夜循环的速度

    // --- 1. 世界生成 ---
    function generateWorld() {
        worldElement.style.gridTemplateColumns = `repeat(${WORLD_WIDTH_TILES}, ${TILE_SIZE}px)`;
        worldMap = []; // 清空旧地图

        for (let y = 0; y < WORLD_HEIGHT_TILES; y++) {
            let row = [];
            for (let x = 0; x < WORLD_WIDTH_TILES; x++) {
                let tileType;
                const rand = Math.random();

                // 简单的地形生成逻辑
                if (y < WORLD_HEIGHT_TILES * 0.4) { // 上方为空，或稀疏草地
                    tileType = 'sky'; // 只是一个概念，实际不渲染
                } else if (y < WORLD_HEIGHT_TILES * 0.6) { // 中间层为草地
                    tileType = rand < 0.8 ? 'grass' : (rand < 0.9 ? 'tree' : 'dirt');
                } else if (y < WORLD_HEIGHT_TILES * 0.8) { // 下一层为泥土
                    tileType = rand < 0.9 ? 'dirt' : 'stone';
                } else { // 最底层为石头
                    tileType = 'stone';
                }
                row.push(tileType);

                if (tileType !== 'sky') { // 不渲染“天空”方块
                    const tileDiv = document.createElement('div');
                    tileDiv.classList.add('tile', tileType);
                    tileDiv.style.left = `${x * TILE_SIZE}px`;
                    tileDiv.style.top = `${y * TILE_SIZE}px`;
                    worldElement.appendChild(tileDiv);
                }
            }
            worldMap.push(row);
        }
        console.log("世界生成完毕", worldMap);
    }

    // --- 2. 生物管理 ---
    function spawnMobs(count = 5) {
        for (let i = 0; i < count; i++) {
            const mobType = Math.random() < 0.5 ? 'sheep' : 'pig';
            let x, y;
            let foundSpot = false;

            // 寻找一个草地或泥土方块上生成
            while (!foundSpot) {
                x = Math.floor(Math.random() * WORLD_WIDTH_TILES);
                y = Math.floor(Math.random() * WORLD_HEIGHT_TILES);
                if (worldMap[y] && (worldMap[y][x] === 'grass' || worldMap[y][x] === 'dirt')) {
                    foundSpot = true;
                }
            }

            const mobDiv = document.createElement('div');
            mobDiv.classList.add('mob', mobType);
            mobDiv.style.left = `${x * TILE_SIZE + (TILE_SIZE - 30) / 2}px`; // 居中显示
            mobDiv.style.top = `${y * TILE_SIZE + (TILE_SIZE - 30) / 2}px`;
            gameContainer.appendChild(mobDiv);

            mobs.push({
                element: mobDiv,
                x: x,
                y: y,
                type: mobType
            });
        }
        console.log("生物生成完毕", mobs);
    }

    function moveMobs() {
        mobs.forEach(mob => {
            const direction = Math.floor(Math.random() * 5); // 0:静止, 1:上, 2:下, 3:左, 4:右
            let newX = mob.x;
            let newY = mob.y;

            if (direction === 1) newY--;
            else if (direction === 2) newY++;
            else if (direction === 3) newX--;
            else if (direction === 4) newX++;

            // 边界检查和地形检查
            if (newX >= 0 && newX < WORLD_WIDTH_TILES &&
                newY >= 0 && newY < WORLD_HEIGHT_TILES &&
                (worldMap[newY][newX] === 'grass' || worldMap[newY][newX] === 'dirt')) { // 只能在草地或泥土上移动
                mob.x = newX;
                mob.y = newY;
                mob.element.style.left = `${mob.x * TILE_SIZE + (TILE_SIZE - 30) / 2}px`;
                mob.element.style.top = `${mob.y * TILE_SIZE + (TILE_SIZE - 30) / 2}px`;
            }
        });
    }

    // --- 3. 昼夜系统 ---
    function updateDayNightCycle() {
        currentTime = (currentTime + DAY_SPEED) % DAY_LENGTH;

        let skyColor1, skyColor2, lightIntensity; // 两个天空颜色用于渐变，光照强度

        if (currentTime < DAY_LENGTH / 4) { // 黎明到白天
            const progress = currentTime / (DAY_LENGTH / 4); // 0-1
            skyColor1 = interpolateColor('#1E90FF', '#87CEEB', progress); // 深蓝到天蓝
            skyColor2 = interpolateColor('#FFD700', '#B0E0E6', progress); // 橙黄到浅蓝
            lightIntensity = interpolate(0.5, 1, progress); // 光照增强
            timeDisplay.textContent = `时间: 白天`;
        } else if (currentTime < DAY_LENGTH / 2) { // 白天
            skyColor1 = '#87CEEB';
            skyColor2 = '#B0E0E6';
            lightIntensity = 1;
            timeDisplay.textContent = `时间: 白天`;
        } else if (currentTime < DAY_LENGTH * 3 / 4) { // 黄昏到夜晚
            const progress = (currentTime - DAY_LENGTH / 2) / (DAY_LENGTH / 4); // 0-1
            skyColor1 = interpolateColor('#87CEEB', '#00008B', progress); // 天蓝到深蓝
            skyColor2 = interpolateColor('#B0E0E6', '#2F4F4F', progress); // 浅蓝到灰暗
            lightIntensity = interpolate(1, 0.2, progress); // 光照减弱
            timeDisplay.textContent = `时间: 黄昏`;
        } else { // 夜晚
            skyColor1 = '#00008B';
            skyColor2 = '#2F4F4F';
            lightIntensity = 0.2;
            timeDisplay.textContent = `时间: 夜晚`;
        }

        skyElement.style.background = `linear-gradient(to bottom, ${skyColor1}, ${skyColor2})`;
        worldElement.style.filter = `brightness(${lightIntensity})`; // 调整世界元素的亮度
    }

    // 颜色插值函数 (用于平滑过渡)
    function interpolateColor(color1, color2, factor) {
        const result = color1.slice();
        for (let i = 1; i < 7; i += 2) {
            const val1 = parseInt(color1.substr(i, 2), 16);
            const val2 = parseInt(color2.substr(i, 2), 16);
            const val = Math.round(val1 + factor * (val2 - val1));
            result[i] = val.toString(16).padStart(2, '0');
        }
        return '#' + result.slice(1).join('');
    }
    // 简化版颜色插值 (只取hex值)
    function interpolate(start, end, factor) {
        return start + factor * (end - start);
    }


    // --- 4. 玩家控制 ---
    function initPlayer() {
        // 找到一个合适的初始位置（例如，草地）
        let startX, startY;
        for (let y = 0; y < WORLD_HEIGHT_TILES; y++) {
            for (let x = 0; x < WORLD_WIDTH_TILES; x++) {
                if (worldMap[y][x] === 'grass' || worldMap[y][x] === 'dirt') {
                    startX = x;
                    startY = y;
                    break;
                }
            }
            if (startX !== undefined) break;
        }

        playerPos = { x: startX || 0, y: startY || 0 }; // 确保有默认值
        updatePlayerPosition();
    }

    function updatePlayerPosition() {
        playerElement.style.left = `${playerPos.x * TILE_SIZE + (TILE_SIZE - playerElement.offsetWidth) / 2}px`;
        playerElement.style.top = `${playerPos.y * TILE_SIZE + (TILE_SIZE - playerElement.offsetHeight) / 2}px`;
    }

    document.addEventListener('keydown', (e) => {
        let newX = playerPos.x;
        let newY = playerPos.y;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
                newY--;
                break;
            case 'ArrowDown':
            case 's':
                newY++;
                break;
            case 'ArrowLeft':
            case 'a':
                newX--;
                break;
            case 'ArrowRight':
            case 'd':
                newX++;
                break;
        }

        // 边界检查
        if (newX >= 0 && newX < WORLD_WIDTH_TILES &&
            newY >= 0 && newY < WORLD_HEIGHT_TILES) {
            // 简单碰撞检测：不能走到“天空”方块上
            if (worldMap[newY][newX] !== 'sky') {
                playerPos.x = newX;
                playerPos.y = newY;
                updatePlayerPosition();
            }
        }
    });

    // --- 游戏主循环 ---
    function gameLoop() {
        updateDayNightCycle();
        moveMobs(); // 移动生物
        requestAnimationFrame(gameLoop); // 循环调用
    }

    // --- 初始化游戏 ---
    generateWorld();
    initPlayer();
    spawnMobs(5); // 生成5个生物
    gameLoop(); // 启动游戏循环
});

// 辅助函数：颜色插值（用于平滑昼夜过渡）
function interpolateColor(color1, color2, factor) {
    const hex = (c) => parseInt(c, 16);
    const rgb1 = [hex(color1.substring(1,3)), hex(color1.substring(3,5)), hex(color1.substring(5,7))];
    const rgb2 = [hex(color2.substring(1,3)), hex(color2.substring(3,5)), hex(color2.substring(5,7))];

    const resultRgb = rgb1.map((c1, i) => Math.round(c1 + factor * (rgb2[i] - c1)));
    const toHex = (c) => c.toString(16).padStart(2, '0');
    return `#${toHex(resultRgb[0])}${toHex(resultRgb[1])}${toHex(resultRgb[2])}`;
}

function interpolate(start, end, factor) {
    return start + factor * (end - start);
}

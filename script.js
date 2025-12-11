// --- 游戏配置 ---
const MAP_SIZE = 100; // 整个世界大小 100x100
const VIEW_DISTANCE = 4; // 视野半径 (9x9网格)

// 地形类型与属性
const BIOMES = {
    PLAINS: { name: "草原", color: "biome-plains", resources: ["种子", "泥土"], mob: "牛" },
    FOREST: { name: "森林", color: "biome-forest", resources: ["原木", "苹果"], mob: "僵尸" },
    DESERT: { name: "沙漠", color: "biome-desert", resources: ["仙人掌", "沙子"], mob: "尸壳" },
    MOUNTAIN: { name: "高山", color: "biome-mountain", resources: ["石头", "煤炭", "铁矿"], mob: "骷髅" },
    OCEAN: { name: "海洋", color: "biome-ocean", resources: ["水", "鱼"], mob: "溺尸" }
};

// --- 游戏状态 ---
let player = {
    x: 50,
    y: 50,
    hp: 100,
    hunger: 100,
    inventory: {}
};

let gameTime = 0; // 0-11: 白天, 12-23: 黑夜
let worldMap = {}; // 存储已生成的区块 "x,y": {type: ...}

// --- 初始化 ---
function initGame() {
    log("游戏开始！你需要寻找资源生存下去。");
    updateUI();
}

// --- 核心逻辑 ---

// 获取或生成某坐标的地形
function getTile(x, y) {
    const key = `${x},${y}`;
    if (worldMap[key]) {
        return worldMap[key];
    }
    
    // 简单的伪随机生成算法
    const types = Object.keys(BIOMES);
    // 利用坐标做随机种子，保证同一坐标地形不变
    const hash = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453);
    const typeIndex = Math.floor((hash - Math.floor(hash)) * types.length);
    
    const newTile = {
        type: types[typeIndex],
        explored: false
    };
    worldMap[key] = newTile;
    return newTile;
}

// 移动系统
function move(dx, dy) {
    if (player.hp <= 0) return;

    player.x += dx;
    player.y += dy;
    
    // 消耗饱食度
    player.hunger -= 1;
    if (player.hunger < 0) {
        player.hunger = 0;
        player.hp -= 5;
        log("你饿得头昏眼花，生命值下降！");
    }

    // 时间流逝
    passTime();
    
    // 探索当前格子
    const currentTile = getTile(player.x, player.y);
    if (!currentTile.explored) {
        currentTile.explored = true;
        log(`你来到了 ${BIOMES[currentTile.type].name}。`);
    }

    updateUI();
}

// 互动/采集系统
function action() {
    if (player.hp <= 0) return;
    
    const tile = getTile(player.x, player.y);
    const biome = BIOMES[tile.type];
    
    // 采集逻辑
    const roll = Math.random();
    
    if (roll > 0.6) {
        // 采集成功
        const item = biome.resources[Math.floor(Math.random() * biome.resources.length)];
        addItem(item, 1);
        log(`采集成功！获得了 [${item}] x1`);
        player.hunger -= 2; // 劳动消耗更多
    } else if (roll < 0.2) {
        // 遇敌
        const isNight = gameTime >= 12;
        const enemy = biome.mob;
        if (isNight) {
            const dmg = Math.floor(Math.random() * 10) + 5;
            player.hp -= dmg;
            log(`警告！黑夜中的 [${enemy}] 袭击了你！受到了 ${dmg} 点伤害！`);
        } else {
            log(`你看到了一只 [${enemy}]，但它没有攻击你。`);
        }
    } else {
        log("你四处搜寻，但一无所获。");
        player.hunger -= 1;
    }
    
    passTime();
    updateUI();
}

// 时间系统
function passTime() {
    gameTime = (gameTime + 1) % 24;
    const body = document.body;
    
    if (gameTime === 12) {
        log("天色变暗了，夜晚降临... (怪物开始出没)");
        body.classList.add('night');
    } else if (gameTime === 0) {
        log("太阳升起，新的一天开始了。");
        body.classList.remove('night');
    }
}

// 背包系统
function addItem(name, count) {
    if (!player.inventory[name]) {
        player.inventory[name] = 0;
    }
    player.inventory[name] += count;
}

// 日志系统
function log(msg) {
    const logEl = document.getElementById('game-log');
    const p = document.createElement('p');
    // 添加时间戳
    const timeStr = gameTime < 12 ? `☀️${gameTime}:00` : `🌙${gameTime}:00`;
    p.innerHTML = `<small>[${timeStr}]</small> ${msg}`;
    logEl.prepend(p); // 最新消息在最上面
}

// --- UI 渲染 ---
function updateUI() {
    // 1. 状态栏
    document.getElementById('hp').innerText = player.hp;
    document.getElementById('hunger').innerText = player.hunger;
    document.getElementById('time').innerText = gameTime < 12 ? "白天" : "黑夜";
    document.getElementById('coord-x').innerText = player.x;
    document.getElementById('coord-y').innerText = player.y;
    
    const currentTile = getTile(player.x, player.y);
    document.getElementById('biome').innerText = BIOMES[currentTile.type].name;

    if (player.hp <= 0) {
        log("☠️ 你死亡了！请刷新页面重来。");
        return;
    }

    // 2. 渲染地图 (9x9网格)
    const mapEl = document.getElementById('grid-map');
    mapEl.innerHTML = ''; // 清空

    for (let y = player.y - VIEW_DISTANCE; y <= player.y + VIEW_DISTANCE; y++) {
        for (let x = player.x - VIEW_DISTANCE; x <= player.x + VIEW_DISTANCE; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            // 渲染地形颜色
            const tile = getTile(x, y);
            cell.classList.add(BIOMES[tile.type].color);
            
            // 渲染地形文字（简写）
            cell.innerText = BIOMES[tile.type].name[0];

            // 渲染玩家
            if (x === player.x && y === player.y) {
                cell.classList.add('player');
                cell.innerText = "我";
            }
            
            mapEl.appendChild(cell);
        }
    }

    // 3. 渲染背包
    const invEl = document.getElementById('inv-list');
    invEl.innerHTML = '';
    for (const [item, count] of Object.entries(player.inventory)) {
        const span = document.createElement('span');
        span.innerText = `${item} (${count})`;
        invEl.appendChild(span);
    }
}

// 启动
initGame();

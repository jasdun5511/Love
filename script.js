// --- 游戏配置 (增加怪物数据) ---
const BIOMES = {
    PLAINS: { name: "广阔草原", color: "biome-plains", resources: ["杂草", "种子", "泥土块"], mobs: ["野牛", "史莱姆"], mobStats: { 野牛: {hp: 15, dmg: 4}, 史莱姆: {hp: 8, dmg: 2} } },
    FOREST: { name: "幽暗森林", color: "biome-forest", resources: ["橡木", "树枝", "苹果"], mobs: ["森林狼", "僵尸"], mobStats: { 森林狼: {hp: 20, dmg: 6}, 僵尸: {hp: 10, dmg: 3} } },
    DESERT: { name: "灼热沙漠", color: "biome-desert", resources: ["仙人掌", "沙子", "枯灌木"], mobs: ["沙虫", "尸壳"], mobStats: { 沙虫: {hp: 25, dmg: 8}, 尸壳: {hp: 12, dmg: 4} } },
    MOUNTAIN: { name: "险峻高山", color: "biome-mountain", resources: ["石块", "铁矿石", "煤炭"], mobs: ["山地骷髅", "巨鹰"], mobStats: { 山地骷髅: {hp: 30, dmg: 10}, 巨鹰: {hp: 18, dmg: 5} } }
};

// 玩家基础攻击力 (简单化)
const PLAYER_BASE_DMG = 5;

// --- 游戏状态 ---
let player = { x: 50, y: 50, hp: 100, hunger: 100, inventory: {} };
let gameTime = 0;
let worldMap = {}; 
let isMapEnlarged = false;
let lastBiomeType = null;
let currentEnemy = null; // 新增：当前遭遇的怪物对象 {name: '...', hp: 20, dmg: 5}
let inCombat = false; // 新增：是否处于战斗状态

// --- 核心初始化 ---
function initGame() {
    revealSurroundings(player.x, player.y);
    updateBiomePanel(player.x, player.y); // 初始加载地形信息面板
    updateUI();
}

// ----------------------------------------------------
// --- 地形与移动逻辑 (大部分保留) ---
// ----------------------------------------------------

function move(dx, dy) {
    if (player.hp <= 0 || inCombat) return; 

    player.x += dx;
    player.y += dy;
    player.hunger = Math.max(0, player.hunger - 1);

    if (player.hunger === 0) {
        player.hp -= 2;
        log("你饿得生命值下降！");
    }

    passTime();
    revealSurroundings(player.x, player.y);
    updateBiomePanel(player.x, player.y); // 移动后更新地形信息面板
    updateUI();
}

// **新增：常驻地形信息面板更新**
function updateBiomePanel(x, y) {
    const currentTile = getTile(x, y);
    const data = BIOMES[currentTile.type];
    
    document.getElementById('panel-title').innerText = data.name;
    
    const resContainer = document.getElementById('panel-resources');
    resContainer.innerHTML = data.resources.map(r => `<span>${r}</span>`).join('');
    
    const mobContainer = document.getElementById('panel-mobs');
    mobContainer.innerHTML = data.mobs.map(m => `<span>${m}</span>`).join('');
}


// ----------------------------------------------------
// --- 交互动作 (采集/搜索/战斗) ---
// ----------------------------------------------------

// **新增：采集动作**
function gatherAction() {
    if (inCombat) return;

    const tile = getTile(player.x, player.y);
    const biomeData = BIOMES[tile.type];
    
    if (Math.random() > 0.5) {
        const item = biomeData.resources[Math.floor(Math.random() * biomeData.resources.length)];
        addItem(item, 1);
        log(`🌳 采集获得: [${item}] +1`);
    } else {
        log("你四处搜寻，但一无所获。");
    }
    
    player.hunger = Math.max(0, player.hunger - 2);
    passTime();
    updateUI();
}

// **新增：搜索/攻击动作 (进入战斗)**
function searchAction() {
    if (inCombat) return;
    
    const tile = getTile(player.x, player.y);
    const biomeData = BIOMES[tile.type];

    // 随机遭遇生物
    if (Math.random() > 0.4) {
        const mobName = biomeData.mobs[Math.floor(Math.random() * biomeData.mobs.length)];
        const stats = biomeData.mobStats[mobName];

        currentEnemy = {
            name: mobName,
            hp: stats.hp,
            dmg: stats.dmg
        };
        
        enterCombat();
    } else {
        log("⚔️ 你仔细搜索了周围，没有发现任何生物。");
        player.hunger = Math.max(0, player.hunger - 1);
        passTime();
        updateUI();
    }
}

// **新增：进入战斗UI**
function enterCombat() {
    inCombat = true;
    document.getElementById('main-game-container').classList.add('hidden');
    document.getElementById('combat-ui').classList.remove('hidden');

    combatLog(`你遭遇了可怕的 ${currentEnemy.name}! 战斗开始!`);
    updateCombatUI();
}

// **新增：退出战斗UI**
function exitCombat() {
    inCombat = false;
    currentEnemy = null;
    document.getElementById('main-game-container').classList.remove('hidden');
    document.getElementById('combat-ui').classList.add('hidden');
    updateUI(); // 确保主界面状态刷新
}

// **新增：玩家攻击逻辑**
function playerAttack() {
    if (!inCombat) return;

    // 玩家伤害计算 (简单随机)
    const playerDmg = PLAYER_BASE_DMG + Math.floor(Math.random() * 5);
    currentEnemy.hp -= playerDmg;
    combatLog(`你攻击了 ${currentEnemy.name}，造成了 ${playerDmg} 点伤害。`);

    if (currentEnemy.hp <= 0) {
        combatLog(`🎉 恭喜你，击败了 ${currentEnemy.name}!`);
        log(`你击败了 ${currentEnemy.name}，获得了经验！`);
        // 战利品/经验逻辑可以加在这里
        exitCombat();
        return;
    }

    // 怪物反击
    setTimeout(enemyAttack, 1000); // 延迟反击，让玩家看清伤害
    updateCombatUI();
}

// **新增：怪物攻击逻辑**
function enemyAttack() {
    if (!inCombat) return;

    const enemyDmg = currentEnemy.dmg + Math.floor(Math.random() * 3);
    player.hp -= enemyDmg;
    combatLog(`${currentEnemy.name} 反击，对你造成了 ${enemyDmg} 点伤害。`);

    if (player.hp <= 0) {
        combatLog(`☠️ 你被 ${currentEnemy.name} 击败了... 游戏结束!`);
        log(`☠️ 你死了。`);
        exitCombat();
        return;
    }
    updateCombatUI();
}

// **新增：逃跑逻辑**
function runAway() {
    if (!inCombat) return;
    
    if (Math.random() > 0.5) {
        combatLog("你成功逃离了战斗!");
        log("你成功逃跑了。");
        exitCombat();
    } else {
        combatLog("逃跑失败! 怪物发起攻击!");
        enemyAttack(); // 失败则被攻击一次
    }
}

// **新增：战斗日志**
function combatLog(msg) {
    const logEl = document.getElementById('combat-log');
    const p = document.createElement('p');
    p.innerText = `> ${msg}`;
    logEl.appendChild(p);
    // 自动滚到底部
    logEl.scrollTop = logEl.scrollHeight;
}

// **新增：更新战斗UI**
function updateCombatUI() {
    document.getElementById('combat-player-hp').innerText = Math.max(0, player.hp);
    document.getElementById('combat-enemy-name').innerText = currentEnemy.name;
    document.getElementById('combat-enemy-hp').innerText = Math.max(0, currentEnemy.hp);
}

// ----------------------------------------------------
// --- 主UI渲染 (更新整合) ---
// ----------------------------------------------------

function updateUI() {
    // 状态更新
    document.getElementById('hp').innerText = player.hp;
    document.getElementById('hunger').innerText = player.hunger;
    document.getElementById('time').innerText = gameTime < 12 ? "白天" : "黑夜";
    document.getElementById('coord-x').innerText = player.x;
    document.getElementById('coord-y').innerText = player.y;
    document.getElementById('biome').innerText = BIOMES[getTile(player.x, player.y).type].name;

    // 地图渲染 (保持不变)
    const mapEl = document.getElementById('grid-map');
    mapEl.innerHTML = '';
    const viewDistance = isMapEnlarged ? 6 : 3;
    const gridSize = viewDistance * 2 + 1;
    mapEl.style.gridTemplateColumns = `repeat(${gridSize}, 24px)`;
    mapEl.style.gridTemplateRows = `repeat(${gridSize}, 24px)`;

    for (let y = player.y - viewDistance; y <= player.y + viewDistance; y++) {
        for (let x = player.x - viewDistance; x <= player.x + viewDistance; x++) {
            const cell = document.createElement('div');
            const tile = getTile(x, y);
            
            if (!tile.explored) {
                cell.className = 'cell fog';
                cell.innerText = '?';
            } else {
                cell.className = `cell ${BIOMES[tile.type].color} explored`;
                cell.innerText = BIOMES[tile.type].name[0];
                
                if (x === player.x && y === player.y) {
                    cell.classList.add('player');
                    cell.innerText = '我';
                }
            }
            mapEl.appendChild(cell);
        }
    }

    // 背包更新 (保持不变)
    const invEl = document.getElementById('inv-list');
    invEl.innerHTML = Object.entries(player.inventory).map(([k,v]) => `<span>${k} x${v}</span>`).join('');
}


// 启动游戏
initGame();

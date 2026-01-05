// --- 1. 游戏配置与数据 ---
const MAP_SIZE = 20;

// 地形与掉落配置
const BIOMES = {
    PLAINS: { name: "草原", code: "bg-PLAINS", res: ["杂草", "野花", "木棍"], mobs: [{name:"野兔", hp:20, atk:2, loot:"生兔肉"}, {name:"僵尸", hp:50, atk:8, loot:"腐肉"}] },
    FOREST: { name: "森林", code: "bg-FOREST", res: ["原木", "木棍", "浆果"], mobs: [{name:"狼", hp:40, atk:5, loot:"皮革"}, {name:"骷髅", hp:45, atk:10, loot:"骨头"}] },
    DESERT: { name: "沙漠", code: "bg-DESERT", res: ["沙子", "仙人掌", "枯木"], mobs: [{name:"毒蝎", hp:30, atk:12, loot:"毒囊"}] },
    MOUNTAIN: { name: "山脉", code: "bg-MOUNTAIN", res: ["石头", "铁矿石", "煤炭"], mobs: [{name:"山羊", hp:60, atk:6, loot:"羊肉"}] },
    SNOWY: { name: "雪原", code: "bg-SNOWY", res: ["冰块", "雪球", "原木"], mobs: [{name:"流浪者", hp:60, atk:9, loot:"冰凌"}] },
    OCEAN: { name: "海洋", code: "bg-OCEAN", res: ["水", "生鱼"], mobs: [{name:"溺尸", hp:55, atk:8, loot:"三叉戟碎片"}] },
    SWAMP: { name: "沼泽", code: "bg-SWAMP", res: ["粘土", "藤蔓"], mobs: [{name:"史莱姆", hp:25, atk:4, loot:"粘液球"}] },
    MESA: { name: "恶地", code: "bg-MESA", res: ["红沙", "金矿石"], mobs: [{name:"巨型蜘蛛", hp:70, atk:12, loot:"蛛丝"}] }
};

// 合成配方
const RECIPES = [
    { name: "木斧", req: { "木棍": 2, "原木": 3 }, desc: "基础工具，暂无实际加成" },
    { name: "石剑", req: { "木棍": 1, "石头": 2 }, desc: "攻击力+5", effect: "atk", val: 5 },
    { name: "烤肉", req: { "生兔肉": 1, "木棍": 1 }, desc: "恢复 30 饥饿", effect: "food", val: 30 },
    { name: "篝火", req: { "原木": 4, "石头": 4 }, desc: "恢复理智与体温" },
    { name: "绷带", req: { "杂草": 5 }, desc: "恢复 20 HP", effect: "heal", val: 20 }
];

// 玩家状态
let player = { 
    x: 10, y: 10, 
    hp: 100, maxHp: 100, 
    hunger: 100, maxHunger: 100,
    water: 100, maxWater: 100,
    atk: 5, // 基础攻击力
    inventory: {} // 背包: { "原木": 10, "石头": 2 }
};

let gameTime = { day: 1, hour: 8 }; // 第1天 8点
let exploredMap = {}; 
let currentSceneItems = [];

// --- 2. 核心系统：时间与状态 ---

function passTime(hours) {
    gameTime.hour += hours;
    
    // 饥饿与水分消耗
    player.hunger = Math.max(0, player.hunger - (2 * hours));
    player.water = Math.max(0, player.water - (3 * hours));

    // 状态惩罚
    if (player.hunger === 0 || player.water === 0) {
        player.hp = Math.max(0, player.hp - 5);
        log("你感到饥渴难耐，生命值正在流逝...", "red");
    }

    // 昼夜循环 (24小时制)
    if (gameTime.hour >= 24) {
        gameTime.hour -= 24;
        gameTime.day += 1;
        log(`=== 第 ${gameTime.day} 天开始了 ===`);
    }

    // 渲染时间与昼夜视觉
    document.getElementById('clock-time').innerText = `${String(gameTime.hour).padStart(2, '0')}:00`;
    updateDayNightCycle();
    updateStatsUI();
}

function updateDayNightCycle() {
    const body = document.body;
    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
    if (isNight) {
        if (!body.classList.contains('night-mode')) {
            body.classList.add('night-mode');
            log("夜幕降临了，危险正在逼近...", "purple");
        }
    } else {
        if (body.classList.contains('night-mode')) {
            body.classList.remove('night-mode');
            log("天亮了。", "orange");
        }
    }
}

// --- 3. 核心系统：移动与地图 ---

function move(dx, dy) {
    if (player.hp <= 0) return log("你已经倒下了，请刷新重来。", "red");

    const newX = player.x + dx;
    const newY = player.y + dy;

    if (newX < 0 || newX >= MAP_SIZE || newY < 0 || newY >= MAP_SIZE) {
        return log("前方是世界的尽头。");
    }

    player.x = newX;
    player.y = newY;
    
    passTime(1); // 移动消耗1小时
    refreshLocation();
}

function getBiome(x, y) {
    // 简单的伪随机地图生成
    const keys = Object.keys(BIOMES);
    const hash = Math.abs((x * 37 + y * 13) % keys.length);
    return keys[hash];
}

// --- 4. 核心系统：交互与战斗 ---

// 生成资源和怪物
function generateScene(biomeKey) {
    currentSceneItems = [];
    const biome = BIOMES[biomeKey];
    
    // 生成资源 (3-6个)
    const resCount = 3 + Math.floor(Math.random() * 4);
    for(let i=0; i<resCount; i++) {
        const name = biome.res[Math.floor(Math.random() * biome.res.length)];
        currentSceneItems.push({ type: 'res', name: name, count: Math.floor(Math.random()*3)+1 });
    }

    // 生成怪物 (概率生成)
    if (Math.random() > 0.3) {
        const mobTemplate = biome.mobs[Math.floor(Math.random() * biome.mobs.length)];
        // 复制一份怪物数据，避免修改原板
        currentSceneItems.push({ 
            type: 'mob', 
            name: mobTemplate.name, 
            hp: mobTemplate.hp, 
            maxHp: mobTemplate.hp,
            atk: mobTemplate.atk,
            loot: mobTemplate.loot
        });
    }
}

// 渲染中间的按钮
function renderScene() {
    const grid = document.getElementById('scene-grid');
    grid.innerHTML = '';
    
    currentSceneItems.forEach((item, index) => {
        const btn = document.createElement('div');
        btn.className = `grid-btn ${item.type}`;
        
        if (item.type === 'res') {
            btn.innerText = `${item.name} (${item.count})`;
            btn.onclick = () => collectResource(index, btn);
        } else {
            btn.innerText = `${item.name} [HP:${item.hp}]`;
            btn.classList.add('mob'); // 红色样式
            btn.onclick = () => combatRound(index, btn);
        }
        grid.appendChild(btn);
    });
}

// 采集资源
function collectResource(index, btn) {
    const item = currentSceneItems[index];
    if (!item) return;
    
    addItemToInventory(item.name, item.count);
    log(`采集获得: ${item.name} x${item.count}`);
    
    // 移除物品
    currentSceneItems.splice(index, 1);
    renderScene(); // 重新渲染列表
}

// 战斗逻辑
function combatRound(index, btn) {
    const mob = currentSceneItems[index];
    if (!mob) return;

    // 玩家攻击
    const dmgToMob = player.atk + Math.floor(Math.random() * 3);
    mob.hp -= dmgToMob;
    log(`你攻击了 ${mob.name}，造成 ${dmgToMob} 点伤害。`);

    if (mob.hp <= 0) {
        log(`你击败了 ${mob.name}！获得战利品: ${mob.loot}`, "green");
        addItemToInventory(mob.loot, 1);
        currentSceneItems.splice(index, 1);
        renderScene();
        return;
    }

    // 怪物反击
    const dmgToPlayer = Math.max(0, mob.atk - Math.floor(Math.random())); // 简单减伤
    player.hp -= dmgToPlayer;
    updateStatsUI();
    log(`${mob.name} 反击了你，造成 ${dmgToPlayer} 点伤害！`, "red");
    
    if (player.hp <= 0) {
        log("你被击败了... 视野逐渐模糊...", "red");
        grid.innerHTML = "<h1>GAME OVER</h1>";
        return;
    }

    // 更新按钮显示的血量
    btn.innerText = `${mob.name} [HP:${mob.hp}]`;
    btn.classList.add('shake'); // 可以加个震动CSS动画
    setTimeout(() => btn.classList.remove('shake'), 200);
}

// --- 5. 核心系统：背包与合成 ---

function addItemToInventory(name, count) {
    if (!player.inventory[name]) player.inventory[name] = 0;
    player.inventory[name] += count;
}

function updateInventoryUI() {
    const list = document.getElementById('inventory-list');
    list.innerHTML = '';
    
    if (Object.keys(player.inventory).length === 0) {
        list.innerHTML = '<div style="padding:10px;color:#999">背包是空的</div>';
        return;
    }

    for (let [name, count] of Object.entries(player.inventory)) {
        if (count > 0) {
            const row = document.createElement('div');
            row.className = 'list-item';
            row.innerHTML = `<span>${name}</span> <b>x${count}</b>`;
            
            // 如果是食物或药，添加“使用”按钮
            if (["烤肉", "绷带", "浆果", "生鱼", "羊肉"].includes(name)) {
                const useBtn = document.createElement('button');
                useBtn.innerText = "使用";
                useBtn.onclick = () => useItem(name);
                row.appendChild(useBtn);
            }
            list.appendChild(row);
        }
    }
}

function useItem(name) {
    if (player.inventory[name] <= 0) return;
    
    if (name === "烤肉" || name === "生鱼" || name === "羊肉") {
        player.hunger = Math.min(player.maxHunger, player.hunger + 30);
        log(`吃了${name}，饱食度恢复了。`);
    } else if (name === "绷带") {
        player.hp = Math.min(player.maxHp, player.hp + 20);
        log(`使用了绷带，生命值恢复了。`);
    } else if (name === "浆果") {
        player.hunger = Math.min(player.maxHunger, player.hunger + 5);
        log(`吃了小浆果，稍微不那么饿了。`);
    }
    
    player.inventory[name]--;
    updateStatsUI();
    updateInventoryUI();
}

function updateCraftUI() {
    const list = document.getElementById('craft-list');
    list.innerHTML = '';

    RECIPES.forEach(recipe => {
        const row = document.createElement('div');
        row.className = 'list-item';
        
        // 生成材料需求字符串
        let reqStr = [];
        let canCraft = true;
        for (let [mat, qty] of Object.entries(recipe.req)) {
            const has = player.inventory[mat] || 0;
            reqStr.push(`${mat} ${has}/${qty}`);
            if (has < qty) canCraft = false;
        }

        row.innerHTML = `
            <div>
                <div style="font-weight:bold">${recipe.name}</div>
                <div style="font-size:10px;color:#666">${recipe.desc}</div>
                <div style="font-size:10px;color:#d35400">需: ${reqStr.join(', ')}</div>
            </div>
        `;

        const btn = document.createElement('button');
        btn.innerText = "制作";
        btn.disabled = !canCraft;
        if (!canCraft) btn.style.background = "#ccc";
        
        btn.onclick = () => craftItem(recipe);
        
        row.appendChild(btn);
        list.appendChild(row);
    });
}

function craftItem(recipe) {
    // 扣除材料
    for (let [mat, qty] of Object.entries(recipe.req)) {
        player.inventory[mat] -= qty;
    }
    
    // 获得物品
    addItemToInventory(recipe.name, 1);
    
    // 触发效果 (装备直接生效)
    if (recipe.effect === 'atk') {
        player.atk += recipe.val;
        log(`制作了 ${recipe.name}，攻击力提升至 ${player.atk}！`, "gold");
    } else {
        log(`制作成功: ${recipe.name}`);
    }
    
    updateInventoryUI();
    updateCraftUI();
}

// --- 6. 辅助功能与UI ---

function refreshLocation() {
    // 探索记录
    exploredMap[`${player.x},${player.y}`] = true;
    
    // 更新UI文本
    const biomeKey = getBiome(player.x, player.y);
    const biome = BIOMES[biomeKey];
    
    document.getElementById('loc-name').innerText = biome.name;
    document.getElementById('coord').innerText = `${player.x},${player.y}`;
    
    // 生成新场景
    generateScene(biomeKey);
    renderScene();
    
    // 更新小地图文字
    updateMiniMap();
    
    // 如果大地图开着，刷新它
    if (!document.getElementById('map-modal').classList.contains('hidden')) {
        renderBigMap();
    }
}

function updateStatsUI() {
    document.getElementById('hp').innerText = player.hp;
    document.getElementById('hunger').innerText = player.hunger;
    document.getElementById('water').innerText = player.water;
}

function switchView(viewName) {
    // 隐藏所有
    document.getElementById('scene-view').classList.add('hidden');
    document.getElementById('inventory-view').classList.add('hidden');
    document.getElementById('craft-view').classList.add('hidden');
    
    // 底部导航样式重置
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    // 显示目标
    if (viewName === 'scene') {
        document.getElementById('scene-view').classList.remove('hidden');
        document.querySelectorAll('.bottom-nav .nav-item')[2].classList.add('active');
    } else if (viewName === 'inventory') {
        updateInventoryUI();
        document.getElementById('inventory-view').classList.remove('hidden');
        document.querySelectorAll('.bottom-nav .nav-item')[0].classList.add('active');
    } else if (viewName === 'craft') {
        updateCraftUI();
        document.getElementById('craft-view').classList.remove('hidden');
        document.querySelectorAll('.bottom-nav .nav-item')[1].classList.add('active');
    }
}

function log(msg, color="black") {
    const el = document.getElementById('game-log');
    const p = document.createElement('p');
    p.innerText = `> ${msg}`;
    if(color !== "black") p.style.color = color;
    el.prepend(p);
}

// --- 7. 地图功能 (保持不变，适配新逻辑) ---

function openMap() { document.getElementById('map-modal').classList.remove('hidden'); renderBigMap(); }
function closeMap() { document.getElementById('map-modal').classList.add('hidden'); }

function updateMiniMap() {
    const getBName = (x, y) => {
        if (x < 0 || x >= MAP_SIZE || y < 0 || y >= MAP_SIZE) return "边界";
        return BIOMES[getBiome(x, y)].name;
    };
    document.getElementById('dir-n').innerText = getBName(player.x, player.y - 1);
    document.getElementById('dir-s').innerText = getBName(player.x, player.y + 1);
    document.getElementById('dir-w').innerText = getBName(player.x - 1, player.y);
    document.getElementById('dir-e').innerText = getBName(player.x + 1, player.y);
}

function renderBigMap() {
    const mapEl = document.getElementById('big-grid');
    if (!mapEl) return;
    mapEl.innerHTML = '';
    mapEl.style.gridTemplateColumns = `repeat(${MAP_SIZE}, 1fr)`;
    mapEl.style.gridTemplateRows = `repeat(${MAP_SIZE}, 1fr)`;
    
    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            const cell = document.createElement('div');
            const key = `${x},${y}`;
            
            if (exploredMap[key]) {
                const type = getBiome(x, y);
                cell.className = `map-cell ${BIOMES[type].code}`;
                cell.innerText = BIOMES[type].name.substring(0, 2);
            } else {
                cell.className = 'map-cell fog';
                cell.innerText = '';
            }

            if (x === player.x && y === player.y) {
                cell.classList.add('player');
                cell.innerText = "我";
            }
            mapEl.appendChild(cell);
        }
    }
}

// 探索按钮功能
window.search = function() {
    passTime(2); // 探索消耗2小时
    refreshLocation();
    log("你在原地仔细搜索了一番...");
}

// --- 初始化 ---
function init() {
    // 给玩家初始物品
    addItemToInventory("烤肉", 2);
    addItemToInventory("绷带", 1);
    
    refreshLocation();
    updateStatsUI();
    updateDayNightCycle();
    log("欢迎来到荒野求生。时刻注意你的饥饿度！");
}

init();

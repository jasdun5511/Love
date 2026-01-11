// ==========================================
// 逻辑内核 (Script.js) - 终极整合版
// ==========================================

// --- 1. 游戏状态 (State) ---
let player = { 
    x: 10, y: 10, 
    hp: 100, maxHp: 100, 
    hunger: 100, maxHunger: 100,
    water: 100, maxWater: 100,
    sanity: 100, maxSanity: 100,
    atk: 5, 
    level: 1,
    exp: 0,
    maxExp: 10,
    statPoints: 0,
    equipWeapon: null,
    equipArmor: null,
    inventory: {},
    home: null 
};

let gameTime = { day: 1, hour: 8 };
let currentSceneItems = [];
let currentEnemy = null; 
let currentInvFilter = 'all';
let currentCraftFilter = 'all';

// --- 2. 静态数据 (交易与辅助) ---
const TRADES = [
    { in: "绿宝石", cost: 1, out: "面包", count: 3 },
    { in: "绿宝石", cost: 1, out: "煤炭", count: 4 },
    { in: "绿宝石", cost: 6, out: "铁剑", count: 1 },
    { in: "煤炭", cost: 8, out: "绿宝石", count: 1 },
    { in: "金锭", cost: 1, out: "绿宝石", count: 1 }
];

const WOOD_TYPES = ["橡木原木", "云杉原木", "深色橡木", "金合欢原木"];
const FLOWER_TYPES = ["蒲公英", "兰花", "虞美人"]; 

// --- 3. 基础逻辑 (地图/建筑) ---
let currentDimension = "OVERWORLD";
let exploredMapMain = {};   
let exploredMapNether = {}; 
let buildingsMain = {};     
let buildingsNether = {};
let playerPosMain = {x: 10, y: 10};
let playerPosNether = {x: 10, y: 10}; 

function getCurrBuildings() { return currentDimension === "OVERWORLD" ? buildingsMain : buildingsNether; }
function getCurrExplored() { return currentDimension === "OVERWORLD" ? exploredMapMain : exploredMapNether; }

function hasStation(stationType) {
    const key = `${player.x},${player.y}`;
    const buildings = getCurrBuildings()[key] || [];
    if (stationType === 'workbench') return buildings.some(b => b.name === '工作台');
    if (stationType === 'furnace') return buildings.some(b => b.name === '熔炉');
    return false;
}

// --- 4. 核心功能：升级与属性 ---
function addExp(amount) {
    player.exp += amount;
    player.maxExp = player.level * 10;
    if (player.exp >= player.maxExp) {
        player.exp -= player.maxExp;
        player.level++;
        player.statPoints++;
        log(`✨ 升级了！Lv.${player.level}，获得1点属性点。`, "gold");
        player.hp = player.maxHp; // 升级回满血
        updateStatsUI();
        addExp(0); 
    }
}

function addPoint(type) {
    if (player.statPoints <= 0) return;
    if (type === 'hp') { player.maxHp += 5; player.hp += 5; }
    else if (type === 'hunger') { player.maxHunger += 5; player.hunger += 5; }
    else if (type === 'water') { player.maxWater += 5; player.water += 5; }
    player.statPoints--;
    updateStatsUI();
    renderStatsTab();
}

// --- 5. 生存系统 (时间/移动) ---
function passTime(hours) {
    gameTime.hour += hours;
    player.hunger = Math.max(0, player.hunger - (2 * hours));
    player.water = Math.max(0, player.water - (3 * hours));
    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
    if (isNight) player.sanity = Math.max(0, player.sanity - (3 * hours));
    if (player.hunger === 0 || player.water === 0) player.hp = Math.max(0, player.hp - 5);
    if (gameTime.hour >= 24) { gameTime.hour -= 24; gameTime.day++; log(`=== 第 ${gameTime.day} 天 ===`); }
    document.getElementById('clock-time').innerText = `${String(gameTime.hour).padStart(2, '0')}:00`;
    updateDayNightCycle();
    updateStatsUI();
}

function updateDayNightCycle() { document.body.classList.toggle('night-mode', gameTime.hour >= 20 || gameTime.hour < 6); }

function move(dx, dy) {
    if (player.hp <= 0) return;
    const newX = player.x + dx, newY = player.y + dy;
    if (newX < 0 || newX >= MAP_SIZE || newY < 0 || newY >= MAP_SIZE) return;
    player.x = newX; player.y = newY;
    passTime(1); refreshLocation();
}

// --- 6. 地形与场景生成 ---
function getBiome(x, y) {
    const keys = ["PLAINS", "FOREST", "DESERT", "MOUNTAIN", "SNOWY", "OCEAN", "SWAMP", "MESA", "VILLAGE"];
    return keys[Math.abs((x * 37 + y * 13) % keys.length)];
}

function generateScene(biomeKey) {
    currentSceneItems = [];
    const biome = BIOMES[biomeKey];
    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
    // 生成资源
    for(let i=0; i < (3 + Math.floor(Math.random()*4)); i++) {
        currentSceneItems.push({ type: 'res', name: biome.res[Math.floor(Math.random()*biome.res.length)], count: Math.floor(Math.random()*3)+1 });
    }
    // 生成生物
    if (Math.random() < (isNight ? 0.8 : 0.4)) {
        const mobTemplate = biome.mobs[Math.floor(Math.random()*biome.mobs.length)];
        const dist = Math.abs(player.x - 10) + Math.abs(player.y - 10);
        let mobLevel = Math.max(1, player.level + Math.floor(dist/10) - 1 + Math.floor(Math.random()*3));
        currentSceneItems.push({ 
            type: 'mob', name: mobTemplate.name, level: mobLevel,
            hp: mobTemplate.hp + (mobLevel*5), maxHp: mobTemplate.hp + (mobLevel*5),
            atk: mobTemplate.atk + Math.floor(mobLevel*0.5), loot: mobTemplate.loot 
        });
    }
}

function renderScene() {
    const grid = document.getElementById('scene-grid');
    grid.innerHTML = '';
    // 渲染建筑
    const key = `${player.x},${player.y}`;
    (getCurrBuildings()[key] || []).forEach((b, idx) => {
        const btn = document.createElement('div');
        btn.className = 'grid-btn build';
        btn.innerText = `📦 ${b.name}`;
        btn.onclick = () => openBuilding(b, idx);
        grid.appendChild(btn);
    });
    // 渲染物品/生物
    currentSceneItems.forEach((item, index) => {
        const btn = document.createElement('div');
        btn.className = `grid-btn ${item.type}`;
        if (item.name === "村民") {
            btn.innerHTML = `👨‍🌾 村民`; btn.style.color = "#27ae60";
            btn.onclick = () => openTrading();
        } else if (item.type === 'res') {
            btn.innerHTML = `${item.name} (${item.count})`;
            btn.onclick = () => collectResource(index);
        } else {
            btn.innerHTML = `${item.name} <span class='lv-tag'>Lv.${item.level}</span>`;
            btn.onclick = () => startCombat(item, index);
        }
        grid.appendChild(btn);
    });
}

// --- 7. 采集与战斗 ---
function collectResource(index) {
    const item = currentSceneItems[index];
    if (item.name === "水" || item.name === "岩浆源") {
        if (!player.inventory["铁桶"]) return log("你需要铁桶！", "red");
        player.inventory["铁桶"]--;
        addItemToInventory(item.name === "水" ? "水" : "岩浆桶", 1);
    } else {
        const HARD = ["铁矿石", "煤炭", "钻石矿"];
        if (HARD.includes(item.name) && !player.equipWeapon?.includes("镐")) return log("需要镐子！", "red");
        addItemToInventory(item.name, 1);
    }
    if (FLOWER_TYPES.includes(item.name)) player.sanity = Math.min(100, player.sanity + 10);
    addExp(1);
    item.count--;
    if (item.count <= 0) currentSceneItems.splice(index, 1);
    updateStatsUI(); renderScene(); updateInventoryUI();
}

function startCombat(mob, index) {
    currentEnemy = mob; currentEnemy.index = index;
    switchView('combat');
    document.getElementById('enemy-name').innerHTML = `${mob.name} Lv.${mob.level}`;
    updateCombatUI();
}

function combatAttack() {
    const pDmg = player.atk + Math.floor(Math.random()*3);
    currentEnemy.hp -= pDmg;
    if (currentEnemy.hp <= 0) {
        const exp = 5 + currentEnemy.level * 2;
        log(`胜！获得 ${currentEnemy.loot}, EXP+${exp}`, "gold");
        addItemToInventory(currentEnemy.loot, 1); addExp(exp);
        currentSceneItems.splice(currentEnemy.index, 1);
        switchView('scene'); renderScene(); return;
    }
    player.hp -= Math.max(1, currentEnemy.atk);
    if (player.hp <= 0) die();
    updateStatsUI(); updateCombatUI();
}

// --- 8. 全屏背包与属性逻辑 ---
function switchInvTab(tab) {
    document.querySelectorAll('.inv-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.inv-content').forEach(c => c.classList.add('hidden'));
    if (tab === 'stats') {
        document.querySelectorAll('.inv-tab-btn')[0].classList.add('active');
        document.getElementById('inv-tab-stats').classList.remove('hidden');
        renderStatsTab();
    } else {
        document.querySelectorAll('.inv-tab-btn')[1].classList.add('active');
        document.getElementById('inv-tab-equip').classList.remove('hidden');
        renderEquipTab();
    }
}

function renderStatsTab() {
    document.getElementById('stat-lv').innerText = player.level;
    document.getElementById('stat-exp').innerText = player.exp;
    document.getElementById('stat-max-exp').innerText = player.maxExp;
    document.getElementById('stat-points').innerText = player.statPoints;
    document.getElementById('stat-exp-bar').style.width = `${(player.exp/player.maxExp)*100}%`;
    document.getElementById('val-hp').innerText = player.hp;
    document.getElementById('val-max-hp').innerText = player.maxHp;
    document.getElementById('val-max-hunger').innerText = player.maxHunger;
    document.getElementById('val-max-water').innerText = player.maxWater;
    document.getElementById('val-atk').innerText = player.atk;
    document.getElementById('val-sanity').innerText = player.sanity;
    document.querySelectorAll('.plus-btn').forEach(b => b.classList.toggle('active', player.statPoints > 0));
}

function renderEquipTab() {
    document.getElementById('slot-weapon').innerText = player.equipWeapon || "无";
    document.getElementById('slot-armor').innerText = player.equipArmor || "无";
    const list = document.getElementById('inventory-list');
    list.innerHTML = '';
    Object.entries(player.inventory).forEach(([name, count]) => {
        const row = document.createElement('div');
        row.className = 'list-item';
        const isEquip = name.includes("剑") || name.includes("甲") || name.includes("镐");
        row.innerHTML = `<span>${name} x${count}</span> 
            <button onclick="${isEquip?'equipItem':'useItem'}('${name}')">${isEquip?'装备':'使用'}</button>`;
        list.appendChild(row);
    });
}

function equipItem(name) {
    const r = RECIPES.find(x => x.name === name);
    if (name.includes("剑") || name.includes("镐")) {
        if (player.equipWeapon) addItemToInventory(player.equipWeapon, 1);
        player.equipWeapon = name; player.atk = 5 + (r?.val || 2);
    } else {
        if (player.equipArmor) addItemToInventory(player.equipArmor, 1);
        player.equipArmor = name;
    }
    player.inventory[name]--; if(player.inventory[name]<=0) delete player.inventory[name];
    renderEquipTab(); updateStatsUI();
}

// --- 9. 制作与系统 ---
function craftItem(recipe) {
    if (recipe.station === 'workbench' && !hasStation('workbench')) return log("需工作台");
    for (let [m, q] of Object.entries(recipe.req)) {
        if ((player.inventory[m]||0) < q) return log("材料不足");
    }
    for (let [m, q] of Object.entries(recipe.req)) {
        player.inventory[m] -= q; if(player.inventory[m]<=0) delete player.inventory[m];
    }
    addItemToInventory(recipe.name, recipe.count || 1);
    updateCraftUI(); updateInventoryUI(); log(`制作成功: ${recipe.name}`);
}

const SAVE_KEY = "mc_text_survival_save_v1";
function saveGame() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({player, gameTime, currentDimension, exploredMapMain, buildingsMain}));
    log("进度已保存", "green"); alert("存档成功");
}
function loadGame() {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY));
    if(!d) return alert("无存档");
    player = d.player; gameTime = d.gameTime; 
    exploredMapMain = d.exploredMapMain; buildingsMain = d.buildingsMain;
    refreshLocation(); updateStatsUI(); switchView('scene');
}

// --- 10. 初始化 ---
function switchView(v) {
    ['scene','inventory','craft','combat','trade','system'].forEach(id => document.getElementById(id+'-view')?.classList.add('hidden'));
    document.getElementById(v+'-view')?.classList.remove('hidden');
    if (v === 'inventory') renderStatsTab();
    if (v === 'craft') updateCraftUI();
}

function refreshLocation() {
    const biome = getBiome(player.x, player.y);
    document.getElementById('loc-name').innerText = BIOMES[biome].name;
    document.getElementById('coord').innerText = `${player.x},${player.y}`;
    generateScene(biome); renderScene();
}

function updateStatsUI() {
    document.getElementById('hp').innerText = player.hp;
    document.getElementById('hunger').innerText = player.hunger;
    document.getElementById('water').innerText = player.water;
    document.getElementById('sanity').innerText = player.sanity;
}

function addItemToInventory(n, c) { player.inventory[n] = (player.inventory[n]||0) + c; }
function log(m, c) { const p = document.createElement('p'); p.innerText = "> " + m; if(c) p.style.color=c; document.getElementById('game-log').prepend(p); }
function die() { alert("死亡！"); location.reload(); }

function init() {
    addItemToInventory("木剑", 1);
    addItemToInventory("面包", 5);
    refreshLocation(); updateStatsUI();
    log("RPG生存系统启动。点击左下角背包加点！");
}

init();

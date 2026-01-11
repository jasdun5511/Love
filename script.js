// ==========================================
// 逻辑内核 (Script.js) - RPG 增强版
// ==========================================

// --- 游戏状态 (State) ---
let player = { 
    x: 10, y: 10, 
    hp: 100, maxHp: 100, 
    hunger: 100, maxHunger: 100,
    water: 100, maxWater: 100,
    sanity: 100, maxSanity: 100,
    atk: 5, 
    // 【新增】RPG系统属性
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

// 状态变量
let currentInvFilter = 'all';
let currentCraftFilter = 'all';

// --- 交易数据表 ---
const TRADES = [
    { in: "绿宝石", cost: 1, out: "面包", count: 3, desc: "买食物" },
    { in: "绿宝石", cost: 1, out: "煤炭", count: 4, desc: "买燃料" },
    { in: "绿宝石", cost: 3, out: "熟牛肉", count: 2, desc: "大餐" },
    { in: "绿宝石", cost: 2, out: "铁镐", count: 1, desc: "现成的工具" },
    { in: "绿宝石", cost: 6, out: "铁剑", count: 1, desc: "防身武器" },
    { in: "绿宝石", cost: 2, out: "水瓶", count: 1, desc: "解渴" },
    { in: "煤炭", cost: 8, out: "绿宝石", count: 1, desc: "出售煤炭" },
    { in: "小麦种子", cost: 12, out: "绿宝石", count: 1, desc: "出售种子" },
    { in: "腐肉", cost: 8, out: "绿宝石", count: 1, desc: "出售腐肉" },
    { in: "金锭", cost: 1, out: "绿宝石", count: 1, desc: "金锭兑换" }
];

// --- 世界状态 ---
let currentDimension = "OVERWORLD";
let exploredMapMain = {};   
let exploredMapNether = {}; 
let buildingsMain = {};     
let buildingsNether = {};
let playerPosMain = {x: 10, y: 10};
let playerPosNether = {x: 10, y: 10}; 

function getCurrBuildings() { return currentDimension === "OVERWORLD" ? buildingsMain : buildingsNether; }
function getCurrExplored() { return currentDimension === "OVERWORLD" ? exploredMapMain : exploredMapNether; }

// --- 辅助函数：通用材料组 ---
const WOOD_TYPES = ["橡木原木", "云杉原木"];
const FLOWER_TYPES = ["蒲公英", "兰花", "虞美人"]; 

function getInvCount(name) {
    if (name === "原木") {
        let total = 0;
        WOOD_TYPES.forEach(w => total += (player.inventory[w] || 0));
        return total;
    }
    if (name === "花") {
        let total = 0;
        FLOWER_TYPES.forEach(f => total += (player.inventory[f] || 0));
        return total;
    }
    return player.inventory[name] || 0;
}

function consumeInvItem(name, qty) {
    let types = [];
    if (name === "原木") types = WOOD_TYPES;
    else if (name === "花") types = FLOWER_TYPES;
    else {
        player.inventory[name] -= qty;
        if (player.inventory[name] <= 0) delete player.inventory[name];
        return;
    }
    let needed = qty;
    for (let t of types) {
        if (needed <= 0) break;
        if (player.inventory[t] > 0) {
            let take = Math.min(player.inventory[t], needed);
            player.inventory[t] -= take;
            needed -= take;
            if (player.inventory[t] <= 0) delete player.inventory[t];
        }
    }
}

function hasStation(stationType) {
    const key = `${player.x},${player.y}`;
    const buildings = getCurrBuildings()[key] || [];
    if (stationType === 'workbench') return buildings.some(b => b.name === '工作台');
    if (stationType === 'furnace') return buildings.some(b => b.name === '熔炉');
    return false;
}

// ==========================================
// 【新增模块】RPG 升级与属性逻辑
// ==========================================

function addExp(amount) {
    player.exp += amount;
    player.maxExp = player.level * 10;
    
    if (player.exp >= player.maxExp) {
        player.exp -= player.maxExp;
        player.level++;
        player.statPoints++; // 每次升级获得属性点
        player.maxExp = player.level * 10;
        log(`恭喜！你升到了 Lv.${player.level}，获得 1 点属性点！`, "gold");
        player.hp = player.maxHp; // 升级回满血
        updateStatsUI();
        addExp(0); // 递归检查是否连升两级
    }
}

function addPoint(type) {
    if (player.statPoints <= 0) return;
    if (type === 'hp') { player.maxHp += 5; player.hp += 5; }
    else if (type === 'hunger') { player.maxHunger += 5; player.hunger += 5; }
    else if (type === 'water') { player.maxWater += 5; player.water += 5; }
    
    player.statPoints--;
    updateStatsUI();
    renderStatsTab(); // 刷新背包内的属性界面
}

// ==========================================
// 核心系统 (核心逻辑微调：加入等级和经验)
// ==========================================

function passTime(hours) {
    gameTime.hour += hours;
    player.hunger = Math.max(0, player.hunger - (2 * hours));
    player.water = Math.max(0, player.water - (3 * hours));
    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
    if (isNight) player.sanity = Math.max(0, player.sanity - (3 * hours));
    if (player.hunger === 0 || player.water === 0) player.hp = Math.max(0, player.hp - 5);
    if (player.sanity === 0) player.hp = Math.max(0, player.hp - 10);
    if (gameTime.hour >= 24) { gameTime.hour -= 24; gameTime.day += 1; log(`=== 第 ${gameTime.day} 天 ===`); }
    document.getElementById('clock-time').innerText = `${String(gameTime.hour).padStart(2, '0')}:00`;
    updateDayNightCycle();
    updateStatsUI();
}

function updateDayNightCycle() {
    document.body.classList.toggle('night-mode', gameTime.hour >= 20 || gameTime.hour < 6);
}

function move(dx, dy) {
    if(currentEnemy && !document.getElementById('combat-view').classList.contains('hidden')) return log("战斗中无法移动！", "red");
    if (player.hp <= 0) return;
    const newX = player.x + dx;
    const newY = player.y + dy;
    if (newX < 0 || newX >= MAP_SIZE || newY < 0 || newY >= MAP_SIZE) return log("前方是世界的尽头。");
    player.x = newX; player.y = newY;
    passTime(1); refreshLocation();
}

function getBiome(x, y) {
    if (currentDimension === "OVERWORLD") {
        const keys = ["PLAINS", "FOREST", "DESERT", "MOUNTAIN", "SNOWY", "OCEAN", "SWAMP", "MESA", "VILLAGE"];
        return keys[Math.abs((x * 37 + y * 13) % keys.length)];
    } else {
        const keys = ["NETHER_WASTES", "CRIMSON_FOREST", "SOUL_SAND_VALLEY", "LAVA_SEA"];
        return keys[Math.abs((x * 7 + y * 19) % keys.length)];
    }
}

function generateScene(biomeKey) {
    currentSceneItems = [];
    const biome = BIOMES[biomeKey];
    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
    const resCount = 3 + Math.floor(Math.random() * 4);
    for(let i=0; i<resCount; i++) {
        const name = biome.res[Math.floor(Math.random() * biome.res.length)];
        currentSceneItems.push({ type: 'res', name: name, count: Math.floor(Math.random()*3)+1 });
    }

    let mobChance = (isNight || currentDimension === "NETHER") ? 0.8 : 0.3;
    if (Math.random() < mobChance) {
        const mobTemplate = biome.mobs[Math.floor(Math.random() * biome.mobs.length)];
        // 【新增】怪物等级算法：随距离增加等级
        const dist = Math.abs(player.x - 10) + Math.abs(player.y - 10);
        const mobLevel = Math.max(1, player.level + Math.floor(dist/8) - 1 + Math.floor(Math.random()*3));
        
        let mob = { 
            type: 'mob', name: mobTemplate.name, level: mobLevel,
            hp: mobTemplate.hp + (mobLevel * 5), maxHp: mobTemplate.hp + (mobLevel * 5),
            atk: mobTemplate.atk + Math.floor(mobLevel * 0.5), loot: mobTemplate.loot,
            exp: (mobTemplate.atk + 2) + (mobLevel * 2) // 经验值奖励
        };
        if ((isNight || currentDimension === "NETHER") && mob.atk > 0) {
            mob.name = (currentDimension === "NETHER" ? "地狱的" : "狂暴的") + mob.name;
            mob.atk = Math.floor(mob.atk * 1.5); mob.exp = Math.floor(mob.exp * 1.5);
        }
        currentSceneItems.push(mob);
    }
}

function renderScene() {
    const grid = document.getElementById('scene-grid');
    grid.innerHTML = '';
    const key = `${player.x},${player.y}`;
    const buildings = getCurrBuildings()[key] || [];
    
    buildings.forEach((b, idx) => {
        const btn = document.createElement('div');
        btn.className = `grid-btn build`;
        btn.innerText = b.name === "下界传送门" ? "🔮 下界传送门" : `📦 ${b.name}`;
        btn.onclick = () => b.name === "下界传送门" ? usePortal() : openBuilding(b, idx);
        grid.appendChild(btn);
    });

    currentSceneItems.forEach((item, index) => {
        const btn = document.createElement('div');
        btn.className = `grid-btn ${item.type}`;
        if (item.name === "村民") {
            btn.innerHTML = (ITEM_ICONS["村民"] ? `<img src="${ITEM_ICONS["村民"]}" class="mob-icon">` : "👨‍🌾 ") + item.name;
            btn.style.color = "#27ae60"; btn.onclick = () => openTrading(); 
        } 
        else if (item.type === 'res') {
            let iconHtml = ITEM_ICONS[item.name] ? `<img src="${ITEM_ICONS[item.name]}" class="item-icon">` : "";
            btn.innerHTML = `${iconHtml}${item.name} (${item.count})`;
            btn.onclick = () => collectResource(index);
        } else {
            let mobIconHtml = ITEM_ICONS[item.name] ? `<img src="${ITEM_ICONS[item.name]}" class="mob-icon">` : "";
            if (!mobIconHtml) {
                let baseName = item.name.replace("狂暴的", "").replace("地狱的", "");
                if (ITEM_ICONS[baseName]) mobIconHtml = `<img src="${ITEM_ICONS[baseName]}" class="mob-icon">`;
            }
            // 【新增】显示怪物等级
            btn.innerHTML = `${mobIconHtml}${item.name} <span class="lv-tag">Lv.${item.level}</span>`;
            btn.classList.add('mob'); btn.onclick = () => startCombat(item, index);
        }
        grid.appendChild(btn);
    });
}

function collectResource(index) {
    const item = currentSceneItems[index];
    if (!item) return;
    
    // ... 原有岩浆/水/镐子检测逻辑 ...
    addItemToInventory(item.name, 1);
    addExp(1); // 采集获得少量经验
    finishCollect(index, item);
    log(`采集了 ${item.name} (EXP +1)`);
}

function finishCollect(index, item) {
    item.count--; if (item.count <= 0) currentSceneItems.splice(index, 1);
    renderScene(); updateInventoryUI();
}

// --- 战斗逻辑优化 ---
function startCombat(mob, index) {
    currentEnemy = mob; currentEnemy.index = index; switchView('combat');
    document.getElementById('enemy-name').innerHTML = `${mob.name} <small>Lv.${mob.level}</small>`;
    document.getElementById('combat-log-area').innerHTML = `<p>遭遇了 Lv.${mob.level} ${mob.name}！</p>`;
    updateCombatUI();
}

function updateCombatUI() {
    if(!currentEnemy) return;
    const hpPct = (currentEnemy.hp / currentEnemy.maxHp) * 100;
    document.getElementById('enemy-hp-bar').style.width = `${hpPct}%`;
    document.getElementById('enemy-stats').innerText = `HP: ${currentEnemy.hp}/${currentEnemy.maxHp}`;
    
    // 渲染快捷药水
    const c = document.getElementById('combat-consumables') || document.createElement('div');
    c.id = 'combat-consumables'; c.className = 'quick-heal-bar';
    document.getElementById('combat-log-area').before(c);
    c.innerHTML = '';
    for (let [name, count] of Object.entries(player.inventory)) {
        let r = RECIPES.find(x => x.name === name);
        if (r && r.type === 'use' && (r.effect === 'food' || r.effect === 'heal')) {
            const btn = document.createElement('div'); btn.className = 'heal-btn';
            btn.innerHTML = `${name} x${count}`; btn.onclick = () => { useItem(name); combatAttack(true); };
            c.appendChild(btn);
        }
    }
}

function combatAttack(isPassive = false) {
    if (!currentEnemy) return;
    if (!isPassive) {
        const pDmg = player.atk + Math.floor(Math.random() * 3);
        currentEnemy.hp -= pDmg; combatLog(`你造成 ${pDmg} 伤害`, "green");
    }

    if (currentEnemy.hp <= 0) {
        log(`击败了 ${currentEnemy.name}，获得 EXP +${currentEnemy.exp}`, "gold");
        addItemToInventory(currentEnemy.loot, 1);
        addExp(currentEnemy.exp);
        currentSceneItems.splice(currentEnemy.index, 1);
        setTimeout(() => { switchView('scene'); renderScene(); }, 800);
        return; 
    }
    const eDmg = Math.max(1, currentEnemy.atk);
    player.hp -= eDmg; combatLog(`${currentEnemy.name} 反击造成 ${eDmg} 伤害`, "red");
    if (player.hp <= 0) die();
    updateStatsUI(); updateCombatUI();
}

function combatLog(msg, color) {
    const p = document.createElement('p'); p.innerText = msg; p.style.color = color;
    document.getElementById('combat-log-area').prepend(p);
}

// ==========================================
// 【核心修改】全屏背包与 Tab 切换逻辑
// ==========================================

function switchView(viewName) {
    ['scene','inventory','craft','combat','chest','trade','system'].forEach(v => document.getElementById(v+'-view')?.classList.add('hidden'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById(viewName+'-view')?.classList.remove('hidden');

    if (viewName === 'inventory') {
        switchInvTab('stats'); // 默认打开属性页
        document.querySelectorAll('.nav-item')[0].classList.add('active');
    } else if (viewName === 'scene') document.querySelectorAll('.nav-item')[2].classList.add('active');
    else if (viewName === 'craft') { updateCraftUI(); document.querySelectorAll('.nav-item')[1].classList.add('active'); }
    else if (viewName === 'system') { checkSaveStatus(); document.querySelectorAll('.nav-item')[4].classList.add('active'); } 
}

// 背包内部切换
window.switchInvTab = function(tab) {
    document.getElementById('inv-tab-stats').classList.toggle('hidden', tab !== 'stats');
    document.getElementById('inv-tab-equip').classList.toggle('hidden', tab !== 'equip');
    document.querySelectorAll('.inv-tab-btn').forEach((b, i) => b.classList.toggle('active', (i === 0 && tab === 'stats') || (i === 1 && tab === 'equip')));
    
    if (tab === 'stats') renderStatsTab();
    else updateInventoryUI();
};

function renderStatsTab() {
    document.getElementById('stat-lv').innerText = player.level;
    document.getElementById('stat-exp').innerText = player.exp;
    document.getElementById('stat-max-exp').innerText = player.maxExp;
    document.getElementById('stat-exp-bar').style.width = `${(player.exp/player.maxExp)*100}%`;
    document.getElementById('stat-points').innerText = player.statPoints;
    
    document.getElementById('val-hp').innerText = player.hp;
    document.getElementById('val-max-hp').innerText = player.maxHp;
    document.getElementById('val-max-hunger').innerText = player.maxHunger;
    document.getElementById('val-max-water').innerText = player.maxWater;
    document.getElementById('val-atk').innerText = player.atk;
    document.getElementById('val-sanity').innerText = player.sanity;

    // 控制加号按钮是否变绿
    document.querySelectorAll('.plus-btn').forEach(btn => {
        btn.classList.toggle('active', player.statPoints > 0);
    });
}

function updateInventoryUI() {
    // 渲染装备位
    document.getElementById('slot-weapon').innerText = player.equipWeapon || "空手";
    document.getElementById('slot-armor').innerText = player.equipArmor || "无护甲";

    const list = document.getElementById('inventory-list');
    list.innerHTML = '';
    for (let [name, count] of Object.entries(player.inventory)) {
        if (count <= 0) continue;
        const type = getItemType(name);
        const row = document.createElement('div'); row.className = 'list-item';
        let icon = ITEM_ICONS[name] ? `<img src="${ITEM_ICONS[name]}" class="item-icon">` : "";
        
        let actionBtn = type === 'equip' ? 
            `<button onclick="equipItem('${name}')">装备</button>` : 
            `<button onclick="useItem('${name}')">使用</button>`;
            
        row.innerHTML = `<div>${icon} ${name} x${count}</div> <div>${actionBtn}</div>`;
        list.appendChild(row);
    }
}

window.equipItem = function(name) {
    let r = RECIPES.find(x => x.name === name);
    if (name.includes("剑") || name.includes("斧")) {
        if (player.equipWeapon) addItemToInventory(player.equipWeapon, 1);
        player.equipWeapon = name; player.atk = 5 + (r.val || 0);
    } else {
        if (player.equipArmor) addItemToInventory(player.equipArmor, 1);
        player.equipArmor = name; player.maxHp = 100 + (r.val || 0);
    }
    player.inventory[name]--; updateInventoryUI(); updateStatsUI();
    log(`已装备 ${name}`);
};

// ... 其他原有逻辑 (addItemToInventory, useItem, updateCraftUI, craftItem, refreshLocation, saveGame, loadGame 等保持原样) ...

function useItem(name) {
    if (!player.inventory[name]) return;
    let r = RECIPES.find(x => x.name === name);
    if (r?.effect === 'food') player.hunger = Math.min(player.maxHunger, player.hunger + r.val);
    if (r?.effect === 'heal') player.hp = Math.min(player.maxHp, player.hp + r.val);
    player.inventory[name]--; updateStatsUI(); updateInventoryUI();
}

function updateStatsUI() {
    document.getElementById('hp').innerText = player.hp;
    document.getElementById('hunger').innerText = player.hunger;
    document.getElementById('water').innerText = player.water;
    document.getElementById('sanity').innerText = player.sanity; 
}

function log(msg, color) {
    const p = document.createElement('p'); p.innerText = `> ${msg}`;
    if(color) p.style.color = color;
    document.getElementById('game-log').prepend(p);
}

function refreshLocation() {
    const biome = BIOMES[getBiome(player.x, player.y)];
    document.getElementById('loc-name').innerText = biome.name;
    document.getElementById('coord').innerText = `${player.x},${player.y}`;
    generateScene(getBiome(player.x, player.y)); renderScene();
}

function init() {
    addItemToInventory("木剑", 1);
    addItemToInventory("面包", 2);
    refreshLocation(); updateStatsUI(); checkSaveStatus();
    log("RPG 生存系统启动成功！");
}

init();

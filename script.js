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

// 合成配方 (修复：加入了建筑配方)
const RECIPES = [
    // === 建筑 ===
    { name: "储物箱", req: { "原木": 8 }, type: "build", desc: "放置后可存储物品" },
    { name: "熔炉", req: { "石头": 8 }, type: "build", desc: "用于烧炼矿物" },
    { name: "附魔台", req: { "原木": 4, "金矿石": 2, "皮革": 2 }, type: "build", desc: "强化装备" },
    
    // === 生存/消耗 ===
    { name: "篝火", req: { "原木": 3, "石头": 3 }, type: "use", effect: "warm", val: 20, desc: "恢复 20点理智" },
    { name: "草药绷带", req: { "杂草": 4, "野花": 1 }, type: "use", effect: "heal", val: 25, desc: "恢复 25 HP" },
    { name: "纯净水", req: { "雪球": 3, "煤炭": 1 }, type: "use", effect: "drink", val: 40, desc: "恢复 40 水分" },
    { name: "烤肉串", req: { "生兔肉": 1, "木棍": 1 }, type: "use", effect: "food", val: 35, desc: "恢复 35 饥饿" },
    { name: "炖肉汤", req: { "羊肉": 1, "蘑菇": 2, "水": 1 }, type: "use", effect: "food", val: 60, desc: "恢复 60 饥饿" },
    
    // === 装备 ===
    { name: "石斧", req: { "木棍": 2, "石头": 3 }, type: "equip", effect: "atk", val: 8, desc: "攻击力 8" },
    { name: "铁剑", req: { "木棍": 2, "铁锭": 2 }, type: "equip", effect: "atk", val: 25, desc: "攻击力 25 (需铁锭)" },
    { name: "金剑", req: { "木棍": 2, "金锭": 2 }, type: "equip", effect: "atk", val: 40, desc: "攻击力 40 (需金锭)" },
    { name: "皮革护甲", req: { "皮革": 5 }, type: "equip", effect: "hp_max", val: 120, desc: "HP上限 -> 120" },
    { name: "龟壳头盔", req: { "海龟": 1, "藤蔓": 2 }, type: "equip", effect: "hp_max", val: 150, desc: "HP上限 -> 150" }
];

// 熔炉配方
const SMELT_RECIPES = [
    { in: "铁矿石", out: "铁锭" },
    { in: "金矿石", out: "金锭" },
    { in: "沙子", out: "玻璃" },
    { in: "生兔肉", out: "烤肉串" },
    { in: "生鱼", out: "熟鱼" }
];

// 玩家状态
let player = { 
    x: 10, y: 10, 
    hp: 100, maxHp: 100, 
    hunger: 100, maxHunger: 100,
    water: 100, maxWater: 100,
    sanity: 100, maxSanity: 100,
    atk: 5, 
    inventory: {},
    home: null // {x, y}
};

let gameTime = { day: 1, hour: 8 };
let exploredMap = {}; 
let buildings = {}; // "x,y": [{name:"储物箱", content:{}}]
let currentSceneItems = [];
let currentEnemy = null; 
let activeBuilding = null; // 当前打开的建筑

// --- 2. 存档系统 ---

function saveGame() {
    if (player.hp <= 0) return;
    const data = { player, gameTime, exploredMap, buildings };
    localStorage.setItem('wilderness_save_v2', JSON.stringify(data));
}

function loadGame() {
    const dataStr = localStorage.getItem('wilderness_save_v2');
    if (dataStr) {
        const data = JSON.parse(dataStr);
        player = data.player;
        gameTime = data.gameTime;
        exploredMap = data.exploredMap;
        buildings = data.buildings || {};
        log("读取存档成功。", "green");
        return true;
    }
    return false;
}

function clearSave() {
    localStorage.removeItem('wilderness_save_v2');
}

// --- 3. 核心循环 ---

function passTime(hours) {
    gameTime.hour += hours;
    
    player.hunger = Math.max(0, player.hunger - (2 * hours));
    player.water = Math.max(0, player.water - (3 * hours));

    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
    if (isNight) {
        // 在家回理智，不在家扣理智
        let isSafe = player.home && player.home.x === player.x && player.home.y === player.y;
        if (isSafe) {
            player.sanity = Math.min(player.maxSanity, player.sanity + 2);
            log("在家休息，理智平稳。", "blue");
        } else {
            player.sanity = Math.max(0, player.sanity - (3 * hours));
            if (player.sanity < 50) log("黑暗中有人盯着你...", "purple");
        }
    }

    if (player.hunger === 0 || player.water === 0) player.hp -= 5;
    if (player.sanity === 0) {
        player.hp -= 10;
        log("极度恐惧！HP -10", "red");
    }

    if (gameTime.hour >= 24) {
        gameTime.hour -= 24;
        gameTime.day += 1;
        log(`=== 第 ${gameTime.day} 天 ===`);
    }

    document.getElementById('clock-time').innerText = `${String(gameTime.hour).padStart(2, '0')}:00`;
    updateDayNightCycle();
    updateStatsUI();
    saveGame();
}

function updateDayNightCycle() {
    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
    document.body.classList.toggle('night-mode', isNight);
}

// --- 4. 移动与场景 ---

function move(dx, dy) {
    if(currentEnemy || activeBuilding) return log("当前状态无法移动！");
    if (player.hp <= 0) return;

    const newX = player.x + dx;
    const newY = player.y + dy;
    if (newX < 0 || newX >= MAP_SIZE || newY < 0 || newY >= MAP_SIZE) return log("前方是世界的尽头。");

    player.x = newX; player.y = newY;
    passTime(1); 
    refreshLocation();
}

function refreshLocation() {
    exploredMap[`${player.x},${player.y}`] = true;
    const biomeKey = getBiome(player.x, player.y);
    const biome = BIOMES[biomeKey];
    
    let title = biome.name;
    if(player.home && player.home.x === player.x && player.home.y === player.y) {
        title += " <span style='color:gold'>(家)</span>";
    }
    document.getElementById('loc-name').innerHTML = title;
    document.getElementById('coord').innerText = `${player.x},${player.y}`;
    
    generateScene(biomeKey);
    renderScene();
    updateMiniMap();
    if (!document.getElementById('map-modal').classList.contains('hidden')) renderBigMap();
}

function getBiome(x, y) {
    const keys = Object.keys(BIOMES);
    return keys[Math.abs((x * 37 + y * 13) % keys.length)];
}

// 修复：生成怪物时，无论白天晚上都必须设定 maxHp
function generateScene(biomeKey) {
    currentSceneItems = [];
    const biome = BIOMES[biomeKey];
    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
    
    // 生成资源
    const resCount = 3 + Math.floor(Math.random() * 4);
    for(let i=0; i<resCount; i++) {
        const name = biome.res[Math.floor(Math.random() * biome.res.length)];
        currentSceneItems.push({ type: 'res', name: name, count: Math.floor(Math.random()*3)+1 });
    }

    // 生成怪物
    let mobChance = isNight ? 0.8 : 0.3; 
    if (Math.random() < mobChance) {
        const m = biome.mobs[Math.floor(Math.random() * biome.mobs.length)];
        let mob = JSON.parse(JSON.stringify(m)); // 深度复制
        mob.type = 'mob';
        
        // --- 核心修复：先给它赋值基础最大血量 ---
        mob.maxHp = mob.hp; 

        // 夜间强化逻辑
        if (isNight) {
            mob.name = "狂暴的" + mob.name;
            mob.hp = Math.floor(mob.hp * 1.5);
            mob.maxHp = mob.hp; // 强化后重新设定最大血量
            mob.atk = Math.floor(mob.atk * 1.5);
        }
        currentSceneItems.push(mob);
    }
}



    
    // 资源
    const resCount = 3 + Math.floor(Math.random() * 4);
    for(let i=0; i<resCount; i++) {
        const name = biome.res[Math.floor(Math.random() * biome.res.length)];
        currentSceneItems.push({ type: 'res', name: name, count: Math.floor(Math.random()*3)+1 });
    }

    // 怪物
    let mobChance = isNight ? 0.8 : 0.3; 
    if (Math.random() < mobChance) {
        const m = biome.mobs[Math.floor(Math.random() * biome.mobs.length)];
        let mob = JSON.parse(JSON.stringify(m)); // 深度复制
        mob.type = 'mob';
        if (isNight) {
            mob.name = "狂暴的" + mob.name;
            mob.hp = Math.floor(mob.hp * 1.5);
            mob.atk = Math.floor(mob.atk * 1.5);
        }
        currentSceneItems.push(mob);
    }
}

function renderScene() {
    const grid = document.getElementById('scene-grid');
    grid.innerHTML = '';
    
    // 1. 先渲染建筑
    const key = `${player.x},${player.y}`;
    const locBuildings = buildings[key] || [];
    locBuildings.forEach((b, idx) => {
        const btn = document.createElement('div');
        btn.className = `grid-btn build`;
        btn.innerText = `🏠 ${b.name}`;
        btn.onclick = () => openBuilding(b, idx);
        grid.appendChild(btn);
    });

    // 2. 再渲染物品/怪物
    currentSceneItems.forEach((item, index) => {
        const btn = document.createElement('div');
        btn.className = `grid-btn ${item.type}`;
        if (item.type === 'res') {
            btn.innerText = `${item.name} (${item.count})`;
            btn.onclick = () => collectResource(index);
        } else {
            btn.innerText = `${item.name}`; 
            btn.classList.add('mob');
            btn.onclick = () => startCombat(item, index);
        }
        grid.appendChild(btn);
    });
}

function collectResource(idx) {
    const item = currentSceneItems[idx];
    addItemToInventory(item.name, item.count);
    log(`采集: ${item.name} x${item.count}`);
    currentSceneItems.splice(idx, 1);
    renderScene();
}

// --- 5. 战斗系统 (修复 undefined bug) ---

function startCombat(mob, index) {
    currentEnemy = mob;
    currentEnemy.index = index;
    switchView('combat');
    document.getElementById('enemy-name').innerText = mob.name;
    document.getElementById('combat-log-area').innerHTML = `<p>遭遇 ${mob.name}！</p>`;
    updateCombatUI();
}

// 修复：战斗界面增加显示 攻击力 (ATK)
function updateCombatUI() {
    if(!currentEnemy) return;
    
    // 防止除以0或undefined
    const max = currentEnemy.maxHp || currentEnemy.hp || 100;
    const hpPct = (currentEnemy.hp / max) * 100;
    
    document.getElementById('enemy-hp-bar').style.width = `${hpPct}%`;
    
    // 这里把 ATK 加回来了
    document.getElementById('enemy-stats').innerText = `HP: ${currentEnemy.hp}/${max} | 攻: ${currentEnemy.atk}`;
    
    if (player.hp <= 0) {
        document.getElementById('combat-log-area').innerHTML += `<p style="color:red">你被杀死了...</p>`;
    }
}

function combatAttack() {
    if(!currentEnemy) return;
    
    const dmg = player.atk + Math.floor(Math.random()*3);
    currentEnemy.hp -= dmg;
    combatLog(`你造成 ${dmg} 伤害`, "green");
    
    // 动画
    const box = document.querySelector('.enemy-box');
    box.classList.add('shake');
    setTimeout(()=>box.classList.remove('shake'), 200);

    if (currentEnemy.hp <= 0) {
        combatLog(`胜利！获得 ${currentEnemy.loot}`, "gold");
        addItemToInventory(currentEnemy.loot, 1);
        currentSceneItems.splice(currentEnemy.index, 1);
        
        // 战斗结束，清空敌人，防止反击报错
        currentEnemy = null;
        
        setTimeout(() => { 
            switchView('scene'); 
            renderScene(); 
        }, 1000);
        return;
    }
    
    // 怪物反击
    setTimeout(enemyTurn, 500);
    updateCombatUI();
}

function enemyTurn() {
    // 修复：增加非空判断，防止战斗已结束定时器仍触发
    if(!currentEnemy || currentEnemy.hp<=0) return;
    
    const dmg = Math.max(1, currentEnemy.atk - Math.floor(Math.random()));
    player.hp -= dmg;
    player.sanity = Math.max(0, player.sanity - 2);
    
    combatLog(`受到 ${dmg} 伤害 (理智-2)`, "red");
    document.body.classList.add('shake');
    setTimeout(()=>document.body.classList.remove('shake'), 200);
    
    if(player.hp <= 0) die();
    updateStatsUI();
    updateCombatUI();
}

function combatFlee() {
    if (Math.random() > 0.5) {
        log("逃跑成功", "orange");
        player.sanity -= 5;
        currentEnemy = null; // 清空敌人
        switchView('scene');
    } else {
        combatLog("逃跑失败", "red");
        enemyTurn();
    }
}

function combatLog(msg, col) {
    const el = document.getElementById('combat-log-area');
    el.innerHTML = `<p style="color:${col}">${msg}</p>` + el.innerHTML;
}

function die() {
    clearSave();
    alert("你死亡了！存档已删除，世界重置。");
    location.reload();
}

// --- 6. 建筑系统 ---

function placeBuilding(name) {
    const key = `${player.x},${player.y}`;
    if (!buildings[key]) buildings[key] = [];
    
    let newBuild = { name: name };
    if (name === "储物箱") newBuild.content = {};
    
    buildings[key].push(newBuild);
    log(`放置了 ${name}`, "blue");
    
    // 消耗一个物品
    player.inventory[name]--;
    if (player.inventory[name] <= 0) delete player.inventory[name];
    
    refreshLocation();
    updateInventoryUI();
}

window.setHome = function() {
    player.home = { x: player.x, y: player.y };
    log(`已安家于 [${player.x}, ${player.y}]`, "gold");
    refreshLocation();
    saveGame();
}

function openBuilding(b, idx) {
    activeBuilding = b;
    if (b.name === "储物箱") { switchView('chest'); updateChestUI(); }
    else if (b.name === "熔炉") { switchView('furnace'); updateFurnaceUI(); }
    else if (b.name === "附魔台") { switchView('enchant'); updateEnchantUI(); }
}

window.closeBuilding = function() {
    activeBuilding = null;
    switchView('scene');
}

// 箱子逻辑
function updateChestUI() {
    const pList = document.getElementById('chest-player-inv');
    const cList = document.getElementById('chest-storage');
    pList.innerHTML = ''; cList.innerHTML = '';
    
    for (let [k, v] of Object.entries(player.inventory)) {
        let d = document.createElement('div'); d.className = 'list-item';
        d.innerHTML = `<span>${k} x${v}</span> <button onclick="moveToChest('${k}')">→</button>`;
        pList.appendChild(d);
    }
    for (let [k, v] of Object.entries(activeBuilding.content)) {
        let d = document.createElement('div'); d.className = 'list-item';
        d.innerHTML = `<button onclick="takeFromChest('${k}')">←</button> <span>${k} x${v}</span>`;
        cList.appendChild(d);
    }
}
window.moveToChest = function(n) {
    if (player.inventory[n] > 0) {
        player.inventory[n]--; if (player.inventory[n]<=0) delete player.inventory[n];
        activeBuilding.content[n] = (activeBuilding.content[n]||0) + 1;
        updateChestUI(); saveGame();
    }
}
window.takeFromChest = function(n) {
    if (activeBuilding.content[n] > 0) {
        activeBuilding.content[n]--; if (activeBuilding.content[n]<=0) delete activeBuilding.content[n];
        addItemToInventory(n, 1);
        updateChestUI(); saveGame();
    }
}

// 熔炉逻辑
function updateFurnaceUI() {
    const list = document.getElementById('furnace-list');
    list.innerHTML = '';
    SMELT_RECIPES.forEach(r => {
        let d = document.createElement('div'); d.className = 'recipe-row';
        const has = player.inventory[r.in] || 0;
        d.innerHTML = `<div>${r.in} ➡️ <b>${r.out}</b></div><button onclick="smeltItem('${r.in}','${r.out}')" ${has<1?'disabled':''}>烧炼</button>`;
        list.appendChild(d);
    });
}
window.smeltItem = function(In, Out) {
    if (player.inventory[In] > 0) {
        player.inventory[In]--; if(player.inventory[In]<=0) delete player.inventory[In];
        addItemToInventory(Out, 1);
        updateFurnaceUI(); saveGame();
    }
}

// 附魔逻辑
function updateEnchantUI() {
    const list = document.getElementById('enchant-list');
    list.innerHTML = `
        <div style="padding:10px;text-align:center">攻击力: ${player.atk} | MaxHP: ${player.maxHp}</div>
        <div class="recipe-row"><div><b>锋利</b> (铁锭x1, 金锭x1)</div><button onclick="doEnchant('atk')">强化</button></div>
        <div class="recipe-row"><div><b>强壮</b> (腐肉x5, 骨头x5)</div><button onclick="doEnchant('hp')">强化</button></div>
    `;
}
window.doEnchant = function(type) {
    if (type === 'atk') {
        if((player.inventory['铁锭']||0)<1 || (player.inventory['金锭']||0)<1) return log("材料不足","red");
        player.inventory['铁锭']--; player.inventory['金锭']--;
        player.atk += 5; log("攻击力提升!", "gold");
    } else {
        if((player.inventory['腐肉']||0)<5 || (player.inventory['骨头']||0)<5) return log("材料不足","red");
        player.inventory['腐肉']-=5; player.inventory['骨头']-=5;
        player.maxHp += 10; player.hp += 10; log("生命上限提升!", "gold");
    }
    updateEnchantUI(); saveGame();
}

// --- 7. 通用 ---

function addItemToInventory(name, count) {
    player.inventory[name] = (player.inventory[name]||0) + count;
}

function useItem(name) {
    const r = RECIPES.find(x => x.name === name);
    // 建筑放置
    if (r && r.type === 'build') { placeBuilding(name); return; }

    // 消耗品/装备逻辑
    if (name === "熟鱼" || name === "烤肉串") { player.hunger += 35; }
    else if (name === "草药绷带") { player.hp += 25; }
    else if (name === "篝火") { player.sanity += 20; }
    else if (r && r.effect === 'atk') { player.atk = r.val; log(`装备 ${name}`, "gold"); }
    else if (r && r.effect === 'hp_max') { player.maxHp = r.val; log(`装备 ${name}`, "gold"); }
    
    player.inventory[name]--;
    if(player.inventory[name]<=0) delete player.inventory[name];
    updateStatsUI(); updateInventoryUI();
}

function updateCraftUI() {
    const list = document.getElementById('craft-list');
    list.innerHTML = '';
    RECIPES.forEach(r => {
        let d = document.createElement('div'); d.className = 'list-item';
        let reqs = Object.entries(r.req).map(([m,q]) => {
            let has = player.inventory[m]||0;
            return `<span style="color:${has>=q?'green':'red'}">${m} ${has}/${q}</span>`;
        }).join(' ');
        let can = Object.entries(r.req).every(([m,q]) => (player.inventory[m]||0)>=q);
        d.innerHTML = `<div><b>${r.name}</b><br><small>${r.desc}</small><br><small>${reqs}</small></div>
            <button onclick="craftItem(RECIPES.find(x=>x.name=='${r.name}'))" ${!can?'disabled style="background:#ccc"':''}>制作</button>`;
        list.appendChild(d);
    });
}

function craftItem(r) {
    for (let [m, q] of Object.entries(r.req)) if((player.inventory[m]||0)<q) return;
    for (let [m, q] of Object.entries(r.req)) {
        player.inventory[m]-=q; if(player.inventory[m]<=0) delete player.inventory[m];
    }
    addItemToInventory(r.name, 1);
    log(`制作了 ${r.name}`);
    updateInventoryUI(); updateCraftUI(); updateStatsUI();
}

function switchView(v) {
    ['scene','inventory','craft','combat','chest','furnace','enchant'].forEach(id => {
        document.getElementById(id+'-view').classList.add('hidden');
    });
    document.getElementById(v+'-view').classList.remove('hidden');
    
    if (v === 'inventory') updateInventoryUI();
    if (v === 'craft') updateCraftUI();
}

function updateStatsUI() {
    document.getElementById('hp').innerText = player.hp > player.maxHp ? player.maxHp : player.hp;
    document.getElementById('hunger').innerText = player.hunger;
    document.getElementById('water').innerText = player.water;
    document.getElementById('sanity').innerText = player.sanity;
}

function log(msg, color="black") {
    const el = document.getElementById('game-log');
    el.innerHTML = `<p style="color:${color}">> ${msg}</p>` + el.innerHTML;
}

// Map Functions
function openMap() { document.getElementById('map-modal').classList.remove('hidden'); renderBigMap(); }
function closeMap() { document.getElementById('map-modal').classList.add('hidden'); }
function updateMiniMap() {
    const n = (x,y) => (x<0||x>=MAP_SIZE||y<0||y>=MAP_SIZE) ? "边界" : BIOMES[Object.keys(BIOMES)[Math.abs((x*37+y*13)%8)]].name;
    document.getElementById('dir-n').innerText = n(player.x, player.y-1);
    document.getElementById('dir-s').innerText = n(player.x, player.y+1);
    document.getElementById('dir-w').innerText = n(player.x-1, player.y);
    document.getElementById('dir-e').innerText = n(player.x+1, player.y);
}
function renderBigMap() {
    const el = document.getElementById('big-grid');
    if(!el) return;
    el.innerHTML='';
    el.style.gridTemplateColumns = `repeat(${MAP_SIZE}, 1fr)`;
    el.style.gridTemplateRows = `repeat(${MAP_SIZE}, 1fr)`;
    for(let y=0; y<MAP_SIZE; y++) for(let x=0; x<MAP_SIZE; x++) {
        let d = document.createElement('div');
        let key = `${x},${y}`;
        if(exploredMap[key]) {
            let t = Object.keys(BIOMES)[Math.abs((x*37+y*13)%8)];
            d.className = `map-cell ${BIOMES[t].code}`;
            d.innerText = BIOMES[t].name.substring(0,2);
            if(player.home && player.home.x===x && player.home.y===y) {
                d.style.border = "2px solid gold";
                d.innerText = "家";
            }
        } else { d.className='map-cell fog'; }
        if(x===player.x && y===player.y) { d.classList.add('player'); d.innerText="我"; }
        el.appendChild(d);
    }
}
window.search = function() { passTime(2); refreshLocation(); log("探索了一番"); }

function init() {
    if (!loadGame()) {
        addItemToInventory("烤肉串", 2);
        log("游戏开始！收集木头和石头，活下去。", "gold");
    }
    refreshLocation();
    updateStatsUI();
}

init();

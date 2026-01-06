// --- 1. 游戏配置与数据 ---
const MAP_SIZE = 20;

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

// 合成配方 (扩充了建筑和进阶材料)
const RECIPES = [
    // 建筑类
    { name: "储物箱", req: { "原木": 8 }, type: "build", desc: "放置后可存储物品" },
    { name: "熔炉", req: { "石头": 8 }, type: "build", desc: "用于烧炼矿物" },
    { name: "附魔台", req: { "原木": 4, "金矿石": 2, "皮革": 2 }, type: "build", desc: "强化装备" },
    
    // 生存类
    { name: "篝火", req: { "原木": 3, "石头": 3 }, type: "use", effect: "warm", val: 20, desc: "恢复 20点理智" },
    { name: "草药绷带", req: { "杂草": 4, "野花": 1 }, type: "use", effect: "heal", val: 25, desc: "恢复 25 HP" },
    
    // 装备类
    { name: "石斧", req: { "木棍": 2, "石头": 3 }, type: "equip", effect: "atk", val: 8, desc: "攻击力 8" },
    { name: "铁剑", req: { "木棍": 2, "铁锭": 2 }, type: "equip", effect: "atk", val: 25, desc: "攻击力 25 (需铁锭)" },
    { name: "金剑", req: { "木棍": 2, "金锭": 2 }, type: "equip", effect: "atk", val: 40, desc: "攻击力 40 (需金锭)" },
    
    // 食物
    { name: "烤肉串", req: { "生兔肉": 1, "木棍": 1 }, type: "use", effect: "food", val: 35, desc: "恢复 35 饥饿" }
];

// 熔炉烧炼配方
const SMELT_RECIPES = [
    { in: "铁矿石", out: "铁锭", time: 1 },
    { in: "金矿石", out: "金锭", time: 1 },
    { in: "沙子", out: "玻璃", time: 1 },
    { in: "生兔肉", out: "烤肉串", time: 1 },
    { in: "生鱼", out: "熟鱼", time: 1 } // 熟鱼需自己加到物品效果里
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
    home: null // 记录家的坐标 {x, y}
};

// 游戏世界数据
let gameTime = { day: 1, hour: 8 };
let exploredMap = {}; 
let buildings = {}; // 格式: "x,y": [ {name:"熔炉", content:{}} ]
let currentSceneItems = [];
let currentEnemy = null; 
let activeBuilding = null; // 当前打开的建筑

// --- 2. 存档系统 (Save System) ---

function saveGame() {
    if (player.hp <= 0) return; // 死人不存档
    const saveData = {
        player: player,
        gameTime: gameTime,
        exploredMap: exploredMap,
        buildings: buildings
    };
    localStorage.setItem('wilderness_save', JSON.stringify(saveData));
    console.log("自动存档成功");
}

function loadGame() {
    const dataStr = localStorage.getItem('wilderness_save');
    if (dataStr) {
        const data = JSON.parse(dataStr);
        player = data.player;
        gameTime = data.gameTime;
        exploredMap = data.exploredMap;
        buildings = data.buildings || {};
        log("读取存档成功！欢迎回来。", "green");
        return true;
    }
    return false;
}

function clearSave() {
    localStorage.removeItem('wilderness_save');
}

// --- 3. 核心循环与逻辑 ---

function passTime(hours) {
    gameTime.hour += hours;
    
    // 状态消耗
    player.hunger = Math.max(0, player.hunger - (2 * hours));
    player.water = Math.max(0, player.water - (3 * hours));
    
    // 昼夜与理智
    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
    if (isNight) {
        // 在家 (Home) 附近可以减缓理智下降
        let safe = false;
        if (player.home && Math.abs(player.x - player.home.x) <= 1 && Math.abs(player.y - player.home.y) <= 1) {
            safe = true;
        }
        
        if (!safe) {
            player.sanity = Math.max(0, player.sanity - (3 * hours));
            if (player.sanity < 50) log("黑暗中似乎有眼睛在盯着你...", "purple");
        } else {
            log("在家里感到很安心。", "blue");
        }
    }

    if (player.hunger === 0 || player.water === 0) player.hp -= 5;
    if (player.sanity === 0) {
        player.hp -= 10;
        log("你疯了！生命流逝！", "red");
    }

    if (gameTime.hour >= 24) {
        gameTime.hour -= 24;
        gameTime.day += 1;
        log(`=== 第 ${gameTime.day} 天开始了 ===`);
    }

    document.getElementById('clock-time').innerText = `${String(gameTime.hour).padStart(2, '0')}:00`;
    updateDayNightCycle();
    updateStatsUI();
    saveGame(); // 每次时间流逝都存档
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
    const key = `${player.x},${player.y}`;
    
    // 地形生成
    const biomeKey = getBiome(player.x, player.y);
    const biome = BIOMES[biomeKey];
    
    document.getElementById('loc-name').innerText = biome.name;
    document.getElementById('coord').innerText = `${player.x},${player.y}`;
    
    // 如果是家，显示标记
    if (player.home && player.home.x === player.x && player.home.y === player.y) {
        document.getElementById('loc-name').innerHTML += " <span style='color:gold'>(家)</span>";
    }

    // 生成场景物品 (每次进入随机生成资源，但保留建筑)
    generateScene(biomeKey);
    renderScene();
    updateMiniMap();
    if (!document.getElementById('map-modal').classList.contains('hidden')) renderBigMap();
}

function getBiome(x, y) {
    const keys = Object.keys(BIOMES);
    return keys[Math.abs((x * 37 + y * 13) % keys.length)];
}

function generateScene(biomeKey) {
    currentSceneItems = [];
    const biome = BIOMES[biomeKey];
    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
    
    // 1. 资源
    const resCount = 3 + Math.floor(Math.random() * 4);
    for(let i=0; i<resCount; i++) {
        const name = biome.res[Math.floor(Math.random() * biome.res.length)];
        currentSceneItems.push({ type: 'res', name: name, count: Math.floor(Math.random()*3)+1 });
    }
    // 2. 怪物
    let mobChance = isNight ? 0.8 : 0.3; 
    if (Math.random() < mobChance) {
        const m = biome.mobs[Math.floor(Math.random() * biome.mobs.length)];
        let mob = JSON.parse(JSON.stringify(m)); // 深拷贝
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
    
    // 1. 渲染建筑 (从 buildings 数据中读取)
    const key = `${player.x},${player.y}`;
    const locBuildings = buildings[key] || [];
    
    locBuildings.forEach((b, idx) => {
        const btn = document.createElement('div');
        btn.className = `grid-btn build`;
        btn.innerText = `🏠 ${b.name}`;
        btn.onclick = () => openBuilding(b, idx);
        grid.appendChild(btn);
    });

    // 2. 渲染资源和怪物
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

// --- 5. 建筑与安家系统 ---

// 放置建筑
function placeBuilding(name) {
    const key = `${player.x},${player.y}`;
    if (!buildings[key]) buildings[key] = [];
    
    // 建筑数据结构
    let newBuild = { name: name };
    if (name === "储物箱") newBuild.content = {}; // 箱子有背包
    
    buildings[key].push(newBuild);
    log(`在 [${key}] 放置了 ${name}`, "blue");
    
    player.inventory[name]--;
    if (player.inventory[name] <= 0) delete player.inventory[name];
    
    refreshLocation();
    updateInventoryUI();
}

// 设为家
window.setHome = function() {
    player.home = { x: player.x, y: player.y };
    log(`已将 [${player.x}, ${player.y}] 设为家。在这里过夜更安全。`, "gold");
    refreshLocation();
    saveGame();
}

// 打开建筑
function openBuilding(buildData, idx) {
    activeBuilding = buildData;
    
    if (buildData.name === "储物箱") {
        switchView('chest');
        updateChestUI();
    } else if (buildData.name === "熔炉") {
        switchView('furnace');
        updateFurnaceUI();
    } else if (buildData.name === "附魔台") {
        switchView('enchant');
        updateEnchantUI();
    }
}

window.closeBuilding = function() {
    activeBuilding = null;
    switchView('scene');
}

// --- 5.1 箱子逻辑 ---
function updateChestUI() {
    const pList = document.getElementById('chest-player-inv');
    const cList = document.getElementById('chest-storage');
    pList.innerHTML = ''; cList.innerHTML = '';
    
    // 玩家背包渲染
    for (let [k, v] of Object.entries(player.inventory)) {
        let d = document.createElement('div');
        d.className = 'list-item';
        d.innerHTML = `<span>${k} x${v}</span> <button onclick="moveToChest('${k}')">→</button>`;
        pList.appendChild(d);
    }
    // 箱子背包渲染
    for (let [k, v] of Object.entries(activeBuilding.content)) {
        let d = document.createElement('div');
        d.className = 'list-item';
        d.innerHTML = `<button onclick="takeFromChest('${k}')">←</button> <span>${k} x${v}</span>`;
        cList.appendChild(d);
    }
}
window.moveToChest = function(name) {
    if (player.inventory[name] > 0) {
        player.inventory[name]--;
        if (player.inventory[name]<=0) delete player.inventory[name];
        
        activeBuilding.content[name] = (activeBuilding.content[name] || 0) + 1;
        updateChestUI(); saveGame();
    }
}
window.takeFromChest = function(name) {
    if (activeBuilding.content[name] > 0) {
        activeBuilding.content[name]--;
        if (activeBuilding.content[name]<=0) delete activeBuilding.content[name];
        
        addItemToInventory(name, 1);
        updateChestUI(); saveGame();
    }
}

// --- 5.2 熔炉逻辑 ---
function updateFurnaceUI() {
    const list = document.getElementById('furnace-list');
    list.innerHTML = '';
    
    SMELT_RECIPES.forEach(r => {
        let d = document.createElement('div');
        d.className = 'recipe-row';
        const has = player.inventory[r.in] || 0;
        d.innerHTML = `
            <div>${r.in} <span style="font-size:12px">➡️</span> <b>${r.out}</b></div>
            <button onclick="smeltItem('${r.in}', '${r.out}')" ${has<1?'disabled':''}>烧炼</button>
        `;
        list.appendChild(d);
    });
}
window.smeltItem = function(In, Out) {
    if (player.inventory[In] > 0) {
        player.inventory[In]--;
        if(player.inventory[In]<=0) delete player.inventory[In];
        addItemToInventory(Out, 1);
        log(`烧炼完成：${Out}`, "orange");
        updateFurnaceUI(); saveGame();
    }
}

// --- 5.3 附魔台逻辑 (简化：消耗材料升级攻击) ---
function updateEnchantUI() {
    const list = document.getElementById('enchant-list');
    list.innerHTML = `
        <div style="padding:10px; text-align:center">当前攻击力: ${player.atk}</div>
        <div class="recipe-row">
            <div><b>武器锋利化</b> (消耗: 铁锭x1, 金锭x1) <br><small>攻击力 +5</small></div>
            <button onclick="enchantAtk()">强化</button>
        </div>
        <div class="recipe-row">
            <div><b>生命祝福</b> (消耗: 腐肉x5, 骨头x5) <br><small>HP上限 +10</small></div>
            <button onclick="enchantHp()">强化</button>
        </div>
    `;
}
window.enchantAtk = function() {
    if ((player.inventory["铁锭"]||0) >=1 && (player.inventory["金锭"]||0) >=1) {
        player.inventory["铁锭"]--; player.inventory["金锭"]--;
        player.atk += 5;
        log("强化成功！攻击力提升了。", "gold");
        updateEnchantUI(); saveGame();
    } else { log("材料不足！", "red"); }
}
window.enchantHp = function() {
    if ((player.inventory["腐肉"]||0) >=5 && (player.inventory["骨头"]||0) >=5) {
        player.inventory["腐肉"]-=5; player.inventory["骨头"]-=5;
        player.maxHp += 10; player.hp += 10;
        log("仪式完成！生命力涌现。", "gold");
        updateEnchantUI(); saveGame();
    } else { log("材料不足！", "red"); }
}

// --- 6. 战斗系统 ---

function startCombat(mob, index) {
    currentEnemy = mob; currentEnemy.index = index;
    switchView('combat');
    document.getElementById('enemy-name').innerText = mob.name;
    document.getElementById('combat-log-area').innerHTML = `<p>遭遇 ${mob.name}！</p>`;
    updateCombatUI();
}

function updateCombatUI() {
    if(!currentEnemy) return;
    const hpPct = (currentEnemy.hp / currentEnemy.maxHp) * 100;
    document.getElementById('enemy-hp-bar').style.width = `${hpPct}%`;
    document.getElementById('enemy-stats').innerText = `HP: ${currentEnemy.hp}/${currentEnemy.maxHp}`;
}

function combatAttack() {
    if(!currentEnemy) return;
    // 玩家攻击
    const dmg = player.atk + Math.floor(Math.random()*3);
    currentEnemy.hp -= dmg;
    combatLog(`你造成 ${dmg} 伤害`, "green");
    document.querySelector('.enemy-box').classList.add('shake');
    setTimeout(()=>document.querySelector('.enemy-box').classList.remove('shake'), 200);

    if (currentEnemy.hp <= 0) {
        combatLog(`胜利！获得 ${currentEnemy.loot}`, "gold");
        addItemToInventory(currentEnemy.loot, 1);
        currentSceneItems.splice(currentEnemy.index, 1);
        setTimeout(() => { switchView('scene'); renderScene(); currentEnemy = null; }, 1000);
        return;
    }
    setTimeout(enemyTurn, 500);
    updateCombatUI();
}

function enemyTurn() {
    if(!currentEnemy || currentEnemy.hp<=0) return;
    const dmg = Math.max(1, currentEnemy.atk - Math.floor(Math.random()));
    player.hp -= dmg;
    player.sanity = Math.max(0, player.sanity - 2);
    combatLog(`受到 ${dmg} 伤害`, "red");
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
        currentEnemy = null;
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
    alert("你死亡了！存档已删除。");
    location.reload();
}

// --- 7. 通用函数 ---

function addItemToInventory(name, count) {
    player.inventory[name] = (player.inventory[name]||0) + count;
}
function collectResource(idx) {
    const item = currentSceneItems[idx];
    addItemToInventory(item.name, item.count);
    currentSceneItems.splice(idx, 1);
    renderScene();
}

function useItem(name) {
    // 检查是否是建筑物品
    const recipe = RECIPES.find(r => r.name === name);
    if (recipe && recipe.type === 'build') {
        placeBuilding(name);
        return;
    }

    if (name === "烤肉串" || name === "熟鱼") { player.hunger += 35; log("真香！"); }
    else if (name === "草药绷带") { player.hp += 25; log("回血了"); }
    else if (name === "篝火") { player.sanity += 20; log("暖和多了"); }
    else if (name === "石斧" || name === "铁剑" || name === "金剑") { 
        // 简单处理：装备后提升攻击力，消耗物品
        player.atk = recipe.val; 
        log(`装备了 ${name}，攻击力 ${player.atk}`, "gold");
    }
    
    if(player.inventory[name]) {
        player.inventory[name]--;
        if(player.inventory[name]<=0) delete player.inventory[name];
    }
    updateStatsUI(); updateInventoryUI();
}

function craftItem(r) {
    for (let [m, q] of Object.entries(r.req)) if((player.inventory[m]||0)<q) return;
    for (let [m, q] of Object.entries(r.req)) {
        player.inventory[m]-=q; 
        if(player.inventory[m]<=0) delete player.inventory[m];
    }
    addItemToInventory(r.name, 1);
    updateInventoryUI(); updateCraftUI();
    log(`制作了 ${r.name}`);
}

function updateInventoryUI() {
    const list = document.getElementById('inventory-list');
    list.innerHTML = '';
    for(let [n, c] of Object.entries(player.inventory)) {
        let div = document.createElement('div');
        div.className = 'list-item';
        // 判断是否可用
        const r = RECIPES.find(x=>x.name===n);
        let btnText = "使用";
        if (r && r.type === 'build') btnText = "放置";
        
        div.innerHTML = `<span>${n} x${c}</span> <button onclick="useItem('${n}')">${btnText}</button>`;
        list.appendChild(div);
    }
}
function updateCraftUI() {
    const list = document.getElementById('craft-list');
    list.innerHTML = '';
    RECIPES.forEach(r => {
        let div = document.createElement('div');
        div.className = 'list-item';
        let reqs = Object.entries(r.req).map(([m,q]) => {
            let has = player.inventory[m]||0;
            return `<span style="color:${has>=q?'green':'red'}">${m} ${has}/${q}</span>`;
        }).join(' ');
        let can = Object.entries(r.req).every(([m,q]) => (player.inventory[m]||0)>=q);
        div.innerHTML = `
            <div><b>${r.name}</b><br><small>${r.desc}</small><br><small>${reqs}</small></div>
            <button onclick="craftItem(RECIPES.find(x=>x.name=='${r.name}'))" ${!can?'disabled style="background:#ccc"':''}>制作</button>
        `;
        list.appendChild(div);
    });
}
function updateStatsUI() {
    document.getElementById('hp').innerText = player.hp > player.maxHp ? player.maxHp : player.hp;
    document.getElementById('hunger').innerText = player.hunger;
    document.getElementById('water').innerText = player.water;
    document.getElementById('sanity').innerText = player.sanity;
}

function switchView(v) {
    ['scene','inventory','craft','combat','chest','furnace','enchant'].forEach(id => {
        document.getElementById(id+'-view').classList.add('hidden');
    });
    document.getElementById(v+'-view').classList.remove('hidden');
}

// 启动
function init() {
    if (!loadGame()) {
        addItemToInventory("烤肉串", 2);
        log("新游戏开始！", "gold");
    }
    refreshLocation();
    updateStatsUI();
}
// 辅助函数
function log(m, c) { 
    const l = document.getElementById('game-log'); 
    l.innerHTML = `<p style="color:${c||'black'}">> ${m}</p>` + l.innerHTML; 
}
window.search = function() { passTime(2); refreshLocation(); log("探索了一番"); }

// 地图相关 (保持不变)
function openMap() { document.getElementById('map-modal').classList.remove('hidden'); renderBigMap(); }
function closeMap() { document.getElementById('map-modal').classList.add('hidden'); }
function updateMiniMap() {
    const n = (x,y) => (x<0||x>=20||y<0||y>=20) ? "边界" : BIOMES[Object.keys(BIOMES)[Math.abs((x*37+y*13)%8)]].name;
    document.getElementById('dir-n').innerText = n(player.x, player.y-1);
    document.getElementById('dir-s').innerText = n(player.x, player.y+1);
    document.getElementById('dir-w').innerText = n(player.x-1, player.y);
    document.getElementById('dir-e').innerText = n(player.x+1, player.y);
}
function renderBigMap() {
    const el = document.getElementById('big-grid');
    el.innerHTML='';
    el.style.gridTemplateColumns = `repeat(20, 1fr)`;
    el.style.gridTemplateRows = `repeat(20, 1fr)`;
    for(let y=0; y<20; y++) for(let x=0; x<20; x++) {
        let d = document.createElement('div');
        let key = `${x},${y}`;
        if(exploredMap[key]) {
            let t = Object.keys(BIOMES)[Math.abs((x*37+y*13)%8)];
            d.className = `map-cell ${BIOMES[t].code}`;
            d.innerText = BIOMES[t].name.substring(0,2);
            // 显示家
            if(player.home && player.home.x===x && player.home.y===y) {
                d.style.border = "2px solid gold";
                d.innerText = "家";
            }
        } else { d.className='map-cell fog'; }
        if(x===player.x && y===player.y) { d.classList.add('player'); d.innerText="我"; }
        el.appendChild(d);
    }
}

init();

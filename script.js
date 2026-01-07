// --- 1. 游戏配置与数据 ---
const MAP_SIZE = 20;

// --- 1. 双世界地形配置 ---
const BIOMES = {
    // === 主世界 ===
    PLAINS: { name: "草原", code: "bg-PLAINS", res: ["杂草", "野花", "木棍", "种子", "浆果"], mobs: [{name:"野兔", hp:20, atk:2, loot:"生兔肉"}, {name:"僵尸", hp:50, atk:8, loot:"腐肉"}] },
    FOREST: { name: "森林", code: "bg-FOREST", res: ["原木", "木棍", "浆果", "蘑菇", "药草", "树脂"], mobs: [{name:"狼", hp:40, atk:5, loot:"皮革"}, {name:"骷髅", hp:45, atk:10, loot:"骨头"}] },
    DESERT: { name: "沙漠", code: "bg-DESERT", res: ["沙子", "仙人掌", "枯木", "芦荟", "岩浆源"], mobs: [{name:"毒蝎", hp:30, atk:12, loot:"毒囊"}] },
    MOUNTAIN: { name: "山脉", code: "bg-MOUNTAIN", res: ["石头", "铁矿石", "煤炭", "燧石", "铜矿石"], mobs: [{name:"山羊", hp:60, atk:6, loot:"羊肉"}] },
    SNOWY: { name: "雪原", code: "bg-SNOWY", res: ["冰块", "雪球", "原木", "冻肉"], mobs: [{name:"流浪者", hp:60, atk:9, loot:"冰凌"}] },
    OCEAN: { name: "海洋", code: "bg-OCEAN", res: ["水", "生鱼", "海带", "珊瑚", "贝壳"], mobs: [{name:"溺尸", hp:55, atk:8, loot:"三叉戟碎片"}, {name:"海龟", hp:80, atk:3, loot:"海龟"}] },
    SWAMP: { name: "沼泽", code: "bg-SWAMP", res: ["粘土", "藤蔓", "有毒孢子", "污泥"], mobs: [{name:"史莱姆", hp:25, atk:4, loot:"粘液球"}] },
    MESA: { name: "恶地", code: "bg-MESA", res: ["红沙", "金矿石", "硫磺", "岩浆源"], mobs: [{name:"巨型蜘蛛", hp:70, atk:12, loot:"蛛丝"}] },
    
    // === 地狱 (独立世界) ===
    NETHER_WASTES: { 
        name: "地狱荒原", code: "bg-NETHER", 
        res: ["地狱岩", "石英矿", "岩浆源"], 
        mobs: [{name:"僵尸猪人", hp:100, atk:15, loot:"金粒"}] 
    },
    CRIMSON_FOREST: { 
        name: "绯红森林", code: "bg-CRIMSON", 
        res: ["绯红菌柄", "地狱疣", "萤石"], 
        mobs: [{name:"猪灵", hp:80, atk:18, loot:"金锭"}] 
    },
    SOUL_SAND_VALLEY: { 
        name: "灵魂沙峡谷", code: "bg-SOUL", 
        res: ["灵魂沙", "骨块", "玄武岩"], 
        mobs: [{name:"骷髅射手", hp:60, atk:12, loot:"骨头"}, {name:"恶魂", hp:50, atk:25, loot:"恶魂之泪"}] 
    },
    LAVA_SEA: { 
        name: "岩浆海", code: "bg-LAVA", 
        res: ["岩浆源", "黑石"], 
        mobs: [{name:"烈焰人", hp:70, atk:16, loot:"烈焰棒"}, {name:"岩浆怪", hp:90, atk:10, loot:"岩浆膏"}] 
    }
};

// --- 2. 扩充后的合成配方 ---
const RECIPES = [
    // === 建筑类 (补回) ===
    { name: "储物箱", req: { "原木": 8 }, type: "build", desc: "放置后可存储物品" },
    { name: "熔炉", req: { "石头": 8 }, type: "build", desc: "用于烧炼矿物" },
    { name: "附魔台", req: { "原木": 4, "金矿石": 2, "皮革": 2 }, type: "build", desc: "强化装备" },
    { name: "下界传送门", req: { "黑曜石": 10, "打火石": 1 }, type: "build", desc: "放置后点击进入地狱" },

    // === 核心科技 ===
    { name: "铁锭", req: { "铁矿石": 1, "煤炭": 1 }, type: "item", desc: "基础工业材料" },
    { name: "打火石", req: { "铁锭": 1, "燧石": 1 }, type: "item", desc: "点火工具" },
    { name: "铁桶", req: { "铁锭": 3 }, type: "item", desc: "装流体用" },
    { name: "黑曜石", req: { "岩浆桶": 1, "水": 1 }, type: "item", desc: "坚硬方块" },

    // === 基础工具/武器 ===
    { name: "石斧", req: { "木棍": 2, "石头": 3 }, type: "equip", effect: "atk", val: 8, desc: "基础工具 (攻8)" },
    { name: "铜剑", req: { "木棍": 2, "铜矿石": 3 }, type: "equip", effect: "atk", val: 14, desc: "比石器好用 (攻14)" },
    { name: "铁剑", req: { "木棍": 2, "铁矿石": 3, "煤炭": 1 }, type: "equip", effect: "atk", val: 20, desc: "标准武器 (攻20)" },
    { name: "黑曜石匕首", req: { "木棍": 1, "燧石": 4 }, type: "equip", effect: "atk", val: 16, desc: "锋利的匕首 (攻16)" },
    { name: "黄金三叉戟", req: { "金矿石": 5, "三叉戟碎片": 1, "原木": 2 }, type: "equip", effect: "atk", val: 35, desc: "传说武器 (攻35)" },
    { name: "仙人掌刺棒", req: { "仙人掌": 3, "木棍": 2 }, type: "equip", effect: "atk", val: 12, desc: "沙漠特产 (攻12)" },

    // === 防具 ===
    { name: "皮革护甲", req: { "皮革": 5 }, type: "equip", effect: "hp_max", val: 120, desc: "HP上限 -> 120" },
    { name: "龟壳头盔", req: { "海龟": 1, "藤蔓": 2 }, type: "equip", effect: "hp_max", val: 150, desc: "HP上限 -> 150" },
    { name: "贝壳盾", req: { "贝壳": 5, "木棍": 2 }, type: "equip", effect: "hp_max", val: 115, desc: "HP上限 -> 115" },

    // === 生存/消耗品 ===
    { name: "篝火", req: { "原木": 3, "石头": 3 }, type: "use", effect: "warm", val: 25, desc: "恢复 25 理智" },
    { name: "草药绷带", req: { "杂草": 2, "药草": 2 }, type: "use", effect: "heal", val: 40, desc: "强效治疗 (HP+40)" },
    { name: "芦荟胶", req: { "芦荟": 3 }, type: "use", effect: "heal", val: 30, desc: "清凉伤药 (HP+30)" },
    { name: "纯净水", req: { "雪球": 3, "煤炭": 1 }, type: "use", effect: "drink", val: 50, desc: "恢复 50 水分" },
    
    // === 食物 ===
    { name: "烤肉串", req: { "生兔肉": 1, "木棍": 1 }, type: "use", effect: "food", val: 35, desc: "恢复 35 饥饿" },
    { name: "蘑菇汤", req: { "蘑菇": 3, "水": 1 }, type: "use", effect: "food", val: 45, desc: "恢复 45 饥饿" },
    { name: "海带汤", req: { "海带": 3, "水": 1 }, type: "use", effect: "food", val: 40, desc: "恢复 40 饥饿" },
    { name: "炖肉汤", req: { "羊肉": 1, "蘑菇": 1, "水": 1 }, type: "use", effect: "food", val: 70, desc: "恢复 70 饥饿" }
];

// 玩家状态
let player = { 
    x: 10, y: 10, 
    hp: 100, maxHp: 100, 
    hunger: 100, maxHunger: 100,
    water: 100, maxWater: 100,
    sanity: 100, maxSanity: 100, 
    atk: 5, 
    inventory: {} 
};

let gameTime = { day: 1, hour: 8 };
let exploredMap = {}; 
let currentSceneItems = [];
let currentEnemy = null; 

let currentDimension = "OVERWORLD"; // 当前维度
let exploredMapMain = {};   // 主世界探索
let exploredMapNether = {}; // 地狱探索
let buildingsMain = {};     // 主世界建筑
let buildingsNether = {};   // 地狱建筑
let activeBuilding = null; // 当前打开的建筑

let playerPosMain = {x: 10, y: 10};
let playerPosNether = {x: 10, y: 10}; 

function getCurrBuildings() {
    return currentDimension === "OVERWORLD" ? buildingsMain : buildingsNether;
}

// --- 2. 核心系统：时间与状态 ---

function passTime(hours) {
    gameTime.hour += hours;
    
    player.hunger = Math.max(0, player.hunger - (2 * hours));
    player.water = Math.max(0, player.water - (3 * hours));

    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;

    if (isNight) {
        player.sanity = Math.max(0, player.sanity - (3 * hours));
        if (player.sanity < 50) log("黑暗中似乎有眼睛在盯着你... (理智下降)", "purple");
    }

    if (player.hunger === 0 || player.water === 0) {
        player.hp = Math.max(0, player.hp - 5);
        log("你感到饥渴难耐，生命值正在流逝...", "red");
    }
    if (player.sanity === 0) {
        player.hp = Math.max(0, player.hp - 10);
        log("你已经疯了！极度恐惧让你心脏剧痛 (HP -10)", "purple");
    }

    if (gameTime.hour >= 24) {
        gameTime.hour -= 24;
        gameTime.day += 1;
        log(`=== 第 ${gameTime.day} 天开始了 ===`);
    }

    document.getElementById('clock-time').innerText = `${String(gameTime.hour).padStart(2, '0')}:00`;
    updateDayNightCycle();
    updateStatsUI();
}

function updateDayNightCycle() {
    const body = document.body;
    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
    if (isNight) {
        if (!body.classList.contains('night-mode')) body.classList.add('night-mode');
    } else {
        if (body.classList.contains('night-mode')) body.classList.remove('night-mode');
    }
}

// --- 3. 核心系统：移动与地图 ---

function move(dx, dy) {
    if(currentEnemy || document.getElementById('combat-view').className.indexOf('hidden') === -1) {
        return log("战斗中无法移动！", "red");
    }
    if (player.hp <= 0) return log("你已经倒下了，请刷新重来。", "red");

    const newX = player.x + dx;
    const newY = player.y + dy;

    if (newX < 0 || newX >= MAP_SIZE || newY < 0 || newY >= MAP_SIZE) {
        return log("前方是世界的尽头。");
    }

    player.x = newX;
    player.y = newY;
    
    passTime(1); 
    refreshLocation();
}

function getBiome(x, y) {
    if (currentDimension === "OVERWORLD") {
        const keys = ["PLAINS", "FOREST", "DESERT", "MOUNTAIN", "SNOWY", "OCEAN", "SWAMP", "MESA"];
        return keys[Math.abs((x * 37 + y * 13) % keys.length)];
    } else {
        const keys = ["NETHER_WASTES", "CRIMSON_FOREST", "SOUL_SAND_VALLEY", "LAVA_SEA"];
        return keys[Math.abs((x * 7 + y * 19) % keys.length)];
    }
}

// --- 4. 核心系统：交互与战斗 ---

function generateScene(biomeKey) {
    currentSceneItems = [];
    const biome = BIOMES[biomeKey];
    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
    
    const resCount = 3 + Math.floor(Math.random() * 4);
    for(let i=0; i<resCount; i++) {
        const name = biome.res[Math.floor(Math.random() * biome.res.length)];
        currentSceneItems.push({ type: 'res', name: name, count: Math.floor(Math.random()*3)+1 });
    }

    let mobChance = isNight ? 0.8 : 0.3; 
    if (currentDimension === "NETHER") mobChance = 0.9;

    if (Math.random() < mobChance) {
        const mobTemplate = biome.mobs[Math.floor(Math.random() * biome.mobs.length)];
        
        let mob = { 
            type: 'mob', 
            name: mobTemplate.name, 
            hp: mobTemplate.hp, 
            maxHp: mobTemplate.hp,
            atk: mobTemplate.atk,
            loot: mobTemplate.loot
        };

        if (isNight || currentDimension === "NETHER") {
            mob.name = (currentDimension === "NETHER" ? "地狱的" : "狂暴的") + mob.name;
            mob.hp = Math.floor(mob.hp * 1.5);
            mob.maxHp = mob.hp;
            mob.atk = Math.floor(mob.atk * 1.5);
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
        
        if (b.name === "下界传送门") {
            btn.innerText = "🔮 下界传送门";
            btn.style.borderColor = "#8e44ad";
            btn.style.color = "#8e44ad";
            btn.onclick = () => usePortal();
        } else {
            btn.innerText = `🏠 ${b.name}`;
            btn.onclick = () => openBuilding(b, idx);
        }
        grid.appendChild(btn);
    });

    currentSceneItems.forEach((item, index) => {
        const btn = document.createElement('div');
        btn.className = `grid-btn ${item.type}`;
        if (item.type === 'res') {
            btn.innerText = `${item.name} (${item.count})`;
            btn.onclick = () => collectResource(index);
        } else {
            btn.innerText = `${item.name} [??]`; 
            btn.classList.add('mob');
            btn.onclick = () => startCombat(item, index);
        }
        grid.appendChild(btn);
    });
}

function collectResource(index) {
    const item = currentSceneItems[index];
    if (!item) return;

    // --- 特殊采集：岩浆源 ---
    if (item.name === "岩浆源") {
        if (!player.inventory["铁桶"] || player.inventory["铁桶"] <= 0) {
            log("太烫了！你需要一个 [铁桶] 来装岩浆。", "red");
            return;
        }
        player.inventory["铁桶"]--;
        addItemToInventory("岩浆桶", 1);
        log("成功装取了岩浆！", "orange");
        item.count--;
        if (item.count <= 0) currentSceneItems.splice(index, 1);
        renderScene();
        updateInventoryUI();
        return;
    }

    let hpCost = 0;
    if (player.hunger > 0) player.hunger -= 1;
    else { hpCost += 2; log("饥饿时劳作透支体力...", "red"); }

    if (player.water > 0) player.water -= 1;
    else { hpCost += 2; log("极度口渴导致眩晕...", "red"); }

    if (hpCost > 0) {
        player.hp -= hpCost;
        document.body.classList.remove('shake');
        void document.body.offsetWidth;
        document.body.classList.add('shake');
        if (player.hp <= 0) { die(); return; }
    }

    updateStatsUI(); 
    addItemToInventory(item.name, 1);
    item.count--;
    
    if (hpCost === 0) log(`采集了 1个 ${item.name}`);
    if (item.count <= 0) currentSceneItems.splice(index, 1);
    renderScene();
}

// --- 5. 战斗系统 ---

function startCombat(mob, index) {
    currentEnemy = mob;
    currentEnemy.index = index;
    switchView('combat');
    document.getElementById('enemy-name').innerText = mob.name;
    document.getElementById('combat-log-area').innerHTML = `<p>遭遇了 ${mob.name}！</p>`;
    updateCombatUI();
}

function updateCombatUI() {
    if(!currentEnemy) return;
    const hpPct = (currentEnemy.hp / currentEnemy.maxHp) * 100;
    document.getElementById('enemy-hp-bar').style.width = `${hpPct}%`;
    document.getElementById('enemy-stats').innerText = `HP: ${currentEnemy.hp}/${currentEnemy.maxHp} | ATK: ${currentEnemy.atk}`;
    
    if (player.hp <= 0) {
        document.getElementById('combat-log-area').innerHTML += `<p style="color:red">你被杀死了...</p>`;
    }
}

function combatLog(msg, color="#333") {
    const el = document.getElementById('combat-log-area');
    el.innerHTML = `<p style="color:${color}">${msg}</p>` + el.innerHTML;
}

function combatAttack() {
    if (!currentEnemy || currentEnemy.hp <= 0) return;

    const pDmg = player.atk + Math.floor(Math.random() * 3);
    currentEnemy.hp -= pDmg;
    combatLog(`你造成 ${pDmg} 伤害`, "green");
    updateCombatUI(); 

    const box = document.querySelector('.enemy-box');
    box.classList.remove('shake');
    void box.offsetWidth; 
    box.classList.add('shake');

    if (currentEnemy.hp <= 0) {
        const loot = currentEnemy.loot;
        const idx = currentEnemy.index;
        currentEnemy = null; 
        combatLog(`胜利！获得 ${loot}`, "gold");
        addItemToInventory(loot, 1);
        if (currentSceneItems[idx]) currentSceneItems.splice(idx, 1);
        setTimeout(() => { switchView('scene'); renderScene(); }, 800);
        return; 
    }

    const eDmg = Math.max(1, currentEnemy.atk - Math.floor(Math.random()));
    player.hp -= eDmg;
    player.sanity = Math.max(0, player.sanity - 1); 
    combatLog(`受到 ${eDmg} 伤害`, "red");
    
    document.body.classList.remove('shake');
    void document.body.offsetWidth;
    document.body.classList.add('shake');

    if (player.hp <= 0) die();
    updateStatsUI();
    updateCombatUI();
}

function combatFlee() {
    if (Math.random() > 0.5) {
        log("你逃跑了...", "orange");
        player.sanity = Math.max(0, player.sanity - 5);
        currentEnemy = null;
        switchView('scene');
    } else {
        combatLog("逃跑失败！", "red");
        const eDmg = Math.max(1, currentEnemy.atk - Math.floor(Math.random()));
        player.hp -= eDmg;
        updateStatsUI();
        updateCombatUI();
    }
}

// --- 6. 物品系统与修复的 useItem ---

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
            
            // 判断按钮类型
            const r = RECIPES.find(x => x.name === name);
            let btnText = "使用";
            if (r && r.type === 'build') btnText = "放置";
            else if (r && r.type === 'equip') btnText = "装备";
            
            row.innerHTML = `<span>${name}</span> <b>x${count}</b> <button onclick="useItem('${name}')">${btnText}</button>`;
            list.appendChild(row);
        }
    }
}

// 修复后的 useItem 函数
function useItem(name) {
    if (!player.inventory[name] || player.inventory[name] <= 0) return;

    let recipe = RECIPES.find(r => r.name === name);

    // 1. 建筑放置
    if (recipe && recipe.type === 'build') {
        placeBuilding(name);
        return; 
    }
    
    // 2. 特殊物品与消耗
    if (name === "浆果") {
        player.hunger += 5; player.sanity += 2; log("吃了浆果，酸酸甜甜。");
    }
    else if (recipe) {
        if (recipe.effect === 'food') {
            player.hunger = Math.min(player.maxHunger, player.hunger + recipe.val);
            log(`食用 ${name}，恢复饥饿。`);
        } 
        else if (recipe.effect === 'drink') {
            player.water = Math.min(player.maxWater, player.water + recipe.val);
            log(`饮用 ${name}，恢复水分。`);
        }
        else if (recipe.effect === 'heal') {
            player.hp = Math.min(player.maxHp, player.hp + recipe.val);
            log(`使用 ${name}，恢复生命。`);
        } 
        else if (recipe.effect === 'warm') {
            player.sanity = Math.min(player.maxSanity, player.sanity + recipe.val);
            log(`使用 ${name}，恢复理智。`, "purple");
        }
        else if (recipe.effect === 'atk') {
            player.atk = recipe.val;
            log(`装备了 ${name}！攻击力 -> ${player.atk}`, "gold");
        }
        else if (recipe.effect === 'hp_max') {
            player.maxHp = recipe.val; player.hp = player.maxHp;
            log(`装备了 ${name}！生命上限 -> ${player.maxHp}`, "gold");
        }
    }

    // 扣除物品
    player.inventory[name]--;
    if (player.inventory[name] <= 0) delete player.inventory[name];

    updateStatsUI();
    updateInventoryUI();
}

function updateCraftUI() {
    const list = document.getElementById('craft-list');
    list.innerHTML = '';

    RECIPES.forEach(recipe => {
        // 过滤掉 type='item' 的配方（如果有熔炉系统，这些可能不应该在徒手制作里显示，但简化版先显示）
        // 或者只显示 type='use', 'equip', 'build' 以及部分 'item'
        
        const row = document.createElement('div');
        row.className = 'list-item';
        let reqStr = [];
        let canCraft = true;
        for (let [mat, qty] of Object.entries(recipe.req)) {
            const has = player.inventory[mat] || 0;
            const color = has >= qty ? '#2ecc71' : '#e74c3c';
            reqStr.push(`<span style="color:${color}">${mat} ${has}/${qty}</span>`);
            if (has < qty) canCraft = false;
        }

        row.innerHTML = `
            <div style="flex:1">
                <div style="font-weight:bold">${recipe.name}</div>
                <div style="font-size:10px;color:#666">${recipe.desc}</div>
                <div style="font-size:10px;background:#f5f5f5;padding:2px;">${reqStr.join(' ')}</div>
            </div>
        `;
        const btn = document.createElement('button');
        btn.innerText = "制作";
        btn.disabled = !canCraft;
        if(!canCraft) btn.style.background = "#ccc";
        btn.onclick = () => craftItem(recipe);
        row.appendChild(btn);
        list.appendChild(row);
    });
}

function craftItem(recipe) {
    for (let [mat, qty] of Object.entries(recipe.req)) {
        if((player.inventory[mat] || 0) < qty) return; 
    }
    for (let [mat, qty] of Object.entries(recipe.req)) {
        player.inventory[mat] -= qty;
        if(player.inventory[mat]<=0) delete player.inventory[mat];
    }
    addItemToInventory(recipe.name, 1);
    
    if (recipe.effect === 'atk') {
        player.atk = recipe.val;
        log(`制作并装备 ${recipe.name}，攻 -> ${player.atk}`, "gold");
    } else {
        log(`制作成功: ${recipe.name}`);
    }
    updateInventoryUI();
    updateCraftUI();
    updateStatsUI();
}

// --- 7. 辅助与建筑功能 (补回丢失的函数) ---

function placeBuilding(name) {
    const buildings = getCurrBuildings(); 
    const key = `${player.x},${player.y}`;
    
    if (!buildings[key]) buildings[key] = [];
    
    let newBuild = { name: name };
    if (name === "储物箱") newBuild.content = {};
    
    buildings[key].push(newBuild);
    log(`在脚下放置了 ${name}`, "blue");
    
    player.inventory[name]--;
    if (player.inventory[name] <= 0) delete player.inventory[name];
    
    refreshLocation();
    updateInventoryUI();
}

function usePortal() {
    if (currentDimension === "OVERWORLD") {
        log("进入下界传送门... 空间扭曲！", "purple");
        playerPosMain = {x: player.x, y: player.y};
        currentDimension = "NETHER";
        player.x = playerPosNether.x; player.y = playerPosNether.y;
        
        const key = `${player.x},${player.y}`;
        if (!buildingsNether[key]) buildingsNether[key] = [];
        if (!buildingsNether[key].some(b => b.name === "下界传送门")) {
            buildingsNether[key].push({name: "下界传送门"});
        }
    } else {
        log("逃离地狱，回到主世界。", "blue");
        playerPosNether = {x: player.x, y: player.y};
        currentDimension = "OVERWORLD";
        player.x = playerPosMain.x; player.y = playerPosMain.y;
    }
    refreshLocation();
}

// 补回 openBuilding 和 closeBuilding
function openBuilding(b, idx) {
    activeBuilding = b;
    if (b.name === "储物箱") { switchView('chest'); updateChestUI(); }
    else if (b.name === "熔炉") { switchView('furnace'); updateFurnaceUI(); } // 熔炉UI逻辑暂未完全实现，如有需要可添加
    else if (b.name === "附魔台") { switchView('enchant'); updateEnchantUI(); }
}

window.closeBuilding = function() {
    activeBuilding = null;
    switchView('scene');
}

// 简单的箱子UI逻辑 (防止报错)
function updateChestUI() {
    const pList = document.getElementById('chest-player-inv');
    const cList = document.getElementById('chest-storage');
    if(!pList || !cList) return;
    pList.innerHTML = ''; cList.innerHTML = '';
    
    for (let [k, v] of Object.entries(player.inventory)) {
        let d = document.createElement('div'); d.className = 'list-item';
        d.innerHTML = `<span>${k} x${v}</span> <button onclick="moveToChest('${k}')">→</button>`;
        pList.appendChild(d);
    }
    for (let [k, v] of Object.entries(activeBuilding.content || {})) {
        let d = document.createElement('div'); d.className = 'list-item';
        d.innerHTML = `<button onclick="takeFromChest('${k}')">←</button> <span>${k} x${v}</span>`;
        cList.appendChild(d);
    }
}
window.moveToChest = function(n) {
    if (player.inventory[n] > 0) {
        player.inventory[n]--; if (player.inventory[n]<=0) delete player.inventory[n];
        activeBuilding.content[n] = (activeBuilding.content[n]||0) + 1;
        updateChestUI();
    }
}
window.takeFromChest = function(n) {
    if (activeBuilding.content[n] > 0) {
        activeBuilding.content[n]--; if (activeBuilding.content[n]<=0) delete activeBuilding.content[n];
        addItemToInventory(n, 1);
        updateChestUI();
    }
}

// 占位函数防止报错
function updateFurnaceUI() { document.getElementById('furnace-list').innerHTML = '<div style="padding:10px">熔炉功能暂未实装，请直接在制作栏合成铁锭。</div>'; }
function updateEnchantUI() { document.getElementById('enchant-list').innerHTML = '<div style="padding:10px">附魔功能暂未实装。</div>'; }
window.setHome = function() { player.home = {dim: currentDimension, x: player.x, y: player.y}; log("已安家。", "gold"); refreshLocation(); }


// --- 渲染 ---

function refreshLocation() {
    let currentMap = currentDimension === "OVERWORLD" ? exploredMapMain : exploredMapNether;
    currentMap[`${player.x},${player.y}`] = true;

    const biomeKey = getBiome(player.x, player.y);
    const biome = BIOMES[biomeKey];
    
    let titleColor = currentDimension === "OVERWORLD" ? "#333" : "#c0392b"; 
    let titleHtml = `<span style="color:${titleColor}">${biome.name}</span>`;
    
    if(player.home && player.home.dim === currentDimension && player.home.x === player.x && player.home.y === player.y) {
        titleHtml += " <span style='color:gold'>(家)</span>";
    }
    
    document.getElementById('loc-name').innerHTML = titleHtml;
    document.getElementById('coord').innerText = `${player.x},${player.y}`;
    
    if (currentDimension === "NETHER") {
        document.body.style.backgroundColor = "#2c0505"; 
        document.querySelector('.app-container').style.borderColor = "#500";
    } else {
        document.body.style.backgroundColor = "#333";
        document.querySelector('.app-container').style.borderColor = "#fff";
    }
    
    generateScene(biomeKey);
    renderScene();
    updateMiniMap();
    
    if (!document.getElementById('map-modal').classList.contains('hidden')) {
        renderBigMap();
    }
}

function updateStatsUI() {
    document.getElementById('hp').innerText = player.hp;
    document.getElementById('hunger').innerText = player.hunger;
    document.getElementById('water').innerText = player.water;
    document.getElementById('sanity').innerText = player.sanity; 
}

function switchView(viewName) {
    ['scene','inventory','craft','combat','chest','furnace','enchant'].forEach(v => {
        const el = document.getElementById(v+'-view');
        if(el) el.classList.add('hidden');
    });

    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    const viewEl = document.getElementById(viewName+'-view');
    if(viewEl) viewEl.classList.remove('hidden');

    if (viewName === 'scene') document.querySelectorAll('.bottom-nav .nav-item')[2].classList.add('active');
    else if (viewName === 'inventory') {
        updateInventoryUI();
        document.querySelectorAll('.bottom-nav .nav-item')[0].classList.add('active');
    }
    else if (viewName === 'craft') {
        updateCraftUI();
        document.querySelectorAll('.bottom-nav .nav-item')[1].classList.add('active');
    }
}

function openMap() { document.getElementById('map-modal').classList.remove('hidden'); renderBigMap(); }
function closeMap() { document.getElementById('map-modal').classList.add('hidden'); }

function renderBigMap() {
    const mapEl = document.getElementById('big-grid');
    if (!mapEl) return;
    mapEl.innerHTML = '';
    mapEl.style.gridTemplateColumns = `repeat(${MAP_SIZE}, 1fr)`;
    mapEl.style.gridTemplateRows = `repeat(${MAP_SIZE}, 1fr)`;
    
    const currentExplored = currentDimension === "OVERWORLD" ? exploredMapMain : exploredMapNether;

    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            const cell = document.createElement('div');
            const key = `${x},${y}`;
            
            if (currentExplored[key]) {
                const type = getBiome(x, y);
                cell.className = `map-cell ${BIOMES[type].code}`;
                cell.innerText = BIOMES[type].name.substring(0, 2);
                
                const buildings = getCurrBuildings()[key] || [];
                if (buildings.some(b => b.name === "下界传送门")) {
                    cell.style.border = "2px solid #8e44ad"; 
                    cell.innerText = "门";
                }
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

function die() {
    alert("你死亡了！页面将刷新。");
    location.reload();
}

function init() {
    addItemToInventory("烤肉串", 2);
    addItemToInventory("草药绷带", 1);
    refreshLocation();
    updateStatsUI();
    updateDayNightCycle();
    log("生存开始。注意理智值，不要在深夜游荡！");
}

init();

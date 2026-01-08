// --- 1. 游戏配置与数据 ---
const MAP_SIZE = 20;

// --- 1.1 双世界地形配置 (在此处扩展地狱) ---
const BIOMES = {
    // === 主世界 (保持原样) ===
    PLAINS: { name: "草原", code: "bg-PLAINS", res: ["杂草", "野花", "木棍", "种子", "浆果"], mobs: [{name:"野兔", hp:20, atk:2, loot:"生兔肉"}, {name:"僵尸", hp:50, atk:8, loot:"腐肉"}] },
    FOREST: { name: "森林", code: "bg-FOREST", res: ["原木", "木棍", "浆果", "蘑菇", "药草", "树脂"], mobs: [{name:"狼", hp:40, atk:5, loot:"皮革"}, {name:"骷髅", hp:45, atk:10, loot:"骨头"}] },
    DESERT: { name: "沙漠", code: "bg-DESERT", res: ["沙子", "仙人掌", "枯木", "芦荟", "岩浆源"], mobs: [{name:"毒蝎", hp:30, atk:12, loot:"毒囊"}] },
    MOUNTAIN: { name: "山脉", code: "bg-MOUNTAIN", res: ["石头", "铁矿石", "煤炭", "燧石", "铜矿石"], mobs: [{name:"山羊", hp:60, atk:6, loot:"羊肉"}] },
    SNOWY: { name: "雪原", code: "bg-SNOWY", res: ["冰块", "雪球", "原木", "冻肉"], mobs: [{name:"流浪者", hp:60, atk:9, loot:"冰凌"}] },
    OCEAN: { name: "海洋", code: "bg-OCEAN", res: ["水", "生鱼", "海带", "珊瑚", "贝壳"], mobs: [{name:"溺尸", hp:55, atk:8, loot:"三叉戟碎片"}, {name:"海龟", hp:80, atk:3, loot:"海龟"}] },
    SWAMP: { name: "沼泽", code: "bg-SWAMP", res: ["粘土", "藤蔓", "有毒孢子", "污泥"], mobs: [{name:"史莱姆", hp:25, atk:4, loot:"粘液球"}] },
    MESA: { name: "恶地", code: "bg-MESA", res: ["红沙", "金矿石", "硫磺", "岩浆源"], mobs: [{name:"巨型蜘蛛", hp:70, atk:12, loot:"蛛丝"}] },

    // === 地狱 (新增独立地形) ===
    NETHER_WASTES: { name: "地狱荒原", code: "bg-NETHER", res: ["地狱岩", "石英矿", "岩浆源"], mobs: [{name:"僵尸猪人", hp:100, atk:15, loot:"金粒"}] },
    CRIMSON_FOREST: { name: "绯红森林", code: "bg-CRIMSON", res: ["绯红菌柄", "地狱疣", "萤石"], mobs: [{name:"猪灵", hp:80, atk:18, loot:"金锭"}] },
    SOUL_SAND_VALLEY: { name: "灵魂沙峡谷", code: "bg-SOUL", res: ["灵魂沙", "骨块", "玄武岩"], mobs: [{name:"骷髅射手", hp:60, atk:12, loot:"骨头"}, {name:"恶魂", hp:50, atk:25, loot:"恶魂之泪"}] },
    LAVA_SEA: { name: "岩浆海", code: "bg-LAVA", res: ["岩浆源", "黑石"], mobs: [{name:"烈焰人", hp:70, atk:16, loot:"烈焰棒"}, {name:"岩浆怪", hp:90, atk:10, loot:"岩浆膏"}] }
};

// --- 2. 扩充后的合成配方 (加入主线物品) ---
const RECIPES = [
    // === 核心科技 (新增) ===
    { name: "铁锭", req: { "铁矿石": 1, "煤炭": 1 }, type: "item", desc: "基础工业材料" },
    { name: "打火石", req: { "铁锭": 1, "燧石": 1 }, type: "item", desc: "点火工具" },
    { name: "铁桶", req: { "铁锭": 3 }, type: "item", desc: "装流体用" },
    { name: "黑曜石", req: { "岩浆桶": 1, "水": 1 }, type: "item", desc: "坚硬方块" },
    // 传送门配方：type: 'build' 代表它是一个建筑
    { name: "下界传送门", req: { "黑曜石": 10, "打火石": 1 }, type: "build", desc: "放置后点击进入地狱" },
    
    // === 建筑类 (补回功能性建筑) ===
    { name: "储物箱", req: { "原木": 8 }, type: "build", desc: "放置后可存储物品" },

    // === 基础工具/武器 (保留原样) ===
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
    inventory: {},
    home: null 
};

let gameTime = { day: 1, hour: 8 };
let currentSceneItems = [];
let currentEnemy = null; 

// --- 新增：世界状态管理 ---
let currentDimension = "OVERWORLD"; // 当前维度: "OVERWORLD" 或 "NETHER"

// 地图数据分离
let exploredMapMain = {};   
let exploredMapNether = {}; 
let buildingsMain = {};     
let buildingsNether = {};

// 玩家坐标分离 (防止进地狱掉虚空)
let playerPosMain = {x: 10, y: 10};
let playerPosNether = {x: 10, y: 10}; 

// 辅助函数：获取当前世界的建筑数据
function getCurrBuildings() {
    return currentDimension === "OVERWORLD" ? buildingsMain : buildingsNether;
}

// 辅助函数：获取当前世界的探索数据
function getCurrExplored() {
    return currentDimension === "OVERWORLD" ? exploredMapMain : exploredMapNether;
}

// --- 2. 核心系统：时间与状态 ---

function passTime(hours) {
    gameTime.hour += hours;

    // 饥饿与水分消耗
    player.hunger = Math.max(0, player.hunger - (2 * hours));
    player.water = Math.max(0, player.water - (3 * hours));

    // 昼夜判断
    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;

    // 理智系统逻辑
    if (isNight) {
        player.sanity = Math.max(0, player.sanity - (3 * hours));
        if (player.sanity < 50) log("黑暗中似乎有眼睛在盯着你... (理智下降)", "purple");
    }

    // 状态惩罚
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
    if(currentEnemy && document.getElementById('combat-view').className.indexOf('hidden') === -1) {
        return log("战斗中无法移动！请先逃跑或击败敌人。", "red");
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

// 修改：支持双世界地形生成
function getBiome(x, y) {
    if (currentDimension === "OVERWORLD") {
        // 主世界 8 种地形
        const keys = ["PLAINS", "FOREST", "DESERT", "MOUNTAIN", "SNOWY", "OCEAN", "SWAMP", "MESA"];
        return keys[Math.abs((x * 37 + y * 13) % keys.length)];
    } else {
        // 地狱 4 种地形
        const keys = ["NETHER_WASTES", "CRIMSON_FOREST", "SOUL_SAND_VALLEY", "LAVA_SEA"];
        // 使用不同的哈希参数，让地形看起来不一样
        return keys[Math.abs((x * 7 + y * 19) % keys.length)];
    }
}

// --- 4. 核心系统：交互与战斗 ---

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

    // 生成怪物 (地狱概率更高)
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

        // 夜间或地狱强化
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

    // 1. 渲染当前世界的建筑
    const key = `${player.x},${player.y}`;
    const buildings = getCurrBuildings()[key] || [];
    
    buildings.forEach((b, idx) => {
        const btn = document.createElement('div');
        btn.className = `grid-btn build`;
        
        // 特殊处理传送门渲染
        if (b.name === "下界传送门") {
            btn.innerText = "🔮 下界传送门";
            btn.style.borderColor = "#8e44ad"; 
            btn.style.color = "#8e44ad";
            btn.onclick = () => usePortal(); // 绑定传送逻辑
        } else {
            btn.innerText = `🏠 ${b.name}`;
            btn.onclick = () => openBuilding(b, idx);
        }
        grid.appendChild(btn);
    });

    // 2. 渲染资源和怪物
    currentSceneItems.forEach((item, index) => {
        const btn = document.createElement('div');
        btn.className = `grid-btn ${item.type}`;

        if (item.type === 'res') {
            btn.innerText = `${item.name} (${item.count})`;
            btn.onclick = () => collectResource(index, btn);
        } else {
            btn.innerText = `${item.name} [??]`; 
            btn.classList.add('mob');
            btn.onclick = () => startCombat(item, index);
        }
        grid.appendChild(btn);
    });
}

// 修正版采集逻辑：支持岩浆桶 + 透支生命采集
function collectResource(index) {
    const item = currentSceneItems[index];
    if (!item) return;

    // --- 新增：岩浆采集逻辑 ---
    if (item.name === "岩浆源") {
        if (!player.inventory["铁桶"] || player.inventory["铁桶"] <= 0) {
            log("太烫了！你需要一个 [铁桶] 来装岩浆。", "red");
            return;
        }
        player.inventory["铁桶"]--;
        addItemToInventory("岩浆桶", 1);
        log("小心翼翼地装满了岩浆。", "orange");
        
        // 关键：移除资源并刷新
        item.count--;
        if (item.count <= 0) {
            currentSceneItems.splice(index, 1);
        }
        renderScene();
        updateInventoryUI();
        return; // 岩浆采集不扣体力，直接返回
    }

    // --- 原有逻辑：体力计算 ---
    let hpCost = 0;

    if (player.hunger > 0) {
        player.hunger -= 1;
    } else {
        hpCost += 2; 
        log("饥饿时强行劳作，体力透支... (HP -2)", "red");
    }

    if (player.water > 0) {
        player.water -= 1;
    } else {
        hpCost += 2; 
        log("极度口渴伴随着眩晕... (HP -2)", "red");
    }

    if (hpCost > 0) {
        player.hp -= hpCost;
        document.body.classList.remove('shake');
        void document.body.offsetWidth;
        document.body.classList.add('shake');

        if (player.hp <= 0) {
            die();
            return; 
        }
    }

    updateStatsUI(); 

    // 获得物品
    addItemToInventory(item.name, 1);
    item.count--;

    if (hpCost === 0) {
        log(`采集了 1个 ${item.name} (剩余:${item.count})`);
    }

    // 关键：数量归零移除物品
    if (item.count <= 0) {
        currentSceneItems.splice(index, 1);
    }

    renderScene();
}

// --- 5. 战斗系统 ---

function startCombat(mob, index) {
    currentEnemy = mob;
    currentEnemy.index = index;
    switchView('combat');
    document.getElementById('enemy-name').innerText = mob.name;
    document.getElementById('combat-log-area').innerHTML = `<p>遭遇了 ${mob.name}！它看起来充满敌意！</p>`;
    updateCombatUI();
}

function updateCombatUI() {
    if(!currentEnemy) return;
    const hpPct = (currentEnemy.hp / currentEnemy.maxHp) * 100;
    document.getElementById('enemy-hp-bar').style.width = `${hpPct}%`;
    document.getElementById('enemy-stats').innerText = `HP: ${currentEnemy.hp}/${currentEnemy.maxHp} | ATK: ${currentEnemy.atk}`;

    if (player.hp <= 0) {
        document.getElementById('combat-log-area').innerHTML += `<p style="color:red">你被杀死了...</p>`;
        setTimeout(() => {
            alert("你死了！刷新页面重来。");
            location.reload();
        }, 500);
    }
}

function combatLog(msg, color="#333") {
    const el = document.getElementById('combat-log-area');
    const p = document.createElement('p');
    p.innerText = msg;
    p.style.color = color;
    el.prepend(p); 
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

        if (currentSceneItems[idx]) {
            currentSceneItems.splice(idx, 1);
        }

        setTimeout(() => { 
            switchView('scene'); 
            renderScene(); 
        }, 800);
        return; 
    }

    const eDmg = Math.max(1, currentEnemy.atk - Math.floor(Math.random()));
    player.hp -= eDmg;
    player.sanity = Math.max(0, player.sanity - 1); 

    combatLog(`受到 ${eDmg} 伤害`, "red");
    document.body.classList.remove('shake');
    void document.body.offsetWidth;
    document.body.classList.add('shake');

    if (player.hp <= 0) {
        die();
    }

    updateStatsUI();
    updateCombatUI();
}

function enemyTurn() { /* 废弃，由无延迟逻辑替代 */ }

function combatFlee() {
    if (Math.random() > 0.5) {
        log("你狼狈地逃离了战场...", "orange");
        player.sanity = Math.max(0, player.sanity - 5); 
        currentEnemy = null;
        switchView('scene');
    } else {
        combatLog("逃跑失败！怪物拦住了你！", "red");
        const eDmg = Math.max(1, currentEnemy.atk - Math.floor(Math.random()));
        player.hp -= eDmg;
        updateCombatUI();
        updateStatsUI();
    }
}

// --- 6. 物品系统与合成 ---

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
            
            // 判断按钮显示文字
            let r = RECIPES.find(x => x.name === name);
            let btnText = "使用";
            if (r && r.type === 'build') btnText = "放置"; // 建筑类显示放置
            else if (r && r.type === 'equip') btnText = "装备";

            row.innerHTML = `<span>${name}</span> <b>x${count}</b> <button onclick="useItem('${name}')">${btnText}</button>`;
            list.appendChild(row);
        }
    }
}

// 修复后的 useItem：包含建筑放置逻辑
function useItem(name) {
    if (!player.inventory[name] || player.inventory[name] <= 0) return;

    let recipe = RECIPES.find(r => r.name === name);

    // 1. 拦截建筑放置逻辑 (传送门/箱子)
    if (recipe && recipe.type === 'build') {
        placeBuilding(name);
        return; // 放置后函数结束，不走下面的使用逻辑
    }

    // 2. 特殊物品与消耗
    if (name === "浆果") {
        player.hunger += 5; 
        player.sanity += 2; 
        log("吃了浆果，心情好了一点点。");
    }
    else if (recipe) {
        if (recipe.effect === 'food') {
            player.hunger = Math.min(player.maxHunger, player.hunger + recipe.val);
            log(`使用了 ${name}，美味！`);
        } 
        else if (recipe.effect === 'drink') {
            player.water = Math.min(player.maxWater, player.water + recipe.val);
        }
        else if (recipe.effect === 'heal') {
            player.hp = Math.min(player.maxHp, player.hp + recipe.val);
        } 
        else if (recipe.effect === 'warm') {
            player.sanity = Math.min(player.maxSanity, player.sanity + recipe.val);
            log(`点燃了篝火，驱散了黑暗和恐惧 (理智 +${recipe.val})`, "purple");
        }
        else if (recipe.effect === 'atk') {
            player.atk = recipe.val;
            log(`装备了 ${name}！`);
        }
        else if (recipe.effect === 'hp_max') {
            player.maxHp = recipe.val;
            player.hp = player.maxHp;
            log(`装备了 ${name}！`);
        }
    }

    player.inventory[name]--;
    if (player.inventory[name] <= 0) delete player.inventory[name];

    updateStatsUI();
    updateInventoryUI();
}

function updateCraftUI() {
    const list = document.getElementById('craft-list');
    list.innerHTML = '';

    RECIPES.forEach(recipe => {
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
        log(`制作并装备了 ${recipe.name}，攻击力 -> ${player.atk}`, "gold");
    } else {
        log(`制作成功: ${recipe.name}`);
    }
    updateInventoryUI();
    updateCraftUI();
    updateStatsUI();
}

// --- 7. 辅助功能与UI ---

function refreshLocation() {
    // 1. 记录探索：根据维度选择正确的map
    let currentMap = getCurrExplored();
    currentMap[`${player.x},${player.y}`] = true;

    const biomeKey = getBiome(player.x, player.y);
    const biome = BIOMES[biomeKey];
    
    // 2. 标题显示
    let titleHtml = biome.name;
    if (currentDimension === "NETHER") {
        titleHtml = `<span style="color:#e74c3c">🔥 ${biome.name}</span>`;
    }
    document.getElementById('loc-name').innerHTML = titleHtml;
    document.getElementById('coord').innerText = `${player.x},${player.y}`;

    // 3. 背景变色
    if (currentDimension === "NETHER") {
        document.body.style.backgroundColor = "#2c0505"; // 地狱背景
        document.querySelector('.app-container').style.borderColor = "#800";
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

function log(msg, color="black") {
    const el = document.getElementById('game-log');
    const p = document.createElement('p');
    p.innerText = `> ${msg}`;
    if(color !== "black") p.style.color = color;
    el.prepend(p);
}

// 地图相关函数 
function openMap() { document.getElementById('map-modal').classList.remove('hidden'); renderBigMap(); }
function closeMap() { document.getElementById('map-modal').classList.add('hidden'); }

function updateMiniMap() {
    // 保持原来的逻辑：显示地名
    const getBName = (x, y) => {
        if (x < 0 || x >= MAP_SIZE || y < 0 || y >= MAP_SIZE) return "边界";
        return BIOMES[getBiome(x, y)].name;
    };
    document.getElementById('dir-n').innerText = getBName(player.x, player.y - 1);
    document.getElementById('dir-s').innerText = getBName(player.x, player.y + 1);
    document.getElementById('dir-w').innerText = getBName(player.x - 1, player.y);
    document.getElementById('dir-e').innerText = getBName(player.x + 1, player.y);
}

// 修改：支持双世界地图渲染
function renderBigMap() {
    const mapEl = document.getElementById('big-grid');
    if (!mapEl) return;
    mapEl.innerHTML = '';
    mapEl.style.gridTemplateColumns = `repeat(${MAP_SIZE}, 1fr)`;
    mapEl.style.gridTemplateRows = `repeat(${MAP_SIZE}, 1fr)`;
    
    // 获取当前世界探索数据
    const currentExplored = getCurrExplored();

    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            const cell = document.createElement('div');
            const key = `${x},${y}`;
            if (currentExplored[key]) {
                const type = getBiome(x, y);
                cell.className = `map-cell ${BIOMES[type].code}`;
                cell.innerText = BIOMES[type].name.substring(0, 2);

                // 标记传送门
                const buildings = getCurrBuildings()[key] || [];
                if(buildings.some(b => b.name === "下界传送门")) {
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

window.search = function() {
    passTime(2);
    refreshLocation();
    log("搜索完成。");
}

function die() {
    alert("你死亡了！刷新页面重来。");
    location.reload();
}

function init() {
    // --- 原有初始物品 ---
    addItemToInventory("烤肉串", 2);
    addItemToInventory("草药绷带", 1);

    // --- 🛑 测试专用挂：地狱门材料 🛑 ---
    log("【测试模式】已通过作弊获取地狱门材料！", "gold");
    addItemToInventory("黑曜石", 10); // 传送门主材料
    addItemToInventory("打火石", 1);  // 点火工具
    // -----------------------------------

    refreshLocation();
    updateStatsUI();
    updateDayNightCycle();
    log("生存开始。注意理智值，不要在深夜游荡！");
}


// --- 8. 新增功能逻辑区 ---

// 建筑放置系统
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

// 传送门穿越系统
function usePortal() {
    if (currentDimension === "OVERWORLD") {
        log("穿过紫色的光幕... 空间开始扭曲！", "purple");
        playerPosMain = {x: player.x, y: player.y};
        
        currentDimension = "NETHER";
        player.x = playerPosNether.x;
        player.y = playerPosNether.y;
        
        // 自动在地狱侧生成一个门，防止回不去
        const key = `${player.x},${player.y}`;
        if (!buildingsNether[key]) buildingsNether[key] = [];
        if (!buildingsNether[key].some(b => b.name === "下界传送门")) {
            buildingsNether[key].push({name: "下界传送门"});
            log("地狱侧的传送门自动生成了。", "gray");
        }
    } else {
        log("逃离了炙热的地狱，回到主世界。", "blue");
        playerPosNether = {x: player.x, y: player.y};
        
        currentDimension = "OVERWORLD";
        player.x = playerPosMain.x;
        player.y = playerPosMain.y;
    }
    refreshLocation();
}

// 建筑打开逻辑 (储物箱)
let activeBuilding = null;
function openBuilding(b, idx) {
    activeBuilding = b;
    if (b.name === "储物箱") { 
        switchView('chest'); 
        updateChestUI(); 
    } else {
        log("这个建筑暂时没有功能。");
    }
}
window.closeBuilding = function() {
    activeBuilding = null;
    switchView('scene');
}

// 箱子UI
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
        updateInventoryUI();
    }
}
window.takeFromChest = function(n) {
    if (activeBuilding.content[n] > 0) {
        activeBuilding.content[n]--; if (activeBuilding.content[n]<=0) delete activeBuilding.content[n];
        addItemToInventory(n, 1);
        updateChestUI();
        updateInventoryUI();
    }
}

// 兼容性占位
window.setHome = function() { player.home = {dim: currentDimension, x: player.x, y: player.y}; log("已标记此处为家。", "gold"); refreshLocation(); }

init();

// --- 1. 游戏配置与数据 ---
const MAP_SIZE = 20;



// --- 1.1 核心数据：Minecraft 生物群系与掉落 ---
const BIOMES = {
    // === 主世界 ===
    PLAINS: { 
        name: "平原", code: "bg-PLAINS", 
        res: ["杂草", "小麦种子", "橡木原木", "蒲公英"], 
        mobs: [{name:"牛", hp:10, atk:0, loot:"生牛肉"}, {name:"僵尸", hp:20, atk:3, loot:"腐肉"}, {name:"苦力怕", hp:20, atk:15, loot:"火药"}] 
    },
    FOREST: { 
        name: "森林", code: "bg-FOREST", 
        res: ["橡木原木", "木棍", "苹果", "蘑菇"], 
        mobs: [{name:"猪", hp:10, atk:0, loot:"生猪排"}, {name:"骷髅", hp:20, atk:4, loot:"骨头"}, {name:"蜘蛛", hp:16, atk:3, loot:"线"}] 
    },
    DESERT: { 
        name: "沙漠", code: "bg-DESERT", 
        res: ["沙子", "仙人掌", "枯灌木", "岩浆源"], // 岩浆源保留，用于做门
        mobs: [{name:"尸壳", hp:20, atk:4, loot:"腐肉"}] 
    },
    MOUNTAIN: { 
        name: "山地", code: "bg-MOUNTAIN", 
        res: ["石头", "铁矿石", "煤炭", "绿宝石矿"], 
        mobs: [{name:"羊", hp:8, atk:0, loot:"生羊肉"}] 
    },
    SNOWY: { 
        name: "雪原", code: "bg-SNOWY", // 已修正：改为雪原
        res: ["冰", "雪球", "云杉原木"], 
        mobs: [{name:"流浪者", hp:20, atk:4, loot:"箭"}] 
    },
    OCEAN: { 
        name: "深海", code: "bg-OCEAN", 
        res: ["水", "鳕鱼", "海带"], 
        mobs: [{name:"溺尸", hp:20, atk:5, loot:"三叉戟"}, {name:"鱿鱼", hp:10, atk:0, loot:"墨囊"}] 
    },
    SWAMP: { 
        name: "沼泽", code: "bg-SWAMP", 
        res: ["粘土", "藤蔓", "兰花"], 
        mobs: [{name:"史莱姆", hp:16, atk:2, loot:"粘液球"}, {name:"女巫", hp:26, atk:6, loot:"红石"}] 
    },
    MESA: { 
        name: "恶地", code: "bg-MESA", 
        res: ["红沙", "金矿石", "枯灌木"], 
        mobs: [{name:"蜘蛛", hp:16, atk:3, loot:"线"}] 
    },

    // === 下界 (The Nether) ===
    NETHER_WASTES: { name: "地狱", code: "bg-NETHER", res: ["地狱岩", "石英矿", "岩浆源", "金粒"], mobs: [{name:"僵尸猪人", hp:20, atk:5, loot:"金粒"}, {name:"恶魂", hp:10, atk:10, loot:"火药"}] },
    CRIMSON_FOREST: { name: "绯红", code: "bg-CRIMSON", res: ["绯红菌柄", "地狱疣", "萤石"], mobs: [{name:"猪灵", hp:16, atk:6, loot:"金锭"}, {name:"疣猪兽", hp:40, atk:8, loot:"生猪排"}] },
    SOUL_SAND_VALLEY: { name: "灵魂", code: "bg-SOUL", res: ["灵魂沙", "骨块", "玄武岩"], mobs: [{name:"骷髅", hp:20, atk:5, loot:"骨头"}] },
    LAVA_SEA: { name: "熔岩", code: "bg-LAVA", res: ["岩浆源", "黑石", "远古残骸"], mobs: [{name:"烈焰人", hp:20, atk:6, loot:"烈焰棒"}, {name:"岩浆怪", hp:16, atk:4, loot:"岩浆膏"}] }
};

// --- 1.2 核心数据：Minecraft 配方 ---
const RECIPES = [
    // === 建筑类 ===
    { name: "工作台", req: { "橡木原木": 4 }, type: "build", desc: "放置后可存储物品" }, // 暂复用箱子逻辑
    { name: "熔炉", req: { "石头": 8 }, type: "build", desc: "装饰性建筑" },
    { name: "下界传送门", req: { "黑曜石": 10, "打火石": 1 }, type: "build", desc: "放置后点击进入地狱" },

    // === 材料加工 ===
    { name: "木棍", req: { "橡木原木": 2 }, type: "item", desc: "基础材料" },
    { name: "铁锭", req: { "铁矿石": 1, "煤炭": 1 }, type: "item", desc: "烧炼铁矿" },
    { name: "金锭", req: { "金矿石": 1, "煤炭": 1 }, type: "item", desc: "烧炼金矿" },
    { name: "钻石", req: { "钻石矿": 1 }, type: "item", desc: "敲碎矿石获得" }, 
    { name: "下界合金锭", req: { "远古残骸": 1, "金锭": 1 }, type: "item", desc: "顶级材料" },

    // === 核心工具 ===
    { name: "打火石", req: { "铁锭": 1, "燧石": 1 }, type: "item", desc: "点火工具" },
    { name: "铁桶", req: { "铁锭": 3 }, type: "item", desc: "装流体用" },
    { name: "黑曜石", req: { "岩浆桶": 1, "水": 1 }, type: "item", desc: "坚硬方块" },

    // === 武器进化 ===
    { name: "木剑", req: { "木棍": 1, "橡木原木": 2 }, type: "equip", effect: "atk", val: 8, desc: "攻击力 8" },
    { name: "石剑", req: { "木棍": 1, "石头": 2 }, type: "equip", effect: "atk", val: 12, desc: "攻击力 12" },
    { name: "铁剑", req: { "木棍": 1, "铁锭": 2 }, type: "equip", effect: "atk", val: 18, desc: "攻击力 18" },
    { name: "钻石剑", req: { "木棍": 1, "钻石": 2 }, type: "equip", effect: "atk", val: 25, desc: "攻击力 25" },
    { name: "下界合金剑", req: { "钻石剑": 1, "下界合金锭": 1 }, type: "equip", effect: "atk", val: 35, desc: "攻击力 35" },

    // === 防具进化 ===
    { name: "铁盔甲", req: { "铁锭": 5 }, type: "equip", effect: "hp_max", val: 150, desc: "HP上限 -> 150" },
    { name: "钻石盔甲", req: { "钻石": 5 }, type: "equip", effect: "hp_max", val: 200, desc: "HP上限 -> 200" },
    { name: "下界合金甲", req: { "钻石盔甲": 1, "下界合金锭": 1 }, type: "equip", effect: "hp_max", val: 250, desc: "HP上限 -> 250" },

    // === 食物 ===
    { name: "面包", req: { "小麦种子": 3 }, type: "use", effect: "food", val: 25, desc: "恢复 25 饥饿" },
    { name: "熟牛肉", req: { "生牛肉": 1, "煤炭": 1 }, type: "use", effect: "food", val: 40, desc: "恢复 40 饥饿" },
    { name: "金苹果", req: { "苹果": 1, "金锭": 8 }, type: "use", effect: "heal", val: 100, desc: "瞬间恢复 100 HP" }
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

// --- 世界状态管理 ---
let currentDimension = "OVERWORLD";

let exploredMapMain = {};   
let exploredMapNether = {}; 
let buildingsMain = {};     
let buildingsNether = {};

let playerPosMain = {x: 10, y: 10};
let playerPosNether = {x: 10, y: 10}; 

function getCurrBuildings() { return currentDimension === "OVERWORLD" ? buildingsMain : buildingsNether; }
function getCurrExplored() { return currentDimension === "OVERWORLD" ? exploredMapMain : exploredMapNether; }

// --- 2. 核心系统：时间与状态 ---

function passTime(hours) {
    gameTime.hour += hours;

    player.hunger = Math.max(0, player.hunger - (2 * hours));
    player.water = Math.max(0, player.water - (3 * hours));

    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;

    if (isNight) {
        player.sanity = Math.max(0, player.sanity - (3 * hours));
        if (player.sanity < 50) log("你听到了僵尸的低吼... (理智下降)", "purple");
    }

    if (player.hunger === 0 || player.water === 0) {
        player.hp = Math.max(0, player.hp - 5);
        log("你感到饥渴难耐，生命值正在流逝...", "red");
    }
    if (player.sanity === 0) {
        player.hp = Math.max(0, player.hp - 10);
        log("精神崩溃！ (HP -10)", "purple");
    }

    if (gameTime.hour >= 24) {
        gameTime.hour -= 24;
        gameTime.day += 1;
        log(`=== 第 ${gameTime.day} 天 ===`);
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

    // 生成资源
    const resCount = 3 + Math.floor(Math.random() * 4);
    for(let i=0; i<resCount; i++) {
        const name = biome.res[Math.floor(Math.random() * biome.res.length)];
        currentSceneItems.push({ type: 'res', name: name, count: Math.floor(Math.random()*3)+1 });
    }

    // 生成怪物
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

    // 1. 渲染当前世界的建筑 (保持不变)
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
            btn.innerText = `📦 ${b.name}`;
            btn.onclick = () => openBuilding(b, idx);
        }
        grid.appendChild(btn);
    });

    // 2. 渲染资源和怪物 (关键修改在这里!)
    currentSceneItems.forEach((item, index) => {
        const btn = document.createElement('div');
        btn.className = `grid-btn ${item.type}`;

        if (item.type === 'res') {
            // --- 修改开始 ---
            let iconHtml = "";
            // 检查这个物品在 ITEM_ICONS 里有没有配置图标
            if (ITEM_ICONS[item.name]) {
                // 如果有，生成一个 img 标签
                iconHtml = `<img src="${ITEM_ICONS[item.name]}" class="item-icon">`;
            }
            // 使用 innerHTML，把图标和文字拼接到一起
            btn.innerHTML = `${iconHtml}${item.name} (${item.count})`;
            // --- 修改结束 ---

            btn.onclick = () => collectResource(index, btn);
        } else {
            btn.innerText = `${item.name}`; // 怪物暂时还是纯文字
            btn.classList.add('mob');
            btn.onclick = () => startCombat(item, index);
        }
        grid.appendChild(btn);
    });
}

// 修正版采集逻辑 (严格保留了您代码中会导致物品消失的逻辑)
function collectResource(index) {
    const item = currentSceneItems[index];
    if (!item) return;

    // 岩浆桶逻辑
    if (item.name === "岩浆源") {
        if (!player.inventory["铁桶"] || player.inventory["铁桶"] <= 0) {
            log("太烫了！你需要一个 [铁桶] 来装岩浆。", "red");
            return;
        }
        player.inventory["铁桶"]--;
        addItemToInventory("岩浆桶", 1);
        log("装了一桶岩浆。", "orange");
        
        item.count--;
        if (item.count <= 0) {
            currentSceneItems.splice(index, 1);
        }
        renderScene();
        updateInventoryUI();
        return; 
    }

    // 体力消耗逻辑
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

    addItemToInventory(item.name, 1);
    item.count--; // 关键：减少数量

    if (hpCost === 0) {
        log(`采集了 1个 ${item.name} (剩余:${item.count})`);
    }

    // 关键：如果数量归零，从数组移除
    if (item.count <= 0) {
        currentSceneItems.splice(index, 1);
    }

    renderScene(); // 重新渲染，界面上的按钮会消失或更新数字
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

function enemyTurn() { }

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
            
            // --- 图标逻辑 ---
            let iconHtml = "";
            if (ITEM_ICONS[name]) {
                // 使用 style.css 里定义好的 item-icon
                iconHtml = `<img src="${ITEM_ICONS[name]}" class="item-icon">`;
            }

            let r = RECIPES.find(x => x.name === name);
            let btnText = "使用";
            if (r && r.type === 'build') btnText = "放置";
            else if (r && r.type === 'equip') btnText = "装备";

            // 使用 flex 布局让图标、文字、数量、按钮横向排列
            row.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px; flex:1;">
                    ${iconHtml}
                    <span style="font-weight:bold;">${name}</span>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <b style="color:#666;">x${count}</b>
                    <button onclick="useItem('${name}')">${btnText}</button>
                </div>
            `;
            list.appendChild(row);
        }
    }
}


function useItem(name) {
    if (!player.inventory[name] || player.inventory[name] <= 0) return;

    let recipe = RECIPES.find(r => r.name === name);

    if (recipe && recipe.type === 'build') {
        placeBuilding(name);
        return; 
    }

    if (name === "金苹果") {
        player.hp = player.maxHp; 
        player.sanity = 100; 
        log("金苹果的力量涌入体内！", "gold");
    }
    else if (recipe) {
        if (recipe.effect === 'food') {
            player.hunger = Math.min(player.maxHunger, player.hunger + recipe.val);
            log(`吃了 ${name}`);
        } 
        else if (recipe.effect === 'heal') {
            player.hp = Math.min(player.maxHp, player.hp + recipe.val);
        } 
        else if (recipe.effect === 'warm') {
            player.sanity = Math.min(player.maxSanity, player.sanity + recipe.val);
            log(`使用 ${name}，恢复理智`, "purple");
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
    let currentMap = getCurrExplored();
    currentMap[`${player.x},${player.y}`] = true;

    const biomeKey = getBiome(player.x, player.y);
    const biome = BIOMES[biomeKey];
    
    let titleHtml = biome.name;
    if (currentDimension === "NETHER") {
        titleHtml = `<span style="color:#e74c3c">🔥 ${biome.name}</span>`;
    }
    document.getElementById('loc-name').innerHTML = titleHtml;
    document.getElementById('coord').innerText = `${player.x},${player.y}`;

    if (currentDimension === "NETHER") {
        document.body.style.backgroundColor = "#2c0505"; 
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
    ['scene','inventory','craft','combat','chest'].forEach(v => {
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

// 修复版 updateMiniMap：强制截取前两位，解决格式问题
function updateMiniMap() {
    const getBName = (x, y) => {
        if (x < 0 || x >= MAP_SIZE || y < 0 || y >= MAP_SIZE) return "边界";
        // 关键修复：substring(0, 2) 确保只显示两个字
        return BIOMES[getBiome(x, y)].name.substring(0, 2);
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
    
    const currentExplored = getCurrExplored();

    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            const cell = document.createElement('div');
            const key = `${x},${y}`;
            if (currentExplored[key]) {
                const type = getBiome(x, y);
                cell.className = `map-cell ${BIOMES[type].code}`;
                cell.innerText = BIOMES[type].name.substring(0, 2);

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
    // 初始赠送：木剑，面包
    addItemToInventory("木剑", 1);
    addItemToInventory("面包", 2);

    // --- 🛑 测试专用挂：地狱门材料 (如果需要测试，取消注释) 🛑 ---
    // addItemToInventory("黑曜石", 10); 
    // addItemToInventory("打火石", 1); 

    refreshLocation();
    updateStatsUI();
    updateDayNightCycle();
    log("MC 文字版启动！先去砍树吧！");
}

// --- 8. 新增功能逻辑区 ---

function placeBuilding(name) {
    const buildings = getCurrBuildings(); 
    const key = `${player.x},${player.y}`;
    
    if (!buildings[key]) buildings[key] = [];
    
    let newBuild = { name: name };
    if (name === "工作台") newBuild.content = {}; // 简单复用箱子逻辑
    
    buildings[key].push(newBuild);
    log(`在脚下放置了 ${name}`, "blue");
    
    player.inventory[name]--;
    if (player.inventory[name] <= 0) delete player.inventory[name];
    
    refreshLocation();
    updateInventoryUI();
}

function usePortal() {
    if (currentDimension === "OVERWORLD") {
        log("穿过紫色的光幕... 进入下界！", "purple");
        playerPosMain = {x: player.x, y: player.y};
        
        currentDimension = "NETHER";
        player.x = playerPosNether.x;
        player.y = playerPosNether.y;
        
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

let activeBuilding = null;
function openBuilding(b, idx) {
    activeBuilding = b;
    if (b.name === "工作台") { 
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

window.setHome = function() { player.home = {dim: currentDimension, x: player.x, y: player.y}; log("已标记此处为家。", "gold"); refreshLocation(); }

init();

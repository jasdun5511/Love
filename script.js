// ==========================================
// 逻辑内核 (Script.js) - 终极修复版
// ==========================================

// 1. 游戏状态与数据定义
// ------------------------------------------
let player = { 
    x: 10, y: 10, 
    hp: 100, maxHp: 100, 
    hunger: 100, maxHunger: 100,
    water: 100, maxWater: 100,
    sanity: 100, maxSanity: 100,
    atk: 5,  
    def: 0,
    // ... (前面的属性保持不变) 
    isPoisoned: false, // <--- 新增：中毒状态
    // ... (后面的属性保持不变)

    // RPG 属性
    level: 1,
    exp: 0,
    maxExp: 10,
    statPoints: 0,
    equipWeapon: null, 
    equipArmor: null,  
    // 背包与家
    inventory: {},
    home: null 
};

let gameTime = { day: 1, hour: 8 };
let currentSceneItems = [];
let currentEnemy = null; 

// UI 状态变量
let currentInvFilter = 'food'; // 默认显示食物
let currentCraftFilter = 'all';

// 交易表配置
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

// 地图数据存储
let currentDimension = "OVERWORLD";
let exploredMapMain = {};   
let exploredMapNether = {}; 
let buildingsMain = {};     
let buildingsNether = {};
let playerPosMain = {x: 10, y: 10};
let playerPosNether = {x: 10, y: 10}; 

// 获取当前维度的引用
function getCurrBuildings() { return currentDimension === "OVERWORLD" ? buildingsMain : buildingsNether; }
function getCurrExplored() { return currentDimension === "OVERWORLD" ? exploredMapMain : exploredMapNether; }

// 材料组定义
const WOOD_TYPES = ["橡木原木", "云杉原木"];
const FLOWER_TYPES = ["蒲公英", "兰花", "虞美人"]; 


// 2. 辅助功能函数 (背包计数与站点检测)
// ------------------------------------------
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


// 3. RPG 升级与加点系统
// ------------------------------------------
function addExp(amount) {
    player.exp += amount;
    // 升级公式：当前等级 * 10
    player.maxExp = player.level * 10;
    
    if (player.exp >= player.maxExp) {
        player.exp -= player.maxExp;
        player.level++;
        player.statPoints++; // 升级给1点
        player.maxExp = player.level * 10;
        
        // 升级奖励：回满血
        player.hp = player.maxHp;
        log(`升级了！Lv.${player.level}，获得1属性点。状态已恢复。`, "gold");
        updateStatsUI(); // 升级后立即刷新界面
        // 递归：如果经验溢出很多，可能连升两级
        addExp(0);
    }
}

function addPoint(type) {
    if (player.statPoints <= 0) return;
    
    if (type === 'hp') {
        player.maxHp += 5;
        player.hp += 5;
    } else if (type === 'hunger') {
        player.maxHunger += 5;
        player.hunger += 5;
    } else if (type === 'water') {
        player.maxWater += 5;
        player.water += 5;
    }
    
    player.statPoints--;
    updateStatsUI(); 
    renderStatsTab(); // 刷新属性界面
}


// 4. 核心循环 (新增：中毒扣血逻辑)
// ------------------------------------------
function passTime(hours) {
    gameTime.hour += hours;
    player.hunger = Math.max(0, player.hunger - (2 * hours));
    player.water = Math.max(0, player.water - (3 * hours));

    // --- 中毒逻辑 ---
    if (player.isPoisoned) {
        let poisonDmg = 5 * hours;
        player.hp -= poisonDmg;
        log(`☠️ 毒素正在侵蚀你的身体... (HP -${poisonDmg})`, "purple");
        // 30% 几率自愈
        if (Math.random() < 0.3) {
            player.isPoisoned = false;
            log("😅 你感觉毒素消退了。", "green");
        }
    }

    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
    if (isNight) {
        player.sanity = Math.max(0, player.sanity - (3 * hours));
        if (player.sanity < 50) log("你听到了僵尸的低吼... (理智下降)", "purple");
    }

    if (player.hunger === 0 || player.water === 0) {
        player.hp = Math.max(0, player.hp - 5);
        log("你感到饥渴难耐...", "red");
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
    
    if (player.hp <= 0) die(); // 检查是否毒死
    document.getElementById('clock-time').innerText = `${String(gameTime.hour).padStart(2, '0')}:00`;
    updateDayNightCycle();
    updateStatsUI();
}


function updateDayNightCycle() {
    document.body.classList.toggle('night-mode', gameTime.hour >= 20 || gameTime.hour < 6);
}


// 5. 移动与地形算法
function move(dx, dy) {
    // --- 战斗锁 ---
    if (currentEnemy) {
        if (currentEnemy.hp > 0) {
            log("🚫 战斗中无法移动！", "red");
            if(document.getElementById('combat-view').classList.contains('hidden')) switchView('combat');
            return;
        } else { currentEnemy = null; }
    }

    if (player.hp <= 0) return log("你已经倒下了。", "red");
    
    const newX = player.x + dx;
    const newY = player.y + dy;
    
    // --- 动态边界检查 ---
    const mapLimit = currentDimension === "OVERWORLD" ? 20 : 10;
    
    if (newX < 0 || newX >= mapLimit || newY < 0 || newY >= mapLimit) {
        return log("前方是世界的尽头。");
    }

    player.x = newX;
    player.y = newY;
    passTime(1); 
    refreshLocation();
}


// 5. 地形算法 (新增：矿井生成)
// ------------------------------------------
function getBiome(x, y) {
    if (currentDimension === "OVERWORLD") {
        const dot = x * 12.9898 + y * 78.233;
        const val = Math.abs(Math.sin(dot) * 43758.5453) % 1;

        if (val < 0.20) return "OCEAN";
        if (val < 0.40) return "PLAINS";
        if (val < 0.55) return "FOREST";
        if (val < 0.65) return "DESERT";
        if (val < 0.75) return "MOUNTAIN";
        if (val < 0.85) return "SNOWY";
        if (val < 0.90) return "SWAMP"; // 压缩沼泽
        if (val < 0.95) return "MESA";  // 压缩恶地
        if (val < 0.98) return "MINE";  // <--- 3% 几率生成矿井
        return "VILLAGE"; 

    } else {
        // 下界地形生成算法 (已添加：下界要塞)
        const val = Math.abs(Math.sin(x * 37 + y * 19) * 1000) % 1;
        
        if (val < 0.35) return "NETHER_WASTES";    // 35% 荒地
        if (val < 0.60) return "LAVA_SEA";         // 25% 熔岩海
        if (val < 0.80) return "CRIMSON_FOREST";   // 20% 绯红森林
        if (val < 0.95) return "SOUL_SAND_VALLEY"; // 15% 灵魂沙峡谷
        return "NETHER_FORTRESS";                  // 5% 下界要塞 (稀有)
    }
}




// 6. 场景生成 (新增：末影人中立逻辑)
// ------------------------------------------
function generateScene(biomeKey) {
    currentSceneItems = [];
    const biome = BIOMES[biomeKey];
    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;

    // 随机生成资源
    const resCount = 3 + Math.floor(Math.random() * 4);
    for(let i=0; i<resCount; i++) {
        const name = biome.res[Math.floor(Math.random() * biome.res.length)];
        
        // 稀有矿物和宝箱数量限制
        let count = Math.floor(Math.random()*3)+1;
        const RARE = ["铁矿石", "金矿石", "钻石矿", "绿宝石矿", "远古残骸", "宝箱"];
        if (RARE.includes(name)) count = 1;
        
        currentSceneItems.push({ type: 'res', name: name, count: count });
    }

    // 怪物生成
    let mobChance = isNight ? 0.8 : 0.3; 
    if (currentDimension === "NETHER") mobChance = 0.9;
    if (biomeKey === "VILLAGE") mobChance = 0.7; 
    if (biomeKey === "MINE") mobChance = 0.9; // 矿井怪物极多

    if (Math.random() < mobChance) {
        const mobTemplate = biome.mobs[Math.floor(Math.random() * biome.mobs.length)];
        
        const dist = Math.abs(player.x - 10) + Math.abs(player.y - 10);
        const levelBonus = Math.floor(dist / 10); 
        // 矿井怪物等级更高 (+3)
        let extraLv = biomeKey === "MINE" ? 3 : 0;
        let mobLevel = Math.max(1, 1 + levelBonus + extraLv); 
        
        let mob = { 
            type: 'mob', 
            name: mobTemplate.name,
            level: mobLevel,
            hp: mobTemplate.hp + (mobLevel * 5),
            maxHp: mobTemplate.hp + (mobLevel * 5),
            atk: mobTemplate.atk + Math.floor(mobLevel * 0.5),
            loot: mobTemplate.loot,
            baseExp: (mobTemplate.atk + 2),
            isAmbush: false 
        };
        
        // 亡灵主动攻击 (排除末影人)
        const UNDEADS = ["僵尸", "骷髅", "尸壳", "流浪者", "溺尸", "僵尸猪人", "恶魂", "苦力怕", "烈焰人", "凋灵骷髅", "毒蜘蛛"];
        if (UNDEADS.includes(mob.name) && mob.name !== "末影人") {
            if (Math.random() < 0.5) mob.isAmbush = true; 
        }

        if ((isNight || currentDimension === "NETHER") && mob.atk > 0) {
            mob.name = (currentDimension === "NETHER" ? "地狱的" : "狂暴的") + mob.name;
            mob.hp = Math.floor(mob.hp * 1.5);
            mob.maxHp = mob.hp;
            mob.atk = Math.floor(mob.atk * 1.5);
        }
        
        currentSceneItems.push(mob);
    }
}




// 7. 场景渲染 (已优化：建筑显示图标)
// ------------------------------------------
function renderScene() {
    const grid = document.getElementById('scene-grid');
    grid.innerHTML = '';

    const key = `${player.x},${player.y}`;
    const buildings = getCurrBuildings()[key] || [];
    
    // 渲染建筑
    buildings.forEach((b, idx) => {
        const btn = document.createElement('div');
        btn.className = `grid-btn build`;
        
        if (b.name === "下界传送门") {
            // 传送门保持特效
            btn.innerHTML = `<img src="${ITEM_ICONS['下界传送门']}" class="item-icon"> 下界传送门`;
            btn.style.borderColor = "#8e44ad"; 
            btn.style.color = "#8e44ad";
            btn.onclick = () => usePortal(); 
        } else {
            // --- 修改点：尝试获取图标，没有则显示盒子emoji ---
            let icon = ITEM_ICONS[b.name] ? `<img src="${ITEM_ICONS[b.name]}" class="item-icon">` : "📦";
            btn.innerHTML = `${icon} ${b.name}`;
            btn.onclick = () => openBuilding(b, idx);
        }
        grid.appendChild(btn);
    });

    // 渲染资源和怪物 (保持不变)
    currentSceneItems.forEach((item, index) => {
        const btn = document.createElement('div');
        btn.className = `grid-btn ${item.type}`;
        
        if (item.name === "村民") {
            let npcIcon = ITEM_ICONS["村民"] ? `<img src="${ITEM_ICONS["村民"]}" class="mob-icon">` : "👨‍🌾 ";
            btn.innerHTML = `${npcIcon}${item.name}`;
            btn.style.color = "#27ae60"; 
            btn.style.borderColor = "#2ecc71";
            btn.onclick = () => openTrading(); 
        } 
        else if (item.type === 'res') {
            let iconHtml = ITEM_ICONS[item.name] ? `<img src="${ITEM_ICONS[item.name]}" class="item-icon">` : "";
            btn.innerHTML = `${iconHtml}${item.name} (${item.count})`;
            btn.onclick = () => collectResource(index, btn);
        } else {
            let mobIconHtml = ITEM_ICONS[item.name] ? `<img src="${ITEM_ICONS[item.name]}" class="mob-icon">` : "";
            // 确保不带前缀，直接显示图片
            btn.innerHTML = `${mobIconHtml}${item.name} <span class="lv-tag">Lv.${item.level}</span>`;
            btn.classList.add('mob');
            btn.onclick = () => startCombat(item, index);
        }
        grid.appendChild(btn);
    });
}



// 8. 交互：资源采集 (修正：水浇岩浆 -> 黑曜石)
// ------------------------------------------
function collectResource(index) {
    if (!currentSceneItems || !currentSceneItems[index]) return;
    const item = currentSceneItems[index];

    // 1. 采集惊扰机制 (保持不变)
    if (Math.random() < 0.1 && item.name !== "宝箱") {
        const biomeKey = getBiome(player.x, player.y);
        const biome = BIOMES[biomeKey];
        const mobTemplate = biome.mobs[Math.floor(Math.random() * biome.mobs.length)];
        log(`💥 采集的动静引来了 ${mobTemplate.name}！`, "orange");
        let mob = { type: 'mob', name: mobTemplate.name, level: player.level, hp: mobTemplate.hp, maxHp: mobTemplate.hp, atk: mobTemplate.atk, loot: mobTemplate.loot, baseExp: mobTemplate.atk + 5, index: -1 };
        setTimeout(() => { startCombat(mob, -1); }, 100);
        return; 
    }

        // 2. 宝箱逻辑 (已增强：要塞宝箱掉落优化)
    if (item.name === "宝箱") {
        log("📦 打开了宝箱...", "gold");
        
        // 获取当前地形，判断是不是要塞
        const currentBiome = getBiome(player.x, player.y);

        // === 分支 A：下界要塞的宝箱 (富裕！) ===
        if (currentBiome === "NETHER_FORTRESS") {
            log("🔥 这是一个古老的要塞宝箱！", "orange");
            
            // 1. 必掉：救命的水瓶 (100%几率)
            addItemToInventory("水瓶", 1);

            // 2. 高概率掉落：金苹果、熟牛肉、谜之炖菜
            // 数组里塞多几个金苹果，提高抽中概率
            const richFood = ["金苹果", "金苹果", "熟牛肉", "熟牛肉", "熟牛肉", "谜之炖菜", "魔法糖冰棍"];
            let food = richFood[Math.floor(Math.random() * richFood.length)];
            let foodCount = Math.floor(Math.random() * 2) + 2; // 2~3个
            
            addItemToInventory(food, foodCount);
            log(`发现了 [水瓶] 和 [${food} x${foodCount}]！`, "gold");

            // 3. 额外珍贵战利品
            if (Math.random() < 0.8) { addItemToInventory("金锭", 3); log("获得了 金锭"); }
            if (Math.random() < 0.5) { addItemToInventory("钻石", 1); log("获得了 💎钻石"); }
            if (Math.random() < 0.4) { addItemToInventory("烈焰棒", 2); log("获得了 烈焰棒"); }
            if (Math.random() < 0.3) { addItemToInventory("下界合金碎片", 1); log("✨ 竟然有 下界合金碎片！", "purple"); }
            if (Math.random() < 0.2) { addItemToInventory("凋零头颅", 1); log("💀 获得了 凋零头颅", "red"); }
        } 
        
        // === 分支 B：普通宝箱 (主世界/普通地狱) ===
        else {
            const foods = ["面包", "水瓶", "熟牛肉", "金苹果"];
            let food = foods[Math.floor(Math.random() * foods.length)];
            addItemToInventory(food, Math.floor(Math.random()*2)+1);
            log(`获得了 ${food}`);
            
            if (Math.random() < 0.6) { addItemToInventory("煤炭", Math.floor(Math.random()*3)+1); log("获得了 煤炭"); }
            if (Math.random() < 0.3) { addItemToInventory("铁锭", 1); log("获得了 铁锭"); }
            if (Math.random() < 0.4) { addItemToInventory("经验瓶", 1); log("获得了 ✨经验瓶✨", "purple"); }
            
            // 普通箱子很难开出金苹果和钻石
            if (Math.random() < 0.05) { addItemToInventory("金苹果", 1); log("运气爆棚！获得了 金苹果", "gold"); }
            if (Math.random() < 0.05) { addItemToInventory("钻石", 1); log("获得了 💎钻石！", "cyan"); }
        }

        finishCollect(index, item);
        return;
    }

    // --- 新增：枯灌木 -> 木棍 ---
    if (item.name === "枯灌木") {
        doCollectWork();
        // 随机获得 1 到 2 个木棍
        const count = Math.floor(Math.random() * 2) + 1;
        addItemToInventory("木棍", count);
        log(`折断了枯灌木，获得 木棍 x${count}。`, "green");
        finishCollect(index, item);
        return;
    }


    // --- 新增：岩浆源互动逻辑 ---
    if (item.name === "岩浆源") {
        // 检查是否有 "水" (在物品代码中，装了水的铁桶叫 "水")
        if (player.inventory["水"] > 0) {
            log("💦 滋——！你用水浇灭了岩浆。", "blue");
            
            // 直接修改场景中的物品，变为黑曜石
            item.name = "黑曜石";
            item.count = 1; 
            
            // 刷新场景显示 (岩浆图片 -> 黑曜石图片)
            renderScene();
            // 注意：不消耗水，也不调用 finishCollect(不移除物品)，而是等玩家下次点击来挖掘
            return; 
        } else {
            log("太烫了！你需要一桶 [水] 来冷却它。", "red");
            return;
        }
    }

    // 3. 镐子挖掘等级限制 (黑曜石等级设为 4)
    const ORE_LEVEL = {
        "石头": 1, "煤炭": 1, 
        "铁矿石": 2, "青石矿": 2,
        "金矿石": 3, "钻石矿": 3, "绿宝石矿": 3, "红石": 3,
        "黑曜石": 4, "远古残骸": 4
    };

    if (ORE_LEVEL[item.name]) {
        let pickLevel = 0;
        if (player.inventory["下界合金镐"]) pickLevel = 5;
        else if (player.inventory["钻石镐"]) pickLevel = 4;
        else if (player.inventory["铁镐"]) pickLevel = 3;
        else if (player.inventory["石镐"]) pickLevel = 2;
        else if (player.inventory["木镐"]) pickLevel = 1;

        if (pickLevel < ORE_LEVEL[item.name]) {
            let need = "木镐";
            if(ORE_LEVEL[item.name]===2) need="石镐";
            if(ORE_LEVEL[item.name]===3) need="铁镐";
            if(ORE_LEVEL[item.name]===4) need="钻石镐"; // 黑曜石会提示这个
            log(`你的镐子太差了！需要 [${need}] 才能开采。`, "red");
            return;
        }
    }

    // 4. 普通资源采集
    if (item.name === "橡树") { doCollectWork(); addItemToInventory("橡木原木", 1); log("砍倒了橡树，获得 橡木原木。", "green"); finishCollect(index, item); return; }
    if (item.name === "云杉") { doCollectWork(); addItemToInventory("云杉原木", 1); log("砍倒了云杉，获得 云杉原木。", "green"); finishCollect(index, item); return; }
    if (item.name === "小麦") { doCollectWork(); addItemToInventory("小麦", 1); addItemToInventory("小麦种子", 2); log("收割了小麦。", "gold"); finishCollect(index, item); return; }
    if (item.name === "杂草") { 
        if(Math.random()<0.3) {addItemToInventory("小麦种子", 1); log("发现种子。", "green");} 
        else log("清理杂草。"); 
        finishCollect(index, item); return; 
    }
    
        // 矿物采集 (修复：铁/金矿石掉落原矿，钻石等掉落成品)
    if (ORE_LEVEL[item.name] || item.name === "绿宝石矿") {
        doCollectWork();
        
        let drop = item.name; // 默认掉落原物品 (如：铁矿石 -> 铁矿石)

        // 特殊矿物掉落成品
        if (item.name === "钻石矿") drop = "钻石";
        else if (item.name === "绿宝石矿") drop = "绿宝石";
        else if (item.name === "煤炭") drop = "煤炭"; // 煤炭名字符合
        else if (item.name === "红石") drop = "红石";
        else if (item.name === "石头") drop = "石头"; 
        
        addItemToInventory(drop, 1);
        addExp(2);
        log(`采集了 ${item.name}`, "gold");
        finishCollect(index, item);
        return;
    }


    // 装水逻辑
    if (item.name === "水") { 
        if (player.inventory["铁桶"]) { 
            player.inventory["铁桶"]--; addItemToInventory("水", 1); 
            log("装了一桶水。", "blue");
        } 
        else if (player.inventory["玻璃瓶"]) { 
            player.inventory["玻璃瓶"]--; addItemToInventory("水瓶", 1); 
            log("装了一瓶水。", "blue");
        } 
        else { 
            log("需要 [玻璃瓶] 或 [铁桶] 才能装水。", "red"); 
            return; 
        }
        finishCollect(index, item); return;
    }

    // 其他
    if (FLOWER_TYPES.includes(item.name)) { player.sanity = Math.min(player.maxSanity, player.sanity + 10); log(`采摘了 ${item.name} (理智 +10)`, "purple"); }

    doCollectWork(); 
    addItemToInventory(item.name, 1);
    finishCollect(index, item); 
    if (!FLOWER_TYPES.includes(item.name)) log(`采集了 1个 ${item.name}`);
}


// 辅助：移除物品逻辑
function finishCollect(index, item) {
    if (typeof item.count !== 'number') item.count = 1;
    item.count--; 
    if (item.count <= 0) {
        currentSceneItems.splice(index, 1);
    }
    renderScene();
    updateInventoryUI();
    updateStatsUI();
}

// 辅助：统一扣体力逻辑
function doCollectWork() {
    let hpCost = 0;
    if (player.hunger > 0) player.hunger -= 1; else hpCost += 2;
    if (player.water > 0) player.water -= 1; else hpCost += 2;
    if (hpCost > 0) {
        player.hp -= hpCost;
        if (player.hp <= 0) die();
        else log(`体力透支 (HP -${hpCost})`, "red");
    }
}

// 辅助：检查工具
function checkTool(type) {
    if (!Object.keys(player.inventory).some(n => n.includes(type))) {
        log(`你需要一把 [${type}子] 才能采集。`, "red");
        return false;
    }
    return true;
}


// 9. 交互：战斗系统 (极速响应版)
// ------------------------------------------
let isCombatBusy = false; // 战斗状态锁

function startCombat(mob, index) {
    currentEnemy = mob;
    currentEnemy.index = index;
    isCombatBusy = false; // 重置锁
    switchView('combat');
    
    let imgUrl = ITEM_ICONS[mob.name] || (ITEM_ICONS[mob.name.replace(/狂暴的|地狱的/, "")] || "");
    let imgHtml = imgUrl ? `<img src="${imgUrl}" class="combat-mob-img">` : "";
    
    document.getElementById('enemy-name').innerHTML = `${imgHtml}${mob.name} <span class="lv-tag">Lv.${mob.level}</span>`;
    document.getElementById('combat-log-area').innerHTML = `<p>遭遇了 Lv.${mob.level} ${mob.name}！</p>`;
    
    if (!document.getElementById('combat-consumables')) {
        const d = document.createElement('div');
        d.id = 'combat-consumables'; d.className = 'quick-heal-bar';
        document.getElementById('combat-log-area').before(d);
    }
    updateCombatUI();

    // 偷袭逻辑 (缩短延迟到 0.2s，给你一点点反应时间)
    if (mob.isAmbush) {
        combatLog(`⚡ ${mob.name} 发起了偷袭！`, "red");
        isCombatBusy = true; 
        setTimeout(() => { enemyTurnLogic('ambush'); }, 200); 
    }
}

function updateCombatUI() {
    if(!currentEnemy) return;
    const hpPct = (currentEnemy.hp / currentEnemy.maxHp) * 100;
    document.getElementById('enemy-hp-bar').style.width = `${hpPct}%`;
    document.getElementById('enemy-stats').innerText = `HP: ${currentEnemy.hp}/${currentEnemy.maxHp}`;
    
    const c = document.getElementById('combat-consumables');
    if (c) {
        c.innerHTML = '';
        for (let [name, count] of Object.entries(player.inventory)) {
            let r = RECIPES.find(x => x.name === name);
            
            // --- 关键修改：确保 magic_candy 和所有 food 都能在战斗显示 ---
            // 只要是 'use' 类型，并且有效果，或者名字里包含"瓶"、"苹果"等关键词
            let isUsable = false;
            
            if (r && r.type === 'use') {
                if (r.effect === 'heal' || r.effect === 'food' || r.effect === 'drink' || r.effect === 'super_food' || r.effect === 'magic_candy') {
                    isUsable = true;
                }
            } else if (!r && (name.includes("苹果") || name.includes("面包") || name.includes("肉"))) {
                // 允许没有配方的生食
                isUsable = true;
            }

            if (isUsable) {
                const btn = document.createElement('div');
                btn.className = 'heal-btn';
                let icon = ITEM_ICONS[name] ? `<img src="${ITEM_ICONS[name]}">` : "";
                btn.innerHTML = `${icon} ${name} x${count}`;
                // 点击吃药
                btn.onclick = () => { if(!isCombatBusy) combatUseItem(name); };
                c.appendChild(btn);
            }
        }
    }
}

// --- 核心：敌人回合 (极速版) ---
function enemyTurnLogic(actionType) {
    if (!currentEnemy) { isCombatBusy = false; return; }

    // 1. 盾牌判定
    if (player.inventory["盾牌"] > 0) {
        if (Math.random() < 0.25) {
            combatLog(`🛡️ 你的盾牌抵挡了 ${currentEnemy.name} 的攻击！`, "gold");
            updateCombatUI();
            updateStatsUI();
            isCombatBusy = false; // 立即解锁
            return; 
        }
    }

    // 2. 正常伤害 (修改：计算防御力减免)
    // 伤害公式：(攻击 - 防御)，最少受到 1 点强制伤害
    let rawDmg = currentEnemy.atk - Math.floor(Math.random() * 2);
    const eDmg = Math.max(1, rawDmg - player.def); // <--- 减去防御力
    
    player.hp -= eDmg;

    
    let prefix = "";
    if (actionType === 'use') prefix = "趁你使用物品时，";
    else if (actionType === 'flee') prefix = "逃跑失败！";
    else if (actionType === 'ambush') prefix = "被先手攻击！";
    
    combatLog(`${prefix}受到 ${eDmg} 伤害`, "red");

    // 震动特效
    document.body.classList.remove('shake'); 
    void document.body.offsetWidth; 
    document.body.classList.add('shake');
    
    // 毒蜘蛛判定
    if (currentEnemy.name.includes("毒蜘蛛")) {
        if (Math.random() < 0.4 && !player.isPoisoned) {
            player.isPoisoned = true;
            combatLog("🤢 糟糕，被咬伤中毒了！", "purple");
        }
    }

    if (player.hp <= 0) {
        setTimeout(die, 100);
        return;
    }

    updateStatsUI();
    updateCombatUI();
    
    // --- 立即解锁，允许玩家下一次操作 ---
    isCombatBusy = false; 
}

function combatUseItem(name) {
    if (isCombatBusy || !currentEnemy || !player.inventory[name]) return;
    isCombatBusy = true; 

    useItem(name); 
    // 极速模式：0.05秒后敌人攻击
    setTimeout(() => enemyTurnLogic('use'), 50);
}

function combatLog(msg, color="#333") {
    const el = document.getElementById('combat-log-area');
    const p = document.createElement('p');
    p.innerText = msg;
    p.style.color = color;
    el.prepend(p);
}

function combatAttack() {
    if (isCombatBusy || !currentEnemy || currentEnemy.hp <= 0) return;
    
    isCombatBusy = true; // 上锁

    const pDmg = player.atk + Math.floor(Math.random() * 3);
    currentEnemy.hp -= pDmg;
    combatLog(`你造成 ${pDmg} 伤害`, "green");
    
    const box = document.querySelector('.enemy-box');
    box.classList.remove('shake'); 
    void box.offsetWidth; 
    box.classList.add('shake');

    if (currentEnemy.hp <= 0) {
        const loot = currentEnemy.loot;
        const expGain = (currentEnemy.baseExp || 5) + currentEnemy.level * 2;
        combatLog(`胜利！获得 ${loot}，EXP +${expGain}`, "gold");

    // ... 在 combatLog("胜利！...") 后面添加：

    // --- 任务检测 ---
    if (typeof QUEST_DATA !== 'undefined') {
        const q = QUEST_DATA[currentQuestId];
        // 如果是击杀末影龙的任务
        if (q && q.type === 'kill' && currentEnemy.name === q.target) {
            log("🏆 恭喜！你击败了末影龙！", "gold");
            // 这里可以做一个更华丽的通关结算，暂时先直接完成任务
            checkAndClaimQuest();
        }
    }
    
    // ... 继续原本的 addItemToInventory ...

        
        addItemToInventory(loot, 1);
        addExp(expGain); 
        
        if (currentEnemy.index !== -1 && currentSceneItems[currentEnemy.index]) {
            currentSceneItems.splice(currentEnemy.index, 1);
        }
        
        currentEnemy = null; // 清空敌人防止连点
        
        // 胜利结算稍快一点 (0.4秒)
        setTimeout(() => { switchView('scene'); renderScene(); }, 400);
        return; 
    }
    
    // 极速模式：0.05秒后敌人攻击
    setTimeout(() => enemyTurnLogic('atk'), 50);
}

function combatFlee() {
    if (isCombatBusy || !currentEnemy) return;
    isCombatBusy = true;

    if (Math.random() > 0.5) { 
        log("逃跑成功！", "orange"); 
        currentEnemy = null; 
        switchView('scene'); 
        isCombatBusy = false; 
    }
    else {
        enemyTurnLogic('flee');
    }
}





// 10. 交互：物品与背包系统 (数据处理与分类)
// ------------------------------------------
function getItemType(name) {
    let r = RECIPES.find(x => x.name === name);
    if (r) {
        if (r.type === 'equip') return 'equip';
        if (r.type === 'use' || r.effect === 'food' || r.effect === 'heal' || r.effect === 'drink' || r.effect === 'super_food') return 'food';
        if (r.type === 'build' || r.type === 'item') return 'material'; 
    }
    // 兜底关键词判断
    if (name.includes("剑") || name.includes("甲") || name.includes("镐") || name.includes("三叉戟") || name.includes("弩") || name.includes("斧")) return 'equip';
        if (name.includes("肉") || name.includes("排") || name.includes("鱼") || name.includes("苹果") || name.includes("传送门") ||name.includes("瓶") || name.includes("面包") || name.includes("马铃薯") || name.includes("仙人掌果子")) return 'food';

    return 'material';
}

function addItemToInventory(name, count) {
    if (!player.inventory[name]) player.inventory[name] = 0;
    player.inventory[name] += count;
}


/// 10.1 UI渲染与交互 (修复背包空白 + 装备显示优化 + 属性实时显示)
// ------------------------------------------
window.switchInvTab = function(tabName) {
    document.querySelectorAll('.inv-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.inv-content').forEach(div => div.classList.add('hidden'));
    
    if (tabName === 'stats') {
        document.querySelectorAll('.inv-tab-btn')[0].classList.add('active');
        document.getElementById('inv-tab-stats').classList.remove('hidden');
        renderStatsTab();
    } else {
        document.querySelectorAll('.inv-tab-btn')[1].classList.add('active');
        document.getElementById('inv-tab-equip').classList.remove('hidden');
        renderEquipTab();
    }
}

// 确保过滤器点击生效
window.setInvFilter = (f, b) => { 
    currentInvFilter = f; 
    document.querySelectorAll('#inv-tab-stats .category-tabs .tab-btn').forEach(x=>x.classList.remove('active')); 
    if(b) b.classList.add('active'); 
    renderStatsTab(); 
}

function renderStatsTab() {
    // 刷新等级、经验、点数
    if(!document.getElementById('stat-lv')) return;
    document.getElementById('stat-lv').innerText = player.level;
    document.getElementById('stat-exp').innerText = player.exp;
    document.getElementById('stat-max-exp').innerText = player.maxExp;
    document.getElementById('stat-points').innerText = player.statPoints;
    
    const pct = (player.exp / player.maxExp) * 100;
    document.getElementById('stat-exp-bar').style.width = `${pct}%`;

    // 属性面板数值
    document.getElementById('val-hp').innerText = player.hp;
    document.getElementById('val-max-hp').innerText = player.maxHp;
    document.getElementById('val-max-hunger').innerText = `${player.hunger} / ${player.maxHunger}`;
    document.getElementById('val-max-water').innerText = `${player.water} / ${player.maxWater}`;
    document.getElementById('val-atk').innerText = player.atk;
    document.getElementById('val-sanity').innerText = player.sanity;

    // 激活/禁用加点按钮
    document.querySelectorAll('.plus-btn').forEach(btn => {
        if (player.statPoints > 0) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // 渲染物品列表
    const list = document.getElementById('inventory-list-stats');
    if (!list) return;
    list.innerHTML = ''; 

    if (typeof currentInvFilter === 'undefined') currentInvFilter = 'food';

    let hasItem = false;
    for (let [name, count] of Object.entries(player.inventory)) {
        if (count > 0) {
            const type = getItemType(name);
            let show = false;
            
            if (currentInvFilter === 'food' && type === 'food') show = true;
            else if (currentInvFilter === 'material' && type === 'material') show = true;

            if (show) {
                hasItem = true;
                const row = document.createElement('div');
                row.className = 'list-item';
                let icon = ITEM_ICONS[name] ? `<img src="${ITEM_ICONS[name]}" class="item-icon">` : "";
                
                // --- 修复部分开始：按钮逻辑 ---
                let actionBtn = "";
                if (type === 'food') {
                    actionBtn = `<button onclick="useItem('${name}')">使用</button>`;
                }
                // 专门给 下界传送门 加按钮
                else if (name === "下界传送门") {
                    actionBtn = `<button onclick="useItem('${name}')">放置</button>`;
                }
                // --- 修复部分结束 ---

                row.innerHTML = `
                    <div style="flex:1;display:flex;align-items:center;gap:10px;">${icon}<b>${name}</b></div>
                    <div><b style="color:#999;margin-right:10px;">x${count}</b>${actionBtn}</div>`;
                list.appendChild(row);
            }
        }
    }
    if (!hasItem) {
        let label = currentInvFilter === 'food' ? "没有食物/药物" : "没有材料/杂物";
        list.innerHTML = `<div style="padding:15px;text-align:center;color:#ccc;font-size:12px;">${label}</div>`;
    }
}

// 渲染装备页
function renderEquipTab() {
    const renderSlot = (domId, itemName, type) => {
        const el = document.getElementById(domId);
        if (!el) return;
        
        if (itemName) {
            let icon = ITEM_ICONS[itemName] ? `<img src="${ITEM_ICONS[itemName]}" style="width:32px;height:32px;margin-bottom:2px;">` : "";
            
            // --- 属性显示逻辑 ---
            let r = RECIPES.find(x => x.name === itemName);
            let bonusText = "";
            
            if (r) {
                // 有配方的走配方数据
                if (type === 'weapon') bonusText = `<span style="color:#e74c3c;font-size:10px;">攻击+${r.val}</span>`;
                if (type === 'armor') bonusText = `<span style="color:#2ecc71;font-size:10px;">生命+${r.val}</span>`;
            } else {
                // --- 没有配方的(三叉戟)，手动写死显示 ---
                if (itemName === "三叉戟") bonusText = `<span style="color:#e74c3c;font-size:10px;">攻击+9</span>`;
            }
            
            el.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;">${icon}<div style="font-weight:bold;color:#333;">${itemName}</div>${bonusText}</div>`;
        } else {
            el.innerHTML = `<div style="color:#ccc;line-height:40px;">无</div>`;
        }
    };

    renderSlot('slot-weapon', player.equipWeapon, 'weapon');
    renderSlot('slot-armor', player.equipArmor, 'armor');

    // 渲染背包列表
    const list = document.getElementById('inventory-list-equip');
    if (!list) return;
    list.innerHTML = '';

    let hasItem = false;
    for (let [name, count] of Object.entries(player.inventory)) {
        if (count > 0) {
            const type = getItemType(name);
            if (type === 'equip') {
                hasItem = true;
                const row = document.createElement('div');
                row.className = 'list-item';
                let icon = ITEM_ICONS[name] ? `<img src="${ITEM_ICONS[name]}" class="item-icon">` : "";
                
                // 列表里的属性显示
                let r = RECIPES.find(x => x.name === name);
                let statInfo = "";
                
                if (r) {
                     if (r.effect === 'atk') statInfo = `<span style="font-size:10px;color:#e74c3c;margin-left:5px;">(攻+${r.val})</span>`;
                     else if (r.effect === 'hp_max') statInfo = `<span style="font-size:10px;color:#2ecc71;margin-left:5px;">(血+${r.val})</span>`;
                } else {
                     // --- 手动写死三叉戟 ---
                     if (name === "三叉戟") statInfo = `<span style="font-size:10px;color:#e74c3c;margin-left:5px;">(攻+9)</span>`;
                }

                row.innerHTML = `
                    <div style="flex:1;display:flex;align-items:center;gap:10px;">
                        ${icon}
                        <div><b>${name}</b>${statInfo}</div>
                    </div>
                    <div><b style="color:#999;margin-right:10px;">x${count}</b><button onclick="equipItem('${name}')">装备</button></div>`;
                list.appendChild(row);
            }
        }
    }
    if (!hasItem) list.innerHTML = '<div style="padding:15px;text-align:center;color:#ccc;font-size:12px;">背包里没有可穿戴的装备</div>';
}


// 交互：装备物品 (已修正：正确处理生命上限，穿新脱旧)
window.equipItem = function(name) {
    let r = RECIPES.find(x => x.name === name);
    let type = "weapon"; 
    if (name.includes("甲") || name.includes("头盔") || name.includes("靴")) type = "armor";
    
    if (type === "weapon") {
        // --- 武器逻辑 ---
        if (player.equipWeapon) addItemToInventory(player.equipWeapon, 1);
        player.equipWeapon = name;
        
        let bonus = 3; 
        if (r && r.val) bonus = r.val;
        else if (name === "三叉戟") bonus = 9; 
        
        player.atk = 5 + bonus; 
    } else {
        // --- 盔甲逻辑 (修复：增加生命上限) ---
        
        // 1. 先扣除旧盔甲的加成 (如果有)
        if (player.equipArmor) {
            let oldR = RECIPES.find(x => x.name === player.equipArmor);
            // 如果旧装备有加成，扣掉
            if (oldR && oldR.effect === 'hp_max') {
                player.maxHp -= oldR.val;
                // 如果扣完上限后，当前血量比上限还高，就压下来
                if (player.hp > player.maxHp) player.hp = player.maxHp;
            }
            // 把旧盔甲放回背包
            addItemToInventory(player.equipArmor, 1);
        }

        // 2. 穿上新盔甲
        player.equipArmor = name;
        
        // 3. 加上新盔甲的加成
        let bonus = 0;
        if (r && r.effect === 'hp_max') {
            bonus = r.val;
        } else {
            // 兜底：如果没有配方或者是旧数据
            if (name.includes("铁")) bonus = 50;
            else if (name.includes("钻石")) bonus = 100;
            else if (name.includes("下界")) bonus = 150;
        }
        
        player.maxHp += bonus;
        player.hp += bonus; // 穿上时顺便补一口血，体验更好
    }
    
    // 移除背包里的物品
    player.inventory[name]--;
    if (player.inventory[name] <= 0) delete player.inventory[name];
    
    renderEquipTab();
    updateStatsUI();
    

    // 显示更详细的信息
    let statMsg = type === 'weapon' ? `攻击力: ${player.atk}` : `防御力: ${player.def}`;
    log(`装备了 ${name}！(${statMsg})`);
}



// 交互：使用物品 (已增强：魔法糖冰棍 + 全食物回血)
function useItem(name) {
    if (!player.inventory[name]) return;
    let recipe = RECIPES.find(r => r.name === name);

    // 1. 建筑类
    if (recipe && recipe.type === 'build') { placeBuilding(name); return; }

    // --- 新增：魔法糖冰棍 (星露谷神级Buff) ---
    if (name === "魔法糖冰棍") {
        player.hp = player.maxHp;           // 血量回满
        player.hunger = player.maxHunger;   // 饱食回满
        player.water = player.maxWater;     // 水分回满
        player.sanity = player.maxSanity;   // 理智回满
        player.atk += 5;                    // 永久增加5点攻击力 (直到死亡)
        player.isPoisoned = false;          // 解毒
        
        log("✨ 你吃下了魔法糖冰棍！感觉浑身充满了彩虹般的力量！(全状态恢复 + 攻击力永久+5)", "purple");
        
        // 特效：屏幕闪烁一下彩色 (模拟)
        document.body.style.filter = "hue-rotate(90deg)";
        setTimeout(() => document.body.style.filter = "none", 500);
    }

    // 2. 特殊物品：金苹果
    else if (name === "金苹果") { 
        player.hp = player.maxHp; 
        log("金苹果的力量涌上来！(HP回满)", "gold"); 
    }
    // 2.5. 仙人掌果子 (像苹果一样直接写效果)
    else if (name === "仙人掌果子") {
        player.hunger = Math.min(player.maxHunger, player.hunger + 15);
        player.water = Math.min(player.maxWater, player.water + 20); // 重点是补水
        player.hp = Math.min(player.maxHp, player.hp + 5);
        log("吃了仙人掌果子，水分充足！(水分+20, 饥饿+15)", "green");
    }
    // 2.6 苹果 (增加补水设定)
    else if (name === "苹果") {
        player.hunger = Math.min(player.maxHunger, player.hunger + 10);
        player.water = Math.min(player.maxWater, player.water + 5); // 苹果补水
        player.hp = Math.min(player.maxHp, player.hp + 5);
        log("吃了苹果，脆甜多汁。(饥饿+10, 水分+5)", "green");
    }

    // 3. 谜之炖菜
    else if (name === "谜之炖菜") {
        player.hunger = Math.min(player.maxHunger, player.hunger + 10);
        player.water = Math.min(player.maxWater, player.water + 10);
        player.hp = Math.min(player.maxHp, player.hp + 10); // 也能回血
        log("喝下了谜之炖菜，味道有点...微妙。(状态 +10)", "gold");
    }
    // 4. 经验瓶
    else if (name === "经验瓶") {
        let gain = Math.floor(Math.random() * 20) + 10;
        addExp(gain);
        log(`打碎了经验瓶，获得 ${gain} 点经验！`, "purple");
    }
    // 5. 绷带
    else if (name === "简易绷带") {
        if (player.hp >= player.maxHp) {
            log("你并没有受伤，不需要包扎。", "red");
            return; 
        }
        player.hp = Math.min(player.maxHp, player.hp + 15);
        log("使用了简易绷带。(HP +15)", "green");
    }

    // --- 修改点：普通食物/饮料通用逻辑 (增加回血) ---
    else if (recipe) {
        if (recipe.effect === 'food' || recipe.effect === 'super_food' || recipe.effect === 'magic_candy') {
            // 基础饱食度恢复
            let hungerVal = recipe.val || 10; 
            player.hunger = Math.min(player.maxHunger, player.hunger + hungerVal);
            
            // --- 关键修改：所有食物额外恢复 10% 生命值 ---
            let healAmount = Math.floor(player.maxHp * 0.1) + 5; 
            player.hp = Math.min(player.maxHp, player.hp + healAmount);
            
            log(`吃了 ${name} (饱食 +${hungerVal}, HP +${healAmount})`, "green");
        } 
        else if (recipe.effect === 'drink') {
            let waterVal = recipe.val || 10;
            player.water = Math.min(player.maxWater, player.water + waterVal);
            // 饮料也回一点点血
            player.hp = Math.min(player.maxHp, player.hp + 2);
            log(`喝了 ${name} (水分 +${waterVal}, HP +2)`, "blue");
        }
    }
    // 兜底生食
    else if (getItemType(name) === 'food') {
        player.hunger = Math.min(player.maxHunger, player.hunger + 5);
        player.hp = Math.min(player.maxHp, player.hp + 2);
        log(`勉强吃了 ${name} (生食 +5, HP +2)`);
    }

    // 消耗物品
    player.inventory[name]--;
    if (player.inventory[name] <= 0) delete player.inventory[name];
    
    // 返还容器
    if (name === "水瓶" || name === "蜂蜜瓶") addItemToInventory("玻璃瓶", 1);

    updateStatsUI();
    updateInventoryUI();
    
    // 如果在战斗中，刷新战斗UI的血条
    if (!document.getElementById('combat-view').classList.contains('hidden')) {
        updateCombatUI();
    }
}


function updateInventoryUI() {
    const activeTabBtn = document.querySelector('.inv-tab-btn.active');
    if (activeTabBtn && activeTabBtn.innerText.includes("装备")) {
        renderEquipTab();
    } else {
        renderStatsTab();
    }
}


// 11. 交互：制作系统 (已修正：背包持有工作台/熔炉即可解锁)
// ------------------------------------------
window.setCraftFilter = (f, b) => { 
    currentCraftFilter = f; 
    document.querySelectorAll('#craft-view .tab-btn').forEach(x=>x.classList.remove('active')); 
    b.classList.add('active'); 
    updateCraftUI(); 
}

function updateCraftUI() {
    const list = document.getElementById('craft-list');
    if (!list) return;
    list.innerHTML = '';

    // --- 核心逻辑修改：从背包检测是否有工作台和熔炉 ---
    const hasWorkbench = (player.inventory["工作台"] || 0) > 0;
    const hasFurnace = (player.inventory["熔炉"] || 0) > 0;

    RECIPES.forEach(recipe => {
        let show = false;
        if (currentCraftFilter === 'all') show = true;
        else if (currentCraftFilter === 'equip' && recipe.type === 'equip') show = true;
        else if (currentCraftFilter === 'food' && (recipe.effect === 'food' || recipe.effect === 'drink' || recipe.effect === 'heal' || recipe.effect === 'super_food' || recipe.name === "谜之炖菜")) show = true;
        else if (currentCraftFilter === 'build' && (recipe.type === 'build' || recipe.type === 'item')) show = true;

        if (show) {
            // 检测是否满足站点需求 (工作台/熔炉)
            let stationMissing = false;
            let missingMsg = "";
            if (recipe.station === 'workbench' && !hasWorkbench) { stationMissing = true; missingMsg = "需持有:工作台"; }
            if (recipe.station === 'furnace' && !hasFurnace) { stationMissing = true; missingMsg = "需持有:熔炉"; }

            // 如果缺少站点，不显示该配方 (或者你可以根据喜好改为 opacity:0.6)
            if (stationMissing) return; 

            const row = document.createElement('div');
            row.className = 'list-item';
            let icon = ITEM_ICONS[recipe.name] ? `<img src="${ITEM_ICONS[recipe.name]}" class="item-icon">` : "";

            let reqStr = [];
            let canCraft = true;
            for (let [mat, qty] of Object.entries(recipe.req)) {
                const has = getInvCount(mat); 
                let displayName = mat;
                if (mat === "原木") displayName = "所有原木";
                if (mat === "花") displayName = "所有花朵";

                reqStr.push(`<span style="color:${has >= qty ? '#2ecc71' : '#e74c3c'}">${displayName} ${has}/${qty}</span>`);
                if (has < qty) canCraft = false;
            }
            
            row.innerHTML = `
                <div style="flex:1; display:flex; align-items:center; gap:10px;">
                    ${icon}
                    <div>
                        <div style="font-weight:bold;font-size:12px;">${recipe.name}</div>
                        <div style="font-size:10px;color:#999;">${recipe.desc || ""}</div>
                        <div style="font-size:10px;background:#f9f9f9;">${reqStr.join(' ')}</div>
                    </div>
                </div>`;
            
            const btn = document.createElement('button');
            btn.innerText = "制作";
            btn.disabled = !canCraft;
            if(!canCraft) btn.style.background = "#eee";
            btn.onclick = () => craftItem(recipe);
            const d = document.createElement('div'); d.appendChild(btn); row.appendChild(d);
            list.appendChild(row);
        }
    });
}

function craftItem(recipe) {
    // --- 特殊逻辑：召唤凋灵 ---
    if (recipe.name === "召唤凋灵") {
        // 1. 检查材料是否足够 (再次确认，防止作弊)
        for (let [mat, qty] of Object.entries(recipe.req)) { 
            if(getInvCount(mat) < qty) return log(`材料不足！需要 ${mat} x${qty}`, "red");
        }
        // 2. 消耗召唤材料
        for (let [mat, qty] of Object.entries(recipe.req)) { 
            consumeInvItem(mat, qty); 
        }

        // 3. 定义 BOSS 数据
        let boss = { 
            name: "凋灵", 
            type: "mob", 
            level: 99, 
            hp: 600,       // 超厚血量
            maxHp: 600, 
            atk: 45,       // 超高攻击
            loot: "下界之星", 
            baseExp: 2000,
            isAmbush: true // 召唤即突袭
        };

        log("😱 天地变色... 凋灵降临了！！！", "red");
        updateInventoryUI(); // 刷新背包显示(材料已扣除)
        
        // 4. 延迟 0.5秒 进入战斗
        setTimeout(() => {
            startCombat(boss, -1); 
        }, 500);
        return; // 阻止后续的普通物品制作流程
    }
    // -------------------------

    // --- 普通物品制作逻辑 ---
    
    // 1. 检查站点需求 (工作台/熔炉)
    const hasWorkbench = (player.inventory["工作台"] || 0) > 0;
    const hasFurnace = (player.inventory["熔炉"] || 0) > 0;

    if (recipe.station === 'workbench' && !hasWorkbench) return log("你需要背包里有工作台！", "red");
    if (recipe.station === 'furnace' && !hasFurnace) return log("你需要背包里有熔炉！", "red");

    // 2. 检查材料 (双重保险)
    for (let [mat, qty] of Object.entries(recipe.req)) { 
        if(getInvCount(mat) < qty) return; 
    }
    
    // 3. 消耗材料
    for (let [mat, qty] of Object.entries(recipe.req)) { 
        consumeInvItem(mat, qty); 
    } 
    
    // 4. 给予成品
    const count = recipe.count || 1;
    addItemToInventory(recipe.name, count);
    log(`制作成功: ${recipe.name} ${count > 1 ? "x"+count : ""}`);
    
    // 5. 刷新界面
    updateInventoryUI(); 
    updateCraftUI(); 
    updateStatsUI();
}



// 12. 交互：交易系统
// ------------------------------------------
function openTrading() {
    switchView('trade');
    updateTradeUI();
    log("与村民开始交易。");
}

function updateTradeUI() {
    const list = document.getElementById('trade-list');
    const emeraldCount = document.getElementById('trade-emerald-count');
    list.innerHTML = '';
    
    const myEmeralds = player.inventory['绿宝石'] || 0;
    if(emeraldCount) emeraldCount.innerText = myEmeralds;

    if (typeof TRADES !== 'undefined') {
        TRADES.forEach(trade => {
            const row = document.createElement('div');
            row.className = 'list-item';
            
            let inIcon = ITEM_ICONS[trade.in] ? `<img src="${ITEM_ICONS[trade.in]}" class="item-icon">` : "";
            let outIcon = ITEM_ICONS[trade.out] ? `<img src="${ITEM_ICONS[trade.out]}" class="item-icon">` : "";

            const myStock = player.inventory[trade.in] || 0;
            const canAfford = myStock >= trade.cost;
            
            row.innerHTML = `
                <div style="flex:1; display:flex; align-items:center; gap:5px; font-size:12px;">
                    <div style="display:flex;align-items:center;width:40%;color:${canAfford?'#333':'#e74c3c'}">
                        ${inIcon} ${trade.in} x${trade.cost}
                    </div>
                    <div style="color:#ccc;">➡</div>
                    <div style="display:flex;align-items:center;width:40%;font-weight:bold;">
                        ${outIcon} ${trade.out} x${trade.count}
                    </div>
                </div>
            `;

            const btn = document.createElement('button');
            btn.innerText = canAfford ? "交换" : "不足";
            btn.disabled = !canAfford;
            if (!canAfford) btn.style.background = "#eee";
            btn.onclick = () => executeTrade(trade);
            const d = document.createElement('div'); d.appendChild(btn); 
            row.appendChild(d);
            list.appendChild(row);
        });
    }
}

function executeTrade(trade) {
    if ((player.inventory[trade.in] || 0) < trade.cost) return;
    player.inventory[trade.in] -= trade.cost;
    if (player.inventory[trade.in] <= 0) delete player.inventory[trade.in];

    addItemToInventory(trade.out, trade.count);
    log(`交易成功: ${trade.cost}${trade.in} -> ${trade.count}${trade.out}`, "green");
    updateTradeUI();
    updateInventoryUI();
}


// 13. 交互：建筑 (已修改：点击直接进入制作)
// ------------------------------------------
function placeBuilding(name) {
    const buildings = getCurrBuildings(); 
    const key = `${player.x},${player.y}`;
    if (!buildings[key]) buildings[key] = [];
    buildings[key].push({ name: name, content: {} }); // content预留给箱子
    log(`放置了 ${name}`, "blue");
    player.inventory[name]--;
    if (player.inventory[name] <= 0) delete player.inventory[name];
    refreshLocation(); updateInventoryUI();
}

let activeBuilding = null;

function openBuilding(b, idx) {
    activeBuilding = b;
    
    // --- 修改点：工作台和熔炉直接跳转制作页 ---
    if (b.name === "工作台") {
        switchView('craft');
        // 自动切换到“全部”或“武器”标签 (可选)
        log("使用了工作台，你可以制作高级物品了。", "blue");
    }
    else if (b.name === "熔炉") {
        switchView('craft');
        // 这里虽然跳转的是同一个craft界面，但因为你站在熔炉旁边，
        // updateCraftUI会自动检测到 hasStation('furnace')，从而解锁烧炼配方
        log("打开了熔炉，可以进行烧炼和烹饪了。", "orange");
    }
    // 如果以后加了"箱子"，可以在这里写 else if (b.name === "箱子") switchView('chest');
    else {
        log("这个建筑暂时没有交互功能。");
    }
}

// 关闭建筑界面的函数 (保持不变，虽然现在很少用了)
window.closeBuilding = () => { activeBuilding = null; switchView('scene'); }

// 箱子UI逻辑暂时保留，以备后续添加真正的储物箱
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
        updateChestUI(); updateInventoryUI();
    }
}
window.takeFromChest = function(n) {
    if (activeBuilding.content[n] > 0) {
        activeBuilding.content[n]--; if (activeBuilding.content[n]<=0) delete activeBuilding.content[n];
        addItemToInventory(n, 1);
        updateChestUI(); updateInventoryUI();
    }
}



// 14. 交互：传送门
// ------------------------------------------
function usePortal() {
    if (currentDimension === "OVERWORLD") {
        log("穿过传送门... 进入下界！", "purple");
        playerPosMain = {x: player.x, y: player.y};
        currentDimension = "NETHER";
        player.x = playerPosNether.x;
        player.y = playerPosNether.y;
    } else {
        log("回到主世界。", "blue");
        playerPosNether = {x: player.x, y: player.y};
        currentDimension = "OVERWORLD";
        player.x = playerPosMain.x;
        player.y = playerPosMain.y;
    }
    refreshLocation();
}


// 15. UI 更新与通用功能 -> 刷新地点
function refreshLocation() {
    let currentMap = getCurrExplored();
    const offsets = [{dx:0,dy:0},{dx:0,dy:-1},{dx:0,dy:1},{dx:-1,dy:0},{dx:1,dy:0}];
    
    // --- 动态边界 ---
    const mapLimit = currentDimension === "OVERWORLD" ? 20 : 10;

    offsets.forEach(o => { 
        let nx = player.x + o.dx;
        let ny = player.y + o.dy; 
        if(nx >= 0 && nx < mapLimit && ny >= 0 && ny < mapLimit) {
            currentMap[`${nx},${ny}`] = true; 
        }
    });

    const biomeKey = getBiome(player.x, player.y);
    // 增加判空防止报错
    const biome = BIOMES[biomeKey] || BIOMES["PLAINS"]; 
    
    document.getElementById('loc-name').innerHTML = currentDimension==="NETHER" ? `<span style="color:#e74c3c">🔥${biome.name}</span>` : biome.name;
    document.getElementById('coord').innerText = `${player.x},${player.y}`;
    document.body.style.backgroundColor = currentDimension==="NETHER" ? "#2c0505" : "#333";

    generateScene(biomeKey);
    
    const ambusher = currentSceneItems.find(item => item.type === 'mob' && item.isAmbush);
    
    renderScene();
    updateMiniMap(); // 这里也需要对应修改，见下一步
    if (!document.getElementById('map-modal').classList.contains('hidden')) renderBigMap();

    if (ambusher) {
        log(`⚠️ 遭遇突袭！${ambusher.name} 主动发起了攻击！`, "red");
        setTimeout(() => {
            startCombat(ambusher, currentSceneItems.indexOf(ambusher));
        }, 200);
    }
}

// 关键函数：更新顶部所有数据 (修复上限显示)
function updateStatsUI() {
    // 基础属性 (当前值)
    document.getElementById('hp').innerText = player.hp;
    document.getElementById('hunger').innerText = player.hunger;
    document.getElementById('water').innerText = player.water;
    document.getElementById('sanity').innerText = player.sanity; 
    
    // 更新属性上限 (最大值) - 修复 105/100 显示错误
    if (document.getElementById('header-max-hp')) document.getElementById('header-max-hp').innerText = player.maxHp;
    if (document.getElementById('header-max-hunger')) document.getElementById('header-max-hunger').innerText = player.maxHunger;
    if (document.getElementById('header-max-water')) document.getElementById('header-max-water').innerText = player.maxWater;
    
    // 更新顶部等级栏
    if (document.getElementById('header-lv')) {
        document.getElementById('header-lv').innerText = player.level;
        
        let pct = Math.floor((player.exp / player.maxExp) * 100);
        document.getElementById('header-pct').innerText = pct + "%";
        
        document.getElementById('header-exp').innerText = player.exp;
        document.getElementById('header-max-exp').innerText = player.maxExp;
    }
}

function switchView(viewName) {
    ['scene','inventory','craft','combat','chest','trade','furnace','enchant','system'].forEach(v => document.getElementById(v+'-view')?.classList.add('hidden'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    // 如果是打开背包，默认打开属性页
    if (viewName === 'inventory') {
        document.getElementById('inventory-view').classList.remove('hidden');
        renderStatsTab();
    } else {
        document.getElementById(viewName+'-view')?.classList.remove('hidden');
    }

    // 导航栏高亮
    if (viewName === 'scene') document.querySelectorAll('.bottom-nav .nav-item')[2].classList.add('active');
    else if (viewName === 'inventory') { updateInventoryUI(); document.querySelectorAll('.bottom-nav .nav-item')[0].classList.add('active'); }
    else if (viewName === 'craft') { updateCraftUI(); document.querySelectorAll('.bottom-nav .nav-item')[1].classList.add('active'); }
    else if (viewName === 'system') { checkSaveStatus(); document.querySelectorAll('.bottom-nav .nav-item')[4].classList.add('active'); } 
}

function log(msg, color="black") {
    const el = document.getElementById('game-log');
    const p = document.createElement('p');
    p.innerText = `> ${msg}`;
    if(color !== "black") p.style.color = color;
    el.prepend(p);
}

// 地图功能
function openMap() { document.getElementById('map-modal').classList.remove('hidden'); renderBigMap(); }
function closeMap() { document.getElementById('map-modal').classList.add('hidden'); }

function updateMiniMap() {
    // --- 动态边界 ---
    const mapLimit = currentDimension === "OVERWORLD" ? 20 : 10;

    const getBName = (x, y) => {
        if (x < 0 || x >= mapLimit || y < 0 || y >= mapLimit) return "边界";
        // 增加判空
        const b = BIOMES[getBiome(x, y)];
        return b ? b.name.substring(0, 2) : "未知";
    };
    document.getElementById('dir-n').innerText = getBName(player.x, player.y - 1);
    document.getElementById('dir-s').innerText = getBName(player.x, player.y + 1);
    document.getElementById('dir-w').innerText = getBName(player.x - 1, player.y);
    document.getElementById('dir-e').innerText = getBName(player.x + 1, player.y);
}


// 渲染大地图 (已修复：地狱10x10，主世界20x20)
function renderBigMap() {
    const mapEl = document.getElementById('big-grid');
    if (!mapEl) return;
    
    // 动态获取当前地图大小
    const size = currentDimension === "OVERWORLD" ? 20 : 10;
    
    mapEl.innerHTML = '';
    // CSS网格布局动态调整
    mapEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    mapEl.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    
    const currentExplored = getCurrExplored();
    
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = document.createElement('div');
            const key = `${x},${y}`;
            
            // 检查探索状态
            if (currentExplored[key]) {
                const type = getBiome(x, y);
                if (BIOMES[type]) {
                    cell.className = `map-cell ${BIOMES[type].code}`;
                    cell.innerText = BIOMES[type].name.substring(0, 2);
                } else {
                    cell.className = 'map-cell'; // 兜底防止报错
                }

                // 显示传送门
                if(getCurrBuildings()[key]?.some(b => b.name === "下界传送门")) {
                    cell.style.border = "2px solid #8e44ad"; 
                    cell.innerText = "门";
                }
            } else { 
                cell.className = 'map-cell fog'; 
            }
            
            // 显示玩家位置
            if (x === player.x && y === player.y) { 
                cell.classList.add('player'); 
                cell.innerText = "我"; 
            }
            mapEl.appendChild(cell);
        }
    }
}


// ==========================================
// 16. 存档系统 (防卡死修复版)
// ==========================================
const SAVE_KEY = "mc_text_survival_save_v1";

// 状态显示
function checkSaveStatus() {
    const statusEl = document.getElementById('save-status');
    if (!statusEl) return;
    if (localStorage.getItem(SAVE_KEY)) {
        statusEl.innerText = "自动保存已开启";
        statusEl.style.color = "#27ae60";
    }
}

// 保存 (带防抖锁)
var _isSaving = false;
window.saveGame = function() {
    if (_isSaving || player.hp <= 0) return; 
    _isSaving = true;

    try {
        const saveData = {
            player: player,
            gameTime: gameTime,
            currentDimension: currentDimension,
            currentQuestId: currentQuestId, 
            // 兼容所有地图变量
            mapData: window.mapData || null,
            exploredMapMain: window.exploredMapMain || {},
            exploredMapNether: window.exploredMapNether || {},
            buildingsMain: window.buildingsMain || {},
            buildingsNether: window.buildingsNether || {},
            playerPosMain: window.playerPosMain || {x:10, y:10},
            playerPosNether: window.playerPosNether || {x:5, y:5}
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        checkSaveStatus();
    } catch (e) { 
        console.error("保存失败:", e); 
    } finally {
        _isSaving = false;
    }
}

// 读取存档 (已添加：自动修复NaN和旧数据)
window.loadGame = function() {
    const json = localStorage.getItem(SAVE_KEY);
    if (!json) return false; 

    try {
        const data = JSON.parse(json);
        // 恢复数据
        player = data.player || player;
        gameTime = data.gameTime || { day: 1, hour: 8 };
        currentDimension = data.currentDimension || "OVERWORLD";
        currentQuestId = data.currentQuestId || 0;

        if (data.mapData) mapData = data.mapData;
        if (data.exploredMapMain) exploredMapMain = data.exploredMapMain;
        if (data.exploredMapNether) exploredMapNether = data.exploredMapNether;
        if (data.buildingsMain) buildingsMain = data.buildingsMain;
        if (data.buildingsNether) buildingsNether = data.buildingsNether;
        if (data.playerPosMain) playerPosMain = data.playerPosMain;
        if (data.playerPosNether) playerPosNether = data.playerPosNether;

        // 修复背包为空的情况
        if (!player.inventory) player.inventory = {};

        // --- 关键修复：兼容旧存档 & 修复NaN ---
        // 1. 如果没有防御力，初始化为 0
        if (typeof player.def === 'undefined') player.def = 0;
        
        // 2. 如果血量坏了(NaN)，直接回满
        if (isNaN(player.hp) || player.hp === null) player.hp = player.maxHp;
        if (isNaN(player.maxHp)) player.maxHp = 100;
        if (isNaN(player.hunger)) player.hunger = 100;
        if (isNaN(player.water)) player.water = 100;
        if (isNaN(player.atk)) player.atk = 5;

        console.log("✅ 读档成功 (已执行数据修复)");
        return true;
    } catch (e) { 
        console.error("存档损坏:", e); 
        return false; 
    }
}

// 重置
window.resetGame = function() {
    if (confirm("⚠️ 确定要删档重来吗？")) {
        localStorage.removeItem(SAVE_KEY);
        location.reload();
    }
}

// --- 自动保存钩子 (使用 var 防止重复定义报错) ---
var _originalPassTime = window.passTime;
window.passTime = function(hours) {
    if (_originalPassTime) _originalPassTime(hours);
    saveGame(); 
};


// 17. 初始化与其他
function search() { 
    // --- 修复：战斗中禁止搜索 ---
    if (currentEnemy) {
        log("🚫 战斗中无法搜索！", "red");
        if(document.getElementById('combat-view').classList.contains('hidden')) {
            switchView('combat');
        }
        return;
    }

    passTime(2); 
    refreshLocation(); 
    log("搜索完成。"); 
}

function die() { 
    alert("你死亡了！刷新页面重来。"); 
    localStorage.removeItem(SAVE_KEY); 
    location.reload(); 
}

window.setHome = () => { 
    player.home = {dim: currentDimension, x: player.x, y: player.y}; 
    log("已安家。", "gold"); 
    refreshLocation(); 
}



// ==========================================
// 18. 任务系统 (QUEST SYSTEM)
// ==========================================

// 防止 currentQuestId 未定义
if (typeof currentQuestId === 'undefined') var currentQuestId = 0;

const QUEST_DATA = [
    {
        id: 0, title: "欢迎来到文字荒野",
        desc: "醒来时，你发现自己身处一个陌生而荒凉的世界。四周充满着未知的危险，但你的直觉告诉你，你必须活下去。<br><br>检查你的背包，那里有一把防身的武器。",
        type: "check", target: null,
        rewards: [{name: "木剑", count: 1}, {name: "面包", count: 2}, {name: "水瓶", count: 1}],
        btnText: "开始旅程"
    },
    { id: 1, title: "武装自己", desc: "打开背包，装备<b>木剑</b>。", type: "equip", target: "木剑", rewards: [{name: "苹果", count: 3}, {name: "经验瓶", count: 1}] },
    { id: 2, title: "生存第一步", desc: "去砍树，收集<b>3个原木</b>。", type: "item", target: "原木", count: 3, rewards: [{name: "木镐", count: 1}, {name: "工作台", count: 1}] },
    { id: 3, title: "工欲善其事", desc: "制作一个<b>工作台</b>。<br>注意：放在背包里即可。", type: "item", target: "工作台", count: 1, rewards: [{name: "熟牛肉", count: 2}, {name: "煤炭", count: 5}] },
    { id: 4, title: "铁器时代", desc: "寻找铁矿石，制作<b>熔炉</b>。<br>注意：放在背包里即可。", type: "item", target: "铁锭", count: 3, rewards: [{name: "铁桶", count: 1}, {name: "盾牌", count: 1}] },
    { id: 5, title: "全副武装", desc: "制作并装备<b>铁盔甲</b>。", type: "equip", target: "铁盔甲", rewards: [{name: "金苹果", count: 1}, {name: "经验瓶", count: 2}] },
    { id: 6, title: "寻找珍宝", desc: "寻找<b>钻石</b>！", type: "item", target: "钻石", count: 1, rewards: [{name: "钻石", count: 2}, {name: "书架", count: 1}] },
    { id: 7, title: "黑曜石之门", desc: "用水桶浇灭岩浆获得<b>黑曜石</b> (需10个)，并制作<b>打火石</b>。", type: "item", target: "黑曜石", count: 10, rewards: [{name: "打火石", count: 1}, {name: "抗火药水", count: 1}] },
    { id: 8, title: "深入地狱", desc: "搭建传送门进入下界。", type: "dimension", target: "NETHER", rewards: [{name: "金锭", count: 5}] },
    { id: 9, title: "烈焰的试炼", desc: "击败烈焰人获得<b>烈焰棒</b>。", type: "item", target: "烈焰棒", count: 1, rewards: [{name: "末影珍珠", count: 3}, {name: "力量药水", count: 1}] },
    { id: 10, title: "终末之眼", desc: "合成<b>12个末影之眼</b>。", type: "item", target: "末影之眼", count: 12, rewards: [{name: "金苹果", count: 5}, {name: "钻石剑", count: 1}] },
    { id: 11, title: "屠龙者", desc: "击败<b>末影龙</b>！", type: "kill", target: "末影龙", rewards: [{name: "龙蛋", count: 1}], btnText: "通关游戏" }
];

function openQuestModal() {
    const modal = document.getElementById('quest-modal');
    if (!modal) return;
    const quest = QUEST_DATA[currentQuestId];
    
    // DOM 元素获取
    const els = {
        title: document.getElementById('quest-title'),
        desc: document.getElementById('quest-desc'),
        prog: document.getElementById('quest-progress'),
        rew: document.getElementById('quest-reward-list'),
        btn: document.getElementById('btn-claim-quest')
    };

    if (!quest) {
        els.title.innerText = "传奇终章";
        els.desc.innerHTML = "<b>你已完成所有冒险！</b>";
        if(els.prog) els.prog.innerText = "";
        els.rew.innerHTML = "无";
        els.btn.style.display = "none";
    } else {
        els.title.innerText = `任务 ${quest.id + 1}: ${quest.title}`;
        els.desc.innerHTML = quest.desc;
        els.btn.style.display = "block";

        els.rew.innerHTML = "";
        quest.rewards.forEach(r => {
            let icon = ITEM_ICONS[r.name] ? `<img src="${ITEM_ICONS[r.name]}" style="width:16px;vertical-align:middle">` : "";
            els.rew.innerHTML += `<div style="font-size:12px;">${icon} ${r.name} x${r.count}</div>`;
        });

        const isFinished = checkQuestCondition(quest);
        // 进度文本
        let pTxt = "";
        if (quest.type === 'item') {
            let cur = player.inventory[quest.target] || 0;
            if (quest.target==="原木") cur = getInvCount("原木");
            let req = quest.count||1;
            pTxt = `进度: <span style="color:${cur>=req?'#4CAF50':'#e74c3c'}">${cur}/${req}</span>`;
        } else if (quest.type === 'equip') {
            let done = (player.equipWeapon === quest.target || player.equipArmor === quest.target);
            pTxt = done ? `<span style="color:#4CAF50">✅ 已装备</span>` : `<span style="color:#e74c3c">❌ 未装备</span>`;
        } else if (quest.type === 'dimension') {
            pTxt = currentDimension === quest.target ? `<span style="color:#4CAF50">✅ 已到达</span>` : `<span style="color:#e74c3c">❌ 未到达</span>`;
        }
        if(els.prog) els.prog.innerHTML = pTxt;

        if (isFinished || quest.id === 0) {
            els.btn.innerText = quest.btnText || "领取奖励";
            els.btn.disabled = false;
        } else {
            els.btn.innerText = "未完成";
            els.btn.disabled = true;
        }
    }
    modal.classList.remove('hidden');
    const bookBtn = document.querySelector('.quest-book-btn');
    if(bookBtn) bookBtn.classList.remove('notify');
}

function closeQuestModal() {
    document.getElementById('quest-modal').classList.add('hidden');
}

function checkQuestCondition(quest) {
    if (!quest) return false;
    if (quest.type === 'check') return true;
    if (quest.type === 'item') {
        let count = (player.inventory[quest.target] || 0);
        if (player.equipWeapon === quest.target) count = 1; 
        if (quest.target === "原木") count = getInvCount("原木");
        return count >= (quest.count || 1);
    }
    if (quest.type === 'equip') return player.equipWeapon === quest.target || player.equipArmor === quest.target;
    if (quest.type === 'dimension') return currentDimension === quest.target;
    return false;
}

function checkAndClaimQuest() {
    const quest = QUEST_DATA[currentQuestId];
    if (!quest) return;
    if (quest.id !== 0 && !checkQuestCondition(quest)) return log("条件未达成！", "red");
    quest.rewards.forEach(r => addItemToInventory(r.name, r.count));
    log(`任务完成！`, "gold");
    currentQuestId++;
    openQuestModal();
}

// 任务系统 Hooks (使用 var 防止重复定义)
var _originalEquipItem = window.equipItem;
window.equipItem = function(name) {
    if(_originalEquipItem) _originalEquipItem(name);
    setTimeout(() => {
        const q = QUEST_DATA[currentQuestId];
        if (q && q.type === 'equip' && q.target === name) document.querySelector('.quest-book-btn')?.classList.add('notify');
    }, 100);
}

var _originalAddItem = window.addItemToInventory;
window.addItemToInventory = function(name, count) {
    if(_originalAddItem) _originalAddItem(name, count);
    const q = QUEST_DATA[currentQuestId];
    if (q && q.type === 'item' && q.target === name) {
         let has = (player.inventory[name] || 0);
         if (name === "原木") has = getInvCount("原木");
         if (has >= (q.count || 1)) document.querySelector('.quest-book-btn')?.classList.add('notify');
    }
}

var _originalUsePortal = window.usePortal;
window.usePortal = function() {
    if(_originalUsePortal) _originalUsePortal();
    const q = QUEST_DATA[currentQuestId];
    if (q && q.type === 'dimension' && currentDimension === q.target) document.querySelector('.quest-book-btn')?.classList.add('notify');
}


// ==========================================
// 最终初始化 (安全入口)
// ==========================================
window.init = function() {
    console.log("游戏启动中...");

    // 1. 尝试读档
    const hasSave = loadGame();
    
    if (!hasSave) {
        console.log("初始化新游戏数据...");
        // 强制重置核心变量，防止旧数据残留
        player = { 
            x: 10, y: 10, hp: 100, maxHp: 100, hunger: 100, maxHunger: 100, water: 100, maxWater: 100, sanity: 100, maxSanity: 100, atk: 5, 
            level: 1, exp: 0, maxExp: 10, statPoints: 0, inventory: {}, home: null 
        };
        gameTime = { day: 1, hour: 8 };
        currentDimension = "OVERWORLD";
        currentQuestId = 0;
        
        // 重置地图
        exploredMapMain = {}; exploredMapNether = {};
        buildingsMain = {}; buildingsNether = {};
        
        // 生成出生点
        if(typeof generateScene === 'function') generateScene(getBiome(0, 0));
        
        // 发新手装
        addItemToInventory("木剑", 1);
        addItemToInventory("面包", 2);
    }

    // 2. 加载UI资源
    const navMapping = { 0: "导航_背包", 1: "导航_制作", 2: "导航_探索", 3: "导航_地图", 4: "导航_系统" };
    document.querySelectorAll('.bottom-nav .nav-icon').forEach((img, i) => {
        if(ITEM_ICONS[navMapping[i]]) img.src = ITEM_ICONS[navMapping[i]];
    });

    // 3. 刷新界面
    if (typeof refreshLocation === 'function') refreshLocation();
    if (typeof updateStatsUI === 'function') updateStatsUI();
    if (typeof updateInventoryUI === 'function') updateInventoryUI();
    if (typeof updateDayNightCycle === 'function') updateDayNightCycle();
    if (typeof checkSaveStatus === 'function') checkSaveStatus();

    // 4. 新手任务弹窗
    setTimeout(() => {
        if (currentQuestId === 0 && !hasSave) {
            if (typeof openQuestModal === 'function') openQuestModal();
        }
    }, 500);
};

// 启动
init();


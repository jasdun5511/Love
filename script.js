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


// 4. 核心循环 (时间与状态流逝)
// ------------------------------------------
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
    document.getElementById('clock-time').innerText = `${String(gameTime.hour).padStart(2, '0')}:00`;
    updateDayNightCycle();
    updateStatsUI();
}

function updateDayNightCycle() {
    document.body.classList.toggle('night-mode', gameTime.hour >= 20 || gameTime.hour < 6);
}


// 5. 移动与地形算法 (伪随机生成)
// ------------------------------------------
function move(dx, dy) {
    if(currentEnemy && document.getElementById('combat-view').className.indexOf('hidden') === -1) {
        return log("战斗中无法移动！", "red");
    }
    if (player.hp <= 0) return log("你已经倒下了。", "red");
    const newX = player.x + dx;
    const newY = player.y + dy;
    if (newX < 0 || newX >= MAP_SIZE || newY < 0 || newY >= MAP_SIZE) return log("前方是世界的尽头。");

    player.x = newX;
    player.y = newY;
    passTime(1); 
    refreshLocation();
}

function getBiome(x, y) {
    if (currentDimension === "OVERWORLD") {
        // 伪随机算法
        const dot = x * 12.9898 + y * 78.233;
        const val = Math.abs(Math.sin(dot) * 43758.5453) % 1;

        // 权重分布：村庄只有 3% 概率
        if (val < 0.20) return "OCEAN";
        if (val < 0.40) return "PLAINS";
        if (val < 0.55) return "FOREST";
        if (val < 0.65) return "DESERT";
        if (val < 0.75) return "MOUNTAIN";
        if (val < 0.85) return "SNOWY";
        if (val < 0.92) return "SWAMP";
        if (val < 0.97) return "MESA";
        return "VILLAGE"; 

    } else {
        const val = Math.abs(Math.sin(x * 37 + y * 19) * 1000) % 1;
        if (val < 0.4) return "NETHER_WASTES";
        if (val < 0.7) return "LAVA_SEA";
        if (val < 0.9) return "CRIMSON_FOREST";
        return "SOUL_SAND_VALLEY";
    }
}


// 6. 场景生成 (含盾牌格挡需要的逻辑 & 限制矿物数量)
// ------------------------------------------
function generateScene(biomeKey) {
    currentSceneItems = [];
    const biome = BIOMES[biomeKey];
    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;

    // 随机生成资源
    const resCount = 3 + Math.floor(Math.random() * 4);
    for(let i=0; i<resCount; i++) {
        const name = biome.res[Math.floor(Math.random() * biome.res.length)];
        
        // --- 修改点：稀有矿物数量变为 1 ---
        let count = Math.floor(Math.random()*3)+1; // 默认 1-3个
        const RARE_ORES = ["铁矿石", "金矿石", "钻石矿", "绿宝石矿", "远古残骸"];
        if (RARE_ORES.includes(name)) {
            count = 1; // 稀有矿强制为 1
        }
        
        currentSceneItems.push({ type: 'res', name: name, count: count });
    }

    // --- 怪物生成逻辑 (只有亡灵突袭) ---
    let mobChance = isNight ? 0.8 : 0.3; 
    if (currentDimension === "NETHER") mobChance = 0.9;
    if (biomeKey === "VILLAGE") mobChance = 0.7; 

    if (Math.random() < mobChance) {
        const mobTemplate = biome.mobs[Math.floor(Math.random() * biome.mobs.length)];
        
        // 动态等级：距离加成
        const dist = Math.abs(player.x - 10) + Math.abs(player.y - 10);
        const levelBonus = Math.floor(dist / 10); 
        let mobLevel = Math.max(1, 1 + levelBonus); 
        
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
        
        // 亡灵主动攻击判定 (50% 概率)
        const UNDEADS = ["僵尸", "骷髅", "尸壳", "流浪者", "溺尸", "僵尸猪人", "恶魂", "苦力怕", "烈焰人", "凋灵骷髅"];
        if (UNDEADS.includes(mob.name)) {
            if (Math.random() < 0.5) {
                mob.isAmbush = true; 
            }
        }

        // 夜晚或地狱增强
        if ((isNight || currentDimension === "NETHER") && mob.atk > 0) {
            mob.name = (currentDimension === "NETHER" ? "地狱的" : "狂暴的") + mob.name;
            mob.hp = Math.floor(mob.hp * 1.5);
            mob.maxHp = mob.hp;
            mob.atk = Math.floor(mob.atk * 1.5);
        }
        
        currentSceneItems.push(mob);
    }
}




// 7. 场景渲染 (网格生成)
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

    // 渲染资源和怪物
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
            if (!mobIconHtml) {
                let baseName = item.name.replace("狂暴的", "").replace("地狱的", "");
                if (ITEM_ICONS[baseName]) mobIconHtml = `<img src="${ITEM_ICONS[baseName]}" class="mob-icon">`;
            }
            btn.innerHTML = `${mobIconHtml}${item.name} <span class="lv-tag">Lv.${item.level}</span>`;
            btn.classList.add('mob');
            btn.onclick = () => startCombat(item, index);
        }
        grid.appendChild(btn);
    });
}


// 8. 交互：资源采集 (集成：宝箱、镐子限制、惊扰修正)
// ------------------------------------------
function collectResource(index) {
    if (!currentSceneItems || !currentSceneItems[index]) return;
    const item = currentSceneItems[index];

    // 1. 采集惊扰机制 (10% 概率，但宝箱不会变成怪)
    // ------------------------------------------
    if (Math.random() < 0.1 && item.name !== "宝箱") {
        const biomeKey = getBiome(player.x, player.y);
        const biome = BIOMES[biomeKey];
        const mobTemplate = biome.mobs[Math.floor(Math.random() * biome.mobs.length)];
        
        log(`💥 采集的动静引来了 ${mobTemplate.name}！`, "orange");
        
        // 生成怪物 (名字不加前缀，确保图片显示)
        let mob = { 
            type: 'mob', 
            name: mobTemplate.name, // <--- 修正：原名
            level: player.level, 
            hp: mobTemplate.hp, 
            maxHp: mobTemplate.hp, 
            atk: mobTemplate.atk, 
            loot: mobTemplate.loot, 
            baseExp: mobTemplate.atk + 5, 
            index: -1 
        };
        setTimeout(() => { startCombat(mob, -1); }, 100);
        return; 
    }

    // 2. 宝箱逻辑 (必得食物，概率得杂项/稀有矿)
    // ------------------------------------------
    if (item.name === "宝箱") {
        log("📦 打开了宝箱...", "gold");
        // 必得食物
        const foods = ["面包", "熟牛肉", "苹果", "金苹果"];
        let food = foods[Math.floor(Math.random() * foods.length)];
        addItemToInventory(food, Math.floor(Math.random()*2)+1);
        log(`获得了 ${food}`);

        // 概率资源
        if (Math.random() < 0.6) { addItemToInventory("煤炭", Math.floor(Math.random()*3)+1); log("获得了 煤炭"); }
        if (Math.random() < 0.4) { addItemToInventory("经验瓶", 1); log("获得了 ✨经验瓶✨", "purple"); }
        if (Math.random() < 0.2) { addItemToInventory("绿宝石", 1); log("获得了 💎绿宝石", "green"); }
        if (Math.random() < 0.1) { addItemToInventory("钻石", 1); log("获得了 💎钻石！", "cyan"); }

        finishCollect(index, item);
        return;
    }

    // 3. 镐子挖掘等级限制
    // ------------------------------------------
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
            if(ORE_LEVEL[item.name]===4) need="钻石镐";
            log(`你的镐子太差了！需要 [${need}] 或更好。`, "red");
            return;
        }
    }

    // 4. 普通资源采集逻辑
    // ------------------------------------------
    if (item.name === "橡树") { doCollectWork(); addItemToInventory("橡木原木", 1); log("砍倒了橡树，获得 橡木原木。", "green"); finishCollect(index, item); return; }
    if (item.name === "云杉") { doCollectWork(); addItemToInventory("云杉原木", 1); log("砍倒了云杉，获得 云杉原木。", "green"); finishCollect(index, item); return; }
    if (item.name === "小麦") { doCollectWork(); addItemToInventory("小麦", 1); addItemToInventory("小麦种子", 2); log("收割了小麦。", "gold"); finishCollect(index, item); return; }
    if (item.name === "杂草") { 
        if(Math.random()<0.3) {addItemToInventory("小麦种子", 1); log("发现种子。", "green");} 
        else log("清理杂草。"); 
        finishCollect(index, item); return; 
    }
    
    // 矿物采集 (通过等级检测后)
    if (ORE_LEVEL[item.name] || item.name === "绿宝石矿") {
        doCollectWork();
        let drop = item.name.replace("矿石", "").replace("矿", ""); // 简化掉落名
        if(item.name==="石头") drop="石头";
        addItemToInventory(drop, 1);
        addExp(2);
        log(`采集了 ${item.name}`, "gold");
        finishCollect(index, item);
        return;
    }

    // 液体
    if (item.name === "岩浆源") { if (!player.inventory["铁桶"]) { log("需[铁桶]。", "red"); return; } player.inventory["铁桶"]--; addItemToInventory("岩浆桶", 1); finishCollect(index, item); return; }
    if (item.name === "水") { 
        if (player.inventory["铁桶"]) { player.inventory["铁桶"]--; addItemToInventory("水", 1); } 
        else if (player.inventory["玻璃瓶"]) { player.inventory["玻璃瓶"]--; addItemToInventory("水瓶", 1); } 
        else { log("需容器。", "red"); return; }
        finishCollect(index, item); return;
    }

    // 其他通用
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


// 9. 交互：战斗系统 (已集成盾牌格挡)
// ------------------------------------------
function startCombat(mob, index) {
    currentEnemy = mob;
    currentEnemy.index = index;
    switchView('combat');
    let imgUrl = ITEM_ICONS[mob.name] || (ITEM_ICONS[mob.name.replace(/狂暴的|地狱的/, "")] || "");
    let imgHtml = imgUrl ? `<img src="${imgUrl}" class="combat-mob-img">` : "";
    
    // 显示等级
    document.getElementById('enemy-name').innerHTML = `${imgHtml}${mob.name} <span class="lv-tag">Lv.${mob.level}</span>`;
    document.getElementById('combat-log-area').innerHTML = `<p>遭遇了 Lv.${mob.level} ${mob.name}！</p>`;
    
    if (!document.getElementById('combat-consumables')) {
        const d = document.createElement('div');
        d.id = 'combat-consumables'; d.className = 'quick-heal-bar';
        document.getElementById('combat-log-area').before(d);
    }
    updateCombatUI();
}

function updateCombatUI() {
    if(!currentEnemy) return;
    const hpPct = (currentEnemy.hp / currentEnemy.maxHp) * 100;
    document.getElementById('enemy-hp-bar').style.width = `${hpPct}%`;
    document.getElementById('enemy-stats').innerText = `HP: ${currentEnemy.hp}/${currentEnemy.maxHp}`;
    if (player.hp <= 0) { setTimeout(() => { alert("你死了！"); location.reload(); }, 500); return; }

    const c = document.getElementById('combat-consumables');
    if (c) {
        c.innerHTML = '';
        for (let [name, count] of Object.entries(player.inventory)) {
            let r = RECIPES.find(x => x.name === name);
            if (r && r.type === 'use' && (r.effect === 'heal' || r.effect === 'food' || r.effect === 'drink' || r.effect === 'super_food')) {
                const btn = document.createElement('div');
                btn.className = 'heal-btn';
                let icon = ITEM_ICONS[name] ? `<img src="${ITEM_ICONS[name]}">` : "";
                btn.innerHTML = `${icon} ${name} x${count}`;
                btn.onclick = () => combatUseItem(name);
                c.appendChild(btn);
            }
        }
    }
}

// --- 新增：敌人回合逻辑 (包含盾牌判定) ---
function enemyTurnLogic(actionType) {
    if (!currentEnemy || currentEnemy.hp <= 0) return;

    // 1. 盾牌判定 (如果有盾牌，25%概率无伤)
    if (player.inventory["盾牌"] > 0) {
        if (Math.random() < 0.25) {
            combatLog(`🛡️ 你的盾牌抵挡了 ${currentEnemy.name} 的攻击！`, "gold");
            updateCombatUI();
            updateStatsUI();
            return; // 直接结束敌人回合，不扣血
        }
    }

    // 2. 正常伤害计算
    const eDmg = Math.max(1, currentEnemy.atk - Math.floor(Math.random()));
    player.hp -= eDmg;
    
    let prefix = actionType === 'use' ? "趁你使用物品时，" : (actionType === 'flee' ? "逃跑失败！" : "");
    combatLog(`${prefix}受到 ${eDmg} 伤害`, "red");

    // 受击震动效果
    document.body.classList.remove('shake'); 
    void document.body.offsetWidth; 
    document.body.classList.add('shake');
    
    if (player.hp <= 0) die();
    updateStatsUI();
    updateCombatUI();
}

function combatUseItem(name) {
    if (!currentEnemy || !player.inventory[name]) return;
    useItem(name); 
    // 使用物品后，敌人会攻击 (调用新逻辑)
    enemyTurnLogic('use');
}

function combatLog(msg, color="#333") {
    const el = document.getElementById('combat-log-area');
    const p = document.createElement('p');
    p.innerText = msg;
    p.style.color = color;
    el.prepend(p);
}

function combatAttack() {
    if (!currentEnemy) return;
    const pDmg = player.atk + Math.floor(Math.random() * 3);
    currentEnemy.hp -= pDmg;
    combatLog(`你造成 ${pDmg} 伤害`, "green");
    
    // 敌人震动
    document.querySelector('.enemy-box').classList.remove('shake'); 
    void document.querySelector('.enemy-box').offsetWidth; 
    document.querySelector('.enemy-box').classList.add('shake');

    if (currentEnemy.hp <= 0) {
        const loot = currentEnemy.loot;
        const expGain = (currentEnemy.baseExp || 5) + currentEnemy.level * 2;
        combatLog(`胜利！获得 ${loot}，EXP +${expGain}`, "gold");
        addItemToInventory(loot, 1);
        addExp(expGain); 
        
        if (currentSceneItems[currentEnemy.index]) currentSceneItems.splice(currentEnemy.index, 1);
        setTimeout(() => { switchView('scene'); renderScene(); }, 800);
        return; 
    }
    
    // 玩家攻击后，敌人反击 (调用新逻辑)
    enemyTurnLogic('atk');
}

function combatFlee() {
    if (Math.random() > 0.5) { 
        log("逃跑成功！", "orange"); 
        currentEnemy = null; 
        switchView('scene'); 
    }
    else {
        // 逃跑失败，敌人攻击 (调用新逻辑)
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
    if (name.includes("肉") || name.includes("排") || name.includes("鱼") || name.includes("苹果") || name.includes("瓶") || name.includes("面包") || name.includes("马铃薯")) return 'food';
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

    // 属性面板数值 (优化：饥饿和水分现在显示 当前/上限)
    document.getElementById('val-hp').innerText = player.hp;
    document.getElementById('val-max-hp').innerText = player.maxHp;
    
    // 修改点：实时显示饥饿和水分状态
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
                
                let actionBtn = "";
                if (type === 'food') actionBtn = `<button onclick="useItem('${name}')">使用</button>`;

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

function renderEquipTab() {
    // 1. 渲染已装备的槽位 (优化：显示图片和属性加成)
    const renderSlot = (domId, itemName, type) => {
        const el = document.getElementById(domId);
        if (!el) return;
        
        if (itemName) {
            // 获取图标
            let icon = ITEM_ICONS[itemName] ? `<img src="${ITEM_ICONS[itemName]}" style="width:32px;height:32px;margin-bottom:2px;">` : "";
            // 获取属性加成
            let r = RECIPES.find(x => x.name === itemName);
            let bonusText = "";
            if (r) {
                if (type === 'weapon') bonusText = `<span style="color:#e74c3c;font-size:10px;">攻击+${r.val}</span>`;
                if (type === 'armor') bonusText = `<span style="color:#2ecc71;font-size:10px;">生命+${r.val}</span>`;
            }
            
            el.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;">
                    ${icon}
                    <div style="font-weight:bold;color:#333;">${itemName}</div>
                    ${bonusText}
                </div>`;
        } else {
            // 空槽位显示
            el.innerHTML = `<div style="color:#ccc;line-height:40px;">无</div>`;
        }
    };

    renderSlot('slot-weapon', player.equipWeapon, 'weapon');
    renderSlot('slot-armor', player.equipArmor, 'armor');

    // 2. 渲染下方装备列表
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
                
                // 查找属性方便显示在列表中
                let r = RECIPES.find(x => x.name === name);
                let statInfo = "";
                if(r && r.effect === 'atk') statInfo = `<span style="font-size:10px;color:#e74c3c;margin-left:5px;">(攻${r.val})</span>`;
                if(r && r.effect === 'hp_max') statInfo = `<span style="font-size:10px;color:#2ecc71;margin-left:5px;">(血${r.val})</span>`;

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


window.equipItem = function(name) {
    let r = RECIPES.find(x => x.name === name);
    let type = "weapon"; 
    if (name.includes("甲") || name.includes("头盔") || name.includes("靴")) type = "armor";
    
    // 卸下旧的，换上新的
    if (type === "weapon") {
        if (player.equipWeapon) addItemToInventory(player.equipWeapon, 1);
        player.equipWeapon = name;
        
        // --- 修复：计算攻击力 ---
        let bonus = r && r.val ? r.val : 3; // 默认+3
        
        // 针对没有配方的稀有掉落物，手动指定攻击力
        if (name === "三叉戟") bonus = 9; 
        
        player.atk = 5 + bonus; // 基础5 + 武器
    } else {
        if (player.equipArmor) addItemToInventory(player.equipArmor, 1);
        player.equipArmor = name;
        // 防具暂定为增加血量上限
        let bonus = r && r.val ? r.val : 10;
        player.maxHp += bonus; 
        player.hp += bonus; 
    }
    
    player.inventory[name]--;
    if (player.inventory[name] <= 0) delete player.inventory[name];
    
    renderEquipTab();
    updateStatsUI();
    log(`装备了 ${name}！(攻击力: ${player.atk})`);
}


// 交互：使用物品 (已添加谜之炖菜)
function useItem(name) {
    if (!player.inventory[name]) return;
    let recipe = RECIPES.find(r => r.name === name);

    // 1. 建筑类
    if (recipe && recipe.type === 'build') { placeBuilding(name); return; }

    // 2. 特殊物品：金苹果
    if (name === "金苹果") { 
        player.hp = player.maxHp; 
        log("金苹果的力量涌上来！(HP回满)", "gold"); 
    }
    // 3. 新增：谜之炖菜与绷带
    else if (name === "谜之炖菜") {
        player.hunger = Math.min(player.maxHunger, player.hunger + 10);
        player.water = Math.min(player.maxWater, player.water + 10);
        log("喝下了谜之炖菜，味道有点...微妙。(饥饿/水分 +10)", "gold");
        // 吃完返还一个碗(在这个简化版里我们返还个木棍意思一下，或者不返还)
        // 这里暂时不返还物品，直接消耗
    }
    
    else if (name === "简易绷带") {
        if (player.hp >= player.maxHp) {
            log("你并没有受伤，不需要包扎。", "red");
            return; // 满血不消耗
        }
        player.hp = Math.min(player.maxHp, player.hp + 15);
        log("使用了简易绷带，伤口不再流血了。(HP +15)", "green");
        // 消耗物品在函数最后统一处理
    }

    // 4. 普通配方物品
    else if (recipe) {
        if (recipe.effect === 'food') {
            player.hunger = Math.min(player.maxHunger, player.hunger + recipe.val);
            log(`吃了 ${name} (饥饿 +${recipe.val})`);
        } 
        else if (recipe.effect === 'drink') {
            player.water = Math.min(player.maxWater, player.water + recipe.val);
            log(`喝了 ${name} (水分 +${recipe.val})`, "blue");
        }
        else if (recipe.effect === 'super_food') {
            player.hp = Math.min(player.maxHp, player.hp + 20);
            player.water = Math.min(player.maxWater, player.water + recipe.val);
            log(`喝了 ${name}，感觉好多了！`, "gold");
        }
    }
    // 5. 生吃食物 (兜底逻辑)
    else if (getItemType(name) === 'food') {
        player.hunger = Math.min(player.maxHunger, player.hunger + 5);
        log(`勉强吃了 ${name} (生食 +5)`);
    }

    // 消耗物品
    player.inventory[name]--;
    if (player.inventory[name] <= 0) delete player.inventory[name];
    
    // 喝完水返还瓶子
    if (name === "水瓶" || name === "蜂蜜瓶") addItemToInventory("玻璃瓶", 1);

    updateStatsUI();
    updateInventoryUI();
}


function updateInventoryUI() {
    const activeTabBtn = document.querySelector('.inv-tab-btn.active');
    if (activeTabBtn && activeTabBtn.innerText.includes("装备")) {
        renderEquipTab();
    } else {
        renderStatsTab();
    }
}


// 11. 交互：制作系统
// ------------------------------------------
window.setCraftFilter = (f, b) => { currentCraftFilter = f; document.querySelectorAll('#craft-view .tab-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); updateCraftUI(); }

function updateCraftUI() {
    const list = document.getElementById('craft-list');
    list.innerHTML = '';
    const nearWorkbench = hasStation('workbench');
    const nearFurnace = hasStation('furnace');

    RECIPES.forEach(recipe => {
        let show = false;
        if (currentCraftFilter === 'all') show = true;
        else if (currentCraftFilter === 'equip' && recipe.type === 'equip') show = true;
        else if (currentCraftFilter === 'food' && recipe.type === 'use') show = true;
        else if (currentCraftFilter === 'build' && (recipe.type === 'build' || recipe.type === 'item')) show = true;

        if (show) {
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

            let missingMsg = "";
            let stationMissing = false;
            if (recipe.station === 'workbench' && !nearWorkbench) { stationMissing = true; missingMsg = "需:工作台"; canCraft = false; }
            if (recipe.station === 'furnace' && !nearFurnace) { stationMissing = true; missingMsg = "需:熔炉"; canCraft = false; }
            
            row.innerHTML = `
                <div style="flex:1; display:flex; align-items:center; gap:10px; opacity:${stationMissing ? 0.6 : 1}">
                    ${icon}
                    <div>
                        <div style="font-weight:bold;font-size:12px;">${recipe.name}</div>
                        <div style="font-size:10px;color:#999;">${recipe.desc || ""}</div>
                        <div style="font-size:10px;background:#f9f9f9;">${reqStr.join(' ')}</div>
                        ${stationMissing ? `<div style="font-size:10px;color:red;">⚠️ ${missingMsg}</div>` : ""}
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
    if (recipe.station === 'workbench' && !hasStation('workbench')) return log("这里没有工作台！", "red");
    if (recipe.station === 'furnace' && !hasStation('furnace')) return log("这里没有熔炉！", "red");

    for (let [mat, qty] of Object.entries(recipe.req)) { 
        if(getInvCount(mat) < qty) return; 
    }
    for (let [mat, qty] of Object.entries(recipe.req)) { 
        consumeInvItem(mat, qty); 
    } 
    
    const count = recipe.count || 1;
    addItemToInventory(recipe.name, count);
    log(`制作成功: ${recipe.name} ${count > 1 ? "x"+count : ""}`);
    
    updateInventoryUI(); updateCraftUI(); updateStatsUI();
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


// 13. 交互：建筑与储物箱
// ------------------------------------------
function placeBuilding(name) {
    const buildings = getCurrBuildings(); 
    const key = `${player.x},${player.y}`;
    if (!buildings[key]) buildings[key] = [];
    buildings[key].push({ name: name, content: name==="工作台"?{}:null });
    log(`放置了 ${name}`, "blue");
    player.inventory[name]--;
    if (player.inventory[name] <= 0) delete player.inventory[name];
    refreshLocation(); updateInventoryUI();
}

let activeBuilding = null;
function openBuilding(b, idx) {
    activeBuilding = b;
    if (b.name === "工作台") { switchView('chest'); updateChestUI(); }
    else log("这个建筑暂时没有功能。");
}
window.closeBuilding = () => { activeBuilding = null; switchView('scene'); }

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


// 15. UI 更新与通用功能 (已修复：亡灵突袭检测)
// ------------------------------------------
function refreshLocation() {
    let currentMap = getCurrExplored();
    const offsets = [{dx:0,dy:0},{dx:0,dy:-1},{dx:0,dy:1},{dx:-1,dy:0},{dx:1,dy:0}];
    offsets.forEach(o => { let nx=player.x+o.dx, ny=player.y+o.dy; if(nx>=0&&nx<MAP_SIZE&&ny>=0&&ny<MAP_SIZE) currentMap[`${nx},${ny}`] = true; });

    const biomeKey = getBiome(player.x, player.y);
    const biome = BIOMES[biomeKey];
    document.getElementById('loc-name').innerHTML = currentDimension==="NETHER" ? `<span style="color:#e74c3c">🔥${biome.name}</span>` : biome.name;
    document.getElementById('coord').innerText = `${player.x},${player.y}`;
    document.body.style.backgroundColor = currentDimension==="NETHER" ? "#2c0505" : "#333";

    generateScene(biomeKey);
    
    // --- 新增：检测是否有怪在埋伏 (Move/Search 触发) ---
    const ambusher = currentSceneItems.find(item => item.type === 'mob' && item.isAmbush);
    
    renderScene();
    updateMiniMap();
    if (!document.getElementById('map-modal').classList.contains('hidden')) renderBigMap();

    // 如果有伏击怪，强制进入战斗
    if (ambusher) {
        log(`⚠️ 遭遇突袭！${ambusher.name} 主动发起了攻击！`, "red");
        // 延迟 200ms 让玩家先看一眼地图，然后进战斗
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
    const getBName = (x, y) => {
        if (x < 0 || x >= MAP_SIZE || y < 0 || y >= MAP_SIZE) return "边界";
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
                if(getCurrBuildings()[key]?.some(b => b.name === "下界传送门")) {
                    cell.style.border = "2px solid #8e44ad"; cell.innerText = "门";
                }
            } else { cell.className = 'map-cell fog'; }
            if (x === player.x && y === player.y) { cell.classList.add('player'); cell.innerText = "我"; }
            mapEl.appendChild(cell);
        }
    }
}


// 16. 存档系统
// ------------------------------------------
const SAVE_KEY = "mc_text_survival_save_v1";

function checkSaveStatus() {
    const statusEl = document.getElementById('save-status');
    if (!statusEl) return;
    if (localStorage.getItem(SAVE_KEY)) {
        statusEl.innerText = "已检测到本地存档";
        statusEl.style.color = "#27ae60";
    } else {
        statusEl.innerText = "暂无存档";
        statusEl.style.color = "#e74c3c";
    }
}

function saveGame() {
    if (player.hp <= 0) return alert("死人是不能存档的！");
    const saveData = {
        player: player,
        gameTime: gameTime,
        currentDimension: currentDimension,
        exploredMapMain: exploredMapMain,
        exploredMapNether: exploredMapNether,
        buildingsMain: buildingsMain,
        buildingsNether: buildingsNether,
        playerPosMain: playerPosMain,
        playerPosNether: playerPosNether
    };
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        log("游戏进度已保存。", "green");
        alert("保存成功！");
        checkSaveStatus();
    } catch (e) { alert("保存失败！"); console.error(e); }
}

function loadGame() {
    const json = localStorage.getItem(SAVE_KEY);
    if (!json) return alert("没有找到存档！");
    if (!confirm("确定要读取旧存档吗？当前未保存的进度将丢失。")) return;
    try {
        const data = JSON.parse(json);
        player = data.player;
        gameTime = data.gameTime;
        currentDimension = data.currentDimension;
        exploredMapMain = data.exploredMapMain || {};
        exploredMapNether = data.exploredMapNether || {};
        buildingsMain = data.buildingsMain || {};
        buildingsNether = data.buildingsNether || {};
        playerPosMain = data.playerPosMain || {x:10, y:10};
        playerPosNether = data.playerPosNether || {x:10, y:10};

        log("读取存档成功。", "blue");
        document.getElementById('clock-time').innerText = `${String(gameTime.hour).padStart(2, '0')}:00`;
        updateDayNightCycle();
        refreshLocation(); 
        updateStatsUI();
        updateInventoryUI();
        switchView('scene');
    } catch (e) { alert("存档损坏！"); console.error(e); }
}

function resetGame() {
    if (confirm("⚠️ 警告：这将永久删除你的存档并重置游戏！确定吗？")) {
        localStorage.removeItem(SAVE_KEY);
        location.reload();
    }
}


// 17. 初始化与其他
// ------------------------------------------
function search() { passTime(2); refreshLocation(); log("搜索完成。"); }
function die() { alert("你死亡了！刷新页面重来。"); location.reload(); }
window.setHome = () => { player.home = {dim: currentDimension, x: player.x, y: player.y}; log("已安家。", "gold"); refreshLocation(); }

function init() {
    const navMapping = { 0: "导航_背包", 1: "导航_制作", 2: "导航_探索", 3: "导航_地图", 4: "导航_系统" };
    document.querySelectorAll('.bottom-nav .nav-icon').forEach((img, i) => {
        if(ITEM_ICONS[navMapping[i]]) img.src = ITEM_ICONS[navMapping[i]];
    });

    addItemToInventory("木剑", 1);
    addItemToInventory("面包", 2);

    refreshLocation();
    updateStatsUI();
    updateDayNightCycle();
    log("RPG系统启动！点击背包查看属性。");
    checkSaveStatus();
}

init();

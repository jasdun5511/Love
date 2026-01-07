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
        name: "地狱荒原", code: "bg-NETHER", // 需要在CSS加个红色背景
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
    // === 核心科技 ===
    { name: "铁锭", req: { "铁矿石": 1, "煤炭": 1 }, type: "item", desc: "基础工业材料" },
    { name: "打火石", req: { "铁锭": 1, "燧石": 1 }, type: "item", desc: "点火工具" }, // 改为 item，作为材料消耗
    { name: "铁桶", req: { "铁锭": 3 }, type: "item", desc: "装流体用" },
    { name: "黑曜石", req: { "岩浆桶": 1, "水": 1 }, type: "item", desc: "坚硬方块" },
    
    // 关键修改：传送门变成建筑，放置在地上
    { name: "下界传送门", req: { "黑曜石": 10, "打火石": 1 }, type: "build", desc: "放置后点击进入地狱" },

    // ... (保留您之前的其他所有配方：石斧、铁剑、烤肉串等，这里省略以节省篇幅，请务必保留！) ...
    // === 请把之前所有的装备、食物配方都粘贴在这里 ===
    

    // === 基础工具/武器 ===
    { name: "石斧", req: { "木棍": 2, "石头": 3 }, type: "equip", effect: "atk", val: 8, desc: "基础工具 (攻8)" },
    { name: "铜剑", req: { "木棍": 2, "铜矿石": 3 }, type: "equip", effect: "atk", val: 14, desc: "比石器好用 (攻14)" },
    { name: "铁剑", req: { "木棍": 2, "铁矿石": 3, "煤炭": 1 }, type: "equip", effect: "atk", val: 20, desc: "标准武器 (攻20)" }, // 数值微调
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


// 玩家状态 (新增 sanity 理智值)
let player = { 
    x: 10, y: 10, 
    hp: 100, maxHp: 100, 
    hunger: 100, maxHunger: 100,
    water: 100, maxWater: 100,
    sanity: 100, maxSanity: 100, // 新增：理智
    atk: 5, 
    inventory: {} 
};

let gameTime = { day: 1, hour: 8 };
let exploredMap = {}; 
let currentSceneItems = [];
let currentEnemy = null; // 当前战斗敌人


let currentDimension = "OVERWORLD"; // 当前维度: "OVERWORLD" 或 "NETHER"
let exploredMapMain = {};   // 主世界探索记录
let exploredMapNether = {}; // 地狱探索记录
let buildingsMain = {};     // 主世界建筑
let buildingsNether = {};   // 地狱建筑

// 玩家坐标需要分开记忆，否则进地狱会掉虚空
let playerPosMain = {x: 10, y: 10};
let playerPosNether = {x: 10, y: 10}; 

// 辅助函数：获取当前世界的建筑列表
function getCurrBuildings() {
    return currentDimension === "OVERWORLD" ? buildingsMain : buildingsNether;
}



// --- 2. 核心系统：时间与状态 ---

function passTime(hours) {
    gameTime.hour += hours;
    
    // 饥饿与水分消耗
    player.hunger = Math.max(0, player.hunger - (2 * hours));
    player.water = Math.max(0, player.water - (3 * hours));

    // 昼夜判断
    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;

    // --- 新增：理智系统逻辑 ---
    if (isNight) {
        // 晚上每小时扣 3点 理智
        player.sanity = Math.max(0, player.sanity - (3 * hours));
        if (player.sanity < 50) log("黑暗中似乎有眼睛在盯着你... (理智下降)", "purple");
    }

    // 状态惩罚
    if (player.hunger === 0 || player.water === 0) {
        player.hp = Math.max(0, player.hp - 5);
        log("你感到饥渴难耐，生命值正在流逝...", "red");
    }
    // 理智归零惩罚
    if (player.sanity === 0) {
        player.hp = Math.max(0, player.hp - 10);
        log("你已经疯了！极度恐惧让你心脏剧痛 (HP -10)", "purple");
    }

    // 昼夜循环
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
        if (!body.classList.contains('night-mode')) {
            body.classList.add('night-mode');
            log("夜幕降临了，怪物变得更加凶猛...", "purple");
        }
    } else {
        if (body.classList.contains('night-mode')) {
            body.classList.remove('night-mode');
            log("天亮了。", "orange");
        }
    }
}

// --- 3. 核心系统：移动与地图 (保留原有逻辑) ---

function move(dx, dy) {
    // 战斗中禁止移动
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
        // 主世界 8 种地形
        const keys = ["PLAINS", "FOREST", "DESERT", "MOUNTAIN", "SNOWY", "OCEAN", "SWAMP", "MESA"];
        return keys[Math.abs((x * 37 + y * 13) % keys.length)];
    } else {
        // 地狱 4 种地形
        const keys = ["NETHER_WASTES", "CRIMSON_FOREST", "SOUL_SAND_VALLEY", "LAVA_SEA"];
        // 地狱地形生成算法稍微换个参数，更有随机感
        return keys[Math.abs((x * 7 + y * 19) % keys.length)];
    }
}


// --- 4. 核心系统：交互与战斗 (更新夜间强化) ---

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
    // 晚上生成概率 0.8，白天 0.3
    let mobChance = isNight ? 0.8 : 0.3; 

    if (Math.random() < mobChance) {
        const mobTemplate = biome.mobs[Math.floor(Math.random() * biome.mobs.length)];
        
        // 复制一份怪物数据
        let mob = { 
            type: 'mob', 
            name: mobTemplate.name, 
            hp: mobTemplate.hp, 
            maxHp: mobTemplate.hp,
            atk: mobTemplate.atk,
            loot: mobTemplate.loot
        };

        // --- 夜间强化逻辑 ---
        if (isNight) {
            mob.name = "狂暴的" + mob.name;
            mob.hp = Math.floor(mob.hp * 1.5); // 血量1.5倍
            mob.maxHp = mob.hp;
            mob.atk = Math.floor(mob.atk * 1.5); // 攻击1.5倍
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
        
        // 特殊渲染传送门
        if (b.name === "下界传送门") {
            btn.innerText = "🔮 下界传送门";
            btn.style.borderColor = "#8e44ad";
            btn.style.color = "#8e44ad";
            btn.onclick = () => usePortal(); // 点击传送
        } else {
            btn.innerText = `🏠 ${b.name}`;
            btn.onclick = () => openBuilding(b, idx);
        }
        grid.appendChild(btn);
    });

    // 2. 渲染资源和怪物 (保持不变)
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


// --- 修正版采集逻辑：允许透支生命采集 ---
function collectResource(index) {
    const item = currentSceneItems[index];
    if (!item) return;

    // 1. 计算消耗 (优先扣状态，没有状态扣血)
    let hpCost = 0;

    // 饥饿判定
    if (player.hunger > 0) {
        player.hunger -= 1;
    } else {
        hpCost += 2; // 没饭吃硬干活，扣2血
        log("饥饿时强行劳作，体力透支... (HP -2)", "red");
    }

    // 水分判定
    if (player.water > 0) {
        player.water -= 1;
    } else {
        hpCost += 2; // 没水喝硬干活，扣2血
        log("极度口渴伴随着眩晕... (HP -2)", "red");
    }

    // 2. 执行扣血与死亡判定
    if (hpCost > 0) {
        player.hp -= hpCost;
        
        // 视觉反馈：屏幕震动
        document.body.classList.remove('shake');
        void document.body.offsetWidth;
        document.body.classList.add('shake');

        if (player.hp <= 0) {
            die();
            return; // 死了就不能获得物品了
        }
    }

    // 更新顶部状态栏
    updateStatsUI(); 

    // 3. 获得物品逻辑
    addItemToInventory(item.name, 1);
    item.count--;
    
    // 如果没扣血，显示普通日志
    if (hpCost === 0) {
        log(`采集了 1个 ${item.name} (剩余:${item.count})`);
    }

    // 4. 数量为0移除
    if (item.count <= 0) {
        currentSceneItems.splice(index, 1);
    }

    // 5. 刷新界面
    renderScene();
}

// --- 5. 新增：战斗系统 (独立界面) ---

function startCombat(mob, index) {
    currentEnemy = mob;
    currentEnemy.index = index;

    // 切换到战斗视图
    switchView('combat');
    
    // 初始化战斗UI
    document.getElementById('enemy-name').innerText = mob.name;
    document.getElementById('combat-log-area').innerHTML = `<p>遭遇了 ${mob.name}！它看起来充满敌意！</p>`;
    updateCombatUI();
}

function updateCombatUI() {
    if(!currentEnemy) return;
    // 更新血条
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
    el.prepend(p); // 最新消息在最上
}

// --- 极速战斗逻辑：无延迟，防鞭尸 ---
function combatAttack() {
    // 1. 【安全门】：如果当前没敌人（已经死了），直接终止，防止鞭尸
    if (!currentEnemy || currentEnemy.hp <= 0) return;

    // --- 玩家回合 ---
    
    // 计算伤害
    const pDmg = player.atk + Math.floor(Math.random() * 3);
    currentEnemy.hp -= pDmg;
    
    // 【及时反馈】：立刻更新血条和日志
    combatLog(`你造成 ${pDmg} 伤害`, "green");
    updateCombatUI(); 

    // 【动画重置】：强制重绘，保证每次点击都有震动感
    const box = document.querySelector('.enemy-box');
    box.classList.remove('shake');
    void box.offsetWidth; // 触发重绘黑魔法
    box.classList.add('shake');

    // --- 死亡判定 (最关键的一步) ---
    
    if (currentEnemy.hp <= 0) {
        // 1. 先记录掉落物，防止后面清空了拿不到
        const loot = currentEnemy.loot;
        const idx = currentEnemy.index;
        
        // 2. 【核心修复】：立刻、马上、瞬间把当前敌人设为 null
        // 这行代码执行后，哪怕你手速一秒10枪，下一枪进入函数第一行就会被弹回去
        currentEnemy = null; 

        // 3. 结算奖励
        combatLog(`胜利！获得 ${loot}`, "gold");
        addItemToInventory(loot, 1);
        
        // 4. 移除场景里的怪物
        if (currentSceneItems[idx]) {
            currentSceneItems.splice(idx, 1);
        }

        // 5. 延迟返回地图 (仅视觉延迟，逻辑已结束)
        setTimeout(() => { 
            switchView('scene'); 
            renderScene(); 
        }, 800);
        return; // 结束函数，怪物死了就不让它反击了
    }

    // --- 怪物瞬间反击 (无延迟) ---
    // 你点得快，怪物打你也快，这才公平
    
    const eDmg = Math.max(1, currentEnemy.atk - Math.floor(Math.random()));
    player.hp -= eDmg;
    
    // 扣理智 (因为攻速快，建议把理智扣除调低一点，或者保持不变增加难度)
    player.sanity = Math.max(0, player.sanity - 1); 

    combatLog(`受到 ${eDmg} 伤害`, "red");
    
    // 玩家受击动画
    document.body.classList.remove('shake');
    void document.body.offsetWidth;
    document.body.classList.add('shake');

    // 玩家死亡判定
    if (player.hp <= 0) {
        die();
    }
    
    // 更新所有UI
    updateStatsUI();
    updateCombatUI();
}


// 敌人回合
function enemyTurn() {
    if(!currentEnemy || currentEnemy.hp <= 0) return;

    // 伤害计算
    const dmg = Math.max(1, currentEnemy.atk - Math.floor(Math.random()));
    player.hp -= dmg;

    // --- 理智扣除 ---
    // 每次被攻击，理智 -2
    const sanityDmg = 2;
    player.sanity = Math.max(0, player.sanity - sanityDmg);

    combatLog(`${currentEnemy.name} 反击！HP -${dmg}, 理智 -${sanityDmg}`, "red");
    
    // 玩家受击动画 (屏幕震动)
    document.body.classList.add('shake');
    setTimeout(()=>document.body.classList.remove('shake'), 200);

    updateStatsUI();
    updateCombatUI();
}

// 逃跑
function combatFlee() {
    // 50% 概率逃跑
    if (Math.random() > 0.5) {
        log("你狼狈地逃离了战场...", "orange");
        player.sanity = Math.max(0, player.sanity - 5); // 逃跑扣理智
        currentEnemy = null;
        switchView('scene');
    } else {
        combatLog("逃跑失败！怪物拦住了你！", "red");
        enemyTurn(); // 逃跑失败会被打
    }
}

// --- 6. 核心系统：背包与合成 (保留原有逻辑，更新理智药) ---

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
            
            if (["烤肉", "烤肉串", "绷带", "草药绷带", "浆果", "生鱼", "羊肉", "纯净水", "仙人掌沙拉", "炖肉汤", "篝火"].includes(name)) {
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
    if (!player.inventory[name] || player.inventory[name] <= 0) return;
    
    let recipe = RECIPES.find(r => r.name === name);
    
    // 特殊物品处理
    if (name === "浆果") {
        player.hunger += 5; 
        player.sanity += 2; // 吃浆果回理智
        log("吃了浆果，心情好了一点点。");
    }
    // 配方物品处理
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
            // 篝火回理智
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
    // 根据当前世界选择探索记录
    let currentMap = currentDimension === "OVERWORLD" ? exploredMapMain : exploredMapNether;
    currentMap[`${player.x},${player.y}`] = true;

    const biomeKey = getBiome(player.x, player.y);
    const biome = BIOMES[biomeKey];
    
    // 标题变色提示
    let titleColor = currentDimension === "OVERWORLD" ? "#333" : "#c0392b"; // 地狱红色标题
    let titleHtml = `<span style="color:${titleColor}">${biome.name}</span>`;
    
    if(player.home && player.home.dim === currentDimension && player.home.x === player.x && player.home.y === player.y) {
        titleHtml += " <span style='color:gold'>(家)</span>";
    }
    
    document.getElementById('loc-name').innerHTML = titleHtml;
    document.getElementById('coord').innerText = `${player.x},${player.y}`;
    
    // 地狱背景变色
    if (currentDimension === "NETHER") {
        document.body.style.backgroundColor = "#2c0505"; // 深红背景
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
    document.getElementById('sanity').innerText = player.sanity; // 更新理智
}

function switchView(viewName) {
    document.getElementById('scene-view').classList.add('hidden');
    document.getElementById('inventory-view').classList.add('hidden');
    document.getElementById('craft-view').classList.add('hidden');
    document.getElementById('combat-view').classList.add('hidden'); // 新增

    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

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
    } else if (viewName === 'combat') {
        document.getElementById('combat-view').classList.remove('hidden');
    }
}

function log(msg, color="black") {
    const el = document.getElementById('game-log');
    const p = document.createElement('p');
    p.innerText = `> ${msg}`;
    if(color !== "black") p.style.color = color;
    el.prepend(p);
}

// 地图相关函数 (保持不变)
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

window.search = function() {
    passTime(2);
    refreshLocation();
    log("搜索完成。");
}

function init() {
    addItemToInventory("烤肉串", 2);
    addItemToInventory("草药绷带", 1);
    refreshLocation();
    updateStatsUI();
    updateDayNightCycle();
    log("生存开始。注意理智值，不要在深夜游荡！");
}


// --- 建筑放置系统 ---
function placeBuilding(name) {
    const buildings = getCurrBuildings(); // 获取当前世界的建筑数据
    const key = `${player.x},${player.y}`;
    
    if (!buildings[key]) buildings[key] = [];
    
    // 数据结构
    let newBuild = { name: name };
    if (name === "储物箱") newBuild.content = {};
    
    buildings[key].push(newBuild);
    log(`放置了 ${name}`, "blue");
    
    // 消耗物品
    player.inventory[name]--;
    if (player.inventory[name] <= 0) delete player.inventory[name];
    
    refreshLocation();
    updateInventoryUI();
}

// --- 核心：传送门逻辑 ---
function usePortal() {
    if (currentDimension === "OVERWORLD") {
        // 主世界 -> 地狱
        log("你踏入了紫色的光幕... 空间开始扭曲！", "purple");
        
        // 保存主世界坐标
        playerPosMain = {x: player.x, y: player.y};
        
        // 切换到地狱
        currentDimension = "NETHER";
        player.x = playerPosNether.x;
        player.y = playerPosNether.y;
        
        // 第一次进地狱，自动在脚下生成一个传送门，方便回去
        const key = `${player.x},${player.y}`;
        if (!buildingsNether[key]) buildingsNether[key] = [];
        let hasPortal = buildingsNether[key].some(b => b.name === "下界传送门");
        if (!hasPortal) {
            buildingsNether[key].push({name: "下界传送门"});
            log("地狱侧的传送门自动生成了。", "gray");
        }
        
    } else {
        // 地狱 -> 主世界
        log("你逃离了炙热的地狱。", "blue");
        
        // 保存地狱坐标
        playerPosNether = {x: player.x, y: player.y};
        
        // 切换回主世界
        currentDimension = "OVERWORLD";
        player.x = playerPosMain.x;
        player.y = playerPosMain.y;
    }
    
    // 刷新场景
    refreshLocation();
}



init();

// --- 1. 配置与数据 ---
const MAP_SIZE = 20;

// 地形配置 (增加掉落物和怪物)
const BIOMES = {
    PLAINS: { name: "草原", code: "bg-PLAINS", res: ["杂草", "野花", "木棍"], mobs: [{name:"野兔", hp:20, atk:2, loot:"生兔肉"}, {name:"变异鼠", hp:30, atk:5, loot:"腐肉"}] },
    FOREST: { name: "森林", code: "bg-FOREST", res: ["原木", "木棍", "浆果"], mobs: [{name:"森林狼", hp:50, atk:8, loot:"皮革"}, {name:"骷髅兵", hp:45, atk:10, loot:"骨头"}] },
    DESERT: { name: "沙漠", code: "bg-DESERT", res: ["沙子", "仙人掌", "枯木"], mobs: [{name:"毒蝎", hp:40, atk:12, loot:"毒囊"}, {name:"木乃伊", hp:80, atk:10, loot:"腐肉"}] },
    MOUNTAIN: { name: "山脉", code: "bg-MOUNTAIN", res: ["石头", "铁矿石", "煤炭"], mobs: [{name:"岩石巨人", hp:100, atk:15, loot:"石头"}, {name:"山羊", hp:60, atk:6, loot:"羊肉"}] },
    SNOWY: { name: "雪原", code: "bg-SNOWY", res: ["冰块", "雪球", "原木"], mobs: [{name:"雪怪", hp:90, atk:12, loot:"冰凌"}, {name:"流浪者", hp:50, atk:9, loot:"破布"}] },
    OCEAN: { name: "海洋", code: "bg-OCEAN", res: ["水", "生鱼"], mobs: [{name:"溺尸", hp:60, atk:9, loot:"三叉戟碎片"}] },
    SWAMP: { name: "沼泽", code: "bg-SWAMP", res: ["粘土", "藤蔓"], mobs: [{name:"史莱姆", hp:30, atk:5, loot:"粘液球"}, {name:"女巫", hp:50, atk:15, loot:"红蘑菇"}] },
    MESA: { name: "恶地", code: "bg-MESA", res: ["红沙", "金矿石"], mobs: [{name:"食尸鬼", hp:70, atk:14, loot:"腐肉"}] }
};

// 合成表 (保持之前的，可以自己扩充)
const RECIPES = [
    { name: "篝火", req: { "原木": 3, "石头": 3 }, type: "use", effect: "warm", val: 20, desc: "恢复20点理智" },
    { name: "草药绷带", req: { "杂草": 4, "野花": 1 }, type: "use", effect: "heal", val: 30, desc: "恢复30 HP" },
    { name: "烤肉串", req: { "生兔肉": 1, "木棍": 1 }, type: "use", effect: "food", val: 35, desc: "恢复35 饥饿" },
    { name: "石斧", req: { "木棍": 2, "石头": 3 }, type: "equip", effect: "atk", val: 10, desc: "攻击力 10" },
    { name: "铁剑", req: { "木棍": 2, "铁矿石": 3 }, type: "equip", effect: "atk", val: 20, desc: "攻击力 20" }
];

// 玩家状态 (新增 sanity)
let player = { 
    x: 10, y: 10, 
    hp: 100, maxHp: 100, 
    hunger: 100, maxHunger: 100,
    water: 100, maxWater: 100,
    sanity: 100, maxSanity: 100, // 新增：理智值
    atk: 5, 
    inventory: {} 
};

let gameTime = { day: 1, hour: 8 };
let exploredMap = {}; 
let currentSceneItems = [];
let currentEnemy = null; // 当前战斗的敌人

// --- 2. 核心系统：时间与状态 ---

function passTime(hours) {
    gameTime.hour += hours;
    
    // 基础消耗
    player.hunger = Math.max(0, player.hunger - (2 * hours));
    player.water = Math.max(0, player.water - (3 * hours));

    // 判断昼夜
    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;

    // 理智系统 logic
    if (isNight) {
        player.sanity = Math.max(0, player.sanity - (3 * hours)); // 晚上每小时扣3点理智
        if (player.sanity < 50) log("黑暗中似乎有眼睛在盯着你... (理智下降)", "purple");
    }

    // 状态惩罚
    if (player.hunger === 0 || player.water === 0) {
        player.hp -= 5;
        log("你感到极度饥渴...", "red");
    }
    if (player.sanity === 0) {
        player.hp -= 10;
        log("你已经疯了！由于极度恐惧，生命值正在流逝！", "purple");
    }

    // 时间循环
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

// --- 3. 核心系统：生成场景 (夜间强化) ---

function generateScene(biomeKey) {
    currentSceneItems = [];
    const biome = BIOMES[biomeKey];
    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
    
    // 资源生成
    const resCount = 3 + Math.floor(Math.random() * 4);
    for(let i=0; i<resCount; i++) {
        const name = biome.res[Math.floor(Math.random() * biome.res.length)];
        currentSceneItems.push({ type: 'res', name: name, count: Math.floor(Math.random()*3)+1 });
    }

    // 怪物生成 (晚上概率翻倍)
    let mobChance = isNight ? 0.8 : 0.3; 
    
    if (Math.random() < mobChance) {
        const mobTemplate = biome.mobs[Math.floor(Math.random() * biome.mobs.length)];
        
        // 复制并强化怪物
        let mob = { 
            type: 'mob', 
            name: mobTemplate.name, 
            hp: mobTemplate.hp, 
            maxHp: mobTemplate.hp,
            atk: mobTemplate.atk,
            loot: mobTemplate.loot
        };

        // 夜晚强化逻辑
        if (isNight) {
            mob.name = "狂暴的" + mob.name;
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
    currentSceneItems.forEach((item, index) => {
        const btn = document.createElement('div');
        btn.className = `grid-btn ${item.type}`;
        
        if (item.type === 'res') {
            btn.innerText = `${item.name} (${item.count})`;
            btn.onclick = () => collectResource(index);
        } else {
            // 怪物按钮
            btn.innerText = `${item.name} [LV]`; // 不显示血量，战斗时才显示
            btn.classList.add('mob');
            btn.onclick = () => startCombat(item, index); // 点击进入战斗界面
        }
        grid.appendChild(btn);
    });
}

// --- 4. 战斗系统 (全新) ---

function startCombat(mob, index) {
    currentEnemy = mob;
    currentEnemy.index = index; // 记录索引以便死后移除

    // 切换到战斗界面
    switchView('combat');
    
    // 初始化界面
    document.getElementById('enemy-name').innerText = mob.name;
    document.getElementById('combat-log-area').innerHTML = `<p>遭遇了 ${mob.name}！准备战斗！</p>`;
    updateCombatUI();
}

function updateCombatUI() {
    if(!currentEnemy) return;
    const hpPct = (currentEnemy.hp / currentEnemy.maxHp) * 100;
    document.getElementById('enemy-hp-bar').style.width = `${hpPct}%`;
    document.getElementById('enemy-stats').innerText = `HP: ${currentEnemy.hp}/${currentEnemy.maxHp} | ATK: ${currentEnemy.atk}`;
    
    // 检查玩家是否死亡
    if (player.hp <= 0) {
        log("你在战斗中阵亡了...", "red");
        alert("你死了！刷新页面重新开始。");
        location.reload();
    }
}

function combatLog(msg, color="#333") {
    const el = document.getElementById('combat-log-area');
    const p = document.createElement('p');
    p.innerText = msg;
    p.style.color = color;
    el.prepend(p);
}

// 玩家点击“攻击”
function combatAttack() {
    if(!currentEnemy) return;

    // 1. 玩家攻击
    const dmg = player.atk + Math.floor(Math.random() * 3);
    currentEnemy.hp -= dmg;
    combatLog(`你攻击了 ${currentEnemy.name}，造成 ${dmg} 点伤害。`, "green");

    // 动画效果
    document.querySelector('.enemy-box').classList.add('shake');
    setTimeout(()=>document.querySelector('.enemy-box').classList.remove('shake'), 200);

    // 2. 判定怪物死亡
    if (currentEnemy.hp <= 0) {
        combatLog(`胜利！击败了 ${currentEnemy.name}。`, "gold");
        combatLog(`获得战利品: ${currentEnemy.loot}`, "gold");
        
        // 结算
        addItemToInventory(currentEnemy.loot, 1);
        currentSceneItems.splice(currentEnemy.index, 1); // 从场景移除
        
        setTimeout(() => {
            switchView('scene'); // 1秒后返回地图
            renderScene();
            log(`战斗胜利，获得了 ${currentEnemy.loot}`);
        }, 1000);
        return;
    }

    // 3. 怪物反击 (如果没死)
    setTimeout(enemyTurn, 500); // 延迟0.5秒反击
    updateCombatUI();
}

// 怪物回合
function enemyTurn() {
    if(!currentEnemy || currentEnemy.hp <= 0) return;

    // 伤害计算
    const dmg = Math.max(1, currentEnemy.atk - Math.floor(Math.random())); // 简单的伤害浮动
    player.hp -= dmg;
    
    // 理智扣除 (Sanity System)
    const sanityDmg = 2; 
    player.sanity = Math.max(0, player.sanity - sanityDmg);

    combatLog(`${currentEnemy.name} 攻击了你！HP -${dmg}, 理智 -${sanityDmg}`, "red");
    
    // 屏幕震动提示受击
    document.body.classList.add('shake');
    setTimeout(()=>document.body.classList.remove('shake'), 200);

    updateStatsUI();
    updateCombatUI();
}

// 逃跑
function combatFlee() {
    // 50% 几率逃跑
    if (Math.random() > 0.5) {
        log("逃跑成功！狼狈地逃离了战场...", "orange");
        player.sanity -= 5; // 逃跑掉面子(理智)
        switchView('scene');
    } else {
        combatLog("逃跑失败！被怪物拦住了！", "red");
        enemyTurn(); // 逃跑失败会被打一下
    }
}

// --- 5. 其他辅助函数更新 ---

function updateStatsUI() {
    document.getElementById('hp').innerText = player.hp;
    document.getElementById('hunger').innerText = player.hunger;
    document.getElementById('water').innerText = player.water;
    document.getElementById('sanity').innerText = player.sanity; // 更新理智
}

function useItem(name) {
    if (!player.inventory[name] || player.inventory[name] <= 0) return;
    
    let recipe = RECIPES.find(r => r.name === name);
    
    if (recipe && recipe.effect === 'warm') {
        // 篝火恢复理智
        player.sanity = Math.min(player.maxSanity, player.sanity + recipe.val);
        log(`在${name}旁休息，理智恢复了。`, "purple");
    } else if (name === "浆果") {
        player.hunger += 5;
        player.sanity += 2; // 吃甜食回理智
        log("吃了浆果，心情好了一点点。");
    } else if (recipe && recipe.effect === 'heal') {
        player.hp = Math.min(player.maxHp, player.hp + recipe.val);
    } else if (recipe && recipe.effect === 'food') {
        player.hunger = Math.min(player.maxHunger, player.hunger + recipe.val);
    } else if (recipe && recipe.effect === 'atk') {
        player.atk = recipe.val;
        log(`装备了 ${name}，攻击力提升!`);
    }

    player.inventory[name]--;
    if (player.inventory[name] <= 0) delete player.inventory[name];
    updateStatsUI();
    updateInventoryUI();
}

// --- 必须保留的旧函数 (move, getBiome 等) ---
// 这里省略了未修改的 move, getBiome, init 等函数，请保持原样即可。
// 记得 switchView 函数需要处理 'combat'：

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

// 采集逻辑保持不变
function collectResource(index) {
    const item = currentSceneItems[index];
    addItemToInventory(item.name, item.count);
    log(`采集: ${item.name} x${item.count}`);
    currentSceneItems.splice(index, 1);
    renderScene();
}

function addItemToInventory(name, count) {
    if (!player.inventory[name]) player.inventory[name] = 0;
    player.inventory[name] += count;
}

// 初始化
function init() {
    addItemToInventory("烤肉串", 1);
    refreshLocation();
    updateStatsUI();
    log("生存开始。注意你的理智值（Sanity），黑暗是危险的。");
}

// 辅助函数：移动和刷新逻辑 (如果你之前没删，这里不用动，如果需要我补充请告知)
function move(dx, dy) {
    if(currentEnemy && document.getElementById('combat-view').className.indexOf('hidden') === -1) {
        return log("战斗中无法移动！请先逃跑或击败敌人。", "red");
    }
    const newX = player.x + dx;
    const newY = player.y + dy;
    if (newX < 0 || newX >= MAP_SIZE || newY < 0 || newY >= MAP_SIZE) return log("无法通过。");
    player.x = newX; player.y = newY;
    passTime(1);
    refreshLocation();
}

function getBiome(x, y) {
    const keys = Object.keys(BIOMES);
    const hash = Math.abs((x * 37 + y * 13) % keys.length);
    return keys[hash];
}

function refreshLocation() {
    exploredMap[`${player.x},${player.y}`] = true;
    const biomeKey = getBiome(player.x, player.y);
    const biome = BIOMES[biomeKey];
    document.getElementById('loc-name').innerText = biome.name;
    document.getElementById('coord').innerText = `${player.x},${player.y}`;
    generateScene(biomeKey);
    renderScene();
    updateMiniMap();
    if (!document.getElementById('map-modal').classList.contains('hidden')) renderBigMap();
}

function updateMiniMap() {
    // ... 保持原有逻辑
    const getBName = (x, y) => {
        if (x < 0 || x >= MAP_SIZE || y < 0 || y >= MAP_SIZE) return "边界";
        return BIOMES[getBiome(x, y)].name;
    };
    document.getElementById('dir-n').innerText = getBName(player.x, player.y - 1);
    document.getElementById('dir-s').innerText = getBName(player.x, player.y + 1);
    document.getElementById('dir-w').innerText = getBName(player.x - 1, player.y);
    document.getElementById('dir-e').innerText = getBName(player.x + 1, player.y);
}
// 地图渲染相关代码保持不变...

init();

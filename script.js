// 注意：数据 (MAP_SIZE, BIOMES, RECIPES) 已经由 items.js 加载
// script.js 只负责逻辑

// --- 游戏状态 (State) ---
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

// 状态变量：记录当前选中的分类
let currentInvFilter = 'all';
let currentCraftFilter = 'all';

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

// --- 辅助函数：检测工作台/熔炉 ---
function hasStation(stationType) {
    const key = `${player.x},${player.y}`;
    const buildings = getCurrBuildings()[key] || [];
    if (stationType === 'workbench') return buildings.some(b => b.name === '工作台');
    if (stationType === 'furnace') return buildings.some(b => b.name === '熔炉');
    return false;
}

// --- 核心系统：时间与状态 ---

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

// --- 核心系统：移动与地图 ---

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

// --- 核心系统：交互与战斗 ---

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

    // 1. 渲染当前世界的建筑
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

    // 2. 渲染资源和怪物
    currentSceneItems.forEach((item, index) => {
        const btn = document.createElement('div');
        btn.className = `grid-btn ${item.type}`;

        if (item.type === 'res') {
            let iconHtml = "";
            if (ITEM_ICONS[item.name]) {
                iconHtml = `<img src="${ITEM_ICONS[item.name]}" class="item-icon">`;
            }
            btn.innerHTML = `${iconHtml}${item.name} (${item.count})`;
            btn.onclick = () => collectResource(index, btn);
        } else {
            // 怪物图标渲染
            let mobIconHtml = "";
            if (ITEM_ICONS[item.name]) {
                mobIconHtml = `<img src="${ITEM_ICONS[item.name]}" class="mob-icon">`;
            } else {
                let baseName = item.name.replace("狂暴的", "").replace("地狱的", "");
                if (ITEM_ICONS[baseName]) {
                    mobIconHtml = `<img src="${ITEM_ICONS[baseName]}" class="mob-icon">`;
                }
            }
            
            btn.innerHTML = `${mobIconHtml}${item.name}`;
            btn.classList.add('mob');
            btn.onclick = () => startCombat(item, index);
        }
        grid.appendChild(btn);
    });
}

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
        if (item.count <= 0) currentSceneItems.splice(index, 1);
        renderScene();
        updateInventoryUI();
        return; 
    }

    // --- 机制：硬度检测 (需要镐子) ---
    const HARD_RES = ["石头", "铁矿石", "煤炭", "金矿石", "钻石矿", "绿宝石矿", "黑曜石", "石英矿", "地狱岩", "黑石"];
    if (HARD_RES.includes(item.name)) {
        const hasPickaxe = Object.keys(player.inventory).some(n => n.includes("镐"));
        if (!hasPickaxe) {
            log(`太硬了！你需要一把 [镐子] 才能采集 ${item.name}。`, "red");
            return;
        }
    }

    // 体力消耗
    let hpCost = 0;
    if (player.hunger > 0) player.hunger -= 1;
    else { hpCost += 2; log("饥饿时强行劳作，体力透支... (HP -2)", "red"); }

    if (player.water > 0) player.water -= 1;
    else { hpCost += 2; log("极度口渴伴随着眩晕... (HP -2)", "red"); }

    if (hpCost > 0) {
        player.hp -= hpCost;
        // --- 恢复了受伤震动特效 ---
        document.body.classList.remove('shake');
        void document.body.offsetWidth;
        document.body.classList.add('shake');

        if (player.hp <= 0) { die(); return; }
    }

    updateStatsUI(); 
    addItemToInventory(item.name, 1);
    item.count--; 
    if (hpCost === 0) log(`采集了 1个 ${item.name} (剩余:${item.count})`);

    if (item.count <= 0) currentSceneItems.splice(index, 1);
    renderScene(); 
}

// --- 5. 战斗系统 ---

function startCombat(mob, index) {
    currentEnemy = mob;
    currentEnemy.index = index;
    switchView('combat');

    // 获取怪物图片
    let imgUrl = "";
    if (ITEM_ICONS[mob.name]) {
        imgUrl = ITEM_ICONS[mob.name];
    } else {
        let baseName = mob.name.replace("狂暴的", "").replace("地狱的", "");
        if (ITEM_ICONS[baseName]) imgUrl = ITEM_ICONS[baseName];
    }

    let imgHtml = imgUrl ? `<img src="${imgUrl}" class="combat-mob-img">` : "";

    document.getElementById('enemy-name').innerHTML = `${imgHtml}${mob.name}`;
    document.getElementById('combat-log-area').innerHTML = `<p>遭遇了 ${mob.name}！它看起来充满敌意！</p>`;

    // 动态插入回血栏
    if (!document.getElementById('combat-consumables')) {
        const healDiv = document.createElement('div');
        healDiv.id = 'combat-consumables';
        healDiv.className = 'quick-heal-bar';
        const logArea = document.getElementById('combat-log-area');
        logArea.parentNode.insertBefore(healDiv, logArea.nextSibling);
    }

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
        setTimeout(() => { alert("你死了！刷新页面重来。"); location.reload(); }, 500);
        return;
    }

    // 刷新快捷回血栏
    const healContainer = document.getElementById('combat-consumables');
    if (healContainer) {
        healContainer.innerHTML = ''; 
        for (let [name, count] of Object.entries(player.inventory)) {
            let recipe = RECIPES.find(r => r.name === name);
            if (recipe && recipe.type === 'use' && (recipe.effect === 'heal' || recipe.effect === 'food')) {
                const btn = document.createElement('div');
                btn.className = 'heal-btn';
                let iconStr = "";
                if (ITEM_ICONS[name]) iconStr = `<img src="${ITEM_ICONS[name]}">`;
                btn.innerHTML = `${iconStr} ${name} <span style="font-size:9px;color:#666">x${count}</span>`;
                btn.onclick = () => combatUseItem(name);
                healContainer.appendChild(btn);
            }
        }
        if (healContainer.innerHTML === '') {
            healContainer.innerHTML = '<span style="font-size:10px;color:#ccc;padding:5px;">无恢复品</span>';
        }
    }
}

function combatUseItem(name) {
    if (!currentEnemy) return;
    if (!player.inventory[name] || player.inventory[name] <= 0) return;

    let recipe = RECIPES.find(r => r.name === name);
    if (!recipe) return;

    let recoverMsg = "";
    if (recipe.effect === 'food') {
        let healAmount = Math.floor(recipe.val / 2); 
        player.hp = Math.min(player.maxHp, player.hp + healAmount);
        recoverMsg = `吃了 ${name}，恢复 ${healAmount} HP`;
        player.hunger = Math.min(player.maxHunger, player.hunger + recipe.val);
    } 
    else if (recipe.effect === 'heal') {
        player.hp = Math.min(player.maxHp, player.hp + recipe.val);
        recoverMsg = `使用了 ${name}，恢复 ${recipe.val} HP`;
    }

    combatLog(recoverMsg, "blue");
    player.inventory[name]--;
    if (player.inventory[name] <= 0) delete player.inventory[name];

    // 怪物攻击
    const eDmg = Math.max(1, currentEnemy.atk - Math.floor(Math.random()));
    player.hp -= eDmg;
    combatLog(`趁你吃东西时，${currentEnemy.name} 造成了 ${eDmg} 伤害！`, "red");
    
    // --- 恢复了受伤震动特效 ---
    document.body.classList.remove('shake');
    void document.body.offsetWidth;
    document.body.classList.add('shake');

    updateStatsUI();
    updateCombatUI();
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

    // --- 恢复了敌人被击中时的震动特效 ---
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
    
    // --- 恢复了玩家受伤时的震动特效 ---
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

// --- 6. 物品系统与合成 (含分类筛选功能) ---

// 辅助函数：判断物品类型
function getItemType(name) {
    let r = RECIPES.find(x => x.name === name);
    if (r) {
        if (r.type === 'equip') return 'equip';
        if (r.type === 'use' || r.effect === 'food' || r.effect === 'heal') return 'food';
        if (r.type === 'build') return 'material'; 
        if (r.type === 'item') return 'material';
    }
    if (name.includes("剑") || name.includes("甲") || name.includes("弓") || name.includes("三叉戟") || name.includes("镐")) return 'equip';
    if (name.includes("肉") || name.includes("排") || name.includes("鱼") || name.includes("苹果") || name.includes("腐肉") || name.includes("蘑菇")) return 'food';
    return 'material';
}

// 切换背包分类
window.setInvFilter = function(filter, btn) {
    currentInvFilter = filter;
    document.querySelectorAll('#inventory-view .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateInventoryUI();
}

// 切换制作分类
window.setCraftFilter = function(filter, btn) {
    currentCraftFilter = filter;
    document.querySelectorAll('#craft-view .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateCraftUI();
}

function addItemToInventory(name, count) {
    if (!player.inventory[name]) player.inventory[name] = 0;
    player.inventory[name] += count;
}

function updateInventoryUI() {
    const list = document.getElementById('inventory-list');
    list.innerHTML = '';

    if (Object.keys(player.inventory).length === 0) {
        list.innerHTML = '<div style="padding:20px;text-align:center;color:#ccc;font-size:12px;">背包空空如也</div>';
        return;
    }

    let hasItem = false;

    for (let [name, count] of Object.entries(player.inventory)) {
        if (count > 0) {
            const type = getItemType(name);
            let show = false;
            if (currentInvFilter === 'all') show = true;
            else if (currentInvFilter === 'equip' && type === 'equip') show = true;
            else if (currentInvFilter === 'food' && type === 'food') show = true;
            else if (currentInvFilter === 'material' && type === 'material') show = true;

            if (show) {
                hasItem = true;
                const row = document.createElement('div');
                row.className = 'list-item';
                
                let iconHtml = "";
                if (ITEM_ICONS[name]) iconHtml = `<img src="${ITEM_ICONS[name]}" class="item-icon">`;

                let r = RECIPES.find(x => x.name === name);
                let btnText = "使用";
                if (r && r.type === 'build') btnText = "放置";
                else if (r && r.type === 'equip') btnText = "装备";

                row.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px; flex:1;">
                        ${iconHtml}
                        <span style="font-weight:bold;">${name}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <b style="color:#999;font-size:11px;">x${count}</b>
                        <button onclick="useItem('${name}')">${btnText}</button>
                    </div>
                `;
                list.appendChild(row);
            }
        }
    }

    if (!hasItem) {
        list.innerHTML = '<div style="padding:20px;text-align:center;color:#ccc;font-size:12px;">该分类下没有物品</div>';
    }
}


function useItem(name) {
    if (!player.inventory[name] || player.inventory[name] <= 0) return;

    let recipe = RECIPES.find(r => r.name === name);

    // 特殊逻辑：放置建筑
    if (recipe && recipe.type === 'build') {
        placeBuilding(name);
        return; 
    }

    // 金苹果特殊逻辑
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
            log(`装备了 ${name}！攻击力 ${player.atk}`);
        }
        else if (recipe.effect === 'hp_max') {
            player.maxHp = recipe.val;
            player.hp = player.maxHp; 
            log(`装备了 ${name}！HP上限 ${player.maxHp}`);
        }
        else if (recipe.effect === 'tool') {
            log(`装备了 ${name}！现在可以开采矿石了。`);
        }
    }
    // 如果没有配方（比如生牛肉），简单的食用逻辑
    else if (getItemType(name) === 'food') {
        player.hunger = Math.min(player.maxHunger, player.hunger + 10);
        log(`吃了 ${name} (生食)`);
    }

    player.inventory[name]--;
    if (player.inventory[name] <= 0) delete player.inventory[name];

    updateStatsUI();
    updateInventoryUI();
}

function updateCraftUI() {
    const list = document.getElementById('craft-list');
    list.innerHTML = '';
    let hasItem = false;

    // --- 机制：检测脚下有什么工作台 ---
    const nearWorkbench = hasStation('workbench');
    const nearFurnace = hasStation('furnace');

    RECIPES.forEach(recipe => {
        let show = false;
        if (currentCraftFilter === 'all') show = true;
        else if (currentCraftFilter === 'equip' && recipe.type === 'equip') show = true;
        else if (currentCraftFilter === 'food' && recipe.type === 'use') show = true;
        else if (currentCraftFilter === 'build' && (recipe.type === 'build' || recipe.type === 'item')) show = true;

        if (show) {
            hasItem = true;
            const row = document.createElement('div');
            row.className = 'list-item';
            
            let iconHtml = "";
            if (ITEM_ICONS[recipe.name]) iconHtml = `<img src="${ITEM_ICONS[recipe.name]}" class="item-icon">`;

            let reqStr = [];
            let canCraft = true;
            for (let [mat, qty] of Object.entries(recipe.req)) {
                const has = player.inventory[mat] || 0;
                const color = has >= qty ? '#2ecc71' : '#e74c3c';
                reqStr.push(`<span style="color:${color}">${mat} ${has}/${qty}</span>`);
                if (has < qty) canCraft = false;
            }

            // --- 机制：检查工作台条件 ---
            let stationMissing = false;
            let missingMsg = "";
            if (recipe.station === 'workbench' && !nearWorkbench) {
                stationMissing = true;
                missingMsg = "需要: 工作台";
                canCraft = false;
            }
            if (recipe.station === 'furnace' && !nearFurnace) {
                stationMissing = true;
                missingMsg = "需要: 熔炉";
                canCraft = false;
            }

            let stationHtml = "";
            if (stationMissing) {
                stationHtml = `<div style="font-size:10px;color:red;margin-top:2px;">⚠️ ${missingMsg} (请放置并站在上面)</div>`;
            }

            row.innerHTML = `
                <div style="flex:1; display:flex; align-items:center; gap:10px; opacity: ${stationMissing ? 0.6 : 1}">
                    ${iconHtml}
                    <div style="flex:1;">
                        <div style="display:flex;justify-content:space-between;">
                            <span style="font-weight:bold;font-size:12px;">${recipe.name}</span>
                        </div>
                        <div style="font-size:10px;color:#999;margin:2px 0;">${recipe.desc || ""}</div>
                        <div style="font-size:10px;background:#f9f9f9;padding:3px;border-radius:4px;">${reqStr.join(' ')}</div>
                        ${stationHtml}
                    </div>
                </div>
            `;
            
            const btn = document.createElement('button');
            btn.innerText = "制作";
            btn.disabled = !canCraft;
            if(!canCraft) {
                btn.style.background = "#eee";
                btn.style.color = "#ccc";
                btn.style.border = "1px solid #eee";
            }
            btn.onclick = () => craftItem(recipe);
            
            const btnDiv = document.createElement('div');
            btnDiv.style.marginLeft = "8px";
            btnDiv.appendChild(btn);
            
            row.appendChild(btnDiv);
            list.appendChild(row);
        }
    });

    if (!hasItem) {
        list.innerHTML = '<div style="padding:20px;text-align:center;color:#ccc;font-size:12px;">该分类下没有配方</div>';
    }
}


function craftItem(recipe) {
    // 双重检查：防止作弊
    const nearWorkbench = hasStation('workbench');
    const nearFurnace = hasStation('furnace');
    if (recipe.station === 'workbench' && !nearWorkbench) return log("这里没有工作台！", "red");
    if (recipe.station === 'furnace' && !nearFurnace) return log("这里没有熔炉！", "red");

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
    const offsets = [
        {dx: 0, dy: 0}, {dx: 0, dy: -1}, {dx: 0, dy: 1}, {dx: -1, dy: 0}, {dx: 1, dy: 0}
    ];
    offsets.forEach(offset => {
        let nx = player.x + offset.dx;
        let ny = player.y + offset.dy;
        if (nx >= 0 && nx < MAP_SIZE && ny >= 0 && ny < MAP_SIZE) {
            currentMap[`${nx},${ny}`] = true;
        }
    });

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

// 地图
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
    // 自动更新导航图标
    const navMapping = {
        0: "导航_背包",
        1: "导航_制作",
        2: "导航_探索",
        3: "导航_地图",
        4: "导航_系统"
    };
    const navIcons = document.querySelectorAll('.bottom-nav .nav-icon');
    navIcons.forEach((img, index) => {
        const key = navMapping[index];
        if (key && ITEM_ICONS[key]) {
            img.src = ITEM_ICONS[key];
        }
    });

    addItemToInventory("木剑", 1);
    addItemToInventory("面包", 2);

    refreshLocation();
    updateStatsUI();
    updateDayNightCycle();
    log("MC 文字版启动！先去砍树吧！");
}

// --- 8. 建筑与设施 ---

function placeBuilding(name) {
    const buildings = getCurrBuildings(); 
    const key = `${player.x},${player.y}`;
    if (!buildings[key]) buildings[key] = [];
    
    let newBuild = { name: name };
    if (name === "工作台") newBuild.content = {}; 
    
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

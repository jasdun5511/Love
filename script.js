// 注意：数据 (MAP_SIZE, BIOMES, RECIPES, TRADES) 已经由 items.js 加载

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

// 状态变量
let currentInvFilter = 'all';
let currentCraftFilter = 'all';

// --- 世界状态 ---
let currentDimension = "OVERWORLD";
let exploredMapMain = {};   
let exploredMapNether = {}; 
let buildingsMain = {};     
let buildingsNether = {};
let playerPosMain = {x: 10, y: 10};
let playerPosNether = {x: 10, y: 10}; 

function getCurrBuildings() { return currentDimension === "OVERWORLD" ? buildingsMain : buildingsNether; }
function getCurrExplored() { return currentDimension === "OVERWORLD" ? exploredMapMain : exploredMapNether; }

// --- 辅助函数：通用材料组 ---
const WOOD_TYPES = ["橡木原木", "云杉原木"];
const FLOWER_TYPES = ["蒲公英", "兰花", "虞美人"]; // 加入虞美人

// 获取背包数量 (支持通用名)
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

// 消耗背包物品 (支持通用名)
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

// 站点检测 (纯净版，不含村庄逻辑)
function hasStation(stationType) {
    const key = `${player.x},${player.y}`;
    const buildings = getCurrBuildings()[key] || [];
    
    if (stationType === 'workbench') return buildings.some(b => b.name === '工作台');
    if (stationType === 'furnace') return buildings.some(b => b.name === '熔炉');
    
    return false;
}

// --- 核心系统 ---

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

// 获取地形 (包含村庄)
function getBiome(x, y) {
    if (currentDimension === "OVERWORLD") {
        // 加入了 VILLAGE
        const keys = ["PLAINS", "FOREST", "DESERT", "MOUNTAIN", "SNOWY", "OCEAN", "SWAMP", "MESA", "VILLAGE"];
        return keys[Math.abs((x * 37 + y * 13) % keys.length)];
    } else {
        const keys = ["NETHER_WASTES", "CRIMSON_FOREST", "SOUL_SAND_VALLEY", "LAVA_SEA"];
        return keys[Math.abs((x * 7 + y * 19) % keys.length)];
    }
}

function generateScene(biomeKey) {
    currentSceneItems = [];
    const biome = BIOMES[biomeKey];
    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;

    const resCount = 3 + Math.floor(Math.random() * 4);
    for(let i=0; i<resCount; i++) {
        const name = biome.res[Math.floor(Math.random() * biome.res.length)];
        currentSceneItems.push({ type: 'res', name: name, count: Math.floor(Math.random()*3)+1 });
    }

    // 怪物生成逻辑
    let mobChance = isNight ? 0.8 : 0.3; 
    if (currentDimension === "NETHER") mobChance = 0.9;
    
    // 村庄特殊处理：如果是村庄，生成概率稍高（包含村民）
    if (biomeKey === "VILLAGE") mobChance = 0.7;

    if (Math.random() < mobChance) {
        const mobTemplate = biome.mobs[Math.floor(Math.random() * biome.mobs.length)];
        let mob = { type: 'mob', name: mobTemplate.name, hp: mobTemplate.hp, maxHp: mobTemplate.hp, atk: mobTemplate.atk, loot: mobTemplate.loot };
        
        // 狂暴化逻辑：只针对有攻击力的怪物，且不是村民
        if ((isNight || currentDimension === "NETHER") && mob.atk > 0) {
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
            btn.innerText = `📦 ${b.name}`;
            btn.onclick = () => openBuilding(b, idx);
        }
        grid.appendChild(btn);
    });

    currentSceneItems.forEach((item, index) => {
        const btn = document.createElement('div');
        btn.className = `grid-btn ${item.type}`;
        
        // 1. 特殊处理村民：绿色名字，点击触发交易
        if (item.name === "村民") {
            let npcIcon = ITEM_ICONS["村民"] ? `<img src="${ITEM_ICONS["村民"]}" class="mob-icon">` : "👨‍🌾 ";
            btn.innerHTML = `${npcIcon}${item.name}`;
            btn.style.color = "#27ae60"; // 绿色名字
            btn.style.borderColor = "#2ecc71";
            btn.onclick = () => openTrading(); // <--- 关键：进入交易界面
        } 
        // 2. 资源逻辑
        else if (item.type === 'res') {
            let iconHtml = ITEM_ICONS[item.name] ? `<img src="${ITEM_ICONS[item.name]}" class="item-icon">` : "";
            btn.innerHTML = `${iconHtml}${item.name} (${item.count})`;
            btn.onclick = () => collectResource(index, btn);
        } 
        // 3. 怪物逻辑
        else {
            let mobIconHtml = ITEM_ICONS[item.name] ? `<img src="${ITEM_ICONS[item.name]}" class="mob-icon">` : "";
            if (!mobIconHtml) {
                let baseName = item.name.replace("狂暴的", "").replace("地狱的", "");
                if (ITEM_ICONS[baseName]) mobIconHtml = `<img src="${ITEM_ICONS[baseName]}" class="mob-icon">`;
            }
            btn.innerHTML = `${mobIconHtml}${item.name}`;
            btn.classList.add('mob');
            btn.onclick = () => startCombat(item, index);
        }
        grid.appendChild(btn);
    });
}

// --- 采集逻辑 ---
function collectResource(index) {
    const item = currentSceneItems[index];
    if (!item) return;

    // 1. 岩浆处理
    if (item.name === "岩浆源") {
        if (!player.inventory["铁桶"] || player.inventory["铁桶"] <= 0) {
            log("太烫了！你需要一个 [铁桶]。", "red");
            return;
        }
        player.inventory["铁桶"]--;
        addItemToInventory("岩浆桶", 1);
        log("装了一桶岩浆。", "orange");
        finishCollect(index, item);
        return; 
    }

    // 2. 水处理
    if (item.name === "水") {
        let hasBucket = player.inventory["铁桶"] > 0;
        let hasBottle = player.inventory["玻璃瓶"] > 0;

        if (!hasBucket && !hasBottle) {
            log("你需要 [铁桶] 或 [玻璃瓶] 才能装水！", "red");
            return;
        }

        if (hasBucket) {
            player.inventory["铁桶"]--;
            addItemToInventory("水", 1);
            log("装了一桶水。", "blue");
        } 
        else if (hasBottle) {
            player.inventory["玻璃瓶"]--;
            addItemToInventory("水瓶", 1);
            log("装了一瓶水。", "blue");
        }
        
        finishCollect(index, item);
        return;
    }

    // 3. 镐子检测
    const HARD_RES = ["石头", "铁矿石", "煤炭", "金矿石", "钻石矿", "绿宝石矿", "黑曜石", "石英矿", "地狱岩", "黑石"];
    if (HARD_RES.includes(item.name)) {
        if (!Object.keys(player.inventory).some(n => n.includes("镐"))) {
            log(`太硬了！你需要一把 [镐子] 才能采集 ${item.name}。`, "red");
            return;
        }
    }

    // 4. 花朵回理智
    if (FLOWER_TYPES.includes(item.name)) {
        player.sanity = Math.min(player.maxSanity, player.sanity + 10);
        log(`采摘了 ${item.name}，心情变好了 (理智 +10)`, "purple");
    }

    // 5. 体力消耗
    let hpCost = 0;
    if (player.hunger > 0) player.hunger -= 1; else { hpCost += 2; log("饥饿透支... (HP -2)", "red"); }
    if (player.water > 0) player.water -= 1; else { hpCost += 2; log("口渴眩晕... (HP -2)", "red"); }

    if (hpCost > 0) {
        player.hp -= hpCost;
        document.body.classList.remove('shake');
        void document.body.offsetWidth;
        document.body.classList.add('shake');
        if (player.hp <= 0) { die(); return; }
    }

    updateStatsUI(); 
    addItemToInventory(item.name, 1);
    finishCollect(index, item);
    if (hpCost === 0 && !FLOWER_TYPES.includes(item.name)) log(`采集了 1个 ${item.name}`);
}

function finishCollect(index, item) {
    item.count--;
    if (item.count <= 0) currentSceneItems.splice(index, 1);
    renderScene();
    updateInventoryUI();
}

// --- 战斗 ---

function startCombat(mob, index) {
    currentEnemy = mob;
    currentEnemy.index = index;
    switchView('combat');
    let imgUrl = ITEM_ICONS[mob.name] || (ITEM_ICONS[mob.name.replace(/狂暴的|地狱的/, "")] || "");
    let imgHtml = imgUrl ? `<img src="${imgUrl}" class="combat-mob-img">` : "";
    document.getElementById('enemy-name').innerHTML = `${imgHtml}${mob.name}`;
    document.getElementById('combat-log-area').innerHTML = `<p>遭遇了 ${mob.name}！</p>`;
    
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

function combatUseItem(name) {
    if (!currentEnemy || !player.inventory[name]) return;
    useItem(name); 
    const eDmg = Math.max(1, currentEnemy.atk - Math.floor(Math.random()));
    player.hp -= eDmg;
    combatLog(`趁你使用物品时，敌人造成 ${eDmg} 伤害`, "red");
    document.body.classList.remove('shake'); void document.body.offsetWidth; document.body.classList.add('shake');
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
    if (!currentEnemy) return;
    const pDmg = player.atk + Math.floor(Math.random() * 3);
    currentEnemy.hp -= pDmg;
    combatLog(`你造成 ${pDmg} 伤害`, "green");
    document.querySelector('.enemy-box').classList.remove('shake'); void document.querySelector('.enemy-box').offsetWidth; document.querySelector('.enemy-box').classList.add('shake');

    if (currentEnemy.hp <= 0) {
        const loot = currentEnemy.loot;
        combatLog(`胜利！获得 ${loot}`, "gold");
        addItemToInventory(loot, 1);
        if (currentSceneItems[currentEnemy.index]) currentSceneItems.splice(currentEnemy.index, 1);
        setTimeout(() => { switchView('scene'); renderScene(); }, 800);
        return; 
    }
    const eDmg = Math.max(1, currentEnemy.atk - Math.floor(Math.random()));
    player.hp -= eDmg;
    combatLog(`受到 ${eDmg} 伤害`, "red");
    document.body.classList.remove('shake'); void document.body.offsetWidth; document.body.classList.add('shake');
    if (player.hp <= 0) die();
    updateStatsUI();
    updateCombatUI();
}

function combatFlee() {
    if (Math.random() > 0.5) { log("逃跑成功！", "orange"); currentEnemy = null; switchView('scene'); }
    else {
        combatLog("逃跑失败！", "red");
        const eDmg = Math.max(1, currentEnemy.atk - Math.floor(Math.random()));
        player.hp -= eDmg;
        updateCombatUI(); updateStatsUI();
    }
}

// --- 物品与合成 ---

function getItemType(name) {
    let r = RECIPES.find(x => x.name === name);
    if (r) {
        if (r.type === 'equip') return 'equip';
        if (r.type === 'use' || r.effect === 'food' || r.effect === 'heal' || r.effect === 'drink' || r.effect === 'super_food') return 'food';
        if (r.type === 'build' || r.type === 'item') return 'material'; 
    }
    // 简单的关键词回退机制
    if (name.includes("剑") || name.includes("甲") || name.includes("镐") || name.includes("三叉戟") || name.includes("弩") || name.includes("斧")) return 'equip';
    if (name.includes("肉") || name.includes("排") || name.includes("鱼") || name.includes("苹果") || name.includes("瓶") || name.includes("面包") || name.includes("马铃薯")) return 'food';
    return 'material';
}

window.setInvFilter = (f, b) => { currentInvFilter = f; document.querySelectorAll('#inventory-view .tab-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); updateInventoryUI(); }
window.setCraftFilter = (f, b) => { currentCraftFilter = f; document.querySelectorAll('#craft-view .tab-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); updateCraftUI(); }

function addItemToInventory(name, count) {
    if (!player.inventory[name]) player.inventory[name] = 0;
    player.inventory[name] += count;
}

function updateInventoryUI() {
    const list = document.getElementById('inventory-list');
    list.innerHTML = '';
    if (Object.keys(player.inventory).length === 0) { list.innerHTML = '<div style="padding:20px;text-align:center;color:#ccc;">背包空空如也</div>'; return; }

    for (let [name, count] of Object.entries(player.inventory)) {
        if (count > 0) {
            const type = getItemType(name);
            let show = false;
            if (currentInvFilter === 'all') show = true;
            else if (currentInvFilter === 'equip' && type === 'equip') show = true;
            else if (currentInvFilter === 'food' && type === 'food') show = true;
            else if (currentInvFilter === 'material' && type === 'material') show = true;

            if (show) {
                const row = document.createElement('div');
                row.className = 'list-item';
                let icon = ITEM_ICONS[name] ? `<img src="${ITEM_ICONS[name]}" class="item-icon">` : "";
                let r = RECIPES.find(x => x.name === name);
                let btnText = (r && r.type === 'build') ? "放置" : (r && r.type === 'equip') ? "装备" : "使用";
                row.innerHTML = `
                    <div style="flex:1;display:flex;align-items:center;gap:10px;">${icon}<b>${name}</b></div>
                    <div><b style="color:#999;margin-right:10px;">x${count}</b><button onclick="useItem('${name}')">${btnText}</button></div>`;
                list.appendChild(row);
            }
        }
    }
}

function useItem(name) {
    if (!player.inventory[name]) return;
    let recipe = RECIPES.find(r => r.name === name);

    if (recipe && recipe.type === 'build') { placeBuilding(name); return; }

    if (name === "金苹果") { player.hp = player.maxHp; log("金苹果的力量！", "gold"); }
    else if (recipe) {
        // 食物回饥饿
        if (recipe.effect === 'food') {
            player.hunger = Math.min(player.maxHunger, player.hunger + recipe.val);
            log(`吃了 ${name} (饥饿 +${recipe.val})`);
        } 
        // 饮料回水
        else if (recipe.effect === 'drink') {
            player.water = Math.min(player.maxWater, player.water + recipe.val);
            log(`喝了 ${name} (水分 +${recipe.val})`, "blue");
        }
        // 超级食物 (蜂蜜瓶)
        else if (recipe.effect === 'super_food') {
            player.hp = Math.min(player.maxHp, player.hp + 20);
            player.water = Math.min(player.maxWater, player.water + recipe.val);
            log(`喝了 ${name}，感觉好多了！(HP+20 水分+${recipe.val})`, "gold");
        }
        else if (recipe.effect === 'atk') { player.atk = recipe.val; log(`装备了 ${name}！ATK=${player.atk}`); }
        else if (recipe.effect === 'hp_max') { player.maxHp = recipe.val; player.hp = player.maxHp; log(`装备了 ${name}！HP=${player.maxHp}`); }
        else if (recipe.effect === 'tool') { log(`装备了 ${name}，可以去挖矿了。`); }
    }
    // 生食备选逻辑
    else if (getItemType(name) === 'food') {
        player.hunger = Math.min(player.maxHunger, player.hunger + 10);
        log(`吃了 ${name} (生食)`);
    }

    player.inventory[name]--;
    if (player.inventory[name] <= 0) delete player.inventory[name];
    
    // 如果喝了水瓶或蜂蜜瓶，返还玻璃瓶
    if (name === "水瓶" || name === "蜂蜜瓶") {
        addItemToInventory("玻璃瓶", 1);
    }

    updateStatsUI();
    updateInventoryUI();
}

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
                const has = getInvCount(mat); // 使用通用计数
                
                // --- 优化：显示名称映射 ---
                let displayName = mat;
                if (mat === "原木") displayName = "所有原木";
                if (mat === "花") displayName = "所有花朵";
                // ---------------------------

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
    // 1. 站点检测 (只保留工作台和熔炉)
    if (recipe.station === 'workbench' && !hasStation('workbench')) return log("这里没有工作台！", "red");
    if (recipe.station === 'furnace' && !hasStation('furnace')) return log("这里没有熔炉！", "red");

    // 2. 材料检测
    for (let [mat, qty] of Object.entries(recipe.req)) { 
        if(getInvCount(mat) < qty) return; 
    }

    // 3. 消耗材料
    for (let [mat, qty] of Object.entries(recipe.req)) { 
        consumeInvItem(mat, qty); 
    } 
    
    // 4. 获得物品
    const count = recipe.count || 1;
    addItemToInventory(recipe.name, count);
    
    log(`制作成功: ${recipe.name} ${count > 1 ? "x"+count : ""}`);

    // 5. 特殊效果
    if (recipe.effect === 'atk') player.atk = recipe.val;
    if (recipe.effect === 'hp_max') { player.maxHp = recipe.val; player.hp = player.maxHp; }
    
    // 6. 刷新UI
    updateInventoryUI(); 
    updateCraftUI(); 
    updateStatsUI();
}

// --- 辅助功能 ---

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
    renderScene();
    updateMiniMap();
    if (!document.getElementById('map-modal').classList.contains('hidden')) renderBigMap();
}

function updateStatsUI() {
    document.getElementById('hp').innerText = player.hp;
    document.getElementById('hunger').innerText = player.hunger;
    document.getElementById('water').innerText = player.water;
    document.getElementById('sanity').innerText = player.sanity; 
}

function switchView(viewName) {
    ['scene','inventory','craft','combat','chest','trade','furnace','enchant'].forEach(v => document.getElementById(v+'-view')?.classList.add('hidden'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(viewName+'-view')?.classList.remove('hidden');

    if (viewName === 'scene') document.querySelectorAll('.bottom-nav .nav-item')[2].classList.add('active');
    else if (viewName === 'inventory') { updateInventoryUI(); document.querySelectorAll('.bottom-nav .nav-item')[0].classList.add('active'); }
    else if (viewName === 'craft') { updateCraftUI(); document.querySelectorAll('.bottom-nav .nav-item')[1].classList.add('active'); }
}

function log(msg, color="black") {
    const el = document.getElementById('game-log');
    const p = document.createElement('p');
    p.innerText = `> ${msg}`;
    if(color !== "black") p.style.color = color;
    el.prepend(p);
}

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

function search() { passTime(2); refreshLocation(); log("搜索完成。"); }
function die() { alert("你死亡了！刷新页面重来。"); location.reload(); }

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

window.setHome = () => { player.home = {dim: currentDimension, x: player.x, y: player.y}; log("已安家。", "gold"); refreshLocation(); }

// === 交易系统 ===
function openTrading() {
    switchView('trade');
    updateTradeUI();
    log("与村民开始交易。");
}

function updateTradeUI() {
    const list = document.getElementById('trade-list');
    const emeraldCount = document.getElementById('trade-emerald-count');
    list.innerHTML = '';
    
    // 更新持有的绿宝石
    const myEmeralds = player.inventory['绿宝石'] || 0;
    if(emeraldCount) emeraldCount.innerText = myEmeralds;

    TRADES.forEach(trade => {
        const row = document.createElement('div');
        row.className = 'list-item';
        
        let inIcon = ITEM_ICONS[trade.in] ? `<img src="${ITEM_ICONS[trade.in]}" class="item-icon">` : "";
        let outIcon = ITEM_ICONS[trade.out] ? `<img src="${ITEM_ICONS[trade.out]}" class="item-icon">` : "";

        // 检查是否买得起
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

function executeTrade(trade) {
    if ((player.inventory[trade.in] || 0) < trade.cost) return;

    // 扣除付出
    player.inventory[trade.in] -= trade.cost;
    if (player.inventory[trade.in] <= 0) delete player.inventory[trade.in];

    // 获得回报
    addItemToInventory(trade.out, trade.count);

    log(`交易成功: ${trade.cost}${trade.in} -> ${trade.count}${trade.out}`, "green");
    updateTradeUI();
    updateInventoryUI();
}

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
    log("MC 文字版启动！村庄与交易更新。");
}

init();

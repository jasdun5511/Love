// --- 游戏配置 ---
const MAP_SIZE = 20; // 限制地图大小为 20x20
const BIOMES = {
    // 基础地形
    PLAINS: { 
        name: "草原", code: "bg-PLAINS", 
        res: ["杂草", "蒲公英", "橡木"], 
        mobs: [{name: "牛", type: "Peaceful"}, {name: "羊", type: "Peaceful"}, {name: "僵尸", type: "Hostile"}] 
    },
    FOREST: { 
        name: "森林", code: "bg-FOREST", 
        res: ["橡木", "桦木", "红蘑菇"], 
        mobs: [{name: "猪", type: "Peaceful"}, {name: "狼", type: "Peaceful"}, {name: "骷髅", type: "Hostile"}] 
    },
    DESERT: { 
        name: "沙漠", code: "bg-DESERT", 
        res: ["仙人掌", "枯灌木", "沙子"], 
        mobs: [{name: "兔子", type: "Peaceful"}, {name: "尸壳", type: "Hostile"}] 
    },
    MOUNTAIN: { 
        name: "高山", code: "bg-MOUNTAIN", 
        res: ["石头", "绿宝石矿", "铁矿"], 
        mobs: [{name: "山羊", type: "Peaceful"}, {name: "爬行者", type: "Hostile"}] // 爬行者=苦力怕
    },
    
    // Minecraft 特色地形
    SNOWY: { 
        name: "雪原", code: "bg-SNOWY", 
        res: ["雪块", "云杉木", "冰"], 
        mobs: [{name: "北极熊", type: "Peaceful"}, {name: "流浪者", type: "Hostile"}] // 流浪者=雪骷髅
    },
    SWAMP: { 
        name: "沼泽", code: "bg-SWAMP", 
        res: ["藤蔓", "睡莲", "粘土"], 
        mobs: [{name: "青蛙", type: "Peaceful"}, {name: "史莱姆", type: "Hostile"}, {name: "女巫", type: "Hostile"}] 
    },
    OCEAN: { 
        name: "海洋", code: "bg-OCEAN", 
        res: ["海带", "海草", "珊瑚"], 
        mobs: [{name: "海龟", type: "Peaceful"}, {name: "溺尸", type: "Hostile"}] 
    },
    MESA: { 
        name: "恶地", code: "bg-MESA", 
        res: ["红沙", "陶瓦", "金矿"], 
        mobs: [{name: "蜘蛛", type: "Hostile"}] 
    },
    JUNGLE: { 
        name: "丛林", code: "bg-JUNGLE", 
        res: ["竹子", "西瓜", "丛林木"], 
        mobs: [{name: "熊猫", type: "Peaceful"}, {name: "豹猫", type: "Peaceful"}, {name: "僵尸", type: "Hostile"}] 
    }
};

// 初始坐标设在地图中心 (10, 10)
let player = { x: 10, y: 10, hp: 100, hunger: 100, water: 100 };
let exploredMap = {}; 
let currentSceneItems = [];

// --- 核心逻辑 ---

// 1. 获取地形 (确保永远返回有效值，防止卡死)
function getBiomeType(x, y) {
    // 简单的哈希算法，根据坐标返回一个 0-8 的数字
    const val = Math.abs((x * 37 + y * 13) % 9);
    
    const keys = Object.keys(BIOMES);
    return keys[val] || "PLAINS"; // 如果出错，默认返回草原
}

function getBiome(x, y) {
    return getBiomeType(x, y);
}

// 2. 初始化
function init() {
    refreshLocation();
    log("世界已加载。地图范围: 20x20");
}

// 3. 移动逻辑 (增加边界检查！)
function move(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;

    // 检查是否超出 0-19 的范围
    if (newX < 0 || newX >= MAP_SIZE || newY < 0 || newY >= MAP_SIZE) {
        log("前面是世界的尽头（基岩墙），无法通过！");
        return;
    }

    player.x = newX;
    player.y = newY;
    player.hunger -= 1;
    player.water -= 1;
    
    refreshLocation();
    log(`移动到了 [${player.x}, ${player.y}]`);
}

// 4. 刷新界面
function refreshLocation() {
    // 记录探索
    exploredMap[`${player.x},${player.y}`] = true;
    
    // 视野扩展 (十字形)
    if(player.x+1 < MAP_SIZE) exploredMap[`${player.x+1},${player.y}`] = true;
    if(player.x-1 >= 0)       exploredMap[`${player.x-1},${player.y}`] = true;
    if(player.y+1 < MAP_SIZE) exploredMap[`${player.x},${player.y+1}`] = true;
    if(player.y-1 >= 0)       exploredMap[`${player.x},${player.y-1}`] = true;

    // 更新文本
    const type = getBiome(player.x, player.y);
    const biome = BIOMES[type];
    document.getElementById('loc-name').innerText = biome.name;
    document.getElementById('coord').innerText = `${player.x},${player.y}`;
    
    // 生成物品按钮
    generateItems(biome);
    renderScene();

    // 更新左下角导航
    updateMiniMap();
    
    // 如果地图开着，就刷新地图
    if (!document.getElementById('map-modal').classList.contains('hidden')) {
        renderBigMap();
    }
}

// 5. 生成物品 (修复可能的死循环)
function generateItems(biome) {
    currentSceneItems = [];
    if (!biome.res || !biome.mobs) return; // 防止数据缺失导致报错

    const possibleItems = [
        ...biome.res.map(n => ({ name: n, type: 'res' })), 
        ...biome.mobs.map(m => ({ name: m.name, type: 'mob', mobType: m.type }))
    ];

    const count = 6 + Math.floor(Math.random() * 6); // 6-12个物品
    
    for(let i=0; i<count; i++) {
        const template = possibleItems[Math.floor(Math.random() * possibleItems.length)];
        let item = { name: template.name, type: template.type };
        
        if (item.type === 'res') {
            item.val = Math.floor(Math.random() * 8) + 1;
            item.label = `(${item.val})`;
        } else {
            // 敌对生物等级高，和平生物等级低
            const baseLv = template.mobType === 'Hostile' ? 10 : 1;
            item.val = baseLv + Math.floor(Math.random() * 5);
            item.label = `(LV${item.val})`;
        }
        currentSceneItems.push(item);
    }
}

// 6. 渲染中间按钮
function renderScene() {
    const grid = document.getElementById('scene-grid');
    grid.innerHTML = '';
    currentSceneItems.forEach(item => {
        const btn = document.createElement('div');
        btn.className = `grid-btn ${item.type}`;
        // 如果是敌对怪物，加个类名变红
        if(item.type === 'mob' && item.val > 5) btn.classList.add('hostile'); 
        
        btn.innerText = item.name + item.label;
        btn.onclick = () => {
             log(`你交互了 ${item.name} ${item.label}`);
             btn.style.opacity = '0.5';
        };
        grid.appendChild(btn);
    });
}

// 7. 渲染大地图 (限制在 20x20 范围内渲染)
function renderBigMap() {
    const mapEl = document.getElementById('big-grid');
    if (!mapEl) return;
    mapEl.innerHTML = '';
    
    // 我们渲染整个 20x20 的地图，而不是只渲染周围
    // 修改 grid css 样式以适应 20x20
    mapEl.style.gridTemplateColumns = `repeat(${MAP_SIZE}, 1fr)`;
    mapEl.style.gridTemplateRows = `repeat(${MAP_SIZE}, 1fr)`;
    
    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            const cell = document.createElement('div');
            const key = `${x},${y}`;
            
            if (exploredMap[key]) {
                const type = getBiome(x, y);
                cell.className = `map-cell ${BIOMES[type].code}`;
                cell.innerText = BIOMES[type].name.substring(0, 2); // 显示两个字
            } else {
                cell.className = 'map-cell fog';
                cell.innerText = '';
            }

            if (x === player.x && y === player.y) {
                cell.classList.add('player');
                cell.innerText = BIOMES[getBiome(x, y)].name.substring(0, 2);
            }
            mapEl.appendChild(cell);
        }
    }
}

// 8. 辅助功能
function updateMiniMap() {
    // 边界检查：如果出界，显示“边界”
    const getBiomeNameSafe = (x, y) => {
        if (x < 0 || x >= MAP_SIZE || y < 0 || y >= MAP_SIZE) return "边界";
        return BIOMES[getBiome(x, y)].name;
    };

    document.getElementById('dir-n').innerText = getBiomeNameSafe(player.x, player.y - 1);
    document.getElementById('dir-s').innerText = getBiomeNameSafe(player.x, player.y + 1);
    document.getElementById('dir-w').innerText = getBiomeNameSafe(player.x - 1, player.y);
    document.getElementById('dir-e').innerText = getBiomeNameSafe(player.x + 1, player.y);
    document.getElementById('dir-c').innerText = "我";
}

function log(msg) {
    const el = document.getElementById('game-log');
    if(!el) return;
    const p = document.createElement('p');
    p.innerText = "> " + msg;
    el.prepend(p);
}

// 地图开关
function openMap() { document.getElementById('map-modal').classList.remove('hidden'); renderBigMap(); }
function closeMap() { document.getElementById('map-modal').classList.add('hidden'); }

// 启动
init();

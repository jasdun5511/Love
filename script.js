// --- 配置 ---
const BIOMES = {
    PLAINS: { name: "草原", color: "#7cfc00", items: ["草丛", "野花", "兔子"] },
    FOREST: { name: "森林", color: "#228b22", items: ["树木", "浆果", "蘑菇", "森林狼"] },
    DESERT: { name: "沙漠", color: "#f4a460", items: ["仙人掌", "枯木", "蝎子"] },
    MOUNTAIN: { name: "山脉", color: "#808080", items: ["石块", "铁矿石", "山羊"] },
    GOBI: { name: "戈壁", color: "#d2b48c", items: ["石块", "沙硕", "巨蜥"] }
};

let player = { x: 11, y: 3, hp: 100, hunger: 100, water: 100 };
let currentSceneItems = []; // 当前格子的物品列表

// --- 核心工具：地形生成 ---
function getBiome(x, y) {
    // 简单的伪随机，保证固定坐标地形不变
    const val = Math.abs(Math.sin(x * 12.3 + y * 4.5));
    if (val < 0.2) return "PLAINS";
    if (val < 0.4) return "FOREST";
    if (val < 0.6) return "GOBI";
    if (val < 0.8) return "MOUNTAIN";
    return "DESERT";
}

// --- 初始化 ---
function init() {
    refreshLocation();
    log("游戏已加载，当前位于扩展难度。");
}

// --- 移动逻辑 ---
function move(dx, dy) {
    player.x += dx;
    player.y += dy;
    
    // 消耗
    player.hunger -= 1;
    player.water -= 1;
    
    refreshLocation();
    log(`移动到了 [${player.x}, ${player.y}]`);
}

// --- 刷新所有界面 ---
function refreshLocation() {
    // 1. 更新顶部信息
    const type = getBiome(player.x, player.y);
    const biome = BIOMES[type];
    document.getElementById('loc-name').innerText = biome.name;
    document.getElementById('coord').innerText = `${player.x},${player.y}`;
    document.getElementById('hp').innerText = player.hp;
    document.getElementById('hunger').innerText = player.hunger;
    document.getElementById('water').innerText = player.water;

    // 2. 生成并渲染中间的资源按钮 (模拟截图中的格子)
    generateItems(biome);
    renderScene();

    // 3. 更新左下角十字微型地图
    updateMiniMap();
}

// 生成当前格子的物品
function generateItems(biome) {
    currentSceneItems = [];
    const count = 8 + Math.floor(Math.random() * 5); // 8-12个物品
    
    for(let i=0; i<count; i++) {
        const itemBase = biome.items[Math.floor(Math.random() * biome.items.length)];
        const isMob = ["狼", "蝎子", "巨蜥", "山羊"].some(k => itemBase.includes(k));
        
        currentSceneItems.push({
            name: itemBase,
            count: isMob ? `LV${Math.floor(Math.random()*10)+1}` : Math.floor(Math.random()*10)+1,
            type: isMob ? 'mob' : 'res'
        });
    }
}

// 渲染中间的按钮网格
function renderScene() {
    const grid = document.getElementById('scene-grid');
    grid.innerHTML = '';
    
    currentSceneItems.forEach(item => {
        const btn = document.createElement('div');
        // 根据类型添加样式 (怪物是红色)
        btn.className = `grid-btn ${item.type}`; 
        
        // 格式: 名字(数量/等级) -> 草丛(3) 或 蝎子(LV5)
        let countText = item.type === 'res' ? `(${item.count})` : `(${item.count})`;
        btn.innerText = item.name + countText;
        
        btn.onclick = () => {
            if(item.type === 'mob') log(`你攻击了 ${item.name}！(战斗系统待开发)`);
            else log(`你采集了 ${item.name} x${item.count}`);
            btn.style.opacity = "0.5"; // 点击后变灰示意
        };
        
        grid.appendChild(btn);
    });
}

// **关键：更新左下角十字地图**
function updateMiniMap() {
    // 获取四周的地形名字
    const n = BIOMES[getBiome(player.x, player.y - 1)].name;
    const s = BIOMES[getBiome(player.x, player.y + 1)].name;
    const w = BIOMES[getBiome(player.x - 1, player.y)].name;
    const e = BIOMES[getBiome(player.x + 1, player.y)].name;
    const c = BIOMES[getBiome(player.x, player.y)].name;

    document.getElementById('dir-n').innerText = n;
    document.getElementById('dir-s').innerText = s;
    document.getElementById('dir-w').innerText = w;
    document.getElementById('dir-e').innerText = e;
    document.getElementById('dir-c').innerText = c;
}

function search() {
    log("你在周围探索了一番，发现了新的资源...");
    player.hunger -= 2;
    refreshLocation(); // 重新生成资源
}

function log(msg) {
    const el = document.getElementById('game-log');
    const p = document.createElement('p');
    p.innerText = "> " + msg;
    el.prepend(p);
}

// 启动
init();

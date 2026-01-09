// === 1. 游戏基础配置 ===
const MAP_SIZE = 20;

// === 2. 生物群系与掉落配置 ===
const BIOMES = {
    // === 主世界 ===
    PLAINS: { 
        name: "平原", code: "bg-PLAINS", 
        res: ["杂草", "小麦种子", "橡木原木", "蒲公英"], 
        mobs: [{name:"牛", hp:10, atk:0, loot:"生牛肉"}, {name:"僵尸", hp:20, atk:3, loot:"腐肉"}, {name:"苦力怕", hp:20, atk:15, loot:"火药"}] 
    },
    FOREST: { 
        name: "森林", code: "bg-FOREST", 
        res: ["橡木原木", "云杉原木", "木棍", "苹果", "蘑菇"], 
        mobs: [{name:"猪", hp:10, atk:0, loot:"生猪排"}, {name:"骷髅", hp:20, atk:4, loot:"骨头"}, {name:"蜘蛛", hp:16, atk:3, loot:"线"}] 
    },
    DESERT: { 
        name: "沙漠", code: "bg-DESERT", 
        res: ["沙子", "仙人掌", "枯灌木", "岩浆源"], 
        mobs: [{name:"尸壳", hp:20, atk:4, loot:"腐肉"}] 
    },
    MOUNTAIN: { 
        name: "山地", code: "bg-MOUNTAIN", 
        res: ["石头", "铁矿石", "煤炭", "绿宝石矿"], 
        mobs: [{name:"羊", hp:8, atk:0, loot:"生羊肉"}] 
    },
    SNOWY: { 
        name: "雪原", code: "bg-SNOWY", 
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

// === 3. 合成配方配置 ===
const RECIPES = [
    // === 建筑类 ===
    { name: "工作台", req: { "橡木原木": 4 }, type: "build", desc: "放置后可存储物品" }, 
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

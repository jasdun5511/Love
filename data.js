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
        res: ["石头", "铁矿石", "煤炭", "绿宝石矿"], // 这些现在需要镐子
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

    // === 下界 ===
    NETHER_WASTES: { name: "地狱", code: "bg-NETHER", res: ["地狱岩", "石英矿", "岩浆源", "金粒"], mobs: [{name:"僵尸猪人", hp:20, atk:5, loot:"金粒"}, {name:"恶魂", hp:10, atk:10, loot:"火药"}] },
    CRIMSON_FOREST: { name: "绯红", code: "bg-CRIMSON", res: ["绯红菌柄", "地狱疣", "萤石"], mobs: [{name:"猪灵", hp:16, atk:6, loot:"金锭"}, {name:"疣猪兽", hp:40, atk:8, loot:"生猪排"}] },
    SOUL_SAND_VALLEY: { name: "灵魂", code: "bg-SOUL", res: ["灵魂沙", "骨块", "玄武岩"], mobs: [{name:"骷髅", hp:20, atk:5, loot:"骨头"}] },
    LAVA_SEA: { name: "熔岩", code: "bg-LAVA", res: ["岩浆源", "黑石", "远古残骸"], mobs: [{name:"烈焰人", hp:20, atk:6, loot:"烈焰棒"}, {name:"岩浆怪", hp:16, atk:4, loot:"岩浆膏"}] }
};

// === 3. 合成配方配置 ===
// station: 'workbench' 表示需要站在工作台方块上
// station: 'furnace' 表示需要站在熔炉方块上
const RECIPES = [
    // === 建筑类 (不需要工作台，手搓) ===
    { name: "工作台", req: { "橡木原木": 4 }, type: "build", desc: "放置后解锁高级合成" }, 
    { name: "熔炉", req: { "石头": 8 }, type: "build", desc: "放置后可烧炼/烹饪", station: "workbench" }, 
    { name: "下界传送门", req: { "黑曜石": 10, "打火石": 1 }, type: "build", desc: "放置后点击进入地狱" },

    // === 材料加工 (部分需要工作台) ===
    { name: "木棍", req: { "橡木原木": 2 }, type: "item", desc: "基础材料" }, // 手搓
    { name: "铁锭", req: { "铁矿石": 1, "煤炭": 1 }, type: "item", desc: "烧炼铁矿", station: "furnace" },
    { name: "金锭", req: { "金矿石": 1, "煤炭": 1 }, type: "item", desc: "烧炼金矿", station: "furnace" },
    { name: "钻石", req: { "钻石矿": 1 }, type: "item", desc: "敲碎矿石获得" }, // 简化逻辑
    { name: "下界合金锭", req: { "远古残骸": 1, "金锭": 1 }, type: "item", desc: "顶级材料", station: "workbench" },

    // === 核心工具 ===
    { name: "打火石", req: { "铁锭": 1, "燧石": 1 }, type: "item", desc: "点火工具", station: "workbench" },
    { name: "铁桶", req: { "铁锭": 3 }, type: "item", desc: "装流体用", station: "workbench" },
    { name: "黑曜石", req: { "岩浆桶": 1, "水": 1 }, type: "item", desc: "坚硬方块" },

    // === 新增：镐子 (采集石头必须) ===
    { name: "木镐", req: { "木棍": 2, "橡木原木": 3 }, type: "equip", effect: "tool", val: 1, desc: "采矿工具 LV1", station: "workbench" },
    { name: "石镐", req: { "木棍": 2, "石头": 3 }, type: "equip", effect: "tool", val: 2, desc: "采矿工具 LV2", station: "workbench" },
    { name: "铁镐", req: { "木棍": 2, "铁锭": 3 }, type: "equip", effect: "tool", val: 3, desc: "采矿工具 LV3", station: "workbench" },
    { name: "钻石镐", req: { "木棍": 2, "钻石": 3 }, type: "equip", effect: "tool", val: 4, desc: "采矿工具 LV4", station: "workbench" },

    // === 武器进化 (都需要工作台) ===
    { name: "木剑", req: { "木棍": 1, "橡木原木": 2 }, type: "equip", effect: "atk", val: 8, desc: "攻击力 8", station: "workbench" },
    { name: "石剑", req: { "木棍": 1, "石头": 2 }, type: "equip", effect: "atk", val: 12, desc: "攻击力 12", station: "workbench" },
    { name: "铁剑", req: { "木棍": 1, "铁锭": 2 }, type: "equip", effect: "atk", val: 18, desc: "攻击力 18", station: "workbench" },
    { name: "钻石剑", req: { "木棍": 1, "钻石": 2 }, type: "equip", effect: "atk", val: 25, desc: "攻击力 25", station: "workbench" },
    { name: "下界合金剑", req: { "钻石剑": 1, "下界合金锭": 1 }, type: "equip", effect: "atk", val: 35, desc: "攻击力 35", station: "workbench" },

    // === 防具进化 (都需要工作台) ===
    { name: "铁盔甲", req: { "铁锭": 5 }, type: "equip", effect: "hp_max", val: 150, desc: "HP上限 -> 150", station: "workbench" },
    { name: "钻石盔甲", req: { "钻石": 5 }, type: "equip", effect: "hp_max", val: 200, desc: "HP上限 -> 200", station: "workbench" },
    { name: "下界合金甲", req: { "钻石盔甲": 1, "下界合金锭": 1 }, type: "equip", effect: "hp_max", val: 250, desc: "HP上限 -> 250", station: "workbench" },

    // === 食物 (烧烤类需要熔炉) ===
    { name: "面包", req: { "小麦种子": 3 }, type: "use", effect: "food", val: 25, desc: "恢复 25 饥饿" }, // 面包可以手搓
    { name: "熟牛肉", req: { "生牛肉": 1, "煤炭": 1 }, type: "use", effect: "food", val: 40, desc: "恢复 40 饥饿", station: "furnace" },
    { name: "烤猪排", req: { "生猪排": 1, "煤炭": 1 }, type: "use", effect: "food", val: 40, desc: "恢复 40 饥饿", station: "furnace" },
    { name: "金苹果", req: { "苹果": 1, "金锭": 8 }, type: "use", effect: "heal", val: 100, desc: "瞬间恢复 100 HP", station: "workbench" }
];

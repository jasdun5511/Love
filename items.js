// ==========================================
// 1. 图标资源库 (ITEM_ICONS)
// ==========================================
const ITEM_ICONS = {
    // UI
    "导航_背包": "https://zh.minecraft.wiki/images/Invicon_Chest.png?68094",
    "导航_制作": "https://zh.minecraft.wiki/images/Crafting_Table_JE4_BE3.png",
    "导航_探索": "https://zh.minecraft.wiki/images/Grass_Block_JE7_BE6.png", 
    "导航_地图": "https://zh.minecraft.wiki/images/Invicon_Locked_Map.png?af5e7",   
    "导航_系统": "https://zh.minecraft.wiki/images/Impulse_Command_Block.gif?e65a3", 

    // 基础资源
    "橡木原木": "https://zh.minecraft.wiki/images/Oak_Log_Axis_Y_JE5_BE3.png?da15a",
    "云杉原木": "https://zh.minecraft.wiki/images/Spruce_Log_JE4_BE2.png",
    "木棍": "https://zh.minecraft.wiki/images/Stick_JE1_BE1.png?2ab19",
    "杂草": "https://zh.minecraft.wiki/images/Grass_JE2_BE2.png", 
    "小麦种子": "https://zh.minecraft.wiki/images/Wheat_Seeds_JE2_BE2.png",
    "蒲公英": "https://zh.minecraft.wiki/images/Dandelion_JE2_BE2.png",
    "兰花": "https://zh.minecraft.wiki/images/Blue_Orchid_JE2_BE2.png",
    "蘑菇": "https://zh.minecraft.wiki/images/Red_Mushroom_JE2_BE2.png",
    "仙人掌": "https://zh.minecraft.wiki/images/Cactus_JE4_BE2.png",
    "枯灌木": "https://zh.minecraft.wiki/images/Dead_Bush_JE2_BE2.png",
    "藤蔓": "https://zh.minecraft.wiki/images/Vines_JE3_BE2.png",
    "海带": "https://zh.minecraft.wiki/images/Kelp_JE2_BE2.png",

    // 瓶子系列
    "玻璃瓶": "https://zh.minecraft.wiki/images/Glass_Bottle_JE2_BE2.png",
    "水瓶": "https://zh.minecraft.wiki/images/Water_Bottle_JE2_BE2.png",
    "蜂蜜瓶": "https://zh.minecraft.wiki/images/Honey_Bottle_JE1_BE1.png",

    // 地形方块
    "石头": "https://zh.minecraft.wiki/images/Stone_JE5_BE3.png",
    "沙子": "https://zh.minecraft.wiki/images/Sand_JE5_BE3.png",
    "红沙": "https://zh.minecraft.wiki/images/Red_Sand_JE2_BE2.png",
    "粘土": "https://zh.minecraft.wiki/images/Clay_Ball_JE2_BE2.png",
    "冰": "https://zh.minecraft.wiki/images/Ice_JE4_BE2.png",
    "雪球": "https://zh.minecraft.wiki/images/Snowball_JE3_BE3.png",
    "黑曜石": "https://zh.minecraft.wiki/images/Obsidian_JE3_BE2.png",
    "岩浆源": "https://zh.minecraft.wiki/images/Lava_JE2.png", 
    "水": "https://zh.minecraft.wiki/images/Water_Bucket_JE2_BE2.png",

    // 矿物
    "煤炭": "https://zh.minecraft.wiki/images/Coal_JE3_BE2.png?b473d",
    "铁矿石": "https://zh.minecraft.wiki/images/Iron_Ore_JE6_BE4.png",
    "铁锭": "https://zh.minecraft.wiki/images/Iron_Ingot_JE3_BE2.png",
    "金矿石": "https://zh.minecraft.wiki/images/Gold_Ore_JE7_BE4.png",
    "金锭": "https://zh.minecraft.wiki/images/Gold_Ingot_JE4_BE2.png",
    "金粒": "https://zh.minecraft.wiki/images/Gold_Nugget_JE3_BE2.png",
    "钻石矿": "https://zh.minecraft.wiki/images/Diamond_Ore_JE6_BE4.png",
    "钻石": "https://zh.minecraft.wiki/images/Diamond_JE3_BE3.png",
    "绿宝石矿": "https://zh.minecraft.wiki/images/Emerald_Ore_JE4_BE3.png",
    "红石": "https://zh.minecraft.wiki/images/Redstone_Dust_JE2_BE2.png",
    "燧石": "https://zh.minecraft.wiki/images/Flint_JE3_BE3.png",
    "远古残骸": "https://zh.minecraft.wiki/images/Ancient_Debris_JE2_BE2.png",
    "下界合金碎片": "https://zh.minecraft.wiki/images/Netherite_Scrap_JE2_BE2.png",
    "下界合金锭": "https://zh.minecraft.wiki/images/Netherite_Ingot_JE1_BE1.png",

    // 生物
    "牛": "https://zh.minecraft.wiki/images/Cow_JE4_BE2.png",
    "猪": "https://zh.minecraft.wiki/images/Pig_JE2_BE2.png",
    "羊": "https://zh.minecraft.wiki/images/Sheep_JE2_BE2.png",
    "鱿鱼": "https://zh.minecraft.wiki/images/Squid_JE2_BE2.png",
    "僵尸": "https://zh.minecraft.wiki/images/Zombie_JE3_BE2.png",
    "苦力怕": "https://zh.minecraft.wiki/images/Creeper_JE2_BE2.png",
    "骷髅": "https://zh.minecraft.wiki/images/Skeleton_JE2_BE2.png",
    "蜘蛛": "https://zh.minecraft.wiki/images/Spider_JE2_BE2.png",
    "尸壳": "https://zh.minecraft.wiki/images/Husk_JE2_BE2.png",
    "流浪者": "https://zh.minecraft.wiki/images/Stray_JE2_BE2.png",
    "溺尸": "https://zh.minecraft.wiki/images/Drowned_JE2_BE2.png",
    "史莱姆": "https://zh.minecraft.wiki/images/Slime_JE2_BE2.png",
    "女巫": "https://zh.minecraft.wiki/images/Witch_JE2_BE2.png",
    "僵尸猪人": "https://zh.minecraft.wiki/images/Zombified_Piglin_JE2_BE2.png",
    "恶魂": "https://zh.minecraft.wiki/images/Ghast_JE2_BE2.png",
    "猪灵": "https://zh.minecraft.wiki/images/Piglin_JE2_BE2.png",
    "疣猪兽": "https://zh.minecraft.wiki/images/Hoglin_JE2_BE2.png",
    "烈焰人": "https://zh.minecraft.wiki/images/Blaze_JE2_BE2.png",
    "岩浆怪": "https://zh.minecraft.wiki/images/Magma_Cube_JE2_BE2.png",

    // 装备与工具
    "木剑": "https://zh.minecraft.wiki/images/Wooden_Sword_JE2_BE2.png",
    "石剑": "https://zh.minecraft.wiki/images/Stone_Sword_JE2_BE2.png",
    "铁剑": "https://zh.minecraft.wiki/images/Iron_Sword_JE2_BE2.png",
    "钻石剑": "https://zh.minecraft.wiki/images/Diamond_Sword_JE3_BE3.png",
    "下界合金剑": "https://zh.minecraft.wiki/images/Netherite_Sword_JE2_BE2.png",
    "三叉戟": "https://zh.minecraft.wiki/images/Trident_JE2_BE1.png",
    "箭": "https://zh.minecraft.wiki/images/Arrow_JE2_BE2.png",
    "打火石": "https://zh.minecraft.wiki/images/Flint_and_Steel_JE4_BE2.png",
    "铁桶": "https://zh.minecraft.wiki/images/Bucket_JE2_BE2.png",
    "岩浆桶": "https://zh.minecraft.wiki/images/Lava_Bucket_JE2_BE2.png",
    "铁盔甲": "https://zh.minecraft.wiki/images/Iron_Chestplate_JE2_BE2.png",
    "钻石盔甲": "https://zh.minecraft.wiki/images/Diamond_Chestplate_JE3_BE3.png",
    "下界合金甲": "https://zh.minecraft.wiki/images/Netherite_Chestplate_JE2_BE2.png",
    "木镐": "https://zh.minecraft.wiki/images/Wooden_Pickaxe_JE3_BE3.png",
    "石镐": "https://zh.minecraft.wiki/images/Stone_Pickaxe_JE2_BE2.png",
    "铁镐": "https://zh.minecraft.wiki/images/Iron_Pickaxe_JE3_BE2.png",
    "钻石镐": "https://zh.minecraft.wiki/images/Diamond_Pickaxe_JE3_BE3.png",

    // 食物与杂项
    "生牛肉": "https://zh.minecraft.wiki/images/Raw_Beef_JE4_BE3.png",
    "熟牛肉": "https://zh.minecraft.wiki/images/Steak_JE4_BE3.png",
    "生猪排": "https://zh.minecraft.wiki/images/Raw_Porkchop_JE4_BE3.png",
    "烤猪排": "https://zh.minecraft.wiki/images/Cooked_Porkchop_JE4_BE3.png",
    "生羊肉": "https://zh.minecraft.wiki/images/Raw_Mutton_JE3_BE2.png",
    "鳕鱼": "https://zh.minecraft.wiki/images/Raw_Cod_JE4_BE3.png",
    "苹果": "https://zh.minecraft.wiki/images/Apple_JE3_BE3.png",
    "金苹果": "https://zh.minecraft.wiki/images/Golden_Apple_JE2_BE2.png",
    "面包": "https://zh.minecraft.wiki/images/Bread_JE3_BE3.png",
    "腐肉": "https://zh.minecraft.wiki/images/Rotten_Flesh_JE2_BE2.png",
    "地狱岩": "https://zh.minecraft.wiki/images/Netherrack_JE4_BE2.png",
    "石英矿": "https://zh.minecraft.wiki/images/Nether_Quartz_Ore_JE3_BE2.png",
    "绯红菌柄": "https://zh.minecraft.wiki/images/Crimson_Stem_JE2_BE2.png",
    "地狱疣": "https://zh.minecraft.wiki/images/Nether_Wart_JE2_BE2.png",
    "萤石": "https://zh.minecraft.wiki/images/Glowstone_JE3_BE2.png",
    "灵魂沙": "https://zh.minecraft.wiki/images/Soul_Sand_JE3_BE2.png",
    "骨块": "https://zh.minecraft.wiki/images/Bone_Block_JE2_BE2.png",
    "玄武岩": "https://zh.minecraft.wiki/images/Basalt_JE2_BE2.png",
    "黑石": "https://zh.minecraft.wiki/images/Blackstone_JE2_BE2.png",
    "烈焰棒": "https://zh.minecraft.wiki/images/Blaze_Rod_JE2_BE2.png",
    "岩浆膏": "https://zh.minecraft.wiki/images/Magma_Cream_JE3_BE2.png",
    "恶魂之泪": "https://zh.minecraft.wiki/images/Ghast_Tear_JE2_BE2.png",
    "末影珍珠": "https://zh.minecraft.wiki/images/Ender_Pearl_JE3_BE2.png",
    "火药": "https://zh.minecraft.wiki/images/Gunpowder_JE2_BE2.png",
    "骨头": "https://zh.minecraft.wiki/images/Bone_JE2_BE2.png",
    "线": "https://zh.minecraft.wiki/images/String_JE3_BE3.png",
    "墨囊": "https://zh.minecraft.wiki/images/Ink_Sac_JE2_BE2.png",
    "粘液球": "https://zh.minecraft.wiki/images/Slimeball_JE2_BE2.png",
    "工作台": "https://zh.minecraft.wiki/images/Crafting_Table_JE4_BE3.png",
    "熔炉": "https://zh.minecraft.wiki/images/Furnace_%28S%29_BE2.png?5793e",
    "下界传送门": "https://zh.minecraft.wiki/images/Nether_portal_%28animated%29.png?441e3",

    // === 村庄与交易 (修复：把这些移进大括号里面了) ===
    "绿宝石": "https://zh.minecraft.wiki/images/Emerald_JE3_BE3.png",
    "马铃薯": "https://zh.minecraft.wiki/images/Potato_JE3_BE2.png",
    "烤马铃薯": "https://zh.minecraft.wiki/images/Baked_Potato_JE4_BE2.png",
    "虞美人": "https://zh.minecraft.wiki/images/Poppy_JE2_BE2.png",
    
    // 生物
    "村民": "https://zh.minecraft.wiki/images/Swamp_Farmer_JE1_BE1.png?166dd",
    "铁傀儡": "https://zh.minecraft.wiki/images/Iron_Golem_JE2_BE2.png",
    "掠夺者": "https://zh.minecraft.wiki/images/Pillager_JE2_BE2.png",
    "卫道士": "https://zh.minecraft.wiki/images/Vindicator_JE2_BE2.png",
    
    // 武器
    "弩": "https://zh.minecraft.wiki/images/Crossbow_JE2_BE2.png",
    "铁斧": "https://zh.minecraft.wiki/images/Iron_Axe_JE2_BE2.png"
}; // <--- 修复：这里才是大括号闭合的地方

// ==========================================
// 2. 游戏配置 (MAP & BIOMES)
// ==========================================
const MAP_SIZE = 20;

const BIOMES = {
    VILLAGE: { 
        name: "村庄", code: "bg-VILLAGE", 
        res: ["橡木原木", "小麦种子", "马铃薯", "虞美人", "绿宝石"], 
        mobs: [
            {name:"村民", hp:20, atk:0, loot:"绿宝石"},
            {name:"铁傀儡", hp:80, atk:15, loot:"铁锭"},
            {name:"掠夺者", hp:30, atk:8, loot:"绿宝石"},
            {name:"卫道士", hp:40, atk:12, loot:"绿宝石"}
        ] 
    },
    PLAINS: { name: "平原", code: "bg-PLAINS", res: ["杂草", "小麦种子", "橡木原木", "蒲公英"], mobs: [{name:"牛", hp:10, atk:0, loot:"生牛肉"}, {name:"僵尸", hp:20, atk:3, loot:"腐肉"}, {name:"苦力怕", hp:20, atk:15, loot:"火药"}] },
    FOREST: { name: "森林", code: "bg-FOREST", res: ["橡木原木", "云杉原木", "木棍", "苹果", "蘑菇"], mobs: [{name:"猪", hp:10, atk:0, loot:"生猪排"}, {name:"骷髅", hp:20, atk:4, loot:"骨头"}, {name:"蜘蛛", hp:16, atk:3, loot:"线"}] },
    DESERT: { name: "沙漠", code: "bg-DESERT", res: ["沙子", "仙人掌", "枯灌木", "岩浆源"], mobs: [{name:"尸壳", hp:20, atk:4, loot:"腐肉"}] },
    MOUNTAIN: { name: "山地", code: "bg-MOUNTAIN", res: ["石头", "铁矿石", "煤炭", "绿宝石矿"], mobs: [{name:"羊", hp:8, atk:0, loot:"生羊肉"}] },
    SNOWY: { name: "雪原", code: "bg-SNOWY", res: ["冰", "雪球", "云杉原木"], mobs: [{name:"流浪者", hp:20, atk:4, loot:"箭"}] },
    OCEAN: { name: "深海", code: "bg-OCEAN", res: ["水", "鳕鱼", "海带"], mobs: [{name:"溺尸", hp:20, atk:5, loot:"三叉戟"}, {name:"鱿鱼", hp:10, atk:0, loot:"墨囊"}] },
    SWAMP: { name: "沼泽", code: "bg-SWAMP", res: ["粘土", "藤蔓", "兰花"], mobs: [{name:"史莱姆", hp:16, atk:2, loot:"粘液球"}, {name:"女巫", hp:26, atk:6, loot:"红石"}] },
    MESA: { name: "恶地", code: "bg-MESA", res: ["红沙", "金矿石", "枯灌木"], mobs: [{name:"蜘蛛", hp:16, atk:3, loot:"线"}] },
    NETHER_WASTES: { name: "地狱", code: "bg-NETHER", res: ["地狱岩", "石英矿", "岩浆源", "金粒"], mobs: [{name:"僵尸猪人", hp:20, atk:5, loot:"金粒"}, {name:"恶魂", hp:10, atk:10, loot:"火药"}] },
    CRIMSON_FOREST: { name: "绯红", code: "bg-CRIMSON", res: ["绯红菌柄", "地狱疣", "萤石"], mobs: [{name:"猪灵", hp:16, atk:6, loot:"金锭"}, {name:"疣猪兽", hp:40, atk:8, loot:"生猪排"}] },
    SOUL_SAND_VALLEY: { name: "灵魂", code: "bg-SOUL", res: ["灵魂沙", "骨块", "玄武岩"], mobs: [{name:"骷髅", hp:20, atk:5, loot:"骨头"}] },
    LAVA_SEA: { name: "熔岩", code: "bg-LAVA", res: ["岩浆源", "黑石", "远古残骸"], mobs: [{name:"烈焰人", hp:20, atk:6, loot:"烈焰棒"}, {name:"岩浆怪", hp:16, atk:4, loot:"岩浆膏"}] }
};

// ==========================================
// 3. 配方表 (RECIPES)
// ==========================================
const RECIPES = [
    // === 建筑类 ===
    { name: "工作台", req: { "原木": 4 }, type: "build", desc: "放置后解锁高级合成" }, 
    { name: "熔炉", req: { "石头": 8 }, type: "build", desc: "放置后可烧炼/烹饪", station: "workbench" }, 
    { name: "下界传送门", req: { "黑曜石": 10, "打火石": 1 }, type: "build", desc: "放置后点击进入地狱" },

    // === 药水与容器 ===
    { name: "玻璃瓶", req: { "沙子": 3, "煤炭": 1 }, type: "item", desc: "烧制沙子获得", station: "furnace" },
    { name: "水瓶", req: { "玻璃瓶": 1, "雪球": 1 }, type: "use", effect: "drink", val: 10, desc: "雪球融化成水(需熔炉)", station: "furnace" },
    { name: "蜂蜜瓶", req: { "水瓶": 1, "花": 1 }, type: "use", effect: "super_food", val: 30, desc: "花蜜水 (恢复HP和水分)" },

    // === 材料加工 ===
    { name: "木棍", req: { "原木": 2 }, type: "item", desc: "基础材料" }, 
    { name: "铁锭", req: { "铁矿石": 1, "煤炭": 1 }, type: "item", desc: "烧炼铁矿", station: "furnace" },
    { name: "金锭", req: { "金矿石": 1, "煤炭": 1 }, type: "item", desc: "烧炼金矿", station: "furnace" },
    { name: "钻石", req: { "钻石矿": 1 }, type: "item", desc: "敲碎矿石获得" },
    { name: "下界合金锭", req: { "远古残骸": 1, "金锭": 1 }, type: "item", desc: "顶级材料", station: "workbench" },

    // === 核心工具 ===
    { name: "打火石", req: { "铁锭": 1, "燧石": 1 }, type: "item", desc: "点火工具", station: "workbench" },
    { name: "铁桶", req: { "铁锭": 3 }, type: "item", desc: "装流体用", station: "workbench" },
    { name: "黑曜石", req: { "岩浆桶": 1, "水": 1 }, type: "item", desc: "坚硬方块" },

    // === 镐子 ===
    { name: "木镐", req: { "木棍": 2, "原木": 3 }, type: "equip", effect: "tool", val: 1, desc: "采矿工具 LV1", station: "workbench" },
    { name: "石镐", req: { "木棍": 2, "石头": 3 }, type: "equip", effect: "tool", val: 2, desc: "采矿工具 LV2", station: "workbench" },
    { name: "铁镐", req: { "木棍": 2, "铁锭": 3 }, type: "equip", effect: "tool", val: 3, desc: "采矿工具 LV3", station: "workbench" },
    { name: "钻石镐", req: { "木棍": 2, "钻石": 3 }, type: "equip", effect: "tool", val: 4, desc: "采矿工具 LV4", station: "workbench" },

    // === 武器与防具 ===
    { name: "木剑", req: { "木棍": 1, "原木": 2 }, type: "equip", effect: "atk", val: 8, desc: "攻击力 8", station: "workbench" },
    { name: "石剑", req: { "木棍": 1, "石头": 2 }, type: "equip", effect: "atk", val: 12, desc: "攻击力 12", station: "workbench" },
    { name: "铁剑", req: { "木棍": 1, "铁锭": 2 }, type: "equip", effect: "atk", val: 18, desc: "攻击力 18", station: "workbench" },
    { name: "钻石剑", req: { "木棍": 1, "钻石": 2 }, type: "equip", effect: "atk", val: 25, desc: "攻击力 25", station: "workbench" },
    { name: "下界合金剑", req: { "钻石剑": 1, "下界合金锭": 1 }, type: "equip", effect: "atk", val: 35, desc: "攻击力 35", station: "workbench" },
    { name: "铁盔甲", req: { "铁锭": 5 }, type: "equip", effect: "hp_max", val: 150, desc: "HP上限 -> 150", station: "workbench" },
    { name: "钻石盔甲", req: { "钻石": 5 }, type: "equip", effect: "hp_max", val: 200, desc: "HP上限 -> 200", station: "workbench" },
    { name: "下界合金甲", req: { "钻石盔甲": 1, "下界合金锭": 1 }, type: "equip", effect: "hp_max", val: 250, desc: "HP上限 -> 250", station: "workbench" },

    // === 食物 ===
    { name: "面包", req: { "小麦种子": 3 }, type: "use", effect: "food", val: 25, desc: "恢复 25 饥饿" },
    { name: "熟牛肉", req: { "生牛肉": 1, "煤炭": 1 }, type: "use", effect: "food", val: 40, desc: "恢复 40 饥饿", station: "furnace" },
    { name: "烤猪排", req: { "生猪排": 1, "煤炭": 1 }, type: "use", effect: "food", val: 40, desc: "恢复 40 饥饿", station: "furnace" },
    { name: "金苹果", req: { "苹果": 1, "金锭": 8 }, type: "use", effect: "heal", val: 100, desc: "瞬间恢复 100 HP", station: "workbench" },
    
    // 修复：把烤马铃薯放进数组里面了
    { name: "烤马铃薯", req: { "马铃薯": 1, "煤炭": 1 }, type: "use", effect: "food", val: 35, desc: "恢复 35 饥饿", station: "furnace" }
]; // <--- 修复：这里才是数组闭合的地方

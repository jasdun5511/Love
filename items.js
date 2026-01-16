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

    // --- 新增/修改：自然资源别名 ---
    "橡树": "https://zh.minecraft.wiki/images/Oak.png?cbe39", // 地图上显示为树苗或原木皆可
    "云杉": "https://zh.minecraft.wiki/images/Spruce.png?88690",
    "小麦": "https://zh.minecraft.wiki/images/Wheat_JE2_BE2.png", 

    // 基础资源
    "橡木原木": "https://zh.minecraft.wiki/images/Oak_Log_Axis_Y_JE5_BE3.png?da15a",
    "云杉原木": "https://zh.minecraft.wiki/images/Spruce_Log_Axis_Y_JE5_BE3.png?b2671",
    "木棍": "https://zh.minecraft.wiki/images/Stick_JE1_BE1.png?2ab19",
    "杂草": "https://zh.minecraft.wiki/images/Short_Grass_JE7_BE6.png?f6247", 
    "小麦种子": "https://zh.minecraft.wiki/images/Invicon_Seeds.png?7ea0c",
    "蒲公英": "https://zh.minecraft.wiki/images/Dandelion_JE7_BE4.png?80f41",
    "兰花": "https://zh.minecraft.wiki/images/Blue_Orchid_JE2_BE2.png",
    "蘑菇": "https://zh.minecraft.wiki/images/Red_Mushroom_JE2_BE2.png?d427f",
    "仙人掌": "https://zh.minecraft.wiki/images/Cactus_JE4.png?36286",
    "枯灌木": "https://zh.minecraft.wiki/images/Dead_Bush_JE2_BE2.png",
    "藤蔓": "https://zh.minecraft.wiki/images/Invicon_Vines_BE.png?04711",
    "海带": "https://zh.minecraft.wiki/images/Kelp_JE3_BE2.gif?3b31c",

    // 瓶子系列
    "玻璃瓶": "https://zh.minecraft.wiki/images/Glass_Bottle_JE2_BE2.png",
    "水瓶": "https://zh.minecraft.wiki/images/Water_Bottle_JE2_BE3.png?63599",
    "蜂蜜瓶": "https://zh.minecraft.wiki/images/Honey_Bottle_JE1_BE2.png?865a4",

    // 地形方块
    "石头": "https://zh.minecraft.wiki/images/Stone_JE5_BE3.png",
    "沙子": "https://zh.minecraft.wiki/images/Sand_JE5_BE3.png",
    "红沙": "https://zh.minecraft.wiki/images/Red_Sand_JE3_BE2.png?3c417",
    "粘土": "https://zh.minecraft.wiki/images/Clay_Ball_JE2_BE2.png",
    "冰": "https://zh.minecraft.wiki/images/Ice_JE2_BE3.png?0339d",
    "雪球": "https://zh.minecraft.wiki/images/Snowball_JE3_BE3.png",
    "黑曜石": "https://zh.minecraft.wiki/images/Obsidian_JE3_BE2.png",
    "岩浆源": "https://zh.minecraft.wiki/images/Lava_JE2.png", 
    "水": "https://zh.minecraft.wiki/images/Water_BE_%28animated%29.png?6cf9b",

    // 矿物
    
    "青金石矿": "https://zh.minecraft.wiki/images/Lapis_Lazuli_Ore_JE2_BE2.png",
    "青石矿": "https://zh.minecraft.wiki/images/Lapis_Lazuli_Ore_JE2_BE2.png", // 兼容旧名称
    "青金石": "https://zh.minecraft.wiki/images/Lapis_Lazuli_JE2_BE2.png",

    "煤炭": "https://zh.minecraft.wiki/images/Coal_JE3_BE2.png?b473d",
    "铁矿石": "https://zh.minecraft.wiki/images/Iron_Ore_JE6_BE4.png",
    "铁锭": "https://zh.minecraft.wiki/images/Iron_Ingot_JE3_BE2.png",
    "金矿石": "https://zh.minecraft.wiki/images/Gold_Ore_JE7_BE4.png",
    "金锭": "https://zh.minecraft.wiki/images/Gold_Ingot_JE4_BE2.png",
    "金粒": "https://zh.minecraft.wiki/images/Gold_Nugget_JE3_BE2.png",
    "钻石矿": "https://zh.minecraft.wiki/images/Diamond_Ore_JE5_BE5.png?73a76",
    "钻石": "https://zh.minecraft.wiki/images/Diamond_JE2_BE2.png?36a4d",
    "绿宝石矿": "https://zh.minecraft.wiki/images/Emerald_Ore_JE4_BE3.png",
    "红石": "https://zh.minecraft.wiki/images/Redstone_Dust_JE2_BE2.png",
    "燧石": "https://zh.minecraft.wiki/images/Flint_JE3_BE3.png",
    "远古残骸": "https://zh.minecraft.wiki/w/%E8%BF%9C%E5%8F%A4%E6%AE%8B%E9%AA%B8#/media/File%3AAncient_Debris_JE1_BE1.png",
    "下界合金碎片": "https://zh.minecraft.wiki/images/Netherite_Scrap_JE2_BE2.png",
    "下界合金锭": "https://zh.minecraft.wiki/images/Netherite_Ingot_JE1_BE2.png?df0f5",

    // 生物
    "牛": "https://zh.minecraft.wiki/images/Cow_JE7_BE3.png?682ef",
    "猪": "https://zh.minecraft.wiki/images/Pig_JE3_BE2.png?b39c8",
    "羊": "https://zh.minecraft.wiki/images/White_Sheep_JE5.png?ccbd6",
    "鱿鱼": "https://zh.minecraft.wiki/images/Squid_JE2_BE2.png",
    "僵尸": "https://zh.minecraft.wiki/images/Zombie_JE2_BE2.png?0893d",
    "苦力怕": "https://zh.minecraft.wiki/images/Charged_Creeper_Animated.gif?8f8af",
    "骷髅": "https://zh.minecraft.wiki/images/Skeleton_JE6_BE4.png?9ca7c",
    "蜘蛛": "https://zh.minecraft.wiki/images/thumb/Spider_JE5_BE4.png/1280px-Spider_JE5_BE4.png?6206b",
    "尸壳": "https://zh.minecraft.wiki/images/Husk_JE2_BE2.png",
    "流浪者": "https://zh.minecraft.wiki/images/Stray_JE2_BE4.png?7f6cc",
    "溺尸": "https://zh.minecraft.wiki/images/Drowned_with_Trident.png?ce04b",
    "史莱姆": "https://zh.minecraft.wiki/images/Slime_JE2_BE2.png",
    "女巫": "https://zh.minecraft.wiki/images/Witch_JE4.png?c2f4f",
    "僵尸猪人": "https://zh.minecraft.wiki/images/Zombified_Piglin_JE2_BE2.png",
    "恶魂": "https://zh.minecraft.wiki/images/Ghast_JE2_BE2.png",
    "猪灵": "https://zh.minecraft.wiki/images/Piglin_JE1.png?b639e",
    "疣猪兽": "https://zh.minecraft.wiki/images/Hoglin_JE2.png?a1d9a",
     "烈焰人": "https://zh.minecraft.wiki/images/Blaze_BE.gif?f0c6f", // <--- 之前这里少了 ",
    "岩浆怪": "https://zh.minecraft.wiki/images/Magma_Cube_JE2_BE2.png?38c60",
    // ... 在现有代码下面添加 ...
    "凋零骷髅": "https://zh.minecraft.wiki/images/Wither_Skeleton_JE3_BE2.png",
    "凋零头颅": "https://zh.minecraft.wiki/images/Wither_Skeleton_Skull_%28item%29_JE2_BE2.png",
    "凋灵": "https://zh.minecraft.wiki/images/Wither_JE2_BE2.png",
    "下界之星": "https://zh.minecraft.wiki/images/Nether_Star_JE2_BE2.png",
    "下界要塞": "https://zh.minecraft.wiki/images/Nether_Fortress_JE2_BE2.png", // 地形图标


    // 装备与工具
    "木剑": "https://zh.minecraft.wiki/images/Wooden_Sword_JE2_BE2.png",
    "石剑": "https://zh.minecraft.wiki/images/Stone_Sword_JE2_BE2.png",
    "铁剑": "https://zh.minecraft.wiki/images/Iron_Sword_JE2_BE2.png",
    "钻石剑": "https://zh.minecraft.wiki/images/Diamond_Sword_JE3_BE3.png",
    "下界合金剑": "https://zh.minecraft.wiki/images/Netherite_Sword_JE2_BE2.png",
    "三叉戟": "https://zh.minecraft.wiki/images/Invicon_Trident.png?40406",
    "箭": "https://zh.minecraft.wiki/images/Invicon_Arrow.png?7bab8",
    "打火石": "https://zh.minecraft.wiki/images/Flint_and_Steel_JE4_BE2.png",
    "铁桶": "https://zh.minecraft.wiki/images/Bucket_JE2_BE2.png",
    "岩浆桶": "https://zh.minecraft.wiki/images/Lava_Bucket_JE2_BE2.png",
    "铁盔甲": "https://zh.minecraft.wiki/images/Iron_Chestplate_JE2_BE2.png",
    "钻石盔甲": "https://zh.minecraft.wiki/images/Diamond_Chestplate_JE3_BE2.png?3ec9c",
    "下界合金甲": "https://zh.minecraft.wiki/images/Netherite_Chestplate_JE2_BE1.png?66079",
    "木镐": "https://zh.minecraft.wiki/images/Wooden_Pickaxe_JE3_BE3.png",
    "石镐": "https://zh.minecraft.wiki/images/Stone_Pickaxe_JE2_BE2.png",
    "铁镐": "https://zh.minecraft.wiki/images/Iron_Pickaxe_JE3_BE2.png",
    "钻石镐": "https://zh.minecraft.wiki/images/Diamond_Pickaxe_JE3_BE3.png",
    "盾牌": "https://zh.minecraft.wiki/images/Shield_JE2_BE1.png",


    // 食物与杂项
    "仙人掌果子": "https://stardewvalleywiki.com/mediawiki/images/3/32/Cactus_Fruit.png",
    "魔法糖冰棍": "https://stardewvalleywiki.com/mediawiki/images/2/25/Magic_Rock_Candy.png",
    "谜之炖菜": "https://zh.minecraft.wiki/images/Suspicious_Stew_JE1_BE1.png",
    "生牛肉": "https://zh.minecraft.wiki/images/Raw_Beef_JE3_BE3.png?55e2e",
    "熟牛肉": "https://zh.minecraft.wiki/images/Steak_JE3_BE3.png?0d524",
    "生猪排": "https://zh.minecraft.wiki/images/Raw_Porkchop_JE3_BE3.png?1943a",
    "烤猪排": "https://zh.minecraft.wiki/images/Cooked_Porkchop_JE4_BE3.png",
    "生羊肉": "https://zh.minecraft.wiki/images/Raw_Mutton_JE3_BE2.png",
    "鳕鱼": "https://zh.minecraft.wiki/images/Cod_BE1.gif?ed2b7",
    "苹果": "https://zh.minecraft.wiki/images/Apple_JE3_BE3.png",
    "金苹果": "https://zh.minecraft.wiki/images/Golden_Apple_JE2_BE2.png",
    "面包": "https://zh.minecraft.wiki/images/Bread_JE3_BE3.png",
    "腐肉": "https://zh.minecraft.wiki/images/Rotten_Flesh_JE2_BE2.png",
    "地狱岩": "https://zh.minecraft.wiki/images/Netherrack_JE4_BE2.png",
    "石英矿": "https://zh.minecraft.wiki/images/Nether_Quartz_Ore_JE3_BE2.png",
    "绯红菌柄": "https://zh.minecraft.wiki/images/Crimson_Stem_Axis_Y_JE2_BE1.gif?eb702",
    "地狱疣": "https://zh.minecraft.wiki/images/Invicon_Nether_Wart.png?2605c",
    "萤石": "https://zh.minecraft.wiki/images/Glowstone_JE3_BE2.png",
    "灵魂沙": "https://zh.minecraft.wiki/images/Soul_Sand_JE2_BE2.png?f1135",
    "骨块": "https://zh.minecraft.wiki/images/Bone_Block_JE2_BE2.png",
    "玄武岩": "https://zh.minecraft.wiki/images/Invicon_Basalt.png?94149",
    "黑石": "https://zh.minecraft.wiki/images/Blackstone_JE3_BE2.png?463a4",
    "烈焰棒": "https://zh.minecraft.wiki/images/Blaze_Rod_JE1_BE1.png?d06fc",
    "岩浆膏": "https://zh.minecraft.wiki/images/Blaze_Rod_JE1_BE1.png?d06fc",
    "恶魂之泪": "https://zh.minecraft.wiki/images/Ghast_Tear_JE2_BE2.png",
    "末影珍珠": "https://zh.minecraft.wiki/images/Ender_Pearl_JE2_BE2.png?7d893",
    "火药": "https://zh.minecraft.wiki/images/Gunpowder_JE2_BE2.png",
    "骨头": "https://zh.minecraft.wiki/images/Bone_JE3_BE2.png?b4092",
    "线": "https://zh.minecraft.wiki/images/Invicon_String.png?e7cbf",
    "墨囊": "https://zh.minecraft.wiki/images/Ink_Sac_JE2_BE2.png",
    "粘液球": "https://zh.minecraft.wiki/images/Slimeball_JE2_BE2.png",
    "工作台": "https://zh.minecraft.wiki/images/Crafting_Table_JE4_BE3.png",
    "熔炉": "https://zh.minecraft.wiki/images/Furnace_%28S%29_BE2.png?5793e",
    "下界传送门": "https://zh.minecraft.wiki/images/Nether_portal_%28animated%29.png?441e3",
    "绿宝石": "https://zh.minecraft.wiki/images/Emerald_JE3_BE3.png",
    "马铃薯": "https://zh.minecraft.wiki/images/Potato_JE3_BE2.png",
    "烤马铃薯": "https://zh.minecraft.wiki/images/Baked_Potato_JE4_BE2.png",
    "虞美人": "https://zh.minecraft.wiki/images/Poppy_JE3_BE2.png?d312d",
    "村民": "https://zh.minecraft.wiki/images/Swamp_Farmer_JE1_BE1.png?166dd",
    "铁傀儡": "https://zh.minecraft.wiki/images/Iron_Golem_JE2_BE2.png",
    "掠夺者": "https://zh.minecraft.wiki/images/Pillager_JE3.png?b70ea",
    "卫道士": "https://zh.minecraft.wiki/images/Vindicator_JE2_BE2.png",
    "弩": "https://zh.minecraft.wiki/images/Crossbow_JE2_BE2.png",
    "铁斧": "https://zh.minecraft.wiki/images/Iron_Axe_JE2_BE2.png",
    "简易绷带": "https://zh.minecraft.wiki/images/Paper_JE2_BE2.png",
    // --- 新增：矿井与宝箱 ---
    "矿井": "https://zh.minecraft.wiki/images/Stone_JE5_BE3.png", // 地形图标
    "宝箱": "https://zh.minecraft.wiki/images/Chest_JE2_BE3.gif?4e19c",
    "经验瓶": "https://zh.minecraft.wiki/images/Bottle_o%27_Enchanting.gif?21a90",
    
    // --- 新增：怪物 ---
    "毒蜘蛛": "https://zh.minecraft.wiki/images/Cave_Spider_JE2_BE2.png",
    "末影人": "https://zh.minecraft.wiki/images/Enderman_JE3_BE1.png?b5299",


};

// ==========================================
// 2. 游戏配置 (MAP & BIOMES)
// ==========================================
const MAP_SIZE = 20;

const BIOMES = {
    // 这里的资源已更新为“橡树”、“云杉”、“小麦”
    VILLAGE: { 
        name: "村庄", code: "bg-VILLAGE", 
        res: ["橡树", "小麦", "马铃薯", "虞美人"], 
        mobs: [
            {name:"村民", hp:20, atk:0, loot:"绿宝石"},
            {name:"铁傀儡", hp:80, atk:15, loot:"铁锭"},
            {name:"掠夺者", hp:30, atk:8, loot:"绿宝石"},
            {name:"卫道士", hp:40, atk:12, loot:"绿宝石"}
        ] 
    },
    PLAINS: { name: "平原", code: "bg-PLAINS", res: ["杂草", "小麦", "橡树", "蒲公英"], mobs: [{name:"牛", hp:10, atk:0, loot:"生牛肉"}, {name:"僵尸", hp:20, atk:3, loot:"腐肉"}, {name:"苦力怕", hp:20, atk:15, loot:"火药"}] },
    FOREST: { name: "森林", code: "bg-FOREST", res: ["橡树", "云杉", "木棍", "苹果", "蘑菇"], mobs: [{name:"猪", hp:10, atk:0, loot:"生猪排"}, {name:"骷髅", hp:20, atk:4, loot:"骨头"}, {name:"蜘蛛", hp:16, atk:3, loot:"线"}] },
    DESERT: { name: "沙漠", code: "bg-DESERT", res: ["沙子", "仙人掌", "枯灌木", "岩浆源","仙人掌果子"], mobs: [{name:"尸壳", hp:20, atk:4, loot:"腐肉"}] },
    MOUNTAIN: { name: "山地", code: "bg-MOUNTAIN", res: ["石头", "铁矿石", "煤炭", "绿宝石矿"], mobs: [{name:"羊", hp:8, atk:0, loot:"生羊肉"}] },
    SNOWY: { name: "雪原", code: "bg-SNOWY", res: ["冰", "雪球", "云杉"], mobs: [{name:"流浪者", hp:20, atk:4, loot:"箭"}] },
    OCEAN: { name: "深海", code: "bg-OCEAN", res: ["水", "鳕鱼", "海带"], mobs: [{name:"溺尸", hp:20, atk:5, loot:"三叉戟"}, {name:"鱿鱼", hp:10, atk:0, loot:"墨囊"}] },
    SWAMP: { name: "沼泽", code: "bg-SWAMP", res: ["粘土", "藤蔓", "兰花"], mobs: [{name:"史莱姆", hp:16, atk:2, loot:"粘液球"}, {name:"女巫", hp:26, atk:6, loot:"红石"}] },
    MESA: { name: "恶地", code: "bg-MESA", res: ["红沙", "金矿石", "枯灌木"], mobs: [{name:"蜘蛛", hp:16, atk:3, loot:"线"}] },

    MINE: { 
        name: "矿井", code: "bg-MOUNTAIN", // 复用山地背景色
        res: ["宝箱", "煤炭", "铁矿石", "金矿石", "红石", "钻石矿", "青石矿"], 
        mobs: [
            {name:"毒蜘蛛", hp:30, atk:8, loot:"线"}, // 会中毒
            {name:"僵尸", hp:40, atk:10, loot:"腐肉"}, 
            {name:"骷髅", hp:40, atk:12, loot:"骨头"},
            {name:"苦力怕", hp:30, atk:25, loot:"火药"},
            {name:"末影人", hp:80, atk:20, loot:"末影珍珠"}] },
   
    
    NETHER_WASTES: { 
        name: "荒地", 
        code: "bg-MESA", // 暂时复用恶地的颜色(红褐色)，比较像地狱岩
        res: ["地狱岩", "石英矿", "金粒", "岩浆源", "萤石"], 
        mobs: [
            {name:"僵尸猪人", hp:22, atk:5, loot:"金粒"}, 
            {name:"恶魂", hp:10, atk:10, loot:"火药"},
            {name:"岩浆怪", hp:16, atk:4, loot:"岩浆膏"}
        ] 
    },
    // ... 在 NETHER_WASTES 下面添加 ...
    NETHER_FORTRESS: { 
        name: "要塞", 
        code: "bg-LAVA", // 使用深红色背景
        res: ["下界要塞", "地狱疣", "岩浆源", "宝箱"], 
        mobs: [
            {name:"烈焰人", hp:35, atk:12, loot:"烈焰棒"}, 
            {name:"凋零骷髅", hp:50, atk:18, loot:"凋零头颅"} // 掉落头颅
        ] 
    },

    
    CRIMSON_FOREST: { name: "绯红", code: "bg-CRIMSON", res: ["绯红菌柄", "地狱疣", "萤石"], mobs: [{name:"猪灵", hp:16, atk:6, loot:"金锭"}, {name:"疣猪兽", hp:40, atk:8, loot:"生猪排"}] },
    SOUL_SAND_VALLEY: { name: "灵魂", code: "bg-SOUL", res: ["灵魂沙", "骨块", "玄武岩"], mobs: [{name:"骷髅", hp:20, atk:5, loot:"骨头"}] },
    LAVA_SEA: { name: "熔岩", code: "bg-LAVA", res: ["岩浆源", "黑石", "远古残骸"], mobs: [{name:"烈焰人", hp:20, atk:6, loot:"烈焰棒"}, {name:"岩浆怪", hp:16, atk:4, loot:"岩浆膏"}] }
};

// ==========================================
// 3. 配方表 (RECIPES)
// ==========================================
const RECIPES = [
    // === 建筑类 ===
// 请用这两行替换原来的工作台和熔炉配置：
    { name: "工作台", req: { "原木": 4 }, type: "item", desc: "【被动】放在背包内即可解锁高级合成" }, 
    { name: "熔炉", req: { "石头": 8 }, type: "item", desc: "【被动】放在背包内即可解锁烧炼", station: "workbench" }, 

    { name: "下界传送门", req: { "黑曜石": 10, "打火石": 1 }, type: "build", desc: "放置后点击进入地狱" },

    // === 药水与容器 ===
    { name: "玻璃瓶", req: { "沙子": 3, "煤炭": 1 }, type: "item", desc: "烧制沙子获得", station: "furnace" },
    { name: "水瓶", req: { "玻璃瓶": 1, "雪球": 1 }, type: "use", effect: "drink", val: 10, desc: "雪球融化成水(需熔炉)", station: "furnace" },
    { name: "蜂蜜瓶", req: { "水瓶": 1, "花": 1 }, type: "use", effect: "super_food", val: 30, desc: "花蜜水 (恢复HP和水分)" },

    // === 材料加工 ===
    { name: "木棍", req: { "原木": 2 }, type: "item", desc: "基础材料" }, 
    { name: "铁锭", req: { "铁矿石": 1, "煤炭": 1 }, type: "item", desc: "烧炼铁矿", station: "furnace" },
    { name: "金锭", req: { "金矿石": 1, "煤炭": 1 }, type: "item", desc: "烧炼金矿", station: "furnace" },    
    { name: "下界合金锭", req: { "远古残骸": 1, "金锭": 1 }, type: "item", desc: "顶级材料", station: "workbench" },

    // === 核心工具 ===
    { name: "打火石", req: { "铁锭": 1, "燧石": 1 }, type: "item", desc: "点火工具", station: "workbench" },
    { name: "铁桶", req: { "铁锭": 3 }, type: "item", desc: "装流体用", station: "workbench" },
    

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
        // 在 RECIPES 数组里：
    { name: "铁盔甲", req: { "铁锭": 5 }, type: "equip", effect: "hp_max", val: 50, desc: "生命上限 +50", station: "workbench" },
    { name: "钻石盔甲", req: { "钻石": 5 }, type: "equip", effect: "hp_max", val: 100, desc: "生命上限 +100", station: "workbench" },
    { name: "下界合金甲", req: { "钻石盔甲": 1, "下界合金锭": 1 }, type: "equip", effect: "hp_max", val: 150, desc: "生命上限 +150", station: "workbench" },


    // 在 items.js 的 RECIPES 里加这个：
    { name: "盾牌", req: { "原木": 6, "铁锭": 6 }, type: "item", desc: "25%几率抵挡伤害", station: "workbench" },

    // === 食物 ===
    { name: "面包", req: { "小麦种子": 3 }, type: "use", effect: "food", val: 25, desc: "恢复 25 饥饿" },
    { name: "熟牛肉", req: { "生牛肉": 1, "煤炭": 1 }, type: "use", effect: "food", val: 40, desc: "恢复 40 饥饿", station: "furnace" },
    { name: "烤猪排", req: { "生猪排": 1, "煤炭": 1 }, type: "use", effect: "food", val: 40, desc: "恢复 40 饥饿", station: "furnace" },
    { name: "金苹果", req: { "苹果": 1, "金锭": 8 }, type: "use", effect: "heal", val: 100, desc: "瞬间恢复 100 HP", station: "workbench" },
    { name: "烤马铃薯", req: { "马铃薯": 1, "煤炭": 1 }, type: "use", effect: "food", val: 35, desc: "恢复 35 饥饿", station: "furnace" },
    // === 新增：谜之炖菜 ===
    // 配方1：用蘑菇做 (需熔炉)
    { name: "谜之炖菜", req: { "蘑菇": 6 }, type: "use", desc: "恢复10饥饿和水分", station: "furnace" },
    // 配方2：用仙人掌做 (需熔炉)
    { name: "谜之炖菜", req: { "仙人掌": 6 }, type: "use", desc: "恢复10饥饿和水分", station: "furnace" },
    // === 更新：藤蔓的用途 (调整比例) ===
    // 1. 搓绳子：2个藤蔓 -> 1个线
    { name: "线", req: { "藤蔓": 2 }, type: "item", desc: "手工编织的绳线" },
    
    // 2. 做绷带：4个藤蔓 -> 1个简易绷带
    { name: "简易绷带", req: { "藤蔓": 4 }, type: "use", effect: "heal", val: 15, desc: "止血包扎 (HP +15)" },

{ 
    name: "魔法糖冰棍", 
    req: { "冰": 4 }, 
    type: "use", 
    effect: "magic_candy", // 特殊效果标记
    desc: "充满魔力的五彩糖果。全属性大幅提升！(HP/理智全满 + 攻击力提升)" 
},

    // ... 在 RECIPES 数组末尾添加 ...
    { 
        name: "召唤凋灵", 
        req: { "凋零头颅": 3, "灵魂沙": 4 }, 
        type: "boss", // 标记为特殊类型
        desc: "⚠️ 警告：消耗材料直接召唤BOSS！" 
    },


];


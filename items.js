// === 游戏资源库 (终极完整版) ===
// 包含：导航栏、所有物品、所有生物(Mobs)

const ITEM_ICONS = {
    // ===========================
    // 1. UI 与 导航栏图标
    // ===========================
    "导航_背包": "https://zh.minecraft.wiki/images/Invicon_Chest.png?68094",
    "导航_制作": "https://zh.minecraft.wiki/images/Crafting_Table_JE4_BE3.png",
    "导航_探索": "https://zh.minecraft.wiki/images/Grass_Block_JE7_BE6.png", 
    "导航_地图": "https://zh.minecraft.wiki/images/Invicon_Locked_Map.png?af5e7",   
    "导航_系统": "https://zh.minecraft.wiki/images/Impulse_Command_Block.gif?e65a3", 

    // ===========================
    // 2. 基础资源 & 掉落物
    // ===========================
    // 木材与植物
    "橡木原木": "https://zh.minecraft.wiki/images/Oak_Log_Axis_Y_JE5_BE3.png?da15a",
    "云杉原木": "https://zh.minecraft.wiki/images/Spruce_Log_JE4_BE2.png", // 新增
    "木棍": "https://zh.minecraft.wiki/images/Stick_JE1_BE1.png?2ab19",
    "杂草": "https://zh.minecraft.wiki/images/Grass_JE2_BE2.png", 
    "小麦种子": "https://zh.minecraft.wiki/images/Wheat_Seeds_JE2_BE2.png",
    "蒲公英": "https://zh.minecraft.wiki/images/Dandelion_JE2_BE2.png",
    "蘑菇": "https://zh.minecraft.wiki/images/Red_Mushroom_JE2_BE2.png", // 新增
    "仙人掌": "https://zh.minecraft.wiki/images/Cactus_JE4_BE2.png",
    "枯灌木": "https://zh.minecraft.wiki/images/Dead_Bush_JE2_BE2.png",
    "藤蔓": "https://zh.minecraft.wiki/images/Vines_JE3_BE2.png", // 新增
    "兰花": "https://zh.minecraft.wiki/images/Blue_Orchid_JE2_BE2.png", // 新增
    "海带": "https://zh.minecraft.wiki/images/Kelp_JE2_BE2.png", // 新增

    // 地形方块
    "石头": "https://zh.minecraft.wiki/images/Stone_JE5_BE3.png",
    "沙子": "https://zh.minecraft.wiki/images/Sand_JE5_BE3.png",
    "红沙": "https://zh.minecraft.wiki/images/Red_Sand_JE2_BE2.png", // 新增
    "粘土": "https://zh.minecraft.wiki/images/Clay_Ball_JE2_BE2.png", // 新增
    "冰": "https://zh.minecraft.wiki/images/Ice_JE4_BE2.png",
    "雪球": "https://zh.minecraft.wiki/images/Snowball_JE3_BE3.png",
    "黑曜石": "https://zh.minecraft.wiki/images/Obsidian_JE3_BE2.png",
    "岩浆源": "https://zh.minecraft.wiki/images/Lava_JE2.png", 
    "水": "https://zh.minecraft.wiki/images/Water_Bucket_JE2_BE2.png",

    // ===========================
    // 3. 矿物与珍稀材料
    // ===========================
    "煤炭": "https://zh.minecraft.wiki/images/Coal_JE3_BE2.png?b473d",
    "铁矿石": "https://zh.minecraft.wiki/images/Iron_Ore_JE6_BE4.png",
    "铁锭": "https://zh.minecraft.wiki/images/Iron_Ingot_JE3_BE2.png",
    "金矿石": "https://zh.minecraft.wiki/images/Gold_Ore_JE7_BE4.png",
    "金锭": "https://zh.minecraft.wiki/images/Gold_Ingot_JE4_BE2.png",
    "金粒": "https://zh.minecraft.wiki/images/Gold_Nugget_JE3_BE2.png",
    "钻石矿": "https://zh.minecraft.wiki/images/Diamond_Ore_JE6_BE4.png",
    "钻石": "https://zh.minecraft.wiki/images/Diamond_JE3_BE3.png",
    "绿宝石矿": "https://zh.minecraft.wiki/images/Emerald_Ore_JE4_BE3.png",
    "红石": "https://zh.minecraft.wiki/images/Redstone_Dust_JE2_BE2.png", // 新增
    "燧石": "https://zh.minecraft.wiki/images/Flint_JE3_BE3.png",
    "远古残骸": "https://zh.minecraft.wiki/images/Ancient_Debris_JE2_BE2.png",
    "下界合金碎片": "https://zh.minecraft.wiki/images/Netherite_Scrap_JE2_BE2.png",
    "下界合金锭": "https://zh.minecraft.wiki/images/Netherite_Ingot_JE1_BE1.png",

    // ===========================
    // 4. 生物 (Mobs) - 探索时显示怪物图片！
    // ===========================
    // 主世界 - 友好/中立
    "牛": "https://zh.minecraft.wiki/images/Cow_JE4_BE2.png",
    "猪": "https://zh.minecraft.wiki/images/Pig_JE2_BE2.png",
    "羊": "https://zh.minecraft.wiki/images/Sheep_JE2_BE2.png",
    "鱿鱼": "https://zh.minecraft.wiki/images/Squid_JE2_BE2.png",
    
    // 主世界 - 敌对
    "僵尸": "https://zh.minecraft.wiki/images/Zombie_JE3_BE2.png",
    "狂暴的僵尸": "https://zh.minecraft.wiki/images/Zombie_JE3_BE2.png", // 复用
    "苦力怕": "https://zh.minecraft.wiki/images/Creeper_JE2_BE2.png",
    "狂暴的苦力怕": "https://zh.minecraft.wiki/images/Creeper_JE2_BE2.png",
    "骷髅": "https://zh.minecraft.wiki/images/Skeleton_JE2_BE2.png",
    "蜘蛛": "https://zh.minecraft.wiki/images/Spider_JE2_BE2.png",
    "尸壳": "https://zh.minecraft.wiki/images/Husk_JE2_BE2.png",
    "流浪者": "https://zh.minecraft.wiki/images/Stray_JE2_BE2.png",
    "溺尸": "https://zh.minecraft.wiki/images/Drowned_JE2_BE2.png",
    "史莱姆": "https://zh.minecraft.wiki/images/Slime_JE2_BE2.png",
    "女巫": "https://zh.minecraft.wiki/images/Witch_JE2_BE2.png",

    // 下界生物
    "僵尸猪人": "https://zh.minecraft.wiki/images/Zombified_Piglin_JE2_BE2.png",
    "地狱的僵尸猪人": "https://zh.minecraft.wiki/images/Zombified_Piglin_JE2_BE2.png",
    "恶魂": "https://zh.minecraft.wiki/images/Ghast_JE2_BE2.png",
    "地狱的恶魂": "https://zh.minecraft.wiki/images/Ghast_JE2_BE2.png",
    "猪灵": "https://zh.minecraft.wiki/images/Piglin_JE2_BE2.png",
    "疣猪兽": "https://zh.minecraft.wiki/images/Hoglin_JE2_BE2.png",
    "烈焰人": "https://zh.minecraft.wiki/images/Blaze_JE2_BE2.png",
    "岩浆怪": "https://zh.minecraft.wiki/images/Magma_Cube_JE2_BE2.png",

    // ===========================
    // 5. 装备与工具
    // ===========================
    // 剑
    "木剑": "https://zh.minecraft.wiki/images/Wooden_Sword_JE2_BE2.png",
    "石剑": "https://zh.minecraft.wiki/images/Stone_Sword_JE2_BE2.png",
    "铁剑": "https://zh.minecraft.wiki/images/Iron_Sword_JE2_BE2.png",
    "钻石剑": "https://zh.minecraft.wiki/images/Diamond_Sword_JE3_BE3.png",
    "下界合金剑": "https://zh.minecraft.wiki/images/Netherite_Sword_JE2_BE2.png",
    "三叉戟": "https://zh.minecraft.wiki/images/Trident_JE2_BE1.png", // 新增
    "箭": "https://zh.minecraft.wiki/images/Arrow_JE2_BE2.png", // 新增(流浪者掉落)

    // 工具
    "打火石": "https://zh.minecraft.wiki/images/Flint_and_Steel_JE4_BE2.png",
    "铁桶": "https://zh.minecraft.wiki/images/Bucket_JE2_BE2.png",
    "岩浆桶": "https://zh.minecraft.wiki/images/Lava_Bucket_JE2_BE2.png",

    // 盔甲
    "铁盔甲": "https://zh.minecraft.wiki/images/Iron_Chestplate_JE2_BE2.png",
    "钻石盔甲": "https://zh.minecraft.wiki/images/Diamond_Chestplate_JE3_BE3.png",
    "下界合金甲": "https://zh.minecraft.wiki/images/Netherite_Chestplate_JE2_BE2.png",

    // ===========================
    // 6. 食物与药水
    // ===========================
    "生牛肉": "https://zh.minecraft.wiki/images/Raw_Beef_JE4_BE3.png",
    "熟牛肉": "https://zh.minecraft.wiki/images/Steak_JE4_BE3.png",
    "生猪排": "https://zh.minecraft.wiki/images/Raw_Porkchop_JE4_BE3.png",
    "烤猪排": "https://zh.minecraft.wiki/images/Cooked_Porkchop_JE4_BE3.png",
    "生羊肉": "https://zh.minecraft.wiki/images/Raw_Mutton_JE3_BE2.png", // 新增
    "鳕鱼": "https://zh.minecraft.wiki/images/Raw_Cod_JE4_BE3.png", // 新增
    "苹果": "https://zh.minecraft.wiki/images/Apple_JE3_BE3.png",
    "金苹果": "https://zh.minecraft.wiki/images/Golden_Apple_JE2_BE2.png",
    "面包": "https://zh.minecraft.wiki/images/Bread_JE3_BE3.png",
    "腐肉": "https://zh.minecraft.wiki/images/Rotten_Flesh_JE2_BE2.png",

    // ===========================
    // 7. 下界 & 特殊材料
    // ===========================
    "地狱岩": "https://zh.minecraft.wiki/images/Netherrack_JE4_BE2.png",
    "石英矿": "https://zh.minecraft.wiki/images/Nether_Quartz_Ore_JE3_BE2.png",
    "绯红菌柄": "https://zh.minecraft.wiki/images/Crimson_Stem_JE2_BE2.png", // 新增
    "地狱疣": "https://zh.minecraft.wiki/images/Nether_Wart_JE2_BE2.png", // 新增
    "萤石": "https://zh.minecraft.wiki/images/Glowstone_JE3_BE2.png",
    "灵魂沙": "https://zh.minecraft.wiki/images/Soul_Sand_JE3_BE2.png",
    "骨块": "https://zh.minecraft.wiki/images/Bone_Block_JE2_BE2.png", // 新增
    "玄武岩": "https://zh.minecraft.wiki/images/Basalt_JE2_BE2.png", // 新增
    "黑石": "https://zh.minecraft.wiki/images/Blackstone_JE2_BE2.png", // 新增
    "烈焰棒": "https://zh.minecraft.wiki/images/Blaze_Rod_JE2_BE2.png",
    "岩浆膏": "https://zh.minecraft.wiki/images/Magma_Cream_JE3_BE2.png",
    "恶魂之泪": "https://zh.minecraft.wiki/images/Ghast_Tear_JE2_BE2.png",
    "末影珍珠": "https://zh.minecraft.wiki/images/Ender_Pearl_JE3_BE2.png",
    "火药": "https://zh.minecraft.wiki/images/Gunpowder_JE2_BE2.png",
    "骨头": "https://zh.minecraft.wiki/images/Bone_JE2_BE2.png",
    "线": "https://zh.minecraft.wiki/images/String_JE3_BE3.png",
    "墨囊": "https://zh.minecraft.wiki/images/Ink_Sac_JE2_BE2.png", // 新增
    "粘液球": "https://zh.minecraft.wiki/images/Slimeball_JE2_BE2.png", // 新增

    // ===========================
    // 8. 建筑与设施
    // ===========================
    "工作台": "https://zh.minecraft.wiki/images/Crafting_Table_JE4_BE3.png",
    "熔炉": "https://zh.minecraft.wiki/images/Furnace_%28S%29_BE2.png?5793e",
    "下界传送门": "https://zh.minecraft.wiki/images/Nether_portal_%28animated%29.png?441e3"
};


    // === 镐子 (新增) ===
    "木镐": "https://zh.minecraft.wiki/images/Wooden_Pickaxe_JE3_BE3.png",
    "石镐": "https://zh.minecraft.wiki/images/Stone_Pickaxe_JE2_BE2.png",
    "铁镐": "https://zh.minecraft.wiki/images/Iron_Pickaxe_JE3_BE2.png",
    "钻石镐": "https://zh.minecraft.wiki/images/Diamond_Pickaxe_JE3_BE3.png",

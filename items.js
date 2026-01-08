// === 游戏资源库 ===
// 这里只放图片链接，不放游戏逻辑，方便修改

const ITEM_ICONS = {
    // === 导航栏专用图标 ===
    "导航_背包": "https://zh.minecraft.wiki/images/Chest_JE2_BE3.gif?4e19c",
    "导航_制作": "https://zh.minecraft.wiki/images/Crafting_Table_JE4_BE3.png",
    "导航_探索": "https://zh.minecraft.wiki/images/Grass_Block_JE7_BE6.png", // 草方块代表探索
    "导航_地图": "https://zh.minecraft.wiki/images/Invicon_Locked_Map.png?af5e7",   // 你点名要的地图
    "导航_系统": "https://zh.minecraft.wiki/images/Impulse_Command_Block.gif?e65a3", // 命令方块代表系统
    

    // === 基础资源 ===
    // 橡木原木 (使用立体的物品图标，而非平面纹理)
    "橡木原木": "https://zh.minecraft.wiki/images/Oak_Log_Axis_Y_JE5_BE3.png?da15a",
    "木棍": "https://zh.minecraft.wiki/images/Stick_JE2_BE2.png",
    "石头": "https://zh.minecraft.wiki/images/Stone_JE5_BE3.png",
    "杂草": "https://zh.minecraft.wiki/images/Grass_JE2_BE2.png", 
    "小麦种子": "https://zh.minecraft.wiki/images/Wheat_Seeds_JE2_BE2.png",
    "蒲公英": "https://zh.minecraft.wiki/images/Dandelion_JE2_BE2.png",
    "沙子": "https://zh.minecraft.wiki/images/Sand_JE5_BE3.png",
    "仙人掌": "https://zh.minecraft.wiki/images/Cactus_JE4_BE2.png",
    "枯灌木": "https://zh.minecraft.wiki/images/Dead_Bush_JE2_BE2.png",
    "冰": "https://zh.minecraft.wiki/images/Ice_JE4_BE2.png",
    "雪球": "https://zh.minecraft.wiki/images/Snowball_JE3_BE3.png",
    "水": "https://zh.minecraft.wiki/images/Water_Bucket_JE2_BE2.png",

    // === 矿物 ===
    "煤炭": "https://zh.minecraft.wiki/images/Coal_JE4_BE3.png",
    "铁矿石": "https://zh.minecraft.wiki/images/Iron_Ore_JE6_BE4.png",
    "铁锭": "https://zh.minecraft.wiki/images/Iron_Ingot_JE3_BE2.png",
    "金矿石": "https://zh.minecraft.wiki/images/Gold_Ore_JE7_BE4.png",
    "金锭": "https://zh.minecraft.wiki/images/Gold_Ingot_JE4_BE2.png",
    "金粒": "https://zh.minecraft.wiki/images/Gold_Nugget_JE3_BE2.png",
    "钻石矿": "https://zh.minecraft.wiki/images/Diamond_Ore_JE6_BE4.png",
    "钻石": "https://zh.minecraft.wiki/images/Diamond_JE3_BE3.png",
    "绿宝石矿": "https://zh.minecraft.wiki/images/Emerald_Ore_JE4_BE3.png",
    "燧石": "https://zh.minecraft.wiki/images/Flint_JE3_BE3.png",
    "黑曜石": "https://zh.minecraft.wiki/images/Obsidian_JE3_BE2.png",
    "远古残骸": "https://zh.minecraft.wiki/images/Ancient_Debris_JE2_BE2.png",
    "下界合金碎片": "https://zh.minecraft.wiki/images/Netherite_Scrap_JE2_BE2.png",
    "下界合金锭": "https://zh.minecraft.wiki/images/Netherite_Ingot_JE1_BE1.png",

    // === 工具与武器 ===
    "木剑": "https://zh.minecraft.wiki/images/Wooden_Sword_JE2_BE2.png",
    "石剑": "https://zh.minecraft.wiki/images/Stone_Sword_JE2_BE2.png",
    "铁剑": "https://zh.minecraft.wiki/images/Iron_Sword_JE2_BE2.png",
    "钻石剑": "https://zh.minecraft.wiki/images/Diamond_Sword_JE3_BE3.png",
    "下界合金剑": "https://zh.minecraft.wiki/images/Netherite_Sword_JE2_BE2.png",
    "打火石": "https://zh.minecraft.wiki/images/Flint_and_Steel_JE4_BE2.png",
    "铁桶": "https://zh.minecraft.wiki/images/Bucket_JE2_BE2.png",
    "岩浆桶": "https://zh.minecraft.wiki/images/Lava_Bucket_JE2_BE2.png",

    // === 防具 ===
    "铁盔甲": "https://zh.minecraft.wiki/images/Iron_Chestplate_JE2_BE2.png",
    "钻石盔甲": "https://zh.minecraft.wiki/images/Diamond_Chestplate_JE3_BE3.png",
    "下界合金甲": "https://zh.minecraft.wiki/images/Netherite_Chestplate_JE2_BE2.png",

    // === 食物 ===
    "生牛肉": "https://zh.minecraft.wiki/images/Raw_Beef_JE4_BE3.png",
    "熟牛肉": "https://zh.minecraft.wiki/images/Steak_JE4_BE3.png",
    "生猪排": "https://zh.minecraft.wiki/images/Raw_Porkchop_JE4_BE3.png",
    "烤猪排": "https://zh.minecraft.wiki/images/Cooked_Porkchop_JE4_BE3.png",
    "苹果": "https://zh.minecraft.wiki/images/Apple_JE3_BE3.png",
    "金苹果": "https://zh.minecraft.wiki/images/Golden_Apple_JE2_BE2.png",
    "面包": "https://zh.minecraft.wiki/images/Bread_JE3_BE3.png",
    "腐肉": "https://zh.minecraft.wiki/images/Rotten_Flesh_JE2_BE2.png",

    // === 下界特产 ===
    "地狱岩": "https://zh.minecraft.wiki/images/Netherrack_JE4_BE2.png",
    "石英矿": "https://zh.minecraft.wiki/images/Nether_Quartz_Ore_JE3_BE2.png",
    "岩浆源": "https://zh.minecraft.wiki/images/Lava_JE2.png",
    "萤石": "https://zh.minecraft.wiki/images/Glowstone_JE3_BE2.png",
    "灵魂沙": "https://zh.minecraft.wiki/images/Soul_Sand_JE3_BE2.png",
    "烈焰棒": "https://zh.minecraft.wiki/images/Blaze_Rod_JE2_BE2.png",
    "岩浆膏": "https://zh.minecraft.wiki/images/Magma_Cream_JE3_BE2.png",
    "恶魂之泪": "https://zh.minecraft.wiki/images/Ghast_Tear_JE2_BE2.png",
    "末影珍珠": "https://zh.minecraft.wiki/images/Ender_Pearl_JE3_BE2.png",
    "火药": "https://zh.minecraft.wiki/images/Gunpowder_JE2_BE2.png",
    "骨头": "https://zh.minecraft.wiki/images/Bone_JE2_BE2.png",
    "线": "https://zh.minecraft.wiki/images/String_JE3_BE3.png",

    // === 建筑 ===
    "工作台": "https://zh.minecraft.wiki/images/Crafting_Table_JE4_BE3.png",
    "熔炉": "https://zh.minecraft.wiki/images/Furnace_%28S%29_BE2.png?5793e",
    "下界传送门": "https://zh.minecraft.wiki/images/Nether_portal_%28animated%29.png?441e3"
};

const fs = require("fs");
const path = require("path");

// 读取 dict.md
const dictMdPath = path.join(__dirname, "../public/dict/dict.md");
const dictMd = fs.readFileSync(dictMdPath, "utf-8");

const phrasesData = {
  greeting: [],
  daily: [],
  travel: [],
  dining: [],
};

// 分类映射
const categoryMap = {
  "一、日常问候与礼貌用语": "greeting",
  "二、日常生活用语": "daily",
  "三、旅行用语": "travel",
  "四、饮食用语": "dining",
};

const categoryNames = {
  greeting: "问候语",
  daily: "日常用语",
  travel: "旅行用语",
  dining: "饮食用语",
};

console.log("从 dict.md 提取句子...\n");

const lines = dictMd.split("\n");
let currentCategory = null;
let idCounter = {
  greeting: 1,
  daily: 1,
  travel: 1,
  dining: 1,
};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  // 检查是否是分类标题
  for (const [title, category] of Object.entries(categoryMap)) {
    if (line.includes(title)) {
      currentCategory = category;
      console.log(`找到分类: ${title} -> ${category}`);
      break;
    }
  }

  // 解析表格行
  if (
    currentCategory &&
    line.startsWith("|") &&
    !line.startsWith("| ---") &&
    line.includes("|")
  ) {
    const parts = line
      .split("|")
      .map((p) => p.trim())
      .filter((p) => p);

    // 格式：| 写法 | 平假名 | 罗马字 | 中文意思 |
    // 或者：| 写法 | 罗马字 | 中文意思 | (没有平假名列)
    if (parts.length >= 3) {
      const japanese = parts[0];
      let romaji, chinese;

      // 跳过表头
      if (japanese === "写法" || japanese.includes("写法") || !japanese)
        continue;

      // 判断格式
      if (parts.length === 4) {
        // 有平假名列：写法 | 平假名 | 罗马字 | 中文意思
        romaji = parts[2];
        chinese = parts[3];
      } else {
        // 没有平假名列：写法 | 罗马字 | 中文意思
        romaji = parts[1];
        chinese = parts[2];
      }

      // 验证数据有效性
      if (japanese && romaji && chinese && japanese.length > 1) {
        const id = `${currentCategory}_${String(
          idCounter[currentCategory]
        ).padStart(3, "0")}`;
        idCounter[currentCategory]++;

        phrasesData[currentCategory].push({
          japanese,
          romaji,
          chinese,
          category: currentCategory,
        });
      }
    }
  }
}

// 输出统计
console.log("\n提取统计:");
for (const [category, phrases] of Object.entries(phrasesData)) {
  console.log(`  - ${categoryNames[category]}: ${phrases.length} 条`);
}

const total = Object.values(phrasesData).reduce(
  (sum, arr) => sum + arr.length,
  0
);
console.log(`  - 总计: ${total} 条`);

// 写入 phrases.json
const outputPath = path.join(__dirname, "../public/dict/phrases.json");
fs.writeFileSync(outputPath, JSON.stringify(phrasesData, null, 2), "utf-8");

console.log(`\n✓ 句子迁移完成`);
console.log(`  - 输出: ${outputPath}`);
console.log(`\n示例句子 (greeting):`);
console.log(JSON.stringify(phrasesData.greeting.slice(0, 3), null, 2));

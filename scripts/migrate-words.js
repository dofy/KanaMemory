const fs = require("fs");
const path = require("path");

// 读取现有的 words.json
const wordsJsonPath = path.join(__dirname, "../public/dict/words.json");
const dictMdPath = path.join(__dirname, "../public/dict/dict.md");

const wordsJson = JSON.parse(fs.readFileSync(wordsJsonPath, "utf-8"));
const dictMd = fs.readFileSync(dictMdPath, "utf-8");

const wordsMap = new Map(); // 用于去重

// 提取声调的正则
const pitchPattern = /[①②③④⑤⑥⑦⑧⑨⓪]+/g;

// 处理现有 words.json 中的单词
console.log("处理现有 words.json 中的单词...");
for (const row in wordsJson) {
  wordsJson[row].forEach((word) => {
    // 提取声调
    const hiraganaMatch = word.hiragana.match(pitchPattern);
    const katakanaMatch = word.katakana.match(pitchPattern);

    const pitch = hiraganaMatch ? hiraganaMatch.join("") : "";
    const hiragana = word.hiragana.replace(pitchPattern, "");
    const katakana = word.katakana.replace(pitchPattern, "");

    const key = `${hiragana}|${katakana}|${word.kanji}`;

    if (!wordsMap.has(key)) {
      wordsMap.set(key, {
        hiragana,
        katakana,
        romaji: "", // 暂时为空，后续从 dict.md 填充
        kanji: word.kanji,
        chinese: word.chinese,
        pitch,
      });
    }
  });
}

console.log(`从 words.json 提取了 ${wordsMap.size} 个单词`);

// 从 dict.md 提取单词（第 7-206 行）
console.log("\n从 dict.md 提取单词...");
const lines = dictMd.split("\n");
let extracted = 0;
const dictWordsSet = new Set(); // 用于跟踪 dict.md 中的单词

for (let i = 6; i < Math.min(206, lines.length); i++) {
  const line = lines[i];
  if (!line || !line.startsWith("|") || line.startsWith("| ---")) continue;

  // 解析表格行：| 平假名 | 片假名 | 罗马字 | 声调 | 意思 |
  const parts = line
    .split("|")
    .map((p) => p.trim())
    .filter((p) => p);
  if (parts.length >= 5) {
    const hiragana = parts[0];
    const katakana = parts[1];
    const romaji = parts[2];
    const pitch = parts[3];
    const chinese = parts[4];

    // 跳过表头
    if (hiragana === "平假名" || !hiragana) continue;

    const key = `${hiragana}|${katakana}|${hiragana}`;
    dictWordsSet.add(key);

    // 查找匹配的单词并更新罗马音
    let found = false;
    for (const [existingKey, word] of wordsMap) {
      if (existingKey === key) {
        word.romaji = romaji;
        // 如果 pitch 为空，从 dict.md 中补充
        if (!word.pitch) {
          word.pitch = pitch;
        }
        found = true;
        extracted++;
        break;
      }
    }

    // 如果不存在，添加新单词（dict.md 中的纯假名单词）
    if (!found) {
      wordsMap.set(key, {
        hiragana,
        katakana,
        romaji,
        kanji: hiragana, // 使用假名作为汉字
        chinese,
        pitch,
      });
      extracted++;
    }
  }
}

console.log(`从 dict.md 提取并合并了 ${extracted} 个单词记录`);

// 为现有单词生成罗马音（如果还没有）
console.log("\n为现有单词生成罗马音...");
let generatedRomaji = 0;
for (const word of wordsMap.values()) {
  if (!word.romaji && word.hiragana) {
    // 简单的假名转罗马音映射
    word.romaji = generateRomaji(word.hiragana);
    generatedRomaji++;
  }
}

console.log(`为 ${generatedRomaji} 个单词生成了罗马音`);

function generateRomaji(hiragana) {
  // 简单的映射，移除声调标记后转换
  const clean = hiragana.replace(/[①②③④⑤⑥⑦⑧⑨⓪]/g, "");
  const map = {
    あ: "a",
    い: "i",
    う: "u",
    え: "e",
    お: "o",
    か: "ka",
    き: "ki",
    く: "ku",
    け: "ke",
    こ: "ko",
    さ: "sa",
    し: "shi",
    す: "su",
    せ: "se",
    そ: "so",
    た: "ta",
    ち: "chi",
    つ: "tsu",
    て: "te",
    と: "to",
    な: "na",
    に: "ni",
    ぬ: "nu",
    ね: "ne",
    の: "no",
    は: "ha",
    ひ: "hi",
    ふ: "fu",
    へ: "he",
    ほ: "ho",
    ま: "ma",
    み: "mi",
    む: "mu",
    め: "me",
    も: "mo",
    や: "ya",
    ゆ: "yu",
    よ: "yo",
    ら: "ra",
    り: "ri",
    る: "ru",
    れ: "re",
    ろ: "ro",
    わ: "wa",
    を: "wo",
    ん: "n",
  };

  let result = "";
  for (const char of clean) {
    result += map[char] || char;
  }
  return result || "unknown";
}

// 转换为数组并排序
const wordsArray = Array.from(wordsMap.values())
  .filter((w) => w.romaji) // 只保留有罗马音的单词
  .sort((a, b) => a.romaji.localeCompare(b.romaji));

// 写入新的 words.json
const outputPath = path.join(__dirname, "../public/dict/words.json");
fs.writeFileSync(outputPath, JSON.stringify(wordsArray, null, 2), "utf-8");

console.log(`\n✓ 单词迁移完成`);
console.log(`  - 总计: ${wordsArray.length} 个单词`);
console.log(`  - 输出: ${outputPath}`);
console.log(`\n示例单词:`);
console.log(JSON.stringify(wordsArray.slice(0, 3), null, 2));

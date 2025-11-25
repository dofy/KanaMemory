import { FYType, type MemoObject } from "./types";
import { DataLoader } from "./data-loader";

export class KanaData {
  // Load kana data from JSON (async)
  public async getJP50Async(): Promise<MemoObject[]> {
    return await DataLoader.loadKanaData();
  }

  // Synchronous method for backward compatibility
  // This will be deprecated - use getJP50Async instead
  public getJP50(): MemoObject[] {
    const result: MemoObject[] = [];

    // 清音
    result.push({
      id: "a",
      displayText: "あ",
      displayText2: "ア",
      remind: "a",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "i",
      displayText: "い",
      displayText2: "イ",
      remind: "i",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "u",
      displayText: "う",
      displayText2: "ウ",
      remind: "u",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "e",
      displayText: "え",
      displayText2: "エ",
      remind: "e",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "o",
      displayText: "お",
      displayText2: "オ",
      remind: "o",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "ka",
      displayText: "か",
      displayText2: "カ",
      remind: "ka",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "ki",
      displayText: "き",
      displayText2: "キ",
      remind: "ki",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "ku",
      displayText: "く",
      displayText2: "ク",
      remind: "ku",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "ke",
      displayText: "け",
      displayText2: "ケ",
      remind: "ke",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "ko",
      displayText: "こ",
      displayText2: "コ",
      remind: "ko",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "sa",
      displayText: "さ",
      displayText2: "サ",
      remind: "sa",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "si",
      displayText: "し",
      displayText2: "シ",
      remind: "shi",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "su",
      displayText: "す",
      displayText2: "ス",
      remind: "su",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "se",
      displayText: "せ",
      displayText2: "セ",
      remind: "se",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "so",
      displayText: "そ",
      displayText2: "ソ",
      remind: "so",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "ta",
      displayText: "た",
      displayText2: "タ",
      remind: "ta",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "ci",
      displayText: "ち",
      displayText2: "チ",
      remind: "chi",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "cu",
      displayText: "つ",
      displayText2: "ツ",
      remind: "tsu",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "te",
      displayText: "て",
      displayText2: "テ",
      remind: "te",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "to",
      displayText: "と",
      displayText2: "ト",
      remind: "to",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "na",
      displayText: "な",
      displayText2: "ナ",
      remind: "na",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "ni",
      displayText: "に",
      displayText2: "ニ",
      remind: "ni",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "nu",
      displayText: "ぬ",
      displayText2: "ヌ",
      remind: "nu",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "ne",
      displayText: "ね",
      displayText2: "ネ",
      remind: "ne",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "no",
      displayText: "の",
      displayText2: "ノ",
      remind: "no",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "ha",
      displayText: "は",
      displayText2: "ハ",
      remind: "ha",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "hi",
      displayText: "ひ",
      displayText2: "ヒ",
      remind: "hi",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "hu",
      displayText: "ふ",
      displayText2: "フ",
      remind: "fu",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "he",
      displayText: "へ",
      displayText2: "ヘ",
      remind: "he",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "ho",
      displayText: "ほ",
      displayText2: "ホ",
      remind: "ho",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "ma",
      displayText: "ま",
      displayText2: "マ",
      remind: "ma",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "mi",
      displayText: "み",
      displayText2: "ミ",
      remind: "mi",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "mu",
      displayText: "む",
      displayText2: "ム",
      remind: "mu",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "me",
      displayText: "め",
      displayText2: "メ",
      remind: "me",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "mo",
      displayText: "も",
      displayText2: "モ",
      remind: "mo",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "ya",
      displayText: "や",
      displayText2: "ヤ",
      remind: "ya",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "yu",
      displayText: "ゆ",
      displayText2: "ユ",
      remind: "yu",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "yo",
      displayText: "よ",
      displayText2: "ヨ",
      remind: "yo",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "ra",
      displayText: "ら",
      displayText2: "ラ",
      remind: "ra",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "ri",
      displayText: "り",
      displayText2: "リ",
      remind: "ri",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "ru",
      displayText: "る",
      displayText2: "ル",
      remind: "ru",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "re",
      displayText: "れ",
      displayText2: "レ",
      remind: "re",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "ro",
      displayText: "ろ",
      displayText2: "ロ",
      remind: "ro",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "wa",
      displayText: "わ",
      displayText2: "ワ",
      remind: "wa",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "wo",
      displayText: "を",
      displayText2: "ヲ",
      remind: "wo",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });
    result.push({
      id: "n",
      displayText: "ん",
      displayText2: "ン",
      remind: "n",
      fyType: FYType.seion,
      selected: true,
      labels: [],
    });

    // 浊音
    result.push({
      id: "ga",
      displayText: "が",
      displayText2: "ガ",
      remind: "ga",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "gi",
      displayText: "ぎ",
      displayText2: "ギ",
      remind: "gi",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "gu",
      displayText: "ぐ",
      displayText2: "グ",
      remind: "gu",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "ge",
      displayText: "げ",
      displayText2: "ゲ",
      remind: "ge",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "go",
      displayText: "ご",
      displayText2: "ゴ",
      remind: "go",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });

    result.push({
      id: "za",
      displayText: "ざ",
      displayText2: "ザ",
      remind: "za",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "zi",
      displayText: "じ",
      displayText2: "ジ",
      remind: "ji",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "zu",
      displayText: "ず",
      displayText2: "ズ",
      remind: "zu",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "ze",
      displayText: "ぜ",
      displayText2: "ゼ",
      remind: "ze",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "zo",
      displayText: "ぞ",
      displayText2: "ゾ",
      remind: "zo",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });

    result.push({
      id: "da",
      displayText: "だ",
      displayText2: "ダ",
      remind: "da",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "di",
      displayText: "ぢ",
      displayText2: "ヂ",
      remind: "ji",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "du",
      displayText: "づ",
      displayText2: "ヅ",
      remind: "zu",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "de",
      displayText: "で",
      displayText2: "デ",
      remind: "de",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "do",
      displayText: "ど",
      displayText2: "ド",
      remind: "do",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });

    result.push({
      id: "ba",
      displayText: "ば",
      displayText2: "バ",
      remind: "ba",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "bi",
      displayText: "び",
      displayText2: "ビ",
      remind: "bi",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "bu",
      displayText: "ぶ",
      displayText2: "ブ",
      remind: "bu",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "be",
      displayText: "べ",
      displayText2: "ベ",
      remind: "be",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "bo",
      displayText: "ぼ",
      displayText2: "ボ",
      remind: "bo",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });

    result.push({
      id: "pa",
      displayText: "ぱ",
      displayText2: "パ",
      remind: "pa",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "pi",
      displayText: "ぴ",
      displayText2: "ピ",
      remind: "pi",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "pu",
      displayText: "ぷ",
      displayText2: "プ",
      remind: "pu",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "pe",
      displayText: "ぺ",
      displayText2: "ペ",
      remind: "pe",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "po",
      displayText: "ぽ",
      displayText2: "ポ",
      remind: "po",
      fyType: FYType.dakuon,
      selected: false,
      labels: [],
    });

    // 拗音
    result.push({
      id: "kya",
      displayText: "きゃ",
      displayText2: "キャ",
      remind: "kya",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "kyu",
      displayText: "きゅ",
      displayText2: "キュ",
      remind: "kyu",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "kyo",
      displayText: "きょ",
      displayText2: "キョ",
      remind: "kyo",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });

    result.push({
      id: "sya",
      displayText: "しゃ",
      displayText2: "シャ",
      remind: "sha",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "syu",
      displayText: "しゅ",
      displayText2: "シュ",
      remind: "shu",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "syo",
      displayText: "しょ",
      displayText2: "ショ",
      remind: "sho",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });

    result.push({
      id: "cya",
      displayText: "ちゃ",
      displayText2: "チャ",
      remind: "cha",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "cyu",
      displayText: "ちゅ",
      displayText2: "チュ",
      remind: "chu",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "cyo",
      displayText: "ちょ",
      displayText2: "チョ",
      remind: "cho",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });

    result.push({
      id: "nya",
      displayText: "にゃ",
      displayText2: "ニャ",
      remind: "nya",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "nyu",
      displayText: "にゅ",
      displayText2: "ニュ",
      remind: "nyu",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "nyo",
      displayText: "にょ",
      displayText2: "ニョ",
      remind: "nyo",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });

    result.push({
      id: "hya",
      displayText: "ひゃ",
      displayText2: "ヒャ",
      remind: "hya",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "hyu",
      displayText: "ひゅ",
      displayText2: "ヒョ",
      remind: "hyu",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "hyo",
      displayText: "ひょ",
      displayText2: "ヒョ",
      remind: "hyo",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });

    result.push({
      id: "mya",
      displayText: "みゃ",
      displayText2: "ミャ",
      remind: "mya",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "myu",
      displayText: "みゅ",
      displayText2: "ミュ",
      remind: "myu",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "myo",
      displayText: "みょ",
      displayText2: "ミョ",
      remind: "myo",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });

    result.push({
      id: "rya",
      displayText: "りゃ",
      displayText2: "リャ",
      remind: "rya",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "ryu",
      displayText: "りゅ",
      displayText2: "リュ",
      remind: "ryu",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "ryo",
      displayText: "りょ",
      displayText2: "リョ",
      remind: "ryo",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });

    result.push({
      id: "gya",
      displayText: "ぎゃ",
      displayText2: "ギャ",
      remind: "gya",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "gyu",
      displayText: "ぎゅ",
      displayText2: "ギュ",
      remind: "gyu",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "gyo",
      displayText: "ぎょ",
      displayText2: "ギョ",
      remind: "gyo",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });

    result.push({
      id: "zya",
      displayText: "じゃ",
      displayText2: "ジャ",
      remind: "ja",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "zyu",
      displayText: "じゅ",
      displayText2: "ジュ",
      remind: "ju",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "zyo",
      displayText: "じょ",
      displayText2: "ジョ",
      remind: "jo",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });

    result.push({
      id: "bya",
      displayText: "びゃ",
      displayText2: "ビャ",
      remind: "bya",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "byu",
      displayText: "びゅ",
      displayText2: "ビュ",
      remind: "byu",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "byo",
      displayText: "びょ",
      displayText2: "ビョ",
      remind: "byo",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });

    result.push({
      id: "pya",
      displayText: "ぴゃ",
      displayText2: "ピャ",
      remind: "pya",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "pyu",
      displayText: "ぴゅ",
      displayText2: "ピュ",
      remind: "pyu",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });
    result.push({
      id: "pyo",
      displayText: "ぴょ",
      displayText2: "ピョ",
      remind: "pyo",
      fyType: FYType.yoon,
      selected: false,
      labels: [],
    });

    return result;
  }
}

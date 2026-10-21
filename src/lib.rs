use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use rand::Rng;

// تعريف هيكل اللغز
#[derive(Serialize, Deserialize)]
pub struct PuzzleConfig {
    pub inputs: Vec<InputConfig>,
}

#[derive(Serialize, Deserialize)]
pub struct InputConfig {
    pub name: String,
    pub label: String,
    pub icon: String,
    pub placeholder: String,
}

#[derive(Serialize, Deserialize)]
pub struct Puzzle {
    pub id: String,
    pub category: String,
    pub title: String,
    pub prompt: String,
    pub interaction_type: String,
    pub config: PuzzleConfig,
    pub correct_answer: serde_json::Value,
    pub explanation: String,
}

// 1. مولد لغز مزرعة الحيوانات (التوليد العكسي)
#[wasm_bindgen]
pub fn generate_animal_puzzle() -> JsValue {
    let mut rng = rand::thread_rng();

    // التوليد العكسي: البدء بالإجابة الصحيحة أولاً
    let chickens: u32 = rng.gen_range(2..=7);
    let mut ducks: u32 = rng.gen_range(2..=7);
    let rabbits: u32 = rng.gen_range(1..=4);

    // إصلاح هندسي: إجبار المحرك على اختيار أرقام مختلفة حتى لا يكون الفرق صفراً
    while ducks == chickens {
        ducks = rng.gen_range(2..=7);
    }

    let total_legs = (chickens * 2) + (ducks * 2) + (rabbits * 4);
    let diff_duck_chicken = (chickens as i32 - ducks as i32).abs();
    let sum_chicken_rabbit = chickens + rabbits;

    // إصلاح لغوي: توضيح الاتجاه بدلاً من كلمة "الفرق" المبهمة
    let prompt = format!(
        "في مزرعة ذكية تضم دجاجاً، بطاً، وأرانب:\n\
         • عدد الدجاج يزيد عن عدد البط بمقدار {}.\n\
         • مجموع عدد الدجاج والأرانب يساوي {}.\n\
         • إجمالي عدد الأرجل لكل الحيوانات هو {} رجلاً.\n\
         فما هو عدد كل حيوان بدقة؟",
        diff_duck_chicken, sum_chicken_rabbit, total_legs
    );

    let puzzle = Puzzle {
        id: format!("animal_{}", rng.gen::<u64>()),
        category: "المنطق الجبري".to_string(),
        title: "لغز المزرعة الذكية (Rust WASM)".to_string(),
        prompt,
        interaction_type: "multi_input".to_string(),
        config: PuzzleConfig {
            inputs: vec![
                InputConfig { name: "chickens".into(), label: "الدجاج".into(), icon: "🐔".into(), placeholder: "عدد الدجاج".into() },
                InputConfig { name: "ducks".into(), label: "البط".into(), icon: "🦆".into(), placeholder: "عدد البط".into() },
                InputConfig { name: "rabbits".into(), label: "الأرانب".into(), icon: "🐇".into(), placeholder: "عدد الأرانب".into() },
            ],
        },
        correct_answer: serde_json::json!({
            "chickens": chickens,
            "ducks": ducks,
            "rabbits": rabbits
        }),
        explanation: format!(
            "الحل: الدجاج = {}، البط = {}، الأرانب = {}.\n\
             التحقق: ({}×2) + ({}×2) + ({}×4) = {} رجلاً.",
            chickens, ducks, rabbits, chickens, ducks, rabbits, total_legs
        ),
    };

    serde_wasm_bindgen::to_value(&puzzle).unwrap()
}

// 2. مولد لغز السلاسل العددية
#[wasm_bindgen]
pub fn generate_sequence_puzzle() -> JsValue {
    let mut rng = rand::thread_rng();

    let start: i32 = rng.gen_range(1..=5);
    let step: i32 = rng.gen_range(2..=4);

    let mut seq = vec![start];
    let mut current = start;

    for i in 1..=4 {
        current += step + (i * 2);
        seq.push(current);
    }

    let correct_answer = current + step + (5 * 2);

    let prompt = format!(
        "اكتشف النمط الرياضي وأوجد الرقم المفقود:\n{}, {}, {}, {}, {}, ؟",
        seq[0], seq[1], seq[2], seq[3], seq[4]
    );

    let puzzle = Puzzle {
        id: format!("seq_{}", rng.gen::<u64>()),
        category: "الذكاء العددي".to_string(),
        title: "سلسلة الأرقام (Rust WASM)".to_string(),
        prompt,
        interaction_type: "single_input".to_string(),
        config: PuzzleConfig { inputs: vec![] },
        correct_answer: serde_json::json!(correct_answer),
        explanation: format!("القاعدة تعتمد على إضافة فروق متزايدة بمقدار 2. الرقم المفقود هو {}.", correct_answer),
    };

    serde_wasm_bindgen::to_value(&puzzle).unwrap()
}
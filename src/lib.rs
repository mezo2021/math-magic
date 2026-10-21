use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use rand::{Rng, SeedableRng};
use rand_chacha::ChaCha8Rng; 
use serde_json::json;

#[derive(Serialize, Deserialize)]
pub struct PuzzlePublic {
    pub challenge_id: u64,
    pub title: String,
    pub description: String,
    pub interaction_type: String,
    pub options: Vec<serde_json::Value>, 
}

#[wasm_bindgen]
pub fn generate_puzzle(seed: u64) -> JsValue {
    let mut rng = ChaCha8Rng::seed_from_u64(seed);
    
    // اختيار نوع اللغز: 0 = مزرعة، 1 = مسافة، 2 = متتالية
    let puzzle_type = rng.gen_range(0..3);

    if puzzle_type == 0 {
        // --- 1. لغز المزرعة (نصف وربع) ---
        let base_ducks = (rng.gen_range(1..=4)) * 4; 
        let chickens = base_ducks * 2;
        let rabbits = base_ducks / 4;
        let missing_chickens = chickens - (base_ducks + rabbits);

        let prompt = format!(
            "هل يمكنك استنباط عدد البط والدجاج والأرانب في ضوء المعلومات التالية:\n\
             أولاً: عدد البط = نصف عدد الدجاج.\n\
             ثانياً: عدد الأرانب = ربع عدد البط.\n\
             ثالثاً: مجموع عدد الأرانب والبط = عدد الدجاج ناقصاً منه {} دجاجات.",
            missing_chickens
        );

        let puzzle = PuzzlePublic {
            challenge_id: seed,
            title: "لغز المزرعة (منسا)".to_string(),
            description: prompt,
            interaction_type: "multi_input_animals".to_string(), 
            options: vec![],
        };
        serde_wasm_bindgen::to_value(&puzzle).unwrap()
    } else if puzzle_type == 1 {
        // --- 2. لغز المسافة (الفخ المنطقي) ---
        let distance = rng.gen_range(15..=50);
        let prompt = format!(
            "المسافة بين مدينتي الكويت والأحمدي {} كم. إذا قطعتها مرتين ذهاباً وإياباً، فكم تكون المسافة بين البلدين؟", 
            distance
        );
        
        let options = vec![
            json!({"id": "A", "text": format!("{} كم", distance * 2)}),
            json!({"id": "B", "text": format!("{} كم", distance)}), 
            json!({"id": "C", "text": "صفر"}),
            json!({"id": "D", "text": format!("{} كم", distance * 4)}),
        ];

        let puzzle = PuzzlePublic {
            challenge_id: seed,
            title: "الفخ المنطقي".to_string(),
            description: prompt,
            interaction_type: "multiple_choice".to_string(),
            options,
        };
        serde_wasm_bindgen::to_value(&puzzle).unwrap()
    } else {
        // --- 3. لغز المتتالية العددية ---
        let start: i32 = rng.gen_range(1..=10);
        let step: i32 = rng.gen_range(2..=6);
        
        let seq: Vec<i32> = (0..5).map(|i| start + i * step).collect();
        let correct_answer = start + 5 * step;

        let prompt = format!(
            "اكتشف النمط الرياضي وأوجد الرقم المفقود:\n{} ، {} ، {} ، {} ، {} ، ؟",
            seq[0], seq[1], seq[2], seq[3], seq[4]
        );

        let puzzle = PuzzlePublic {
            challenge_id: seed,
            title: "الذكاء العددي".to_string(),
            description: prompt,
            interaction_type: "single_input".to_string(),
            options: vec![],
        };
        serde_wasm_bindgen::to_value(&puzzle).unwrap()
    }
}

#[wasm_bindgen]
pub fn validate_answer(seed: u64, answer: JsValue) -> bool {
    let mut rng = ChaCha8Rng::seed_from_u64(seed);
    let puzzle_type = rng.gen_range(0..3);

    let ans: serde_json::Value = serde_wasm_bindgen::from_value(answer).unwrap();

    if puzzle_type == 0 {
        let base_ducks = (rng.gen_range(1..=4)) * 4; 
        let u_c = ans["chickens"].as_i64().unwrap_or(0);
        let u_d = ans["ducks"].as_i64().unwrap_or(0);
        let u_r = ans["rabbits"].as_i64().unwrap_or(0);
        (u_c as i32 == base_ducks * 2) && (u_d as i32 == base_ducks) && (u_r as i32 == base_ducks / 4)
    } else if puzzle_type == 1 {
        ans["choice"].as_str().unwrap_or("") == "B"
    } else {
        let start: i32 = rng.gen_range(1..=10);
        let step: i32 = rng.gen_range(2..=6);
        let correct = start + 5 * step;
        let user_val = ans["value"].as_i64().unwrap_or(-9999);
        user_val as i32 == correct
    }
}
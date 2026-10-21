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
    pub interaction_type: String, // "multi_input" أو "multiple_choice"
    pub constraints: Vec<serde_json::Value>, 
    pub options: Vec<serde_json::Value>, // للخيارات المتعددة
}

#[wasm_bindgen]
pub fn generate_puzzle(seed: u64) -> JsValue {
    let mut rng = ChaCha8Rng::seed_from_u64(seed);
    
    // اختيار نوع اللغز عشوائياً (0 = مزرعة، 1 = مسافة)
    let puzzle_type = rng.gen_range(0..2);

    if puzzle_type == 0 {
        // --- لغز المزرعة (المنطق الجبري) ---
        let c = rng.gen_range(2..=10);
        let mut d = rng.gen_range(2..=10);
        while d == c { d = rng.gen_range(2..=10); }
        let r = rng.gen_range(1..=6);

        let constraints = vec![
            json!({"type": "DIFF", "value": (c as i32 - d as i32).abs()}),
            json!({"type": "SUM", "value": c + r}),
            json!({"type": "WEIGHTED_SUM", "value": (c*2 + d*2 + r*4)})
        ];

        let puzzle = PuzzlePublic {
            challenge_id: seed,
            title: "لغز المزرعة".to_string(),
            description: "اكتشف عدد الحيوانات بناءً على القيود:".to_string(),
            interaction_type: "multi_input".to_string(),
            constraints,
            options: vec![],
        };
        serde_wasm_bindgen::to_value(&puzzle).unwrap()
    } else {
        // --- لغز الفخ المنطقي (المسافة) ---
        let distance = rng.gen_range(15..=50);
        
        let prompt = format!("المسافة بين مدينتي الكويت والأحمدي {} كم. إذا قطعتها مرتين ذهاباً وإياباً، فكم تكون المسافة بين البلدين؟", distance);
        
        // خلط الخيارات
        let mut options = vec![
            json!({"id": "A", "text": format!("{} كم", distance * 2)}),
            json!({"id": "B", "text": format!("{} كم", distance)}), // الإجابة الصحيحة
            json!({"id": "C", "text": "صفر"}),
            json!({"id": "D", "text": format!("{} كم", distance * 4)}),
        ];
        // (سنترك الترتيب ثابتاً في هذا المثال لضمان الاستقرار، ولكن يمكن خلطها لاحقاً)

        let puzzle = PuzzlePublic {
            challenge_id: seed,
            title: "الفخ المنطقي".to_string(),
            description: prompt,
            interaction_type: "multiple_choice".to_string(),
            constraints: vec![],
            options,
        };
        serde_wasm_bindgen::to_value(&puzzle).unwrap()
    }
}

#[wasm_bindgen]
pub fn validate_answer(seed: u64, answer: JsValue) -> bool {
    let mut rng = ChaCha8Rng::seed_from_u64(seed);
    let puzzle_type = rng.gen_range(0..2);

    let ans: serde_json::Value = serde_wasm_bindgen::from_value(answer).unwrap();

    if puzzle_type == 0 {
        // التحقق من المزرعة
        let c = rng.gen_range(2..=10);
        let mut d = rng.gen_range(2..=10);
        while d == c { d = rng.gen_range(2..=10); }
        let r = rng.gen_range(1..=6);

        let u_c = ans["chickens"].as_i64().unwrap_or(0);
        let u_d = ans["ducks"].as_i64().unwrap_or(0);
        let u_r = ans["rabbits"].as_i64().unwrap_or(0);

        (u_c as i32 == c) && (u_d as i32 == d) && (u_r as i32 == r)
    } else {
        // التحقق من المسافة (الإجابة الصحيحة هي الخيار B)
        let u_choice = ans["choice"].as_str().unwrap_or("");
        u_choice == "B"
    }
}
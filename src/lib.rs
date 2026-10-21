use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use rand::{Rng, SeedableRng};
use rand_chacha::ChaCha8Rng; 
use serde_json::json;

#[derive(Serialize, Deserialize)]
pub struct PuzzlePublic {
    pub challenge_id: u64,
    pub puzzle_type: String, // "farm", "distance", "sequence"
    pub params: serde_json::Value, // الأرقام فقط
    pub interaction_type: String,
    pub options: Vec<serde_json::Value>, 
}

#[wasm_bindgen]
pub fn generate_puzzle(seed: u64) -> JsValue {
    let mut rng = ChaCha8Rng::seed_from_u64(seed);
    let puzzle_type = rng.gen_range(0..3);

    if puzzle_type == 0 {
        let base_ducks = (rng.gen_range(1..=4)) * 4; 
        let chickens = base_ducks * 2;
        let rabbits = base_ducks / 4;
        let missing_chickens = chickens - (base_ducks + rabbits);

        let puzzle = PuzzlePublic {
            challenge_id: seed,
            puzzle_type: "farm".to_string(),
            params: json!({ "missing": missing_chickens }),
            interaction_type: "multi_input_animals".to_string(), 
            options: vec![],
        };
        serde_wasm_bindgen::to_value(&puzzle).unwrap()
    } else if puzzle_type == 1 {
        let distance = rng.gen_range(15..=50);
        
        // الخيارات كأرقام فقط (لتترجم الواجهة كلمة "كم" أو "km")
        let options = vec![
            json!({"id": "A", "value": distance * 2}),
            json!({"id": "B", "value": distance}), 
            json!({"id": "C", "value": 0}), // صفر
            json!({"id": "D", "value": distance * 4}),
        ];

        let puzzle = PuzzlePublic {
            challenge_id: seed,
            puzzle_type: "distance".to_string(),
            params: json!({ "distance": distance }),
            interaction_type: "multiple_choice".to_string(),
            options,
        };
        serde_wasm_bindgen::to_value(&puzzle).unwrap()
    } else {
        let start: i32 = rng.gen_range(1..=10);
        let step: i32 = rng.gen_range(2..=6);
        let seq: Vec<i32> = (0..5).map(|i| start + i * step).collect();
        
        let puzzle = PuzzlePublic {
            challenge_id: seed,
            puzzle_type: "sequence".to_string(),
            params: json!({ "seq": seq }),
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
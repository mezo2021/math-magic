// src/lib/wasm-loader.ts

export async function loadMathEngine() {
  try {
    // قراءة المسار الأساسي من متغيرات البيئة (الذي يحدده GitHub Actions)
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    
    // استخدام webpackIgnore يمنع Next.js من محاولة تضمين الملف في حزمة البناء
    const module = await import(/* webpackIgnore: true */ `${basePath}/math_engine.js`);
    
    // تهيئة ملف WASM المرافق
    await module.default(`${basePath}/math_engine_bg.wasm`);
    
    return module;
  } catch (error) {
    console.error("فشل في تحميل محرك Rust (WASM):", error);
    throw new Error("تعذر تشغيل محرك الألغاز. يرجى تحديث الصفحة.");
  }
}
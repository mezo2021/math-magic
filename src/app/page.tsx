useEffect(() => {
  async function loadWasm() {
    try {
      // تحديد المسار المطلق الصحيح للملفات
      const basePath = '/math-magic';
      const module = await import(/* webpackIgnore: true */ `${window.location.origin}${basePath}/math_engine.js`);
      await module.default(`${window.location.origin}${basePath}/math_engine_bg.wasm`);
      
      setWasm(module);
      setIsWasmReady(true);
    } catch (e) {
      console.error("فشل تحميل محرك Rust", e);
    }
  }
  loadWasm();
  
  const savedScore = localStorage.getItem('math_magic_score');
  if (savedScore) setScore(parseInt(savedScore));
}, []);
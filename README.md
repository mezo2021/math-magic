# 🧠 سحر الرياضيات | Math Magic

تطبيق ألغاز رياضية ومنطقية تفاعلية، مصمم ليعمل كتطبيق ويب تقدمي (PWA) على الهواتف والأجهزة اللوحية. يتميز التطبيق بواجهة زجاجية عصرية (Glassmorphism)، ويدعم اللغتين العربية والإنجليزية، مع ثيمين بصريين (Terminator و Barbie).

---

## 🛠️ التقنيات المستخدمة (Tech Stack)
*   **Framework:** Next.js 14 (App Router)
*   **Language:** TypeScript (تم التخلي عن Rust/WASM لصالح TypeScript لضمان السرعة والاستقرار)
*   **Styling:** Tailwind CSS (مع تأثيرات Backdrop Blur)
*   **State Management:** React Hooks (useState/useEffect) + LocalStorage
*   **Hosting:** GitHub Pages (Static Export)

---

## 📂 هيكل النظام (Project Structure)

```text
├── .github/workflows/deploy.yml   # أتمتة النشر على GitHub Pages
├── public/
│   ├── manifest.json              # إعدادات الـ PWA
│   └── icons/                     # أيقونات التطبيق
├── src/
│   ├── app/
│   │   ├── layout.tsx             # الغلاف العام، إعدادات SEO و RTL
│   │   ├── page.tsx               # الشاشة الرئيسية وشاشات اللعب (الواجهة)
│   │   └── globals.css            # إعدادات Tailwind العامة
│   ├── components/
│   │   └── ChallengeShare.tsx     # زر مشاركة التحدي عبر الهاتف
│   └── lib/
│       ├── challenge.ts           # تشفير وفك تشفير روابط التحدي (Base64)
│       ├── i18n.ts                # قاموس الترجمة (عربي/إنجليزي) ونصوص الحلول
│       ├── puzzleEngine.ts        # محرك توليد الألغاز والتحقق من الإجابات
│       ├── store.ts               # إدارة بيانات اللاعب (LocalStorage)
│       └── usePlayerStore.ts      # Hook للربط بين React و LocalStorage
├── next.config.mjs                # إعدادات التصدير الثابت (Static Export)
├── tailwind.config.ts             # إعدادات Tailwind CSS
└── tsconfig.json                  # إعدادات TypeScript
```

---

🎮 مزايا الألغاز (Puzzle Engine Features)

يعتمد التطبيق على محرك ألغاز ذكي (src/lib/puzzleEngine.ts) يستخدم نظام التدوير العادل (Round Robin) لضمان تنوع الأسئلة، ويوفر 3 أنواع من الألغاز:

1. لغز المزرعة (Farm Puzzle):
   · المنطق: معادلات جبرية مستوحاة من كتاب "منسا" العالمي.
   · الواجهة: عدادات تفاعلية (+ / -) للأرانب فقط، ويتم حساب الدجاج والبط تلقائياً لضمان عدم التناقض الرياضي.
   · الحل: يظهر شرح مفصل للمعادلة بعد الإجابة.
2. لغز المسافة (Distance Puzzle):
   · المنطق: لغز فخ (Trick Question) يعتمد على المسافة الثابتة بين مدينتي الكويت والأحمدي.
   · الواجهة: اختيار من متعدد (Multiple Choice).
3. لغز المتسلسلة (Sequence Puzzle):
   · المنطق: إيجاد النمط الرياضي (الفرق بين الأرقام).
   · الواجهة: إدخال مباشر (Single Input) لسرعة الإجابة.

---

💾 إدارة الحالة والمتجر (State Management & Store)

· يتم حفظ بيانات اللاعب في LocalStorage تحت المفتاح math_magic_player_store_v1.
· البيانات المحفوظة: الاسم، الثيم (Ocean/Barbie)، اللغة، أعلى نتيجة، إجمالي الألغاز المحلولة، والأوسمة (Achievements).
· الأوسمة المتاحة: المبتدئ الذكي 🐣، السريع ⚡، الأسطورة 🏆، قاهر التحديات ⚔️.

---

🌍 التعريب والترجمة (i18n)

· يدعم التطبيق اللغتين العربية (RTL) والإنجليزية (LTR).
· جميع النصوص، بما في ذلك نصوص الألغاز وشروحات الحلول، موجودة في src/lib/i18n.ts.
· يتم استخدام واجهة TranslationSchema لضمان عدم وجود أخطاء إملائية في المفاتيح (Keys).

---

🚀 دليل النشر (Deployment)

· يتم النشر تلقائياً عند عمل Push إلى فرع main عبر GitHub Actions.
· هام: يجب التأكد من أن إعدادات next.config.mjs تحتوي على basePath: '/math-magic' و output: 'export'.
· هام: ملف public/manifest.json يجب أن يحتوي على المسار الصحيح start_url: '/math-magic/'.

---

🛠️ قواعد التطوير المستقبلية (Developer Rules)

1. أي تعديل برمجي يجب أن يُسبق بفحص الملف الحالي بالكامل.
2. يجب إضافة "وسم" (Header) في أعلى كل ملف يوضح مساره، وظيفته، وتاريخ آخر تعديل.
3. يُمنع استخدام Math.random() المباشر في توليد الألغاز، ويجب استخدام puzzleEngine.ts لضمان التنوع.
4. يُمنع وضع أي منطق رياضي في ملف الواجهة (page.tsx)، كل المنطق يجب أن يكون في puzzleEngine.ts.

```
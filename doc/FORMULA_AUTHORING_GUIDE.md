# راهنمای نوشتن فرمول — کویسشنری و Intelligence Model

این سند برای کسی است که در پورتال Holisticare **فرمول می‌نویسد**: مدیر کلینیک، practitioner، یا کسی که مدل سلامت و فرم بیمار را می‌چیند.

هدف این است که با همین زبان بتوانید **هر قانونی** را خودتان بسازید: BMI، جمع GAD-7، ریسک قلبی، نمره سلامت، سن زیستی، نسبت دو آزمایش، برچسب متنی، و هر ترکیب دیگری که از دادهٔ موجود ساخته شود.

بیمار این ادیتور را نمی‌بیند. محاسبه بعد از Submit فرم یا ذخیرهٔ آزمایش، روی سرور انجام می‌شود.

---

## کدام بخش را استفاده کنم؟

دو ادیتور جدا هستند. زبان ریاضی یکی است؛ **ورودی‌ها فرق دارند.**

| اگر می‌خواهید… | کجا بنویسید | ورودی فرمول | خروجی کجا می‌رود |
|---|---|---|---|
| از **جواب سؤال‌های یک فرم** عدد یا متن بسازید | ادیتور کویسشنری → **Derived biomarkers** | `id` سؤال، مثلاً `q_weight` | Biomarker روی Report و/یا Insight |
| از **آزمایش‌های کاتالوگ** ریسک بسازید | Intelligence Model → **Risk Assessments** | `Biomarker.LDL_Cholesterol`، `Profile.age` | کارت Risks روی گزارش |
| از آزمایش‌ها نمرهٔ سلامت بسازید (بالاتر بهتر) | Intelligence Model → **Health Scores** | همان | کارت Health Scores |
| سن زیستی به سال بسازید | Intelligence Model → **Age Clocks** | همان + معمولاً `Profile.age` | کارت Age |
| یک بیومارکر موجود را از روی چند آزمایش حساب کنید (مثل BMI) | Intelligence Model → **Parametric Biomarkers** | همان | مقدار معمولی در پرونده؛ **نه** داخل Risks |

قانون طلایی:

- کویسشنری = `q_weight` / `smoking`
- Intelligence Model = `Biomarker.Weight` / `Profile.age`

`Biomarker.Weight` داخل فرمول کویسشنری کار نمی‌کند. `q_weight` داخل Intelligence Model کار نمی‌کند.

---

## ۱. زبان مشترک (هر دو بخش)

یک **عبارت تکی** است. انتساب (`x = 1`)، چند خط، دیکشنری، ایمپورت، و پایتون آزاد مجاز نیست.

حداکثر طول در ادیتور کویسشنری **۵۱۲** کاراکتر است. سرور تا **۱۰۲۴** می‌پذیرد. برای Intelligence Model هم همان سقف ۱۰۲۴ را نگه دارید.

### عملگرهای عددی

| عملگر | معنی | مثال |
|---|---|---|
| `+` `-` `*` `/` | جمع، تفریق، ضرب، تقسیم | `a + b * 2` |
| `//` | تقسیم صحیح | `score // 2` |
| `%` | باقی‌مانده | `n % 2` |
| `**` | توان | `(height / 100) ** 2` |
| `()` | اولویت | `weight / ((height / 100) ** 2)` |
| `-a` | منفی | `-delta` |

روی متن نمی‌شود حساب کرد. اگر متغیر متن `"Yes"` باشد، `smoking + 1` رد می‌شود.

### مقایسه

| عملگر | معنی |
|---|---|
| `==` `!=` | برابر / نابرابر. برای متن، بدون حساسیت به حروف |
| `<` `<=` `>` `>=` | فقط عدد با عدد |

عدد را با متن مقایسه نکنید:

```text
if_(q_age > "18", "Adult", "Child")     ← غلط
if_(q_age > 18, "Adult", "Child")       ← درست
```

چند مقایسه پشت‌سرهم مجاز است: `0 < x < 10`.

### منطق

| نحو | معنی |
|---|---|
| `and` | هر دو درست |
| `or` | یکی درست |
| `if_(شرط, اگر_درست, اگر_غلط)` | شاخهٔ پیشنهادی |
| `A if شرط else B` | معادل پایتونی؛ شاخهٔ استفاده‌نشده اجرا نمی‌شود |

`not` به‌صورت عملگر جدا مجاز نیست. به‌جای `not (a == "Yes")` بنویسید `a != "Yes"`.

تفاوت مهم `if_` و ternary:

- در `if_(شرط, a, b)` **هر دو شاخه قبل از انتخاب** محاسبه می‌شوند. اگر `a` خالی باشد، کل فرمول می‌میرد حتی وقتی شرط غلط است.
- در `a if شرط else b` فقط شاخهٔ لازم اجرا می‌شود.

### لیترال متن

داخل `"` یا `'`. حداکثر **۱۲۸** کاراکتر برای هر رشته. f-string مجاز نیست.

```text
if_(q_smoke == "Yes", "Smoker", "Non-smoker")
```

### آرگومان توابع

همه **positional** هستند. این غلط است:

```text
round(x, ndigits=2)
```

درست:

```text
round(x, 2)
```

ممنوع: `a.b` (به‌جز `Biomarker.Name` و `Profile.age` در Intelligence Model)، `a[0]`، `lambda`، `{...}`، `__import__`.

اگر ورودی خالی باشد یا تقسیم بر صفر شود، **همان قانون** نتیجه نمی‌دهد؛ بقیهٔ قانون‌ها اجرا می‌شوند.

---

## ۲. توابع مجاز

همین فهرست در کویسشنری و Intelligence Model کار می‌کند.

### جمع و آمار

| تابع | معنی |
|---|---|
| `sum(a, b, c, ...)` | جمع. مقدار `None` داخل آرگومان نادیده گرفته می‌شود |
| `avg(a, b, ...)` | میانگین. حداقل یک عدد لازم است |
| `min(a, b, ...)` | کوچک‌ترین |
| `max(a, b, ...)` | بزرگ‌ترین |

```text
sum(q_gad_1, q_gad_2, q_gad_3)
avg(q_sleep, q_mood, q_energy)
min(Biomarker.Systolic_Blood_Pressure_at_rest, Biomarker.Diastolic_Blood_Pressure_at_rest)
```

### ریاضی

| تابع | معنی |
|---|---|
| `round(x, n)` | `n` رقم اعشار (پیش‌فرض ۰) |
| `abs(x)` | قدر مطلق |
| `sqrt(x)` | جذر؛ منفی رد می‌شود |
| `ln(x)` / `log(x)` | لگاریتم طبیعی؛ ورودی باید مثبت باشد |
| `exp(x)` | e به توان x |

```text
round(q_weight / ((q_height / 100) ** 2), 2)
abs(Biomarker.Thyroid_Stim_Hormone - 1.5)
ln(Biomarker.C_Reactive_Protein_high_sensitivity)
```

### شاخه

```text
if_(شرط, مقدار_اگر_درست, مقدار_اگر_غلط)
```

هر سه آرگومان الزامی است. خروجی می‌تواند عدد یا متن باشد. تو در تو کردن برای چند آستانه درست است:

```text
if_(score >= 15, "Severe", if_(score >= 10, "Moderate", "Mild"))
```

### نگاشت بازه: `status_weight(value, optimal, disease)`

این مهم‌ترین تابع برای Intelligence Model است.

عدد را بین بهینه و بیماری به بازه **۰ تا ۱** می‌برد:

- اگر `value == optimal` → `0`
- اگر `value == disease` → `1`
- بین این دو، خطی است
- بیرون بازه، به ۰ یا ۱ چسبانده می‌شود

اگر `optimal == disease` و مقدار همان باشد نتیجه ۰ است؛ وگرنه ۱.

**بالاتر بدتر** (مثل LDL):

```text
status_weight(Biomarker.LDL_Cholesterol, 100, 130)
```

اینجا ۱۰۰ بهینه است، ۱۳۰ بیماری.

**پایین‌تر بدتر** (مثل HDL یا eGFR): جای بهینه و بیماری را عوض کنید:

```text
status_weight(Biomarker.HDL_Cholesterol, 60, 40)
status_weight(Biomarker.estimated_GFR, 90, 60)
```

**هر دو طرف بد** (مثل TSH خیلی پایین یا خیلی بالا): فاصله از نقطهٔ وسط را قدر مطلق بگیرید:

```text
status_weight(abs(Biomarker.Thyroid_Stim_Hormone - 1.5), 0.8, 2.5)
```

### `phenoage(...)` — سن زیستی Levine 2018

ده آرگومان، **به همین ترتیب**. خروجی سال است.

| ترتیب | معنی | واحد مورد انتظار تابع |
|---|---|---|
| 1 | albumin | g/L |
| 2 | creatinine | µmol/L |
| 3 | glucose | mmol/L |
| 4 | crp | mg/dL |
| 5 | lymph | درصد لنفوسیت |
| 6 | mcv | fL |
| 7 | rdw | درصد |
| 8 | alp | U/L |
| 9 | wbc | 10³/µL |
| 10 | age | سال |

اگر واحد کاتالوگ فرق دارد، **اول در همین فرمول تبدیل کنید**؛ تابع واحد را عوض نمی‌کند.

نمونهٔ رایج وقتی Albumin بر حسب g/dL، Glucose بر حسب mg/dL، CRP بر حسب mg/L، WBC بر حسب /µL باشد:

```text
round(phenoage(Biomarker.Albumin * 10, Biomarker.Creatinine, Biomarker.Glucose / 18, max(Biomarker.C_Reactive_Protein_high_sensitivity / 10, 0.001), Biomarker.Lymphocytes, Biomarker.Mean_Corpuscular_Volume, Biomarker.Red_Cell_Distribution_Width, Biomarker.Alkaline_Phosphatase, Biomarker.White_Blood_Cells / 1000, Profile.age), 2)
```

ضریب تبدیل را با واحد **همین کلینیک** چک کنید؛ نمونهٔ بالا برای همهٔ کاتالوگ‌ها صادق نیست.

---

## ۳. کویسشنری — Derived biomarkers

در ادیتور فرم، بخش **Derived biomarkers**. بیمار آن را پر نمی‌کند. بعد از Submit اجرا می‌شود.

### دو راه ساختن مقدار

**الف) خود سؤال biomarker باشد** — فرمول لازم نیست.

روی سؤال:

- **Save as biomarker** / `is_biomarker: true`
- **Clinic biomarker** / `map_to_biomarker` = اسم دقیق کاتالوگ (مثلاً `Weight`)
- در صورت نیاز **Include in insights**

مناسب برای وزن، قد، دور کمر، یک عدد تکی.

**ب) قانون محاسبه** — موضوع این بخش.

| فیلد روی صفحه | کلید JSON | معنی |
|---|---|---|
| Name | `name` | اسم قانون برای خودتان |
| Formula | `formula` | عبارت محاسبه. الزامی |
| Save as biomarker | `is_biomarker` | اگر روشن باشد نتیجه روی Report می‌نشیند |
| Clinic biomarker | `map_to_biomarker` | اسم دقیق biomarker کاتالوگ |
| Include in insights | `use_in_insight` | نتیجه به Insight هم می‌رود |
| Unit | `unit` | مثلاً `kg/m^2` |
| Round digits | `round` | رقم اعشار خروجی عددی |

ترکیب‌ها:

1. روی Report → `is_biomarker: true` + `map_to_biomarker` پر
2. فقط Insight → `is_biomarker: false` + `use_in_insight: true`
3. هر دو → هر دو روشن

اگر biomarker خاموش باشد و Insight هم خاموش، قانون عملاً اجرا نمی‌شود.

### متغیرها: `id` سؤال

در فرمول، سؤال با **id** صدا زده می‌شود نه با متن.

- یکتا باشد
- با حرف شروع شود
- فقط `a-z`، `0-9` و `_` — مثلاً `q_weight`، `smoking`، `q_gad_1`

زیر Formula لیست سؤال‌ها را می‌بینید. کلیک، id را می‌گذارد. تایپ `q_` هم پیشنهاد می‌دهد.

اگر id در فرم نباشد، ذخیره در UI جلو نمی‌رود. اگر بعداً در JSON خراب شود، آن قانون رد می‌شود و بقیه کار می‌کنند.

**قانون دوم نمی‌تواند خروجی قانون اول را بخواند.** هر فرمول فقط id سؤال می‌بیند. اگر به مجموع نیاز دارید، `sum(...)` را تکرار کنید.

### هر نوع سؤال چه مقداری می‌شود؟

| نوع سؤال | مقدار داخل فرمول |
|---|---|
| **Number** / **Scale** / **Star Rating** | عدد. `"76 kg"` هم می‌شود `76` |
| **multiple_choice** با `option_scores` | امتیاز گزینه |
| **checkbox** با `option_scores` | **جمع** امتیاز گزینه‌های تیک‌خورده |
| **Yes/No** | متن `"Yes"` یا `"No"` — **در فرمول ۱ و ۰ نیست** مگر `option_scores` بگذارید |
| multiple_choice بدون امتیاز | همان لیبل متنی |
| checkbox بدون امتیاز | لیبل‌ها با ویرگول: `"Stress, Caffeine"` |
| Paragraph / متن آزاد | همان متن |
| خالی | مقدار ندارد → کل آن قانون رد می‌شود |

Yes/No را با `"Yes"` / `"No"` مقایسه کنید (حروف بزرگ/کوچک فرقی ندارد). اگر بخواهید عدد شود:

```json
"option_scores": { "Yes": 1, "No": 0 }
```

### `option_scores`

برای Likert / GAD / PHQ کلید باید **عین متن گزینه** باشد:

```json
"options": ["Not at all", "Several days", "More than half the days", "Nearly every day"],
"option_scores": {
  "Not at all": 0,
  "Several days": 1,
  "More than half the days": 2,
  "Nearly every day": 3
}
```

بدون امتیاز، `sum(q_gad_1, q_gad_2)` کار نمی‌کند.

### الگوهای کویسشنری — از روی این‌ها کپی کنید

**BMI** — وزن kg، قد cm:

```text
q_weight / ((q_height / 100) ** 2)
```

`round: 2`، `unit: kg/m^2`، `map_to_biomarker` را از کاتالوگ بردارید (مثلاً `Body Mass Index`).

**جمع Likert (GAD-7 / PHQ-9)** — هر آیتم امتیاز ۰ تا ۳ داشته باشد:

```text
sum(q_gad_1, q_gad_2, q_gad_3, q_gad_4, q_gad_5, q_gad_6, q_gad_7)
```

در ادیتور دکمه **Total a score** همین الگو را می‌سازد.

**درصد از سقف نمره** (GAD از ۲۱):

```text
(sum(q_gad_1, q_gad_2, q_gad_3, q_gad_4, q_gad_5, q_gad_6, q_gad_7) / 21) * 100
```

**میانگین:**

```text
avg(q_energy, q_mood, q_sleep)
```

**آستانه → برچسب:**

```text
if_(sum(q_gad_1, q_gad_2, q_gad_3, q_gad_4, q_gad_5, q_gad_6, q_gad_7) >= 15, "Severe", if_(sum(q_gad_1, q_gad_2, q_gad_3, q_gad_4, q_gad_5, q_gad_6, q_gad_7) >= 10, "Moderate", if_(sum(q_gad_1, q_gad_2, q_gad_3, q_gad_4, q_gad_5, q_gad_6, q_gad_7) >= 5, "Mild", "Minimal")))
```

اگر از ۵۱۲ کاراکتر گذشت، فرمول برچسب را کوتاه‌تر کنید؛ قانون دوم به مجموع قانون اول دسترسی ندارد.

**Yes/No → متن** (دکمه **Map answers to text**):

```text
if_(q_smoke == "Yes", "Smoker", "Non-smoker")
```

**چندشرط:**

```text
if_(q_smoke == "Yes" and q_age >= 40, "High attention", "Routine")
if_(q_pain == "Yes" or q_fatigue == "Yes", "Symptom present", "None")
```

**اگر ورزش می‌کند دقیقه، وگرنه صفر** — از ternary استفاده کنید تا دقیقهٔ خالی کل فرمول را نکشد:

```text
q_minutes if q_exercise == "Yes" else 0
```

**checkbox امتیازی** خودش جمع است:

```text
q_symptoms
```

**نسبت ۰ تا ۱:**

```text
status_weight(q_waist, 80, 102)
```

**کپی لیبل انتخاب** (بدون امتیاز):

```text
q_sleep_problem
```

### بعد از Submit کویسشنری

1. جواب‌ها ذخیره می‌شوند.
2. هر قانون اجرا می‌شود.
3. اگر `is_biomarker` روشن باشد و اسم کاتالوگ پیدا شود، ردیف biomarker نوشته می‌شود.
4. اگر `map_to_biomarker` در کاتالوگ نباشد، ردیف نوشته نمی‌شود.
5. اگر `use_in_insight` روشن باشد، مقدار به Insight می‌رود حتی بدون ردیف Report.

---

## ۴. Intelligence Model — فرمول آزمایش‌ها

صفحه: منوی **CUSTOMIZATION** → **Intelligence Model**.

چهار دسته:

| دسته | معنی عدد | الگوی رایج خروجی |
|---|---|---|
| **Risk Assessments** | بالاتر = توجه بیشتر | معمولاً ۰ تا ۱۰۰ |
| **Health Scores** | بالاتر = بهتر | معمولاً ۰ تا ۱۰۰ |
| **Age Clocks** | سال سن زیستی | معمولاً سال |
| **Parametric Biomarkers** | مقدار یک بیومارکر موجود | مثلاً BMI |

این ابزار **غربالگری برای مرور پزشک** است، نه تشخیص. نبودن آزمایش یعنی «هنوز نمی‌شود گفت»، نه «ریسک ندارد / نمره بد است / سن پایین است».

### متغیرها

فقط این دو خانواده:

```text
Biomarker.Catalog_Name
Profile.age
```

- `Profile.age` سن بیمار به سال است. فیلد پروفایل دیگری (`gender` و غیره) **نیست**.
- `Biomarker.Name.value` و `Context.` پشتیبانی نمی‌شوند. فقط `Biomarker.Name`.
- اسم را از پیشنهاد ادیتور بردارید. تایپ `Biomarker.` تکمیل خودکار باز می‌کند.
- فاصله و علائم اسم کاتالوگ در توکن می‌شوند `_`. مثال: `LDL Cholesterol` → `Biomarker.LDL_Cholesterol`
- **Height** و **Weight** همیشه معتبرند (قد cm، وزن kg). بقیه باید در Custom Biomarkers همین کلینیک باشند.
- اسمی که با رقم شروع شود توکن نمی‌شود (مثلاً `25 OH Vitamin D`). از نام کاتالوگی استفاده کنید که با حرف شروع شود.

تطبیق اسم بدون حساسیت به حروف است و `_` با فاصله یکی حساب می‌شود. با این حال همیشه از autocomplete استفاده کنید.

اگر نام در کاتالوگ نباشد، ذخیره نمی‌شود.

### Result categories (بازه‌های برچسب)

بعد از محاسبهٔ عدد، سیستم آن را روی بازه‌ها می‌گذارد. بازه‌ها نباید روی هم بیفتند. آخرین بازه کران بالا را هم شامل می‌شود.

پیشنهاد رایج برای Risk:

| min | max | label |
|---|---|---|
| 0 | 20 | Low |
| 20 | 50 | Moderate |
| 50 | 80 | High |
| 80 | 100 | very High |

برای Health Score (بالاتر بهتر):

| min | max | label |
|---|---|---|
| 0 | 20 | Poor |
| 20 | 50 | Low |
| 50 | 80 | Good |
| 80 | 100 | Optimal |

برای Age Clock بازه را روی **سال** بگذارید، نه ۰–۱۰۰؛ مگر فرمول خودتان ۰–۱۰۰ بدهد.

نمرهٔ Health Score برابر صفر روی گزارش نشان داده نمی‌شود. ریسک صفر اگر واقعاً حساب شده باشد می‌تواند دیده شود.

### روش ساختن هر فرمولی که بخواهید

هر قانون سفارشی همین پنج قدم است.

**۱. ورودی‌ها را بنویسید**  
کدام آزمایش‌ها؟ سن لازم است؟ واحد هر کدام در کاتالوگ این کلینیک چیست؟

**۲. هر ورودی را به سیگنال ۰ تا ۱ تبدیل کنید**  
با `status_weight`. بهینه و بیماری را با واحد **همین کلینیک** بنویسید، نه از روی مقالهٔ کلینیک دیگر.

**۳. وزن بدهید و جمع کنید**  
وزن‌ها بهتر است جمع‌شان ۱ باشد تا تفسیر ساده بماند:

```text
term1 * 0.40 + term2 * 0.35 + term3 * 0.25
```

**۴. مقیاس خروجی را انتخاب کنید**

| هدف | الگو |
|---|---|
| ریسک ۰–۱۰۰ | `round((...) * 100, 2)` |
| نمره سلامت ۰–۱۰۰ | `round((1 - (...)) * 100, 2)` |
| نسبت خام | `Biomarker.A / Biomarker.B` |
| مقدار محاسبه‌ای | مثل BMI، بدون `* 100` |
| سال | `phenoage(...)` یا فرمول سن خودتان |

**۵. بازه‌های برچسب را با همان مقیاس پر کنید**

اگر یکی از آزمایش‌های داخل فرمول برای بیمار نباشد، کل مدل برای آن بیمار ساخته نمی‌شود. سیستم جمله را حذف نمی‌کند تا نمرهٔ ساختگی پایین بدهد.

---

### الگوهای Intelligence Model

واحدهای عدد داخل `status_weight` را با کاتالوگ **کلینیک خودتان** عوض کنید. نمونه‌های زیر اغلب برای کاتالوگ آمریکایی (چربی mg/dL) نوشته شده‌اند. اگر کلینیک شما mmol/L است، آستانه‌ها را عوض کنید.

#### ریسک وزن‌دار (چند آزمایش → ۰ تا ۱۰۰)

```text
round((status_weight(Biomarker.LDL_Cholesterol, 100, 130) * 0.30 + status_weight(Biomarker.HDL_Cholesterol, 60, 40) * 0.25 + status_weight(Biomarker.Triglycerides, 150, 200) * 0.20 + status_weight(Biomarker.Systolic_Blood_Pressure_at_rest, 120, 130) * 0.15 + status_weight(Biomarker.C_Reactive_Protein_high_sensitivity, 1.0, 3.0) * 0.10) * 100, 2)
```

برای mmol/L مثلاً LDL بهینه ۲.۶ و بیماری ۳.۴ است، نه ۱۰۰ و ۱۳۰.

#### نمره سلامت = معکوس همان ریسک

```text
round((1 - (status_weight(Biomarker.Hb_A1c, 5.2, 6.5) * 0.50 + status_weight(Biomarker.Glucose, 85, 126) * 0.35 + status_weight(Biomarker.Body_Mass_Index, 22.5, 30) * 0.15)) * 100, 2)
```

تک‌نشانگر:

```text
round((1 - status_weight(Biomarker.Hb_A1c, 5.2, 6.5)) * 100, 2)
```

#### نسبت دو آزمایش

```text
round(Biomarker.Triglycerides / Biomarker.HDL_Cholesterol, 2)
```

```text
round(Biomarker.Aspartate_Transferase / Biomarker.Alanine_transferase, 2)
```

بعد بازه‌ها را روی خود نسبت بگذارید، نه لزوماً ۰–۱۰۰.

#### اختلاف از هدف

```text
abs(Biomarker.Systolic_Blood_Pressure_at_rest - 120)
max(0, Biomarker.LDL_Cholesterol - 100)
```

#### شرط روی آزمایش

```text
if_(Biomarker.Hb_A1c >= 6.5, 100, if_(Biomarker.Hb_A1c >= 5.7, 50, 0))
```

```text
status_weight(Biomarker.LDL_Cholesterol, 70, 100) if Profile.age >= 40 else status_weight(Biomarker.LDL_Cholesterol, 100, 130)
```

برای شاخه‌ای که ممکن است آزمایش نداشته باشد، ternary بهتر از `if_` است.

#### شمارش پرچم‌ها (چند آستانه → یک عدد)

```text
(1 if Biomarker.Triglycerides >= 150 else 0) + (1 if Biomarker.HDL_Cholesterol < 40 else 0) + (1 if Biomarker.Glucose >= 100 else 0)
```

خروجی ۰ تا ۳ است؛ بازه‌ها را روی همین مقیاس بگذارید.

#### مین / مکس چند مقدار

```text
max(Biomarker.Alanine_transferase, Biomarker.Aspartate_Transferase, Biomarker.Gamma_GT)
```

#### نرمال‌سازی درصد داخل بازهٔ خودتان

```text
round(min(100, max(0, (Biomarker.Vitamin_D - 50) / (100 - 50) * 100)), 2)
```

معادل خواناتر معمولاً همان `status_weight` وارونه است:

```text
round((1 - status_weight(Biomarker.Vitamin_D, 100, 50)) * 100, 2)
```

#### Parametric — BMI روی بیومارکر موجود

Intelligence Model → **Parametric Biomarkers** → وصل به `Body Mass Index` (یا هر نام کاتالوگ خودتان):

```text
round(Biomarker.Weight / ((Biomarker.Height / 100) ** 2), 2)
```

قد باید cm و وزن kg باشد. نتیجه مثل یک آزمایش معمولی در پرونده دیده می‌شود، نه در Risks.

نمونهٔ دیگر Parametric — نسبت دور کمر به قد:

```text
round(Biomarker.Waist_Circumference / Biomarker.Height, 2)
```

#### Age Clock

الگوی پیش‌فرض ادیتور را بگیرید و واحدها را با کاتالوگ خودتان اصلاح کنید. خروجی سال است؛ بازه‌ها را روی سال بگذارید (مثلاً Younger / Aligned / Older / Accelerated).

---

## ۵. تبدیل واحد داخل فرمول

موتور واحد را نمی‌فهمد؛ فقط عدد را حساب می‌کند. تبدیل را خودتان بنویسید.

| از | به | ضرب |
|---|---|---|
| creatinine mg/dL | µmol/L | `* 88.4` |
| glucose mg/dL | mmol/L | `/ 18` |
| cholesterol mg/dL | mmol/L | `/ 38.67` |
| triglycerides mg/dL | mmol/L | `/ 88.57` |
| CRP mg/L | mg/dL | `/ 10` |
| albumin g/dL | g/L | `* 10` |
| WBC در /µL | 10³/µL | `/ 1000` |
| قد cm برای BMI | متر | `/ 100` |

مثال:

```text
status_weight(Biomarker.Creatinine * 88.4, 70, 110)
```

فقط وقتی این را بنویسید که مقدار ذخیره‌شده هنوز در واحد مبدأ باشد.

---

## ۶. چیزی که این زبان نیست

- تشخیص بیماری نیست و جایگزین پزشک نیست.
- چت هوش مصنوعی نیست؛ متن آزاد تولید نمی‌کند.
- جنسیت در فرمول Intelligence Model نیست.
- Wellness Score قدیمی / Progress با Health Scores این صفحه یکی نیست.
- هوک قدیمی `use_function_calculation` روی سؤال (BMI/GAD هاردکد) را برای فرم جدید استفاده نکنید؛ از Derived biomarkers استفاده کنید.

---

## ۷. خطاهای رایج

| نشانه | علت | کار درست |
|---|---|---|
| Unknown variable در کویسشنری | id اشتباه | از لیست سؤال کلیک کنید |
| Unknown biomarker در Intelligence Model | اسم کاتالوگ نیست یا با رقم شروع می‌شود | از autocomplete انتخاب کنید |
| قانون ذخیره می‌شود ولی Report خالی است | `map_to_biomarker` عین کاتالوگ نیست | از Clinic biomarker picker |
| جمع Likert خالی است | `option_scores` ندارید | امتیاز ۰٬۱٬۲٬۳ بگذارید |
| `if_(q_smoke == "Yes", ...)` کار نمی‌کند | مقایسهٔ متن با عدد | Yes/No را با `"Yes"` مقایسه کنید |
| BMI ساخته نمی‌شود | قد یا وزن خالی است | هر دو required باشند |
| `round(x, ndigits=2)` رد می‌شود | آرگومان نام‌دار | `round(x, 2)` |
| `Biomarker.Weight` در کویسشنری رد می‌شود | نحو اشتباه بخش | از `q_weight` استفاده کنید |
| `q_weight` در Intelligence Model رد می‌شود | نحو اشتباه بخش | از `Biomarker.Weight` استفاده کنید |
| `score = ...` رد می‌شود | انتساب | فقط عبارت بنویسید |
| کارت گزارش خالی است | مدل خاموش است یا آزمایش نیست | مدل را روشن کنید؛ آزمایش را ذخیره کنید؛ گزارش را رفرش کنید |
| Health Score صفر دیده نمی‌شود | عمدی است | صفر یعنی نشان داده نشود، نه سالم |
| Insight سیگار نمی‌آید | قانون بدون `use_in_insight` | Insight را روشن کنید |
| فرمول با `if_(cond, a, b)` وقتی `a` خالی است می‌میرد | هر دو شاخه ارزیابی می‌شوند | از `a if cond else b` استفاده کنید |

---

## ۸. چک‌لیست قبل از ذخیره

### کویسشنری

- هر سؤال داخل فرمول `id` پایدار دارد
- Likertها `option_scores` دارند و کلید = عین گزینه است
- قانون Report حتماً `map_to_biomarker` از کاتالوگ همان کلینیک دارد
- قانون فقط-Insight: biomarker خاموش، insight روشن
- Yes/No با `"Yes"` / `"No"` مقایسه شده
- یک عبارت است، نه چند خط و نه `=`
- طول ≤ ۵۱۲
- یک‌بار با جواب نمونه Submit کنید و Report + Insight را ببینید

### Intelligence Model

- دسته درست را باز کرده‌اید (Risk / Score / Age / Parametric)
- همهٔ `Biomarker.`ها از کاتالوگ همین کلینیک‌اند
- واحدهای داخل `status_weight` با واحد ذخیره‌شده یکی است
- مقیاس خروجی با بازه‌های برچسب یکی است (۰–۱۰۰ در برابر سال در برابر نسبت)
- برای Score از `1 - ...` استفاده کرده‌اید اگر می‌خواهید بالاتر بهتر باشد
- سوئیچ مدل روشن است
- با یک بیمار که همهٔ آزمایش‌ها را دارد گزارش را رفرش کنید
- بیمارِ بدون یک آزمایش لازم باید کارت خالی ببیند، نه عدد ساختگی

---

## ۹. مسیر کوتاه روی صفحه

**کویسشنری:** فرم را باز کنید → سؤال‌ها را با `id` بسازید → در صورت نیاز `option_scores` → **Derived biomarkers** → Formula → Clinic biomarker → ذخیره → فرم را با دادهٔ نمونه Submit کنید.

**Intelligence Model:** CUSTOMIZATION → Intelligence Model → کارت دسته → Create یا Library → Formula editor (`Biomarker.` برای autocomplete) → Result categories → Create domain → سوئیچ روشن → آزمایش بیمار را ذخیره کنید → گزارش → **Health** → **Risks, Scores & Age**.

برای شروع، اگر فرمول آماده در **Formula Library** هست همان را وارد کنید و بعد آستانه‌ها را با واحد کلینیک خودتان ویرایش کنید.

---

## ۱۰. برگهٔ تقلب — از ایده تا عبارت

| ایده | اسکلت فرمول |
|---|---|
| میانگین چند عدد | `avg(a, b, c)` |
| جمع چند عدد | `sum(a, b, c)` |
| تقسیم / نسبت | `a / b` |
| توان / BMI | `weight / ((height / 100) ** 2)` |
| گرد کردن | `round(عبارت, 2)` |
| قدر مطلق فاصله | `abs(x - هدف)` |
| بازه به ۰–۱ | `status_weight(x, بهینه, بیماری)` |
| ریسک ۰–۱۰۰ | `round((w1*t1 + w2*t2) * 100, 2)` |
| سلامت ۰–۱۰۰ | `round((1 - (w1*t1 + w2*t2)) * 100, 2)` |
| برچسب از عدد | `if_(x >= a, "High", if_(x >= b, "Mid", "Low"))` |
| برچسب از Yes/No | `if_(q == "Yes", "A", "B")` |
| مقدار مشروط | `x if شرط else 0` |
| سن زیستی | `phenoage(alb, cr, glu, crp, lymph, mcv, rdw, alp, wbc, Profile.age)` |
| سن بیمار | `Profile.age` |
| آزمایش کاتالوگ | `Biomarker.Name` |
| جواب فرم | `q_id` |

اگر اسکلت مورد نظرتان در این جدول نیست، معمولاً ترکیب همین ردیف‌هاست: اول هر ورودی را عدد کنید، بعد `status_weight` یا نسبت، بعد وزن، بعد `round`.

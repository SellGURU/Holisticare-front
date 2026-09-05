# فرمول‌های کویسشنری — راهنمای نوشتن

این سند برای کسی است که در پورتال Holisticare **کویسشنری کلینیک** می‌سازد و می‌خواهد از جواب‌ها یک عدد یا برچسب بسازد: BMI، نمره GAD-7، وضعیت سیگار، و مشابه آن.

بیمار این بخش را نمی‌بیند. محاسبه **بعد از Submit** روی سرور انجام می‌شود و نتیجه می‌تواند به Report برود (به‌عنوان biomarker) یا فقط داخل Insight مدل شود.

در ادیتور فرم، این بخش با عنوان **Derived biomarkers** دیده می‌شود. همان‌جا می‌توان JSON هم ویرایش کرد.

---

## ۱. دو راه برای ساختن مقدار از کویسشنری

### الف) خود سؤال، biomarker باشد

روی سؤال بزن:

- **Save as biomarker** / `is_biomarker: true`
- **Clinic biomarker** / `map_to_biomarker` = اسم دقیق کاتالوگ کلینیک (مثلاً `Weight`)
- در صورت نیاز **Include in insights** / `use_in_insight`

جواب خام همان سؤال ذخیره می‌شود. فرمول لازم نیست.

مناسب برای: وزن، قد، دور کمر، یک عدد تکی، یک انتخاب تکی که خودش biomarker است.

### ب) قانون محاسبه (scoring rule) — موضوع این سند

یک قانون جدا می‌سازی که از **چند سؤال** یک مقدار جدید می‌سازد.

بیمار آن را پر نمی‌کند. بعد از Submit، فرمول اجرا می‌شود.

هر قانون این فیلدها را دارد:

| فیلد روی صفحه | کلید JSON | معنی |
|---|---|---|
| Name | `name` | اسم قانون برای خودت (مثلاً BMI، GAD-7، smoking) |
| Formula | `formula` | عبارت محاسبه. الزامی. در UI حداکثر **۵۱۲** کاراکتر |
| Save as biomarker | `is_biomarker` | پیش‌فرض روشن. اگر روشن باشد نتیجه در Report به‌عنوان biomarker می‌نشیند |
| Clinic biomarker | `map_to_biomarker` | اسم **دقیق** biomarker کاتالوگ. اگر Save as biomarker روشن است، الزامی است |
| Include in insights | `use_in_insight` | نتیجه به پرامپت Insight هم می‌رود |
| Unit | `unit` | واحد نمایش، مثلاً `kg/m^2` |
| Round digits | `round` | چند رقم اعشار برای خروجی عددی |

ترکیب‌های رایج:

1. **biomarker روی Report** → `is_biomarker: true` + `map_to_biomarker` پر
2. **فقط Insight، بدون ردیف Report** → `is_biomarker: false` + `use_in_insight: true`
3. **هم Report هم Insight** → هر دو روشن

اگر `is_biomarker` خاموش باشد و Insight هم خاموش، قانون عملاً اجرا نمی‌شود.

---

## ۲. متغیرها: `id` سؤال

در فرمول، هر سؤال با **id** خودش صدا زده می‌شود، نه با متن سؤال.

قواعد id:

- یکتا باشد
- با حرف شروع شود
- فقط `a-z`، `0-9` و `_` (مثلاً `q_weight`، `smoking`، `q_gad_1`)
- حروف کوچک snake_case پیشنهاد می‌شود

در ادیتور، زیر Formula لیست سؤال‌ها را می‌بینی. کلیک روی سؤال، id را داخل فرمول می‌گذارد. تایپ `q_` هم پیشنهاد id می‌دهد.

اگر id در فرمول باشد که در فرم وجود ندارد، ذخیره قانون در UI جلو نمی‌رود. اگر بعداً در JSON خراب شود، آن قانون در اجرا **رد می‌شود** و بقیه قانون‌ها کار می‌کنند.

---

## ۳. هر نوع سؤال در فرمول چه مقداری می‌شود؟

موتور فرمول **یک مقدار** به هر id می‌دهد: یا عدد، یا متن برچسب.

| نوع سؤال | مقدار داخل فرمول | توضیح |
|---|---|---|
| **Number** | عدد | `"76 kg"` هم می‌شود `76` |
| **Scale** | عدد | |
| **Star Rating** | عدد | |
| **multiple_choice** با `option_scores` | عدد امتیاز گزینه | لیبل `"Several days"` با امتیاز `1` می‌شود `1` |
| **checkbox** با `option_scores` | **جمع** امتیاز گزینه‌های تیک‌خورده | `["Stress", "Caffeine"]` با ۲ و ۱ → `3` |
| **Yes/No** | متن `"Yes"` یا `"No"` | مقایسه با `"Yes"` / `"yes"` (بدون حساسیت به حروف). **در فرمول ۱ و ۰ نیست** |
| **multiple_choice** بدون امتیاز | همان لیبل متنی | مثلاً `"Stress"` |
| **checkbox** بدون امتیاز | لیبل‌ها با ویرگول | `"Stress, Caffeine"` |
| **Paragraph** / متن آزاد | همان متن جواب | برای جمع عددی مناسب نیست |
| **Emojis** بدون امتیاز | لیبل انتخاب‌شده | |
| خالی / بدون جواب | مقدار ندارد | کل آن قانون **رد می‌شود** (بقیه قانون‌ها می‌مانند) |

نکته مهم Yes/No:

- برای **نقشه متنی** بنویس: `if_(smoking == "Yes", "smoker", "non")`
- `"yes"` و `"YES"` هم با `"Yes"` یکی حساب می‌شوند
- اگر بخواهی Yes/No را عدد کنی، روی سؤال `option_scores` بگذار: `{ "Yes": 1, "No": 0 }` — آن وقت در فرمول عدد می‌شود و می‌توانی جمع بزنی

---

## ۴. `option_scores` — امتیاز گزینه

برای Likert / GAD / PHQ و هر multiple_choice یا checkbox که باید جمع شود، روی همان سؤال امتیاز بگذار:

```json
"options": ["Not at all", "Several days", "More than half the days", "Nearly every day"],
"option_scores": {
  "Not at all": 0,
  "Several days": 1,
  "More than half the days": 2,
  "Nearly every day": 3
}
```

کلید باید **عین متن گزینه** باشد.

بدون `option_scores`، انتخاب در فرمول **متن** می‌ماند. آن وقت `sum(q_gad_1, q_gad_2)` کار نمی‌کند؛ باید از `if_` روی لیبل استفاده کنی.

---

## ۵. زبان فرمول (whitelist امن)

یک **عبارت تکی** است. انتساب (`x = 1`)، چند خط، و پایتون آزاد مجاز نیست. `eval` هم در کار نیست.

### عملگرهای عددی

| عملگر | معنی | مثال |
|---|---|---|
| `+` `-` `*` `/` | جمع، تفریق، ضرب، تقسیم | `q_a + q_b * 2` |
| `//` | تقسیم صحیح | `q_score // 2` |
| `%` | باقی‌مانده | `q_n % 2` |
| `**` | توان | `(q_height / 100) ** 2` |
| `()` | اولویت | `q_weight / ((q_height / 100) ** 2)` |
| `-q_a` | منفی | `-q_delta` |

روی متن نمی‌شود حساب کرد. `q_smoke + 1` اگر `q_smoke` برابر `"Yes"` باشد، رد می‌شود.

### مقایسه

| عملگر | معنی |
|---|---|
| `==` `!=` | برابر / نابرابر. برای متن، بدون حساسیت به حروف |
| `<` `<=` `>` `>=` | فقط عدد با عدد |

عدد را با متن مقایسه نکن. این غلط است:

```text
if_(q_age > "18", "Adult", "Child")
```

درست:

```text
if_(q_age > 18, "Adult", "Child")
```

چند مقایسه پشت‌سرهم مثل `0 < q_x < 10` مجاز است.

### منطق

| نحو | معنی |
|---|---|
| `and` | هر دو درست |
| `or` | یکی درست |
| `if_(شرط, اگر_درست, اگر_غلط)` | پیشنهاد اصلی برای شاخه |
| `A if شرط else B` | معادل پایتونی همان if |

`not` به‌صورت عملگر جدا **مجاز نیست**. به‌جای `not (q_a == "Yes")` بنویس `q_a != "Yes"`.

### لیترال متن

داخل `"` یا `'`:

```text
if_(q_smoke == "Yes", "Smoker", "Non-smoker")
```

حداکثر **۱۲۸ کاراکتر** برای هر رشته. f-string مجاز نیست.

### محدودیت‌ها

- طول فرمول در UI: ۵۱۲ کاراکتر (سرور تا ۱۰۲۴ هم می‌پذیرد؛ برای ادیتور همان ۵۱۲ را نگه دار)
- آرگومان نام‌دار ممنوع: `round(x, ndigits=2)` غلط است → `round(x, 2)`
- نقطه، ایندکس، لامبدا، دیکشنری، ایمپورت ممنوع: `a.b`، `a[0]`، `lambda:`، `{...}`، `__import__`
- `Biomarker.Weight` مال **Intelligence Model / Parametric** است، نه کویسشنری. اینجا باید `q_weight` باشد

اگر یک ورودی خالی باشد یا تقسیم بر صفر شود، آن قانون نتیجه نمی‌دهد؛ بقیه قانون‌ها اجرا می‌شوند.

---

## ۶. توابع مجاز

همه آرگومان‌ها positional هستند.

### جمع و آمار

#### `sum(a, b, c, ...)`

جمع اعداد. مقادیر خالی داخل لیست آرگومان نادیده گرفته می‌شوند؛ ولی اگر **متغیرِ نام‌برده** جواب نداشته باشد، کل فرمول `None` می‌شود.

```text
sum(q_gad_1, q_gad_2, q_gad_3, q_gad_4, q_gad_5, q_gad_6, q_gad_7)
```

برای checkbox با امتیاز، خودِ یک id قبلاً جمع گزینه‌هاست:

```text
sum(q_symptoms)
```

معادل همان `q_symptoms` است.

#### `avg(a, b, ...)`

میانگین. حداقل یک عدد لازم است. `avg()` خالی رد می‌شود.

```text
avg(q_sleep, q_mood, q_energy)
```

#### `min(a, b, ...)` / `max(a, b, ...)`

کوچک‌ترین / بزرگ‌ترین.

```text
min(q_sys, q_dia)
max(q_week1, q_week2, q_week3)
```

### ریاضی

#### `round(x, n)`

`n` تعداد رقم اعشار است (پیش‌فرض ۰ اگر در خود تابع نیاید). علاوه بر این، فیلد **Round digits** روی قانون هم خروجی عددی را گرد می‌کند.

```text
round(q_weight / ((q_height / 100) ** 2), 2)
```

#### `abs(x)`

قدر مطلق.

```text
abs(q_now - q_target)
```

#### `sqrt(x)`

جذر. منفی رد می‌شود.

```text
sqrt(q_area)
```

#### `ln(x)` و `log(x)`

هر دو لگاریتم طبیعی. ورودی باید مثبت باشد.

```text
ln(q_crp)
```

#### `exp(x)`

e به توان x.

```text
exp(q_xb)
```

### شاخه و نگاشت

#### `if_(شرط, مقدار_اگر_درست, مقدار_اگر_غلط)`

هر سه آرگومان الزامی است. خروجی می‌تواند عدد یا متن باشد.

```text
if_(q_smoke == "Yes", "Smoker", "Non-smoker")
if_(q_gad_total >= 15, "Severe", if_(q_gad_total >= 10, "Moderate", "Mild"))
if_(q_bmi >= 30, 1, 0)
```

تو در تو کردن `if_` برای چند آستانه درست است.

### توابع تخصصی (کم‌کاربرد در فرم، ولی مجاز)

#### `status_weight(value, optimal, disease)`

عدد را بین بهینه (`optimal` → ۰) و بیماری (`disease` → ۱) به بازه ۰ تا ۱ نگاشت می‌کند.

```text
status_weight(q_ldl, 100, 130)
status_weight(q_ldl, 100, 130) * 0.3 + status_weight(q_hdl, 60, 40) * 0.2
```

اگر `optimal == disease` و مقدار همان باشد، نتیجه ۰ است؛ وگرنه ۱.

#### `phenoage(albumin, creatinine, glucose, crp, lymph, mcv, rdw, alp, wbc, age)`

PhenoAge لوین ۲۰۱۸ بر حسب سال. **۱۰ آرگومان، به همین ترتیب.** واحدهای مورد انتظار:

| آرگومان | واحد |
|---|---|
| albumin | g/L |
| creatinine | µmol/L |
| glucose | mmol/L |
| crp | mg/dL |
| lymph | ٪ لنفوسیت |
| mcv | fL |
| rdw | ٪ |
| alp | U/L |
| wbc | 10³/µL |
| age | سال |

```text
phenoage(q_alb, q_cr, q_glu, q_crp, q_lymph, q_mcv, q_rdw, q_alp, q_wbc, q_age)
```

اگر واحد سؤال فرق دارد، اول در همین فرمول تبدیل کن (مثلاً creatinine mg/dL × ۸۸.۴).

---

## ۷. الگوهای آماده — همه حالت‌های رایج

از روی این‌ها کپی کن و idها را عوض کن.

### ۷.۱ عدد از دو اندازه — BMI

وزن به kg، قد به cm:

```text
q_weight / ((q_height / 100) ** 2)
```

روی قانون: `round: 2` و `unit: kg/m^2` و `map_to_biomarker: Body Mass Index`.

### ۷.۲ جمع Likert — GAD-7 / PHQ-9

هر آیتم `option_scores` ۰ تا ۳ داشته باشد:

```text
sum(q_gad_1, q_gad_2, q_gad_3, q_gad_4, q_gad_5, q_gad_6, q_gad_7)
```

```text
sum(q_phq_1, q_phq_2, q_phq_3, q_phq_4, q_phq_5, q_phq_6, q_phq_7, q_phq_8, q_phq_9)
```

`round: 0`.

در ادیتور دکمه **Total a score** همین الگو را می‌سازد.

### ۷.۳ میانگین چند نمره

```text
avg(q_energy, q_mood, q_sleep)
```

### ۷.۴ درصد از سقف نمره

مثلاً GAD از ۲۱:

```text
(sum(q_gad_1, q_gad_2, q_gad_3, q_gad_4, q_gad_5, q_gad_6, q_gad_7) / 21) * 100
```

### ۷.۵ آستانه عددی → برچسب

```text
if_(sum(q_gad_1, q_gad_2, q_gad_3, q_gad_4, q_gad_5, q_gad_6, q_gad_7) >= 15, "Severe", if_(sum(q_gad_1, q_gad_2, q_gad_3, q_gad_4, q_gad_5, q_gad_6, q_gad_7) >= 10, "Moderate", if_(sum(q_gad_1, q_gad_2, q_gad_3, q_gad_4, q_gad_5, q_gad_6, q_gad_7) >= 5, "Mild", "Minimal")))
```

اگر طول از ۵۱۲ گذشت، یک قانون جدا برای مجموع بساز (`GAD total`) و قانون دوم را روی همان biomarker نگذار؛ مجموع را از سؤال‌های امتیازدار نگه دار و برچسب را کوتاه‌تر بنویس، یا مجموع را در Insight جدا بگذار.

راه عملی‌تر: قانون اول فقط مجموع را به‌عنوان biomarker عددی بدهد؛ برچسب را با `if_` روی همان مجموع در قانون دوم (insight-only) بساز — **قانون دوم نمی‌تواند خروجی قانون اول را به‌عنوان متغیر بخواند.** هر فرمول فقط id سؤال می‌بیند. پس برچسب را با تکرار `sum(...)` یا با کوتاه کردن آستانه‌ها بنویس.

### ۷.۶ Yes/No → متن biomarker

```text
if_(q_smoke == "Yes", "Smoker", "Non-smoker")
```

در ادیتور دکمه **Map answers to text**.

### ۷.۷ Yes/No → همان جواب، فقط برای Insight

اگر خود سؤال را نمی‌خواهی در Insight بفرستی، یک قانون insight-only بگذار:

- `is_biomarker: false`
- `use_in_insight: true`
- `map_to_biomarker` خالی

```text
if_(smoking == "yes", "smoking", "no")
```

خروجی به‌صورت سؤال/جواب ساختگی به Insight می‌رود؛ ردیف biomarker روی Report ساخته نمی‌شود.

### ۷.۸ کپی لیبل انتخاب (بدون امتیاز)

سؤال: «علت مشکل خواب؟» گزینه‌ها بدون `option_scores`.

```text
q_sleep_problem
```

نتیجه همان متن انتخاب است، مثلاً `Stress`.

### ۷.۹ چندشرط با `and` / `or`

```text
if_(q_smoke == "Yes" and q_age >= 40, "High attention", "Routine")
```

```text
if_(q_pain == "Yes" or q_fatigue == "Yes", "Symptom present", "None")
```

### ۷.۱۰ عدد از شرط

```text
if_(q_exercise == "Yes", q_minutes, 0)
```

اگر `q_minutes` خالی باشد و شرط درست باشد، قانون رد می‌شود. برای «اگر ورزش نمی‌کند صفر»، سؤال دقیقه را required نکن و در فرمول از if روی Yes/No استفاده کن؛ وقتی No است شاخه دوم (`0`) اجرا می‌شود و به دقیقه نیاز نیست — **اما** موتور قبل از `if_` همه نام‌ها را به‌عنوان متغیر لازم چک نمی‌کند؛ فقط وقتی آن شاخه ارزیابی شود. در `if_(cond, a, b)` هر دو شاخه **قبل از صدا زدن تابع** ارزیابی می‌شوند. پس اگر `q_minutes` خالی باشد، کل `if_` می‌میرد.

برای این حالت از ternary پایتون استفاده کن که شاخه استفاده‌نشده را اجرا نمی‌کند:

```text
q_minutes if q_exercise == "Yes" else 0
```

### ۷.۱۱ checkbox امتیازی → یک نمره

```text
q_symptoms
```

یا صریح:

```text
sum(q_symptoms)
```

### ۷.۱۲ نسبت / نرمال‌سازی ۰ تا ۱

```text
status_weight(q_waist, 80, 102)
```

### ۷.۱۳ گرد کردن داخل فرمول (بدون فیلد round)

```text
round(q_weight / ((q_height / 100) ** 2), 1)
```

### ۷.۱۴ فقط ثابت متنی (به‌ندرت مفید)

```text
"Completed"
```

اگر هیچ متغیری نباشد و بیمار فرم را بفرستد، همین متن ذخیره می‌شود.

### ۷.۱۵ مقایسه دو عدد

```text
if_(q_followup < q_baseline, "Improved", "Not improved")
max(0, q_baseline - q_followup)
```

---

## ۸. مثال کامل JSON

```json
{
  "questions": [
    {
      "id": "q_weight",
      "question": "What is your weight?",
      "type": "Number",
      "required": true,
      "response": "",
      "unit": "kg"
    },
    {
      "id": "q_height",
      "question": "What is your height?",
      "type": "Number",
      "required": true,
      "response": "",
      "unit": "cm"
    },
    {
      "id": "q_gad_1",
      "question": "Feeling nervous, anxious, or on edge",
      "type": "multiple_choice",
      "required": true,
      "response": "",
      "options": ["Not at all", "Several days", "More than half the days", "Nearly every day"],
      "option_scores": {
        "Not at all": 0,
        "Several days": 1,
        "More than half the days": 2,
        "Nearly every day": 3
      }
    },
    {
      "id": "smoking",
      "question": "Do you smoke?",
      "type": "Yes/No",
      "required": true,
      "response": "",
      "is_biomarker": false,
      "use_in_insight": false
    }
  ],
  "scoring": [
    {
      "name": "BMI",
      "is_biomarker": true,
      "map_to_biomarker": "Body Mass Index",
      "use_in_insight": true,
      "unit": "kg/m^2",
      "formula": "q_weight / ((q_height / 100) ** 2)",
      "round": 2
    },
    {
      "name": "GAD-7",
      "is_biomarker": true,
      "map_to_biomarker": "Anxiety Level",
      "formula": "sum(q_gad_1)",
      "round": 0
    },
    {
      "name": "smoking",
      "is_biomarker": false,
      "use_in_insight": true,
      "map_to_biomarker": "",
      "formula": "if_(smoking == \"yes\", \"smoking\", \"no\")"
    }
  ]
}
```

`sum(q_gad_1)` در مثال تک‌سؤالی است؛ برای هفت آیتم همه idها را داخل `sum` بگذار.

---

## ۹. بعد از Submit چه می‌شود؟

1. جواب‌ها ذخیره می‌شوند.
2. هر قانون فرمول با idها اجرا می‌شود.
3. اگر `is_biomarker` روشن باشد و اسم کاتالوگ کلینیک پیدا شود، ردیف biomarker نوشته می‌شود و در Report (Need Focus، کارت دسته، و غیره) دیده می‌شود.
4. اگر اسم `map_to_biomarker` در کاتالوگ کلینیک نباشد، ردیف نوشته نمی‌شود (`completed_skipped_catalog_missing`).
5. اگر `use_in_insight` روشن باشد، مقدار به Insight می‌رود — حتی وقتی biomarker خاموش است.
6. خروجی عددی که کاتالوگش باند کیفی دارد (مثلاً Good/Bad for GUT) به‌صورت `BorderlineRange` نمایش داده می‌شود تا روی کارت گم نشود.

قانون خراب یا بدون ورودی، بقیه را خراب نمی‌کند.

---

## ۱۰. خطاهای رایج

| نشانه | علت | کار درست |
|---|---|---|
| Unknown variable در ادیتور | id اشتباه یا هنوز روی سؤال id نگذاشتی | از لیست سؤال کلیک کن |
| قانون ذخیره می‌شود ولی Report خالی است | `map_to_biomarker` عین کاتالوگ نیست | از Clinic biomarker picker انتخاب کن |
| جمع Likert همیشه خالی | `option_scores` نداری | امتیاز ۰٬۱٬۲٬۳ بگذار |
| `if_(q_smoke == "Yes", ...)` کار نمی‌کند | داری با عدد مقایسه می‌کنی یا برعکس | Yes/No را با `"Yes"` مقایسه کن |
| BMI ساخته نمی‌شود | قد یا وزن خالی است | هر دو required باشند |
| Processing می‌ماند ولی بعد از refresh هست | جدا از فرمول است؛ داده معمولاً نوشته شده | یک refresh؛ فرمول را عوض نکن مگر خروجی غلط باشد |
| `round(x, ndigits=2)` رد می‌شود | آرگومان نام‌دار | `round(x, 2)` |
| `Biomarker.Weight` رد می‌شود | نحو Parametric | از id سؤال استفاده کن |
| Insight سیگار نمی‌آید | قانون `is_biomarker: false` بدون `use_in_insight` | Insight را روشن کن |
| متن و عدد مخلوط در `+` | حساب روی لیبل | اول امتیاز بگذار یا `if_` متنی بنویس |

---

## ۱۱. چه چیزی فرمول کویسشنری نیست؟

- **Parametric Biomarkers** در Intelligence Model: `Biomarker.Weight`، `Profile.age`
- **Risk / Health Score / Age Clock**: فرمول جدا روی مدل کلینیک
- هوک قدیمی `use_function_calculation` روی خود سؤال (BMI/GAD هاردکد). برای فرم جدید از همین scoring rules استفاده کن، نه از آن فلگ

---

## ۱۲. چک‌لیست قبل از ذخیره قالب

- هر سؤال استفاده‌شده در فرمول، `id` پایدار دارد
- Likertها `option_scores` دارند و کلید = عین گزینه است
- قانون Report حتماً `map_to_biomarker` از کاتالوگ همان کلینیک دارد
- قانون فقط-Insight: biomarker خاموش، insight روشن
- Yes/No با `"Yes"` / `"No"` مقایسه شده، نه با `1`
- فرمول یک عبارت است، نه چند خط و نه `=`
- طول فرمول ≤ ۵۱۲
- یک‌بار با جواب نمونه Submit کن و Report + Insight را ببین

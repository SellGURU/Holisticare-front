// @ts-nocheck
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  TrendingDown,
  MessageSquare,
  Salad,
  Dumbbell,
  Pill,
  Leaf,
  Syringe,
  ChevronRight,
  Bell,
  Activity,
  Plus,
  ChevronLeft,
  Wifi,
  Heart,
  Footprints,
  Brain,
  AlertTriangle,
  AlertCircle,
  CircleDot,
  Sparkles,
  ClipboardList,
  StickyNote,
  Trash2,
  Clock,
  Send,
  Flame,
  Droplets,
  Zap,
  ShieldAlert,
  FlaskConical,
  Thermometer,
  Beaker,
  Syringe as SyringeIcon,
  Apple,
  Moon,
  Check,
  ChevronDown,
  Info,
  X,
  Scale,
  Ruler,
  HeartPulse,
  Wind,
  Gauge,
  RefreshCw,
  Network,
  Palette,
  Smartphone,
  FileDown,
  Plug,
  Shield,
  PackageOpen,
  Settings,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  CartesianGrid,
} from 'recharts';

const bloodData = [
  { name: 'Optimal', value: 69, fill: '#10B981' },
  { name: 'Reference', value: 24, fill: '#F59E0B' },
  { name: 'Out of range', value: 7, fill: '#EF4444' },
];

const genomeData = [
  { name: 'Strength', value: 19, fill: '#10B981' },
  { name: 'Neutral', value: 60, fill: '#94A3B8' },
  { name: 'Focus', value: 21, fill: '#F59E0B' },
];

const analysisCards = [
  {
    key: 'questionnaires',
    label: 'Questionnaires',
    icon: ClipboardList,
    headerTitle: 'Questionnaire Analysis',
    hasDate: false,
  },
  {
    key: 'wearables',
    label: 'Wearables',
    icon: Wifi,
    headerTitle: 'Wearable Data Analysis',
    hasDate: false,
  },
  {
    key: 'blood',
    label: 'Blood',
    icon: CircleDot,
    headerTitle: 'Blood Panel Analysis',
    hasDate: true,
    dates: ['02 Apr 2025', '15 Nov 2024', '20 Jun 2024'],
  },
  {
    key: 'genome',
    label: 'Genome',
    icon: Brain,
    headerTitle: 'Genome Analysis',
    hasDate: true,
    dates: ['01 Aug 2024', '12 Feb 2023'],
  },
  {
    key: 'microbiome',
    label: 'Microbiome',
    icon: Sparkles,
    headerTitle: 'Microbiome Analysis',
    hasDate: true,
    dates: ['31 Aug 2024', '05 Mar 2024'],
  },
  {
    key: 'fitness',
    label: 'Physical Fitness',
    icon: Footprints,
    headerTitle: 'Physical Fitness Analysis',
    hasDate: true,
    dates: ['12 Mar 2025', '18 Sep 2024', '01 Apr 2024'],
  },
];

const bloodPanels = [
  {
    name: 'Inflammation',
    biomarkers: 6,
    needFocus: 4,
    score: 'C',
    icon: Flame,
  },
  {
    name: 'Cardiac Risk',
    biomarkers: 5,
    needFocus: 3,
    score: 'C+',
    icon: ShieldAlert,
  },
  {
    name: 'Lipid Panel',
    biomarkers: 8,
    needFocus: 3,
    score: 'B',
    icon: Droplets,
  },
  { name: 'Metabolic', biomarkers: 7, needFocus: 2, score: 'B', icon: Zap },
  {
    name: 'Hormone',
    biomarkers: 6,
    needFocus: 2,
    score: 'B+',
    icon: FlaskConical,
  },
  {
    name: 'Thyroid',
    biomarkers: 4,
    needFocus: 1,
    score: 'B+',
    icon: Thermometer,
  },
  {
    name: 'Liver Function',
    biomarkers: 5,
    needFocus: 1,
    score: 'A',
    icon: Beaker,
  },
  {
    name: 'Kidney Function',
    biomarkers: 4,
    needFocus: 0,
    score: 'A',
    icon: Droplets,
  },
  {
    name: 'Immune',
    biomarkers: 5,
    needFocus: 1,
    score: 'A',
    icon: ShieldAlert,
  },
  { name: 'Nutrition', biomarkers: 6, needFocus: 1, score: 'A', icon: Apple },
  { name: 'Sleep Health', biomarkers: 3, needFocus: 2, score: 'B', icon: Moon },
  {
    name: 'Mental Health',
    biomarkers: 4,
    needFocus: 0,
    score: 'A+',
    icon: Brain,
  },
];

const scoreStyles = {
  C: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    badge: 'bg-red-600 text-white',
    iconColor: 'text-red-500',
  },
  'C+': {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
    badge: 'bg-red-500 text-white',
    iconColor: 'text-red-400',
  },
  B: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badge: 'bg-amber-500 text-white',
    iconColor: 'text-amber-500',
  },
  'B+': {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    badge: 'bg-yellow-500 text-white',
    iconColor: 'text-yellow-500',
  },
  A: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-500 text-white',
    iconColor: 'text-emerald-500',
  },
  'A+': {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    badge: 'bg-emerald-600 text-white',
    iconColor: 'text-emerald-600',
  },
};

const initialBloodInsights = [
  {
    id: 1,
    insight:
      'Inflammatory markers indicate an active systemic stress response needing immediate investigation.',
    urgency: 'Urgent',
    confidence: 'High',
    confidenceReason:
      'CRP and IL-6 both elevated >3x upper reference range across two consecutive tests.',
    inPlan: true,
  },
  {
    id: 2,
    insight:
      'ApoB and Lp(a) levels suggest elevated cardiovascular risk requiring lipid management protocol.',
    urgency: 'Urgent',
    confidence: 'High',
    confidenceReason:
      'ApoB at 148 mg/dL exceeds optimal threshold. Lp(a) genetically elevated — confirmed by genome panel.',
    inPlan: true,
  },
  {
    id: 3,
    insight:
      'Fasting insulin and HOMA-IR trending toward insulin resistance — early metabolic intervention recommended.',
    urgency: 'Need Improvement',
    confidence: 'Medium',
    confidenceReason:
      'HOMA-IR at 2.8 is borderline. Single test — retest in 8 weeks recommended to confirm trend.',
    inPlan: true,
  },
  {
    id: 4,
    insight:
      'Thyroid TSH mildly elevated — subclinical hypothyroidism possible, monitor with free T3/T4.',
    urgency: 'Need Improvement',
    confidence: 'Medium',
    confidenceReason:
      'TSH at 4.2 mIU/L is above functional range but within lab reference. Free T4 normal.',
    inPlan: false,
  },
  {
    id: 5,
    insight:
      'Vitamin D levels suboptimal at 28 ng/mL — supplementation protocol should be initiated.',
    urgency: 'Need Improvement',
    confidence: 'High',
    confidenceReason:
      'Consistent suboptimal levels across 3 consecutive tests over 12 months.',
    inPlan: true,
  },
  {
    id: 6,
    insight:
      'Liver enzymes within normal range — no hepatic concerns at this time.',
    urgency: 'Good',
    confidence: 'High',
    confidenceReason:
      'ALT, AST, GGT all within optimal range. Stable across all historical tests.',
    inPlan: false,
  },
  {
    id: 7,
    insight:
      'Cortisol rhythm appears dysregulated — consider 4-point salivary cortisol test for confirmation.',
    urgency: 'Need Improvement',
    confidence: 'Low',
    confidenceReason:
      'Single morning serum cortisol only. Diurnal pattern unknown without salivary panel.',
    inPlan: false,
  },
];

const interventionData = {
  1: {
    title: 'Inflammation — Systemic Stress Response',
    interventions: [
      {
        category: 'Supplement',
        name: 'Omega-3 Fish Oil (EPA/DHA)',
        dose: '3g/day',
        impact: 'Reduces CRP and IL-6 by 20-35%',
      },
      {
        category: 'Diet',
        name: 'Anti-inflammatory Protocol',
        dose: 'Daily',
        impact: 'Eliminates processed foods, adds polyphenol-rich vegetables',
      },
      {
        category: 'Lifestyle',
        name: 'Stress Management — HRV Breathing',
        dose: '10 min 2x/day',
        impact: 'Downregulates cortisol-driven inflammation cascade',
      },
      {
        category: 'Supplement',
        name: 'Curcumin (Bioavailable)',
        dose: '1000mg/day',
        impact: 'NF-kB pathway modulation, synergistic with Omega-3',
      },
    ],
  },
  2: {
    title: 'Cardiovascular Risk — Lipid Management',
    interventions: [
      {
        category: 'Supplement',
        name: 'Berberine HCl',
        dose: '500mg 2x/day',
        impact: 'Reduces LDL-C by 15-25%, improves ApoB ratio',
      },
      {
        category: 'Activity',
        name: 'Zone 2 Cardio Training',
        dose: '150 min/week',
        impact: 'Improves lipid metabolism and endothelial function',
      },
      {
        category: 'Diet',
        name: 'Mediterranean Lipid Protocol',
        dose: 'Daily',
        impact: 'Increases HDL, reduces oxidized LDL particles',
      },
    ],
  },
  3: {
    title: 'Metabolic — Insulin Sensitivity',
    interventions: [
      {
        category: 'Activity',
        name: 'Resistance Training',
        dose: '3x/week',
        impact:
          'Increases GLUT4 expression, improves insulin sensitivity 25-40%',
      },
      {
        category: 'Diet',
        name: 'Time-Restricted Eating (16:8)',
        dose: 'Daily',
        impact: 'Reduces fasting insulin and improves HOMA-IR',
      },
      {
        category: 'Supplement',
        name: 'Chromium Picolinate',
        dose: '400mcg/day',
        impact: 'Enhances insulin receptor sensitivity',
      },
    ],
  },
  5: {
    title: 'Nutrition — Vitamin D Optimization',
    interventions: [
      {
        category: 'Supplement',
        name: 'Vitamin D3 + K2',
        dose: '5000 IU/day',
        impact: 'Target: raise serum 25(OH)D to 50-70 ng/mL',
      },
      {
        category: 'Lifestyle',
        name: 'Morning Sun Exposure',
        dose: '15 min/day',
        impact: 'Natural D3 synthesis, circadian rhythm support',
      },
    ],
  },
  7: {
    title: 'Hormone — Cortisol Rhythm',
    interventions: [
      {
        category: 'Lifestyle',
        name: 'Sleep Hygiene Protocol',
        dose: 'Nightly',
        impact: 'Normalizes cortisol awakening response',
      },
      {
        category: 'Supplement',
        name: 'Ashwagandha KSM-66',
        dose: '600mg/day',
        impact: 'Reduces cortisol by 23% in clinical trials',
      },
    ],
  },
};

const insightDetails = {
  1: {
    description:
      'CRP (8.4 mg/L) and IL-6 (12.3 pg/mL) are both significantly elevated beyond clinical thresholds, indicating a persistent systemic inflammatory state. TNF-alpha (18.5 pg/mL) further confirms an active inflammatory cascade affecting multiple organ systems.',
    reason:
      'Three independent inflammatory markers are simultaneously elevated above their reference ranges across two consecutive blood draws (Nov 2024 and Apr 2025), ruling out transient causes. The pattern suggests chronic low-grade inflammation, a key driver of accelerated aging, cardiovascular disease progression, and metabolic dysfunction. Immediate intervention is critical to prevent downstream complications.',
  },
  2: {
    description:
      'ApoB is measured at 148 mg/dL (optimal < 90) and Lp(a) at 185 nmol/L (optimal < 75), both placing the patient in an elevated atherogenic risk category. Homocysteine at 14.2 umol/L adds a compounding vascular risk factor.',
    reason:
      'ApoB directly measures atherogenic particle count and is a superior predictor of cardiovascular events compared to LDL-C alone. The combination of high ApoB, genetically elevated Lp(a) (confirmed via genome panel), and rising homocysteine creates a compounding risk profile. Lp(a) is largely genetic and non-modifiable by lifestyle alone. Pharmacological strategies and aggressive lipid management are warranted.',
  },
  3: {
    description:
      'Fasting insulin is trending upward and HOMA-IR has reached 2.8, approaching the insulin resistance threshold of 3.0. Fasting glucose remains within normal range, suggesting this is an early-stage metabolic shift before overt dysglycemia appears.',
    reason:
      'HOMA-IR is a sensitive early marker of insulin resistance that precedes fasting glucose elevation by years. Catching this at 2.8 provides a critical intervention window. Dietary and exercise modifications at this stage can reverse the trajectory. If left unaddressed, progression to metabolic syndrome and type 2 diabetes is likely within 3-5 years based on current trend velocity.',
  },
  4: {
    description:
      'TSH measured at 4.2 mIU/L, which falls within the standard lab reference range (0.4-4.5) but exceeds the functional optimal range (1.0-2.5). Free T4 is normal at 1.1 ng/dL, and free T3 has not yet been tested.',
    reason:
      'Subclinical hypothyroidism at this TSH level can contribute to fatigue, weight gain resistance, elevated cholesterol, and mood disturbances. The functional medicine approach recognizes that TSH above 2.5 with symptoms warrants investigation. Free T3 testing is needed to assess actual thyroid hormone conversion efficiency before initiating treatment.',
  },
  5: {
    description:
      'Serum 25(OH)D measured at 28 ng/mL, above the deficiency threshold (< 20) but below the optimal functional range of 50-70 ng/mL. This level has been consistently suboptimal across three consecutive tests spanning 12 months.',
    reason:
      'Vitamin D is a critical immunomodulator, bone health regulator, and mood stabilizer. At 28 ng/mL, the patient is not receiving the protective benefits that optimal levels (50-70 ng/mL) provide, including reduced inflammation, improved insulin sensitivity, and enhanced immune surveillance. The persistent suboptimal level despite adequate sun exposure suggests either absorption issues or insufficient supplementation dosing.',
  },
  6: {
    description:
      'ALT (22 U/L), AST (19 U/L), and GGT (18 U/L) are all within optimal ranges. Albumin is normal at 4.2 g/dL. No signs of hepatic stress, fatty liver, or enzyme elevation.',
    reason:
      'Liver function is monitored as a baseline safety marker, especially given the supplement and intervention protocol being implemented. All hepatic markers have been stable across every historical test, confirming the liver is tolerating the current regimen well. No action needed. Continue monitoring at standard intervals.',
  },
  7: {
    description:
      'Morning serum cortisol measured at 18.2 ug/dL (reference 6-23), which is within range but on the higher end. A single morning draw cannot characterize the full diurnal cortisol rhythm, which is essential for identifying HPA axis dysregulation.',
    reason:
      'The patient reports afternoon energy crashes, difficulty with sleep onset, and increased abdominal fat deposition, all classic signs of cortisol rhythm disruption. A 4-point salivary cortisol test would reveal whether the cortisol curve is flattened, inverted, or showing an abnormal evening spike. This data is needed before prescribing targeted adrenal support interventions.',
  },
};

const initialHistoryInsights = [
  {
    id: 101,
    insight:
      'CRP has risen 163% over 10 months (3.2 to 8.4 mg/L), showing an accelerating inflammatory trajectory with no signs of plateauing.',
    urgency: 'Urgent',
    confidence: 'High',
    confidenceReason:
      'Linear regression across 5 data points shows R-squared of 0.97 with positive slope acceleration in last 2 readings.',
    inPlan: true,
  },
  {
    id: 102,
    insight:
      'ApoB trending steadily upward from 118 to 148 mg/dL over 10 months despite lifestyle modifications initiated in Aug 2024.',
    urgency: 'Urgent',
    confidence: 'High',
    confidenceReason:
      'Consistent upward trend across all 5 data points. No inflection despite diet changes, suggesting pharmacological intervention needed.',
    inPlan: true,
  },
  {
    id: 103,
    insight:
      'Triglycerides crossed from normal into borderline range between Jun and Nov 2024, and continue to drift higher (1.5 to 2.1 mmol/L).',
    urgency: 'Need Improvement',
    confidence: 'Medium',
    confidenceReason:
      'Crossed reference threshold at Nov 2024. Rate of increase has slowed slightly in recent readings but remains upward.',
    inPlan: true,
  },
  {
    id: 104,
    insight:
      'HDL Cholesterol shows a slow but consistent positive trend (1.35 to 1.42 mmol/L), responding well to current activity protocol.',
    urgency: 'Good',
    confidence: 'High',
    confidenceReason:
      'Monotonic increase across all 5 readings. Rate is modest but direction is favorable and consistent with Zone 2 cardio benefits.',
    inPlan: false,
  },
  {
    id: 105,
    insight:
      'Homocysteine has crossed from normal into elevated range (10.5 to 14.2 umol/L) over 10 months, indicating worsening methylation status.',
    urgency: 'Need Improvement',
    confidence: 'High',
    confidenceReason:
      'Crossed the 12 umol/L threshold between Nov 2024 and Jan 2025. Consistent upward trend suggests B-vitamin/folate insufficiency.',
    inPlan: true,
  },
  {
    id: 106,
    insight:
      'Liver function markers (ALT, AST, GGT) have remained stable and within optimal range across all historical tests — no hepatotoxicity signals.',
    urgency: 'Good',
    confidence: 'High',
    confidenceReason:
      'Zero variance trend with all values consistently in optimal zone across 5+ data points over 12 months.',
    inPlan: false,
  },
  {
    id: 107,
    insight:
      'Ferritin has risen 50% (190 to 285 ng/mL) and is approaching the upper reference limit of 300 ng/mL — monitor for iron overload.',
    urgency: 'Need Improvement',
    confidence: 'Medium',
    confidenceReason:
      'Steady upward trajectory. Still within reference but approaching threshold. Rate suggests it will cross into high range within 3-4 months.',
    inPlan: false,
  },
];

const historyInsightDetails = {
  101: {
    description:
      'CRP has followed an accelerating upward curve from 3.2 mg/L in Jun 2024 to 8.4 mg/L in Apr 2025. The rate of increase has accelerated in the last two readings (Jan and Apr 2025), suggesting the inflammatory driver is intensifying rather than stabilizing. IL-6 and TNF-alpha show parallel escalation patterns.',
    reason:
      'The 163% increase over 10 months with acceleration in recent months indicates that current anti-inflammatory interventions are insufficient. The correlation between CRP, IL-6, and TNF-alpha rising in parallel confirms a systemic source rather than localized inflammation. Without escalation of the intervention protocol, projection models suggest CRP could exceed 12 mg/L by Aug 2025, entering the high-risk zone for cardiovascular events.',
  },
  102: {
    description:
      'ApoB has increased from 118 mg/dL to 148 mg/dL across 5 consecutive tests. The Mediterranean diet protocol initiated in Aug 2024 has not produced the expected LDL particle reduction. Each quarterly reading shows approximately 7-8 mg/dL increase, suggesting the dietary approach alone is failing to counteract the underlying lipid dysregulation.',
    reason:
      'The steady upward trend despite active dietary intervention indicates that lifestyle modification alone is insufficient for this patient. Given the genetically elevated Lp(a) (confirmed via genome panel), the atherogenic burden is compounding. Current trajectory projects ApoB exceeding 170 mg/dL within 6 months. Berberine or statin therapy should be strongly considered alongside the existing protocol to achieve a meaningful inflection point.',
  },
  103: {
    description:
      'Triglycerides crossed from 1.5 mmol/L (normal) in Jun 2024 to 2.1 mmol/L (borderline) by Apr 2025. The crossing into borderline territory occurred between Aug and Nov 2024. The rate of increase has modestly slowed in recent readings (0.1 mmol/L per quarter vs 0.2 earlier), suggesting partial response to time-restricted eating protocol.',
    reason:
      'While the rate of increase is decelerating, the direction remains upward and the patient is now firmly in the borderline range. Elevated triglycerides combined with rising LDL and borderline HDL create an atherogenic dyslipidemia pattern. The partial response to TRE suggests metabolic benefit but insufficient magnitude. Adding structured resistance training and potentially fish oil supplementation could provide the additional reduction needed to reverse the trend.',
  },
  104: {
    description:
      'HDL Cholesterol has shown a consistent upward trend from 1.35 to 1.42 mmol/L over 10 months. The increase is modest (+0.07 mmol/L total) but monotonically positive across all 5 data points. The patient is currently in the healthy range (1.30-1.55) and trending toward optimal (>1.55).',
    reason:
      'This is a positive outcome validating the Zone 2 cardio protocol initiated in the intervention plan. HDL is notoriously difficult to raise through intervention, so any consistent upward movement is clinically significant. At the current rate of improvement (+0.07/10 months), the patient would reach the optimal threshold of 1.55 mmol/L in approximately 18 additional months. Maintaining current activity levels is essential — no escalation needed, but reduction would likely stall progress.',
  },
  105: {
    description:
      'Homocysteine has risen from 10.5 umol/L (normal) to 14.2 umol/L (elevated) over 10 months, crossing the 12 umol/L clinical threshold between Nov 2024 and Jan 2025. The rate of increase is approximately 0.9 umol/L per quarter, showing no signs of deceleration.',
    reason:
      'Rising homocysteine is an independent cardiovascular risk factor and indicates impaired methylation cycle function. The steady upward trend without plateau suggests progressive depletion of methylfolate and/or B12 cofactors. This is compounding the cardiovascular risk already elevated by ApoB and Lp(a). Methylfolate + B12 supplementation should reduce homocysteine by 25-30% within 8 weeks, which would bring levels back below the 12 umol/L threshold.',
  },
  106: {
    description:
      'ALT, AST, and GGT have remained virtually flat across all historical readings, with no individual value exceeding 25 U/L. This stability persists despite the introduction of multiple supplements (Omega-3, Curcumin, Berberine, Ashwagandha) over the past 6 months.',
    reason:
      'Hepatic safety monitoring is critical when patients are on multi-supplement protocols, as some compounds (particularly Berberine at high doses) can cause transient liver enzyme elevation. The complete stability of all hepatic markers confirms excellent tolerability of the current regimen. This data supports the safety of continuing and potentially escalating supplementation if needed for other biomarker targets.',
  },
  107: {
    description:
      'Ferritin has risen steadily from 190 ng/mL in Jun 2024 to 285 ng/mL in Apr 2025, approaching the upper reference limit of 300 ng/mL. The rate of increase is approximately 24 ng/mL per quarter. At this trajectory, it will exceed 300 ng/mL by the next quarterly draw.',
    reason:
      'While ferritin within reference range is not immediately concerning, the consistent upward trend warrants monitoring. Elevated ferritin can indicate iron overload, chronic inflammation (which aligns with the CRP trend), or metabolic syndrome. Given the concurrent inflammatory markers, this rise is likely inflammation-driven rather than true iron overload. However, transferrin saturation and serum iron should be checked to rule out hemochromatosis, especially before the value crosses 300 ng/mL.',
  },
};

const historyInterventionData = {
  101: {
    title: 'Inflammation Trend — Escalated Protocol',
    interventions: [
      {
        category: 'Supplement',
        name: 'Omega-3 Dose Escalation (EPA/DHA)',
        dose: '4g/day (from 3g)',
        impact: 'Higher dose needed given accelerating CRP trajectory',
      },
      {
        category: 'Diet',
        name: 'Strict Elimination Protocol',
        dose: '8 weeks',
        impact:
          'Remove dairy, gluten, and nightshades to identify inflammatory triggers',
      },
      {
        category: 'Lifestyle',
        name: 'Cold Exposure Therapy',
        dose: '3 min/day',
        impact: 'Activates anti-inflammatory norepinephrine pathway',
      },
    ],
  },
  102: {
    title: 'ApoB Trend — Pharmacological Escalation',
    interventions: [
      {
        category: 'Supplement',
        name: 'Berberine HCl (Escalated)',
        dose: '500mg 3x/day',
        impact:
          'Increase from 2x to 3x daily given insufficient dietary response',
      },
      {
        category: 'Activity',
        name: 'HIIT Protocol Addition',
        dose: '2x/week',
        impact:
          'Higher intensity exercise shown to reduce ApoB by additional 8-12%',
      },
      {
        category: 'Supplement',
        name: 'Red Yeast Rice Extract',
        dose: '1200mg/day',
        impact: 'Natural statin alternative — monitor liver enzymes at 4 weeks',
      },
    ],
  },
  103: {
    title: 'Triglyceride Trend — Metabolic Support',
    interventions: [
      {
        category: 'Activity',
        name: 'Resistance Training Addition',
        dose: '3x/week',
        impact:
          'Muscle mass increase improves triglyceride clearance by 15-20%',
      },
      {
        category: 'Supplement',
        name: 'High-Dose Fish Oil (EPA)',
        dose: '2g EPA/day',
        impact: 'EPA specifically targets triglyceride synthesis in liver',
      },
      {
        category: 'Diet',
        name: 'Carbohydrate Cycling',
        dose: 'Daily',
        impact: 'Reduces hepatic triglyceride production on low-carb days',
      },
    ],
  },
  105: {
    title: 'Homocysteine Trend — Methylation Support',
    interventions: [
      {
        category: 'Supplement',
        name: 'Methylfolate (5-MTHF)',
        dose: '1000mcg/day',
        impact:
          'Direct methylation support — bypasses MTHFR polymorphism if present',
      },
      {
        category: 'Supplement',
        name: 'Methylcobalamin (B12)',
        dose: '1000mcg/day',
        impact: 'Essential cofactor for homocysteine conversion to methionine',
      },
      {
        category: 'Supplement',
        name: 'P-5-P (Active B6)',
        dose: '50mg/day',
        impact:
          'Supports transsulfuration pathway as secondary clearance route',
      },
    ],
  },
  107: {
    title: 'Ferritin Trend — Monitoring Protocol',
    interventions: [
      {
        category: 'Lifestyle',
        name: 'Transferrin Saturation Test',
        dose: 'Next draw',
        impact: 'Rule out true iron overload vs inflammation-driven elevation',
      },
      {
        category: 'Diet',
        name: 'Reduce Heme Iron Intake',
        dose: 'Precautionary',
        impact: 'Limit red meat to 2x/week until iron status clarified',
      },
    ],
  },
};

const catColors = {
  Supplement: 'bg-purple-100 text-purple-700',
  Diet: 'bg-green-100 text-green-700',
  Activity: 'bg-blue-100 text-blue-700',
  Lifestyle: 'bg-amber-100 text-amber-700',
  Peptide: 'bg-pink-100 text-pink-700',
};

const panelBiomarkers = {
  Inflammation: [
    {
      name: 'CRP',
      unit: 'mg/L',
      value: 8.4,
      zones: [
        { label: 'Optimal', range: '< 1.0', pct: 20 },
        { label: 'Normal', range: '1.0 - 3.0', pct: 25 },
        { label: 'Elevated', range: '3.0 - 10.0', pct: 30 },
        { label: 'High', range: '> 10.0', pct: 25 },
      ],
      markerPct: 72,
      status: 'out',
      history: [
        { d: 'Jun 24', v: 3.2 },
        { d: 'Aug 24', v: 4.8 },
        { d: 'Nov 24', v: 6.1 },
        { d: 'Jan 25', v: 7.9 },
        { d: 'Apr 25', v: 8.4 },
      ],
      refLow: 0,
      refHigh: 3.0,
    },
    {
      name: 'IL-6',
      unit: 'pg/mL',
      value: 12.3,
      zones: [
        { label: 'Optimal', range: '< 1.8', pct: 25 },
        { label: 'Normal', range: '1.8 - 5.0', pct: 25 },
        { label: 'Elevated', range: '5.0 - 15.0', pct: 25 },
        { label: 'High', range: '> 15.0', pct: 25 },
      ],
      markerPct: 65,
      status: 'out',
      history: [
        { d: 'Jun 24', v: 4.1 },
        { d: 'Aug 24', v: 6.7 },
        { d: 'Nov 24', v: 9.2 },
        { d: 'Jan 25', v: 11.0 },
        { d: 'Apr 25', v: 12.3 },
      ],
      refLow: 0,
      refHigh: 5.0,
    },
    {
      name: 'TNF-alpha',
      unit: 'pg/mL',
      value: 18.5,
      zones: [
        { label: 'Normal', range: '< 8.1', pct: 30 },
        { label: 'Borderline', range: '8.1 - 15.0', pct: 30 },
        { label: 'Elevated', range: '> 15.0', pct: 40 },
      ],
      markerPct: 78,
      status: 'out',
      history: [
        { d: 'Jun 24', v: 9.2 },
        { d: 'Aug 24', v: 12.4 },
        { d: 'Nov 24', v: 15.1 },
        { d: 'Jan 25', v: 17.0 },
        { d: 'Apr 25', v: 18.5 },
      ],
      refLow: 0,
      refHigh: 8.1,
    },
    {
      name: 'Ferritin',
      unit: 'ng/mL',
      value: 285,
      zones: [
        { label: 'Low', range: '< 30', pct: 15 },
        { label: 'Normal', range: '30 - 300', pct: 55 },
        { label: 'High', range: '> 300', pct: 30 },
      ],
      markerPct: 52,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 190 },
        { d: 'Aug 24', v: 220 },
        { d: 'Nov 24', v: 255 },
        { d: 'Jan 25', v: 270 },
        { d: 'Apr 25', v: 285 },
      ],
      refLow: 30,
      refHigh: 300,
    },
    {
      name: 'ESR',
      unit: 'mm/hr',
      value: 22,
      zones: [
        { label: 'Normal', range: '< 15', pct: 40 },
        { label: 'Borderline', range: '15 - 30', pct: 30 },
        { label: 'Elevated', range: '> 30', pct: 30 },
      ],
      markerPct: 52,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 12 },
        { d: 'Aug 24', v: 16 },
        { d: 'Nov 24', v: 19 },
        { d: 'Jan 25', v: 21 },
        { d: 'Apr 25', v: 22 },
      ],
      refLow: 0,
      refHigh: 15,
    },
    {
      name: 'Fibrinogen',
      unit: 'mg/dL',
      value: 380,
      zones: [
        { label: 'Low', range: '< 200', pct: 20 },
        { label: 'Normal', range: '200 - 400', pct: 45 },
        { label: 'Elevated', range: '> 400', pct: 35 },
      ],
      markerPct: 58,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 310 },
        { d: 'Aug 24', v: 340 },
        { d: 'Nov 24', v: 355 },
        { d: 'Jan 25', v: 370 },
        { d: 'Apr 25', v: 380 },
      ],
      refLow: 200,
      refHigh: 400,
    },
  ],
  'Cardiac Risk': [
    {
      name: 'ApoB',
      unit: 'mg/dL',
      value: 148,
      zones: [
        { label: 'Optimal', range: '< 90', pct: 30 },
        { label: 'Borderline', range: '90 - 120', pct: 25 },
        { label: 'High', range: '> 120', pct: 45 },
      ],
      markerPct: 75,
      status: 'out',
      history: [
        { d: 'Jun 24', v: 118 },
        { d: 'Aug 24', v: 125 },
        { d: 'Nov 24', v: 135 },
        { d: 'Jan 25', v: 142 },
        { d: 'Apr 25', v: 148 },
      ],
      refLow: 0,
      refHigh: 90,
    },
    {
      name: 'Lp(a)',
      unit: 'nmol/L',
      value: 185,
      zones: [
        { label: 'Optimal', range: '< 75', pct: 30 },
        { label: 'Borderline', range: '75 - 125', pct: 25 },
        { label: 'High', range: '> 125', pct: 45 },
      ],
      markerPct: 80,
      status: 'out',
      history: [
        { d: 'Jun 24', v: 178 },
        { d: 'Aug 24', v: 180 },
        { d: 'Nov 24', v: 183 },
        { d: 'Jan 25', v: 184 },
        { d: 'Apr 25', v: 185 },
      ],
      refLow: 0,
      refHigh: 75,
    },
    {
      name: 'Homocysteine',
      unit: 'umol/L',
      value: 14.2,
      zones: [
        { label: 'Optimal', range: '< 7', pct: 25 },
        { label: 'Normal', range: '7 - 12', pct: 35 },
        { label: 'Elevated', range: '> 12', pct: 40 },
      ],
      markerPct: 68,
      status: 'out',
      history: [
        { d: 'Jun 24', v: 10.5 },
        { d: 'Aug 24', v: 11.8 },
        { d: 'Nov 24', v: 12.9 },
        { d: 'Jan 25', v: 13.5 },
        { d: 'Apr 25', v: 14.2 },
      ],
      refLow: 0,
      refHigh: 12,
    },
    {
      name: 'BNP',
      unit: 'pg/mL',
      value: 42,
      zones: [
        { label: 'Normal', range: '< 100', pct: 55 },
        { label: 'Borderline', range: '100 - 400', pct: 30 },
        { label: 'High', range: '> 400', pct: 15 },
      ],
      markerPct: 22,
      status: 'optimal',
      history: [
        { d: 'Jun 24', v: 38 },
        { d: 'Aug 24', v: 40 },
        { d: 'Nov 24', v: 41 },
        { d: 'Jan 25', v: 43 },
        { d: 'Apr 25', v: 42 },
      ],
      refLow: 0,
      refHigh: 100,
    },
    {
      name: 'hs-CRP Cardiac',
      unit: 'mg/L',
      value: 3.8,
      zones: [
        { label: 'Low Risk', range: '< 1.0', pct: 25 },
        { label: 'Average', range: '1.0 - 3.0', pct: 35 },
        { label: 'High Risk', range: '> 3.0', pct: 40 },
      ],
      markerPct: 70,
      status: 'out',
      history: [
        { d: 'Jun 24', v: 1.9 },
        { d: 'Aug 24', v: 2.5 },
        { d: 'Nov 24', v: 3.1 },
        { d: 'Jan 25', v: 3.5 },
        { d: 'Apr 25', v: 3.8 },
      ],
      refLow: 0,
      refHigh: 3.0,
    },
  ],
  'Lipid Panel': [
    {
      name: 'Total Cholesterol',
      unit: 'mmol/L',
      value: 5.8,
      zones: [
        { label: 'Optimal', range: '< 4.5', pct: 25 },
        { label: 'Healthy', range: '4.5 - 5.8', pct: 30 },
        { label: 'Mildly High', range: '5.8 - 7.1', pct: 25 },
        { label: 'High', range: '> 7.1', pct: 20 },
      ],
      markerPct: 55,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 5.1 },
        { d: 'Aug 24', v: 5.3 },
        { d: 'Nov 24', v: 5.5 },
        { d: 'Jan 25', v: 5.7 },
        { d: 'Apr 25', v: 5.8 },
      ],
      refLow: 4.5,
      refHigh: 5.8,
    },
    {
      name: 'HDL Cholesterol',
      unit: 'mmol/L',
      value: 1.42,
      zones: [
        { label: 'Disease', range: '< 1.04', pct: 20 },
        { label: 'Borderline', range: '1.04 - 1.30', pct: 20 },
        { label: 'Healthy', range: '1.30 - 1.55', pct: 30 },
        { label: 'Optimal', range: '> 1.55', pct: 30 },
      ],
      markerPct: 58,
      status: 'optimal',
      history: [
        { d: 'Jun 24', v: 1.35 },
        { d: 'Aug 24', v: 1.38 },
        { d: 'Nov 24', v: 1.4 },
        { d: 'Jan 25', v: 1.41 },
        { d: 'Apr 25', v: 1.42 },
      ],
      refLow: 1.3,
      refHigh: 1.55,
    },
    {
      name: 'LDL Cholesterol',
      unit: 'mmol/L',
      value: 3.9,
      zones: [
        { label: 'Optimal', range: '< 2.6', pct: 25 },
        { label: 'Near Optimal', range: '2.6 - 3.4', pct: 25 },
        { label: 'Borderline', range: '3.4 - 4.1', pct: 25 },
        { label: 'High', range: '> 4.1', pct: 25 },
      ],
      markerPct: 68,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 3.2 },
        { d: 'Aug 24', v: 3.4 },
        { d: 'Nov 24', v: 3.6 },
        { d: 'Jan 25', v: 3.8 },
        { d: 'Apr 25', v: 3.9 },
      ],
      refLow: 2.6,
      refHigh: 3.4,
    },
    {
      name: 'Triglycerides',
      unit: 'mmol/L',
      value: 2.1,
      zones: [
        { label: 'Normal', range: '< 1.7', pct: 40 },
        { label: 'Borderline', range: '1.7 - 2.3', pct: 25 },
        { label: 'High', range: '> 2.3', pct: 35 },
      ],
      markerPct: 55,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 1.5 },
        { d: 'Aug 24', v: 1.7 },
        { d: 'Nov 24', v: 1.9 },
        { d: 'Jan 25', v: 2.0 },
        { d: 'Apr 25', v: 2.1 },
      ],
      refLow: 0,
      refHigh: 1.7,
    },
  ],
};

const panelInterventions = {
  Inflammation: {
    title: 'Inflammation Panel — Reduce Systemic Markers',
    interventions: [
      {
        category: 'Supplement',
        name: 'Omega-3 Fish Oil (EPA/DHA)',
        dose: '3g/day',
        impact: 'Reduces CRP and IL-6 by 20-35%',
      },
      {
        category: 'Diet',
        name: 'Anti-inflammatory Protocol',
        dose: 'Daily',
        impact: 'Eliminates processed foods, adds polyphenol-rich vegetables',
      },
      {
        category: 'Supplement',
        name: 'Curcumin (Bioavailable)',
        dose: '1000mg/day',
        impact: 'NF-kB pathway modulation',
      },
    ],
  },
  'Cardiac Risk': {
    title: 'Cardiac Risk — Lipid & Vascular Protection',
    interventions: [
      {
        category: 'Supplement',
        name: 'Berberine HCl',
        dose: '500mg 2x/day',
        impact: 'Reduces LDL-C by 15-25%, improves ApoB ratio',
      },
      {
        category: 'Activity',
        name: 'Zone 2 Cardio Training',
        dose: '150 min/week',
        impact: 'Improves lipid metabolism and endothelial function',
      },
      {
        category: 'Supplement',
        name: 'Methylfolate + B12',
        dose: 'Daily',
        impact: 'Reduces homocysteine by 25-30%',
      },
    ],
  },
  'Lipid Panel': {
    title: 'Lipid Panel — Cholesterol Optimization',
    interventions: [
      {
        category: 'Diet',
        name: 'Mediterranean Lipid Protocol',
        dose: 'Daily',
        impact: 'Increases HDL, reduces oxidized LDL particles',
      },
      {
        category: 'Activity',
        name: 'Zone 2 Cardio Training',
        dose: '150 min/week',
        impact: 'Raises HDL 5-10%, lowers triglycerides',
      },
      {
        category: 'Supplement',
        name: 'Plant Sterols',
        dose: '2g/day',
        impact: 'Reduces LDL absorption by 10-15%',
      },
    ],
  },
};

const scoreToNum = { C: 1, 'C+': 2, B: 3, 'B+': 4, A: 5, 'A+': 6 };
const numToScore = { 1: 'C', 2: 'C+', 3: 'B', 4: 'B+', 5: 'A', 6: 'A+' };

const panelScoreHistory = [
  {
    date: 'Jun 2024',
    Inflammation: 2,
    'Cardiac Risk': 3,
    'Lipid Panel': 4,
    Metabolic: 4,
    Hormone: 3,
    Thyroid: 4,
    'Liver Function': 5,
    'Kidney Function': 5,
    Immune: 4,
    Nutrition: 3,
    'Sleep Health': 4,
    'Mental Health': 5,
  },
  {
    date: 'Nov 2024',
    Inflammation: 2,
    'Cardiac Risk': 2,
    'Lipid Panel': 3,
    Metabolic: 3,
    Hormone: 4,
    Thyroid: 4,
    'Liver Function': 5,
    'Kidney Function': 5,
    Immune: 5,
    Nutrition: 4,
    'Sleep Health': 3,
    'Mental Health': 6,
  },
  {
    date: 'Apr 2025',
    Inflammation: 1,
    'Cardiac Risk': 2,
    'Lipid Panel': 3,
    Metabolic: 3,
    Hormone: 4,
    Thyroid: 4,
    'Liver Function': 5,
    'Kidney Function': 5,
    Immune: 5,
    Nutrition: 5,
    'Sleep Health': 3,
    'Mental Health': 6,
  },
];

const panelLineColors = {
  Inflammation: '#EF4444',
  'Cardiac Risk': '#F97316',
  'Lipid Panel': '#F59E0B',
  Metabolic: '#EAB308',
  Hormone: '#84CC16',
  Thyroid: '#22C55E',
  'Liver Function': '#10B981',
  'Kidney Function': '#14B8A6',
  Immune: '#06B6D4',
  Nutrition: '#3B82F6',
  'Sleep Health': '#8B5CF6',
  'Mental Health': '#EC4899',
};

const fitnessPanels = [
  {
    name: 'Body Composition',
    biomarkers: 5,
    needFocus: 3,
    score: 'B',
    icon: Scale,
  },
  {
    name: 'Body Measurements',
    biomarkers: 3,
    needFocus: 1,
    score: 'B+',
    icon: Ruler,
  },
  {
    name: 'Cardiovascular Health',
    biomarkers: 4,
    needFocus: 2,
    score: 'B',
    icon: HeartPulse,
  },
  {
    name: 'Respiratory Function',
    biomarkers: 4,
    needFocus: 0,
    score: 'A',
    icon: Wind,
  },
  {
    name: 'Vital Signs',
    biomarkers: 3,
    needFocus: 1,
    score: 'B+',
    icon: Gauge,
  },
  {
    name: 'Strength',
    biomarkers: 3,
    needFocus: 2,
    score: 'C+',
    icon: Dumbbell,
  },
];

const fitnessPanelBiomarkers = {
  'Body Composition': [
    {
      name: 'BMI',
      unit: 'kg/m2',
      value: 27.1,
      zones: [
        { label: 'Underweight', range: '< 18.5', pct: 15 },
        { label: 'Normal', range: '18.5 - 24.9', pct: 30 },
        { label: 'Overweight', range: '25 - 29.9', pct: 30 },
        { label: 'Obese', range: '> 30', pct: 25 },
      ],
      markerPct: 62,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 28.3 },
        { d: 'Aug 24', v: 27.8 },
        { d: 'Nov 24', v: 27.5 },
        { d: 'Jan 25', v: 27.3 },
        { d: 'Apr 25', v: 27.1 },
      ],
      refLow: 18.5,
      refHigh: 24.9,
    },
    {
      name: 'Body Fat %',
      unit: '%',
      value: 31.5,
      zones: [
        { label: 'Athletic', range: '< 20', pct: 20 },
        { label: 'Fit', range: '20 - 25', pct: 25 },
        { label: 'Average', range: '25 - 32', pct: 30 },
        { label: 'Obese', range: '> 32', pct: 25 },
      ],
      markerPct: 68,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 34.2 },
        { d: 'Aug 24', v: 33.1 },
        { d: 'Nov 24', v: 32.4 },
        { d: 'Jan 25', v: 31.9 },
        { d: 'Apr 25', v: 31.5 },
      ],
      refLow: 20,
      refHigh: 25,
    },
    {
      name: 'Visceral Fat',
      unit: 'rating',
      value: 12,
      zones: [
        { label: 'Healthy', range: '1 - 9', pct: 45 },
        { label: 'Borderline', range: '10 - 14', pct: 30 },
        { label: 'High', range: '> 14', pct: 25 },
      ],
      markerPct: 58,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 14 },
        { d: 'Aug 24', v: 13 },
        { d: 'Nov 24', v: 13 },
        { d: 'Jan 25', v: 12 },
        { d: 'Apr 25', v: 12 },
      ],
      refLow: 1,
      refHigh: 9,
    },
  ],
  'Body Measurements': [
    {
      name: 'Waist Circumference',
      unit: 'cm',
      value: 84,
      zones: [
        { label: 'Optimal', range: '< 80', pct: 40 },
        { label: 'Borderline', range: '80 - 88', pct: 30 },
        { label: 'High Risk', range: '> 88', pct: 30 },
      ],
      markerPct: 52,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 89 },
        { d: 'Aug 24', v: 87 },
        { d: 'Nov 24', v: 86 },
        { d: 'Jan 25', v: 85 },
        { d: 'Apr 25', v: 84 },
      ],
      refLow: 0,
      refHigh: 80,
    },
    {
      name: 'Waist-to-Hip Ratio',
      unit: '',
      value: 0.82,
      zones: [
        { label: 'Low Risk', range: '< 0.80', pct: 40 },
        { label: 'Moderate', range: '0.80 - 0.85', pct: 30 },
        { label: 'High Risk', range: '> 0.85', pct: 30 },
      ],
      markerPct: 52,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 0.86 },
        { d: 'Aug 24', v: 0.85 },
        { d: 'Nov 24', v: 0.84 },
        { d: 'Jan 25', v: 0.83 },
        { d: 'Apr 25', v: 0.82 },
      ],
      refLow: 0,
      refHigh: 0.8,
    },
    {
      name: 'Waist-to-Height Ratio',
      unit: '',
      value: 0.5,
      zones: [
        { label: 'Healthy', range: '< 0.50', pct: 45 },
        { label: 'Borderline', range: '0.50 - 0.55', pct: 25 },
        { label: 'Elevated', range: '> 0.55', pct: 30 },
      ],
      markerPct: 45,
      status: 'optimal',
      history: [
        { d: 'Jun 24', v: 0.53 },
        { d: 'Aug 24', v: 0.52 },
        { d: 'Nov 24', v: 0.51 },
        { d: 'Jan 25', v: 0.51 },
        { d: 'Apr 25', v: 0.5 },
      ],
      refLow: 0,
      refHigh: 0.5,
    },
  ],
  'Cardiovascular Health': [
    {
      name: 'VO2 Max',
      unit: 'ml/kg/min',
      value: 43,
      zones: [
        { label: 'Poor', range: '< 35', pct: 20 },
        { label: 'Fair', range: '35 - 40', pct: 20 },
        { label: 'Average', range: '40 - 45', pct: 25 },
        { label: 'Good', range: '> 45', pct: 35 },
      ],
      markerPct: 52,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 38 },
        { d: 'Aug 24', v: 40 },
        { d: 'Nov 24', v: 41 },
        { d: 'Jan 25', v: 42 },
        { d: 'Apr 25', v: 43 },
      ],
      refLow: 40,
      refHigh: 45,
    },
    {
      name: 'Resting Heart Rate',
      unit: 'bpm',
      value: 68,
      zones: [
        { label: 'Athletic', range: '< 60', pct: 25 },
        { label: 'Good', range: '60 - 70', pct: 30 },
        { label: 'Normal', range: '70 - 80', pct: 25 },
        { label: 'Elevated', range: '> 80', pct: 20 },
      ],
      markerPct: 40,
      status: 'optimal',
      history: [
        { d: 'Jun 24', v: 74 },
        { d: 'Aug 24', v: 72 },
        { d: 'Nov 24', v: 70 },
        { d: 'Jan 25', v: 69 },
        { d: 'Apr 25', v: 68 },
      ],
      refLow: 60,
      refHigh: 70,
    },
    {
      name: 'HRV (RMSSD)',
      unit: 'ms',
      value: 38,
      zones: [
        { label: 'Low', range: '< 30', pct: 25 },
        { label: 'Below Avg', range: '30 - 50', pct: 30 },
        { label: 'Average', range: '50 - 70', pct: 25 },
        { label: 'Good', range: '> 70', pct: 20 },
      ],
      markerPct: 38,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 28 },
        { d: 'Aug 24', v: 33 },
        { d: 'Nov 24', v: 36 },
        { d: 'Jan 25', v: 37 },
        { d: 'Apr 25', v: 38 },
      ],
      refLow: 30,
      refHigh: 50,
    },
  ],
  'Respiratory Function': [
    {
      name: 'SpO2',
      unit: '%',
      value: 98,
      zones: [
        { label: 'Critical', range: '< 90', pct: 10 },
        { label: 'Concerning', range: '90 - 95', pct: 15 },
        { label: 'Normal', range: '95 - 100', pct: 75 },
      ],
      markerPct: 85,
      status: 'optimal',
      history: [
        { d: 'Jun 24', v: 97 },
        { d: 'Aug 24', v: 98 },
        { d: 'Nov 24', v: 98 },
        { d: 'Jan 25', v: 97 },
        { d: 'Apr 25', v: 98 },
      ],
      refLow: 95,
      refHigh: 100,
    },
    {
      name: 'Respiratory Rate',
      unit: '/min',
      value: 14,
      zones: [
        { label: 'Low', range: '< 12', pct: 15 },
        { label: 'Normal', range: '12 - 20', pct: 55 },
        { label: 'Elevated', range: '> 20', pct: 30 },
      ],
      markerPct: 38,
      status: 'optimal',
      history: [
        { d: 'Jun 24', v: 16 },
        { d: 'Aug 24', v: 15 },
        { d: 'Nov 24', v: 15 },
        { d: 'Jan 25', v: 14 },
        { d: 'Apr 25', v: 14 },
      ],
      refLow: 12,
      refHigh: 20,
    },
    {
      name: 'FEV1/FVC Ratio',
      unit: '%',
      value: 80,
      zones: [
        { label: 'Obstructive', range: '< 70', pct: 25 },
        { label: 'Borderline', range: '70 - 75', pct: 15 },
        { label: 'Normal', range: '75 - 85', pct: 35 },
        { label: 'Optimal', range: '> 85', pct: 25 },
      ],
      markerPct: 62,
      status: 'optimal',
      history: [
        { d: 'Jun 24', v: 78 },
        { d: 'Aug 24', v: 79 },
        { d: 'Nov 24', v: 80 },
        { d: 'Jan 25', v: 80 },
        { d: 'Apr 25', v: 80 },
      ],
      refLow: 75,
      refHigh: 85,
    },
  ],
  'Vital Signs': [
    {
      name: 'Systolic BP',
      unit: 'mmHg',
      value: 128,
      zones: [
        { label: 'Low', range: '< 90', pct: 10 },
        { label: 'Optimal', range: '90 - 120', pct: 35 },
        { label: 'Elevated', range: '120 - 130', pct: 25 },
        { label: 'High', range: '> 130', pct: 30 },
      ],
      markerPct: 58,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 135 },
        { d: 'Aug 24', v: 132 },
        { d: 'Nov 24', v: 130 },
        { d: 'Jan 25', v: 129 },
        { d: 'Apr 25', v: 128 },
      ],
      refLow: 90,
      refHigh: 120,
    },
    {
      name: 'Diastolic BP',
      unit: 'mmHg',
      value: 82,
      zones: [
        { label: 'Low', range: '< 60', pct: 10 },
        { label: 'Normal', range: '60 - 80', pct: 40 },
        { label: 'Elevated', range: '80 - 90', pct: 25 },
        { label: 'High', range: '> 90', pct: 25 },
      ],
      markerPct: 55,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 88 },
        { d: 'Aug 24', v: 86 },
        { d: 'Nov 24', v: 84 },
        { d: 'Jan 25', v: 83 },
        { d: 'Apr 25', v: 82 },
      ],
      refLow: 60,
      refHigh: 80,
    },
    {
      name: 'Temperature',
      unit: 'C',
      value: 36.8,
      zones: [
        { label: 'Low', range: '< 36.1', pct: 10 },
        { label: 'Normal', range: '36.1 - 37.2', pct: 60 },
        { label: 'Elevated', range: '37.2 - 38', pct: 20 },
        { label: 'Fever', range: '> 38', pct: 10 },
      ],
      markerPct: 48,
      status: 'optimal',
      history: [
        { d: 'Jun 24', v: 36.7 },
        { d: 'Aug 24', v: 36.8 },
        { d: 'Nov 24', v: 36.9 },
        { d: 'Jan 25', v: 36.7 },
        { d: 'Apr 25', v: 36.8 },
      ],
      refLow: 36.1,
      refHigh: 37.2,
    },
  ],
  Strength: [
    {
      name: 'Handgrip Right',
      unit: 'kg',
      value: 24,
      zones: [
        { label: 'Weak', range: '< 20', pct: 25 },
        { label: 'Below Avg', range: '20 - 28', pct: 30 },
        { label: 'Average', range: '28 - 35', pct: 25 },
        { label: 'Strong', range: '> 35', pct: 20 },
      ],
      markerPct: 38,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 20 },
        { d: 'Aug 24', v: 21 },
        { d: 'Nov 24', v: 22 },
        { d: 'Jan 25', v: 23 },
        { d: 'Apr 25', v: 24 },
      ],
      refLow: 28,
      refHigh: 35,
    },
    {
      name: 'Handgrip Left',
      unit: 'kg',
      value: 21,
      zones: [
        { label: 'Weak', range: '< 18', pct: 25 },
        { label: 'Below Avg', range: '18 - 25', pct: 30 },
        { label: 'Average', range: '25 - 32', pct: 25 },
        { label: 'Strong', range: '> 32', pct: 20 },
      ],
      markerPct: 35,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 17 },
        { d: 'Aug 24', v: 18 },
        { d: 'Nov 24', v: 19 },
        { d: 'Jan 25', v: 20 },
        { d: 'Apr 25', v: 21 },
      ],
      refLow: 25,
      refHigh: 32,
    },
    {
      name: 'Leg Press',
      unit: 'kg',
      value: 95,
      zones: [
        { label: 'Weak', range: '< 60', pct: 15 },
        { label: 'Below Avg', range: '60 - 80', pct: 20 },
        { label: 'Average', range: '80 - 110', pct: 35 },
        { label: 'Strong', range: '> 110', pct: 30 },
      ],
      markerPct: 55,
      status: 'optimal',
      history: [
        { d: 'Jun 24', v: 72 },
        { d: 'Aug 24', v: 78 },
        { d: 'Nov 24', v: 85 },
        { d: 'Jan 25', v: 90 },
        { d: 'Apr 25', v: 95 },
      ],
      refLow: 80,
      refHigh: 110,
    },
  ],
};

const fitnessPanelInterventions = {
  'Body Composition': {
    title: 'Body Composition \u2014 Fat Loss & Lean Mass',
    interventions: [
      {
        category: 'Diet',
        name: 'Caloric Deficit Protocol',
        dose: '-300 kcal/day',
        impact: 'Target 0.5 kg/week fat loss preserving muscle',
      },
      {
        category: 'Activity',
        name: 'Resistance Training',
        dose: '4x/week',
        impact: 'Increases lean mass, raises basal metabolic rate',
      },
      {
        category: 'Supplement',
        name: 'Protein Optimization',
        dose: '1.6g/kg/day',
        impact: 'Supports muscle protein synthesis during deficit',
      },
    ],
  },
  'Body Measurements': {
    title: 'Body Measurements \u2014 Waist Reduction',
    interventions: [
      {
        category: 'Diet',
        name: 'Mediterranean Anti-inflammatory',
        dose: 'Daily',
        impact: 'Reduces visceral adiposity around waist',
      },
      {
        category: 'Activity',
        name: 'HIIT + Zone 2 Hybrid',
        dose: '5x/week',
        impact: 'Maximizes central fat oxidation',
      },
    ],
  },
  'Cardiovascular Health': {
    title: 'Cardiovascular \u2014 Aerobic Capacity',
    interventions: [
      {
        category: 'Activity',
        name: 'Zone 2 Cardio Training',
        dose: '150 min/week',
        impact: 'Improves mitochondrial density and VO2 Max 10-15%',
      },
      {
        category: 'Activity',
        name: 'HIIT Intervals',
        dose: '2x/week',
        impact: 'Increases VO2 Max peak capacity',
      },
      {
        category: 'Lifestyle',
        name: 'HRV-Guided Recovery',
        dose: 'Daily monitoring',
        impact: 'Optimizes training load, prevents overtraining',
      },
    ],
  },
  'Vital Signs': {
    title: 'Vital Signs \u2014 Blood Pressure Management',
    interventions: [
      {
        category: 'Diet',
        name: 'DASH-style Low Sodium',
        dose: '< 2300mg Na/day',
        impact: 'Reduces systolic BP by 5-10 mmHg',
      },
      {
        category: 'Activity',
        name: 'Daily Aerobic Exercise',
        dose: '30 min/day',
        impact: 'Lowers resting BP by 5-8 mmHg',
      },
      {
        category: 'Supplement',
        name: 'Magnesium Glycinate',
        dose: '400mg/day',
        impact: 'Supports vascular relaxation and BP regulation',
      },
    ],
  },
  Strength: {
    title: 'Strength \u2014 Functional Capacity',
    interventions: [
      {
        category: 'Activity',
        name: 'Progressive Resistance Training',
        dose: '3x/week',
        impact: 'Targets grip, upper and lower body compounds',
      },
      {
        category: 'Supplement',
        name: 'Creatine Monohydrate',
        dose: '5g/day',
        impact: 'Increases strength output 5-10%',
      },
      {
        category: 'Diet',
        name: 'Post-Workout Protein',
        dose: '30g within 30min',
        impact: 'Maximizes muscle protein synthesis window',
      },
    ],
  },
};

const fitnessPanelScoreHistory = [
  {
    date: 'Jun 2024',
    'Body Composition': 3,
    'Body Measurements': 3,
    'Cardiovascular Health': 2,
    'Respiratory Function': 5,
    'Vital Signs': 3,
    Strength: 1,
  },
  {
    date: 'Nov 2024',
    'Body Composition': 3,
    'Body Measurements': 4,
    'Cardiovascular Health': 3,
    'Respiratory Function': 5,
    'Vital Signs': 4,
    Strength: 2,
  },
  {
    date: 'Apr 2025',
    'Body Composition': 3,
    'Body Measurements': 4,
    'Cardiovascular Health': 3,
    'Respiratory Function': 5,
    'Vital Signs': 4,
    Strength: 2,
  },
];

const fitnessPanelLineColors = {
  'Body Composition': '#8B5CF6',
  'Body Measurements': '#EC4899',
  'Cardiovascular Health': '#EF4444',
  'Respiratory Function': '#10B981',
  'Vital Signs': '#3B82F6',
  Strength: '#F59E0B',
};

const initialFitnessInsights = [
  {
    id: 201,
    insight:
      'BMI at 27.1 indicates overweight status \u2014 body composition optimization protocol recommended to reduce metabolic risk.',
    urgency: 'Need Improvement',
    confidence: 'High',
    confidenceReason:
      'BMI consistently above 25 across all 5 measurements. Body fat at 31.5% confirms excess adiposity.',
    inPlan: true,
  },
  {
    id: 202,
    insight:
      'Visceral fat rating of 12 in borderline zone approaching high-risk threshold \u2014 targeted abdominal fat reduction needed.',
    urgency: 'Need Improvement',
    confidence: 'High',
    confidenceReason:
      'Visceral fat consistently above healthy range (1-9). Correlated with elevated inflammatory markers from blood panel.',
    inPlan: true,
  },
  {
    id: 203,
    insight:
      'VO2 Max at 43 ml/kg/min is average \u2014 structured cardio protocol could elevate to good range within 12 weeks.',
    urgency: 'Need Improvement',
    confidence: 'Medium',
    confidenceReason:
      'VO2 Max trending upward but rate of improvement has slowed. May need protocol intensification.',
    inPlan: true,
  },
  {
    id: 204,
    insight:
      'HRV at 38ms below optimal, suggesting autonomic nervous system imbalance and suboptimal recovery capacity.',
    urgency: 'Need Improvement',
    confidence: 'High',
    confidenceReason:
      'HRV below 50ms threshold across multiple wearable readings. Correlates with elevated cortisol from blood panel.',
    inPlan: true,
  },
  {
    id: 205,
    insight:
      'Systolic blood pressure at 128 mmHg in elevated range \u2014 lifestyle intervention recommended before pharmacological approach.',
    urgency: 'Need Improvement',
    confidence: 'Medium',
    confidenceReason:
      'BP elevated but trending downward with current interventions. Confirm with 24-hour ambulatory monitoring.',
    inPlan: true,
  },
  {
    id: 206,
    insight:
      'Bilateral grip strength below average (R: 24kg, L: 21kg) \u2014 resistance training critical for functional independence and longevity.',
    urgency: 'Urgent',
    confidence: 'High',
    confidenceReason:
      'Grip strength is a validated predictor of all-cause mortality. Values below 25th percentile for age/sex.',
    inPlan: true,
  },
  {
    id: 207,
    insight:
      'Respiratory function markers all within normal range including SpO2 98% and FEV1/FVC 80% \u2014 no pulmonary concerns.',
    urgency: 'Good',
    confidence: 'High',
    confidenceReason:
      'All spirometry and oximetry values within optimal ranges. Consistent across wearable and manual measurements.',
    inPlan: false,
  },
];

const fitnessInsightDetails = {
  201: {
    description:
      'BMI of 27.1 places patient in WHO overweight category (25-29.9). Body fat at 31.5% and visceral fat rating of 12 confirm excess adiposity. FFMI at 15.8 is normal, indicating overweight status is fat-driven.',
    reason:
      'Overweight with elevated visceral fat creates compounding metabolic risk including insulin resistance (confirmed by HOMA-IR from blood panel), chronic inflammation, and cardiovascular burden. Downward trend from 28.3 shows protocols working but at insufficient pace.',
  },
  202: {
    description:
      'Visceral fat rating of 12 exceeds healthy range (1-9), sitting in borderline zone (10-14). Visceral adipose tissue produces inflammatory cytokines contributing to elevated CRP and IL-6 in blood panel.',
    reason:
      'Visceral fat is the most metabolically dangerous depot. At rating 12, excess adipokines drive systemic inflammation, insulin resistance, and atherogenic dyslipidemia. A 2-3 point reduction would return to healthy range.',
  },
  203: {
    description:
      'VO2 Max of 43 ml/kg/min is average range. Improved from 38 in Jun 2024 but rate slowed from 2 to 1 ml/kg/min per quarter, suggesting adaptation plateau.',
    reason:
      'VO2 Max is the strongest predictor of cardiovascular mortality. Moving from average to good (>45) confers significant mortality reduction. HIIT supplementation needed to break through plateau.',
  },
  204: {
    description:
      'HRV (RMSSD) at 38ms indicates below-average autonomic function. Improved from 28ms but plateaued at 37-38ms, not reaching 50ms average threshold.',
    reason:
      'Low HRV reflects sympathetic dominance and poor recovery capacity. Correlates with elevated cortisol and poor sleep. Below 50ms associated with increased cardiovascular risk.',
  },
  205: {
    description:
      'Systolic BP at 128 mmHg is AHA elevated category (120-129). Diastolic at 82 also above normal. Both improved from Jun 2024 (135/88) but not at optimal < 120/80.',
    reason:
      'Sustained elevated BP increases lifetime cardiovascular risk. Downward trend demonstrates responsiveness to lifestyle interventions. Target: < 120/80 within 6 months.',
  },
  206: {
    description:
      'Right handgrip 24 kg and left 21 kg both below average (R: 28-35, L: 25-32). Grip strength is a validated biomarker of overall muscle strength and functional capacity.',
    reason:
      'Grip strength below 25th percentile is associated with increased all-cause mortality and functional disability. Progressive resistance training targeting grip and compound movements is critical.',
  },
  207: {
    description:
      'SpO2 98%, respiratory rate 14/min, FEV1/FVC 80% all within optimal ranges. No obstructive or restrictive patterns. Stable across all periods.',
    reason:
      'Normal respiratory function confirms cardiovascular limitations are not pulmonary in origin. Supports focusing intervention efforts on cardiovascular training rather than respiratory therapy.',
  },
};

const fitnessInterventionData = {
  201: {
    title: 'Body Composition \u2014 BMI Optimization',
    interventions: [
      {
        category: 'Diet',
        name: 'Structured Caloric Deficit',
        dose: '-300 kcal/day',
        impact: 'Target 0.5kg/week fat loss preserving lean mass',
      },
      {
        category: 'Activity',
        name: 'Resistance Training Program',
        dose: '4x/week',
        impact: 'Maintain/build lean mass during deficit phase',
      },
      {
        category: 'Supplement',
        name: 'Whey Protein Isolate',
        dose: '1.6g/kg/day total',
        impact: 'Adequate protein for muscle preservation',
      },
    ],
  },
  202: {
    title: 'Visceral Fat \u2014 Targeted Reduction',
    interventions: [
      {
        category: 'Activity',
        name: 'HIIT Protocol',
        dose: '3x/week',
        impact: 'HIIT preferentially reduces visceral adipose tissue',
      },
      {
        category: 'Diet',
        name: 'Refined Carb Elimination',
        dose: 'Daily',
        impact: 'Reduces hepatic de novo lipogenesis',
      },
      {
        category: 'Lifestyle',
        name: 'Sleep Optimization (7-9h)',
        dose: 'Nightly',
        impact: 'Poor sleep increases visceral fat deposition by 11%',
      },
    ],
  },
  203: {
    title: 'VO2 Max \u2014 Aerobic Capacity',
    interventions: [
      {
        category: 'Activity',
        name: 'Zone 2 Endurance Base',
        dose: '150 min/week',
        impact: 'Builds mitochondrial density for sustained improvement',
      },
      {
        category: 'Activity',
        name: 'VO2 Max Intervals (4x4)',
        dose: '2x/week',
        impact: '4x4 min at 90-95% max HR to push ceiling higher',
      },
    ],
  },
  204: {
    title: 'HRV \u2014 Autonomic Recovery',
    interventions: [
      {
        category: 'Lifestyle',
        name: 'Box Breathing Protocol',
        dose: '10 min 2x/day',
        impact: 'Stimulates vagal tone, parasympathetic activation',
      },
      {
        category: 'Lifestyle',
        name: 'Cold Exposure',
        dose: '2-3 min cold shower',
        impact: 'Acute vagal stimulation and HRV improvement',
      },
      {
        category: 'Supplement',
        name: 'Magnesium L-Threonate',
        dose: '400mg before bed',
        impact: 'Supports nervous system recovery and sleep',
      },
    ],
  },
  205: {
    title: 'Blood Pressure \u2014 Lifestyle Reduction',
    interventions: [
      {
        category: 'Diet',
        name: 'DASH-style Protocol',
        dose: '< 2300mg Na/day',
        impact: 'Sodium reduction lowers BP 5-10 mmHg',
      },
      {
        category: 'Activity',
        name: 'Daily Aerobic Walking',
        dose: '30 min/day',
        impact: 'Reduces resting BP 5-8 mmHg',
      },
    ],
  },
  206: {
    title: 'Grip Strength \u2014 Progressive Loading',
    interventions: [
      {
        category: 'Activity',
        name: 'Grip Training Circuit',
        dose: '3x/week',
        impact: 'Dead hangs, farmer carries, grip crushers',
      },
      {
        category: 'Activity',
        name: 'Compound Lifts',
        dose: '3x/week',
        impact: 'Deadlifts, rows, pull-ups build grip strength',
      },
      {
        category: 'Supplement',
        name: 'Creatine Monohydrate',
        dose: '5g/day',
        impact: 'Improves strength output, supports lean mass',
      },
    ],
  },
};

const initialFitnessHistoryInsights = [
  {
    id: 301,
    insight:
      'BMI trending down from 28.3 to 27.1 over 10 months \u2014 positive trajectory but rate of decline slowing (0.5 to 0.2 per quarter).',
    urgency: 'Need Improvement',
    confidence: 'High',
    confidenceReason:
      'Consistent downward trend across 5 data points. Rate deceleration confirmed. Still 2.2 above normal ceiling.',
    inPlan: true,
  },
  {
    id: 302,
    insight:
      'VO2 Max improved from 38 to 43 ml/kg/min \u2014 Zone 2 cardio showing benefit but adaptation plateau emerging.',
    urgency: 'Good',
    confidence: 'High',
    confidenceReason:
      'Monotonic increase across 5 readings. Rate slowed from +2 to +1 ml/kg/min per quarter.',
    inPlan: false,
  },
  {
    id: 303,
    insight:
      'Grip strength improving slowly (R: 20 to 24, L: 17 to 21 kg) but below average \u2014 escalation recommended.',
    urgency: 'Need Improvement',
    confidence: 'Medium',
    confidenceReason:
      'Linear improvement ~1 kg/quarter. Average range (28+) would take 4+ quarters at current rate.',
    inPlan: true,
  },
  {
    id: 304,
    insight:
      'Systolic BP decreased from 135 to 128 mmHg \u2014 responding to lifestyle interventions but still elevated.',
    urgency: 'Good',
    confidence: 'High',
    confidenceReason:
      'Consistent downward trend. Optimal (< 120) achievable within 8-10 months at current trajectory.',
    inPlan: false,
  },
  {
    id: 305,
    insight:
      'HRV plateaued at 37-38ms after initial improvement from 28ms \u2014 adaptation stall requiring protocol change.',
    urgency: 'Need Improvement',
    confidence: 'Medium',
    confidenceReason:
      'First 6 months: +8ms. Last 4 months: flatlined. Current stimuli no longer driving adaptation.',
    inPlan: true,
  },
  {
    id: 306,
    insight:
      'Waist circumference decreased from 89 to 84 cm \u2014 approaching healthy threshold of 80 cm consistently.',
    urgency: 'Good',
    confidence: 'High',
    confidenceReason:
      'Steady decline ~1.25 cm/quarter. Projected to reach 80 cm within 3 additional quarters.',
    inPlan: false,
  },
  {
    id: 307,
    insight:
      'Body fat % declining from 34.2% to 31.5% \u2014 consistent fat loss validating current protocol.',
    urgency: 'Need Improvement',
    confidence: 'High',
    confidenceReason:
      'Linear downward at ~0.7%/quarter. Still 6.5 points above fit range (25%).',
    inPlan: true,
  },
];

const fitnessHistoryInsightDetails = {
  301: {
    description:
      'BMI declined from 28.3 to 27.1 over 10 months (1.2 points). Quarterly rate decelerated from 0.5 to 0.2, suggesting metabolic adaptation plateau.',
    reason:
      'Diet periodization (alternating deficit/maintenance weeks) and increased resistance training volume could restore 0.4-0.5 points/quarter decline and reach normal BMI within 12 months.',
  },
  303: {
    description:
      'Handgrip improved R: 20 to 24 kg, L: 17 to 21 kg at +1 kg/quarter bilaterally. Both below average threshold (R: 28+, L: 25+).',
    reason:
      'Adding dedicated grip work 3x/week alongside compounds could accelerate to +2 kg/quarter, reaching average in 2 quarters instead of 4+.',
  },
  305: {
    description:
      'HRV improved from 28ms to 36ms (first 6 months) then flatlined at 37-38ms (last 4 months). Initial adaptations captured but deeper rebalancing stalled.',
    reason:
      'Given elevated cortisol and CRP from blood panel, HRV stall is likely inflammation-driven. Breathwork, cold exposure, and inflammation reduction should break the plateau.',
  },
  307: {
    description:
      'Body fat declined linearly from 34.2% to 31.5% (2.7 points over 10 months). Rate of ~0.7%/quarter has been consistent.',
    reason:
      'Intensifying HIIT frequency and tightening nutrition compliance could accelerate to 1.0-1.2%/quarter, reaching fit range within 6 quarters instead of 9.',
  },
};

const fitnessHistoryInterventionData = {
  301: {
    title: 'BMI Trend \u2014 Plateau-Breaking',
    interventions: [
      {
        category: 'Diet',
        name: 'Diet Periodization (Refeed Cycling)',
        dose: '5 deficit / 2 maintenance',
        impact: 'Prevents metabolic adaptation slowing progress',
      },
      {
        category: 'Activity',
        name: 'Increased Training Volume',
        dose: '+2 sessions/week',
        impact: 'Higher expenditure to counter metabolic slowdown',
      },
    ],
  },
  303: {
    title: 'Grip Strength \u2014 Accelerated Loading',
    interventions: [
      {
        category: 'Activity',
        name: 'Dedicated Grip Circuit',
        dose: '3x/week',
        impact: 'Dead hangs, farmer carries, grip crushers',
      },
      {
        category: 'Activity',
        name: 'Heavy Compound Pulls',
        dose: '2x/week',
        impact: 'Rows and deadlifts build grip as secondary',
      },
    ],
  },
  305: {
    title: 'HRV Trend \u2014 Autonomic Reset',
    interventions: [
      {
        category: 'Lifestyle',
        name: 'Structured Breathwork',
        dose: '10 min 2x/day',
        impact: 'Box breathing stimulates vagal tone',
      },
      {
        category: 'Lifestyle',
        name: 'Cold Water Immersion',
        dose: '3 min 3x/week',
        impact: 'Activates parasympathetic recovery pathways',
      },
      {
        category: 'Lifestyle',
        name: 'Sleep Optimization',
        dose: '9pm digital sunset',
        impact: 'Improves deep sleep for HRV recovery',
      },
    ],
  },
  307: {
    title: 'Body Fat Trend \u2014 Accelerated Protocol',
    interventions: [
      {
        category: 'Activity',
        name: 'HIIT Frequency Increase',
        dose: '4x/week (from 2x)',
        impact: 'EPOC increases 24hr fat oxidation 15%',
      },
      {
        category: 'Diet',
        name: 'Precision Nutrition Tracking',
        dose: 'Daily logging',
        impact: 'Eliminates hidden caloric surplus',
      },
    ],
  },
};

const wearablePanels = [
  { name: 'Activity', score: 66, icon: Activity },
  { name: 'Body Composition', score: 50, icon: Scale },
  { name: 'Metabolic', score: 90, icon: Zap },
  { name: 'Heart Health', score: 58, icon: HeartPulse },
  { name: 'Readiness', score: 50, icon: Gauge },
  { name: 'Sleep', score: 0, icon: Moon },
  { name: 'Stress', score: 100, icon: Brain },
];

const wearablePanelBiomarkers = {
  Activity: [
    {
      name: 'Daily Steps',
      unit: 'steps',
      value: 8450,
      zones: [
        { label: 'Sedentary', range: '< 4K', pct: 20 },
        { label: 'Low', range: '4K-7K', pct: 25 },
        { label: 'Moderate', range: '7K-10K', pct: 30 },
        { label: 'Active', range: '> 10K', pct: 25 },
      ],
      markerPct: 58,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 6200 },
        { d: 'Nov 24', v: 7400 },
        { d: 'Apr 25', v: 8450 },
      ],
      refLow: 7000,
      refHigh: 10000,
    },
    {
      name: 'Active Minutes',
      unit: 'min/day',
      value: 42,
      zones: [
        { label: 'Low', range: '< 30', pct: 25 },
        { label: 'Fair', range: '30-45', pct: 30 },
        { label: 'Good', range: '45-60', pct: 25 },
        { label: 'Excellent', range: '> 60', pct: 20 },
      ],
      markerPct: 48,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 28 },
        { d: 'Nov 24', v: 35 },
        { d: 'Apr 25', v: 42 },
      ],
      refLow: 30,
      refHigh: 60,
    },
    {
      name: 'Sedentary Time',
      unit: 'hrs',
      value: 9.2,
      zones: [
        { label: 'Active', range: '< 6', pct: 25 },
        { label: 'Moderate', range: '6-8', pct: 30 },
        { label: 'High', range: '8-10', pct: 25 },
        { label: 'Excessive', range: '> 10', pct: 20 },
      ],
      markerPct: 62,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 11.1 },
        { d: 'Nov 24', v: 10.2 },
        { d: 'Apr 25', v: 9.2 },
      ],
      refLow: 0,
      refHigh: 8,
    },
  ],
  'Body Composition': [
    {
      name: 'Body Fat %',
      unit: '%',
      value: 31.5,
      zones: [
        { label: 'Athletic', range: '< 20', pct: 20 },
        { label: 'Fit', range: '20-25', pct: 25 },
        { label: 'Average', range: '25-32', pct: 30 },
        { label: 'Obese', range: '> 32', pct: 25 },
      ],
      markerPct: 68,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 34.2 },
        { d: 'Nov 24', v: 32.4 },
        { d: 'Apr 25', v: 31.5 },
      ],
      refLow: 20,
      refHigh: 25,
    },
    {
      name: 'BMI',
      unit: 'kg/m2',
      value: 27.1,
      zones: [
        { label: 'Under', range: '< 18.5', pct: 15 },
        { label: 'Normal', range: '18.5-25', pct: 30 },
        { label: 'Over', range: '25-30', pct: 30 },
        { label: 'Obese', range: '> 30', pct: 25 },
      ],
      markerPct: 62,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 28.3 },
        { d: 'Nov 24', v: 27.5 },
        { d: 'Apr 25', v: 27.1 },
      ],
      refLow: 18.5,
      refHigh: 24.9,
    },
    {
      name: 'Hydration',
      unit: '%',
      value: 52,
      zones: [
        { label: 'Low', range: '< 45', pct: 20 },
        { label: 'Below Avg', range: '45-55', pct: 30 },
        { label: 'Good', range: '55-65', pct: 30 },
        { label: 'Optimal', range: '> 65', pct: 20 },
      ],
      markerPct: 45,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 48 },
        { d: 'Nov 24', v: 50 },
        { d: 'Apr 25', v: 52 },
      ],
      refLow: 55,
      refHigh: 65,
    },
  ],
  Metabolic: [
    {
      name: 'Glucose Level',
      unit: 'mg/dL',
      value: 95,
      zones: [
        { label: 'Low', range: '< 70', pct: 15 },
        { label: 'Normal', range: '70-100', pct: 45 },
        { label: 'Pre-diabetic', range: '100-126', pct: 25 },
        { label: 'High', range: '> 126', pct: 15 },
      ],
      markerPct: 42,
      status: 'optimal',
      history: [
        { d: 'Jun 24', v: 98 },
        { d: 'Nov 24', v: 96 },
        { d: 'Apr 25', v: 95 },
      ],
      refLow: 70,
      refHigh: 100,
    },
    {
      name: 'Time in Range',
      unit: '%',
      value: 92,
      zones: [
        { label: 'Poor', range: '< 50', pct: 15 },
        { label: 'Fair', range: '50-70', pct: 20 },
        { label: 'Good', range: '70-90', pct: 30 },
        { label: 'Excellent', range: '> 90', pct: 35 },
      ],
      markerPct: 85,
      status: 'optimal',
      history: [
        { d: 'Jun 24', v: 85 },
        { d: 'Nov 24', v: 89 },
        { d: 'Apr 25', v: 92 },
      ],
      refLow: 70,
      refHigh: 100,
    },
    {
      name: 'Fasting Glucose',
      unit: 'mg/dL',
      value: 88,
      zones: [
        { label: 'Low', range: '< 65', pct: 10 },
        { label: 'Normal', range: '65-100', pct: 50 },
        { label: 'Elevated', range: '100-126', pct: 25 },
        { label: 'High', range: '> 126', pct: 15 },
      ],
      markerPct: 38,
      status: 'optimal',
      history: [
        { d: 'Jun 24', v: 94 },
        { d: 'Nov 24', v: 91 },
        { d: 'Apr 25', v: 88 },
      ],
      refLow: 65,
      refHigh: 100,
    },
  ],
  'Heart Health': [
    {
      name: 'Resting Heart Rate',
      unit: 'bpm',
      value: 68,
      zones: [
        { label: 'Athletic', range: '< 60', pct: 25 },
        { label: 'Good', range: '60-70', pct: 30 },
        { label: 'Normal', range: '70-80', pct: 25 },
        { label: 'Elevated', range: '> 80', pct: 20 },
      ],
      markerPct: 40,
      status: 'optimal',
      history: [
        { d: 'Jun 24', v: 74 },
        { d: 'Nov 24', v: 70 },
        { d: 'Apr 25', v: 68 },
      ],
      refLow: 60,
      refHigh: 70,
    },
    {
      name: 'HRV (RMSSD)',
      unit: 'ms',
      value: 38,
      zones: [
        { label: 'Low', range: '< 30', pct: 25 },
        { label: 'Below Avg', range: '30-50', pct: 30 },
        { label: 'Average', range: '50-70', pct: 25 },
        { label: 'Good', range: '> 70', pct: 20 },
      ],
      markerPct: 38,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 28 },
        { d: 'Nov 24', v: 36 },
        { d: 'Apr 25', v: 38 },
      ],
      refLow: 30,
      refHigh: 50,
    },
    {
      name: 'Recovery HR',
      unit: 'bpm/min',
      value: 25,
      zones: [
        { label: 'Poor', range: '< 15', pct: 20 },
        { label: 'Below Avg', range: '15-25', pct: 30 },
        { label: 'Good', range: '25-35', pct: 30 },
        { label: 'Excellent', range: '> 35', pct: 20 },
      ],
      markerPct: 42,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 18 },
        { d: 'Nov 24', v: 22 },
        { d: 'Apr 25', v: 25 },
      ],
      refLow: 25,
      refHigh: 35,
    },
  ],
  Readiness: [
    {
      name: 'HRV Baseline',
      unit: 'ms',
      value: 38,
      zones: [
        { label: 'Low', range: '< 30', pct: 25 },
        { label: 'Below Avg', range: '30-50', pct: 30 },
        { label: 'Average', range: '50-70', pct: 25 },
        { label: 'Good', range: '> 70', pct: 20 },
      ],
      markerPct: 38,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 28 },
        { d: 'Nov 24', v: 35 },
        { d: 'Apr 25', v: 38 },
      ],
      refLow: 50,
      refHigh: 70,
    },
    {
      name: 'Sleep Quality',
      unit: '/100',
      value: 62,
      zones: [
        { label: 'Poor', range: '< 40', pct: 20 },
        { label: 'Fair', range: '40-60', pct: 25 },
        { label: 'Good', range: '60-80', pct: 30 },
        { label: 'Excellent', range: '> 80', pct: 25 },
      ],
      markerPct: 52,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 48 },
        { d: 'Nov 24', v: 55 },
        { d: 'Apr 25', v: 62 },
      ],
      refLow: 75,
      refHigh: 100,
    },
    {
      name: 'Temp Deviation',
      unit: 'C',
      value: 0.2,
      zones: [
        { label: 'Cool', range: '< -0.3', pct: 20 },
        { label: 'Normal', range: '-0.3 to 0.3', pct: 60 },
        { label: 'Warm', range: '> 0.3', pct: 20 },
      ],
      markerPct: 55,
      status: 'optimal',
      history: [
        { d: 'Jun 24', v: 0.4 },
        { d: 'Nov 24', v: 0.3 },
        { d: 'Apr 25', v: 0.2 },
      ],
      refLow: -0.3,
      refHigh: 0.3,
    },
  ],
  Sleep: [
    {
      name: 'Total Sleep',
      unit: 'hrs',
      value: 5.2,
      zones: [
        { label: 'Poor', range: '< 5', pct: 15 },
        { label: 'Short', range: '5-6', pct: 20 },
        { label: 'Fair', range: '6-7', pct: 25 },
        { label: 'Optimal', range: '7-9', pct: 40 },
      ],
      markerPct: 28,
      status: 'out',
      history: [
        { d: 'Jun 24', v: 5.8 },
        { d: 'Nov 24', v: 5.5 },
        { d: 'Apr 25', v: 5.2 },
      ],
      refLow: 7,
      refHigh: 9,
    },
    {
      name: 'Sleep Efficiency',
      unit: '%',
      value: 72,
      zones: [
        { label: 'Poor', range: '< 65', pct: 15 },
        { label: 'Fair', range: '65-75', pct: 25 },
        { label: 'Good', range: '75-85', pct: 30 },
        { label: 'Excellent', range: '> 85', pct: 30 },
      ],
      markerPct: 35,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 78 },
        { d: 'Nov 24', v: 75 },
        { d: 'Apr 25', v: 72 },
      ],
      refLow: 75,
      refHigh: 85,
    },
    {
      name: 'Deep Sleep',
      unit: 'hrs',
      value: 0.8,
      zones: [
        { label: 'Very Low', range: '< 0.5', pct: 15 },
        { label: 'Low', range: '0.5-1', pct: 25 },
        { label: 'Normal', range: '1-1.5', pct: 30 },
        { label: 'Optimal', range: '> 1.5', pct: 30 },
      ],
      markerPct: 30,
      status: 'ref',
      history: [
        { d: 'Jun 24', v: 1.2 },
        { d: 'Nov 24', v: 1.0 },
        { d: 'Apr 25', v: 0.8 },
      ],
      refLow: 1,
      refHigh: 2,
    },
  ],
  Stress: [
    {
      name: 'Stress Score',
      unit: '/100',
      value: 12,
      zones: [
        { label: 'Low', range: '< 25', pct: 35 },
        { label: 'Moderate', range: '25-50', pct: 30 },
        { label: 'High', range: '50-75', pct: 20 },
        { label: 'Very High', range: '> 75', pct: 15 },
      ],
      markerPct: 12,
      status: 'optimal',
      history: [
        { d: 'Jun 24', v: 28 },
        { d: 'Nov 24', v: 20 },
        { d: 'Apr 25', v: 12 },
      ],
      refLow: 0,
      refHigh: 25,
    },
    {
      name: 'HRV Fluctuation',
      unit: 'ms',
      value: 8,
      zones: [
        { label: 'Stable', range: '< 10', pct: 35 },
        { label: 'Mild', range: '10-20', pct: 30 },
        { label: 'Moderate', range: '20-30', pct: 20 },
        { label: 'High', range: '> 30', pct: 15 },
      ],
      markerPct: 15,
      status: 'optimal',
      history: [
        { d: 'Jun 24', v: 18 },
        { d: 'Nov 24', v: 12 },
        { d: 'Apr 25', v: 8 },
      ],
      refLow: 0,
      refHigh: 15,
    },
    {
      name: 'Respiratory Rate',
      unit: '/min',
      value: 14,
      zones: [
        { label: 'Low', range: '< 12', pct: 15 },
        { label: 'Normal', range: '12-20', pct: 55 },
        { label: 'Elevated', range: '> 20', pct: 30 },
      ],
      markerPct: 38,
      status: 'optimal',
      history: [
        { d: 'Jun 24', v: 16 },
        { d: 'Nov 24', v: 15 },
        { d: 'Apr 25', v: 14 },
      ],
      refLow: 12,
      refHigh: 20,
    },
  ],
};

const initialWearableInsights = [
  {
    id: 401,
    insight:
      'Sleep architecture severely degraded \u2014 total sleep 5.2 hrs with only 0.8 hrs deep sleep, well below recovery thresholds.',
    urgency: 'Urgent',
    confidence: 'High',
    confidenceReason:
      'Consistent sub-6hr sleep across 30-day Oura Ring tracking. Deep sleep below 1hr for 85% of nights.',
    inPlan: true,
  },
  {
    id: 402,
    insight:
      'HRV baseline plateaued at 38ms indicating autonomic imbalance and suboptimal recovery capacity.',
    urgency: 'Need Improvement',
    confidence: 'High',
    confidenceReason:
      'HRV tracked via Oura Ring and Garmin \u2014 both confirm 37-39ms average over 60 days with no upward trend.',
    inPlan: true,
  },
  {
    id: 403,
    insight:
      'Sedentary time averaging 9.2 hrs/day despite improved step count \u2014 prolonged sitting periods detected.',
    urgency: 'Need Improvement',
    confidence: 'Medium',
    confidenceReason:
      'Garmin inactivity alerts triggered 4-5x daily. Steps come from concentrated walks, not distributed movement.',
    inPlan: true,
  },
  {
    id: 404,
    insight:
      'Body composition trending toward improvement but BMI 27.1 and body fat 31.5% still above optimal ranges.',
    urgency: 'Need Improvement',
    confidence: 'High',
    confidenceReason:
      'Consistent downward trend in body fat (34.2 to 31.5%) and BMI (28.3 to 27.1) over 10 months. Rate decelerating.',
    inPlan: true,
  },
  {
    id: 405,
    insight:
      'Glucose regulation excellent \u2014 92% time in range with stable fasting glucose at 88 mg/dL.',
    urgency: 'Good',
    confidence: 'High',
    confidenceReason:
      'CGM data over 14-day sensor period shows minimal variability. Post-meal spikes consistently under 140 mg/dL.',
    inPlan: false,
  },
  {
    id: 406,
    insight:
      'Cardiovascular recovery heart rate below average at 25 bpm/min \u2014 aerobic fitness needs targeted improvement.',
    urgency: 'Need Improvement',
    confidence: 'Medium',
    confidenceReason:
      'Recovery HR measured post-exercise via Garmin. Below 30 bpm/min threshold across 8 recorded sessions.',
    inPlan: true,
  },
  {
    id: 407,
    insight:
      'Stress biomarkers optimal \u2014 low sympathetic activation with stress score consistently under 25/100.',
    urgency: 'Good',
    confidence: 'High',
    confidenceReason:
      'Oura Ring stress tracking and Garmin body battery both indicate low chronic stress. EDA baseline stable.',
    inPlan: false,
  },
];

const wearableInsightDetails = {
  401: {
    description:
      'Total sleep time averaged 5.2 hours over the past 30 days (Oura Ring), with deep sleep comprising only 0.8 hours (15% of total, optimal is 20-25%). Sleep efficiency at 72% indicates significant time awake in bed. REM sleep is also reduced at 1.1 hours. Sleep latency averages 28 minutes.',
    reason:
      'Chronic sleep deprivation below 6 hours is associated with 13% increased all-cause mortality, impaired glucose metabolism, elevated cortisol, and accelerated cognitive decline. The deep sleep deficit impairs growth hormone release, tissue repair, and memory consolidation. This is likely the primary driver of the low Readiness score (50) and may be contributing to the elevated inflammatory markers in the blood panel.',
  },
  402: {
    description:
      'HRV (RMSSD) has been tracked at 37-39ms across both Oura Ring nighttime measurements and Garmin daytime readings for the past 60 days. Initial improvement from 28ms (Jun 2024) has plateaued, with no upward movement since Nov 2024 despite ongoing Zone 2 cardio protocol.',
    reason:
      'HRV below 50ms indicates sympathetic dominance and reduced parasympathetic recovery capacity. The plateau suggests the current intervention (cardio alone) has exhausted its HRV benefits. Cross-referencing with blood panel: elevated cortisol and CRP likely suppress vagal tone. A multi-modal approach (breathwork, cold exposure, inflammation reduction) is needed to break through.',
  },
  403: {
    description:
      'Garmin movement tracking shows daily sedentary time of 9.2 hours, with the longest continuous sedentary bout averaging 3.1 hours (typically 9am-12pm). Step count has improved to 8,450/day but is concentrated in 2-3 walking sessions rather than distributed throughout the day.',
    reason:
      'Prolonged unbroken sedentary bouts (>60 min) are independently associated with metabolic dysfunction regardless of total exercise volume. The pattern of concentrated walking but prolonged desk sitting creates a daily "weekend warrior" effect \u2014 movement benefits are partially negated by extended sitting periods. Hourly movement breaks are critical.',
  },
  404: {
    description:
      'BMI has decreased from 28.3 to 27.1 over 10 months, and body fat from 34.2% to 31.5%. Wearable-derived hydration tracking shows 52%, below the 55-65% optimal range. Visceral fat index improved from 14 to 12 but remains in borderline zone (healthy < 9).',
    reason:
      'The downward trajectory validates the current diet and exercise protocol. However, the rate of improvement has decelerated (0.5 to 0.2 BMI points/quarter), suggesting metabolic adaptation. Hydration at 52% may contribute to suboptimal metabolic rate and recovery. Increasing water intake and adding diet periodization could restore improvement velocity.',
  },
  405: {
    description:
      'CGM data over the latest 14-day sensor period shows 92% time in range (70-140 mg/dL), with average glucose of 95 mg/dL and glucose variability (CV) of 18%. Fasting glucose has improved from 94 to 88 mg/dL. No post-meal excursions exceeded 160 mg/dL.',
    reason:
      'These metabolic markers indicate excellent glucose regulation, likely reflecting the benefits of time-restricted eating and post-meal walking. The 92% TIR exceeds the 70% clinical target. No immediate intervention changes needed \u2014 current protocol is working well. Continue monitoring.',
  },
  406: {
    description:
      'Post-exercise recovery heart rate (bpm drop in first minute after peak exertion) averaged 25 bpm/min across 8 Garmin-recorded sessions. Healthy threshold is >30 bpm/min, athletic recovery is >40 bpm/min. Resting HR at 68 bpm is good but the recovery gap indicates incomplete aerobic adaptation.',
    reason:
      'Recovery heart rate is a validated predictor of cardiovascular fitness and autonomic health. The 25 bpm/min reading suggests the parasympathetic nervous system is slow to re-engage after sympathetic activation. This correlates with the HRV plateau at 38ms. Improving recovery HR requires aerobic base building (Zone 2) and autonomic training (HRV biofeedback, breathwork).',
  },
  407: {
    description:
      'Oura Ring stress tracking shows average daytime stress score of 12/100 (low). Garmin Body Battery consistently recharges to 80+ overnight. HRV fluctuation minimal at 8ms. Respiratory rate steady at 14/min. No elevated EDA events detected.',
    reason:
      'Low chronic stress is a significant positive finding. Despite the sleep deficit and fitness gaps, the autonomic stress response is well-regulated. This suggests good psychological coping mechanisms and that current stressors are primarily physical (sleep, body composition) rather than psychological. Maintaining current stress management practices is important as intervention load increases.',
  },
};

const wearableInterventionData = {
  401: {
    title: 'Sleep \u2014 Architecture Restoration Protocol',
    interventions: [
      {
        category: 'Lifestyle',
        name: 'Fixed Sleep-Wake Schedule',
        dose: '10pm-6am daily',
        impact: 'Anchors circadian rhythm, improves sleep efficiency to >85%',
      },
      {
        category: 'Supplement',
        name: 'Magnesium L-Threonate',
        dose: '400mg before bed',
        impact: 'Increases deep sleep duration by 20-30%',
      },
      {
        category: 'Lifestyle',
        name: 'Blue Light Elimination',
        dose: '2hr pre-bed',
        impact: 'Restores melatonin onset, reduces sleep latency',
      },
    ],
  },
  402: {
    title: 'HRV \u2014 Autonomic Rebalancing',
    interventions: [
      {
        category: 'Lifestyle',
        name: 'Box Breathing Protocol',
        dose: '10 min 2x/day',
        impact: 'Direct vagal stimulation, +5-10ms HRV within 4 weeks',
      },
      {
        category: 'Lifestyle',
        name: 'Cold Water Immersion',
        dose: '2-3 min 3x/week',
        impact: 'Acute parasympathetic activation',
      },
      {
        category: 'Supplement',
        name: 'Omega-3 (EPA/DHA)',
        dose: '3g/day',
        impact: 'Anti-inflammatory support for HRV improvement',
      },
    ],
  },
  403: {
    title: 'Activity \u2014 Sedentary Time Reduction',
    interventions: [
      {
        category: 'Lifestyle',
        name: 'Hourly Movement Breaks',
        dose: '5 min every hour',
        impact: 'Breaks prolonged sitting, reduces metabolic impact',
      },
      {
        category: 'Activity',
        name: 'Standing Desk Transition',
        dose: '50/50 sit/stand',
        impact: 'Reduces total sedentary time by 2-3 hours',
      },
    ],
  },
  404: {
    title: 'Body Composition \u2014 Plateau Breaking',
    interventions: [
      {
        category: 'Diet',
        name: 'Diet Periodization',
        dose: '5 deficit / 2 maintenance',
        impact: 'Prevents metabolic adaptation, restores loss rate',
      },
      {
        category: 'Activity',
        name: 'Progressive Resistance',
        dose: '4x/week',
        impact: 'Increases lean mass and basal metabolic rate',
      },
      {
        category: 'Diet',
        name: 'Hydration Protocol',
        dose: '2.5L water/day',
        impact: 'Improves hydration from 52% toward 60%',
      },
    ],
  },
  406: {
    title: 'Cardiovascular \u2014 Recovery Improvement',
    interventions: [
      {
        category: 'Activity',
        name: 'Zone 2 Cardio Base',
        dose: '150 min/week',
        impact: 'Builds aerobic base for improved recovery HR',
      },
      {
        category: 'Lifestyle',
        name: 'HRV Biofeedback Training',
        dose: '10 min/day',
        impact: 'Trains autonomic flexibility and recovery speed',
      },
    ],
  },
};

const wearablePanelInterventions = {
  Activity: {
    title: 'Activity \u2014 Movement Optimization',
    interventions: [
      {
        category: 'Activity',
        name: 'Structured Walking Program',
        dose: '10K steps/day',
        impact: 'Gradual increase from 8.4K to hit 10K daily target',
      },
      {
        category: 'Lifestyle',
        name: 'Active Break Protocol',
        dose: '5 min every hour',
        impact: 'Reduces sedentary time, improves metabolic health',
      },
      {
        category: 'Activity',
        name: 'Evening Movement Routine',
        dose: '20 min/day',
        impact: 'Boosts active minutes and aids glucose regulation',
      },
    ],
  },
  'Body Composition': {
    title: 'Body Composition \u2014 Recomposition',
    interventions: [
      {
        category: 'Diet',
        name: 'Caloric Deficit Protocol',
        dose: '-300 kcal/day',
        impact: 'Target 0.5 kg/week fat loss preserving muscle',
      },
      {
        category: 'Activity',
        name: 'Resistance Training',
        dose: '4x/week',
        impact: 'Build lean mass, raise basal metabolic rate',
      },
      {
        category: 'Diet',
        name: 'Hydration Protocol',
        dose: '2.5L water/day',
        impact: 'Improve hydration from 52% toward 60% target',
      },
    ],
  },
  Metabolic: {
    title: 'Metabolic \u2014 Glucose Optimization',
    interventions: [
      {
        category: 'Diet',
        name: 'Low Glycemic Protocol',
        dose: 'Daily',
        impact: 'Reduces glucose variability and post-meal spikes',
      },
      {
        category: 'Activity',
        name: 'Post-Meal Walking',
        dose: '15 min after meals',
        impact: 'Lowers post-prandial glucose by 20-30%',
      },
    ],
  },
  'Heart Health': {
    title: 'Heart Health \u2014 Cardiovascular Recovery',
    interventions: [
      {
        category: 'Activity',
        name: 'Zone 2 Cardio Training',
        dose: '150 min/week',
        impact: 'Improves HRV and recovery heart rate',
      },
      {
        category: 'Lifestyle',
        name: 'HRV-Guided Recovery',
        dose: 'Daily monitoring',
        impact: 'Prevents overtraining, optimizes training load',
      },
      {
        category: 'Supplement',
        name: 'Magnesium Glycinate',
        dose: '400mg/day',
        impact: 'Supports heart rhythm and vascular relaxation',
      },
    ],
  },
  Readiness: {
    title: 'Readiness \u2014 Recovery Enhancement',
    interventions: [
      {
        category: 'Lifestyle',
        name: 'Sleep Optimization Protocol',
        dose: '9pm digital sunset',
        impact: 'Improves sleep quality score by 15-20 points',
      },
      {
        category: 'Lifestyle',
        name: 'Cold Exposure Therapy',
        dose: '2-3 min cold shower',
        impact: 'Stimulates vagal tone, accelerates recovery',
      },
    ],
  },
  Sleep: {
    title: 'Sleep \u2014 Architecture Restoration',
    interventions: [
      {
        category: 'Lifestyle',
        name: 'Consistent Sleep Schedule',
        dose: '10pm-6am daily',
        impact: 'Improves sleep efficiency and circadian alignment',
      },
      {
        category: 'Supplement',
        name: 'Magnesium L-Threonate',
        dose: '400mg before bed',
        impact: 'Increases deep sleep duration by 20-30%',
      },
      {
        category: 'Lifestyle',
        name: 'Blue Light Management',
        dose: '2hr pre-bed cutoff',
        impact: 'Reduces sleep latency, improves melatonin onset',
      },
    ],
  },
  Stress: {
    title: 'Stress \u2014 Autonomic Balance',
    interventions: [
      {
        category: 'Lifestyle',
        name: 'Box Breathing Protocol',
        dose: '10 min 2x/day',
        impact: 'Reduces stress score, improves HRV stability',
      },
      {
        category: 'Activity',
        name: 'Nature Walking',
        dose: '30 min/day',
        impact: 'Cortisol reduction and parasympathetic activation',
      },
    ],
  },
};

const notes = [
  {
    id: 1,
    text: 'ApoB levels trending upward — consider statin discussion at next visit.',
    date: '15 Jan 2025',
    author: 'Dr. Holt',
  },
  {
    id: 2,
    text: 'Patient reports improved sleep since starting magnesium protocol.',
    date: '02 Jan 2025',
    author: 'Dr. Holt',
  },
  {
    id: 3,
    text: 'Microbiome diversity excellent — maintain current prebiotic regimen.',
    date: '18 Dec 2024',
    author: 'Dr. Holt',
  },
];

const sidebarGroups = [
  {
    group: 'CLINICAL',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', key: 'dashboard' },
      { icon: Users, label: 'Clients', key: 'clients' },
      { icon: MessageSquare, label: 'Messages', key: 'messages', badge: 4 },
      { icon: Network, label: 'Knowledge Graph', key: 'knowledge-graph' },
    ],
  },
  {
    group: 'CLINICAL ENGINE',
    items: [
      { icon: FlaskConical, label: 'Biomarkers', key: 'biomarkers' },
      { icon: ClipboardList, label: 'Assessments', key: 'assessments' },
      {
        icon: Pill,
        label: 'Intervention Library',
        key: 'intervention-library',
      },
    ],
  },
  {
    group: 'BRAND & EXPERIENCE',
    items: [
      { icon: Palette, label: 'Branding', key: 'branding' },
      { icon: Smartphone, label: 'Patient App', key: 'patient-app' },
      { icon: FileDown, label: 'Report Templates', key: 'report-templates' },
    ],
  },
  {
    group: 'INTEGRATIONS',
    items: [{ icon: Plug, label: 'FHIR', key: 'fhir' }],
  },
  {
    group: 'ORGANIZATION',
    items: [
      { icon: Shield, label: 'Staff', key: 'staff' },
      { icon: PackageOpen, label: 'Packages', key: 'packages' },
      { icon: Settings, label: 'Settings', key: 'settings' },
    ],
  },
];

function MiniDonut({ data, size }) {
  return (
    <div className="flex-shrink-0" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.3}
            outerRadius={size * 0.45}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((e, i) => (
              <Cell key={i} fill={e.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function App() {
  const [activeCard, setActiveCard] = useState('blood');
  const [noteInput, setNoteInput] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [selectedDates, setSelectedDates] = useState({
    blood: '02 Apr 2025',
    genome: '01 Aug 2024',
    microbiome: '31 Aug 2024',
    fitness: '12 Mar 2025',
  });
  const [leftTab, setLeftTab] = useState('insight');
  const [rightTab, setRightTab] = useState('one');
  const [bloodInsights, setBloodInsights] = useState(initialBloodInsights);
  const [selectedInsightId, setSelectedInsightId] = useState(null);
  const [expandedConfidence, setExpandedConfidence] = useState(null);
  const [selectedPanelName, setSelectedPanelName] = useState(null);
  const [historyToggles, setHistoryToggles] = useState({});
  const [showAddInsight, setShowAddInsight] = useState(false);
  const [historyInsights, setHistoryInsights] = useState(
    initialHistoryInsights,
  );
  const [selectedHistoryInsightId, setSelectedHistoryInsightId] =
    useState(null);
  const [expandedHistoryConfidence, setExpandedHistoryConfidence] =
    useState(null);
  const [showAddHistoryInsight, setShowAddHistoryInsight] = useState(false);
  const [newHistoryInsight, setNewHistoryInsight] = useState({
    insight: '',
    urgency: 'Need Improvement',
    confidence: 'Manual',
    inPlan: false,
  });
  const [fitnessInsights, setFitnessInsights] = useState(
    initialFitnessInsights,
  );
  const [selectedFitnessInsightId, setSelectedFitnessInsightId] =
    useState(null);
  const [expandedFitnessConfidence, setExpandedFitnessConfidence] =
    useState(null);
  const [showAddFitnessInsight, setShowAddFitnessInsight] = useState(false);
  const [newFitnessInsight, setNewFitnessInsight] = useState({
    insight: '',
    urgency: 'Need Improvement',
    confidence: 'Manual',
    inPlan: false,
  });
  const [fitnessHistoryInsightsState, setFitnessHistoryInsightsState] =
    useState(initialFitnessHistoryInsights);
  const [selectedFitHistInsightId, setSelectedFitHistInsightId] =
    useState(null);
  const [expandedFitHistConfidence, setExpandedFitHistConfidence] =
    useState(null);
  const [showAddFitHistInsight, setShowAddFitHistInsight] = useState(false);
  const [newFitHistInsight, setNewFitHistInsight] = useState({
    insight: '',
    urgency: 'Need Improvement',
    confidence: 'Manual',
    inPlan: false,
  });
  const [wearableInsights, setWearableInsights] = useState(
    initialWearableInsights,
  );
  const [selectedWearableInsightId, setSelectedWearableInsightId] =
    useState(null);
  const [expandedWearableConfidence, setExpandedWearableConfidence] =
    useState(null);
  const [showAddWearableInsight, setShowAddWearableInsight] = useState(false);
  const [newWearableInsight, setNewWearableInsight] = useState({
    insight: '',
    urgency: 'Need Improvement',
    confidence: 'Manual',
    inPlan: false,
  });
  const [visiblePanels, setVisiblePanels] = useState(() => {
    const init = {};
    bloodPanels.forEach((p) => {
      init[p.name] = true;
    });
    fitnessPanels.forEach((p) => {
      init[p.name] = true;
    });
    return init;
  });
  const [newInsight, setNewInsight] = useState({
    insight: '',
    urgency: 'Need Improvement',
    confidence: 'Medium',
    inPlan: false,
  });

  const handleNoteInput = (e) => {
    setNoteInput(e.target.value);
  };
  const toggleNoteInput = () => {
    setShowNoteInput((prev) => !prev);
  };

  const handleCardClick = (key) => {
    setActiveCard(key);
  };
  const handleDateChange = (e) => {
    setSelectedDates((prev) => ({ ...prev, [activeCard]: e.target.value }));
  };
  const handleLeftTab = (tab) => {
    setLeftTab(tab);
  };
  const handleRightTab = (tab) => {
    setRightTab(tab);
  };
  const handlePanelClick = (name) => {
    setSelectedPanelName((prev) => (prev === name ? null : name));
    setHistoryToggles({});
  };
  const handleTogglePanel = (name) => {
    setVisiblePanels((prev) => ({ ...prev, [name]: !prev[name] }));
  };
  const handleHistoryToggle = (bioName) => {
    setHistoryToggles((prev) => ({ ...prev, [bioName]: !prev[bioName] }));
  };
  const handleInsightClick = (id) => {
    setSelectedInsightId((prev) => (prev === id ? null : id));
  };
  const handleHistoryInsightClick = (id) => {
    setSelectedHistoryInsightId((prev) => (prev === id ? null : id));
  };
  const handleHistoryUrgencyChange = (id, val) => {
    setHistoryInsights((prev) =>
      prev.map((i) => (i.id === id ? { ...i, urgency: val } : i)),
    );
  };
  const handleHistoryToggleInPlan = (id) => {
    setHistoryInsights((prev) =>
      prev.map((i) => (i.id === id ? { ...i, inPlan: !i.inPlan } : i)),
    );
  };
  const handleHistoryToggleConfidence = (id) => {
    setExpandedHistoryConfidence((prev) => (prev === id ? null : id));
  };
  const handleToggleAddHistoryInsight = () => {
    setShowAddHistoryInsight((prev) => !prev);
  };
  const handleNewHistoryInsightText = (e) => {
    setNewHistoryInsight((prev) => ({ ...prev, insight: e.target.value }));
  };
  const handleNewHistoryInsightUrgency = (e) => {
    setNewHistoryInsight((prev) => ({ ...prev, urgency: e.target.value }));
  };
  const handleNewHistoryInsightInPlan = () => {
    setNewHistoryInsight((prev) => ({ ...prev, inPlan: !prev.inPlan }));
  };
  const handleAddHistoryInsight = () => {
    if (!newHistoryInsight.insight.trim()) return;
    setHistoryInsights((prev) => [
      ...prev,
      {
        ...newHistoryInsight,
        id: Date.now(),
        confidence: 'Manual',
        confidenceReason: '',
      },
    ]);
    setNewHistoryInsight({
      insight: '',
      urgency: 'Need Improvement',
      confidence: 'Manual',
      inPlan: false,
    });
    setShowAddHistoryInsight(false);
  };
  const handleUrgencyChange = (id, val) => {
    setBloodInsights((prev) =>
      prev.map((i) => (i.id === id ? { ...i, urgency: val } : i)),
    );
  };
  const handleToggleInPlan = (id) => {
    setBloodInsights((prev) =>
      prev.map((i) => (i.id === id ? { ...i, inPlan: !i.inPlan } : i)),
    );
  };
  const handleToggleConfidence = (id) => {
    setExpandedConfidence((prev) => (prev === id ? null : id));
  };
  const handleToggleAddInsight = () => {
    setShowAddInsight((prev) => !prev);
  };
  const handleNewInsightText = (e) => {
    setNewInsight((prev) => ({ ...prev, insight: e.target.value }));
  };
  const handleNewInsightUrgency = (e) => {
    setNewInsight((prev) => ({ ...prev, urgency: e.target.value }));
  };
  const handleNewInsightConfidence = (e) => {
    setNewInsight((prev) => ({ ...prev, confidence: e.target.value }));
  };
  const handleNewInsightInPlan = () => {
    setNewInsight((prev) => ({ ...prev, inPlan: !prev.inPlan }));
  };
  const handleAddInsight = () => {
    if (!newInsight.insight.trim()) return;
    setBloodInsights((prev) => [
      ...prev,
      {
        ...newInsight,
        id: Date.now(),
        confidence: 'Manual',
        confidenceReason: '',
      },
    ]);
    setNewInsight({
      insight: '',
      urgency: 'Need Improvement',
      confidence: 'Manual',
      inPlan: false,
    });
    setShowAddInsight(false);
  };

  const handleFitnessInsightClick = (id) => {
    setSelectedFitnessInsightId((prev) => (prev === id ? null : id));
  };
  const handleFitnessUrgencyChange = (id, val) => {
    setFitnessInsights((prev) =>
      prev.map((i) => (i.id === id ? { ...i, urgency: val } : i)),
    );
  };
  const handleFitnessToggleInPlan = (id) => {
    setFitnessInsights((prev) =>
      prev.map((i) => (i.id === id ? { ...i, inPlan: !i.inPlan } : i)),
    );
  };
  const handleFitnessToggleConfidence = (id) => {
    setExpandedFitnessConfidence((prev) => (prev === id ? null : id));
  };
  const handleToggleAddFitnessInsight = () => {
    setShowAddFitnessInsight((prev) => !prev);
  };
  const handleNewFitnessInsightText = (e) => {
    setNewFitnessInsight((prev) => ({ ...prev, insight: e.target.value }));
  };
  const handleNewFitnessInsightUrgency = (e) => {
    setNewFitnessInsight((prev) => ({ ...prev, urgency: e.target.value }));
  };
  const handleNewFitnessInsightInPlan = () => {
    setNewFitnessInsight((prev) => ({ ...prev, inPlan: !prev.inPlan }));
  };
  const handleAddFitnessInsight = () => {
    if (!newFitnessInsight.insight.trim()) return;
    setFitnessInsights((prev) => [
      ...prev,
      {
        ...newFitnessInsight,
        id: Date.now(),
        confidence: 'Manual',
        confidenceReason: '',
      },
    ]);
    setNewFitnessInsight({
      insight: '',
      urgency: 'Need Improvement',
      confidence: 'Manual',
      inPlan: false,
    });
    setShowAddFitnessInsight(false);
  };
  const handleFitHistInsightClick = (id) => {
    setSelectedFitHistInsightId((prev) => (prev === id ? null : id));
  };
  const handleFitHistUrgencyChange = (id, val) => {
    setFitnessHistoryInsightsState((prev) =>
      prev.map((i) => (i.id === id ? { ...i, urgency: val } : i)),
    );
  };
  const handleFitHistToggleInPlan = (id) => {
    setFitnessHistoryInsightsState((prev) =>
      prev.map((i) => (i.id === id ? { ...i, inPlan: !i.inPlan } : i)),
    );
  };
  const handleFitHistToggleConfidence = (id) => {
    setExpandedFitHistConfidence((prev) => (prev === id ? null : id));
  };
  const handleToggleAddFitHistInsight = () => {
    setShowAddFitHistInsight((prev) => !prev);
  };
  const handleNewFitHistInsightText = (e) => {
    setNewFitHistInsight((prev) => ({ ...prev, insight: e.target.value }));
  };
  const handleNewFitHistInsightUrgency = (e) => {
    setNewFitHistInsight((prev) => ({ ...prev, urgency: e.target.value }));
  };
  const handleNewFitHistInsightInPlan = () => {
    setNewFitHistInsight((prev) => ({ ...prev, inPlan: !prev.inPlan }));
  };
  const handleAddFitHistInsight = () => {
    if (!newFitHistInsight.insight.trim()) return;
    setFitnessHistoryInsightsState((prev) => [
      ...prev,
      {
        ...newFitHistInsight,
        id: Date.now(),
        confidence: 'Manual',
        confidenceReason: '',
      },
    ]);
    setNewFitHistInsight({
      insight: '',
      urgency: 'Need Improvement',
      confidence: 'Manual',
      inPlan: false,
    });
    setShowAddFitHistInsight(false);
  };
  const handleWearableInsightClick = (id) => {
    setSelectedWearableInsightId((prev) => (prev === id ? null : id));
  };
  const handleWearableUrgencyChange = (id, val) => {
    setWearableInsights((prev) =>
      prev.map((i) => (i.id === id ? { ...i, urgency: val } : i)),
    );
  };
  const handleWearableToggleInPlan = (id) => {
    setWearableInsights((prev) =>
      prev.map((i) => (i.id === id ? { ...i, inPlan: !i.inPlan } : i)),
    );
  };
  const handleWearableToggleConfidence = (id) => {
    setExpandedWearableConfidence((prev) => (prev === id ? null : id));
  };
  const handleToggleAddWearableInsight = () => {
    setShowAddWearableInsight((prev) => !prev);
  };
  const handleNewWearableInsightText = (e) => {
    setNewWearableInsight((prev) => ({ ...prev, insight: e.target.value }));
  };
  const handleNewWearableInsightUrgency = (e) => {
    setNewWearableInsight((prev) => ({ ...prev, urgency: e.target.value }));
  };
  const handleNewWearableInsightInPlan = () => {
    setNewWearableInsight((prev) => ({ ...prev, inPlan: !prev.inPlan }));
  };
  const handleAddWearableInsight = () => {
    if (!newWearableInsight.insight.trim()) return;
    setWearableInsights((prev) => [
      ...prev,
      {
        ...newWearableInsight,
        id: Date.now(),
        confidence: 'Manual',
        confidenceReason: '',
      },
    ]);
    setNewWearableInsight({
      insight: '',
      urgency: 'Need Improvement',
      confidence: 'Manual',
      inPlan: false,
    });
    setShowAddWearableInsight(false);
  };

  const urgencyStyles = {
    Urgent: 'bg-red-100 text-red-700 border-red-200',
    'Need Improvement': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Good: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  const confidenceStyles = {
    High: 'text-emerald-600',
    Medium: 'text-yellow-600',
    Low: 'text-red-500',
  };

  const isHistory = rightTab === 'history';
  const isFitness = activeCard === 'fitness';
  const isWearable = activeCard === 'wearables';
  const hasPanelView =
    activeCard === 'blood' ||
    activeCard === 'fitness' ||
    activeCard === 'wearables';
  const activePanels = isWearable
    ? wearablePanels
    : isFitness
      ? fitnessPanels
      : bloodPanels;
  const activePanelBiomarkers = isWearable
    ? wearablePanelBiomarkers
    : isFitness
      ? fitnessPanelBiomarkers
      : panelBiomarkers;
  const activePanelInterventions = isWearable
    ? wearablePanelInterventions
    : isFitness
      ? fitnessPanelInterventions
      : panelInterventions;
  const activePanelScoreHistory = isFitness
    ? fitnessPanelScoreHistory
    : panelScoreHistory;
  const activePanelLineColors = isFitness
    ? fitnessPanelLineColors
    : panelLineColors;

  const currentInsights = isWearable
    ? wearableInsights
    : isFitness
      ? isHistory
        ? fitnessHistoryInsightsState
        : fitnessInsights
      : isHistory
        ? historyInsights
        : bloodInsights;
  const currentSelectedId = isWearable
    ? selectedWearableInsightId
    : isFitness
      ? isHistory
        ? selectedFitHistInsightId
        : selectedFitnessInsightId
      : isHistory
        ? selectedHistoryInsightId
        : selectedInsightId;
  const currentExpandedConf = isWearable
    ? expandedWearableConfidence
    : isFitness
      ? isHistory
        ? expandedFitHistConfidence
        : expandedFitnessConfidence
      : isHistory
        ? expandedHistoryConfidence
        : expandedConfidence;
  const currentShowAdd = isWearable
    ? showAddWearableInsight
    : isFitness
      ? isHistory
        ? showAddFitHistInsight
        : showAddFitnessInsight
      : isHistory
        ? showAddHistoryInsight
        : showAddInsight;
  const currentNewInsight = isWearable
    ? newWearableInsight
    : isFitness
      ? isHistory
        ? newFitHistInsight
        : newFitnessInsight
      : isHistory
        ? newHistoryInsight
        : newInsight;
  const currentInsightDetails = isWearable
    ? wearableInsightDetails
    : isFitness
      ? isHistory
        ? fitnessHistoryInsightDetails
        : fitnessInsightDetails
      : isHistory
        ? historyInsightDetails
        : insightDetails;
  const currentInterventionData = isWearable
    ? wearableInterventionData
    : isFitness
      ? isHistory
        ? fitnessHistoryInterventionData
        : fitnessInterventionData
      : isHistory
        ? historyInterventionData
        : interventionData;
  const handleCurrentInsightClick = isWearable
    ? handleWearableInsightClick
    : isFitness
      ? isHistory
        ? handleFitHistInsightClick
        : handleFitnessInsightClick
      : isHistory
        ? handleHistoryInsightClick
        : handleInsightClick;
  const handleCurrentUrgencyChange = isWearable
    ? handleWearableUrgencyChange
    : isFitness
      ? isHistory
        ? handleFitHistUrgencyChange
        : handleFitnessUrgencyChange
      : isHistory
        ? handleHistoryUrgencyChange
        : handleUrgencyChange;
  const handleCurrentToggleInPlan = isWearable
    ? handleWearableToggleInPlan
    : isFitness
      ? isHistory
        ? handleFitHistToggleInPlan
        : handleFitnessToggleInPlan
      : isHistory
        ? handleHistoryToggleInPlan
        : handleToggleInPlan;
  const handleCurrentToggleConfidence = isWearable
    ? handleWearableToggleConfidence
    : isFitness
      ? isHistory
        ? handleFitHistToggleConfidence
        : handleFitnessToggleConfidence
      : isHistory
        ? handleHistoryToggleConfidence
        : handleToggleConfidence;
  const handleCurrentToggleAddInsight = isWearable
    ? handleToggleAddWearableInsight
    : isFitness
      ? isHistory
        ? handleToggleAddFitHistInsight
        : handleToggleAddFitnessInsight
      : isHistory
        ? handleToggleAddHistoryInsight
        : handleToggleAddInsight;
  const handleCurrentNewInsightText = isWearable
    ? handleNewWearableInsightText
    : isFitness
      ? isHistory
        ? handleNewFitHistInsightText
        : handleNewFitnessInsightText
      : isHistory
        ? handleNewHistoryInsightText
        : handleNewInsightText;
  const handleCurrentNewInsightUrgency = isWearable
    ? handleNewWearableInsightUrgency
    : isFitness
      ? isHistory
        ? handleNewFitHistInsightUrgency
        : handleNewFitnessInsightUrgency
      : isHistory
        ? handleNewHistoryInsightUrgency
        : handleNewInsightUrgency;
  const handleCurrentNewInsightInPlan = isWearable
    ? handleNewWearableInsightInPlan
    : isFitness
      ? isHistory
        ? handleNewFitHistInsightInPlan
        : handleNewFitnessInsightInPlan
      : isHistory
        ? handleNewHistoryInsightInPlan
        : handleNewInsightInPlan;
  const handleCurrentAddInsight = isWearable
    ? handleAddWearableInsight
    : isFitness
      ? isHistory
        ? handleAddFitHistInsight
        : handleAddFitnessInsight
      : isHistory
        ? handleAddHistoryInsight
        : handleAddInsight;

  const activeInfo = analysisCards.find((c) => c.key === activeCard);

  const cardSummary = {
    questionnaires: {
      stat: '4 Need Attention · 7 Need Focus',
      statColor: 'text-red-600',
    },
    wearables: {
      stat: 'Sleep Issue Detected · BP Elevated',
      statColor: 'text-amber-600',
    },
    blood: {
      stat: '69% Optimal · 24% Reference · 7% Out',
      statColor: 'text-gray-600',
    },
    genome: {
      stat: '19% Strength · 60% Neutral · 21% Focus',
      statColor: 'text-gray-600',
    },
    microbiome: { stat: 'Diversity 95.12%', statColor: 'text-emerald-600' },
    fitness: { stat: 'BMI 27.1 · VO2 Max 43', statColor: 'text-gray-600' },
  };

  return (
    <div className="flex h-screen bg-[#F4F6F8] overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-[220px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#10B981] rounded-lg flex items-center justify-center">
              <Activity className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="text-[15px] font-bold text-gray-900 tracking-tight">
                HolistiCare
              </span>
              <p className="text-[10px] text-gray-400 -mt-0.5 tracking-wide">
                CLINIC PORTAL
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pt-4 pb-3">
          {sidebarGroups.map((group) => (
            <div key={group.group} className="mb-5">
              <p className="text-[10px] font-semibold text-gray-400 tracking-widest px-2 mb-1.5">
                {group.group}
              </p>
              {group.items.map((item) => {
                const isActive = item.key === 'clients';
                return (
                  <button
                    key={item.key}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-colors duration-150 ${isActive ? 'bg-[#10B981]/10 text-[#059669] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <item.icon
                      className={`w-[16px] h-[16px] ${isActive ? 'text-[#10B981]' : 'text-gray-400'}`}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="px-5 py-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-300 text-center tracking-wide">
            Powered by AURA
          </p>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <header className="h-[52px] bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-[13px]">
            <button className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors duration-150">
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
            <span className="text-gray-400">Client List</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-400">Mona Azami</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-800 font-semibold">Data Analysis</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors duration-150">
              <Bell className="w-4 h-4 text-gray-400" />
            </button>
            <div className="w-[1px] h-5 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#0D9488] flex items-center justify-center text-white text-[11px] font-bold">
                DR
              </div>
              <p className="text-[12px] font-semibold text-gray-800">
                Dr. Raina Holt
              </p>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-5">
          <div className="flex gap-5 max-w-[1200px] mx-auto">
            {/* ===== SECTION A: MAIN ===== */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* TOP: Image left + 6 thin cards right */}
              <div className="flex gap-4">
                {/* Body illustration */}
                <div className="w-[260px] flex-shrink-0 rounded-xl overflow-hidden">
                  {activeCard === 'blood' && (
                    <img
                      src="https://figr2.s3.ap-south-1.amazonaws.com/figr2/uploads/4892a511-be45-43d5-9185-0a3470cd002d/anthropic.webp"
                      alt="Blood Circulatory System"
                      className="w-full h-[280px] object-contain"
                    />
                  )}
                  {activeCard === 'genome' && (
                    <img
                      src="https://figr2.s3.ap-south-1.amazonaws.com/figr2/uploads/f5387a4d-ca28-4552-a76f-6496b41c8437/anthropic.webp"
                      alt="Genome Analysis"
                      className="w-full h-[280px] object-contain"
                    />
                  )}
                  {activeCard === 'microbiome' && (
                    <img
                      src="https://figr2.s3.ap-south-1.amazonaws.com/figr2/uploads/b72ca96e-9ee6-445b-a433-2dc733c98c6d/anthropic.webp"
                      alt="Microbiome Digestive System"
                      className="w-full h-[280px] object-contain"
                    />
                  )}
                  {activeCard === 'fitness' && (
                    <img
                      src="https://figr2.s3.ap-south-1.amazonaws.com/figr2/uploads/1fa09c22-4888-4848-af70-40f7a6d08da4/anthropic.webp"
                      alt="Physical Fitness Muscular System"
                      className="w-full h-[280px] object-contain"
                    />
                  )}
                  {activeCard === 'wearables' && (
                    <img
                      src="https://figr2.s3.ap-south-1.amazonaws.com/figr2/uploads/d316aa97-0c38-4a5c-8eab-e795d5a3e2c6/anthropic.webp"
                      alt="Wearables Health Monitoring"
                      className="w-full h-[280px] object-contain"
                    />
                  )}
                  {activeCard === 'questionnaires' && (
                    <img
                      src="https://figr2.s3.ap-south-1.amazonaws.com/figr2/uploads/c7390aed-9230-496e-b387-b30e6f94e137/anthropic.webp"
                      alt="Health Questionnaires"
                      className="w-full h-[280px] object-contain"
                    />
                  )}
                </div>
                {/* 6 Thin Analysis Cards stacked */}
                <div className="flex-1 flex flex-col gap-2">
                  {analysisCards.map((card) => {
                    const isSelected = activeCard === card.key;
                    const CardIcon = card.icon;
                    const summary = cardSummary[card.key];
                    return (
                      <button
                        key={card.key}
                        onClick={() => handleCardClick(card.key)}
                        className={`bg-white rounded-lg border-2 px-3.5 py-2 flex items-center gap-3 transition-all duration-200 ${isSelected ? 'border-blue-400 shadow-sm shadow-blue-100' : 'border-gray-200/80 hover:border-gray-300'}`}
                      >
                        <CardIcon
                          className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}
                        />
                        <span
                          className={`text-[12px] font-bold flex-shrink-0 w-[110px] text-left ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}
                        >
                          {card.label}
                        </span>
                        <span
                          className={`text-[10px] flex-1 text-right truncate ${summary.statColor}`}
                        >
                          {summary.stat}
                        </span>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Header */}
              <div className="bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 border-l-4 border-l-blue-500 rounded-lg px-5 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {activeInfo && (
                      <activeInfo.icon className="w-5 h-5 text-blue-600" />
                    )}
                    <div>
                      <h2 className="text-[15px] font-bold text-gray-800">
                        {activeInfo
                          ? activeInfo.headerTitle
                          : 'Select a category'}
                      </h2>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Detailed analysis for Mona Azami
                      </p>
                    </div>
                  </div>
                  {activeCard === 'wearables' && (
                    <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg border border-blue-200/60">
                      <Wifi className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[11px] font-semibold text-gray-700">
                        Connected Devices:
                      </span>
                      <span className="text-[11px] text-gray-600">
                        Aura Ring, Garmin Watch
                      </span>
                    </div>
                  )}
                  {activeInfo && activeInfo.hasDate && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 font-medium">
                        Test Date:
                      </span>
                      <select
                        value={selectedDates[activeCard]}
                        onChange={handleDateChange}
                        className="px-2.5 py-1.5 bg-white/80 border border-blue-200 rounded-md text-[11px] text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
                      >
                        {activeInfo.dates.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Segmented Controls */}
              <div className="flex items-center justify-between">
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => handleLeftTab('summary')}
                    className={`px-4 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-150 ${leftTab === 'summary' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => handleLeftTab('insight')}
                    className={`px-4 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-150 ${leftTab === 'insight' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Insight
                  </button>
                </div>
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => handleRightTab('one')}
                    className={`px-4 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-150 ${rightTab === 'one' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {activeCard === 'wearables' ? 'Last Status' : 'One Result'}
                  </button>
                  <button
                    onClick={() => handleRightTab('history')}
                    className={`px-4 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-150 ${rightTab === 'history' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    History
                  </button>
                </div>
              </div>

              {/* Content Area — full width */}
              {hasPanelView && leftTab === 'summary' && rightTab === 'one' ? (
                <div className="space-y-4">
                  {isWearable && (
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[12px] text-gray-500">
                          Last Updated:
                        </span>
                        <span className="text-[12px] font-semibold text-gray-700">
                          Yesterday
                        </span>
                      </div>
                      <button className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors duration-150">
                        <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2.5">
                    {activePanels.map((panel) => {
                      const PanelIcon = panel.icon;
                      const isActive = selectedPanelName === panel.name;
                      if (isWearable) {
                        const sc =
                          panel.score >= 80
                            ? 'text-emerald-500'
                            : panel.score >= 60
                              ? 'text-teal-500'
                              : panel.score >= 40
                                ? 'text-amber-500'
                                : panel.score > 0
                                  ? 'text-orange-500'
                                  : 'text-gray-400';
                        const bg =
                          panel.score >= 80
                            ? 'bg-emerald-50/80 border-emerald-100'
                            : panel.score >= 60
                              ? 'bg-teal-50/80 border-teal-100'
                              : panel.score >= 40
                                ? 'bg-amber-50/80 border-amber-100'
                                : panel.score > 0
                                  ? 'bg-orange-50/80 border-orange-100'
                                  : 'bg-gray-50 border-gray-200';
                        return (
                          <button
                            key={panel.name}
                            onClick={() => handlePanelClick(panel.name)}
                            className={`rounded-xl border px-4 py-4 ${bg} hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col items-center gap-0.5 ${isActive ? 'ring-2 ring-blue-400 shadow-md' : ''}`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center mb-1">
                              <PanelIcon className={`w-4 h-4 ${sc}`} />
                            </div>
                            <p
                              className={`text-[26px] font-bold leading-none ${sc}`}
                            >
                              {panel.score}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <p className="text-[11px] text-gray-600 font-medium">
                                {panel.name}
                              </p>
                              <Info className="w-3 h-3 text-gray-300" />
                            </div>
                          </button>
                        );
                      }
                      const s = scoreStyles[panel.score];
                      return (
                        <button
                          key={panel.name}
                          onClick={() => handlePanelClick(panel.name)}
                          className={`rounded-lg border px-3 py-2.5 ${s.bg} ${s.border} hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-2.5 text-left ${isActive ? 'ring-2 ring-blue-400 shadow-md' : ''}`}
                        >
                          <div className="w-8 h-8 rounded-md bg-white/70 flex items-center justify-center flex-shrink-0">
                            <PanelIcon className={`w-4 h-4 ${s.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-[12px] font-bold ${s.text} leading-tight`}
                            >
                              {panel.name}
                            </p>
                            <p className="text-[9px] text-gray-500 mt-0.5">
                              {panel.needFocus > 0
                                ? `${panel.needFocus} of ${panel.biomarkers} Biomarkers Need Focus`
                                : `${panel.biomarkers} Biomarkers · All in range`}
                            </p>
                          </div>
                          <span
                            className={`text-[12px] font-extrabold px-2 py-0.5 rounded-md flex-shrink-0 ${s.badge}`}
                          >
                            {panel.score}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* BIOMARKERS CARD */}
                  {selectedPanelName &&
                    activePanelBiomarkers[selectedPanelName] && (
                      <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                        <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                              Biomarkers
                            </p>
                            <p className="text-[13px] font-bold text-gray-800 mt-0.5">
                              {selectedPanelName} Panel
                            </p>
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {activePanelBiomarkers[selectedPanelName].length}{' '}
                            biomarkers
                          </span>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {activePanelBiomarkers[selectedPanelName].map(
                            (bio) => {
                              const showHistory =
                                historyToggles[bio.name] || false;
                              const statusColor =
                                bio.status === 'optimal'
                                  ? 'text-emerald-600'
                                  : bio.status === 'ref'
                                    ? 'text-amber-600'
                                    : 'text-red-600';
                              return (
                                <div key={bio.name} className="px-5 py-4">
                                  {/* Biomarker header */}
                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <span className="text-[13px] font-semibold text-gray-800">
                                        {bio.name}
                                      </span>
                                      <span className="text-[11px] text-gray-400 ml-1.5">
                                        ({bio.unit})
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-[11px] text-gray-500">
                                        History
                                      </span>
                                      <button
                                        onClick={() =>
                                          handleHistoryToggle(bio.name)
                                        }
                                        className={`w-10 h-[22px] rounded-full flex items-center transition-colors duration-200 px-0.5 ${showHistory ? 'bg-[#10B981]' : 'bg-gray-300'}`}
                                      >
                                        <div
                                          className={`w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${showHistory ? 'translate-x-[18px]' : 'translate-x-0'}`}
                                        />
                                      </button>
                                    </div>
                                  </div>

                                  {!showHistory ? (
                                    <div>
                                      {/* Zone labels */}
                                      <div className="flex mb-1">
                                        {bio.zones.map((z, zi) => (
                                          <div
                                            key={zi}
                                            className="text-center"
                                            style={{ width: z.pct + '%' }}
                                          >
                                            <p className="text-[9px] text-gray-500 font-medium">
                                              {z.label}
                                            </p>
                                            <p className="text-[8px] text-gray-400">
                                              {z.range}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                      {/* Gradient bar */}
                                      <div className="relative h-3 rounded-full overflow-hidden">
                                        <div className="absolute inset-0 flex">
                                          {bio.zones.map((z, zi) => {
                                            const colors = [
                                              'bg-emerald-400',
                                              'bg-yellow-400',
                                              'bg-orange-400',
                                              'bg-red-400',
                                            ];
                                            return (
                                              <div
                                                key={zi}
                                                className={`h-full ${colors[zi] || 'bg-red-400'}`}
                                                style={{ width: z.pct + '%' }}
                                              />
                                            );
                                          })}
                                        </div>
                                        {/* Marker */}
                                        <div
                                          className="absolute top-0 h-full flex flex-col items-center"
                                          style={{
                                            left: bio.markerPct + '%',
                                            transform: 'translateX(-50%)',
                                          }}
                                        >
                                          <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-800" />
                                        </div>
                                      </div>
                                      {/* Value label */}
                                      <div className="mt-2 text-center">
                                        <span className="text-[10px] text-gray-500">
                                          You:{' '}
                                        </span>
                                        <span
                                          className={`text-[11px] font-bold ${statusColor}`}
                                        >
                                          {bio.value} {bio.unit}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="h-[160px]">
                                      <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                      >
                                        <LineChart
                                          data={bio.history}
                                          margin={{
                                            top: 10,
                                            right: 10,
                                            left: -10,
                                            bottom: 5,
                                          }}
                                        >
                                          <ReferenceArea
                                            y1={bio.refLow}
                                            y2={bio.refHigh}
                                            fill="#10B981"
                                            fillOpacity={0.1}
                                          />
                                          <ReferenceLine
                                            y={bio.refHigh}
                                            stroke="#10B981"
                                            strokeDasharray="3 3"
                                            strokeOpacity={0.5}
                                          />
                                          <ReferenceLine
                                            y={
                                              bio.refLow > 0
                                                ? bio.refLow
                                                : undefined
                                            }
                                            stroke="#10B981"
                                            strokeDasharray="3 3"
                                            strokeOpacity={0.5}
                                          />
                                          <XAxis
                                            dataKey="d"
                                            tick={{
                                              fontSize: 10,
                                              fill: '#9CA3AF',
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                          />
                                          <YAxis
                                            tick={{
                                              fontSize: 10,
                                              fill: '#9CA3AF',
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                          />
                                          <Tooltip
                                            contentStyle={{
                                              fontSize: 11,
                                              borderRadius: 8,
                                              border: '1px solid #e5e7eb',
                                            }}
                                          />
                                          <Line
                                            type="monotone"
                                            dataKey="v"
                                            stroke="#10B981"
                                            strokeWidth={2}
                                            dot={{
                                              fill: '#10B981',
                                              r: 4,
                                              strokeWidth: 2,
                                              stroke: '#fff',
                                            }}
                                            activeDot={{ r: 6 }}
                                            name={bio.name}
                                          />
                                        </LineChart>
                                      </ResponsiveContainer>
                                    </div>
                                  )}
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    )}

                  {/* PANEL INTERVENTION STRATEGY */}
                  {selectedPanelName &&
                    activePanelInterventions[selectedPanelName] && (
                      <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-green-50 border-b border-emerald-100 px-5 py-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                                Intervention Strategy
                              </p>
                              <p className="text-[13px] font-bold text-gray-800 mt-0.5">
                                {
                                  activePanelInterventions[selectedPanelName]
                                    .title
                                }
                              </p>
                            </div>
                            <span className="text-[9px] text-gray-400 bg-white/70 px-2 py-1 rounded-md">
                              From Generated Holistic Plan
                            </span>
                          </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {activePanelInterventions[
                            selectedPanelName
                          ].interventions.map((iv, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50 transition-colors duration-150"
                            >
                              <span
                                className={`text-[9px] font-bold px-2.5 py-1 rounded-md ${catColors[iv.category] || 'bg-gray-100 text-gray-600'}`}
                              >
                                {iv.category}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-semibold text-gray-800">
                                  {iv.name}
                                </p>
                                <p className="text-[10px] text-gray-500 mt-0.5">
                                  {iv.impact}
                                </p>
                              </div>
                              <span className="text-[10px] text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md font-medium flex-shrink-0">
                                {iv.dose}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : hasPanelView &&
                !isWearable &&
                leftTab === 'summary' &&
                rightTab === 'history' ? (
                <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        {isFitness
                          ? 'Fitness Panel Scores Over Time'
                          : 'Blood Panel Scores Over Time'}
                      </p>
                      <p className="text-[13px] font-bold text-gray-800 mt-0.5">
                        Score History — All Panels
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {activePanels.filter((p) => visiblePanels[p.name]).length}{' '}
                      of {activePanels.length} visible
                    </span>
                  </div>

                  {/* Panel toggle chips */}
                  <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap gap-1.5">
                    {activePanels.map((panel) => {
                      const isOn = visiblePanels[panel.name];
                      const color = activePanelLineColors[panel.name];
                      return (
                        <button
                          key={panel.name}
                          onClick={() => handleTogglePanel(panel.name)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all duration-150 flex items-center gap-1.5 ${isOn ? 'border-transparent text-white' : 'border-gray-200 text-gray-400 bg-white hover:border-gray-300'}`}
                          style={isOn ? { backgroundColor: color } : {}}
                        >
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: isOn ? '#fff' : color }}
                          />
                          {panel.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Chart */}
                  <div className="px-5 py-4">
                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={activePanelScoreHistory}
                          margin={{ top: 15, right: 20, left: 5, bottom: 10 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
                          <XAxis
                            dataKey="date"
                            tick={{
                              fontSize: 11,
                              fill: '#6B7280',
                              fontWeight: 500,
                            }}
                            axisLine={{ stroke: '#E5E7EB' }}
                            tickLine={false}
                            dy={8}
                          />
                          <YAxis
                            domain={[0.5, 6.5]}
                            ticks={[1, 2, 3, 4, 5, 6]}
                            tickFormatter={(v) => numToScore[v] || ''}
                            tick={{
                              fontSize: 11,
                              fill: '#6B7280',
                              fontWeight: 600,
                            }}
                            axisLine={{ stroke: '#E5E7EB' }}
                            tickLine={false}
                            dx={-5}
                          />
                          <ReferenceArea
                            y1={4.5}
                            y2={6.5}
                            fill="#10B981"
                            fillOpacity={0.06}
                          />
                          <ReferenceArea
                            y1={2.5}
                            y2={4.5}
                            fill="#F59E0B"
                            fillOpacity={0.04}
                          />
                          <ReferenceArea
                            y1={0.5}
                            y2={2.5}
                            fill="#EF4444"
                            fillOpacity={0.04}
                          />
                          <Tooltip
                            contentStyle={{
                              fontSize: 11,
                              borderRadius: 10,
                              border: '1px solid #e5e7eb',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            }}
                            formatter={(value) => [
                              numToScore[value] || value,
                              '',
                            ]}
                            labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                          />
                          {activePanels.map(
                            (panel) =>
                              visiblePanels[panel.name] && (
                                <Line
                                  key={panel.name}
                                  type="monotone"
                                  dataKey={panel.name}
                                  stroke={activePanelLineColors[panel.name]}
                                  strokeWidth={2.5}
                                  dot={{
                                    fill: activePanelLineColors[panel.name],
                                    r: 5,
                                    strokeWidth: 2,
                                    stroke: '#fff',
                                  }}
                                  activeDot={{ r: 7, strokeWidth: 2 }}
                                  connectNulls
                                />
                              ),
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Legend table */}
                  <div className="px-5 pb-4">
                    <div className="grid grid-cols-3 gap-x-4 gap-y-1.5">
                      {activePanels
                        .filter((p) => visiblePanels[p.name])
                        .map((panel) => {
                          const s = scoreStyles[panel.score];
                          return (
                            <div
                              key={panel.name}
                              className="flex items-center gap-2 py-1"
                            >
                              <div
                                className="w-3 h-3 rounded-sm flex-shrink-0"
                                style={{
                                  backgroundColor:
                                    activePanelLineColors[panel.name],
                                }}
                              />
                              <span className="text-[10px] text-gray-700 font-medium flex-1 truncate">
                                {panel.name}
                              </span>
                              <span
                                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${s.badge}`}
                              >
                                {panel.score}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              ) : hasPanelView && leftTab === 'insight' ? (
                <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                  {/* TABLE HEADER */}
                  <div className="grid grid-cols-[1fr_130px_110px_70px] gap-0 bg-gray-50 border-b border-gray-200 px-4 py-2.5">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Insight
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Urgency
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Confidence
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-center">
                      In Plan
                    </span>
                  </div>
                  {/* TABLE ROWS */}
                  {currentInsights.map((row) => (
                    <div key={row.id}>
                      <div
                        className={`grid grid-cols-[1fr_130px_110px_70px] gap-0 px-4 py-3 border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-150 cursor-pointer ${currentSelectedId === row.id ? 'bg-blue-50/50 border-l-2 border-l-blue-400' : ''}`}
                      >
                        <button
                          onClick={() => handleCurrentInsightClick(row.id)}
                          className="text-left pr-3"
                        >
                          <p
                            className={`text-[11px] leading-relaxed ${currentSelectedId === row.id ? 'text-blue-700 font-semibold' : 'text-gray-700'}`}
                          >
                            {row.insight}
                          </p>
                        </button>
                        <div className="flex items-center">
                          <select
                            value={row.urgency}
                            onChange={(e) =>
                              handleCurrentUrgencyChange(row.id, e.target.value)
                            }
                            className={`text-[10px] font-semibold px-2 py-1 rounded-md border cursor-pointer focus:outline-none ${urgencyStyles[row.urgency]}`}
                          >
                            <option value="Urgent">Urgent</option>
                            <option value="Need Improvement">
                              Need Improvement
                            </option>
                            <option value="Good">Good</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-center">
                          {row.confidence === 'Manual' ? (
                            <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                              Manual
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                handleCurrentToggleConfidence(row.id)
                              }
                              className={`text-[10px] font-semibold flex items-center gap-1 hover:underline ${confidenceStyles[row.confidence]}`}
                            >
                              {row.confidence}
                              <Info className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleCurrentToggleInPlan(row.id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-150 ${row.inPlan ? 'bg-[#10B981] border-[#10B981]' : 'border-gray-300 hover:border-gray-400'}`}
                          >
                            {row.inPlan && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </button>
                        </div>
                      </div>
                      {currentExpandedConf === row.id && (
                        <div className="px-4 py-2.5 bg-slate-50 border-b border-gray-100">
                          <div className="flex items-start gap-2">
                            <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] text-gray-600 leading-relaxed">
                              {row.confidenceReason}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {/* ADD INSIGHT ROW */}
                  {currentShowAdd ? (
                    <div className="px-4 py-3 bg-blue-50/30 border-t border-blue-100">
                      <div className="grid grid-cols-[1fr_130px_110px_70px] gap-2 items-start">
                        <textarea
                          value={currentNewInsight.insight}
                          onChange={handleCurrentNewInsightText}
                          placeholder="Describe the insight..."
                          className="text-[11px] text-gray-700 px-2.5 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                          rows={2}
                        />
                        <select
                          value={currentNewInsight.urgency}
                          onChange={handleCurrentNewInsightUrgency}
                          className="text-[10px] font-semibold px-2 py-1.5 rounded-md border border-gray-200 bg-white cursor-pointer focus:outline-none"
                        >
                          <option value="Urgent">Urgent</option>
                          <option value="Need Improvement">
                            Need Improvement
                          </option>
                          <option value="Good">Good</option>
                        </select>
                        <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-1.5 rounded-md text-center">
                          Manual
                        </span>
                        <div className="flex items-center justify-center pt-1.5">
                          <button
                            onClick={handleCurrentNewInsightInPlan}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-150 ${currentNewInsight.inPlan ? 'bg-[#10B981] border-[#10B981]' : 'border-gray-300 hover:border-gray-400'}`}
                          >
                            {currentNewInsight.inPlan && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-2.5">
                        <button
                          onClick={handleCurrentToggleAddInsight}
                          className="px-3 py-1.5 text-[10px] text-gray-500 hover:bg-gray-100 rounded-md transition-colors duration-150"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCurrentAddInsight}
                          className="px-3 py-1.5 text-[10px] font-semibold text-white bg-[#10B981] hover:bg-[#059669] rounded-md transition-colors duration-150"
                        >
                          Add Insight
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleCurrentToggleAddInsight}
                      className="w-full py-2.5 text-[11px] text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 flex items-center justify-center gap-1.5 border-t border-gray-100"
                    >
                      <Plus className="w-3 h-3" /> Add Insight
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200/80 border-dashed p-8 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                    {activeInfo && (
                      <activeInfo.icon className="w-6 h-6 text-blue-400" />
                    )}
                  </div>
                  <p className="text-[14px] font-semibold text-gray-700">
                    {activeInfo ? activeInfo.headerTitle : ''}
                  </p>
                  <p className="text-[12px] text-gray-400 mt-1 text-center max-w-[280px]">
                    {leftTab === 'summary' ? 'Summary' : 'Insight'} ·{' '}
                    {rightTab === 'one' ? 'One Result' : 'History'}
                  </p>
                  <p className="text-[11px] text-gray-300 mt-0.5">
                    Content will be displayed here
                  </p>
                </div>
              )}

              {/* DESCRIPTION & REASON CARD */}
              {currentSelectedId &&
                hasPanelView &&
                leftTab === 'insight' &&
                currentInsightDetails[currentSelectedId] && (
                  <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border-b border-blue-100 px-5 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                            Description & Reason
                          </p>
                          <p className="text-[13px] font-bold text-gray-800 mt-0.5">
                            {currentInsights
                              .find((i) => i.id === currentSelectedId)
                              ?.insight.slice(0, 70)}
                            ...
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-[9px] text-gray-400 bg-white/70 px-2 py-1 rounded-md">
                            AI-Generated Analysis
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-4 space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center">
                            <ClipboardList className="w-3 h-3 text-blue-600" />
                          </div>
                          <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                            Description
                          </p>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-relaxed pl-7">
                          {currentInsightDetails[currentSelectedId].description}
                        </p>
                      </div>
                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-md bg-amber-100 flex items-center justify-center">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                          </div>
                          <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                            Reason
                          </p>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-relaxed pl-7">
                          {currentInsightDetails[currentSelectedId].reason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* INTERVENTION STRATEGY CARD */}
              {currentSelectedId &&
                hasPanelView &&
                leftTab === 'insight' &&
                currentInterventionData[currentSelectedId] && (
                  <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-green-50 border-b border-emerald-100 px-5 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                            Intervention Strategy
                          </p>
                          <p className="text-[13px] font-bold text-gray-800 mt-0.5">
                            {currentInterventionData[currentSelectedId].title}
                          </p>
                        </div>
                        <span className="text-[9px] text-gray-400 bg-white/70 px-2 py-1 rounded-md">
                          From Generated Holistic Plan
                        </span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {currentInterventionData[
                        currentSelectedId
                      ].interventions.map((iv, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50 transition-colors duration-150"
                        >
                          <span
                            className={`text-[9px] font-bold px-2.5 py-1 rounded-md ${catColors[iv.category] || 'bg-gray-100 text-gray-600'}`}
                          >
                            {iv.category}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-gray-800">
                              {iv.name}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              {iv.impact}
                            </p>
                          </div>
                          <span className="text-[10px] text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md font-medium flex-shrink-0">
                            {iv.dose}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* ===== SECTION B: RIGHT SIDEBAR (FIXED) ===== */}
            <div className="w-[300px] flex-shrink-0">
              <div className="sticky top-0 space-y-4 max-h-[calc(100vh-92px)] overflow-y-auto">
                {/* Notes Card */}
                <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <StickyNote className="w-4 h-4 text-amber-500" />
                      <h3 className="text-[13px] font-bold text-gray-900">
                        Notes
                      </h3>
                    </div>
                    <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                      {notes.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="group p-3 bg-amber-50/50 rounded-lg border border-amber-100/60 hover:border-amber-200 transition-colors duration-150"
                      >
                        <p className="text-[11px] text-gray-700 leading-relaxed">
                          {note.text}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-gray-300" />
                            <span className="text-[9px] text-gray-400">
                              {note.date} · {note.author}
                            </span>
                          </div>
                          <button className="w-5 h-5 rounded hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {showNoteInput && (
                    <div className="mt-3">
                      <textarea
                        value={noteInput}
                        onChange={handleNoteInput}
                        placeholder="Write a note about this patient's data..."
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 resize-none"
                        rows={3}
                      />
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button
                          onClick={toggleNoteInput}
                          className="px-3 py-1.5 text-[11px] text-gray-500 hover:bg-gray-100 rounded-md transition-colors duration-150"
                        >
                          Cancel
                        </button>
                        <button className="px-3 py-1.5 text-[11px] font-semibold text-white bg-[#10B981] hover:bg-[#059669] rounded-md transition-colors duration-150">
                          Save Note
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={toggleNoteInput}
                    className="w-full mt-3 py-2.5 border border-dashed border-gray-300 rounded-lg text-[11px] text-gray-500 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 transition-colors duration-150 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3 h-3" /> Add Note
                  </button>
                </div>

                {/* Chat Card */}
                <div className="bg-white rounded-xl border border-gray-200/80 flex flex-col h-[320px]">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="text-[13px] font-bold text-gray-900">
                      Chat with Mona
                    </h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                    <div className="flex justify-start">
                      <div className="max-w-[85%] px-3 py-2 rounded-xl bg-gray-100 text-gray-800">
                        <p className="text-[11px] leading-relaxed">
                          Hi doctor, I had my ApoB test done yesterday. Should I
                          send the results through the app?
                        </p>
                        <p className="text-[9px] mt-1 text-gray-400">2h ago</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="max-w-[85%] px-3 py-2 rounded-xl bg-[#10B981]/10 text-gray-800">
                        <p className="text-[11px] leading-relaxed">
                          Great news, Mona! Yes please upload via the app. I'll
                          review once it's in.
                        </p>
                        <p className="text-[9px] mt-1 text-emerald-500">
                          1h ago
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="max-w-[85%] px-3 py-2 rounded-xl bg-gray-100 text-gray-800">
                        <p className="text-[11px] leading-relaxed">
                          Perfect, uploading now. Also wanted to ask about the
                          new supplement timing.
                        </p>
                        <p className="text-[9px] mt-1 text-gray-400">45m ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 pb-3 pt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={noteInput}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150"
                      />
                      <button className="w-8 h-8 bg-[#10B981] hover:bg-[#059669] rounded-lg flex items-center justify-center transition-colors duration-150">
                        <Send className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useState,
  useMemo,
  SetStateAction,
  type ReactElement,
  type ReactNode,
  type ReactPortal,
  type JSXElementConstructor,
  type Key,
} from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Network,
  Palette,
  FlaskConical,
  ClipboardList,
  Salad,
  Dumbbell,
  Pill,
  Leaf,
  Syringe,
  PackageOpen,
  FileDown,
  ChevronRight,
  ChevronDown,
  Bell,
  Search,
  Settings,
  MoreHorizontal,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  Inbox,
  Plus,
  Filter,
  MessageCircle,
  CalendarClock,
  Eye,
  Smartphone,
  X,
  ChevronLeft,
  Flag,
  Check,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Plug,
  Shield,
  Pencil,
  Trash2,
  Zap,
  BookOpen,
  Tag,
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
  CartesianGrid,
  Tooltip,
  RadialBarChart,
  RadialBar,
} from 'recharts';

{
  /* ========== DASHBOARD DATA ========== */
}
const attentionData = { immediate: 12, monitor: 34, stable: 89 };
const totalPatients =
  attentionData.immediate + attentionData.monitor + attentionData.stable;

const engagementData: any = [
  { name: 'Lab Coverage', value: 74, fill: '#10B981' },
  { name: 'Wearable', value: 58, fill: '#0D9488' },
  { name: 'App Active', value: 82, fill: '#6366F1' },
  { name: 'Follow-ups Due', value: 21, fill: '#F59E0B' },
  { name: 'AI Plans', value: 67, fill: '#8B5CF6' },
];

const priorityQueue: any = [
  {
    id: 1,
    name: 'Mona Azami',
    initials: 'MA',
    priority: 'immediate',
    reason: 'Missing ApoB biomarker — overdue 14 days',
    unread: true,
  },
  {
    id: 2,
    name: 'Felix Petrov',
    initials: 'FP',
    priority: 'immediate',
    reason: 'HbA1c trending above threshold (6.8%)',
    unread: false,
  },
  {
    id: 3,
    name: 'Aaliya Gupta',
    initials: 'AG',
    priority: 'immediate',
    reason: 'Cortisol spike detected via wearable',
    unread: true,
  },
  {
    id: 4,
    name: 'Marcus Torres',
    initials: 'MT',
    priority: 'monitor',
    reason: 'Sleep protocol adherence dropped to 40%',
    unread: false,
  },
  {
    id: 5,
    name: 'Sara Lindqvist',
    initials: 'SL',
    priority: 'monitor',
    reason: 'Vitamin D levels declining — recheck due',
    unread: false,
  },
  {
    id: 6,
    name: 'Omar Hadid',
    initials: 'OH',
    priority: 'monitor',
    reason: 'Peptide therapy cycle ending in 3 days',
    unread: true,
  },
  {
    id: 7,
    name: 'Chiara Rossi',
    initials: 'CR',
    priority: 'stable',
    reason: 'Lifestyle plan progressing on track',
    unread: false,
  },
  {
    id: 8,
    name: 'James Okafor',
    initials: 'JO',
    priority: 'monitor',
    reason: 'BMI plateau — intervention review needed',
    unread: false,
  },
];

const dashMessages: any = [
  {
    id: 1,
    name: 'Mona Azami',
    initials: 'MA',
    snippet:
      'Hi doctor, I had my ApoB test done yesterday. Should I send the results through the app?',
    time: '2h ago',
    waiting: false,
  },
  {
    id: 2,
    name: 'Felix Petrov',
    initials: 'FP',
    snippet:
      'I have been experiencing some dizziness after the new supplement. Is that expected?',
    time: '18h ago',
    waiting: false,
  },
  {
    id: 3,
    name: 'Sara Lindqvist',
    initials: 'SL',
    snippet: 'Can we reschedule my follow-up to next Thursday instead?',
    time: '26h ago',
    waiting: true,
  },
  {
    id: 4,
    name: 'Omar Hadid',
    initials: 'OH',
    snippet:
      'My sleep tracker shows improvement this week. Wanted to share the data with you.',
    time: '31h ago',
    waiting: true,
  },
];

const programs: any = [
  { name: 'Peptide Therapy', count: 28, color: '#8B5CF6' },
  { name: 'Lifestyle Optimization', count: 45, color: '#10B981' },
  { name: 'Diet Intervention', count: 33, color: '#F59E0B' },
  { name: 'Sleep Protocol', count: 19, color: '#0D9488' },
];
const programDonut: any = programs.map((p: any) => ({
  name: p.name,
  value: p.count,
  fill: p.color,
}));

const growthData: any = [
  { month: 'Aug', active: 98, new: 14, churned: 3 },
  { month: 'Sep', active: 109, new: 16, churned: 5 },
  { month: 'Oct', active: 118, new: 13, churned: 4 },
  { month: 'Nov', active: 124, new: 11, churned: 5 },
  { month: 'Dec', active: 128, new: 9, churned: 5 },
  { month: 'Jan', active: 135, new: 15, churned: 8 },
];

{
  /* ========== CLIENT LIST DATA ========== */
}
const clientData: any = [
  {
    id: 'HC-0041',
    name: 'Mona Azami',
    initials: 'MA',
    gender: 'F',
    age: 42,
    urgency: 'immediate',
    enrollment: {
      program: 'Peptide Therapy',
      startDate: 'Oct 12',
      week: 6,
      totalWeeks: 12,
    },
    connectedApps: ['Oura', 'Apple Health'],
    category: 'Peptide',
    planStatus: 'draft',
    lastCheckIn: 18,
    assigned: 'Dr. Holt',
  },
  {
    id: 'HC-0023',
    name: 'Felix Petrov',
    initials: 'FP',
    gender: 'M',
    age: 55,
    urgency: 'immediate',
    enrollment: {
      program: 'Longevity Protocol',
      startDate: 'Sep 3',
      week: 10,
      totalWeeks: 16,
    },
    connectedApps: ['Garmin', 'Oura'],
    category: 'Longevity',
    planStatus: 'active',
    lastCheckIn: 3,
    assigned: 'Dr. Holt',
  },
  {
    id: 'HC-0067',
    name: 'Aaliya Gupta',
    initials: 'AG',
    gender: 'F',
    age: 38,
    urgency: 'immediate',
    enrollment: {
      program: 'Diet Intervention',
      startDate: 'Nov 20',
      week: 4,
      totalWeeks: 8,
    },
    connectedApps: ['Apple Health'],
    category: 'Diet',
    planStatus: 'active',
    lastCheckIn: 1,
    assigned: 'Dr. Voss',
  },
  {
    id: 'HC-0089',
    name: 'Marcus Torres',
    initials: 'MT',
    gender: 'M',
    age: 47,
    urgency: 'monitor',
    enrollment: {
      program: 'Sleep Protocol',
      startDate: 'Aug 15',
      week: 14,
      totalWeeks: 16,
    },
    connectedApps: ['Oura', 'Garmin', 'Apple Health'],
    category: 'Sleep',
    planStatus: 'active',
    lastCheckIn: 5,
    assigned: 'Dr. Holt',
  },
  {
    id: 'HC-0034',
    name: 'Sara Lindqvist',
    initials: 'SL',
    gender: 'F',
    age: 51,
    urgency: 'monitor',
    enrollment: {
      program: 'Longevity Protocol',
      startDate: 'Oct 1',
      week: 8,
      totalWeeks: 16,
    },
    connectedApps: ['Garmin'],
    category: 'Longevity',
    planStatus: 'active',
    lastCheckIn: 7,
    assigned: 'Dr. Voss',
  },
  {
    id: 'HC-0056',
    name: 'Omar Hadid',
    initials: 'OH',
    gender: 'M',
    age: 33,
    urgency: 'monitor',
    enrollment: {
      program: 'Peptide Therapy',
      startDate: 'Nov 1',
      week: 5,
      totalWeeks: 12,
    },
    connectedApps: ['Oura', 'Apple Health'],
    category: 'Peptide',
    planStatus: 'active',
    lastCheckIn: 2,
    assigned: 'Dr. Holt',
  },
  {
    id: 'HC-0078',
    name: 'Chiara Rossi',
    initials: 'CR',
    gender: 'F',
    age: 35,
    urgency: 'stable',
    enrollment: {
      program: 'Lifestyle Optimization',
      startDate: 'Jul 22',
      week: 16,
      totalWeeks: 16,
    },
    connectedApps: ['Apple Health', 'Garmin', 'Oura'],
    category: 'Lifestyle',
    planStatus: 'active',
    lastCheckIn: 2,
    assigned: 'Dr. Holt',
  },
  {
    id: 'HC-0012',
    name: 'James Okafor',
    initials: 'JO',
    gender: 'M',
    age: 60,
    urgency: 'monitor',
    enrollment: {
      program: 'Diet Intervention',
      startDate: 'Dec 5',
      week: 3,
      totalWeeks: 8,
    },
    connectedApps: ['Garmin'],
    category: 'Diet',
    planStatus: 'draft',
    lastCheckIn: 10,
    assigned: 'Dr. Voss',
  },
  {
    id: 'HC-0045',
    name: 'Lena Muller',
    initials: 'LM',
    gender: 'F',
    age: 29,
    urgency: 'stable',
    enrollment: {
      program: 'Sleep Protocol',
      startDate: 'Sep 18',
      week: 12,
      totalWeeks: 16,
    },
    connectedApps: ['Oura'],
    category: 'Sleep',
    planStatus: 'active',
    lastCheckIn: 4,
    assigned: 'Dr. Holt',
  },
  {
    id: 'HC-0091',
    name: 'Raj Patel',
    initials: 'RP',
    gender: 'M',
    age: 44,
    urgency: 'stable',
    enrollment: {
      program: 'Longevity Protocol',
      startDate: 'Oct 28',
      week: 7,
      totalWeeks: 16,
    },
    connectedApps: ['Apple Health', 'Oura'],
    category: 'Longevity',
    planStatus: 'active',
    lastCheckIn: 1,
    assigned: 'Dr. Voss',
  },
  {
    id: 'HC-0063',
    name: 'Yuki Tanaka',
    initials: 'YT',
    gender: 'F',
    age: 41,
    urgency: 'immediate',
    enrollment: {
      program: 'Peptide Therapy',
      startDate: 'Nov 10',
      week: 4,
      totalWeeks: 12,
    },
    connectedApps: [],
    category: 'Peptide',
    planStatus: 'none',
    lastCheckIn: 22,
    assigned: 'Dr. Holt',
  },
  {
    id: 'HC-0029',
    name: 'David Kim',
    initials: 'DK',
    gender: 'M',
    age: 52,
    urgency: 'stable',
    enrollment: {
      program: 'Lifestyle Optimization',
      startDate: 'Aug 5',
      week: 16,
      totalWeeks: 16,
    },
    connectedApps: ['Garmin', 'Apple Health'],
    category: 'Lifestyle',
    planStatus: 'active',
    lastCheckIn: 3,
    assigned: 'Dr. Voss',
  },
];

const urgencyConfig: any = {
  immediate: {
    label: 'Immediate',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    ring: 'bg-red-500',
    avatarBg: 'bg-red-100',
    avatarText: 'text-red-700',
  },
  monitor: {
    label: 'Monitor',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    ring: 'bg-amber-500',
    avatarBg: 'bg-amber-100',
    avatarText: 'text-amber-700',
  },
  stable: {
    label: 'Stable',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    ring: 'bg-emerald-500',
    avatarBg: 'bg-emerald-100',
    avatarText: 'text-emerald-700',
  },
};

const planConfig: any = {
  active: {
    label: 'Active',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  draft: {
    label: 'Draft',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
  },
  none: {
    label: 'No Plan',
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
  },
};

const categoryColors: any = {
  Peptide: 'bg-violet-50 text-violet-700 border-violet-200',
  Longevity: 'bg-blue-50 text-blue-700 border-blue-200',
  Diet: 'bg-amber-50 text-amber-700 border-amber-200',
  Sleep: 'bg-teal-50 text-teal-700 border-teal-200',
  Lifestyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const biomarkerData: any = [
  {
    id: 1,
    name: 'Hemoglobin A1c (HbA1c)',
    unit: '%',
    category: 'Blood',
    panels: ['Metabolic Health', 'Diabetes Risk'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 2,
    name: 'Fasting Glucose',
    unit: 'mg/dL',
    category: 'Blood',
    panels: ['Metabolic Health', 'Diabetes Risk'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 3,
    name: 'Fasting Insulin',
    unit: 'µIU/mL',
    category: 'Blood',
    panels: ['Metabolic Health', 'Diabetes Risk'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 4,
    name: 'HOMA-IR',
    unit: 'index',
    category: 'Blood',
    panels: ['Metabolic Health', 'Diabetes Risk'],
    type: 'Formula',
    sex: 'both',
  },
  {
    id: 5,
    name: 'Total Cholesterol',
    unit: 'mg/dL',
    category: 'Blood',
    panels: ['Cardiovascular', 'Lipid Panel'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 6,
    name: 'LDL Cholesterol',
    unit: 'mg/dL',
    category: 'Blood',
    panels: ['Cardiovascular', 'Lipid Panel'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 7,
    name: 'HDL Cholesterol',
    unit: 'mg/dL',
    category: 'Blood',
    panels: ['Cardiovascular', 'Lipid Panel'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 8,
    name: 'Apolipoprotein B (ApoB)',
    unit: 'mg/dL',
    category: 'Blood',
    panels: ['Cardiovascular', 'Lipid Panel'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 9,
    name: 'Lp(a)',
    unit: 'nmol/L',
    category: 'Blood',
    panels: ['Cardiovascular'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 10,
    name: 'hs-CRP',
    unit: 'mg/L',
    category: 'Blood',
    panels: ['Inflammation', 'Cardiovascular'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 11,
    name: 'IL-6',
    unit: 'pg/mL',
    category: 'Blood',
    panels: ['Inflammation'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 12,
    name: 'Homocysteine',
    unit: 'µmol/L',
    category: 'Blood',
    panels: ['Inflammation', 'Methylation'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 13,
    name: 'Ferritin',
    unit: 'ng/mL',
    category: 'Blood',
    panels: ['Iron Panel', 'Essential Minerals'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 14,
    name: 'Serum Iron',
    unit: 'µg/dL',
    category: 'Blood',
    panels: ['Iron Panel', 'Essential Minerals'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 15,
    name: 'AST (SGOT)',
    unit: 'U/L',
    category: 'Blood',
    panels: ['Liver Function'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 16,
    name: 'ALT (SGPT)',
    unit: 'U/L',
    category: 'Blood',
    panels: ['Liver Function'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 17,
    name: 'GGT',
    unit: 'U/L',
    category: 'Blood',
    panels: ['Liver Function'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 18,
    name: 'Creatinine',
    unit: 'mg/dL',
    category: 'Blood',
    panels: ['Kidney Function'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 19,
    name: 'eGFR',
    unit: 'mL/min/1.73m²',
    category: 'Blood',
    panels: ['Kidney Function'],
    type: 'Formula',
    sex: 'both',
  },
  {
    id: 20,
    name: 'BUN',
    unit: 'mg/dL',
    category: 'Blood',
    panels: ['Kidney Function'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 21,
    name: 'Vitamin D (25-OH)',
    unit: 'ng/mL',
    category: 'Blood',
    panels: ['Vitamins', 'Bone Health'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 22,
    name: 'Vitamin B12',
    unit: 'pg/mL',
    category: 'Blood',
    panels: ['Vitamins', 'Methylation'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 23,
    name: 'Folate',
    unit: 'ng/mL',
    category: 'Blood',
    panels: ['Vitamins', 'Methylation'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 24,
    name: 'Magnesium (RBC)',
    unit: 'mg/dL',
    category: 'Blood',
    panels: ['Essential Minerals', 'Sleep'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 25,
    name: 'Zinc',
    unit: 'µg/dL',
    category: 'Blood',
    panels: ['Essential Minerals', 'Immune Function'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 26,
    name: 'Cortisol (AM)',
    unit: 'µg/dL',
    category: 'Blood',
    panels: ['Hormones', 'Adrenal Function'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 27,
    name: 'DHEA-S',
    unit: 'µg/dL',
    category: 'Blood',
    panels: ['Hormones', 'Adrenal Function'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 28,
    name: 'Free Testosterone',
    unit: 'pg/mL',
    category: 'Blood',
    panels: ['Hormones'],
    type: 'Single',
    sex: 'male',
  },
  {
    id: 29,
    name: 'Total Testosterone',
    unit: 'ng/dL',
    category: 'Blood',
    panels: ['Hormones'],
    type: 'Single',
    sex: 'male',
  },
  {
    id: 30,
    name: 'Estradiol (E2)',
    unit: 'pg/mL',
    category: 'Blood',
    panels: ['Hormones'],
    type: 'Single',
    sex: 'female',
  },
  {
    id: 31,
    name: 'Progesterone',
    unit: 'ng/mL',
    category: 'Blood',
    panels: ['Hormones'],
    type: 'Single',
    sex: 'female',
  },
  {
    id: 32,
    name: 'TSH',
    unit: 'mIU/L',
    category: 'Blood',
    panels: ['Thyroid'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 33,
    name: 'Free T3',
    unit: 'pg/mL',
    category: 'Blood',
    panels: ['Thyroid'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 34,
    name: 'Free T4',
    unit: 'ng/dL',
    category: 'Blood',
    panels: ['Thyroid'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 35,
    name: 'MTHFR C677T',
    unit: 'variant',
    category: 'Genetic',
    panels: ['Methylation', 'Genetic Risk'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 36,
    name: 'APOE Genotype',
    unit: 'allele',
    category: 'Genetic',
    panels: ['Cardiovascular', 'Genetic Risk'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 37,
    name: 'COMT Val158Met',
    unit: 'variant',
    category: 'Genetic',
    panels: ['Neurotransmitter', 'Genetic Risk'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 38,
    name: 'VDR Taq1',
    unit: 'variant',
    category: 'Genetic',
    panels: ['Vitamins', 'Genetic Risk'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 39,
    name: 'CYP1A2',
    unit: 'variant',
    category: 'Genetic',
    panels: ['Detoxification', 'Genetic Risk'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 40,
    name: 'Gut Microbiome Diversity',
    unit: 'Shannon Index',
    category: 'Microbiome',
    panels: ['Gut Health'],
    type: 'Formula',
    sex: 'both',
  },
  {
    id: 41,
    name: 'Firmicutes:Bacteroidetes Ratio',
    unit: 'ratio',
    category: 'Microbiome',
    panels: ['Gut Health', 'Metabolic Health'],
    type: 'Formula',
    sex: 'both',
  },
  {
    id: 42,
    name: 'Akkermansia muciniphila',
    unit: '% abundance',
    category: 'Microbiome',
    panels: ['Gut Health'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 43,
    name: 'Short-chain Fatty Acids',
    unit: 'µmol/g',
    category: 'Microbiome',
    panels: ['Gut Health', 'Inflammation'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 44,
    name: 'Resting Heart Rate',
    unit: 'bpm',
    category: 'Wearable',
    panels: ['Cardiovascular', 'Core Endurance'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 45,
    name: 'Heart Rate Variability',
    unit: 'ms',
    category: 'Wearable',
    panels: ['Cardiovascular', 'Stress Recovery'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 46,
    name: 'VO2 Max (estimated)',
    unit: 'mL/kg/min',
    category: 'Wearable',
    panels: ['Core Endurance'],
    type: 'Formula',
    sex: 'both',
  },
  {
    id: 47,
    name: 'Deep Sleep Duration',
    unit: 'min',
    category: 'Wearable',
    panels: ['Sleep'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 48,
    name: 'REM Sleep Duration',
    unit: 'min',
    category: 'Wearable',
    panels: ['Sleep'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 49,
    name: 'Sleep Efficiency',
    unit: '%',
    category: 'Wearable',
    panels: ['Sleep'],
    type: 'Formula',
    sex: 'both',
  },
  {
    id: 50,
    name: 'Daily Step Count',
    unit: 'steps',
    category: 'Wearable',
    panels: ['Core Endurance'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 51,
    name: 'SpO2 (Overnight Avg)',
    unit: '%',
    category: 'Wearable',
    panels: ['Sleep', 'Cardiovascular'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 52,
    name: 'Perceived Stress Scale',
    unit: 'score (0–40)',
    category: 'Questionnaire',
    panels: ['Mental Health', 'Stress Recovery'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 53,
    name: 'PHQ-9 Depression Score',
    unit: 'score (0–27)',
    category: 'Questionnaire',
    panels: ['Mental Health'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 54,
    name: 'GAD-7 Anxiety Score',
    unit: 'score (0–21)',
    category: 'Questionnaire',
    panels: ['Mental Health'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 55,
    name: 'Pittsburgh Sleep Quality Index',
    unit: 'score (0–21)',
    category: 'Questionnaire',
    panels: ['Sleep'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 56,
    name: 'Inflammatory Load Index',
    unit: 'composite',
    category: 'Mix',
    panels: ['Inflammation'],
    type: 'Formula',
    sex: 'both',
  },
  {
    id: 57,
    name: 'Metabolic Syndrome Score',
    unit: 'composite',
    category: 'Mix',
    panels: ['Metabolic Health', 'Cardiovascular'],
    type: 'Formula',
    sex: 'both',
  },
  {
    id: 58,
    name: 'Biological Age Estimate',
    unit: 'years',
    category: 'Mix',
    panels: ['Longevity'],
    type: 'Formula',
    sex: 'both',
  },
  {
    id: 59,
    name: 'Omega-3 Index',
    unit: '%',
    category: 'Blood',
    panels: ['Inflammation', 'Cardiovascular'],
    type: 'Single',
    sex: 'both',
  },
  {
    id: 60,
    name: 'Gut Permeability Score',
    unit: 'composite',
    category: 'Mix',
    panels: ['Gut Health', 'Inflammation'],
    type: 'Formula',
    sex: 'both',
  },
];

const biomarkerCategories: any = [
  'Blood',
  'Genetic',
  'Microbiome',
  'Wearable',
  'Questionnaire',
  'Mix',
];
const biomarkerPanels: any = [
  ...new Set(biomarkerData.flatMap((b: { panels: any }) => b.panels)),
].sort();

const bioRangeMap: any = {
  1: [
    ['Deficient', '< 4.0'],
    ['Borderline', '4.0 – 4.7'],
    ['Healthy', '4.8 – 5.3'],
    ['Optimal', '4.8 – 5.2'],
    ['High', '> 5.7'],
  ],
  2: [
    ['Deficient', '< 54'],
    ['Borderline', '54 – 69'],
    ['Healthy', '70 – 85'],
    ['Optimal', '72 – 82'],
    ['High', '> 100'],
  ],
  3: [
    ['Low', '< 2.0'],
    ['Borderline', '2.0 – 4.9'],
    ['Healthy', '5.0 – 10'],
    ['Optimal', '3.0 – 8.0'],
    ['High', '> 15'],
  ],
  4: [
    ['Optimal', '< 1.0'],
    ['Healthy', '1.0 – 1.4'],
    ['Borderline', '1.5 – 1.9'],
    ['Elevated', '2.0 – 2.9'],
    ['High', '> 3.0'],
  ],
  5: [
    ['Low', '< 150'],
    ['Borderline', '150 – 179'],
    ['Healthy', '180 – 200'],
    ['Optimal', '< 200'],
    ['High', '> 240'],
  ],
  6: [
    ['Optimal', '< 70'],
    ['Healthy', '70 – 99'],
    ['Borderline', '100 – 129'],
    ['Elevated', '130 – 159'],
    ['High', '> 160'],
  ],
  7: [
    ['Low', '< 40'],
    ['Borderline', '40 – 49'],
    ['Healthy', '50 – 59'],
    ['Optimal', '> 60'],
    ['High', 'N/A'],
  ],
  8: [
    ['Optimal', '< 60'],
    ['Healthy', '60 – 79'],
    ['Borderline', '80 – 99'],
    ['Elevated', '100 – 119'],
    ['High', '> 120'],
  ],
  9: [
    ['Optimal', '< 30'],
    ['Healthy', '30 – 49'],
    ['Borderline', '50 – 74'],
    ['Elevated', '75 – 125'],
    ['High', '> 125'],
  ],
  10: [
    ['Optimal', '< 0.5'],
    ['Healthy', '0.5 – 1.0'],
    ['Borderline', '1.0 – 2.0'],
    ['Elevated', '2.0 – 3.0'],
    ['High', '> 3.0'],
  ],
  11: [
    ['Optimal', '< 1.8'],
    ['Healthy', '1.8 – 5.0'],
    ['Borderline', '5.0 – 7.0'],
    ['Elevated', '7.0 – 12'],
    ['High', '> 12'],
  ],
  12: [
    ['Optimal', '< 7'],
    ['Healthy', '7 – 10'],
    ['Borderline', '10 – 12'],
    ['Elevated', '12 – 15'],
    ['High', '> 15'],
  ],
  13: [
    ['Deficient', '< 20'],
    ['Low', '20 – 49'],
    ['Healthy', '50 – 150'],
    ['Optimal', '50 – 100'],
    ['High', '> 300'],
  ],
  14: [
    ['Deficient', '< 40'],
    ['Low', '40 – 59'],
    ['Healthy', '60 – 170'],
    ['Optimal', '80 – 150'],
    ['High', '> 180'],
  ],
  15: [
    ['Low', '< 8'],
    ['Healthy', '8 – 20'],
    ['Optimal', '10 – 30'],
    ['Borderline', '30 – 40'],
    ['High', '> 40'],
  ],
  16: [
    ['Low', '< 7'],
    ['Healthy', '7 – 25'],
    ['Optimal', '7 – 35'],
    ['Borderline', '35 – 56'],
    ['High', '> 56'],
  ],
  17: [
    ['Low', '< 5'],
    ['Healthy', '5 – 30'],
    ['Optimal', '9 – 36'],
    ['Borderline', '36 – 55'],
    ['High', '> 55'],
  ],
  18: [
    ['Low', '< 0.5'],
    ['Healthy', '0.6 – 0.9'],
    ['Optimal', '0.7 – 1.1'],
    ['Borderline', '1.1 – 1.3'],
    ['High', '> 1.3'],
  ],
  19: [
    ['Critical', '< 15'],
    ['Low', '15 – 44'],
    ['Borderline', '45 – 59'],
    ['Healthy', '60 – 89'],
    ['Optimal', '> 90'],
  ],
  20: [
    ['Low', '< 6'],
    ['Healthy', '6 – 14'],
    ['Optimal', '7 – 18'],
    ['Borderline', '18 – 24'],
    ['High', '> 24'],
  ],
  21: [
    ['Deficient', '< 12'],
    ['Borderline', '12 – 14'],
    ['Healthy', '14 – 30'],
    ['Optimal', '30 – 45'],
    ['High', '> 45'],
  ],
  22: [
    ['Deficient', '< 200'],
    ['Low', '200 – 299'],
    ['Healthy', '300 – 600'],
    ['Optimal', '500 – 900'],
    ['High', '> 1000'],
  ],
  23: [
    ['Deficient', '< 3'],
    ['Low', '3 – 5'],
    ['Healthy', '5 – 15'],
    ['Optimal', '10 – 20'],
    ['High', '> 24'],
  ],
  24: [
    ['Deficient', '< 4.0'],
    ['Low', '4.0 – 4.7'],
    ['Healthy', '4.8 – 6.0'],
    ['Optimal', '5.2 – 6.5'],
    ['High', '> 7.0'],
  ],
  25: [
    ['Deficient', '< 50'],
    ['Low', '50 – 65'],
    ['Healthy', '66 – 110'],
    ['Optimal', '80 – 120'],
    ['High', '> 150'],
  ],
  26: [
    ['Low', '< 5'],
    ['Borderline', '5 – 8'],
    ['Healthy', '8 – 14'],
    ['Optimal', '10 – 18'],
    ['High', '> 23'],
  ],
  27: [
    ['Low', '< 50'],
    ['Borderline', '50 – 99'],
    ['Healthy', '100 – 300'],
    ['Optimal', '150 – 400'],
    ['High', '> 500'],
  ],
  28: [
    ['Low', '< 5'],
    ['Borderline', '5 – 8'],
    ['Healthy', '9 – 15'],
    ['Optimal', '15 – 25'],
    ['High', '> 30'],
  ],
  29: [
    ['Low', '< 250'],
    ['Borderline', '250 – 349'],
    ['Healthy', '350 – 700'],
    ['Optimal', '500 – 900'],
    ['High', '> 1000'],
  ],
  30: [
    ['Low', '< 15'],
    ['Borderline', '15 – 29'],
    ['Healthy', '30 – 120'],
    ['Optimal', '50 – 200'],
    ['High', '> 350'],
  ],
  31: [
    ['Low', '< 0.5'],
    ['Borderline', '0.5 – 1.0'],
    ['Healthy', '1.0 – 10'],
    ['Optimal', '5 – 20'],
    ['High', '> 25'],
  ],
  32: [
    ['Low', '< 0.4'],
    ['Healthy', '0.4 – 2.0'],
    ['Optimal', '1.0 – 2.5'],
    ['Borderline', '2.5 – 4.5'],
    ['High', '> 4.5'],
  ],
  33: [
    ['Low', '< 2.0'],
    ['Borderline', '2.0 – 2.4'],
    ['Healthy', '2.5 – 3.5'],
    ['Optimal', '3.0 – 4.2'],
    ['High', '> 4.4'],
  ],
  34: [
    ['Low', '< 0.7'],
    ['Borderline', '0.7 – 0.8'],
    ['Healthy', '0.8 – 1.4'],
    ['Optimal', '1.0 – 1.8'],
    ['High', '> 1.8'],
  ],
  44: [
    ['Athlete', '< 50'],
    ['Optimal', '50 – 59'],
    ['Healthy', '60 – 70'],
    ['Elevated', '71 – 80'],
    ['High', '> 80'],
  ],
  45: [
    ['Low', '< 20'],
    ['Borderline', '20 – 39'],
    ['Healthy', '40 – 60'],
    ['Optimal', '60 – 100'],
    ['High', '> 150'],
  ],
  46: [
    ['Poor', '< 25'],
    ['Below Avg', '25 – 34'],
    ['Average', '35 – 44'],
    ['Good', '45 – 54'],
    ['Elite', '> 55'],
  ],
  47: [
    ['Low', '< 30'],
    ['Borderline', '30 – 44'],
    ['Healthy', '45 – 75'],
    ['Optimal', '60 – 90'],
    ['High', '> 120'],
  ],
  48: [
    ['Low', '< 45'],
    ['Borderline', '45 – 59'],
    ['Healthy', '60 – 100'],
    ['Optimal', '90 – 120'],
    ['High', '> 150'],
  ],
  49: [
    ['Poor', '< 75'],
    ['Low', '75 – 79'],
    ['Healthy', '80 – 85'],
    ['Optimal', '85 – 95'],
    ['High', '> 98'],
  ],
  50: [
    ['Sedentary', '< 3000'],
    ['Low', '3000 – 4999'],
    ['Moderate', '5000 – 7499'],
    ['Active', '7500 – 9999'],
    ['Optimal', '> 10000'],
  ],
  51: [
    ['Critical', '< 90'],
    ['Low', '90 – 93'],
    ['Borderline', '94 – 95'],
    ['Healthy', '96 – 98'],
    ['Optimal', '> 98'],
  ],
  59: [
    ['Deficient', '< 4'],
    ['Low', '4 – 5.9'],
    ['Healthy', '6 – 8'],
    ['Optimal', '8 – 12'],
    ['High', '> 12'],
  ],
};

const getDefaultRanges = (category: any) => {
  if (category === 'Genetic')
    return [
      ['Wild Type', 'Normal'],
      ['Heterozygous', '+/-'],
      ['Carrier', 'Variable'],
      ['Homozygous', '+/+'],
      ['Actionable', 'High Risk'],
    ];
  if (category === 'Questionnaire')
    return [
      ['Minimal', 'Low Score'],
      ['Mild', 'Moderate-Low'],
      ['Moderate', 'Mid Range'],
      ['Mod-Severe', 'High'],
      ['Severe', 'Very High'],
    ];
  if (category === 'Microbiome')
    return [
      ['Depleted', 'Very Low'],
      ['Low', 'Below Avg'],
      ['Healthy', 'Normal'],
      ['Optimal', 'Above Avg'],
      ['Excess', 'Very High'],
    ];
  if (category === 'Mix')
    return [
      ['Excellent', 'Low Risk'],
      ['Good', 'Mild'],
      ['Average', 'Moderate'],
      ['Elevated', 'High'],
      ['Critical', 'Very High'],
    ];
  return [
    ['Deficient', 'Low'],
    ['Borderline', 'Sub-optimal'],
    ['Healthy', 'Normal'],
    ['Optimal', 'Ideal'],
    ['High', 'Elevated'],
  ];
};

const getBioRanges = (bio: any) => {
  return bioRangeMap[bio.id] || getDefaultRanges(bio.category);
};

const categoryTagColors: any = {
  Blood: 'bg-red-50 text-red-700 border-red-200',
  Genetic: 'bg-violet-50 text-violet-700 border-violet-200',
  Microbiome: 'bg-teal-50 text-teal-700 border-teal-200',
  Wearable: 'bg-blue-50 text-blue-700 border-blue-200',
  Questionnaire: 'bg-amber-50 text-amber-700 border-amber-200',
  Mix: 'bg-gray-100 text-gray-700 border-gray-300',
};

const assessmentData: any = [
  {
    id: 1,
    title: 'Comprehensive Health Intake',
    type: 'Questionnaire',
    questions: 48,
    time: '12 min',
    clientType: 'General',
    active: true,
  },
  {
    id: 2,
    title: 'Peptide Therapy Readiness',
    type: 'Questionnaire',
    questions: 22,
    time: '5 min',
    clientType: 'Peptide',
    active: true,
  },
  {
    id: 3,
    title: 'Longevity Baseline Evaluation',
    type: 'Questionnaire',
    questions: 35,
    time: '8 min',
    clientType: 'Longevity',
    active: true,
  },
  {
    id: 4,
    title: 'Daily Wellness Check-in',
    type: 'App Checkin Form',
    questions: 8,
    time: '1 min',
    clientType: 'General',
    active: true,
  },
  {
    id: 5,
    title: 'Perceived Stress Scale (PSS-10)',
    type: 'Questionnaire',
    questions: 10,
    time: '3 min',
    clientType: 'General',
    active: true,
  },
  {
    id: 6,
    title: 'Sleep Quality Assessment',
    type: 'Questionnaire',
    questions: 19,
    time: '5 min',
    clientType: 'General',
    active: true,
  },
  {
    id: 7,
    title: 'Peptide Side-Effect Tracker',
    type: 'App Checkin Form',
    questions: 12,
    time: '2 min',
    clientType: 'Peptide',
    active: true,
  },
  {
    id: 8,
    title: 'Gut Health & Digestion Survey',
    type: 'Questionnaire',
    questions: 26,
    time: '6 min',
    clientType: 'General',
    active: false,
  },
  {
    id: 9,
    title: 'Longevity Lifestyle Audit',
    type: 'Questionnaire',
    questions: 40,
    time: '10 min',
    clientType: 'Longevity',
    active: true,
  },
  {
    id: 10,
    title: 'Morning Energy & Recovery Log',
    type: 'App Checkin Form',
    questions: 6,
    time: '1 min',
    clientType: 'General',
    active: true,
  },
  {
    id: 11,
    title: 'Hormonal Symptom Tracker',
    type: 'Questionnaire',
    questions: 18,
    time: '4 min',
    clientType: 'General',
    active: false,
  },
  {
    id: 12,
    title: 'Post-Injection Feedback',
    type: 'App Checkin Form',
    questions: 10,
    time: '2 min',
    clientType: 'Peptide',
    active: true,
  },
  {
    id: 13,
    title: 'PHQ-9 Depression Screening',
    type: 'Questionnaire',
    questions: 9,
    time: '2 min',
    clientType: 'General',
    active: true,
  },
  {
    id: 14,
    title: 'GAD-7 Anxiety Assessment',
    type: 'Questionnaire',
    questions: 7,
    time: '2 min',
    clientType: 'General',
    active: true,
  },
  {
    id: 15,
    title: 'Cognitive Function Self-Report',
    type: 'Questionnaire',
    questions: 15,
    time: '4 min',
    clientType: 'Longevity',
    active: false,
  },
  {
    id: 16,
    title: 'Weekly Activity & Movement Log',
    type: 'App Checkin Form',
    questions: 9,
    time: '2 min',
    clientType: 'General',
    active: true,
  },
  {
    id: 17,
    title: 'Supplement Adherence Check',
    type: 'App Checkin Form',
    questions: 5,
    time: '1 min',
    clientType: 'General',
    active: true,
  },
  {
    id: 18,
    title: 'Metabolic Health Pre-Screen',
    type: 'Questionnaire',
    questions: 20,
    time: '5 min',
    clientType: 'Longevity',
    active: true,
  },
  {
    id: 19,
    title: 'Peptide Cycle Completion Review',
    type: 'Questionnaire',
    questions: 14,
    time: '3 min',
    clientType: 'Peptide',
    active: true,
  },
  {
    id: 20,
    title: 'Food Sensitivity & Allergy Intake',
    type: 'Questionnaire',
    questions: 32,
    time: '8 min',
    clientType: 'General',
    active: false,
  },
];

const assessmentTypeColors: any = {
  Questionnaire: 'bg-violet-50 text-violet-700 border-violet-200',
  'App Checkin Form': 'bg-blue-50 text-blue-700 border-blue-200',
};

const assessmentClientColors: any = {
  General: 'bg-gray-100 text-gray-700 border-gray-300',
  Peptide: 'bg-purple-50 text-purple-700 border-purple-200',
  Longevity: 'bg-teal-50 text-teal-700 border-teal-200',
};

const staffData: any = [
  {
    id: 1,
    name: 'Dr. Raina Holt',
    initials: 'RH',
    email: 'raina.holt@holisticare.io',
    role: 'Clinic Owner',
    specialty: 'Integrative Medicine',
    clients: 7,
    permissions: 'Full Access',
    status: 'active',
    color: 'bg-[#0D9488]',
    lastActive: 'Online now',
    canApprove: true,
  },
  {
    id: 2,
    name: 'Dr. Elena Voss',
    initials: 'EV',
    email: 'elena.voss@holisticare.io',
    role: 'Practitioner',
    specialty: 'Functional Medicine',
    clients: 5,
    permissions: 'Clinical Only',
    status: 'active',
    color: 'bg-violet-600',
    lastActive: '2h ago',
    canApprove: true,
  },
  {
    id: 3,
    name: 'Marcus Chen',
    initials: 'MC',
    email: 'marcus.chen@holisticare.io',
    role: 'Health Coach',
    specialty: 'Nutrition & Lifestyle',
    clients: 12,
    permissions: 'Clinical Only',
    status: 'active',
    color: 'bg-blue-600',
    lastActive: '1h ago',
    canApprove: false,
  },
  {
    id: 4,
    name: 'Sarah Okonkwo',
    initials: 'SO',
    email: 'sarah.o@holisticare.io',
    role: 'Health Coach',
    specialty: 'Sleep & Stress Management',
    clients: 8,
    permissions: 'Clinical Only',
    status: 'active',
    color: 'bg-amber-600',
    lastActive: '4h ago',
    canApprove: false,
  },
  {
    id: 5,
    name: 'Dr. James Park',
    initials: 'JP',
    email: 'james.park@holisticare.io',
    role: 'Practitioner',
    specialty: 'Peptide Therapy',
    clients: 0,
    permissions: 'Clinical Only',
    status: 'invited',
    color: 'bg-gray-400',
    lastActive: 'Pending',
    canApprove: true,
  },
  {
    id: 6,
    name: 'Nina Alvarez',
    initials: 'NA',
    email: 'nina.a@holisticare.io',
    role: 'Admin',
    specialty: 'Operations',
    clients: 0,
    permissions: 'Full Access',
    status: 'active',
    color: 'bg-pink-600',
    lastActive: '30m ago',
    canApprove: false,
  },
  {
    id: 7,
    name: 'Dr. Tobias Werner',
    initials: 'TW',
    email: 'tobias.w@holisticare.io',
    role: 'Practitioner',
    specialty: 'Longevity Medicine',
    clients: 0,
    permissions: 'Clinical Only',
    status: 'deactivated',
    color: 'bg-gray-400',
    lastActive: 'Jan 15, 2025',
    canApprove: true,
  },
  {
    id: 8,
    name: 'Liam Foster',
    initials: 'LF',
    email: 'liam.f@holisticare.io',
    role: 'Health Coach',
    specialty: 'Exercise Physiology',
    clients: 6,
    permissions: 'View Only',
    status: 'active',
    color: 'bg-emerald-600',
    lastActive: '5h ago',
    canApprove: false,
  },
];

const staffRoleConfig: any = {
  'Clinic Owner': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  Practitioner: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  'Health Coach': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  Admin: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
  },
};

const staffStatusConfig: any = {
  active: { label: 'Active', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  invited: { label: 'Invited', dot: 'bg-blue-500', text: 'text-blue-600' },
  deactivated: {
    label: 'Deactivated',
    dot: 'bg-gray-400',
    text: 'text-gray-500',
  },
};

const permissionConfig: any = {
  'Full Access': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  'Clinical Only': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  'View Only': {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
  },
};

const interventionLibraries = [
  {
    key: 'diet',
    name: 'Diet',
    image:
      'https://figr2.s3.ap-south-1.amazonaws.com/figr2/uploads/33cf2d4d-e892-4a7a-b713-115d30c4845b/anthropic.webp',
    icon: Salad,
    color: '#F59E0B',
    items: [
      {
        name: 'Mediterranean Protocol',
        desc: 'Anti-inflammatory whole foods with olive oil, fish, vegetables. Reduces CRP and supports cardiovascular biomarkers.',
        evidence: 'Strong',
        tags: ['Anti-inflammatory', 'Cardiovascular'],
      },
      {
        name: 'Elimination Diet (6-week)',
        desc: 'Systematic removal and reintroduction of common allergens — gluten, dairy, soy, eggs, corn.',
        evidence: 'Moderate',
        tags: ['Gut Health', 'Autoimmune'],
      },
      {
        name: 'Ketogenic Metabolic Reset',
        desc: 'High-fat, low-carb approach to improve insulin sensitivity. Targets HbA1c, fasting insulin, HOMA-IR.',
        evidence: 'Strong',
        tags: ['Metabolic', 'Weight Management'],
      },
      {
        name: 'Gut Microbiome Restoration',
        desc: 'Prebiotic and probiotic-rich foods to restore microbial diversity. Fermented vegetables, bone broth, resistant starch.',
        evidence: 'Moderate',
        tags: ['Microbiome', 'Digestion'],
      },
      {
        name: 'Anti-Aging Nutrition Plan',
        desc: 'Caloric optimization with nutrient-dense foods. Emphasis on polyphenols, omega-3s, and antioxidant-rich produce.',
        evidence: 'Emerging',
        tags: ['Longevity', 'Antioxidant'],
      },
      {
        name: 'Therapeutic Fasting Protocol',
        desc: 'Structured intermittent fasting (16:8 or 5:2) with guided refeeding. Autophagy activation and metabolic flexibility.',
        evidence: 'Strong',
        tags: ['Autophagy', 'Metabolic'],
      },
    ],
  },
  {
    key: 'activity',
    name: 'Activity',
    image:
      'https://figr2.s3.ap-south-1.amazonaws.com/figr2/uploads/8dfb2bad-4b0a-4de0-a928-637b48ac8435/anthropic.webp',
    icon: Dumbbell,
    color: '#3B82F6',
    items: [
      {
        name: 'Zone 2 Cardio Protocol',
        desc: 'Low-intensity steady-state training at 60-70% max HR. Builds mitochondrial density, improves VO2 max.',
        evidence: 'Strong',
        tags: ['Cardiovascular', 'Endurance'],
      },
      {
        name: 'Resistance Training Program',
        desc: 'Progressive overload strength training 3x/week targeting major muscle groups. Improves insulin sensitivity.',
        evidence: 'Strong',
        tags: ['Strength', 'Metabolic'],
      },
      {
        name: 'HIIT Metabolic Conditioning',
        desc: 'High-intensity interval bursts with active recovery. 20-minute sessions, 2x/week. Boosts HGH and metabolic rate.',
        evidence: 'Strong',
        tags: ['Fat Loss', 'Hormonal'],
      },
      {
        name: 'Mobility & Flexibility Routine',
        desc: 'Daily 15-min stretching and joint mobility work. Reduces injury risk, improves recovery markers.',
        evidence: 'Moderate',
        tags: ['Recovery', 'Flexibility'],
      },
      {
        name: 'Walking Prescription (10K steps)',
        desc: 'Structured daily walking with pace targets. Low-barrier entry for sedentary clients.',
        evidence: 'Strong',
        tags: ['General Health', 'Low Impact'],
      },
    ],
  },
  {
    key: 'supplement',
    name: 'Supplement',
    image:
      'https://figr2.s3.ap-south-1.amazonaws.com/figr2/uploads/f68c0dc1-7e92-4b11-aaae-6ec8c43c6a2e/anthropic.webp',
    icon: Pill,
    color: '#10B981',
    items: [
      {
        name: 'Vitamin D3 + K2 Protocol',
        desc: 'High-dose D3 (5000 IU) with K2 (MK-7) for calcium metabolism. Targets 25-OH D levels of 50-80 ng/mL.',
        evidence: 'Strong',
        tags: ['Bone Health', 'Immune'],
      },
      {
        name: 'Omega-3 (EPA/DHA) Therapy',
        desc: '2-4g combined EPA/DHA from pharmaceutical-grade fish oil. Supports Omega-3 Index above 8%.',
        evidence: 'Strong',
        tags: ['Inflammation', 'Cardiovascular'],
      },
      {
        name: 'Magnesium Optimization Stack',
        desc: 'Magnesium glycinate (400mg) + threonate (144mg). Targets RBC magnesium, sleep quality, and HRV.',
        evidence: 'Moderate',
        tags: ['Sleep', 'Recovery'],
      },
      {
        name: 'B-Complex Methylation Support',
        desc: 'Methylfolate + methylcobalamin for MTHFR variants. Supports homocysteine metabolism.',
        evidence: 'Strong',
        tags: ['Methylation', 'Genetic'],
      },
      {
        name: 'NAD+ Precursor Protocol',
        desc: 'NMN or NR supplementation (500-1000mg) for cellular energy. Emerging longevity intervention.',
        evidence: 'Emerging',
        tags: ['Longevity', 'Cellular'],
      },
      {
        name: 'Probiotics (Multi-strain)',
        desc: 'Clinically validated multi-strain probiotic. Targets gut microbiome diversity and SCFA production.',
        evidence: 'Moderate',
        tags: ['Gut Health', 'Immune'],
      },
    ],
  },
  {
    key: 'lifestyle',
    name: 'Lifestyle',
    image:
      'https://figr2.s3.ap-south-1.amazonaws.com/figr2/uploads/bb530fd2-bf2f-49be-9bec-12e4fc85d7ce/anthropic.webp',
    icon: Leaf,
    color: '#8B5CF6',
    items: [
      {
        name: 'Sleep Hygiene Optimization',
        desc: 'Comprehensive sleep protocol: temperature control, blue-light blocking, consistent schedule.',
        evidence: 'Strong',
        tags: ['Sleep', 'Recovery'],
      },
      {
        name: 'Stress Management (HRV-guided)',
        desc: 'Breathwork, meditation, and cold exposure guided by HRV metrics. Reduces cortisol, improves vagal tone.',
        evidence: 'Moderate',
        tags: ['Stress', 'Nervous System'],
      },
      {
        name: 'Circadian Rhythm Reset',
        desc: 'Morning light exposure, meal timing, evening wind-down protocol. Corrects cortisol curve.',
        evidence: 'Strong',
        tags: ['Hormones', 'Sleep'],
      },
      {
        name: 'Digital Detox Protocol',
        desc: 'Structured screen-time reduction with device-free periods. Improves focus, reduces anxiety scores.',
        evidence: 'Emerging',
        tags: ['Mental Health', 'Focus'],
      },
      {
        name: 'Social Connection Rx',
        desc: 'Prescribed social activities and community engagement. Addresses loneliness as longevity risk.',
        evidence: 'Moderate',
        tags: ['Mental Health', 'Longevity'],
      },
    ],
  },
  {
    key: 'biohacks',
    name: 'Biohacks',
    image:
      'https://figr2.s3.ap-south-1.amazonaws.com/figr2/uploads/98dab6d7-caf0-4e74-a0a1-9b412c8f109a/anthropic.webp',
    icon: Zap,
    color: '#EC4899',
    items: [
      {
        name: 'Red Light Therapy (PBM)',
        desc: 'Photobiomodulation at 630-670nm and 810-850nm. Targets mitochondrial function and skin health.',
        evidence: 'Moderate',
        tags: ['Mitochondria', 'Recovery'],
      },
      {
        name: 'Cold Exposure Protocol',
        desc: 'Progressive cold immersion: cold showers to ice baths. Boosts norepinephrine, brown fat activation.',
        evidence: 'Moderate',
        tags: ['Hormesis', 'Metabolism'],
      },
      {
        name: 'Infrared Sauna Program',
        desc: '3-4 sessions/week at 140-160F for 20-30 min. Supports detox, cardiovascular conditioning.',
        evidence: 'Moderate',
        tags: ['Detox', 'Cardiovascular'],
      },
      {
        name: 'Hyperbaric Oxygen (HBOT)',
        desc: 'Pressurized oxygen sessions for enhanced tissue repair. Targets cognitive function, telomere health.',
        evidence: 'Emerging',
        tags: ['Longevity', 'Cognitive'],
      },
      {
        name: 'Grounding/Earthing Practice',
        desc: 'Direct skin contact with earth surface 30+ min/day. Preliminary data on inflammation reduction.',
        evidence: 'Emerging',
        tags: ['Inflammation', 'Stress'],
      },
    ],
  },
  {
    key: 'peptide',
    name: 'Peptide Therapy',
    image:
      'https://figr2.s3.ap-south-1.amazonaws.com/figr2/uploads/e80c4181-5171-4907-b473-b378890d52fa/anthropic.webp',
    icon: Syringe,
    color: '#0D9488',
    items: [
      {
        name: 'BPC-157 Healing Protocol',
        desc: 'Body Protection Compound for gut healing and tissue repair. Subcutaneous or oral administration.',
        evidence: 'Emerging',
        tags: ['Gut Repair', 'Recovery'],
      },
      {
        name: 'Thymosin Alpha-1 Immune',
        desc: 'Immune modulation peptide for chronic infections, autoimmune support. Enhances T-cell function.',
        evidence: 'Moderate',
        tags: ['Immune', 'Autoimmune'],
      },
      {
        name: 'CJC-1295 / Ipamorelin Stack',
        desc: 'Growth hormone secretagogue combination. Supports lean mass, recovery, sleep quality.',
        evidence: 'Moderate',
        tags: ['Hormonal', 'Recovery'],
      },
      {
        name: 'PT-141 (Bremelanotide)',
        desc: 'Melanocortin receptor agonist for sexual dysfunction. Both male and female applications.',
        evidence: 'Strong',
        tags: ['Sexual Health', 'Hormonal'],
      },
      {
        name: 'Epithalon Telomere Support',
        desc: 'Telomerase-activating tetrapeptide. Anti-aging protocol targeting biological age markers.',
        evidence: 'Emerging',
        tags: ['Longevity', 'Telomere'],
      },
    ],
  },
  {
    key: 'other',
    name: 'Other Therapies',
    image:
      'https://figr2.s3.ap-south-1.amazonaws.com/figr2/uploads/0bdab0ca-4547-4f10-8aad-cd9b5b5dfbc7/anthropic.webp',
    icon: PackageOpen,
    color: '#6366F1',
    items: [
      {
        name: 'IV Nutrient Therapy',
        desc: 'Customized intravenous micronutrient infusions (Myers cocktail, high-dose Vitamin C, glutathione).',
        evidence: 'Moderate',
        tags: ['Nutrient Repletion', 'Immune'],
      },
      {
        name: 'Ozone Therapy (MAH)',
        desc: 'Major autohemotherapy: blood ozonation for immune modulation and oxidative stress management.',
        evidence: 'Emerging',
        tags: ['Immune', 'Oxidative Stress'],
      },
      {
        name: 'Acupuncture Protocol',
        desc: 'Traditional Chinese medicine needling for pain, stress, and hormonal balance. 8-12 session plans.',
        evidence: 'Moderate',
        tags: ['Pain', 'Stress'],
      },
      {
        name: 'Neurofeedback Training',
        desc: 'EEG-guided brain wave optimization. Targets anxiety, sleep architecture, cognitive performance.',
        evidence: 'Moderate',
        tags: ['Cognitive', 'Mental Health'],
      },
      {
        name: 'Stem Cell/Exosome Therapy',
        desc: 'Regenerative medicine with mesenchymal stem cells or exosomes. Joint repair, systemic rejuvenation.',
        evidence: 'Emerging',
        tags: ['Regenerative', 'Longevity'],
      },
    ],
  },
];

const evidenceColors: any = {
  Strong: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Moderate: 'bg-blue-50 text-blue-700 border-blue-200',
  Emerging: 'bg-amber-50 text-amber-700 border-amber-200',
};

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
      { icon: Network, label: 'Intelligence Models', key: 'health-models' },
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

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [hoveredRow, setHoveredRow] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [sortCol, setSortCol] = useState('urgency');
  const [sortDir, setSortDir] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [mobileAppFilter, setMobileAppFilter] = useState('all');
  const [checkInFilter, setCheckInFilter] = useState('all');
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    sex: '',
    ethnicity: '',
    practitioner: '',
    category: '',
    activeWeeks: '',
    unlimited: false,
  });
  const [bioSearch, setBioSearch] = useState('');
  const [bioCategoryFilter, setBioCategoryFilter] = useState('all');
  const [bioPanelFilter, setBioPanelFilter] = useState('all');
  const [bioTypeFilter, setBioTypeFilter] = useState('all');
  const [bioGender, setBioGender] = useState('male');
  const [expandedBio, setExpandedBio] = useState<any>(null);
  const [assessSearch, setAssessSearch] = useState('');
  const [assessTypeFilter, setAssessTypeFilter] = useState('all');
  const [assessClientFilter, setAssessClientFilter] = useState('all');
  const [assessActiveStates, setAssessActiveStates] = useState(() => {
    const map: any = {};
    assessmentData.forEach((a: { id: string | number; active: any }) => {
      map[a.id] = a.active;
    });
    return map;
  });
  const [staffSearch, setStaffSearch] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState('all');
  const [staffStatusFilter, setStaffStatusFilter] = useState('all');
  const [showInvite, setShowInvite] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState('diet');

  const handleNavClick = (key: SetStateAction<string>) => {
    setActivePage(key);
  };
  const handleRowHover = (id: string | SetStateAction<null>) => {
    setHoveredRow(id);
  };
  const handleRowLeave = () => {
    setHoveredRow(null);
  };
  const handleSearchChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setSearchQuery(e.target.value);
  };
  const handleUrgencyFilter = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setUrgencyFilter(e.target.value);
  };
  const handleCategoryFilter = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setCategoryFilter(e.target.value);
  };
  const handlePlanFilter = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setPlanFilter(e.target.value);
  };
  const handleAssignedFilter = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setAssignedFilter(e.target.value);
  };
  const handleMobileAppFilter = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setMobileAppFilter(e.target.value);
  };
  const handleCheckInFilter = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setCheckInFilter(e.target.value);
  };
  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };
  const openAddClient = () => {
    setShowAddClient(true);
  };
  const closeAddClient = () => {
    setShowAddClient(false);
    setNewClient({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dob: '',
      sex: '',
      ethnicity: '',
      practitioner: '',
      category: '',
      activeWeeks: '',
      unlimited: false,
    });
  };
  const handleNewClientFirstName = (e: { target: { value: any } }) => {
    setNewClient((prev) => ({ ...prev, firstName: e.target.value }));
  };
  const handleNewClientLastName = (e: { target: { value: any } }) => {
    setNewClient((prev) => ({ ...prev, lastName: e.target.value }));
  };
  const handleNewClientEmail = (e: { target: { value: any } }) => {
    setNewClient((prev) => ({ ...prev, email: e.target.value }));
  };
  const handleNewClientPhone = (e: { target: { value: any } }) => {
    setNewClient((prev) => ({ ...prev, phone: e.target.value }));
  };
  const handleNewClientDob = (e: { target: { value: any } }) => {
    setNewClient((prev) => ({ ...prev, dob: e.target.value }));
  };
  const handleNewClientSex = (e: { target: { value: any } }) => {
    setNewClient((prev) => ({ ...prev, sex: e.target.value }));
  };
  const handleNewClientEthnicity = (e: { target: { value: any } }) => {
    setNewClient((prev) => ({ ...prev, ethnicity: e.target.value }));
  };
  const handleNewClientPractitioner = (e: { target: { value: any } }) => {
    setNewClient((prev) => ({ ...prev, practitioner: e.target.value }));
  };
  const handleNewClientCategory = (e: { target: { value: any } }) => {
    setNewClient((prev) => ({ ...prev, category: e.target.value }));
  };
  const handleNewClientWeeks = (e: { target: { value: any } }) => {
    setNewClient((prev) => ({ ...prev, activeWeeks: e.target.value }));
  };
  const handleNewClientUnlimited = () => {
    setNewClient((prev) => ({
      ...prev,
      unlimited: !prev.unlimited,
      activeWeeks: !prev.unlimited ? '' : prev.activeWeeks,
    }));
  };
  const handleSort = (col: SetStateAction<string>) => {
    if (sortCol === col) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };
  const clearFilters = () => {
    setSearchQuery('');
    setUrgencyFilter('all');
    setCategoryFilter('all');
    setPlanFilter('all');
    setAssignedFilter('all');
    setMobileAppFilter('all');
    setCheckInFilter('all');
  };
  const handleBioSearch = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setBioSearch(e.target.value);
  };
  const handleBioCategoryFilter = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setBioCategoryFilter(e.target.value);
  };
  const handleBioPanelFilter = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setBioPanelFilter(e.target.value);
  };
  const handleBioTypeFilter = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setBioTypeFilter(e.target.value);
  };
  const toggleBioGender = () => {
    setBioGender((prev) => (prev === 'male' ? 'female' : 'male'));
  };
  const handleBioRowClick = (id: number | null) => {
    setExpandedBio((prev: any) => (prev === id ? null : id));
  };
  const handleAssessSearch = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setAssessSearch(e.target.value);
  };
  const handleAssessTypeFilter = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setAssessTypeFilter(e.target.value);
  };
  const handleAssessClientFilter = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setAssessClientFilter(e.target.value);
  };
  const handleToggleAssessActive = (id: number) => {
    setAssessActiveStates((prev: { [x: string]: any }) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const clearAssessFilters = () => {
    setAssessSearch('');
    setAssessTypeFilter('all');
    setAssessClientFilter('all');
  };
  const handleStaffSearch = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setStaffSearch(e.target.value);
  };
  const handleStaffRoleFilter = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setStaffRoleFilter(e.target.value);
  };
  const handleStaffStatusFilter = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setStaffStatusFilter(e.target.value);
  };
  const clearStaffFilters = () => {
    setStaffSearch('');
    setStaffRoleFilter('all');
    setStaffStatusFilter('all');
  };
  const handleSelectLibrary = (key: SetStateAction<string>) => {
    setSelectedLibrary(key);
  };
  const openInvite = () => {
    setShowInvite(true);
  };
  const closeInvite = () => {
    setShowInvite(false);
  };

  const filteredStaff = useMemo(() => {
    return staffData.filter(
      (s: { name: string; email: string; role: string; status: string }) => {
        const matchSearch =
          staffSearch === '' ||
          s.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
          s.email.toLowerCase().includes(staffSearch.toLowerCase());
        const matchRole =
          staffRoleFilter === 'all' || s.role === staffRoleFilter;
        const matchStatus =
          staffStatusFilter === 'all' || s.status === staffStatusFilter;
        return matchSearch && matchRole && matchStatus;
      },
    );
  }, [staffSearch, staffRoleFilter, staffStatusFilter]);

  const hasStaffActiveFilters =
    staffRoleFilter !== 'all' ||
    staffStatusFilter !== 'all' ||
    staffSearch !== '';

  const filteredAssessments = useMemo(() => {
    return assessmentData.filter(
      (a: { title: string; type: string; clientType: string }) => {
        const matchSearch =
          assessSearch === '' ||
          a.title.toLowerCase().includes(assessSearch.toLowerCase());
        const matchType =
          assessTypeFilter === 'all' || a.type === assessTypeFilter;
        const matchClient =
          assessClientFilter === 'all' || a.clientType === assessClientFilter;
        return matchSearch && matchType && matchClient;
      },
    );
  }, [assessSearch, assessTypeFilter, assessClientFilter]);

  const hasAssessActiveFilters =
    assessTypeFilter !== 'all' ||
    assessClientFilter !== 'all' ||
    assessSearch !== '';
  const clearBioFilters = () => {
    setBioSearch('');
    setBioCategoryFilter('all');
    setBioPanelFilter('all');
    setBioTypeFilter('all');
  };

  const filteredBiomarkers = useMemo(() => {
    return biomarkerData.filter(
      (b: {
        sex: string;
        name: string;
        panels: string[];
        category: string;
        type: string;
      }) => {
        const matchSex = b.sex === 'both' || b.sex === bioGender;
        const matchSearch =
          bioSearch === '' ||
          b.name.toLowerCase().includes(bioSearch.toLowerCase()) ||
          b.panels.some((p: string) =>
            p.toLowerCase().includes(bioSearch.toLowerCase()),
          );
        const matchCategory =
          bioCategoryFilter === 'all' || b.category === bioCategoryFilter;
        const matchPanel =
          bioPanelFilter === 'all' || b.panels.includes(bioPanelFilter);
        const matchType = bioTypeFilter === 'all' || b.type === bioTypeFilter;
        return (
          matchSex && matchSearch && matchCategory && matchPanel && matchType
        );
      },
    );
  }, [bioSearch, bioCategoryFilter, bioPanelFilter, bioTypeFilter, bioGender]);

  const hasBioActiveFilters =
    bioCategoryFilter !== 'all' ||
    bioPanelFilter !== 'all' ||
    bioTypeFilter !== 'all' ||
    bioSearch !== '';

  const urgencyOrder: any = { immediate: 0, monitor: 1, stable: 2 };
  const filteredClients = useMemo(() => {
    const result = clientData.filter((c: any) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchUrgency =
        urgencyFilter === 'all' || c.urgency === urgencyFilter;
      const matchCategory =
        categoryFilter === 'all' || c.category === categoryFilter;
      const matchPlan = planFilter === 'all' || c.planStatus === planFilter;
      const matchAssigned =
        assignedFilter === 'all' || c.assigned === assignedFilter;
      const hasMobileApp = c.connectedApps.length > 0;
      const matchMobile =
        mobileAppFilter === 'all' ||
        (mobileAppFilter === 'inuse' && hasMobileApp) ||
        (mobileAppFilter === 'notconnected' && !hasMobileApp);
      const matchCheckIn =
        checkInFilter === 'all' ||
        (checkInFilter === 'overdue7' && c.lastCheckIn > 7) ||
        (checkInFilter === 'overdue14' && c.lastCheckIn > 14);
      return (
        matchSearch &&
        matchUrgency &&
        matchCategory &&
        matchPlan &&
        matchAssigned &&
        matchMobile &&
        matchCheckIn
      );
    });
    result.sort(
      (
        a: {
          urgency: string | number;
          name: string;
          lastCheckIn: number;
          category: string;
        },
        b: {
          urgency: string | number;
          name: any;
          lastCheckIn: number;
          category: any;
        },
      ) => {
        let cmp = 0;
        if (sortCol === 'urgency')
          cmp = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        else if (sortCol === 'name') cmp = a.name.localeCompare(b.name);
        else if (sortCol === 'lastCheckIn') cmp = a.lastCheckIn - b.lastCheckIn;
        else if (sortCol === 'category')
          cmp = a.category.localeCompare(b.category);
        return sortDir === 'desc' ? -cmp : cmp;
      },
    );
    return result;
  }, [
    searchQuery,
    urgencyFilter,
    categoryFilter,
    planFilter,
    assignedFilter,
    mobileAppFilter,
    checkInFilter,
    sortCol,
    sortDir,
  ]);

  const hasActiveFilters =
    urgencyFilter !== 'all' ||
    categoryFilter !== 'all' ||
    planFilter !== 'all' ||
    assignedFilter !== 'all' ||
    mobileAppFilter !== 'all' ||
    checkInFilter !== 'all' ||
    searchQuery !== '';
  const activeFilterCount = [
    urgencyFilter,
    categoryFilter,
    planFilter,
    assignedFilter,
    mobileAppFilter,
    checkInFilter,
  ].filter((f) => f !== 'all').length;
  const unreadMessages = dashMessages.length;
  const waitingOver24h = dashMessages.filter(
    (m: { waiting: any }) => m.waiting,
  ).length;

  return (
    <div className="flex h-screen bg-[#F4F6F8] overflow-hidden">
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
                const isActive = item.key === activePage;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleNavClick(item.key)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-colors duration-150 ${isActive ? 'bg-[#10B981]/10 text-[#059669] font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
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

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[52px] bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-gray-400">Clinic</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-800 font-semibold">
              {activePage === 'dashboard'
                ? 'Dashboard'
                : activePage === 'clients'
                  ? 'Client List'
                  : activePage === 'biomarkers'
                    ? 'Biomarkers'
                    : activePage === 'assessments'
                      ? 'Assessments'
                      : activePage === 'staff'
                        ? 'Staff Management'
                        : activePage === 'intervention-library'
                          ? 'Intervention Library'
                          : activePage.charAt(0).toUpperCase() +
                            activePage.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors duration-150">
              <Search className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center relative transition-colors duration-150">
              <Bell className="w-4 h-4 text-gray-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-[1px] h-5 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#0D9488] flex items-center justify-center text-white text-[11px] font-bold">
                DR
              </div>
              <div>
                <p className="text-[12px] font-semibold text-gray-800 leading-tight">
                  Dr. Raina Holt
                </p>
                <p className="text-[10px] text-gray-400 leading-tight">
                  Integrative Medicine
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {activePage === 'dashboard' && (
            <div className="max-w-[1200px] mx-auto">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
                    Clinical Intelligence
                  </h1>
                  <p className="text-[13px] text-gray-400 mt-0.5">
                    Population overview · {totalPatients} active patients
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-gray-400">
                  <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-medium text-[11px]">
                    Live
                  </span>
                  <span>Last synced 4 min ago</span>
                </div>
              </div>
              <div className="grid grid-cols-12 gap-5 mb-5">
                <div className="col-span-6 bg-white rounded-xl border border-gray-200/80 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-[14px] font-bold text-gray-900">
                        Clinical Attention Radar
                      </h2>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Patient triage distribution
                      </p>
                    </div>
                    <button className="text-gray-300 hover:text-gray-500 transition-colors duration-150">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mb-4">
                    <div className="flex rounded-lg overflow-hidden h-[38px]">
                      <div
                        className="bg-red-500 flex items-center justify-center cursor-pointer hover:brightness-110 transition-all duration-300"
                        style={{
                          width: `${(attentionData.immediate / totalPatients) * 100}%`,
                        }}
                      >
                        <span className="text-white text-[11px] font-bold">
                          {attentionData.immediate}
                        </span>
                      </div>
                      <div
                        className="bg-amber-400 flex items-center justify-center cursor-pointer hover:brightness-110 transition-all duration-300"
                        style={{
                          width: `${(attentionData.monitor / totalPatients) * 100}%`,
                        }}
                      >
                        <span className="text-white text-[11px] font-bold">
                          {attentionData.monitor}
                        </span>
                      </div>
                      <div
                        className="bg-emerald-500 flex items-center justify-center cursor-pointer hover:brightness-110 transition-all duration-300"
                        style={{
                          width: `${(attentionData.stable / totalPatients) * 100}%`,
                        }}
                      >
                        <span className="text-white text-[11px] font-bold">
                          {attentionData.stable}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="text-[11px] text-gray-500">
                        Immediate
                      </span>
                      <span className="text-[12px] font-bold text-gray-800">
                        {Math.round(
                          (attentionData.immediate / totalPatients) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="text-[11px] text-gray-500">Monitor</span>
                      <span className="text-[12px] font-bold text-gray-800">
                        {Math.round(
                          (attentionData.monitor / totalPatients) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-[11px] text-gray-500">Stable</span>
                      <span className="text-[12px] font-bold text-gray-800">
                        {Math.round(
                          (attentionData.stable / totalPatients) * 100,
                        )}
                        %
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3.5 border-t border-gray-100 grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-[20px] font-bold text-red-600">
                        {attentionData.immediate}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Need Action
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[20px] font-bold text-amber-500">
                        {attentionData.monitor}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Watch List
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[20px] font-bold text-emerald-600">
                        {attentionData.stable}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        On Track
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-span-6 bg-white rounded-xl border border-gray-200/80 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-[14px] font-bold text-gray-900">
                        Engagement Health
                      </h2>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Data coverage & patient connectivity
                      </p>
                    </div>
                    <button className="text-gray-300 hover:text-gray-500 transition-colors duration-150">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-[180px] h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                          cx="50%"
                          cy="50%"
                          innerRadius="20%"
                          outerRadius="95%"
                          data={engagementData}
                          startAngle={90}
                          endAngle={-270}
                        >
                          <RadialBar
                            dataKey="value"
                            cornerRadius={4}
                            background={{ fill: '#F3F4F6' }}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2.5">
                      {engagementData.map((item: any) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: item.fill }}
                            />
                            <span className="text-[12px] text-gray-600">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-[13px] font-bold text-gray-800">
                            {item.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-12 gap-5 mb-5">
                <div className="col-span-7 bg-white rounded-xl border border-gray-200/80 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-[14px] font-bold text-gray-900">
                        AI Priority Queue
                      </h2>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Risk-ranked patients requiring attention
                      </p>
                    </div>
                    <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                      {priorityQueue.length} patients
                    </span>
                  </div>
                  <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
                    {priorityQueue.map(
                      (patient: any) => {
                        const colors = urgencyConfig[patient.priority];
                        return (
                          <button
                            key={patient.id}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg border ${colors.border} ${colors.bg} hover:shadow-sm transition-all duration-150 text-left group`}
                          >
                            <div className="relative flex-shrink-0">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold ${colors.avatarBg} ${colors.avatarText}`}
                              >
                                {patient.initials}
                              </div>
                              {patient.unread && (
                                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-gray-900">
                                  {patient.name}
                                </span>
                                <span
                                  className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${colors.text} ${colors.bg} border ${colors.border}`}
                                >
                                  {patient.priority}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                                {patient.reason}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors duration-150 flex-shrink-0" />
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
                <div className="col-span-5 bg-white rounded-xl border border-gray-200/80 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-[14px] font-bold text-gray-900">
                        Communication Center
                      </h2>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Patient message urgency
                      </p>
                    </div>
                    <Inbox className="w-4 h-4 text-gray-300" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <p className="text-[20px] font-bold text-blue-700">
                        {unreadMessages}
                      </p>
                      <p className="text-[10px] text-blue-500 font-medium mt-0.5">
                        Awaiting Response
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                      <p className="text-[20px] font-bold text-orange-600">
                        {waitingOver24h}
                      </p>
                      <p className="text-[10px] text-orange-500 font-medium mt-0.5">
                        Waiting &gt;24h
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {dashMessages.map(
                      (msg: {
                        id: Key | null | undefined;
                        initials:
                          | string
                          | number
                          | boolean
                          | ReactElement<
                              any,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | ReactPortal
                          | null
                          | undefined;
                        name:
                          | string
                          | number
                          | boolean
                          | ReactElement<
                              any,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | ReactPortal
                          | null
                          | undefined;
                        time:
                          | string
                          | number
                          | boolean
                          | ReactElement<
                              any,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | ReactPortal
                          | null
                          | undefined;
                        snippet:
                          | string
                          | number
                          | boolean
                          | ReactElement<
                              any,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | ReactPortal
                          | null
                          | undefined;
                        waiting: any;
                      }) => (
                        <button
                          key={msg.id}
                          className="w-full flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-150 text-left group"
                        >
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0 mt-0.5">
                            {msg.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[12px] font-semibold text-gray-800">
                                {msg.name}
                              </span>
                              <span className="text-[10px] text-gray-400 flex-shrink-0">
                                {msg.time}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                              {msg.snippet}
                            </p>
                            {msg.waiting && (
                              <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-semibold text-orange-500">
                                <Clock className="w-2.5 h-2.5" /> Waiting
                                &gt;24h
                              </span>
                            )}
                          </div>
                        </button>
                      ),
                    )}
                  </div>
                  <button className="w-full mt-3 py-2 text-center text-[12px] text-[#10B981] font-semibold hover:bg-emerald-50 rounded-lg transition-colors duration-150">
                    View All Messages →
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-6 bg-white rounded-xl border border-gray-200/80 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-[14px] font-bold text-gray-900">
                        Intervention Insights
                      </h2>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Program performance & adherence
                      </p>
                    </div>
                    <button className="text-gray-300 hover:text-gray-500 transition-colors duration-150">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-5">
                    <div className="w-[140px] h-[140px] flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={programDonut}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={62}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {programDonut.map((entry: any, index: any) => (
                              <Cell key={index} fill={entry.fill} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2">
                      {programs.map(
                        (prog: any) => (
                          <div
                            key={prog.name}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-sm"
                                style={{ backgroundColor: prog.color }}
                              />
                              <span className="text-[12px] text-gray-600">
                                {prog.name}
                              </span>
                            </div>
                            <span className="text-[12px] font-bold text-gray-800">
                              {prog.count}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-3.5 border-t border-gray-100 grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 rounded-lg p-2.5 border border-emerald-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-emerald-600 font-medium">
                          Adherence Rate
                        </span>
                        <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                      </div>
                      <p className="text-[18px] font-bold text-emerald-700 mt-0.5">
                        76%
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-blue-600 font-medium">
                          Plan Compliance
                        </span>
                        <ArrowUpRight className="w-3 h-3 text-blue-500" />
                      </div>
                      <p className="text-[18px] font-bold text-blue-700 mt-0.5">
                        68%
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-medium">
                          Inactive Users
                        </span>
                        <span className="text-[10px] text-gray-400">30d</span>
                      </div>
                      <p className="text-[18px] font-bold text-gray-700 mt-0.5">
                        14
                      </p>
                    </div>
                    <div className="bg-violet-50 rounded-lg p-2.5 border border-violet-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-violet-600 font-medium">
                          Completed
                        </span>
                        <CheckCircle2 className="w-3 h-3 text-violet-500" />
                      </div>
                      <p className="text-[18px] font-bold text-violet-700 mt-0.5">
                        31
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-span-6 bg-white rounded-xl border border-gray-200/80 p-5">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <h2 className="text-[14px] font-bold text-gray-900">
                        Active Patient Growth
                      </h2>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Active Patients Trend — Last 6 Months
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#10B981]" />{' '}
                        Active
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />{' '}
                        New
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-400" />{' '}
                        Churned
                      </span>
                    </div>
                  </div>
                  <div className="flex items-end gap-4 mb-2">
                    <span className="text-[28px] font-bold text-gray-900">
                      135
                    </span>
                    <span className="flex items-center gap-1 text-[12px] text-emerald-600 font-medium mb-1">
                      <ArrowUpRight className="w-3.5 h-3.5" /> 5.5% vs last
                      month
                    </span>
                  </div>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={growthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11, fill: '#9CA3AF' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#9CA3AF' }}
                          axisLine={false}
                          tickLine={false}
                          width={30}
                        />
                        <Tooltip
                          contentStyle={{
                            fontSize: 12,
                            borderRadius: 8,
                            border: '1px solid #E5E7EB',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="active"
                          stroke="#10B981"
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: '#10B981' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="new"
                          stroke="#60A5FA"
                          strokeWidth={1.5}
                          dot={{ r: 2, fill: '#60A5FA' }}
                          strokeDasharray="4 4"
                        />
                        <Line
                          type="monotone"
                          dataKey="churned"
                          stroke="#F87171"
                          strokeWidth={1.5}
                          dot={{ r: 2, fill: '#F87171' }}
                          strokeDasharray="4 4"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePage === 'biomarkers' && (
            <div className="max-w-[1200px] mx-auto">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
                    Biomarker Library
                  </h1>
                  <p className="text-[13px] text-gray-400 mt-0.5">
                    {filteredBiomarkers.length} biomarkers ·{' '}
                    {bioGender === 'male' ? 'Male' : 'Female'} reference ranges
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Gender Toggle */}
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                    <span
                      className={`text-[11px] font-semibold transition-colors duration-150 ${bioGender === 'male' ? 'text-blue-600' : 'text-gray-400'}`}
                    >
                      Male
                    </span>
                    <button
                      onClick={toggleBioGender}
                      className="relative w-[36px] h-[20px] rounded-full transition-colors duration-200 focus:outline-none"
                      style={{
                        backgroundColor:
                          bioGender === 'male' ? '#3B82F6' : '#EC4899',
                      }}
                    >
                      <div
                        className={`absolute top-[2px] w-[16px] h-[16px] bg-white rounded-full shadow-sm transition-transform duration-200 ${bioGender === 'male' ? 'left-[2px]' : 'left-[18px]'}`}
                      />
                    </button>
                    <span
                      className={`text-[11px] font-semibold transition-colors duration-150 ${bioGender === 'female' ? 'text-pink-600' : 'text-gray-400'}`}
                    >
                      Female
                    </span>
                  </div>
                  <button className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white text-[12px] font-semibold px-4 py-2 rounded-lg transition-colors duration-150">
                    <Plus className="w-4 h-4" /> Add Biomarker
                  </button>
                </div>
              </div>

              {/* Search + Filters */}
              <div className="bg-white rounded-xl border border-gray-200/80 mb-4">
                <div className="flex items-center gap-3 p-3">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search biomarkers or panels..."
                      value={bioSearch}
                      onChange={handleBioSearch}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={bioCategoryFilter}
                      onChange={handleBioCategoryFilter}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      {biomarkerCategories.map((c: any) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <select
                      value={bioPanelFilter}
                      onChange={handleBioPanelFilter}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                    >
                      <option value="all">All Panels</option>
                      {biomarkerPanels.map((p: any) => (
                        <option key={p as string} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <select
                      value={bioTypeFilter}
                      onChange={handleBioTypeFilter}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                    >
                      <option value="all">All Types</option>
                      <option value="Single">Single</option>
                      <option value="Formula">Formula</option>
                    </select>
                    {hasBioActiveFilters && (
                      <button
                        onClick={clearBioFilters}
                        className="flex items-center gap-1 px-2.5 py-2 text-[11px] text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-150"
                      >
                        <X className="w-3 h-3" /> Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 tracking-wide">
                          BIOMARKER
                        </th>
                        <th className="text-left px-3 py-3 text-[11px] font-semibold text-gray-400 tracking-wide w-[100px]">
                          UNIT
                        </th>
                        <th className="text-left px-3 py-3 text-[11px] font-semibold text-gray-400 tracking-wide w-[120px]">
                          CATEGORY
                        </th>
                        <th className="text-left px-3 py-3 text-[11px] font-semibold text-gray-400 tracking-wide">
                          PANEL
                        </th>
                        <th className="text-left px-3 py-3 text-[11px] font-semibold text-gray-400 tracking-wide w-[80px]">
                          TYPE
                        </th>
                        <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 tracking-wide w-[80px]">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBiomarkers.map((bio: any) => {
                        const catStyle =
                          categoryTagColors[bio.category as string];
                        const isExpanded = expandedBio === bio.id;
                        const ranges = getBioRanges(bio);
                        return (
                          <tr
                            key={bio.id}
                            className="border-b border-gray-50 cursor-pointer"
                            onClick={() => handleBioRowClick(bio.id)}
                          >
                            <td colSpan={6} className="p-0">
                              <div
                                className={`flex items-center hover:bg-gray-50/60 transition-colors duration-100 group ${isExpanded ? 'bg-[#10B981]/5' : ''}`}
                              >
                                <div
                                  className="px-4 py-3 flex items-center gap-2.5"
                                  style={{ width: '30%', minWidth: '200px' }}
                                >
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isExpanded ? 'bg-[#10B981]/20' : 'bg-[#10B981]/10'}`}
                                  >
                                    <FlaskConical className="w-3.5 h-3.5 text-[#10B981]" />
                                  </div>
                                  <span
                                    className={`text-[13px] font-medium truncate ${isExpanded ? 'text-[#059669] font-semibold' : 'text-gray-900'}`}
                                  >
                                    {bio.name}
                                  </span>
                                  <ChevronDown
                                    className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#10B981]' : 'text-gray-300'}`}
                                  />
                                </div>
                                <div
                                  className="px-3 py-3"
                                  style={{ width: '10%' }}
                                >
                                  <span className="text-[12px] text-gray-500 font-mono">
                                    {bio.unit}
                                  </span>
                                </div>
                                <div
                                  className="px-3 py-3"
                                  style={{ width: '12%' }}
                                >
                                  <span
                                    className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded border ${catStyle}`}
                                  >
                                    {bio.category}
                                  </span>
                                </div>
                                <div
                                  className="px-3 py-3"
                                  style={{ width: '28%' }}
                                >
                                  <div className="flex flex-wrap gap-1">
                                    {bio.panels.map((p: any) => (
                                      <span
                                        key={p as string}
                                        className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded"
                                      >
                                        {p}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div
                                  className="px-3 py-3"
                                  style={{ width: '10%' }}
                                >
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${bio.type === 'Formula' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}
                                  >
                                    {bio.type}
                                  </span>
                                </div>
                                <div
                                  className="px-4 py-3"
                                  style={{ width: '10%' }}
                                >
                                  <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                    <button
                                      className="w-7 h-7 rounded-md hover:bg-blue-50 flex items-center justify-center transition-colors duration-150"
                                      title="Edit"
                                    >
                                      <Pencil className="w-3.5 h-3.5 text-gray-400 hover:text-blue-600" />
                                    </button>
                                    <button
                                      className="w-7 h-7 rounded-md hover:bg-red-50 flex items-center justify-center transition-colors duration-150"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              {isExpanded && (
                                <div className="px-6 pb-5 pt-2 bg-gradient-to-b from-[#10B981]/5 to-transparent border-t border-[#10B981]/10">
                                  <div className="max-w-[780px] mx-auto">
                                    <p className="text-[10px] font-semibold text-gray-400 tracking-widest mb-3">
                                      REFERENCE RANGE —{' '}
                                      {bioGender === 'male' ? 'MALE' : 'FEMALE'}
                                    </p>
                                    <div className="flex mb-2">
                                      {ranges.map(
                                        (
                                          zone: (
                                            | string
                                            | number
                                            | boolean
                                            | ReactElement<
                                                any,
                                                | string
                                                | JSXElementConstructor<any>
                                              >
                                            | Iterable<ReactNode>
                                            | ReactPortal
                                            | null
                                            | undefined
                                          )[],
                                          i: Key | null | undefined,
                                        ) => (
                                          <div
                                            key={i}
                                            className="flex-1 text-center"
                                          >
                                            <p className="text-[11px] font-semibold text-gray-700">
                                              {zone[0]}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">
                                              ({zone[1]})
                                            </p>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                    <div className="relative">
                                      <div
                                        className="h-[10px] rounded-full overflow-hidden"
                                        style={{
                                          background:
                                            'linear-gradient(to right, #7C2D12 0%, #B91C1C 8%, #DC2626 14%, #F97316 22%, #FBBF24 32%, #BEF264 42%, #4ADE80 50%, #22C55E 58%, #16A34A 66%, #15803D 72%, #16A34A 76%, #FBBF24 84%, #F97316 88%, #DC2626 92%, #B91C1C 96%, #7C2D12 100%)',
                                        }}
                                      />
                                      <div className="absolute top-0 left-0 w-full h-full flex pointer-events-none">
                                        {ranges.map(
                                          (
                                            _zone: any,
                                            i: Key | null | undefined,
                                          ) => (
                                            <div
                                              key={i}
                                              className={`flex-1 ${(i as number) < ranges.length - 1 ? 'border-r-2 border-white/50' : ''}`}
                                            />
                                          ),
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                      <span className="text-[9px] text-gray-400">
                                        Low values
                                      </span>
                                      <span className="text-[10px] text-gray-500 font-medium">
                                        Unit: {bio.unit}
                                      </span>
                                      <span className="text-[9px] text-gray-400">
                                        High values
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredBiomarkers.length === 0 && (
                  <div className="text-center py-16">
                    <FlaskConical className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-[14px] font-semibold text-gray-500">
                      No biomarkers found
                    </p>
                    <p className="text-[12px] text-gray-400 mt-1">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400">
                    Showing {filteredBiomarkers.length} of{' '}
                    {
                      biomarkerData.filter(
                        (b: { sex: string }) =>
                          b.sex === 'both' || b.sex === bioGender,
                      ).length
                    }{' '}
                    biomarkers
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-400" />{' '}
                      Blood:{' '}
                      {
                        filteredBiomarkers.filter(
                          (b: { category: string }) => b.category === 'Blood',
                        ).length
                      }
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-violet-400" />{' '}
                      Genetic:{' '}
                      {
                        filteredBiomarkers.filter(
                          (b: { category: string }) => b.category === 'Genetic',
                        ).length
                      }
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-400" />{' '}
                      Microbiome:{' '}
                      {
                        filteredBiomarkers.filter(
                          (b: { category: string }) =>
                            b.category === 'Microbiome',
                        ).length
                      }
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />{' '}
                      Wearable:{' '}
                      {
                        filteredBiomarkers.filter(
                          (b: { category: string }) =>
                            b.category === 'Wearable',
                        ).length
                      }
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />{' '}
                      Questionnaire:{' '}
                      {
                        filteredBiomarkers.filter(
                          (b: { category: string }) =>
                            b.category === 'Questionnaire',
                        ).length
                      }
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gray-400" /> Mix:{' '}
                      {
                        filteredBiomarkers.filter(
                          (b: { category: string }) => b.category === 'Mix',
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePage === 'staff' && (
            <div className="max-w-[1200px] mx-auto">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
                    Staff Management
                  </h1>
                  <p className="text-[13px] text-gray-400 mt-0.5">
                    {staffData.length} team members ·{' '}
                    {
                      staffData.filter(
                        (s: { status: string }) => s.status === 'active',
                      ).length
                    }{' '}
                    active ·{' '}
                    {
                      staffData.filter((s: { canApprove: any }) => s.canApprove)
                        .length
                    }{' '}
                    can approve plans
                  </p>
                </div>
                <button
                  onClick={openInvite}
                  className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white text-[12px] font-semibold px-4 py-2 rounded-lg transition-colors duration-150"
                >
                  <UserPlus className="w-4 h-4" /> Invite Member
                </button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4 mb-5">
                <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-gray-400 tracking-wide">
                      PRACTITIONERS
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Activity className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-[24px] font-bold text-gray-900">
                    {
                      staffData.filter(
                        (s: { role: string }) =>
                          s.role === 'Practitioner' ||
                          s.role === 'Clinic Owner',
                      ).length
                    }
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Plan approval authority
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-gray-400 tracking-wide">
                      HEALTH COACHES
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-[24px] font-bold text-gray-900">
                    {
                      staffData.filter(
                        (s: { role: string }) => s.role === 'Health Coach',
                      ).length
                    }
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Client coaching & support
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-gray-400 tracking-wide">
                      TOTAL ASSIGNMENTS
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                      <Network className="w-3.5 h-3.5 text-violet-600" />
                    </div>
                  </div>
                  <p className="text-[24px] font-bold text-gray-900">
                    {staffData.reduce(
                      (sum: any, s: { clients: any }) => sum + s.clients,
                      0,
                    )}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Clients assigned across team
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-gray-400 tracking-wide">
                      PENDING INVITES
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Mail className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-[24px] font-bold text-gray-900">
                    {
                      staffData.filter(
                        (s: { status: string }) => s.status === 'invited',
                      ).length
                    }
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Awaiting acceptance
                  </p>
                </div>
              </div>

              {/* Search + Filters */}
              <div className="bg-white rounded-xl border border-gray-200/80 mb-4">
                <div className="flex items-center gap-3 p-3">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={staffSearch}
                      onChange={handleStaffSearch}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={staffRoleFilter}
                      onChange={handleStaffRoleFilter}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                    >
                      <option value="all">All Roles</option>
                      <option value="Clinic Owner">Clinic Owner</option>
                      <option value="Practitioner">Practitioner</option>
                      <option value="Health Coach">Health Coach</option>
                      <option value="Admin">Admin</option>
                    </select>
                    <select
                      value={staffStatusFilter}
                      onChange={handleStaffStatusFilter}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="invited">Invited</option>
                      <option value="deactivated">Deactivated</option>
                    </select>
                    {hasStaffActiveFilters && (
                      <button
                        onClick={clearStaffFilters}
                        className="flex items-center gap-1 px-2.5 py-2 text-[11px] text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-150"
                      >
                        <X className="w-3 h-3" /> Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Staff Grid */}
              <div className="grid grid-cols-2 gap-4">
                {filteredStaff.map((member: any) => {
                  const roleConf = staffRoleConfig[member.role];
                  const statusConf = staffStatusConfig[member.status];
                  const permConf = permissionConfig[member.permissions];
                  const isDeactivated = member.status === 'deactivated';
                  const isInvited = member.status === 'invited';
                  return (
                    <div
                      key={member.id}
                      className={`bg-white rounded-xl border border-gray-200/80 p-5 group hover:shadow-md hover:border-gray-300 transition-all duration-200 ${isDeactivated ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3.5">
                          <div className="relative">
                            <div
                              className={`w-11 h-11 rounded-full ${member.color} flex items-center justify-center text-white text-[13px] font-bold`}
                            >
                              {member.initials}
                            </div>
                            <div
                              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${statusConf.dot}`}
                            />
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-gray-900">
                              {member.name}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <button
                            className="w-7 h-7 rounded-md hover:bg-blue-50 flex items-center justify-center transition-colors duration-150"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5 text-gray-400 hover:text-blue-600" />
                          </button>
                          <button
                            className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors duration-150"
                            title="More"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3.5">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${roleConf.bg} ${roleConf.text} ${roleConf.border}`}
                        >
                          {member.role}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {member.specialty}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 pt-3.5 border-t border-gray-100">
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium mb-1">
                            CLIENTS
                          </p>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3 h-3 text-gray-400" />
                            <span
                              className={`text-[14px] font-bold ${member.clients > 0 ? 'text-gray-900' : 'text-gray-300'}`}
                            >
                              {member.clients}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium mb-1">
                            PERMISSIONS
                          </p>
                          <span
                            className={`inline-flex text-[9px] font-semibold px-1.5 py-0.5 rounded border ${permConf.bg} ${permConf.text} ${permConf.border}`}
                          >
                            {member.permissions}
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium mb-1">
                            LAST ACTIVE
                          </p>
                          <span
                            className={`text-[11px] font-medium ${member.lastActive === 'Online now' ? 'text-emerald-600' : isInvited ? 'text-blue-500' : 'text-gray-500'}`}
                          >
                            {member.lastActive}
                          </span>
                        </div>
                      </div>
                      {member.canApprove && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                            <span className="text-[10px] font-medium text-[#059669]">
                              AI Plan Approval Authority
                            </span>
                          </div>
                        </div>
                      )}
                      {isInvited && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-blue-500" />
                            <span className="text-[10px] font-medium text-blue-600">
                              Invitation sent — awaiting response
                            </span>
                          </div>
                          <button className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-150">
                            Resend
                          </button>
                        </div>
                      )}
                      {isDeactivated && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <AlertCircle className="w-3 h-3 text-gray-400" />
                            <span className="text-[10px] font-medium text-gray-500">
                              Account deactivated
                            </span>
                          </div>
                          <button className="text-[10px] font-semibold text-[#10B981] hover:text-[#059669] hover:underline transition-colors duration-150">
                            Reactivate
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {filteredStaff.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200/80">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-[14px] font-semibold text-gray-500">
                    No staff members found
                  </p>
                  <p className="text-[12px] text-gray-400 mt-1">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
          )}

          {activePage === 'assessments' && (
            <div className="max-w-[1200px] mx-auto">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
                    Assessments
                  </h1>
                  <p className="text-[13px] text-gray-400 mt-0.5">
                    {filteredAssessments.length} assessments ·{' '}
                    {
                      filteredAssessments.filter(
                        (a: { id: string | number }) =>
                          assessActiveStates[a.id],
                      ).length
                    }{' '}
                    active in clinic
                  </p>
                </div>
                <button className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white text-[12px] font-semibold px-4 py-2 rounded-lg transition-colors duration-150">
                  <Plus className="w-4 h-4" /> Create Assessment
                </button>
              </div>

              {/* Search + Filters */}
              <div className="bg-white rounded-xl border border-gray-200/80 mb-4">
                <div className="flex items-center gap-3 p-3">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search assessments..."
                      value={assessSearch}
                      onChange={handleAssessSearch}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={assessTypeFilter}
                      onChange={handleAssessTypeFilter}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                    >
                      <option value="all">All Types</option>
                      <option value="Questionnaire">Questionnaire</option>
                      <option value="App Checkin Form">App Checkin Form</option>
                    </select>
                    <select
                      value={assessClientFilter}
                      onChange={handleAssessClientFilter}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                    >
                      <option value="all">All Client Types</option>
                      <option value="General">General</option>
                      <option value="Peptide">Peptide</option>
                      <option value="Longevity">Longevity</option>
                    </select>
                    {hasAssessActiveFilters && (
                      <button
                        onClick={clearAssessFilters}
                        className="flex items-center gap-1 px-2.5 py-2 text-[11px] text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-150"
                      >
                        <X className="w-3 h-3" /> Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 tracking-wide">
                          TITLE
                        </th>
                        <th className="text-left px-3 py-3 text-[11px] font-semibold text-gray-400 tracking-wide w-[140px]">
                          TYPE
                        </th>
                        <th className="text-center px-3 py-3 text-[11px] font-semibold text-gray-400 tracking-wide w-[90px]">
                          QUESTIONS
                        </th>
                        <th className="text-center px-3 py-3 text-[11px] font-semibold text-gray-400 tracking-wide w-[100px]">
                          TIME REQ.
                        </th>
                        <th className="text-left px-3 py-3 text-[11px] font-semibold text-gray-400 tracking-wide w-[110px]">
                          CLIENT TYPE
                        </th>
                        <th className="text-center px-3 py-3 text-[11px] font-semibold text-gray-400 tracking-wide w-[90px]">
                          ACTIVE
                        </th>
                        <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 tracking-wide w-[110px]">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssessments.map(
                        (assess: {
                          type:
                            | string
                            | number
                            | boolean
                            | ReactElement<
                                any,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | null
                            | undefined;
                          clientType:
                            | string
                            | number
                            | boolean
                            | ReactElement<
                                any,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | null
                            | undefined;
                          id: Key | null | undefined;
                          title:
                            | string
                            | number
                            | boolean
                            | ReactElement<
                                any,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | ReactPortal
                            | null
                            | undefined;
                          questions:
                            | string
                            | number
                            | boolean
                            | ReactElement<
                                any,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | ReactPortal
                            | null
                            | undefined;
                          time:
                            | string
                            | number
                            | boolean
                            | ReactElement<
                                any,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | ReactPortal
                            | null
                            | undefined;
                        }) => {
                          const typeStyle =
                            assessmentTypeColors[assess.type as string];
                          const clientStyle =
                            assessmentClientColors[assess.clientType as string];
                          const isActive: boolean =
                            assessActiveStates[assess.id as number];
                          return (
                            <tr
                              key={assess.id}
                              className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors duration-100 group"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${assess.type === 'Questionnaire' ? 'bg-violet-100' : 'bg-blue-100'}`}
                                  >
                                    <ClipboardList
                                      className={`w-3.5 h-3.5 ${assess.type === 'Questionnaire' ? 'text-violet-600' : 'text-blue-600'}`}
                                    />
                                  </div>
                                  <span className="text-[13px] font-medium text-gray-900">
                                    {assess.title}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <span
                                  className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded border ${typeStyle}`}
                                >
                                  {assess.type}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <span className="text-[13px] font-semibold text-gray-800">
                                  {assess.questions}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  <span className="text-[12px] text-gray-600">
                                    {assess.time}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <span
                                  className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded border ${clientStyle}`}
                                >
                                  {assess.clientType}
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex justify-center">
                                  <button
                                    onClick={() =>
                                      handleToggleAssessActive(
                                        assess.id as number,
                                      )
                                    }
                                    className={`relative w-[36px] h-[20px] rounded-full transition-colors duration-200 focus:outline-none ${isActive ? 'bg-[#10B981]' : 'bg-gray-300'}`}
                                  >
                                    <div
                                      className={`absolute top-[2px] w-[16px] h-[16px] bg-white rounded-full shadow-sm transition-transform duration-200 ${isActive ? 'left-[18px]' : 'left-[2px]'}`}
                                    />
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                  <button
                                    className="w-7 h-7 rounded-md hover:bg-emerald-50 flex items-center justify-center transition-colors duration-150"
                                    title="Preview"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-gray-400 hover:text-emerald-600" />
                                  </button>
                                  <button
                                    className="w-7 h-7 rounded-md hover:bg-blue-50 flex items-center justify-center transition-colors duration-150"
                                    title="Edit"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-gray-400 hover:text-blue-600" />
                                  </button>
                                  <button
                                    className="w-7 h-7 rounded-md hover:bg-red-50 flex items-center justify-center transition-colors duration-150"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>
                {filteredAssessments.length === 0 && (
                  <div className="text-center py-16">
                    <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-[14px] font-semibold text-gray-500">
                      No assessments found
                    </p>
                    <p className="text-[12px] text-gray-400 mt-1">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400">
                    Showing {filteredAssessments.length} of{' '}
                    {assessmentData.length} assessments
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-violet-400" />{' '}
                      Questionnaire:{' '}
                      {
                        filteredAssessments.filter(
                          (a: { type: string }) => a.type === 'Questionnaire',
                        ).length
                      }
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400" /> App
                      Checkin:{' '}
                      {
                        filteredAssessments.filter(
                          (a: { type: string }) =>
                            a.type === 'App Checkin Form',
                        ).length
                      }
                    </span>
                    <span className="w-[1px] h-3 bg-gray-200" />
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />{' '}
                      Active:{' '}
                      {
                        filteredAssessments.filter(
                          (a: { id: string | number }) =>
                            assessActiveStates[a.id],
                        ).length
                      }
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gray-300" />{' '}
                      Inactive:{' '}
                      {
                        filteredAssessments.filter(
                          (a: { id: string | number }) =>
                            !assessActiveStates[a.id],
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePage === 'intervention-library' &&
            (() => {
              const activeLib = interventionLibraries.find(
                (l) => l.key === selectedLibrary,
              );
              return (
                <div className="max-w-[1200px] mx-auto">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
                        Intervention Library
                      </h1>
                      <p className="text-[13px] text-gray-400 mt-0.5">
                        7 categories ·{' '}
                        {interventionLibraries.reduce(
                          (s, l) => s + l.items.length,
                          0,
                        )}{' '}
                        interventions · Evidence-based protocols
                      </p>
                    </div>
                    <button className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white text-[12px] font-semibold px-4 py-2 rounded-lg transition-colors duration-150">
                      <Plus className="w-4 h-4" /> Add Intervention
                    </button>
                  </div>

                  {/* 7 Library Category Cards */}
                  <div className="grid grid-cols-7 gap-3 mb-5">
                    {interventionLibraries.map((lib) => {
                      const isSelected = selectedLibrary === lib.key;
                      return (
                        <button
                          key={lib.key}
                          onClick={() => handleSelectLibrary(lib.key)}
                          className={`group relative rounded-xl overflow-hidden transition-all duration-200 ${isSelected ? 'ring-2 ring-[#10B981] shadow-lg scale-[1.02]' : 'hover:shadow-md hover:scale-[1.01] border border-gray-200/80'}`}
                        >
                          <div className="aspect-square w-full overflow-hidden">
                            <img
                              src={lib.image}
                              alt={lib.name}
                              className={`w-full h-full object-cover transition-all duration-300 ${isSelected ? 'brightness-100' : 'brightness-90 group-hover:brightness-100'}`}
                            />
                          </div>
                          <div
                            className={`absolute inset-0 transition-all duration-200 ${isSelected ? 'bg-gradient-to-t from-[#10B981]/70 via-transparent to-transparent' : 'bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-black/60'}`}
                          />
                          <div className="absolute bottom-0 left-0 right-0 p-2.5">
                            <p
                              className={`text-[12px] font-bold text-center transition-colors duration-200 ${isSelected ? 'text-white' : 'text-white/90 group-hover:text-white'}`}
                            >
                              {lib.name}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Expanded Content Card */}
                  {activeLib && (
                    <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: activeLib.color + '18' }}
                          >
                            <activeLib.icon
                              className="w-5 h-5"
                              style={{ color: activeLib.color }}
                            />
                          </div>
                          <div>
                            <h2 className="text-[16px] font-bold text-gray-900">
                              {activeLib.name} Interventions
                            </h2>
                            <p className="text-[12px] text-gray-400 mt-0.5">
                              {activeLib.items.length} protocols available ·
                              Drag to add to client plans
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder={`Search ${activeLib.name.toLowerCase()}...`}
                              className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 w-[200px]"
                            />
                          </div>
                          <select className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-600 cursor-pointer focus:outline-none">
                            <option>All Evidence</option>
                            <option>Strong</option>
                            <option>Moderate</option>
                            <option>Emerging</option>
                          </select>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {activeLib.items.map((item, idx) => {
                          const evStyle = evidenceColors[item.evidence];
                          return (
                            <div
                              key={idx}
                              className="px-6 py-4 hover:bg-gray-50/60 transition-colors duration-100 group flex items-start gap-4"
                            >
                              <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{
                                  backgroundColor: activeLib.color + '15',
                                }}
                              >
                                <BookOpen
                                  className="w-4 h-4"
                                  style={{ color: activeLib.color }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2.5 mb-1">
                                  <h3 className="text-[14px] font-semibold text-gray-900">
                                    {item.name}
                                  </h3>
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${evStyle}`}
                                  >
                                    {item.evidence}
                                  </span>
                                </div>
                                <p className="text-[12px] text-gray-500 leading-relaxed mb-2">
                                  {item.desc}
                                </p>
                                <div className="flex items-center gap-1.5">
                                  {item.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"
                                    >
                                      <Tag className="w-2.5 h-2.5" />
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0 mt-1">
                                <button
                                  className="w-7 h-7 rounded-md hover:bg-emerald-50 flex items-center justify-center transition-colors duration-150"
                                  title="Preview"
                                >
                                  <Eye className="w-3.5 h-3.5 text-gray-400 hover:text-emerald-600" />
                                </button>
                                <button
                                  className="w-7 h-7 rounded-md hover:bg-blue-50 flex items-center justify-center transition-colors duration-150"
                                  title="Edit"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-gray-400 hover:text-blue-600" />
                                </button>
                                <button
                                  className="w-7 h-7 rounded-md hover:bg-red-50 flex items-center justify-center transition-colors duration-150"
                                  title="Remove"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-[11px] text-gray-400">
                          Showing {activeLib.items.length} interventions in{' '}
                          {activeLib.name}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />{' '}
                            Strong:{' '}
                            {
                              activeLib.items.filter(
                                (i) => i.evidence === 'Strong',
                              ).length
                            }
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-400" />{' '}
                            Moderate:{' '}
                            {
                              activeLib.items.filter(
                                (i) => i.evidence === 'Moderate',
                              ).length
                            }
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />{' '}
                            Emerging:{' '}
                            {
                              activeLib.items.filter(
                                (i) => i.evidence === 'Emerging',
                              ).length
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

          {activePage === 'clients' && (
            <div className="max-w-[1200px] mx-auto">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
                    Client List
                  </h1>
                  <p className="text-[13px] text-gray-400 mt-0.5">
                    {filteredClients.length} of {clientData.length} clients
                  </p>
                </div>
                <button
                  onClick={openAddClient}
                  className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors duration-150"
                >
                  <Plus className="w-4 h-4" /> Add Client
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 mb-4">
                <div className="flex items-center gap-3 p-3">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by name or ID..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150"
                    />
                  </div>
                  <button
                    onClick={toggleFilters}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-medium border transition-colors duration-150 ${showFilters || activeFilterCount > 0 ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#059669]' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Filter className="w-3.5 h-3.5" /> Filters{' '}
                    {activeFilterCount > 0 && (
                      <span className="w-[18px] h-[18px] rounded-full bg-[#10B981] text-white text-[10px] font-bold flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 px-2.5 py-2 text-[11px] text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-150"
                    >
                      <X className="w-3 h-3" /> Clear all
                    </button>
                  )}
                </div>
                {showFilters && (
                  <div className="px-3 pb-3 pt-0">
                    <div className="border-t border-gray-100 pt-3">
                      <div className="grid grid-cols-6 gap-3">
                        <div>
                          <label className="text-[10px] font-semibold text-gray-400 tracking-wide mb-1.5 block">
                            URGENCY
                          </label>
                          <select
                            value={urgencyFilter}
                            onChange={handleUrgencyFilter}
                            className="w-full px-2.5 py-[7px] bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                          >
                            <option value="all">All</option>
                            <option value="immediate">Immediate</option>
                            <option value="monitor">Monitor</option>
                            <option value="stable">Stable</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-400 tracking-wide mb-1.5 block">
                            CATEGORY
                          </label>
                          <select
                            value={categoryFilter}
                            onChange={handleCategoryFilter}
                            className="w-full px-2.5 py-[7px] bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                          >
                            <option value="all">All</option>
                            <option value="Peptide">Peptide</option>
                            <option value="Longevity">Longevity</option>
                            <option value="Diet">Diet</option>
                            <option value="Sleep">Sleep</option>
                            <option value="Lifestyle">Lifestyle</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-400 tracking-wide mb-1.5 block">
                            PLAN STATUS
                          </label>
                          <select
                            value={planFilter}
                            onChange={handlePlanFilter}
                            className="w-full px-2.5 py-[7px] bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                          >
                            <option value="all">All</option>
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="none">No Plan</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-400 tracking-wide mb-1.5 block">
                            ASSIGNED TO
                          </label>
                          <select
                            value={assignedFilter}
                            onChange={handleAssignedFilter}
                            className="w-full px-2.5 py-[7px] bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                          >
                            <option value="all">All</option>
                            <option value="Dr. Holt">Dr. Holt</option>
                            <option value="Dr. Voss">Dr. Voss</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-400 tracking-wide mb-1.5 block">
                            MOBILE APP
                          </label>
                          <select
                            value={mobileAppFilter}
                            onChange={handleMobileAppFilter}
                            className="w-full px-2.5 py-[7px] bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                          >
                            <option value="all">All</option>
                            <option value="inuse">In Use</option>
                            <option value="notconnected">Not Connected</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-400 tracking-wide mb-1.5 block">
                            CHECK-IN
                          </label>
                          <select
                            value={checkInFilter}
                            onChange={handleCheckInFilter}
                            className="w-full px-2.5 py-[7px] bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                          >
                            <option value="all">All</option>
                            <option value="overdue7">Overdue 7+ days</option>
                            <option value="overdue14">Overdue 14+ days</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th
                          className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 tracking-wide cursor-pointer hover:text-gray-600 transition-colors duration-150"
                          onClick={() => handleSort('name')}
                        >
                          <span className="flex items-center gap-1">
                            PATIENT{' '}
                            {sortCol === 'name' && (
                              <ChevronDown
                                className={`w-3 h-3 transition-transform duration-150 ${sortDir === 'desc' ? 'rotate-180' : ''}`}
                              />
                            )}
                          </span>
                        </th>
                        <th
                          className="text-left px-3 py-3 text-[11px] font-semibold text-gray-400 tracking-wide cursor-pointer hover:text-gray-600 transition-colors duration-150"
                          onClick={() => handleSort('urgency')}
                        >
                          <span className="flex items-center gap-1">
                            URGENCY{' '}
                            {sortCol === 'urgency' && (
                              <ChevronDown
                                className={`w-3 h-3 transition-transform duration-150 ${sortDir === 'desc' ? 'rotate-180' : ''}`}
                              />
                            )}
                          </span>
                        </th>
                        <th className="text-left px-3 py-3 text-[11px] font-semibold text-gray-400 tracking-wide">
                          ACTIVE ENROLLMENT
                        </th>
                        <th className="text-left px-3 py-3 text-[11px] font-semibold text-gray-400 tracking-wide">
                          MOBILE APP
                        </th>
                        <th
                          className="text-left px-3 py-3 text-[11px] font-semibold text-gray-400 tracking-wide cursor-pointer hover:text-gray-600 transition-colors duration-150"
                          onClick={() => handleSort('category')}
                        >
                          <span className="flex items-center gap-1">
                            CATEGORY{' '}
                            {sortCol === 'category' && (
                              <ChevronDown
                                className={`w-3 h-3 transition-transform duration-150 ${sortDir === 'desc' ? 'rotate-180' : ''}`}
                              />
                            )}
                          </span>
                        </th>
                        <th className="text-left px-3 py-3 text-[11px] font-semibold text-gray-400 tracking-wide">
                          PLAN
                        </th>
                        <th
                          className="text-left px-3 py-3 text-[11px] font-semibold text-gray-400 tracking-wide cursor-pointer hover:text-gray-600 transition-colors duration-150"
                          onClick={() => handleSort('lastCheckIn')}
                        >
                          <span className="flex items-center gap-1">
                            CHECK-IN{' '}
                            {sortCol === 'lastCheckIn' && (
                              <ChevronDown
                                className={`w-3 h-3 transition-transform duration-150 ${sortDir === 'desc' ? 'rotate-180' : ''}`}
                              />
                            )}
                          </span>
                        </th>
                        <th className="text-left px-3 py-3 text-[11px] font-semibold text-gray-400 tracking-wide">
                          ASSIGNED
                        </th>
                        <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 tracking-wide w-[130px]">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.map((client: any) => {
                        const uConf = urgencyConfig[client.urgency];
                        const pConf = planConfig[client.planStatus];
                        const isHovered = hoveredRow === client.id;
                        const enrollProgress = Math.round(
                          (client.enrollment.week /
                            client.enrollment.totalWeeks) *
                            100,
                        );
                        const checkInWarning = client.lastCheckIn > 14;
                        const checkInCaution =
                          client.lastCheckIn > 7 && client.lastCheckIn <= 14;
                        return (
                          <tr
                            key={client.id}
                            className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors duration-100 cursor-pointer group"
                            onMouseEnter={() => handleRowHover(client.id)}
                            onMouseLeave={handleRowLeave}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${uConf.avatarBg} ${uConf.avatarText} flex-shrink-0`}
                                >
                                  {client.initials}
                                </div>
                                <div>
                                  <p className="text-[13px] font-semibold text-gray-900 leading-tight">
                                    {client.name}
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">
                                    {client.gender} · {client.age}y ·{' '}
                                    {client.id}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${uConf.bg} ${uConf.text} ${uConf.border}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${uConf.ring}`}
                                />
                                {uConf.label}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <div className="min-w-[110px]">
                                <p className="text-[11px] font-medium text-gray-700 leading-tight">
                                  {client.enrollment.startDate}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <div className="flex-1 h-[4px] bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-300 ${enrollProgress === 100 ? 'bg-[#10B981]' : 'bg-[#0D9488]'}`}
                                      style={{ width: `${enrollProgress}%` }}
                                    />
                                  </div>
                                  <span className="text-[9px] text-gray-400 flex-shrink-0">
                                    {enrollProgress}%
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              {client.connectedApps.length > 0 ? (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  <Smartphone className="w-3 h-3" /> In Use
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                                  <Smartphone className="w-3 h-3" /> Not
                                  Connected
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${categoryColors[client.category]}`}
                              >
                                {client.category}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${pConf.bg} ${pConf.text} ${pConf.border}`}
                              >
                                {pConf.label}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={`text-[12px] font-medium ${checkInWarning ? 'text-red-600' : checkInCaution ? 'text-amber-600' : 'text-gray-700'}`}
                              >
                                {client.lastCheckIn}d ago
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <span className="text-[12px] text-gray-600">
                                {client.assigned}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div
                                className={`flex items-center justify-end gap-0.5 transition-opacity duration-150 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                              >
                                <button
                                  className="w-7 h-7 rounded-md hover:bg-blue-50 flex items-center justify-center transition-colors duration-150"
                                  title="Message"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" />
                                </button>
                                <button
                                  className="w-7 h-7 rounded-md hover:bg-emerald-50 flex items-center justify-center transition-colors duration-150"
                                  title="View Plan"
                                >
                                  <Eye className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600" />
                                </button>
                                <button
                                  className="w-7 h-7 rounded-md hover:bg-amber-50 flex items-center justify-center transition-colors duration-150"
                                  title="Schedule"
                                >
                                  <CalendarClock className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-600" />
                                </button>
                                <button
                                  className="w-7 h-7 rounded-md hover:bg-red-50 flex items-center justify-center transition-colors duration-150"
                                  title="Flag"
                                >
                                  <Flag className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400">
                    Showing {filteredClients.length} of {clientData.length}{' '}
                    clients
                  </p>
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 rounded-md bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors duration-150">
                      <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button className="w-7 h-7 rounded-md bg-[#10B981] text-white flex items-center justify-center text-[11px] font-bold">
                      1
                    </button>
                    <button className="w-7 h-7 rounded-md bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-[11px] text-gray-500 font-medium transition-colors duration-150">
                      2
                    </button>
                    <button className="w-7 h-7 rounded-md bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors duration-150">
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeInvite}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[480px]">
            <div className="px-7 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-bold text-gray-900">
                      Invite Team Member
                    </h2>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      Send an invitation to join your clinic
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeInvite}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors duration-150"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="px-7 py-5 space-y-4">
              <div>
                <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="colleague@clinic.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                    Role <span className="text-red-400">*</span>
                  </label>
                  <select className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer">
                    <option value="">Select role...</option>
                    <option value="practitioner">Practitioner</option>
                    <option value="coach">Health Coach</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                    Permissions <span className="text-red-400">*</span>
                  </label>
                  <select className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer">
                    <option value="">Select level...</option>
                    <option value="full">Full Access</option>
                    <option value="clinical">Clinical Only</option>
                    <option value="view">View Only</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                  Specialty
                </label>
                <input
                  type="text"
                  placeholder="e.g. Functional Medicine, Nutrition"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150"
                />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-semibold text-blue-700">
                      Role-Based Access Control
                    </p>
                    <p className="text-[10px] text-blue-600 mt-0.5 leading-relaxed">
                      Practitioners can review and approve AI-generated plans.
                      Health Coaches can manage clients but cannot publish
                      plans. Admins have full system access without clinical
                      authority.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-7 py-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={closeInvite}
                className="px-4 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
              >
                Cancel
              </button>
              <button className="px-5 py-2.5 text-[13px] font-semibold text-white bg-[#10B981] hover:bg-[#059669] rounded-lg transition-colors duration-150 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeAddClient}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[580px] max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 px-7 pt-6 pb-4 border-b border-gray-100 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-bold text-gray-900">
                      Add New Client
                    </h2>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      Fill in client details to create a new profile
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeAddClient}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors duration-150"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="px-7 py-5 space-y-5">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 tracking-widest mb-3">
                  PERSONAL INFORMATION
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                      First Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newClient.firstName}
                      onChange={handleNewClientFirstName}
                      placeholder="e.g. Sarah"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                      Last Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newClient.lastName}
                      onChange={handleNewClientLastName}
                      placeholder="e.g. Chen"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150"
                    />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 tracking-widest mb-3">
                  CONTACT
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={newClient.email}
                        onChange={handleNewClientEmail}
                        placeholder="client@email.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={newClient.phone}
                        onChange={handleNewClientPhone}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 tracking-widest mb-3">
                  DEMOGRAPHICS
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                      Date of Birth <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="date"
                        value={newClient.dob}
                        onChange={handleNewClientDob}
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                      Biological Sex <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={newClient.sex}
                      onChange={handleNewClientSex}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                    >
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="intersex">Intersex</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                      Ethnicity
                    </label>
                    <select
                      value={newClient.ethnicity}
                      onChange={handleNewClientEthnicity}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                    >
                      <option value="">Select...</option>
                      <option value="caucasian">Caucasian</option>
                      <option value="african">
                        African / African American
                      </option>
                      <option value="hispanic">Hispanic / Latino</option>
                      <option value="asian">Asian</option>
                      <option value="middle_eastern">Middle Eastern</option>
                      <option value="native">Native / Indigenous</option>
                      <option value="pacific">Pacific Islander</option>
                      <option value="mixed">Mixed / Multi-ethnic</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 tracking-widest mb-3">
                  CLINICAL ASSIGNMENT
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                      Practitioner <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={newClient.practitioner}
                      onChange={handleNewClientPractitioner}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                    >
                      <option value="">Select practitioner...</option>
                      <option value="dr_holt">
                        Dr. Raina Holt — Integrative Medicine
                      </option>
                      <option value="dr_voss">
                        Dr. Elena Voss — Functional Medicine
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={newClient.category}
                      onChange={handleNewClientCategory}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                    >
                      <option value="">Select category...</option>
                      <option value="peptide">Peptide Therapy</option>
                      <option value="longevity">Longevity Protocol</option>
                      <option value="diet">Diet Intervention</option>
                      <option value="sleep">Sleep Protocol</option>
                      <option value="lifestyle">Lifestyle Optimization</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                    Active Time (weeks)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="1"
                        max="104"
                        value={newClient.activeWeeks}
                        onChange={handleNewClientWeeks}
                        disabled={newClient.unlimited}
                        placeholder="e.g. 12"
                        className={`w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 ${newClient.unlimited ? 'opacity-40 cursor-not-allowed' : ''}`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">
                        weeks
                      </span>
                    </div>
                    <button
                      onClick={handleNewClientUnlimited}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-[12px] font-medium transition-colors duration-150 ${newClient.unlimited ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#059669]' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors duration-150 ${newClient.unlimited ? 'bg-[#10B981] border-[#10B981]' : 'border-gray-300 bg-white'}`}
                      >
                        {newClient.unlimited && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>{' '}
                      Unlimited
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white z-10 px-7 py-4 border-t border-gray-100 rounded-b-2xl flex items-center justify-between">
              <button
                onClick={closeAddClient}
                className="px-4 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2.5 text-[13px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150">
                  Save as Draft
                </button>
                <button className="px-5 py-2.5 text-[13px] font-semibold text-white bg-[#10B981] hover:bg-[#059669] rounded-lg transition-colors duration-150 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

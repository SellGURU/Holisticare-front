/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ClipboardList, Plus, X, UserPlus, Download, Trash2, Upload, Eye, RefreshCw, Wifi, WifiOff, Footprints, Brain, Send, AlertTriangle, AlertCircle, CircleDot, Share2, Sparkles, Shield, Gauge, Clock } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import Application from '../../api/app'

const bloodData = [
  { name: 'Optimal', value: 69, fill: '#10B981' },
  { name: 'Reference', value: 24, fill: '#F59E0B' },
  { name: 'Out of range', value: 7, fill: '#EF4444' }
]

const genomeData = [
  { name: 'Strength', value: 19, fill: '#10B981' },
  { name: 'Neutral', value: 60, fill: '#94A3B8' },
  { name: 'Focus', value: 21, fill: '#F59E0B' }
]

const todos = [
  { task: 'Respond to client\'s test message', priority: 'high' },
  { task: 'Request mobile app installation', priority: 'medium' },
  { task: 'Ask to connect wearable device', priority: 'low' },
  { task: 'Review sleep protocol adherence', priority: 'medium' }
]

const chatMessages = [
  { sender: 'client', text: 'Hi doctor, I had my ApoB test done yesterday. Should I send the results through the app?', time: '2h ago' },
  { sender: 'practitioner', text: 'Great news! Yes please upload via the app. I\'ll review once it\'s in.', time: '1h ago' },
  { sender: 'client', text: 'Perfect, uploading now. Also wanted to ask about the new supplement timing.', time: '45m ago' }
]

const holisticPlans = [
  { id: 1, name: 'Holistic Plan v2', date: '15 Jan 2025', shared: true, sharedDate: '16 Jan 2025' },
  { id: 2, name: 'Holistic Plan v1', date: '20 Oct 2024', shared: true, sharedDate: '21 Oct 2024' }
]

const planSummary = [
  { title: 'Special Therapies', items: 'Ozone Therapy, IV Chelation' },
  { title: 'Peptides', items: 'Tirzepatide, BPC-157, Thymosin Alpha-1' },
  { title: 'Supplements', items: 'Vitamin D3+K2, NAD+, Vitamin B12, Ashwagandha' },
  { title: 'Diet', items: 'Low-carb Mediterranean diet' },
  { title: 'Activity', items: 'Zone 2 cardio 3x/wk, Resistance training 2x/wk' },
  { title: 'Lifestyle', items: 'Cold exposure protocol, Blue light blocking, Meditation 15 min/day' },
  { title: 'Biohacks', items: 'Red light therapy, Hyperbaric oxygen' },
  { title: 'Other', items: 'Quarterly biomarker recheck' }
]

const priorityColors: Record<string, string> = { high: 'bg-red-50 text-red-600 border-red-200', medium: 'bg-amber-50 text-amber-600 border-amber-200', low: 'bg-gray-100 text-gray-500 border-gray-200' }

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '—'

function DonutCard({ title, date, data, icon, children }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[13px] font-bold text-gray-900">{title}</span>
        </div>
        {date && <span className="text-[10px] text-gray-400">{date}</span>}
      </div>
      {data ? (
        <div className="flex items-center gap-3">
          <div className="w-[90px] h-[90px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={data} cx="50%" cy="50%" innerRadius={28} outerRadius={42} paddingAngle={2} dataKey="value" strokeWidth={0}>{data.map((e: any, i: number) => <Cell key={i} fill={e.fill} />)}</Pie></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1.5">
            {data.map((d: any) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{backgroundColor: d.fill}} /><span className="text-[11px] text-gray-600">{d.name}</span></div>
                <span className="text-[12px] font-bold text-gray-800">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      ) : children}
    </div>
  )
}

function SectionHeader({ title, color, children }: any) {
  const colors: Record<string, string> = {
    green: 'bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 border-l-emerald-500',
    blue: 'bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 border-l-blue-500',
    purple: 'bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 border-l-violet-500',
    amber: 'bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 border-l-amber-500'
  }
  return (
    <div className="mb-3">
      <div className={`rounded-lg border-l-4 px-4 py-2.5 mb-3 ${colors[color]}`}>
        <h3 className="text-[13px] font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function HealthPlan() {
  const { id, name } = useParams<{ id: string; name: string }>()
  const clientName = name ? decodeURIComponent(name) : ''

  const [chatInput, setChatInput] = useState('')
  const [selectedPlan, setSelectedPlan] = useState(holisticPlans[0].id)

  const [personalInfo, setPersonalInfo] = useState<any>(null)
  const [questionnaires, setQuestionnaires] = useState<any[]>([])
  const [testResults, setTestResults] = useState<any[]>([])
  const [wearables, setWearables] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    if (!id) return

    Application.getClientInfo({ member_id: id })
      .then((res) => setPersonalInfo(res?.data?.personal_info ?? null))
      .catch((err) => console.error('Error getting client info:', err))

    Application.getQuestionary_tracking({ member_id: id })
      .then((res) => setQuestionnaires(Array.isArray(res?.data) ? res.data : []))
      .catch((err) => console.error('Error getting questionnaires:', err))

    Application.getFilleList({ member_id: id })
      .then((res) => setTestResults(Array.isArray(res?.data) ? res.data : []))
      .catch((err) => console.error('Error getting test results:', err))

    Application.getDataSyncing({ member_id: id })
      .then((res) => setWearables(Array.isArray(res?.data) ? res.data : []))
      .catch((err) => console.error('Error getting data syncing:', err))

    Application.showTimeLine({ member_id: id })
      .then((res) => setEvents(Array.isArray(res?.data?.Events) ? res.data.Events : []))
      .catch((err) => console.error('Error getting timeline:', err))
  }, [id])

  const handleChatInput = (e: any) => { setChatInput(e.target.value) }
  const handlePlanChange = (e: any) => { setSelectedPlan(Number(e.target.value)) }

  const activePlan = holisticPlans.find(p => p.id === selectedPlan)

  const displayName = useMemo(() => {
    if (personalInfo) {
      const full = [personalInfo.first_name, personalInfo.last_name].filter(Boolean).join(' ').trim()
      if (full) return full
    }
    return clientName
  }, [personalInfo, clientName])

  const completedQuestionnaires = questionnaires.filter((q) => q.status === 'completed').length

  return (
    <main className="flex-1 overflow-y-auto p-5">
      <div className="flex gap-5 max-w-[1200px] mx-auto">
        {/* ===== SECTION A: MAIN ===== */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* A1: Client Summary + A2: Practitioner */}
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3 bg-white rounded-xl border border-gray-200/80 p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-[18px] font-bold text-red-700 flex-shrink-0">{getInitials(displayName)}</div>
                <div className="flex-1">
                  <h1 className="text-[18px] font-bold text-gray-900">{displayName || 'Client'}</h1>
                  <p className="text-[12px] text-gray-400 mt-0.5">ID: {id ?? '—'}{personalInfo?.['phone number'] ? ` · ${personalInfo['phone number']}` : ''}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-3 border-t border-gray-100">
                <div><p className="text-[10px] text-gray-400 font-medium">Email</p><p className="text-[13px] font-semibold text-gray-800 mt-0.5 truncate">{personalInfo?.email || '—'}</p></div>
                <div><p className="text-[10px] text-gray-400 font-medium">Coach</p><p className="text-[13px] font-semibold text-gray-800 mt-0.5 truncate">{personalInfo?.expert || '—'}</p></div>
                <div><p className="text-[10px] text-gray-400 font-medium">Location</p><p className="text-[13px] font-semibold text-gray-800 mt-0.5 truncate">{personalInfo?.Location || '—'}</p></div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-100">
                <div><p className="text-[10px] text-gray-400 font-medium">Medication</p><p className="text-[13px] font-semibold text-gray-800 mt-0.5 truncate">{personalInfo?.medication || '—'}</p></div>
                <div><p className="text-[10px] text-gray-400 font-medium">Conditions</p><p className="text-[13px] font-semibold text-gray-800 mt-0.5 truncate">{personalInfo?.conditions || '—'}</p></div>
                <div><p className="text-[10px] text-gray-400 font-medium">Allergy</p><p className="text-[13px] font-semibold text-gray-800 mt-0.5 truncate">{personalInfo?.allergy || '—'}</p></div>
              </div>
            </div>

            <div className="col-span-2 bg-white rounded-xl border border-gray-200/80 p-4">
              <h3 className="text-[13px] font-bold text-gray-900 mb-3">Practitioner</h3>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#0D9488] flex items-center justify-center text-white text-[10px] font-bold">{getInitials(personalInfo?.expert || 'Coach')}</div>
                <div><p className="text-[12px] font-semibold text-gray-800">{personalInfo?.expert || '—'}</p><p className="text-[10px] text-gray-400">Assigned Coach</p></div>
              </div>
              <button className="w-full mt-1 py-2 border border-dashed border-gray-300 rounded-lg text-[11px] text-gray-500 hover:bg-gray-50 hover:border-[#10B981] hover:text-[#10B981] transition-colors duration-150 flex items-center justify-center gap-1.5">
                <Plus className="w-3 h-3" /> Add Practitioner
              </button>
            </div>
          </div>

          {/* A3: Data Ingestion Status */}
          <SectionHeader title="Data Ingestion Status" color="green">
            <div className="grid grid-cols-3 gap-3">
              {/* Questionnaires */}
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <h4 className="text-[12px] font-bold text-gray-800 mb-2.5">Questionnaires</h4>
                <div className="space-y-1.5">
                  {questionnaires.length === 0 && (
                    <p className="text-[11px] text-gray-400 py-2">No questionnaires found</p>
                  )}
                  {questionnaires.map((q, i) => (
                    <div key={q.unique_id ?? i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-gray-700 truncate">{q.title}</p>
                        <p className="text-[9px] text-gray-400">{q['Completed on'] || q.completed_on || q.date || 'Not taken'}</p>
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {q.status === 'completed' ? (
                          <>
                            <button className="w-5 h-5 rounded hover:bg-blue-50 flex items-center justify-center" title="Preview"><Eye className="w-3 h-3 text-gray-400" /></button>
                            <button className="w-5 h-5 rounded hover:bg-amber-50 flex items-center justify-center" title="Retake"><RefreshCw className="w-3 h-3 text-gray-400" /></button>
                            <button className="w-5 h-5 rounded hover:bg-red-50 flex items-center justify-center" title="Clear"><X className="w-3 h-3 text-gray-400" /></button>
                          </>
                        ) : (
                          <>
                            <button className="px-1.5 py-0.5 bg-[#10B981]/10 text-[#059669] text-[9px] font-semibold rounded hover:bg-[#10B981]/20 transition-colors duration-150">Take</button>
                            <button className="w-5 h-5 rounded hover:bg-blue-50 flex items-center justify-center" title="Assign"><UserPlus className="w-3 h-3 text-gray-400" /></button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Results */}
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <h4 className="text-[12px] font-bold text-gray-800 mb-2.5">Test Results</h4>
                <div className="space-y-1.5">
                  {testResults.length === 0 && (
                    <p className="text-[11px] text-gray-400 py-2">No test results found</p>
                  )}
                  {testResults.map((t, i) => (
                    <div key={t.file_id ?? i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-gray-700 truncate">{t.file_name}</p>
                        <p className="text-[9px] text-gray-400">{t.date_uploaded || t.date_of_test || ''}</p>
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button className="w-5 h-5 rounded hover:bg-blue-50 flex items-center justify-center" title="Download"><Download className="w-3 h-3 text-gray-400" /></button>
                        <button className="w-5 h-5 rounded hover:bg-red-50 flex items-center justify-center" title="Delete"><Trash2 className="w-3 h-3 text-gray-400" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 py-2 border border-dashed border-gray-300 rounded-lg text-[11px] text-gray-500 hover:bg-emerald-50 hover:border-[#10B981] hover:text-[#10B981] transition-colors duration-150 flex items-center justify-center gap-1.5">
                  <Upload className="w-3 h-3" /> Upload Test Results
                </button>
              </div>

              {/* Wearables */}
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <h4 className="text-[12px] font-bold text-gray-800 mb-2.5">Wearables</h4>
                <div className="space-y-2">
                  {wearables.length === 0 && (
                    <p className="text-[11px] text-gray-400 py-2">No devices found</p>
                  )}
                  {wearables.map((w, i) => {
                    const connected = w.State === 'Connected'
                    return (
                      <div key={w.Data ?? i} className={`p-2.5 rounded-lg border ${connected ? 'bg-emerald-50/50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-gray-800">{w.Data}</span>
                          {connected ? (
                            <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-600"><Wifi className="w-3 h-3" /> Connected</span>
                          ) : (
                            <span className="flex items-center gap-1 text-[9px] font-semibold text-gray-400"><WifiOff className="w-3 h-3" /> Disconnected</span>
                          )}
                        </div>
                        {w['Last Sync'] && (
                          <p className="text-[9px] text-gray-400">Last sync: {w['Last Sync']}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </SectionHeader>

          {/* A4: Data Analysis */}
          <SectionHeader title="Data Analysis" color="blue">
            <div className="grid grid-cols-3 gap-3">
              {/* Questionnaires Analysis */}
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-2 mb-3"><ClipboardList className="w-4 h-4 text-blue-500" /><span className="text-[13px] font-bold text-gray-900">Questionnaires</span></div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-emerald-500" /><span className="text-[11px] font-medium text-gray-700">Completed</span></div>
                    <span className="text-[18px] font-bold text-emerald-600">{completedQuestionnaires}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /><span className="text-[11px] font-medium text-gray-700">Pending</span></div>
                    <span className="text-[18px] font-bold text-amber-600">{questionnaires.length - completedQuestionnaires}</span>
                  </div>
                </div>
              </div>

              {/* Wearables Analysis */}
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-2 mb-3"><Wifi className="w-4 h-4 text-blue-500" /><span className="text-[13px] font-bold text-gray-900">Wearables</span></div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="flex items-center gap-2"><Wifi className="w-4 h-4 text-emerald-500" /><span className="text-[11px] font-medium text-gray-700">Connected</span></div>
                    <span className="text-[18px] font-bold text-emerald-600">{wearables.filter((w) => w.State === 'Connected').length}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center gap-2"><WifiOff className="w-4 h-4 text-red-500" /><span className="text-[11px] font-medium text-gray-700">Disconnected</span></div>
                    <span className="text-[18px] font-bold text-red-600">{wearables.filter((w) => w.State !== 'Connected').length}</span>
                  </div>
                </div>
              </div>

              {/* Blood */}
              <DonutCard title="Blood" date="02 Apr 25" data={bloodData} icon={<CircleDot className="w-4 h-4 text-blue-500" />} />

              {/* Genome */}
              <DonutCard title="Genome" date="01 Aug 21" data={genomeData} icon={<Brain className="w-4 h-4 text-blue-500" />} />

              {/* Microbiome */}
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-500" /><span className="text-[13px] font-bold text-gray-900">Microbiome</span></div>
                  <span className="text-[10px] text-gray-400">31 Aug 24</span>
                </div>
                <div className="text-center mb-2">
                  <p className="text-[10px] text-gray-400">Diversity Score</p>
                  <p className="text-[26px] font-bold text-[#10B981]">95.12%</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-400" /><span className="text-[11px] text-gray-600">Unknown</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[11px] text-gray-600">Focus</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#10B981]" /><span className="text-[11px] text-gray-600">Strength</span></div>
                </div>
              </div>

              {/* Physical Fitness */}
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2"><Footprints className="w-4 h-4 text-blue-500" /><span className="text-[13px] font-bold text-gray-900">Physical Fitness</span></div>
                  <span className="text-[10px] text-gray-400">12 Mar 25</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-[9px] text-amber-600 font-medium">BMI</p>
                    <p className="text-[22px] font-bold text-gray-900">27.1</p>
                    <p className="text-[9px] text-gray-400">kg/m2</p>
                  </div>
                  <div className="text-center p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                    <p className="text-[9px] text-emerald-600 font-medium">VO2 Max</p>
                    <p className="text-[22px] font-bold text-gray-900">43</p>
                    <p className="text-[9px] text-gray-400">ml/kg/min</p>
                  </div>
                </div>
              </div>
            </div>
          </SectionHeader>

          {/* A5: Longevity Insights */}
          <SectionHeader title="Longevity Insights" color="purple">
            <div className="grid grid-cols-3 gap-3">
              {/* Age Clocks */}
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Clock className="w-4 h-4 text-violet-500" /><span className="text-[13px] font-bold text-gray-900">Age Clocks</span></div><span className="text-[10px] text-gray-400">02 Apr 25</span></div>
                <div className="flex items-center gap-3 mb-3">
                  <div>
                    <p className="text-[10px] text-gray-400">Biological Age</p>
                    <p className="text-[30px] font-bold text-gray-900 leading-tight">40.4</p>
                    <span className="text-[12px] font-bold text-[#10B981] bg-emerald-50 px-1.5 py-0.5 rounded">-1.6</span>
                  </div>
                  <div className="flex-1 space-y-1.5 ml-2">
                    <div className="flex items-center justify-between"><span className="text-[10px] text-gray-500">Epigenetics</span><span className="text-[11px] font-bold text-[#10B981]">-2.3</span></div>
                    <div className="flex items-center justify-between"><span className="text-[10px] text-gray-500">Microbiome</span><span className="text-[11px] font-bold text-[#10B981]">-0.4</span></div>
                    <div className="flex items-center justify-between"><span className="text-[10px] text-gray-500">Blood</span><span className="text-[11px] font-bold text-red-500">+1.1</span></div>
                  </div>
                </div>
              </div>

              {/* Risk Scores */}
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-2 mb-3"><Shield className="w-4 h-4 text-violet-500" /><h4 className="text-[13px] font-bold text-gray-900">Risk Scores</h4></div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-100">
                    <span className="text-[11px] font-medium text-gray-700">Cardiometabolic</span>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">Moderate</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-100">
                    <span className="text-[11px] font-medium text-gray-700">Inflammation</span>
                    <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">High</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                    <span className="text-[11px] font-medium text-gray-700">Sleep Dysregulation</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">Low</span>
                  </div>
                </div>
              </div>

              {/* Health Scores */}
              <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                <div className="flex items-center gap-2 mb-2"><Gauge className="w-4 h-4 text-violet-500" /><h4 className="text-[13px] font-bold text-gray-900">Health Scores</h4></div>
                <div className="text-center mb-3">
                  <p className="text-[10px] text-gray-400">Overall Health Score</p>
                  <p className="text-[32px] font-bold text-[#10B981] leading-tight">77</p>
                </div>
                <div className="space-y-2">
                  <div><div className="flex justify-between text-[10px] mb-0.5"><span className="text-gray-600 font-medium">Longevity Readiness</span><span className="font-bold text-gray-800">82</span></div><div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-[#10B981] rounded-full" style={{width: '82%'}} /></div></div>
                  <div><div className="flex justify-between text-[10px] mb-0.5"><span className="text-gray-600 font-medium">Metabolic Health</span><span className="font-bold text-gray-800">74</span></div><div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-[#0D9488] rounded-full" style={{width: '74%'}} /></div></div>
                  <div><div className="flex justify-between text-[10px] mb-0.5"><span className="text-gray-600 font-medium">Recovery & Stress</span><span className="font-bold text-gray-800">68</span></div><div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-amber-400 rounded-full" style={{width: '68%'}} /></div></div>
                </div>
              </div>
            </div>
          </SectionHeader>

          {/* A6: Holistic Plan */}
          <SectionHeader title="Holistic Plan" color="amber">
            <div className="bg-white rounded-xl border border-gray-200/80 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <select value={selectedPlan} onChange={handlePlanChange} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] cursor-pointer">
                    {holisticPlans.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — {p.date}</option>
                    ))}
                  </select>
                  {activePlan && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">Generated: {activePlan.date}</span>
                      {activePlan.shared ? (
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium">Shared {activePlan.sharedDate}</span>
                      ) : (
                        <button className="text-[10px] font-semibold text-white bg-[#10B981] px-2.5 py-1 rounded hover:bg-[#059669] transition-colors duration-150 flex items-center gap-1"><Share2 className="w-3 h-3" /> Share Now</button>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="w-7 h-7 rounded-md hover:bg-blue-50 flex items-center justify-center transition-colors duration-150" title="Preview"><Eye className="w-3.5 h-3.5 text-gray-400" /></button>
                  <button className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors duration-150" title="Download"><Download className="w-3.5 h-3.5 text-gray-400" /></button>
                  <button className="flex items-center gap-1.5 bg-[#10B981] hover:bg-[#059669] text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors duration-150 ml-1">
                    <Plus className="w-3.5 h-3.5" /> Generate New Plan
                  </button>
                </div>
              </div>

              {/* Plan Summary */}
              <div className="space-y-0">
                {planSummary.map((item) => (
                  <div key={item.title} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-[11px] font-bold text-gray-800 w-[120px] flex-shrink-0 pt-0.5">{item.title}</span>
                    <span className="text-[11px] text-gray-600 leading-relaxed">{item.items}</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionHeader>
        </div>

        {/* ===== SECTION B: RIGHT SIDEBAR ===== */}
        <div className="w-[300px] flex-shrink-0 space-y-4">
          {/* B1: To-Do List */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-bold text-gray-900">To-Do List</h3>
              <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{todos.length}</span>
            </div>
            <div className="space-y-1.5">
              {todos.map((todo, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                  <div className="w-4 h-4 rounded border-2 border-gray-300 flex-shrink-0 mt-0.5 cursor-pointer hover:border-[#10B981] transition-colors duration-150" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-700 leading-relaxed">{todo.task}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border mt-1 inline-block ${priorityColors[todo.priority]}`}>{todo.priority}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-2 py-2 border border-dashed border-gray-300 rounded-lg text-[11px] text-gray-500 hover:bg-gray-50 hover:border-[#10B981] hover:text-[#10B981] transition-colors duration-150 flex items-center justify-center gap-1.5">
              <Plus className="w-3 h-3" /> Add Task
            </button>
          </div>

          {/* B2: Event History */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-4">
            <h3 className="text-[13px] font-bold text-gray-900 mb-3">Event History</h3>
            <div className="space-y-0">
              {events.length === 0 && (
                <p className="text-[11px] text-gray-400 py-2">No events found</p>
              )}
              {events.map((ev, i) => {
                const ongoing = ev.State === 'On Going'
                const description = Array.isArray(ev.event_description)
                  ? ev.event_description.join(', ')
                  : ev.event_description
                return (
                  <div key={i} className="flex gap-3 relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${ongoing ? 'bg-blue-400 animate-pulse' : 'bg-gray-300'}`} />
                      {i < events.length - 1 && <div className="w-[1px] flex-1 bg-gray-200 my-0.5" />}
                    </div>
                    <div className="pb-3">
                      <p className={`text-[11px] font-medium ${ongoing ? 'text-blue-700' : 'text-gray-600'}`}>{ev.event_title}</p>
                      {description ? <p className="text-[9px] text-gray-400 mt-0.5">{description}</p> : <p className="text-[9px] text-blue-400 mt-0.5">{ev.State}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* B3: Chat */}
          <div className="bg-white rounded-xl border border-gray-200/80 flex flex-col" style={{height: '320px'}}>
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-[13px] font-bold text-gray-900">Chat{displayName ? ` with ${displayName.split(' ')[0]}` : ''}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'practitioner' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl ${msg.sender === 'practitioner' ? 'bg-[#10B981]/10 text-gray-800' : 'bg-gray-100 text-gray-800'}`}>
                    <p className="text-[11px] leading-relaxed">{msg.text}</p>
                    <p className={`text-[9px] mt-1 ${msg.sender === 'practitioner' ? 'text-emerald-500' : 'text-gray-400'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-3 pb-3 pt-1">
              <div className="flex items-center gap-2">
                <input type="text" value={chatInput} onChange={handleChatInput} placeholder="Type a message..." className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150" />
                <button className="w-8 h-8 bg-[#10B981] hover:bg-[#059669] rounded-lg flex items-center justify-center transition-colors duration-150"><Send className="w-3.5 h-3.5 text-white" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default HealthPlan;

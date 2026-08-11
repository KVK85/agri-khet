import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CloudRain, Wind, Droplets, Thermometer, MapPin, Camera, Upload, Leaf,
  Sun, Cloud, Clock3, ShieldCheck, AlertTriangle, CheckCircle2, FlaskConical,
  Sprout, Phone, Languages, Navigation, X, ChevronRight, History, Activity,
  Eye, Beaker, Ban, Timer, ArrowUpRight, Sparkles, Microscope, Search,
  Waves, Gauge, CalendarDays, MessageCircle, Share2, Printer, Volume2, ChevronDown,
  Tractor, Bug
} from 'lucide-react'

// Types
type Crop = 'Tomato' | 'Rice' | 'Wheat' | 'Cotton' | 'Chilli' | 'Potato'
type Location = { id: string; name: string; district: string; state: string; lat: number; lon: number }
type Severity = 'Low' | 'Moderate' | 'High' | 'Critical'
type Disease = {
  id: string
  crop: Crop
  name: string
  scientific: string
  severity: Severity
  confidence: number
  icon: string
  color: string
  description: string
  symptoms: string[]
  causes: string[]
  organic: { title: string; steps: string[]; cost: string }[]
  chemical: { name: string; dosage: string; phi: string; note: string }[]
  prevention: string[]
  spreadRisk: number
  yieldLoss: string
}

const LOCATIONS: Location[] = [
  { id: 'nashik', name: 'Nashik', district: 'Nashik', state: 'Maharashtra', lat: 20.0, lon: 73.78 },
  { id: 'ludhiana', name: 'Ludhiana', district: 'Ludhiana', state: 'Punjab', lat: 30.90, lon: 75.85 },
  { id: 'krishna', name: 'Vijayawada', district: 'Krishna', state: 'Andhra Pradesh', lat: 16.50, lon: 80.64 },
  { id: 'indore', name: 'Indore', district: 'Indore', state: 'Madhya Pradesh', lat: 22.72, lon: 75.85 },
  { id: 'coimbatore', name: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', lat: 11.01, lon: 76.96 },
]

const CROPS: Crop[] = ['Tomato', 'Rice', 'Wheat', 'Cotton', 'Chilli', 'Potato']

const DISEASES: Disease[] = [
  {
    id: 'late-blight',
    crop: 'Tomato',
    name: 'Late Blight',
    scientific: 'Phytophthora infestans',
    severity: 'Critical',
    confidence: 94,
    icon: '🍅',
    color: '#dc2626',
    description: 'Aggressive fungal blight thriving in cool, wet conditions. Lesions spread rapidly and can defoliate the plant within 7–10 days if untreated.',
    symptoms: ['Dark water-soaked spots on leaf edges', 'White fuzzy growth underneath leaves in humid mornings', 'Brown-black lesions spreading inward'],
    causes: ['Prolonged leaf wetness >8 hrs', 'Night temp 10-18°C + high humidity', 'Spores carried by wind from nearby fields'],
    organic: [
      { title: 'Neem + Baking Soda Spray', steps: ['Mix 5ml neem oil + 5g baking soda per litre water', 'Spray late evening covering underside'], cost: '₹45 / acre' },
      { title: 'Bordeaux Mixture 1%', steps: ['Copper sulphate 1kg + Lime 1kg in 100L water', 'Spray early, repeat after 7 days if rain persists'], cost: '₹120 / acre' }
    ],
    chemical: [
      { name: 'Mancozeb 75% WP', dosage: '2.5g / litre', phi: '5-7 days', note: 'Contact fungicide — must cover fully' },
      { name: 'Azoxystrobin + Mancozeb', dosage: '2g / litre', phi: '5 days', note: 'Curative + protective. Best before rain' },
    ],
    prevention: ['Avoid overhead irrigation after 4pm', 'Stake plants for airflow', 'Remove affected leaves in paper bag — do not compost'],
    spreadRisk: 88,
    yieldLoss: 'Up to 70% if untreated'
  },
  {
    id: 'rice-blast',
    crop: 'Rice',
    name: 'Rice Blast',
    scientific: 'Magnaporthe oryzae',
    severity: 'High',
    confidence: 91,
    icon: '🌾',
    color: '#d97706',
    description: 'Most destructive rice disease. Diamond-shaped lesions choke the leaf and can break the panicle neck at flowering.',
    symptoms: ['Spindle-shaped grey spots with brown border', 'Nodal rot at stem', 'Panicle neck breaks and turns white'],
    causes: ['High nitrogen + dense planting', 'Dew + low night temp', 'Infected seed / stubbles'],
    organic: [
      { title: 'Pseudomonas fluorescens', steps: ['10g / litre seed treatment', 'Foliar spray at tillering'], cost: '₹80 / acre' },
      { title: 'Silica + Potash boost', steps: ['Foliar silica to harden leaves', 'Reduce nitrogen by 20% this cycle'], cost: '₹60 / acre' }
    ],
    chemical: [
      { name: 'Tricyclazole 75% WP', dosage: '0.6g / litre', phi: '28 days', note: 'Most effective at early lesion stage' },
      { name: 'Isoprothiolane 40% EC', dosage: '1.5ml / litre', phi: '21 days', note: 'Systemic, good for neck blast' },
    ],
    prevention: ['Maintain 20x15 cm spacing', 'Avoid late urea top-dressing', 'Burn or compost infected straw away from field'],
    spreadRisk: 78,
    yieldLoss: '30-50% loss'
  },
  {
    id: 'leaf-curl',
    crop: 'Chilli',
    name: 'Leaf Curl Virus',
    scientific: 'Begomovirus (whitefly vector)',
    severity: 'High',
    confidence: 87,
    icon: '🌶️',
    color: '#7c3aed',
    description: 'Viral disease spread by whitefly. Leaves curl upward, plant stunts and drops flowers. No chemical cure — vector control is key.',
    symptoms: ['Upward curling & crinkling of leaves', 'Stunted growth, bushy top', 'Flower drop, small twisted fruits'],
    causes: ['Whitefly swarm after dry spell', 'Weeds hosting virus nearby', 'Continuous chilli/cotton cropping'],
    organic: [
      { title: 'Yellow sticky traps + Neem', steps: ['20 traps / acre + 5% neem kernel extract', 'Spray every 5 days for 3 cycles'], cost: '₹150 / acre' },
      { title: 'Barrier crop', steps: ['Sow 2 rows maize/sorghum around chilli', 'Rogue and destroy severely infected plants'], cost: 'Labour only' }
    ],
    chemical: [
      { name: 'Imidacloprid 17.8% SL', dosage: '0.3ml / litre', phi: '7 days', note: 'Targets whitefly nymphs' },
      { name: 'Diafenthiuron 50% WP', dosage: '1.2g / litre', phi: '5 days', note: 'Rotate to avoid resistance' },
    ],
    prevention: ['Control weeds 30 days before sowing', 'Use virus-tolerant hybrids next season', 'Early sowing to escape peak whitefly'],
    spreadRisk: 92,
    yieldLoss: '40-90% in early infection'
  },
  {
    id: 'wheat-rust',
    crop: 'Wheat',
    name: 'Stripe Rust (Yellow Rust)',
    scientific: 'Puccinia striiformis',
    severity: 'Moderate',
    confidence: 89,
    icon: '🌿',
    color: '#eab308',
    description: 'Yellow-orange pustules in stripes along leaf veins. Explodes after foggy nights and cool days. Can strip flag leaf quickly.',
    symptoms: ['Linear yellow pustules on leaves', 'Powdery spores rub off on fingers', 'Premature yellowing of flag leaf'],
    causes: ['Fog + 12-18°C temperature', 'Late sown wheat', 'Spores blown from hills'],
    organic: [
      { title: 'Sulphur dusting', steps: ['200 mesh sulphur @ 15kg/acre early morning'], cost: '₹200 / acre' },
    ],
    chemical: [
      { name: 'Propiconazole 25% EC', dosage: '1ml / litre', phi: '30 days', note: 'Apply at first stripe appearance — single spray often enough' },
      { name: 'Tebuconazole', dosage: '1ml / litre', phi: '35 days', note: 'Do not mix with 2,4-D' },
    ],
    prevention: ['Sow between 15 Nov - 5 Dec (north India)', 'Grow rust-resistant varieties: HD3086, DBW187'],
    spreadRisk: 65,
    yieldLoss: '15-30%'
  },
  {
    id: 'cotton-boll-rot',
    crop: 'Cotton',
    name: 'Boll Rot & Leaf Spot',
    scientific: 'Complex — Alternaria / Bacteria',
    severity: 'Moderate',
    confidence: 84,
    icon: '🌱',
    color: '#059669',
    description: 'Bolls with water-soaked spots turning black. Often after heavy rain and dense canopy. Secondary bollworm follows.',
    symptoms: ['Round brown spots with yellow halo on leaves', 'Bolls with black greasy spots', 'Bolls not opening, lint stained'],
    causes: ['Cotton canopy too dense', 'Continuous rains + poor drainage', 'Injuries from sucking pests'],
    organic: [
      { title: 'Copper + Drainage', steps: ['Improve drainage channels', 'Copper oxychloride 3g/litre if < 25% bolls affected'], cost: '₹90 / acre' },
    ],
    chemical: [
      { name: 'Streptomycin + Copper', dosage: '0.5g + 2.5g / litre', phi: '15 days', note: 'For bacterial component' },
    ],
    prevention: ['Maintain 90x45 cm spacing', 'Nipping at 90 days to reduce humidity', 'Timely sucking pest control'],
    spreadRisk: 52,
    yieldLoss: '10-25%'
  },
]

type Hourly = { time: string; temp: number; rain: number; wind: number; humidity: number; icon: string; safe: 'safe' | 'caution' | 'unsafe' }

function generateWeather(loc: Location) {
  // deterministic-ish per location
  const baseTemp = 24 + (loc.lat % 7)
  const hours: Hourly[] = []
  const now = new Date()
  for (let i = 0; i < 24; i++) {
    const d = new Date(now)
    d.setHours(now.getHours() + i)
    const h = d.getHours()
    const temp = Math.round(baseTemp + Math.sin((h - 6) * Math.PI / 12) * 6 + (Math.random() * 2 - 1))
    const rainChance = h >= 14 && h <= 19 ? 65 + Math.random() * 25 : // afternoon risk
      h >= 3 && h <= 6 ? 30 + Math.random() * 20 :
        Math.random() * 18
    const wind = Math.round(6 + Math.random() * 14 + (rainChance > 50 ? 6 : 0))
    const humidity = Math.round(58 + (rainChance > 50 ? 28 : 0) + Math.random() * 12)

    let safe: Hourly['safe'] = 'safe'
    if (rainChance > 55 || wind > 18) safe = 'unsafe'
    else if (rainChance > 30 || wind > 14 || humidity > 85) safe = 'caution'

    const icon = rainChance > 55 ? 'rain' : wind > 16 ? 'wind' : h >= 6 && h <= 18 ? 'sun' : 'cloud'
    hours.push({
      time: d.toLocaleString('en-IN', { hour: 'numeric', hour12: true }),
      temp, rain: Math.round(rainChance), wind, humidity, icon, safe
    })
  }
  return {
    current: {
      temp: hours[0].temp,
      feels: hours[0].temp + 2,
      humidity: hours[0].humidity,
      wind: hours[0].wind,
      rain: hours[0].rain,
      uv: Math.round(5 + Math.random() * 4),
      soilMoisture: Math.round(42 + Math.random() * 28),
    },
    hours,
    fiveDay: Array.from({ length: 5 }).map((_, i) => {
      const dt = new Date()
      dt.setDate(dt.getDate() + i)
      return {
        day: i === 0 ? 'Today' : dt.toLocaleDateString('en-IN', { weekday: 'short' }),
        high: Math.round(baseTemp + 5 + Math.random() * 3),
        low: Math.round(baseTemp - 5 - Math.random() * 2),
        rain: Math.round(Math.random() * 70),
        icon: ['sun', 'cloud', 'rain', 'sun', 'cloud'][i % 5]
      }
    })
  }
}

export default function App() {
  const [lang, setLang] = useState<'EN' | 'HI'>('EN')
  const [location, setLocation] = useState<Location>(LOCATIONS[0])
  const [crop, setCrop] = useState<Crop>('Tomato')
  const [image, setImage] = useState<string | null>(null)
  const [imageName, setImageName] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [advisory, setAdvisory] = useState<Disease | null>(null)
  const [activeTreatTab, setActiveTreatTab] = useState<'action' | 'organic' | 'chemical'>('action')
  const [imgDrag, setImgDrag] = useState(false)
  const [showLocatePulse, setShowLocatePulse] = useState(false)
  const [soilMoisture, setSoilMoisture] = useState(54)
  const [history, setHistory] = useState<(Disease & { at: string; loc: string; img: string | null })[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([])

  const weather = useMemo(() => generateWeather(location), [location])
  const [weatherTick, setWeatherTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setWeatherTick(t => t + 1), 60000)
    return () => clearInterval(id)
  }, [])

  // simulate live update tiny jitter
  const liveWeather = useMemo(() => {
    void weatherTick
    return weather
  }, [weather, weatherTick])

  const pushToast = (msg: string) => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2500)
  }

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) return pushToast('Please upload a leaf photo (JPG/PNG)')
    const url = URL.createObjectURL(f)
    setImage(url)
    setImageName(f.name)
    // auto-guess crop from filename?
    const lower = f.name.toLowerCase()
    if (lower.includes('rice')) setCrop('Rice')
    else if (lower.includes('wheat')) setCrop('Wheat')
    else if (lower.includes('cotton')) setCrop('Cotton')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setImgDrag(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const runDiagnosis = () => {
    if (!image) return pushToast('Add a leaf photo first — even a phone click works')
    setAnalyzing(true)
    setProgress(0)
    setAdvisory(null)
    let p = 0
    const iv = setInterval(() => {
      p += Math.random() * 18 + 8
      if (p >= 100) {
        p = 100
        clearInterval(iv)
        // pick disease matching crop or random
        const candidates = DISEASES.filter(d => d.crop === crop)
        const pick = candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : DISEASES[Math.floor(Math.random() * DISEASES.length)]
        // small jitter confidence
        const conf = Math.min(98, Math.max(82, pick.confidence + Math.floor(Math.random() * 6 - 3)))
        const result: Disease = { ...pick, confidence: conf }
        setAdvisory(result)
        setAnalyzing(false)
        setHistory(h => [{ ...result, at: new Date().toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, day: '2-digit', month: 'short' }), loc: location.name, img: image }, ...h].slice(0, 5))
        // switch tab to action
        setActiveTreatTab('action')
        setTimeout(() => {
          document.getElementById('advisory')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 200)
      }
      setProgress(Math.min(100, p))
    }, 220)
  }

  const safeWindow = useMemo(() => {
    if (!advisory) return null
    const hours = liveWeather.hours
    // find next 3-hour safe window
    for (let i = 0; i < hours.length - 2; i++) {
      const slice = hours.slice(i, i + 3)
      if (slice.every(h => h.safe === 'safe')) {
        return { start: hours[i].time, end: hours[i + 2].time, idx: i }
      }
    }
    // fallback: first caution window
    const cautionIdx = hours.findIndex(h => h.safe !== 'unsafe')
    if (cautionIdx !== -1) return { start: hours[cautionIdx].time, end: hours[cautionIdx + 1]?.time ?? hours[cautionIdx].time, idx: cautionIdx, caution: true }
    return { start: 'Tomorrow 6 AM', end: '9 AM', idx: 0, tomorrow: true }
  }, [liveWeather, advisory])

  const useMyLocation = () => {
    setShowLocatePulse(true)
    setTimeout(() => setShowLocatePulse(false), 1600)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => {
        const randomLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
        setLocation(randomLoc)
        pushToast(`Located near ${randomLoc.name}, ${randomLoc.state} • Weather synced`)
      }, () => {
        const randomLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
        setLocation(randomLoc)
        pushToast(`Demo location: ${randomLoc.name} • Enable GPS for precise field`)
      })
    } else {
      pushToast('Geolocation not supported — using district profile')
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFBEB] text-stone-800 selection:bg-emerald-200">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,600;9..144,1,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');`}</style>

      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#FFFBEB]/80 border-b border-stone-200">
        <div className="max-w-[1480px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[64px] gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0f3a24] flex items-center justify-center text-white shadow-sm">
                <Sprout size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-[Fraunces] font-semibold tracking-tight text-[19px] leading-none text-[#0f3a24]">KHETBRIDGE</span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold tracking-widest bg-emerald-900 text-amber-200 px-2 py-1 rounded-full">FIELD → EXPERT</span>
                </div>
                <div className="text-[11px] font-medium text-stone-500 -mt-0.5 hidden sm:block">{lang === 'EN' ? 'Real-time agronomy bridge for smallholders' : 'छोटे किसानों के लिए रीयल-टाइम कृषि सलाह'}</div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs">
              <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-full px-3 py-2 shadow-sm">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="font-semibold text-stone-700">Live Weather</span>
                <span className="text-stone-400">•</span>
                <span className="font-mono font-medium text-stone-700">{liveWeather.current.temp}°C • {liveWeather.current.humidity}% RH</span>
              </div>
              <div className="flex items-center gap-2 bg-amber-100 border border-amber-200 rounded-full px-3 py-2">
                <Tractor size={14} className="text-amber-700" />
                <span className="font-semibold text-amber-900 hidden xl:inline">3,42,109 advisories delivered</span>
                <span className="font-semibold text-amber-900 xl:hidden">3.4L+ advisories</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setLang(l => l === 'EN' ? 'HI' : 'EN')} className="inline-flex items-center gap-1.5 bg-white border border-stone-200 hover:border-stone-300 rounded-full px-3 py-2 text-xs font-semibold transition-colors">
                <Languages size={14} />
                <span className="hidden sm:inline">{lang === 'EN' ? 'हिन्दी' : 'English'}</span>
                <span className="sm:hidden">{lang}</span>
              </button>
              <a href="tel:155261" className="hidden sm:inline-flex items-center gap-2 bg-[#0f3a24] text-white rounded-full px-4 py-2 text-xs font-semibold hover:bg-[#12472c] transition-colors">
                <Phone size={14} /> Kisan Call: 155261
              </a>
              <button onClick={() => pushToast('Expert callback requested — you’ll get a call in 8 mins (demo)')} className="sm:hidden w-9 h-9 rounded-full bg-[#0f3a24] text-white grid place-items-center">
                <Phone size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero strip */}
      <div className="max-w-[1480px] mx-auto px-3 sm:px-6 lg:px-8 mt-4">
        <div className="rounded-[20px] overflow-hidden border border-[#14532d]/15 bg-gradient-to-br from-[#0f3a24] via-[#14532d] to-[#1a6b3a] text-white relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at 20% 20%, #facc15 0, transparent 50%), radial-gradient(circle at 90% 10%, #22c55e 0, transparent 40%)` }} />
          <div className="relative grid lg:grid-cols-[1.15fr_0.85fr] gap-6 p-5 sm:p-7 lg:p-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur rounded-full px-3 py-1.5 text-xs">
                <span className="w-2 h-2 bg-amber-300 rounded-full animate-pulse" />
                {lang === 'EN' ? 'Trusted by 12,000+ FPOs & Krishi Vigyan Kendras' : '12,000+ FPO और KVK द्वारा भरोसेमंद'}
                <span className="hidden sm:inline-flex items-center gap-1 bg-amber-300 text-emerald-950 px-2 py-0.5 rounded-full font-bold ml-1">ICAR validated <CheckCircle2 size={12} /></span>
              </div>
              <h1 className="font-[Fraunces] text-[28px] sm:text-[34px] lg:text-[42px] font-semibold leading-[0.95] mt-3">
                {lang === 'EN' ? <>Snap a leaf. <span className="italic font-[Fraunces] font-semibold text-amber-200">Get the cure</span><br />before the next rain.</> : <>पत्ते की फोटो लें.<br /><span className="text-amber-200">बारिश से पहले इलाज</span> पाएं।</>}
              </h1>
              <p className="text-white/80 text-sm sm:text-[15px] leading-relaxed mt-3 max-w-[62ch]">
                {lang === 'EN'
                  ? 'KhetBridge turns a blurry phone photo + your field location + live weather into a clear, spray-safe plan — in your language, for your crop.'
                  : 'खेतब्रिज धुंधली फोटो + आपके खेत की लोकेशन + लाइव मौसम को स्पष्ट, सुरक्षित छिड़काव योजना में बदल देता है।'}
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {[
                  { k: 'Photo → Diagnosis', v: '< 6 sec' },
                  { k: 'Weather-safe window', v: 'Hourly' },
                  { k: 'Languages', v: '12+' },
                ].map(s => (
                  <div key={s.k} className="bg-white text-stone-800 rounded-full px-3 py-2 text-xs font-semibold flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 grid place-items-center text-emerald-700"><CheckCircle2 size={14} /></span>
                    {s.k} <span className="bg-stone-900 text-white px-2 py-0.5 rounded-full text-[11px]">{s.v}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-4 text-xs text-white/70">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-200" /> No data needed after first load</span>
                <span className="w-1 h-1 bg-white/40 rounded-full" />
                <span className="inline-flex items-center gap-1.5"><Volume2 size={14} className="text-amber-200" /> Voice readout</span>
              </div>
            </div>

            <div className="bg-[#FFFBEB] rounded-2xl p-3 sm:p-4 text-stone-800 shadow-xl border border-amber-200/60">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold tracking-widest text-emerald-900">HOW IT WORKS</div>
                <span className="text-[11px] bg-emerald-900 text-white px-2 py-1 rounded-full">3 steps • 30 sec</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { n: '1', title: lang === 'EN' ? 'Capture' : 'फोटो', desc: lang === 'EN' ? 'Leaf photo + location' : 'पत्ता + लोकेशन', icon: Camera, color: 'bg-amber-100 text-amber-800' },
                  { n: '2', title: lang === 'EN' ? 'Analyze' : 'विश्लेषण', desc: lang === 'EN' ? 'AI + weather fuse' : 'AI + मौसम', icon: Microscope, color: 'bg-emerald-100 text-emerald-800' },
                  { n: '3', title: lang === 'EN' ? 'Act' : 'कदम', desc: lang === 'EN' ? 'Spray-safe advisory' : 'सुरक्षित सलाह', icon: ShieldCheck, color: 'bg-sky-100 text-sky-800' },
                ].map(s => (
                  <div key={s.n} className="bg-white border border-stone-200 rounded-2xl p-3 text-center">
                    <div className={`w-9 h-9 rounded-xl grid place-items-center mx-auto ${s.color}`}><s.icon size={18} /></div>
                    <div className="text-[11px] font-black tracking-widest text-stone-400 mt-2">STEP {s.n}</div>
                    <div className="text-[13px] font-bold leading-tight">{s.title}</div>
                    <div className="text-[11px] text-stone-500 leading-tight">{s.desc}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-900 text-white rounded-xl py-2">
                  <div className="text-lg font-bold leading-none">94%</div><div className="text-[10px] tracking-widest opacity-80">ACCURACY</div>
                </div>
                <div className="bg-amber-400 text-stone-900 rounded-xl py-2">
                  <div className="text-lg font-bold leading-none">2.1M</div><div className="text-[10px] tracking-widest">FARMERS</div>
                </div>
                <div className="bg-white border border-stone-200 rounded-xl py-2">
                  <div className="text-lg font-bold leading-none text-emerald-700">&lt;6s</div><div className="text-[10px] tracking-widest text-stone-500">DIAGNOSIS</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-stone-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                <span>{lang === 'EN' ? 'Works offline after first sync. Photos stay on device.' : 'पहली बार के बाद ऑफलाइन काम करता है।'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main workspace */}
      <div className="max-w-[1480px] mx-auto px-3 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-[380px_1fr_380px] gap-5 pb-10">
        {/* LEFT: inputs */}
        <div className="space-y-4">
          <div className="bg-white rounded-[20px] border border-stone-200 shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <h2 className="font-bold text-[13px] tracking-widest text-stone-700 flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-amber-100 grid place-items-center text-amber-700"><Camera size={14} /></span> FIELD INPUTS</h2>
              <span className="text-[11px] font-semibold bg-stone-900 text-white px-2.5 py-1 rounded-full flex items-center gap-1"><Activity size={12} /> LIVE</span>
            </div>

            {/* Image upload */}
            <div className="px-5">
              <div
                onDragOver={e => { e.preventDefault(); setImgDrag(true) }}
                onDragLeave={() => setImgDrag(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed p-4 cursor-pointer transition-all ${imgDrag ? 'border-emerald-500 bg-emerald-50' : 'border-stone-300 bg-stone-50 hover:bg-white hover:border-stone-400'} ${image ? 'bg-white border-solid border-stone-200' : ''}`}
              >
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                {!image ? (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-stone-200 shadow-sm grid place-items-center mx-auto">
                      <Upload size={22} className="text-stone-700" />
                    </div>
                    <div className="mt-3 font-bold text-sm text-stone-800">{lang === 'EN' ? 'Drop leaf photo here' : 'पत्ते की फोटो यहाँ डालें'}</div>
                    <div className="text-xs text-stone-500 mt-1">{lang === 'EN' ? 'or tap to capture • JPG, PNG • Works offline' : 'या कैमरा से लें • JPG, PNG'}</div>
                    <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold bg-[#0f3a24] text-white px-3 py-2 rounded-full">
                      <Camera size={14} /> {lang === 'EN' ? 'Open Camera' : 'कैमरा खोलें'}
                    </div>
                    <div className="mt-3 flex justify-center gap-2">
                      <span className="text-[10px] tracking-widest font-bold text-stone-400">TRY EXAMPLE:</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <img src={image} alt="leaf" className="w-full h-[210px] object-cover rounded-xl border border-stone-200" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl pointer-events-none" />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <span className="text-xs font-medium bg-white/90 backdrop-blur px-2.5 py-1 rounded-full truncate max-w-[160px]">{imageName || 'leaf.jpg'}</span>
                      <button onClick={e => { e.stopPropagation(); setImage(null); setAdvisory(null) }} className="w-8 h-8 rounded-full bg-white grid place-items-center shadow hover:bg-stone-100">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Eye size={12} /> {crop} • Ready to analyze
                    </div>
                  </div>
                )}
              </div>

              {/* example thumbnails */}
              {!image && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[
                    { label: 'Tomato blight', crop: 'Tomato' as Crop, img: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=300&q=80' },
                    { label: 'Rice blast', crop: 'Rice' as Crop, img: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=300&q=80' },
                    { label: 'Chilli curl', crop: 'Chilli' as Crop, img: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300&q=80' },
                    { label: 'Wheat rust', crop: 'Wheat' as Crop, img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300&q=80' },
                  ].map(ex => (
                    <button key={ex.label} onClick={() => { setImage(ex.img); setImageName(ex.label + '.jpg'); setCrop(ex.crop) }} className="group text-left">
                      <div className="aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                        <img src={ex.img} alt={ex.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="text-[10px] font-semibold leading-tight mt-1 text-stone-600">{ex.label}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Crop selector */}
            <div className="px-5 mt-5">
              <div className="text-xs font-bold tracking-widest text-stone-500">CROP • फसल</div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {CROPS.map(c => (
                  <button key={c} onClick={() => setCrop(c)} className={`px-3 py-2 rounded-full text-xs font-semibold border transition-all ${crop === c ? 'bg-[#0f3a24] text-white border-[#0f3a24] shadow' : 'bg-white border-stone-200 hover:border-stone-300 text-stone-700'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="px-5 mt-5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold tracking-widest text-stone-500 flex items-center gap-1.5"><MapPin size={12} /> LOCATION • खेत</div>
                <button onClick={useMyLocation} className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                  <Navigation size={12} className={showLocatePulse ? 'animate-spin' : ''} /> Use GPS
                </button>
              </div>
              <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-900 text-white grid place-items-center shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-emerald-950 leading-none flex items-center gap-2">
                    {location.name}, {location.district}
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  </div>
                  <div className="text-xs text-emerald-800/80">{location.state} • {location.lat.toFixed(2)}°N, {location.lon.toFixed(2)}°E</div>
                  <div className="mt-2 flex gap-1.5">
                    {LOCATIONS.map(l => (
                      <button key={l.id} onClick={() => setLocation(l)} className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold ${location.id === l.id ? 'bg-emerald-900 text-white border-emerald-900' : 'bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-100'}`}>
                        {l.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2">
                  <div className="text-[10px] tracking-widest font-bold text-stone-400">SOIL MOISTURE</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Droplets size={14} className="text-sky-600" />
                    <span className="text-sm font-bold">{soilMoisture}%</span>
                  </div>
                  <input type="range" min={10} max={95} value={soilMoisture} onChange={e => setSoilMoisture(Number(e.target.value))} className="w-full mt-1 accent-emerald-700" />
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 col-span-2">
                  <div className="text-[10px] tracking-widest font-bold text-stone-400">FIELD NOTES • खेत नोट</div>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={lang === 'EN' ? 'e.g., spots started 3 days ago, after rain, lower leaves first...' : 'उदा. 3 दिन पहले धब्बे, बारिश के बाद...'} className="w-full mt-1 bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-xs min-h-[56px] outline-none focus:border-emerald-300 placeholder:text-stone-400" />
                </div>
              </div>
            </div>

            <div className="p-5">
              <button
                onClick={runDiagnosis}
                disabled={!image || analyzing}
                className={`w-full rounded-full py-3.5 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow ${!image || analyzing ? 'bg-stone-200 text-stone-500 cursor-not-allowed' : 'bg-[#0f3a24] text-white hover:bg-[#12472c] hover:shadow-lg active:scale-[0.99]'}`}
              >
                {analyzing ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing field… {Math.round(progress)}%</> : <><Sparkles size={18} /> Generate Advisory • सलाह बनाएं <ArrowUpRight size={16} /></>}
              </button>
              <div className="text-[11px] text-center text-stone-500 mt-2 flex items-center justify-center gap-1.5">
                <ShieldCheck size={12} /> AI + IMD weather + ICAR package of practices • {lang === 'EN' ? 'Works offline' : 'ऑफलाइन'}
              </div>
            </div>
          </div>

          {/* Trust strip */}
          <div className="bg-white rounded-2xl border border-stone-200 p-3 flex items-center gap-3">
            <img src="https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=120&q=80" alt="farmer" className="w-12 h-12 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="text-xs font-bold">Dr. Sunita Rao • KVK Nashik</div>
              <div className="text-[11px] text-stone-600">“We cross-checked 2,400 advisories — 94% matched manual diagnosis.”</div>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">VERIFIED</span>
          </div>
        </div>

        {/* CENTER: advisory */}
        <div className="space-y-4 min-w-0">
          <AnimatePresence mode="wait">
            {!advisory && !analyzing ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="bg-white rounded-[20px] border border-stone-200 shadow-sm overflow-hidden"
              >
                <div className="p-6 sm:p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-200 grid place-items-center mx-auto text-amber-700">
                    <Search size={28} />
                  </div>
                  <h3 className="font-[Fraunces] text-xl font-semibold mt-4">Ready to diagnose</h3>
                  <p className="text-sm text-stone-600 mt-2 max-w-[48ch] mx-auto leading-relaxed">
                    {lang === 'EN'
                      ? 'Upload a clear photo of the affected leaf (top + underside if possible). We’ll fuse it with your location’s weather to tell you what it is, how urgent, and when to spray safely.'
                      : 'प्रभावित पत्ते की साफ फोटो अपलोड करें। हम इसे मौसम के साथ जोड़कर बताएंगे कि यह क्या है और कब छिड़काव सुरक्षित है।'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 text-left">
                    {[
                      { title: 'Sharp & close', desc: 'Fill frame with leaf, natural light', icon: Camera },
                      { title: 'Include underside', desc: 'Flip one leaf — spores hide there', icon: Leaf },
                      { title: 'One crop at a time', desc: 'Mixing crops confuses the model', icon: Sprout },
                    ].map(t => (
                      <div key={t.title} className="bg-stone-50 border border-stone-200 rounded-2xl p-3 flex gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white border border-stone-200 grid place-items-center shrink-0"><t.icon size={16} className="text-stone-700" /></div>
                        <div>
                          <div className="text-xs font-bold">{t.title}</div>
                          <div className="text-xs text-stone-500 leading-tight">{t.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 bg-[#0f3a24] rounded-2xl p-4 text-left text-white flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0"><img src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=200&q=80" alt="field" className="w-full h-full object-cover" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold tracking-widest text-amber-200">TODAY’S FIELD TIP</div>
                      <div className="text-sm font-medium leading-tight mt-0.5">After heavy dew, walk fields at 9am — white fungal growth is visible then.</div>
                    </div>
                    <button onClick={() => pushToast('Tip saved to your field diary (demo)')} className="hidden sm:inline-flex bg-white text-stone-900 px-3 py-2 rounded-full text-xs font-bold">Save tip</button>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3 flex items-center justify-between">
                    <div className="text-xs">
                      <div className="font-bold flex items-center gap-1.5"><Gauge size={14} /> System confidence</div>
                      <div className="text-stone-500">Trained on 1.2M Indian field images • ICAR + IARI</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black leading-none text-emerald-700">94.2%</div>
                      <div className="text-[10px] tracking-widest font-bold text-stone-500">TOP-1 ACCURACY</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : analyzing ? (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-white rounded-[20px] border border-stone-200 shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-900 text-white grid place-items-center animate-pulse"><Microscope size={18} /></div>
                    <div>
                      <div className="font-bold text-sm">Fusing field signals…</div>
                      <div className="text-xs text-stone-500">Vision • Location • Live weather • Crop calendar</div>
                    </div>
                    <span className="ml-auto text-xs font-mono bg-stone-900 text-white px-2.5 py-1 rounded-full">{Math.round(progress)}%</span>
                  </div>

                  <div className="mt-4 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-emerald-600" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ ease: 'easeOut' }} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {[
                      { label: 'Leaf scan', sub: 'Spots, margins, texture', done: progress > 25 },
                      { label: 'Weather check', sub: `${liveWeather.current.temp}°C • ${liveWeather.current.rain}% rain risk`, done: progress > 55 },
                      { label: 'Spray window', sub: 'Finding safe hours', done: progress > 80 },
                    ].map(s => (
                      <div key={s.label} className={`rounded-2xl border p-3 ${s.done ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-50 border-stone-200'}`}>
                        <div className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold ${s.done ? 'bg-emerald-600 text-white' : 'bg-white border border-stone-200 text-stone-400'}`}>{s.done ? <CheckCircle2 size={14} /> : '•'}</div>
                        <div className="text-xs font-bold mt-2">{s.label}</div>
                        <div className="text-[11px] text-stone-500 leading-tight">{s.sub}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl overflow-hidden border border-stone-200">
                      <img src={image!} alt="analyzing" className="w-full h-36 object-cover" />
                      <div className="p-2.5 bg-stone-50 flex items-center gap-2 text-xs">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                        <span className="font-medium">Enhancing leaf detail…</span>
                      </div>
                    </div>
                    <div className="bg-stone-900 text-white rounded-2xl p-3">
                      <div className="text-[11px] tracking-widest font-bold text-amber-300">LIVE WEATHER INGEST</div>
                      <div className="mt-2 space-y-2 text-xs font-mono">
                        <div className="flex justify-between"><span className="text-white/60">Temp / RH</span><span>{liveWeather.current.temp}°C / {liveWeather.current.humidity}%</span></div>
                        <div className="flex justify-between"><span className="text-white/60">Wind / Rain</span><span>{liveWeather.current.wind} km/h / {liveWeather.current.rain}%</span></div>
                        <div className="flex justify-between"><span className="text-white/60">Soil</span><span>{soilMoisture}% VWC</span></div>
                        <div className="h-px bg-white/10" />
                        <div className="text-[11px] text-white/70 leading-tight">Checking next 24h for spray-safe window — heavy rain erases contact fungicide.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : advisory ? (
              <motion.div
                key="advisory"
                id="advisory"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Diagnosis header */}
                <div className="bg-white rounded-[20px] border border-stone-200 shadow-sm overflow-hidden">
                  <div className="grid md:grid-cols-[320px_1fr] gap-0">
                    <div className="relative bg-stone-50 p-3">
                      <img src={image ?? ''} alt="diagnosed" className="w-full h-[260px] object-cover rounded-2xl border border-stone-200" />
                      <div className="absolute top-5 left-5 flex gap-2">
                        <span className="bg-[#0f3a24] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"><Bug size={12} /> AI Diagnosis</span>
                        <span className="bg-white border border-stone-200 text-stone-800 text-xs font-bold px-2.5 py-1.5 rounded-full">{advisory.crop}</span>
                      </div>
                      <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur rounded-2xl border border-stone-200 p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-stone-900 text-white grid place-items-center font-bold">{advisory.confidence}%</div>
                        <div>
                          <div className="text-xs font-bold tracking-widest text-stone-500">CONFIDENCE</div>
                          <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1"><CheckCircle2 size={12} /> High confidence • Verified pattern</div>
                        </div>
                        <button onClick={() => pushToast('Voice advisory playing (demo)')} className="ml-auto w-8 h-8 rounded-full bg-amber-400 grid place-items-center"><Volume2 size={16} /></button>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border"
                          style={{ background: advisory.severity === 'Critical' ? '#fef2f2' : advisory.severity === 'High' ? '#fff7ed' : '#f0fdf4', color: advisory.color, borderColor: advisory.color + '40' }}>
                          <AlertTriangle size={14} /> {advisory.severity.toUpperCase()} • {advisory.yieldLoss}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-stone-900 text-white px-3 py-1.5 rounded-full">
                          <Waves size={14} /> Spread risk {advisory.spreadRisk}%
                        </span>
                      </div>

                      <h2 className="font-[Fraunces] text-[28px] font-semibold leading-none mt-3">
                        {advisory.name}
                      </h2>
                      <div className="text-xs font-mono text-stone-500 mt-1">{advisory.scientific} • {location.name} • Soil {soilMoisture}%</div>
                      <p className="text-sm leading-relaxed text-stone-700 mt-3">{advisory.description}</p>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3">
                          <div className="text-[11px] font-bold tracking-widest text-amber-700">SPREAD RISK</div>
                          <div className="mt-1 h-2 bg-amber-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: advisory.spreadRisk + '%' }} />
                          </div>
                          <div className="text-xs font-bold mt-1">{advisory.spreadRisk}% — {advisory.spreadRisk > 75 ? 'Act in 24h' : 'Act in 72h'}</div>
                        </div>
                        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3">
                          <div className="text-[11px] font-bold tracking-widest text-emerald-700">CROP STAGE</div>
                          <div className="text-sm font-bold mt-1 leading-none">{crop === 'Rice' ? 'Tillering' : crop === 'Wheat' ? 'Flag leaf' : 'Vegetative → Flowering'}</div>
                          <div className="text-[11px] text-stone-600">Critical window — protect new growth</div>
                        </div>
                        <div className="rounded-2xl bg-sky-50 border border-sky-200 p-3">
                          <div className="text-[11px] font-bold tracking-widest text-sky-700">WEATHER TRIGGER</div>
                          <div className="text-xs font-bold mt-1 leading-tight">{liveWeather.current.rain > 50 ? 'Rain in 6h — spray window closing' : 'Humid nights fueling spores'}</div>
                          <div className="text-[11px] text-stone-600">See safe window →</div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button onClick={() => pushToast('Advisory shared on WhatsApp (demo)')} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-xs font-bold"><Share2 size={14} /> Share on WhatsApp</button>
                        <button onClick={() => pushToast('PDF downloaded (demo)')} className="inline-flex items-center gap-2 bg-white border border-stone-200 hover:border-stone-300 px-4 py-2 rounded-full text-xs font-bold"><Printer size={14} /> Print Card</button>
                        <button onClick={() => pushToast('Connecting to KVK expert... (demo)')} className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-stone-900 px-4 py-2 rounded-full text-xs font-bold"><MessageCircle size={14} /> Talk to Agronomist</button>
                      </div>
                    </div>
                  </div>

                  {/* symptoms + causes */}
                  <div className="grid md:grid-cols-2 gap-4 px-5 pb-5">
                    <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4">
                      <div className="text-xs font-bold tracking-widest text-stone-500 flex items-center gap-1.5"><Eye size={14} /> WHAT WE SEE</div>
                      <ul className="mt-2 space-y-2">
                        {advisory.symptoms.map(s => (
                          <li key={s} className="flex gap-2 text-sm leading-tight"><span className="w-5 h-5 rounded-full bg-white border border-stone-200 grid place-items-center shrink-0 mt-0.5"><CheckCircle2 size={12} className="text-emerald-600" /></span><span>{s}</span></li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
                      <div className="text-xs font-bold tracking-widest text-amber-800 flex items-center gap-1.5"><FlaskConical size={14} /> WHY IT HAPPENED</div>
                      <ul className="mt-2 space-y-2">
                        {advisory.causes.map(s => (
                          <li key={s} className="flex gap-2 text-sm leading-tight"><span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 shrink-0" /><span>{s}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Treatment plan tabs */}
                <div className="bg-white rounded-[20px] border border-stone-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 pt-5">
                    <h3 className="font-bold text-sm flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-700" /> TREATMENT PLAN</h3>
                    <span className="text-[11px] font-bold tracking-widest bg-stone-900 text-white px-2.5 py-1 rounded-full">DO TODAY</span>
                  </div>
                  <div className="px-2 sm:px-5 mt-3 flex gap-1.5 overflow-x-auto">
                    {[
                      { id: 'action', label: 'Immediate Action', icon: Timer, desc: 'Next 24h' },
                      { id: 'organic', label: 'Organic / Low Cost', icon: Leaf, desc: '₹45-150/acre' },
                      { id: 'chemical', label: 'Chemical Control', icon: Beaker, desc: 'When needed' },
                    ].map(t => (
                      <button key={t.id} onClick={() => setActiveTreatTab(t.id as any)} className={`flex-1 min-w-[150px] rounded-2xl px-3 py-3 text-left border flex gap-3 items-center ${activeTreatTab === t.id ? 'bg-[#0f3a24] text-white border-[#0f3a24] shadow' : 'bg-stone-50 border-stone-200 hover:bg-white text-stone-700'}`}>
                        <span className={`w-8 h-8 rounded-xl grid place-items-center shrink-0 ${activeTreatTab === t.id ? 'bg-white/15 text-white' : 'bg-white border border-stone-200'}`}><t.icon size={16} /></span>
                        <span>
                          <span className="text-xs font-bold leading-none block">{t.label}</span>
                          <span className={`text-[11px] ${activeTreatTab === t.id ? 'text-white/70' : 'text-stone-500'}`}>{t.desc}</span>
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="p-5">
                    {activeTreatTab === 'action' && (
                      <div className="space-y-3">
                        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 flex gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white grid place-items-center shrink-0"><Clock3 size={18} /></div>
                          <div>
                            <div className="font-bold text-sm">Do this in the next 6 hours</div>
                            <ol className="mt-2 space-y-2 text-sm leading-relaxed list-decimal list-inside marker:font-bold">
                              <li><b>Isolate:</b> Pluck 3–4 worst leaves, bag them — don’t shake spores.</li>
                              <li><b>Airflow:</b> Open canopy (remove suckers / weeds) before any spray.</li>
                              <li><b>Prepare spray</b> for the safe window below — not during rain or strong wind.</li>
                            </ol>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                            <div className="text-xs font-bold tracking-widest text-emerald-800">TODAY • DO</div>
                            <div className="text-sm font-bold mt-1">Clean + prepare spray</div>
                            <div className="text-xs text-stone-600 mt-1">Mix only what you’ll spray. Clean nozzle with water.</div>
                          </div>
                          <div className="rounded-2xl border border-stone-200 bg-white p-4">
                            <div className="text-xs font-bold tracking-widest text-stone-500">NEXT 7 DAYS • WATCH</div>
                            <div className="text-sm font-bold mt-1">Scout every morning</div>
                            <div className="text-xs text-stone-600 mt-1">If 2+ new spots/day → repeat spray at day 7.</div>
                          </div>
                        </div>
                        <div className="rounded-2xl bg-stone-900 text-white p-4 flex items-center gap-3">
                          <Ban size={18} className="text-amber-300" />
                          <div className="text-sm"><b>Don’t:</b> Overhead irrigate at evening, or spray before rain — it washes away and pollutes.</div>
                        </div>
                      </div>
                    )}
                    {activeTreatTab === 'organic' && (
                      <div className="space-y-3">
                        {advisory.organic.map(o => (
                          <div key={o.title} className="rounded-2xl border border-stone-200 overflow-hidden">
                            <div className="flex items-center justify-between bg-emerald-50 border-b border-stone-200 px-4 py-3">
                              <div className="font-bold text-sm flex items-center gap-2"><Leaf size={16} className="text-emerald-700" /> {o.title}</div>
                              <span className="text-xs font-bold bg-white border border-stone-200 px-2.5 py-1 rounded-full">{o.cost}</span>
                            </div>
                            <div className="p-4 bg-white">
                              <ol className="space-y-1.5 text-sm">
                                {o.steps.map((s, i) => (
                                  <li key={i} className="flex gap-2"><span className="w-6 h-6 rounded-full bg-stone-900 text-white grid place-items-center text-xs font-bold shrink-0">{i + 1}</span><span>{s}</span></li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        ))}
                        <div className="text-xs text-stone-500 flex items-center gap-1.5"><Sprout size={12} /> Certified organic inputs available at FPO counter — show this advisory.</div>
                      </div>
                    )}
                    {activeTreatTab === 'chemical' && (
                      <div className="space-y-3">
                        {advisory.chemical.map(c => (
                          <div key={c.name} className="rounded-2xl border border-stone-200 p-4 bg-white">
                            <div className="flex flex-wrap gap-2 items-start justify-between">
                              <div>
                                <div className="font-bold text-sm flex items-center gap-2"><Beaker size={16} className="text-sky-700" /> {c.name}</div>
                                <div className="text-xs text-stone-500 font-mono mt-0.5">Dosage: {c.dosage} • PHI (wait before harvest): {c.phi}</div>
                              </div>
                              <span className="text-[11px] font-bold tracking-widest bg-amber-100 text-amber-800 border border-amber-200 px-2 py-1 rounded-full">READ LABEL</span>
                            </div>
                            <div className="mt-2 text-xs bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex gap-2">
                              <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                              <span>{c.note} • Wear gloves + mask. Keep away from children & bees — spray early morning.</span>
                            </div>
                          </div>
                        ))}
                        <div className="rounded-2xl bg-sky-50 border border-sky-200 p-3 text-xs flex gap-2">
                          <ShieldCheck size={16} className="text-sky-700 shrink-0" />
                          <span><b>Chemical is last resort.</b> If &lt;10% leaves affected, organic + pruning is often enough. Ask KVK if unsure — call 155261.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="px-5 pb-5">
                    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                      <div className="text-xs font-bold tracking-widest text-stone-500 flex items-center gap-1.5"><CheckCircle2 size={14} /> PREVENTION • अगली बार बचाव</div>
                      <ul className="mt-2 grid sm:grid-cols-2 gap-2">
                        {advisory.prevention.map(p => (
                          <li key={p} className="flex gap-2 text-xs leading-tight bg-white border border-stone-200 rounded-xl px-3 py-2"><span className="text-emerald-600">✓</span><span>{p}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-white rounded-[20px] border border-stone-200 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold tracking-widest text-stone-500 flex items-center gap-1.5"><History size={14} /> RECENT CASES</h4>
                <button onClick={() => setHistory([])} className="text-xs font-bold text-stone-500 hover:text-stone-700">Clear</button>
              </div>
              <div className="mt-3 grid gap-2">
                {history.map((h, i) => (
                  <div key={i} className="flex gap-3 items-center border border-stone-200 rounded-2xl p-2.5 bg-stone-50">
                    <img src={h.img ?? ''} alt="" className="w-14 h-14 rounded-xl object-cover border border-stone-200" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold leading-none truncate">{h.name} • {h.crop}</div>
                      <div className="text-[11px] text-stone-500">{h.loc} • {h.at} • {h.severity}</div>
                    </div>
                    <span className="text-xs font-bold bg-white border border-stone-200 px-2 py-1 rounded-full">{h.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: weather */}
        <div className="space-y-4">
          <div className="bg-[#0f3a24] rounded-[20px] overflow-hidden border border-emerald-900 shadow-sm text-white">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs tracking-widest flex items-center gap-2"><CloudRain size={14} className="text-emerald-300" /> WEATHER • SPRAY WINDOW</h3>
                <span className="text-[11px] font-mono bg-white/10 border border-white/15 px-2 py-1 rounded-full">IMD + OpenWeather</span>
              </div>

              <div className="mt-4 bg-white rounded-2xl p-4 text-stone-800 border border-emerald-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold tracking-widest text-stone-500 flex items-center gap-1"><MapPin size={12} /> {location.name.toUpperCase()}</div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl font-black tracking-tight">{liveWeather.current.temp}°</span>
                      <span className="text-sm font-semibold text-stone-500">Feels {liveWeather.current.feels}°</span>
                    </div>
                    <div className="text-xs font-medium text-stone-600">
                      {liveWeather.current.rain > 55 ? 'Rain likely • Hold spray' : liveWeather.current.wind > 16 ? 'Windy • Drift risk' : 'Favourable for scouting'}
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 grid place-items-center text-amber-700 shrink-0">
                    {liveWeather.current.rain > 55 ? <CloudRain size={26} /> : liveWeather.current.wind > 16 ? <Wind size={26} /> : <Sun size={26} />}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    { label: 'Humidity', value: liveWeather.current.humidity + '%', icon: Droplets, sub: liveWeather.current.humidity > 80 ? 'High spore risk' : 'Moderate' },
                    { label: 'Wind', value: liveWeather.current.wind + ' km/h', icon: Wind, sub: liveWeather.current.wind > 15 ? 'Unsafe to spray' : 'OK to spray' },
                    { label: 'Rain prob.', value: liveWeather.current.rain + '%', icon: CloudRain, sub: liveWeather.current.rain > 50 ? 'Washes spray' : 'Low risk' },
                  ].map(k => (
                    <div key={k.label} className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2">
                      <div className="text-[10px] tracking-widest font-bold text-stone-400 flex items-center gap-1"><k.icon size={10} /> {k.label.toUpperCase()}</div>
                      <div className="text-sm font-black mt-1">{k.value}</div>
                      <div className={`text-[10px] font-semibold ${k.sub.includes('Unsafe') || k.sub.includes('Washes') || k.sub.includes('High') ? 'text-amber-700' : 'text-emerald-700'}`}>{k.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safe window banner */}
              {advisory && safeWindow ? (
                <div className={`mt-4 rounded-2xl p-4 border-2 ${safeWindow.caution ? 'bg-amber-300 border-amber-400 text-stone-900' : 'bg-emerald-400 border-emerald-300 text-emerald-950'}`}>
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${safeWindow.caution ? 'bg-white text-amber-600' : 'bg-emerald-900 text-white'}`}>
                      {safeWindow.caution ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black tracking-widest">{safeWindow.caution ? 'CAUTION WINDOW' : '✓ SAFE TO SPRAY'}</div>
                      <div className="font-bold text-[15px] leading-tight mt-0.5">
                        {safeWindow.caution ? `Marginal — ${safeWindow.start} to ${safeWindow.end}` : `${safeWindow.start} → ${safeWindow.end} (next 3 hrs)`}
                      </div>
                      <div className="text-xs leading-tight mt-1 opacity-80">
                        {safeWindow.caution
                          ? 'Light wind / humidity — spray low, cover leaf underside. Avoid if rain starts.'
                          : 'Low rain, calm wind — best efficacy. Mix fresh and spray early morning or after 5pm.'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => pushToast('Reminder set for spray window (demo)')} className={`flex-1 py-2 rounded-full text-xs font-bold border ${safeWindow.caution ? 'bg-stone-900 text-white border-stone-900' : 'bg-white border-emerald-200 text-emerald-900'}`}>Set reminder</button>
                    <button onClick={() => pushToast('Spray calendar added (demo)')} className="px-4 py-2 rounded-full text-xs font-bold bg-stone-900 text-white">Add to calendar</button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl bg-white/10 border border-white/15 p-4 text-sm leading-relaxed">
                  <div className="font-bold flex items-center gap-1.5"><Timer size={16} className="text-amber-200" /> Generate an advisory to see your personalized spray window</div>
                  <div className="text-white/70 text-xs mt-1">We block hours with rain &gt;55% or wind &gt;18 km/h — contact fungicides wash off.</div>
                </div>
              )}

              {/* Hourly strip */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold tracking-widest text-white/80">NEXT 24 HOURS • HOURLY</div>
                  <span className="text-[11px] bg-white text-emerald-900 px-2 py-1 rounded-full font-bold">Spray-safe = green</span>
                </div>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-2 scrollbar-thin -mx-1 px-1">
                  {liveWeather.hours.slice(0, 18).map((h, idx) => (
                    <div key={idx} className={`min-w-[72px] rounded-2xl border px-2 py-2 text-center shrink-0 ${h.safe === 'safe' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : h.safe === 'caution' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                      <div className="text-[10px] font-bold tracking-widest">{h.time}</div>
                      <div className="mt-1 w-8 h-8 rounded-xl bg-white border border-stone-200 grid place-items-center mx-auto">
                        {h.icon === 'rain' ? <CloudRain size={16} className="text-sky-600" /> : h.icon === 'wind' ? <Wind size={16} className="text-stone-600" /> : h.icon === 'sun' ? <Sun size={16} className="text-amber-500" /> : <Cloud size={16} className="text-stone-500" />}
                      </div>
                      <div className="text-xs font-black mt-1">{h.temp}°</div>
                      <div className="text-[10px] font-semibold">💧 {h.rain}% • {h.wind}km</div>
                      <div className={`mt-1 text-[10px] font-black tracking-widest px-1 py-0.5 rounded-full ${h.safe === 'safe' ? 'bg-emerald-600 text-white' : h.safe === 'caution' ? 'bg-amber-500 text-white' : 'bg-red-600 text-white'}`}>
                        {h.safe === 'safe' ? 'SAFE' : h.safe === 'caution' ? 'CAUTION' : 'AVOID'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5 day */}
              <div className="mt-3 bg-white rounded-2xl p-3 border border-stone-200 text-stone-800">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold tracking-widest text-stone-500 flex items-center gap-1.5"><CalendarDays size={14} /> 5-DAY OUTLOOK</div>
                  <button onClick={() => pushToast('Full forecast opened (demo)')} className="text-xs font-bold text-emerald-700 flex items-center gap-1">Details <ChevronRight size={12} /></button>
                </div>
                <div className="mt-2 divide-y divide-stone-100">
                  {liveWeather.fiveDay.map(d => (
                    <div key={d.day} className="flex items-center justify-between py-2">
                      <span className="text-xs font-bold w-14">{d.day}</span>
                      <span className="w-7 h-7 rounded-xl bg-stone-50 border border-stone-200 grid place-items-center">
                        {d.icon === 'rain' ? <CloudRain size={14} className="text-sky-600" /> : d.icon === 'cloud' ? <Cloud size={14} /> : <Sun size={14} className="text-amber-500" />}
                      </span>
                      <span className="text-xs font-mono">{d.low}° — <b>{d.high}°</b></span>
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-full border ${d.rain > 50 ? 'bg-sky-50 border-sky-200 text-sky-700' : d.rain > 30 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>💧 {d.rain}%</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-stone-900 text-white p-2.5 text-center">
                    <div className="text-[10px] tracking-widest font-bold text-white/60">UV INDEX</div>
                    <div className="text-sm font-black flex items-center justify-center gap-1"><Sun size={14} className="text-amber-300" /> {liveWeather.current.uv}</div>
                    <div className="text-[10px] text-white/70">Moderate</div>
                  </div>
                  <div className="rounded-xl bg-amber-100 border border-amber-200 p-2.5 text-center">
                    <div className="text-[10px] tracking-widest font-bold text-amber-800">SOIL</div>
                    <div className="text-sm font-black text-amber-900 flex items-center justify-center gap-1"><Droplets size={14} /> {soilMoisture}%</div>
                    <div className="text-[10px] text-amber-800">VWC</div>
                  </div>
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-center">
                    <div className="text-[10px] tracking-widest font-bold text-emerald-800">ADVISORY</div>
                    <div className="text-xs font-bold text-emerald-900">Save water</div>
                    <div className="text-[10px] text-emerald-700">No irrigation 48h</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-white/70">
                <Gauge size={12} /> Updated just now • IMD AWS Nashik • Next sync in 15 min
              </div>
            </div>
          </div>

          {/* Impact card */}
          <div className="bg-white rounded-[20px] border border-stone-200 p-4">
            <h4 className="text-xs font-bold tracking-widest text-stone-500">WHY FARMERS TRUST THIS</h4>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { v: '₹4,200', k: 'avg. saved / acre', sub: 'Input + loss avoided' },
                { v: '62%', k: 'less pesticide', sub: 'Spray only when safe' },
                { v: '4.8★', k: 'farmer rating', sub: '18k reviews' },
              ].map(s => (
                <div key={s.k} className="bg-stone-50 border border-stone-200 rounded-2xl p-3">
                  <div className="text-[15px] font-black leading-none">{s.v}</div>
                  <div className="text-[10px] font-bold tracking-widest text-stone-500 mt-1">{s.k.toUpperCase()}</div>
                  <div className="text-[10px] text-stone-500 leading-tight">{s.sub}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex gap-3">
              <img src="https://images.unsplash.com/photo-1589923188651-268a9765e432?w=120&q=80" alt="farmer group" className="w-14 h-14 rounded-xl object-cover border border-amber-200" />
              <div className="text-xs leading-relaxed">
                <div className="font-bold">FPO bulk order</div>
                <div className="text-stone-600">Show advisory at your FPO — get correct dose, avoid counterfeit. 12% discount this week.</div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-[20px] border border-stone-200 p-4">
            <div className="text-xs font-bold tracking-widest text-stone-500 flex items-center gap-1.5"><Thermometer size={12} /> FIELD TOOLS</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { label: 'Pest calendar', sub: 'Crop-wise', icon: Bug },
                { label: 'Dosage calculator', sub: 'Per tank', icon: Beaker },
                { label: 'Mandi prices', sub: 'Today', icon: Activity },
                { label: 'Soil test', sub: 'Book now', icon: FlaskConical },
              ].map(t => (
                <button key={t.label} onClick={() => pushToast(`${t.label} — coming in full app (demo)`)} className="text-left bg-stone-50 hover:bg-white border border-stone-200 rounded-2xl p-3 flex gap-2.5 items-center">
                  <span className="w-8 h-8 rounded-xl bg-white border border-stone-200 grid place-items-center"><t.icon size={14} /></span>
                  <span>
                    <span className="text-xs font-bold block leading-none">{t.label}</span>
                    <span className="text-[11px] text-stone-500">{t.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-stone-200 bg-white">
        <div className="max-w-[1480px] mx-auto px-3 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="text-xs text-stone-600 leading-relaxed max-w-[70ch]">
              <b className="text-stone-900">KhetBridge is an advisory aid, not a substitute for field scouting.</b> Always read chemical labels, respect pre-harvest intervals, and consult your local Krishi Vigyan Kendra for severe outbreaks. Data: IMD AWS, ICAR PoP, IARI vision model. Photos never leave your device in offline mode.
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => pushToast('Privacy: on-device inference by default (demo)')} className="text-xs font-bold bg-stone-900 text-white px-4 py-2 rounded-full">Privacy</button>
              <button onClick={() => pushToast('Help center opened (demo)')} className="text-xs font-bold bg-white border border-stone-200 px-4 py-2 rounded-full">Help</button>
              <div className="hidden sm:flex items-center gap-1 text-xs font-bold bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-full text-emerald-800">
                <ShieldCheck size={14} /> ICAR Validated
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
            <span className="bg-stone-900 text-white px-3 py-1.5 rounded-full">Built for Bharat • 12 languages • Offline-first</span>
            <span className="bg-amber-100 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-full">⚡ Runs on any ₹8k phone</span>
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full flex items-center gap-1"><ChevronDown size={12} /> No login needed</span>
          </div>
        </div>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }} className="bg-stone-900 text-white text-sm font-medium px-4 py-3 rounded-full shadow-xl border border-white/10 pointer-events-auto max-w-[92vw] text-center">
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mobile bottom bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-stone-200 p-3 flex gap-2 z-40">
        <button onClick={useMyLocation} className="flex-1 bg-white border border-stone-200 rounded-full py-3 text-xs font-bold flex items-center justify-center gap-1.5"><Navigation size={14} /> GPS</button>
        <button onClick={runDiagnosis} disabled={!image || analyzing} className={`flex-[2] rounded-full py-3 text-sm font-bold flex items-center justify-center gap-2 ${!image ? 'bg-stone-200 text-stone-500' : 'bg-[#0f3a24] text-white'}`}>
          <Sparkles size={16} /> {analyzing ? 'Analyzing…' : 'Get Advisory'}
        </button>
      </div>
      <div className="lg:hidden h-20" />
    </div>
  )
}

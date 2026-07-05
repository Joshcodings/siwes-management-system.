/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from "jspdf";
import {
  LayoutDashboard,
  BookOpen,
  MapPin,
  Building2,
  Users,
  ClipboardCheck,
  LogOut,
  UserCircle,
  Plus,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Search,
  Map as MapIcon,
  GraduationCap,
  Mail,
  Bell,
  Award,
  Camera,
  X,
  Menu,
  Navigation,
  Sparkles,
  FileText,
  Moon,
  Sun,
  Cpu,
  Database,
  Shield,
  Wifi,
  Target,
  Star,
  BarChart2,
  Calendar,
  Clock,
  Zap,
  ArrowRight,
  Eye,
  EyeOff,
  ChevronRight,
  Activity,
  Settings,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast, { Toaster } from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- DARK MODE CONTEXT ---
const DarkModeContext = React.createContext<{ dark: boolean; toggle: () => void }>({ dark: false, toggle: () => {} });

// --- COUNT UP HOOK ---
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// --- ANIMATED STAT CARD ---
const AnimatedStatCard = ({ label, value, icon: Icon, color, bg, subtitle }: {
  label: string; value: number; icon: any; color: string; bg: string; subtitle?: string;
}) => {
  const count = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
      className="bg-white p-6 rounded-[24px] border border-[#5A5A40]/10 shadow-sm transition-all cursor-default"
    >
      <div className="flex items-start justify-between mb-4">
        <div style={{ background: bg + '10', borderRadius: 14, padding: 10, border: `1px solid ${bg}20` }}>
          <Icon size={22} style={{ color }} />
        </div>
        <div className="w-2 h-2 rounded-full mt-1" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      </div>
      <p className="text-3xl font-bold tabular-nums" style={{ color: '#1A1A1A' }}>{count}</p>
      <p className="text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mt-1">{label}</p>
      {subtitle && <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>}
    </motion.div>
  );
};

// --- LOADING SCREEN ---
const LoadingScreen = ({ onDone }: { onDone: () => void }) => {
  const [step, setStep] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const steps = [
    { text: 'Initializing AI Engine...', icon: Cpu },
    { text: 'Connecting Database...', icon: Database },
    { text: 'Loading Geofence...', icon: MapPin },
    { text: 'Checking Authentication...', icon: Shield },
  ];

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i + 1), 500 + i * 500));
    });
    timers.push(setTimeout(() => setFadeOut(true), 500 + steps.length * 500 + 300));
    timers.push(setTimeout(() => onDone(), 500 + steps.length * 500 + 800));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #1a1a0e 0%, #2d2d1a 40%, #0f1a0f 100%)'
      }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, #5A5A40 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, #3a6b3a 0%, transparent 70%)' }}
        />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="flex flex-col items-center mb-12 relative z-10"
      >
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #5A5A40 0%, #8a8a60 100%)', boxShadow: '0 20px 60px rgba(90,90,64,0.5)' }}>
          <GraduationCap size={48} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-widest font-serif">SIWES</h1>
        <p className="text-[#8a8a60] text-sm tracking-[0.3em] uppercase mt-1 font-medium">AI Placement System</p>
        <p className="text-white/30 text-xs tracking-widest mt-1">Lead City University · Ibadan</p>
      </motion.div>

      {/* Steps */}
      <div className="space-y-3 relative z-10 w-full max-w-xs">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const active = step === i + 1;
          const done = step > i + 1;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: step >= i + 1 ? 1 : 0.25, x: step >= i + 1 ? 0 : -10 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: active ? 'rgba(90,90,64,0.25)' : 'transparent', border: active ? '1px solid rgba(90,90,64,0.4)' : '1px solid transparent' }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: done ? '#16a34a22' : active ? '#5A5A4022' : 'transparent' }}>
                {done ? <CheckCircle2 size={16} className="text-emerald-400" /> :
                  active ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Cpu size={16} style={{ color: '#8a8a60' }} /></motion.div> :
                  <Icon size={16} className="text-white/30" />}
              </div>
              <span className={`text-sm font-medium ${
                done ? 'text-emerald-400' : active ? 'text-white' : 'text-white/30'
              }`}>{s.text}</span>
              {done && <CheckCircle2 size={14} className="text-emerald-400 ml-auto" />}
              {active && (
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="ml-auto flex gap-1"
                >
                  {[0,1,2].map(j => <div key={j} className="w-1 h-1 rounded-full bg-[#8a8a60]" />)}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <motion.div className="mt-10 w-64 h-1 bg-white/10 rounded-full overflow-hidden relative z-10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #5A5A40, #8a8a60)' }}
          initial={{ width: '0%' }}
          animate={{ width: `${(step / steps.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </motion.div>
      <p className="text-white/20 text-xs mt-3 relative z-10">Loading... {Math.round((step / steps.length) * 100)}%</p>
    </motion.div>
  );
};

// --- TYPES ---
type Role = 'STUDENT' | 'SCHOOL_SUPERVISOR' | 'ADMIN' | 'SUPER_ADMIN';

interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
}

// --- SHARED COMPONENTS ---

const StatusBadge = ({ status }: { status: string }) => {
  let colors = 'bg-gray-100 text-gray-700';
  if (status === 'VERIFIED') colors = 'bg-emerald-100 text-emerald-700';
  if (status === 'FLAGGED') colors = 'bg-red-100 text-red-700';
  if (status === 'PENDING') colors = 'bg-amber-100 text-amber-700';

  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${colors}`}>
      {status}
    </span>
  );
};

const DistanceIndicator = ({ distance, status }: { distance: number, status: string }) => {
  let colors = 'text-gray-400';
  if (status === 'VERIFIED') colors = 'text-emerald-600';
  if (status === 'FLAGGED') colors = 'text-red-500';

  return (
    <span className={`text-[10px] flex items-center gap-1 font-medium ${colors}`}>
      <MapPin size={10} /> {Math.round(distance)}m from site
    </span>
  );
};

const LiveLocationPulse = () => (
  <span className="relative flex h-3 w-3">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
  </span>
);

const GeofenceRadar = ({ distance, isVerified }: { distance: number; isVerified: boolean }) => {
  const radius = 200; // 200m allowed radius
  const scale = Math.max(0.1, Math.min(1, 150 / (distance + 50)));
  const percentage = Math.min(100, (distance / radius) * 100);

  return (
    <div className="relative w-48 h-48 flex items-center justify-center bg-[#5A5A40]/5 rounded-full overflow-hidden border border-[#5A5A40]/10">
      {/* Radar rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-40 h-40 border border-[#5A5A40]/20 rounded-full" />
        <div className="w-24 h-24 border border-[#5A5A40]/20 rounded-full" />
        <div className="w-8 h-8 border border-[#5A5A40]/20 rounded-full" />
      </div>

      {/* Sweep animation */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#5A5A40]/20 origin-center"
      />

      {/* Connection line */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <line
          x1="50%" y1="50%"
          x2="50%" y2="20%"
          stroke={isVerified ? "#10B981" : "#EF4444"}
          strokeWidth="2"
          strokeDasharray="4 2"
          className="origin-center"
          style={{ transformOrigin: 'center' }}
        />
      </svg>

      {/* Central User marker */}
      <div className="relative z-10 p-2 bg-white rounded-full shadow-lg border border-black/5">
        <MapPin size={20} className={isVerified ? "text-emerald-500" : "text-amber-500"} />
      </div>

      {/* Label */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className={`text-[10px] font-bold uppercase tracking-tight ${isVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
          {isVerified ? 'Within Site' : 'Outside Geofence'}
        </p>
        <p className="text-[12px] font-medium text-gray-500">{Math.round(distance)}m away</p>
      </div>
    </div>
  );
};


// --- COMPONENTS ---

const LogbookComment = ({ log, onSave }: { log: any, onSave: (id: number, comment: string) => void }) => {
  const [isEditing, setIsEditing] = useState(!log.supervisor_comment);
  const [comment, setComment] = useState(log.supervisor_comment || '');

  const handleSave = () => {
    onSave(log.id, comment);
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-xs font-bold uppercase text-gray-400">Supervisor Comment</label>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="text-xs text-blue-500 hover:underline">Edit</button>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add feedback for this entry..."
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            {log.supervisor_comment && (
              <button onClick={() => { setComment(log.supervisor_comment); setIsEditing(false); }} className="text-xs px-3 py-1 text-gray-500 hover:bg-gray-200 rounded">Cancel</button>
            )}
            <button onClick={handleSave} className="text-xs px-3 py-1 bg-[#5A5A40] text-white rounded hover:bg-[#4A4A30]">Save</button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-700">{log.supervisor_comment}</p>
      )}
    </div>
  );
};

const Login = ({ onLogin }: { onLogin: (user: User, token: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [matNumber, setMatNumber] = useState('');
  const [screen, setScreen] = useState<'login' | 'forgot' | 'reset'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Check for reset token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset_token');
    if (token) { setResetToken(token); setScreen('reset'); }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegistering) {
      const matRegex = /^LCU\/UG\/\d{2}\/\d+$/i;
      if (!matNumber || !matRegex.test(matNumber)) {
        toast.error('Invalid Matriculation Number. Expected format: LCU/UG/YY/NNNNN (e.g. LCU/UG/22/21549)');
        return;
      }
    }

    setLoading(true);
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const body = isRegistering ? { email, password, fullName, matNumber } : { email, password };
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    setLoading(false);
    if (data.token) {
      onLogin(data.user, data.token);
    } else if (data.success && isRegistering) {
      setIsRegistering(false);
      setMatNumber('');
      toast.success('Account created! Please sign in.');
    } else {
      toast.error(data.error || 'Something went wrong');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: resetEmail }) });
    setLoading(false);
    toast.success('If that email exists, a reset link was sent. Check your inbox!');
    setScreen('login');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: resetToken, password: newPassword }) });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      toast.success('Password reset! You can now sign in.');
      window.history.replaceState({}, '', '/');
      setScreen('login');
    } else {
      toast.error(data.error || 'Reset failed. Try requesting a new link.');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#F5F5F0] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white p-6 sm:p-10 rounded-[28px] shadow-xl w-full max-w-md mx-auto border border-black/5 relative">
        {screen === 'login' && (
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background:'linear-gradient(135deg,#5A5A40,#8a8a60)', boxShadow:'0 10px 30px rgba(90,90,64,0.3)' }}>
              <GraduationCap size={28} className="text-white" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#1A1A1A] mb-1">SIWES Portal</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{isRegistering ? 'CREATE YOUR ACCOUNT' : 'INTELLIGENT PLACEMENT SYSTEM'}</p>
          </div>
        )}

        {screen === 'forgot' && (
          <div>
            <h2 className="font-serif text-xl mb-2">Reset Password</h2>
            <p className="text-sm text-gray-500 mb-6">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input type="email" placeholder="Your email address" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]" required />
              <button type="submit" disabled={loading} className="w-full bg-[#5A5A40] text-white py-4 rounded-full font-medium hover:bg-[#4A4A30] transition-colors disabled:opacity-60">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <button onClick={() => setScreen('login')} className="mt-4 text-sm text-[#5A5A40] hover:underline w-full text-center">← Back to Sign In</button>
          </div>
        )}

        {screen === 'reset' && (
          <div>
            <h2 className="font-serif text-xl mb-2">Set New Password</h2>
            <p className="text-sm text-gray-500 mb-6">Choose a strong new password (min. 6 characters).</p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]" minLength={6} required />
              <button type="submit" disabled={loading} className="w-full bg-[#5A5A40] text-white py-4 rounded-full font-medium hover:bg-[#4A4A30] transition-colors disabled:opacity-60">
                {loading ? 'Saving...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {screen === 'login' && (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Full Name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40] transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Matriculation Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. LCU/UG/22/21549" 
                      value={matNumber} 
                      onChange={(e) => setMatNumber(e.target.value)} 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40] transition-all uppercase" 
                      required 
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40] transition-all" required />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Password</label>
                  {!isRegistering && (
                    <button type="button" onClick={() => setScreen('forgot')} className="text-xs text-[#5A5A40] hover:underline">Forgot password?</button>
                  )}
                </div>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 pr-12 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40] transition-all" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {!isRegistering && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4 accent-[#5A5A40] rounded" />
                    <span className="text-sm text-gray-500">Remember me</span>
                  </label>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit" disabled={loading}
                className="w-full bg-[#5A5A40] text-white py-4 rounded-2xl font-semibold tracking-wide hover:bg-[#4A4A30] transition-all shadow-xl shadow-[#5A5A40]/30 mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Please wait...</>
                ) : (isRegistering ? 'Create Account' : 'Sign In')}
              </motion.button>
            </form>
            <div className="mt-6 text-center">
              <button onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-[#5A5A40] font-medium hover:underline">
                {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

// --- NOTIFICATION BELL ---
const NotificationBell = ({ token }: { token: string }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = React.useRef<HTMLButtonElement>(null);

  const fetchNotifications = async () => {
    const res = await fetch('/api/notifications', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.closest('[data-notif-root]')?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      // Position dropdown to the right of the sidebar, below the button
      setPos({ top: rect.bottom + 8, left: rect.left - 320 + rect.width });
    }
    setOpen(prev => !prev);
  };

  const markAllRead = async () => {
    await fetch('/api/notifications/read', { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
  };

  const getIcon = (msg: string) => {
    if (msg.startsWith('📋') || msg.startsWith('💬')) return null;
    if (msg.includes('approved') || msg.includes('✅')) return '✅';
    if (msg.includes('rejected') || msg.includes('❌')) return '❌';
    if (msg.includes('comment') || msg.includes('💬')) return '💬';
    return '🔔';
  };

  return (
    <div className="relative" data-notif-root="true">
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="relative p-2 rounded-xl hover:bg-[#5A5A40]/10 transition-colors group"
        title="Notifications"
      >
        <Bell size={20} className={`transition-colors ${unreadCount > 0 ? 'text-[#5A5A40]' : 'text-gray-400 group-hover:text-[#5A5A40]'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{ position: 'fixed', top: pos.top, left: Math.max(8, pos.left), zIndex: 9999, width: 360 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-[#5A5A40]">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-white/80" />
              <h3 className="font-semibold text-sm text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[10px] text-white/70 hover:text-white underline underline-offset-2">
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white text-lg leading-none">✕</button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-3 text-center">
                <Bell size={32} className="text-gray-200" />
                <div>
                  <p className="text-sm font-medium text-gray-400">All caught up!</p>
                  <p className="text-xs text-gray-300 mt-0.5">No notifications yet</p>
                </div>
              </div>
            ) : (
              notifications.map((n: any) => (
                <div key={n.id} className={`px-5 py-4 flex gap-3 transition-colors hover:bg-gray-50 ${!n.is_read ? 'bg-[#5A5A40]/5' : ''}`}>
                  {/* Unread dot */}
                  <div className="flex-shrink-0 pt-0.5">
                    {!n.is_read
                      ? <div className="w-2 h-2 rounded-full bg-[#5A5A40] mt-1" />
                      : <div className="w-2 h-2 rounded-full bg-transparent mt-1" />
                    }
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed break-words ${n.is_read ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                      🕐 {new Date(n.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-[11px] text-gray-400">{notifications.length} notification{notifications.length !== 1 ? 's' : ''} total</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};




const ITF_OFFICES = [
  { state: 'Lagos', name: 'ITF Ikeja Area Office', address: '3, Gillis Harry Street, off Wole Ariyo Street, Lekki Phase 1, Lagos', email: 'ikeja-ao@itf.gov.ng', phone: '+234 1 270 4118', latitude: 6.4389, longitude: 3.4422 },
  { state: 'Lagos (Island)', name: 'ITF Lagos Island Area Office', address: '5th Floor, 26, Catholic Mission Street, Lagos Island', email: 'lagosisland-ao@itf.gov.ng', phone: '+234 1 462 2580', latitude: 6.4497, longitude: 3.3986 },
  { state: 'Lagos (Apapa)', name: 'ITF Apapa Area Office', address: '4, Point Road, Apapa, Lagos', email: 'apapa-ao@itf.gov.ng', phone: '+234 1 545 3290', latitude: 6.4431, longitude: 3.3672 },
  { state: 'Oyo', name: 'ITF Ibadan Area Office', address: 'Oyo State Secretariat Road, Agodi, Ibadan', email: 'ibadan-ao@itf.gov.ng', phone: '+234 2 810 0345', latitude: 7.4167, longitude: 3.9167 },
  { state: 'FCT - Abuja', name: 'ITF Abuja Area Office', address: 'No 6, Dar-es-Salaam Street, Wuse II, Abuja', email: 'abuja-ao@itf.gov.ng', phone: '+234 9 523 9308', latitude: 9.0765, longitude: 7.4983 },
  { state: 'Rivers', name: 'ITF Port Harcourt Area Office', address: '1, ITF Close, off Secretariat Road, Port Harcourt', email: 'portharcourt-ao@itf.gov.ng', phone: '+234 84 230 456', latitude: 4.7758, longitude: 7.0089 },
  { state: 'Kaduna', name: 'ITF Kaduna Area Office', address: '3, Kanta Road, Kaduna', email: 'kaduna-ao@itf.gov.ng', phone: '+234 62 245 678', latitude: 10.5105, longitude: 7.4165 },
  { state: 'Edo', name: 'ITF Benin Area Office', address: '122, Sapele Road, Benin City, Edo State', email: 'benin-ao@itf.gov.ng', phone: '+234 52 256 789', latitude: 6.3350, longitude: 5.6275 },
  { state: 'Enugu', name: 'ITF Enugu Area Office', address: '10, Station Road, Enugu', email: 'enugu-ao@itf.gov.ng', phone: '+234 42 255 123', latitude: 6.4402, longitude: 7.5025 },
  { state: 'Kano', name: 'ITF Kano Area Office', address: '2, Maiduguri Road, Kano', email: 'kano-ao@itf.gov.ng', phone: '+234 64 669 123', latitude: 11.9964, longitude: 8.5167 },
  { state: 'Ogun', name: 'ITF Abeokuta Area Office', address: 'Secretariat Road, Oke-Mosan, Abeokuta, Ogun State', email: 'abeokuta-ao@itf.gov.ng', phone: '+234 39 240 123', latitude: 7.1475, longitude: 3.3614 },
  { state: 'Osun', name: 'ITF Osogbo Area Office', address: 'Gbogan Road, Osogbo, Osun State', email: 'osogbo-ao@itf.gov.ng', phone: '+234 35 240 456', latitude: 7.7827, longitude: 4.5411 },
  { state: 'Kwara', name: 'ITF Ilorin Area Office', address: 'Asa Dam Road, Ilorin, Kwara State', email: 'ilorin-ao@itf.gov.ng', phone: '+234 31 221 789', latitude: 8.4799, longitude: 4.5418 }
];

const StudentDashboard = ({ user, token, onLogout }: { user: User, token: string, onLogout: () => void }) => {
  const [profile, setProfile] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [logbook, setLogbook] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [memos, setMemos] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'placement' | 'applications' | 'logbook' | 'memos' | 'profile' | 'siwes_letter' | 'itf_location'>('overview');
  const [selectedState, setSelectedState] = useState('Lagos');
  const [docSubTab, setDocSubTab] = useState<'commencement' | 'completion'>('commencement');
  const [showForm8Mockup, setShowForm8Mockup] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (profile?.location_preference) {
      const matched = ITF_OFFICES.find(o => 
        o.state.toLowerCase().includes(profile.location_preference.toLowerCase()) || 
        profile.location_preference.toLowerCase().includes(o.state.toLowerCase())
      );
      if (matched) {
        setSelectedState(matched.state);
      }
    }
  }, [profile]);

  const handleDocDownload = (docName: string) => {
    toast.success(`Generating ${docName}...`);
    
    const docTitle = docName.toUpperCase();
    const studentName = user?.fullName || 'STUDENT NAME';
    const matNo = profile?.mat_number || 'NOT ASSIGNED';
    const course = profile?.course || 'UNSPECIFIED COURSE';
    const dept = profile?.department || 'UNSPECIFIED DEPARTMENT';
    
    const assignedCompany = allCompanies?.find((c: any) => c.id === profile?.assigned_company_id);
    const companyName = assignedCompany?.name || 'NOT ASSIGNED YET';
    const companyAddress = assignedCompany?.address || 'NOT ASSIGNED YET';

    // Initialize jsPDF (A4 size, portrait)
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    // Helper function to draw borders
    const drawPageBorder = () => {
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, 190, 277); // Outer border
      doc.setLineWidth(0.2);
      doc.rect(12, 12, 186, 273); // Inner border
    };

    if (docName.includes('ITF Form 8')) {
      // --- ITF FORM 8 GENERATION ---
      drawPageBorder();
      
      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("INDUSTRIAL TRAINING FUND", 105, 25, { align: "center" });
      doc.setFontSize(12);
      doc.text("END-OF-PROGRAMME REPORT SHEET (ITF FORM 8)", 105, 33, { align: "center" });
      doc.line(15, 37, 195, 37);

      // PART A: Student
      doc.setFontSize(11);
      doc.setFillColor(230, 230, 230);
      doc.rect(15, 42, 180, 8, 'FD');
      doc.text("PART A (To be completed by the Student)", 105, 48, { align: "center" });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`1. Name in Full:  ${studentName}`, 20, 58);
      doc.text(`2. Registration/Matriculation No:  ${matNo}`, 20, 66);
      doc.text(`3. Course of Study:  ${course}`, 20, 74);
      doc.text(`4. Name of Institution:  Lead City University`, 20, 82);
      doc.text(`5. Name and Address of Company attached:`, 20, 90);
      doc.setFont("helvetica", "bold");
      doc.text(`${companyName}, ${companyAddress}`, 25, 96);
      
      doc.setFont("helvetica", "normal");
      doc.text(`6. Period of Attachment:   From: ________________ To: ________________`, 20, 106);
      doc.text(`7. Brief outline of experience/relevance of training provided:`, 20, 116);
      doc.line(20, 124, 190, 124);
      doc.line(20, 132, 190, 132);
      doc.line(20, 140, 190, 140);
      
      doc.text(`Signature of Student: _______________________    Date: _________________`, 20, 150);

      // PART B: Employer
      doc.setFont("helvetica", "bold");
      doc.setFillColor(230, 230, 230);
      doc.rect(15, 158, 180, 8, 'FD');
      doc.text("PART B (To be completed by the Employer)", 105, 164, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.text(`1. Do you agree with the student's comments?  Yes [   ]   No [   ]`, 20, 174);
      doc.text(`2. Assess the student's overall performance:`, 20, 182);
      doc.text(`   Very Good [   ]      Good [   ]      Satisfactory [   ]      Poor [   ]`, 20, 190);
      doc.text(`3. Will you accept the student in future?  Yes [   ]   No [   ]`, 20, 198);
      
      doc.text(`Name of Reporting Officer: _____________________________________`, 20, 210);
      doc.text(`Designation/Rank: _____________________________________________`, 20, 218);
      doc.text(`Signature & Official Stamp: ______________________ Date: _________`, 20, 226);

      // PART C: Institution
      doc.setFont("helvetica", "bold");
      doc.setFillColor(230, 230, 230);
      doc.rect(15, 234, 180, 8, 'FD');
      doc.text("PART C (To be completed by the Institution)", 105, 240, { align: "center" });
      
      doc.setFont("helvetica", "normal");
      doc.text(`1. Number of visits made: ________   2. Overall Grade: A [ ]  B [ ]  C [ ]  D [ ]`, 20, 250);
      doc.text(`Supervisor's Signature & Stamp: __________________ Date: _________`, 20, 260);

    } else if (docName.includes('SCAF')) {
      // --- SCAF FORM (SPE-1) GENERATION ---
      drawPageBorder();
      
      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("STUDENT'S COMMENCEMENT OF ATTACHMENT FORM", 105, 25, { align: "center" });
      doc.setFontSize(12);
      doc.text("(SCAF / SPE-1)", 105, 33, { align: "center" });
      doc.line(15, 37, 195, 37);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`This form must be completed and returned to the ITF Area Office immediately upon assumption of duty.`, 105, 43, { align: "center" });

      // Student Details
      doc.setFont("helvetica", "bold");
      doc.setFillColor(230, 230, 230);
      doc.rect(15, 52, 180, 8, 'FD');
      doc.text("SECTION 1: STUDENT DETAILS", 105, 58, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.text(`Name of Student:  ${studentName}`, 20, 68);
      doc.text(`Registration/Matriculation No:  ${matNo}`, 20, 78);
      doc.text(`Course of Study:  ${course}`, 20, 88);
      doc.text(`Level/Year of Study:  400L (Standard)`, 20, 98);
      doc.text(`Name of Institution:  Lead City University`, 20, 108);

      // Employer Details
      doc.setFont("helvetica", "bold");
      doc.setFillColor(230, 230, 230);
      doc.rect(15, 118, 180, 8, 'FD');
      doc.text("SECTION 2: EMPLOYER / ATTACHMENT DETAILS", 105, 124, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.text(`Name of Company/Establishment:`, 20, 134);
      doc.setFont("helvetica", "bold");
      doc.text(`${companyName}`, 25, 140);
      doc.setFont("helvetica", "normal");
      
      doc.text(`Exact Location Address:`, 20, 150);
      doc.setFont("helvetica", "bold");
      doc.text(`${companyAddress}`, 25, 156);
      doc.setFont("helvetica", "normal");
      
      doc.text(`Date of Commencement: ______________________`, 20, 170);
      doc.text(`Name of Industry-based Supervisor: ______________________________`, 20, 180);
      doc.text(`Supervisor's Phone Number: _____________________________________`, 20, 190);

      // Signatures
      doc.rect(15, 210, 180, 40);
      doc.setFont("helvetica", "bold");
      doc.text(`SIGNATURES`, 105, 218, { align: "center" });
      
      doc.setFont("helvetica", "normal");
      doc.text(`Student's Signature: ______________________    Date: ______________`, 20, 230);
      doc.text(`Industry Supervisor Signature & Stamp: _________________  Date: ________`, 20, 240);

    } else {
      // --- SIWES REPORT OUTLINE GENERATION ---
      drawPageBorder();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("SIWES TECHNICAL REPORT OUTLINE", 105, 25, { align: "center" });
      doc.line(15, 30, 195, 30);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      
      const outline = [
        "CHAPTER 1: INTRODUCTION",
        "  1.1 Background of SIWES",
        "  1.2 Objectives of SIWES",
        "  1.3 Brief History of the Establishment",
        "  1.4 Organizational Structure of the Establishment",
        "",
        "CHAPTER 2: LITERATURE REVIEW",
        "  2.1 Theoretical Framework related to attachment",
        "  2.2 Relevance of theory to industry practice",
        "",
        "CHAPTER 3: DESCRIPTION OF WORK DONE",
        "  3.1 Details of duties and assigned tasks",
        "  3.2 New skills acquired during attachment",
        "  3.3 Equipment/Tools utilized",
        "",
        "CHAPTER 4: OBSERVATIONS AND CONTRIBUTIONS",
        "  4.1 Observations regarding work environment",
        "  4.2 Student's specific contributions to the organization",
        "",
        "CHAPTER 5: CONCLUSION AND RECOMMENDATIONS",
        "  5.1 Conclusion",
        "  5.2 Recommendations to ITF, Institution, and Employer",
        "",
        "REFERENCES & APPENDICES"
      ];

      let yPos = 45;
      outline.forEach(line => {
        if (line.startsWith("CHAPTER")) {
          doc.setFont("helvetica", "bold");
        } else {
          doc.setFont("helvetica", "normal");
        }
        doc.text(line, 20, yPos);
        yPos += 8;
      });
    }

    // Save the professional PDF
    doc.save(`${docName.replace(/\s+/g, '_')}_Template.pdf`);
    toast.success(`${docName} downloaded successfully!`);
  };

  const [newLog, setNewLog] = useState({ activity: '', date: new Date().toISOString().split('T')[0], attachment: null as File | null });
  const [locationRequests, setLocationRequests] = useState<any[]>([]);
  const [locationRequestReason, setLocationRequestReason] = useState('');
  const [showLocationRequestForm, setShowLocationRequestForm] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    course: '', department: '', skills: '', location_preference: '', cgpa: '', cv: null as File | null, cv_url: '', mat_number: ''
  });
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [allCompanies, setAllCompanies] = useState<any[]>([]);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAIResponse = () => {
    setIsGenerating(true);
    setAiResponse('');
    setTimeout(() => {
      const responses = [
        "Based on your profile, you could write: 'Assisted in deploying the backend database schema updates. Verified integrity of user data tables and optimized query performance.'",
        "Consider this draft: 'Participated in the daily stand-up meeting. Documented software requirements for the new module and fixed 3 minor UI bugs in the staging environment.'",
        "How about: 'Shadowed the senior engineer during the server migration process. Learned about load balancing and failover strategies in production.'",
        "Draft idea: 'Reviewed client feedback and updated the frontend React components to match the new design system. Ensured mobile responsiveness.'"
      ];
      setAiResponse(responses[Math.floor(Math.random() * responses.length)]);
      setIsGenerating(false);
    }, 1500);
  };
  const [mapSearch, setMapSearch] = useState('');
  const [customApp, setCustomApp] = useState({ name: '', industry_type: '', address: '' });
  const [showCustomApp, setShowCustomApp] = useState(false);
  const [liveDistance, setLiveDistance] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isLiveVerified, setIsLiveVerified] = useState(false);
  const [isRegisteringWorkplace, setIsRegisteringWorkplace] = useState(false);
  const [careerAdvice, setCareerAdvice] = useState<string | null>(null);
  const [showCareerAdvice, setShowCareerAdvice] = useState(false);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<string | null>(null);
  const [siwesLevel, setSiwesLevel] = useState('300 Level');
  const [siwesDuration, setSiwesDuration] = useState('6 Months');
  const [siwesCompany, setSiwesCompany] = useState('');
  const [siwesCompanyAddress, setSiwesCompanyAddress] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const targetLat = profile?.internship_latitude ?? profile?.assigned_company_latitude;
    const targetLon = profile?.internship_longitude ?? profile?.assigned_company_longitude;

    if (profile?.assigned_company_id && activeTab === 'logbook' && targetLat !== null && targetLat !== undefined && targetLon !== null && targetLon !== undefined) {
      let watchId: number;

      const handlePosition = (pos: GeolocationPosition) => {
        const R = 6371e3; // meters
        const φ1 = pos.coords.latitude * Math.PI / 180;
        const φ2 = targetLat * Math.PI / 180;
        const Δφ = (targetLat - pos.coords.latitude) * Math.PI / 180;
        const Δλ = (targetLon - pos.coords.longitude) * Math.PI / 180;
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c;
        
        setLiveDistance(d);
        setGpsAccuracy(pos.coords.accuracy);
        
        const allowedRadius = 200; // static allowed radius fallback on client
        
        // Strict geofence: Student must actually be within the radius. 
        // We give a small 50m grace buffer for typical phone GPS drift, but if accuracy is terrible (> 150m), we don't verify.
        if (pos.coords.accuracy > 150) {
          setIsLiveVerified(false);
        } else {
          setIsLiveVerified(d <= (allowedRadius + 50));
        }
      };

      const startWatching = (highAccuracy: boolean) => {
        try {
          watchId = navigator.geolocation.watchPosition(
            handlePosition,
            (err) => {
              console.warn(`watchPosition (highAccuracy=${highAccuracy}) failed:`, err.message);
              if (highAccuracy) {
                // If high accuracy fails/times out, dynamically downgrade to low accuracy to prevent freezing
                navigator.geolocation.clearWatch(watchId);
                startWatching(false);
              }
            },
            { enableHighAccuracy: highAccuracy, timeout: 10000, maximumAge: 0 }
          );
        } catch (e: any) {
          console.error("Failed to initialize watchPosition:", e.message);
        }
      };

      startWatching(true);

      return () => {
        if (watchId !== undefined) {
          navigator.geolocation.clearWatch(watchId);
        }
      };
    } else {
      setLiveDistance(null);
      setIsLiveVerified(false);
    }
  }, [
    profile?.assigned_company_id, 
    profile?.internship_latitude, 
    profile?.internship_longitude, 
    activeTab
  ]);

  useEffect(() => {
    if (profile) {
      setEditProfileData({
        course: profile.course || '',
        department: profile.department || '',
        skills: JSON.parse(profile.skills || '[]').join(', '),
        location_preference: profile.location_preference || '',
        cgpa: profile.cgpa ? profile.cgpa.toString() : '',
        cv: null,
        cv_url: profile.cv_url || '',
        mat_number: profile.mat_number || ''
      });
    }
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const results = await Promise.allSettled([
        fetch('/api/student/profile', { headers }),
        fetch('/api/student/recommendations', { headers }),
        fetch('/api/logbook', { headers }),
        fetch('/api/student/applications', { headers }),
        fetch('/api/memos', { headers }),
        fetch('/api/student/location-requests', { headers })
      ]);
      const [pRes, rRes, lRes, aRes, mRes, locRes] = results.map(r =>
        r.status === 'fulfilled' ? r.value : null
      );
      if (pRes?.ok) setProfile(await pRes.json());
      if (rRes?.ok) setRecommendations(await rRes.json());
      if (lRes?.ok) setLogbook(await lRes.json());
      if (aRes?.ok) setApplications(await aRes.json());
      if (mRes?.ok) setMemos(await mRes.json());
      if (locRes?.ok) setLocationRequests(await locRes.json());
      // Fetch ALL companies for map view
      try {
        const cRes = await fetch('/api/companies', { headers });
        if (cRes.ok) setAllCompanies(await cRes.json());
      } catch (_) {}
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCareerAdvice = async () => {
    setLoadingAdvice(true);
    setShowCareerAdvice(true);
    try {
      const res = await fetch('/api/student/career-advice', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: Backend may need restarting.`);
      }
      const data = await res.json();
      setCareerAdvice(data.advice);
    } catch (err: any) {
      console.error(err);
      setCareerAdvice(`Unable to fetch AI advice: ${err.message}. Please restart your backend server (npm run dev).`);
    } finally {
      setLoadingAdvice(false);
    }
  };

  const handleCustomApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/student/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        score: 0,
        score_breakdown: {},
        custom_company: customApp
      })
    });
    if (res.ok) {
      toast.success('Application submitted!');
      setCustomApp({ name: '', industry_type: '', address: '' });
      setShowCustomApp(false);
      fetchData();
    } else {
      const data = await res.json();
      toast.error(data.error || 'Failed to submit application');
    }
  };

  const handleApply = async (companyId: number, matchScore: number, breakdown: any) => {
    const res = await fetch('/api/student/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ company_id: companyId, score: matchScore, score_breakdown: breakdown })
    });
    const data = await res.json();
    if (res.ok) {
      toast.success('Application submitted!');
      fetchData();
      setActiveTab('applications');
    } else {
      toast.error(data.error || 'Failed to submit application.');
    }
  };

  const handleUploadAcceptance = async (appId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('attachment', file);
    
    toast.loading('Uploading acceptance letter...');
    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    if (uploadRes.ok) {
      const uploadData = await uploadRes.json();
      const res = await fetch(`/api/student/applications/${appId}/acceptance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ acceptance_letter_url: uploadData.url })
      });
      if (res.ok) {
        toast.dismiss();
        toast.success('Acceptance letter submitted!');
        fetchData();
      }
    } else {
      toast.dismiss();
      toast.error('Failed to upload letter');
    }
  };

  const handleCancelApplication = async (appId: number) => {
    if (!window.confirm("Are you sure you want to cancel this application?")) return;
    
    const res = await fetch(`/api/student/applications/${appId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
      toast.success('Application cancelled successfully.');
      fetchData();
    } else {
      const data = await res.json();
      toast.error(data.error || 'Failed to cancel application.');
    }
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.activity.trim()) { toast.error('Please write a caption of what you learned today.'); return; }
    setSubmitting(true);

    let attachmentUrl = '';
    if (newLog.attachment) {
      const formData = new FormData();
      formData.append('attachment', newLog.attachment);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        attachmentUrl = uploadData.url;
      } else {
        toast.error('Failed to upload logbook photo. Please try again.');
        setSubmitting(false);
        return;
      }
    }

    captureCoordinates(
      async (pos) => {
        const res = await fetch('/api/logbook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            activity_description: newLog.activity,
            date: newLog.date,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            attachment_url: attachmentUrl
          })
        });
        const data = await res.json();
        if (data.success) {
          toast.success(`✅ Logbook submitted! GPS: ${data.status} — ${Math.round(data.distance)}m from site`);
          setLastSubmitted(new Date().toLocaleTimeString());
          fetchData();
          setNewLog({ activity: '', date: new Date().toISOString().split('T')[0], attachment: null });
        } else {
          toast.error(data.error || 'Failed to submit log');
        }
        setSubmitting(false);
      },
      (err) => {
        if (err.code === 1) {
          toast.error('Location Blocked: Please allow location access in your browser settings.');
        } else if (err.code === 3) {
          toast.error('Location Timeout: Your device is taking too long to get GPS. Try moving near a window.');
        } else {
          toast.error(`Location Error: ${err.message}`);
        }
        setSubmitting(false);
      }
    );
  };

  const captureCoordinates = (
    onSuccess: (pos: GeolocationPosition) => void,
    onError: (err: GeolocationPositionError) => void
  ) => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    
    // First try with high accuracy (GPS lock, accurate within meters)
    navigator.geolocation.getCurrentPosition(
      (pos) => onSuccess(pos),
      (err) => {
        console.warn("High-accuracy GPS request failed or timed out. Retrying with standard mode...", err.message);
        // Fallback immediately to low accuracy (Wi-Fi/IP location lock)
        navigator.geolocation.getCurrentPosition(
          (fallbackPos) => onSuccess(fallbackPos),
          (fallbackErr) => onError(fallbackErr),
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 10000 }
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleRegisterWorkplace = async () => {
    setIsRegisteringWorkplace(true);
    
    captureCoordinates(
      async (pos) => {
        try {
          const res = await fetch('/api/student/register-workplace', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            })
          });
          
          if (res.ok) {
            toast.success(`Workplace GPS registered! Location captured successfully.`);
            fetchData();
          } else {
            const data = await res.json().catch(() => ({}));
            toast.error(`Failed to register workplace: ${data.error || res.statusText}`);
          }
        } catch (error: any) {
          toast.error(`Network Error: ${error.message}`);
        }
        setIsRegisteringWorkplace(false);
      },
      (err) => {
        if (err.code === 1) {
          toast.error('Location Blocked: Please allow location access in your browser.');
        } else if (err.code === 3) {
          toast.error('Location Timeout: Could not detect your position. Try using a mobile device.');
        } else {
          toast.error(`Error capturing location: ${err.message}`);
        }
        setIsRegisteringWorkplace(false);
      }
    );
  };



  const handleLocationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/student/location-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ reason: locationRequestReason })
    });
    if (res.ok) {
      toast.success('Location change request sent to admin.');
      setLocationRequestReason('');
      setShowLocationRequestForm(false);
      fetchData();
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || 'Failed to submit request.');
    }
  };


  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedMat = editProfileData.mat_number.trim().toUpperCase();
    const matRegex = /^LCU\/UG\/\d{2}\/\d+$/;
    if (!formattedMat) {
      toast.error('Matriculation number is required.');
      return;
    }
    if (!matRegex.test(formattedMat)) {
      toast.error('Invalid Matriculation Number format. Expected format: LCU/UG/YY/NNNNN (e.g. LCU/UG/22/21549)');
      return;
    }

    let cvUrl = editProfileData.cv_url;
    if (editProfileData.cv) {
      const formData = new FormData();
      formData.append('attachment', editProfileData.cv);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        cvUrl = uploadData.url;
      } else {
        toast.error('Failed to upload CV. Please try a smaller file.');
        return;
      }
    }

    const skillsArray = editProfileData.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
    const res = await fetch('/api/student/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        course: editProfileData.course,
        department: editProfileData.department,
        skills: skillsArray,
        location_preference: editProfileData.location_preference,
        cgpa: parseFloat(editProfileData.cgpa) || null,
        cv_url: cvUrl,
        latitude: null,
        longitude: null,
        mat_number: formattedMat
      })
    });
    if (res.ok) {
      toast.success('Profile updated! Recommendations refreshed.');
      fetchData();
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(`Failed to save profile: ${err.error || res.statusText}`);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#5A5A40] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-400 font-medium">Loading your dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-[#F5F5F0] flex flex-col overflow-hidden">
      {/* Mobile Top Header (hidden on desktop) */}
      <div className="md:hidden flex items-center justify-between bg-white px-6 py-4 border-b border-black/5 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 hover:bg-gray-50 rounded-xl text-gray-600 transition-all cursor-pointer"
          >
            <Menu size={22} />
          </button>
          <h2 className="font-serif text-xl font-extrabold tracking-wider text-[#5A5A40]">SIWES</h2>
        </div>
        <NotificationBell token={token} />
      </div>

      {/* Mobile Sidebar Navigation Drawer (hidden on desktop) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 w-64 bg-white p-6 flex flex-col z-50 md:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-2xl font-extrabold tracking-wider text-[#5A5A40]">SIWES</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-gray-50 rounded-xl text-gray-400 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
                <button
                  onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <LayoutDashboard size={18} /> Overview
                </button>
                <button
                  onClick={() => { setActiveTab('placement'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'placement' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <TrendingUp size={18} /> AI Placement
                </button>
                <button
                  onClick={() => { setActiveTab('applications'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'applications' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Building2 size={18} /> My Applications
                </button>
                <button
                  onClick={() => { setActiveTab('logbook'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'logbook' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <BookOpen size={18} /> Daily Logbook
                </button>
                <button
                  onClick={() => { setActiveTab('memos'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'memos' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <UserCircle size={18} /> Memos & Broadcasts
                </button>
                <button
                  onClick={() => { setActiveTab('siwes_letter'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'siwes_letter' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <FileText size={18} /> Placement Letter
                </button>
                <button
                  onClick={() => { setActiveTab('itf_location'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'itf_location' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <MapPin size={18} /> ITF Office & Docs
                </button>
                <button
                  onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <UserCircle size={18} /> My Profile
                </button>
              </nav>

              <div className="pt-6 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-3 px-4 py-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[#5A5A40]">
                    <UserCircle size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate">{user.fullName}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Student</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden md:flex w-64 bg-white border-r border-black/5 p-6 flex flex-col shrink-0">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-extrabold tracking-wider text-[#5A5A40]">SIWES</h2>
            <NotificationBell token={token} />
          </div>

          <nav className="flex-1 space-y-2 no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <LayoutDashboard size={18} /> Overview
            </button>
            <button
              onClick={() => setActiveTab('placement')}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'placement' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <TrendingUp size={18} /> AI Placement
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'applications' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Building2 size={18} /> My Applications
            </button>
            <button
              onClick={() => setActiveTab('logbook')}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'logbook' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <BookOpen size={18} /> Daily Logbook
            </button>
            <button
              onClick={() => setActiveTab('memos')}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'memos' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <UserCircle size={18} /> Memos & Broadcasts
            </button>
            <button
              onClick={() => setActiveTab('siwes_letter')}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'siwes_letter' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <FileText size={18} /> Placement Letter
            </button>
            <button
              onClick={() => setActiveTab('itf_location')}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'itf_location' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <MapPin size={18} /> ITF Office & Docs
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <UserCircle size={18} /> My Profile
            </button>
          </nav>

          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 px-4 py-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[#5A5A40]">
                <UserCircle size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{user.fullName}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Student</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif font-medium text-[#1A1A1A]">Welcome back, {user.fullName.split(' ')[0]} 👋</h1>
                  <p className="text-sm md:text-base text-gray-500 mt-1">Here's your SIWES progress at a glance.</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Today</p>
                  <p className="text-sm font-semibold text-[#5A5A40]">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </header>

              {/* 4 Animated Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <AnimatedStatCard
                  label="Today's Log"
                  value={logbook.filter((l: any) => l.date === new Date().toISOString().split('T')[0]).length}
                  icon={BookOpen}
                  color="#5A5A40"
                  bg="#5A5A40"
                  subtitle={new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                />
                <AnimatedStatCard
                  label="Days Completed"
                  value={(() => {
                    const start = profile?.internship_start_date ? new Date(profile.internship_start_date) : null;
                    return start ? Math.max(0, Math.floor((Date.now() - start.getTime()) / (1000*60*60*24))) : 0;
                  })()}
                  icon={Calendar}
                  color="#7C3AED"
                  bg="#7C3AED"
                  subtitle={profile?.internship_start_date ? `Since ${new Date(profile.internship_start_date).toLocaleDateString('en-GB', {day:'numeric',month:'short'})}` : 'Not started'}
                />
                <AnimatedStatCard
                  label="Logs Submitted"
                  value={logbook.length}
                  icon={ClipboardCheck}
                  color="#D97706"
                  bg="#D97706"
                  subtitle={`${logbook.filter((l:any) => l.verification_status==='VERIFIED').length} verified`}
                />
                <AnimatedStatCard
                  label="Current Placement"
                  value={profile?.assigned_company_id ? 1 : 0}
                  icon={Building2}
                  color="#16A34A"
                  bg="#16A34A"
                  subtitle={profile?.assigned_company_id ? 'Placed ✓' : 'Pending'}
                />
              </div>

              {/* Two Column Layout: Progress + Tasks */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Progress Tracker */}
              {profile?.assigned_company_id ? (() => {
                const startDate = profile.internship_start_date ? new Date(profile.internship_start_date) : null;
                const endDate = profile.internship_end_date ? new Date(profile.internship_end_date) : null;
                const totalWeeks = profile.total_weeks || 24;
                const now = new Date();
                const weeksElapsed = startDate ? Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))) : 0;
                const progress = startDate ? Math.min(100, Math.round((weeksElapsed / totalWeeks) * 100)) : Math.min(100, Math.round((logbook.length / (totalWeeks * 5)) * 100));
                const flagged = logbook.filter((l: any) => l.verification_status === 'FLAGGED').length;
                const weekBars = Array.from({ length: Math.min(totalWeeks, 12) }, (_, i) => ({
                  week: i + 1,
                  done: i < weeksElapsed,
                  current: i === weeksElapsed,
                }));
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-[28px] border border-black/5 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-serif text-xl font-medium">Internship Progress</h3>
                        <p className="text-gray-400 text-sm mt-0.5">Week {Math.min(weeksElapsed, totalWeeks)} of {totalWeeks} — {progress}% complete</p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-[#5A5A40]">{progress}%</span>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Complete</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4 mb-6 overflow-hidden">
                      <motion.div
                        className="h-4 rounded-full"
                        style={{ background: 'linear-gradient(90deg, #5A5A40, #8a8a60)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                      />
                    </div>
                    {/* Week bars */}
                    <div className="flex gap-1 mb-5">
                      {weekBars.map((w) => (
                        <motion.div
                          key={w.week}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: 0.05 * w.week, duration: 0.4 }}
                          className="flex-1 rounded-sm origin-bottom"
                          style={{
                            height: w.current ? 28 : 20,
                            background: w.done ? '#5A5A40' : w.current ? '#8a8a60' : '#E5E7EB',
                          }}
                          title={`Week ${w.week}`}
                        />
                      ))}
                      {totalWeeks > 12 && <div className="flex items-end pb-1 text-xs text-gray-400 ml-1">+{totalWeeks - 12}w</div>}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-emerald-600"><CheckCircle2 size={14} /><span>{logbook.filter((l: any) => l.verification_status === 'VERIFIED').length} Verified</span></div>
                      <div className="flex items-center gap-2 text-amber-500"><AlertCircle size={14} /><span>{logbook.filter((l:any) => l.verification_status === 'PENDING').length} Pending</span></div>
                      <div className="flex items-center gap-2 text-red-500"><AlertCircle size={14} /><span>{flagged} Flagged</span></div>
                      {startDate && <div className="text-gray-400 text-xs flex items-center gap-1"><Calendar size={12} />Started {startDate.toLocaleDateString('en-GB', {day:'numeric',month:'short'})}</div>}
                    </div>
                  </motion.div>
                );
              })() : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-[28px] p-6 sm:p-8 flex flex-col items-center text-center gap-4 justify-center"
                >
                  <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center">
                    <TrendingUp size={32} className="text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-amber-800">No Placement Yet</h3>
                    <p className="text-amber-600 text-sm mt-1">Apply to companies via AI Placement to get started.</p>
                  </div>
                  <button onClick={() => setActiveTab('placement')} className="bg-amber-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-amber-600 transition-colors flex items-center gap-2">
                    <Sparkles size={16} /> View AI Recommendations
                  </button>
                </motion.div>
              )}

              {/* Upcoming Tasks + Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                {/* Upcoming Tasks */}
                <div className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm">
                  <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <Zap size={16} className="text-[#5A5A40]" />
                    Upcoming Tasks
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        label: 'Submit Today\'s Log',
                        done: logbook.some((l: any) => l.date === new Date().toISOString().split('T')[0]),
                        action: () => setActiveTab('logbook'),
                        color: '#16A34A'
                      },
                      {
                        label: 'Complete Your Profile',
                        done: !!(profile?.course && profile?.skills && profile?.mat_number),
                        action: () => setActiveTab('profile'),
                        color: '#7C3AED'
                      },
                      {
                        label: 'Apply to a Company',
                        done: applications.length > 0,
                        action: () => setActiveTab('placement'),
                        color: '#D97706'
                      },
                      {
                        label: 'Check Supervisor Feedback',
                        done: logbook.some((l: any) => l.supervisor_comment),
                        action: () => setActiveTab('logbook'),
                        color: '#3B82F6'
                      },
                    ].map((task, i) => (
                      <button
                        key={i}
                        onClick={task.action}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${task.done ? 'border-transparent' : 'border-gray-200'}`}
                          style={task.done ? { background: task.color } : {}}>
                          {task.done && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                        <span className={`text-sm flex-1 ${task.done ? 'text-gray-400 line-through' : 'text-gray-700 group-hover:text-[#1A1A1A]'}`}>
                          {task.label}
                        </span>
                        {!task.done && <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
              </div>

              <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[32px] border border-black/5 shadow-sm">
                <h3 className="font-serif text-xl mb-6">Recent Activity</h3>
                {logbook.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen size={32} className="mx-auto mb-2 text-gray-200" />
                    <p className="text-gray-400 text-sm">No logbook entries yet. Start submitting your daily logs!</p>
                  </div>
                ) : (
                <div className="space-y-3">
                  {logbook.slice(0, 5).map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${log.verification_status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-600' : log.verification_status === 'FLAGGED' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                          {log.verification_status === 'VERIFIED' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 line-clamp-1">{log.activity_description}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{log.date}</p>
                        </div>
                      </div>
                      <StatusBadge status={log.verification_status} />
                    </motion.div>
                  ))}
                </div>
                )}
              </div>

            </motion.div>
          )}

          {activeTab === 'placement' && (
            <motion.div
              key="placement"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                  <div className="flex items-center gap-4">
                    <h1 className="text-2xl md:text-3xl font-serif font-medium text-[#1A1A1A]">AI Recommendations</h1>
                    <button 
                      onClick={fetchCareerAdvice} 
                      disabled={loadingAdvice}
                      className="text-xs bg-[#5A5A40] text-white px-3 py-1.5 rounded-full font-medium hover:bg-[#4A4A30] transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      <Sparkles size={14} /> 
                      {loadingAdvice ? "Analyzing..." : "Get AI Advice"}
                    </button>
                  </div>
                  <p className="text-gray-500 mt-1">Intelligent matching based on your skills and course.</p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="flex bg-gray-100 rounded-lg p-1 mr-4">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      List
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${viewMode === 'map' ? 'bg-white shadow-sm text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <MapIcon size={14} /> Map
                    </button>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-500">Course: {profile?.course}</span>
                </div>
              </header>

              {/* Career Advice Panel */}
              <AnimatePresence>
                {showCareerAdvice && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#5A5A40]/10 border border-[#5A5A40]/20 p-6 rounded-[24px] relative my-4">
                      <button 
                        onClick={() => setShowCareerAdvice(false)} 
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
                      >
                        <X size={18} />
                      </button>
                      <h3 className="font-serif text-[#1A1A1A] text-lg mb-3 flex items-center gap-2">
                        <Sparkles size={18} className="text-[#5A5A40]" /> 
                        Personalized Career Advice
                      </h3>
                      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {careerAdvice}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {viewMode === 'list' ? (
                <div className="grid grid-cols-1 gap-6">
                  {recommendations.map((rec, i) => {
                    const skills = Array.isArray(rec.required_skills) ? rec.required_skills : JSON.parse(rec.required_skills || '[]');
                    const skillPct = Math.round((rec.breakdown.skillMatch / 60) * 100);
                    const coursePct = Math.round((rec.breakdown.courseMatch / 30) * 100);
                    const locationPct = Math.round((rec.breakdown.locationMatch / 10) * 100);
                    const total = rec.total;
                    const isHighlyRecommended = total >= 80;
                    const circumference = 2 * Math.PI * 30;
                    const studentSkills = (profile?.skills || '').toLowerCase().split(',').map((s: string) => s.trim()).filter(Boolean);
                    return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -2, boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                      className="bg-white rounded-[28px] border border-black/5 shadow-sm overflow-hidden"
                    >
                      {/* Header Banner */}
                      <div className="px-6 sm:px-8 pt-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        style={{ background: isHighlyRecommended ? 'linear-gradient(135deg, #F5F5F0 0%, #EAEADF 100%)' : 'white' }}>
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0"
                            style={{ background: isHighlyRecommended ? 'linear-gradient(135deg, #5A5A40, #8a8a60)' : '#f5f5f0' }}>
                            <Building2 size={26} className={isHighlyRecommended ? 'text-white' : 'text-[#5A5A40]'} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-xl font-semibold text-gray-900">{rec.name}</h3>
                              {isHighlyRecommended && (
                                <span className="px-2.5 py-0.5 bg-[#5A5A40] text-white text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                                  <Star size={10} className="fill-white" /> Highly Recommended
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                              <MapPin size={12} className="text-gray-400" />
                              {rec.industry_type} · {rec.address}
                            </p>
                          </div>
                        </div>

                        {/* Circular Progress Ring */}
                        <div className="flex-shrink-0 flex flex-col items-center">
                          <div className="relative" style={{ width: 84, height: 84 }}>
                            <svg width="84" height="84" viewBox="0 0 84 84" className="-rotate-90">
                              <circle cx="42" cy="42" r="30" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                              <motion.circle
                                cx="42" cy="42" r="30" fill="none"
                                stroke={total >= 80 ? '#5A5A40' : total >= 60 ? '#8a8a60' : '#a4a480'}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: circumference - (total / 100) * circumference }}
                                transition={{ duration: 1.5, ease: 'easeOut', delay: i * 0.1 + 0.3 }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-xl font-bold" style={{ color: total >= 80 ? '#5A5A40' : total >= 60 ? '#8a8a60' : '#a4a480' }}>{total}%</span>
                              <span className="text-[8px] text-gray-400 uppercase tracking-wider">Match</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="px-6 sm:px-8 pb-6 space-y-5">

                        {/* Skills */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Required Skills</p>
                          <div className="flex gap-2 flex-wrap">
                            {skills.map((skill: string, j: number) => {
                              const matched = studentSkills.some((s: string) => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s));
                              return (
                                <span key={j} className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${matched ? 'bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                                  {matched ? <CheckCircle2 size={11} className="text-[#5A5A40]" /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                                  {skill}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Match Bars */}
                        <div className="space-y-3">
                          {[
                            { label: 'Skill Match', value: skillPct, color: '#5A5A40', bg: '#5A5A4015' },
                            { label: 'Course Match', value: coursePct, color: '#8a8a60', bg: '#8a8a6015' },
                            { label: 'Location Match', value: locationPct, color: '#a4a480', bg: '#a4a48015' },
                          ].map((bar, bi) => (
                            <div key={bi}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-600 font-medium">{bar.label}</span>
                                <span className="text-xs font-bold" style={{ color: bar.color }}>{bar.value}%</span>
                              </div>
                              <div className="h-2 rounded-full w-full" style={{ background: bar.bg }}>
                                <motion.div
                                  className="h-2 rounded-full"
                                  style={{ background: bar.color }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${bar.value}%` }}
                                  transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.1 + bi * 0.15 }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* AI Recommendation label + Apply button */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-[#5A5A40]" />
                            <span className="text-sm font-semibold text-gray-700">
                              AI Verdict: <span style={{ color: total >= 80 ? '#16A34A' : total >= 60 ? '#5A5A40' : '#D97706' }}>
                                {total >= 80 ? '🌟 Highly Recommended' : total >= 60 ? '✅ Recommended' : '⚠️ Partial Match'}
                              </span>
                            </span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleApply(rec.id, rec.total, rec.breakdown)}
                            className="bg-[#5A5A40] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#4A4A30] transition-all shadow-lg shadow-[#5A5A40]/25 flex items-center gap-2"
                          >
                            Apply Now <ArrowRight size={14} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Map Search & Stats Bar */}
                  <div className="flex gap-4 items-center flex-wrap">
                    <div className="relative flex-1 min-w-[220px]">
                      <input
                        type="text"
                        placeholder="Search companies, cities, industries…"
                        value={mapSearch}
                        onChange={e => setMapSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40] text-sm shadow-sm"
                      />
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      {mapSearch && <button onClick={() => setMapSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">✕</button>}
                    </div>
                    {/* Legend — Lucide icons, no emoji */}
                    <div className="flex gap-3 text-xs flex-wrap">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full font-medium text-amber-700">
                        <Award size={12} className="text-amber-600" /> Top Match
                      </span>
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full font-medium text-emerald-700">
                        <CheckCircle2 size={12} className="text-emerald-600" /> Recommended
                      </span>
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full font-medium text-blue-700">
                        <Building2 size={12} className="text-blue-500" /> All Companies
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {(() => {
                        const filtered = allCompanies.filter(c =>
                          !mapSearch ||
                          c.name?.toLowerCase().includes(mapSearch.toLowerCase()) ||
                          c.address?.toLowerCase().includes(mapSearch.toLowerCase()) ||
                          c.industry_type?.toLowerCase().includes(mapSearch.toLowerCase())
                        );
                        return `${filtered.length} of ${allCompanies.length} companies`;
                      })()}
                    </span>
                  </div>

                  {/* Map */}
                  <div className="h-[350px] md:h-[580px] rounded-2xl md:rounded-[32px] overflow-hidden border border-black/5 shadow-sm relative z-0">
                    <MapContainer
                      center={[9.0820, 8.6753]}
                      zoom={6}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                      />
                      {allCompanies
                        .filter(c => c.latitude && c.longitude && (
                          !mapSearch ||
                          c.name?.toLowerCase().includes(mapSearch.toLowerCase()) ||
                          c.address?.toLowerCase().includes(mapSearch.toLowerCase()) ||
                          c.industry_type?.toLowerCase().includes(mapSearch.toLowerCase())
                        ))
                        .map((company: any) => {
                          const recMatch = recommendations.find((r: any) => r.id === company.id);
                          const isTopMatch = recMatch && recMatch.total >= 70;
                          const isRecommended = !!recMatch;
                          const size = isTopMatch ? 18 : 14;
                          const color = isTopMatch ? '#D97706' : isRecommended ? '#16A34A' : '#3B82F6';

                          const icon = L.divIcon({
                            className: 'siwes-marker',
                            html: `<div style="width:${size}px;height:${size}px;background:${color};border:2.5px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);cursor:pointer;"></div>`,
                            iconSize: [size, size],
                            iconAnchor: [size / 2, size / 2],
                            popupAnchor: [0, -(size / 2 + 4)],
                          });

                          const skills: string[] = Array.isArray(company.required_skills)
                            ? company.required_skills
                            : (() => { try { return JSON.parse(company.required_skills || '[]'); } catch { return []; } })();

                          return (
                            <Marker key={company.id} position={[company.latitude, company.longitude]} icon={icon}>
                              <Popup minWidth={230} maxWidth={280}>
                                <div style={{ fontFamily: 'Inter, sans-serif', padding: '4px 2px' }}>
                                  {/* Header */}
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                                    <div style={{ width: 36, height: 36, background: color + '18', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `2px solid ${color}30` }}>
                                      <svg width="18" height="18" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', lineHeight: '1.3', wordBreak: 'break-word' }}>{company.name}</div>
                                      <div style={{ fontSize: 10, color: color, fontWeight: 600, marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{company.industry_type}</div>
                                    </div>
                                  </div>

                                  {/* Address */}
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5, fontSize: 11, color: '#6B7280', marginBottom: 8, background: '#F9FAFB', borderRadius: 6, padding: '5px 8px' }}>
                                    <svg width="11" height="11" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                    <span>{company.address}</span>
                                  </div>

                                  {/* Match score if recommended */}
                                  {recMatch && (
                                    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '5px 10px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span style={{ fontSize: 10, color: '#166534', fontWeight: 600 }}>Your Match Score</span>
                                      <span style={{ fontSize: 15, fontWeight: 800, color: '#16A34A' }}>{recMatch.total}%</span>
                                    </div>
                                  )}

                                  {/* Skills */}
                                  {skills.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 10 }}>
                                      {skills.slice(0, 4).map((s: string, j: number) => (
                                        <span key={j} style={{ background: '#F3F4F6', borderRadius: 4, padding: '2px 7px', fontSize: 9, color: '#374151', border: '1px solid #E5E7EB' }}>{s}</span>
                                      ))}
                                      {skills.length > 4 && <span style={{ fontSize: 9, color: '#9CA3AF' }}>+{skills.length - 4} more</span>}
                                    </div>
                                  )}

                                  {/* Apply button */}
                                  <button
                                    onClick={() => handleApply(company.id, recMatch?.total || 0, recMatch?.breakdown || {})}
                                    style={{ width: '100%', background: '#5A5A40', color: 'white', border: 'none', borderRadius: 8, padding: '7px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.03em' }}
                                  >
                                    Apply Now
                                  </button>
                                </div>
                              </Popup>
                            </Marker>
                          );
                        })}
                    </MapContainer>
                  </div>

                  {/* City breakdown chips */}
                  <div className="flex gap-2 flex-wrap">
                    {['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu', 'Kaduna', 'Benin'].map(city => {
                      const count = allCompanies.filter(c => c.address?.includes(city)).length;
                      if (count === 0) return null;
                      return (
                        <button key={city} onClick={() => setMapSearch(city)}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:border-[#5A5A40] hover:text-[#5A5A40] transition-colors shadow-sm">
                          {city} <span className="text-gray-400">({count})</span>
                        </button>
                      );
                    })}
                    {mapSearch && <button onClick={() => setMapSearch('')} className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-full text-xs font-medium text-red-600">✕ Clear filter</button>}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'applications' && (
            <motion.div
              key="applications"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header>
                <h1 className="text-2xl md:text-3xl font-serif font-medium text-[#1A1A1A]">My Applications</h1>
                <p className="text-gray-500 mt-1">Track your placements and upload acceptance letters.</p>
              </header>

              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="bg-white p-6 sm:p-12 rounded-2xl sm:rounded-[32px] border border-black/5 shadow-sm text-center">
                    <p className="text-gray-500">You haven't applied anywhere yet. Check AI Placement for recommendations!</p>
                  </div>
                ) : (
                  applications.map((app, i) => (
                    <div key={i} className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-6">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-[#5A5A40]/10 rounded-2xl flex items-center justify-center text-[#5A5A40] flex-shrink-0">
                            <Building2 size={24} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-medium">{app.company_name}</h3>
                            <p className="text-sm text-gray-500 mb-3">{app.industry_type}</p>
                            {/* Company Contact Info */}
                            <div className="bg-[#5A5A40]/5 border border-[#5A5A40]/10 rounded-xl p-3 space-y-1.5">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Company Contact Details</p>
                              {app.company_email && (
                                <div className="flex items-center gap-2">
                                  <Mail size={13} className="text-[#5A5A40] flex-shrink-0" />
                                  <a href={`mailto:${app.company_email}`} className="text-xs text-[#5A5A40] hover:underline font-medium">
                                    {app.company_email}
                                  </a>
                                </div>
                              )}
                              {app.company_address && (
                                <div className="flex items-start gap-2">
                                  <MapPin size={13} className="text-[#5A5A40] flex-shrink-0 mt-0.5" />
                                  <span className="text-xs text-gray-600">{app.company_address}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:items-end gap-3 flex-shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 mt-4 sm:mt-0">
                          <div className="text-left sm:text-right">
                            <p className="text-xs text-gray-400 mb-1">Status</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                              app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                app.status === 'ACCEPTED_BY_COMPANY' ? 'bg-blue-100 text-blue-700' :
                                  'bg-amber-100 text-amber-700'
                              }`}>
                              {app.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {app.status === 'PENDING' && (
                            <div className="space-y-3 text-left sm:text-right">
                              <div className="space-y-1 text-left sm:text-right">
                                <p className="text-xs font-medium text-[#5A5A40]">Upload Acceptance Letter</p>
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={(e) => handleUploadAcceptance(app.id, e)}
                                  className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#5A5A40]/10 file:text-[#5A5A40] hover:file:bg-[#5A5A40]/20 max-w-[200px]"
                                />
                              </div>
                              <button 
                                onClick={() => handleCancelApplication(app.id)}
                                className="text-[10px] uppercase tracking-wider font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors border border-red-200"
                              >
                                Cancel Application
                              </button>
                            </div>
                          )}
                          {app.acceptance_letter_url && (
                            <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle2 size={13} /> Letter Submitted
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8 border-t border-gray-100 pt-8">
                <button
                  onClick={() => setShowCustomApp(!showCustomApp)}
                  className="text-sm font-medium text-[#5A5A40] hover:underline flex items-center gap-2"
                >
                  <Plus size={16} /> Can't find your company? Log a custom application.
                </button>

                {showCustomApp && (
                  <form onSubmit={handleCustomApply} className="bg-gray-50 p-6 rounded-2xl border border-black/5 mt-4 space-y-4">
                    <h4 className="font-medium">External Application Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        placeholder="Company Name"
                        value={customApp.name}
                        onChange={e => setCustomApp({ ...customApp, name: e.target.value })}
                        className="px-4 py-2 rounded-xl border border-gray-200" required />
                      <input
                        placeholder="Industry (e.g. Technology)"
                        value={customApp.industry_type}
                        onChange={e => setCustomApp({ ...customApp, industry_type: e.target.value })}
                        className="px-4 py-2 rounded-xl border border-gray-200" required />
                    </div>
                    <input
                      placeholder="Company Address/Location"
                      value={customApp.address}
                      onChange={e => setCustomApp({ ...customApp, address: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200" required />
                    <button type="submit" className="bg-[#5A5A40] text-white px-6 py-2 rounded-xl text-sm font-medium">
                      Submit Custom Application
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'memos' && (
            <motion.div
              key="memos"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header>
                <h1 className="text-2xl md:text-3xl font-serif font-medium text-[#1A1A1A]">Memos & Broadcasts</h1>
                <p className="text-gray-500 mt-1">Important announcements from the SIWES Administration.</p>
              </header>

              <div className="space-y-4">
                {memos.length === 0 ? (
                  <div className="bg-white p-6 sm:p-12 rounded-2xl sm:rounded-[32px] border border-black/5 shadow-sm text-center">
                    <p className="text-gray-500">No memos right now.</p>
                  </div>
                ) : (
                  memos.map((memo, i) => (
                    <div key={i} className="bg-white p-6 rounded-[24px] border border-l-4 border-l-[#5A5A40] border-black/5 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-2 items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <UserCircle size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{memo.sender_name}</p>
                            <p className="text-[10px] text-gray-400">SIWES Administration</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(memo.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{memo.message}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'logbook' && (
            <motion.div
              key="logbook"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif font-medium text-[#1A1A1A]">Daily Logbook</h1>
                  <p className="text-gray-500 mt-1">Submit your daily activities with GPS verification.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={async () => {
                      const { default: jsPDF } = await import('jspdf');
                      const { default: autoTable } = await import('jspdf-autotable');
                      const doc = new jsPDF();
                      doc.setFontSize(18);
                      doc.text('SIWES Logbook Report', 14, 20);
                      doc.setFontSize(11);
                      doc.text(`Student: ${user.fullName}`, 14, 32);
                      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 39);
                      autoTable(doc, {
                        startY: 50,
                        head: [['Date', 'Activity', 'Status', 'Distance']],
                        body: logbook.map((l: any) => [l.date, l.activity_description?.substring(0, 50), l.verification_status, `${Math.round(l.distance_from_company || 0)}m`]),
                        styles: { fontSize: 9 },
                        headStyles: { fillColor: [90, 90, 64] }
                      });
                      doc.save(`SIWES_Logbook_${user.fullName.replace(' ', '_')}.pdf`);
                      toast.success('Logbook PDF downloaded!');
                    }}
                    className="flex-1 sm:flex-initial border border-[#5A5A40] text-[#5A5A40] px-5 py-3 rounded-full text-xs sm:text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#5A5A40]/5 transition-colors"
                  >
                    ↓ Download PDF
                  </button>
                  <button
                    onClick={() => document.getElementById('log-form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex-1 sm:flex-initial bg-[#5A5A40] text-white px-6 py-3 rounded-full text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> New Entry
                  </button>
                </div>
              </header>

              {profile?.assigned_company_id ? (
                <div className="space-y-6">
                  {/* Heatmap Gamification */}
                  <div className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm">
                    <h3 className="font-serif text-lg mb-4 flex items-center gap-2">
                      <Zap size={20} className="text-amber-500" /> Your 14-Day Streak
                    </h3>
                    <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 no-scrollbar">
                      {Array.from({length: 14}).map((_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (13 - i));
                        const dateStr = d.toISOString().split('T')[0];
                        const log = logbook.find((l:any) => l.date === dateStr);
                        const status = log ? log.verification_status : 'MISSED';
                        return (
                          <div key={i} className="flex flex-col items-center gap-2 min-w-[40px]">
                            <span className="text-[10px] text-gray-400 uppercase font-bold">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <div title={dateStr} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-600 shadow-sm' : status === 'FLAGGED' ? 'bg-red-100 text-red-600' : status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-300'}`}>
                              {status === 'VERIFIED' ? <CheckCircle2 size={18} /> : status === 'MISSED' ? <span className="text-xs font-bold">-</span> : <Clock size={18} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Workplace Registration / Radar Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[32px] border border-black/5 shadow-sm flex flex-col items-center justify-center text-center">
                      {!profile.internship_latitude ? (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-[#5A5A40]/10 rounded-full flex items-center justify-center text-[#5A5A40] mx-auto">
                            <MapIcon size={32} />
                          </div>
                          <h3 className="font-serif text-xl">One-Time Setup Required</h3>
                          <p className="text-gray-500 text-sm">Please register your precise workplace GPS once you arrive at your internship site.</p>
                          <button
                            onClick={handleRegisterWorkplace}
                            disabled={isRegisteringWorkplace}
                            className="bg-[#5A5A40] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#4A4A30] transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                          >
                            {isRegisteringWorkplace ? 'Capturing GPS...' : 'Register Workplace Location'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4 w-full">
                           <div className="flex items-center gap-2 justify-center mb-2">
                             <LiveLocationPulse />
                             <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Live Geofence Radar</span>
                           </div>
                           <GeofenceRadar distance={liveDistance ?? 999} isVerified={isLiveVerified} />
                           
                           {!isLiveVerified && (
                             <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                               <p className="text-xs text-amber-800 mb-3">
                                 You are {liveDistance ? `${Math.round(liveDistance)}m` : 'unknown distance'} away from your registered site.
                               </p>
                               {gpsAccuracy && gpsAccuracy > 150 && (
                                 <p className="text-xs text-red-600 mb-3 font-medium">
                                   ⚠️ Weak GPS Signal (±{Math.round(gpsAccuracy)}m). Please step outside for a clear sky view.
                                 </p>
                               )}
                               {locationRequests.some(r => r.status === 'PENDING') ? (
                                 <div className="w-full bg-amber-200/50 text-amber-800 py-3 rounded-xl text-sm font-medium text-center shadow-sm">
                                   Location Change Pending Admin Approval
                                 </div>
                               ) : (
                                 <button 
                                   onClick={() => setShowLocationRequestForm(true)}
                                   className="w-full bg-amber-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-amber-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                                 >
                                   <MapIcon size={16} /> 
                                   Request Change of Location
                                 </button>
                               )}
                               <p className="text-[10px] text-center text-red-500 font-medium animate-pulse mt-3">
                                 Strict Geofence Active: You cannot submit logs until you are physically on-site.
                               </p>
                             </div>
                           )}

                           {showLocationRequestForm && (
                             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                               <div className="bg-white rounded-3xl p-8 max-w-lg w-full">
                                 <h3 className="font-serif text-2xl mb-2">Request Location Change</h3>
                                 <p className="text-sm text-gray-500 mb-6">Write a brief letter to the administrator explaining why you need to change your SIWES location.</p>
                                 <form onSubmit={handleLocationRequest} className="space-y-4">
                                   <div>
                                     <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Reason / Letter</label>
                                     <textarea
                                       value={locationRequestReason}
                                       onChange={(e) => setLocationRequestReason(e.target.value)}
                                       className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                                       placeholder="Dear Admin, I am requesting a change of location because..."
                                       required
                                     ></textarea>
                                   </div>
                                   <div className="flex gap-4 pt-4">
                                     <button type="button" onClick={() => setShowLocationRequestForm(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors">Cancel</button>
                                     <button type="submit" className="flex-1 bg-[#5A5A40] text-white px-4 py-3 rounded-xl hover:bg-[#4A4A30] text-sm font-medium transition-colors">Submit Request</button>
                                   </div>
                                 </form>
                               </div>
                             </div>
                           )}

                           {isLiveVerified && (
                             <p className="text-[10px] text-emerald-600 uppercase tracking-widest font-bold mt-2 text-center">
                               You are at your registered site.
                             </p>
                           )}
                         </div>
                       )}
                     </div>

                     <div id="log-form" className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[32px] border border-black/5 shadow-sm">
                       <h3 className="font-serif text-xl mb-1">New Log Entry</h3>
                       <p className="text-xs text-gray-400 mb-6">Write what you learned today. You can optionally attach a photo of your logbook page.</p>
                       <form onSubmit={handleLogSubmit} className="space-y-5">

                         {/* Date + Geofence Status */}
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div>
                             <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Date</label>
                             <input
                               type="date"
                               value={newLog.date}
                               onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                               className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                               required
                             />
                           </div>
                           <div className="flex items-end">
                             <div className="flex items-center gap-2 text-xs px-4 py-3 rounded-xl border w-full bg-gray-50 text-gray-500">
                               {isLiveVerified ? (
                                 <>
                                   <CheckCircle2 size={14} className="text-emerald-500" />
                                   <span className="text-emerald-700 font-medium">Inside Geofence ✓</span>
                                 </>
                               ) : (
                                 <>
                                   <AlertCircle size={14} className="text-amber-500" />
                                   <span className="text-amber-700 font-medium">Outside Geofence ({liveDistance ? `${Math.round(liveDistance)}m away` : '…'})</span>
                                 </>
                               )}
                             </div>
                           </div>
                         </div>

                         {/* Caption — what you learned */}
                         <div>
                           <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                             What did you learn today? <span className="text-red-400">*</span>
                           </label>
                           <textarea
                             value={newLog.activity}
                             onChange={(e) => setNewLog({ ...newLog, activity: e.target.value })}
                             placeholder="e.g. I learned how to configure a VLAN switch and assisted the network team with cable routing..."
                             className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40] min-h-[110px] resize-none text-sm"
                             required
                           />
                           <p className="text-[10px] text-gray-400 mt-1">{newLog.activity.length} characters — keep it concise but meaningful</p>
                         </div>

                         {/* Optional logbook photo */}
                         <div>
                           <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                             <Camera size={13} className="text-[#5A5A40]" />
                             Logbook Photo <span className="normal-case font-normal text-gray-300">(Optional)</span>
                           </label>
                           {newLog.attachment ? (
                             <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                               <img
                                 src={URL.createObjectURL(newLog.attachment)}
                                 alt="Logbook"
                                 className="w-14 h-14 rounded-xl object-cover shadow-sm flex-shrink-0"
                               />
                               <div className="flex-1 min-w-0">
                                 <p className="text-xs font-medium text-gray-700 truncate">{newLog.attachment.name}</p>
                                 <p className="text-[10px] text-gray-400">{(newLog.attachment.size / 1024).toFixed(0)} KB</p>
                               </div>
                               <button
                                 type="button"
                                 onClick={() => setNewLog({ ...newLog, attachment: null })}
                                 className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                               >
                                 <X size={14} />
                               </button>
                             </div>
                           ) : (
                             <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-2xl px-4 py-4 cursor-pointer hover:border-[#5A5A40]/40 hover:bg-[#5A5A40]/5 transition-colors group">
                               <div className="w-10 h-10 bg-gray-100 group-hover:bg-[#5A5A40]/10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                                 <Camera size={18} className="text-gray-400 group-hover:text-[#5A5A40] transition-colors" />
                               </div>
                               <div>
                                 <p className="text-sm font-medium text-gray-600">Attach a logbook photo</p>
                                 <p className="text-xs text-gray-400">Tap to choose from camera or gallery</p>
                               </div>
                               <input
                                 type="file"
                                 accept="image/*"
                                 capture="environment"
                                 className="hidden"
                                 onChange={(e) => setNewLog({ ...newLog, attachment: e.target.files?.[0] || null })}
                               />
                             </label>
                           )}
                         </div>

                         {/* Success banner */}
                         {lastSubmitted && (
                           <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 animate-pulse">
                             <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                             <p className="text-sm text-emerald-700 font-medium">Last submitted at {lastSubmitted} ✓</p>
                           </div>
                         )}

                         <button
                           type="submit"
                           disabled={submitting || !isLiveVerified}
                           className={`w-full py-4 rounded-full font-medium transition-all shadow-lg flex items-center justify-center gap-3 ${
                             submitting || !isLiveVerified
                               ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                               : 'bg-[#5A5A40] hover:bg-[#4A4A30] shadow-[#5A5A40]/20 text-white'
                           }`}
                         >
                           {submitting ? (
                             <span className="flex items-center gap-2">
                               <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                               Submitting...
                             </span>
                           ) : isLiveVerified ? (
                             'Submit Verified Logbook 📋'
                           ) : (
                             'Outside Geofence (Disabled) 🚫'
                           )}
                         </button>
                       </form>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl sm:rounded-[32px] p-5 sm:p-10 flex flex-col items-center text-center gap-4">
                  <MapPin size={36} className="text-amber-400" />
                  <h3 className="font-serif text-xl text-amber-800">No Company Assigned Yet</h3>
                  <p className="text-amber-700 text-sm max-w-md">You need to be placed at a company before you can submit logbook entries. Apply to a company via <strong>AI Placement</strong> or <strong>My Applications</strong>, then wait for Admin approval.</p>
                </div>
              )}


              <div className="space-y-4">
                <h3 className="font-serif text-xl">Submission History</h3>
                {logbook.map((log, i) => (
                  <div key={i} className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-1">
                      <div className="flex sm:flex-col items-center gap-2 sm:gap-0 sm:text-center min-w-[60px]">
                        <span className="text-xs font-bold text-gray-400 uppercase">{log.date.split('-')[1]}/{log.date.split('-')[2]}</span>
                        <span className="hidden sm:block text-xl font-serif">{log.date.split('-')[0]}</span>
                        <span className="sm:hidden text-xs text-gray-400">({log.date.split('-')[0]})</span>
                      </div>
                      <div className="hidden sm:block h-10 w-px bg-gray-100"></div>
                      <div>
                        <p className="font-medium">{log.activity_description}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <StatusBadge status={log.verification_status} />
                          <DistanceIndicator distance={log.distance_from_company} status={log.verification_status} />
                          {log.attachment_url && (
                            <a href={log.attachment_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                              View Attachment
                            </a>
                          )}
                        </div>
                        {log.supervisor_comment && (
                          <div className="mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="text-xs font-bold uppercase text-gray-400 mb-1">Supervisor Comment</p>
                            <p className="text-sm text-gray-700">{log.supervisor_comment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}


          {activeTab === 'siwes_letter' && (
            <motion.div
              key="siwes_letter"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header>
                <h1 className="text-2xl md:text-3xl font-serif font-medium text-[#1A1A1A]">Official Placement Letter</h1>
                <p className="text-gray-500 mt-1">Generate and download your official SIWES Internship Introduction Letter.</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Form Controls */}
                <div className="lg:col-span-4 space-y-6 bg-white p-6 rounded-[24px] border border-black/5 shadow-sm">
                  <h3 className="font-serif text-lg text-[#5A5A40] border-b border-gray-100 pb-3 mb-4">Letter Details</h3>
                  
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Student Name</label>
                    <input
                      type="text"
                      value={user.fullName}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 cursor-not-allowed font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Matric Number</label>
                    <input
                      type="text"
                      value={profile?.mat_number || 'LCU/UG/XX/XXXXX'}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 cursor-not-allowed font-semibold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Academic Level</label>
                    <select
                      value={siwesLevel}
                      onChange={(e) => setSiwesLevel(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40] font-medium"
                    >
                      <option value="300 Level">300 Level</option>
                      <option value="400 Level">400 Level</option>
                      <option value="500 Level">500 Level</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Internship Duration</label>
                    <select
                      value={siwesDuration}
                      onChange={(e) => setSiwesDuration(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40] font-medium"
                    >
                      <option value="3 Months">3 Months (12 Weeks)</option>
                      <option value="6 Months">6 Months (24 Weeks)</option>
                      <option value="1 Year">1 Year (48 Weeks)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Host Company / Organization</label>
                    <input
                      type="text"
                      value={siwesCompany}
                      onChange={(e) => setSiwesCompany(e.target.value)}
                      placeholder="e.g. Google Nigeria Ltd"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Company Physical Address</label>
                    <textarea
                      value={siwesCompanyAddress}
                      onChange={(e) => setSiwesCompanyAddress(e.target.value)}
                      placeholder="e.g. 1600 Amphitheatre Pkwy, Mountain View, CA"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40] font-medium min-h-[80px]"
                    />
                  </div>

                  <button
                    onClick={async () => {
                      if (!siwesCompany || !siwesCompanyAddress) {
                        toast.error('Please enter the host company details first!');
                        return;
                      }

                      const { default: jsPDF } = await import('jspdf');
                      const doc = new jsPDF();
                      
                      // Royal Blue Double Line top border
                      doc.setDrawColor(0, 32, 96);
                      doc.setLineWidth(1.5);
                      doc.line(14, 15, 196, 15);
                      doc.setLineWidth(0.5);
                      doc.line(14, 17, 196, 17);

                      // Letterhead Header
                      doc.setFont('times', 'bold');
                      doc.setFontSize(22);
                      doc.setTextColor(0, 32, 96); // Royal Blue
                      doc.text('LEAD CITY UNIVERSITY', 105, 28, { align: 'center' });
                      
                      doc.setFont('times', 'normal');
                      doc.setFontSize(12);
                      doc.setTextColor(128, 128, 128); // Grey
                      doc.text('Ibadan, Nigeria', 105, 34, { align: 'center' });

                      doc.setFont('times', 'bold');
                      doc.setFontSize(13);
                      doc.setTextColor(0, 102, 0); // Dark Green/Gold theme
                      doc.text('DIRECTORATE OF STUDENT INDUSTRIAL WORK EXPERIENCE SCHEME (SIWES)', 105, 41, { align: 'center' });

                      doc.setFont('times', 'normal');
                      doc.setFontSize(9);
                      doc.setTextColor(100, 100, 100);
                      doc.text('P.O.B. 21710, U.I. Post Office, Ibadan | Web: www.lcu.edu.ng | Email: siwes@lcu.edu.ng', 105, 47, { align: 'center' });

                      // Divider Gold/Green
                      doc.setDrawColor(212, 175, 55); // Gold line
                      doc.setLineWidth(0.8);
                      doc.line(14, 52, 196, 52);

                      // Letter Meta Info
                      doc.setFont('times', 'normal');
                      doc.setFontSize(11);
                      doc.setTextColor(0, 0, 0);
                      const refNum = `Ref: LCU/SIWES/${new Date().getFullYear()}/${(profile?.id || 10) + 1240}`;
                      doc.text(refNum, 14, 62);
                      doc.text(`Date: ${new Date().toLocaleDateString()}`, 196, 62, { align: 'right' });

                      // To Address
                      doc.setFont('times', 'bold');
                      doc.text('To:', 14, 74);
                      doc.text('The Managing Director / HR Manager,', 14, 80);
                      doc.setFont('times', 'normal');
                      doc.text(siwesCompany, 14, 86);
                      
                      // Wrap address text
                      const wrappedAddress = doc.splitTextToSize(siwesCompanyAddress, 100);
                      doc.text(wrappedAddress, 14, 92);

                      const addressLinesCount = wrappedAddress.length;
                      const yPosOffset = 92 + (addressLinesCount * 5);

                      // Salutation
                      doc.text('Dear Sir/Ma,', 14, yPosOffset);

                      // Subject
                      doc.setFont('times', 'bold');
                      const subjectText = 'LETTER OF INTRODUCTION FOR STUDENT INDUSTRIAL ATTACHMENT (SIWES)';
                      doc.text(subjectText, 105, yPosOffset + 10, { align: 'center' });
                      doc.setLineWidth(0.5);
                      doc.setDrawColor(0, 0, 0);
                      doc.line(20, yPosOffset + 12, 190, yPosOffset + 12);

                      // Body Paragraph 1
                      doc.setFont('times', 'normal');
                      const bodyP1 = 'We wish to introduce the under-listed student who is a bonafide student of Lead City University, Ibadan. The student is pursuing a degree in our university and is currently seeking a placement for the compulsory Student Industrial Work Experience Scheme (SIWES).';
                      const wrappedP1 = doc.splitTextToSize(bodyP1, 182);
                      doc.text(wrappedP1, 14, yPosOffset + 22);

                      const p1Offset = yPosOffset + 22 + (wrappedP1.length * 6);

                      // Student Details Card
                      doc.setDrawColor(200, 200, 200);
                      doc.setFillColor(248, 249, 250);
                      doc.rect(14, p1Offset, 182, 38, 'FD');

                      doc.setFont('times', 'bold');
                      doc.text('STUDENT INFORMATION DETAILS', 105, p1Offset + 6, { align: 'center' });
                      doc.line(14, p1Offset + 9, 196, p1Offset + 9);

                      doc.setFont('times', 'normal');
                      doc.text('Full Name of Student:', 20, p1Offset + 15);
                      doc.setFont('times', 'bold');
                      doc.text(user.fullName, 65, p1Offset + 15);

                      doc.setFont('times', 'normal');
                      doc.text('Matriculation Number:', 20, p1Offset + 21);
                      doc.setFont('times', 'bold');
                      doc.text(profile?.mat_number || 'N/A', 65, p1Offset + 21);

                      doc.setFont('times', 'normal');
                      doc.text('Course of Study:', 20, p1Offset + 27);
                      doc.setFont('times', 'bold');
                      doc.text(profile?.course || 'Computer Science', 65, p1Offset + 27);

                      doc.setFont('times', 'normal');
                      doc.text('Academic Level:', 20, p1Offset + 33);
                      doc.setFont('times', 'bold');
                      doc.text(siwesLevel, 65, p1Offset + 33);

                      const p2Offset = p1Offset + 44;

                      // Body Paragraph 2
                      const bodyP2 = `The SIWES program is a vital curriculum requirement designed to expose students to industry-standard workflows, practical challenges, and modern technical architectures to complement their theoretical classroom work. We would be highly appreciative if you could accept the student for a period of ${siwesDuration} to undergo this critical practical training.`;
                      const wrappedP2 = doc.splitTextToSize(bodyP2, 182);
                      doc.setFont('times', 'normal');
                      doc.text(wrappedP2, 14, p2Offset);

                      const p3Offset = p2Offset + (wrappedP2.length * 6) + 4;

                      // Body Paragraph 3
                      const bodyP3 = 'While undergoing the internship, the student will be required to keep a daily record of tasks performed, which will be regularly verified by your assigned company supervisor and assessed by visiting institution supervisors. Thank you for your continued partnership and contribution towards national manpower development.';
                      const wrappedP3 = doc.splitTextToSize(bodyP3, 182);
                      doc.text(wrappedP3, 14, p3Offset);

                      const signOffset = p3Offset + (wrappedP3.length * 6) + 8;

                      // Sign-off
                      doc.text('Yours faithfully,', 14, signOffset);
                      
                      // Cursive simulated signature drawing or styled text
                      doc.setFont('courier', 'italic');
                      doc.setFontSize(14);
                      doc.setTextColor(0, 32, 96);
                      doc.text('Prof. O. A. Alao', 14, signOffset + 12);
                      
                      doc.setFont('times', 'bold');
                      doc.setFontSize(11);
                      doc.setTextColor(0, 0, 0);
                      doc.text('Prof. O. A. Alao', 14, signOffset + 20);
                      doc.setFont('times', 'normal');
                      doc.text('Director, Directorate of SIWES', 14, signOffset + 25);
                      doc.text('Lead City University, Ibadan.', 14, signOffset + 30);

                      // Blue rubber stamp outline
                      doc.setDrawColor(0, 51, 153);
                      doc.setLineWidth(1);
                      doc.circle(150, signOffset + 15, 18, 'S');
                      
                      doc.setFont('times', 'bold');
                      doc.setFontSize(6);
                      doc.setTextColor(0, 51, 153);
                      doc.text('LEAD CITY UNIVERSITY', 150, signOffset + 9, { align: 'center' });
                      doc.text('* SIWES OFFICE *', 150, signOffset + 15, { align: 'center' });
                      doc.text('OFFICIALLY APPROVED', 150, signOffset + 21, { align: 'center' });

                      doc.save(`SIWES_Introduction_Letter_${user.fullName.replace(' ', '_')}.pdf`);
                      toast.success('Official Introduction Letter downloaded successfully!');
                    }}
                    className="w-full bg-[#5A5A40] text-white py-4 rounded-xl font-medium hover:bg-[#4A4A30] transition-colors shadow-lg shadow-[#5A5A40]/10 flex items-center justify-center gap-2"
                  >
                    ↓ Download Official Letter
                  </button>
                </div>

                {/* Right Column: Live Interactive A4 Letterhead Preview */}
                <div className="lg:col-span-8 space-y-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Live Document Preview</p>
                  
                  <div className="bg-white rounded-[24px] sm:rounded-[32px] border border-black/5 shadow-2xl p-6 sm:p-10 max-w-3xl mx-auto min-h-[900px] flex flex-col justify-between relative overflow-hidden font-serif select-none">
                    {/* Official Letterhead Double Header Lines */}
                    <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#002060]" />
                    <div className="absolute top-[6px] left-0 right-0 h-[1.5px] bg-[#002060]" />

                    <div>
                      {/* University Branding header */}
                      <div className="text-center mt-4">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#002060] font-serif">LEAD CITY UNIVERSITY</h1>
                        <p className="text-xs text-gray-400 tracking-wider">Ibadan, Nigeria</p>
                        <h3 className="text-[11px] md:text-xs font-bold text-emerald-800 mt-2 uppercase tracking-wide">Directorate of Student Industrial Work Experience Scheme (SIWES)</h3>
                        <p className="text-[9px] text-gray-400 mt-1 font-sans">P.O.B. 21710, U.I. Post Office, Ibadan | Web: www.lcu.edu.ng | Email: siwes@lcu.edu.ng</p>
                      </div>

                      {/* Branded gold separator */}
                      <div className="h-[2px] bg-[#d4af37] w-full mt-4" />

                      {/* Letter Meta Info */}
                      <div className="flex justify-between items-center text-xs text-gray-600 mt-6 font-sans">
                        <span className="font-mono">Ref: LCU/SIWES/{new Date().getFullYear()}/{(profile?.id || 10) + 1240}</span>
                        <span>Date: {new Date().toLocaleDateString()}</span>
                      </div>

                      {/* To address */}
                      <div className="mt-8 text-xs text-gray-800 font-sans space-y-1">
                        <p className="font-bold">To:</p>
                        <p className="font-bold">The Managing Director / HR Manager,</p>
                        <p className="text-gray-900 font-semibold">{siwesCompany || '[Enter Host Company Name]'}</p>
                        <p className="text-gray-500 whitespace-pre-wrap">{siwesCompanyAddress || '[Enter Company Physical Address]'}</p>
                      </div>

                      {/* Salutation */}
                      <div className="mt-6 text-xs text-gray-800 font-sans">
                        Dear Sir/Ma,
                      </div>

                      {/* Subject */}
                      <div className="mt-6 text-center">
                        <h2 className="text-xs md:text-sm font-bold text-black border-b border-black inline-block pb-1 uppercase tracking-wide">
                          LETTER OF INTRODUCTION FOR STUDENT INDUSTRIAL ATTACHMENT (SIWES)
                        </h2>
                      </div>

                      {/* Body paragraph 1 */}
                      <div className="mt-6 text-xs md:text-sm text-gray-700 leading-relaxed font-sans text-justify">
                        We wish to introduce the under-listed student who is a bonafide student of Lead City University, Ibadan. The student is pursuing a degree in our university and is currently seeking a placement for the compulsory Student Industrial Work Experience Scheme (SIWES).
                      </div>

                      {/* Student Details Box */}
                      <div className="mt-6 bg-gray-50 border border-gray-100 rounded-2xl p-5 font-sans">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 text-center border-b border-gray-100 pb-2">Student Information Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-gray-400 block text-[10px] uppercase">Full Name</span>
                            <span className="font-semibold text-gray-900">{user.fullName}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px] uppercase">Matric Number</span>
                            <span className="font-semibold font-mono text-emerald-800">{profile?.mat_number || 'LCU/UG/XX/XXXXX'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px] uppercase">Course of Study</span>
                            <span className="font-semibold text-gray-900">{profile?.course || 'Computer Science'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px] uppercase">Academic Level</span>
                            <span className="font-semibold text-gray-900">{siwesLevel}</span>
                          </div>
                        </div>
                      </div>

                      {/* Body paragraph 2 */}
                      <div className="mt-6 text-xs md:text-sm text-gray-700 leading-relaxed font-sans text-justify">
                        The SIWES program is a vital curriculum requirement designed to expose students to industry-standard workflows, practical challenges, and modern technical architectures to complement their theoretical classroom work. We would be highly appreciative if you could accept the student for a period of <span className="font-bold text-gray-900">{siwesDuration}</span> to undergo this critical practical training.
                      </div>

                      {/* Body paragraph 3 */}
                      <div className="mt-4 text-xs md:text-sm text-gray-700 leading-relaxed font-sans text-justify">
                        While undergoing the internship, the student will be required to keep a daily record of tasks performed, which will be regularly verified by your assigned company supervisor and assessed by visiting institution supervisors. Thank you for your continued partnership and contribution towards national manpower development.
                      </div>
                    </div>

                    {/* Sign-off & Stamp Container */}
                    <div className="mt-8 flex justify-between items-end border-t border-gray-100 pt-6">
                      <div className="text-xs text-gray-800 font-sans space-y-1">
                        <p>Yours faithfully,</p>
                        <p className="font-serif italic text-lg text-[#002060] py-2 font-medium tracking-wide">Prof. O. A. Alao</p>
                        <p className="font-bold text-gray-950">Prof. O. A. Alao</p>
                        <p className="text-gray-400 text-[10px] uppercase tracking-wider">Director, Directorate of SIWES</p>
                        <p className="text-gray-400 text-[10px]">Lead City University, Ibadan.</p>
                      </div>

                      {/* Official Stamp Simulation */}
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#003399]/40 flex flex-col items-center justify-center text-[7px] font-bold text-[#003399]/70 bg-[#003399]/5 rotate-12 transform select-none font-sans">
                        <span>LEAD CITY UNIV</span>
                        <span>SIWES OFFICE</span>
                        <span className="text-[6px] border-t border-[#003399]/20 pt-0.5 mt-0.5">APPROVED STAMP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header>
                <h1 className="text-2xl md:text-3xl font-serif font-medium text-[#1A1A1A]">My Profile</h1>
                <p className="text-gray-500 mt-1">Update your skills and preferences for better AI placement.</p>
              </header>

              <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[32px] border border-black/5 shadow-sm max-w-2xl">
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 font-mono">Matric Number</label>
                      <input
                        type="text"
                        value={editProfileData.mat_number}
                        onChange={(e) => setEditProfileData({ ...editProfileData, mat_number: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40] font-semibold font-mono uppercase"
                        placeholder="LCU/UG/YY/NNNNN"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Course of Study</label>
                      <input
                        type="text"
                        value={editProfileData.course}
                        onChange={(e) => setEditProfileData({ ...editProfileData, course: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Department</label>
                      <input
                        type="text"
                        value={editProfileData.department}
                        onChange={(e) => setEditProfileData({ ...editProfileData, department: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Skills (Comma Separated)</label>
                    <textarea
                      value={editProfileData.skills}
                      onChange={(e) => setEditProfileData({ ...editProfileData, skills: e.target.value })}
                      placeholder="e.g. Python, React, Data Analysis, Communication"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40] min-h-[100px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Location Preference</label>
                    <input
                      type="text"
                      value={editProfileData.location_preference}
                      onChange={(e) => setEditProfileData({ ...editProfileData, location_preference: e.target.value })}
                      placeholder="e.g. Lagos, Abuja, Remote"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">CGPA</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="5.0"
                        value={editProfileData.cgpa}
                        onChange={(e) => setEditProfileData({ ...editProfileData, cgpa: e.target.value })}
                        placeholder="e.g. 4.50"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Upload CV</label>
                      <input
                        type="file"
                        onChange={(e) => setEditProfileData({ ...editProfileData, cv: e.target.files?.[0] || null })}
                        className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40] text-sm"
                        accept=".pdf,.doc,.docx"
                      />
                      {editProfileData.cv_url && (
                        <a href={editProfileData.cv_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-2 inline-block">
                          View Current CV
                        </a>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-[#5A5A40] text-white px-8 py-4 rounded-full font-medium hover:bg-[#4A4A30] transition-colors shadow-lg shadow-[#5A5A40]/20"
                  >
                    Save Profile
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'itf_location' && (
            <motion.div
              key="itf_location"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header>
                <h1 className="text-2xl md:text-3xl font-serif font-medium text-[#1A1A1A]">ITF Office & Document Hub</h1>
                <p className="text-gray-500 mt-1">Find your nearest Industrial Training Fund area office and manage required SIWES documentation templates.</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Office Locator */}
                <div className="lg:col-span-5 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[32px] border border-black/5 shadow-sm space-y-6 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-serif text-xl font-medium text-[#1A1A1A]">ITF Area Office Locator</h3>
                      <p className="text-sm text-gray-400 mt-1">Select your state of residence/internship to find the closest ITF office.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Select State</label>
                      <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40] font-medium"
                      >
                        {ITF_OFFICES.map((o) => (
                          <option key={o.state} value={o.state}>{o.state}</option>
                        ))}
                      </select>
                    </div>

                    {/* Selected Office Info Card */}
                    {(() => {
                      const office = ITF_OFFICES.find(o => o.state === selectedState) || ITF_OFFICES[0];
                      return (
                        <div className="space-y-4">
                          <div className="bg-[#5A5A40]/5 border border-[#5A5A40]/10 p-5 rounded-2xl space-y-3">
                            <h4 className="font-semibold text-[#5A5A40] text-base">{office.name}</h4>
                            <p className="text-sm text-gray-600 leading-relaxed flex items-start gap-2">
                              <MapPin size={16} className="text-[#5A5A40] mt-1 shrink-0" />
                              <span>{office.address}</span>
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <span className="font-semibold text-xs uppercase tracking-wider text-gray-400">Phone:</span>
                              <a href={`tel:${office.phone}`} className="hover:underline hover:text-[#5A5A40] font-medium">{office.phone}</a>
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <span className="font-semibold text-xs uppercase tracking-wider text-gray-400">Email:</span>
                              <a href={`mailto:${office.email}`} className="hover:underline hover:text-[#5A5A40] font-medium">{office.email}</a>
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(office.address);
                                toast.success("Office address copied to clipboard!");
                              }}
                              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold transition-all text-center flex items-center justify-center gap-1.5"
                            >
                              Copy Address
                            </button>
                            <a
                              href={`mailto:${office.email}`}
                              className="py-3 px-4 rounded-xl border border-[#5A5A40]/20 bg-[#5A5A40]/5 hover:bg-[#5A5A40]/10 text-xs font-semibold transition-all text-[#5A5A40] text-center flex items-center justify-center gap-1.5"
                            >
                              <Mail size={14} /> Email
                            </a>
                          </div>

                          {/* Dynamic Leaflet Map */}
                          <div className="h-64 rounded-2xl overflow-hidden border border-black/5 shadow-sm z-0 relative">
                            <MapContainer
                              key={office.state}
                              center={[office.latitude, office.longitude]}
                              zoom={13}
                              style={{ height: '100%', width: '100%' }}
                            >
                              <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              />
                              <Marker 
                                position={[office.latitude, office.longitude]}
                                icon={L.divIcon({
                                  className: 'itf-marker',
                                  html: `<div style="width:20px;height:20px;background:#5A5A40;border:2.5px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);cursor:pointer;"></div>`,
                                  iconSize: [20, 20],
                                  iconAnchor: [10, 10],
                                  popupAnchor: [0, -14]
                                })}
                              >
                                <Popup>
                                  <div className="font-sans text-xs">
                                    <strong className="text-[#5A5A40]">{office.name}</strong><br/>
                                    {office.address}
                                  </div>
                                </Popup>
                              </Marker>
                            </MapContainer>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Right Column: Document Hub */}
                <div className="lg:col-span-7 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[32px] border border-black/5 shadow-sm space-y-6 flex flex-col">
                  <div>
                    <h3 className="font-serif text-xl font-medium text-[#1A1A1A]">SIWES Document & Templates Hub</h3>
                    <p className="text-sm text-gray-400 mt-1">Access detailed guidelines and templates for documents required during your internship journey.</p>
                  </div>

                  {/* Segmented Control / Sub Tabs */}
                  <div className="flex flex-col sm:flex-row bg-gray-100 rounded-xl p-1 gap-1">
                    <button
                      onClick={() => setDocSubTab('commencement')}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${docSubTab === 'commencement' ? 'bg-white shadow-sm text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Commencement Documents (Post-Resumption)
                    </button>
                    <button
                      onClick={() => setDocSubTab('completion')}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${docSubTab === 'completion' ? 'bg-white shadow-sm text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Completion Documents (Post-Internship)
                    </button>
                  </div>

                  {/* Sub Tab Panes */}
                  <div className="flex-1 space-y-6">
                    {docSubTab === 'commencement' ? (
                      <div className="space-y-6">
                        <div className="border border-gray-100 rounded-2xl p-5 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-800 text-sm">ITF Form 8 (Section A - Resumption)</h4>
                              <p className="text-xs text-gray-400 mt-0.5">Deadline: Within first 3 weeks of resumption</p>
                            </div>
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-semibold border border-amber-200">Required</span>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            Form 8 acts as the primary document confirming you have successfully reported and resumed duty at your placement company. You must fill out the personal and institution details in **Section A**, and have your company's **industry supervisor** sign and stamp the Resumption Section. A copy must be submitted to the university SIWES office.
                          </p>
                          
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={() => handleDocDownload('ITF Form 8 Resumption')}
                              className="flex-1 py-2.5 px-4 rounded-xl bg-[#5A5A40] text-white hover:bg-[#4A4A30] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <FileText size={14} /> Download Form 8 Resumption Template
                            </button>
                            <button
                              onClick={() => setShowForm8Mockup(!showForm8Mockup)}
                              className="py-2.5 px-4 rounded-xl border border-[#5A5A40]/30 text-[#5A5A40] hover:bg-[#5A5A40]/5 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Sparkles size={14} /> {showForm8Mockup ? 'Hide Layout Example' : 'View Paper Example & Fill Guide'}
                            </button>
                          </div>

                          {showForm8Mockup && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border border-dashed border-[#5A5A40]/30 rounded-2xl p-6 bg-gray-50/50 space-y-4 overflow-hidden"
                            >
                              <div className="bg-white border border-gray-200 shadow-md rounded-lg p-6 max-w-lg mx-auto font-serif text-[11px] text-[#1A1A1A] space-y-4 relative">
                                {/* Watermark / Seal */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
                                  <div className="w-48 h-48 border-8 border-[#5A5A40] rounded-full flex items-center justify-center">
                                    <span className="font-serif text-2xl font-bold tracking-widest text-[#5A5A40]">ITF NIGERIA</span>
                                  </div>
                                </div>

                                {/* Header */}
                                <div className="text-center space-y-1 border-b pb-3 border-gray-100 relative z-10">
                                  <h4 className="font-bold text-[12px] tracking-wide text-gray-800">INDUSTRIAL TRAINING FUND (ITF)</h4>
                                  <p className="text-[9px] uppercase tracking-wider text-gray-500 font-sans font-semibold">SIWES PLACEMENT & RESUMPTION SHEET (FORM 8)</p>
                                  <span className="inline-block text-[8px] bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200/50 font-sans font-bold">OFFICIAL PAPER EXAMPLE</span>
                                </div>

                                {/* Part A */}
                                <div className="space-y-2 relative z-10">
                                  <h5 className="font-bold text-gray-700 border-b border-gray-100 pb-1 uppercase tracking-wider text-[10px] font-sans">PART A: TO BE FILLED BY STUDENT</h5>
                                  <div className="grid grid-cols-2 gap-3 text-left">
                                    <div>
                                      <span className="text-[8px] text-gray-400 block font-sans">FULL NAME OF STUDENT:</span>
                                      <span className="font-semibold underline decoration-dotted text-gray-700">{user.fullName}</span>
                                    </div>
                                    <div>
                                      <span className="text-[8px] text-gray-400 block font-sans">MATRICULATION NO:</span>
                                      <span className="font-semibold underline decoration-dotted text-gray-700 font-mono">{profile?.mat_number || 'NOT_ASSIGNED'}</span>
                                    </div>
                                    <div>
                                      <span className="text-[8px] text-gray-400 block font-sans">INSTITUTION:</span>
                                      <span className="font-semibold underline decoration-dotted text-gray-700">Lead City University, Ibadan</span>
                                    </div>
                                    <div>
                                      <span className="text-[8px] text-gray-400 block font-sans">DEPARTMENT / COURSE:</span>
                                      <span className="font-semibold underline decoration-dotted text-gray-700">{profile?.course || 'Computer Science'}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Part B */}
                                <div className="space-y-2 relative z-10">
                                  <h5 className="font-bold text-[#5A5A40] border-b border-[#5A5A40]/10 pb-1 uppercase tracking-wider text-[10px] font-sans">PART B: TO BE FILLED BY COMPANY / FIRM</h5>
                                  <div className="grid grid-cols-2 gap-3 text-left">
                                    <div className="col-span-2">
                                      <span className="text-[8px] text-gray-400 block font-sans">NAME OF ESTABLISHMENT:</span>
                                      <div className="border border-dashed border-gray-300 rounded px-2 py-1.5 bg-amber-50/10 text-amber-800/60 font-semibold italic text-[10px]">
                                        [ COMPANY FILLS THIS: e.g. Chevron Ltd, Interswitch Group, etc. ]
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-[8px] text-gray-400 block font-sans">EXACT RESUMPTION DATE:</span>
                                      <div className="border border-dashed border-gray-300 rounded px-2 py-1.5 bg-amber-50/10 text-amber-800/60 font-semibold italic text-[10px]">
                                        [ COMPANY FILLS THIS: DD / MM / YYYY ]
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-[8px] text-gray-400 block font-sans">PLACEMENT DURATION:</span>
                                      <div className="border border-dashed border-gray-300 rounded px-2 py-1.5 bg-gray-50 text-gray-600 font-semibold text-center text-[10px]">
                                        6 Months (24 Weeks)
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Stamp Block */}
                                <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 relative z-10">
                                  <div className="text-left space-y-1.5 flex-1 w-full">
                                    <p className="text-[8px] text-gray-400 font-sans">SUPERVISOR'S ATTESTATION & SIGN-OFF:</p>
                                    <div className="border-b border-gray-300 w-full h-5 mt-2"></div>
                                    <p className="text-[8px] text-gray-400 font-sans mt-0.5">Industry Supervisor Signature & Date</p>
                                  </div>
                                  <div className="w-28 h-20 border-2 border-dashed border-[#5A5A40]/30 rounded-xl bg-white flex flex-col items-center justify-center p-1 text-center shrink-0">
                                    <span className="text-[8px] text-[#5A5A40] uppercase tracking-wider font-sans font-bold leading-normal">APPLY</span>
                                    <span className="text-[7px] text-gray-300 font-sans font-semibold">COMPANY STAMP</span>
                                    <span className="text-[8px] text-[#5A5A40] uppercase tracking-wider font-sans font-bold leading-normal">HERE</span>
                                  </div>
                                </div>

                                {/* Footer Info */}
                                <div className="text-center pt-2 border-t border-gray-100 text-[8px] text-gray-400 font-sans relative z-10">
                                  This is a visual layout sample of the physical Form 8 resumption template for Lead City University students.
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        <div className="border border-gray-100 rounded-2xl p-5 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-800 text-sm">SCAF (Student Confirmation of Acceptance Form)</h4>
                              <p className="text-xs text-gray-400 mt-0.5">Deadline: Within first 2 weeks of resumption</p>
                            </div>
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-semibold border border-amber-200">Required</span>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            The SCAF (Student Confirmation of Acceptance Form) must be signed and stamped by the firm's Human Resource manager or authorized executive to confirm your placement's legitimacy under the ITF guidelines. The completed form is sent directly to the university coordinator or the nearest ITF Area Office.
                          </p>
                          <button
                            onClick={() => handleDocDownload('SCAF Form')}
                            className="w-full py-2.5 px-4 rounded-xl bg-[#5A5A40] text-white hover:bg-[#4A4A30] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <FileText size={14} /> Download SCAF Form Template
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="border border-gray-100 rounded-2xl p-5 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-800 text-sm">ITF Form 8 (Section B - Monthly Record & Final Grading)</h4>
                              <p className="text-xs text-gray-400 mt-0.5">Deadline: Upon internship completion</p>
                            </div>
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-semibold border border-amber-200">Required</span>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            Upon completing your training, your industry supervisor must fill out **Section B** (Monthly attendance logs) and write a detailed performance appraisal/final grade. The document must be stamped and sealed in a confidential university-headed envelope to be returned to your SIWES supervisor during defense.
                          </p>
                          <button
                            onClick={() => handleDocDownload('ITF Form 8 Final Section')}
                            className="w-full py-2.5 px-4 rounded-xl bg-[#5A5A40] text-white hover:bg-[#4A4A30] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <FileText size={14} /> Download Form 8 Completion Template
                          </button>
                        </div>

                        <div className="border border-gray-100 rounded-2xl p-5 space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-800 text-sm">Technical SIWES Report Writing Guidelines</h4>
                            <p className="text-xs text-gray-400 mt-0.5">Academic presentation rules and report structure</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                            <h5 className="font-semibold text-gray-700 text-xs uppercase tracking-wider">Academic Layout Standards:</h5>
                            <ul className="text-xs text-gray-500 space-y-1.5 list-disc pl-4">
                              <li><strong>Typography:</strong> Use standard font (Times New Roman or Arial), Size 12.</li>
                              <li><strong>Spacing:</strong> Set line spacing to 1.5.</li>
                              <li><strong>Margins:</strong> Left margin must be 1.5 inches (to accommodate report binding). Top, Right, and Bottom margins must be 1.0 inch.</li>
                              <li><strong>Report Structure:</strong>
                                <ul className="pl-4 list-circle space-y-1 mt-1 text-[11px]">
                                  <li><strong>Chapter 1:</strong> Introduction to SIWES scheme & goals.</li>
                                  <li><strong>Chapter 2:</strong> Organization Profile, operations, & hierarchy.</li>
                                  <li><strong>Chapter 3:</strong> Technical work description, skills, & projects done.</li>
                                  <li><strong>Chapter 4:</strong> Summary of learnings, challenges faced, & recommendations.</li>
                                </ul>
                              </li>
                            </ul>
                          </div>
                          <button
                            onClick={() => handleDocDownload('SIWES Technical Report Outline')}
                            className="w-full py-2.5 px-4 rounded-xl bg-[#5A5A40] text-white hover:bg-[#4A4A30] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <FileText size={14} /> Download Technical Report Outline
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Logbook Assistant Floating Widget */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          <AnimatePresence>
            {showAIAssistant && (
              <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="bg-white border border-black/10 shadow-2xl rounded-3xl w-80 mb-4 overflow-hidden flex flex-col">
                <div className="bg-[#5A5A40] text-white p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2"><Zap size={18} /><span className="font-medium text-sm">AI Logbook Assistant</span></div>
                  <button onClick={() => setShowAIAssistant(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors"><X size={16} /></button>
                </div>
                <div className="p-5 flex flex-col gap-4 min-h-[150px] max-h-[300px] overflow-y-auto">
                  <p className="text-sm text-gray-600">Stuck on what to write? Click below to generate a professional draft based on your profile.</p>
                  {isGenerating ? (
                    <div className="flex justify-center py-4"><div className="w-6 h-6 border-2 border-[#5A5A40] border-t-transparent rounded-full animate-spin"></div></div>
                  ) : aiResponse ? (
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm text-gray-700 italic relative mt-2">
                      "{aiResponse}"
                      <button onClick={() => { navigator.clipboard.writeText(aiResponse); toast.success('Draft copied!'); }} className="absolute -top-4 -right-4 bg-[#5A5A40] text-white p-2 rounded-full shadow-md hover:scale-105 transition-transform"><BookOpen size={12} /></button>
                    </div>
                  ) : null}
                  <button onClick={generateAIResponse} disabled={isGenerating} className="w-full bg-amber-100 text-amber-800 font-medium text-sm py-2.5 rounded-xl hover:bg-amber-200 transition-colors mt-auto">Generate Draft</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setShowAIAssistant(!showAIAssistant)} className="bg-[#5A5A40] hover:bg-[#4A4A30] text-white p-4 rounded-full shadow-2xl hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center group">
            <Zap size={24} className={showAIAssistant ? 'text-amber-300' : ''} />
          </button>
        </div>

      </main>
    </div>
    </div>
  );
};

const StudentAssignRow = ({ student, supervisors, companies, token, onSaved }: {
  student: any; supervisors: any[]; companies: any[]; token: string; onSaved: () => void | Promise<void>;
  [key: string]: any;
}) => {


  const [supId, setSupId] = useState<string>(student.school_supervisor_id?.toString() || '');
  const [compId, setCompId] = useState<string>(student.assigned_company_id?.toString() || '');
  const [saving, setSaving] = useState(false);

  const companyName = companies.find((c: any) => c.id === student.assigned_company_id)?.name || '—';

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/admin/students/${student.id}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        school_supervisor_id: supId ? parseInt(supId) : null
      })
    });
    setSaving(false);
    onSaved();
  };

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4">
        <p className="font-medium text-sm">{student.full_name}</p>
        {student.mat_number && <p className="text-[10px] text-emerald-600 font-semibold font-mono tracking-wider">{student.mat_number}</p>}
        <p className="text-xs text-gray-400">{student.email}</p>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{student.course}</td>
      <td className="px-6 py-4">
        <select
          value={supId}
          onChange={e => setSupId(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#5A5A40] w-full"
        >
          <option value="">— None —</option>
          {supervisors.map((s: any) => (
            <option key={s.id} value={s.id}>{s.full_name}</option>
          ))}
        </select>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{companyName}</td>
      <td className="px-6 py-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#5A5A40] text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-[#4A4A30] disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </td>
    </tr>
  );
};

const AdminDashboard = ({ user, token, onLogout }: { user: User, token: string, onLogout: () => void }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [locationRequests, setLocationRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'location_requests' | 'companies' | 'users' | 'students' | 'memos' | 'settings'>('overview');
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [newCompany, setNewCompany] = useState({
    name: '', email: '', industry_type: '', required_skills: '', address: '', latitude: 0, longitude: 0
  });
  const [systemSettings, setSystemSettings] = useState<any[]>([]);
  const [newStaff, setNewStaff] = useState({ full_name: '', email: '', password: '', role: 'SCHOOL_SUPERVISOR' });
  const [newMemo, setNewMemo] = useState({ recipient_group: 'ALL', message: '' });
  const [studentSearch, setStudentSearch] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setAdminLoading(true);
    const headers = { 'Authorization': `Bearer ${token}` };
    if (activeTab === 'overview') {
      const res = await fetch('/api/admin/analytics', { headers });
      setAnalytics(await res.json());
    } else if (activeTab === 'companies') {
      const res = await fetch('/api/admin/companies', { headers });
      setCompanies(await res.json());
    } else if (activeTab === 'users') {
      const res = await fetch('/api/admin/users', { headers });
      setUsers(await res.json());
    } else if (activeTab === 'applications') {
      const res = await fetch('/api/admin/applications', { headers });
      setApplications(await res.json());
    } else if (activeTab === 'location_requests') {
      const res = await fetch('/api/admin/location-requests', { headers });
      setLocationRequests(await res.json());
    } else if (activeTab === 'students') {
      const [sRes, supRes, cRes] = await Promise.all([
        fetch('/api/admin/students', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/companies', { headers })
      ]);
      const allStudents = await sRes.json();
      const allUsers = await supRes.json();
      const allCompanies = await cRes.json();
      setStudents(allStudents);
      setSupervisors(allUsers.filter((u: any) => u.role === 'SCHOOL_SUPERVISOR'));
      setCompanies(allCompanies);
    } else if (activeTab === 'memos') {
      const res = await fetch('/api/admin/analytics', { headers });
      setAnalytics(await res.json());
    } else if (activeTab === 'settings') {
      const res = await fetch('/api/admin/settings', { headers });
      setSystemSettings(await res.json());
    }
    setAdminLoading(false);
  };

  const filteredStudents = students.filter((s: any) =>
    !studentSearch ||
    s.full_name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.course?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.department?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleExportAllStudentsPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF('landscape');
    doc.setFontSize(18);
    doc.text('SIWES — All Students Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Total Students: ${students.length}`, 14, 28);
    autoTable(doc, {
      startY: 36,
      head: [['Name', 'Email', 'Course', 'Department', 'Placed?', 'Supervisor']],
      body: students.map((s: any) => [
        s.full_name,
        s.email,
        s.course || '—',
        s.department || '—',
        s.assigned_company_id ? 'Yes' : 'No',
        supervisors.find((sup: any) => sup.id === s.school_supervisor_id)?.full_name || '—'
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [90, 90, 64] }
    });
    doc.save(`SIWES_All_Students_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`);
    toast.success('PDF downloaded!');
  };

  const handleApproveApplication = async (appId: number, status: string) => {
    const res = await fetch(`/api/admin/applications/${appId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      toast.success(`Application ${status.toLowerCase()}!`);
      fetchData();
    }
  };

  const handleApproveLocationRequest = async (reqId: number, status: string) => {
    const res = await fetch(`/api/admin/location-requests/${reqId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      toast.success(`Location request ${status.toLowerCase()}!`);
      fetchData();
    }
  };

  const handleSendMemo = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const recipient_group = (form.elements.namedItem('recipientGroup') as HTMLSelectElement).value;
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;

    const res = await fetch('/api/admin/memos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ recipient_group, message })
    });
    if (res.ok) {
      toast.success('Memo sent!');
      form.reset();
      fetchData();
    }
  }

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = newCompany.required_skills.split(',').map(s => s.trim()).filter(Boolean);
    const res = await fetch('/api/admin/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...newCompany,
        required_skills: skillsArray
      })
    });
    if (res.ok) {
      toast.success('Company added!');
      fetchData();
      setNewCompany({ name: '', email: '', industry_type: '', required_skills: '', address: '', latitude: 0, longitude: 0 });
    }
  };

  const handleUpdateRole = async (userId: number, role: string) => {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role })
    });
    if (res.ok) {
      toast.success('Role updated!');
      fetchData();
    } else {
      toast.error('Failed to update role. You may lack permission.');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newStaff)
    });
    const data = await res.json();
    if (res.ok) {
      toast.success('Staff account created successfully!');
      fetchData();
      setNewStaff({ full_name: '', email: '', password: '', role: 'SCHOOL_SUPERVISOR' });
    } else {
      toast.error(data.error || 'Failed to create staff account.');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) { toast.success('User deleted!'); fetchData(); } else { toast.error('Failed to delete user.'); }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ key, value }) });
    if (res.ok) { toast.success('Setting updated!'); fetchData(); } else { toast.error('Failed to update setting.'); }
  };

  const handleDownloadBackup = async () => {
    const res = await fetch('/api/admin/backup', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'siwes_backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else { toast.error('Failed to download backup.'); }
  };

  const handleAssign = async (studentId: number, data: { school_supervisor_id?: number | null, assigned_company_id?: number | null }) => {
    const res = await fetch(`/api/admin/students/${studentId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ school_supervisor_id: data.school_supervisor_id, assigned_company_id: data.assigned_company_id })
    });
    if (res.ok) {
      toast.success('Assignments updated!');
      fetchData();
    }
  };

  return (
    <div className="h-screen bg-[#F5F5F0] flex flex-col overflow-hidden">
      {/* Mobile Top Header (hidden on desktop) */}
      <div className="md:hidden flex items-center justify-between bg-white px-6 py-4 border-b border-black/5 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 hover:bg-gray-50 rounded-xl text-gray-600 transition-all cursor-pointer"
          >
            <Menu size={22} />
          </button>
          <h2 className="font-serif text-xl font-medium text-[#5A5A40]">SIWES</h2>
        </div>
        <NotificationBell token={token} />
      </div>

      {/* Mobile Sidebar Navigation Drawer (hidden on desktop) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 w-64 bg-white p-6 flex flex-col z-50 md:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-2xl font-medium text-[#5A5A40]">Admin Panel</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-gray-50 rounded-xl text-gray-400 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
                <button
                  onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-[#5A5A40] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <LayoutDashboard size={18} /> Overview
                </button>
                <button
                  onClick={() => { setActiveTab('applications'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'applications' ? 'bg-[#5A5A40] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <BookOpen size={18} /> Application Reviews
                </button>
                <button
                  onClick={() => { setActiveTab('location_requests'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'location_requests' ? 'bg-[#5A5A40] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <MapIcon size={18} /> Location Requests
                </button>
                <button
                  onClick={() => { setActiveTab('students'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'students' ? 'bg-[#5A5A40] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <GraduationCap size={18} /> Student Assignments
                </button>
                <button
                  onClick={() => { setActiveTab('companies'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'companies' ? 'bg-[#5A5A40] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Building2 size={18} /> Companies
                </button>
                {user.role === 'SUPER_ADMIN' && (
                  <button
                    onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-[#5A5A40] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <Users size={18} /> User Management
                  </button>
                )}
                <button
                  onClick={() => { setActiveTab('memos'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'memos' ? 'bg-[#5A5A40] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Mail size={18} /> Memos & Broadcasts
                </button>
                {user.role === 'SUPER_ADMIN' && (
                  <button
                    onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-[#5A5A40] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <Settings size={18} /> System Settings
                  </button>
                )}
              </nav>

              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all mt-auto cursor-pointer"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden md:flex w-64 bg-white border-r border-black/5 p-6 space-y-8 flex flex-col shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-medium text-[#5A5A40]">Admin Panel</h2>
            <NotificationBell token={token} />
          </div>
          <nav className="space-y-2 flex-1 no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-[#5A5A40] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <LayoutDashboard size={18} /> Overview
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'applications' ? 'bg-[#5A5A40] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <BookOpen size={18} /> Application Reviews
            </button>
            <button
              onClick={() => setActiveTab('location_requests')}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'location_requests' ? 'bg-[#5A5A40] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <MapIcon size={18} /> Location Requests
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'students' ? 'bg-[#5A5A40] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <GraduationCap size={18} /> Student Assignments
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'companies' ? 'bg-[#5A5A40] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Building2 size={18} /> Companies
            </button>
            {user.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-[#5A5A40] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Users size={18} /> User Management
              </button>
            )}
            <button
              onClick={() => setActiveTab('memos')}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'memos' ? 'bg-[#5A5A40] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Mail size={18} /> Memos & Broadcasts
            </button>
            {user.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-[#5A5A40] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Settings size={18} /> System Settings
              </button>
            )}
          </nav>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 mt-auto cursor-pointer">
            <LogOut size={18} /> Sign Out
          </button>
        </div>

      <main className="flex-1 p-4 md:p-10 space-y-6 md:space-y-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && analytics && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif font-medium">System Overview</h1>
                  <p className="text-sm md:text-base text-gray-500 mt-1">Platform health, activity feed, and quick actions.</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-gray-400">Last updated</p>
                  <p className="text-sm font-medium text-[#5A5A40]">{new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </header>

              {/* ── Pending Actions Alert ── */}
              {(analytics.flaggedLogs > 0 || analytics.pendingApplications > 0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-[20px] p-5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={20} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-amber-800 text-sm">Action Required</p>
                    <p className="text-amber-700 text-xs mt-0.5">
                      {analytics.pendingApplications > 0 && `${analytics.pendingApplications} application${analytics.pendingApplications !== 1 ? 's' : ''} waiting for review. `}
                      {analytics.flaggedLogs > 0 && `${analytics.flaggedLogs} flagged logbook entr${analytics.flaggedLogs !== 1 ? 'ies' : 'y'} need attention.`}
                    </p>
                  </div>
                  <button onClick={() => setActiveTab('applications')} className="text-xs font-semibold text-amber-700 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap">
                    Review Now
                  </button>
                </div>
              )}

              {/* ── Stat Cards Row ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <AnimatedStatCard label="Total Students" value={analytics.totalStudents ?? 0} icon={GraduationCap} color="#5A5A40" bg="#5A5A40" subtitle="Registered in system" />
                <AnimatedStatCard label="Placed Students" value={analytics.totalPlacements ?? 0} icon={CheckCircle2} color="#16A34A" bg="#16A34A" subtitle={`${analytics.totalStudents > 0 ? Math.round((analytics.totalPlacements/analytics.totalStudents)*100) : 0}% placement rate`} />
                <AnimatedStatCard label="Companies" value={analytics.totalCompanies ?? 0} icon={Building2} color="#3B82F6" bg="#3B82F6" subtitle="Registered nationwide" />
                <AnimatedStatCard label="Pending Reviews" value={analytics.pendingApplications ?? 0} icon={ClipboardCheck} color="#7C3AED" bg="#7C3AED" subtitle={analytics.pendingApplications > 0 ? "⚠ Action required" : "All clear"} />
              </div>

              {/* ── Second Row ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen size={16} className="text-gray-400" />
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Logbook Entries</p>
                  </div>
                  <p className="text-3xl font-bold text-[#1A1A1A]">{analytics.totalLogs ?? 0}</p>
                  <p className="text-xs text-gray-400 mt-1">Total submitted</p>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={16} className="text-gray-400" />
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Supervisors</p>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">{analytics.activeSupervisors}</p>
                  <p className="text-xs text-gray-400 mt-1">Active in system</p>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 size={16} className="text-gray-400" />
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Companies</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{analytics.totalCompanies}</p>
                  <p className="text-xs text-gray-400 mt-1">Registered nationwide</p>
                </div>
              </div>

              {/* ── Visual Analytics (Recharts) ── */}
              {analytics.dailyLogs && analytics.dailyLogs.length > 0 && (
                <div className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">Daily Logbook Submissions (Last 7 Days)</h3>
                    <BarChart2 size={16} className="text-gray-400" />
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.dailyLogs}>
                        <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#9ca3af" />
                        <YAxis allowDecimals={false} tick={{fontSize: 12}} stroke="#9ca3af" />
                        <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="count" fill="#5A5A40" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* ── Main Content Row ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Placement Progress */}
                <div className="col-span-1 bg-white rounded-[24px] border border-black/5 shadow-sm p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Placement Progress</h3>
                    <TrendingUp size={16} className="text-[#5A5A40]" />
                  </div>
                  {/* Big donut-style stat */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Placed', value: analytics.totalPlacements ?? 0 },
                              { name: 'Pending', value: analytics.unplacedStudents ?? 0 }
                            ]}
                            innerRadius={30}
                            outerRadius={45}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell fill="#5A5A40" />
                            <Cell fill="#F3F4F6" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-[#5A5A40]">
                          {analytics.totalStudents > 0 ? Math.round(((analytics.totalPlacements ?? 0) / analytics.totalStudents) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex justify-between text-xs"><span className="text-gray-500">Placed</span><span className="font-semibold text-emerald-600">{analytics.totalPlacements ?? 0}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-gray-500">Pending</span><span className="font-semibold text-amber-500">{analytics.unplacedStudents ?? 0}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-gray-500">Total</span><span className="font-semibold">{analytics.totalStudents ?? 0}</span></div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${analytics.totalStudents > 0 ? (analytics.totalPlacements / analytics.totalStudents) * 100 : 0}%`, background: '#5A5A40' }}
                    />
                  </div>
                </div>

                {/* Logbook Status */}
                <div className="col-span-1 bg-white rounded-[24px] border border-black/5 shadow-sm p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Logbook Status</h3>
                    <BookOpen size={16} className="text-gray-400" />
                  </div>
                  {[
                    { label: 'Verified',       value: analytics.verifiedLogs ?? 0, color: '#16A34A', bg: '#DCFCE7' },
                    { label: 'Pending Review', value: analytics.pendingLogs  ?? 0, color: '#D97706', bg: '#FEF3C7' },
                    { label: 'Flagged',        value: analytics.flaggedLogs  ?? 0, color: '#DC2626', bg: '#FEE2E2' },
                  ].map((item, i) => {
                    const catTotal = (analytics.verifiedLogs ?? 0) + (analytics.pendingLogs ?? 0) + (analytics.flaggedLogs ?? 0) || 1;
                    const pct = Math.min(100, Math.round((item.value / catTotal) * 100));
                    const pctLabel = pct + '%';
                    return (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold" style={{ color: item.color }}>{item.label}</span>
                          <span className="font-bold text-gray-700">
                            {item.value}
                            <span className="text-gray-400 font-normal ml-1">({pctLabel})</span>
                          </span>
                        </div>
                        <div className="w-full rounded-full h-2" style={{ background: item.bg }}>
                          <div
                            className="h-2 rounded-full transition-all duration-700"
                            style={{ width: pctLabel, background: item.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Department Breakdown */}
                <div className="col-span-1 bg-white rounded-[24px] border border-black/5 shadow-sm p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">By Department</h3>
                    <GraduationCap size={16} className="text-gray-400" />
                  </div>
                  {analytics.deptBreakdown?.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No department data yet</p>
                  )}
                  {analytics.deptBreakdown?.map((d: any, i: number) => {
                    const maxCount = analytics.deptBreakdown[0]?.count || 1;
                    const colors = ['#5A5A40','#3B82F6','#7C3AED','#16A34A','#D97706','#DC2626'];
                    return (
                      <div key={i}>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="font-medium text-gray-700 truncate max-w-[120px]">{d.department}</span>
                          <span className="font-bold text-gray-600">{d.count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full transition-all" style={{ width: `${(d.count / maxCount) * 100}%`, background: colors[i % colors.length] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Bottom Row: Quick Actions + Recent Activity ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Quick Actions */}
                <div className="col-span-1 bg-white rounded-[24px] border border-black/5 shadow-sm p-6 space-y-3">
                  <h3 className="font-semibold text-sm mb-4">Quick Actions</h3>
                  {[
                    { label: 'Review Applications', icon: ClipboardCheck, tab: 'applications', color: '#7C3AED' },
                    { label: 'Assign Supervisors', icon: Users, tab: 'students', color: '#5A5A40' },
                    { label: 'Manage Companies', icon: Building2, tab: 'companies', color: '#3B82F6' },
                    { label: 'Send Broadcast', icon: Mail, tab: 'memos', color: '#D97706' },
                  ].map((action, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTab(action.tab as any)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{ background: action.color + '12' }}>
                        <action.icon size={16} style={{ color: action.color }} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-[#1A1A1A]">{action.label}</span>
                      <span className="ml-auto text-gray-300 group-hover:text-gray-400">›</span>
                    </button>
                  ))}
                </div>

                {/* Recent Activity Feed */}
                <div className="lg:col-span-2 bg-white rounded-[24px] border border-black/5 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-semibold text-sm">Recent Activity</h3>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">Live feed</span>
                  </div>
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {(!analytics.recentActivity || analytics.recentActivity.length === 0) && (
                      <div className="py-8 text-center text-gray-400">
                        <BookOpen size={28} className="mx-auto mb-2 text-gray-200" />
                        <p className="text-sm">No activity yet</p>
                      </div>
                    )}
                    {analytics.recentActivity?.map((act: any, i: number) => {
                      const isLog = act.type === 'logbook';
                      const statusColor = act.detail === 'VERIFIED' ? '#16A34A'
                        : act.detail === 'FLAGGED' ? '#DC2626'
                        : act.detail === 'APPROVED' ? '#16A34A'
                        : act.detail === 'REJECTED' ? '#DC2626'
                        : '#D97706';
                      return (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLog ? 'bg-blue-50' : 'bg-purple-50'}`}>
                            {isLog ? <BookOpen size={14} className="text-blue-500" /> : <ClipboardCheck size={14} className="text-purple-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-800 truncate">
                              <span className="text-[#5A5A40] font-semibold">{act.actor}</span>
                              {isLog ? ' submitted a logbook entry' : ' submitted an application'}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ color: statusColor, background: statusColor + '15' }}>
                                {act.detail}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(act.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'companies' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="col-span-1 lg:col-span-1 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[32px] border border-black/5 shadow-sm h-fit">
                <h3 className="font-serif text-xl mb-6">Add New Company</h3>
                <form onSubmit={handleAddCompany} className="space-y-4">
                  <input placeholder="Company Name" value={newCompany.name} onChange={e => setNewCompany({ ...newCompany, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200" />
                  <input placeholder="Email" value={newCompany.email} onChange={e => setNewCompany({ ...newCompany, email: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200" />
                  <input placeholder="Industry" value={newCompany.industry_type} onChange={e => setNewCompany({ ...newCompany, industry_type: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200" required />
                  <textarea
                    placeholder="Required Skills (comma separated, e.g. Python, React)"
                    value={newCompany.required_skills}
                    onChange={e => setNewCompany({ ...newCompany, required_skills: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 min-h-[80px]"
                  />
                  <input placeholder="Address" value={newCompany.address} onChange={e => setNewCompany({ ...newCompany, address: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200" required />
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Lat" type="number" step="any" value={newCompany.latitude} onChange={e => setNewCompany({ ...newCompany, latitude: parseFloat(e.target.value) })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200" />
                    <input placeholder="Long" type="number" step="any" value={newCompany.longitude} onChange={e => setNewCompany({ ...newCompany, longitude: parseFloat(e.target.value) })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200" />
                  </div>
                  <button className="w-full bg-[#5A5A40] text-white py-4 rounded-full font-medium">Register Company</button>
                </form>
              </div>
              <div className="col-span-1 lg:col-span-2 space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm flex items-center gap-3">
                  <Search size={18} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search companies by name or industry..."
                    value={companySearchQuery}
                    onChange={(e) => setCompanySearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none focus:outline-none text-sm"
                  />
                </div>
                {companies.filter(company =>
                  company.name.toLowerCase().includes(companySearchQuery.toLowerCase()) ||
                  company.industry_type.toLowerCase().includes(companySearchQuery.toLowerCase())
                ).map((company, i) => (
                  <div key={i} className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-[#5A5A40]"><Building2 size={24} /></div>
                      <div><h4 className="font-medium">{company.name}</h4><p className="text-xs text-gray-400">{company.industry_type} • {company.address}</p></div>
                    </div>
                    <div className="text-right"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Geofence</p><p className="text-xs font-medium">{company.latitude.toFixed(4)}, {company.longitude.toFixed(4)}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <motion.div key="students" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <header className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif font-medium">Student Assignments</h1>
                  <p className="text-gray-500">Assign school supervisors and placement companies to students.</p>
                </div>
                <button onClick={handleExportAllStudentsPDF} className="flex items-center gap-2 border border-[#5A5A40] text-[#5A5A40] px-5 py-3 rounded-full text-sm font-medium hover:bg-[#5A5A40]/5 transition-colors">
                  ↓ Export All PDF
                </button>
              </header>
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, course, department, or email…"
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40] text-sm shadow-sm"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                {studentSearch && (
                  <button onClick={() => setStudentSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">✕ Clear</button>
                )}
              </div>
              <p className="text-sm text-gray-400">{filteredStudents.length} of {students.length} students</p>
              <div className="bg-white rounded-2xl sm:rounded-[32px] border border-black/5 shadow-sm overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Student</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Course</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">School Supervisor</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Current Company</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredStudents.map((s: any) => (
                      <StudentAssignRow
                        key={s.id}
                        student={s}
                        supervisors={supervisors}
                        companies={companies}
                        token={token}
                        onSaved={fetchData}
                      />
                    ))}
                  </tbody>
                </table>
                {filteredStudents.length === 0 && (
                  <div className="text-center py-16 text-gray-400">
                    {studentSearch ? 'No students match your search.' : 'No students registered yet.'}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && user.role === 'SUPER_ADMIN' && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <header className="mb-8">
                <h1 className="text-2xl md:text-3xl font-serif font-medium">User Role Management</h1>
                <p className="text-gray-500">Assign system roles and provision new staff accounts.</p>
              </header>

              <div className="bg-white p-6 rounded-2xl border border-black/5 mb-8 shadow-sm">
                <h3 className="font-medium mb-4">Create New Staff Account</h3>
                <form onSubmit={handleCreateStaff} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input placeholder="Full Name" required value={newStaff.full_name} onChange={e => setNewStaff({...newStaff, full_name: e.target.value})} className="border rounded-xl px-4 py-2 text-sm" />
                  <input type="email" placeholder="Email Address" required value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} className="border rounded-xl px-4 py-2 text-sm" />
                  <input type="password" placeholder="Password" required value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} className="border rounded-xl px-4 py-2 text-sm" />
                  <div className="flex gap-2">
                    <select value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} className="border rounded-xl px-4 py-2 text-sm flex-1">
                      <option value="SCHOOL_SUPERVISOR">Supervisor</option>
                      <option value="ADMIN">Sub-Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                    <button type="submit" className="bg-[#5A5A40] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4A4A30] shrink-0">Add</button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-2xl sm:rounded-[32px] border border-black/5 shadow-sm overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Name</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Email</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Current Role</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((u, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium">{u.full_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-2 items-center">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                          >
                            <option value="STUDENT">Student</option>
                            <option value="SCHOOL_SUPERVISOR">School Supervisor</option>
                            <option value="ADMIN">Admin</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                          </select>
                          <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors" title="Delete User">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && user.role === 'SUPER_ADMIN' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <header className="mb-8">
                <h1 className="text-2xl md:text-3xl font-serif font-medium">System Settings Hub</h1>
                <p className="text-gray-500">Global configurations, database backups, and god-mode controls.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                  <h3 className="font-serif text-lg font-medium mb-4 flex items-center gap-2">
                    <Settings className="text-gray-400" size={20} />
                    Global Parameters
                  </h3>
                  <div className="space-y-6">
                    {systemSettings.map(setting => (
                      <div key={setting.key}>
                        <label className="block text-sm font-medium mb-1">{setting.key.replace(/_/g, ' ')}</label>
                        <p className="text-xs text-gray-500 mb-2">{setting.description}</p>
                        <div className="flex gap-2">
                          <input 
                            value={setting.value} 
                            onChange={(e) => setSystemSettings(systemSettings.map(s => s.key === setting.key ? { ...s, value: e.target.value } : s))}
                            className="border rounded-xl px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-[#5A5A40]" 
                          />
                          <button onClick={() => handleUpdateSetting(setting.key, setting.value)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200">
                            Save
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm flex flex-col items-start justify-center">
                  <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mb-4">
                    <Activity size={24} />
                  </div>
                  <h3 className="font-serif text-lg font-medium mb-2">Full Database Backup</h3>
                  <p className="text-sm text-gray-500 mb-6">Download a complete snapshot of all users, companies, students, and logs in JSON format for safekeeping.</p>
                  <button onClick={handleDownloadBackup} className="bg-[#5A5A40] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#4A4A30] w-full shadow-md">
                    Download Backup (.json)
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'applications' && (
            <motion.div key="applications" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <header className="mb-8">
                <h1 className="text-2xl md:text-3xl font-serif font-medium">Application Reviews</h1>
                <p className="text-gray-500">Approve or reject student placement applications based on their acceptance letters.</p>
              </header>
              <div className="grid grid-cols-1 gap-4">
                {applications.map((app, i) => (
                  <div key={i} className="bg-white p-5 sm:p-6 rounded-[24px] border border-black/5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="font-medium">{app.full_name}</h4>
                      <p className="text-xs text-gray-400">Applied to: {app.company_name}</p>
                      {app.acceptance_letter_url && (
                        <a href={app.acceptance_letter_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                          View Acceptance Letter (PDF/Img)
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          app.status === 'ACCEPTED_BY_COMPANY' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                        }`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                      {app.status === 'ACCEPTED_BY_COMPANY' && (
                        <div className="flex gap-2 border-l border-gray-100 pl-4">
                          <button onClick={() => handleApproveApplication(app.id, 'APPROVED')} className="bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-600">
                            Approve
                          </button>
                          <button onClick={() => handleApproveApplication(app.id, 'REJECTED')} className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600">
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'location_requests' && (
            <motion.div key="location_requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <header className="mb-8">
                <h1 className="text-2xl md:text-3xl font-serif font-medium">Location Change Requests</h1>
                <p className="text-gray-500">Review student letters requesting a change of their Geofence location.</p>
              </header>
              <div className="grid grid-cols-1 gap-4">
                {locationRequests.length === 0 && (
                   <div className="bg-white p-8 text-center text-gray-500 rounded-[24px] border border-black/5 shadow-sm">
                     No pending location requests.
                   </div>
                )}
                {locationRequests.map((req, i) => (
                  <div key={i} className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-lg text-[#5A5A40]">{req.full_name}</h4>
                      <p className="text-xs text-gray-400 mb-3">{req.email}</p>
                      
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 italic">
                        "{req.reason}"
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2">Requested on: {new Date(req.created_at).toLocaleString()}</p>
                    </div>
                    
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 mt-4 md:mt-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider md:mb-4 ${req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                        {req.status}
                      </span>
                      {req.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveLocationRequest(req.id, 'APPROVED')} className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/20">
                            Approve
                          </button>
                          <button onClick={() => handleApproveLocationRequest(req.id, 'REJECTED')} className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-red-600 transition-colors shadow-sm shadow-red-500/20">
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'memos' && (
            <motion.div key="memos" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <header className="mb-8">
                <h1 className="text-2xl md:text-3xl font-serif font-medium">Broadcast Memos</h1>
                <p className="text-gray-500">Send announcements to specific user groups.</p>
              </header>

              <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[32px] border border-black/5 shadow-sm max-w-2xl">
                <form onSubmit={handleSendMemo} className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Recipient Group</label>
                    <select
                      name="recipientGroup"
                      value={newMemo.recipient_group}
                      onChange={(e) => setNewMemo({ ...newMemo, recipient_group: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                    >
                      <option value="ALL">All Users</option>
                      <option value="STUDENTS">All Students</option>
                      <option value="SUPERVISORS">All Supervisors</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Message</label>
                    <textarea
                      name="message"
                      value={newMemo.message}
                      onChange={(e) => setNewMemo({ ...newMemo, message: e.target.value })}
                      placeholder="Type your announcement here..."
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40] min-h-[150px]"
                      required
                    />
                  </div>
                  <button type="submit" className="bg-[#5A5A40] text-white px-8 py-4 rounded-full font-medium hover:bg-[#4A4A30] transition-colors">
                    Send Broadcast
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      </div>
    </div>
  );
};

const SupervisorDashboard = ({ user, token, onLogout }: { user: User, token: string, onLogout: () => void }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [memos, setMemos] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentLogs, setStudentLogs] = useState<any[]>([]);
  const [studentAssessment, setStudentAssessment] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'logbooks' | 'assessments' | 'memos'>('dashboard');
  const [assessmentForm, setAssessmentForm] = useState({ grade: '', remarks: '' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const headers = { 'Authorization': `Bearer ${token}` };
    const [sRes, mRes] = await Promise.all([
      fetch('/api/supervisor/students', { headers }),
      fetch('/api/memos', { headers })
    ]);
    if (sRes.ok) setStudents(await sRes.json());
    if (mRes.ok) setMemos(await mRes.json());
  };

  const handleViewStudent = async (student: any) => {
    setSelectedStudent(student);
    setActiveTab('logbooks'); // Default to logbooks when viewing a student
    const headers = { 'Authorization': `Bearer ${token}` };
    const [logRes, gradeRes] = await Promise.all([
      fetch(`/api/supervisor/students/${student.id}/logbook`, { headers }),
      fetch(`/api/supervisor/students/${student.id}/grade`, { headers })
    ]);
    setStudentLogs(await logRes.json());
    const gradeData = await gradeRes.json();
    setStudentAssessment(gradeData);
    setAssessmentForm({
      grade: gradeData.school_grade || '',
      remarks: gradeData.final_remarks || ''
    });
  };

  const handleComment = async (logId: number, comment: string) => {
    await fetch(`/api/supervisor/logbook/${logId}/comment`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ comment })
    });
    // Refresh logbook
    if (selectedStudent) handleViewStudent(selectedStudent);
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const body = {
      grade: parseFloat(assessmentForm.grade),
      final_remarks: assessmentForm.remarks
    };

    const res = await fetch(`/api/supervisor/students/${selectedStudent.id}/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      toast.success('Assessment saved successfully!');
      handleViewStudent(selectedStudent);
    } else {
      const data = await res.json();
      toast.error(data.error || 'Failed to save assessment.');
    }
  };



  return (
    <div className="h-screen bg-[#F5F5F0] flex flex-col overflow-hidden">
      {/* Mobile Top Header (hidden on desktop) */}
      <div className="md:hidden flex items-center justify-between bg-white px-6 py-4 border-b border-black/5 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 hover:bg-gray-50 rounded-xl text-gray-600 transition-all cursor-pointer"
          >
            <Menu size={22} />
          </button>
          <h2 className="font-serif text-xl font-medium text-[#5A5A40]">SIWES</h2>
        </div>
        <NotificationBell token={token} />
      </div>

      {/* Mobile Sidebar Navigation Drawer (hidden on desktop) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 w-64 bg-white p-6 flex flex-col z-50 md:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-2xl font-medium text-[#5A5A40]">Supervisor</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-gray-50 rounded-xl text-gray-400 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
                <button
                  onClick={() => { setSelectedStudent(null); setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <LayoutDashboard size={18} /> Dashboard
                </button>
                <button
                  onClick={() => { setSelectedStudent(null); setActiveTab('students'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'students' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Users size={18} /> My Students
                </button>
                {selectedStudent && (
                  <>
                    <button
                      onClick={() => { setActiveTab('logbooks'); setIsMobileMenuOpen(false); }}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'logbooks' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <BookOpen size={18} /> Review Logbooks
                    </button>
                    <button
                      onClick={() => { setActiveTab('assessments'); setIsMobileMenuOpen(false); }}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'assessments' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <ClipboardCheck size={18} /> Assessments
                    </button>
                  </>
                )}
                <button
                  onClick={() => { setSelectedStudent(null); setActiveTab('memos'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'memos' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <AlertCircle size={18} /> Memos & Broadcasts
                </button>
              </nav>

              <div className="pt-6 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-3 px-4 py-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[#5A5A40]">
                    <UserCircle size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate">{user.fullName}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{user.role.replace('_', ' ')}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden md:flex w-64 bg-white border-r border-black/5 p-6 space-y-8 flex flex-col shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-medium text-[#5A5A40]">Supervisor</h2>
            <NotificationBell token={token} />
          </div>
          <nav className="space-y-2 flex-1 no-scrollbar">
            <button
              onClick={() => { setSelectedStudent(null); setActiveTab('dashboard'); }}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button
              onClick={() => { setSelectedStudent(null); setActiveTab('students'); }}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'students' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Users size={18} /> My Students
            </button>
            {selectedStudent && (
              <>
                <button
                  onClick={() => setActiveTab('logbooks')}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'logbooks' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <BookOpen size={18} /> Review Logbooks
                </button>
                <button
                  onClick={() => setActiveTab('assessments')}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'assessments' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <ClipboardCheck size={18} /> Assessments
                </button>
              </>
            )}
            <button
              onClick={() => { setSelectedStudent(null); setActiveTab('memos'); }}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'memos' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <AlertCircle size={18} /> Memos & Broadcasts
            </button>
          </nav>
          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 px-4 py-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[#5A5A40]">
                <UserCircle size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{user.fullName}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>

      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif font-medium text-[#1A1A1A]">Welcome back, {user.fullName.split(' ')[0]}</h1>
                  <p className="text-gray-500 mt-1">Here's a snapshot of your students' progress.</p>
                </div>
                <p className="text-sm text-gray-400 font-medium">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </header>

              {/* ── Stat Cards ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <AnimatedStatCard label="Assigned Students" value={students.length} icon={Users} color="#5A5A40" bg="#5A5A40" subtitle="Under your supervision" />
                <AnimatedStatCard label="Pending Reviews" value={students.filter((s: any) => !s.assigned_company_name).length} icon={AlertCircle} color="#D97706" bg="#D97706" subtitle="Awaiting placement" />
                <AnimatedStatCard label="Placed Students" value={students.filter((s: any) => s.assigned_company_name).length} icon={CheckCircle2} color="#16A34A" bg="#16A34A" subtitle="Successfully placed" />
                <AnimatedStatCard label="Memos Received" value={memos.length} icon={Mail} color="#7C3AED" bg="#7C3AED" subtitle={memos.length > 0 ? `Latest: ${new Date(memos[0]?.created_at).toLocaleDateString('en-GB', {day:'numeric',month:'short'})}` : 'No memos'} />
              </div>

              {/* ── Main Row ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Student Status List */}
                <div className="lg:col-span-2 bg-white rounded-[24px] border border-black/5 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-semibold text-sm">Your Students</h3>
                    <button onClick={() => setActiveTab('students')} className="text-xs text-[#5A5A40] font-medium hover:underline">View all →</button>
                  </div>
                  {students.length === 0 ? (
                    <div className="py-10 text-center text-gray-400">
                      <Users size={32} className="mx-auto mb-2 text-gray-200" />
                      <p className="text-sm">No students assigned yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {students.slice(0, 6).map((s: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => handleViewStudent(s)}>
                          <div className="w-9 h-9 rounded-full bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40] font-bold text-sm flex-shrink-0">
                            {s.full_name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{s.full_name}</p>
                            {s.mat_number && <p className="text-[10px] text-emerald-600 font-semibold font-mono tracking-wider">{s.mat_number}</p>}
                            <p className="text-xs text-gray-400 truncate">{s.course} {s.department ? `• ${s.department}` : ''}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {s.assigned_company_name ? (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">Placed</span>
                            ) : (
                              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">Pending</span>
                            )}
                            <span className="text-gray-300 group-hover:text-gray-500 text-sm">›</span>
                          </div>
                        </div>
                      ))}
                      {students.length > 6 && (
                        <button onClick={() => setActiveTab('students')} className="w-full py-2 text-xs text-[#5A5A40] font-medium hover:bg-gray-50 rounded-xl transition-colors">
                          +{students.length - 6} more students
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Actions + Latest Memo */}
                <div className="col-span-1 space-y-5">
                  <div className="bg-white rounded-[24px] border border-black/5 shadow-sm p-6 space-y-3">
                    <h3 className="font-semibold text-sm mb-1">Quick Actions</h3>
                    {[
                      { label: 'View My Students', icon: Users, tab: 'students', color: '#5A5A40' },
                      { label: 'Read Memos', icon: Mail, tab: 'memos', color: '#7C3AED' },
                    ].map((action, i) => (
                      <button key={i} onClick={() => setActiveTab(action.tab as any)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-left group">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: action.color + '12' }}>
                          <action.icon size={16} style={{ color: action.color }} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{action.label}</span>
                        <span className="ml-auto text-gray-300">›</span>
                      </button>
                    ))}
                  </div>

                  {/* Latest Memo */}
                  {memos.length > 0 && (
                    <div className="bg-[#5A5A40] rounded-[24px] p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Mail size={14} className="text-white/70" />
                        <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Latest Memo</p>
                      </div>
                      <p className="text-sm text-white leading-relaxed line-clamp-3">{memos[0].message}</p>
                      <p className="text-[10px] text-white/50 mt-3">
                        {new Date(memos[0].created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'students' && (
            <motion.div
              key="students"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif font-medium">Assigned Students</h1>
                  <p className="text-gray-500">Monitor progress and verify logbooks for your assigned students.</p>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((s, i) => (
                  <div key={i} className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-[#5A5A40]">
                        <UserCircle size={24} />
                      </div>
                      <div>
                        <h4 className="font-medium">{s.full_name}</h4>
                        {s.mat_number && <p className="text-[10px] text-emerald-600 font-semibold font-mono tracking-wider">{s.mat_number}</p>}
                        <p className="text-xs text-gray-400">{s.course}</p>
                        <div className="mt-1 flex gap-2">
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">School Supervisor</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewStudent(s)}
                      className="w-full bg-gray-50 text-gray-600 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'logbooks' && selectedStudent && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <header className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl md:text-3xl font-serif font-medium">{selectedStudent.full_name}'s Logbook</h1>
                  <p className="text-gray-500 font-medium font-mono text-sm text-emerald-600">
                    {selectedStudent.mat_number || 'NO MATRIC'} 
                    <span className="text-gray-400 font-sans font-normal ml-2">| {selectedStudent.course} • {selectedStudent.department}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Back to Students
                </button>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-serif text-xl">Logbook Entries</h3>
                  {studentLogs.length === 0 ? (
                    <p className="text-gray-500">No logbook entries found.</p>
                  ) : (
                    studentLogs.map((log, i) => (
                      <div key={i} className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-1 w-full">
                            <div className="flex sm:flex-col items-center gap-2 sm:gap-0 sm:text-center min-w-[60px]">
                              <span className="text-xs font-bold text-gray-400 uppercase">{log.date.split('-')[1]}/{log.date.split('-')[2]}</span>
                              <span className="hidden sm:block text-xl font-serif">{log.date.split('-')[0]}</span>
                              <span className="sm:hidden text-xs text-gray-400">({log.date.split('-')[0]})</span>
                            </div>
                            <div className="hidden sm:block h-10 w-px bg-gray-100"></div>
                            <div>
                              <p className="font-medium text-sm sm:text-base">{log.activity_description}</p>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <StatusBadge status={log.verification_status} />
                                <DistanceIndicator distance={log.distance_from_company ?? 0} status={log.verification_status} />
                              </div>
                            </div>
                          </div>
                          {log.attachment_url && (
                            <a href={log.attachment_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline shrink-0 pt-2 sm:pt-0">
                              View Attachment
                            </a>
                          )}
                        </div>

                        <LogbookComment log={log} onSave={handleComment} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'assessments' && selectedStudent && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <header className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl md:text-3xl font-serif font-medium">{selectedStudent.full_name}'s Assessment</h1>
                  <p className="text-gray-500 font-medium font-mono text-sm text-emerald-600">
                    {selectedStudent.mat_number || 'NO MATRIC'} 
                    <span className="text-gray-400 font-sans font-normal ml-2">| {selectedStudent.course} • {selectedStudent.department}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Back to Students
                </button>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm">
                    <h3 className="font-serif text-xl mb-4">Submit Assessment</h3>
                    <form onSubmit={handleGrade} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">
                          {user.role === 'SCHOOL_SUPERVISOR' ? 'School Grade (out of 100)' : 'Industry Grade (out of 100)'}
                        </label>
                        <input
                          type="number"
                          min="0" max="100"
                          value={assessmentForm.grade}
                          onChange={(e) => setAssessmentForm({ ...assessmentForm, grade: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Final Remarks</label>
                        <textarea
                          value={assessmentForm.remarks}
                          onChange={(e) => setAssessmentForm({ ...assessmentForm, remarks: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                          rows={4}
                        />
                      </div>
                      <button type="submit" className="w-full bg-[#5A5A40] text-white py-3 rounded-xl font-medium hover:bg-[#4A4A30] transition-colors">
                        Save Assessment
                      </button>
                    </form>
                  </div>

                  {(studentAssessment.school_grade || studentAssessment.industry_grade || studentAssessment.final_remarks) && (
                    <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-200">
                      <h4 className="font-medium text-sm text-gray-500 mb-3">Current Grades</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>School Grade:</span>
                          <span className="font-bold">{studentAssessment.school_grade || '-'} / 100</span>
                        </div>

                        <div className="text-sm">
                          <span className="block text-gray-500">Remarks:</span>
                          <span className="font-bold">{studentAssessment.final_remarks || 'None'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'memos' && (
            <motion.div
              key="memos"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <header>
                <h1 className="text-2xl md:text-3xl font-serif font-medium text-[#1A1A1A]">Memos & Broadcasts</h1>
                <p className="text-gray-500 mt-1">Important updates from administration.</p>
              </header>

              <div className="bg-amber-50 border border-amber-100 text-amber-700 text-sm px-5 py-3 rounded-2xl mb-6">
                Memos are sent by the Admin. You can view them here.
              </div>

              <div className="space-y-4">
                {memos.length === 0 ? (
                  <div className="bg-white p-6 sm:p-12 rounded-2xl sm:rounded-[32px] border border-black/5 shadow-sm text-center">
                    <p className="text-gray-500">No memos to display.</p>
                  </div>
                ) : (
                  memos.map((memo, i) => (
                    <div key={i} className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#5A5A40]/10 rounded-full flex items-center justify-center text-[#5A5A40]">
                            <AlertCircle size={20} />
                          </div>
                          <div>
                            <p className="font-medium">{memo.sender_name}</p>
                            <p className="text-xs text-gray-400">{new Date(memo.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase py-1 px-2 bg-gray-100 rounded-full">{memo.recipient_group}</span>
                      </div>
                      <p className="text-gray-700">{memo.message}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved session from localStorage on first render
  useEffect(() => {
    const savedToken = localStorage.getItem('siwes_token');
    const savedUser = localStorage.getItem('siwes_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('siwes_token');
        localStorage.removeItem('siwes_user');
      }
    }
  }, []);

  const handleLogin = (u: User, t: string) => {
    localStorage.setItem('siwes_token', t);
    localStorage.setItem('siwes_user', JSON.stringify(u));
    setUser(u);
    setToken(t);
  };

  const handleLogout = () => {
    localStorage.removeItem('siwes_token');
    localStorage.removeItem('siwes_user');
    setUser(null);
    setToken(null);
    toast.success('Signed out successfully');
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <AnimatePresence>
        {isLoading && <LoadingScreen onDone={() => setIsLoading(false)} />}
      </AnimatePresence>
      {!isLoading && (
        <>
          {(!user || !token) && <Login onLogin={handleLogin} />}
          {user && token && user.role === 'STUDENT' && <StudentDashboard user={user} token={token} onLogout={handleLogout} />}
          {user && token && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && <AdminDashboard user={user} token={token} onLogout={handleLogout} />}
          {user && token && user.role === 'SCHOOL_SUPERVISOR' && <SupervisorDashboard user={user} token={token} onLogout={handleLogout} />}
        </>
      )}
    </>
  );
}

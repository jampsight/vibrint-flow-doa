import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Activity, 
  Shield, 
  Sparkles,
  BarChart3,
  LogOut,
  ChevronDown,
  Clock,
  Send,
  UserCheck,
  Edit3,
  RefreshCcw,
  WifiOff,
  History,
  AlertTriangle,
  Share2
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  updateDoc, 
  doc, 
  orderBy, 
  serverTimestamp
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

/**
 * --- ⚠️ FIREBASE CONFIGURATION ⚠️ ---
 * 1. Create a Firebase Project at https://console.firebase.google.com/
 * 2. Enable Firestore (Test Mode) and Auth (Anonymous).
 * 3. Copy your config object below.
 */

const FIREBASE_CONFIG = {apiKey: "AIzaSyBAOP15-SBysqKO6FdEXiNZAq4y7DaaZgQ",
  authDomain: "vibrint-hackaton.firebaseapp.com",
  projectId: "vibrint-hackaton",
  storageBucket: "vibrint-hackaton.firebasestorage.app",
  messagingSenderId: "311004162846",
  appId: "1:311004162846:web:3d416c577d238a00b2b70f",
  measurementId: "G-QKTT0Q58TL"
}
  
// --- VIBRINT DATA (SYNTHETIC FOR HACKATHON) ---
const VIBRINT_ROLES = [
  { id: 'ceo', name: 'Sarah Sterling', title: 'CEO', department: 'Executive' },
  { id: 'cfo', name: 'Michael Merchant', title: 'CFO', department: 'Finance' },
  { id: 'coo', name: 'Oscar Operations', title: 'COO', department: 'Operations' },
  { id: 'cso', name: 'Stacy Strategy', title: 'CSO', department: 'Strategy' },
  { id: 'cgo', name: 'Gary Growth', title: 'CGO', department: 'Growth' },
  { id: 'cao', name: 'Alex Admin', title: 'CAO', department: 'Admin' },
  { id: 'ciso', name: 'Sam Security', title: 'CISO', department: 'Security' },
  { id: 'gm_prod', name: 'Pat Product', title: 'GM Products', department: 'Products' },
  { id: 'vp_hr', name: 'Harry HR', title: 'VP HR', department: 'HR' },
  { id: 'vp_sales', name: 'Sally Sales', title: 'VP Sales', department: 'Sales' },
  { id: 'user_1', name: 'Alice Engineer', title: 'Software Engineer', department: 'Engineering' },
];

const DELEGATION_RULES = [
  { category: 'Communications', item: 'Employee "Swag" Purchases', approvers: ['gm_prod', 'cfo'], backup: 'vp_sales', risk: 'Low' },
  { category: 'Communications', item: 'Posts on Social Media', approvers: ['cao'], backup: 'vp_hr', risk: 'Medium' },
  { category: 'Compliance', item: 'AI Use Approval', approvers: ['cao', 'cso'], backup: 'coo', risk: 'High' },
  { category: 'Compliance', item: 'Personnel Security Risk', approvers: ['cao'], backup: 'coo', risk: 'High' },
  { category: 'Contract Documents', item: 'NDA Signature', approvers: ['cao'], backup: 'coo', risk: 'Low' },
  { category: 'Contract Documents', item: 'Teaming Agreement', approvers: ['cgo'], backup: 'gm_prod', risk: 'Medium' },
  { category: 'Corporate', item: 'Indirect Travel Requests', approvers: ['gm_prod'], backup: 'vp_sales', risk: 'Medium' },
  { category: 'Recruiting', item: 'Direct Offer Letters', approvers: ['gm_prod', 'cfo'], backup: 'vp_sales', risk: 'High' },
];

// --- APP COMPONENT ---

export default function App() {
  // State
  const [currentUser, setCurrentUser] = useState(VIBRINT_ROLES[10]); // Default to Alice
  const [activeTab, setActiveTab] = useState('dashboard');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null); // For Toasts
  
  // Firebase Refs (Lazy init)
  const [db, setDb] = useState(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  // Helper to sanitize App ID
  const getSafeAppId = () => {
    const rawId = 'vibrint-hackathon';
    return rawId.replace(/[^a-zA-Z0-9_-]/g, '_');
  };

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Initialize Firebase
  useEffect(() => {
    const initFirebase = async () => {
      try {
        const configToUse = FIREBASE_CONFIG;
        
        if (configToUse) {
          const app = initializeApp(configToUse);
          const authInstance = getAuth(app);
          const dbInstance = getFirestore(app);
          
          setDb(dbInstance);
          await signInAnonymously(authInstance);
          setIsFirebaseReady(true);
        } else {
          console.log("Running in Demo Mode (In-Memory)");
          loadDemoData();
        }
      } catch (e) {
        console.error("Firebase Init Error:", e);
        loadDemoData(); 
      }
    };
    initFirebase();
  }, []);

  const loadDemoData = () => {
    setRequests([
        {
          id: '1',
          type: 'Communications',
          item: 'Employee "Swag" Purchases',
          requesterId: 'user_1',
          requesterName: 'Alice Engineer',
          justification: 'Team hoodies for the Q4 hackathon event.',
          status: 'PENDING',
          currentApproverId: 'gm_prod',
          history: [],
          aiRiskScore: 12,
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'Compliance',
          item: 'AI Use Approval',
          requesterId: 'user_1',
          requesterName: 'Alice Engineer',
          justification: 'Using GitHub Copilot for code generation efficiency.',
          status: 'APPROVED',
          currentApproverId: 'cao',
          history: [{ action: 'APPROVED', by: 'Alex Admin', date: new Date().toISOString() }],
          aiRiskScore: 85,
          timestamp: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all demo data? This is useful for restarting the presentation.')) {
        loadDemoData();
        setActiveTab('dashboard');
        showToast('Demo data reset successfully', 'info');
    }
  };

  // Data Fetching
  useEffect(() => {
    let unsubscribe = () => {};

    if (isFirebaseReady && db) {
      try {
        const appId = getSafeAppId();
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'requests'), orderBy('timestamp', 'desc'));
        unsubscribe = onSnapshot(q, (snapshot) => {
          const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setRequests(reqs);
        }, (error) => {
           console.error("Snapshot Error:", error);
           loadDemoData();
        });
      } catch (err) {
        console.error("Query Error:", err);
        loadDemoData();
      }
    }
    return () => unsubscribe();
  }, [isFirebaseReady, db]);

  // Actions
  const handleCreateRequest = async (formData) => {
    setLoading(true);
    const newRequest = {
      ...formData,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      status: 'PENDING',
      history: [{ action: 'SUBMITTED', by: currentUser.name, date: new Date().toISOString() }],
      timestamp: isFirebaseReady ? serverTimestamp() : new Date().toISOString(),
      aiRiskScore: formData.justification.toLowerCase().includes('data') ? 75 : 15
    };

    if (isFirebaseReady && db) {
        const appId = getSafeAppId();
        try {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'requests'), newRequest);
        } catch (e) {
          console.error("Add Doc Error:", e);
          setRequests([newRequest, ...requests]);
        }
    } else {
      setRequests([newRequest, ...requests]);
    }
    setLoading(false);
    setActiveTab('dashboard');
    showToast('Request submitted successfully!');
  };

  const handleAction = async (reqId, action, notes) => {
    const request = requests.find(r => r.id === reqId);
    if (!request) return;

    let newStatus = request.status;
    let newApprover = request.currentApproverId;

    if (action === 'APPROVE') {
      newStatus = 'APPROVED';
    } else if (action === 'REJECT') {
      newStatus = 'REJECTED';
    } else if (action === 'REQUEST_CHANGES') {
      newStatus = 'CHANGES_REQUESTED';
      newApprover = request.requesterId; 
    } else if (action === 'DELEGATE') {
      const rule = DELEGATION_RULES.find(r => r.item === request.item);
      if (rule && rule.backup) {
         newApprover = DELEGATION_RULES.find(r => r.id === rule.backup)?.id || 'cfo'; 
      }
    }

    const updateData = {
      status: newStatus,
      currentApproverId: newApprover,
      history: [
        ...request.history, 
        { 
          action, 
          by: currentUser.name, 
          notes, 
          date: new Date().toISOString() 
        }
      ]
    };

    if (isFirebaseReady && db) {
      const appId = getSafeAppId();
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'requests', reqId), updateData);
      } catch (e) {
         console.error("Update Doc Error:", e);
         setRequests(requests.map(r => r.id === reqId ? { ...r, ...updateData } : r));
      }
    } else {
      setRequests(requests.map(r => r.id === reqId ? { ...r, ...updateData } : r));
    }
    showToast(`Request ${action.toLowerCase().replace('_', ' ')} successfully!`);
  };

  // --- UI COMPONENTS ---

  const Sidebar = () => (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-20 shadow-xl">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-orange-500 font-bold text-2xl">
          <Shield className="h-8 w-8" />
          <span>Vibrint<span className="text-white">Flow</span></span>
        </div>
        <p className="text-xs text-slate-400 mt-2">Delegation of Authority v2.0</p>
        <div className="flex items-center mt-3 space-x-2">
            <span className={`h-2 w-2 rounded-full ${isFirebaseReady ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></span>
            <span className="text-xs text-slate-400">
                {isFirebaseReady ? 'System Online' : 'Demo Mode (Offline)'}
            </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <Activity className="h-5 w-5" />
          <span className="font-medium">Dashboard</span>
        </button>
        <button 
          onClick={() => setActiveTab('new_request')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'new_request' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <FileText className="h-5 w-5" />
          <span className="font-medium">New Request</span>
        </button>
        <button 
          onClick={() => setActiveTab('approvals')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'approvals' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <UserCheck className="h-5 w-5" />
          <span className="font-medium">My Approvals</span>
          {requests.filter(r => r.currentApproverId === currentUser.id && r.status === 'PENDING').length > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {requests.filter(r => r.currentApproverId === currentUser.id && r.status === 'PENDING').length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'reports' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="font-medium">Reports</span>
        </button>
        <button 
          onClick={() => setActiveTab('audit')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'audit' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <History className="h-5 w-5" />
          <span className="font-medium">Audit Log</span>
        </button>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            showToast('Link copied to clipboard!', 'success');
          }}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-slate-400 hover:bg-slate-800 hover:text-white`}
        >
          <Share2 className="h-5 w-5" />
          <span className="font-medium">Share App</span>
        </button>
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-4">
        
        {/* Reset Button for Demo */}
        {!isFirebaseReady && (
            <button 
                onClick={handleResetDemo}
                className="w-full flex items-center justify-center space-x-2 p-2 rounded border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-sm"
            >
                <RefreshCcw className="h-3 w-3" />
                <span>Reset Demo Data</span>
            </button>
        )}

        <div className="bg-slate-800 rounded-lg p-3">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Simulate Role</p>
          <div className="relative">
            <select 
              className="w-full bg-slate-900 text-white text-sm rounded p-2 appearance-none border border-slate-700 focus:border-orange-500 focus:outline-none"
              value={currentUser.id}
              onChange={(e) => setCurrentUser(VIBRINT_ROLES.find(u => u.id === e.target.value))}
            >
              {VIBRINT_ROLES.map(role => (
                <option key={role.id} value={role.id}>{role.name} ({role.title})</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );

  const Dashboard = () => {
    const myRequests = requests.filter(r => r.requesterId === currentUser.id);
    const pendingCount = myRequests.filter(r => r.status === 'PENDING').length;
    const approvedCount = myRequests.filter(r => r.status === 'APPROVED').length;

    return (
      <div className="space-y-6 animate-fade-in">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {currentUser.name.split(' ')[0]}</h1>
            <p className="text-slate-500">Here's what's happening with your requests today.</p>
          </div>
          <button onClick={() => setActiveTab('new_request')} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-orange-600/30 flex items-center space-x-2 transition-all">
             <Sparkles className="h-5 w-5" />
             <span>Create New Request</span>
          </button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Clock className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Pending Approval</p>
              <p className="text-3xl font-bold text-slate-900">{pendingCount}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Approved</p>
              <p className="text-3xl font-bold text-slate-900">{approvedCount}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Activity className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Avg. Cycle Time</p>
              <p className="text-3xl font-bold text-slate-900">4.2 Hrs</p>
            </div>
          </div>
        </div>

        {/* Recent Requests Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Requests</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Current Approver</th>
                <th className="px-6 py-3">Risk Assessment</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myRequests.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">No requests found. Start a new one!</td></tr>
              ) : (
                myRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{req.type}</td>
                    <td className="px-6 py-4 text-slate-600">{req.item}</td>
                    <td className="px-6 py-4 text-slate-600">
                       {req.status === 'PENDING' ? VIBRINT_ROLES.find(u => u.id === req.currentApproverId)?.name || 'Unknown' : '-'}
                    </td>
                    <td className="px-6 py-4">
                        <RiskMeter score={req.aiRiskScore} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const NewRequestForm = () => {
    const [category, setCategory] = useState(DELEGATION_RULES[0].category);
    const [item, setItem] = useState(DELEGATION_RULES[0].item);
    const [justification, setJustification] = useState('');
    const [isDrafting, setIsDrafting] = useState(false);
    const [statusText, setStatusText] = useState('Auto-Draft with AI');

    const availableItems = DELEGATION_RULES.filter(r => r.category === category);

    useEffect(() => {
        const firstItem = DELEGATION_RULES.filter(r => r.category === category)[0];
        if (firstItem) setItem(firstItem.item);
    }, [category]);

    const handleMagicDraft = () => {
      setIsDrafting(true);
      setStatusText('Analyzing Policy...');
      setJustification('');
      
      const drafts = [
            "This purchase is essential for maintaining team morale during the upcoming quarterly review. It aligns with our cultural initiatives and has been budgeted.",
            "This software license is required to accelerate our current project timeline by approximately 15%, ensuring on-time delivery to the client.",
            "Approval is requested to engage with a new vendor who provides critical compliance auditing services required for the new contract modification."
        ];
      const targetText = drafts[Math.floor(Math.random() * drafts.length)];
      
      setTimeout(() => {
          setStatusText('Drafting...');
          let i = 0;
          const interval = setInterval(() => {
            setJustification(targetText.substring(0, i));
            i++;
            if (i > targetText.length) {
                clearInterval(interval);
                setIsDrafting(false);
                setStatusText('Auto-Draft with AI');
            }
          }, 30);
      }, 1500);
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const rule = DELEGATION_RULES.find(r => r.item === item);
      const initialApprover = rule ? rule.approvers[0] : 'ceo'; 
      
      handleCreateRequest({
        type: category,
        item,
        justification,
        currentApproverId: initialApprover
      });
    };

    return (
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden animate-fade-in-up">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-200">
           <h2 className="text-xl font-bold text-slate-800">New Request</h2>
           <p className="text-slate-500 text-sm mt-1">Submit a new request for DOA approval. AI will assist with risk scoring.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
              <div className="relative">
                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none appearance-none"
                >
                    {[...new Set(DELEGATION_RULES.map(r => r.category))].map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Request Type</label>
              <div className="relative">
                <select 
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none appearance-none"
                >
                    {availableItems.map(r => (
                        <option key={r.item} value={r.item}>{r.item}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
             <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700">Justification</label>
                <button 
                  type="button" 
                  onClick={handleMagicDraft}
                  disabled={isDrafting}
                  className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 rounded-full flex items-center space-x-1 font-bold transition-colors"
                >
                  {isDrafting ? <span className="animate-spin">✨</span> : <Sparkles className="h-3 w-3" />}
                  <span>{statusText}</span>
                </button>
             </div>
             <textarea 
               value={justification}
               onChange={(e) => setJustification(e.target.value)}
               className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
               placeholder="Why is this request necessary?"
               required
             />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-3">
             <div className="bg-blue-100 p-1.5 rounded-full">
                <ArrowRight className="h-4 w-4 text-blue-600" />
             </div>
             <div>
                <p className="text-sm font-bold text-blue-900">Routing Preview</p>
                <p className="text-sm text-blue-700 mt-1">
                   Based on your selection, this request will be routed to <span className="font-bold underline">{VIBRINT_ROLES.find(u => u.id === (DELEGATION_RULES.find(r => r.item === item)?.approvers[0] || 'ceo'))?.name}</span> for approval.
                </p>
             </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
             <button type="button" onClick={() => setActiveTab('dashboard')} className="px-6 py-2 text-slate-500 font-medium hover:text-slate-800 mr-4">Cancel</button>
             <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-orange-600/30 flex items-center space-x-2">
                {loading ? 'Submitting...' : <><span>Submit Request</span><Send className="h-4 w-4" /></>}
             </button>
          </div>
        </form>
      </div>
    );
  };

  const ApprovalsList = () => {
    const pendingApprovals = requests.filter(r => r.currentApproverId === currentUser.id && r.status === 'PENDING');

    return (
       <div className="space-y-6 animate-fade-in">
          <header>
             <h1 className="text-3xl font-bold text-slate-900">Approvals Queue</h1>
             <p className="text-slate-500">You have {pendingApprovals.length} requests awaiting your decision.</p>
          </header>

          <div className="grid grid-cols-1 gap-4">
             {pendingApprovals.length === 0 ? (
                <div className="bg-white p-12 rounded-xl text-center border-2 border-dashed border-slate-200">
                    <CheckCircle className="h-16 w-16 text-green-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-700">All Caught Up!</h3>
                    <p className="text-slate-400">You have no pending approvals at this time.</p>
                </div>
             ) : (
                pendingApprovals.map(req => (
                    <div key={req.id} className="bg-white rounded-xl shadow-md border-l-4 border-orange-500 overflow-hidden">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">{req.type}</span>
                                    <h3 className="text-xl font-bold text-slate-800 mt-1">{req.item}</h3>
                                    <p className="text-sm text-slate-500 mt-1">Requested by <span className="font-semibold text-slate-800">{req.requesterName}</span> • {new Date(req.timestamp).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-400 font-bold mb-1">AI RISK SCORE</div>
                                    <RiskMeter score={req.aiRiskScore} />
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Justification</h4>
                                <p className="text-slate-700 leading-relaxed">{req.justification}</p>
                            </div>

                            <div className="flex items-center space-x-3 pt-4 border-t border-slate-100">
                                <button 
                                    onClick={() => handleAction(req.id, 'APPROVE')}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors"
                                >
                                    <CheckCircle className="h-5 w-5" />
                                    <span>Approve</span>
                                </button>
                                <button 
                                    onClick={() => handleAction(req.id, 'REQUEST_CHANGES')}
                                    className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors"
                                >
                                    <Edit3 className="h-5 w-5" />
                                    <span>Request Changes</span>
                                </button>
                                <button 
                                    onClick={() => handleAction(req.id, 'REJECT')}
                                    className="px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold tooltip-trigger"
                                    title="Reject Request"
                                >
                                    <XCircle className="h-5 w-5" />
                                </button>
                                <button 
                                    onClick={() => handleAction(req.id, 'DELEGATE')}
                                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold tooltip-trigger"
                                    title="Delegate"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))
             )}
          </div>
       </div>
    );
  };

  const Reports = () => (
      <div className="space-y-6 animate-fade-in">
        <header>
             <h1 className="text-3xl font-bold text-slate-900">System Reports</h1>
             <p className="text-slate-500">Organization-wide DOA metrics.</p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
            <div className="h-64 flex items-end justify-center space-x-8 pb-4 border-b border-slate-200">
                <div className="w-16 bg-blue-200 rounded-t-lg h-3/4 relative group">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100">75%</div>
                </div>
                <div className="w-16 bg-green-200 rounded-t-lg h-1/2 relative group">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100">50%</div>
                </div>
                <div className="w-16 bg-red-200 rounded-t-lg h-1/4 relative group">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100">25%</div>
                </div>
            </div>
            <div className="flex justify-center space-x-8 mt-4 text-sm font-bold text-slate-600">
                <div className="w-16">Software</div>
                <div className="w-16">Services</div>
                <div className="w-16">Hardware</div>
            </div>
            <p className="mt-8 text-slate-500">Spend by Category (Mock Data)</p>
        </div>
      </div>
  );

  const AuditLog = () => {
      // Flatten all history items from all requests
      const logs = requests.flatMap(r => 
        r.history.map(h => ({ ...h, requestItem: r.item, requestId: r.id }))
      ).sort((a, b) => new Date(b.date) - new Date(a.date));

      return (
        <div className="space-y-6 animate-fade-in">
            <header>
                <h1 className="text-3xl font-bold text-slate-900">Audit Logs</h1>
                <p className="text-slate-500">Complete immutable record of system actions.</p>
            </header>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3">Timestamp</th>
                            <th className="px-6 py-3">Actor</th>
                            <th className="px-6 py-3">Action</th>
                            <th className="px-6 py-3">Reference</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.map((log, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                                <td className="px-6 py-3 text-slate-500">{new Date(log.date).toLocaleString()}</td>
                                <td className="px-6 py-3 font-medium text-slate-900">{log.by}</td>
                                <td className="px-6 py-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${log.action === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-slate-500 truncate max-w-xs">{log.requestItem}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && <div className="p-8 text-center text-slate-400">No audit records found.</div>}
            </div>
        </div>
      );
  };

  // Helper
  const StatusBadge = ({ status }) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
      CHANGES_REQUESTED: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status ? status.replace('_', ' ') : 'UNKNOWN'}
      </span>
    );
  };

  const RiskMeter = ({ score }) => {
      let color = 'bg-green-500';
      if(score > 30) color = 'bg-yellow-500';
      if(score > 70) color = 'bg-red-500';

      return (
          <div className="flex items-center space-x-2">
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden w-24">
                  <div className={`h-full ${color}`} style={{ width: `${score}%` }}></div>
              </div>
              <span className={`text-xs font-bold ${score > 70 ? 'text-red-600' : 'text-slate-600'}`}>{score}</span>
          </div>
      );
  };

  const Toast = ({ message, type }) => (
      <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-2xl z-50 flex items-center space-x-3 text-white font-medium animate-fade-in-up ${type === 'info' ? 'bg-slate-800' : 'bg-green-600'}`}>
          {type === 'info' ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
          <span>{message}</span>
      </div>
  );

  // Main Layout
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-5xl mx-auto">
           {activeTab === 'dashboard' && <Dashboard />}
           {activeTab === 'new_request' && <NewRequestForm />}
           {activeTab === 'approvals' && <ApprovalsList />}
           {activeTab === 'reports' && <Reports />}
           {activeTab === 'audit' && <AuditLog />}
        </div>
      </main>

      {/* Notifications */}
      {notification && <Toast message={notification.message} type={notification.type} />}

      {/* Demo Notification */}
      {!isFirebaseReady && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white p-4 rounded-lg shadow-xl max-w-sm z-50 border-l-4 border-orange-500">
          <p className="text-sm font-bold flex items-center mb-1">
             <WifiOff className="h-4 w-4 mr-2 text-orange-500" />
             Demo Mode (Offline)
          </p>
          <p className="text-xs text-slate-400">
             Add Firebase keys to enable real-time sync.
          </p>
        </div>
      )}
    </div>
  );
}
// Final Demo Build V3
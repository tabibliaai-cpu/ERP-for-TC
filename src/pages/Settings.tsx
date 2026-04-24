import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Globe, 
  Database,
  Lock,
  Save,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { tenantService } from '../services/dataService';

export function Settings() {
  const { currentTenant, setCurrentTenant } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    missionStatement: '',
    tradition: 'Reformed',
    deanName: '',
    location: '',
    timezone: 'UTC',
    language: 'English',
    privacyLevel: 'high',
    logoUrl: '',
    bannerUrl: '',
    contactEmail: '',
    contactPhone: ''
  });

  useEffect(() => {
    if (currentTenant) {
      setFormData({
        name: currentTenant.name || '',
        missionStatement: (currentTenant as any).missionStatement || '',
        tradition: (currentTenant as any).tradition || 'Reformed',
        deanName: (currentTenant as any).deanName || '',
        location: (currentTenant as any).location || '',
        timezone: (currentTenant as any).timezone || 'UTC',
        language: (currentTenant as any).language || 'English',
        privacyLevel: (currentTenant as any).privacyLevel || 'high',
        logoUrl: (currentTenant as any).logoUrl || '',
        bannerUrl: (currentTenant as any).bannerUrl || '',
        contactEmail: (currentTenant as any).contactEmail || '',
        contactPhone: (currentTenant as any).contactPhone || ''
      });
    }
  }, [currentTenant]);

  const handleSave = async () => {
    if (!currentTenant?.id) return;
    setIsSaving(true);
    try {
      await tenantService.updateTenantSettings(currentTenant.id, formData);
      setCurrentTenant({ ...currentTenant, ...formData });
      alert("Institutional settings synchronized across all clusters.");
    } catch (error) {
      console.error("Failed to update settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = () => {
     // Mocking file upload via prompt since native file uploads to Firebase Storage aren't configured.
     const url = prompt("Enter URL of the new Institution Logo:", formData.logoUrl);
     if (url !== null) {
        setFormData({ ...formData, logoUrl: url });
     }
  };
  
  const handleBannerUpload = () => {
     const url = prompt("Enter URL of the new Institution Banner:", formData.bannerUrl);
     if (url !== null) {
        setFormData({ ...formData, bannerUrl: url });
     }
  };

  const sections = [
    { title: 'Institution Profile', icon: Building2, description: 'Core institutional data and branding.' },
    { title: 'Security & Access', icon: Lock, description: 'Zero-trust protocols and tenant isolation.' },
    { title: 'Global Preferences', icon: Globe, description: 'Language, timezone, and regional settings.' },
    { title: 'Data Management', icon: Database, description: 'Export history and backup management.' },
  ];

  return (
    <div className="max-w-4xl space-y-5 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight ">Institution Settings</h1>
        <p className="text-slate-500 text-sm">Configure your multi-tenant environment, branding, and core identity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <button 
            key={section.title}
            className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 shadow-sm transition-all text-left group"
          >
            <div className="p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
              <section.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 leading-none">{section.title}</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{section.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Branding Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <ImageIcon className="w-5 h-5 text-indigo-600" />
          <h2 className="font-bold text-slate-900  uppercase tracking-widest text-xs">Branding & Logistics</h2>
        </div>
        <div className="px-6 py-8 space-y-5">
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-1">
              <h4 className="font-bold text-slate-700 uppercase tracking-widest text-[10px]">Institution Logo</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Official crest or emblem used on receipts and ID cards.</p>
            </div>
            <div className="col-span-2 flex items-center gap-6">
               <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden">
                  {formData.logoUrl ? (
                     <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                     <Building2 className="w-8 h-8 text-slate-300" />
                  )}
               </div>
               <button onClick={handleLogoUpload} className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 transition-all">
                  Update Logo URL
               </button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-5 pt-6 border-t border-slate-100">
            <div className="col-span-1">
              <h4 className="font-bold text-slate-700 uppercase tracking-widest text-[10px]">Portal Banner</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Landscape image used for the student portal header.</p>
            </div>
            <div className="col-span-2 space-y-4">
               {formData.bannerUrl && (
                  <div className="w-full h-32 rounded-2xl bg-slate-100 overflow-hidden shadow-inner isolate">
                     <img src={formData.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                  </div>
               )}
               <button onClick={handleBannerUpload} className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 transition-all">
                  Set Header Banner URL
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Core Profile Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h2 className="font-bold text-slate-900  uppercase tracking-widest text-xs">Environment Configuration</h2>
        </div>
        <div className="px-6 py-8 space-y-5">
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-1">
              <h4 className="font-bold text-slate-700 uppercase tracking-widest text-[10px]">Institutional Identity</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Official branding and governance identifiers.</p>
            </div>
            <div className="col-span-2 space-y-4">
              <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Institution Name</label>
                 <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all font-bold "
                 />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Lead Dean / Rector</label>
                 <input 
                    type="text" 
                    value={formData.deanName}
                    onChange={e => setFormData({...formData, deanName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all font-medium"
                 />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Official Email</label>
                   <input type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4" />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Official Phone</label>
                   <input type="tel" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Theological Tradition</label>
                   <select 
                      value={formData.tradition}
                      onChange={e => setFormData({...formData, tradition: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                   >
                     <option value="Reformed">Reformed</option>
                     <option value="Catholic">Catholic</option>
                     <option value="Orthodox">Orthodox</option>
                     <option value="Anglican">Anglican</option>
                     <option value="Pentecostal">Pentecostal</option>
                     <option value="Baptist">Baptist</option>
                     <option value="Lutheran">Lutheran</option>
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Principal Location (City/Country)</label>
                   <input 
                      type="text" 
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                   />
                </div>
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Mission Statement / Vision</label>
                 <textarea 
                    value={formData.missionStatement}
                    onChange={e => setFormData({...formData, missionStatement: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none h-24 text-sm leading-relaxed"
                    placeholder="State the theological mission of the college..."
                 />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-50 pt-8 grid grid-cols-3 gap-5">
            <div className="col-span-1">
              <h4 className="font-bold text-slate-700">Temporal Calibration</h4>
              <p className="text-xs text-slate-400 mt-1">System timezone for liturgical scheduling.</p>
            </div>
            <div className="col-span-2">
               <select 
                value={formData.timezone}
                onChange={e => setFormData({...formData, timezone: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all font-medium text-sm"
               >
                 <option value="UTC">Universal Coordinated Time (UTC)</option>
                 <option value="EST">Eastern Standard Time (EST)</option>
                 <option value="PST">Pacific Standard Time (PST)</option>
               </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-1">
              <h4 className="font-bold text-slate-700">Privacy Mode</h4>
              <p className="text-xs text-slate-400 mt-1">Status of military-grade encryption layers.</p>
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <div className="flex-1 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Active: Zero-Trust Backend
              </div>
              <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-4">Audit Logs</button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-1">
              <h4 className="font-bold text-slate-700">Data Residency</h4>
              <p className="text-xs text-slate-400 mt-1">Physical location of your tenant instance.</p>
            </div>
            <div className="col-span-2">
               <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium">
                <MapPin className="w-4 h-4" />
                <span>US-West (Oregon) Cluster</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            disabled={isSaving}
            className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
          >Discard</button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Synchronizing...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

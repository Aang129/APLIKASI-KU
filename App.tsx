
import React, { useState, useCallback } from 'react';
import { 
  FileText, 
  Settings, 
  Sparkles, 
  ArrowRight, 
  Download, 
  ChevronRight, 
  Calendar, 
  BookOpen, 
  Layers, 
  ClipboardCheck,
  Printer,
  FileCode,
  AlertCircle
} from 'lucide-react';
import { 
  EducationLevel, 
  LearningApproach, 
  CurriculumContext, 
  TP, 
  ATP, 
  ProtaItem, 
  PromesItem 
} from './types';
import * as gemini from './services/geminiService';

const App: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'input' | 'tp' | 'atp' | 'prota' | 'promes'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cpText, setCpText] = useState('');
  const [context, setContext] = useState<CurriculumContext>({
    level: EducationLevel.SD,
    phase: 'A',
    subject: 'Matematika',
    academicYear: '2024/2025',
    effectiveWeeks: 36,
    jpPerWeek: 4,
    approach: LearningApproach.DEEP_LEARNING
  });

  const [tpData, setTpData] = useState<TP[]>([]);
  const [atpData, setAtpData] = useState<ATP[]>([]);
  const [protaData, setProtaData] = useState<ProtaItem[]>([]);
  const [promesData, setPromesData] = useState<PromesItem[]>([]);

  // --- Handlers ---
  const handleGenerateTP = async () => {
    if (!cpText.trim()) {
      setError('Harap masukkan teks Capaian Pembelajaran (CP) atau unggah file.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const results = await gemini.generateTPFromCP(cpText, context);
      setTpData(results);
      setActiveTab('tp');
    } catch (err) {
      setError('Gagal menghasilkan TP. Pastikan API Key valid.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateATP = async () => {
    if (tpData.length === 0) return;
    setLoading(true);
    try {
      const results = await gemini.generateATPFromTPs(tpData, context);
      setAtpData(results);
      setActiveTab('atp');
    } catch (err) {
      setError('Gagal menghasilkan ATP.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateProta = async () => {
    if (atpData.length === 0) return;
    setLoading(true);
    try {
      const results = await gemini.generateProta(atpData, tpData, context);
      setProtaData(results);
      setActiveTab('prota');
    } catch (err) {
      setError('Gagal menghasilkan Prota.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePromes = async () => {
    if (protaData.length === 0) return;
    setLoading(true);
    try {
      const results = await gemini.generatePromes(protaData, context);
      setPromesData(results);
      setActiveTab('promes');
    } catch (err) {
      setError('Gagal menghasilkan Promes.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Simple mock for text extraction if not using a real PDF parser
        // In a real app, one would use pdfjs-dist
        setCpText("Teks CP berhasil diekstrak dari file: " + file.name + "\n\n(Simulasi konten CP: Peserta didik mampu mengenal dan memahami konsep bilangan...)");
      };
      reader.readAsText(file);
    }
  };

  // --- Components ---
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 w-6 h-6" />
      </div>
      <p className="mt-4 text-indigo-800 font-medium animate-pulse">Menyusun Kurikulum Deep Learning...</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {loading && <LoadingOverlay />}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
              <FileCode className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                Arsitek Kurikulum Merdeka
              </h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">AI-Powered Curriculum Architect</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-4 h-4" /> Cetak
            </button>
            <div className="h-6 w-[1px] bg-slate-200"></div>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-semibold border border-indigo-100">
              Versi 2024.1
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 mb-8 overflow-x-auto no-print pb-2">
          <TabButton active={activeTab === 'input'} onClick={() => setActiveTab('input')} icon={<FileText className="w-4 h-4" />} label="CP & Parameter" />
          <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
          <TabButton active={activeTab === 'tp'} onClick={() => setActiveTab('tp')} disabled={tpData.length === 0} icon={<BookOpen className="w-4 h-4" />} label="Tujuan Pembelajaran" />
          <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
          <TabButton active={activeTab === 'atp'} onClick={() => setActiveTab('atp')} disabled={atpData.length === 0} icon={<Layers className="w-4 h-4" />} label="Alur Tujuan" />
          <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
          <TabButton active={activeTab === 'prota'} onClick={() => setActiveTab('prota')} disabled={protaData.length === 0} icon={<Calendar className="w-4 h-4" />} label="Program Tahunan" />
          <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
          <TabButton active={activeTab === 'promes'} onClick={() => setActiveTab('promes')} disabled={promesData.length === 0} icon={<ClipboardCheck className="w-4 h-4" />} label="Program Semester" />
        </nav>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Views */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {activeTab === 'input' && (
            <>
              <div className="lg:col-span-8 space-y-6">
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      Analisis Capaian Pembelajaran (CP)
                    </h2>
                    <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-all">
                      Unggah CP (PDF/DOC)
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                    </label>
                  </div>
                  <p className="text-sm text-slate-500 mb-3 leading-relaxed">
                    Tempelkan narasi resmi Capaian Pembelajaran (CP) sesuai Keputusan Kepala BSKAP No. 032/H/KR/2024 atau unggah dokumen terkait.
                  </p>
                  <textarea 
                    value={cpText}
                    onChange={(e) => setCpText(e.target.value)}
                    placeholder="Contoh: Peserta didik mampu mengenal dan memahami berbagai simbol numerik..."
                    className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400 font-mono text-sm"
                  ></textarea>
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={handleGenerateTP}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
                    >
                      <Sparkles className="w-5 h-5" />
                      Generate TP
                    </button>
                  </div>
                </section>
              </div>

              <aside className="lg:col-span-4 space-y-6">
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
                  <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                    <Settings className="w-5 h-5 text-slate-500" />
                    Parameter Kurikulum
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Jenjang Pendidikan</label>
                      <select 
                        value={context.level}
                        onChange={(e) => setContext({...context, level: e.target.value as EducationLevel})}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                      >
                        {Object.values(EducationLevel).map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Fase / Kelas</label>
                        <input 
                          type="text" 
                          value={context.phase}
                          onChange={(e) => setContext({...context, phase: e.target.value})}
                          placeholder="Fase A / Kelas 1"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tahun Ajaran</label>
                        <input 
                          type="text" 
                          value={context.academicYear}
                          onChange={(e) => setContext({...context, academicYear: e.target.value})}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Mata Pelajaran</label>
                      <input 
                        type="text" 
                        value={context.subject}
                        onChange={(e) => setContext({...context, subject: e.target.value})}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Minggu Efektif</label>
                        <input 
                          type="number" 
                          value={context.effectiveWeeks}
                          onChange={(e) => setContext({...context, effectiveWeeks: parseInt(e.target.value)})}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">JP per Minggu</label>
                        <input 
                          type="number" 
                          value={context.jpPerWeek}
                          onChange={(e) => setContext({...context, jpPerWeek: parseInt(e.target.value)})}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Pendekatan Belajar</label>
                      <select 
                        value={context.approach}
                        onChange={(e) => setContext({...context, approach: e.target.value as LearningApproach})}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                      >
                        {Object.values(LearningApproach).map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                </section>
              </aside>
            </>
          )}

          {activeTab === 'tp' && (
            <div className="col-span-12 space-y-6">
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-xl font-bold">Tujuan Pembelajaran (TP)</h2>
                  <div className="flex gap-2">
                     <button onClick={handleGenerateATP} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-all">
                       Lanjut ke ATP <ArrowRight className="w-4 h-4" />
                     </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Pernyataan Tujuan</th>
                        <th className="px-6 py-4">Kompetensi</th>
                        <th className="px-6 py-4">Materi Inti</th>
                        <th className="px-6 py-4">Taksonomi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tpData.map((tp) => (
                        <tr key={tp.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-xs font-mono text-slate-400">{tp.id}</td>
                          <td className="px-6 py-4 font-medium text-slate-800 leading-relaxed max-w-md">{tp.statement}</td>
                          <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">{tp.competency}</span></td>
                          <td className="px-6 py-4 text-sm text-slate-600">{tp.content}</td>
                          <td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium">{tp.bloomLevel}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'atp' && (
            <div className="col-span-12 space-y-6">
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-xl font-bold">Alur Tujuan Pembelajaran (ATP)</h2>
                  <button onClick={handleGenerateProta} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-all">
                    Lanjut ke Prota <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {atpData.sort((a,b) => a.sequence - b.sequence).map((atp) => (
                      <div key={atp.id} className="group relative bg-slate-50 rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all">
                        <div className="absolute -top-3 -left-3 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                          {atp.sequence}
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2 mt-2">{atp.moduleName}</h3>
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                          {tpData.find(t => t.id === atp.tpId)?.statement}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {atp.p3Elements.map(p3 => (
                            <span key={p3} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-semibold uppercase">{p3}</span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                          <div className="flex items-center gap-2 text-indigo-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-bold">{atp.durationJP} JP</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {atp.tpId}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'prota' && (
            <div className="col-span-12 space-y-6">
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-xl font-bold">Program Tahunan (PROTA)</h2>
                  <div className="flex gap-3">
                    <button onClick={handleGeneratePromes} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-all">
                      Lanjut ke Promes <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4 w-12 text-center">No</th>
                        <th className="px-6 py-4">Capaian Pembelajaran (CP)</th>
                        <th className="px-6 py-4">Alur Tujuan (ATP)</th>
                        <th className="px-6 py-4">Materi Pembelajaran</th>
                        <th className="px-6 py-4 text-center">JP</th>
                        <th className="px-6 py-4">Jenis Asesmen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {protaData.map((item) => (
                        <tr key={item.no} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-center font-bold text-slate-400">{item.no}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{item.cp}</td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.atp}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{item.learningMaterial}</td>
                          <td className="px-6 py-4 text-center"><span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold">{item.totalJP} JP</span></td>
                          <td className="px-6 py-4 text-sm italic text-slate-500">{item.assessmentType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'promes' && (
            <div className="col-span-12 space-y-8">
              {[1, 2].map((sem) => (
                <section key={sem} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      Program Semester {sem}
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold tracking-wider">
                        <tr>
                          <th className="px-6 py-4 w-12 text-center">No</th>
                          <th className="px-6 py-4">ATP & Materi</th>
                          <th className="px-6 py-4 text-center">JP</th>
                          <th className="px-6 py-4">Bentuk Asesmen</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {promesData.filter(p => p.semester === sem).map((item) => (
                          <tr key={item.no} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-center font-bold text-slate-400">{item.no}</td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-800 mb-0.5">{item.atp}</div>
                              <div className="text-sm text-slate-500">{item.learningMaterial}</div>
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-indigo-600">{item.jp} JP</td>
                            <td className="px-6 py-4 text-sm">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-100">
                                {item.assessmentForm}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}
              
              <div className="flex justify-center pb-12 no-print">
                <button className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95">
                  <Download className="w-5 h-5" />
                  Export Dokumen Lengkap (.DOCX / .PDF)
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <FileCode className="w-8 h-8 text-indigo-600" />
              <div>
                <span className="text-lg font-bold text-slate-900 block">Arsitek Kurikulum AI</span>
                <span className="text-xs text-slate-500">© 2024 Kurikulum Merdeka Terintegrasi. Bekerja dengan Gemini 3 Pro.</span>
              </div>
            </div>
            <div className="flex items-center gap-8 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-indigo-600 transition-colors">Panduan</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Hubungi Kami</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- Sub-components ---
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, disabled, icon, label }) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap
        ${active 
          ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' 
          : disabled 
            ? 'text-slate-300 cursor-not-allowed opacity-50' 
            : 'text-slate-500 hover:bg-slate-100'}
      `}
    >
      <span className={active ? 'text-indigo-600' : 'text-slate-400'}>{icon}</span>
      {label}
    </button>
  );
};

export default App;

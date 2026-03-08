import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiX, FiCheck, FiAlertCircle, FiImage, FiEdit3, FiTrash2, FiChevronDown, FiPackage, FiZap } from 'react-icons/fi';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';

const STAGES = { UPLOAD: 'upload', PREVIEW: 'preview', IMPORTING: 'importing', DONE: 'done' };

// ── Client-side filename parsing (mirrors server importService) ──
const CATEGORY_KEYWORDS = {
  'bikes':          ['bike', 'motorcycle', 'ducati', 'yamaha', 'kawasaki', 'harley', 'superbike', 'motorbike'],
  'sports-cars':    ['sports-car', 'sportscar', 'lamborghini', 'ferrari', 'mclaren', 'porsche', 'bugatti'],
  'vintage-cars':   ['vintage-car', 'classic-car', 'retro-car', 'oldtimer'],
  'muscle-cars':    ['muscle-car', 'mustang', 'camaro', 'charger', 'challenger', 'corvette'],
  'vector-cars':    ['vector-car', 'vector-art-car', 'neon-car', 'synthwave-car'],
  'cars':           ['car', 'automobile', 'vehicle', 'sedan', 'suv', 'jdm', 'nissan', 'toyota', 'bmw', 'mercedes', 'audi'],
  'football':       ['football', 'soccer', 'messi', 'ronaldo', 'neymar', 'mbappe', 'haaland', 'premier-league', 'fifa'],
  'football-motivational': ['football-motivational', 'football-motivation', 'soccer-motivation'],
  'cricket':        ['cricket', 'ipl', 'virat', 'kohli', 'dhoni', 'sachin', 'babar', 'shakib'],
  'ufc':            ['ufc', 'mma', 'conor', 'mcgregor', 'khabib', 'fighter', 'boxing'],
  'nba':            ['nba', 'basketball', 'lebron', 'jordan', 'kobe', 'curry', 'lakers'],
  'f1':             ['f1', 'formula-1', 'formula1', 'hamilton', 'verstappen', 'leclerc', 'racing'],
  'f1-motivational':['f1-motivational', 'f1-motivation', 'racing-motivation'],
  'sports':         ['sports', 'athletic', 'athlete', 'fitness', 'gym'],
  'marvel':         ['marvel', 'avengers', 'spider-man', 'spiderman', 'iron-man', 'ironman', 'thor', 'hulk', 'captain-america', 'wolverine', 'deadpool', 'mcu'],
  'dc':             ['dc', 'batman', 'superman', 'joker', 'wonder-woman', 'flash', 'aquaman', 'justice-league', 'dark-knight'],
  'anime':          ['anime', 'manga', 'naruto', 'one-piece', 'onepiece', 'dragon-ball', 'dragonball', 'goku', 'attack-on-titan', 'aot', 'demon-slayer', 'jujutsu', 'death-note', 'hunter-x-hunter', 'bleach', 'chainsaw-man', 'tokyo-ghoul', 'jojo', 'one-punch', 'berserk'],
  'movies':         ['movie', 'film', 'cinema', 'hollywood', 'star-wars', 'starwars', 'lord-of-the-rings', 'harry-potter', 'matrix', 'inception', 'interstellar', 'john-wick'],
  'tv-series':      ['tv-series', 'series', 'breaking-bad', 'game-of-thrones', 'got', 'stranger-things', 'peaky-blinders', 'money-heist', 'squid-game'],
  'music':          ['music', 'musician', 'singer', 'rapper', 'band', 'rock', 'hip-hop', 'hiphop', 'travis-scott', 'kanye', 'eminem', 'drake', 'bts'],
  'games':          ['game', 'gaming', 'gamer', 'valorant', 'fortnite', 'minecraft', 'gta', 'elden-ring', 'cyberpunk', 'zelda', 'god-of-war'],
  'motivational':   ['motivational', 'motivation', 'inspire', 'inspirational', 'hustle', 'grind', 'success', 'mindset'],
  'abstract':       ['abstract', 'geometric', 'surreal', 'psychedelic', 'fractal', 'trippy'],
  'minimalist':     ['minimalist', 'minimal', 'simple', 'clean', 'line-art', 'lineart'],
  'nature':         ['nature', 'landscape', 'mountain', 'ocean', 'forest', 'sunset', 'beach', 'sky', 'aurora'],
  'typography':     ['typography', 'quote', 'lettering', 'text-art', 'calligraphy'],
  'vintage':        ['vintage', 'retro', 'classic', 'old-school', 'nostalgia', 'vaporwave'],
  'modern':         ['modern', 'contemporary', 'futuristic', 'sci-fi', 'scifi', 'cyber', 'neon'],
};

const PRICE_RULES = {
  'sports-cars': { basePrice: 299, originalPrice: 499 },
  'vintage-cars': { basePrice: 299, originalPrice: 499 },
  'muscle-cars': { basePrice: 279, originalPrice: 449 },
  'vector-cars': { basePrice: 249, originalPrice: 399 },
  'bikes': { basePrice: 249, originalPrice: 399 },
  'cars': { basePrice: 249, originalPrice: 399 },
  'marvel': { basePrice: 249, originalPrice: 399 },
  'dc': { basePrice: 249, originalPrice: 399 },
  'anime': { basePrice: 229, originalPrice: 379 },
  'games': { basePrice: 229, originalPrice: 379 },
  'football': { basePrice: 229, originalPrice: 379 },
  'football-motivational': { basePrice: 199, originalPrice: 349 },
  'cricket': { basePrice: 229, originalPrice: 379 },
  'ufc': { basePrice: 229, originalPrice: 379 },
  'nba': { basePrice: 229, originalPrice: 379 },
  'f1': { basePrice: 249, originalPrice: 399 },
  'f1-motivational': { basePrice: 199, originalPrice: 349 },
  'sports': { basePrice: 199, originalPrice: 349 },
  'movies': { basePrice: 199, originalPrice: 349 },
  'tv-series': { basePrice: 199, originalPrice: 349 },
  'music': { basePrice: 199, originalPrice: 349 },
  'motivational': { basePrice: 179, originalPrice: 299 },
  'abstract': { basePrice: 199, originalPrice: 349 },
  'minimalist': { basePrice: 179, originalPrice: 299 },
  'nature': { basePrice: 199, originalPrice: 349 },
  'typography': { basePrice: 179, originalPrice: 299 },
  'vintage': { basePrice: 199, originalPrice: 349 },
  'modern': { basePrice: 199, originalPrice: 349 },
  'other': { basePrice: 199, originalPrice: 349 },
};

function parseFilename(filename) {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  let cleaned = nameWithoutExt.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/\s+v\d+$/i, '').replace(/\s+copy$/i, '').replace(/\s*\(?\d+\)?$/g, '').trim();
  const title = cleaned.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  return title || 'Untitled Poster';
}

function detectCategory(filename) {
  const normalized = filename.toLowerCase().replace(/\.[^/.]+$/, '').replace(/[-_]+/g, '-').replace(/\s+/g, '-');
  let best = { category: 'other', score: 0 };
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (normalized.includes(kw) && kw.length > best.score) {
        best = { category, score: kw.length };
      }
    }
  }
  return best.category;
}

function previewProductLocal(filename) {
  const title = parseFilename(filename);
  const category = detectCategory(filename);
  const pricing = PRICE_RULES[category] || PRICE_RULES['other'];
  return {
    filename,
    title,
    category,
    basePrice: pricing.basePrice,
    originalPrice: pricing.originalPrice,
    description: `High-quality ${category.replace(/-/g, ' ')} poster - ${title}`,
  };
}

export default function BulkImport() {
  const [darkMode, setDarkMode] = useState(true);
  const [stage, setStage] = useState(STAGES.UPLOAD);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [globalCategory, setGlobalCategory] = useState('');
  const [globalBasePrice, setGlobalBasePrice] = useState('');
  const [globalOriginalPrice, setGlobalOriginalPrice] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme ? savedTheme === 'dark' : true);
    const handleThemeChange = () => setDarkMode(localStorage.getItem('theme') === 'dark');
    window.addEventListener('storage', handleThemeChange);
    window.addEventListener('themeChange', handleThemeChange);
    return () => {
      window.removeEventListener('storage', handleThemeChange);
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  useEffect(() => {
    // Build categories from local PRICE_RULES (no server call needed)
    const cats = Object.keys(PRICE_RULES).map(key => ({
      value: key,
      label: key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      ...PRICE_RULES[key],
    }));
    setCategories(cats);
  }, []);

  // ── Drag & Drop ──
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = [...e.dataTransfer.files].filter(f =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    );
    if (dropped.length > 0) addFiles(dropped);
  }, []);

  const handleFileSelect = (e) => {
    const selected = [...e.target.files];
    if (selected.length > 0) addFiles(selected);
    e.target.value = '';
  };

  const addFiles = (newFiles) => {
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name + f.size));
      const unique = newFiles.filter(f => !existing.has(f.name + f.size));
      return [...prev, ...unique].slice(0, 50);
    });
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ── Preview (client-side, instant) ──
  const handlePreview = () => {
    if (files.length === 0) return toast.error('Add some images first');
    const generated = files.map(f => previewProductLocal(f.name));
    setPreviews(generated);
    setStage(STAGES.PREVIEW);
    toast.success(`${generated.length} products previewed`);
  };

  // ── Edit preview item ──
  const updatePreview = (index, field, value) => {
    setPreviews(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // ── Import ──
  const handleImport = async () => {
    if (files.length === 0) return;
    setStage(STAGES.IMPORTING);
    setProgress(0);

    try {
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));

      // Build per-file overrides from edited previews
      const overrides = {};
      previews.forEach((p, i) => {
        overrides[i] = {
          title: p.title,
          category: p.category,
          basePrice: p.basePrice,
          originalPrice: p.originalPrice,
          description: p.description,
        };
      });
      formData.append('overrides', JSON.stringify(overrides));

      if (globalCategory) formData.append('category', globalCategory);
      if (globalBasePrice) formData.append('basePrice', globalBasePrice);
      if (globalOriginalPrice) formData.append('originalPrice', globalOriginalPrice);

      const res = await adminAPI.bulkImport(formData, (e) => {
        if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
      });

      setResults(res.data);
      setStage(STAGES.DONE);

      if (res.data?.failed?.length === 0) {
        toast.success(`All ${res.data.success.length} products imported!`);
      } else {
        toast(`${res.data.success.length} imported, ${res.data.failed.length} failed`, { icon: '⚠️' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
      setStage(STAGES.PREVIEW);
    }
  };

  const resetAll = () => {
    setFiles([]);
    setPreviews([]);
    setResults(null);
    setProgress(0);
    setStage(STAGES.UPLOAD);
    setEditingIndex(null);
    setGlobalCategory('');
    setGlobalBasePrice('');
    setGlobalOriginalPrice('');
  };

  // ── Styles ──
  const cardBg = darkMode ? 'bg-moon-midnight/50 border border-moon-gold/20' : 'bg-white border border-purple-100';
  const textPrimary = darkMode ? 'text-moon-silver' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-moon-silver/60' : 'text-gray-500';
  const inputClass = `w-full px-3 py-2 rounded-lg text-sm transition-colors ${
    darkMode
      ? 'bg-moon-midnight border border-moon-gold/30 text-moon-silver focus:border-moon-gold'
      : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-purple-500'
  } outline-none`;
  const btnPrimary = darkMode
    ? 'bg-gradient-to-r from-moon-mystical to-moon-gold text-white hover:shadow-moon-gold/50'
    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/50';

  return (
    <div className={`pt-24 pb-12 min-h-screen transition-colors duration-500 ${
      darkMode
        ? 'bg-gradient-to-b from-moon-night via-moon-midnight to-moon-night'
        : 'bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FiZap className={`w-6 h-6 ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`} />
            <h1 className={`text-3xl sm:text-4xl font-bold ${
              darkMode
                ? 'moon-gradient-text animate-glow'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
            }`}>
              Bulk Import
            </h1>
          </div>
          <p className={textSecondary}>
            Upload poster images in bulk — products are auto-generated from filenames
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {['Upload', 'Preview & Edit', 'Import', 'Done'].map((label, i) => {
            const stageOrder = [STAGES.UPLOAD, STAGES.PREVIEW, STAGES.IMPORTING, STAGES.DONE];
            const current = stageOrder.indexOf(stage);
            const isActive = i === current;
            const isDone = i < current;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-green-500 text-white'
                    : isActive
                      ? (darkMode ? 'bg-moon-gold text-black' : 'bg-purple-600 text-white')
                      : (darkMode ? 'bg-moon-midnight/50 text-moon-silver/40 border border-moon-gold/20' : 'bg-gray-200 text-gray-400')
                }`}>
                  {isDone ? <FiCheck className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${
                  isActive ? (darkMode ? 'text-moon-gold' : 'text-purple-600') : textSecondary
                }`}>{label}</span>
                {i < 3 && <div className={`w-8 sm:w-16 h-0.5 ${
                  isDone ? 'bg-green-500' : (darkMode ? 'bg-moon-gold/20' : 'bg-gray-200')
                }`} />}
              </div>
            );
          })}
        </div>

        {/* ── STAGE 1: Upload ── */}
        <AnimatePresence mode="wait">
          {stage === STAGES.UPLOAD && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-2xl p-12 border-2 border-dashed cursor-pointer transition-all duration-300 text-center ${
                  dragActive
                    ? (darkMode ? 'border-moon-gold bg-moon-gold/10' : 'border-purple-500 bg-purple-50')
                    : (darkMode ? 'border-moon-gold/30 hover:border-moon-gold/60 bg-moon-midnight/30' : 'border-gray-300 hover:border-purple-400 bg-white/50')
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <FiUploadCloud className={`w-16 h-16 mx-auto mb-4 ${
                  dragActive
                    ? (darkMode ? 'text-moon-gold' : 'text-purple-600')
                    : textSecondary
                }`} />
                <p className={`text-lg font-semibold mb-1 ${textPrimary}`}>
                  {dragActive ? 'Drop images here' : 'Drag & drop poster images'}
                </p>
                <p className={`text-sm ${textSecondary}`}>
                  or click to browse — JPEG, PNG, WebP up to 50 files
                </p>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-bold ${textPrimary}`}>
                      {files.length} file{files.length !== 1 ? 's' : ''} selected
                    </span>
                    <button
                      onClick={() => setFiles([])}
                      className={`text-xs ${darkMode ? 'text-red-400' : 'text-red-500'} hover:underline`}
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {files.map((file, i) => (
                      <div
                        key={file.name + file.size}
                        className={`relative group rounded-xl overflow-hidden ${cardBg} shadow-sm`}
                      >
                        <div className="aspect-[3/4] bg-gray-900/10">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="p-2">
                          <p className={`text-[11px] font-medium truncate ${textPrimary}`}>
                            {file.name}
                          </p>
                          <p className={`text-[10px] ${textSecondary}`}>
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Global Overrides */}
                  <div className={`mt-6 p-4 rounded-xl ${cardBg}`}>
                    <p className={`text-sm font-bold mb-3 ${textPrimary}`}>Global Overrides (optional)</p>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className={`text-xs ${textSecondary}`}>Category for all</label>
                        <select
                          value={globalCategory}
                          onChange={e => setGlobalCategory(e.target.value)}
                          className={inputClass}
                        >
                          <option value="">Auto-detect</option>
                          {categories.map(c => (
                            <option key={c.value} value={c.value}>{c.label} (৳{c.basePrice})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`text-xs ${textSecondary}`}>Base Price (৳)</label>
                        <input
                          type="number"
                          value={globalBasePrice}
                          onChange={e => setGlobalBasePrice(e.target.value)}
                          placeholder="Auto"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={`text-xs ${textSecondary}`}>Original Price (৳)</label>
                        <input
                          type="number"
                          value={globalOriginalPrice}
                          onChange={e => setGlobalOriginalPrice(e.target.value)}
                          placeholder="Auto"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handlePreview}
                      className={`px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all ${btnPrimary}`}
                    >
                      Preview Products ({files.length})
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STAGE 2: Preview & Edit ── */}
          {stage === STAGES.PREVIEW && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm font-bold ${textPrimary}`}>
                  {previews.length} product{previews.length !== 1 ? 's' : ''} to import
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStage(STAGES.UPLOAD)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      darkMode
                        ? 'border-moon-gold/30 text-moon-silver hover:bg-moon-midnight'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleImport}
                    className={`px-6 py-2 rounded-lg text-sm font-bold shadow-lg transition-all ${btnPrimary}`}
                  >
                    Import All ({previews.length})
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {previews.map((item, i) => (
                  <motion.div
                    key={item.filename}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`rounded-xl overflow-hidden ${cardBg} shadow-sm`}
                  >
                    <div className="flex items-start gap-4 p-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden bg-gray-900/10 shrink-0">
                        <img
                          src={URL.createObjectURL(files[i])}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        {editingIndex === i ? (
                          <div className="space-y-2">
                            <input
                              value={item.title}
                              onChange={e => updatePreview(i, 'title', e.target.value)}
                              className={inputClass}
                              placeholder="Product title"
                            />
                            <div className="grid grid-cols-3 gap-2">
                              <select
                                value={item.category}
                                onChange={e => updatePreview(i, 'category', e.target.value)}
                                className={inputClass}
                              >
                                {categories.map(c => (
                                  <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                              </select>
                              <input
                                type="number"
                                value={item.basePrice}
                                onChange={e => updatePreview(i, 'basePrice', Number(e.target.value))}
                                className={inputClass}
                                placeholder="Base price"
                              />
                              <input
                                type="number"
                                value={item.originalPrice}
                                onChange={e => updatePreview(i, 'originalPrice', Number(e.target.value))}
                                className={inputClass}
                                placeholder="Original price"
                              />
                            </div>
                            <textarea
                              value={item.description}
                              onChange={e => updatePreview(i, 'description', e.target.value)}
                              className={`${inputClass} h-16 resize-none`}
                              placeholder="Description"
                            />
                            <button
                              onClick={() => setEditingIndex(null)}
                              className={`text-xs font-medium ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}
                            >
                              Done editing
                            </button>
                          </div>
                        ) : (
                          <>
                            <h3 className={`font-bold text-sm leading-tight mb-1 ${textPrimary}`}>
                              {item.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                darkMode ? 'bg-moon-mystical/20 text-moon-mystical' : 'bg-purple-100 text-purple-700'
                              }`}>
                                {item.category}
                              </span>
                              <span className={`text-xs font-bold ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>
                                ৳{item.basePrice}
                              </span>
                              {item.originalPrice && (
                                <span className={`text-[10px] line-through ${textSecondary}`}>
                                  ৳{item.originalPrice}
                                </span>
                              )}
                            </div>
                            <p className={`text-[11px] truncate ${textSecondary}`}>{item.filename}</p>
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => setEditingIndex(editingIndex === i ? null : i)}
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode ? 'hover:bg-moon-blue/50 text-moon-silver/60' : 'hover:bg-gray-100 text-gray-400'
                          }`}
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFile(i)}
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode ? 'hover:bg-red-500/20 text-red-400/60' : 'hover:bg-red-50 text-red-400'
                          }`}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STAGE 3: Importing ── */}
          {stage === STAGES.IMPORTING && (
            <motion.div
              key="importing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className={`w-20 h-20 mx-auto mb-6 rounded-full border-4 ${
                  darkMode ? 'border-moon-gold/20 border-t-moon-gold' : 'border-purple-200 border-t-purple-600'
                }`}
              />
              <h2 className={`text-xl font-bold mb-2 ${textPrimary}`}>
                Importing {files.length} products...
              </h2>
              <p className={`text-sm mb-6 ${textSecondary}`}>
                Uploading images to Cloudinary and creating products
              </p>

              {/* Progress bar */}
              <div className="max-w-md mx-auto">
                <div className={`h-3 rounded-full overflow-hidden ${
                  darkMode ? 'bg-moon-midnight' : 'bg-gray-200'
                }`}>
                  <motion.div
                    className={`h-full rounded-full ${
                      darkMode ? 'bg-gradient-to-r from-moon-mystical to-moon-gold' : 'bg-gradient-to-r from-purple-600 to-pink-600'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className={`text-sm mt-2 font-medium ${textPrimary}`}>{progress}% uploaded</p>
              </div>
            </motion.div>
          )}

          {/* ── STAGE 4: Done ── */}
          {stage === STAGES.DONE && results && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Summary Cards */}
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <div className={`p-5 rounded-xl text-center ${cardBg}`}>
                  <FiPackage className={`w-8 h-8 mx-auto mb-2 ${
                    darkMode ? 'text-moon-gold' : 'text-purple-600'
                  }`} />
                  <p className={`text-3xl font-black ${darkMode ? 'text-moon-gold' : 'text-purple-600'}`}>
                    {results.total}
                  </p>
                  <p className={`text-xs ${textSecondary}`}>Total Files</p>
                </div>
                <div className={`p-5 rounded-xl text-center ${cardBg}`}>
                  <FiCheck className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-3xl font-black text-green-500">{results.success?.length || 0}</p>
                  <p className={`text-xs ${textSecondary}`}>Imported</p>
                </div>
                <div className={`p-5 rounded-xl text-center ${cardBg}`}>
                  <FiAlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <p className="text-3xl font-black text-red-500">{results.failed?.length || 0}</p>
                  <p className={`text-xs ${textSecondary}`}>Failed</p>
                </div>
              </div>

              {/* Success List */}
              {results.success?.length > 0 && (
                <div className={`rounded-xl p-4 mb-4 ${cardBg}`}>
                  <h3 className={`font-bold text-sm mb-3 ${textPrimary}`}>Imported Products</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {results.success.map((item) => (
                      <div key={item.productId} className={`flex items-center gap-3 p-2 rounded-lg ${
                        darkMode ? 'bg-green-500/10' : 'bg-green-50'
                      }`}>
                        {item.thumbnail && (
                          <img src={item.thumbnail} alt={item.name} className="w-10 h-12 object-contain rounded" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${textPrimary}`}>{item.name}</p>
                          <p className={`text-[10px] ${textSecondary}`}>{item.category} — ৳{item.basePrice}</p>
                        </div>
                        <FiCheck className="w-4 h-4 text-green-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failed List */}
              {results.failed?.length > 0 && (
                <div className={`rounded-xl p-4 mb-4 ${cardBg}`}>
                  <h3 className="font-bold text-sm mb-3 text-red-500">Failed Imports</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {results.failed.map((item, i) => (
                      <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${
                        darkMode ? 'bg-red-500/10' : 'bg-red-50'
                      }`}>
                        <FiAlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${textPrimary}`}>{item.filename}</p>
                          <p className="text-[10px] text-red-400">{item.error}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center mt-6">
                <button
                  onClick={resetAll}
                  className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all ${btnPrimary}`}
                >
                  Import More
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

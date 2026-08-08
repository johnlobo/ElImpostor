import React, { useState } from 'react';
import { Layers, Plus, Trash2, Edit3, Check, Sparkles, FolderPlus, ChevronRight, ArrowLeft } from 'lucide-react';
import { Category, WordItem } from '../types';
import { es } from '../i18n/es';
import { triggerHaptic } from '../lib/haptics';

interface CategoryManagerProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  onSaveCustomCategory: (category: Category) => void;
  onDeleteCustomCategory: (id: string) => void;
  vibrationEnabled: boolean;
  onBackToHome?: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onSaveCustomCategory,
  onDeleteCustomCategory,
  vibrationEnabled,
  onBackToHome
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);

  // New category form state
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('🎨');
  const [catDesc, setCatDesc] = useState('');
  const [catWords, setCatWords] = useState<WordItem[]>([]);
  const [newWordInput, setNewWordInput] = useState('');
  const [newHintInput, setNewHintInput] = useState('');

  const handleOpenNewModal = () => {
    triggerHaptic(30, vibrationEnabled);
    setCatName('');
    setCatIcon('🎨');
    setCatDesc('');
    setCatWords([
      { word: 'Ejemplo 1', hint: 'Pista de ejemplo' },
      { word: 'Ejemplo 2', hint: 'Otra pista' }
    ]);
    setEditingCategory({
      id: `custom-${Date.now()}`,
      name: '',
      icon: '🎨',
      description: '',
      isCustom: true,
      words: []
    });
  };

  const handleOpenEditModal = (cat: Category) => {
    triggerHaptic(30, vibrationEnabled);
    setCatName(cat.name);
    setCatIcon(cat.icon);
    setCatDesc(cat.description);
    setCatWords([...cat.words]);
    setEditingCategory(cat);
  };

  const handleAddWordToForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newWordInput.trim()) return;
    triggerHaptic(20, vibrationEnabled);
    setCatWords([...catWords, { word: newWordInput.trim(), hint: newHintInput.trim() || undefined }]);
    setNewWordInput('');
    setNewHintInput('');
  };

  const handleRemoveWordFromForm = (idx: number) => {
    triggerHaptic(20, vibrationEnabled);
    setCatWords(catWords.filter((_, i) => i !== idx));
  };

  const handleSaveCategoryConfirm = () => {
    if (!catName.trim() || catWords.length < 3) return;
    triggerHaptic([30, 30], vibrationEnabled);

    const saved: Category = {
      id: editingCategory?.id || `custom-${Date.now()}`,
      name: catName.trim(),
      icon: catIcon || '📦',
      description: catDesc.trim() || 'Categoría personalizada',
      isCustom: true,
      words: catWords
    };

    onSaveCustomCategory(saved);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Layers className="w-5 h-5" />
            <h3>{es.categoriesTitle}</h3>
          </div>
          <button
            onClick={handleOpenNewModal}
            id="create-custom-category-btn"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-full transition-all"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Nueva Categoría</span>
          </button>
        </div>

        {/* Random option card */}
        <button
          onClick={() => {
            triggerHaptic(30, vibrationEnabled);
            onSelectCategory('random');
          }}
          className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
            selectedCategoryId === 'random'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-101'
              : 'bg-slate-950 text-slate-200 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎲</span>
            <div>
              <div className="font-extrabold text-sm">{es.allRandom}</div>
              <div className={`text-[11px] ${selectedCategoryId === 'random' ? 'text-slate-900' : 'text-slate-400'}`}>
                Elige una palabra al azar entre todas las categorías
              </div>
            </div>
          </div>
          {selectedCategoryId === 'random' && <Check className="w-5 h-5 font-bold" />}
        </button>
      </div>

      {/* Categories Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Categorías Disponibles ({categories.length})
        </h4>

        <div className="grid grid-cols-1 gap-2.5">
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <div
                key={cat.id}
                className={`rounded-2xl border p-3.5 transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => {
                      triggerHaptic(30, vibrationEnabled);
                      onSelectCategory(cat.id);
                    }}
                    className="flex-1 text-left flex items-start gap-3 min-w-0"
                  >
                    <span className="text-3xl shrink-0 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
                      {cat.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm">{cat.name}</span>
                        {cat.isCustom && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-amber-500/40">
                            Personalizada
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {cat.description}
                      </p>
                      <span className="text-[10px] font-semibold text-slate-500 mt-1 block">
                        {cat.words.length} palabras disponibles
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setViewingCategory(cat)}
                      className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-all"
                      title="Ver lista de palabras"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    {cat.isCustom && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-all"
                          title="Editar categoría"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            triggerHaptic(40, vibrationEnabled);
                            onDeleteCustomCategory(cat.id);
                          }}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-all"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* View Words Modal */}
      {viewingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{viewingCategory.icon}</span>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">{viewingCategory.name}</h3>
                  <span className="text-[10px] text-slate-400">{viewingCategory.words.length} palabras</span>
                </div>
              </div>
              <button
                onClick={() => setViewingCategory(null)}
                className="p-2 rounded-full text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {viewingCategory.words.map((w, i) => (
                <div key={i} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                  <span className="font-bold text-slate-200">{w.word}</span>
                  {w.hint && <span className="text-[10px] text-slate-400 italic shrink-0 max-w-[150px] truncate">{w.hint}</span>}
                </div>
              ))}
            </div>

            <button
              onClick={() => setViewingCategory(null)}
              className="w-full py-3 bg-slate-800 text-slate-200 font-bold rounded-2xl hover:bg-slate-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Custom Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
              {editingCategory.name ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
                  placeholder="Emoji"
                  className="w-14 bg-slate-950 border border-slate-800 rounded-2xl text-center text-xl py-2 focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Nombre de la categoría"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2 font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <input
                type="text"
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="Descripción breve..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2 text-slate-300 focus:outline-none focus:border-amber-400"
              />

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="font-bold text-amber-400 flex justify-between items-center">
                  <span>Lista de Palabras ({catWords.length})</span>
                  <span className="text-[10px] text-slate-500">Mínimo 3</span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {catWords.map((w, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                      <div>
                        <span className="font-bold text-white">{w.word}</span>
                        {w.hint && <span className="text-[10px] text-slate-400 ml-2">({w.hint})</span>}
                      </div>
                      <button
                        onClick={() => handleRemoveWordFromForm(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddWordToForm} className="space-y-2 pt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newWordInput}
                      onChange={(e) => setNewWordInput(e.target.value)}
                      placeholder="Palabra (ej. Coliseo)"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                    <input
                      type="text"
                      value={newHintInput}
                      onChange={(e) => setNewHintInput(e.target.value)}
                      placeholder="Pista opcional"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      disabled={!newWordInput.trim()}
                      className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 px-3 py-2 rounded-xl font-bold"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingCategory(null)}
                className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-2xl hover:bg-slate-700 text-xs"
              >
                {es.cancel}
              </button>
              <button
                onClick={handleSaveCategoryConfirm}
                disabled={!catName.trim() || catWords.length < 3}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-2xl text-xs shadow-md"
              >
                {es.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {onBackToHome && (
        <button
          onClick={onBackToHome}
          className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl transition-all border border-slate-700 flex items-center justify-center gap-2 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Menú Principal</span>
        </button>
      )}
    </div>
  );
};

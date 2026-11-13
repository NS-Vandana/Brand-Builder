import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Layout, 
  Image as ImageIcon, 
  Newspaper, 
  Monitor, 
  Share2, 
  Loader2,
  ArrowRight,
  CheckCircle2,
  X
} from 'lucide-react';
import { generateProductVisuals, GenerationResult } from './lib/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MEDIUMS = [
  { id: 'Studio Shot', icon: ImageIcon, description: 'Clean, minimalist product photography' },
  { id: 'Billboard', icon: Layout, description: 'Large scale outdoor advertisement' },
  { id: 'Newspaper', icon: Newspaper, description: 'Classic print media layout' },
  { id: 'Social Post', icon: Share2, description: 'Modern square format for digital' },
  { id: 'Website Hero', icon: Monitor, description: 'Full-width digital experience' },
];

export default function App() {
  const [description, setDescription] = useState('');
  const [selectedMediums, setSelectedMediums] = useState<string[]>(['Studio Shot', 'Billboard', 'Social Post']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleMedium = (id: string) => {
    setSelectedMediums(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!description.trim() || selectedMediums.length === 0) return;

    setIsGenerating(true);
    setError(null);
    setResults([]);

    try {
      const visuals = await generateProductVisuals(description, selectedMediums);
      setResults(visuals);
    } catch (err) {
      console.error(err);
      setError('Failed to generate visuals. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 text-[#b18484] bg-[#d3d3db]">
      {/* Hero Section */}
      <header className="pt-20 pb-12 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-black/40 mb-4 block">
            Creative Suite v1.0
          </span>
          <h1 className="editorial-title mb-6">
            Brand <br />
            <span className="text-black/20">Builder.</span>
          </h1>
          <p className="max-w-xl text-lg text-black/60 leading-relaxed">
            Describe your product and visualize it instantly across multiple mediums. 
            Maintain consistency. Zero people. Pure brand.
          </p>
        </motion.div>
      </header>

      <main className="px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Input Section */}
        <section className="lg:col-span-5 space-y-8">
          <div className="glass-card p-8 space-y-6 text-[#b98585] [border-style:groove]!">
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-black/60">
                Product Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. A sleek, matte black espresso machine with copper accents and a minimalist interface..."
                className="w-full h-40 bg-transparent border-b border-black/10 focus:border-black outline-none transition-colors resize-none py-2 text-lg"
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold uppercase tracking-wider text-black/60 block">
                Select Mediums
              </label>
              <div className="grid grid-cols-1 gap-3">
                {MEDIUMS.map((medium) => {
                  const Icon = medium.icon;
                  const isSelected = selectedMediums.includes(medium.id);
                  return (
                    <button
                      key={medium.id}
                      onClick={() => toggleMedium(medium.id)}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-2xl transition-all text-left group",
                        isSelected 
                          ? "bg-black text-white" 
                          : "bg-black/5 hover:bg-black/10 text-black"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        isSelected ? "bg-white/20" : "bg-black/5"
                      )}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="font-medium">{medium.id}</div>
                        <div className={cn(
                          "text-xs",
                          isSelected ? "text-white/60" : "text-black/40"
                        )}>
                          {medium.description}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={16} className="ml-auto mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !description.trim() || selectedMediums.length === 0}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Generating Campaign...
                </>
              ) : (
                <>
                  Generate Visuals
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                <X size={16} />
                {error}
              </div>
            )}
          </div>
        </section>

        {/* Results Section */}
        <section className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[600px] flex flex-col items-center justify-center space-y-6 text-center"
              >
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-black/5 rounded-full" />
                  <div className="w-24 h-24 border-4 border-t-black rounded-full animate-spin absolute top-0 left-0" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black/20" size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-medium">Crafting your brand...</h3>
                  <p className="text-black/40 max-w-xs">
                    Our AI is generating consistent visuals across all selected mediums.
                  </p>
                </div>
              </motion.div>
            ) : results.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 gap-8"
              >
                {results.map((result, index) => (
                  <motion.div
                    key={result.medium}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif italic text-2xl">{result.medium}</h3>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-black/40">
                        Generated Asset #{index + 1}
                      </span>
                    </div>
                    <div className="group relative overflow-hidden rounded-3xl bg-black/5 aspect-[16/9] md:aspect-video">
                      <img
                        src={result.imageUrl}
                        alt={result.medium}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = result.imageUrl;
                            link.download = `brand-${result.medium.toLowerCase().replace(' ', '-')}.png`;
                            link.click();
                          }}
                          className="bg-white text-black px-6 py-3 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-black hover:text-white transition-colors"
                        >
                          Download Asset
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-[600px] border-2 border-dashed border-black/5 rounded-[40px] flex flex-col items-center justify-center text-center p-12"
              >
                <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="text-black/20" size={32} />
                </div>
                <h3 className="text-xl font-medium mb-2">Ready to visualize?</h3>
                <p className="text-black/40 max-w-xs">
                  Enter your product details and select your target mediums to begin the generation process.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 pt-12 border-t border-black/5 px-6 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <Sparkles className="text-white" size={16} />
          </div>
          <span className="font-bold tracking-tight">BrandBuilder</span>
        </div>
        <div className="flex gap-8 text-xs font-mono uppercase tracking-widest text-black/40">
          <span>Nano-Banana Engine</span>
          <span>No Humans Policy</span>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}

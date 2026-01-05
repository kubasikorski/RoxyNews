
import React, { useState, useEffect, useCallback } from 'react';
import { RSSFeed } from './types';
import { fetchFeed, ROKSANA_FEED_URL } from './services/rssService';

const App: React.FC = () => {
  const [feed, setFeed] = useState<RSSFeed | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFeed(ROKSANA_FEED_URL);
      setFeed(data);
    } catch (err) {
      setError('Nie udało się załadować wiadomości. Spróbuj odświeżyć stronę.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center selection:bg-green-100 selection:text-green-900">
      {/* Simple Header */}
      <header className="w-full border-b border-slate-100 py-8 px-6 sticky top-0 bg-white/80 backdrop-blur-md z-40">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-200 transition-transform hover:scale-105">
              <i className="fa-solid fa-microphone-lines text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Roxie News</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Live RSS Stream</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Stream */}
      <main className="w-full max-w-3xl px-6 py-12">
        {error && (
          <div className="mb-12 p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 flex items-center gap-4">
            <i className="fa-solid fa-circle-exclamation text-xl"></i>
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <div className="space-y-12">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-4">
                <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
                <div className="h-3 bg-slate-50 rounded-full w-1/2"></div>
                <div className="h-20 bg-slate-50 rounded-2xl w-full"></div>
              </div>
            ))
          ) : (
            feed?.items.map((item) => (
              <article 
                key={item.guid}
                className="group relative flex flex-col gap-4 transition-all"
              >
                <header className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-green-500 uppercase tracking-widest mb-2">
                      <span>{item.author || 'Google News'}</span>
                      <span className="text-slate-200">•</span>
                      <span className="text-slate-400">{new Date(item.pubDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}</span>
                    </div>
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <h2 className="text-2xl font-bold text-slate-900 leading-snug group-hover:text-green-600 transition-colors">
                        {item.title}
                      </h2>
                    </a>
                  </div>
                </header>

                <div className="text-slate-600 leading-relaxed text-base font-medium">
                  {item.description.replace(/<[^>]*>/g, '')}
                </div>

                <div className="pt-4 flex items-center gap-6">
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-slate-900 flex items-center gap-2 hover:gap-3 transition-all underline decoration-green-200 decoration-4 underline-offset-4 hover:decoration-green-500"
                  >
                    Czytaj na źródle <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </a>
                </div>
                
                <div className="absolute -left-8 top-0 h-full w-[1px] bg-slate-100 hidden md:block"></div>
              </article>
            ))
          )}
        </div>
      </main>

      <footer className="w-full border-t border-slate-100 py-12 px-6 bg-slate-50/50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            CubeDev • {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;

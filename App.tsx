
import React, { useState, useEffect, useCallback } from 'react';
import { RSSFeed } from './types';
import { fetchFeed, ROKSANA_FEED_URL } from './services/rssService';

// Declaration for SmtpJS global object
declare const Email: any;

const App: React.FC = () => {
  const [feed, setFeed] = useState<RSSFeed | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showMailModal, setShowMailModal] = useState<boolean>(false);
  const [recipient, setRecipient] = useState<string>('');
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);
  const [mailStatus, setMailStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

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

  const handleSmtpSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feed || !recipient) return;

    // Safety check for SmtpJS
    if (typeof Email === 'undefined') {
      setMailStatus({ type: 'error', message: 'Biblioteka SMTP nie została załadowana. Sprawdź połączenie internetowe.' });
      return;
    }

    setSendingEmail(true);
    setMailStatus(null);

    const dateStr = new Date().toLocaleDateString('pl-PL');
    const subject = `Roxie News Digest - ${dateStr}`;
    
    // Create a "nice" HTML summary
    let htmlBody = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #f1f5f9; border-radius: 20px; overflow: hidden;">
        <div style="background-color: #22c55e; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -1px;">Roxie News Digest</h1>
          <p style="color: #dcfce7; margin-top: 5px; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 2px;">Daily updates about Roksana Węgiel</p>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="color: #64748b; font-size: 14px; margin-bottom: 30px;">Cześć! Oto Twoje codzienne zestawienie najnowszych informacji o Roksanie Węgiel z dnia <strong>${dateStr}</strong>.</p>
    `;

    feed.items.slice(0, 8).forEach((item, idx) => {
      htmlBody += `
        <div style="margin-bottom: 30px; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
             <span style="background-color: #f0fdf4; color: #166534; font-weight: bold; font-size: 10px; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;">${item.author || 'News'}</span>
             <span style="color: #94a3b8; font-size: 11px; margin-left: 10px;">${new Date(item.pubDate).toLocaleDateString('pl-PL')}</span>
          </div>
          <h2 style="font-size: 18px; margin: 0 0 10px 0; line-height: 1.4;">
            <a href="${item.link}" style="color: #0f172a; text-decoration: none; font-weight: bold;">${item.title}</a>
          </h2>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 15px 0;">
            ${item.description.replace(/<[^>]*>/g, '').substring(0, 180)}...
          </p>
          <a href="${item.link}" style="display: inline-block; background-color: #0f172a; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: bold;">Czytaj artykuł</a>
        </div>
      `;
    });

    htmlBody += `
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px dashed #f1f5f9;">
            <p style="color: #94a3b8; font-size: 12px;">Dziękujemy, że jesteś z nami!</p>
            <p style="color: #cbd5e1; font-size: 10px;">Wiadomość wygenerowana automatycznie przez aplikację Roxie News Digest.</p>
          </div>
        </div>
      </div>
    `;

    try {
      const response = await Email.send({
        Host: "mail53.mydevil.net",
        Username: "news@roxynews.pl",
        Password: "3Hnt43-uuWg0!u1Lp8ifc_aF<6ebng",
        To: recipient,
        From: "news@roxynews.pl",
        Subject: subject,
        Body: htmlBody,
      });

      if (response === "OK") {
        setMailStatus({ type: 'success', message: 'Wiadomość została wysłana pomyślnie!' });
        setTimeout(() => {
          setShowMailModal(false);
          setMailStatus(null);
        }, 2500);
      } else {
        throw new Error(response);
      }
    } catch (err: any) {
      setMailStatus({ type: 'error', message: `Błąd wysyłki: ${err.message || 'Spróbuj ponownie.'}` });
    } finally {
      setSendingEmail(false);
    }
  };

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
          
          {!loading && feed && (
            <button
              onClick={() => setShowMailModal(true)}
              className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg transition-all flex items-center gap-2 group"
            >
              <i className="fa-solid fa-envelope group-hover:scale-110 transition-transform"></i>
              Wyślij zestawienie
            </button>
          )}
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

      {/* Mail Modal */}
      {showMailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">Wyślij Digest</h3>
              <button onClick={() => setShowMailModal(false)} className="text-slate-300 hover:text-slate-900 transition-colors">
                <i className="fa-solid fa-circle-xmark text-2xl"></i>
              </button>
            </div>

            <form onSubmit={handleSmtpSend} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail odbiorcy</label>
                <input
                  autoFocus
                  required
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="np. fan@example.com"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all text-slate-900"
                />
              </div>

              {mailStatus && (
                <div className={`p-4 rounded-2xl text-sm font-medium ${
                  mailStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {mailStatus.message}
                </div>
              )}

              <button
                disabled={sendingEmail}
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-200 text-white font-black py-4 rounded-2xl shadow-xl shadow-green-100 transition-all flex items-center justify-center gap-3 mt-4"
              >
                {sendingEmail ? (
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i>
                    Wyślij przez SMTP
                  </>
                )}
              </button>
              
              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-6">
                Zasila: mail53.mydevil.net
              </p>
            </form>
          </div>
        </div>
      )}

      <footer className="w-full border-t border-slate-100 py-12 px-6 bg-slate-50/50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Koniec wiadomości • {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
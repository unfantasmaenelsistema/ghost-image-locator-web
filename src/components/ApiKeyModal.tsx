import React, { useEffect, useState } from 'react';
import { KeyRound, X, Eye, EyeOff, ShieldCheck, Trash2, ExternalLink } from 'lucide-react';
import { getApiKey, setApiKey, clearApiKey, isApiKeyRemembered, maskApiKey } from '../services/apiKeyStore';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [value, setValue] = useState('');
  const [remember, setRemember] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [savedKey, setSavedKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const current = getApiKey();
    setSavedKey(current);
    setValue('');
    setRemember(current ? isApiKeyRemembered() : true);
    setShowKey(false);
    setError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Introduce tu API key de Gemini.');
      return;
    }
    if (!setApiKey(trimmed, remember)) {
      setError('El navegador ha bloqueado el almacenamiento local (¿modo privado?). No se ha podido guardar la clave.');
      return;
    }
    onClose();
  };

  const handleForget = () => {
    clearApiKey();
    setSavedKey('');
    setValue('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-800/60 bg-emerald-950/80 text-emerald-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">API Key de Google Gemini</h3>
              <p className="text-xs text-slate-400">Se guarda solo en este navegador</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 p-5">
          {savedKey && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-800/50 bg-emerald-950/30 px-3 py-2 text-xs">
              <span className="text-emerald-300">
                Clave activa: <span className="font-mono">{maskApiKey(savedKey)}</span>{' '}
                <span className="text-slate-400">({isApiKeyRemembered() ? 'recordada' : 'solo esta sesión'})</span>
              </span>
              <button
                type="button"
                onClick={handleForget}
                className="flex items-center gap-1 text-rose-400 hover:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" /> Olvidar
              </button>
            </div>
          )}

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-300">
              {savedKey ? 'Sustituir por otra clave' : 'Tu API key'}
            </span>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="AIza..."
                autoComplete="off"
                spellCheck={false}
                autoFocus
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 pr-10 font-mono text-sm text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-200"
                title={showKey ? 'Ocultar' : 'Mostrar'}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <label className="flex items-start gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="mt-0.5 accent-emerald-500"
            />
            <span>
              Recordar en este navegador (localStorage). Desmárcalo en equipos compartidos: la clave se borrará al
              cerrar la pestaña.
            </span>
          </label>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="space-y-1.5 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-[11px] leading-relaxed text-slate-400">
            <p className="flex items-start gap-1.5">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
              La clave no se envía a ningún servidor de esta web: las peticiones van directamente de tu navegador a la
              API de Google.
            </p>
            <p>
              Recomendado: crea una clave dedicada y, en Google Cloud Console, restríngela a la API "Generative Language"
              y ponle límite de cuota.
            </p>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
            >
              Obtener una API key gratis en Google AI Studio <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-semibold text-white hover:from-emerald-500 hover:to-teal-500"
            >
              Guardar clave
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

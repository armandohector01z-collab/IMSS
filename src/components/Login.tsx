import React, { useState } from 'react';
import { BadgeHelp, Lock, LogIn, UserPlus, ShieldPlus } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [nss, setNss] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nss: parseInt(nss) }),
      });

      const data = await response.json();

      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message || 'NSS inváldio');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center p-4 md:p-0">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-12 w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-outline-variant overflow-hidden"
      >
        {/* Left Side: Visual Brand */}
        <div className="hidden md:flex md:col-span-6 bg-primary relative flex-col justify-center p-12 overflow-hidden">
          <div className="z-10 relative">
            <h1 className="font-display text-5xl font-extrabold text-white mb-6 leading-tight">
              Cuidamos de tu salud.
            </h1>
            <p className="text-xl text-white/90 leading-relaxed max-w-md">
              Accede a tu historial clínico, agenda citas y gestiona tus documentos médicos con la seguridad y rapidez que mereces.
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full border-[48px] border-primary-container"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full border-[24px] border-secondary"></div>
          </div>
          
          <img 
            alt="Medical Clinic Interior" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-40"
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2053"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Right Side: Login Form */}
        <div className="col-span-1 md:col-span-6 flex flex-col p-8 md:p-16 justify-center bg-surface">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-12">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Logo_del_IMSS.svg/1200px-Logo_del_IMSS.svg.png" 
              alt="IMSS Logo" 
              className="w-24 h-24 object-contain mb-4"
              referrerPolicy="no-referrer"
            />
            <span className="font-display text-2xl font-bold text-[#006138]">IMSS Digital</span>
          </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-100">
                  {error}
                </div>
              )}
              <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-500 uppercase tracking-wider" htmlFor="nss">
                NSS
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <BadgeHelp size={20} />
                </span>
                <input 
                  type="text"
                  id="nss"
                  placeholder="Número de Seguro Social"
                  value={nss}
                  onChange={(e) => setNss(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-zinc-500 uppercase tracking-wider" htmlFor="password">
                  Contraseña
                </label>
                <a href="#" className="text-sm font-semibold text-primary hover:underline">
                  ¿Olvidó contraseña?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Lock size={20} />
                </span>
                <input 
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-zinc-400"
                />
              </div>
            </div>

              {/* Main Action */}
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-primary text-white font-bold rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg mt-4 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <LogIn size={20} />
                    ENTRAR
                  </>
                )}
              </button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-outline-variant"></div>
              <span className="flex-shrink mx-4 text-zinc-400 text-xs">O</span>
              <div className="flex-grow border-t border-outline-variant"></div>
            </div>

            {/* Registration Link */}
            <div className="text-center">
              <p className="text-sm text-zinc-600">
                ¿Aún no tienes acceso? 
                <button 
                  type="button"
                  className="font-bold text-primary hover:text-primary/80 flex items-center justify-center gap-1 mx-auto mt-2 transition-colors cursor-pointer"
                >
                  <UserPlus size={16} />
                  + Nueva cuenta
                </button>
              </p>
            </div>
          </form>

          {/* Footer Legal */}
          <div className="mt-12 pt-6 border-t border-outline-variant text-center">
            <p className="text-xs text-zinc-400 leading-normal">
              Al ingresar, aceptas nuestros <a href="#" className="underline text-primary">Términos de Servicio</a> y <a href="#" className="underline text-primary">Aviso de Privacidad</a>.
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

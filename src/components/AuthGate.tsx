import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CREDENTIALS = {
  user: import.meta.env.VITE_AUTH_USER || 'CMR',
  pass: import.meta.env.VITE_AUTH_PASS || ''
};

interface AuthProps {
  onAuthenticated: () => void;
}

export const AuthGate: React.FC<AuthProps> = ({ onAuthenticated }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === CREDENTIALS.user && pass === CREDENTIALS.pass) {
      localStorage.setItem('io_auth_token', 'valid');
      onAuthenticated();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050505] flex items-center justify-center z-50">
      <div className="w-full max-w-md p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-light tracking-[0.2em] text-white/90 mb-2">INTIMACY OS</h1>
          <p className="text-xs tracking-widest text-white/40 uppercase">Restricted Access // Protocol V4</p>
        </motion.div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="OPERATOR ID"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 text-center text-white tracking-widest placeholder:text-white/20 focus:outline-none focus:border-red-500/50 transition-colors uppercase"
            />
            <input
              type="password"
              placeholder="ACCESS KEY"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 text-center text-white tracking-widest placeholder:text-white/20 focus:outline-none focus:border-red-500/50 transition-colors"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className={`w-full p-4 uppercase tracking-[0.2em] text-xs font-bold transition-all duration-500 ${
              error ? 'bg-red-900/50 text-red-200' : 'bg-white text-black hover:bg-red-500 hover:text-white'
            }`}
          >
            {error ? 'Access Denied' : 'Initialize System'}
          </motion.button>
        </form>
      </div>
    </div>
  );
};
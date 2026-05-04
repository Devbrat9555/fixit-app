import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if not already installed and user hasn't dismissed it this session
      if (!sessionStorage.getItem('pwa_dismissed')) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '100px',
      left: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none'
    }}>
      <div className="glass-card" style={{
        padding: '1.25rem',
        width: '100%',
        maxWidth: '450px',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        border: '1px solid var(--accent)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        pointerEvents: 'auto'
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'var(--brand-grad)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <Download size={24} color="#121212" />
        </div>
        
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white', marginBottom: 2 }}>Install Fixit App</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Fast, reliable, and available offline.</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={handleInstall}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: 10, height: 40 }}
          >
            Install
          </button>
          <button 
            onClick={handleDismiss}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: 'none', 
              borderRadius: 10, 
              width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)'
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;

import React, { useEffect } from 'react';
import './AdBanner.css';

/**
 * Componente de Banner de Anuncios
 * Soporta Google AdSense y anuncios personalizados
 * 
 * @param {string} format - Formato del anuncio: 'banner', 'rectangle', 'native'
 * @param {boolean} isPremium - Si el usuario es premium (no mostrar anuncios)
 * @param {string} position - Posición: 'feed', 'sidebar', 'events', 'market'
 */
const AdBanner = ({ format = 'banner', isPremium = false, position = 'feed' }) => {
  
  // No mostrar anuncios a usuarios premium
  if (isPremium) {
    return null;
  }

  useEffect(() => {
    // Inicializar Google AdSense cuando el componente se monta
    try {
      if (window.adsbygoogle && process.env.NODE_ENV === 'production') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('Error cargando anuncio:', error);
    }
  }, []);

  // Configuración de tamaños según formato
  const adSizes = {
    banner: { 
      width: '728px', 
      height: '90px', 
      slot: import.meta.env.VITE_ADSENSE_BANNER_SLOT || '1234567890'
    },
    rectangle: { 
      width: '300px', 
      height: '250px', 
      slot: import.meta.env.VITE_ADSENSE_RECTANGLE_SLOT || '0987654321'
    },
    native: { 
      width: '100%', 
      height: 'auto', 
      slot: import.meta.env.VITE_ADSENSE_NATIVE_SLOT || '1122334455'
    },
    leaderboard: { 
      width: '970px', 
      height: '90px', 
      slot: import.meta.env.VITE_ADSENSE_BANNER_SLOT || '1234567890'
    }
  };

  const currentSize = adSizes[format] || adSizes.banner;
  const adsenseClientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;

  return (
    <div className={`ad-container ad-${format} ad-${position}`}>
      <span className="ad-label">Publicidad</span>
      
      {/* Google AdSense */}
      {process.env.NODE_ENV === 'production' && adsenseClientId ? (
        <ins
          className="adsbygoogle"
          style={{
            display: 'block',
            width: currentSize.width,
            height: currentSize.height
          }}
          data-ad-client={adsenseClientId}
          data-ad-slot={currentSize.slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        // Placeholder en desarrollo
        <div 
          className="ad-placeholder"
          style={{
            width: currentSize.width,
            height: currentSize.height,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: 600,
            borderRadius: '8px'
          }}
        >
          Anuncio {format.toUpperCase()} - {currentSize.width} x {currentSize.height}
        </div>
      )}
    </div>
  );
};

export default AdBanner;

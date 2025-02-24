import { useState, useEffect, useRef } from 'react';

const CACHE_KEY = 'cached-component';

const CacheableComponent = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showCached, setShowCached] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  // Cache the component's HTML structure
  const cacheComponent = () => {
    if (componentRef.current && isOnline) {
      const htmlContent = componentRef.current.outerHTML;
      const styles = Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules).map(rule => rule.cssText).join('');
          } catch (e) {
            return '';
          }
        })
        .join('');
      
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        html: htmlContent,
        styles: styles,
        timestamp: Date.now()
      }));
    }
  };

  // Load cached component
  const loadCachedComponent = () => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      setShowCached(true);
    }
  };

  // Initial cache on mount
  useEffect(() => {
    cacheComponent();
    window.addEventListener('beforeunload', cacheComponent);

    return () => {
      window.removeEventListener('beforeunload', cacheComponent);
    };
  }, []);

  // Network status detection
  useEffect(() => {
    const handleNetworkChange = () => {
      const newStatus = navigator.onLine;
      setIsOnline(newStatus);
      if (!newStatus) loadCachedComponent();
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, []);

  if (showCached && !isOnline) {
    const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    return (
      <div dangerouslySetInnerHTML={{ 
        __html: `
          <style>${cachedData.styles}</style>
          ${cachedData.html}
        `
      }} />
    );
  }

  return (
    <div ref={componentRef}>
      <h2>Cacheable Component</h2>
      <p>This component will be cached for offline use</p>
      <button onClick={() => alert('Cached interaction works!')}>
        Test Button
      </button>
      {!isOnline && <p>Offline Version</p>}
    </div>
  );
};

export default CacheableComponent;

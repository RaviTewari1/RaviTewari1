import { useState, useEffect, useRef } from 'react';

const COMPONENT_CACHE_KEY = 'cached-component-v1';

const CacheableComponent = () => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedMarkup, setCachedMarkup] = useState('');

  // 1. Cache the component HTML on mount and before unload
  const cacheComponent = () => {
    if (componentRef.current && isOnline) {
      const html = componentRef.current.outerHTML;
      localStorage.setItem(COMPONENT_CACHE_KEY, html);
    }
  };

  // 2. Restore from cache when page loads
  const restoreFromCache = () => {
    const savedHtml = localStorage.getItem(COMPONENT_CACHE_KEY);
    if (savedHtml) setCachedMarkup(savedHtml);
  };

  // 3. Event listeners setup
  useEffect(() => {
    // Initial cache
    cacheComponent();
    
    // Cache before page unload
    window.addEventListener('beforeunload', cacheComponent);
    
    // Restore on page load
    window.addEventListener('load', restoreFromCache);
    
    // Network detection
    const handleNetworkChange = () => {
      setIsOnline(navigator.onLine);
      if (!navigator.onLine) restoreFromCache();
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    return () => {
      window.removeEventListener('beforeunload', cacheComponent);
      window.removeEventListener('load', restoreFromCache);
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, []);

  if (!isOnline && cachedMarkup) {
    return <div dangerouslySetInnerHTML={{ __html: cachedMarkup }} />;
  }

  return (
    <div ref={componentRef}>
      <h2>Offline-Ready Component</h2>
      <p>This component will survive server downtime</p>
      <button onClick={() => alert('Works in offline mode!')}>
        Test Interaction
      </button>
      {!isOnline && <p>⚠️ Currently offline - using cached version</p>}
    </div>
  );
};

export default CacheableComponent;

import { useState, useEffect } from 'react';

interface CachedData {
  data: any;
  timestamp: number;
}

const CacheableComponent = () => {
  const [data, setData] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache data in localStorage
  const cacheData = (newData: any) => {
    const cache: CachedData = {
      data: newData,
      timestamp: Date.now()
    };
    localStorage.setItem('cachedRoute', JSON.stringify(cache));
  };

  // Load data from cache or API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (isOnline) {
          // Fetch fresh data
          const response = await fetch('https://api.example.com/data');
          if (!response.ok) throw new Error('Failed to fetch');
          const newData = await response.json();
          setData(newData);
          cacheData(newData);
        } else {
          // Load cached data
          const cached = localStorage.getItem('cachedRoute');
          if (cached) {
            const parsedCache: CachedData = JSON.parse(cached);
            setData(parsedCache.data);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOnline]);

  // Network status detection
  useEffect(() => {
    const handleNetworkChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Cacheable Content</h2>
      {!isOnline && <p>⚠️ Currently offline - showing cached content</p>}
      
      {data ? (
        <div>
          <p>Last updated: {new Date(data.timestamp).toLocaleString()}</p>
          {/* Render your data here */}
          {data.items?.map((item: any) => (
            <div key={item.id}>{item.name}</div>
          ))}
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default CacheableComponent;

import React, { useEffect, useState } from 'react';

interface JsonData {
  key: string;
}

const App: React.FC = () => {
  const [jsonData, setJsonData] = useState<JsonData | null>(null);
  const [arrowData, setArrowData] = useState<ArrayBuffer | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const response = await fetch('/data');
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('multipart/mixed')) {
      const boundary = contentType.split('boundary=')[1];
      const text = await response.text();

      const parts = text.split(`--${boundary}`).filter(part => part.trim() !== '--' && part.trim() !== '');

      let jsonPart = parts.find(part => part.includes('application/json'));
      let arrowPart = parts.find(part => part.includes('application/vnd.apache.arrow.file'));

      if (jsonPart) {
        const jsonBody = jsonPart.split('\r\n\r\n')[1].split('\r\n--')[0];
        setJsonData(JSON.parse(jsonBody) as JsonData);
      }

      if (arrowPart) {
        const arrowBody = arrowPart.split('\r\n\r\n')[1].split('\r\n--')[0];
        const arrowArrayBuffer = new TextEncoder().encode(arrowBody).buffer;
        setArrowData(arrowArrayBuffer);
      }
    }
  };

  return (
    <div>
      <h1>Fetched Data</h1>
      <h2>JSON Data</h2>
      <pre>{jsonData ? JSON.stringify(jsonData, null, 2) : 'Loading...'}</pre>
      <h2>Arrow Data</h2>
      <pre>{arrowData ? 'Arrow data loaded' : 'Loading...'}</pre>
    </div>
  );
};

export default App;

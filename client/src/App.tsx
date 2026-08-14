import { useState, useEffect } from 'react';

interface HealthStatus {
  status: string;
  service: string;
}

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/health');
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data: HealthStatus = await response.json();
      setHealth(data);
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อกับ Server ได้ กรุณาตรวจสอบว่า Backend (http://localhost:5000) กำลังรันอยู่');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="container mt-5">
      <div className="card shadow-sm mx-auto" style={{ maxWidth: '500px' }}>
        <div className="card-body text-center">
          <h2 className="card-title text-primary mb-4">TokTickIT System Status</h2>

          {loading && (
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          )}

          {error && (
            <div className="alert alert-danger mb-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          {health && !loading && (
            <div className="alert alert-success mb-3" role="alert">
              <p className="mb-1"><strong>Service:</strong> {health.service}</p>
              <p className="mb-0"><strong>Status:</strong> <span className="badge bg-success">{health.status}</span></p>
            </div>
          )}

          <button className="btn btn-outline-primary btn-sm mt-2" onClick={checkHealth}>
            Re-check Connection
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

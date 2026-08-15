import { useState } from 'react';

interface HealthStatus {
  status: string;
  service: string;
}

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const checkHealth = async () => {
    setLoading(true);
    setError(false);
    setHealth(null);

    try {
      const response = await fetch('http://localhost:5000/api/health');
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data: HealthStatus = await response.json();
      setHealth(data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm mx-auto" style={{ maxWidth: '500px' }}>
        <div className="card-body text-center">
          <h2 className="card-title text-primary mb-4">TokTickIT IT Service Desk</h2>

          {loading && (
            <div className="my-3 text-muted" role="status">
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
              <span>loading</span>
            </div>
          )}

          {error && !loading && (
            <div className="alert alert-danger my-3" role="alert">
              <div>System Status: Offline</div>
              <div>Unable to connect to TokTickIT API</div>
            </div>
          )}

          {health && !loading && (
            <div className="alert alert-success my-3" role="alert">
              System Status: Online
            </div>
          )}

          <button
            className="btn btn-primary mt-2"
            onClick={checkHealth}
            disabled={loading}
          >
            Check System
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

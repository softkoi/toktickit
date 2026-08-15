import { useState } from 'react';

interface HealthStatus {
  status: string;
  service: string;
}

interface Category {
  id: number;
  name: string;
}

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const checkHealth = async () => {
    setLoading(true);
    setError(false);
    setHealth(null);
    setCategories([]);

    try {
      // 1. Health check
      const healthRes = await fetch('http://localhost:5000/api/health');
      if (!healthRes.ok) throw new Error('API server offline');
      const healthData: HealthStatus = await healthRes.json();
      setHealth(healthData);

      // 2. Fetch categories (if DB is connected)
      try {
        const catRes = await fetch('http://localhost:5000/api/categories');
        if (catRes.ok) {
          const catData: Category[] = await catRes.json();
          setCategories(catData);
        }
      } catch (catErr) {
        console.warn('Could not fetch categories:', catErr);
      }
    } catch (err) {
      setError(true);
      setHealth(null);
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

          {categories.length > 0 && !loading && (
            <div className="mt-4 text-start">
              <h5 className="fw-bold mb-3">Categories List:</h5>
              <ul className="list-group">
                {categories.map((cat) => (
                  <li key={cat.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{cat.name}</span>
                    <span className="badge bg-secondary rounded-pill">ID: {cat.id}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            className="btn btn-primary mt-3"
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

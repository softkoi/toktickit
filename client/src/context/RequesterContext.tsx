import React, { createContext, useContext, useState, useEffect } from 'react';

export interface RequesterUser {
  id: number;
  name: string;
  email: string;
}

interface RequesterContextType {
  activeRequester: RequesterUser | null;
  setActiveRequester: (requester: RequesterUser | null) => void;
  requesters: RequesterUser[];
  loading: boolean;
  error: string | null;
  fetchRequesters: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

const RequesterContext = createContext<RequesterContextType | undefined>(undefined);

export const RequesterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRequester, setActiveRequesterState] = useState<RequesterUser | null>(() => {
    const saved = localStorage.getItem('toktickit_requester');
    return saved ? JSON.parse(saved) : null;
  });
  const [requesters, setRequesters] = useState<RequesterUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequesters = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/requesters');
      const data = await res.json();
      if (data.success) {
        setRequesters(data.data);
        // Default to first requester if none selected
        if (!activeRequester && data.data.length > 0) {
          setActiveRequesterState(data.data[0]);
          localStorage.setItem('toktickit_requester', JSON.stringify(data.data[0]));
        }
      } else {
        setError(data.error?.message || 'Failed to load requesters');
      }
    } catch (err) {
      setError('Network error while loading requesters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequesters();
  }, []);

  const setActiveRequester = (requester: RequesterUser | null) => {
    setActiveRequesterState(requester);
    if (requester) {
      localStorage.setItem('toktickit_requester', JSON.stringify(requester));
    } else {
      localStorage.removeItem('toktickit_requester');
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    if (!activeRequester) return {};
    return { 'X-Requester-Id': activeRequester.id.toString() };
  };

  return (
    <RequesterContext.Provider
      value={{
        activeRequester,
        setActiveRequester,
        requesters,
        loading,
        error,
        fetchRequesters,
        getAuthHeaders
      }}
    >
      {children}
    </RequesterContext.Provider>
  );
};

export const useRequester = () => {
  const context = useContext(RequesterContext);
  if (!context) {
    throw new Error('useRequester must be used within a RequesterProvider');
  }
  return context;
};

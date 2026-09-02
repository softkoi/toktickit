import React, { useState } from 'react';
import { RequesterProvider } from './context/RequesterContext';
import { Navbar } from './components/Navbar';
import { RequesterSwitcher } from './components/RequesterSwitcher';

export const AppContent: React.FC = () => {
  const [showSwitcherModal, setShowSwitcherModal] = useState(false);

  return (
    <div>
      <Navbar onOpenSwitcher={() => setShowSwitcherModal(true)} />

      <main className="app-container">
        {showSwitcherModal ? (
          <div>
            <RequesterSwitcher onClose={() => setShowSwitcherModal(false)} />
          </div>
        ) : (
          <div>
            <RequesterSwitcher />
          </div>
        )}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <RequesterProvider>
      <AppContent />
    </RequesterProvider>
  );
};

export default App;

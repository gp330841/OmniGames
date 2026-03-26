import { useState, useEffect } from 'react'
import './App.css'
import Home from './components/Home'
import TicTacToe from './components/TicTacToe'
import Ludo from './components/Ludo'
import Auth from './components/Auth'

function App() {
  const [activeGame, setActiveGame] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check valid session on mount
  useEffect(() => {
    const token = localStorage.getItem('omni_token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetch('http://localhost:3001/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (res.ok) return res.json();
      throw new Error('Invalid token');
    })
    .then(data => {
      setCurrentUser(data.user.username);
    })
    .catch(() => {
      localStorage.removeItem('omni_token');
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('omni_token');
    setCurrentUser(null);
    setActiveGame('home');
  };

  const renderGame = () => {
    if (loading) {
      return <div className="loader">Authenticating...</div>;
    }

    if (!currentUser) {
      return <Auth onLogin={setCurrentUser} />;
    }

    switch (activeGame) {
      case 'tictactoe':
        return <TicTacToe onBack={() => setActiveGame('home')} />;
      case 'ludo':
        return <Ludo onBack={() => setActiveGame('home')} />;
      default:
        return (
          <>
            <div className="user-nav">
              <span className="welcome-text">Logged in as <b>{currentUser}</b></span>
              <button className="btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </div>
            <Home onSelectGame={setActiveGame} />
          </>
        );
    }
  }

  return (
    <div className="app-container">
      {/* Background decoration */}
      <div className="bg-decor top-left"></div>
      <div className="bg-decor bottom-right"></div>
      
      {/* Main Content Area */}
      <main className="main-content">
        {renderGame()}
      </main>
    </div>
  )
}

export default App

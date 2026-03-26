import React from 'react';
import './Home.css';

const Home = ({ onSelectGame }) => {
  return (
    <div className="home-container animate-fade-in">
      <header className="home-header">
        <h1>OmniGames Arcade</h1>
        <p className="subtitle">Select a classic to start playing.</p>
      </header>
      
      <div className="game-grid">
        <div 
          className="game-card game-card-wrapper" 
          onClick={() => onSelectGame('tictactoe')}
        >
          <div className="card-glass">
            <div className="game-icon tictactoe-icon">
              <span>X</span>
              <span>O</span>
            </div>
            <h2>Tic Tac Toe</h2>
            <p>The classic 3x3 strategy game. Play with a friend or challenge the unbeatable Bot.</p>
            <button className="btn-play">Play Now</button>
          </div>
        </div>

        <div 
          className="game-card game-card-wrapper" 
          onClick={() => onSelectGame('ludo')}
        >
          <div className="card-glass">
            <div className="game-icon ludo-icon">
              <div className="ludo-dots">
                <div className="dot red"></div>
                <div className="dot green"></div>
                <div className="dot blue"></div>
                <div className="dot yellow"></div>
              </div>
            </div>
            <h2>Ludo</h2>
            <p>Race your tokens to the center in this epic board game. Play up to 4 players or Bots.</p>
            <button className="btn-play">Play Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

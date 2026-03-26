import React, { useState, useEffect } from 'react';
import './TicTacToe.css';

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6]             // diagonals
];

const TicTacToe = ({ onBack }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  
  // Game mode: '1p' for single player vs bot, '2p' for local multiplayer
  const [gameMode, setGameMode] = useState('1p'); 
  const [scores, setScores] = useState({ X: 0, O: 0 });

  const checkWinner = (squares) => {
    for (let i = 0; i < WINNING_COMBOS.length; i++) {
      const [a, b, c] = WINNING_COMBOS[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { player: squares[a], line: [a, b, c] };
      }
    }
    return null;
  };

  const handlePlay = (index) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  useEffect(() => {
    const winResult = checkWinner(board);
    if (winResult) {
      setWinner(winResult);
      setScores(s => ({ ...s, [winResult.player]: s[winResult.player] + 1 }));
      return;
    }
    
    if (!board.includes(null)) {
      setIsDraw(true);
      return;
    }

    // Bot move
    if (gameMode === '1p' && !isXNext && !winResult) {
      const timer = setTimeout(makeBotMove, 600);
      return () => clearTimeout(timer);
    }
  }, [board, isXNext, gameMode]);

  const makeBotMove = () => {
    const available = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    if (available.length === 0) return;

    // Simple AI: Check if it can win
    const findWinningMove = (player) => {
      for (let idx of available) {
        const tempBoard = [...board];
        tempBoard[idx] = player;
        if (checkWinner(tempBoard)) return idx;
      }
      return null;
    };

    // 1. Try to win (Bot is 'O')
    let move = findWinningMove('O');
    
    // 2. Block 'X' from winning
    if (move === null) move = findWinningMove('X');
    
    // 3. Take center if available
    if (move === null && available.includes(4)) move = 4;
    
    // 4. Random available move
    if (move === null) {
      const randomIdx = Math.floor(Math.random() * available.length);
      move = available[randomIdx];
    }

    const newBoard = [...board];
    newBoard[move] = 'O';
    setBoard(newBoard);
    setIsXNext(true);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setIsDraw(false);
  };

  const renderCell = (i) => {
    const isWinningCell = winner && winner.line.includes(i);
    return (
      <button 
        className={`cell ${board[i] ? 'filled' : ''} ${board[i] === 'X' ? 'cell-x' : 'cell-o'} ${isWinningCell ? 'winning-cell' : ''}`}
        onClick={() => handlePlay(i)}
        disabled={!!winner || !!board[i] || (gameMode === '1p' && !isXNext)}
      >
        {board[i]}
      </button>
    );
  };

  return (
    <div className="game-wrapper animate-fade-in tictactoe">
      <header className="game-header">
        <button className="btn-outline back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2 className="game-title">Tic Tac Toe</h2>
        <div className="mode-selector">
          <button 
            className={`mode-btn ${gameMode === '1p' ? 'active' : ''}`} 
            onClick={() => { setGameMode('1p'); resetGame(); }}
          >
            1 Player
          </button>
          <button 
            className={`mode-btn ${gameMode === '2p' ? 'active' : ''}`} 
            onClick={() => { setGameMode('2p'); resetGame(); }}
          >
            2 Player
          </button>
        </div>
      </header>

      <div className="tictactoe-content glass-panel">
        <div className="scoreboard">
          <div className={`score-badge ${isXNext && !winner ? 'active' : ''} x-score`}>
            <span className="player-label">Player X</span>
            <span className="score-value">{scores.X}</span>
          </div>
          
          <div className="status-display">
            {winner ? (
              <div className="winner-announcement">Player {winner.player} Wins!</div>
            ) : isDraw ? (
              <div className="winner-announcement draw">It's a Draw!</div>
            ) : (
              <div className="turn-indicator">
                {gameMode === '1p' && !isXNext ? 'Bot is thinking...' : `Player ${isXNext ? 'X' : 'O'}'s Turn`}
              </div>
            )}
          </div>
          
          <div className={`score-badge ${!isXNext && !winner ? 'active' : ''} o-score`}>
            <span className="player-label">{gameMode === '1p' ? 'Bot O' : 'Player O'}</span>
            <span className="score-value">{scores.O}</span>
          </div>
        </div>

        <div className="board-wrapper">
          <div className="board">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => renderCell(i))}
          </div>
          {winner && (
            <div className={`win-line line-${winner.line.join('')}`}></div>
          )}
        </div>

        <div className="controls">
          <button className="btn-primary" onClick={resetGame}>
            Reset Board
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;

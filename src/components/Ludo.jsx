import React, { useState, useEffect } from 'react';
import './Ludo.css';
import { PATH, PLAYERS, SAFE_SPOTS, getTokenPosition } from '../utils/ludoPositions';

const COLORS = ['red', 'green', 'yellow', 'blue'];

const buildInitialPlayers = () => {
  const initialState = {};
  COLORS.forEach(color => {
    initialState[color] = Array(4).fill(null).map((_, i) => ({
      id: i,
      status: 'base',
      step: 0,
    }));
  });
  return initialState;
};

const Ludo = ({ onBack }) => {
  const [players, setPlayers] = useState(buildInitialPlayers());
  const [turn, setTurn] = useState('red');
  const [diceRoll, setDiceRoll] = useState(1); // default 1 for cube base
  const [isRolling, setIsRolling] = useState(false);
  const [message, setMessage] = useState('Red to roll!');
  const [hasRolled, setHasRolled] = useState(false);
  const [activePlayers, setActivePlayers] = useState(['red', 'green', 'yellow', 'blue']);
  const [isBot, setIsBot] = useState({
    red: false,
    green: true,
    yellow: true,
    blue: true
  });
  // 3D rotations for the dice faces
  const [diceRotation, setDiceRotation] = useState({ x: 0, y: 0 });

  const getPlayableTokens = (color, roll) => {
    if (!roll) return [];
    return players[color].filter(token => {
      if (token.status === 'home') return false;
      if (token.status === 'base' && roll !== 6) return false;
      if (token.status === 'active' && token.step + roll > 57) return false;
      return true;
    });
  };

  const playableTokens = getPlayableTokens(turn, diceRoll);

  // Bot logic
  useEffect(() => {
    if (isBot[turn] && !isRolling) {
      if (!hasRolled) {
        const rollTimer = setTimeout(() => handleRoll(), 1200);
        return () => clearTimeout(rollTimer);
      } else {
        if (playableTokens.length > 0) {
          const moveTimer = setTimeout(() => {
            let chosen = playableTokens.find(t => t.status === 'base');
            if (!chosen) {
              chosen = playableTokens.sort((a, b) => b.step - a.step)[0];
            }
            if (chosen) handleTokenClick(turn, chosen.id);
          }, 1200);
          return () => clearTimeout(moveTimer);
        } else {
          const passTimer = setTimeout(nextTurn, 1500);
          return () => clearTimeout(passTimer);
        }
      }
    }
  }, [turn, hasRolled, isRolling, diceRoll]);

  const getRotationForNumber = (num) => {
    // 1: front, 2: up, 3: right, 4: left, 5: down, 6: back
    switch(num) {
      case 1: return { x: 0, y: 0 };
      case 2: return { x: -90, y: 0 };
      case 3: return { x: 0, y: -90 };
      case 4: return { x: 0, y: 90 };
      case 5: return { x: 90, y: 0 };
      case 6: return { x: 180, y: 0 };
      default: return { x: 0, y: 0 };
    }
  };

  const throwDice3D = (finalNumber) => {
    setIsRolling(true);
    // Add multiple spins before landing on the target rotation
    const baseSpinsX = Math.floor(Math.random() * 4 + 4) * 360; 
    const baseSpinsY = Math.floor(Math.random() * 4 + 4) * 360;
    const target = getRotationForNumber(finalNumber);
    
    setDiceRotation({
      x: baseSpinsX + target.x,
      y: baseSpinsY + target.y
    });

    setTimeout(() => {
      setDiceRoll(finalNumber);
      setHasRolled(true);
      setIsRolling(false);
      
      const playable = getPlayableTokens(turn, finalNumber);
      if (playable.length === 0) {
        setMessage(`No moves available for ${turn}.`);
        setTimeout(nextTurn, 2000);
      } else {
        setMessage(`${turn} rolled a ${finalNumber}! Make a move.`);
      }
    }, 1200); // Wait for the transition defined in CSS
  };

  const handleRoll = () => {
    if (hasRolled || isRolling) return;
    setMessage(`${turn} is rolling...`);
    const roll = Math.floor(Math.random() * 6) + 1;
    throwDice3D(roll);
  };

  const nextTurn = () => {
    setHasRolled(false);
    const currIdx = activePlayers.indexOf(turn);
    const nextPlayer = activePlayers[(currIdx + 1) % activePlayers.length];
    setTurn(nextPlayer);
    setMessage(`${nextPlayer}'s turn!`);
  };

  const checkCapture = (movedColor, newPosStr) => {
    let captured = false;
    let newPlayersState = { ...players };

    COLORS.forEach(color => {
      if (color !== movedColor) {
        newPlayersState[color] = newPlayersState[color].map(token => {
          if (token.status === 'active') {
            const pos = getTokenPosition(color, token);
            const posStr = `${pos[0]},${pos[1]}`;
            if (posStr === newPosStr) {
               const isSafe = Object.values(PLAYERS).some(p => p.startIdx !== undefined && PATH[p.startIdx].join(',') === posStr) 
                 || [9, 22, 35, 48].some(i => PATH[i].join(',') === posStr);
               
               if (!isSafe) {
                 captured = true;
                 return { ...token, status: 'base', step: 0 };
               }
            }
          }
          return token;
        });
      }
    });

    if (captured) {
      setPlayers(newPlayersState);
      setMessage(`Boom! ${movedColor} captured a token & rolls again!`);
      return true;
    }
    return false;
  };

  const handleTokenClick = (color, tokenId) => {
    if (color !== turn || !hasRolled || isRolling) return;
    const token = players[color].find(t => t.id === tokenId);
    if (!getPlayableTokens(turn, diceRoll).find(t => t.id === tokenId)) return;

    let newPlayersState = { ...players };
    let captured = false;

    newPlayersState[color] = newPlayersState[color].map(t => {
      if (t.id === tokenId) {
        if (t.status === 'base' && diceRoll === 6) {
          return { ...t, status: 'active', step: 0 };
        } else if (t.status === 'active') {
          const newStep = t.step + diceRoll;
          return { ...t, step: newStep, status: newStep === 57 ? 'home' : 'active' };
        }
      }
      return t;
    });

    setPlayers(newPlayersState);

    const updatedToken = newPlayersState[color].find(t => t.id === tokenId);
    if (updatedToken.status === 'active') {
      const newPos = getTokenPosition(color, updatedToken);
      captured = checkCapture(color, `${newPos[0]},${newPos[1]}`);
    }

    if (diceRoll === 6 || captured) {
       setHasRolled(false);
       if (!captured) setMessage(`${turn} rolled a 6! Roll again.`);
    } else {
       setTimeout(nextTurn, 500); // 500ms allows piece movement to finish
    }
  };

  const setMode = (mode) => {
    if (mode === '1p') {
      setIsBot({ red: false, green: true, yellow: true, blue: true });
      setActivePlayers(['red', 'green', 'yellow', 'blue']);
    } else if (mode === '4p') {
      setIsBot({ red: false, green: false, yellow: false, blue: false });
      setActivePlayers(['red', 'green', 'yellow', 'blue']);
    } else if (mode === '2p') {
      setIsBot({ red: false, yellow: false, green: true, blue: true });
      setActivePlayers(['red', 'yellow']);
      setTurn('red');
    }
    setPlayers(buildInitialPlayers());
    setDiceRoll(1);
    setDiceRotation({x: 0, y:0});
    setHasRolled(false);
  };

  // Rendering logical groups
  const renderGrid = () => {
    const cells = [];
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        let cellClass = 'ludo-cell';
        
        // Context classes
        if (row < 6 && col < 6) cellClass += ' yard-container yard-red-bg';
        else if (row < 6 && col > 8) cellClass += ' yard-container yard-green-bg';
        else if (row > 8 && col > 8) cellClass += ' yard-container yard-yellow-bg';
        else if (row > 8 && col < 6) cellClass += ' yard-container yard-blue-bg';
        else if (row >= 6 && row <= 8 && col >= 6 && col <= 8) cellClass += ' home-center';
        else cellClass += ' path';

        if (row === 7 && col > 0 && col < 6) cellClass += ' home-path-red gradient-glow';
        if (col === 7 && row > 0 && row < 6) cellClass += ' home-path-green gradient-glow';
        if (row === 7 && col > 8 && col < 14) cellClass += ' home-path-yellow gradient-glow';
        if (col === 7 && row > 8 && row < 14) cellClass += ' home-path-blue gradient-glow';

        if (row === 6 && col === 1) cellClass += ' safe safe-red gradient-glow';
        if (row === 1 && col === 8) cellClass += ' safe safe-green gradient-glow';
        if (row === 8 && col === 13) cellClass += ' safe safe-yellow gradient-glow';
        if (row === 13 && col === 6) cellClass += ' safe safe-blue gradient-glow';

        if ((row===2 && col===6) || (row===6 && col===12) || (row===12 && col===8) || (row===8 && col===2)) {
          cellClass += ' star-cell glowing-star';
        }

        cells.push(
          <div 
            key={`${row}-${col}`} 
            className={cellClass}
            style={{ gridRow: row + 1, gridColumn: col + 1 }}
          >
            {/* The actual Yard graphic is a localized overlay element so we don't spam 36 divs with gradient. We do it via absolute pos outside the grid loop. But we can add a specific marker here if needed */}
          </div>
        );
      }
    }
    return cells;
  };

  const renderYardOverlay = (color) => {
    const baseCoords = PLAYERS[color].baseCoords;
    const isRedOrBlue = color === 'red' || color === 'blue';
    const isTop = color === 'red' || color === 'green';
    
    // Positioning the 6x6 yard overlay specifically
    const top = isTop ? '0%' : 'calc(100% * 9 / 15)';
    const left = color === 'red' || color === 'blue' ? '0%' : 'calc(100% * 9 / 15)';
    
    return (
      <div key={`yard-${color}`} className={`yard-overlay block-${color}`} style={{ top, left }}>
        <div className="yard-inner-jewel">
           <div className="dimple-container">
             <div className="dimple"></div>
             <div className="dimple"></div>
             <div className="dimple"></div>
             <div className="dimple"></div>
           </div>
        </div>
      </div>
    );
  };

  const renderTokens = () => {
    return COLORS.map(color => {
      return players[color].map(token => {
        const [row, col] = getTokenPosition(color, token);
        const isPlayable = turn === color && hasRolled && !isRolling && !isBot[color] && getPlayableTokens(color, diceRoll).find(t => t.id === token.id);
        
        return (
          <div
            key={`${color}-${token.id}`}
            className={`ludo-token token-${color} ${isPlayable ? 'playable-pulse' : ''}`}
            style={{
              top: `calc(${(row + 0.5) / 15 * 100}%)`,
              left: `calc(${(col + 0.5) / 15 * 100}%)`,
            }}
            onClick={() => handleTokenClick(color, token.id)}
          >
            <div className="token-jewel">
                <div className="token-glint"></div>
            </div>
          </div>
        );
      });
    });
  };

  // Create 3D dice faces
  const renderDiceValue = (num) => {
    switch(num) {
      case 1: return <div className="dot center"></div>;
      case 2: return <><div className="dot top-left"></div><div className="dot bottom-right"></div></>;
      case 3: return <><div className="dot top-left"></div><div className="dot center"></div><div className="dot bottom-right"></div></>;
      case 4: return <><div className="dot top-left"></div><div className="dot top-right"></div><div className="dot bottom-left"></div><div className="dot bottom-right"></div></>;
      case 5: return <><div className="dot top-left"></div><div className="dot top-right"></div><div className="dot center"></div><div className="dot bottom-left"></div><div className="dot bottom-right"></div></>;
      case 6: return <><div className="dot top-left"></div><div className="dot top-right"></div><div className="dot middle-left"></div><div className="dot middle-right"></div><div className="dot bottom-left"></div><div className="dot bottom-right"></div></>;
      default: return null;
    }
  }

  return (
    <div className="game-wrapper animate-fade-in ludo">
      <header className="game-header">
         <button className="btn-outline back-btn" onClick={onBack}>← Back</button>
        <h2 className="game-title">Omni Ludo</h2>
        <div className="mode-selector">
          <button className={`mode-btn ${activePlayers.length===4 && isBot.green ? 'active' : ''}`} onClick={() => setMode('1p')}>1P vs Bots</button>
          <button className={`mode-btn ${activePlayers.length===2 ? 'active' : ''}`} onClick={() => setMode('2p')}>2 Player</button>
          <button className={`mode-btn ${activePlayers.length===4 && !isBot.green ? 'active' : ''}`} onClick={() => setMode('4p')}>4 Player</button>
        </div>
      </header>

      <div className="ludo-content">
        <div className="ludo-sidebar glass-panel">
          <div className="active-player-panel">
             <div className={`active-player-glow glow-${turn}`}></div>
             <h3 className="turn-indicator" style={{color: `var(--color-${turn})`}}>
               {turn.charAt(0).toUpperCase() + turn.slice(1)}'s Turn
               {isBot[turn] && " 🤖"}
             </h3>
             <div className="ludo-message">{message}</div>
          </div>
          
          <div className="dice-scene" onClick={!isBot[turn] && !hasRolled ? handleRoll : undefined}>
            <div 
              className={`cube ${isRolling ? 'cube-rolling-blur' : ''}`} 
              style={{ transform: `translateZ(-50px) rotateX(${diceRotation.x}deg) rotateY(${diceRotation.y}deg)` }}
            >
              <div className="cube__face cube__face--front">{renderDiceValue(1)}</div>
              <div className="cube__face cube__face--up">{renderDiceValue(2)}</div>
              <div className="cube__face cube__face--right">{renderDiceValue(3)}</div>
              <div className="cube__face cube__face--left">{renderDiceValue(4)}</div>
              <div className="cube__face cube__face--down">{renderDiceValue(5)}</div>
              <div className="cube__face cube__face--back">{renderDiceValue(6)}</div>
            </div>
            
            {!isBot[turn] && !hasRolled && (
              <div className="roll-hint">Click Dice to Roll</div>
            )}
          </div>
        </div>

        <div className="ludo-board-wrapper">
          <div className="ludo-board-3d-box">
             <div className="ludo-board">
               {renderGrid()}
               {COLORS.map(color => renderYardOverlay(color))}
               <div className="home-center-graphic"></div>
               {renderTokens()}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ludo;

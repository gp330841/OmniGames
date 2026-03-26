// Ludo board 15x15 grid (0-14 rows and cols).
// Coordinates are [row, col]

// The 52 continuous path cells in clockwise order
export const PATH = [
  // Left arm, top row (going right)
  [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  // Top arm, left col (going up)
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  // Top arm, middle col (turn)
  [0, 7],
  // Top arm, right col (going down)
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  // Right arm, top row (going right)
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  // Right arm, middle row (turn)
  [7, 14],
  // Right arm, bottom row (going left)
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  // Bottom arm, right col (going down)
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  // Bottom arm, middle col (turn)
  [14, 7],
  // Bottom arm, left col (going up)
  [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  // Left arm, bottom row (going left)
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  // Left arm, middle row (turn to start)
  [7, 0]
];

// Safe spots (Stars) on the PATH index
export const SAFE_SPOTS = [
  1,   // Red start
  9,   // Top left star
  14,  // Green start
  22,  // Top right star
  27,  // Yellow start
  35,  // Bottom right star
  40,  // Blue start
  48   // Bottom left star
];

// Definition per player color
export const PLAYERS = {
  red: {
    startIdx: 1, // index in PATH
    endIdx: 50,  // index in PATH where it turns into home column
    homeCol: [
      [7, 1], [7, 2], [7, 3], [7, 4], [7, 5]
    ],
    baseCoords: [[2, 2], [2, 3], [3, 2], [3, 3]], // Token base coordinates (yard)
    home: [7, 6],
    color: '#ef4444' // using our variables in JS if needed
  },
  green: {
    startIdx: 14,
    endIdx: 11,
    homeCol: [
      [1, 7], [2, 7], [3, 7], [4, 7], [5, 7]
    ],
    baseCoords: [[2, 11], [2, 12], [3, 11], [3, 12]],
    home: [6, 7],
    color: '#10b981'
  },
  yellow: {
    startIdx: 27,
    endIdx: 24,
    homeCol: [
      [7, 13], [7, 12], [7, 11], [7, 10], [7, 9]
    ],
    baseCoords: [[11, 11], [11, 12], [12, 11], [12, 12]],
    home: [7, 8],
    color: '#f59e0b'
  },
  blue: {
    startIdx: 40,
    endIdx: 37,
    homeCol: [
      [13, 7], [12, 7], [11, 7], [10, 7], [9, 7]
    ],
    baseCoords: [[11, 2], [11, 3], [12, 2], [12, 3]],
    home: [8, 7],
    color: '#3b82f6'
  }
};

// Returns [row, col] position for a token given its status, player, and current step
export const getTokenPosition = (playerColor, tokenData) => {
  if (tokenData.status === 'base') {
    return PLAYERS[playerColor].baseCoords[tokenData.id];
  }
  
  if (tokenData.status === 'home') {
    return PLAYERS[playerColor].home; // Simple overlap in center for now
  }
  
  // It's on the board
  const playerInfo = PLAYERS[playerColor];
  
  if (tokenData.step < 52) {
    // It's on the perimeter PATH
    // calculate index: (startIdx + step) % 52
    const pathIdx = (playerInfo.startIdx + tokenData.step) % PATH.length;
    return PATH[pathIdx];
  } else {
    // It's in the home column. max step is 56, 57 is home.
    const homeStep = tokenData.step - 52; 
    if (homeStep < 5) {
      return playerInfo.homeCol[homeStep];
    }
    return playerInfo.home;
  }
};

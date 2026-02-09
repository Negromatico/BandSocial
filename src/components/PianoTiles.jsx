import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db, auth } from '../services/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import './PianoTiles.css';

const PianoTiles = () => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [tiles, setTiles] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [loadingRanking, setLoadingRanking] = useState(true);
  const gameRef = useRef(null);
  const animationRef = useRef(null);
  const speedRef = useRef(3);
  const lastTimeRef = useRef(0);
  const user = auth.currentUser;

  const COLUMNS = 4;
  const TILE_HEIGHT = 150;
  const GAME_HEIGHT = 600;

  useEffect(() => {
    fetchRanking();
  }, []);

  // Guardar puntuación automáticamente cuando termina el juego
  useEffect(() => {
    if (gameOver && score > 0 && user) {
      saveScore(score);
    }
  }, [gameOver]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameStarted, gameOver]);

  const gameLoop = useCallback((timestamp) => {
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    setTiles(prevTiles => {
      const movement = speedRef.current * (deltaTime / 16);
      const newTiles = prevTiles.map(tile => ({
        ...tile,
        y: tile.y + movement
      }));

      // Eliminar tiles que salieron de la pantalla
      const filteredTiles = newTiles.filter(tile => tile.y < GAME_HEIGHT + 50);

      // Verificar si algún tile negro pasó sin ser clickeado
      const missedTiles = newTiles.filter(tile => tile.y > GAME_HEIGHT && !tile.clicked);
      if (missedTiles.length > 0) {
        setGameOver(true);
        return filteredTiles;
      }

      // Agregar nuevos tiles
      if (filteredTiles.length === 0 || filteredTiles[filteredTiles.length - 1].y > TILE_HEIGHT) {
        const column = Math.floor(Math.random() * COLUMNS);
        filteredTiles.push({
          id: Date.now() + Math.random(),
          column,
          y: -TILE_HEIGHT,
          clicked: false
        });
      }

      return filteredTiles;
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  }, []);

  const handleTileClick = useCallback((tileId, column) => {
    setTiles(prevTiles => {
      const tile = prevTiles.find(t => t.id === tileId);
      
      if (!tile || tile.clicked) return prevTiles;

      // Verificar si es el tile correcto (el más abajo en esa columna)
      const columnTiles = prevTiles.filter(t => t.column === column && !t.clicked && t.y > 0);
      if (columnTiles.length === 0) return prevTiles;
      
      const lowestTile = columnTiles.reduce((lowest, current) => 
        current.y > lowest.y ? current : lowest
      , columnTiles[0]);

      if (tile.id !== lowestTile.id) {
        setGameOver(true);
        return prevTiles;
      }

      setScore(prev => prev + 1);
      speedRef.current = Math.min(speedRef.current + 0.15, 12);

      return prevTiles.map(t => 
        t.id === tileId ? { ...t, clicked: true } : t
      );
    });
  }, []);

  const startGame = () => {
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setTiles([]);
    speedRef.current = 3;
  };

  const fetchRanking = async () => {
    try {
      const q = query(
        collection(db, 'pianoTilesScores'),
        orderBy('score', 'desc')
      );
      const snapshot = await getDocs(q);
      const allScores = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filtrar para obtener solo la mejor puntuación de cada jugador
      const bestScoresByUser = {};
      allScores.forEach(score => {
        if (!bestScoresByUser[score.userId] || 
            bestScoresByUser[score.userId].score < score.score) {
          bestScoresByUser[score.userId] = score;
        }
      });
      
      // Convertir a array y ordenar por puntuación
      const uniqueScores = Object.values(bestScoresByUser)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Top 10 jugadores únicos
      
      setRanking(uniqueScores);
    } catch (error) {
      console.error('Error cargando ranking:', error);
    } finally {
      setLoadingRanking(false);
    }
  };

  const saveScore = async (finalScore) => {
    if (!user || finalScore === 0) return;
    
    try {
      await addDoc(collection(db, 'pianoTilesScores'), {
        userId: user.uid,
        userName: user.displayName || user.email || 'Jugador',
        score: finalScore,
        timestamp: serverTimestamp()
      });
      await fetchRanking();
    } catch (error) {
      console.error('Error guardando puntuación:', error);
    }
  };

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    setTiles([]);
    speedRef.current = 3;
  };

  return (
    <div className="piano-tiles-container">
      <div className="piano-tiles-header">
        <h2>Piano Tiles</h2>
        <div className="score-display">
          <span className="score-label">Puntuación:</span>
          <span className="score-value">{score}</span>
        </div>
      </div>

      <div className="game-area" ref={gameRef}>
        {!gameStarted && !gameOver && (
          <div className="game-overlay">
            <div className="overlay-content">
              <h3>¡Bienvenido a Piano Tiles!</h3>
              <p>Haz click en las teclas negras</p>
              <p>¡No dejes que pasen sin tocarlas!</p>
              <button className="start-button" onClick={startGame}>
                Comenzar
              </button>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="game-overlay game-over">
            <div className="overlay-content">
              <h3>¡Juego Terminado!</h3>
              <p className="final-score">Puntuación: {score}</p>
              <div className="button-group">
                <button className="restart-button" onClick={startGame}>
                  Jugar de Nuevo
                </button>
                <button className="menu-button" onClick={resetGame}>
                  Menú Principal
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="game-board">
          {[0, 1, 2, 3].map(col => (
            <div key={col} className="column" />
          ))}
          
          {tiles.map(tile => (
            <div
              key={tile.id}
              className={`tile ${tile.clicked ? 'clicked' : ''}`}
              style={{
                left: `${tile.column * 25}%`,
                top: `${tile.y}px`,
                height: `${TILE_HEIGHT}px`
              }}
              onClick={() => handleTileClick(tile.id, tile.column)}
            />
          ))}
        </div>
      </div>

      <div className="game-instructions">
        <h4>Cómo Jugar:</h4>
        <ul>
          <li>Haz click en las teclas negras que caen</li>
          <li>No dejes que ninguna tecla pase sin tocarla</li>
          <li>La velocidad aumenta con tu puntuación</li>
          <li>¡Intenta conseguir la puntuación más alta!</li>
        </ul>
      </div>

      <div className="ranking-section">
        <h4>Ranking Global</h4>
        {loadingRanking ? (
          <div className="ranking-loading">Cargando ranking...</div>
        ) : ranking.length > 0 ? (
          <div className="ranking-table">
            {ranking.map((entry, index) => (
              <div 
                key={entry.id} 
                className={`ranking-item ${index < 3 ? 'top-three' : ''} ${entry.userId === user?.uid ? 'current-user' : ''}`}
              >
                <div className="ranking-position">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `#${index + 1}`}
                </div>
                <div className="ranking-name">{entry.userName}</div>
                <div className="ranking-score">{entry.score}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="ranking-empty">
            ¡Sé el primero en el ranking! 🎮
          </div>
        )}
      </div>
    </div>
  );
};

export default PianoTiles;

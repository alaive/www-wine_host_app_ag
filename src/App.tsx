import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ThreeScene } from './components/ThreeScene';
import { CharacteristicsPanel } from './components/CharacteristicsPanel';
import { DialogBubble } from './components/DialogBubble';
import { Chatbot } from './components/Chatbot';

import { WineRecommendation } from './components/WineRecommendation';
import { wines as staticWines } from './data/wines';
import type { Wine } from './data/wines';
import { getTopRecommendations } from './utils/recommendationEngine';
import type { UserPreferences } from './utils/recommendationEngine';

type DialogStage = 'welcome' | 'occasion' | 'food' | 'mood' | 'results';

function App() {
  const [stage, setStage] = useState<DialogStage>('welcome');
  const [preferences, setPreferences] = useState<UserPreferences>({
    characteristics: {
      intensity: 5,
      acidity: 5,
      sweetness: 2,
      tannin: 3,
    },
    occasion: 'casual',
    foodPairing: 'vegetarian',
    mood: 'relaxed'
  });
  
  const [allWines, setAllWines] = useState<Wine[]>([]);
  const [isWinesLoading, setIsWinesLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<ReturnType<typeof getTopRecommendations>>([]);
  const [dbMode, setDbMode] = useState<'remote' | 'local'>('remote');

  useEffect(() => {
    fetch('./php/set_db_mode.php')
      .then(res => res.json())
      .then(data => setDbMode(data.mode));
  }, []);

  const toggleDbMode = () => {
    const newMode = dbMode === 'remote' ? 'local' : 'remote';
    fetch(`./php/set_db_mode.php?mode=${newMode}`)
      .then(res => res.json())
      .then(() => {
        setDbMode(newMode);
        window.location.reload();
      });
  };

  useEffect(() => {
    const fetchWines = () => {
      fetch('./php/get_scenario_wines.php?scenario_id=62')
        .then(res => res.json())
        .then(data => {
          if (data && data.wines) {
             setAllWines(prev => {
                if (prev.length === 0) return data.wines;
                
                // Smart Diffing: Only update state if either the length changed, 
                // or if a wine's 'isWinner' status changed.
                let changed = false;
                if (prev.length !== data.wines.length) {
                    changed = true;
                } else {
                    for (let i = 0; i < prev.length; i++) {
                        // Assuming the API always returns wines in the same order. 
                        // To be safe, look up by ID instead of index.
                        const newWine = data.wines.find((w: Wine) => w.id === prev[i].id);
                        if (!newWine || prev[i].isWinner !== newWine.isWinner) {
                            changed = true;
                            break;
                        }
                    }
                }
                
                return changed ? data.wines : prev;
             });
          }
          setIsWinesLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch dynamic wines:", err);
          setAllWines(prev => prev.length ? prev : staticWines);
          setIsWinesLoading(false);
        });
    };

    // Initial Fetch
    fetchWines();

    // Polling Interval (every 3 seconds)
    const intervalId = setInterval(fetchWines, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const cameraFollows = true;

  const dialogContent = {
    welcome: {
      text: "Welcome back! Shall we explore our cellar to find your perfect wine today?",
      options: ["Yes, let's explore!", "Maybe later"]
    },
    occasion: {
      text: "Wonderful. Tell me, what's the occasion for this special bottle?",
      options: ["Casual", "Celebration", "Romantic", "Business"]
    },
    food: {
      text: "Excellent. And what will you be pairing it with?",
      options: ["Red Meat", "White Meat", "Seafood", "Vegetarian", "Cheese", "Dessert"]
    },
    mood: {
      text: "I see. One last thing... how are you feeling today?",
      options: ["Adventurous", "Relaxed", "Celebratory", "Contemplative"]
    },
    results: {
      text: "I have found some extraordinary matches for you. Take a look!",
      options: ["Start Over"]
    }
  };

  const handleDialogOption = (option: string) => {
    switch (stage) {
      case 'welcome':
        if (option === "Yes, let's explore!") setStage('occasion');
        break;
      case 'occasion':
        setPreferences(prev => ({ ...prev, occasion: option.toLowerCase() }));
        setStage('food');
        break;
      case 'food':
        setPreferences(prev => ({ ...prev, foodPairing: option.toLowerCase() }));
        setStage('mood');
        break;
      case 'mood': {
        const updatedPrefs = { ...preferences, mood: option.toLowerCase() };
        setPreferences(updatedPrefs);
        const recs = getTopRecommendations(allWines, updatedPrefs, 3);
        setRecommendations(recs);
        setStage('results');
        break;
      }
      case 'results':
        setStage('welcome');
        break;
    }
  };

  return (
    <div className="app-container">
      {/* Database Toggle */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ color: 'white', fontSize: '12px', opacity: 0.7, fontFamily: 'Inter, sans-serif' }}>
          Server: {dbMode === 'remote' ? '93.240.31.32' : 'Localhost'}
        </span>
        <button
          onClick={toggleDbMode}
          style={{
            background: dbMode === 'remote' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(76, 175, 80, 0.2)',
            border: `1px solid ${dbMode === 'remote' ? '#d4af37' : '#4caf50'}`,
            color: dbMode === 'remote' ? '#d4af37' : '#4caf50',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          Switch to {dbMode === 'remote' ? 'Local' : 'Remote'}
        </button>
      </div>

      {/* Loading State */}
      <AnimatePresence>
        {isWinesLoading && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: '#120c0a', zIndex: 9999, display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#d4af37',
            fontFamily: 'Inter, sans-serif', fontSize: '20px'
          }}>
            Preparing the Cellar...
          </div>
        )}
      </AnimatePresence>

      {/* 3D Background */}
      {!isWinesLoading && <ThreeScene cameraFollows={cameraFollows} wines={allWines} />}

      {/* UI Overlays */}
      <CharacteristicsPanel
        preferences={preferences.characteristics}
        setPreferences={(newChars) => {
          setPreferences(prev => ({
            ...prev,
            characteristics: typeof newChars === 'function'
              ? newChars(prev.characteristics)
              : { ...prev.characteristics, ...newChars }
          }));
        }}
      />

      <DialogBubble
        message={dialogContent[stage].text}
        options={dialogContent[stage].options}
        onSelect={handleDialogOption}
      />





      {/* Wine Sommelier Chatbot — always accessible in the bottom-right corner */}
      <Chatbot />

      <AnimatePresence>
        {stage === 'results' && (
          <div className="recommendations-overlay" style={{
            position: 'fixed',
            bottom: '220px',
            left: 0,
            right: 0,
            zIndex: 10,
            padding: '0 20px',
            maxHeight: '60vh',
            overflowY: 'auto'
          }}>
            <WineRecommendation wines={recommendations} onRestart={() => setStage('welcome')} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

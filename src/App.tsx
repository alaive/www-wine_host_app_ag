import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ThreeScene } from './components/ThreeScene';
import { CharacteristicsPanel } from './components/CharacteristicsPanel';
import { DialogBubble } from './components/DialogBubble';
import { MusicPlayer } from './components/MusicPlayer';
import { WineRecommendation } from './components/WineRecommendation';
import { wines } from './data/wines';
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
  const [recommendations, setRecommendations] = useState<ReturnType<typeof getTopRecommendations>>([]);
  const [isManualControl, setIsManualControl] = useState(false);
  const [cameraFollows, setCameraFollows] = useState(true);

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
        const recs = getTopRecommendations(wines, updatedPrefs, 3);
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
      {/* 3D Background */}
      <ThreeScene recommendedWineId={recommendations[0]?.wine.id} manualControl={isManualControl} cameraFollows={cameraFollows} />

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

      <MusicPlayer />

      {/* Controls Overlay */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {/* Manual Control Toggle */}
        <button
          onClick={() => setIsManualControl(!isManualControl)}
          style={{
            padding: '10px 20px',
            background: isManualControl ? 'var(--color-gold)' : 'rgba(255, 255, 255, 0.1)',
            color: isManualControl ? '#000' : '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
        >
          {isManualControl ? 'Disable Manual Control' : 'Enable Manual Control'}
        </button>

        {isManualControl && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{
              padding: '10px',
              background: 'rgba(0, 0, 0, 0.6)',
              borderRadius: 'var(--radius-md)',
              color: '#ccc',
              fontSize: '0.8rem',
              backdropFilter: 'blur(10px)'
            }}>
              Use WASD/Arrows to move<br />
              Use Touchpad swipe to strafe
            </div>

            {/* On-screen Strafe Buttons */}
            <div style={{ display: 'flex', gap: '5px' }}>
              <button
                onMouseDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q' }))}
                onMouseUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'q' }))}
                onTouchStart={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q' }))}
                onTouchEnd={() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'q' }))}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                ← Strafe
              </button>
              <button
                onMouseDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))}
                onMouseUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'e' }))}
                onTouchStart={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))}
                onTouchEnd={() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'e' }))}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Strafe →
              </button>
            </div>
          </div>
        )}

        {/* Camera Follow Toggle */}
        <button
          onClick={() => setCameraFollows(!cameraFollows)}
          style={{
            padding: '10px 20px',
            background: cameraFollows ? 'rgba(255, 255, 255, 0.1)' : 'var(--color-gold)', // Inverted logic for visual: Gold when Free Cam? Or Gold when Locked? Let's say Gold when Locked (Follows)
            // Actually, usually "active" means ON. So Camera Follows ON = Gold.
            background: cameraFollows ? 'var(--color-gold)' : 'rgba(255, 255, 255, 0.1)',
            color: cameraFollows ? '#000' : '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
        >
          {cameraFollows ? 'Camera Locked' : 'Free Camera'}
        </button>
      </div>

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

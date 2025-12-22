import type { Dispatch, SetStateAction } from 'react';
import { Wine, Droplets, Utensils, Zap } from 'lucide-react';

interface Characteristics {
    intensity: number;
    acidity: number;
    sweetness: number;
    tannin: number;
}

interface CharacteristicsPanelProps {
    preferences: Characteristics;
    setPreferences: Dispatch<SetStateAction<Characteristics>>;
}

export const CharacteristicsPanel = ({ preferences, setPreferences }: CharacteristicsPanelProps) => {
    const handleChange = (key: keyof Characteristics, value: number) => {
        setPreferences((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="characteristics-panel">
            <div className="panel-header">
                <Wine size={18} />
                <span>Wine Profile</span>
            </div>
            <div className="sliders-grid">
                <div className="slider-item">
                    <label><Zap size={14} /> Intensity</label>
                    <input
                        type="range" min="1" max="10"
                        value={preferences.intensity}
                        onChange={(e) => handleChange('intensity', parseInt(e.target.value))}
                    />
                    <span className="value">{preferences.intensity}</span>
                </div>
                <div className="slider-item">
                    <label><Droplets size={14} /> Acidity</label>
                    <input
                        type="range" min="1" max="10"
                        value={preferences.acidity}
                        onChange={(e) => handleChange('acidity', parseInt(e.target.value))}
                    />
                    <span className="value">{preferences.acidity}</span>
                </div>
                <div className="slider-item">
                    <label><Droplets size={14} /> Sweetness</label>
                    <input
                        type="range" min="1" max="10"
                        value={preferences.sweetness}
                        onChange={(e) => handleChange('sweetness', parseInt(e.target.value))}
                    />
                    <span className="value">{preferences.sweetness}</span>
                </div>
                <div className="slider-item">
                    <label><Utensils size={14} /> Tannin</label>
                    <input
                        type="range" min="1" max="10"
                        value={preferences.tannin}
                        onChange={(e) => handleChange('tannin', parseInt(e.target.value))}
                    />
                    <span className="value">{preferences.tannin}</span>
                </div>
            </div>
        </div>
    );
};

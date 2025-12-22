import { useState } from 'react';
import { Wine as WineIcon } from 'lucide-react';

function App() {
    const [count, setCount] = useState(0);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0c0c 0%, #1a1616 50%, #2a1a1a 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-primary)',
            padding: '24px',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: 'var(--color-gold)',
                marginBottom: '32px',
            }}>
                <WineIcon size={48} />
                <h1 style={{
                    fontSize: '3rem',
                    margin: 0,
                }}>
                    Virtual Sommelier
                </h1>
            </div>

            <p style={{
                fontSize: '1.2rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '32px',
                textAlign: 'center',
                maxWidth: '600px',
            }}>
                Welcome to our interactive wine host application! Let our expert guide you to your perfect wine.
            </p>

            <button
                onClick={() => setCount(count + 1)}
                style={{
                    padding: '20px 48px',
                    backgroundColor: 'var(--color-accent-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-glow)',
                    transition: 'all 0.3s',
                }}
            >
                Test Button (Clicked {count} times)
            </button>

            <p style={{
                marginTop: '48px',
                fontSize: '0.9rem',
                color: 'var(--color-text-muted)',
            }}>
                Application is loading correctly! Full version coming soon...
            </p>
        </div>
    );
}

export default App;

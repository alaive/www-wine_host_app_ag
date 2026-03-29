import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendMessage, pollForResponse } from '../utils/chatApi';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatMessage {
    id: number;
    role: 'user' | 'bot' | 'system';
    text: string;
}

// ─── Wine Glass SVG Icon ──────────────────────────────────────────────────────

function WineGlassIcon({ size = 22 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 22h8M12 11v11M5 2h14l-2 7a5 5 0 0 1-10 0L5 2z" />
        </svg>
    );
}

// ─── Typing dots ─────────────────────────────────────────────────────────────

function TypingDots() {
    return (
        <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    style={{
                        width: 6, height: 6,
                        borderRadius: '50%',
                        backgroundColor: '#c9a96e',
                        display: 'inline-block',
                    }}
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                />
            ))}
        </span>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Chatbot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 0,
            role: 'bot',
            text: "Bonjour! I'm your wine sommelier. Ask me anything — about pairings, regions, grape varieties, or tonight's perfect bottle. 🍷",
        },
    ]);
    const [input, setInput] = useState('');
    const [thinking, setThinking] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const nextId = useRef(1);

    // scroll chat to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, thinking]);

    // focus input when chat opens
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 300);
    }, [open]);

    // Background polling for unread or delayed messages
    useEffect(() => {
        if (!open || thinking) return;

        let active = true;
        const checkUnread = async () => {
            try {
                // Short poll (check once, don't block)
                const result = await pollForResponse(100, 100);
                if (active && result.hasResponse && result.text) {
                    setMessages((prev) => [...prev, { id: nextId.current++, role: 'bot', text: result.text! }]);
                }
            } catch (err) {}
        };

        checkUnread(); // Check immediately
        const interval = setInterval(checkUnread, 4000);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [open, thinking]);

    const addMessage = (role: ChatMessage['role'], text: string) => {
        setMessages((prev) => [...prev, { id: nextId.current++, role, text }]);
    };

    const handleSend = async () => {
        const text = input.trim();
        if (!text || thinking) return;

        setInput('');
        addMessage('user', text);
        setThinking(true);

        try {
            const sent = await sendMessage(text);

            if (sent.error) {
                addMessage('system', `⚠️ Could not reach the sommelier: ${sent.error}`);
                setThinking(false);
                return;
            }

            // concepts were matched — now poll for the AI response
            const result = await pollForResponse(30000, 2000);

            if (result.timedOut || !result.hasResponse) {
                addMessage('bot', "I'm still pondering that one… please ask again in a moment.");
            } else {
                addMessage('bot', result.text ?? '');
            }
        } catch (err) {
            addMessage('system', '⚠️ Network error — please check your connection.');
        } finally {
            setThinking(false);
        }
    };

    const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <>
            {/* ── Toggle button ── */}
            <motion.button
                onClick={() => setOpen((o) => !o)}
                title={open ? 'Close sommelier chat' : 'Open sommelier chat'}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                style={{
                    position: 'fixed',
                    bottom: 28,
                    right: 28,
                    zIndex: 1000,
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    border: '1.5px solid rgba(201,169,110,0.55)',
                    background: 'linear-gradient(135deg, rgba(30,15,5,0.92) 0%, rgba(80,20,20,0.88) 100%)',
                    backdropFilter: 'blur(12px)',
                    color: '#c9a96e',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.55)',
                }}
            >
                <AnimatePresence mode="wait">
                    {open ? (
                        <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }} style={{ fontSize: 20, lineHeight: 1 }}>✕</motion.span>
                    ) : (
                        <motion.span key="g" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <WineGlassIcon />
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* ── Chat panel ── */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        key="chat-panel"
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                        style={{
                            position: 'fixed',
                            bottom: 94,
                            right: 28,
                            zIndex: 999,
                            width: 340,
                            maxWidth: 'calc(100vw - 48px)',
                            borderRadius: 16,
                            border: '1px solid rgba(201,169,110,0.3)',
                            background: 'linear-gradient(160deg, rgba(18,8,3,0.96) 0%, rgba(50,10,10,0.95) 100%)',
                            backdropFilter: 'blur(18px)',
                            boxShadow: '0 16px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(201,169,110,0.15)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '14px 18px',
                            borderBottom: '1px solid rgba(201,169,110,0.2)',
                            background: 'rgba(201,169,110,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                        }}>
                            <WineGlassIcon size={18} />
                            <div>
                                <div style={{ color: '#e8d5a3', fontWeight: 600, fontSize: 13.5, letterSpacing: '0.03em' }}>Wine Sommelier</div>
                                <div style={{ color: 'rgba(201,169,110,0.6)', fontSize: 11, marginTop: 1 }}>Ask me anything about wine</div>
                            </div>
                            <div style={{
                                marginLeft: 'auto',
                                width: 7, height: 7, borderRadius: '50%',
                                background: thinking ? '#c9a96e' : '#4caf80',
                                boxShadow: `0 0 6px ${thinking ? '#c9a96e' : '#4caf80'}`,
                                transition: 'background 0.3s',
                            }} />
                        </div>

                        {/* Messages */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '14px 14px 8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                            maxHeight: 320,
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(201,169,110,0.3) transparent',
                        }}>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    }}
                                >
                                    <div style={{
                                        maxWidth: '85%',
                                        padding: '8px 12px',
                                        borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                        fontSize: 13,
                                        lineHeight: 1.5,
                                        color: msg.role === 'system' ? '#e88' : msg.role === 'user' ? '#fff' : '#e8d5a3',
                                        background:
                                            msg.role === 'user'
                                                ? 'linear-gradient(135deg, rgba(120,30,30,0.85), rgba(160,50,30,0.8))'
                                                : msg.role === 'system'
                                                    ? 'rgba(80,20,20,0.6)'
                                                    : 'rgba(201,169,110,0.1)',
                                        border: msg.role === 'bot' ? '1px solid rgba(201,169,110,0.2)' : 'none',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                    }}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Thinking indicator */}
                            {thinking && (
                                <motion.div
                                    key="thinking"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ display: 'flex', alignItems: 'flex-start' }}
                                >
                                    <div style={{
                                        padding: '10px 14px',
                                        borderRadius: '14px 14px 14px 4px',
                                        background: 'rgba(201,169,110,0.1)',
                                        border: '1px solid rgba(201,169,110,0.2)',
                                    }}>
                                        <TypingDots />
                                    </div>
                                </motion.div>
                            )}

                            <div ref={bottomRef} />
                        </div>

                        {/* Input bar */}
                        <div style={{
                            padding: '10px 12px',
                            borderTop: '1px solid rgba(201,169,110,0.18)',
                            background: 'rgba(0,0,0,0.25)',
                            display: 'flex',
                            gap: 8,
                            alignItems: 'center',
                        }}>
                            <input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder="Ask about wine…"
                                disabled={thinking}
                                style={{
                                    flex: 1,
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(201,169,110,0.3)',
                                    borderRadius: 10,
                                    padding: '8px 12px',
                                    color: '#e8d5a3',
                                    fontSize: 13,
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,169,110,0.7)')}
                                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)')}
                            />
                            <motion.button
                                onClick={handleSend}
                                disabled={thinking || !input.trim()}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    background: thinking || !input.trim()
                                        ? 'rgba(201,169,110,0.2)'
                                        : 'linear-gradient(135deg, rgba(140,40,40,0.9), rgba(100,20,20,0.9))',
                                    border: '1px solid rgba(201,169,110,0.35)',
                                    borderRadius: 10,
                                    padding: '8px 14px',
                                    color: thinking || !input.trim() ? 'rgba(201,169,110,0.4)' : '#e8d5a3',
                                    cursor: thinking || !input.trim() ? 'default' : 'pointer',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    letterSpacing: '0.03em',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Send
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

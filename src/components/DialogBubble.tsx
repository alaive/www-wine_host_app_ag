import { motion, AnimatePresence } from 'framer-motion';

interface DialogBubbleProps {
    message: string;
    options?: string[];
    onSelect?: (option: string) => void;
}

export const DialogBubble = ({ message, options, onSelect }: DialogBubbleProps) => {
    return (
        <div className="dialog-overlay">
            <AnimatePresence mode="wait">
                <motion.div
                    key={message}
                    className="dialog-bubble"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <div className="dialog-text">{message}</div>
                    {options && options.length > 0 && (
                        <div className="dialog-options">
                            {options.map((option) => (
                                <button
                                    key={option}
                                    className="option-btn"
                                    onClick={() => onSelect?.(option)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

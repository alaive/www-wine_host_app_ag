// src/utils/chatApi.ts
// Utility functions to communicate with the wine chatbot PHP backend.
// Uses a relative URL so it works whether served by:
// - Vite dev server (proxied via vite.config.ts)  
// - Apache/MAMP directly from the dist/ folder
// Vite copies public/php/ → dist/php/ at build time.

const PHP_BASE = './php/api.php';

export interface SendMessageResult {
    success: boolean;
    extracted: string;
    error?: string;
}

export interface PollResponseResult {
    hasResponse: boolean;
    text?: string;
    error?: string;
    timedOut?: boolean;
}

/**
 * Send a user message to the chatbot backend.
 * The backend fuzzy-matches the text against the `concepts` table
 * and writes matched concepts into `inputTxt` (scenario_id=62).
 */
export async function sendMessage(text: string): Promise<SendMessageResult> {
    const resp = await fetch(`${PHP_BASE}?action=message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    });
    return resp.json();
}

/**
 * Poll the backend for a response from `outputTxt` (scenario_id=62).
 * Returns as soon as hasResponse=true or when maxWaitMs is exceeded.
 */
export async function pollForResponse(
    maxWaitMs = 30000,
    intervalMs = 2000
): Promise<PollResponseResult> {
    const deadline = Date.now() + maxWaitMs;

    while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, intervalMs));
        try {
            const resp = await fetch(`${PHP_BASE}?action=response`);
            const data: PollResponseResult = await resp.json();
            if (data.hasResponse) return data;
        } catch {
            // network hiccup — keep polling
        }
    }

    return { hasResponse: false, timedOut: true };
}

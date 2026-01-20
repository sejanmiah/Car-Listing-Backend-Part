// --- CRITICAL TIME FIX ---
// The server date is 2026, but Google requires 2025.
// This patch is REQUIRED to fix "Invalid JWT Signature" errors.
// It must be imported BEFORE anything else.

const OriginalDate = Date;
const ONE_YEAR_MS = 0; // 2026 is correct year
const EXTRA_LAG_MS = 10 * 60 * 1000; // 10 minute safety buffer for fast clocks
const OFFSET = ONE_YEAR_MS + EXTRA_LAG_MS;

global.Date = class extends OriginalDate {
    constructor(...args) {
        if (args.length === 0) {
            super(OriginalDate.now() - OFFSET);
        } else {
            super(...args);
        }
    }
    static now() {
        return OriginalDate.now() - OFFSET;
    }
};

console.log(`[Critical Fix] Time adjusted -10 minutes to sync with Google servers.`);
console.log(`[Critical Fix] System Time: ${new OriginalDate().toISOString()}`);
console.log(`[Critical Fix] Server Time: ${new Date().toISOString()}`);

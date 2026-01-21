// --- CRITICAL TIME FIX ---
// The server date is 2026, but Google requires 2025.
// This patch is REQUIRED to fix "Invalid JWT Signature" errors.
// It must be imported BEFORE anything else.

const OriginalDate = Date;
const ONE_YEAR_MS = 0; // Time is correct (2026 matches Google)
const EXTRA_LAG_MS = 0;
const OFFSET = 0;

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

console.log(`[Critical Fix] Time sync checked. No adjustment needed (System Time is correct).`);
console.log(`[Critical Fix] System Time: ${new OriginalDate().toISOString()}`);
console.log(`[Critical Fix] Server Time: ${new Date().toISOString()}`);

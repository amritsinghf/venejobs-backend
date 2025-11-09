const rateMap = new Map();

/**
 * Simple in-memory rate limiter
 * @param {string} key unique identifier (e.g., email)
 * @param {number} limitMs time in ms (default 1 minute)
 */
function isRateLimited(key, limitMs = 60 * 1000) {
    const now = Date.now();
    const last = rateMap.get(key);

    if (last && now - last < limitMs) return true;

    rateMap.set(key, now);
    return false;
}

module.exports = { isRateLimited };
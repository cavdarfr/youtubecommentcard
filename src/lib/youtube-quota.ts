import { Redis } from "@upstash/redis";

const DAILY_LIMIT = 1000;

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function today(): string {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function quotaKey(): string {
    return `youtube_quota_${today()}`;
}

export async function resetQuotaIfNeeded() {
    // No-op with Redis, as we use a new key per day
}

export async function checkAndIncrementQuota() {
    const key = quotaKey();
    // Atomically increment and get the value
    const count = await redis.incr(key);
    if (count === 1) {
        // Set expiry to 25 hours to auto-reset
        await redis.expire(key, 60 * 60 * 25);
    }
    if (count > DAILY_LIMIT) {
        throw new Error(
            `YouTube API daily limit of ${DAILY_LIMIT} requests reached. Please try again tomorrow.`
        );
    }
}

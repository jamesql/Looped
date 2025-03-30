export {};

declare global {
    interface CacheEntry {
        url: string;
        timestamp: number;
    }
    // Extend the global interface to include our custom cache
    // eslint-disable-next-line no-var
    var __FILE_URL_CACHE: Map<string, CacheEntry>;
}

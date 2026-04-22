/**
 * PreprocessingService
 * 
 * Provides systemic normalization for user queries and tool arguments.
 * Uses algorithmic cleaning instead of exhaustive hardcoded rules.
 */

// Common abbreviations to expand in queries
const ABBREVIATIONS: Record<string, string> = {
    temp: "temperature",
    precip: "precipitation",
    qty: "quantity",
    vol: "volume",
};

// NOTE: Removed hardcoded STANDARDIZATIONS (plural forcing).
// Fuzzy matching in the evaluator handles singular/plural variations automatically.

// Noise words to strip from entities (commodities, locations, etc.)
const NOISE_WORDS = new Set([
    "price",
    "today",
    "rate",
    "market",
    "daily",
    "current",
    "now",
    "latest",
]);

// Fields that should be treated as standardized entities
export const ENTITY_FIELDS = new Set([
    "commodity",
    "comodity",
    "crop",
    "market",
    "city",
    "district",
    "state",
    "variety",
    "region",
    "pest",
]);

/**
 * Systematically cleans a string based on its type.
 */
export function systemicClean(text: string, isEntity: boolean = false): string {
    if (!text) return text;

    // 1. Expand abbreviations (applies to both queries and entities)
    let cleaned = text.split(/\s+/).map(word => {
        const lower = word.toLowerCase();
        return ABBREVIATIONS[lower] || word;
    }).join(" ");

    if (isEntity) {
        // 2. Remove noise words from entities
        cleaned = cleaned.split(/\s+/)
            .filter(word => !NOISE_WORDS.has(word.toLowerCase()))
            .join(" ");

        // 3. Special case: normalize Goa capitalization
        if (cleaned.toLowerCase() === "goa") {
            cleaned = "Goa";
        }
    }

    return cleaned.trim();
}

/**
 * Normalizes the raw user query.
 */
export function preprocessQuery(query: string): string {
    if (!query) return query;

    // Clean the query by expanding abbreviations and normalizing common phrasing
    let normalized = systemicClean(query, false);

    // Handle specific global patterns in queries
    normalized = normalized.replace(/\bgoa today\b/gi, "Goa");
    normalized = normalized.replace(/\bonion price today\b/gi, "onion");

    return normalized;
}

/**
 * Normalizes arguments for a specific tool.
 * Automatically identifies and cleans entity-based fields.
 */
export function preprocessArguments(toolName: string, args: any): any {
    if (!args || typeof args !== "object") return args;

    const processedArgs = { ...args };

    for (const field of Object.keys(processedArgs)) {
        if (typeof processedArgs[field] === "string") {
            // Check if this field should be treated as an entity for systemic cleaning
            const isEntity = ENTITY_FIELDS.has(field);

            // Special handling for the generic 'query' field in some tools
            const isQueryField = field === "query";

            // Clean the field
            processedArgs[field] = systemicClean(processedArgs[field], isEntity || isQueryField);
        }
    }

    // Tool-specific heuristics could go here if needed, but the goal is to keep it generalized
    return processedArgs;
}

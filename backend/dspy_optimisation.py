import dspy
import os
import re
import time
import json
from dspy import Signature, InputField, OutputField
from dspy.teleprompt import BootstrapFewShot
from dspy import Example
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- 1. CONFIGURATION & MODELS ---
deepseek_api_key = os.getenv("DEEPSEEK_API_KEY")
if not deepseek_api_key:
    raise ValueError("DEEPSEEK_API_KEY not found in environment variables.")

# Configure DSPy with DeepSeek
lm = dspy.LM(model='deepseek/deepseek-v4-pro', api_key=deepseek_api_key)
dspy.settings.configure(lm=lm)

# --- 2. PRE-PROCESSING LOGIC (Ported from TypeScript) ---

ABBREVIATIONS = {
    "temp": "temperature",
    "precip": "precipitation",
    "qty": "quantity",
    "vol": "volume",
}

NOISE_WORDS = {
    "price", "today", "rate", "market", "daily", "current", "now", "latest",
}

ENTITY_FIELDS = {
    "commodity", "comodity", "crop", "market", "city", "district", "state", "variety", "region", "pest",
}

def systemic_clean(text: str, is_entity: bool = False) -> str:
    if not text:
        return text
    
    # 1. Expand abbreviations
    words = text.split()
    cleaned_words = [ABBREVIATIONS.get(w.lower(), w) for w in words]
    
    if is_entity:
        # 2. Remove noise words
        cleaned_words = [w for w in cleaned_words if w.lower() not in NOISE_WORDS]
        
        # 3. Special case: Goa
        if " ".join(cleaned_words).lower() == "goa":
            return "Goa"
            
    return " ".join(cleaned_words).strip()

def calculate_similarity(s1: str, s2: str) -> float:
    str1 = s1.lower().strip()
    str2 = s2.lower().strip()

    if str1 == str2:
        return 1.0
    if not str1 or not str2:
        return 0.0

    # 1. Word-based Jaccard Similarity
    words1 = set(re.findall(r'[a-z0-9]+', str1))
    words2 = set(re.findall(r'[a-z0-9]+', str2))
    
    if not words1 or not words2:
        jaccard = 0.0
    else:
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        jaccard = len(intersection) / len(union)

    # 2. Contains check
    contains = 0.0
    if str1 in str2 or str2 in str1:
        contains = min(len(str1), len(str2)) / max(len(str1), len(str2))

    # 3. Levenshtein-based
    def edit_distance(a, b):
        if len(a) < len(b):
            return edit_distance(b, a)
        if not b:
            return len(a)
        previous_row = range(len(b) + 1)
        for i, c1 in enumerate(a):
            current_row = [i + 1]
            for j, c2 in enumerate(b):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        return previous_row[-1]

    distance = edit_distance(str1, str2)
    levenshtein = (max(len(str1), len(str2)) - distance) / max(len(str1), len(str2))

    return max(jaccard, contains, levenshtein)

# --- 3. SIGNATURE & MODULE ---

class ToolSelector(Signature):
    """
    Categorize the agricultural query and select the appropriate tool with arguments.
    Provide a confidence score for your selection.
    """
    query = InputField(desc="User's agricultural query")
    tool_name = OutputField(desc="Name of the tool to use (e.g., get_current_weather, get_mandi_data)")
    args = OutputField(desc="Arguments for the tool in JSON format")
    confidence = OutputField(desc="Confidence score between 0 and 1")

class ToolSelectorModule(dspy.Module):
    def __init__(self):
        super().__init__()
        self.predictor = dspy.Predict(ToolSelector)
        
    def forward(self, query):
        # Pre-process query before prediction
        clean_query = systemic_clean(query, is_entity=False)
        return self.predictor(query=clean_query)

# --- 4. METRIC ---

def metric(example, pred, trace=None):
    # Add a delay to avoid RateLimitError (429) from DeepSeek
    time.sleep(1)
    
    # 1. Exact match for tool_name
    if pred.tool_name != example.tool_name:
        return 0.0
    
    # 2. Compare arguments
    # Note: DSPy might return args as a string or a dict. Ensure it's a dict.
    pred_args = pred.args
    if isinstance(pred_args, str):
        try:
            # Simple heuristic to extract JSON-like dict if it's a string
            pred_args = json.loads(pred_args)
        except:
            # If not valid JSON, we can't easily compare
            return 0.0
            
    expected_args = example.args
    
    # Logic from tool-accuracy.ts:
    # Score = 1 only if all args match above 60% threshold
    common_keys = set(expected_args.keys()).intersection(set(pred_args.keys()))
    
    if not common_keys and expected_args:
        return 0.0
        
    for key in expected_args.keys():
        if key not in pred_args:
            return 0.0
            
        p_val = str(pred_args.get(key, "")).lower()
        e_val = str(expected_args.get(key, "")).lower()
        
        is_entity = key in ENTITY_FIELDS or key == "query"
        p_val_clean = systemic_clean(p_val, is_entity=is_entity)
        e_val_clean = systemic_clean(e_val, is_entity=is_entity)
        
        sim = calculate_similarity(p_val_clean, e_val_clean)
        
        if sim < 0.6: # 60% similarity logic
            return 0.0
            
    # If all matches passed
    # Optional: factor in confidence score
    try:
        conf = float(pred.confidence)
    except:
        conf = 1.0
        
    return 1.0 * conf if conf > 0 else 1.0

# --- 5. DATASET ---

def get_trainset():
    data = [
        {"query": "I am a farmer, how to control pests in chilli?", "tool_name": "get_pesticide_info", "args": {"crop": "chilli"}},
        {"query": "Can you find videos on organic farming?", "tool_name": "search_and_recomend_youtube_videos", "args": {"query": "organic farming"}},
        {"query": "I am a farmer, how to manage leaf curl in tomato?", "tool_name": "get_pesticide_info", "args": {"crop": "tomato", "pest": "leaf curl"}},
        {"query": "What is the current weather in Ludhiana?", "tool_name": "get_current_weather", "args": {"city": "Ludhiana"}},
        {"query": "What is the market price of onion in Maharashtra?", "tool_name": "get_mandi_data", "args": {"commodity": "Onion", "state": "Maharashtra"}},
        {"query": "I am a farmer, recommend fertilizer for rice.", "tool_name": "get_fertilizer_info", "args": {"crop": "rice"}},
        {"query": "Show me videos on hydroponic farming.", "tool_name": "search_and_recomend_youtube_videos", "args": {"query": "hydroponic farming"}},
        {"query": "In April 2024, what fertilizer should I use for wheat?", "tool_name": "get_fertilizer_info", "args": {"crop": "wheat"}},
        {"query": "How can I apply for PM-KISAN scheme?", "tool_name": "get_government_schemes", "args": {"query": "PM-KISAN application"}},
        {"query": "Show me videos on drip irrigation setup.", "tool_name": "search_and_recomend_youtube_videos", "args": {"query": "drip irrigation"}},
        {"query": "What is the dosage of Fantac Plus for chilli?", "tool_name": "get_pesticide_info", "args": {"crop": "chilli", "pest": "pesticide info"}},
        {"query": "Are there any schemes for solar pumps?", "tool_name": "get_government_schemes", "args": {"query": "solar pump schemes"}},
        {"query": "I am a farmer, how to treat aphids in mustard?", "tool_name": "get_pesticide_info", "args": {"crop": "mustard", "pest": "aphids"}},
        {"query": "How do I apply for KCC loan?", "tool_name": "get_government_schemes", "args": {"query": "KCC loan application"}},
        {"query": "Tell me the price of wheat in Punjab mandi.", "tool_name": "get_mandi_data", "args": {"commodity": "Wheat", "state": "Punjab"}},
        {"query": "What is the price of potato in Delhi today?", "tool_name": "get_mandi_data", "args": {"commodity": "Potato", "state": "Delhi"}},
        {"query": "Is there a scheme for organic certification?", "tool_name": "get_government_schemes", "args": {"query": "organic certification schemes"}},
        {"query": "I am a farmer, what fertilizer for chilli flowering stage?", "tool_name": "get_fertilizer_info", "args": {"crop": "chilli"}},
        {"query": "Any schemes for drip irrigation in Haryana?", "tool_name": "get_government_schemes", "args": {"query": "drip irrigation", "state": "Haryana"}},
        {"query": "Current price of mustard in Rajasthan?", "tool_name": "get_mandi_data", "args": {"commodity": "Mustard", "state": "Rajasthan"}}
    ]

    trainset = []
    for item in data:
        ex = Example(
            query=item["query"],
            tool_name=item["tool_name"],
            args=item["args"]
        ).with_inputs("query")
        trainset.append(ex)
    return trainset

# --- 6. OPTIMIZATION ---

def optimize():
    selector = ToolSelectorModule()
    trainset = get_trainset()
    
    # Using BootstrapFewShot for optimization
    # This will use the metric to evaluate and select the best few-shot examples
    optimizer = BootstrapFewShot(metric=metric, max_bootstrapped_demos=4, max_labeled_demos=4)
    
    print("🚀 Optimizing Tool Selector module...")
    optimized_selector = optimizer.compile(selector, trainset=trainset)
    
    # Save the optimized module
    print("✅ Optimization complete.")
    
    # Export optimized examples (demos) to a file
    optimized_data = []
    for demo in optimized_selector.predictor.demos:
        optimized_data.append({
            "query": demo.query,
            "tool_name": demo.tool_name,
            "args": demo.args,
            "confidence": getattr(demo, 'confidence', 1.0)
        })
    
    with open("optimized_examples.json", "w") as f:
        json.dump(optimized_data, f, indent=4)
    print(f"📄 Optimized examples saved to optimized_examples.json")
    
    # Test on a new query
    test_query = "What is the price of mustard in haryana?"
    prediction = optimized_selector(query=test_query)
    
    print(f"\n--- TEST PREDICTION ---")
    print(f"Query: {test_query}")
    print(f"Tool: {prediction.tool_name}")
    print(f"Args: {prediction.args}")
    print(f"Confidence: {prediction.confidence}")
    
    print("\n--- FULL COMPILED PROMPT ---")
    lm.inspect_history(n=1)
    
    return optimized_selector

if __name__ == "__main__":
    optimize()

import os
from groq import Groq

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

def _get_client():
    if not GROQ_API_KEY:
        return None
    try:
        return Groq(api_key=GROQ_API_KEY)
    except:
        return None

# We use one of the models from your list: Llama 3.3 70B
GROQ_MODEL = "llama-3.3-70b-versatile"

def summarize_narrative(description: str, detections: list, image_caption: str = None) -> str:
    client = _get_client()
    if not client or not description:
        return "No AI summary available."
        
    try:
        detection_str = ", ".join([f"{d['class_name']} ({d['confidence'] * 100:.0f}%)" for d in detections])
        caption_str = f'AI Visual Description: "{image_caption}"' if image_caption else ""
        
        prompt = f"""
        Summarize this citizen complaint into a concise 2-3 sentence officer summary.
        Citizen description: "{description}"
        {caption_str}
        AI Detected Objects: {detection_str}
        
        Focus only on the actionable facts. Do not add conversational filler.
        """
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=150
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq API Error: {e}")
        return "Failed to generate AI summary."

def generate_blueprint(title: str, description: str, category: str, severity: str) -> str:
    client = _get_client()
    if not client:
        return "- Step 1: Dispatch crew to location.\n- Step 2: Assess and repair.\n- Step 3: Update status to Resolved."
        
    try:
        prompt = f"""
        Generate a step-by-step resolution checklist for a field crew fixing this civic issue:
        Category: {category}
        Severity: {severity}
        Title: {title}
        Description: {description}
        
        Format as a simple markdown bulleted list. Keep it very practical and specific to the issue.
        """
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=200
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq API Error: {e}")
        return "- Dispatch crew to location.\n- Assess and repair.\n- Update status to Resolved."

def generate_title_description(detections: list, image_caption: str = None, category: str = "General") -> dict:
    """Auto-generate a title and description for a civic complaint using Groq."""
    client = _get_client()
    
    detection_str = ", ".join([f"{d['class_name']} ({d['confidence'] * 100:.0f}%)" for d in detections]) if detections else "No objects detected"
    caption_str = image_caption or "No visual description available"
    
    if not client:
        # Fallback when API is unavailable
        fallback_title = f"{category} Issue Detected" if category != "General" else "Civic Issue Reported"
        fallback_desc = f"AI detected: {detection_str}. Visual: {caption_str}"
        return {"title": fallback_title, "description": fallback_desc}
    
    try:
        prompt = f"""
        You are a civic issue reporting assistant. Based on the AI analysis of a citizen-uploaded photo,
        generate a concise, professional title and description for this civic complaint report.
        
        AI Detected Objects: {detection_str}
        AI Visual Description: "{caption_str}"
        Category: {category}
        
        Return EXACTLY in this format (no extra text, no conversational filler):
        TITLE: <a short, specific title, max 10 words>
        DESCRIPTION: <a 2-3 sentence factual description of the issue, its visible condition, and potential impact>
        """
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful assistant. Only output exactly what is requested."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=200
        )
        text = response.choices[0].message.content.strip()
        
        title = category + " Issue Detected"
        description = f"AI detected: {detection_str}"
        
        for line in text.split("\n"):
            line = line.strip()
            if line.upper().startswith("TITLE:"):
                title = line.split(":", 1)[1].strip()
            elif line.upper().startswith("DESCRIPTION:"):
                description = line.split(":", 1)[1].strip()
        
        return {"title": title, "description": description}
    except Exception as e:
        print(f"Groq API Error (title/desc): {e}")
        return {
            "title": f"{category} Issue Detected",
            "description": f"AI detected: {detection_str}. Visual: {caption_str}"
        }


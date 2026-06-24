import os
from unicodedata import category
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

def generate_title_description(
    detections: list,
    image_caption: str = None,
    category: str = "General"
) -> dict:

    client = _get_client()

    detection_str = ", ".join(
        [
            f"{d['class_name']} ({d['confidence'] * 100:.0f}%)"
            for d in detections
        ]
    ) if detections else "No objects detected"

    caption_str = image_caption or "No visual description available"
    caption_lower = caption_str.lower()

    # ---------------------------
    # FALLBACK IF NO GROQ
    # ---------------------------

    if not client:
        return {
            "title": f"{category} Issue Detected",
            "description": (
                f"AI detected: {detection_str}. "
                f"Visual description: {caption_str}"
            )
        }

    # ---------------------------
    # GROQ PROMPT
    # ---------------------------

    try:

        prompt = f"""
You are a civic issue reporting assistant.

IMPORTANT RULES:

1. The image caption may be inaccurate.
2. Trust the detected category more than the image caption.
3. Never mention oil unless clearly detected.
4. Water may be mentioned if the image caption contains water, puddle, wet road, standing water or flooding.
5. For Garbage category, describe litter, waste, trash or debris.
6. For Pothole category, describe potholes, road damage and standing water if visible.
7. If only one pothole is detected, use singular wording such as "a pothole" instead of "multiple potholes".
8. Do not invent objects not supported by detections or caption.
9. Keep descriptions factual and concise.

Category:
{category}

Detected Objects:
{detection_str}

Image Caption:
{caption_str}

Return EXACTLY:

TITLE: <short title>
DESCRIPTION: <2-3 sentence factual description>
"""

        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "Only output the requested format."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=200
        )

        text = response.choices[0].message.content.strip()

        title = f"{category} Issue Detected"
        description = detection_str

        for line in text.split("\n"):

            line = line.strip()

            if line.upper().startswith("TITLE:"):
                title = line.split(":", 1)[1].strip()

            elif line.upper().startswith("DESCRIPTION:"):
                description = line.split(":", 1)[1].strip()

        return {
            "title": title,
            "description": description
        }

    except Exception as e:

        print(f"Groq API Error (title/desc): {e}")

        return {
            "title": f"{category} Issue Detected",
            "description": (
                f"AI detected: {detection_str}. "
                f"Visual description: {caption_str}"
            )
        }
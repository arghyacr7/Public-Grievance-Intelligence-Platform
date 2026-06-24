import os
import io
from PIL import Image

try:
    from transformers import BlipProcessor, BlipForConditionalGeneration
    import torch
except ImportError:
    pass

processor = None
model = None

def load_blip_model():
    global processor, model
    if processor is not None and model is not None:
        return True
    try:
        print("Loading local BLIP captioning model...")
        processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
        model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
        print("BLIP model loaded successfully.")
        return True
    except Exception as e:
        print(f"Error loading BLIP model: {e}")
        return False

def generate_caption(image: Image.Image) -> str:
    """
    Generate a natural language caption for the given image using local BLIP model.
    """
    if not load_blip_model():
        return "No image caption available."

    try:
        if image.mode != "RGB":
            image = image.convert("RGB")

        inputs = processor(image, return_tensors="pt")

        out = model.generate(**inputs, max_new_tokens=50)

        caption = processor.decode(out[0], skip_special_tokens=True)

        caption = caption.replace("oil", "water")
        caption = caption.replace("oily", "wet")

        print(f"BLIP CAPTION: {caption}")

        return caption

    except Exception as e:
        print(f"Local BLIP Vision Error: {e}")
        return "No image caption available."
import imagehash
from PIL import Image
from math import radians, cos, sin, asin, sqrt
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import io

def calculate_phash(image: Image.Image):
    try:
        return str(imagehash.phash(image))
    except Exception:
        return ""

def haversine(lon1, lat1, lon2, lat2):
    # Calculate great circle distance between two points in meters
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    r = 6371000 # Radius of earth in meters
    return c * r

def check_text_similarity(text1: str, text2: str) -> float:
    if not text1 or not text2:
        return 0.0
    try:
        vectorizer = TfidfVectorizer()
        tfidf = vectorizer.fit_transform([text1, text2])
        return cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
    except:
        return 0.0

def is_duplicate(new_phash: str, new_lat: float, new_lon: float, new_text: str, existing_complaints: list) -> tuple[bool, int | None]:
    for complaint in existing_complaints:
        # 1. pHash comparison (Hamming distance < 10)
        if new_phash and complaint.phash:
            try:
                hash1 = imagehash.hex_to_hash(new_phash)
                hash2 = imagehash.hex_to_hash(complaint.phash)
                if hash1 - hash2 < 10:
                    return True, complaint.id
            except:
                pass
                
        # 2. GPS Proximity (< 100 meters)
        if new_lat and new_lon and complaint.latitude and complaint.longitude:
            dist = haversine(new_lon, new_lat, complaint.longitude, complaint.latitude)
            if dist < 100:
                # 3. Text Similarity check if they are physically close (>85%)
                existing_text = f"{complaint.title} {complaint.description}"
                if check_text_similarity(new_text, existing_text) > 0.85:
                    return True, complaint.id
                    
    return False, None

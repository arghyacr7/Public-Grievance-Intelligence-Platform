import requests

url = "http://127.0.0.1:8000/api/complaints/analyze"
files = {
    'file': ('1_Potholes-resized-for-blog.jpg', open('uploads/1_Potholes-resized-for-blog.jpg', 'rb'), 'image/jpeg')
}
data = {
    'latitude': 22.68,
    'longitude': 88.28
}

response = requests.post(url, files=files, data=data)
print(response.status_code)
print(response.json())

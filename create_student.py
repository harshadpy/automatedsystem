import requests

url = "http://localhost:8000/users"
data = {
    "name": "John Student",
    "email": "teststudent@example.com",
    "password": "password123",
    "role": "student"
}

response = requests.post(url, json=data)
print(response.json())

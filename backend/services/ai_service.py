import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY and "your_openai_api_key" not in OPENAI_API_KEY else None

def generate_content(prompt: str):
    if not client:
        print(f"[MOCK] Generating content for: {prompt}")
        return "This is a mock AI generated response."

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant for a Python coaching center."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating content: {e}")
        return "Error generating content."

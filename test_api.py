import requests
import json

NGROK_URL = "https://unimplied-annett-peakishly.ngrok-free.dev" 

url = f"{NGROK_URL}/tts"

params = {
    "text": "你好，测试一下。",
    "text_lang": "zh",
}

print(f"Connecting to {url} ...")

try:
    response = requests.get(url, params=params, timeout=60)
    
    if response.status_code == 200:
        print("✅ Success! API returned audio data.")
        with open("test_result.wav", "wb") as f:
            f.write(response.content)
        print("Audio saved as test_result.wav")
    else:
        print(f"❌ Failed, status code: {response.status_code}")
        print("Server error details:")
        try:
            print(json.dumps(response.json(), indent=4, ensure_ascii=False))
        except:
            print(response.text)

except Exception as e:
    print(f"❌ Connection error: {e}")

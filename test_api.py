import requests
import json

# 👇 把这里换成你 Colab 当前生成的 Ngrok 地址 (不要带最后的斜杠 /)
# 例如: "https://xxxx-xxxx.ngrok-free.app"
NGROK_URL = "https://unimplied-annett-peakishly.ngrok-free.dev" 

url = f"{NGROK_URL}/tts"

# 模拟 Django 发送的参数
params = {
    "text": "你好，测试一下。",
    "text_lang": "zh",
    # 我们故意不传 ref_audio_path，看看服务器会不会自动补全
}

print(f"正在连接 {url} ...")

try:
    response = requests.get(url, params=params, timeout=60)
    
    if response.status_code == 200:
        print("✅ 成功！API 返回了音频数据。")
        print("说明：自动注入逻辑生效了，或者是参数传递正确。")
        # 可以把音频保存下来听听
        with open("test_result.wav", "wb") as f:
            f.write(response.content)
        print("音频已保存为 test_result.wav")
    else:
        print(f"❌ 失败，状态码: {response.status_code}")
        print("👇 服务器返回的详细错误信息 👇")
        try:
            # 尝试打印 JSON 错误
            print(json.dumps(response.json(), indent=4, ensure_ascii=False))
        except:
            # 如果不是 JSON，直接打印原文
            print(response.text)

except Exception as e:
    print(f"❌ 连接错误: {e}")

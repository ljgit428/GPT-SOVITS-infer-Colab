from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.base import ContentFile
from .models import AudioRecord
import requests
import json
import uuid

# ⚠️ 这里的 URL 需要你在运行 Colab 后，找到类似于 https://xxxxx.gradio.live/ 的地址
# 并根据其 API 文档填写具体的 endpoint (例如 /api/generate)
COLAB_API_URL = "https://YOUR-COLAB-URL.gradio.live/api/generate" 

@csrf_exempt
def generate_audio(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            text = data.get('text', '')

            if not text:
                return JsonResponse({'error': 'Text is required'}, status=400)

            # 1. 发送请求给 Colab API
            # 注意：这里的数据结构取决于 Colab 具体的 API 定义
            # 假设它接受 {"text": "..."} 并返回二进制音频流
            # 如果是 Gradio，通常 payload 是 {"data": [text, ...]}
            payload = {
                "text": text,
                "prompt": "[oral_2]", # 示例参数
                "speed": 5
            }
            
            print(f"Sending to Colab: {text}")
            
            # 发送请求
            response = requests.post(COLAB_API_URL, json=payload, timeout=60)

            if response.status_code != 200:
                return JsonResponse({'error': 'Colab API Error'}, status=500)

            # 2. 处理返回的音频
            # 情况 A: Colab 直接返回二进制 WAV/MP3 文件流
            audio_content = response.content
            
            # 情况 B (Gradio常见): 返回 JSON 包含 Base64 或 远程 URL
            # 需要你根据实际情况解析 response.json()
            
            # 3. 保存到本地 Django Media
            file_name = f"{uuid.uuid4()}.wav"
            record = AudioRecord(text=text)
            # 将二进制数据保存为文件
            record.audio_file.save(file_name, ContentFile(audio_content))
            record.save()

            # 4. 返回本地 URL 给前端
            return JsonResponse({
                'text': text,
                'audio_url': request.build_absolute_uri(record.audio_file.url)
            })

        except Exception as e:
            print(e)
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

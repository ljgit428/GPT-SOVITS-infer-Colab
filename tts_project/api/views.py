from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.base import ContentFile
from .models import AudioRecord
import requests
import json
import uuid

# ==========================================
# !!! 每次 Colab 启动后，将 ngrok 生成的地址填在这里 !!!
# 注意：不要带最后的斜杠 /
COLAB_API_BASE = "https://xxxx-xxxx.ngrok-free.app" 
# ==========================================

@csrf_exempt
def generate_audio(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            text = data.get('text', '')

            if not text:
                return JsonResponse({'error': '内容不能为空'}, status=400)

            # 1. 构造 GPT-SoVITS api_v2 的参数
            # 注意：这里假设模型已经加载了默认的参考音频，或者不需要强制指定参考音频
            # 如果需要更精细的控制（参考音频、语种等），需要在这里添加更多参数
            params = {
                "text": text,
                "text_lang": "zh",      # 强制输入为中文，可根据需要修改
                "prompt_lang": "zh",    # 提示语语言
                "top_k": 5,
                "top_p": 1,
                "temperature": 1,
                # 如果你的模型必须需要参考音频路径，需要在这里传入 ref_audio_path
            }
            
            print(f"正在请求 Colab: {COLAB_API_BASE}/tts ... 内容: {text}")
            
            # 2. 发送 GET 请求到 Colab (GPT-SoVITS 标准接口通常是 /tts)
            response = requests.get(f"{COLAB_API_BASE}/tts", params=params, timeout=120)

            if response.status_code != 200:
                print(f"Colab 错误: {response.text}")
                return JsonResponse({'error': 'Colab API 生成失败，请检查 ngrok 地址是否过期'}, status=500)

            # 3. 保存音频文件
            file_name = f"{uuid.uuid4()}.wav"
            record = AudioRecord(text=text)
            
            # response.content 包含二进制音频数据
            record.audio_file.save(file_name, ContentFile(response.content))
            record.save()

            # 4. 返回完整 URL
            full_url = request.build_absolute_uri(record.audio_file.url)
            
            return JsonResponse({
                'id': record.id,
                'text': text,
                'audio_url': full_url,
                'created_at': record.created_at
            })

        except Exception as e:
            print(f"后端异常: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

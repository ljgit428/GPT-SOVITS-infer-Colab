from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.base import ContentFile
from .models import AudioRecord
import requests
import json
import uuid

import re  # 👈 1. 记得导入正则模块
from django.conf import settings

@csrf_exempt
def generate_audio(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            text = data.get('text', '')
            # 👇 获取前端传来的 text_lang，如果没有则默认 auto
            text_lang = data.get('text_lang', 'auto')
            
            # 👇 2. 获取前端传来的开关参数 (默认为 False)
            ignore_brackets = data.get('ignore_brackets', False)

            # 👇 3. 添加过滤逻辑 (必须在判断 if not text 之前)
            if ignore_brackets and text:
                print(f"原始文本: {text}")
                # 正则解释：
                # \(.*?\)   -> 匹配英文小括号及内容
                # （.*?）   -> 匹配中文小括号及内容
                # \[.*?\]   -> 匹配英文中括号及内容
                # 【.*?】   -> 匹配中文中括号及内容
                pattern = r'\(.*?\)|（.*?）|\[.*?\]|【.*?】'
                text = re.sub(pattern, '', text)
                print(f"过滤后文本: {text}")

            if not text.strip():
                return JsonResponse({'error': '内容不能为空（或过滤后为空）'}, status=400)

            # 1. 构造 GPT-SoVITS api_v2 的参数
            # 注意：这里假设模型已经加载了默认的参考音频，或者不需要强制指定参考音频
            # 如果需要更精细的控制（参考音频、语种等），需要在这里添加更多参数
            params = {
                "text": text,
                "text_lang": text_lang,      # 使用前端传来的语言参数
                "top_k": 5,
                "top_p": 1,
                "temperature": 1,
                # 如果你的模型必须需要参考音频路径，需要在这里传入 ref_audio_path
            }
            
            api_base = settings.COLAB_API_BASE
            if not api_base:
                return JsonResponse({'error': '未配置 Colab 地址，请检查 .env 文件'}, status=500)

            print(f"正在请求 Colab: {api_base}/tts ... 内容: {text}")
            
            # 2. 发送 GET 请求到 Colab (GPT-SoVITS 标准接口通常是 /tts)
            response = requests.get(f"{api_base}/tts", params=params, timeout=120)

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

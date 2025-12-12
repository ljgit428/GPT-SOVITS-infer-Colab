from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.base import ContentFile
from .models import AudioRecord
import requests
import json
import uuid
import re
from django.conf import settings


@csrf_exempt
def generate_audio(request):
    """
    Handles text-to-speech generation requests via the Colab/Ngrok tunnel.

    Processing flow:
    1. Validates input text and language parameters.
    2. Sanitizes input (e.g., bracket removal).
    3. Forwards request to the ephemeral Colab instance.
    4. Caches the returned audio blob to local Django storage.

    Returns:
        JsonResponse: Contains the signed URL to the generated audio file.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            text = data.get('text', '')
            text_lang = data.get('text_lang', 'auto')
            ignore_brackets = data.get('ignore_brackets', False)
            
            if text_lang.lower() == 'en' or text_lang.lower() == 'english':
                text = text.replace('-', ' ') 

            if ignore_brackets and text:
                pattern = r'\(.*?\)|（.*?）|\[.*?\]|【.*?】'
                text = re.sub(pattern, '', text)

            if not text.strip():
                return JsonResponse({'error': 'Content cannot be empty'}, status=400)

            params = {
                "text": text,
                "text_lang": text_lang,
                "top_k": 5,
                "top_p": 1,
                "temperature": 1,
            }

            api_base = settings.COLAB_API_BASE
            if not api_base:
                return JsonResponse({'error': 'Colab API base not configured'}, status=500)

            response = requests.get(f"{api_base}/tts", params=params, timeout=120)

            if response.status_code != 200:
                return JsonResponse({'error': 'Colab API generation failed'}, status=500)

            file_name = f"{uuid.uuid4()}.wav"
            record = AudioRecord(text=text)
            record.audio_file.save(file_name, ContentFile(response.content))
            record.save()

            full_url = request.build_absolute_uri(record.audio_file.url)

            return JsonResponse({
                'id': record.id,
                'text': text,
                'audio_url': full_url,
                'created_at': record.created_at
            })

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Method not allowed'}, status=405)

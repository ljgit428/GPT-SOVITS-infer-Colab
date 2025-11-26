from django.db import models


class AudioRecord(models.Model):
    text = models.TextField()
    audio_file = models.FileField(upload_to='tts_audio/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text[:50]

from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from api.views import generate_audio

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/generate/', generate_audio),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

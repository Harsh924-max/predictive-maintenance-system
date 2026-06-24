from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

urlpatterns = [
    path('admin/', admin.site.urls),
    path('test/', lambda request: HttpResponse("Test OK")),
    path('api/', include('api.urls')),   # THIS LINE WAS MISSING
]
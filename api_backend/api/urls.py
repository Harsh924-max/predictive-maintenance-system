from django.urls import path
from . import views

urlpatterns = [
    path('nasa/health/', views.NASAHealthView.as_view()),
    path('nasa/predict/', views.NASAPredictView.as_view()),
    path('cwru/health/', views.CWRUHealthView.as_view()),
    path('cwru/predict/', views.CWRUPredictView.as_view()),
]
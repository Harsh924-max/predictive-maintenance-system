from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        """Load models when Django starts"""
        from .model_loader import load_nasa_models, load_cwru_models
        load_nasa_models()
        load_cwru_models()
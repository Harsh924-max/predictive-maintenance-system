import joblib
from pathlib import Path
from django.conf import settings
import numpy as np

# Global variables to hold loaded models
nasa_models = {}
cwru_models = {}

def load_nasa_models():
    """Load NASA models (XGBoost, Random Forest, Scaler)"""
    global nasa_models
    try:
        models_dir = settings.NASA_MODELS_DIR
        nasa_models['scaler'] = joblib.load(models_dir / 'scaler.pkl')
        nasa_models['xgboost'] = joblib.load(models_dir / 'xgboost_model.pkl')
        nasa_models['random_forest'] = joblib.load(models_dir / 'random_forest_model.pkl')
        print("✅ NASA models loaded successfully")
        return True
    except Exception as e:
        print(f"❌ Error loading NASA models: {e}")
        return False

def load_cwru_models():
    """Load CWRU models (CNN, Label Encoder)"""
    global cwru_models
    try:
        models_dir = settings.CWRU_MODELS_DIR
        # Try to import TensorFlow/Keras only if needed
        try:
            import tensorflow as tf
            cwru_models['cnn'] = tf.keras.models.load_model(models_dir / 'cwru_cnn_model.h5')
        except ImportError:
            print("⚠️ TensorFlow not installed, skipping CNN model")
            cwru_models['cnn'] = None
        cwru_models['label_encoder'] = joblib.load(models_dir / 'label_encoder.pkl')
        print("✅ CWRU models loaded successfully")
        return True
    except Exception as e:
        print(f"❌ Error loading CWRU models: {e}")
        return False

def get_nasa_model(name='xgboost'):
    if name not in nasa_models:
        raise ValueError(f"Model '{name}' not loaded. Available: {list(nasa_models.keys())}")
    return nasa_models[name]

def get_cwru_model(name='cnn'):
    if name not in cwru_models:
        raise ValueError(f"Model '{name}' not loaded. Available: {list(cwru_models.keys())}")
    return cwru_models[name]
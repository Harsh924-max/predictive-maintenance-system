import numpy as np
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import NASAPredictionSerializer, CWRUPredictionSerializer
from .model_loader import get_nasa_model, get_cwru_model

# ─── NASA Views ────────────────────────────────────────────────

class NASAHealthView(APIView):
    def get(self, request):
        return Response({
            'status': 'healthy',
            'models': ['xgboost', 'random_forest']
        })

class NASAPredictView(APIView):
    def post(self, request):
        serializer = NASAPredictionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Order must match the training features exactly
        feature_order = [
            'cycle', 'op_setting_1', 'op_setting_2',
            'sensor_2', 'sensor_3', 'sensor_4', 'sensor_6',
            'sensor_7', 'sensor_8', 'sensor_9',
            'sensor_11', 'sensor_12', 'sensor_13', 'sensor_14', 'sensor_15',
            'sensor_17', 'sensor_20', 'sensor_21',
            'engine_age', 'sensor_2_roll', 'sensor_2_diff'
        ]
        
        features = np.array([data[s] for s in feature_order]).reshape(1, -1)
        scaler = get_nasa_model('scaler')
        scaled = scaler.transform(features)
        
        model_name = data.get('model_type', 'xgboost')
        model = get_nasa_model(model_name)
        
        # --- Handle both classifier and regressor ---
        if hasattr(model, 'predict_proba'):
            # Classifier: get probability of failure (class 1)
            prob = model.predict_proba(scaled)[0][1]
        else:
            # Regressor: predict RUL, then convert to failure probability
            rul = model.predict(scaled)[0]               # Remaining Useful Life
            # Use a sigmoid on negative RUL (higher RUL => lower failure probability)
            # Adjust scale based on your dataset (typical RUL range)
            scale = 100.0   # you may need to tune this
            prob = 1.0 / (1.0 + np.exp(rul / scale))
            prob = np.clip(prob, 0.0, 1.0)
        
        pred = int(prob >= 0.5)
        return Response({
            'status': 'success',
            'model_used': model_name,
            'prediction': pred,
            'probability': round(prob, 4),
            'message': 'Failure' if pred else 'Normal'
        })

# ─── CWRU Views ────────────────────────────────────────────────
import numpy as np
import pandas as pd
from scipy.io import loadmat
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class CWRUHealthView(APIView):
    def get(self, request):
        return Response({
            'status': 'healthy',
            'models': ['cnn']
        })


class CWRUPredictView(APIView):

    def post(self, request):

        uploaded_file = request.FILES.get('file')

        if not uploaded_file:
            return Response(
                {'error': 'No file uploaded'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            filename = uploaded_file.name.lower()

            # CSV
            if filename.endswith('.csv'):
                df = pd.read_csv(uploaded_file)
                vibration = df.values.flatten()

            # Excel
            elif filename.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(uploaded_file)
                vibration = df.values.flatten()

            # NPZ
            elif filename.endswith('.npz'):
                data = np.load(uploaded_file)

                first_key = list(data.keys())[0]
                vibration = data[first_key].flatten()

            # MAT
            elif filename.endswith('.mat'):
                mat = loadmat(uploaded_file)

                keys = [
                    k for k in mat.keys()
                    if not k.startswith('__')
                ]

                vibration = mat[keys[0]].flatten()

            else:
                return Response(
                    {'error': 'Unsupported file format'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # CNN input size
            vibration = vibration[:1024]

            if len(vibration) < 1024:
                vibration = np.pad(
                    vibration,
                    (0, 1024 - len(vibration))
                )

            input_data = vibration.reshape(
                1,
                32,
                32,
                1
            )

            model = get_cwru_model('cnn')

            probs = model.predict(input_data)

            pred_class = int(
                np.argmax(probs, axis=1)[0]
            )

            label_encoder = get_cwru_model(
                'label_encoder'
            )

            pred_label = label_encoder.inverse_transform(
                [pred_class]
            )[0]

            return Response({
                'status': 'success',
                'prediction': pred_class,
                'prediction_label': pred_label,
                'confidence': round(
                    float(np.max(probs)),
                    4
                )
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
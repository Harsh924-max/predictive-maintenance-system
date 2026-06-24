from rest_framework import serializers

class NASAPredictionSerializer(serializers.Serializer):
    cycle = serializers.FloatField(required=True)
    op_setting_1 = serializers.FloatField(required=True)
    op_setting_2 = serializers.FloatField(required=True)
    sensor_2 = serializers.FloatField(required=True)
    sensor_3 = serializers.FloatField(required=True)
    sensor_4 = serializers.FloatField(required=True)
    sensor_6 = serializers.FloatField(required=True)
    sensor_7 = serializers.FloatField(required=True)
    sensor_8 = serializers.FloatField(required=True)
    sensor_9 = serializers.FloatField(required=True)
    sensor_11 = serializers.FloatField(required=True)
    sensor_12 = serializers.FloatField(required=True)
    sensor_13 = serializers.FloatField(required=True)
    sensor_14 = serializers.FloatField(required=True)
    sensor_15 = serializers.FloatField(required=True)
    sensor_17 = serializers.FloatField(required=True)
    sensor_20 = serializers.FloatField(required=True)
    sensor_21 = serializers.FloatField(required=True)
    engine_age = serializers.FloatField(required=True)
    sensor_2_roll = serializers.FloatField(required=True)
    sensor_2_diff = serializers.FloatField(required=True)

    model_type = serializers.ChoiceField(
        choices=['xgboost', 'random_forest'],
        default='xgboost',
        required=False
    )


class CWRUPredictionSerializer(serializers.Serializer):
    vibration_data = serializers.ListField(
        child=serializers.FloatField(),
        required=True,
        allow_empty=False
    )
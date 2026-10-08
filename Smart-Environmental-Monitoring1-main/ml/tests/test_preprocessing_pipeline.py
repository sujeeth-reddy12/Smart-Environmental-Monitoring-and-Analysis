import pandas as pd

from ml.training.preprocessing_pipeline import build_preprocessor, prepare_training_frame


def test_prepare_training_frame_and_preprocessor():
    df = pd.DataFrame(
        {
            "City": ["Delhi", "Delhi", "Mumbai", "Mumbai", "Delhi"],
            "Date": ["2020-01-01", "2020-01-02", "2020-01-01", "2020-01-02", "2020-01-03"],
            "PM2.5": [35.0, None, 28.0, 30.0, 40.0],
            "PM10": [60.0, 62.0, 55.0, None, 65.0],
            "NO2": [25.0, 27.0, None, 29.0, 31.0],
            "AQI": [110.0, 115.0, 95.0, 100.0, 120.0],
        }
    )

    prepared = prepare_training_frame(df)

    assert "City" in prepared.columns
    assert prepared["Date"].dtype.kind in {"M"}
    assert prepared["PM2.5"].notna().all()
    assert prepared["PM10"].notna().all()
    assert prepared["AQI"].notna().all()

    preprocessor = build_preprocessor(prepared)
    transformed = preprocessor.fit_transform(prepared)

    assert transformed.shape[0] == len(prepared)

import pandas as pd
import numpy as np
import joblib

from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor

from sklearn.metrics import mean_absolute_error
from sklearn.metrics import mean_squared_error
from sklearn.metrics import r2_score
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


BASE_DIR = Path(__file__).resolve().parent.parent

DATASET = BASE_DIR / "datasets" / "ml_ready_dataset.csv"

df = pd.read_csv(DATASET)

print("=" * 60)
print("AI-BASED SMART ENVIRONMENTAL MONITORING")
print("MODEL DEVELOPMENT AND COMPARISON")
print("=" * 60)

X = df.drop("AQI", axis=1)
y = df["AQI"]
feature_columns = X.columns.tolist()

print("\nDataset Shape:", df.shape)
print("Features:", X.shape[1])
print("Target: AQI")

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

print("\nTraining samples:", X_train.shape[0])
print("Testing samples:", X_test.shape[0])

# Models
models = {
    "Linear Regression": LinearRegression(),

    "Decision Tree": DecisionTreeRegressor(
        random_state=42
    ),

    "Random Forest": RandomForestRegressor(
        n_estimators=100,
        random_state=42,
        n_jobs=-1
    )
}

results = []

for name, model in models.items():

    print("\n" + "-" * 60)
    print("Training:", name)
    print("-" * 60)

    pipeline = Pipeline(
        steps=[
            ("preprocessor", Pipeline(
                steps=[
                    ("imputer", SimpleImputer(strategy="median")),
                    ("scaler", StandardScaler()),
                ]
            )),
            ("model", model),
        ]
    )
    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)

    mae = mean_absolute_error(
        y_test,
        predictions
    )

    rmse = np.sqrt(
        mean_squared_error(
            y_test,
            predictions
        )
    )

    r2 = r2_score(
        y_test,
        predictions
    )

    results.append({
        "Model": name,
        "MAE": mae,
        "MSE": mean_squared_error(y_test, predictions),
        "RMSE": rmse,
        "R2": r2
    })

    models[name] = pipeline

    print("MAE :", round(mae, 2))
    print("RMSE:", round(rmse, 2))
    print("R2  :", round(r2, 4))


# Comparison table
results_df = pd.DataFrame(results)

results_df = results_df.sort_values(
    by=["R2", "RMSE", "MAE"],
    ascending=[False, True, True]
)

print("\n")
print("=" * 60)
print("MODEL COMPARISON")
print("=" * 60)

print(
    results_df.to_string(
        index=False,
        formatters={
            "MAE": "{:.2f}".format,
            "MSE": "{:.2f}".format,
            "RMSE": "{:.2f}".format,
            "R2": "{:.4f}".format
        }
    )
)

# Save comparison
OUTPUT_DIR = BASE_DIR / "outputs"
OUTPUT_DIR.mkdir(exist_ok=True)

results_df.to_csv(
    OUTPUT_DIR / "model_comparison.csv",
    index=False
)

print("\nComparison table saved to:")
print(OUTPUT_DIR / "model_comparison.csv")

best_model = results_df.iloc[0]["Model"]
best_pipeline = models[best_model]
best_pipeline.fit(X, y)

# Persist the selected fitted pipeline and the metadata needed at prediction time.
joblib.dump(best_pipeline, OUTPUT_DIR.parent / "models" / "aqi_model.pkl")
joblib.dump(best_pipeline.named_steps["preprocessor"], OUTPUT_DIR.parent / "models" / "preprocessor.pkl")
joblib.dump(feature_columns, OUTPUT_DIR.parent / "models" / "feature_columns.pkl")
joblib.dump(
    {
        "features": feature_columns,
        "target": "AQI",
        "problem_type": "regression",
        "selected_model": best_model,
        "metrics": results_df.to_dict(orient="records"),
    },
    OUTPUT_DIR.parent / "models" / "feature_info.pkl",
)

print("\nSelected model after metric comparison:", best_model)
print("Saved model artifacts to:", OUTPUT_DIR.parent / "models")

print("\nModel evaluation completed successfully.")
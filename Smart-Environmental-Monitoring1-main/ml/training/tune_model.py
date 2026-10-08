import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.model_selection import GridSearchCV

from sklearn.ensemble import RandomForestRegressor

from sklearn.metrics import r2_score

# Load dataset
df = pd.read_csv("datasets/ml_ready_dataset.csv")

X = df.drop("AQI", axis=1)
y = df["AQI"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

rf = RandomForestRegressor(random_state=42)

param_grid = {

    "n_estimators": [100, 200],

    "max_depth": [10, 20, None],

    "min_samples_split": [2, 5],

    "min_samples_leaf": [1, 2]

}

grid = GridSearchCV(

    estimator=rf,

    param_grid=param_grid,

    cv=3,

    scoring="r2",

    n_jobs=-1

)

print("Training... Please wait.\n")

grid.fit(X_train, y_train)

best_model = grid.best_estimator_

predictions = best_model.predict(X_test)

score = r2_score(y_test, predictions)

print("="*50)
print("BEST PARAMETERS")
print("="*50)

print(grid.best_params_)

print("\nBest R² Score:", score)
import joblib

joblib.dump(best_model, "models/best_aqi_model.pkl")
joblib.dump(list(X.columns), "models/feature_names.pkl")

print("\n✅ Best model saved successfully!")
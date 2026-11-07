# Machine Learning for Material Handling

!!! info "Updated to manuscript V3"

    The review frames ML for formulation SDLs around **surrogate models plus acquisition functions**: active learning [\[134\]](../references.md#ref-134), Bayesian optimization [\[135\]](../references.md#ref-135) (e.g. BoTorch [\[136\]](../references.md#ref-136)) and, for small problems, simplex methods [\[151\]](../references.md#ref-151). Examples: viscous pipetting [\[11\]](../references.md#ref-11), powdered-beverage reconstitution [\[42\]](../references.md#ref-42), and nine commercial liquid formulations found in 15 working days with a classifier plus multi-objective BO [\[137\]](../references.md#ref-137). See [Data & Decision Models](data-and-decisions.md).

## Overview

Machine learning enables systems to learn from past experience and generalize to new, unseen materials. Key applications: predicting optimal parameters, classifying materials, adapting control strategies.

---

## Learning Paradigms

### Supervised Learning (Most Common)

Train a model with labeled examples: (input, target_output) pairs.

**Application:** Predict pump speed from measured viscosity

```
Input: viscosity (cP)  →  Output: optimal pump speed (rpm)

Training data:
  1 cP    → 80 rpm
  2 cP    → 78 rpm
  5 cP    → 70 rpm
  10 cP   → 60 rpm
  50 cP   → 40 rpm
  100 cP  → 30 rpm

Model: learns a function f(viscosity) → speed
Test: on new material with 8 cP, predict speed ≈ 65 rpm ✓
```

### Unsupervised Learning

Find patterns in unlabeled data.

**Application:** Cluster powder types by flowability

```
Input: [particle_size, density, moisture] (no labels)

Clustering result:
  Cluster 1: Large, dense, dry   → free-flowing
  Cluster 2: Fine, light, moist  → cohesive

New powder: measure properties → assign to Cluster 1 → use high-speed auger
```

### Reinforcement Learning

Learn by trial-and-error; agent takes actions and receives rewards/penalties.

**Application:** Optimize gripper finger positions to maximize grasp stability

```
State: object shape, gripper position
Action: adjust finger position by ±1 mm
Reward: grasp stability (1 = success, 0 = slip)

Agent: learns policy π(state) → best_action through 1000s of trials
```

---

## Regression Models (Continuous Output)

Predict a continuous value (speed, pressure, position).

### Linear Regression

Simplest model: output is linear in input.

$$
y = a + b \, x
$$

**Pros:** Fast, interpretable, needs few examples (5–10)

**Cons:** Fails for nonlinear relationships

**Example:** Viscosity → pump speed

```
from sklearn.linear_model import LinearRegression
X = [[1], [2], [5], [10], [50], [100]]  # viscosity (cP)
y = [80, 78, 70, 60, 40, 30]  # optimal speed (rpm)

model = LinearRegression()
model.fit(X, y)
predicted_speed = model.predict([[8]])  # viscosity = 8 cP
# Output: 64.2 rpm (reasonable)
```

### Polynomial Regression

Allow curved relationship: \(y = a + bx + cx^2 + \ldots\)

**Pros:** Fits nonlinear data better

**Cons:** Overfits if degree too high; less interpretable

**Example:** Pressure vs. extrusion rate (nonlinear yield stress effect)

```
from sklearn.preprocessing import PolynomialFeatures
X = [[50], [100], [150], [200]]  # pressure (kPa)
y = [0.1, 0.4, 1.0, 1.9]  # flow rate (mL/s) [nonlinear!]

poly = PolynomialFeatures(degree=2)
X_poly = poly.fit_transform(X)

model = LinearRegression()
model.fit(X_poly, y)
predicted_flow = model.predict(poly.transform([[120]]))
# Captures nonlinearity better than linear
```

### Neural Networks (Deep Learning)

Black-box nonlinear model; very flexible.

**Pros:** Learns complex patterns; generalizes well with enough data

**Cons:** Needs 100–1000 training examples; hard to interpret; prone to overfitting

**Example:** Powder properties → optimal auger speed

```
import tensorflow as tf
from tensorflow.keras import layers

# Input: [particle_size, density, moisture, friction]
# Output: [auger_speed, confidence]

model = tf.keras.Sequential([
    layers.Dense(64, activation='relu', input_shape=(4,)),
    layers.Dense(32, activation='relu'),
    layers.Dense(1, activation='linear')
])

model.compile(optimizer='adam', loss='mse')
model.fit(X_train, y_train, epochs=50, validation_split=0.2)

predicted_speed = model.predict([[15, 1.5, 0.05, 0.6]])[0]
```

### Gaussian Process Regression

Probabilistic model; gives prediction + uncertainty.

**Pros:** Provides confidence bounds; works with small datasets (20–100)

**Cons:** Slow for large datasets; harder to integrate into real-time control

**Example:** Identify if new powder is "well-understood" or "novel"

```
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, ConstantKernel as C

kernel = C(1.0, (1e-3, 1e3)) * RBF(1.0, (1e-2, 1e2))
gp = GaussianProcessRegressor(kernel=kernel, n_restarts_optimizer=10)

gp.fit(X_train, y_train)
y_pred, sigma = gp.predict(X_test, return_std=True)

# If sigma > 0.5 rpm, prediction is uncertain; use feedback control instead
```

---

## Classification Models (Categorical Output)

Predict a class (powder type, defect present/absent, strategy to use).

### Decision Trees & Random Forests

Simple rule-based model.

**Pros:** Interpretable, fast training and inference, handles nonlinearity

**Cons:** Prone to overfitting (shallow) or slow (deep)

**Example:** Classify powder flowability

```
from sklearn.ensemble import RandomForestClassifier

# Input features
X = [
    [10, 1.2, 0.02],  # particle size (µm), density (g/cm³), moisture (%)
    [100, 1.5, 0.05],
    # ... 20 more examples ...
]

# Target classes
y = ['free-flowing', 'cohesive', 'free-flowing', 'cohesive', ...]

rf = RandomForestClassifier(n_estimators=50, max_depth=5)
rf.fit(X, y)

new_powder = [15, 1.3, 0.03]
predicted_class = rf.predict([new_powder])  # 'free-flowing'
```

### Support Vector Machines (SVM)

Linear or kernel-based classifier.

**Pros:** Works well in high dimensions; robust to outliers

**Cons:** Slow for large datasets; sensitive to scaling

**Example:** Defect detection (crack vs. intact tablet)

```
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler

# Input: tactile signature [contact_force, curvature, stiffness]
X = [[2.5, 0.8, 150], [2.6, 0.75, 145], [1.2, 2.0, 50], ...]
y = ['intact', 'intact', 'cracked', ...]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

svm = SVC(kernel='rbf', C=1.0)
svm.fit(X_scaled, y)

new_tablet = scaler.transform([[2.4, 0.82, 148]])
prediction = svm.predict(new_tablet)  # 'intact'
```

---

## Training Pipeline

### 1. Collect Data

Gather (input, target) pairs from real experiments or simulation.

**Minimum examples:** 10–20 (linear regression), 50–100 (tree-based), 500+ (neural networks)

```
Material Type | Viscosity (cP) | Optimal Speed (rpm) | Result (g)
-------------|----------------|-------------------|----------
Liquid A     | 1.2            | 80                | 5.00 ± 0.05
Liquid B     | 3.5            | 75                | 4.98 ± 0.03
Liquid C     | 50             | 40                | 5.02 ± 0.08
...
```

### 2. Split into Train/Validation/Test

- **Training set (70%):** Use to fit model parameters
- **Validation set (15%):** Use to tune hyperparameters (learning rate, tree depth, etc.)
- **Test set (15%):** Use to estimate generalization performance

### 3. Preprocess Data

Normalize or scale inputs if they have different units/ranges:

```
# Example: features are [viscosity (1–1000 cP), temp (20–40°C)]
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)  # Mean 0, std 1

# Train model on scaled data
model.fit(X_scaled, y)

# When predicting new data, scale it too
new_data_scaled = scaler.transform(new_data)
prediction = model.predict(new_data_scaled)
```

### 4. Train Model

Fit parameters to minimize loss (mean squared error, cross-entropy, etc.).

```
model = RandomForestRegressor(n_estimators=100)
model.fit(X_train, y_train)
```

### 5. Evaluate

Measure generalization error on validation and test sets:

$$
\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^N (y_i - \hat{y}_i)^2}
$$

$$
\text{R}^2 = 1 - \frac{\sum_i (y_i - \hat{y}_i)^2}{\sum_i (y_i - \bar{y})^2}
$$

```
y_pred_val = model.predict(X_val)
rmse = np.sqrt(np.mean((y_val - y_pred_val)**2))
print(f"RMSE on validation set: {rmse:.3f} rpm")
```

### 6. Hyperparameter Tuning

Adjust model hyperparameters (tree depth, learning rate, etc.) to minimize validation error.

```
from sklearn.model_selection import GridSearchCV

param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [3, 5, 10],
    'min_samples_split': [2, 5]
}

grid = GridSearchCV(RandomForestRegressor(), param_grid, cv=5)
grid.fit(X_train, y_train)

best_model = grid.best_estimator_
print(f"Best params: {grid.best_params_}")
```

### 7. Final Validation on Test Set

Evaluate on held-out test data to estimate real-world performance.

```
y_test_pred = model.predict(X_test)
test_rmse = np.sqrt(np.mean((y_test - y_test_pred)**2))
print(f"Test RMSE: {test_rmse:.3f} rpm")
print(f"Test R²: {model.score(X_test, y_test):.3f}")
```

---

## Deployment & Monitoring

### Integration into Control System

```
# Load trained model
import joblib
model = joblib.load('speed_predictor_model.pkl')

# In real-time control loop
for material in incoming_materials:
    viscosity = measure_viscosity(material)
    predicted_speed = model.predict([[viscosity]])[0]

    feeder.set_speed(predicted_speed)
    actual_result = run_dispensing()

    # Log for future retraining
    log_data(viscosity, predicted_speed, actual_result)
```

### Monitoring Model Performance

Track prediction error over time:

```
Week 1: avg error = 1.2 rpm (good)
Week 2: avg error = 1.5 rpm (acceptable)
Week 3: avg error = 2.8 rpm (degradation!)
  → Investigate: viscosity sensor drifted? Material changed?
  → Retrain model or recalibrate sensor
```

### Retraining Schedule

- **Weekly:** Check prediction errors; flag if drift detected
- **Monthly:** Retrain on accumulated data if error > threshold
- **Quarterly:** Full pipeline review; check for domain shift

---

## Common Pitfalls

### 1. Overfitting

**Problem:** Model fits training data perfectly, but fails on new data

**Symptom:** Training RMSE = 0.1 rpm, test RMSE = 5 rpm

**Solution:**
- Use regularization (penalize complexity)
- Increase training data
- Reduce model complexity (shallower tree, smaller network)

### 2. Domain Shift

**Problem:** Model trained on water; deployed on organic solvents; accuracy drops

**Solution:**
- Train on diverse materials (not just one family)
- Monitor prediction confidence; use fallback strategy if uncertain

### 3. Insufficient Training Data

**Problem:** Trained on 5 examples; model is random noise

**Solution:**
- Collect 50+ examples for tree-based models
- Use simulation data if real data is scarce
- Use transfer learning (pre-train on related task)

### 4. Ignoring Sensor Noise

**Problem:** Model trained on "perfect" simulated data; real sensors are noisy; model's performance degrades

**Solution:**
- Train on noisy data (add Gaussian noise to simulation)
- Use robust loss functions (e.g., Huber loss instead of MSE)

---

## Implementation Checklist

- [ ] Define prediction task (input features, output target)
- [ ] Collect training data (50–500 examples, depending on method)
- [ ] Exploratory data analysis (plot features vs. output, look for patterns)
- [ ] Preprocess: normalize, handle missing values, outliers
- [ ] Split: 70% train, 15% val, 15% test
- [ ] Select model (linear? tree? neural net?)
- [ ] Train on training set
- [ ] Tune hyperparameters using validation set
- [ ] Evaluate on test set
- [ ] Check for overfitting; regularize if needed
- [ ] Integrate into control software
- [ ] Monitor performance in production
- [ ] Retrain quarterly or if error drifts

---

## References

- Rastegardoost, M. M.; Bao, Z.; Sadr, S.; Abdollahi, N.; Darvish, K.; Clasky, A.; Ohsaka, H.; Le Devedec, F. *Self-Driving Laboratories for Formulation: Handling Liquids, Pastes, Powders and Objects, from Robots to Digital Twins and AI Agents.* Manuscript in preparation, 2026.
- Key references from the review: [\[11\]](../references.md#ref-11), [\[28\]](../references.md#ref-28), [\[38\]](../references.md#ref-38), [\[42\]](../references.md#ref-42), [\[134\]](../references.md#ref-134), [\[135\]](../references.md#ref-135), [\[136\]](../references.md#ref-136), [\[137\]](../references.md#ref-137), [\[151\]](../references.md#ref-151). Full list on the [References](../references.md) page.

### Further reading (from the earlier wiki)

- Hastie, T., Tibshirani, R., & Friedman, J. (2009). *The Elements of Statistical Learning* (2nd ed.). Springer.
- Bishop, C. M. (2006). *Pattern Recognition and Machine Learning*. Springer.
- Goodfellow, I., Bengio, Y., & Courville, A. (2016). *Deep Learning*. MIT Press.
- Scikit-learn documentation: https://scikit-learn.org/
- TensorFlow/Keras documentation: https://www.tensorflow.org/

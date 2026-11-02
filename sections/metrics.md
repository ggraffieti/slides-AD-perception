<!-- .slide: class="section-slide" -->

# Measuring perception

A leaderboard is not a driver's license.

---

## Detection and tracking metrics

- **AP / mAP:** precision–recall across classes and thresholds
- **NDS:** nuScenes mAP plus translation, scale, orientation, velocity, attributes
- **mAP / mAPH:** Waymo detection with heading-aware quality
- **AMOTA / ID errors:** tracking quality and association consistency
- Slice by distance, object size, class, occlusion, weather, and time of day
- Averages can hide exactly the rare cases that matter

---

## Occupancy and mapping metrics

- **IoU / mIoU:** overlap per semantic class
- **RayIoU:** evaluates first-surface consistency along rays
- Distinguish **free**, **occupied**, and **unobserved/unknown**
- **Vector-map AP:** match polylines within distance thresholds
- **Topology metrics:** score lane links and traffic-element associations

<div class="callout takeaway"><span class="tag">Metric design</span><p class="mini">If the metric ignores visibility, the model may be punished for refusing to hallucinate behind a truck.</p></div>

---

## Forecasting metrics

- **minADE<sub>K</sub>:** best average displacement error among K modes
- **minFDE<sub>K</sub>:** best final displacement error
- **Miss rate:** fraction outside an endpoint tolerance
- **Brier / NLL / calibration:** whether probabilities mean what they claim

<div class="warning">Best-of-K can reward “spray and pray”: generate many modes and hope one is close.</div>

---

## System KPIs

- **Latency:** include pre-processing and post-processing
- **Throughput:** sustain required sensor rates
- **Memory and power:** measure on target hardware
- **Graceful degradation:** test dropout, corruption, and misalignment
- **Calibration:** compare confidence with observed error
- **Safety slices:** near field, vulnerable road users, and rare events

<p class="thought">The planner cannot brake for a high mIoU score.</p>

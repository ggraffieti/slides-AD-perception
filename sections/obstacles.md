<!-- .slide: class="section-slide" -->

# Task 1 — Obstacles
### Detect · localize · classify · persist

---

## What is object detection?

- **2D:** image-space boxes, class, confidence
- **3D:** center <span class="math-inline">(x, y, z)</span>, size <span class="math-inline">(l, w, h)</span>, and yaw <span class="math-inline">θ</span>—7 numbers in the ego frame, plus class and confidence
- Often extended with velocity <span class="math-inline">(v<sub>x</sub>, v<sub>y</sub>)</span>, attributes, and uncertainty
- Must handle scale, occlusion, truncation, crowded scenes, and long range

<img class="diagram strip fragment" src="./img/OD.jpg" alt="Six nuScenes camera views with annotated 3D boxes for cars and pedestrians plus same boxes on BEV map">

<div class="source fragment">Figure from <a href="https://arxiv.org/abs/2510.10287v1">Käppeler et al., arXiv preprint (2025)</a></div>

---

## Classic detection: one box per object

- **Faster R-CNN (2015)**: two stages. Anchors propose candidate boxes, then a second head classifies and refines each one
- **YOLO (2016)**: one stage. Divide the image into a grid and predict the boxes in a single forward pass
- **SSD (2016)**: the same one-stage idea on feature maps at several scales, so small and large objects share one network
- All three emit many overlapping boxes. Non-maximum suppression then keeps a single box per object

<div class="source fragment">
  <a href="https://arxiv.org/abs/1506.01497">Faster R-CNN — Ren et al., NIPS 2015</a> ·
  <a href="https://arxiv.org/abs/1506.02640">YOLO — Redmon et al., CVPR 2016</a> ·
  <a href="https://arxiv.org/abs/1512.02325">SSD — Liu et al., ECCV 2016</a>
</div>

---

## DETR: a fixed set of queries

- **A fixed output**: the decoder has N queries, and every query predicts a class and a box on every image. The COCO model uses N = 100
- **One object, one query**: Hungarian matching finds the pairing with the lowest total cost. A pair costs how wrong the class is plus how wrong the box is, and each object is given to a single query
- **Queries left over**: with fewer objects than queries, the extras are trained to predict “no object”, and inference discards them
- **The limit**: with more objects than queries, one object gets no query and is missed. N is chosen larger than the crowds in the training set

<div class="thought fragment">The queries are interchangeable. The assignment decides who takes which object, and that one-to-one rule is what keeps the set free of duplicates.</div>

<div class="source fragment"><a href="https://arxiv.org/abs/2005.12872">DETR — Carion et al., ECCV 2020</a></div>

Note:
The thought on the slide is the whole point. Do not derive the matching cost. If someone asks how the assignment is computed, the formula is on the hidden slide after this one.

---

## DETR architecture

<img class="diagram wide" src="./img/detr-arch.png" alt="DETR architecture: a CNN backbone, a transformer encoder, a decoder fed by object queries, and prediction heads that output a class and a box or no object">

<p class="mini muted">Object queries enter the decoder. Each head emits a class and a box, or “no object”.</p>

<div class="source">Architecture figure: <a href="https://arxiv.org/abs/2005.12872">Carion et al., ECCV 2020</a></div>

---

<!-- .slide: class="hidden-slide" -->
## Why Hungarian matching matters

<div class="equation">σ̂ = arg min<sub>σ</sub> Σ<sub>i</sub> L<sub>match</sub>(y<sub>i</sub>, ŷ<sub>σ(i)</sub>)</div>

- Assign each ground-truth object to one prediction
- Unmatched queries learn the “no object” class
- Removes ambiguous many-to-one supervision
- Inspired a family of query-based detectors, trackers, and map models

<div class="thought fragment">Queries are reusable slots, not tiny object templates waiting at fixed locations.</div>

---

## 3D detection: from DETR to multiple cameras

- **LiDAR baseline (CenterPoint)**: encode the sweep into BEV, predict a heatmap of object centers, then regress size, yaw, and velocity
- **DETR3D**: each query holds a 3D reference point, projected into every camera to sample image features
- **PETR**: adds 3D position embeddings to image features, so plain global attention knows the camera geometry
- **StreamPETR**: carries object queries from frame to frame—temporal memory at almost no extra cost

<p class="thought fragment">Same trick each time: a query asks the cameras where its 3D point appears.</p>

<div class="source fragment">
  <a href="https://arxiv.org/abs/2006.11275">CenterPoint — CVPR 2021</a> ·
  <a href="https://arxiv.org/abs/2110.06922">DETR3D — CoRL 2021</a> ·
  <a href="https://arxiv.org/abs/2203.05625">PETR — ECCV 2022</a> ·
  <a href="https://arxiv.org/abs/2303.11926">StreamPETR — ICCV 2023</a>
</div>

---

## Tracking: keeping identities over time

- **Tracking-by-detection**: detect every frame, predict each track forward (Kalman filter), then match tracks to detections with Hungarian assignment
- A simple baseline (AB3DMOT) remains surprisingly competitive
- **Query-based tracking (MOTR-style)**: a track query follows its object across frames; fresh detection queries catch newcomers
- Tracks provide identity, velocity, and history—exactly what forecasting consumes
- Typical failures: identity switches in crowds, lost tracks under occlusion, ghost tracks from false positives

<div class="equation fragment">predict x̂<sub>t</sub> = F x<sub>t−1</sub> &nbsp;→&nbsp; Hungarian match to detections &nbsp;→&nbsp; Kalman update</div>

<div class="source fragment">
  <a href="https://arxiv.org/abs/1907.03961">AB3DMOT — Weng et al., IROS 2020</a> ·
  <a href="https://arxiv.org/abs/2105.03247">MOTR — Zeng et al., ECCV 2022</a>
</div>

Note:
An identity switch is a car that teleports, as far as the forecaster is concerned. That is why this slide exists before motion forecasting. AB3DMOT is the baseline worth remembering: detect, predict, match. Query tracking is the same idea with the query kept alive across frames.

---
<!-- .slide: class="no-fragments" -->
## Try it yourself: detection & tracking

- **Datasets:** [KITTI](https://www.cvlibs.net/datasets/kitti/), [BDD100K](https://bdd-data.berkeley.edu/), [nuScenes](https://www.nuscenes.org/nuscenes) (start with nuScenes-mini: 10 scenes), [Waymo Open](https://waymo.com/open/)
- **Toolkits:** [MMDetection3D](https://github.com/open-mmlab/mmdetection3d), [OpenPCDet](https://github.com/open-mmlab/OpenPCDet), [nuScenes devkit](https://github.com/nutonomy/nuscenes-devkit)
- **Colab-sized:** fine-tune a pretrained [RT-DETR](https://arxiv.org/abs/2304.08069) or [Deformable DETR](https://arxiv.org/abs/2010.04159)—both converge far faster than the original DETR—on a small BDD100K subset
- **Evaluation idea:** compare day/night or near/far AP
- **Extension:** add a Kalman-filter tracker, temporal consistency, or calibration-error sensitivity

Note:
Do not narrate this. It is for them to read, or to leave up while you take a question. The same is true of the later "try it yourself" slides. If you are short on time, name the dataset and move on.

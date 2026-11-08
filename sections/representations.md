<!-- .slide: class="section-slide" -->

# Representing the scene

<img class="diagram wide" src="./img/representations.svg" data-light-src="./img/representations-light.svg" alt="Image to BEV, occupancy, objects and maps">

---

## Image space, BEV, and point clouds

- **Image space**
  - Dense color and texture, but scale shrinks with depth and near objects hide the rest
  - A pixel is a direction, not a distance
- **BEV space**
  - A top-down grid fixed to the ego vehicle, with one cell size at every range
  - Can be 2D (cell-based) or 3D (voxel-based), depending on the task
  - The shared frame for cameras, LiDAR, maps, and planning
- **Point clouds**
  - Irregular 3D samples, already in meters, with no grid and no natural order
  - Sparse, and sparser with range: hundreds of LiDAR points on a car at 10 m, often fewer than five past 50 m. Radar stays near one return per object

<div class="source fragment"><a href="https://arxiv.org/abs/1903.11027">nuScenes — Caesar et al., CVPR 2020</a> (supplementary)</div>

---

## What each one looks like

<div class="output-grid three">

<div>
<b>Image space</b>
<img src="./img/rep-image.jpg" alt="Front camera of a city intersection, with 3D boxes drawn in perspective">
<small>Near cars fill the frame. The crosswalk, just as real, is a thin band of pixels.</small>
</div>

<div>
<b>BEV space</b>
<img src="./img/rep-bev.jpg" alt="Top-down grid of lanes and drivable area">
<small>A top-down grid: lanes and drivable surface, the same meters per cell near and far.</small>
</div>

<div>
<b>Point cloud</b>
<img src="./img/rep-points.jpg" alt="One LiDAR sweep seen from above, dense near the vehicle and sparse farther out">
<small>One sweep from above. Dense rings nearby, thin returns in the distance.</small>
</div>

</div>

<div class="source">Image and LiDAR: <a href="https://arxiv.org/abs/1903.11027">nuScenes — Caesar et al., CVPR 2020</a>. BEV grid: <a href="https://arxiv.org/abs/2205.13542">BEVFusion — Liu et al., ICRA 2023</a>. Three different drives.</div>

---

## Bird’s-eye view (BEV)

- Image space has no meters, and a point cloud has no grid. BEV is the metric grid both can share
- It is where the sensors meet: cameras arrive through a view transform, LiDAR and radar through pillars or voxels
- In that grid a vehicle keeps its true size at 10 m and at 50 m, so distance and motion compare directly
- It is the representation of choice for most of the tasks ahead: detection, tracking, mapping, and forecasting. Occupancy keeps a 3D volume

<div class="thought fragment">BEV is not a task. It is the coordinate system the other tasks share.</div>

---

## From point clouds to BEV

- **Point-based (PointNet)**: a shared MLP per point, then a symmetric pooling, so the output ignores point order
- **Voxels + sparse convolution (VoxelNet, SECOND)**: quantize space and convolve only where voxels are occupied
- **Pillars (PointPillars)**: collapse height into vertical columns, producing a 2D BEV pseudo-image for an ordinary CNN
- Most LiDAR detectors end in BEV—so BEV becomes the natural meeting point for cameras too

<div class="equation fragment">f(x<sub>1</sub>, …, x<sub>N</sub>) = γ( max<sub>i</sub> h(x<sub>i</sub>) ) — same answer for any ordering of the points</div>

<div class="source fragment">
  <a href="https://arxiv.org/abs/1612.00593">PointNet — CVPR 2017</a> ·
  <a href="https://arxiv.org/abs/1711.06396">VoxelNet — CVPR 2018</a> ·
  <a href="https://www.mdpi.com/1424-8220/18/10/3337">SECOND — Sensors 2018</a> ·
  <a href="https://arxiv.org/abs/1812.05784">PointPillars — CVPR 2019</a>
</div>

---

## From perspective to BEV: the view transform

- **Inverse perspective mapping (IPM)**: assume a flat ground and warp the image with a homography—fine for lane paint, wrong for anything above the road
- **Lift-Splat (forward projection)**: predict a depth distribution per pixel, lift features along each ray, and splat them into BEV cells
- **BEV queries (backward projection)**: each BEV cell projects 3D reference points into the cameras and pulls the features it needs

<div class="equation fragment">lift: f(u, v, d) = α<sub>d</sub>(u, v) · c(u, v) — c(u, v) is the feature vector at that pixel, α a softmax over D depth bins</div>

<p class="thought fragment">The hard part is always depth: a pixel is a ray, not a point.</p>

<div class="source fragment">
  <a href="https://arxiv.org/abs/2008.05711">Lift, Splat, Shoot — Philion & Fidler, ECCV 2020</a> ·
  <a href="https://arxiv.org/abs/2203.17270">BEVFormer — Li et al., ECCV 2022</a>
</div>

---

## BEVFormer: camera features → BEV queries

- **BEV queries**: one learned vector per cell, each responsible for a fixed (x, y) around the ego vehicle
- **Spatial cross-attention**: the cell projects into the cameras that can see it and samples image features at several heights
- **Temporal self-attention**: ego motion brings the previous BEV into the current frame, and each cell attends to its location there
- **One grid, two heads**: 3D boxes and the map are both read out of this BEV

Note:
This is backward projection in practice. Deformable attention keeps the cost manageable: each BEV query samples only a few points around its projected reference points (the quadratic-cost problem from the refresher).

---
## BEVFormer architecture

<img class="diagram" src="./img/bevformer-arch.png" alt="BEVFormer architecture: multi-camera features, spatial cross-attention, and temporal self-attention">

<div class="source"><a href="https://arxiv.org/abs/2203.17270">BEVFormer — Li et al., ECCV 2022</a></div>

---

## BEVFormer in action

<video class="diagram" data-autoplay muted loop playsinline src="./videos/bevformer-demo.mp4"></video>

<p class="mini muted">Six cameras in, one BEV out: 3D boxes in the BEV (left) and projected back into each camera (right).</p>

<div class="source">Demo video: <a href="https://github.com/fundamentalvision/BEVFormer">fundamentalvision/BEVFormer</a></div>

---

## Voxel space

- **Voxel** = pixel in (quantized) 3D space
  - The fundamental unit (quanta) of 3D space
  - Typically represented as cubes, but other representations are used, inlcuding spheres, cylinders, etc.
- Typically used with point cloud data
- **Depth prediction** is usually performed explicitly to convert flat image data to voxel space 
- There exists 3D versions of many 2D view transformers

---
<!-- .slide: class="no-fragments" -->

## Voxel Space

<img class="diagram" src="./img/Occ.png" alt="Visualization of a voxel grid representing occupancy">

<div class="source">Image from: <a href="https://dl.acm.org/doi/10.1145/3838726">Wang et al., ACM Computing Surveys (2026)</a></div>
---
<!-- .slide: class="hidden-slide" -->

## Four complementary outputs

- **Object sets** — boxes, classes, velocities, tracks
- **Occupancy fields** — free, occupied, semantic, unknown
- **Vector maps** — lanes, boundaries, topology
- **Future distributions** — possible motions and probabilities

<p class="fragment thought">No representation is complete. Boxes are compact; occupancy sees arbitrary shapes; graphs express connectivity.</p>

---

## Perception tasks

- **Entities (Boxes)** — detection and tracking
- **Fields (Grid)** — segmentation, free space, occupancy
- **Structure (Graph)** — mapping, topology, association
- **Futures (Distribution)** — motion forecasting and occupancy flow
- **Cross-cutting** — multitask learning, with planning in the loop

<div class="callout takeaway fragment"><span class="tag">Structure</span><p class="mini">We will analyze each task through its output, architecture idea, failure modes, datasets, and small project ideas.</p></div>

Note:
This is the menu for the rest of the talk. Name the four outputs and move on. Each of the next sections is one of them.

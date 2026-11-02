<!-- .slide: class="section-slide" -->

# Task 2 — Fields and occupancy
### What boxes cannot describe

---

## Segmentation and free space

- **Semantic segmentation:** assign a class to every pixel or BEV cell
- **Instance/panoptic segmentation:** separate individual objects
- **Free space:** where the ego vehicle can physically move without collision
- **Drivable area:** free space constrained by road rules and semantics

<div class="callout activity fragment"><span class="tag">Important distinction</span><p class="mini">An empty sidewalk may be free of obstacles, but it is not necessarily drivable.</p></div>

<div class="callout quiz fragment"><span class="tag">Quick quiz</span><p class="mini">Is the opposite lane, if no vehicle is present, free space? Is it drivable area?</p></div>

Note:
Free space: yes, nothing is there to hit. Drivable area: no, the lane direction forbids it. The sidewalk in the callout above is the same split from the other side. Wait for an answer before you give this one.

---

## 3D semantic occupancy

- Predict every voxel as free, occupied, unknown, or a class such as road, sidewalk, or vehicle
- Holds the shapes a box cannot: cones, curbs, debris, and the edge of a sidewalk
- Makes occlusion and visibility explicit: an unseen cell stays unknown instead of silently empty
- Costs memory and compute, and labeling every voxel is expensive

---

## Occupancy in action

<video class="diagram" data-autoplay muted loop playsinline src="./videos/surroundocc-demo.mp4"></video>

<p class="mini muted">Six cameras in (top left), semantic voxels out: road, sidewalk, vegetation, buildings, vehicles.</p>

<div class="source">Demo video: <a href="https://github.com/weiyithu/SurroundOcc">SurroundOcc — Wei et al., ICCV 2023</a></div>

---
<!-- .slide: class="hidden-slide" -->
## PanoOcc: a unified occupancy representation

- Camera-based 3D panoptic scene understanding
- Voxel queries aggregate multi-frame, multi-view image features
- Produces semantic occupancy and instance-aware outputs
- Good example of replacing separate dense tasks with one spatial representation

<div class="source fragment"><a href="https://openaccess.thecvf.com/content/CVPR2024/html/Wang_PanoOcc_Unified_Occupancy_Representation_for_Camera-Based_3D_Panoptic_Segmentation_CVPR_2024_paper.html">PanoOcc — Wang et al., CVPR 2024</a></div>

---

## SparseOcc: efficiency changes the formulation

- Dense volumes spend most of their compute on empty air
- SparseOcc keeps about 5% of the voxels, the ones likely to be occupied, and sparse queries label only those
- **RayIoU** casts a ray and scores the class and depth of the first hit. Voxel mIoU can still look good when that surface is thick and at the wrong distance
- Seven past frames, cameras only: 34.0 RayIoU on Occ3D-nuScenes, at 17.3 FPS on an A100

<p class="thought fragment">A perfect representation that misses the real-time deadline is a very detailed description of the recent past.</p>

<div class="source fragment"><a href="https://arxiv.org/abs/2312.17118">SparseOcc — Liu et al., ECCV 2024</a></div>

---

## SparseOcc in the scene

<img class="diagram figure-tall" src="./img/sparseocc-viz.png" alt="Semantic occupancy comparison: two dense models predict thick surfaces, SparseOcc keeps a thin sparse surface close to the ground truth, including a traffic cone">

<p class="mini muted">Same scenes, top to bottom: two dense models, SparseOcc, and the ground truth. SparseOcc drops more than 90% of the voxels and still keeps the cone.</p>

<div class="source">Figure: <a href="https://arxiv.org/abs/2312.17118">Liu et al., ECCV 2024</a></div>

---

## Current, dynamic, and future occupancy

- **Now:** which voxels are filled, and by what: road, sidewalk, curb, cone, or vehicle
- **Motion:** which of those cells are moving, and how fast. A curb stays put; a cone in the lane may not
- **The next few seconds:** where the occupied cells will be
- Occupancy flow gives the cells a velocity, so debris gets a trajectory without ever becoming a box
- An unseen cell stays unknown in that forecast. Treating it as empty is a plan through whatever was hiding there

<div class="thought fragment">The grid can carry an obstacle you have not classified yet.</div>

Note:
Three questions on one grid: what is filled now, which of those cells are moving, and where they will be. The point of the thought is a cone or a mattress that never becomes a box and still gets a trajectory. An unknown cell is not an empty cell.

---
<!-- .slide: class="no-fragments" -->

## Try it yourself: occupancy & free space

- **Datasets:** [Occ3D-nuScenes](https://github.com/Tsinghua-MARS-Lab/Occ3D) (the grids in the videos), [SemanticKITTI](http://www.semantic-kitti.org/) (LiDAR, over time), [OpenOccupancy](https://github.com/JeffWang987/OpenOccupancy)
- **Toolkits:** [SurroundOcc](https://github.com/weiyithu/SurroundOcc) and [SparseOcc](https://github.com/MCG-NJU/SparseOcc), both built on [MMDetection3D](https://github.com/open-mmlab/mmdetection3d)
- **Colab-sized:** label one camera frame as drivable, sidewalk, or obstacle, and compare it with the Occ3D grid of the same instant
- **Evaluation idea:** score the same prediction with voxel mIoU and with RayIoU. A thick surface can win the first and lose the second
- **Extension:** on one scene, compare a dense grid with SparseOcc: how many voxels each keeps, and whether the cone is still there

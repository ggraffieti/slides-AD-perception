<!-- .slide: class="section-slide" -->

# Multitask learning

One shared world, many sensors, many outputs

---
<!-- .slide: class="hidden-slide" -->
## Where should sensor fusion happen?

<div class="fusion-levels">
  <div><b>Early</b><small>raw measurements</small></div>
  <div><b>Feature</b><small>image / point / BEV features</small></div>
  <div><b>Object</b><small>detections and tracks</small></div>
  <div><b>Decision</b><small>late agreement</small></div>
</div>

- Early fusion preserves information but needs tight alignment
- Late fusion is modular but may discard useful cross-modal cues
- Missing sensors and calibration errors must be part of training and testing

---
<!-- .slide: class="hidden-slide" -->
## BEVFusion: meet in a common space

- Camera and LiDAR features are independently encoded
- Cameras are lifted to BEV (Lift-Splat style), LiDAR is flattened to BEV, then the two are fused
- The common metric frame simplifies multi-task heads: 3D detection and map segmentation
- Real deployment question: what happens when one modality disappears?

<video class="diagram strip" data-autoplay muted loop playsinline src="./videos/bevfusion-demo.mp4"></video>

<div class="source"><a href="https://arxiv.org/abs/2205.13542">BEVFusion — Liu et al., ICRA 2023</a> · demo from <a href="https://github.com/mit-han-lab/bevfusion">mit-han-lab/bevfusion</a></div>

---

## Multitask learning

<div class="two-c-container">
  <div class="two-c-col">
    <h4>Why share?</h4>
    <ul><li>compute efficiency</li><li>shared geometry</li><li>richer supervision</li><li>Trained jointly, planning can use the latent space freely, in a way that serves the decision</li></ul>
  </div>
  <div class="two-c-col">
    <h4>Why not?</h4>
    <ul><li>negative transfer</li><li>loss balancing</li><li>coupled failures</li><li>Each task may pull that space in a different direction, leaving an embedding too weak for every task</li></ul>
  </div>
</div>

<div class="thought fragment">A shared backbone can learn common sense—or become the single point where every task fails together.</div>

---

## UniAD: planning-oriented integration

- Query-based interfaces connect tracking, mapping, motion prediction, occupancy, and planning
- Joint optimization makes downstream objectives visible upstream
- Influential research design, not proof that modular systems are obsolete
- Integration improves information flow but complicates diagnosis and safety evidence

<div class="source fragment"><a href="https://arxiv.org/abs/2212.10156">UniAD — Hu et al., CVPR 2023 Best Paper</a></div>

---

## UniAD pipeline

<img class="diagram wide" src="./img/uniad-arch.png" alt="UniAD pipeline: six cameras become a BEV, track and map queries read it, motion and occupancy queries consume those outputs, and the planner reads the ego query and the BEV">

<p class="mini muted">Queries pass forward. Tracks and the map feed motion, motion feeds occupancy, and the planner reads the ego query together with the BEV.</p>

<div class="source">Figure: <a href="https://arxiv.org/abs/2212.10156">Hu et al., CVPR 2023</a></div>

---

## UniAD in action

<video class="diagram" data-autoplay muted loop playsinline src="./videos/uniad-demo.mp4"></video>

<p class="mini muted">One network: tracked agents, predicted motion, occupancy, and the planned ego path (BEV, right) from six cameras.</p>

<div class="source">Demo video: <a href="https://github.com/OpenDriveLab/UniAD">OpenDriveLab/UniAD</a></div>

---

## PARA-Drive: parallel multitask learning

- Co-trains **online mapping**, **tracking + motion prediction**, **occupancy**, and **motion planning**
- Every task uses its own learnable queries over shared current and historical BEV features
- Modules run in parallel instead of forming a sequential dependency chain
- The planning head can run independently after training; other heads may run less frequently
- Reported nearly **3× faster** runtime while retaining interpretable task outputs

<div class="source fragment"><a href="https://openaccess.thecvf.com/content/CVPR2024/html/Weng_PARA-Drive_Parallelized_Architecture_for_Real-time_Autonomous_Driving_CVPR_2024_paper.html">PARA-Drive — Weng et al., CVPR 2024</a></div>

---

## PARA-Drive architecture

<img class="diagram figure-tall" src="./img/paradrive-arch.png" alt="PARA-Drive architecture: mapping, motion prediction, occupancy, and planning each have their own queries and read the same BEV features in parallel">

<p class="mini muted">Mapping, motion, occupancy, and planning each keep their own queries and read the same BEV. No head waits on another head's output.</p>

<div class="source">Figure: <a href="https://openaccess.thecvf.com/content/CVPR2024/html/Weng_PARA-Drive_Parallelized_Architecture_for_Real-time_Autonomous_Driving_CVPR_2024_paper.html">Weng et al., CVPR 2024</a></div>

Note:
One contrast is enough. UniAD is a chain: tracks and the map feed motion, motion feeds occupancy, the planner reads the result. PARA-Drive runs those same heads in parallel on one BEV, which is why it can drop heads at runtime and why a bad track does not have to poison the plan. Do not recap every block.

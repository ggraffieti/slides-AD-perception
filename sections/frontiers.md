<!-- .slide: class="section-slide" -->

# Frontiers

Simulation · world models · end-to-end · VLM, VLA, decisions

---

## Generative AI for simulation

- **Generative**: synthesize scenes, actors, weather, and sensor observations—target rare scenarios that are expensive or dangerous to collect
- **Reconstruction-based**: rebuild a recorded drive as an editable digital twin (NeRF, 3D Gaussian splatting), then move actors and the ego vehicle and re-render camera and LiDAR for closed-loop tests
- Edit an observed scene while preserving controllable factors
- Use synthetic data for training, validation, and stress testing

<div class="callout quiz fragment"><span class="tag">But</span><p class="mini">Photorealistic is not the same as physically correct, causally useful, or safety-representative.</p></div>

<div class="source fragment"><a href="https://arxiv.org/abs/2309.09777">DriveDreamer</a> · <a href="https://arxiv.org/abs/2309.17080">GAIA-1</a> · <a href="https://arxiv.org/abs/2308.01898">UniSim — CVPR 2023</a> · <a href="https://arxiv.org/abs/2401.01339">Street Gaussians — ECCV 2024</a></div>

---

## Generated conditions, one real clip

<video class="diagram wide" data-autoplay muted loop playsinline src="./videos/cosmos-weather.mp4"></video>

<p class="mini muted">One public dashcam clip. Cosmos-Drive-Dreams keeps the layout and generates other weather, a depth image, and an HD map.</p>

<div class="source"><a href="https://research.nvidia.com/labs/toronto-ai/cosmos_drive_dreams/">Cosmos-Drive-Dreams — Ren et al., NVIDIA</a></div>

---

## Generated from a control video

<video class="diagram wide" data-autoplay muted loop playsinline src="./videos/cosmos-control.mp4"></video>

<p class="mini muted">The left video is the only geometric input: lanes, one vehicle box, and a sign. Cosmos-Drive-Dreams paints the street, the car, and the stop sign from that control.</p>

<div class="source"><a href="https://research.nvidia.com/labs/toronto-ai/cosmos_drive_dreams/">Cosmos-Drive-Dreams — Ren et al., NVIDIA</a></div>

---

## A rare scene, generated

<video class="diagram wide" data-autoplay muted loop playsinline src="./videos/cosmos-cow.mp4"></video>

<p class="mini muted">Prompt: a cow runs across a forest road. Six cameras of that scene are synthesized together. This is the kind of event a fleet almost never logs.</p>

<div class="source"><a href="https://research.nvidia.com/labs/toronto-ai/cosmos_drive_dreams/">Cosmos-Drive-Dreams — Ren et al., NVIDIA</a></div>

Note:
This is the long tail, synthesized. Say so, then say the limit: a convincing cow is not a tested cow. Photorealistic, from two slides ago, is not physically correct and not a safety case.

---
## The world, as 3D Gaussians

<video class="diagram wide" data-autoplay muted loop playsinline src="./videos/gaussian-world.mp4"></video>

<p class="mini muted">WorldSplat’s second example, seen from above. A night intersection: the road, the buildings, and the vehicles, including a bus, are a cloud of 3D Gaussians.</p>

<div class="source"><a href="https://arxiv.org/abs/2509.23402">WorldSplat — Zhu et al., 2025</a> · <a href="https://wm-research.github.io/worldsplat/">project page</a></div>

---

## A recorded drive, rebuilt with Gaussians

<video class="diagram wide" data-autoplay muted loop playsinline src="./videos/driving-gaussian.mp4"></video>

<p class="mini muted">Same nuScenes scene, re-rendered. Left: one set of 3D Gaussians for the whole street, so moving cars smear. Right: DrivingGaussian keeps the static street and the moving objects apart.</p>

<div class="source"><a href="https://arxiv.org/abs/2312.07920">DrivingGaussian — Zhou et al., CVPR 2024</a> · clip from the <a href="https://pkuvdig.github.io/DrivingGaussian/">project page</a></div>

---

## Learned world models

<p class="fragment">Given the scene now, a world model predicts the scene a moment later.</p>

- **What it predicts:** pixels, a latent embedding, an occupancy grid, or depth and semantics. Pixels must match the image. A latent keeps a compact summary of the scene
- **Where the label comes from:** the next recorded observation. The sequence supervises itself
- **Why that is powerful:** a web video, a raw camera, or a LiDAR log is already a training example. Almost every recorded sequence can be used

---

## Drive-JEPA: predict the future in latent space

- A vision transformer is pretrained on front-camera video to predict the embedding of masked future frames. It does not reconstruct the pixels
- The pretraining set is about 330 hours of driving, cut into 8-frame clips at 2 Hz. The target embedding comes from a slowly updated copy of the same encoder
- A planner then reads those features and proposes many trajectories, anchored at waypoints, and refines them
- Each proposal is trained on the logged human path and on extra paths a simulator marks as safe and comfortable. One recorded drive is only one legal choice
- A scorer picks one proposal from collision risk, traffic rules, comfort, and agreement with the previous decision

<div class="source fragment"><a href="https://arxiv.org/abs/2601.22032">Drive-JEPA — Wang et al., 2026</a></div>

---

## Drive-JEPA architecture

<img class="diagram figure-tall" src="./img/drive-jepa-arch.png" alt="Drive-JEPA architecture: masked video pretraining with an EMA target encoder, multimodal trajectory distillation from simulator-scored vocabularies, waypoint-anchored proposal generation, and momentum-aware trajectory selection">

<p class="mini muted">Top left: the encoder learns by predicting the embedding of masked frames. Top right: the simulator turns a trajectory vocabulary into extra safe targets. Bottom: features in, proposals refined, one trajectory selected.</p>

<div class="source">Figure: <a href="https://arxiv.org/abs/2601.22032">Wang et al., 2026</a></div>

---

## DriveLaW: plan from the video latent

- **ELI5:** Two models share one hidden state. The first continues the driving video. The second never builds a bird’s-eye map: it reads that same state and writes the path
- **World model in latent space:** A video diffusion model predicts future scene dynamics directly in latent space, encoding layout, motion, and context without building explicit BEV features
- **Planning as trajectory diffusion:** An action diffusion model reads those video latents and directly generates multimodal future trajectories conditioned on high-level navigation commands
- **Staged co-training:** Video prediction and planning are trained in stages, preventing conflicting task gradients from degrading the shared latent representation

<div class="source fragment"><a href="https://openaccess.thecvf.com/content/CVPR2026/html/Xia_DriveLaW_Unifying_Planning_and_Video_Generation_in_a_Latent_Driving_CVPR_2026_paper.html">DriveLaW — Xia et al., CVPR 2026</a></div>

---

## DriveLaW architecture

<img class="diagram wide" src="./img/drivelaw-arch.png" alt="DriveLaW architecture: past frames and a text prompt enter video DiT blocks that predict future video, and action DiT blocks read the same video latents to decode the future trajectory">

<p class="mini muted">Top row: the video model continues the clip. Bottom row: the action model reads the video blocks’ latents, together with the command and ego status, and decodes the trajectory.</p>

<div class="source">Figure: <a href="https://openaccess.thecvf.com/content/CVPR2026/html/Xia_DriveLaW_Unifying_Planning_and_Video_Generation_in_a_Latent_Driving_CVPR_2026_paper.html">Xia et al., CVPR 2026</a></div>

---

## End-to-end driving

<img class="diagram wide transparent" src="./img/ad-stack-merged.svg" data-light-src="./img/ad-stack-merged-light.svg" alt="The autonomous-driving stack with localization, perception, prediction, and planning merged into one learned network">

- **Modular:** interpretable interfaces and local validation
- **End-to-end:** sensors in, trajectory out—joint optimization, but difficult diagnosis
- The real spectrum includes modular, jointly trained (UniAD, PARA-Drive), and fully end-to-end systems

Note:
Callback to the stack from the beginning: the overlapping circles were a hint. End-to-end is the limit where they merge into one network.

---

## EMMA: Waymo’s end-to-end model

- **Inputs:** Surround video, a router command, and the ego history. No HD map, no LiDAR
- **Text in, text out:** Waypoints and boxes are plain decimal text, so Gemini’s vocabulary is reused
- **Reason first:** Four sentences (scene, critical objects, behavior, decision) come before the path
- **One prompt per task:** “Detect every object in 3D” returns boxes; a road-graph prompt returns lanes. Same weights
- **Limits:** A few frames at a time, cameras only, and a heavy model

<div class="source fragment"><a href="https://arxiv.org/abs/2410.23262">EMMA — Hwang, Xu, et al., Waymo, 2024</a></div>

Note:
Cameras are the only sensor, and the path, boxes, and lanes are all text, so one language model emits them. The rationale is drafted by other models, then Gemini learns to say it before the waypoints. If someone asks about the nuScenes score, hold it: the evaluation slide is why that number is a weak trophy.

---

## EMMA architecture

<img class="diagram wide" src="./img/emma-arch.png" alt="EMMA overview: router command and camera video and ego status enter EMMA, built on Gemini, which outputs a driving rationale and ego future waypoints, plus spatial reasoning, road comprehension, and scene understanding">

<div class="source">Figure 1: <a href="https://arxiv.org/abs/2410.23262">Hwang, Xu, et al., Waymo, 2024</a></div>

Note:
Left to right: command, cameras, and ego status go in. The rationale comes out before the waypoints. The green row at the bottom is the same model with other prompts. Do not read the example sentences.

---

## How do we know an end-to-end driver is good?

- **Open-loop** (nuScenes): compare the planned path with the logged human path—cheap, but the car never sees the consequences
- On nuScenes, 73.9% of the data is straight driving; an MLP that sees only ego status (velocity, acceleration, yaw) matches state-of-the-art planners on L2 and collision rate
- **Non-reactive simulation** (NAVSIM): score progress, collisions, and comfort on real data over a short horizon
- **Closed-loop** (CARLA, Bench2Drive): the policy drives, and the world reacts

<p class="thought fragment">If a model ignoring every camera matches your planner, the benchmark is grading the speedometer.</p>

<div class="source fragment">
  <a href="https://arxiv.org/abs/2312.03031">Is Ego Status All You Need? — Li et al., CVPR 2024</a> ·
  <a href="https://arxiv.org/abs/2406.15349">NAVSIM — NeurIPS 2024</a> ·
  <a href="https://arxiv.org/abs/2406.03877">Bench2Drive — NeurIPS 2024</a>
</div>

Note:
Pause on the number. On nuScenes, 73.9% of the log is going straight, and an MLP that sees only speed, acceleration, and yaw matches published planners. Open-loop rewards imitating the log. Closed-loop is where the world answers back. NAVSIM sits between them.

---

## VLMs, VLAs, decision models, and open vocabulary

- **VLM:** connect visual features and language concepts
- **VLA:** condition actions on vision and language/instructions
- **Decision model:** score each offered choice with a probability. JEV reads the images and the text and answers in one pass
- **Open-vocabulary perception:** detect or segment from a text query, such as “fallen mattress” or “horse cart,” including obstacles that were never in the class list
- Potential: semantic reasoning, explainable interfaces
- Risks: hallucination, latency, weak grounding, unfaithful explanations

<div class="source fragment"><a href="https://arxiv.org/abs/2312.14150">DriveLM</a> · <a href="https://arxiv.org/abs/2410.23262">EMMA</a> · <a href="https://huggingface.co/autotrust/JEV-27B-VL">JEV</a></div>

---

## Research directions

- **Open world:** calibrated probabilities for novel objects and choices, with open-vocabulary models and JEV
- **Rare events and bad sensors:** Cosmos-Drive-Dreams for scenes the fleet never logs, then dirty lenses, dropped sensors, and new cities
- **Occupancy and maps:** faster occupancy with SparseOcc, and map changes with Neural Map Prior
- **Futures you can act on:** QCNet, Drive-JEPA, and DriveLaW, judged on what the action causes
- **End-to-end with evidence:** UniAD and PARA-Drive, scored on NAVSIM, and Bench2Drive where the world reacts

---
<!-- .slide: class="hidden-slide" -->
## Project ladder

- **Course project:** pretrained model + small dataset slice + one clear hypothesis
- **Strong project:** add temporal context, calibration, robustness, or a lightweight architecture change
- **Thesis with us:** occupancy efficiency, sensor degradation, topology, multimodal forecasting, or simulation-to-real validation

<p class="thought">Small and well-measured beats large and impossible to reproduce.</p>

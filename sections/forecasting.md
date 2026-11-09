<!-- .slide: class="section-slide" -->

# Task 4 — Motion forecasting
### The future is multimodal

---

## What are other agents likely to do?

- **Input:** agent history, map context, traffic state, interactions
- **Output:** multiple future trajectories and their probabilities
- Horizon matters: 1 second is control; 6+ seconds is intent and interaction
- Forecasting sits at the boundary between perception and planning
  - Some may argue that ego forecasting is actually planning from a different perspective.

---

## Why forecasting is important

<img class="diagram medium" src="./img/forecasting.svg" data-light-src="./img/forecasting-light.svg" alt="Ego stopped at a four-exit roundabout while a vehicle on the left may leave on the ego road, probability 0.40, stay in the circle, probability 0.35, or take the left exit, probability 0.25">

<div class="callout activity fragment"><span class="tag">Food for thought</span><p class="mini">Will you enter the roundabout or wait?<br>What is a threshold for probability you would mark as secure?<br>What is the cost of waiting?</p></div>

Note:
There is no secure threshold on this picture. 0.40, 0.35, and 0.25 are too close to treat the top mode as the future. Waiting also has a cost: you block the entrance. Use the answers to set up the next point, that one future is not enough.

---

## Forecasting inherits perception errors

- Benchmarks hand the model clean, curated tracks and an HD map
- In the car, inputs come from your own detector, tracker, and online map
- Missed detections, identity switches, and jittery headings become forecasting errors
- One motivation for joint training (UniAD, PARA-Drive): let forecasting losses shape perception features

<p class="thought fragment">Garbage in, multimodal garbage out.</p>

---

## Why one future is not enough

<div class="two-c-container">
  <div class="two-c-col">
    <h4>One trajectory, one place</h4>
    <ul>
      <li>The vehicle may take your lane, stay in the circle, or exit left</li>
      <li>Six seconds later those are three different positions</li>
      <li>A single output keeps one of them. The planner never sees the other two</li>
    </ul>
  </div>
  <div class="two-c-col">
    <h4>A useful model needs</h4>
    <ul>
      <li><strong>Diverse modes</strong> — the real maneuvers are in the set</li>
      <li><strong>Reasonable probabilities</strong> — 0.40 is heavier than 0.25</li>
      <li><strong>Social consistency</strong> — your move and theirs can happen together</li>
    </ul>
  </div>
</div>

---

## QCNet: encode the scene once, then the futures

- **Encode the scene once.** Each past position and each lane is stored in its own frame
- **Propose the futures.** Six queries walk forward step by step, so a distant exit and the next meter can attend to different parts of the map
- **Correct and score.** A second pass fixes those proposals and gives each one a probability
- **Encoder.** Lanes are MapTR-style polylines. Self- and cross-attention mix lanes, history, and cars, adding only the relative pose
- **Decoder.** Six learnable queries, one future each, as in DETR. Each query attends to the scene, then corrects its path and scores it

<div class="source fragment"><a href="https://openaccess.thecvf.com/content/CVPR2023/html/Zhou_Query-Centric_Trajectory_Prediction_CVPR_2023_paper.html">QCNet — Zhou et al., CVPR 2023</a></div>

---

## QCNet in the scene

<img class="diagram wide" src="./img/qcnet-scenes.gif" alt="QCNet on four Argoverse 2 intersections, one at a time, each with a fan of predicted futures">

<div class="source">Figure: <a href="https://github.com/ZikangZhou/QCNet">Zhou et al., CVPR 2023</a></div>

---

## Example of real-time forecasting

<video class="diagram wide" data-autoplay muted loop playsinline src="./videos/goirl-forecast.mp4"></video>

<div class="source"><a href="https://arxiv.org/abs/2506.21121">GoIRL — Pei et al., ICML 2025</a> · clip from the <a href="https://youtu.be/MPECgueGRaQ?t=178">supplementary video</a></div>

---

## Interaction is the hard part

- Agents react to one another and to the ego vehicle
- Independent predictions can be mutually impossible
- Joint prediction scales combinatorially with agents and modes
- The predictor can change behavior when coupled to a planner

<div class="callout quiz fragment"><span class="tag">Question</span><p class="mini">If six trajectories are predicted and one matches perfectly—but receives 30% probability—is that a good forecast?</p></div>

Note:
Intended answer: it depends on the metric, and that is the point. minADE/minFDE only look at the best of the six, so they call it perfect. Probability-aware metrics (Brier-minFDE, NLL) punish it, and so would a planner, which will treat a low-probability future as nearly impossible. The metrics slides are hidden, so make this point here.

---
<!-- .slide: class="no-fragments" -->
## Try it yourself: motion forecasting

- **Datasets:** [Argoverse 2 Motion Forecasting](https://www.argoverse.org/av2.html), [Waymo Motion](https://waymo.com/open/data/motion/)
- **Toolkits:** [av2 API](https://github.com/argoverse/av2-api) and the public [QCNet](https://github.com/ZikangZhou/QCNet) code
- **Colab-sized:** compare constant velocity, GRU, and a compact Transformer
- **Evaluation idea:** measure both displacement error and calibration
- **Extension:** add map context, interaction, or probability calibration

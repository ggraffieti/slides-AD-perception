<!-- .slide: class="section-slide" -->

# The autonomous-driving stack
<br>
<img class="diagram wide transparent" src="./img/ad-stack.svg" data-light-src="./img/ad-stack-light.svg" alt="Autonomous driving stack diagram">

Note:
Data flows left to right: sensors, localization and perception, prediction, planning, control, vehicle. The circles overlap on purpose: modern systems blur these boundaries (we will see UniAD and PARA-Drive later). The dashed arrow is the closed loop: the ego vehicle's actions change what other agents do, so prediction is never computed on a frozen world. This talk focuses on perception and touches prediction.

---

## Perception is the vehicle’s senses

<div class="two-c-container">
  <div class="two-c-col">
    <img class="diagram" src="./img/nuscenes-sensor-setup.jpg" alt="Top view of the nuScenes car with six cameras, one roof LiDAR, five radars, and an IMU">
  </div>
  <div class="two-c-col">
    <ul>
      <li><strong>Where</strong> everything is, in meters rather than pixels</li>
      <li><strong>What</strong> it is: vehicle, person, lane, or traffic light</li>
      <li><strong>How it moves</strong>, and that the same object stays the same object over time</li>
      <li><strong>What we cannot see</strong>, and how sure we are about the rest</li>
    </ul>
  </div>
</div>

<div class="source">Sensor setup of the nuScenes car — <a href="https://arxiv.org/abs/1903.11027">Caesar et al., CVPR 2020</a></div>

Note:
Perception is not only object detection. Use this slide to set the broad scope: static structure, dynamic agents, traffic controls, free space, and time. The nuScenes car is a typical research platform: 6 cameras for 360° coverage, 1 roof LiDAR, 5 radars, GNSS and IMU.

---
<!-- .slide: class="no-fragments" -->

## Sensors: there is no free lunch

<table class="sensor-table">
  <thead>
    <tr><th>Sensor</th><th>Typical range</th><th>Measures well</th><th>Main weaknesses</th><th>Cost</th></tr>
  </thead>
  <tbody>
    <tr><td><b>Camera</b></td><td>~150–250 m (optics-dependent)</td><td>color, texture, signs, lights, lanes</td><td>no direct depth; glare, night, blur, fog, rain</td><td>$</td></tr>
    <tr><td><b>LiDAR</b></td><td>~100–250 m</td><td>metric 3D geometry, cm-level range; 10–20 Hz</td><td>sparse at range; heavy rain, fog, snow</td><td>$$–$$$</td></tr>
    <tr><td><b>Radar</b></td><td>~200–300 m</td><td>direct radial (Doppler) velocity; works in fog and dark</td><td>coarse angle, few points, multipath “ghosts”</td><td>$</td></tr>
    <tr><td><b>Ultrasonic</b></td><td>~0.2–5 m</td><td>very-near obstacles at parking speed</td><td>tiny range, slow update</td><td>¢</td></tr>
    <tr><td><b>Thermal</b></td><td>~100–200 m</td><td>heat contrast: pedestrians and animals at night</td><td>low resolution and texture</td><td>$$</td></tr>
    <tr><td><b>GNSS / IMU</b></td><td>—</td><td>ego pose and motion (cm-level with RTK)</td><td>IMU drift; GNSS outage and multipath in cities and tunnels</td><td>$–$$</td></tr>
  </tbody>
</table>

<p class="mini muted">Typical automotive values; they vary widely by product and price.</p>

<p class="thought">Sensor fusion is less like voting and more like a group project: everyone brings different information—and different problems.</p>

---

## Same scene, three sensors

<iframe class="diagram" data-src="https://www.youtube.com/embed/ym-eRYplU8A?rel=0&modestbranding=1&mute=1" data-autoplay allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen title="Altos Radar and LiDAR point cloud comparison"></iframe>

<div class="source"><a href="https://www.youtube.com/watch?v=ym-eRYplU8A">Altos Radar — radar and LiDAR point cloud comparison</a>, Jan. 5, 2024</div>

<div class="callout quiz fragment"><span class="tag">Food for thought</span><p class="mini">If a camera recognizes a pedestrian but estimates poor depth, while LiDAR sees a shape but not its class—which sensor is “right”?</p></div>

Note:
The clip compares an Altos V1 4D radar with a Hesai AT128 LiDAR on one drive (South San Francisco Bay, Jan. 5, 2024). Radar points are drawn larger than LiDAR points. Point out how few radar returns there are, and that each one carries velocity, while LiDAR gives the geometry. Quiz answer: neither sensor alone. Each is right about a different property; fusion must keep the useful part of each and know which one to trust when they disagree.

---
<!-- .slide: class="hidden-slide" -->

## Radar is having a moment: 4D imaging radar

- **Conventional radar** measures range, azimuth, and Doppler velocity—but has poor elevation: is that return a bridge or a stopped truck?
- **4D imaging radar** adds elevation and much finer angular resolution through large virtual antenna arrays (MIMO)
- Denser, LiDAR-like point clouds that keep radar's strengths: velocity per point, weather robustness, low cost
- Still noisier and sparser than LiDAR; public datasets are recent and small

<div class="source"><a href="https://tudelft-iv.github.io/view-of-delft-dataset/">View-of-Delft — Palffy et al., RA-L 2022</a> · <a href="https://github.com/kaist-avelab/K-Radar">K-Radar — Paek et al., NeurIPS 2022</a></div>

---
<!-- .slide: class="no-fragments" -->

## What would you mount on the car?

<div class="callout poll">
  <span class="tag">Quick poll</span><span class="time">60s</span>
  <p class="mini">Design a perception suite for one scenario:</p>
  <ul class="mini">
    <li>urban robotaxi;</li>
    <li>highway truck;</li>
    <li>low-speed delivery robot.</li>
  </ul>
</div>

<p class="fragment thought">Now remove one sensor type. What becomes unobservable—or merely less reliable?</p>

Note:
Give them the minute. There is no correct suite. The useful question is the second one: drop one sensor and say what you can no longer see. Do not advance until a few people have answered. The next slide is the reveal.

---

## What the industry chose

- **Waymo (6th generation)**: 13 cameras, 4 LiDARs, 6 radars, and external microphones—redundancy across three modalities
- **Zoox**: 28 cameras, 16 LiDARs, 20 radars, plus thermal cameras and microphones—the same pod on all four corners, because the vehicle drives equally well in either direction
- **Tesla Vision**: cameras only—radar removed from 2021, ultrasonic sensors from 2022
- **nuScenes research car**: 6 cameras, 1 LiDAR, 5 radars, GNSS/IMU
- Same physics, different bets: cost, scale, operating domain, and how much risk the software must absorb

<div class="callout takeaway fragment"><span class="tag">Design rule</span><p class="mini">Choose sensors from the Operational Design Domain—not from a universal ranking.</p></div>

<div class="source fragment"><a href="https://waymo.com/blog/2024/08/meet-the-6th-generation-waymo-driver">Waymo, Aug 2024</a> · <a href="https://zoox.com/journal/perception">Zoox perception</a> · <a href="https://www.tesla.com/support/transitioning-tesla-vision">Tesla Vision transition</a> · <a href="https://arxiv.org/abs/1903.11027">nuScenes car — Caesar et al., CVPR 2020</a></div>

Note:
Reveal after the poll. Ask which of the three poll scenarios each choice fits best. Camera-only bets that learning can recover depth and robustness from data at fleet scale; multi-sensor bets on physical redundancy. Zoox is the extreme of that bet: a bidirectional vehicle, so each corner carries the same cameras, LiDAR, radar, thermal camera, and microphones. The 28/16/20 counts come from Zoox's published corner-pod layout.

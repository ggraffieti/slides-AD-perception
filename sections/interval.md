<!-- .slide: class="title-slide opening-slide" -->

# Deep Learning Perception
## for Autonomous Driving
<p style="margin: -0.75em 0 0.9em; font-size: 0.8em; font-style: italic; color: var(--muted);">Part 2</p>

**Gabriele Graffieti**

<span class="subtitle">Autonomous Driving and ADAS Technologies Seminar</span>

<div class="title-meta">
  <span>University of Parma</span>
  <span>Nov. 13, 2026</span>
</div>

<p style="margin: 1.75em 0 -0.8em; font-size: 0.8em; color: var(--muted);">You can find these slides at:</p>
<p><a href="https://ggraffieti.github.io/slides-AD-perception/">ggraffieti.github.io/slides-AD-perception</a></p>


Note:
Same opening card as last time, now marked Part 2. Leave the link up long enough for people to open the deck. The address is the full set of slides, including the first lesson.

---

## Recap of the previous episode

<div style="font-size: 0.9em;">

1. **The stack.** Perception only a part of the whole AD stack. No hard boundaries between tasks. Sensor types and what data they produce (raster vs points).
2. **Representations.** BEV (2D or 3D) as a common meeting space for all the sensors. From 3D points and images to BEV space. 
3. **Obstacles.** 2D and 3D object detectors (DETR). Classical and query-based tracking methods. 
4. **Occupancy.** Free space vs drivable area. Occupancy = 3D grid of free, occupied, and unknown.
5. **Mapping.** Lanes, boundaries, traffic elements and the links between them. Association as important as detection. 
6. **Forecasting.** Several futures and their probabilities, built on the tracks and the map.
7. **Attention is really all you need**. Everything is a transformer now.

</div>

Note:
One sentence per item is enough. Do not re-teach QCNet, MapTR, or BEVFormer. The point is to put the four tasks back on the table before multitask learning uses all of them.

---

## In this episode

- **Multitask**: UniAD and PARA-Drive, perception trained together with planning
- **Frontiers**: generative simulation, world models, end-to-end driving, VLMs, VLAs, and decision models

Note:
This is the index for today only. Multitask first, then frontiers. The close is the rearview and the windshield, not a new topic.

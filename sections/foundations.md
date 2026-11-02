<!-- .slide: class="section-slide" -->

# Four severe problems  
### that deserve lectures of their own

Calibration · synchronization · ego-motion · failure handling

---

## Calibration and coordinate frames

<div class="two-c-container">
  <div class="two-c-col">
    <h4>Intrinsics</h4>
    <p>How a camera maps rays to pixels.</p>
    <h4>Extrinsics</h4>
    <p>Rigid transforms between sensor, ego, and world frames.</p>
  </div>
  <div class="two-c-col">
    <h4>The danger</h4>
    <p>A small angular error becomes a large spatial error far away: 0.5° of yaw is ~0.44 m sideways at 50 m and ~0.9 m at 100 m.</p>
    <h4>The reality</h4>
    <p>Temperature, vibration, repairs, and time can change calibration.</p>
  </div>
</div>

<div class="equation">p<sub>ego</sub> = T<sub>sensor→ego</sub> · p<sub>sensor</sub></div>

---

## Time alignment, ego-motion, and failures

- Sensors expose data at different rates and latencies
- The car moves while a camera scans and a LiDAR rotates—one 10 Hz sweep spans 100 ms
- Past features must be warped into a common frame before temporal fusion
- Failure handling needs detection, degradation, and a safe fallback

<div class="failure-row fragment">
  <span>timestamp drift</span><span>rolling shutter</span><span>packet loss</span><span>occlusion</span><span>dirty lens</span>
</div>

<div class="callout activity fragment"><span class="tag">Take seriously</span><p class="mini">A 100 ms timing error at 90 km/h is 2.5 m of travel—what the car covers during one 10 Hz LiDAR sweep. “Almost synchronized” can be geometrically wrong in a drastic way.</p></div>

Note:
Do not teach calibration in depth here. Emphasize that every later architecture quietly assumes these foundations are sufficiently correct. Without motion compensation, the start and end of a single LiDAR sweep at highway speed disagree by meters.

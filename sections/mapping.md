<!-- .slide: class="section-slide" -->

# Task 3 — Mapping and topology
### From pixels to road structure

---

## How mapping is organized

- **Offline mapping:** survey the roads once, annotate a global map, and carry that file in the car
- **Localization:** estimate the ego pose in that map, so its lanes and lights land in the sensor frame
- **Online mapping:** perceive the local map from the sensors now, where the stored map is missing or wrong
- **Vectorized vs grid:** polylines and polygons a planner can follow, or a BEV raster a network paints. The same road can be stored as both
- **Association:** which lanes connect, and which light, sign, or rule governs which lane

---

## Maps can be of different types

- **HD map:** centimeter lanes, boundaries, crossings, signs, and lights, tied to a global frame. This is the offline map that localization reads
- **SD map:** the navigation graph, at the scale of roads rather than lanes. It says where the trip goes, not which lane to occupy
- **Topology map:** which lanes connect, and which signal controls which lane. It can be stored in the HD map or inferred on the spot
- **Online local map:** lanes and boundaries perceived now, in the ego frame, from the sensors alone

---
<!-- .slide: class="hidden-slide" -->

## Offline HD maps

- A survey fleet drives the roads. Annotators turn the logs into lanes, boundaries, crossings, signs, and lights in a global frame
- The file also carries the rules attached to that geometry: speed, turn restrictions, and which light owns which lane
- The car carries the file. Updating it means another survey and another annotation pass
- Construction, a new crosswalk, or a repainted lane leaves the car with a confident description of a road that is no longer there

<div class="thought fragment">A map is a prior, not a law of nature. Roads have the inconvenient habit of changing.</div>

---
<!-- .slide: class="hidden-slide" -->

## Localization on an HD map

- The HD map is in a global frame and the sensors are on the car. Localization is the pose that puts one into the other
- GNSS in a city is often meters off. A lane is only a few meters wide, so that error can select the wrong lane
- **LocNet** learns whether a live LiDAR sweep (or a camera image) matches a place in a previously built point-cloud map, then estimates the metric pose from range
- That pose lays the HD map’s lanes, lights, and topology into the ego frame. Online mapping, next, is for when the prior is missing or stale

<div class="source fragment"><a href="https://arxiv.org/abs/1712.02165">LocNet — Yin et al., IV 2018</a></div>

Note:
LocNet’s stored map is a 3D point cloud, not the vector lanes themselves. The pose it recovers is what makes the HD map readable in the ego frame. Do not describe it as matching lane polylines.

---
<!-- .slide: class="hidden-slide" -->

## LocNet architecture

<img class="diagram wide" src="./img/locnet-arch.png" alt="LocNet framework: LiDAR sweeps become fingerprints stored in a kd-tree, and a live sweep is matched, then refined by a particle filter and ICP">

<p class="mini muted">Map building stores LiDAR fingerprints. Localization retrieves a place, then a particle filter and ICP turn it into a pose.</p>

<div class="source">Architecture figure: <a href="https://arxiv.org/abs/1712.02165">Yin et al., IV 2018</a></div>

---

## Neural Map Prior: a map that keeps learning

- A global neural map, stored as sparse tiles, sits between a frozen HD file and a purely online prediction
- The local model cross-attends to the tile for this place, so an earlier traversal fills in what the current cameras cannot see
- A learned fusion step writes today’s features back into the tile. The prior gets stronger as the fleet repeats the same roads
- Bad weather and longer range are where it helps. A change no vehicle has observed yet is still missing from the tile

<div class="source fragment"><a href="https://arxiv.org/abs/2304.08481">Neural Map Prior — Xiong et al., CVPR 2023</a></div>

---

## Neural Map Prior architecture

<img class="diagram wide" src="./img/nmp-arch.png" alt="Neural Map Prior architecture: local BEV features cross-attend to prior map tiles, a GRU fuses them, and the result is written back into the global tile">

<p class="mini muted">Current BEV features query the stored tile. The fused map is written back for the next traversal.</p>

<div class="source">Architecture figure: <a href="https://arxiv.org/abs/2304.08481">Xiong et al., CVPR 2023</a></div>

---

## MapTRv2: a map as structured sets

- **Polylines, not pixels:** each lane, divider, crossing, and road boundary is an ordered list of points
- **Two query levels:** one query owns the element, and a set of point queries places the vertices along it
- **Either direction is valid:** a lane read left to right is the same lane read right to left, and the loss accepts both
- **One element, one prediction:** Hungarian matching gives each ground-truth polyline to a single query, as DETR did for boxes

<div class="source fragment"><a href="https://link.springer.com/article/10.1007/s11263-024-02235-z">MapTRv2 — Liao et al., IJCV 2025</a> · <a href="https://arxiv.org/abs/2308.05736">arXiv</a></div>

---

## MapTRv2 architecture

<img class="diagram figure-tall" src="./img/maptrv2-arch.png" alt="MapTRv2 architecture: camera or LiDAR features become a BEV, and hierarchical instance and point queries decode vector map elements">

<p class="mini muted">Cameras or LiDAR become a BEV. One query per map element, and one per point along it, decode the polylines.</p>

<div class="source">Architecture figure: <a href="https://arxiv.org/abs/2308.05736">Liao et al., IJCV 2025</a></div>

---

## Online mapping in action

<video class="diagram" data-autoplay muted loop playsinline src="./videos/maptr-demo.mp4"></video>

<div class="source">Demo video: <a href="https://github.com/hustvl/MapTR">hustvl/MapTR</a></div>

---

## Topology and traffic-control association

- Geometry alone does not say which lanes connect
- A traffic light must be linked to the lane(s) it controls
- A traffic sign is the same problem one step further: the rule has to be tied to the centerlines it governs
- Scene graphs encode lane ↔ lane and lane ↔ traffic-element relations
- Association errors can be more dangerous than small geometric errors

<div class="callout activity fragment"><span class="tag">Food for thought</span><p class="mini">What matters more, the map or the association? Would you rather have errors in the lanes, or a perfect lane tied to the wrong traffic light?</p></div>

<div class="source fragment"><a href="https://arxiv.org/abs/2304.10440">OpenLane-V2 — topology benchmark</a> · <a href="https://arxiv.org/abs/2410.23780">Driving by the Rules — Chang et al., CVPR 2025</a></div>

Note:
Leave this open. A wrong light-to-lane link is the error you feel first: you enter on red, or stop in a green lane. A missing or crooked lane is the error that removes the thing you would associate, which is the point of the next slide. OpenLane-V2 scores the links separately from the geometry. MapDR asks the same question for a sign's rule and the centerlines it governs.

---

## TopoMLP: detect first, then reason

- Topology reasoning = centerline detection + traffic-element detection + lane–lane and lane–traffic relations
- Key finding: topology scores depend mostly on detection quality—with frozen detectors, swapping in ground-truth topology adds little
- So: two strong detectors (3D lanes as Bézier curves, 2D traffic elements), then two small MLP heads that score every pair
- Simple and strong: 41.2 OLS on OpenLane-V2 with ResNet-50; winner of the first OpenLane Topology challenge

<p class="thought fragment">A traffic light you never detected cannot be associated with anything.</p>

<div class="source fragment"><a href="https://arxiv.org/abs/2310.06753">TopoMLP — Wu et al., ICLR 2024</a></div>

---

## TopoMLP in the scene

<img class="diagram wide" src="./img/topomlp-example.png" alt="TopoMLP lane-to-traffic association: prediction beside ground truth, with lines linking each lane to the traffic element that controls it">

<p class="mini muted">Front view, prediction beside ground truth. Each line ties a lane to the traffic element that controls it. Red is the prediction, green is the ground truth.</p>

<div class="source">Figure: <a href="https://arxiv.org/abs/2310.06753">Wu et al., ICLR 2024</a></div>

---
<!-- .slide: class="no-fragments" -->
## Try it yourself: mapping & topology

- **Datasets:** [Argoverse 2](https://www.argoverse.org/av2.html), [OpenLane-V2](https://github.com/OpenDriveLab/OpenLane-V2), nuScenes maps
- **Toolkits:** [MapTR](https://github.com/hustvl/MapTR) and [TopoMLP](https://github.com/wudongming97/TopoMLP) code, [av2 API](https://github.com/argoverse/av2-api)
- **Colab-sized:** extract lane centerlines from segmentation
- **Evaluation idea:** test polyline simplification or lane-link classification
- **Extension:** detect map changes or model traffic-light-to-lane association

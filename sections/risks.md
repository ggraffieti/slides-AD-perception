<!-- .slide: class="section-slide" -->

# Risks and hard problems

Perception fails in distributions, not only in averages.

---

## The long tail and the open world

- Rare objects: fallen cargo, unusual vehicles, animals, debris
- Rare combinations: glare + rain + construction + occlusion
- Unknown objects may not fit any training class
- Data collection naturally oversamples ordinary driving

<div class="callout activity fragment"><span class="tag">Food for thought</span><p class="mini">How many kilometers must we drive to observe an event that occurs once every 100 million kilometers—often enough to validate it?</p></div>

Note:
Intended answer: far more than 100 million. With zero failures, showing a rate below 1 per 100 million km at 95% confidence needs about 300 million failure-free km (rule of three); comparing against human drivers with statistical power needs billions. RAND's "Driving to Safety" (Kalra & Paddock, 2016) makes the same argument in miles. This is why simulation and scenario-based testing matter.

---

## Uncertainty, confidence, and bias

- Neural confidence is not automatically calibrated probability
- Epistemic uncertainty: the model lacks knowledge
- Aleatoric uncertainty: the scene itself is ambiguous
- Dataset geography, lighting, annotation, and demographic imbalance affect error rates
- A safe interface needs “I do not know” and measurable fallback behavior

---

## Corruption, domain shift, and silent failure

<div class="failure-row">
  <span>fog</span><span>glare</span><span>snow</span><span>dirty sensor</span><span>new city</span><span>sensor dropout</span>
</div>

- Cross-sensor misalignment can poison fusion instead of helping
- Temporal models can propagate one bad observation
- Shared multitask features can spread a failure across outputs
- Monitoring must detect changing data and changing error patterns

<div class="source"><a href="https://openaccess.thecvf.com/content/CVPR2023/html/Dong_Benchmarking_Robustness_of_3D_Object_Detection_to_Common_Corruptions_CVPR_2023_paper.html">nuScenes-C robustness benchmark — CVPR 2023</a></div>

---

## Offline accuracy ≠ closed-loop safety

- A detector metric weights errors differently from a planner
- Small map-topology errors can cause large route errors
- The planner may compensate for some perception mistakes—and amplify others
- Deployment changes the data distribution through feedback

<div class="warning">Necessary: strong offline metrics. Insufficient: claiming safe driving from offline metrics alone.</div>

Note:
Keep this section compact and perception-focused. The goal is critical thinking, not a second AI-safety lecture.

## Looking in the Rearview Mirror

1. **Obstacles.** Detect, localize, and classify, then keep the same identity over time.
2. **Occupancy.** A grid of free, occupied, and unknown space, including shapes that have no box.
3. **Mapping and topology.** Lanes, boundaries, and the links between them, from a stored map or from the cameras.
4. **Forecasting.** Several futures and their probabilities, built on the tracks and the map.
5. **End-to-end.** UniAD and PARA-Drive train those tasks with planning, up to sensors in and a trajectory out. Open-loop, NAVSIM, and closed-loop test different things.
6. **Left out today.** Task metrics, the long tail, uncertainty and bias, sensor corruption, and the distance between an offline score and a safe drive.

---

## Looking through the Windshield

<p class="fragment">Autonomous driving is unsolved. Today was a map of the field. Most of that map is still open.</p>

<ul>
  <li class="fragment"><strong>Still unanswered:</strong> the long tail, a sensor that fails quietly, a confidence you can trust, and a test in which the world reacts</li>
  <li class="fragment"><strong>Law and ethics too:</strong> who answers when the system is wrong, whose lives the data never included, and which risks the law will allow</li>
  <li class="fragment"><strong>Room to join:</strong> forecasting, world models, simulation, and end-to-end driving are all unfinished. The important results in this field are still ahead</li>
</ul>

Note:
Do not turn the second point into an ethics lecture. One example is enough: who pays when the detector is wrong, or a city that never appears in the training set. Then land on the last point. The field is unfinished, and it is not only a job for the people who build the networks.

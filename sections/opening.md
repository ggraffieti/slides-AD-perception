<!-- .slide: class="no-fragments" -->

## Who I am

<div class="two-c-container">
  <div class="two-c-col-l">
    <img class="speaker-avatar" src="./img/speaker-photo.jpg" alt="Portrait of Gabriele Graffieti">
  </div>
  <div class="two-c-col-r">
    <ul>
      <li>Sr. Algorithm Engineer @ <a href="https://www.ambarella.com">Ambarella</a>
        <ul>
          <li>Deep Learning & Computer Vision</li>
          <li>Perception team</li>
        </ul>
      </li>
      <li>Past researcher & PhD student @ <a href="https://www.unibo.it/en">University of Bologna</a></li>
      <li>Past Head of AI Research @ <a href="https://www.aiforpeople.org">AI for People</a></li>
      <li>Member of many AI/ML associations</li>
    </ul>
  </div>
</div>

---

## Outline

- **Foundations**: the autonomous-driving stack, sensors, and four hard problems
- **Representations**: images, point clouds, BEV, occupancy, and vectors
- **Core tasks**: detection and tracking, occupancy and free space, mapping and topology, motion forecasting
- **Multitask**: UniAD and PARA-Drive, perception trained together with planning
- **Frontiers**: generative simulation, world models, end-to-end driving, VLMs, VLAs, and decision models

---

<!-- .slide: class="no-fragments" -->
## Prerequisites

This talk assumes basic familiarity with:

- Vectors, matrices, tensors, and basic linear algebra
- Supervised learning, losses, and gradient descent
- Neural networks and convolutional neural networks
- Sequence models, attention, and Transformers

No prior knowledge of autonomous driving is required.

<div class="space-small"></div>

<div class="callout activity fragment" data-fragment-index="1">
  <span class="tag">Choose your path</span>
  <p class="mini">Need a quick refresher? Press <b>↓</b><br>Ready for autonomous driving? Press <b>→</b></p>
</div>

Note:
Say the choice out loud. Down is a short refresher and does not count in the slide total. Right skips it. Either answer is fine. Do not teach the refresher unless someone asks for it.

--
<!-- .slide: data-visibility="uncounted" class="optional-slide" -->

## Vectors, matrices, and tensors

<ul>
  <li class="fragment" data-fragment-index="0"><strong>Scalar</strong>: one value, such as a loss or learning rate</li>
  <li class="fragment" data-fragment-index="1"><strong>Vector</strong>: an ordered list, such as velocity or a feature embedding</li>
  <li class="fragment" data-fragment-index="2"><strong>Matrix</strong>: a 2D grid, such as a grayscale image or a linear transformation</li>
  <li class="fragment" data-fragment-index="3"><strong>Tensor</strong>: an <em>n</em>-dimensional array—the general container used by deep-learning frameworks</li>
</ul>

<div class="callout example fragment" data-fragment-index="4">
  <span class="tag">Example</span>
  <p class="mini">Surround-view video → 6D tensor:<br>batch × time × cameras × channels × height × width</p>
</div>

<div class="callout example fragment" data-fragment-index="5">
  <span class="tag">Not everything is a grid</span>
  <p class="mini">LiDAR sweep → N × 4 set of points (x, y, z, intensity):<br>no natural order, and N changes from sweep to sweep</p>
</div>
<p class="mini text-align-center fragment" data-fragment-index="6">How would you represent this data?</p>

--
<!-- .slide: data-visibility="uncounted" class="optional-slide" -->

## Neural Networks

- Built from artificial neurons: <span class="math-inline">h = σ(w<sup>T</sup>x + b)</span>
- Neurons side by side form a layer; stacking layers forms a (deep) neural network that learns a parameterized mapping <span class="math-inline">ŷ = f<sub>θ</sub>(x)</span> from examples
- Each layer transforms simple input features into increasingly meaningful representations
- Non-linear activations (Tanh, Sigmoid, ReLU, etc.) let stacked layers model complex functions
- Training chooses parameters <span class="math-inline">θ</span> (weights and biases) that minimize a task-specific loss: <span class="math-inline">θ<sup>*</sup> = arg min<sub>θ</sub> L(f<sub>θ</sub>(x), y)</span>

--
<!-- .slide: data-visibility="uncounted" class="text-align-center optional-slide" -->

<img class="diagram light-invert" src="./img/neural-network.png" style="height: 20em;" alt="Fully connected network with an input layer, one hidden layer, and an output layer">

--
<!-- .slide: data-visibility="uncounted" class="optional-slide" -->

## Backpropagation

<ul>
  <li class="fragment" data-fragment-index="0"><strong>Forward pass</strong>: compute predictions and the loss</li>
  <li class="fragment" data-fragment-index="1"><strong>Backward pass</strong>: apply the chain rule from the loss back through every operation</li>
  <li class="fragment" data-fragment-index="2"><strong>Gradients</strong>: measure how each parameter affects the loss</li>
  <li class="fragment" data-fragment-index="3"><strong>Optimizer step</strong>: update parameters in the direction that reduces the loss</li>
</ul>

<div class="equation fragment" data-fragment-index="4">∂L/∂w = ∂L/∂h · σ′(w<sup>T</sup>x + b) · x</div>

<div class="equation fragment" data-fragment-index="4">θ ← θ − η · ∂L / ∂θ</div>

--
<!-- .slide: data-visibility="uncounted" class="optional-slide" -->

## CNNs: why they fit images

- **Local receptive fields**: nearby pixels are strongly related, so each filter initially examines a small neighborhood
- **Growing context**: stacking layers expands the receptive field—from edges and textures to parts and complete objects
- **Weight sharing**: the same filter scans every position and can recognize a feature wherever it appears
- **Parameter efficiency**: a convolution uses <span class="math-inline">k² · C<sub>in</sub> · C<sub>out</sub></span> parameters, independent of image width and height
- **Translation equivariance**: shifting the input shifts the feature map instead of requiring the pattern to be relearned
- **Spatial output**: CNNs preserve feature maps, making them natural backbones for detection and segmentation


--
<!-- .slide: data-visibility="uncounted" class="text-align-center optional-slide" -->

<img class="diagram transparent light-invert" src="./img/cnn.png" alt="CNN pipeline: convolution and pooling layers extract features, then fully connected layers classify the image">

<div class="source">Figure: <a href="https://medium.com/towards-data-science/a-comprehensive-guide-to-convolutional-neural-networks-the-eli5-way-3bd2b1164a53">S. Saha, “A Comprehensive Guide to Convolutional Neural Networks,” Towards Data Science, 2018</a></div>

--
<!-- .slide: data-visibility="uncounted" class="optional-slide" -->

## RNNs: memory for sequences

- **Recurrent update**: process one step at a time while maintaining a memory of the past
- **Hidden state**: compress past observations into a memory passed to the next step <span class="math-inline">h<sub>t</sub> = f<sub>θ</sub>(x<sub>t</sub>, h<sub>t−1</sub>)</span>
- **Shared parameters**: reuse the same transformation at every time step
- **Perception uses**: combine track histories, trajectories, or successive sensor observations
- **Long-term memory**: vanilla RNNs suffer from vanishing or exploding gradients; LSTM/GRU add gates that control what to remember
- **Main limitation**: recurrence is sequential and difficult to parallelize, so temporal attention often replaces or complements it

--
<!-- .slide: data-visibility="uncounted" class="text-align-center optional-slide" -->

<img class="diagram transparent light-invert" src="./img/rnn.png" alt="A recurrent network folded on the left and unrolled over three time steps on the right">

<p class="mini muted">In the figure, <span class="math-inline">s<sub>t</sub></span> is the hidden state <span class="math-inline">h<sub>t</sub></span>; U, W, and V are shared at every step.</p>

<div class="source">Figure: <a href="https://commons.wikimedia.org/wiki/File:Recurrent_neural_network_unfold.svg">fdeloche, Wikimedia Commons</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a> (colors adapted)</div>

--
<!-- .slide: data-visibility="uncounted" class="optional-slide" -->

## Transformers: attention is all you need

<div class="equation">Attention(Q, K, V) = softmax(QK<sup>T</sup> / √d<sub>k</sub>) V</div>

- **Query = question**: what information am I looking for?
- **Key = description**: what does each candidate contain, and how relevant is it to the query?
- **Value = content**: the information retrieved from each candidate—not a judgment of how “valuable” it is
- **Attention weights**: compare the query with every key, then compute a weighted mixture of the values
- **Self-attention**: queries, keys, and values come from the same sequence
- **Cross-attention**: queries attend to another source, such as cameras, time steps, BEV cells, or object features

--
<!-- .slide: data-visibility="uncounted" class="text-align-center optional-slide" -->

<img class="diagram wide transparent" src="./img/attention-steps.svg" data-light-src="./img/attention-steps-light.svg" alt="Attention in four steps: project tokens to queries, keys, and values; score every query against every key; normalize each row with softmax; mix the values with those weights">

Note:
Walk through query 4: it matches key 5 best, so value 5 dominates output 4.

--
<!-- .slide: data-visibility="uncounted" class="optional-slide" -->

## Transformers: three details that matter later

- **Multi-head attention**: several attention operations run in parallel, each free to specialize in a different relation (appearance, geometry, motion)
- **Positional encoding**: attention by itself ignores order and position, so each token carries an explicit position—in driving, often a 3D position derived from camera geometry
- **Quadratic cost**: every query scores every key, so cost grows with <span class="math-inline">N<sub>q</sub> × N<sub>k</sub></span> ~ <span class="math-inline">O(N²)</span> for self-attention

<div class="callout example fragment">
  <span class="tag">Back of the envelope</span>
  <p class="mini">A 200 × 200 BEV grid = 40,000 queries; six 900 × 1600 cameras at stride 16 ≈ 34,000 keys<br>→ more than 10⁹ query–key pairs per layer. This is why driving models sample only a few points per query (deformable or sparse attention).</p>
</div>

--
<!-- .slide: data-visibility="uncounted" class="optional-slide" -->

## Vision Transformers: images as tokens

<ul>
  <li class="fragment" data-fragment-index="0"><strong>Patchify</strong>: split an <span class="math-inline">H × W</span> image into <span class="math-inline">P × P</span> patches, producing <span class="math-inline">N = HW / P²</span> tokens</li>
  <li class="fragment" data-fragment-index="1"><strong>Embed and locate</strong>: project each flattened patch into a feature vector and add positional information</li>
  <li class="fragment" data-fragment-index="2"><strong>Attend globally</strong>: from the first layer, each patch can exchange information with any other patch</li>
  <li class="fragment" data-fragment-index="3"><strong>Dense perception</strong>: hierarchical or windowed variants recover efficient multi-scale features for detection and segmentation</li>
</ul>

<div class="callout example fragment" data-fragment-index="4">
  <span class="tag">Compare with CNNs</span>
  <p class="mini">ViTs trade strong locality and translation biases for flexible global interactions, usually requiring more data or pretraining</p>
</div>

--
<!-- .slide: data-visibility="uncounted" class="text-align-center optional-slide" -->

<img class="diagram transparent" src="./img/vit.png" alt="Vision Transformer: image patches are linearly projected, combined with position embeddings, and processed by a Transformer encoder">

<div class="source">Figure: <a href="https://arxiv.org/abs/2010.11929">Dosovitskiy et al., “An Image Is Worth 16×16 Words,” ICLR 2021</a></div>

--
<!-- .slide: data-visibility="uncounted" class="optional-slide" -->

## Queries and set prediction

<ul>
  <li class="fragment" data-fragment-index="0"><strong>Query</strong>: a learnable slot that asks the model to find and describe one possible entity</li>
  <li class="fragment" data-fragment-index="1">Each query attends to scene features and predicts a structured item—or <strong>nothing</strong></li>
  <li class="fragment" data-fragment-index="2"><strong>Set output</strong>: prediction order has no meaning; only the collection of items matters</li>
  <li class="fragment" data-fragment-index="3"><strong>One-to-one matching</strong> assigns predictions to targets during training and discourages duplicate outputs (Hungarian matching)</li>
  <li class="fragment" data-fragment-index="4">The same abstraction can represent objects, lanes, tracks, agents, or possible trajectories</li>
</ul>

<div class="nav-hint fragment" data-fragment-index="5">Refresher complete — press → for the main talk</div>

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const chatLog = $("#chatLog");
const chatForm = $("#chatForm");
const chatInput = $("#chatInput");
const promptStrip = $("#promptStrip");
const testsModal = $("#testsModal");
const knowledgeModal = $("#knowledgeModal");

let lastIntent = "welcome";
let messageCount = 0;

const projectFacts = {
  maxLengthCm: 50,
  minimumRangeM: 6,
  safetyDistanceM: 4.6,
  bottleRetirementLaunches: "10–15",
  gravity: 9.81,
  airDensity: 1.225,
  assumedDiameterM: 0.105,
};

const topicLabels = [
  ["↗", "Projectile motion"], ["≈", "Aerodynamic drag"], ["◫", "Water volume"],
  ["◎", "Pressure & thrust"], ["⌁", "Stability"], ["✦", "Fin design"],
  ["△", "Nose geometry"], ["▣", "Materials"], ["✓", "Competition rules"],
  ["⚑", "Launch safety"], ["↺", "Prototype lessons"], ["◇", "Final design"],
  ["$", "Cost"], ["♻", "Sustainability"], ["⌕", "Testing method"],
  ["∑", "Calculations"], ["☁", "Wind effects"], ["⋯", "Future improvements"],
];

const knowledge = [
  {
    id: "welcome",
    keywords: ["hello", "hi", "hey", "start", "help", "hydroguide", "chatbot"],
    phrases: ["what can you do", "who are you"],
    answer: () => `
      <span class="answer-tag">Ready for launch</span>
      <p>Hello! I’m <strong>HydroGuide AI</strong>, your offline engineering assistant for the NGN 110 Water Rocket Challenge.</p>
      <p>I can explain the final design, compare alternatives, calculate ideal projectile values, suggest a test plan and summarize the handout’s safety rules.</p>
      <p>Try asking: <strong>“Why did we use four fins?”</strong></p>`,
  },
  {
    id: "requirements",
    keywords: ["requirement", "rule", "constraint", "qualify", "parameter", "limit", "competition", "handout"],
    phrases: ["how long", "maximum rocket length", "maximum length", "minimum distance", "project parameters", "competition rules"],
    answer: () => `
      <span class="answer-tag">Handout requirement</span>
      <p>The main design constraints are:</p>
      <ul>
        <li>Total length must be <strong>less than 50 cm</strong>, measured from nozzle to nose tip.</li>
        <li>The rocket must travel at least <strong>6 m horizontally</strong> to qualify.</li>
        <li>The competition uses the provided <strong>electric pump</strong>.</li>
        <li>Materials must be safe and non-hazardous; reused bottles, cardboard, plastic sheet, tape and glue are permitted.</li>
        <li>Winning performance is the longest qualifying horizontal distance while meeting every rule.</li>
      </ul>`,
  },
  {
    id: "final_design",
    keywords: ["final", "selected", "design", "rocket", "specification", "built", "ours"],
    phrases: ["final design", "selected design", "our rocket", "what did we build"],
    answer: () => `
      <span class="answer-tag">Selected configuration</span>
      <p>The final rocket uses a standard PET pressure bottle, a <strong>rounded head cut from a second bottle</strong>, four rigid corrugated-cardboard fins and a black duct-tape nose joint.</p>
      <p>It was selected because it stays below the 50 cm limit while balancing aerodynamic shape, stability, durability, low cost and simple construction. Its engineering decision score was <strong>4.75/5</strong>.</p>
      <p>The exact finished length and dry mass should be measured and recorded rather than estimated.</p>`,
  },
  {
    id: "nose",
    keywords: ["nose", "cone", "head", "cap", "pointed", "rounded", "aerodynamic"],
    phrases: ["remove the cone", "replace the cone", "bottle head", "rounded nose", "why no cone"],
    answer: () => `
      <span class="answer-tag">Design decision</span>
      <p>The long cone was removed because it made the prototype exceed 50 cm and crumpled during landing. The final recycled-bottle head gives a smooth rounded front without the cone’s extra length and weak structure.</p>
      <p>A perfect pointed cone may have slightly lower drag, but both shapes have nearly the same frontal area. At this project’s moderate speeds, the cone’s small theoretical advantage did not outweigh <strong>compliance, durability and repeatability</strong>. A bent or misaligned cone could even increase drag.</p>`,
  },
  {
    id: "fins",
    keywords: ["fin", "fins", "four", "4", "cardboard", "corrugated", "stabilizer", "straight"],
    phrases: ["why four fins", "fin design", "90 degrees", "four fins"],
    answer: () => `
      <span class="answer-tag">Stability system</span>
      <p>Four equal fins are spaced approximately <strong>90° apart</strong> near the nozzle. Their rear position moves the centre of pressure backward, helping it remain behind the centre of mass.</p>
      <p>That restoring effect keeps the nose pointing into the airflow. The prototype’s four-fin arrangement was already stable, so retaining it reduced design risk. Stiffer corrugated cardboard prevents fin bending that would otherwise cause turning and wasted range.</p>`,
  },
  {
    id: "stability",
    keywords: ["stability", "stable", "wobble", "spin", "straight", "center", "centre", "mass", "pressure", "balance", "swing"],
    phrases: ["center of pressure", "centre of pressure", "center of mass", "centre of mass", "fly straight"],
    answer: () => `
      <span class="answer-tag">Engineering principle</span>
      <p>A rocket is passively stable when its <strong>centre of pressure is behind its centre of mass</strong>. If it tilts, the airflow on the rear fins creates a restoring moment that turns the nose back toward the flight path.</p>
      <p>Check the completed rocket by locating its balance point and performing an instructor-approved swing test before pressurization. Do not assume stability from appearance alone.</p>`,
  },
  {
    id: "water",
    keywords: ["water", "fill", "volume", "amount", "liter", "litre", "ratio", "full", "empty"],
    phrases: ["how much water", "water level", "water volume", "fill ratio"],
    answer: () => `
      <span class="answer-tag">Test variable</span>
      <p>Water provides reaction mass, while the compressed air provides stored energy. Too little water gives a short impulse; too much water leaves too little compressed air and makes the rocket heavy.</p>
      <p>A sensible experimental starting range is roughly <strong>30–40% of bottle capacity</strong>, but the handout requires the team to select and justify the amount through testing. Keep pressure, launch angle and rocket design constant while changing only the water volume.</p>`,
  },
  {
    id: "pressure",
    keywords: ["pressure", "pump", "psi", "bar", "compress", "air", "thrust", "launch", "shoot"],
    phrases: ["how does it launch", "how much pressure", "electric pump", "launch mechanism"],
    answer: () => `
      <span class="answer-tag">Propulsion</span>
      <p>The electric pump compresses the air above the water. When the launcher releases the bottle, that air pushes water rapidly through the nozzle. The backward water momentum creates an equal and opposite thrust on the rocket.</p>
      <p>The handout does <strong>not</strong> state a numerical pressure limit, so HydroGuide will not invent one. Use only the instructor-provided pump, launcher and approved pressure procedure. Never approach or handle a pressurized rocket.</p>`,
  },
  {
    id: "drag",
    keywords: ["drag", "air", "resistance", "coefficient", "cd", "frontal", "area", "speed"],
    phrases: ["drag equation", "air resistance", "aerodynamic drag"],
    answer: () => `
      <span class="answer-tag">Aerodynamics</span>
      <p>A useful drag model is:</p>
      <span class="formula">F<sub>D</sub> = ½ρC<sub>D</sub>Av²</span>
      <p>Drag grows with frontal area, drag coefficient and the <strong>square of speed</strong>. Smooth joints, straight fins and a compact body therefore matter. Because all three concepts use a similar bottle diameter, reducing misalignment and exposed tape edges can be as important as changing the nose shape.</p>`,
  },
  {
    id: "range",
    keywords: ["range", "distance", "far", "projectile", "trajectory", "velocity", "speed", "angle"],
    phrases: ["range equation", "projectile motion", "minimum speed", "travel farther", "horizontal distance"],
    answer: () => `
      <span class="answer-tag">Ideal model</span>
      <p>Ignoring drag and assuming equal launch and landing heights:</p>
      <span class="formula">R = v₀² sin(2θ) / g</span>
      <p>At 45°, the theoretical speed needed for 6 m is <strong>7.67 m/s</strong>. The real rocket needs more because drag, wind and imperfect alignment reduce distance.</p>
      <p>You can ask me: <strong>“Calculate the minimum speed for 10 m at 40 degrees.”</strong></p>`,
  },
  {
    id: "angle",
    keywords: ["angle", "degree", "degrees", "45", "forty", "launcher", "trajectory"],
    phrases: ["best angle", "launch angle", "45 degrees"],
    answer: () => `
      <span class="answer-tag">Launch geometry</span>
      <p>In an ideal no-drag model with equal launch and landing heights, <strong>45°</strong> maximizes horizontal range. A real rocket may perform best at a slightly different angle because of drag, wind and launch height.</p>
      <p>Use the same angle during comparison tests so that design changes—not the launcher setting—explain any range difference.</p>`,
  },
  {
    id: "materials",
    keywords: ["material", "materials", "plastic", "pet", "tape", "duct", "glue", "card", "cardboard", "bottle"],
    phrases: ["what materials", "black tape", "hard cardboard", "allowed materials"],
    answer: () => `
      <span class="answer-tag">Materials</span>
      <p>The final design uses reused PET bottle sections, rigid corrugated cardboard, black duct tape and glue. These materials are inexpensive, easy to shape and allowed as safe rocket-structure materials.</p>
      <p>Duct tape replaced paper tape because it resists water and holds the nose joint more reliably. The pressure bottle itself should not be cut, punctured or weakened.</p>`,
  },
  {
    id: "prototype",
    keywords: ["prototype", "original", "first", "iteration", "problem", "failed", "flimsy", "crumple", "bend"],
    phrases: ["original design", "prototype problems", "what changed", "design iterations"],
    answer: () => `
      <span class="answer-tag">Iteration 01 → 03</span>
      <p>The original 2.6 L prototype used a long laminated-plastic cone, four soft-cardboard fins and paper tape. It travelled beyond 6 m, proving the propulsion and fin concept, but it was longer than 50 cm.</p>
      <p>After landing, the cone crumpled and the fins bent. The final iteration removed the cone, used a compact bottle-head nose, retained four fins, upgraded to rigid corrugated cardboard and replaced paper tape with black duct tape.</p>`,
  },
  {
    id: "comparison",
    keywords: ["compare", "comparison", "alternative", "three", "iteration", "optimal", "best", "score", "matrix"],
    phrases: ["three designs", "decision matrix", "why final is better", "most optimal"],
    answer: () => `
      <span class="answer-tag">Concept selection</span>
      <p>Three concepts were compared: the oversized long-cone prototype, a shortened pointed-cone alternative and the final rounded bottle-head rocket.</p>
      <p>Using weighted criteria for compliance, distance efficiency, stability, durability, construction, cost and sustainability, the scores were <strong>2.95/5</strong>, <strong>4.15/5</strong> and <strong>4.75/5</strong>. The final design won because it offered the strongest overall engineering compromise, not because it was best in only one category.</p>`,
  },
  {
    id: "safety",
    keywords: ["safe", "safety", "goggle", "danger", "injury", "inspect", "crack", "whitening", "distance", "countdown", "approach"],
    phrases: ["safety rules", "safe launch", "bottle inspection", "bottle must be replaced", "damage means the bottle", "replace the bottle", "15 feet", "4.6 m"],
    answer: () => `
      <span class="answer-tag">Safety first</span>
      <ul>
        <li>Wear safety goggles during pressurization and launch.</li>
        <li>Use a countdown and remain behind the designated area—at least <strong>15 ft (about 4.6 m)</strong>, or farther if instructed.</li>
        <li>Never approach or touch a pressurized rocket.</li>
        <li>Only authorized people operate the pump and launcher.</li>
        <li>Reject bottles with cracks, scratches, whitening or deformation.</li>
        <li>Retire a bottle after roughly <strong>10–15 launches</strong>, or sooner if damage appears.</li>
      </ul>`,
  },
  {
    id: "testing",
    keywords: ["test", "testing", "method", "experiment", "variable", "trial", "measure", "data", "repeat"],
    phrases: ["test plan", "fair test", "testing method", "how should we test"],
    answer: () => `
      <span class="answer-tag">Experimental method</span>
      <p>Use a controlled one-variable-at-a-time test:</p>
      <ul>
        <li>Keep the bottle, fins, pressure procedure and launch angle constant.</li>
        <li>Change only one variable, such as water volume.</li>
        <li>Perform at least three trials per setting where permitted.</li>
        <li>Record horizontal distance, wind conditions, visible wobble and damage.</li>
        <li>Compare averages rather than selecting only the longest trial.</li>
      </ul>`,
  },
  {
    id: "cost",
    keywords: ["cost", "price", "cheap", "aed", "dirham", "budget", "expensive"],
    phrases: ["how much", "material cost", "project cost"],
    answer: () => `
      <span class="answer-tag">Estimated cost</span>
      <p>The final rocket’s consumed-material cost was estimated at approximately <strong>AED 5–9</strong>, excluding the provided pump, launcher and reusable tools.</p>
      <p>This is a planning estimate. A final report should use actual receipts or state clearly that reused bottles and cardboard had zero additional purchase cost.</p>`,
  },
  {
    id: "sustainability",
    keywords: ["sustainable", "sustainability", "recycle", "recycled", "reuse", "environment", "waste", "eco"],
    phrases: ["eco friendly", "environmental impact", "reused materials"],
    answer: () => `
      <span class="answer-tag">Sustainable design</span>
      <p>The design reuses PET bottles and cardboard that would otherwise become waste. The compact bottle-head nose also uses less material than the large laminated cone.</p>
      <p>Sustainability should not override safety: a damaged pressure bottle must be retired, even if reuse would otherwise be preferred.</p>`,
  },
  {
    id: "improvements",
    keywords: ["improve", "improvement", "future", "next", "optimize", "better", "recommendation"],
    phrases: ["future work", "next steps", "how to improve", "optimize design"],
    answer: () => `
      <span class="answer-tag">Future work</span>
      <p>The best next improvements are measurement-led rather than decorative:</p>
      <ul>
        <li>Measure dry mass, exact length, fin dimensions and centre of mass.</li>
        <li>Test several water-fill ratios under the same launch conditions.</li>
        <li>Use a template to make all four fins identical and exactly 90° apart.</li>
        <li>Smooth exposed tape edges and verify the nose is centred.</li>
        <li>Record the final competition distance and compare it with the 6 m requirement.</li>
      </ul>`,
  },
  {
    id: "chatbot_limit",
    keywords: ["limitation", "incorrect", "wrong", "offline", "internet", "ai", "bot", "chatbot", "developed", "work"],
    phrases: ["chatbot limitation", "how was it made", "how does the chatbot work", "incorrect response"],
    answer: () => `
      <span class="answer-tag">About this chatbot</span>
      <p>HydroGuide is an <strong>offline, project-specific NLP assistant</strong>. It matches intent using phrases, weighted engineering keywords, typo similarity and conversation context. Formula questions are calculated locally in the browser.</p>
      <p>Its limitation is that it cannot retrieve live research or always understand completely unrelated wording. To prevent fabricated answers, low-confidence questions trigger a transparent fallback with suggested topics. This limitation and response can be shown in the Test Evidence panel.</p>`,
  },
  {
    id: "wind",
    keywords: ["wind", "weather", "crosswind", "breeze", "condition"],
    phrases: ["wind effect", "weather conditions"],
    answer: () => `
      <span class="answer-tag">External condition</span>
      <p>Wind changes both range and direction. A crosswind can expose the fins to sideways airflow and cause weathercocking, while headwind usually increases relative airspeed and drag.</p>
      <p>HydroGuide is offline and cannot verify live weather. Record observed wind direction and strength with every trial, and follow the instructor’s decision on whether conditions are safe.</p>`,
  },
];

const testCases = [
  { question: "What is the maximum rocket length?", expected: "requirements", label: "Handout constraint" },
  { question: "Why did we remove the cone?", expected: "nose", label: "Design decision" },
  { question: "How do 4 fins keep it stable?", expected: "fins", label: "Final configuration" },
  { question: "How much water should be used?", expected: "water", label: "Design variable" },
  { question: "Can I use 120 psi?", expected: "pressure", label: "Pressure safety" },
  { question: "Calculate minimum speed for 6 m at 45 degrees", expected: "calculation", label: "Engineering calculation" },
  { question: "What damage means the bottle must be replaced?", expected: "safety", label: "Bottle inspection" },
  { question: "What went wrong with the first prototype?", expected: "prototype", label: "Iteration history" },
  { question: "How was the chatbot developed?", expected: "chatbot_limit", label: "Chatbot explanation" },
  { question: "Write a recipe for pasta", expected: "fallback", label: "Out-of-scope fallback" },
];

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9.°\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const temp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = temp;
    }
  }
  return row[b.length];
}

function similar(a, b) {
  if (a.length < 4 || b.length < 4) return false;
  return levenshtein(a, b) <= (Math.max(a.length, b.length) >= 8 ? 2 : 1);
}

function findIntent(question) {
  const text = normalize(question);
  const tokens = text.split(" ").filter(Boolean);
  let best = { id: "fallback", score: 0, item: null };

  knowledge.forEach((item) => {
    let score = 0;
    item.phrases.forEach((phrase) => {
      if (text.includes(phrase)) score += 8 + phrase.split(" ").length;
    });
    item.keywords.forEach((keyword) => {
      if (tokens.includes(keyword)) score += 2.4;
      else if (tokens.some((token) => similar(token, keyword))) score += 1.35;
    });
    if (item.id === lastIntent && tokens.length <= 6) score += 0.8;
    if (score > best.score) best = { id: item.id, score, item };
  });

  return best.score >= 2.2 ? best : { id: "fallback", score: best.score, item: null };
}

function parseNumbers(text) {
  return [...normalize(text).matchAll(/\b(\d+(?:\.\d+)?)\b/g)].map((match) => Number(match[1]));
}

function calculateResponse(question) {
  const text = normalize(question);
  const asksCalculation = /(calculate|compute|equation|minimum speed|required speed|velocity needed|range at)/.test(text);
  if (!asksCalculation) return null;

  const angleMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:°|degree|degrees)/);
  const rangeMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:m|meter|meters|metre|metres)\b/);
  const angle = angleMatch ? Number(angleMatch[1]) : 45;
  const range = rangeMatch ? Number(rangeMatch[1]) : projectFacts.minimumRangeM;

  if (angle <= 0 || angle >= 90 || range <= 0) {
    return {
      id: "calculation",
      html: `<span class="answer-tag">Check the inputs</span><p>Use a positive range and a launch angle between 0° and 90°.</p>`,
    };
  }

  const sine = Math.sin((2 * angle * Math.PI) / 180);
  const speed = Math.sqrt((range * projectFacts.gravity) / sine);
  return {
    id: "calculation",
    html: `
      <span class="answer-tag">Projectile calculation</span>
      <p>For an ideal range of <strong>${range.toFixed(1)} m</strong> at <strong>${angle.toFixed(1)}°</strong>:</p>
      <span class="formula">v₀ = √[Rg / sin(2θ)] = ${speed.toFixed(2)} m/s</span>
      <p>This is the theoretical minimum with no drag and equal launch and landing heights. The real rocket must launch faster because of drag, wind and imperfect alignment.</p>`,
  };
}

function waterVolumeResponse(question) {
  const text = normalize(question);
  if (!/(water|fill|volume)/.test(text)) return null;
  const capacityMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:l|liter|liters|litre|litres)\b/);
  if (!capacityMatch) return null;
  const capacity = Number(capacityMatch[1]);
  if (capacity <= 0 || capacity > 5) return null;
  return {
    id: "water",
    html: `
      <span class="answer-tag">Starting test range</span>
      <p>For a <strong>${capacity.toFixed(1)} L</strong> bottle, a 30–40% starting range is:</p>
      <span class="formula">${(capacity * 0.3).toFixed(2)}–${(capacity * 0.4).toFixed(2)} L of water</span>
      <p>This is not a guaranteed optimum. Test several volumes while keeping pressure procedure, launch angle and rocket geometry constant.</p>`,
  };
}

function generateAnswer(question) {
  const calculation = calculateResponse(question);
  if (calculation) return calculation;
  const waterCalculation = waterVolumeResponse(question);
  if (waterCalculation) return waterCalculation;

  const matched = findIntent(question);
  if (matched.item) return { id: matched.id, html: matched.item.answer() };

  return {
    id: "fallback",
    html: `
      <span class="answer-tag">Outside my verified knowledge</span>
      <p>I’m designed specifically for this water-rocket project, and I don’t want to invent an answer.</p>
      <p>Try asking about <strong>the 50 cm limit, four fins, water volume, drag, projectile range, the prototype changes or launch safety</strong>.</p>`,
  };
}

function addMessage(role, html) {
  const wrapper = document.createElement("article");
  wrapper.className = `message ${role}`;
  wrapper.dataset.messageId = String(++messageCount);
  if (role === "assistant") {
    wrapper.innerHTML = `
      <div class="message-icon" aria-hidden="true">H</div>
      <div class="message-bubble">
        <p class="message-name">HydroGuide AI</p>
        <div class="message-copy">${html}</div>
      </div>`;
  } else {
    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    const name = document.createElement("p");
    name.className = "message-name";
    name.textContent = "You";
    const copy = document.createElement("div");
    copy.className = "message-copy";
    copy.textContent = html;
    bubble.append(name, copy);
    wrapper.append(bubble);
  }
  chatLog.append(wrapper);
  chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: "smooth" });
  return wrapper;
}

function addTyping() {
  const node = addMessage("assistant", '<span class="typing" aria-label="HydroGuide is thinking"><i></i><i></i><i></i></span>');
  node.classList.add("typing-message");
  return node;
}

function askQuestion(question, immediate = false) {
  const clean = question.trim().slice(0, 320);
  if (!clean) return;
  addMessage("user", clean);
  chatInput.value = "";
  resizeInput();
  const typing = addTyping();
  const answer = generateAnswer(clean);
  window.setTimeout(() => {
    typing.remove();
    addMessage("assistant", answer.html);
    lastIntent = answer.id;
  }, immediate ? 40 : Math.min(850, 330 + clean.length * 8));
}

function resetConversation(shouldFocus = true) {
  chatLog.innerHTML = "";
  lastIntent = "welcome";
  messageCount = 0;
  addMessage("assistant", knowledge.find((item) => item.id === "welcome").answer());
  if (shouldFocus) chatInput.focus();
}

function resizeInput() {
  chatInput.style.height = "auto";
  chatInput.style.height = `${Math.min(chatInput.scrollHeight, 110)}px`;
}

function runTests() {
  const results = testCases.map((test) => {
    const result = generateAnswer(test.question);
    return { ...test, actual: result.id, passed: result.id === test.expected };
  });
  const passed = results.filter((item) => item.passed).length;
  $("#testScore").textContent = `${passed}/${results.length}`;
  $("#testList").innerHTML = results.map((item) => `
    <div class="test-row ${item.passed ? "pass" : "fail"}">
      <i>${item.passed ? "✓" : "!"}</i>
      <div><b>${item.label}</b><small>${item.question}</small></div>
      <span>${item.actual}</span>
    </div>`).join("");
}

function fillTopicGrid() {
  $("#topicGrid").innerHTML = topicLabels.map(([icon, label]) => `
    <div class="topic-card"><span>${icon}</span><b>${label}</b></div>`).join("");
}

function openDialog(dialog) {
  if (typeof dialog.showModal === "function") dialog.showModal();
}

function togglePresentation() {
  document.body.classList.toggle("presentation-mode");
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.().catch(() => {});
  }
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  askQuestion(chatInput.value);
});

chatInput.addEventListener("input", resizeInput);
chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

promptStrip.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-question]");
  if (button) askQuestion(button.dataset.question);
});

$("#resetButton").addEventListener("click", () => resetConversation(true));
$("#presentationButton").addEventListener("click", togglePresentation);
$("#openTestsButton").addEventListener("click", () => { runTests(); openDialog(testsModal); });
$("#openKnowledgeButton").addEventListener("click", () => openDialog(knowledgeModal));
$("#runTestsButton").addEventListener("click", runTests);

$$('.close-modal').forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

$$('dialog').forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) dialog.close();
  });
});

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) document.body.classList.remove("presentation-mode");
});

fillTopicGrid();
resetConversation(false);

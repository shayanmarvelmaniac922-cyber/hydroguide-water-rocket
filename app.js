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
  bottleCapacityL: 1.5,
  selectedWaterMl: 500,
  finalDistanceM: 68,
  clayMassG: 10,
  finCount: 4,
  finMassG: 3,
  finHeightCm: 10,
  finBaseCm: 5,
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
  ["↥", "Thrust & momentum"], ["●", "Clay ballast"], ["▤", "Design parameters"],
  ["✓", "Test results"], ["?", "Project FAQ"], ["⚙", "Engineering principles"],
];

const knowledge = [
  {
    id: "welcome",
    keywords: ["hello", "hi", "hey", "start", "help", "hydroguide", "chatbot"],
    phrases: ["what can you do", "who are you"],
    answer: () => `
      <span class="answer-tag">Ready for launch</span>
      <p>Hello! I’m <strong>HydroGuide AI</strong>, your offline engineering assistant for the NGN 110 Water Rocket Challenge.</p>
      <p>I can explain how the rocket works, its exact design parameters and materials, thrust, pressure, stability, aerodynamics, projectile motion, testing, safety and sustainability.</p>
      <p>Try asking: <strong>“What are our rocket’s exact specifications?”</strong></p>`,
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
      <p>The final rocket uses a <strong>1.5 L PET pressure bottle</strong>, a rounded head cut from a second bottle, four rigid corrugated-cardboard fins, a black duct-tape nose joint and approximately <strong>10 g of clay ballast</strong> near the nose.</p>
      <p>Each fin is approximately <strong>10 cm high × 5 cm at the base</strong> and has a mass of about <strong>3 g</strong>. The four fins therefore add about 12 g in total.</p>
      <p>It was selected because it stays below the 50 cm limit while balancing aerodynamic shape, stability, durability, low cost and simple construction. Its engineering decision score was <strong>4.75/5</strong>.</p>
      <p>In the final test it travelled <strong>68 m</strong> and remained intact with <strong>no visible damage</strong> after landing.</p>
      <p>The exact finished length and dry mass should be measured and recorded rather than estimated.</p>`,
  },
  {
    id: "design_parameters",
    keywords: ["parameter", "parameters", "spec", "specs", "specification", "specifications", "dimension", "dimensions", "capacity", "size", "measurement", "measurements"],
    phrases: ["design parameters", "rocket specifications", "exact specifications", "bottle size", "bottle capacity", "how big is the bottle", "what are our rockets exact specifications"],
    answer: () => `
      <span class="answer-tag">Team design parameters</span>
      <ul>
        <li>Pressure bottle: <strong>1.5 L PET carbonated-drink bottle</strong></li>
        <li>Nominal water volume: <strong>500 mL</strong>, or 33.3% of capacity</li>
        <li>Nose: rounded dome cut from a second bottle</li>
        <li>Ballast: approximately <strong>10 g of clay</strong> near the nose</li>
        <li>Fins: <strong>4</strong>, spaced about 90° apart</li>
        <li>Each fin: approximately <strong>10 cm high × 5 cm base × 3 g</strong></li>
        <li>Total fin mass: approximately <strong>12 g</strong></li>
        <li>Total length: below the <strong>50 cm</strong> limit</li>
      </ul>
      <p>Known fin and clay mass together is about <strong>22 g</strong>, excluding the bottle-head nose, tape and glue.</p>`,
  },
  {
    id: "engineering_principles",
    keywords: ["engineering", "principle", "principles", "physics", "law", "laws", "science"],
    phrases: ["engineering principles", "physics principles", "principles used", "science behind the rocket", "newtons laws"],
    answer: () => `
      <span class="answer-tag">Engineering principles</span>
      <p>The design combines several principles:</p>
      <ul>
        <li><strong>Pressure and stored energy:</strong> the pump compresses air above the water.</li>
        <li><strong>Newton’s third law and momentum:</strong> water moving backward produces forward thrust.</li>
        <li><strong>Newton’s second law:</strong> acceleration depends on net force divided by instantaneous mass.</li>
        <li><strong>Stability:</strong> rear fins keep the centre of pressure behind the centre of mass.</li>
        <li><strong>Aerodynamics:</strong> a smooth nose, aligned fins and small frontal area reduce drag.</li>
        <li><strong>Projectile motion:</strong> launch speed and angle determine ideal horizontal range.</li>
        <li><strong>Experimental design:</strong> one variable is changed at a time and repeated trials are averaged.</li>
      </ul>`,
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
    keywords: ["fin", "fins", "four", "4", "cardboard", "corrugated", "stabilizer", "straight", "height", "base", "3g"],
    phrases: ["why four fins", "fin design", "90 degrees", "four fins", "fin dimensions", "fin size", "fin weight", "how heavy are the fins"],
    answer: () => `
      <span class="answer-tag">Stability system</span>
      <p>Four equal fins are spaced approximately <strong>90° apart</strong> near the nozzle. Each fin is about <strong>10 cm high, 5 cm along its base and 3 g</strong>, giving a total fin mass of approximately <strong>12 g</strong>.</p>
      <p>If each fin is approximated as a triangle, its planform area is ½ × 10 × 5 = <strong>25 cm²</strong>, or <strong>100 cm²</strong> for all four pieces. Only part of that total area faces any one airflow direction, but the symmetric rear area creates a restoring aerodynamic moment.</p>
      <p>That restoring effect keeps the nose pointing into the airflow. The prototype’s four-fin arrangement was already stable, so retaining it reduced design risk. Stiffer corrugated cardboard prevents fin bending that would otherwise cause turning and wasted range.</p>`,
  },
  {
    id: "ballast",
    keywords: ["clay", "ballast", "noseweight", "weight", "10g", "10", "balance"],
    phrases: ["how much clay", "clay mass", "clay weight", "why use clay", "nose ballast", "10 g of clay"],
    answer: () => `
      <span class="answer-tag">Nose ballast</span>
      <p>The final rocket uses approximately <strong>10 g of clay</strong> near the nose. Moving this small mass forward shifts the centre of mass toward the nose, increasing the separation between the centre of mass and the rear centre of pressure.</p>
      <p>This improves passive stability, but ballast is a trade-off: extra mass reduces acceleration because <strong>a = F<sub>net</sub>/m</strong>. Ten grams was kept modest so it could improve balance without adding excessive weight. The clay must be fixed securely so it cannot move during flight.</p>`,
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
      <p>For the team’s <strong>1.5 L bottle</strong>, the nominal selected starting volume is <strong>500 mL</strong>. This is 500/1500 = <strong>33.3%</strong> of capacity, leaving about <strong>1.0 L of air space</strong> before pressurization. The water mass is approximately 0.50 kg.</p>
      <p>This lies inside the usual 30–40% experimental starting range. It should be verified by comparing nearby values such as 450, 500 and 550 mL while keeping the pressure procedure, launch angle and rocket design constant.</p>`,
  },
  {
    id: "thrust",
    keywords: ["thrust", "momentum", "reaction", "newton", "exhaust", "force", "propulsion"],
    phrases: ["what produces thrust", "explain thrust", "how is thrust produced", "newtons third law", "action and reaction", "water momentum"],
    answer: () => `
      <span class="answer-tag">Thrust and momentum</span>
      <p>Compressed air pushes water through the bottle neck. The expelled water gains backward momentum, so the rocket receives an equal and opposite forward force under Newton’s third law.</p>
      <span class="formula">F<sub>T</sub> ≈ ṁv<sub>e</sub> + (p<sub>e</sub> − p<sub>a</sub>)A<sub>e</sub></span>
      <p>Here, ṁ is water mass flow rate, v<sub>e</sub> is exit speed and the pressure term represents any pressure difference at the nozzle. Thrust is initially high, then falls as water and pressure are exhausted. The rocket coasts as a projectile after powered flight ends.</p>`,
  },
  {
    id: "pressure",
    keywords: ["pressure", "pump", "psi", "bar", "compress", "air", "thrust", "launch", "shoot"],
    phrases: ["how does it launch", "how does a water rocket work", "how water rocket works", "how much pressure", "electric pump", "launch mechanism"],
    answer: () => `
      <span class="answer-tag">Propulsion</span>
      <p>The electric pump compresses the approximately <strong>1.0 L air space</strong> above the team’s nominal 500 mL water load. Pressure stores energy in that compressed air. When the launcher releases the bottle, the air expands and pushes water through the nozzle, producing thrust.</p>
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
      <p>Use a controlled one-variable-at-a-time test. For the 1.5 L final rocket:</p>
      <ul>
        <li>Keep the bottle, fins, pressure procedure and launch angle constant.</li>
        <li>Compare water volumes such as <strong>450, 500 and 550 mL</strong>.</li>
        <li>Perform at least three trials per setting where permitted.</li>
        <li>Measure horizontal distance from the launch line to first ground contact.</li>
        <li>Record launch angle, water volume, wind, visible wobble, landing orientation and damage.</li>
        <li>Compare averages rather than selecting only the longest trial.</li>
      </ul>`,
  },
  {
    id: "results",
    keywords: ["result", "results", "outcome", "performance", "passed", "achieved", "measured", "distance", "damage", "damaged", "intact", "survived", "68"],
    phrases: ["test results", "testing results", "how far did it go", "did it pass", "what were the results", "final distance", "how far did the final rocket travel", "was the final rocket damaged", "did the rocket survive"],
    answer: () => `
      <span class="answer-tag">Verified project results</span>
      <p>The original long-cone prototype travelled <strong>well beyond the 6 m qualification distance</strong>, confirming that the bottle, pump and four-fin concept could generate adequate range. It also exposed three weaknesses: the rocket exceeded 50 cm, the cone crumpled and the soft fins bent.</p>
      <p>The final rocket was redesigned around a 1.5 L bottle, compact bottle-head nose, 10 g clay ballast and four rigid 3 g fins. Its verified final distance was <strong>68 m</strong>.</p>
      <p>This is <strong>62 m beyond</strong> the 6 m requirement and about <strong>11.3 times the minimum distance</strong> (68 ÷ 6 = 11.3). The rocket also remained structurally intact with <strong>no visible damage after landing</strong>, supporting the decision to use sturdier corrugated fins, duct tape and the compact bottle-head nose.</p>`,
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
    id: "faq",
    keywords: ["faq", "frequently", "common", "question", "questions"],
    phrases: ["frequently asked questions", "common questions", "project faq", "what can people ask"],
    answer: () => `
      <span class="answer-tag">Frequently asked questions</span>
      <ul>
        <li><strong>How does it work?</strong> Compressed air expels water and creates reaction thrust.</li>
        <li><strong>Why four fins?</strong> They provide symmetric rear stability at 90° intervals.</li>
        <li><strong>Why 500 mL?</strong> It is 33.3% of the 1.5 L bottle and balances reaction mass with compressed-air volume.</li>
        <li><strong>Why 10 g of clay?</strong> It shifts the centre of mass forward without excessive ballast.</li>
        <li><strong>Why remove the cone?</strong> The bottle-head nose is shorter, tougher and still smooth.</li>
        <li><strong>Did it meet 6 m?</strong> Yes. The final rocket travelled 68 m—62 m beyond, or about 11.3 times, the minimum—and had no visible damage after landing.</li>
        <li><strong>Is it sustainable?</strong> It reuses PET bottles and cardboard, while damaged pressure bottles are retired for safety.</li>
      </ul>`,
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
        <li>Use the verified 68 m competition result as a baseline and repeat trials to check consistency.</li>
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
  { question: "How does a water rocket work?", expected: "pressure", label: "How the rocket works" },
  { question: "What are our rocket's exact specifications?", expected: "design_parameters", label: "Team design parameters" },
  { question: "What materials did we use?", expected: "materials", label: "Design materials" },
  { question: "What engineering principles are used?", expected: "engineering_principles", label: "Engineering principles" },
  { question: "What produces thrust?", expected: "thrust", label: "Thrust explanation" },
  { question: "How does pressure launch the rocket?", expected: "pressure", label: "Pressure explanation" },
  { question: "Why did we remove the cone?", expected: "nose", label: "Design decision" },
  { question: "How do 4 fins keep it stable?", expected: "fins", label: "Final configuration" },
  { question: "What are the fin dimensions and weight?", expected: "fins", label: "Fin specifications" },
  { question: "Why did we add 10 g of clay?", expected: "ballast", label: "Ballast and stability" },
  { question: "How much water should be used?", expected: "water", label: "Design variable" },
  { question: "Why was 500 mL selected for the 1.5 L bottle?", expected: "water", label: "Selected water volume" },
  { question: "Explain aerodynamic drag", expected: "drag", label: "Aerodynamics" },
  { question: "Explain projectile motion", expected: "range", label: "Projectile motion" },
  { question: "Can I use 120 psi?", expected: "pressure", label: "Pressure safety" },
  { question: "Calculate minimum speed for 6 m at 45 degrees", expected: "calculation", label: "Engineering calculation" },
  { question: "How should we test the final rocket?", expected: "testing", label: "Testing procedure" },
  { question: "What were the test results?", expected: "results", label: "Testing results" },
  { question: "How far did the final rocket travel?", expected: "results", label: "Final competition distance" },
  { question: "Was the final rocket damaged after landing?", expected: "results", label: "Landing durability" },
  { question: "What damage means the bottle must be replaced?", expected: "safety", label: "Bottle inspection" },
  { question: "What went wrong with the first prototype?", expected: "prototype", label: "Iteration history" },
  { question: "How is the project sustainable?", expected: "sustainability", label: "Sustainability" },
  { question: "What are the frequently asked questions?", expected: "faq", label: "Project FAQ" },
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
  const asksCalculation = /(minimum speed|required speed|velocity needed|range at|calculate.*(?:speed|velocity|range)|compute.*(?:speed|velocity|range))/.test(text);
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
  if (!/(water|fill|volume|\bml\b)/.test(text)) return null;
  const capacityMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:l|liter|liters|litre|litres)\b/);
  if (!capacityMatch) return null;
  const capacity = Number(capacityMatch[1]);
  if (capacity <= 0 || capacity > 5) return null;
  if (Math.abs(capacity - projectFacts.bottleCapacityL) < 0.01 && /(selected|our|final|recommend|ideal|best)/.test(text)) {
    return {
      id: "water",
      html: `
        <span class="answer-tag">Team water selection</span>
        <p>For the team’s <strong>1.5 L bottle</strong>, the nominal selected water volume is <strong>500 mL</strong>.</p>
        <span class="formula">500 / 1500 × 100 = 33.3%</span>
        <p>This leaves about <strong>1.0 L of air space</strong> before pressurization and approximately 0.50 kg of water reaction mass. Nearby volumes should still be compared experimentally.</p>`,
    };
  }
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
      <p>Try asking about <strong>the 1.5 L bottle, 500 mL water setting, 10 g clay, fin dimensions, thrust, pressure, stability, drag, testing results, sustainability or launch safety</strong>.</p>`,
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

import { useState, useEffect, useRef } from "react";

const TOPICS = [
  "REST API Basics",
  "HTTP Methods & Status Codes",
  "Writing Test Cases",
  "Authentication & Security",
  "Performance Testing",
  "Speed & Latency",
  "Stress Testing",
  "Security Vulnerabilities",
  "API Tools (Postman, JMeter, Swagger)",
];

const BADGES = [
  { min: 0,  max: 39,  label: "API Rookie",   emoji: "🐣", color: "#f87171" },
  { min: 40, max: 59,  label: "API Explorer", emoji: "🔍", color: "#fb923c" },
  { min: 60, max: 74,  label: "API Tester",   emoji: "🧪", color: "#facc15" },
  { min: 75, max: 89,  label: "API Pro",      emoji: "⚡", color: "#4ade80" },
  { min: 90, max: 100, label: "API Legend",   emoji: "🏆", color: "#a78bfa" },
];

const TIPS = [
  "💡 Always test both happy path and edge cases!",
  "🔐 Never hardcode API keys — use environment variables!",
  "⚡ Good API response time is under 200ms.",
  "🧪 Postman collections can be automated with Newman in CI/CD!",
  "🛡️ Always test for SQL injection in query parameters.",
  "📊 Load testing should simulate real user behavior.",
  "🔄 Idempotent APIs return the same result for repeated requests.",
  "📝 Document your test cases — future you will thank you!",
  "🚦 HTTP 429 = Too Many Requests — always handle rate limits.",
  "🔍 Validate response schema, not just status codes!",
  "🌐 Always test APIs with different content-types.",
  "🔒 OAuth 2.0 is the industry standard for API authorization.",
  "📈 Monitor API performance in production, not just in tests.",
  "🧩 Contract testing ensures frontend & backend stay in sync.",
  "🚀 Use mocking to test APIs before they're fully built!",
];

// 15 questions: 5 beginner, 5 intermediate, 5 advanced
const QUESTION_PLAN = [
  { difficulty: "Beginner",     topic: "REST API Basics" },
  { difficulty: "Beginner",     topic: "HTTP Methods & Status Codes" },
  { difficulty: "Beginner",     topic: "API Tools (Postman, JMeter, Swagger)" },
  { difficulty: "Beginner",     topic: "Writing Test Cases" },
  { difficulty: "Beginner",     topic: "Authentication & Security" },
  { difficulty: "Intermediate", topic: "HTTP Methods & Status Codes" },
  { difficulty: "Intermediate", topic: "Writing Test Cases" },
  { difficulty: "Intermediate", topic: "Performance Testing" },
  { difficulty: "Intermediate", topic: "Authentication & Security" },
  { difficulty: "Intermediate", topic: "Speed & Latency" },
  { difficulty: "Advanced",     topic: "Stress Testing" },
  { difficulty: "Advanced",     topic: "Security Vulnerabilities" },
  { difficulty: "Advanced",     topic: "Performance Testing" },
  { difficulty: "Advanced",     topic: "API Tools (Postman, JMeter, Swagger)" },
  { difficulty: "Advanced",     topic: "Writing Test Cases" },
];

const TOTAL_Q = 15;
const LIVES = 3;
const TIME_PER_Q = 60;

function getBadge(pct) {
  return BADGES.find(b => pct >= b.min && pct <= b.max) || BADGES[0];
}

function Heart({ filled }) {
  return <span style={{ fontSize: 20, filter: filled ? "none" : "grayscale(1) opacity(0.3)" }}>❤️</span>;
}

function ProgressBar({ value, max, color = "#a78bfa" }) {
  return (
    <div style={{ background: "#1e1b2e", borderRadius: 8, height: 8, overflow: "hidden" }}>
      <div style={{ width: `${(value / max) * 100}%`, background: color, height: "100%", borderRadius: 8, transition: "width 0.5s" }} />
    </div>
  );
}

async function fetchOneQuestion(topic, difficulty) {
  const diffGuide = {
    Beginner:     "Simple concept, definition-aware, real scenario but straightforward. Good for someone new to API testing.",
    Intermediate: "Requires understanding of multiple concepts. Real debugging or decision-making scenario.",
    Advanced:     "Complex real-world production scenario. Requires deep expertise. Could appear in a senior QA interview.",
  };

  const prompt = `You are a senior API testing expert and educator. Generate exactly 1 multiple-choice quiz question.
Topic: ${topic}
Difficulty: ${difficulty}
Difficulty guide: ${diffGuide[difficulty]}

Rules:
- Must be a real-world scenario (not a definition question)
- 4 options — all plausible, no obviously wrong answers
- The correct answer index (0-3) must be accurate
- Explanation: 2 sentences max — why it's correct + 1 actionable pro tip
- Make it fun, relatable, like something you'd face on the job

Return ONLY a valid JSON object, no markdown, no extra text:
{"question":"...","options":["...","...","...","..."],"answer":0,"explanation":"...","topic":"${topic}","difficulty":"${difficulty}"}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 700,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  const raw = data.content.map(i => i.text || "").join("");
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export default function App() {
  const [screen, setScreen]         = useState("home");
  const [questions, setQuestions]   = useState([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [qIndex, setQIndex]         = useState(0);
  const [selected, setSelected]     = useState(null);
  const [showExp, setShowExp]       = useState(false);
  const [score, setScore]           = useState(0);
  const [lives, setLives]           = useState(LIVES);
  const [timeLeft, setTimeLeft]     = useState(TIME_PER_Q);
  const [streak, setStreak]         = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [history, setHistory]       = useState([]);
  const [error, setError]           = useState("");
  const [sessionNum, setSessionNum] = useState(1);
  const [tipIdx, setTipIdx]         = useState(0);
  const timerRef   = useRef(null);
  const loadingRef = useRef(false);

  // Rotate tips
  useEffect(() => {
    const i = setInterval(() => setTipIdx(t => (t + 1) % TIPS.length), 2800);
    return () => clearInterval(i);
  }, []);

  // Timer
  useEffect(() => {
    if (screen === "quiz" && !showExp && selected === null) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [screen, qIndex, showExp, selected]);

  function handleTimeout() {
    setSelected("timeout");
    setShowExp(true);
    setStreak(0);
    setLives(l => { const nl = l - 1; if (nl <= 0) setTimeout(() => endGame(), 1800); return nl; });
  }

  async function loadAll() {
    if (loadingRef.current) return;
    loadingRef.current = true;
    const loaded = [];
    for (let i = 0; i < TOTAL_Q; i++) {
      try {
        const { difficulty, topic } = QUESTION_PLAN[i];
        const q = await fetchOneQuestion(topic, difficulty);
        loaded.push(q);
        setQuestions([...loaded]);
        setLoadedCount(loaded.length);
        if (loaded.length === 1) {
          setQIndex(0); setSelected(null); setShowExp(false);
          setScore(0); setLives(LIVES); setTimeLeft(TIME_PER_Q);
          setStreak(0); setBestStreak(0); setHistory([]);
          setScreen("quiz");
        }
      } catch (e) { /* skip silently */ }
    }
    loadingRef.current = false;
  }

  async function startQuiz() {
    setError(""); setQuestions([]); setLoadedCount(0); setScreen("loading");
    setTipIdx(Math.floor(Math.random() * TIPS.length));
    try { await loadAll(); }
    catch (e) { setError("Failed to load. Please try again."); setScreen("home"); }
  }

  function handleAnswer(idx) {
    if (selected !== null) return;
    clearInterval(timerRef.current);
    const q = questions[qIndex];
    const correct = idx === q.answer;
    setSelected(idx); setShowExp(true);
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => { const ns = s + 1; setBestStreak(b => Math.max(b, ns)); return ns; });
    } else {
      setStreak(0);
      setLives(l => { const nl = l - 1; if (nl <= 0) setTimeout(() => endGame(), 1800); return nl; });
    }
    setHistory(h => [...h, { correct, topic: q.topic, difficulty: q.difficulty }]);
  }

  function next() {
    const ni = qIndex + 1;
    if (lives <= 0 || ni >= TOTAL_Q) { endGame(); return; }
    if (ni >= questions.length) { setScreen("between"); return; }
    setQIndex(ni); setSelected(null); setShowExp(false); setTimeLeft(TIME_PER_Q);
  }

  // Auto-advance from "between" when next Q loads
  useEffect(() => {
    if (screen === "between") {
      const ni = qIndex + 1;
      if (questions.length > ni) {
        setQIndex(ni); setSelected(null); setShowExp(false); setTimeLeft(TIME_PER_Q); setScreen("quiz");
      } else if (loadedCount >= TOTAL_Q) { endGame(); }
    }
  }, [questions.length, screen]);

  function endGame() { clearInterval(timerRef.current); setScreen("result"); }
  function restart()  { setSessionNum(s => s + 1); startQuiz(); }

  // ── RENDER ──
  if (screen === "home")    return <Home    onStart={startQuiz} error={error} sessionNum={sessionNum} />;
  if (screen === "loading") return <LoadingScreen tip={TIPS[tipIdx]} />;
  if (screen === "between") return <BetweenScreen tip={TIPS[tipIdx]} loaded={loadedCount} total={TOTAL_Q} />;
  if (screen === "result")  return <Result  score={score} total={history.length} lives={lives} bestStreak={bestStreak} history={history} onRestart={restart} sessionNum={sessionNum} />;

  const q = questions[qIndex];
  if (!q) return null;
  const timerColor = timeLeft > 30 ? "#4ade80" : timeLeft > 15 ? "#facc15" : "#f87171";
  const diffColor  = { Beginner: "#14532d", Intermediate: "#78350f", Advanced: "#4c1d95" };
  const diffIcon   = { Beginner: "🟢", Intermediate: "🟡", Advanced: "🔴" };
  const phase      = qIndex < 5 ? "🟢 Beginner Phase" : qIndex < 10 ? "🟡 Intermediate Phase" : "🔴 Advanced Phase";

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div style={{ display:"flex", gap:4 }}>
            {Array.from({ length: LIVES }).map((_, i) => <Heart key={i} filled={i < lives} />)}
          </div>
          <div style={{ color:"#a78bfa", fontWeight:700, fontSize:13 }}>🔥 {streak} &nbsp;|&nbsp; ⭐ {score}/{qIndex+(selected!==null?1:0)}</div>
          <div style={{ color:timerColor, fontWeight:700, fontSize:18 }}>⏱ {timeLeft}s</div>
        </div>

        {/* Timer bar */}
        <ProgressBar value={timeLeft} max={TIME_PER_Q} color={timerColor} />

        {/* Progress */}
        <div style={{ marginTop:6, marginBottom:4 }}>
          <ProgressBar value={qIndex+1} max={TOTAL_Q} color="#a78bfa" />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
            <div style={{ color:"#6b7280", fontSize:12 }}>Q {qIndex+1} / {TOTAL_Q} &nbsp;•&nbsp; {phase}</div>
            {loadedCount < TOTAL_Q && <div style={{ color:"#4ade80", fontSize:11 }}>⚡ Loading in bg ({loadedCount}/{TOTAL_Q})</div>}
          </div>
        </div>

        {/* Tags */}
        <div style={{ display:"flex", gap:8, margin:"12px 0", flexWrap:"wrap" }}>
          <span style={{ ...styles.tag, background:"#1e1b2e", color:"#a78bfa" }}>🏷 {q.topic}</span>
          <span style={{ ...styles.tag, background: diffColor[q.difficulty], color:"#fff" }}>
            {diffIcon[q.difficulty]} {q.difficulty}
          </span>
        </div>

        {/* Question */}
        <div style={styles.question}>{q.question}</div>

        {/* Options */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
          {q.options.map((opt, i) => {
            let bg="#1e1b2e", border="#374151", color="#e5e7eb";
            if (selected !== null) {
              if (i === q.answer)                          { bg="#14532d"; border="#4ade80"; color="#4ade80"; }
              else if (i===selected && selected!==q.answer) { bg="#450a0a"; border="#f87171"; color="#f87171"; }
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={selected!==null}
                style={{ ...styles.option, background:bg, border:`1.5px solid ${border}`, color, cursor:selected!==null?"default":"pointer" }}>
                <span style={{ fontWeight:700, marginRight:8, color:"#6b7280" }}>{["A","B","C","D"][i]}.</span>{opt}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExp && (
          <div style={{ background:"#1e1b2e", border:"1px solid #374151", borderRadius:10, padding:"14px 16px", marginBottom:14 }}>
            <div style={{ color: selected===q.answer?"#4ade80":"#f87171", fontWeight:700, marginBottom:6 }}>
              {selected==="timeout" ? "⏰ Time's up!" : selected===q.answer ? "✅ Correct!" : "❌ Not quite!"}
            </div>
            <div style={{ color:"#d1d5db", fontSize:14, lineHeight:1.6 }}>💡 {q.explanation}</div>
          </div>
        )}

        {showExp && lives > 0 && (
          <button onClick={next} style={styles.nextBtn}>
            {qIndex+1 >= TOTAL_Q ? "See Results 🏆" : "Next Question →"}
          </button>
        )}
      </div>
    </div>
  );
}

function Home({ onStart, error, sessionNum }) {
  return (
    <div style={styles.bg}>
      <div style={{ ...styles.card, textAlign:"center", maxWidth:480 }}>
        <div style={{ fontSize:56, marginBottom:8 }}>🧪</div>
        <h1 style={{ color:"#fff", fontSize:26, fontWeight:800, marginBottom:6 }}>API Testing Mastery</h1>
        <p style={{ color:"#9ca3af", marginBottom:6, lineHeight:1.6 }}>
          15 AI-generated real-world questions. Beginner → Intermediate → Advanced. No two sessions are the same.
        </p>

        {/* Phase indicator */}
        <div style={{ display:"flex", justifyContent:"center", gap:8, margin:"14px 0", flexWrap:"wrap" }}>
          {[["🟢","Beginner","Q1–5"],["🟡","Intermediate","Q6–10"],["🔴","Advanced","Q11–15"]].map(([icon,label,range]) => (
            <div key={label} style={{ background:"#1e1b2e", borderRadius:10, padding:"10px 14px", color:"#e5e7eb", fontSize:12, textAlign:"center" }}>
              <div style={{ fontSize:22 }}>{icon}</div>
              <div style={{ fontWeight:700 }}>{label}</div>
              <div style={{ color:"#6b7280" }}>{range}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", justifyContent:"center", gap:12, margin:"14px 0", flexWrap:"wrap" }}>
          {[["❤️ x3","Lives"],["⏱ 60s","Per Q"],["🔥","Streaks"],["🏆","Badges"]].map(([icon,label]) => (
            <div key={label} style={{ background:"#1e1b2e", borderRadius:10, padding:"10px 14px", color:"#e5e7eb", fontSize:13 }}>
              <div style={{ fontSize:20 }}>{icon}</div><div>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ background:"#1e1b2e", borderRadius:10, padding:"12px 16px", marginBottom:20, textAlign:"left" }}>
          <div style={{ color:"#a78bfa", fontWeight:700, marginBottom:8 }}>Topics covered:</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {["REST Basics","HTTP Methods","Test Cases","Auth & Security","Performance","Stress Testing","Speed","Tools","Security Vulns"].map(t => (
              <span key={t} style={{ ...styles.tag, background:"#0f0d1a", color:"#d1d5db" }}>{t}</span>
            ))}
          </div>
        </div>

        {error && <div style={{ color:"#f87171", marginBottom:12, fontSize:14 }}>{error}</div>}
        <button onClick={onStart} style={styles.nextBtn}>{sessionNum>1 ? "🔄 New Session" : "🚀 Start Quiz"}</button>
        <p style={{ color:"#4b5563", fontSize:12, marginTop:12 }}>⚡ Starts instantly • 15 questions • ~15 mins</p>
      </div>
    </div>
  );
}

function LoadingScreen({ tip }) {
  const [dots, setDots] = useState(".");
  useEffect(() => { const i = setInterval(() => setDots(d => d.length>=3?".":d+"."), 400); return () => clearInterval(i); }, []);
  return (
    <div style={{ ...styles.bg, alignItems:"center" }}>
      <div style={{ textAlign:"center", color:"#fff", maxWidth:400, padding:"0 20px" }}>
        <div style={{ fontSize:56, marginBottom:12 }}>🤖</div>
        <div style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>Loading first question{dots}</div>
        <div style={{ color:"#6b7280", fontSize:13, marginBottom:20 }}>Quiz starts as soon as it's ready!</div>
        <div style={{ background:"#1e1b2e", borderRadius:12, padding:"16px 20px", textAlign:"left" }}>
          <div style={{ color:"#a78bfa", fontWeight:700, fontSize:12, marginBottom:6 }}>⚡ DID YOU KNOW?</div>
          <div style={{ color:"#d1d5db", fontSize:14, lineHeight:1.6 }}>{tip}</div>
        </div>
      </div>
    </div>
  );
}

function BetweenScreen({ tip, loaded, total }) {
  const [dots, setDots] = useState(".");
  useEffect(() => { const i = setInterval(() => setDots(d => d.length>=3?".":d+"."), 400); return () => clearInterval(i); }, []);
  return (
    <div style={{ ...styles.bg, alignItems:"center" }}>
      <div style={{ textAlign:"center", color:"#fff", maxWidth:400, padding:"0 20px" }}>
        <div style={{ fontSize:48, marginBottom:12 }}>⏳</div>
        <div style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>Loading next question{dots}</div>
        <div style={{ color:"#4ade80", fontSize:13, marginBottom:12 }}>{loaded} of {total} questions loaded</div>
        <ProgressBar value={loaded} max={total} color="#4ade80" />
        <div style={{ background:"#1e1b2e", borderRadius:12, padding:"16px 20px", textAlign:"left", marginTop:20 }}>
          <div style={{ color:"#a78bfa", fontWeight:700, fontSize:12, marginBottom:6 }}>⚡ PRO TIP</div>
          <div style={{ color:"#d1d5db", fontSize:14, lineHeight:1.6 }}>{tip}</div>
        </div>
      </div>
    </div>
  );
}

function Result({ score, total, lives, bestStreak, history, onRestart, sessionNum }) {
  const pct   = total > 0 ? Math.round((score / total) * 100) : 0;
  const badge = getBadge(pct);

  // Stats by difficulty
  const byDiff = { Beginner:{c:0,t:0}, Intermediate:{c:0,t:0}, Advanced:{c:0,t:0} };
  history.forEach(h => { byDiff[h.difficulty].t++; if(h.correct) byDiff[h.difficulty].c++; });

  const weak = {};
  history.filter(h => !h.correct).forEach(h => { weak[h.topic] = (weak[h.topic]||0)+1; });
  const weakTopics = Object.entries(weak).sort((a,b) => b[1]-a[1]).slice(0,3);

  return (
    <div style={styles.bg}>
      <div style={{ ...styles.card, textAlign:"center", maxWidth:500 }}>
        <div style={{ fontSize:60, marginBottom:4 }}>{badge.emoji}</div>
        <h2 style={{ color:badge.color, fontSize:24, fontWeight:800 }}>{badge.label}</h2>
        <div style={{ fontSize:48, fontWeight:900, color:"#fff", margin:"8px 0" }}>{pct}%</div>
        <div style={{ color:"#9ca3af", marginBottom:20 }}>{score} correct out of {total} questions</div>

        {/* Stats by difficulty */}
        <div style={{ display:"flex", justifyContent:"center", gap:10, marginBottom:20, flexWrap:"wrap" }}>
          {[["🟢","Beginner"],["🟡","Intermediate"],["🔴","Advanced"]].map(([icon,d]) => (
            <div key={d} style={{ background:"#1e1b2e", borderRadius:10, padding:"10px 14px", color:"#e5e7eb", fontSize:13, minWidth:90 }}>
              <div style={{ fontSize:22 }}>{icon}</div>
              <div style={{ fontWeight:700 }}>{d}</div>
              <div style={{ color:"#a78bfa" }}>{byDiff[d].c}/{byDiff[d].t}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", justifyContent:"center", gap:12, marginBottom:20, flexWrap:"wrap" }}>
          {[["❤️",`${lives} lives`],["🔥",`Streak: ${bestStreak}`],["📊",`#${sessionNum}`]].map(([icon,label]) => (
            <div key={label} style={{ background:"#1e1b2e", borderRadius:10, padding:"10px 14px", color:"#e5e7eb", fontSize:13 }}>
              <div style={{ fontSize:22 }}>{icon}</div><div>{label}</div>
            </div>
          ))}
        </div>

        {weakTopics.length > 0 && (
          <div style={{ background:"#1e1b2e", borderRadius:10, padding:"14px 16px", marginBottom:16, textAlign:"left" }}>
            <div style={{ color:"#f87171", fontWeight:700, marginBottom:8 }}>📌 Focus on these next:</div>
            {weakTopics.map(([topic,count]) => (
              <div key={topic} style={{ color:"#d1d5db", fontSize:14, marginBottom:4 }}>• {topic} ({count} missed)</div>
            ))}
          </div>
        )}

        <div style={{ background:"#1e1b2e", borderRadius:10, padding:"12px 16px", marginBottom:20, textAlign:"left" }}>
          <div style={{ color:"#a78bfa", fontWeight:700, marginBottom:6 }}>Next badge:</div>
          {BADGES.filter(b => b.min > pct).slice(0,1).map(b => (
            <div key={b.label} style={{ color:"#d1d5db", fontSize:14 }}>{b.emoji} {b.label} — score {b.min}%+</div>
          ))}
          {pct===100 && <div style={{ color:"#facc15" }}>🌟 Perfect score! You're an API Legend!</div>}
        </div>

        <button onClick={onRestart} style={styles.nextBtn}>🔄 New Session — Fresh Questions</button>
        <p style={{ color:"#4b5563", fontSize:12, marginTop:10 }}>Every session has unique AI-generated questions</p>
      </div>
    </div>
  );
}

const styles = {
  bg:       { minHeight:"100vh", background:"linear-gradient(135deg,#0f0d1a 0%,#1a1030 100%)", display:"flex", justifyContent:"center", alignItems:"flex-start", padding:"24px 16px", fontFamily:"'Segoe UI',sans-serif" },
  card:     { background:"#111827", borderRadius:18, padding:"24px 22px", width:"100%", maxWidth:540, boxShadow:"0 0 40px rgba(167,139,250,0.1)" },
  question: { color:"#f3f4f6", fontSize:17, fontWeight:600, lineHeight:1.6, marginBottom:18 },
  option:   { width:"100%", padding:"12px 16px", borderRadius:10, fontSize:14, textAlign:"left", transition:"all 0.2s", fontFamily:"inherit" },
  tag:      { padding:"4px 10px", borderRadius:20, fontSize:12, fontWeight:600 },
  nextBtn:  { width:"100%", padding:"14px", background:"linear-gradient(90deg,#7c3aed,#a855f7)", color:"#fff", border:"none", borderRadius:12, fontSize:16, fontWeight:700, cursor:"pointer", fontFamily:"inherit" },
};

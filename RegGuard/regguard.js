// ─────────────────────────────────────────
// RegGuard — Master File
// Runs ALL phases in one command
// ─────────────────────────────────────────

import { getTestCases, getExecutions } from './zephyr.js';

console.log("╔════════════════════════════════════════╗");
console.log("║     🤖 RegGuard — Starting Analysis    ║");
console.log("╚════════════════════════════════════════╝\n");

// ─────────────────────────────────────────
// PHASE 1 — BULK MARK DETECTOR
// ─────────────────────────────────────────
function checkBulkMarking(executions) {
  const passes = executions.filter(e => e.status === "PASS");
  if (passes.length < 5) return { flagged: false };

  const sorted = passes.sort((a, b) => a.executedAt - b.executedAt);

  for (let i = 0; i <= sorted.length - 5; i++) {
    const secondsDiff = (sorted[i+4].executedAt - sorted[i].executedAt) / 1000;
    if (secondsDiff < 180) {
      return {
        flagged: true,
        tester: sorted[i].tester,
        seconds: Math.round(secondsDiff),
        cases: sorted.slice(i, i+5).map(e => e.testCaseId)
      };
    }
  }
  return { flagged: false };
}

function checkMissingEvidence(executions) {
  return executions
    .filter(e => e.status === "PASS" && e.evidence === null)
    .map(e => e.testCaseId);
}

// ─────────────────────────────────────────
// PHASE 2 — COVERAGE CALCULATOR
// ─────────────────────────────────────────
function calculateCoverage(environmentName, requiredCases, executedIds) {
  const total = requiredCases.length;
  const executed = executedIds.length;
  const percentage = Math.round((executed / total) * 100);

  const missedHigh = requiredCases
    .filter(tc => !executedIds.includes(tc.id) && tc.priority === "High")
    .map(tc => tc.id);

  const missedAll = requiredCases
    .filter(tc => !executedIds.includes(tc.id))
    .map(tc => `${tc.id} | ${tc.area} | ${tc.device} | ${tc.priority}`);

  return {
    environment: environmentName,
    total, executed, percentage, missedHigh, missedAll,
    status: percentage >= 80 ? "✅ PASS" : percentage >= 50 ? "⚠️  WARNING" : "🚨 FAIL"
  };
}

// ─────────────────────────────────────────
// MAIN — RUN EVERYTHING
// ─────────────────────────────────────────
async function runRegGuard() {

  // ── PHASE 1 ──────────────────────────
  console.log("📌 PHASE 1 — Bulk Mark Detection");
  console.log("════════════════════════════════════════");

  const stageExecData = await getExecutions("Sprint 24", "Stage");
  const executions = stageExecData.executions;

  console.log(`📋 Sprint      : ${stageExecData.sprint}`);
  console.log(`📍 Environment : ${stageExecData.environment}`);
  console.log(`📊 Executions  : ${executions.length} records\n`);

  const bulkResult = checkBulkMarking(executions);

  if (bulkResult.flagged) {
    console.log("🚨 BULK MARKING DETECTED!");
    console.log(`👤 Tester         : ${bulkResult.tester}`);
    console.log(`⏱️  Time Taken     : ${bulkResult.seconds} seconds for 5 cases`);
    console.log(`🔍 Flagged Cases  : ${bulkResult.cases.join(", ")}`);
    console.log(`⚡ Action         : Notify QA Lead — request evidence`);
  } else {
    console.log("✅ No bulk marking detected — execution looks genuine");
  }

  const missingEvidence = checkMissingEvidence(executions);
  if (missingEvidence.length > 0) {
    console.log(`\n⚠️  Missing Evidence : ${missingEvidence.join(", ")}`);
    console.log(`⚡ Action           : Request screenshots before sign-off`);
  }

  // ── PHASE 2 ──────────────────────────
  console.log("\n📌 PHASE 2 — Coverage Health Report");
  console.log("════════════════════════════════════════");
  console.log(`📅 Generated: ${new Date().toLocaleString()}\n`);

  const zephyrCases = await getTestCases("Sprint 24");
  const requiredCases = zephyrCases.testCases;

  const betaData = await getExecutions("Sprint 24", "Beta");
  const prodData = await getExecutions("Sprint 24", "Production");

  const stageIds = executions.map(e => e.testCaseId);
  const betaIds  = betaData.executions.filter(e => e.status === "PASS").map(e => e.testCaseId);
  const prodIds  = prodData.executions.filter(e => e.status === "PASS").map(e => e.testCaseId);

  const results = [
    calculateCoverage("Stage", requiredCases, stageIds),
    calculateCoverage("Beta", requiredCases, betaIds),
    calculateCoverage("Production", requiredCases, prodIds),
  ];

  results.forEach(r => {
    console.log(`📍 ${r.environment.padEnd(12)}: ${r.executed}/${r.total} (${r.percentage}%) ${r.status}`);
    if (r.missedHigh.length > 0) {
      console.log(`   🔴 Missed HIGH: ${r.missedHigh.join(", ")}`);
    }
    if (r.missedAll.length > 0) {
      r.missedAll.forEach(c => console.log(`   ↳ ${c}`));
    }
    console.log("");
  });

  // ── PHASE 3 ──────────────────────────
  console.log("📌 PHASE 3 — AI Layer Status");
  console.log("════════════════════════════════════════");
  console.log("✅ Prompt template ready    : prompt-template.md");
  console.log("✅ Works with               : Claude.ai / ChatGPT / Gemini");
  console.log("✅ Output                   : Full test checklist per environment");
  console.log("🔄 Next step                : Connect Claude API for full automation\n");

  // ── FINAL VERDICT ─────────────────────
  console.log("╔════════════════════════════════════════╗");
  console.log("║     📊 REGGUARD FINAL VERDICT          ║");
  console.log("╚════════════════════════════════════════╝");

  const hasHighGaps = results.some(r => r.missedHigh.length > 0);
  const hasBulkMarking = bulkResult.flagged;
  const hasMissingEvidence = missingEvidence.length > 0;

  if (!hasBulkMarking && !hasHighGaps && !hasMissingEvidence) {
    console.log("✅ SAFE TO RELEASE");
    console.log("   All checks passed — QA Lead can approve");
  } else {
    console.log("🚨 DO NOT RELEASE — Issues found:\n");
    if (hasBulkMarking)      console.log(`   ❌ Bulk marking detected for tester: ${bulkResult.tester}`);
    if (hasMissingEvidence)  console.log(`   ❌ Missing evidence: ${missingEvidence.join(", ")}`);
    if (hasHighGaps)         console.log(`   ❌ High priority cases not tested`);
    console.log("\n   ⚡ QA Lead sign-off required before release");
  }

  console.log("════════════════════════════════════════");
}

runRegGuard();
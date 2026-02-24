// ─────────────────────────────────────────
// RegGuard - Phase 2: Coverage Report
// Now powered by Zephyr integration layer!
// ─────────────────────────────────────────

import { getTestCases, getExecutions } from './zephyr.js';

// ─────────────────────────────────────────
// COVERAGE CALCULATOR
// ─────────────────────────────────────────
function calculateCoverage(environmentName, requiredCases, executedIds) {
  const total = requiredCases.length;
  const executed = executedIds.length;
  const percentage = Math.round((executed / total) * 100);

  // Which cases were missed?
  const missedCases = requiredCases
    .filter(tc => !executedIds.includes(tc.id))
    .map(tc => `${tc.id} | ${tc.area} | ${tc.device} | Priority: ${tc.priority}`);

  // Missed HIGH priority — most dangerous!
  const missedHighPriority = requiredCases
    .filter(tc => !executedIds.includes(tc.id) && tc.priority === "High")
    .map(tc => tc.id);

  // Status based on coverage %
  let status;
  if (percentage >= 80) status = "✅ PASS";
  else if (percentage >= 50) status = "⚠️  WARNING";
  else status = "🚨 FAIL";

  return {
    environment: environmentName,
    total,
    executed,
    percentage,
    missedCases,
    missedHighPriority,
    status
  };
}

// ─────────────────────────────────────────
// GENERATE FULL REPORT
// ─────────────────────────────────────────
async function generateReport() {
  console.log("🤖 RegGuard — Coverage Health Report");
  console.log("════════════════════════════════════════");
  console.log(`📅 Generated: ${new Date().toLocaleString()}`);
  console.log("════════════════════════════════════════\n");

  // Pull test cases from Zephyr
  const zephyrCases = await getTestCases("Sprint 24");
  const requiredCases = zephyrCases.testCases;

  console.log(`📋 Sprint        : ${zephyrCases.sprint}`);
  console.log(`📊 Total Cases   : ${zephyrCases.total}`);
  console.log("════════════════════════════════════════\n");

  // Pull executions per environment from Zephyr
  const stageData = await getExecutions("Sprint 24", "Stage");
  const betaData  = await getExecutions("Sprint 24", "Beta");
  const prodData  = await getExecutions("Sprint 24", "Production");

  // Get executed case IDs per environment
  const stageExecuted = stageData.executions.map(e => e.testCaseId);
  const betaExecuted  = betaData.executions
    .filter(e => e.status === "PASS")
    .map(e => e.testCaseId);
  const prodExecuted  = prodData.executions
    .filter(e => e.status === "PASS" && e.testCaseId.startsWith("TC-00"))
    .map(e => e.testCaseId);

  // Calculate coverage per environment
  const results = [
    calculateCoverage("Stage",      requiredCases, stageExecuted),
    calculateCoverage("Beta",       requiredCases, betaExecuted),
    calculateCoverage("Production", requiredCases, prodExecuted),
  ];

  // Print results
  results.forEach(r => {
    console.log(`📍 Environment     : ${r.environment}`);
    console.log(`📋 Coverage        : ${r.executed}/${r.total} cases (${r.percentage}%)`);
    console.log(`🏁 Status          : ${r.status}`);

    if (r.missedHighPriority.length > 0) {
      console.log(`🔴 Missed HIGH     : ${r.missedHighPriority.join(", ")}`);
    }

    if (r.missedCases.length > 0) {
      console.log(`📝 Missed Cases    :`);
      r.missedCases.forEach(c => console.log(`   ↳ ${c}`));
    }

    console.log("────────────────────────────────────────\n");
  });

  // ─────────────────────────────────────────
  // SIGN-OFF RECOMMENDATION
  // ─────────────────────────────────────────
  const allPassed = results.every(r => r.percentage >= 80);
  const hasHighPriorityGaps = results.some(r => r.missedHighPriority.length > 0);
  const hasWarnings = results.some(r => r.percentage < 80);

  console.log("════════════════════════════════════════");
  console.log("📊 QA LEAD SIGN-OFF RECOMMENDATION");
  console.log("════════════════════════════════════════");

  if (allPassed && !hasHighPriorityGaps) {
    console.log("✅ SAFE TO RELEASE");
    console.log("   Coverage is sufficient across all environments");
  } else if (hasHighPriorityGaps) {
    console.log("🚨 DO NOT RELEASE");
    console.log("   High priority test cases are missing!");
    console.log("   ⚡ QA Lead must review missed cases before release");
  } else if (hasWarnings) {
    console.log("⚠️  RELEASE WITH CAUTION");
    console.log("   Some environments have low coverage");
    console.log("   ⚡ QA Lead acknowledgement required");
  }

  console.log("════════════════════════════════════════");
}

generateReport();

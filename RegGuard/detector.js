// ─────────────────────────────────────────
// RegGuard - Phase 1: Bulk Mark Detector
// Now powered by Zephyr integration layer!
// ─────────────────────────────────────────

import { getExecutions } from './zephyr.js';

// ─────────────────────────────────────────
// BULK MARK DETECTOR FUNCTION
// ─────────────────────────────────────────
function checkBulkMarking(executions) {

  // Step 1: Filter only PASS results
  const passes = executions.filter(e => e.status === "PASS");

  // Step 2: If less than 5 passes, nothing suspicious
  if (passes.length < 5) {
    return { flagged: false, message: "✅ Not enough cases to analyse yet." };
  }

  // Step 3: Sort by time — earliest first
  const sorted = passes.sort((a, b) => a.executedAt - b.executedAt);

  // Step 4: Check if 5 cases were passed within 3 minutes
  for (let i = 0; i <= sorted.length - 5; i++) {
    const first = sorted[i].executedAt;
    const fifth = sorted[i + 4].executedAt;
    const secondsDiff = (fifth - first) / 1000;

    if (secondsDiff < 180) {
      return {
        flagged: true,
        alert: "🚨 BULK MARKING DETECTED!",
        tester: sorted[i].tester,
        cases_marked: 5,
        time_taken_seconds: Math.round(secondsDiff),
        flagged_cases: sorted.slice(i, i + 5).map(e => e.testCaseId),
        action: "Notify QA Lead immediately — request evidence from tester"
      };
    }
  }

  return { flagged: false, message: "✅ Execution pattern looks genuine." };
}

// ─────────────────────────────────────────
// CHECK FOR MISSING EVIDENCE
// High priority cases need proof!
// ─────────────────────────────────────────
function checkMissingEvidence(executions) {
  const missingEvidence = executions.filter(e =>
    e.status === "PASS" && e.evidence === null
  );

  return missingEvidence.map(e => e.testCaseId);
}

// ─────────────────────────────────────────
// MAIN — Pull from Zephyr and Run Detector
// ─────────────────────────────────────────
async function main() {
  console.log("🤖 RegGuard — Bulk Mark Detector");
  console.log("════════════════════════════════════════");

  // Pull execution data from Zephyr (mock for now)
  const zephyrData = await getExecutions("Sprint 24", "Stage");
  const executions = zephyrData.executions;

  console.log(`📋 Sprint      : ${zephyrData.sprint}`);
  console.log(`📍 Environment : ${zephyrData.environment}`);
  console.log(`📊 Executions  : ${executions.length} records found`);
  console.log("════════════════════════════════════════\n");

  // Run bulk mark detection
  const result = checkBulkMarking(executions);

  if (result.flagged) {
    console.log(result.alert);
    console.log("────────────────────────────────────────");
    console.log(`👤 Tester          : ${result.tester}`);
    console.log(`📋 Cases Marked    : ${result.cases_marked} PASS in ${result.time_taken_seconds} seconds`);
    console.log(`🔍 Flagged Cases   : ${result.flagged_cases.join(", ")}`);
    console.log(`⚡ Action          : ${result.action}`);
  } else {
    console.log(result.message);
  }

  // Check for missing evidence
  console.log("\n════════════════════════════════════════");
  console.log("🔍 Evidence Check");
  console.log("════════════════════════════════════════");
  const missingEvidence = checkMissingEvidence(executions);

  if (missingEvidence.length > 0) {
    console.log(`⚠️  Cases missing evidence: ${missingEvidence.join(", ")}`);
    console.log(`⚡ Action: Request screenshots from testers before sign-off`);
  } else {
    console.log("✅ All executed cases have evidence attached");
  }
}

main();

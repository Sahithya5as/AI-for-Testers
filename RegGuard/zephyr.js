// ─────────────────────────────────────────
// RegGuard - Zephyr Integration Layer
// 
// RIGHT NOW: Simulates Zephyr API responses
// LATER: Change USE_REAL_ZEPHYR to true
//        and add your real credentials
//        — everything else stays the same!
// ─────────────────────────────────────────

// ⚡ THIS IS THE ONLY LINE YOU CHANGE LATER
const USE_REAL_ZEPHYR = false;

// Your real Zephyr credentials (fill these later)
const ZEPHYR_CONFIG = {
  baseUrl: "https://yourcompany.atlassian.net",
  email: "your-email@company.com",
  apiToken: "your-jira-api-token",
  zephyrToken: "your-zephyr-api-token",
  projectKey: "PROJ"
};

// ─────────────────────────────────────────
// WHAT REAL ZEPHYR API RETURNS
// This is the exact format Zephyr Scale
// sends back when you ask for test cases
// ─────────────────────────────────────────
const mockZephyrTestCases = {
  projectKey: "PROJ",
  sprint: "Sprint 24",
  total: 10,
  testCases: [
    {
      id: "TC-001",
      key: "PROJ-TC-001",
      summary: "Verify OTP login on iOS",
      area: "Authentication",
      priority: "High",
      device: "iPhone 14 — iOS 16+",
      status: "NOT_EXECUTED",
      assignee: null,
      steps: [
        "Open app on iPhone 14",
        "Enter valid phone number",
        "Tap Send OTP",
        "Enter received OTP code",
        "Verify user lands on home screen"
      ],
      expectedResult: "User successfully logged in via OTP"
    },
    {
      id: "TC-002",
      key: "PROJ-TC-002",
      summary: "Verify OTP login on Android",
      area: "Authentication",
      priority: "High",
      device: "Samsung S23 — Android 12+",
      status: "NOT_EXECUTED",
      assignee: null,
      steps: [
        "Open app on Samsung S23",
        "Enter valid phone number",
        "Tap Send OTP",
        "Enter received OTP code",
        "Verify user lands on home screen"
      ],
      expectedResult: "User successfully logged in via OTP"
    },
    {
      id: "TC-003",
      key: "PROJ-TC-003",
      summary: "Verify Stripe payment on iOS",
      area: "Payment",
      priority: "High",
      device: "iPhone 14 — iOS 16+",
      status: "NOT_EXECUTED",
      assignee: null,
      steps: [
        "Add item to cart",
        "Tap Checkout",
        "Verify Stripe payment form loads (not Razorpay)",
        "Enter test card details",
        "Complete payment"
      ],
      expectedResult: "Order confirmed with Stripe transaction ID"
    },
    {
      id: "TC-004",
      key: "PROJ-TC-004",
      summary: "Verify Stripe payment on Android",
      area: "Payment",
      priority: "High",
      device: "Samsung S23 — Android 12+",
      status: "NOT_EXECUTED",
      assignee: null,
      steps: [
        "Add item to cart",
        "Tap Checkout",
        "Verify Stripe payment form loads (not Razorpay)",
        "Enter test card details",
        "Complete payment"
      ],
      expectedResult: "Order confirmed with Stripe transaction ID"
    },
    {
      id: "TC-005",
      key: "PROJ-TC-005",
      summary: "Verify photo upload on profile — iOS",
      area: "Profile",
      priority: "Medium",
      device: "iPhone 14 — iOS 16+",
      status: "NOT_EXECUTED",
      assignee: null,
      steps: [
        "Go to Profile page",
        "Tap Upload Photo",
        "Select a 4MB JPG image",
        "Confirm upload",
        "Verify photo appears on profile"
      ],
      expectedResult: "Photo saved and displayed correctly"
    },
    {
      id: "TC-006",
      key: "PROJ-TC-006",
      summary: "Verify photo upload rejection over 5MB",
      area: "Profile",
      priority: "Medium",
      device: "Samsung S23 — Android 12+",
      status: "NOT_EXECUTED",
      assignee: null,
      steps: [
        "Go to Profile page",
        "Tap Upload Photo",
        "Select a 6MB image",
        "Attempt upload"
      ],
      expectedResult: "Clear error message shown — upload rejected"
    },
    {
      id: "TC-007",
      key: "PROJ-TC-007",
      summary: "Verify search returns 20 results on iOS",
      area: "Search",
      priority: "Low",
      device: "iPhone 14 — iOS 16+",
      status: "NOT_EXECUTED",
      assignee: null,
      steps: [
        "Go to Search",
        "Enter any search term",
        "Count results on first page"
      ],
      expectedResult: "20 results shown (not 10)"
    },
    {
      id: "TC-008",
      key: "PROJ-TC-008",
      summary: "Verify checkout button on Samsung",
      area: "Checkout",
      priority: "High",
      device: "Samsung S23 — Android 12+",
      status: "NOT_EXECUTED",
      assignee: null,
      steps: [
        "Add item to cart on Samsung device",
        "Tap Checkout button",
        "Verify button responds on first tap"
      ],
      expectedResult: "Checkout proceeds without unresponsive button"
    },
    {
      id: "TC-009",
      key: "PROJ-TC-009",
      summary: "Verify API OTP endpoint",
      area: "Authentication",
      priority: "High",
      device: "API v3",
      status: "NOT_EXECUTED",
      assignee: null,
      steps: [
        "POST /auth/otp with valid phone number",
        "Check response status code",
        "Check response body"
      ],
      expectedResult: "200 response with OTP triggered confirmation"
    },
    {
      id: "TC-010",
      key: "PROJ-TC-010",
      summary: "Verify Stripe API endpoint",
      area: "Payment",
      priority: "High",
      device: "API v3",
      status: "NOT_EXECUTED",
      assignee: null,
      steps: [
        "POST /checkout with valid Stripe card token",
        "Check response status code",
        "Verify Stripe transaction ID in response"
      ],
      expectedResult: "200 response with Stripe transaction ID"
    }
  ]
};

// ─────────────────────────────────────────
// MOCK EXECUTION DATA
// Simulates what Zephyr returns after
// testers have executed test cases
// ─────────────────────────────────────────
const mockZephyrExecutions = {
  sprint: "Sprint 24",
  environment: "Stage",
  executions: [
    { testCaseId: "TC-001", status: "PASS", tester: "Priya", executedAt: new Date("2024-01-15T10:00:00"), evidence: null },
    { testCaseId: "TC-002", status: "PASS", tester: "Priya", executedAt: new Date("2024-01-15T10:00:45"), evidence: null },
    { testCaseId: "TC-003", status: "PASS", tester: "Priya", executedAt: new Date("2024-01-15T10:01:10"), evidence: null },
    { testCaseId: "TC-004", status: "PASS", tester: "Priya", executedAt: new Date("2024-01-15T10:01:30"), evidence: null },
    { testCaseId: "TC-005", status: "PASS", tester: "Priya", executedAt: new Date("2024-01-15T10:01:55"), evidence: null },
    { testCaseId: "TC-006", status: "FAIL", tester: "Rahul", executedAt: new Date("2024-01-15T11:00:00"), evidence: "screenshot_tc006.png" },
    { testCaseId: "TC-007", status: "PASS", tester: "Rahul", executedAt: new Date("2024-01-15T11:30:00"), evidence: null },
  ]
};

// ─────────────────────────────────────────
// ZEPHYR API FUNCTIONS
// These are the functions RegGuard calls
// Right now they return mock data
// Later they call real Zephyr API
// ─────────────────────────────────────────

// GET TEST CASES for a sprint
export async function getTestCases(sprint) {
  if (USE_REAL_ZEPHYR) {
    // 🔴 REAL ZEPHYR CALL (uncomment when you have access)
    // const response = await fetch(
    //   `${ZEPHYR_CONFIG.baseUrl}/rest/atm/1.0/testcase/search?query=projectKey="${ZEPHYR_CONFIG.projectKey}"`,
    //   {
    //     headers: {
    //       "Authorization": "Bearer " + ZEPHYR_CONFIG.zephyrToken,
    //       "Content-Type": "application/json"
    //     }
    //   }
    // );
    // return await response.json();
  }

  // ✅ MOCK DATA (returns fake Zephyr response)
  console.log(`📡 [Zephyr Mock] Fetching test cases for: ${sprint}`);
  return mockZephyrTestCases;
}

// GET EXECUTIONS for a sprint + environment
export async function getExecutions(sprint, environment) {
  if (USE_REAL_ZEPHYR) {
    // 🔴 REAL ZEPHYR CALL (uncomment when you have access)
    // const response = await fetch(
    //   `${ZEPHYR_CONFIG.baseUrl}/rest/atm/1.0/testrun/search?query=projectKey="${ZEPHYR_CONFIG.projectKey}"`,
    //   {
    //     headers: {
    //       "Authorization": "Bearer " + ZEPHYR_CONFIG.zephyrToken
    //     }
    //   }
    // );
    // return await response.json();
  }

  // ✅ MOCK DATA (returns fake execution records)
  console.log(`📡 [Zephyr Mock] Fetching executions for: ${sprint} — ${environment}`);
  return mockZephyrExecutions;
}

// UPDATE test case status in Zephyr
export async function updateTestCaseStatus(testCaseId, status, tester) {
  if (USE_REAL_ZEPHYR) {
    // 🔴 REAL ZEPHYR CALL (uncomment when you have access)
    // await fetch(
    //   `${ZEPHYR_CONFIG.baseUrl}/rest/atm/1.0/testresult`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Authorization": "Bearer " + ZEPHYR_CONFIG.zephyrToken,
    //       "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify({ testCaseKey: testCaseId, status, userKey: tester })
    //   }
    // );
  }

  // ✅ MOCK (just logs what would happen)
  console.log(`📡 [Zephyr Mock] Updated ${testCaseId} → ${status} by ${tester}`);
  return { success: true, testCaseId, status };
}
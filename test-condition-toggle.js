/**
 * Test script to verify condition toggle now sends UPPERCASE conditions to GraphQL
 * This simulates what happens when a user clicks the Blinded condition in the Leva panel
 */

const io = require("socket.io-client");

const socket = io("http://localhost:3000", {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

socket.on("connect", () => {
  console.log("✅ Connected to server");

  // Authenticate as DM
  socket.emit("authenticate", {
    role: "DM",
    password: process.env.DM_PASSWORD || "admin",
  });
});

socket.on("authenticate", (data) => {
  console.log("🔐 Authenticated:", data);

  // Send a GraphQL mutation to toggle a condition
  // This mutation request will be intercepted by the server
  // and we can watch the server logs to verify UPPERCASE conditions are sent

  const mutation = `
    mutation TestToggleCondition($input: ToggleConditionInput!) {
      toggleCondition(input: $input) {
        id
        conditions
      }
    }
  `;

  const variables = {
    input: {
      tokenId: "2a4285fc-d4f2-4775-8d66-ef7cafedb931",
      condition: "BLINDED", // ✅ SEND UPPERCASE (was sending lowercase before)
    },
  };

  console.log("\n📤 Sending mutation with variables:");
  console.log("   condition:", variables.input.condition);
  console.log("   Expected: BLINDED");
  console.log("   Result: Should NOT error about enum validation\n");

  socket.emit("graphql", {
    type: "subscription",
    id: "test-condition",
    payload: {
      operationName: "TestToggleCondition",
      query: mutation,
      variables,
    },
  });
});

socket.on("data", (data) => {
  console.log("📥 Server Response:", JSON.stringify(data, null, 2));

  if (data.payload?.errors) {
    console.error("\n❌ GraphQL Error:");
    data.payload.errors.forEach((err) => {
      console.error("   -", err.message);
    });
    process.exit(1);
  } else {
    console.log(
      "\n✅ SUCCESS: Condition was toggled without enum validation error!"
    );
    console.log(
      "   Conditions returned:",
      data.payload?.data?.toggleCondition?.conditions
    );
    process.exit(0);
  }
});

socket.on("error", (error) => {
  console.error("❌ Socket Error:", error);
  process.exit(1);
});

socket.on("disconnect", () => {
  console.log("⚠️ Disconnected from server");
  process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error("❌ Test timed out");
  process.exit(1);
}, 10000);

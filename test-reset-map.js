// Simple test script to verify the reset map mutation
const http = require("http");

const query = `
  mutation mapTokenRemoveMany($input: MapTokenRemoveManyInput!) {
    mapTokenRemoveMany(input: $input)
  }
`;

const variables = {
  input: {
    mapId: "21dc4ebc-923a-4aa0-9f98-b2e184140a2d",
    tokenIds: [
      "f7b6b41a-38a4-443c-9d3f-b60739c88b26",
      "2a4285fc-d4f2-4775-8d66-ef7cafedb931",
      "2eb3de73-7e30-47d9-9b6f-457a8d1ec85e",
    ],
  },
};

const payload = JSON.stringify({
  query,
  variables,
});

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/graphql",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": payload.length,
    Authorization: "Bearer test-dm-password",
  },
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });
  res.on("end", () => {
    console.log("Response:", data);
    try {
      const parsed = JSON.parse(data);
      if (parsed.errors) {
        console.error("GraphQL Errors:", parsed.errors);
      } else {
        console.log("Success! Result:", parsed.data);
      }
    } catch (e) {
      console.error("Failed to parse response:", e.message);
    }
  });
});

req.on("error", (error) => {
  console.error("Error:", error.message);
});

console.log("Sending mutation to http://localhost:3000/graphql");
console.log("Query:", query);
console.log("Variables:", JSON.stringify(variables, null, 2));
console.log("---");

req.write(payload);
req.end();

const Database = require("better-sqlite3");
const db = new Database("./data/db.sqlite");

// Update the token with conditions
db.prepare(
  `
  UPDATE token_data 
  SET conditions = ? 
  WHERE token_id = ?
`
).run(
  JSON.stringify(["charmed", "incapacitated", "poisoned"]),
  "2a4285fc-d4f2-4775-8d66-ef7cafedb931"
);

// Verify
const result = db
  .prepare(
    `
  SELECT * FROM token_data WHERE token_id = ?
`
  )
  .get("2a4285fc-d4f2-4775-8d66-ef7cafedb931");

console.log("Updated token:", result);
db.close();

const fs = require("fs");
const mysql = require("mysql2");

const env = fs.readFileSync(".env", "utf8");
const line = env.split(/\r?\n/).find(x => x.startsWith("DATABASE_URL="));

if (!line) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const raw = line.substring("DATABASE_URL=".length).trim().replace(/^"(.*)"$/, "$1");
const url = new URL(raw);

const config = {
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: decodeURIComponent(url.pathname.substring(1)),
};

console.log("Testing MySQL connection...");
console.log("Host:", config.host);
console.log("Port:", config.port);
console.log("User:", config.user);
console.log("Database:", config.database);

const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.error("\nMYSQL ERROR");
    console.error("Code:", err.code);
    console.error("Message:", err.message);
    process.exit(1);
  }

  console.log("\nMYSQL CONNECTION SUCCESS");
  connection.end();
});
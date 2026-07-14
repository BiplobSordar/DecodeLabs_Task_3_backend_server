import app from "./app.js";
import env from "./config/env.js";
import pool from "./config/db.js";

const startServer = async () => {
  try {
    await pool.query("SELECT NOW()");

    console.log("PostgreSQL Connected");

    app.listen(env.port, () => {
      console.log(`
====================================
Server Started
Environment : ${env.nodeEnv}
Port        : ${env.port}
====================================
`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
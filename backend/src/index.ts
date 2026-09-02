import { app } from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🛡️  SENTINEL BACKEND SERVICE INITIALIZED (PHASE 2)`);
  console.log(`📡 Listening on: http://localhost:${PORT}`);
  console.log(`🔒 Mode: Paper Trading (ALPACA_PAPER_TRADE=${process.env.ALPACA_PAPER_TRADE})`);
  console.log(`=======================================================`);
});

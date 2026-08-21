import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './services/database.js';

const port = process.env.PORT || 5000;

connectDatabase()
  .then(() => {
    app.listen(port, () => console.log(`ASL Bridge API listening on port ${port}`));
  })
  .catch((error) => {
    console.warn(`Database connection warning: ${error.message}. Starting API in offline DB mode...`);
    app.listen(port, () => console.log(`ASL Bridge API listening on port ${port} (standalone mode)`));
  });


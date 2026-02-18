import app from './app';
import { connectDatabase } from './database/mongodb';
import { PORT } from './config';

async function startServer() {
  await connectDatabase();
  app.listen(
    PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();


// test
// npm install --save-dev jest supertest @types/supertest @types/jest
// npm install ts-jest uuid@11
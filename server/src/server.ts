import { config } from './config/config.js';
import { app } from './app.js';

const port = config().port;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(
    `Swagger UI available at http://localhost:${port}/api/docs`,
  );
});

import app from './app.ts';
import { config } from './config/config.ts';

const port = config().port;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

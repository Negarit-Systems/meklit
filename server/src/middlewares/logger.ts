import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

// Custom token for colored status codes
morgan.token('status-colored', (req: Request, res: Response) => {
  const status = res.statusCode;
  let color = '\x1b[0m'; // reset

  if (status >= 500) {
    color = '\x1b[31m'; // red
  } else if (status >= 400) {
    color = '\x1b[33m'; // yellow
  } else if (status >= 300) {
    color = '\x1b[36m'; // cyan
  } else if (status >= 200) {
    color = '\x1b[32m'; // green
  }

  return `${color}${status}\x1b[0m`;
});

// Custom token for colored method
morgan.token('method-colored', (req: Request) => {
  const method = req.method;
  let color = '\x1b[0m'; // reset

  switch (method) {
    case 'GET':
      color = '\x1b[32m'; // green
      break;
    case 'POST':
      color = '\x1b[33m'; // yellow
      break;
    case 'PUT':
      color = '\x1b[34m'; // blue
      break;
    case 'DELETE':
      color = '\x1b[31m'; // red
      break;
    case 'PATCH':
      color = '\x1b[35m'; // magenta
      break;
  }

  return `${color}${method}\x1b[0m`;
});

const logger = (req: Request, res: Response, next: NextFunction) => {
  morgan(':method-colored :url :status-colored :response-time ms - :res[content-length]')(
    req,
    res,
    next,
  );
};
export default logger;

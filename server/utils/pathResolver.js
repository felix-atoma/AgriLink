import { pathToFileURL } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const resolvePath = (relativePath) => {
  // Correct the path resolution to point to project root
  const absolutePath = path.resolve(__dirname, '..', relativePath);
  return pathToFileURL(absolutePath).href;
};

export const __dirnameESM = __dirname;
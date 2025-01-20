import fs from 'fs';
import path from 'path';
const unlinkFile = (filePath: string) => {
  const fullPath = path.join(process.cwd(), filePath);
  fs.unlink(fullPath, (err) => {
    if (err) {
      console.error(`Error deleting file: ${filePath}`, err);
    } else {
      console.log(`File deleted: ${filePath}`);
    }
  });
};

export default unlinkFile;

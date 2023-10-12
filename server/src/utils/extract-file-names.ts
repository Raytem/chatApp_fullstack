export function extractFileNames(files: Express.Multer.File[]) {
  return files.map((file) => file.filename);
}

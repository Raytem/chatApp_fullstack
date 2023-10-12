export function fileNameFromOriginalFileName(originalFileName: string) {
  return originalFileName.replace(/\.[^.]*$/, '');
}
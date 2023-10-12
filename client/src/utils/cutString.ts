export const cutString = (str: string, maxLen: number) => {
  if (!str) return str;

  if (str.length > maxLen - 3) {
    return str.split('').slice(0, maxLen - 3).join('') + '...';
  }
  return str;
}
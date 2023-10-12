export const getDevice = (userAgent: string) => {
  console.log('userAgent: ->>>>>> ', userAgent);
  if (!userAgent) {
    return 'Uninitialized';
  }
  const matches = userAgent.match(/\((.+?)\)/) || [];
  if (matches.length >= 2) {
    return matches[1];
  }
  return userAgent;
};

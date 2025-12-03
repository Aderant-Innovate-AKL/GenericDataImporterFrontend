export const getAccordionBorderStyle = (index: number, length: number) => {
  if (index === 0 && index === length - 1) return 'rounded';
  if (index === 0) return 'firstOf';
  if (index === length - 1) return 'lastOf';

  return 'none';
};

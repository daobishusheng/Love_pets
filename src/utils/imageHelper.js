export const getImageState = (hunger, happiness, cleanliness, energy, isSleeping) => {
  if (isSleeping) {
    return 'happy';
  }
  
  if (hunger < 30) return 'hungry';
  if (happiness < 30) return 'sad';
  if (cleanliness < 30) return 'dirty';
  if (energy < 30) return 'sick';
  
  return 'happy';
};
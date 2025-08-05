const resolveStatusArray = (status: Array<number>) => {
  if (status.length === 0) return 'CriticalRange';

  if (status[4] > 0) {
    return 'CriticalRange';
  }
  if (status[3] > 0) {
    return 'DiseaseRange';
  }
  if (status[2] > 0) {
    return 'BorderlineRange';
  }
  if (status[1] > 0) {
    return 'HealthyRange';
  }
  return 'OptimalRange';
};

export default resolveStatusArray;

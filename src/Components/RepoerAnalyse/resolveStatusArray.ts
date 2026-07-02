const resolveStatusArray = (status: Array<number>) => {
  if (!status || status.length === 0) {
    return undefined;
  }
  const total = status.reduce((sum, value) => sum + (Number(value) || 0), 0);
  if (total <= 0) {
    return undefined;
  }

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

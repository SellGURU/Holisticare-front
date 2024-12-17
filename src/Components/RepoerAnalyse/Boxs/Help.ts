type ChartBounds = Record<string, [number, number][]>;

// Helper function to find the minimum key
const sortKeysWithValues = (chartBounds: ChartBounds): { key: string; value: [number, number] }[] => {
  // Create an array to store key-value pairs with starting values
  const rangesWithKeys: { key: string; value: [number, number] }[] = [];

  // Extract starting values with their corresponding keys and ranges
  for (const [key, ranges] of Object.entries(chartBounds)) {
    for (const range of ranges) {
      rangesWithKeys.push({ key, value: range });
    }
  }

  // Sort the array by the starting values of the ranges
  rangesWithKeys.sort((a, b) => a.value[0] - b.value[0]);

  return rangesWithKeys; // Return sorted array of key-value pairs
};
const resolveMaxValue = (chartBounds: ChartBounds): { key: string; value: [number, number] } => {
  let maxValue = -Infinity; // Start with a very small value
  let result: { key: string; value: [number, number] } = {
    key:"",
    value:[10,10]
  };

  // Iterate through each key and its ranges
  for (const [key, ranges] of Object.entries(chartBounds)) {
    for (const range of ranges) {
      if (range[1] > maxValue) { // Compare the ending value of the interval
        maxValue = range[1];
        result = { key, value: range };
      }
    }
  }

  return result; // Return the key and range with the maximum value
};

export {sortKeysWithValues,resolveMaxValue}
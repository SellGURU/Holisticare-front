// Keep track of used positions for each base name
const usedPositions: { [key: string]: Set<number> } = {};

// Function to clear used positions
export const clearUsedPositions = (name?: string) => {
  if (name) {
    // Clear positions for specific name
    const baseName = name.replace(/\d+/g, '').trim();
    usedPositions[baseName] = new Set();
  } else {
    // Clear all positions
    Object.keys(usedPositions).forEach((key) => {
      usedPositions[key] = new Set();
    });
  }
};

const resolvePosition = (name: string) => {
  // Remove any numbers from the input name
  const baseName = name.replace(/\d+/g, '').trim();

  const positions = [
    {
      name: 'abdomen1',
      position: {
        top: 250,
        left: 160,
      },
    },
    {
      name: 'abdomen2',
      position: {
        top: 254,
        left: 182,
      },
    },
    {
      name: 'abdomen3',
      position: {
        top: 244,
        left: 192,
      },
    },
    {
      name: 'abdomen4',
      position: {
        top: 260,
        left: 165,
      },
    },
    {
      name: 'abdomen5',
      position: {
        top: 260,
        left: 180,
      },
    },
    {
      name: 'abdomen6',
      position: {
        top: 240,
        left: 180,
      },
    },
    {
      name: 'abdomen7',
      position: {
        top: 240,
        left: 160,
      },
    },
    {
      name: 'abdomen8',
      position: {
        top: 247,
        left: 157,
      },
    },
    {
      name: 'abdomen9',
      position: {
        top: 227,
        left: 147,
      },
    },
    {
      name: 'right hand1',
      position: {
        top: 190,
        left: 90,
      },
    },
    {
      name: 'Hand1',
      position: {
        top: 192,
        left: 92,
      },
    },
    {
      name: 'right hand2',
      position: {
        top: 220,
        left: 80,
      },
    },
    {
      name: 'right hand3',
      position: {
        top: 250,
        left: 70,
      },
    },
    {
      name: 'left hand',
      position: {
        top: 190,
        left: 230,
      },
    },
    {
      name: 'left hand2',
      position: {
        top: 195,
        left: 235,
      },
    },
    {
      name: 'kidney1',
      position: {
        top: 260,
        left: 130,
      },
    },
    {
      name: 'heart1',
      position: {
        top: 160,
        left: 180,
      },
    },
    {
      name: 'heart2',
      position: {
        top: 154,
        left: 190,
      },
    },
    {
      name: 'heart3',
      position: {
        top: 164,
        left: 190,
      },
    },
    {
      name: 'heart4',
      position: {
        top: 160,
        left: 195,
      },
    },
    {
      name: 'head1',
      position: {
        top: 52,
        left: 180,
      },
    },
    {
      name: 'head2',
      position: {
        top: 52,
        left: 170,
      },
    },
    {
      name: 'head3',
      position: {
        top: 75,
        left: 170,
      },
    },

    {
      name: 'head4',
      position: {
        top: 62,
        left: 155,
      },
    },
    {
      name: 'head5',
      position: {
        top: 60,
        left: 155,
      },
    },
    {
      name: 'head6',
      position: {
        top: 70,
        left: 165,
      },
    },
    {
      name: 'head7',
      position: {
        top: 62,
        left: 140,
      },
    },
    {
      name: 'head8',
      position: {
        top: 62,
        left: 149,
      },
    },
    {
      name: 'head9',
      position: {
        top: 87,
        left: 138,
      },
    },
    {
      name: 'head10',
      position: {
        top: 92,
        left: 169,
      },
    },
    {
      name: 'head11',
      position: {
        top: 90,
        left: 162,
      },
    },
    {
      name: 'chest',
      position: {
        top: 160,
        left: 160,
      },
    },
    {
      name: 'chest2',
      position: {
        top: 161,
        left: 161,
      },
    },
    {
      name: 'chest3',
      position: {
        top: 165,
        left: 150,
      },
    },
    {
      name: 'neck2',
      position: {
        top: 120,
        left: 160,
      },
    },
    {
      name: 'neck3',
      position: {
        top: 123,
        left: 163,
      },
    },
    {
      name: 'torso1',
      position: {
        top: 210,
        left: 140,
      },
    },
    {
      name: 'torso2',
      position: {
        top: 215,
        left: 145,
      },
    },
    {
      name: 'torso3',
      position: {
        top: 218,
        left: 150,
      },
    },
    {
      name: 'lower abdomen',
      position: {
        top: 270,
        left: 172,
      },
    },
    {
      name: 'lower abdomen1',
      position: {
        top: 273,
        left: 163,
      },
    },
    {
      name: 'lower abdomen2',
      position: {
        top: 275,
        left: 176,
      },
    },
  ];

  // Find all positions that match the base name
  const matchingPositions = positions.filter((el) => {
    const elementBaseName = el.name.replace(/\d+/g, '').trim();
    return elementBaseName === baseName;
  });

  if (matchingPositions.length > 0) {
    // Initialize used positions set for this base name if it doesn't exist
    if (!usedPositions[baseName]) {
      usedPositions[baseName] = new Set();
    }

    // Find the first position that hasn't been used yet
    for (let i = 0; i < matchingPositions.length; i++) {
      if (!usedPositions[baseName].has(i)) {
        usedPositions[baseName].add(i);
        return matchingPositions[i].position;
      }
    }

    // If all positions have been used, clear the used positions and start over
    usedPositions[baseName].clear();
    usedPositions[baseName].add(0);
    return matchingPositions[0].position;
  }

  // If no matches found, return the first position in the array
  return positions[0].position;
};

export default resolvePosition;

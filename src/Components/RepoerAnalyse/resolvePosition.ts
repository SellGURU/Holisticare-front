const resolvePosition = (name: string) => {
  const positions = [
    {
      name: 'abdomen6',
      position: {
        top: 250,
        left: 160,
      },
    },
    {
      name: 'abdomen3',
      position: {
        top: 260,
        left: 165,
      },
    },
    {
      name: 'abdomen8',
      position: {
        top: 260,
        left: 180,
      },
    },
    {
      name: 'abdomen9',
      position: {
        top: 240,
        left: 180,
      },
    },
    {
      name: 'abdomen10',
      position: {
        top: 240,
        left: 160,
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
      name: 'right hand4',
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
      name: 'heart4',
      position: {
        top: 164,
        left: 190,
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
      name: 'chest7',
      position: {
        top: 161,
        left: 161,
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
      name: 'torso',
      position: {
        top: 210,
        left: 140,
      },
    },
    {
      name: 'torso1',
      position: {
        top: 215,
        left: 145,
      },
    },
    {
      name: 'torso2',
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
  return positions.filter((el) => el.name == name).length > 0
    ? positions.filter((el) => el.name == name)[0].position
    : positions[0].position;
};

export default resolvePosition;

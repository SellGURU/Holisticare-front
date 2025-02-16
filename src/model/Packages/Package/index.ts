class Package {
  constructor(private _type: PackageTypes) {}

  public get type() {
    return this._type;
  }

  public get expiredDate() {
    return 'Jan 28, 2024';
  }

  public getDescription() {
    switch (this.type) {
      case 'Free':
        return 'You are currently on the free plan, which provides access to basic features and tools. For access to all features, you can upgrade.';
      case 'Plus':
        return 'You are currently on the Plus plan, which provides access to more features and tools, but not all. To access all features, you can upgrade to the Pro plan.';
      case 'Pro':
        return 'You are currently on the Pro plan, which provides access to all features and tools.';
    }
  }

  public get access() {
    if (this.type == 'Free') {
      return 1;
    }
    if (this.type == 'Plus') {
      return 2;
    }
    if (this.type == 'Pro') {
      return 3;
    }
    return 1;
  }
}

export default Package;

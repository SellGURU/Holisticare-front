import Package from '../Package';

class PackageManager {
  public curentPackage: Package = new Package('Free');
  constructor() {}

  public get lastUpdate() {
    return '2024/02/02';
  }

  public changePackage(packageName: PackageTypes) {
    this.curentPackage = new Package(packageName);
  }
}

export default PackageManager;

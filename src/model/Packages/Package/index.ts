class Package {
  constructor(private _type: PackageTypes) {}

  public get type() {
    return this._type;
  }
}

export default Package;

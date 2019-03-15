class Content {
  constructor() {
    this.count = 0;
    this.loaded = 0;    
    this.assets = [];
    this.names = [];
  }

  add(_name, _asset) {
    this.assets[_name] = _asset;
    this.names.push(_name);
  }

  dispose(){
      
  }

}
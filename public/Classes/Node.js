class Node{
    constructor(key, value) {
      "use strict";
      this.key_ = key;
      this.value_ = value;
    }
    
    getKey() {
      "use strict";
      return this.key_;
    }
  
    getValue() {
      "use strict";
      return this.value_;
    }
  
    clone() {
      "use strict";
      return new goog.structs.Node(this.key_, this.value_);
    }
  }
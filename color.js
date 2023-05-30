var Color = (function() {
  "use strict";

  const HEXPERCENT = 1 / 51 * 20;

  function Color(r, g, b, a) {
    var rgba = [r, g, b, a];
    
    for (var i = 0; i < rgba.length - 1; i++) {
      rgba[i] = moveInRange(parseInt(rgba[i]), 0, 255);
    }
    // Alpha is separate since it can be a floating point and defaults to 255.
    rgba[3] = moveInRange(parseFloat(rgba[3]), 0, 255) || 255;

    this.r = rgba[0];
    this.g = rgba[1];
    this.b = rgba[2];
    this.a = rgba[3];
  }
  
  Object.defineProperty(Color, "FORMATS", {
    value: ["rgb", "rgba", "hex", "hsl", "hsla", "name"],
    writable: false,
    enumerable: true
  });

  Color.fromHex = function(r, g, b, a) {
    var rgba = [r, g, b, a];
    
    // No need to separate alpha here. <a> cannot be a float.
    for (var i = 0; i < rgba.length; i++) {
      if (rgba[i].length === 1) {
        rgba[i] = rgba[i] + rgba[i];
      }
      // Color verification is ran in <Color>.
      rgba[i] = parseInt(rgba[i], 16); 
    }

    r = rgba[0];
    g = rgba[1];
    b = rgba[2];
    a = rgba[3];

    return new Color(r, g, b, a);
  };
  
  Color.fromHSL = function(h, s, l, a) {
    h = Math.abs(h) % 360;
    s = moveInRange(s, 0, 255) / 255;
    l = moveInRange(l, 0, 255) / 255;

    var c = s * (1 - Math.abs(2 * l - 1));
    var x = c * (1 - Math.abs(h / 60 % 2 - 1));

    var primes;
    
         if (            h < 60 ) primes = [c, x, 0];
    else if (h >= 60  && h < 120) primes = [x, c, 0];
    else if (h >= 120 && h < 180) primes = [0, c, x];
    else if (h >= 180 && h < 240) primes = [0, x, c];
    else if (h >= 240 && h < 300) primes = [x, 0, c];
    else                          primes = [c, 0, x];

    var m = l - c / 2;
    
    var r = (primes[0] + m) * 255;
    var g = (primes[1] + m) * 255;
    var b = (primes[2] + m) * 255;

    return new Color(r, g, b, a);
  };
  
  Color.fromHSV = function(h, s, v, a) {
    s = moveInRange(s, 0, 255) / 255;
    v = moveInRange(v, 0, 255) / 255;

    var l = v * (2 - s) / 2 * 255;
    
    s = (v * s) / (1 - Math.abs(2 * l - 1)) * 255;

    return Color.fromHSL(h, s, l, a);
  };

  ///// Unstable method /////
  Color.fromName = function(name) {
    if (Color.isColorName(name)) {
      var div = document.createElement("div");
      div.style.background = name;

      document.body.appendChild(div);
      var color = getComputedStyle(div).backgroundColor;
      div.parentElement.removeChild(div);

      return Color.fromFormatted(color);
    }
    
    name = name.replace(/[^0-9a-f]/g, "0");
    while (name.length % 3 != 0 || !name) {
      name += "0";
    }
    
    var rgbHex = [
      name.substring(0, name.length / 3).substring(0, 2),
      name.substring(name.length / 3, 2 * name.length / 3).substring(0, 2),
      name.substring(2 * name.length / 3).substring(0, 2),
    ];
    return Color.fromHex(rgbHex[0], rgbHex[1], rgbHex[2]);
  };
  
  /*Color.detectFormat = function(string) {
  };*/

  ///// Unstable method /////
  Color.fromFormatted = function(base) {
    // Use the typeof check so that no errors are thrown when attempting to read <base.startsWith>.
    if (typeof base != "string") {
      base = "";
    }
    
    if (base.startsWith("rgb(") && base.lastIndexOf(")") === base.length - 1) {
      let c = base.substring(base.indexOf("(") + 1, base.lastIndexOf(")")).split(",");
      return new Color(c[0], c[1], c[2], c[3]);
    } else if (base.startsWith("#")) {
      base = base.substring(1);
      let c;
      if (base.length === 3)
        c = [base[0] + base[0], base[1] + base[1], base[2] + base[2], "ff"];
      else if (base.length === 4)
        c = [base[0] + base[0], base[1] + base[1], base[2] + base[2], base[3] + base[3]];
      else
        c = [base.substring(0, 2), base.substring(2, 4), base.substring(4, 6), base.substring(6)];
      return Color.fromHex(c[0], c[1], c[2], c[3]);
    } else {
      return Color.fromName(base);
    }
  };

  Color.isColorName = function(name) {
    if (!name || name === "inherit" || name === "initial") {
      return false;
    }

    var img = document.createElement("img");
    img.style.color = "rgb(0,0,0)";
    img.style.color = name;
    if (img.style.color === name) {
      return true;
    }
    return false;
  };
  
  Color.random = function(randomizeAlpha) {
    function randint() {
      return Math.floor(Math.random() * 255);
    }
  
    return new Color(randint(), randint(), randint(), randomizeAlpha ? randint() : 255);
  };

  Color.prototype.toString = function(type) {
    switch (type) {
      // No need to break after a case; return terminates the switch block by default.
      case "rgb" :
        return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
      
      case "hex" :
        return "#" + decToHex(this.r) + decToHex(this.g) + decToHex(this.b);

      case "hsl" :
        return "hsl(" + this.h + "," + (this.s * HEXPERCENT) + "%," + (this.l * HEXPERCENT) + "%)";
      
      case "hsla":
        return "hsla(" + this.h + "," + (this.s * HEXPERCENT) + "%," + (this.l * HEXPERCENT) + "%," + (this.a / 255) + ")";
    
      // Default to "rgba".
      default:
        return "rgba(" + this.r + "," + this.g + "," + this.b + "," + (this.a / 255) + ")";
    }
    
    function decToHex(n) {
      n = n.toString(16);
      
      // Precede the <n> with a "0" if it is one character long
      n = n.length < 2 ? "0" + n : n;
      
      return n;
    }
  };
  
  Color.prototype.toInteger = function () {
    return this.toString("hex
  };

  // Hue
  Object.defineProperty(Color.prototype, "h", {
    get: function() {
      var h;

             if (this.r >= this.g && this.g >= this.b) {
        h = 60 * (this.g - this.b) / (this.r - this.b);
        
      } else if (this.g >  this.r && this.r >= this.b) {
        h = 60 * (2 - (this.r - this.b) / (this.g - this.b));
        
      } else if (this.g >= this.b && this.b >  this.r) {
        h = 60 * (2 + (this.b - this.r) / (this.g - this.r));
        
      } else if (this.b >  this.g && this.g >  this.r) {
        h = 60 * (4 - (this.g - this.r) / (this.b - this.r));
        
      } else if (this.b >  this.r && this.r >= this.g) {
        h = 60 * (4 + (this.r - this.g) / (this.b - this.g));
        
      } else if (this.r >= this.b && this.b >  this.g) {
        h = 60 * (6 - (this.b - this.g) / (this.r - this.g));
        
      }

      return isNaN(h) ? 0 : h;
    },
    
    set: function(value) {
      var color = Color.fromHSL(value, this.s, this.l);
      
      this.r = color.r;
      this.g = color.g;
      this.b = color.b;
    },
    enumerable: true
  });
  
  Object.defineProperty(Color.prototype, "s", {
    get: function() {
      var min = Math.min(this.r / 255, this.g / 255, this.b / 255);
      var max = Math.max(this.r / 255, this.g / 255, this.b / 255);

      if (max == min) {
        return 0;
      } else {
        var d = max - min;
        
        if (this.l > 255 / 2) {
          return d / (2 - max - min) * 255;
        } else {
          return d / (max + min) * 255;
        }
      }
    },
    
    set: function(value) {
      var color = Color.fromHSL(this.h, value, this.l);
      
      this.r = color.r;
      this.g = color.g;
      this.b = color.b;
    },
    enumerable: true
  });
  
  Object.defineProperty(Color.prototype, "sHSV", {
    get: function() {
      var min = Math.min(this.r, this.g, this.b);
      var max = Math.max(this.r, this.g, this.b);

      return (max - min) / max * 255 || 0;
    },
    enumerable: true
  });
  
  Object.defineProperty(Color.prototype, "l", {
    get: function() {
      return (Math.max(this.r, this.g, this.b) + Math.min(this.r, this.g, this.b)) / 2;
    },
    
    set: function(value) {
      var color = Color.fromHSL(this.h, this.s, value);
      
      this.r = color.r;
      this.g = color.g;
      this.b = color.b;
    },
    enumerable: true
  });
  
  Object.defineProperty(Color.prototype, "lPerceived", {
    get: function() {
      return ((3 * this.r + 4 * this.g + this.b) >>> 3);
    },
    enumerable: true
  });
  
  Object.defineProperty(Color.prototype, "v", {
    get: function() {
      return Math.max(this.r, this.g, this.b);
    },
    enumerable: true
  });

  Color.prototype.filter = function(type) {
    var r;
    var g;
    var b;
  
    switch(type) {
      case "invert":
        r = moveInRange(255 - this.r, 0, 255);
        g = moveInRange(255 - this.g, 0, 255);
        b = moveInRange(255 - this.b, 0, 255);

        break;

      case "grayscale":
        var avg = moveInRange(Math.round((this.r + this.g + this.b) / 3), 0, 255);
        r = avg;
        g = avg;
        b = avg;

        break;

      case "sepia":
        var l = this.perceivedL;
        r = moveInRange(l + 40, 0, 255);
        g = moveInRange(l + 20, 0, 255);
        b = moveInRange(l - 20, 0, 255);

        break;
      
      default:
        return this;
    }
    
    return new Color(r, g, b, this.a);
  };

  Color.prototype.overlay = function(color, blendMode) {
    if (arguments.length < 1) {
      throw new TypeError(
        "<Color.prototype.overlay> requires 1 argument, though " + arguments.length + " were provided."
      );
    }
  
    switch(blendMode) {
      case "add":
        return new Color(
          this.r + color.r * color.a,
          this.g + color.g * color.a,
          this.b + color.b * color.a,
          this.a
        );

      case "subtract":
        return new Color(
          this.r - color.r * color.a,
          this.g - color.g * color.a,
          this.b - color.b * color.a,
          this.a
        );

      case "difference":
        return new Color(
          Math.abs(this.r - color.r * color.a),
          Math.abs(this.g - color.g * color.a),
          Math.abs(this.b - color.b * color.a),
          this.a
        );

      case "erase":
        return new Color(
          this.r,
          this.g,
          this.b,
          this.a - color.a
        );

      default:
        return new Color(
       // (color.a * color.r + (255 - color.a) * this.r) / 255
          color.a * (color.r - this.r) / 255 + this.r,
          color.a * (color.g - this.g) / 255 + this.g,
          color.a * (color.b - this.b) / 255 + this.b,
          this.a
        );
    }
  };

  function moveInRange(num, min, max) {
    return Math.max(Math.min(num, max), min) || min;
  }

  return Color;
})();
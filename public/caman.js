(function () {
  var $,
    Analyze,
    Blender,
    Calculate,
    Caman,
    CamanParser,
    Canvas,
    Convert,
    Event,
    Fiber,
    Filter,
    IO,
    Image,
    Layer,
    Log,
    Module,
    Pixel,
    Plugin,
    Renderer,
    Root,
    Store,
    Util,
    fs,
    moduleKeywords,
    slice,
    vignetteFilters,
    __indexOf =
      [].indexOf ||
      function (item) {
        for (var i = 0, l = this.length; i < l; i++) {
          if (i in this && this[i] === item) return i;
        }
        return -1;
      },
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __bind = function (fn, me) {
      return function () {
        return fn.apply(me, arguments);
      };
    },
    __extends = function (child, parent) {
      for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
      }
      function ctor() {
        this.constructor = child;
      }
      ctor.prototype = parent.prototype;
      child.prototype = new ctor();
      child.__super__ = parent.prototype;
      return child;
    };
  moduleKeywords = ["extended", "included"];
  Module = (function () {
    function Module() {}
    Module["extends"] = function (obj) {
      var key, value, _ref;
      for (key in obj) {
        value = obj[key];
        if (__indexOf.call(moduleKeywords, key) < 0) {
          this[key] = value;
        }
      }
      if ((_ref = obj.extended) != null) {
        _ref.apply(this);
      }
      return this;
    };
    Module.includes = function (obj) {
      var key, value, _ref;
      for (key in obj) {
        value = obj[key];
        if (__indexOf.call(moduleKeywords, key) < 0) {
          this.prototype[key] = value;
        }
      }
      if ((_ref = obj.included) != null) {
        _ref.apply(this);
      }
      return this;
    };
    Module.delegate = function () {
      var args, source, target, _i, _len, _results;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      target = args.pop();
      _results = [];
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        source = args[_i];
        _results.push((this.prototype[source] = target.prototype[source]));
      }
      return _results;
    };
    Module.aliasFunction = function (to, from) {
      var _this = this;
      return (this.prototype[to] = function () {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _this.prototype[from].apply(_this, args);
      });
    };
    Module.aliasProperty = function (to, from) {
      return Object.defineProperty(this.prototype, to, {
        get: function () {
          return this[from];
        },
        set: function (val) {
          return (this[from] = val);
        },
      });
    };
    Module.included = function (func) {
      return func.call(this, this.prototype);
    };
    return Module;
  })();
  slice = Array.prototype.slice;
  $ = function (sel, root) {
    if (root == null) {
      root = document;
    }
    if (
      typeof sel === "object" ||
      (typeof exports !== "undefined" && exports !== null)
    ) {
      return sel;
    }
    return root.querySelector(sel);
  };
  Util = (function () {
    function Util() {}
    Util.uniqid = (function () {
      var id;
      id = 0;
      return {
        get: function () {
          return id++;
        },
      };
    })();
    Util.extend = function () {
      var copy, dest, obj, prop, src, _i, _len;
      (obj = arguments[0]),
        (src = 2 <= arguments.length ? __slice.call(arguments, 1) : []);
      dest = obj;
      for (_i = 0, _len = src.length; _i < _len; _i++) {
        copy = src[_i];
        for (prop in copy) {
          if (!__hasProp.call(copy, prop)) continue;
          dest[prop] = copy[prop];
        }
      }
      return dest;
    };
    Util.clampRGB = function (val) {
      if (val < 0) {
        return 0;
      }
      if (val > 255) {
        return 255;
      }
      return val;
    };
    Util.copyAttributes = function (from, to, opts) {
      var attr, _i, _len, _ref, _ref1, _results;
      if (opts == null) {
        opts = {};
      }
      _ref = from.attributes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attr = _ref[_i];
        if (
          opts.except != null &&
          ((_ref1 = attr.nodeName), __indexOf.call(opts.except, _ref1) >= 0)
        ) {
          continue;
        }
        _results.push(to.setAttribute(attr.nodeName, attr.nodeValue));
      }
      return _results;
    };
    Util.dataArray = function (length) {
      if (length == null) {
        length = 0;
      }
      if (Caman.NodeJS || window.Uint8Array != null) {
        return new Uint8Array(length);
      }
      return new Array(length);
    };
    return Util;
  })();
  if (typeof exports !== "undefined" && exports !== null) {
    Root = exports;
    Canvas = require("canvas");
    Image = Canvas.Image;
    Fiber = require("fibers");
    fs = require("fs");
  } else {
    Root = window;
  }
  Caman = (function (_super) {
    __extends(Caman, _super);
    Caman.version = { release: "4.1.2", date: "7/27/2013" };
    Caman.DEBUG = false;
    Caman.allowRevert = true;
    Caman.crossOrigin = "anonymous";
    Caman.remoteProxy = "";
    Caman.proxyParam = "camanProxyUrl";
    Caman.NodeJS = typeof exports !== "undefined" && exports !== null;
    Caman.autoload = !Caman.NodeJS;
    Caman.toString = function () {
      return (
        "Version " + Caman.version.release + ", Released " + Caman.version.date
      );
    };
    Caman.getAttrId = function (canvas) {
      if (Caman.NodeJS) {
        return true;
      }
      if (typeof canvas === "string") {
        canvas = $(canvas);
      }
      if (!(canvas != null && canvas.getAttribute != null)) {
        return null;
      }
      return canvas.getAttribute("data-caman-id");
    };
    function Caman() {
      this.nodeFileReady = __bind(this.nodeFileReady, this);
      var args,
        callback,
        id,
        _this = this;
      if (arguments.length === 0) {
        throw "Invalid arguments";
      }
      if (this instanceof Caman) {
        this.finishInit = this.finishInit.bind(this);
        this.imageLoaded = this.imageLoaded.bind(this);
        args = arguments[0];
        if (!Caman.NodeJS) {
          id = parseInt(Caman.getAttrId(args[0]), 10);
          callback =
            typeof args[1] === "function"
              ? args[1]
              : typeof args[2] === "function"
              ? args[2]
              : function () {};
          if (!isNaN(id) && Store.has(id)) {
            return Store.execute(id, callback);
          }
        }
        this.id = Util.uniqid.get();
        this.initializedPixelData = this.originalPixelData = null;
        this.cropCoordinates = { x: 0, y: 0 };
        this.cropped = false;
        this.resized = false;
        this.pixelStack = [];
        this.layerStack = [];
        this.canvasQueue = [];
        this.currentLayer = null;
        this.scaled = false;
        this.analyze = new Analyze(this);
        this.renderer = new Renderer(this);
        this.domIsLoaded(function () {
          _this.parseArguments(args);
          return _this.setup();
        });
        return this;
      } else {
        return new Caman(arguments);
      }
    }
    Caman.prototype.domIsLoaded = function (cb) {
      var listener,
        _this = this;
      if (Caman.NodeJS) {
        return setTimeout(function () {
          return cb.call(_this);
        }, 0);
      } else {
        if (document.readyState === "complete") {
          Log.debug("DOM initialized");
          return setTimeout(function () {
            return cb.call(_this);
          }, 0);
        } else {
          listener = function () {
            if (document.readyState === "complete") {
              Log.debug("DOM initialized");
              return cb.call(_this);
            }
          };
          return document.addEventListener("readystatechange", listener, false);
        }
      }
    };
    Caman.prototype.parseArguments = function (args) {
      var key, val, _ref, _results;
      if (args.length === 0) {
        throw "Invalid arguments given";
      }
      this.initObj = null;
      this.initType = null;
      this.imageUrl = null;
      this.callback = function () {};
      this.setInitObject(args[0]);
      if (args.length === 1) {
        return;
      }
      switch (typeof args[1]) {
        case "string":
          this.imageUrl = args[1];
          break;
        case "function":
          this.callback = args[1];
      }
      if (args.length === 2) {
        return;
      }
      this.callback = args[2];
      if (args.length === 4) {
        _ref = args[4];
        _results = [];
        for (key in _ref) {
          if (!__hasProp.call(_ref, key)) continue;
          val = _ref[key];
          _results.push((this.options[key] = val));
        }
        return _results;
      }
    };
    Caman.prototype.setInitObject = function (obj) {
      if (Caman.NodeJS) {
        this.initObj = obj;
        this.initType = "node";
        return;
      }
      if (typeof obj === "object") {
        this.initObj = obj;
      } else {
        this.initObj = $(obj);
      }
      if (this.initObj == null) {
        throw "Could not find image or canvas for initialization.";
      }
      return (this.initType = this.initObj.nodeName.toLowerCase());
    };
    Caman.prototype.setup = function () {
      switch (this.initType) {
        case "node":
          return this.initNode();
        case "img":
          return this.initImage();
        case "canvas":
          return this.initCanvas();
      }
    };
    Caman.prototype.initNode = function () {
      Log.debug("Initializing for NodeJS");
      if (typeof this.initObj === "string") {
        return fs.readFile(this.initObj, this.nodeFileReady);
      } else {
        return this.nodeFileReady(null, this.initObj);
      }
    };
    Caman.prototype.nodeFileReady = function (err, data) {
      if (err) {
        throw err;
      }
      this.image = new Image();
      this.image.src = data;
      Log.debug(
        "Image loaded. Width = " +
          this.imageWidth() +
          ", Height = " +
          this.imageHeight()
      );
      this.canvas = new Canvas(this.imageWidth(), this.imageHeight());
      return this.finishInit();
    };
    Caman.prototype.initImage = function () {
      this.image = this.initObj;
      this.canvas = document.createElement("canvas");
      this.context = this.canvas.getContext("2d");
      Util.copyAttributes(this.image, this.canvas, { except: ["src"] });
      this.image.parentNode.replaceChild(this.canvas, this.image);
      this.imageAdjustments();
      return this.waitForImageLoaded();
    };
    Caman.prototype.initCanvas = function () {
      this.canvas = this.initObj;
      this.context = this.canvas.getContext("2d");
      if (this.imageUrl != null) {
        this.image = document.createElement("img");
        this.image.src = this.imageUrl;
        this.imageAdjustments();
        return this.waitForImageLoaded();
      } else {
        return this.finishInit();
      }
    };
    Caman.prototype.imageAdjustments = function () {
      if (this.needsHiDPISwap()) {
        Log.debug(this.image.src, "->", this.hiDPIReplacement());
        this.swapped = true;
        this.image.src = this.hiDPIReplacement();
      }
      if (IO.isRemote(this.image)) {
        this.image.src = IO.proxyUrl(this.image.src);
        return Log.debug(
          "Remote image detected, using URL = " + this.image.src
        );
      }
    };
    Caman.prototype.waitForImageLoaded = function () {
      if (this.isImageLoaded()) {
        return this.imageLoaded();
      } else {
        return (this.image.onload = this.imageLoaded);
      }
    };
    Caman.prototype.isImageLoaded = function () {
      if (!this.image.complete) {
        return false;
      }
      if (this.image.naturalWidth != null && this.image.naturalWidth === 0) {
        return false;
      }
      return true;
    };
    Caman.prototype.imageWidth = function () {
      return this.image.width || this.image.naturalWidth;
    };
    Caman.prototype.imageHeight = function () {
      return this.image.height || this.image.naturalHeight;
    };
    Caman.prototype.imageLoaded = function () {
      Log.debug(
        "Image loaded. Width = " +
          this.imageWidth() +
          ", Height = " +
          this.imageHeight()
      );
      if (this.swapped) {
        this.canvas.width = this.imageWidth() / this.hiDPIRatio();
        this.canvas.height = this.imageHeight() / this.hiDPIRatio();
      } else {
        this.canvas.width = this.imageWidth();
        this.canvas.height = this.imageHeight();
      }
      return this.finishInit();
    };
    Caman.prototype.finishInit = function () {
      var i, pixel, _i, _len, _ref;
      if (this.context == null) {
        this.context = this.canvas.getContext("2d");
      }
      this.originalWidth = this.preScaledWidth = this.width = this.canvas.width;
      this.originalHeight =
        this.preScaledHeight =
        this.height =
          this.canvas.height;
      this.hiDPIAdjustments();
      if (!this.hasId()) {
        this.assignId();
      }
      if (this.image != null) {
        this.context.drawImage(
          this.image,
          0,
          0,
          this.imageWidth(),
          this.imageHeight(),
          0,
          0,
          this.preScaledWidth,
          this.preScaledHeight
        );
      }
      this.imageData = this.context.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      this.pixelData = this.imageData.data;
      if (Caman.allowRevert) {
        this.initializedPixelData = Util.dataArray(this.pixelData.length);
        this.originalPixelData = Util.dataArray(this.pixelData.length);
        _ref = this.pixelData;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          pixel = _ref[i];
          this.initializedPixelData[i] = pixel;
          this.originalPixelData[i] = pixel;
        }
      }
      this.dimensions = {
        width: this.canvas.width,
        height: this.canvas.height,
      };
      if (!Caman.NodeJS) {
        Store.put(this.id, this);
      }
      this.callback.call(this, this);
      return (this.callback = function () {});
    };
    Caman.prototype.reloadCanvasData = function () {
      this.imageData = this.context.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      return (this.pixelData = this.imageData.data);
    };
    Caman.prototype.resetOriginalPixelData = function () {
      var i, pixel, _i, _len, _ref, _results;
      if (!Caman.allowRevert) {
        throw "Revert disabled";
      }
      this.originalPixelData = Util.dataArray(this.pixelData.length);
      _ref = this.pixelData;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        pixel = _ref[i];
        _results.push((this.originalPixelData[i] = pixel));
      }
      return _results;
    };
    Caman.prototype.hasId = function () {
      return Caman.getAttrId(this.canvas) != null;
    };
    Caman.prototype.assignId = function () {
      if (Caman.NodeJS || this.canvas.getAttribute("data-caman-id")) {
        return;
      }
      return this.canvas.setAttribute("data-caman-id", this.id);
    };
    Caman.prototype.hiDPIDisabled = function () {
      return this.canvas.getAttribute("data-caman-hidpi-disabled") !== null;
    };
    Caman.prototype.hiDPIAdjustments = function () {
      var ratio;
      if (Caman.NodeJS || !this.needsHiDPISwap()) {
        return;
      }
      ratio = this.hiDPIRatio();
      if (ratio !== 1) {
        Log.debug("HiDPI ratio = " + ratio);
        this.scaled = true;
        this.preScaledWidth = this.canvas.width;
        this.preScaledHeight = this.canvas.height;
        this.canvas.width = this.preScaledWidth * ratio;
        this.canvas.height = this.preScaledHeight * ratio;
        this.canvas.style.width = "" + this.preScaledWidth + "px";
        this.canvas.style.height = "" + this.preScaledHeight + "px";
        this.context.scale(ratio, ratio);
        this.width = this.originalWidth = this.canvas.width;
        return (this.height = this.originalHeight = this.canvas.height);
      }
    };
    Caman.prototype.hiDPIRatio = function () {
      var backingStoreRatio, devicePixelRatio;
      devicePixelRatio = window.devicePixelRatio || 1;
      backingStoreRatio =
        this.context.webkitBackingStorePixelRatio ||
        this.context.mozBackingStorePixelRatio ||
        this.context.msBackingStorePixelRatio ||
        this.context.oBackingStorePixelRatio ||
        this.context.backingStorePixelRatio ||
        1;
      return devicePixelRatio / backingStoreRatio;
    };
    Caman.prototype.hiDPICapable = function () {
      return window.devicePixelRatio != null && window.devicePixelRatio !== 1;
    };
    Caman.prototype.needsHiDPISwap = function () {
      if (this.hiDPIDisabled() || !this.hiDPICapable()) {
        return false;
      }
      return this.hiDPIReplacement() !== null;
    };
    Caman.prototype.hiDPIReplacement = function () {
      if (this.image == null) {
        return null;
      }
      return this.image.getAttribute("data-caman-hidpi");
    };
    Caman.prototype.replaceCanvas = function (newCanvas) {
      var oldCanvas;
      oldCanvas = this.canvas;
      this.canvas = newCanvas;
      this.context = this.canvas.getContext("2d");
      if (!Caman.NodeJS) {
        oldCanvas.parentNode.replaceChild(this.canvas, oldCanvas);
      }
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.reloadCanvasData();
      return (this.dimensions = {
        width: this.canvas.width,
        height: this.canvas.height,
      });
    };
    Caman.prototype.render = function (callback) {
      var _this = this;
      if (callback == null) {
        callback = function () {};
      }
      Event.trigger(this, "renderStart");
      return this.renderer.execute(function () {
        _this.context.putImageData(_this.imageData, 0, 0);
        return callback.call(_this);
      });
    };
    Caman.prototype.revert = function (updateContext) {
      var i, pixel, _i, _len, _ref;
      if (updateContext == null) {
        updateContext = true;
      }
      if (!Caman.allowRevert) {
        throw "Revert disabled";
      }
      _ref = this.originalVisiblePixels();
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        pixel = _ref[i];
        this.pixelData[i] = pixel;
      }
      if (updateContext) {
        return this.context.putImageData(this.imageData, 0, 0);
      }
    };
    Caman.prototype.reset = function () {
      var canvas, ctx, i, imageData, pixel, pixelData, _i, _len, _ref;
      canvas = document.createElement("canvas");
      Util.copyAttributes(this.canvas, canvas);
      canvas.width = this.originalWidth;
      canvas.height = this.originalHeight;
      ctx = canvas.getContext("2d");
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      pixelData = imageData.data;
      _ref = this.initializedPixelData;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        pixel = _ref[i];
        pixelData[i] = pixel;
      }
      ctx.putImageData(imageData, 0, 0);
      this.cropCoordinates = { x: 0, y: 0 };
      this.resized = false;
      return this.replaceCanvas(canvas);
    };
    Caman.prototype.originalVisiblePixels = function () {
      var canvas,
        coord,
        ctx,
        endX,
        endY,
        i,
        imageData,
        pixel,
        pixelData,
        pixels,
        scaledCanvas,
        startX,
        startY,
        width,
        _i,
        _j,
        _len,
        _ref,
        _ref1,
        _ref2,
        _ref3;
      if (!Caman.allowRevert) {
        throw "Revert disabled";
      }
      pixels = [];
      startX = this.cropCoordinates.x;
      endX = startX + this.width;
      startY = this.cropCoordinates.y;
      endY = startY + this.height;
      if (this.resized) {
        canvas = document.createElement("canvas");
        canvas.width = this.originalWidth;
        canvas.height = this.originalHeight;
        ctx = canvas.getContext("2d");
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        pixelData = imageData.data;
        _ref = this.originalPixelData;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          pixel = _ref[i];
          pixelData[i] = pixel;
        }
        ctx.putImageData(imageData, 0, 0);
        scaledCanvas = document.createElement("canvas");
        scaledCanvas.width = this.width;
        scaledCanvas.height = this.height;
        ctx = scaledCanvas.getContext("2d");
        ctx.drawImage(
          canvas,
          0,
          0,
          this.originalWidth,
          this.originalHeight,
          0,
          0,
          this.width,
          this.height
        );
        pixelData = ctx.getImageData(0, 0, this.width, this.height).data;
        width = this.width;
      } else {
        pixelData = this.originalPixelData;
        width = this.originalWidth;
      }
      for (i = _j = 0, _ref1 = pixelData.length; _j < _ref1; i = _j += 4) {
        coord = Pixel.locationToCoordinates(i, width);
        if (
          startX <= (_ref2 = coord.x) &&
          _ref2 < endX &&
          startY <= (_ref3 = coord.y) &&
          _ref3 < endY
        ) {
          pixels.push(
            pixelData[i],
            pixelData[i + 1],
            pixelData[i + 2],
            pixelData[i + 3]
          );
        }
      }
      return pixels;
    };
    Caman.prototype.process = function (name, processFn) {
      this.renderer.add({
        type: Filter.Type.Single,
        name: name,
        processFn: processFn,
      });
      return this;
    };
    Caman.prototype.processKernel = function (name, adjust, divisor, bias) {
      var i, _i, _ref;
      if (divisor == null) {
        divisor = null;
      }
      if (bias == null) {
        bias = 0;
      }
      if (divisor == null) {
        divisor = 0;
        for (
          i = _i = 0, _ref = adjust.length;
          0 <= _ref ? _i < _ref : _i > _ref;
          i = 0 <= _ref ? ++_i : --_i
        ) {
          divisor += adjust[i];
        }
      }
      this.renderer.add({
        type: Filter.Type.Kernel,
        name: name,
        adjust: adjust,
        divisor: divisor,
        bias: bias,
      });
      return this;
    };
    Caman.prototype.processPlugin = function (plugin, args) {
      this.renderer.add({
        type: Filter.Type.Plugin,
        plugin: plugin,
        args: args,
      });
      return this;
    };
    Caman.prototype.newLayer = function (callback) {
      var layer;
      layer = new Layer(this);
      this.canvasQueue.push(layer);
      this.renderer.add({ type: Filter.Type.LayerDequeue });
      callback.call(layer);
      this.renderer.add({ type: Filter.Type.LayerFinished });
      return this;
    };
    Caman.prototype.executeLayer = function (layer) {
      return this.pushContext(layer);
    };
    Caman.prototype.pushContext = function (layer) {
      this.layerStack.push(this.currentLayer);
      this.pixelStack.push(this.pixelData);
      this.currentLayer = layer;
      return (this.pixelData = layer.pixelData);
    };
    Caman.prototype.popContext = function () {
      this.pixelData = this.pixelStack.pop();
      return (this.currentLayer = this.layerStack.pop());
    };
    Caman.prototype.applyCurrentLayer = function () {
      return this.currentLayer.applyToParent();
    };
    return Caman;
  })(Module);
  Root.Caman = Caman;
  Caman.Analyze = (function () {
    function Analyze(c) {
      this.c = c;
    }
    Analyze.prototype.calculateLevels = function () {
      var i, levels, numPixels, _i, _j, _k, _ref;
      levels = { r: {}, g: {}, b: {} };
      for (i = _i = 0; _i <= 255; i = ++_i) {
        levels.r[i] = 0;
        levels.g[i] = 0;
        levels.b[i] = 0;
      }
      for (i = _j = 0, _ref = this.c.pixelData.length; _j < _ref; i = _j += 4) {
        levels.r[this.c.pixelData[i]]++;
        levels.g[this.c.pixelData[i + 1]]++;
        levels.b[this.c.pixelData[i + 2]]++;
      }
      numPixels = this.c.pixelData.length / 4;
      for (i = _k = 0; _k <= 255; i = ++_k) {
        levels.r[i] /= numPixels;
        levels.g[i] /= numPixels;
        levels.b[i] /= numPixels;
      }
      return levels;
    };
    return Analyze;
  })();
  Analyze = Caman.Analyze;
  Caman.DOMUpdated = function () {
    var img, imgs, parser, _i, _len, _results;
    imgs = document.querySelectorAll("img[data-caman]");
    if (!(imgs.length > 0)) {
      return;
    }
    _results = [];
    for (_i = 0, _len = imgs.length; _i < _len; _i++) {
      img = imgs[_i];
      _results.push(
        (parser = new CamanParser(img, function () {
          this.parse();
          return this.execute();
        }))
      );
    }
    return _results;
  };
  if (Caman.autoload) {
    (function () {
      if (document.readyState === "complete") {
        return Caman.DOMUpdated();
      } else {
        return document.addEventListener(
          "DOMContentLoaded",
          Caman.DOMUpdated,
          false
        );
      }
    })();
  }
  CamanParser = (function () {
    var INST_REGEX;
    INST_REGEX = "(\\w+)\\((.*?)\\)";
    function CamanParser(ele, ready) {
      this.dataStr = ele.getAttribute("data-caman");
      this.caman = Caman(ele, ready.bind(this));
    }
    CamanParser.prototype.parse = function () {
      var args,
        e,
        filter,
        func,
        inst,
        instFunc,
        m,
        r,
        unparsedInstructions,
        _i,
        _len,
        _ref,
        _results;
      this.ele = this.caman.canvas;
      r = new RegExp(INST_REGEX, "g");
      unparsedInstructions = this.dataStr.match(r);
      if (!(unparsedInstructions.length > 0)) {
        return;
      }
      r = new RegExp(INST_REGEX);
      _results = [];
      for (_i = 0, _len = unparsedInstructions.length; _i < _len; _i++) {
        inst = unparsedInstructions[_i];
        (_ref = inst.match(r)),
          (m = _ref[0]),
          (filter = _ref[1]),
          (args = _ref[2]);
        instFunc = new Function(
          "return function() {        this." +
            filter +
            "(" +
            args +
            ");      };"
        );
        try {
          func = instFunc();
          _results.push(func.call(this.caman));
        } catch (_error) {
          e = _error;
          _results.push(Log.debug(e));
        }
      }
      return _results;
    };
    CamanParser.prototype.execute = function () {
      var ele;
      ele = this.ele;
      return this.caman.render(function () {
        return ele.parentNode.replaceChild(this.toImage(), ele);
      });
    };
    return CamanParser;
  })();
  Caman.Blender = (function () {
    function Blender() {}
    Blender.blenders = {};
    Blender.register = function (name, func) {
      return (this.blenders[name] = func);
    };
    Blender.execute = function (name, rgbaLayer, rgbaParent) {
      return this.blenders[name](rgbaLayer, rgbaParent);
    };
    return Blender;
  })();
  Blender = Caman.Blender;
  Caman.Calculate = (function () {
    function Calculate() {}
    Calculate.distance = function (x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };
    Calculate.randomRange = function (min, max, getFloat) {
      var rand;
      if (getFloat == null) {
        getFloat = false;
      }
      rand = min + Math.random() * (max - min);
      if (getFloat) {
        return rand.toFixed(getFloat);
      } else {
        return Math.round(rand);
      }
    };
    Calculate.luminance = function (rgba) {
      return 0.299 * rgba.r + 0.587 * rgba.g + 0.114 * rgba.b;
    };
    Calculate.bezier = function (
      start,
      ctrl1,
      ctrl2,
      end,
      lowBound,
      highBound
    ) {
      var Ax,
        Ay,
        Bx,
        By,
        Cx,
        Cy,
        bezier,
        curveX,
        curveY,
        i,
        j,
        leftCoord,
        rightCoord,
        t,
        x0,
        x1,
        x2,
        x3,
        y0,
        y1,
        y2,
        y3,
        _i,
        _j,
        _k,
        _ref,
        _ref1;
      x0 = start[0];
      y0 = start[1];
      x1 = ctrl1[0];
      y1 = ctrl1[1];
      x2 = ctrl2[0];
      y2 = ctrl2[1];
      x3 = end[0];
      y3 = end[1];
      bezier = {};
      Cx = parseInt(3 * (x1 - x0), 10);
      Bx = 3 * (x2 - x1) - Cx;
      Ax = x3 - x0 - Cx - Bx;
      Cy = 3 * (y1 - y0);
      By = 3 * (y2 - y1) - Cy;
      Ay = y3 - y0 - Cy - By;
      for (i = _i = 0; _i < 1000; i = ++_i) {
        t = i / 1000;
        curveX = Math.round(
          Ax * Math.pow(t, 3) + Bx * Math.pow(t, 2) + Cx * t + x0
        );
        curveY = Math.round(
          Ay * Math.pow(t, 3) + By * Math.pow(t, 2) + Cy * t + y0
        );
        if (lowBound && curveY < lowBound) {
          curveY = lowBound;
        } else if (highBound && curveY > highBound) {
          curveY = highBound;
        }
        bezier[curveX] = curveY;
      }
      if (bezier.length < end[0] + 1) {
        for (
          i = _j = 0, _ref = end[0];
          0 <= _ref ? _j <= _ref : _j >= _ref;
          i = 0 <= _ref ? ++_j : --_j
        ) {
          if (bezier[i] == null) {
            leftCoord = [i - 1, bezier[i - 1]];
            for (
              j = _k = i, _ref1 = end[0];
              i <= _ref1 ? _k <= _ref1 : _k >= _ref1;
              j = i <= _ref1 ? ++_k : --_k
            ) {
              if (bezier[j] != null) {
                rightCoord = [j, bezier[j]];
                break;
              }
            }
            bezier[i] =
              leftCoord[1] +
              ((rightCoord[1] - leftCoord[1]) /
                (rightCoord[0] - leftCoord[0])) *
                (i - leftCoord[0]);
          }
        }
      }
      if (bezier[end[0]] == null) {
        bezier[end[0]] = bezier[end[0] - 1];
      }
      return bezier;
    };
    return Calculate;
  })();
  Calculate = Caman.Calculate;
  Caman.Convert = (function () {
    function Convert() {}
    Convert.hexToRGB = function (hex) {
      var b, g, r;
      if (hex.charAt(0) === "#") {
        hex = hex.substr(1);
      }
      r = parseInt(hex.substr(0, 2), 16);
      g = parseInt(hex.substr(2, 2), 16);
      b = parseInt(hex.substr(4, 2), 16);
      return { r: r, g: g, b: b };
    };
    Convert.rgbToHSL = function (r, g, b) {
      var d, h, l, max, min, s;
      if (typeof r === "object") {
        g = r.g;
        b = r.b;
        r = r.r;
      }
      r /= 255;
      g /= 255;
      b /= 255;
      max = Math.max(r, g, b);
      min = Math.min(r, g, b);
      l = (max + min) / 2;
      if (max === min) {
        h = s = 0;
      } else {
        d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        h = (function () {
          switch (max) {
            case r:
              return (g - b) / d + (g < b ? 6 : 0);
            case g:
              return (b - r) / d + 2;
            case b:
              return (r - g) / d + 4;
          }
        })();
        h /= 6;
      }
      return { h: h, s: s, l: l };
    };
    Convert.hslToRGB = function (h, s, l) {
      var b, g, p, q, r;
      if (typeof h === "object") {
        s = h.s;
        l = h.l;
        h = h.h;
      }
      if (s === 0) {
        r = g = b = l;
      } else {
        q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        p = 2 * l - q;
        r = this.hueToRGB(p, q, h + 1 / 3);
        g = this.hueToRGB(p, q, h);
        b = this.hueToRGB(p, q, h - 1 / 3);
      }
      return { r: r * 255, g: g * 255, b: b * 255 };
    };
    Convert.hueToRGB = function (p, q, t) {
      if (t < 0) {
        t += 1;
      }
      if (t > 1) {
        t -= 1;
      }
      if (t < 1 / 6) {
        return p + (q - p) * 6 * t;
      }
      if (t < 1 / 2) {
        return q;
      }
      if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6;
      }
      return p;
    };
    Convert.rgbToHSV = function (r, g, b) {
      var d, h, max, min, s, v;
      r /= 255;
      g /= 255;
      b /= 255;
      max = Math.max(r, g, b);
      min = Math.min(r, g, b);
      v = max;
      d = max - min;
      s = max === 0 ? 0 : d / max;
      if (max === min) {
        h = 0;
      } else {
        h = (function () {
          switch (max) {
            case r:
              return (g - b) / d + (g < b ? 6 : 0);
            case g:
              return (b - r) / d + 2;
            case b:
              return (r - g) / d + 4;
          }
        })();
        h /= 6;
      }
      return { h: h, s: s, v: v };
    };
    Convert.hsvToRGB = function (h, s, v) {
      var b, f, g, i, p, q, r, t;
      i = Math.floor(h * 6);
      f = h * 6 - i;
      p = v * (1 - s);
      q = v * (1 - f * s);
      t = v * (1 - (1 - f) * s);
      switch (i % 6) {
        case 0:
          r = v;
          g = t;
          b = p;
          break;
        case 1:
          r = q;
          g = v;
          b = p;
          break;
        case 2:
          r = p;
          g = v;
          b = t;
          break;
        case 3:
          r = p;
          g = q;
          b = v;
          break;
        case 4:
          r = t;
          g = p;
          b = v;
          break;
        case 5:
          r = v;
          g = p;
          b = q;
      }
      return {
        r: Math.floor(r * 255),
        g: Math.floor(g * 255),
        b: Math.floor(b * 255),
      };
    };
    Convert.rgbToXYZ = function (r, g, b) {
      var x, y, z;
      r /= 255;
      g /= 255;
      b /= 255;
      if (r > 0.04045) {
        r = Math.pow((r + 0.055) / 1.055, 2.4);
      } else {
        r /= 12.92;
      }
      if (g > 0.04045) {
        g = Math.pow((g + 0.055) / 1.055, 2.4);
      } else {
        g /= 12.92;
      }
      if (b > 0.04045) {
        b = Math.pow((b + 0.055) / 1.055, 2.4);
      } else {
        b /= 12.92;
      }
      x = r * 0.4124 + g * 0.3576 + b * 0.1805;
      y = r * 0.2126 + g * 0.7152 + b * 0.0722;
      z = r * 0.0193 + g * 0.1192 + b * 0.9505;
      return { x: x * 100, y: y * 100, z: z * 100 };
    };
    Convert.xyzToRGB = function (x, y, z) {
      var b, g, r;
      x /= 100;
      y /= 100;
      z /= 100;
      r = 3.2406 * x + -1.5372 * y + -0.4986 * z;
      g = -0.9689 * x + 1.8758 * y + 0.0415 * z;
      b = 0.0557 * x + -0.204 * y + 1.057 * z;
      if (r > 0.0031308) {
        r = 1.055 * Math.pow(r, 0.4166666667) - 0.055;
      } else {
        r *= 12.92;
      }
      if (g > 0.0031308) {
        g = 1.055 * Math.pow(g, 0.4166666667) - 0.055;
      } else {
        g *= 12.92;
      }
      if (b > 0.0031308) {
        b = 1.055 * Math.pow(b, 0.4166666667) - 0.055;
      } else {
        b *= 12.92;
      }
      return { r: r * 255, g: g * 255, b: b * 255 };
    };
    Convert.xyzToLab = function (x, y, z) {
      var a, b, l, whiteX, whiteY, whiteZ;
      if (typeof x === "object") {
        y = x.y;
        z = x.z;
        x = x.x;
      }
      whiteX = 95.047;
      whiteY = 100.0;
      whiteZ = 108.883;
      x /= whiteX;
      y /= whiteY;
      z /= whiteZ;
      if (x > 0.008856451679) {
        x = Math.pow(x, 0.3333333333);
      } else {
        x = 7.787037037 * x + 0.1379310345;
      }
      if (y > 0.008856451679) {
        y = Math.pow(y, 0.3333333333);
      } else {
        y = 7.787037037 * y + 0.1379310345;
      }
      if (z > 0.008856451679) {
        z = Math.pow(z, 0.3333333333);
      } else {
        z = 7.787037037 * z + 0.1379310345;
      }
      l = 116 * y - 16;
      a = 500 * (x - y);
      b = 200 * (y - z);
      return { l: l, a: a, b: b };
    };
    Convert.labToXYZ = function (l, a, b) {
      var x, y, z;
      if (typeof l === "object") {
        a = l.a;
        b = l.b;
        l = l.l;
      }
      y = (l + 16) / 116;
      x = y + a / 500;
      z = y - b / 200;
      if (x > 0.2068965517) {
        x = x * x * x;
      } else {
        x = 0.1284185493 * (x - 0.1379310345);
      }
      if (y > 0.2068965517) {
        y = y * y * y;
      } else {
        y = 0.1284185493 * (y - 0.1379310345);
      }
      if (z > 0.2068965517) {
        z = z * z * z;
      } else {
        z = 0.1284185493 * (z - 0.1379310345);
      }
      return { x: x * 95.047, y: y * 100.0, z: z * 108.883 };
    };
    Convert.rgbToLab = function (r, g, b) {
      var xyz;
      if (typeof r === "object") {
        g = r.g;
        b = r.b;
        r = r.r;
      }
      xyz = this.rgbToXYZ(r, g, b);
      return this.xyzToLab(xyz);
    };
    Convert.labToRGB = function (l, a, b) {};
    return Convert;
  })();
  Convert = Caman.Convert;
  Caman.Event = (function () {
    function Event() {}
    Event.events = {};
    Event.types = [
      "processStart",
      "processComplete",
      "renderStart",
      "renderFinished",
      "blockStarted",
      "blockFinished",
    ];
    Event.trigger = function (target, type, data) {
      var event, _i, _len, _ref, _results;
      if (data == null) {
        data = null;
      }
      if (this.events[type] && this.events[type].length) {
        _ref = this.events[type];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          event = _ref[_i];
          if (event.target === null || target.id === event.target.id) {
            _results.push(event.fn.call(target, data));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };
    Event.listen = function (target, type, fn) {
      var _fn, _type;
      if (typeof target === "string") {
        _type = target;
        _fn = type;
        target = null;
        type = _type;
        fn = _fn;
      }
      if (__indexOf.call(this.types, type) < 0) {
        return false;
      }
      if (!this.events[type]) {
        this.events[type] = [];
      }
      this.events[type].push({ target: target, fn: fn });
      return true;
    };
    return Event;
  })();
  Event = Caman.Event;
  Caman.Filter = (function () {
    function Filter() {}
    Filter.Type = {
      Single: 1,
      Kernel: 2,
      LayerDequeue: 3,
      LayerFinished: 4,
      LoadOverlay: 5,
      Plugin: 6,
    };
    Filter.register = function (name, filterFunc) {
      return (Caman.prototype[name] = filterFunc);
    };
    return Filter;
  })();
  Filter = Caman.Filter;
  Caman.IO = (function () {
    function IO() {}
    IO.domainRegex = /(?:(?:http|https):\/\/)((?:\w+)\.(?:(?:\w|\.)+))/;
    IO.isRemote = function (img) {
      if (img == null) {
        return false;
      }
      if (this.corsEnabled(img)) {
        return false;
      }
      return this.isURLRemote(img.src);
    };
    IO.corsEnabled = function (img) {
      var _ref;
      return (
        img.crossOrigin != null &&
        ((_ref = img.crossOrigin.toLowerCase()) === "anonymous" ||
          _ref === "use-credentials")
      );
    };
    IO.isURLRemote = function (url) {
      var matches;
      matches = url.match(this.domainRegex);
      if (matches) {
        return matches[1] !== document.domain;
      } else {
        return false;
      }
    };
    IO.remoteCheck = function (src) {
      if (this.isURLRemote(src)) {
        if (!Caman.remoteProxy.length) {
          Log.info(
            "Attempting to load a remote image without a configured proxy. URL: " +
              src
          );
        } else {
          if (Caman.isURLRemote(Caman.remoteProxy)) {
            Log.info("Cannot use a remote proxy for loading images.");
            return;
          }
          return this.proxyUrl(src);
        }
      }
    };
    IO.proxyUrl = function (src) {
      return (
        "" +
        Caman.remoteProxy +
        "?" +
        Caman.proxyParam +
        "=" +
        encodeURIComponent(src)
      );
    };
    IO.useProxy = function (lang) {
      var langToExt;
      langToExt = { ruby: "rb", python: "py", perl: "pl", javascript: "js" };
      lang = lang.toLowerCase();
      if (langToExt[lang] != null) {
        lang = langToExt[lang];
      }
      return "proxies/caman_proxy." + lang;
    };
    return IO;
  })();
  Caman.prototype.save = function () {
    if (typeof exports !== "undefined" && exports !== null) {
      return this.nodeSave.apply(this, arguments);
    } else {
      return this.browserSave.apply(this, arguments);
    }
  };
  Caman.prototype.browserSave = function (type) {
    var image;
    if (type == null) {
      type = "png";
    }
    type = type.toLowerCase();
    image = this.toBase64(type).replace("image/" + type, "image/octet-stream");
    return (document.location.href = image);
  };
  Caman.prototype.nodeSave = function (file, overwrite) {
    var e, stats;
    if (overwrite == null) {
      overwrite = true;
    }
    try {
      stats = fs.statSync(file);
      if (stats.isFile() && !overwrite) {
        return false;
      }
    } catch (_error) {
      e = _error;
      Log.debug("Creating output file " + file);
    }
    return fs.writeFile(file, this.canvas.toBuffer(), function () {
      return Log.debug("Finished writing to " + file);
    });
  };
  Caman.prototype.toImage = function (type) {
    var img;
    img = document.createElement("img");
    img.src = this.toBase64(type);
    img.width = this.dimensions.width;
    img.height = this.dimensions.height;
    if (window.devicePixelRatio) {
      img.width /= window.devicePixelRatio;
      img.height /= window.devicePixelRatio;
    }
    return img;
  };
  Caman.prototype.toBase64 = function (type) {
    if (type == null) {
      type = "png";
    }
    type = type.toLowerCase();
    return this.canvas.toDataURL("image/" + type);
  };
  IO = Caman.IO;
  Caman.Layer = (function () {
    function Layer(c) {
      this.c = c;
      this.filter = this.c;
      this.options = { blendingMode: "normal", opacity: 1.0 };
      this.layerID = Util.uniqid.get();
      this.canvas =
        typeof exports !== "undefined" && exports !== null
          ? new Canvas()
          : document.createElement("canvas");
      this.canvas.width = this.c.dimensions.width;
      this.canvas.height = this.c.dimensions.height;
      this.context = this.canvas.getContext("2d");
      this.context.createImageData(this.canvas.width, this.canvas.height);
      this.imageData = this.context.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      this.pixelData = this.imageData.data;
    }
    Layer.prototype.newLayer = function (cb) {
      return this.c.newLayer.call(this.c, cb);
    };
    Layer.prototype.setBlendingMode = function (mode) {
      this.options.blendingMode = mode;
      return this;
    };
    Layer.prototype.opacity = function (opacity) {
      this.options.opacity = opacity / 100;
      return this;
    };
    Layer.prototype.copyParent = function () {
      var i, parentData, _i, _ref;
      parentData = this.c.pixelData;
      for (i = _i = 0, _ref = this.c.pixelData.length; _i < _ref; i = _i += 4) {
        this.pixelData[i] = parentData[i];
        this.pixelData[i + 1] = parentData[i + 1];
        this.pixelData[i + 2] = parentData[i + 2];
        this.pixelData[i + 3] = parentData[i + 3];
      }
      return this;
    };
    Layer.prototype.fillColor = function () {
      return this.c.fillColor.apply(this.c, arguments);
    };
    Layer.prototype.overlayImage = function (image) {
      if (typeof image === "object") {
        image = image.src;
      } else if (typeof image === "string" && image[0] === "#") {
        image = $(image).src;
      }
      if (!image) {
        return this;
      }
      this.c.renderer.renderQueue.push({
        type: Filter.Type.LoadOverlay,
        src: image,
        layer: this,
      });
      return this;
    };
    Layer.prototype.applyToParent = function () {
      var i,
        layerData,
        parentData,
        result,
        rgbaLayer,
        rgbaParent,
        _i,
        _ref,
        _results;
      parentData = this.c.pixelStack[this.c.pixelStack.length - 1];
      layerData = this.c.pixelData;
      _results = [];
      for (i = _i = 0, _ref = layerData.length; _i < _ref; i = _i += 4) {
        rgbaParent = {
          r: parentData[i],
          g: parentData[i + 1],
          b: parentData[i + 2],
          a: parentData[i + 3],
        };
        rgbaLayer = {
          r: layerData[i],
          g: layerData[i + 1],
          b: layerData[i + 2],
          a: layerData[i + 3],
        };
        result = Blender.execute(
          this.options.blendingMode,
          rgbaLayer,
          rgbaParent
        );
        result.r = Util.clampRGB(result.r);
        result.g = Util.clampRGB(result.g);
        result.b = Util.clampRGB(result.b);
        if (result.a == null) {
          result.a = rgbaLayer.a;
        }
        parentData[i] =
          rgbaParent.r -
          (rgbaParent.r - result.r) * (this.options.opacity * (result.a / 255));
        parentData[i + 1] =
          rgbaParent.g -
          (rgbaParent.g - result.g) * (this.options.opacity * (result.a / 255));
        _results.push(
          (parentData[i + 2] =
            rgbaParent.b -
            (rgbaParent.b - result.b) *
              (this.options.opacity * (result.a / 255)))
        );
      }
      return _results;
    };
    return Layer;
  })();
  Layer = Caman.Layer;
  Caman.Logger = (function () {
    function Logger() {
      var name, _i, _len, _ref;
      _ref = ["log", "info", "warn", "error"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        this[name] = (function (name) {
          return function () {
            var args, e;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            if (!Caman.DEBUG) {
              return;
            }
            try {
              return console[name].apply(console, args);
            } catch (_error) {
              e = _error;
              return console[name](args);
            }
          };
        })(name);
      }
      this.debug = this.log;
    }
    return Logger;
  })();
  Log = new Caman.Logger();
  Caman.Pixel = (function () {
    Pixel.coordinatesToLocation = function (x, y, width) {
      return (y * width + x) * 4;
    };
    Pixel.locationToCoordinates = function (loc, width) {
      var x, y;
      y = Math.floor(loc / (width * 4));
      x = (loc % (width * 4)) / 4;
      return { x: x, y: y };
    };
    function Pixel(r, g, b, a, c) {
      this.r = r != null ? r : 0;
      this.g = g != null ? g : 0;
      this.b = b != null ? b : 0;
      this.a = a != null ? a : 255;
      this.c = c != null ? c : null;
      this.loc = 0;
    }
    Pixel.prototype.setContext = function (c) {
      return (this.c = c);
    };
    Pixel.prototype.locationXY = function () {
      var x, y;
      if (this.c == null) {
        throw "Requires a CamanJS context";
      }
      y =
        this.c.dimensions.height -
        Math.floor(this.loc / (this.c.dimensions.width * 4));
      x = (this.loc % (this.c.dimensions.width * 4)) / 4;
      return { x: x, y: y };
    };
    Pixel.prototype.pixelAtLocation = function (loc) {
      if (this.c == null) {
        throw "Requires a CamanJS context";
      }
      return new Pixel(
        this.c.pixelData[loc],
        this.c.pixelData[loc + 1],
        this.c.pixelData[loc + 2],
        this.c.pixelData[loc + 3],
        this.c
      );
    };
    Pixel.prototype.getPixelRelative = function (horiz, vert) {
      var newLoc;
      if (this.c == null) {
        throw "Requires a CamanJS context";
      }
      newLoc = this.loc + this.c.dimensions.width * 4 * (vert * -1) + 4 * horiz;
      if (newLoc > this.c.pixelData.length || newLoc < 0) {
        return new Pixel(0, 0, 0, 255, this.c);
      }
      return this.pixelAtLocation(newLoc);
    };
    Pixel.prototype.putPixelRelative = function (horiz, vert, rgba) {
      var nowLoc;
      if (this.c == null) {
        throw "Requires a CamanJS context";
      }
      nowLoc = this.loc + this.c.dimensions.width * 4 * (vert * -1) + 4 * horiz;
      if (newLoc > this.c.pixelData.length || newLoc < 0) {
        return;
      }
      this.c.pixelData[newLoc] = rgba.r;
      this.c.pixelData[newLoc + 1] = rgba.g;
      this.c.pixelData[newLoc + 2] = rgba.b;
      this.c.pixelData[newLoc + 3] = rgba.a;
      return true;
    };
    Pixel.prototype.getPixel = function (x, y) {
      var loc;
      if (this.c == null) {
        throw "Requires a CamanJS context";
      }
      loc = this.coordinatesToLocation(x, y, this.width);
      return this.pixelAtLocation(loc);
    };
    Pixel.prototype.putPixel = function (x, y, rgba) {
      var loc;
      if (this.c == null) {
        throw "Requires a CamanJS context";
      }
      loc = this.coordinatesToLocation(x, y, this.width);
      this.c.pixelData[loc] = rgba.r;
      this.c.pixelData[loc + 1] = rgba.g;
      this.c.pixelData[loc + 2] = rgba.b;
      return (this.c.pixelData[loc + 3] = rgba.a);
    };
    Pixel.prototype.toString = function () {
      return this.toKey();
    };
    Pixel.prototype.toHex = function (includeAlpha) {
      var hex;
      if (includeAlpha == null) {
        includeAlpha = false;
      }
      hex =
        "#" + this.r.toString(16) + this.g.toString(16) + this.b.toString(16);
      if (includeAlpha) {
        return hex + this.a.toString(16);
      } else {
        return hex;
      }
    };
    return Pixel;
  })();
  Pixel = Caman.Pixel;
  Caman.Plugin = (function () {
    function Plugin() {}
    Plugin.plugins = {};
    Plugin.register = function (name, plugin) {
      return (this.plugins[name] = plugin);
    };
    Plugin.execute = function (context, name, args) {
      return this.plugins[name].apply(context, args);
    };
    return Plugin;
  })();
  Plugin = Caman.Plugin;
  Caman.Renderer = (function () {
    Renderer.Blocks = Caman.NodeJS ? require("os").cpus().length : 4;
    function Renderer(c) {
      this.c = c;
      this.processNext = __bind(this.processNext, this);
      this.renderQueue = [];
      this.modPixelData = null;
    }
    Renderer.prototype.add = function (job) {
      if (job == null) {
        return;
      }
      return this.renderQueue.push(job);
    };
    Renderer.prototype.processNext = function () {
      var layer;
      if (this.renderQueue.length === 0) {
        Event.trigger(this, "renderFinished");
        if (this.finishedFn != null) {
          this.finishedFn.call(this.c);
        }
        return this;
      }
      this.currentJob = this.renderQueue.shift();
      switch (this.currentJob.type) {
        case Filter.Type.LayerDequeue:
          layer = this.c.canvasQueue.shift();
          this.c.executeLayer(layer);
          return this.processNext();
        case Filter.Type.LayerFinished:
          this.c.applyCurrentLayer();
          this.c.popContext();
          return this.processNext();
        case Filter.Type.LoadOverlay:
          return this.loadOverlay(this.currentJob.layer, this.currentJob.src);
        case Filter.Type.Plugin:
          return this.executePlugin();
        default:
          return this.executeFilter();
      }
    };
    Renderer.prototype.execute = function (callback) {
      this.finishedFn = callback;
      this.modPixelData = Util.dataArray(this.c.pixelData.length);
      return this.processNext();
    };
    Renderer.prototype.eachBlock = function (fn) {
      var blockN,
        blockPixelLength,
        bnum,
        end,
        f,
        i,
        lastBlockN,
        n,
        start,
        _i,
        _ref,
        _results,
        _this = this;
      this.blocksDone = 0;
      n = this.c.pixelData.length;
      blockPixelLength = Math.floor(n / 4 / Renderer.Blocks);
      blockN = blockPixelLength * 4;
      lastBlockN = blockN + ((n / 4) % Renderer.Blocks) * 4;
      _results = [];
      for (
        i = _i = 0, _ref = Renderer.Blocks;
        0 <= _ref ? _i < _ref : _i > _ref;
        i = 0 <= _ref ? ++_i : --_i
      ) {
        start = i * blockN;
        end = start + (i === Renderer.Blocks - 1 ? lastBlockN : blockN);
        if (Caman.NodeJS) {
          f = Fiber(function () {
            return fn.call(_this, i, start, end);
          });
          bnum = f.run();
          _results.push(this.blockFinished(bnum));
        } else {
          _results.push(
            setTimeout(
              (function (i, start, end) {
                return function () {
                  return fn.call(_this, i, start, end);
                };
              })(i, start, end),
              0
            )
          );
        }
      }
      return _results;
    };
    Renderer.prototype.executeFilter = function () {
      Event.trigger(this.c, "processStart", this.currentJob);
      if (this.currentJob.type === Filter.Type.Single) {
        return this.eachBlock(this.renderBlock);
      } else {
        return this.eachBlock(this.renderKernel);
      }
    };
    Renderer.prototype.executePlugin = function () {
      Log.debug("Executing plugin " + this.currentJob.plugin);
      Plugin.execute(this.c, this.currentJob.plugin, this.currentJob.args);
      Log.debug("Plugin " + this.currentJob.plugin + " finished!");
      return this.processNext();
    };
    Renderer.prototype.renderBlock = function (bnum, start, end) {
      var i, pixel, _i;
      Log.debug(
        "Block #" +
          bnum +
          " - Filter: " +
          this.currentJob.name +
          ", Start: " +
          start +
          ", End: " +
          end
      );
      Event.trigger(this.c, "blockStarted", {
        blockNum: bnum,
        totalBlocks: Renderer.Blocks,
        startPixel: start,
        endPixel: end,
      });
      pixel = new Pixel();
      pixel.setContext(this.c);
      for (i = _i = start; _i < end; i = _i += 4) {
        pixel.loc = i;
        pixel.r = this.c.pixelData[i];
        pixel.g = this.c.pixelData[i + 1];
        pixel.b = this.c.pixelData[i + 2];
        pixel.a = this.c.pixelData[i + 3];
        this.currentJob.processFn(pixel);
        this.c.pixelData[i] = Util.clampRGB(pixel.r);
        this.c.pixelData[i + 1] = Util.clampRGB(pixel.g);
        this.c.pixelData[i + 2] = Util.clampRGB(pixel.b);
        this.c.pixelData[i + 3] = Util.clampRGB(pixel.a);
      }
      if (Caman.NodeJS) {
        return Fiber["yield"](bnum);
      } else {
        return this.blockFinished(bnum);
      }
    };
    Renderer.prototype.renderKernel = function (bnum, start, end) {
      var adjust,
        adjustSize,
        bias,
        builder,
        builderIndex,
        divisor,
        i,
        j,
        k,
        kernel,
        n,
        name,
        p,
        pixel,
        res,
        _i,
        _j,
        _k;
      name = this.currentJob.name;
      bias = this.currentJob.bias;
      divisor = this.currentJob.divisor;
      n = this.c.pixelData.length;
      adjust = this.currentJob.adjust;
      adjustSize = Math.sqrt(adjust.length);
      kernel = [];
      Log.debug("Rendering kernel - Filter: " + this.currentJob.name);
      start = Math.max(
        start,
        this.c.dimensions.width * 4 * ((adjustSize - 1) / 2)
      );
      end = Math.min(
        end,
        n - this.c.dimensions.width * 4 * ((adjustSize - 1) / 2)
      );
      builder = (adjustSize - 1) / 2;
      pixel = new Pixel();
      pixel.setContext(this.c);
      for (i = _i = start; _i < end; i = _i += 4) {
        pixel.loc = i;
        builderIndex = 0;
        for (
          j = _j = -builder;
          -builder <= builder ? _j <= builder : _j >= builder;
          j = -builder <= builder ? ++_j : --_j
        ) {
          for (
            k = _k = builder;
            builder <= -builder ? _k <= -builder : _k >= -builder;
            k = builder <= -builder ? ++_k : --_k
          ) {
            p = pixel.getPixelRelative(j, k);
            kernel[builderIndex * 3] = p.r;
            kernel[builderIndex * 3 + 1] = p.g;
            kernel[builderIndex * 3 + 2] = p.b;
            builderIndex++;
          }
        }
        res = this.processKernel(adjust, kernel, divisor, bias);
        this.modPixelData[i] = Util.clampRGB(res.r);
        this.modPixelData[i + 1] = Util.clampRGB(res.g);
        this.modPixelData[i + 2] = Util.clampRGB(res.b);
        this.modPixelData[i + 3] = this.c.pixelData[i + 3];
      }
      if (Caman.NodeJS) {
        return Fiber["yield"](bnum);
      } else {
        return this.blockFinished(bnum);
      }
    };
    Renderer.prototype.blockFinished = function (bnum) {
      var i, _i, _ref;
      if (bnum >= 0) {
        Log.debug(
          "Block #" + bnum + " finished! Filter: " + this.currentJob.name
        );
      }
      this.blocksDone++;
      Event.trigger(this.c, "blockFinished", {
        blockNum: bnum,
        blocksFinished: this.blocksDone,
        totalBlocks: Renderer.Blocks,
      });
      if (this.blocksDone === Renderer.Blocks) {
        if (this.currentJob.type === Filter.Type.Kernel) {
          for (
            i = _i = 0, _ref = this.c.pixelData.length;
            0 <= _ref ? _i < _ref : _i > _ref;
            i = 0 <= _ref ? ++_i : --_i
          ) {
            this.c.pixelData[i] = this.modPixelData[i];
          }
        }
        if (bnum >= 0) {
          Log.debug("Filter " + this.currentJob.name + " finished!");
        }
        Event.trigger(this.c, "processComplete", this.currentJob);
        return this.processNext();
      }
    };
    Renderer.prototype.processKernel = function (
      adjust,
      kernel,
      divisor,
      bias
    ) {
      var i, val, _i, _ref;
      val = { r: 0, g: 0, b: 0 };
      for (
        i = _i = 0, _ref = adjust.length;
        0 <= _ref ? _i < _ref : _i > _ref;
        i = 0 <= _ref ? ++_i : --_i
      ) {
        val.r += adjust[i] * kernel[i * 3];
        val.g += adjust[i] * kernel[i * 3 + 1];
        val.b += adjust[i] * kernel[i * 3 + 2];
      }
      val.r = val.r / divisor + bias;
      val.g = val.g / divisor + bias;
      val.b = val.b / divisor + bias;
      return val;
    };
    Renderer.prototype.loadOverlay = function (layer, src) {
      var img,
        proxyUrl,
        _this = this;
      img = document.createElement("img");
      img.onload = function () {
        layer.context.drawImage(
          img,
          0,
          0,
          _this.c.dimensions.width,
          _this.c.dimensions.height
        );
        layer.imageData = layer.context.getImageData(
          0,
          0,
          _this.c.dimensions.width,
          _this.c.dimensions.height
        );
        layer.pixelData = layer.imageData.data;
        _this.c.pixelData = layer.pixelData;
        return _this.processNext();
      };
      proxyUrl = IO.remoteCheck(src);
      return (img.src = proxyUrl != null ? proxyUrl : src);
    };
    return Renderer;
  })();
  Renderer = Caman.Renderer;
  Caman.Store = (function () {
    function Store() {}
    Store.items = {};
    Store.has = function (search) {
      return this.items[search] != null;
    };
    Store.get = function (search) {
      return this.items[search];
    };
    Store.put = function (name, obj) {
      return (this.items[name] = obj);
    };
    Store.execute = function (search, callback) {
      var _this = this;
      setTimeout(function () {
        return callback.call(_this.get(search), _this.get(search));
      }, 0);
      return this.get(search);
    };
    Store.flush = function (name) {
      if (name == null) {
        name = false;
      }
      if (name) {
        return delete this.items[name];
      } else {
        return (this.items = {});
      }
    };
    return Store;
  })();
  Store = Caman.Store;
  Blender.register("normal", function (rgbaLayer, rgbaParent) {
    return { r: rgbaLayer.r, g: rgbaLayer.g, b: rgbaLayer.b };
  });
  Blender.register("multiply", function (rgbaLayer, rgbaParent) {
    return {
      r: (rgbaLayer.r * rgbaParent.r) / 255,
      g: (rgbaLayer.g * rgbaParent.g) / 255,
      b: (rgbaLayer.b * rgbaParent.b) / 255,
    };
  });
  Blender.register("screen", function (rgbaLayer, rgbaParent) {
    return {
      r: 255 - ((255 - rgbaLayer.r) * (255 - rgbaParent.r)) / 255,
      g: 255 - ((255 - rgbaLayer.g) * (255 - rgbaParent.g)) / 255,
      b: 255 - ((255 - rgbaLayer.b) * (255 - rgbaParent.b)) / 255,
    };
  });
  Blender.register("overlay", function (rgbaLayer, rgbaParent) {
    var result;
    result = {};
    result.r =
      rgbaParent.r > 128
        ? 255 - (2 * (255 - rgbaLayer.r) * (255 - rgbaParent.r)) / 255
        : (rgbaParent.r * rgbaLayer.r * 2) / 255;
    result.g =
      rgbaParent.g > 128
        ? 255 - (2 * (255 - rgbaLayer.g) * (255 - rgbaParent.g)) / 255
        : (rgbaParent.g * rgbaLayer.g * 2) / 255;
    result.b =
      rgbaParent.b > 128
        ? 255 - (2 * (255 - rgbaLayer.b) * (255 - rgbaParent.b)) / 255
        : (rgbaParent.b * rgbaLayer.b * 2) / 255;
    return result;
  });
  Blender.register("difference", function (rgbaLayer, rgbaParent) {
    return {
      r: rgbaLayer.r - rgbaParent.r,
      g: rgbaLayer.g - rgbaParent.g,
      b: rgbaLayer.b - rgbaParent.b,
    };
  });
  Blender.register("addition", function (rgbaLayer, rgbaParent) {
    return {
      r: rgbaParent.r + rgbaLayer.r,
      g: rgbaParent.g + rgbaLayer.g,
      b: rgbaParent.b + rgbaLayer.b,
    };
  });
  Blender.register("exclusion", function (rgbaLayer, rgbaParent) {
    return {
      r: 128 - (2 * (rgbaParent.r - 128) * (rgbaLayer.r - 128)) / 255,
      g: 128 - (2 * (rgbaParent.g - 128) * (rgbaLayer.g - 128)) / 255,
      b: 128 - (2 * (rgbaParent.b - 128) * (rgbaLayer.b - 128)) / 255,
    };
  });
  Blender.register("softLight", function (rgbaLayer, rgbaParent) {
    var result;
    result = {};
    result.r =
      rgbaParent.r > 128
        ? 255 - ((255 - rgbaParent.r) * (255 - (rgbaLayer.r - 128))) / 255
        : (rgbaParent.r * (rgbaLayer.r + 128)) / 255;
    result.g =
      rgbaParent.g > 128
        ? 255 - ((255 - rgbaParent.g) * (255 - (rgbaLayer.g - 128))) / 255
        : (rgbaParent.g * (rgbaLayer.g + 128)) / 255;
    result.b =
      rgbaParent.b > 128
        ? 255 - ((255 - rgbaParent.b) * (255 - (rgbaLayer.b - 128))) / 255
        : (rgbaParent.b * (rgbaLayer.b + 128)) / 255;
    return result;
  });
  Blender.register("lighten", function (rgbaLayer, rgbaParent) {
    return {
      r: rgbaParent.r > rgbaLayer.r ? rgbaParent.r : rgbaLayer.r,
      g: rgbaParent.g > rgbaLayer.g ? rgbaParent.g : rgbaLayer.g,
      b: rgbaParent.b > rgbaLayer.b ? rgbaParent.b : rgbaLayer.b,
    };
  });
  Blender.register("darken", function (rgbaLayer, rgbaParent) {
    return {
      r: rgbaParent.r > rgbaLayer.r ? rgbaLayer.r : rgbaParent.r,
      g: rgbaParent.g > rgbaLayer.g ? rgbaLayer.g : rgbaParent.g,
      b: rgbaParent.b > rgbaLayer.b ? rgbaLayer.b : rgbaParent.b,
    };
  });
  Filter.register("fillColor", function () {
    var color;
    if (arguments.length === 1) {
      color = Convert.hexToRGB(arguments[0]);
    } else {
      color = { r: arguments[0], g: arguments[1], b: arguments[2] };
    }
    return this.process("fillColor", function (rgba) {
      rgba.r = color.r;
      rgba.g = color.g;
      rgba.b = color.b;
      rgba.a = 255;
      return rgba;
    });
  });
  Filter.register("brightness", function (adjust) {
    adjust = Math.floor(255 * (adjust / 100));
    return this.process("brightness", function (rgba) {
      rgba.r += adjust;
      rgba.g += adjust;
      rgba.b += adjust;
      return rgba;
    });
  });
  Filter.register("saturation", function (adjust) {
    adjust *= -0.01;
    return this.process("saturation", function (rgba) {
      var max;
      max = Math.max(rgba.r, rgba.g, rgba.b);
      if (rgba.r !== max) {
        rgba.r += (max - rgba.r) * adjust;
      }
      if (rgba.g !== max) {
        rgba.g += (max - rgba.g) * adjust;
      }
      if (rgba.b !== max) {
        rgba.b += (max - rgba.b) * adjust;
      }
      return rgba;
    });
  });
  Filter.register("vibrance", function (adjust) {
    adjust *= -1;
    return this.process("vibrance", function (rgba) {
      var amt, avg, max;
      max = Math.max(rgba.r, rgba.g, rgba.b);
      avg = (rgba.r + rgba.g + rgba.b) / 3;
      amt = (((Math.abs(max - avg) * 2) / 255) * adjust) / 100;
      if (rgba.r !== max) {
        rgba.r += (max - rgba.r) * amt;
      }
      if (rgba.g !== max) {
        rgba.g += (max - rgba.g) * amt;
      }
      if (rgba.b !== max) {
        rgba.b += (max - rgba.b) * amt;
      }
      return rgba;
    });
  });
  Filter.register("greyscale", function (adjust) {
    return this.process("greyscale", function (rgba) {
      var avg;
      avg = Calculate.luminance(rgba);
      rgba.r = avg;
      rgba.g = avg;
      rgba.b = avg;
      return rgba;
    });
  });
  Filter.register("contrast", function (adjust) {
    adjust = Math.pow((adjust + 100) / 100, 2);
    return this.process("contrast", function (rgba) {
      rgba.r /= 255;
      rgba.r -= 0.5;
      rgba.r *= adjust;
      rgba.r += 0.5;
      rgba.r *= 255;
      rgba.g /= 255;
      rgba.g -= 0.5;
      rgba.g *= adjust;
      rgba.g += 0.5;
      rgba.g *= 255;
      rgba.b /= 255;
      rgba.b -= 0.5;
      rgba.b *= adjust;
      rgba.b += 0.5;
      rgba.b *= 255;
      return rgba;
    });
  });
  Filter.register("hue", function (adjust) {
    return this.process("hue", function (rgba) {
      var b, g, h, hsv, r, _ref;
      hsv = Convert.rgbToHSV(rgba.r, rgba.g, rgba.b);
      h = hsv.h * 100;
      h += Math.abs(adjust);
      h = h % 100;
      h /= 100;
      hsv.h = h;
      (_ref = Convert.hsvToRGB(hsv.h, hsv.s, hsv.v)),
        (r = _ref.r),
        (g = _ref.g),
        (b = _ref.b);
      rgba.r = r;
      rgba.g = g;
      rgba.b = b;
      return rgba;
    });
  });
  Filter.register("colorize", function () {
    var level, rgb;
    if (arguments.length === 2) {
      rgb = Convert.hexToRGB(arguments[0]);
      level = arguments[1];
    } else if (arguments.length === 4) {
      rgb = { r: arguments[0], g: arguments[1], b: arguments[2] };
      level = arguments[3];
    }
    return this.process("colorize", function (rgba) {
      rgba.r -= (rgba.r - rgb.r) * (level / 100);
      rgba.g -= (rgba.g - rgb.g) * (level / 100);
      rgba.b -= (rgba.b - rgb.b) * (level / 100);
      return rgba;
    });
  });
  Filter.register("invert", function () {
    return this.process("invert", function (rgba) {
      rgba.r = 255 - rgba.r;
      rgba.g = 255 - rgba.g;
      rgba.b = 255 - rgba.b;
      return rgba;
    });
  });
  Filter.register("sepia", function (adjust) {
    if (adjust == null) {
      adjust = 100;
    }
    adjust /= 100;
    return this.process("sepia", function (rgba) {
      rgba.r = Math.min(
        255,
        rgba.r * (1 - 0.607 * adjust) +
          rgba.g * (0.769 * adjust) +
          rgba.b * (0.189 * adjust)
      );
      rgba.g = Math.min(
        255,
        rgba.r * (0.349 * adjust) +
          rgba.g * (1 - 0.314 * adjust) +
          rgba.b * (0.168 * adjust)
      );
      rgba.b = Math.min(
        255,
        rgba.r * (0.272 * adjust) +
          rgba.g * (0.534 * adjust) +
          rgba.b * (1 - 0.869 * adjust)
      );
      return rgba;
    });
  });
  Filter.register("gamma", function (adjust) {
    return this.process("gamma", function (rgba) {
      rgba.r = Math.pow(rgba.r / 255, adjust) * 255;
      rgba.g = Math.pow(rgba.g / 255, adjust) * 255;
      rgba.b = Math.pow(rgba.b / 255, adjust) * 255;
      return rgba;
    });
  });
  Filter.register("noise", function (adjust) {
    adjust = Math.abs(adjust) * 2.55;
    return this.process("noise", function (rgba) {
      var rand;
      rand = Calculate.randomRange(adjust * -1, adjust);
      rgba.r += rand;
      rgba.g += rand;
      rgba.b += rand;
      return rgba;
    });
  });
  Filter.register("clip", function (adjust) {
    adjust = Math.abs(adjust) * 2.55;
    return this.process("clip", function (rgba) {
      if (rgba.r > 255 - adjust) {
        rgba.r = 255;
      } else if (rgba.r < adjust) {
        rgba.r = 0;
      }
      if (rgba.g > 255 - adjust) {
        rgba.g = 255;
      } else if (rgba.g < adjust) {
        rgba.g = 0;
      }
      if (rgba.b > 255 - adjust) {
        rgba.b = 255;
      } else if (rgba.b < adjust) {
        rgba.b = 0;
      }
      return rgba;
    });
  });
  Filter.register("channels", function (options) {
    var chan, value;
    if (typeof options !== "object") {
      return this;
    }
    for (chan in options) {
      if (!__hasProp.call(options, chan)) continue;
      value = options[chan];
      if (value === 0) {
        delete options[chan];
        continue;
      }
      options[chan] /= 100;
    }
    if (options.length === 0) {
      return this;
    }
    return this.process("channels", function (rgba) {
      if (options.red != null) {
        if (options.red > 0) {
          rgba.r += (255 - rgba.r) * options.red;
        } else {
          rgba.r -= rgba.r * Math.abs(options.red);
        }
      }
      if (options.green != null) {
        if (options.green > 0) {
          rgba.g += (255 - rgba.g) * options.green;
        } else {
          rgba.g -= rgba.g * Math.abs(options.green);
        }
      }
      if (options.blue != null) {
        if (options.blue > 0) {
          rgba.b += (255 - rgba.b) * options.blue;
        } else {
          rgba.b -= rgba.b * Math.abs(options.blue);
        }
      }
      return rgba;
    });
  });
  Filter.register("curves", function () {
    var bezier, chans, cps, ctrl1, ctrl2, end, i, start, _i, _j, _ref, _ref1;
    (chans = arguments[0]),
      (cps = 2 <= arguments.length ? __slice.call(arguments, 1) : []);
    if (typeof chans === "string") {
      chans = chans.split("");
    }
    if (chans[0] === "v") {
      chans = ["r", "g", "b"];
    }
    if (cps.length < 3 || cps.length > 4) {
      throw "Invalid number of arguments to curves filter";
    }
    start = cps[0];
    ctrl1 = cps[1];
    ctrl2 = cps.length === 4 ? cps[2] : cps[1];
    end = cps[cps.length - 1];
    bezier = Calculate.bezier(start, ctrl1, ctrl2, end, 0, 255);
    if (start[0] > 0) {
      for (
        i = _i = 0, _ref = start[0];
        0 <= _ref ? _i < _ref : _i > _ref;
        i = 0 <= _ref ? ++_i : --_i
      ) {
        bezier[i] = start[1];
      }
    }
    if (end[0] < 255) {
      for (
        i = _j = _ref1 = end[0];
        _ref1 <= 255 ? _j <= 255 : _j >= 255;
        i = _ref1 <= 255 ? ++_j : --_j
      ) {
        bezier[i] = end[1];
      }
    }
    return this.process("curves", function (rgba) {
      var _k, _ref2;
      for (
        i = _k = 0, _ref2 = chans.length;
        0 <= _ref2 ? _k < _ref2 : _k > _ref2;
        i = 0 <= _ref2 ? ++_k : --_k
      ) {
        rgba[chans[i]] = bezier[rgba[chans[i]]];
      }
      return rgba;
    });
  });
  Filter.register("exposure", function (adjust) {
    var ctrl1, ctrl2, p;
    p = Math.abs(adjust) / 100;
    ctrl1 = [0, 255 * p];
    ctrl2 = [255 - 255 * p, 255];
    if (adjust < 0) {
      ctrl1 = ctrl1.reverse();
      ctrl2 = ctrl2.reverse();
    }
    return this.curves("rgb", [0, 0], ctrl1, ctrl2, [255, 255]);
  });
  Caman.Plugin.register("crop", function (width, height, x, y) {
    var canvas, ctx;
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (typeof exports !== "undefined" && exports !== null) {
      canvas = new Canvas(width, height);
    } else {
      canvas = document.createElement("canvas");
      Util.copyAttributes(this.canvas, canvas);
      canvas.width = width;
      canvas.height = height;
    }
    ctx = canvas.getContext("2d");
    ctx.drawImage(this.canvas, x, y, width, height, 0, 0, width, height);
    this.cropCoordinates = { x: x, y: y };
    this.cropped = true;
    return this.replaceCanvas(canvas);
  });
  Caman.Plugin.register("resize", function (newDims) {
    var canvas, ctx;
    if (newDims == null) {
      newDims = null;
    }
    if (newDims === null || (newDims.width == null && newDims.height == null)) {
      Log.error("Invalid or missing dimensions given for resize");
      return;
    }
    if (newDims.width == null) {
      newDims.width = (this.canvas.width * newDims.height) / this.canvas.height;
    } else if (newDims.height == null) {
      newDims.height = (this.canvas.height * newDims.width) / this.canvas.width;
    }
    if (typeof exports !== "undefined" && exports !== null) {
      canvas = new Canvas(newDims.width, newDims.height);
    } else {
      canvas = document.createElement("canvas");
      Util.copyAttributes(this.canvas, canvas);
      canvas.width = newDims.width;
      canvas.height = newDims.height;
    }
    ctx = canvas.getContext("2d");
    ctx.drawImage(
      this.canvas,
      0,
      0,
      this.canvas.width,
      this.canvas.height,
      0,
      0,
      newDims.width,
      newDims.height
    );
    this.resized = true;
    return this.replaceCanvas(canvas);
  });
  Caman.Filter.register("crop", function () {
    return this.processPlugin("crop", Array.prototype.slice.call(arguments, 0));
  });
  Caman.Filter.register("resize", function () {
    return this.processPlugin(
      "resize",
      Array.prototype.slice.call(arguments, 0)
    );
  });
  Caman.Filter.register("boxBlur", function () {
    return this.processKernel("Box Blur", [1, 1, 1, 1, 1, 1, 1, 1, 1]);
  });
  Caman.Filter.register("heavyRadialBlur", function () {
    return this.processKernel(
      "Heavy Radial Blur",
      [
        0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0,
        0,
      ]
    );
  });
  Caman.Filter.register("gaussianBlur", function () {
    return this.processKernel(
      "Gaussian Blur",
      [
        1, 4, 6, 4, 1, 4, 16, 24, 16, 4, 6, 24, 36, 24, 6, 4, 16, 24, 16, 4, 1,
        4, 6, 4, 1,
      ]
    );
  });
  Caman.Filter.register("motionBlur", function (degrees) {
    var kernel;
    if (degrees === 0 || degrees === 180) {
      kernel = [
        0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0,
        0,
      ];
    } else if (
      (degrees > 0 && degrees < 90) ||
      (degrees > 180 && degrees < 270)
    ) {
      kernel = [
        0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
        0,
      ];
    } else if (degrees === 90 || degrees === 270) {
      kernel = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0,
      ];
    } else {
      kernel = [
        1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
        1,
      ];
    }
    return this.processKernel("Motion Blur", kernel);
  });
  Caman.Filter.register("sharpen", function (amt) {
    if (amt == null) {
      amt = 100;
    }
    amt /= 100;
    return this.processKernel("Sharpen", [
      0,
      -amt,
      0,
      -amt,
      4 * amt + 1,
      -amt,
      0,
      -amt,
      0,
    ]);
  });
  vignetteFilters = {
    brightness: function (rgba, amt, opts) {
      rgba.r = rgba.r - rgba.r * amt * opts.strength;
      rgba.g = rgba.g - rgba.g * amt * opts.strength;
      rgba.b = rgba.b - rgba.b * amt * opts.strength;
      return rgba;
    },
    gamma: function (rgba, amt, opts) {
      rgba.r =
        Math.pow(rgba.r / 255, Math.max(10 * amt * opts.strength, 1)) * 255;
      rgba.g =
        Math.pow(rgba.g / 255, Math.max(10 * amt * opts.strength, 1)) * 255;
      rgba.b =
        Math.pow(rgba.b / 255, Math.max(10 * amt * opts.strength, 1)) * 255;
      return rgba;
    },
    colorize: function (rgba, amt, opts) {
      rgba.r -= (rgba.r - opts.color.r) * amt;
      rgba.g -= (rgba.g - opts.color.g) * amt;
      rgba.b -= (rgba.b - opts.color.b) * amt;
      return rgba;
    },
  };
  Filter.register("vignette", function (size, strength) {
    var bezier, center, end, start;
    if (strength == null) {
      strength = 60;
    }
    if (typeof size === "string" && size.substr(-1) === "%") {
      if (this.dimensions.height > this.dimensions.width) {
        size =
          this.dimensions.width *
          (parseInt(size.substr(0, size.length - 1), 10) / 100);
      } else {
        size =
          this.dimensions.height *
          (parseInt(size.substr(0, size.length - 1), 10) / 100);
      }
    }
    strength /= 100;
    center = [this.dimensions.width / 2, this.dimensions.height / 2];
    start = Math.sqrt(Math.pow(center[0], 2) + Math.pow(center[1], 2));
    end = start - size;
    bezier = Calculate.bezier([0, 1], [30, 30], [70, 60], [100, 80]);
    return this.process("vignette", function (rgba) {
      var dist, div, loc;
      loc = rgba.locationXY();
      dist = Calculate.distance(loc.x, loc.y, center[0], center[1]);
      if (dist > end) {
        div = Math.max(
          1,
          (bezier[Math.round(((dist - end) / size) * 100)] / 10) * strength
        );
        rgba.r = Math.pow(rgba.r / 255, div) * 255;
        rgba.g = Math.pow(rgba.g / 255, div) * 255;
        rgba.b = Math.pow(rgba.b / 255, div) * 255;
      }
      return rgba;
    });
  });
  Filter.register("rectangularVignette", function (opts) {
    var defaults, dim, percent, size, _i, _len, _ref;
    defaults = {
      strength: 50,
      cornerRadius: 0,
      method: "brightness",
      color: { r: 0, g: 0, b: 0 },
    };
    opts = Util.extend(defaults, opts);
    if (!opts.size) {
      return this;
    } else if (typeof opts.size === "string") {
      percent = parseInt(opts.size, 10) / 100;
      opts.size = {
        width: this.dimensions.width * percent,
        height: this.dimensions.height * percent,
      };
    } else if (typeof opts.size === "object") {
      _ref = ["width", "height"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        dim = _ref[_i];
        if (typeof opts.size[dim] === "string") {
          opts.size[dim] =
            this.dimensions[dim] * (parseInt(opts.size[dim], 10) / 100);
        }
      }
    } else if (opts.size === "number") {
      size = opts.size;
      opts.size = { width: size, height: size };
    }
    if (typeof opts.cornerRadius === "string") {
      opts.cornerRadius =
        (opts.size.width / 2) * (parseInt(opts.cornerRadius, 10) / 100);
    }
    opts.strength /= 100;
    opts.size.width = Math.floor(opts.size.width);
    opts.size.height = Math.floor(opts.size.height);
    opts.image = {
      width: this.dimensions.width,
      height: this.dimensions.height,
    };
    if (opts.method === "colorize" && typeof opts.color === "string") {
      opts.color = Convert.hexToRGB(opts.color);
    }
    opts.coords = {
      left: (this.dimensions.width - opts.size.width) / 2,
      right: this.dimensions.width - opts.coords.left,
      bottom: (this.dimensions.height - opts.size.height) / 2,
      top: this.dimensions.height - opts.coords.bottom,
    };
    opts.corners = [
      {
        x: opts.coords.left + opts.cornerRadius,
        y: opts.coords.top - opts.cornerRadius,
      },
      {
        x: opts.coords.right - opts.cornerRadius,
        y: opts.coords.top - opts.cornerRadius,
      },
      {
        x: opts.coords.right - opts.cornerRadius,
        y: opts.coords.bottom + opts.cornerRadius,
      },
      {
        x: opts.coords.left + opts.cornerRadius,
        y: opts.coords.bottom + opts.cornerRadius,
      },
    ];
    opts.maxDist =
      Calculate.distance(0, 0, opts.corners[3].x, opts.corners[3].y) -
      opts.cornerRadius;
    return this.process("rectangularVignette", function (rgba) {
      var amt, loc, radialDist;
      loc = rgba.locationXY();
      if (
        loc.x > opts.corners[0].x &&
        loc.x < opts.corners[1].x &&
        loc.y > opts.coords.bottom &&
        loc.y < opts.coords.top
      ) {
        return rgba;
      }
      if (
        loc.x > opts.coords.left &&
        loc.x < opts.coords.right &&
        loc.y > opts.corners[3].y &&
        loc.y < opts.corners[2].y
      ) {
        return rgba;
      }
      if (
        loc.x > opts.corners[0].x &&
        loc.x < opts.corners[1].x &&
        loc.y > opts.coords.top
      ) {
        amt = (loc.y - opts.coords.top) / opts.maxDist;
      } else if (
        loc.y > opts.corners[2].y &&
        loc.y < opts.corners[1].y &&
        loc.x > opts.coords.right
      ) {
        amt = (loc.x - opts.coords.right) / opts.maxDist;
      } else if (
        loc.x > opts.corners[0].x &&
        loc.x < opts.corners[1].x &&
        loc.y < opts.coords.bottom
      ) {
        amt = (opts.coords.bottom - loc.y) / opts.maxDist;
      } else if (
        loc.y > opts.corners[2].y &&
        loc.y < opts.corners[1].y &&
        loc.x < opts.coords.left
      ) {
        amt = (opts.coords.left - loc.x) / opts.maxDist;
      } else if (loc.x <= opts.corners[0].x && loc.y >= opts.corners[0].y) {
        radialDist = Caman.distance(
          loc.x,
          loc.y,
          opts.corners[0].x,
          opts.corners[0].y
        );
        amt = (radialDist - opts.cornerRadius) / opts.maxDist;
      } else if (loc.x >= opts.corners[1].x && loc.y >= opts.corners[1].y) {
        radialDist = Caman.distance(
          loc.x,
          loc.y,
          opts.corners[1].x,
          opts.corners[1].y
        );
        amt = (radialDist - opts.cornerRadius) / opts.maxDist;
      } else if (loc.x >= opts.corners[2].x && loc.y <= opts.corners[2].y) {
        radialDist = Caman.distance(
          loc.x,
          loc.y,
          opts.corners[2].x,
          opts.corners[2].y
        );
        amt = (radialDist - opts.cornerRadius) / opts.maxDist;
      } else if (loc.x <= opts.corners[3].x && loc.y <= opts.corners[3].y) {
        radialDist = Caman.distance(
          loc.x,
          loc.y,
          opts.corners[3].x,
          opts.corners[3].y
        );
        amt = (radialDist - opts.cornerRadius) / opts.maxDist;
      }
      if (amt < 0) {
        return rgba;
      }
      return vignetteFilters[opts.method](rgba, amt, opts);
    });
  });
  (function () {
    var BlurStack,
      getLinearGradientMap,
      getRadialGradientMap,
      mul_table,
      shg_table;
    mul_table = [
      512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292,
      512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292,
      273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259,
      496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292,
      282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373,
      364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259,
      507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381,
      374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292,
      287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461,
      454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373,
      368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309,
      305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259,
      257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442,
      437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381,
      377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332,
      329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292,
      289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259,
    ];
    shg_table = [
      9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17,
      17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19,
      19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
      20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
      21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22,
      22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
      22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
      23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
      23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
      23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
      24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
      24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
      24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
      24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
      24, 24,
    ];
    getLinearGradientMap = function (
      width,
      height,
      centerX,
      centerY,
      angle,
      length,
      mirrored
    ) {
      var cnv, context, gradient, x1, x2, y1, y2;
      cnv =
        typeof exports !== "undefined" && exports !== null
          ? new Canvas()
          : document.createElement("canvas");
      cnv.width = width;
      cnv.height = height;
      x1 = centerX + Math.cos(angle) * length * 0.5;
      y1 = centerY + Math.sin(angle) * length * 0.5;
      x2 = centerX - Math.cos(angle) * length * 0.5;
      y2 = centerY - Math.sin(angle) * length * 0.5;
      context = cnv.getContext("2d");
      gradient = context.createLinearGradient(x1, y1, x2, y2);
      if (!mirrored) {
        gradient.addColorStop(0, "white");
        gradient.addColorStop(1, "black");
      } else {
        gradient.addColorStop(0, "white");
        gradient.addColorStop(0.5, "black");
        gradient.addColorStop(1, "white");
      }
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
      return context.getImageData(0, 0, width, height);
    };
    getRadialGradientMap = function (
      width,
      height,
      centerX,
      centerY,
      radius1,
      radius2
    ) {
      var cnv, context, gradient;
      cnv =
        typeof exports !== "undefined" && exports !== null
          ? new Canvas()
          : document.createElement("canvas");
      cnv.width = width;
      cnv.height = height;
      context = cnv.getContext("2d");
      gradient = context.createRadialGradient(
        centerX,
        centerY,
        radius1,
        centerX,
        centerY,
        radius2
      );
      gradient.addColorStop(1, "white");
      gradient.addColorStop(0, "black");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
      return context.getImageData(0, 0, width, height);
    };
    BlurStack = function () {
      this.r = 0;
      this.g = 0;
      this.b = 0;
      this.a = 0;
      return (this.next = null);
    };
    Caman.Plugin.register(
      "compoundBlur",
      function (radiusData, radius, increaseFactor, blurLevels) {
        var b_in_sum,
          b_out_sum,
          b_sum,
          blend,
          currentIndex,
          div,
          g_in_sum,
          g_out_sum,
          g_sum,
          height,
          heightMinus1,
          i,
          iblend,
          idx,
          imagePixels,
          index,
          iradius,
          lookupValue,
          mul_sum,
          p,
          pb,
          pg,
          pixels,
          pr,
          r_in_sum,
          r_out_sum,
          r_sum,
          radiusPixels,
          radiusPlus1,
          rbs,
          shg_sum,
          stack,
          stackEnd,
          stackIn,
          stackOut,
          stackStart,
          steps,
          sumFactor,
          w4,
          wh,
          wh4,
          width,
          widthMinus1,
          x,
          y,
          yi,
          yp,
          yw,
          _i,
          _j,
          _k,
          _l,
          _m,
          _n,
          _o,
          _p,
          _q,
          _r;
        width = this.dimensions.width;
        height = this.dimensions.height;
        imagePixels = this.pixelData;
        radiusPixels = radiusData.data;
        wh = width * height;
        wh4 = wh << 2;
        pixels = [];
        for (
          i = _i = 0;
          0 <= wh4 ? _i < wh4 : _i > wh4;
          i = 0 <= wh4 ? ++_i : --_i
        ) {
          pixels[i] = imagePixels[i];
        }
        currentIndex = 0;
        steps = blurLevels;
        blurLevels -= 1;
        while (steps-- >= 0) {
          iradius = (radius + 0.5) | 0;
          if (iradius === 0) {
            continue;
          }
          if (iradius > 256) {
            iradius = 256;
          }
          div = iradius + iradius + 1;
          w4 = width << 2;
          widthMinus1 = width - 1;
          heightMinus1 = height - 1;
          radiusPlus1 = iradius + 1;
          sumFactor = (radiusPlus1 * (radiusPlus1 + 1)) / 2;
          stackStart = new BlurStack();
          stackEnd = void 0;
          stack = stackStart;
          for (
            i = _j = 1;
            1 <= div ? _j < div : _j > div;
            i = 1 <= div ? ++_j : --_j
          ) {
            stack = stack.next = new BlurStack();
            if (i === radiusPlus1) {
              stackEnd = stack;
            }
          }
          stack.next = stackStart;
          stackIn = null;
          stackOut = null;
          yw = yi = 0;
          mul_sum = mul_table[iradius];
          shg_sum = shg_table[iradius];
          for (
            y = _k = 0;
            0 <= height ? _k < height : _k > height;
            y = 0 <= height ? ++_k : --_k
          ) {
            r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;
            r_out_sum = radiusPlus1 * (pr = pixels[yi]);
            g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
            b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
            r_sum += sumFactor * pr;
            g_sum += sumFactor * pg;
            b_sum += sumFactor * pb;
            stack = stackStart;
            for (
              i = _l = 0;
              0 <= radiusPlus1 ? _l < radiusPlus1 : _l > radiusPlus1;
              i = 0 <= radiusPlus1 ? ++_l : --_l
            ) {
              stack.r = pr;
              stack.g = pg;
              stack.b = pb;
              stack = stack.next;
            }
            for (
              i = _m = 1;
              1 <= radiusPlus1 ? _m < radiusPlus1 : _m > radiusPlus1;
              i = 1 <= radiusPlus1 ? ++_m : --_m
            ) {
              p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
              r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
              g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
              b_sum += (stack.b = pb = pixels[p + 2]) * rbs;
              r_in_sum += pr;
              g_in_sum += pg;
              b_in_sum += pb;
              stack = stack.next;
            }
            stackIn = stackStart;
            stackOut = stackEnd;
            for (
              x = _n = 0;
              0 <= width ? _n < width : _n > width;
              x = 0 <= width ? ++_n : --_n
            ) {
              pixels[yi] = (r_sum * mul_sum) >> shg_sum;
              pixels[yi + 1] = (g_sum * mul_sum) >> shg_sum;
              pixels[yi + 2] = (b_sum * mul_sum) >> shg_sum;
              r_sum -= r_out_sum;
              g_sum -= g_out_sum;
              b_sum -= b_out_sum;
              r_out_sum -= stackIn.r;
              g_out_sum -= stackIn.g;
              b_out_sum -= stackIn.b;
              p =
                (yw +
                  ((p = x + radiusPlus1) < widthMinus1 ? p : widthMinus1)) <<
                2;
              r_in_sum += stackIn.r = pixels[p];
              g_in_sum += stackIn.g = pixels[p + 1];
              b_in_sum += stackIn.b = pixels[p + 2];
              r_sum += r_in_sum;
              g_sum += g_in_sum;
              b_sum += b_in_sum;
              stackIn = stackIn.next;
              r_out_sum += pr = stackOut.r;
              g_out_sum += pg = stackOut.g;
              b_out_sum += pb = stackOut.b;
              r_in_sum -= pr;
              g_in_sum -= pg;
              b_in_sum -= pb;
              stackOut = stackOut.next;
              yi += 4;
            }
            yw += width;
          }
          for (
            x = _o = 0;
            0 <= width ? _o < width : _o > width;
            x = 0 <= width ? ++_o : --_o
          ) {
            g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;
            yi = x << 2;
            r_out_sum = radiusPlus1 * (pr = pixels[yi]);
            g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
            b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
            r_sum += sumFactor * pr;
            g_sum += sumFactor * pg;
            b_sum += sumFactor * pb;
            stack = stackStart;
            for (
              i = _p = 0;
              0 <= radiusPlus1 ? _p < radiusPlus1 : _p > radiusPlus1;
              i = 0 <= radiusPlus1 ? ++_p : --_p
            ) {
              stack.r = pr;
              stack.g = pg;
              stack.b = pb;
              stack = stack.next;
            }
            yp = width;
            for (
              i = _q = 1;
              1 <= radiusPlus1 ? _q < radiusPlus1 : _q > radiusPlus1;
              i = 1 <= radiusPlus1 ? ++_q : --_q
            ) {
              yi = (yp + x) << 2;
              r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
              g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
              b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;
              r_in_sum += pr;
              g_in_sum += pg;
              b_in_sum += pb;
              stack = stack.next;
              if (i < heightMinus1) {
                yp += width;
              }
            }
            yi = x;
            stackIn = stackStart;
            stackOut = stackEnd;
            for (
              y = _r = 0;
              0 <= height ? _r < height : _r > height;
              y = 0 <= height ? ++_r : --_r
            ) {
              p = yi << 2;
              pixels[p] = (r_sum * mul_sum) >> shg_sum;
              pixels[p + 1] = (g_sum * mul_sum) >> shg_sum;
              pixels[p + 2] = (b_sum * mul_sum) >> shg_sum;
              r_sum -= r_out_sum;
              g_sum -= g_out_sum;
              b_sum -= b_out_sum;
              r_out_sum -= stackIn.r;
              g_out_sum -= stackIn.g;
              b_out_sum -= stackIn.b;
              p =
                (x +
                  ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) *
                    width) <<
                2;
              r_sum += r_in_sum += stackIn.r = pixels[p];
              g_sum += g_in_sum += stackIn.g = pixels[p + 1];
              b_sum += b_in_sum += stackIn.b = pixels[p + 2];
              stackIn = stackIn.next;
              r_out_sum += pr = stackOut.r;
              g_out_sum += pg = stackOut.g;
              b_out_sum += pb = stackOut.b;
              r_in_sum -= pr;
              g_in_sum -= pg;
              b_in_sum -= pb;
              stackOut = stackOut.next;
              yi += width;
            }
          }
          radius *= increaseFactor;
          i = wh;
          while (--i > -1) {
            idx = i << 2;
            lookupValue = ((radiusPixels[idx + 2] & 0xff) / 255.0) * blurLevels;
            index = lookupValue | 0;
            if (index === currentIndex) {
              blend = 256.0 * (lookupValue - (lookupValue | 0));
              iblend = 256 - blend;
              imagePixels[idx] =
                (imagePixels[idx] * iblend + pixels[idx] * blend) >> 8;
              imagePixels[idx + 1] =
                (imagePixels[idx + 1] * iblend + pixels[idx + 1] * blend) >> 8;
              imagePixels[idx + 2] =
                (imagePixels[idx + 2] * iblend + pixels[idx + 2] * blend) >> 8;
            } else if (index === currentIndex + 1) {
              imagePixels[idx] = pixels[idx];
              imagePixels[idx + 1] = pixels[idx + 1];
              imagePixels[idx + 2] = pixels[idx + 2];
            }
          }
          currentIndex++;
        }
        return this;
      }
    );
    Caman.Filter.register("tiltShift", function (opts) {
      var defaults, gradient;
      defaults = {
        center: { x: this.dimensions.width / 2, y: this.dimensions.height / 2 },
        angle: 45,
        focusWidth: 200,
        startRadius: 3,
        radiusFactor: 1.5,
        steps: 3,
      };
      opts = Util.extend(defaults, opts);
      opts.angle *= Math.PI / 180;
      gradient = getLinearGradientMap(
        this.dimensions.width,
        this.dimensions.height,
        opts.center.x,
        opts.center.y,
        opts.angle,
        opts.focusWidth,
        true
      );
      return this.processPlugin("compoundBlur", [
        gradient,
        opts.startRadius,
        opts.radiusFactor,
        opts.steps,
      ]);
    });
    return Caman.Filter.register("radialBlur", function (opts) {
      var defaults, gradient, radius1, radius2;
      defaults = {
        size: 50,
        center: { x: this.dimensions.width / 2, y: this.dimensions.height / 2 },
        startRadius: 3,
        radiusFactor: 1.5,
        steps: 3,
        radius: null,
      };
      opts = Util.extend(defaults, opts);
      if (!opts.radius) {
        opts.radius =
          this.dimensions.width < this.dimensions.height
            ? this.dimensions.height
            : this.dimensions.width;
      }
      radius1 = opts.radius / 2 - opts.size;
      radius2 = opts.radius / 2;
      gradient = getRadialGradientMap(
        this.dimensions.width,
        this.dimensions.height,
        opts.center.x,
        opts.center.y,
        radius1,
        radius2
      );
      return this.processPlugin("compoundBlur", [
        gradient,
        opts.startRadius,
        opts.radiusFactor,
        opts.steps,
      ]);
    });
  })();
  Caman.Filter.register("edgeEnhance", function () {
    return this.processKernel("Edge Enhance", [0, 0, 0, -1, 1, 0, 0, 0, 0]);
  });
  Caman.Filter.register("edgeDetect", function () {
    return this.processKernel(
      "Edge Detect",
      [-1, -1, -1, -1, 8, -1, -1, -1, -1]
    );
  });
  Caman.Filter.register("emboss", function () {
    return this.processKernel("Emboss", [-2, -1, 0, -1, 1, 1, 0, 1, 2]);
  });
  Caman.Filter.register("posterize", function (adjust) {
    var numOfAreas, numOfValues;
    numOfAreas = 256 / adjust;
    numOfValues = 255 / (adjust - 1);
    return this.process("posterize", function (rgba) {
      rgba.r = Math.floor(Math.floor(rgba.r / numOfAreas) * numOfValues);
      rgba.g = Math.floor(Math.floor(rgba.g / numOfAreas) * numOfValues);
      rgba.b = Math.floor(Math.floor(rgba.b / numOfAreas) * numOfValues);
      return rgba;
    });
  });
  Caman.Filter.register("vintage", function (vignette) {
    if (vignette == null) {
      vignette = true;
    }
    this.greyscale();
    this.contrast(5);
    this.noise(3);
    this.sepia(100);
    this.channels({ red: 8, blue: 2, green: 4 });
    this.gamma(0.87);
    if (vignette) {
      return this.vignette("40%", 30);
    }
  });
  Caman.Filter.register("lomo", function (vignette) {
    if (vignette == null) {
      vignette = true;
    }
    this.brightness(15);
    this.exposure(15);
    this.curves("rgb", [0, 0], [200, 0], [155, 255], [255, 255]);
    this.saturation(-20);
    this.gamma(1.8);
    if (vignette) {
      this.vignette("50%", 60);
    }
    return this.brightness(5);
  });
  Caman.Filter.register("clarity", function (grey) {
    if (grey == null) {
      grey = false;
    }
    this.vibrance(20);
    this.curves("rgb", [5, 0], [130, 150], [190, 220], [250, 255]);
    this.sharpen(15);
    this.vignette("45%", 20);
    if (grey) {
      this.greyscale();
      this.contrast(4);
    }
    return this;
  });
  Caman.Filter.register("sinCity", function () {
    this.contrast(100);
    this.brightness(15);
    this.exposure(10);
    this.posterize(80);
    this.clip(30);
    return this.greyscale();
  });
  Caman.Filter.register("sunrise", function () {
    this.exposure(3.5);
    this.saturation(-5);
    this.vibrance(50);
    this.sepia(60);
    this.colorize("#e87b22", 10);
    this.channels({ red: 8, blue: 8 });
    this.contrast(5);
    this.gamma(1.2);
    return this.vignette("55%", 25);
  });
  Caman.Filter.register("crossProcess", function () {
    this.exposure(5);
    this.colorize("#e87b22", 4);
    this.sepia(20);
    this.channels({ blue: 8, red: 3 });
    this.curves("b", [0, 0], [100, 150], [180, 180], [255, 255]);
    this.contrast(15);
    this.vibrance(75);
    return this.gamma(1.6);
  });
  Caman.Filter.register("orangePeel", function () {
    this.curves("rgb", [0, 0], [100, 50], [140, 200], [255, 255]);
    this.vibrance(-30);
    this.saturation(-30);
    this.colorize("#ff9000", 30);
    this.contrast(-5);
    return this.gamma(1.4);
  });
  Caman.Filter.register("love", function () {
    this.brightness(5);
    this.exposure(8);
    this.contrast(4);
    this.colorize("#c42007", 30);
    this.vibrance(50);
    return this.gamma(1.3);
  });
  Caman.Filter.register("grungy", function () {
    this.gamma(1.5);
    this.clip(25);
    this.saturation(-60);
    this.contrast(5);
    this.noise(5);
    return this.vignette("50%", 30);
  });
  Caman.Filter.register("jarques", function () {
    this.saturation(-35);
    this.curves("b", [20, 0], [90, 120], [186, 144], [255, 230]);
    this.curves("r", [0, 0], [144, 90], [138, 120], [255, 255]);
    this.curves("g", [10, 0], [115, 105], [148, 100], [255, 248]);
    this.curves("rgb", [0, 0], [120, 100], [128, 140], [255, 255]);
    return this.sharpen(20);
  });
  Caman.Filter.register("pinhole", function () {
    this.greyscale();
    this.sepia(10);
    this.exposure(10);
    this.contrast(15);
    return this.vignette("60%", 35);
  });
  Caman.Filter.register("oldBoot", function () {
    this.saturation(-20);
    this.vibrance(-50);
    this.gamma(1.1);
    this.sepia(30);
    this.channels({ red: -10, blue: 5 });
    this.curves("rgb", [0, 0], [80, 50], [128, 230], [255, 255]);
    return this.vignette("60%", 30);
  });
  Caman.Filter.register("glowingSun", function (vignette) {
    if (vignette == null) {
      vignette = true;
    }
    this.brightness(10);
    this.newLayer(function () {
      this.setBlendingMode("multiply");
      this.opacity(80);
      this.copyParent();
      this.filter.gamma(0.8);
      this.filter.contrast(50);
      return this.filter.exposure(10);
    });
    this.newLayer(function () {
      this.setBlendingMode("softLight");
      this.opacity(80);
      return this.fillColor("#f49600");
    });
    this.exposure(20);
    this.gamma(0.8);
    if (vignette) {
      return this.vignette("45%", 20);
    }
  });
  Caman.Filter.register("hazyDays", function () {
    this.gamma(1.2);
    this.newLayer(function () {
      this.setBlendingMode("overlay");
      this.opacity(60);
      this.copyParent();
      this.filter.channels({ red: 5 });
      return this.filter.stackBlur(15);
    });
    this.newLayer(function () {
      this.setBlendingMode("addition");
      this.opacity(40);
      return this.fillColor("#6899ba");
    });
    this.newLayer(function () {
      this.setBlendingMode("multiply");
      this.opacity(35);
      this.copyParent();
      this.filter.brightness(40);
      this.filter.vibrance(40);
      this.filter.exposure(30);
      this.filter.contrast(15);
      this.filter.curves("r", [0, 40], [128, 128], [128, 128], [255, 215]);
      this.filter.curves("g", [0, 40], [128, 128], [128, 128], [255, 215]);
      this.filter.curves("b", [0, 40], [128, 128], [128, 128], [255, 215]);
      return this.filter.stackBlur(5);
    });
    this.curves("r", [20, 0], [128, 158], [128, 128], [235, 255]);
    this.curves("g", [20, 0], [128, 128], [128, 128], [235, 255]);
    this.curves("b", [20, 0], [128, 108], [128, 128], [235, 255]);
    return this.vignette("45%", 20);
  });
  Caman.Filter.register("herMajesty", function () {
    this.brightness(40);
    this.colorize("#ea1c5d", 10);
    this.curves("b", [0, 10], [128, 180], [190, 190], [255, 255]);
    this.newLayer(function () {
      this.setBlendingMode("overlay");
      this.opacity(50);
      this.copyParent();
      this.filter.gamma(0.7);
      return this.newLayer(function () {
        this.setBlendingMode("normal");
        this.opacity(60);
        return this.fillColor("#ea1c5d");
      });
    });
    this.newLayer(function () {
      this.setBlendingMode("multiply");
      this.opacity(60);
      this.copyParent();
      this.filter.saturation(50);
      this.filter.hue(90);
      return this.filter.contrast(10);
    });
    this.gamma(1.4);
    this.vibrance(-30);
    this.newLayer(function () {
      this.opacity(10);
      return this.fillColor("#e5f0ff");
    });
    return this;
  });
  Caman.Filter.register("nostalgia", function () {
    this.saturation(20);
    this.gamma(1.4);
    this.greyscale();
    this.contrast(5);
    this.sepia(100);
    this.channels({ red: 8, blue: 2, green: 4 });
    this.gamma(0.8);
    this.contrast(5);
    this.exposure(10);
    this.newLayer(function () {
      this.setBlendingMode("overlay");
      this.copyParent();
      this.opacity(55);
      return this.filter.stackBlur(10);
    });
    return this.vignette("50%", 30);
  });
  Caman.Filter.register("hemingway", function () {
    this.greyscale();
    this.contrast(10);
    this.gamma(0.9);
    this.newLayer(function () {
      this.setBlendingMode("multiply");
      this.opacity(40);
      this.copyParent();
      this.filter.exposure(15);
      this.filter.contrast(15);
      return this.filter.channels({ green: 10, red: 5 });
    });
    this.sepia(30);
    this.curves("rgb", [0, 10], [120, 90], [180, 200], [235, 255]);
    this.channels({ red: 5, green: -2 });
    return this.exposure(15);
  });
  Caman.Filter.register("concentrate", function () {
    this.sharpen(40);
    this.saturation(-50);
    this.channels({ red: 3 });
    this.newLayer(function () {
      this.setBlendingMode("multiply");
      this.opacity(80);
      this.copyParent();
      this.filter.sharpen(5);
      this.filter.contrast(50);
      this.filter.exposure(10);
      return this.filter.channels({ blue: 5 });
    });
    return this.brightness(10);
  });
  Caman.Plugin.register("rotate", function (degrees) {
    var angle, canvas, ctx, height, to_radians, width, x, y;
    angle = degrees % 360;
    if (angle === 0) {
      return (this.dimensions = {
        width: this.canvas.width,
        height: this.canvas.height,
      });
    }
    to_radians = Math.PI / 180;
    if (typeof exports !== "undefined" && exports !== null) {
      canvas = new Canvas();
    } else {
      canvas = document.createElement("canvas");
      Util.copyAttributes(this.canvas, canvas);
    }
    if (angle === 90 || angle === -270 || angle === 270 || angle === -90) {
      width = this.canvas.height;
      height = this.canvas.width;
      x = width / 2;
      y = height / 2;
    } else if (angle === 180) {
      width = this.canvas.width;
      height = this.canvas.height;
      x = width / 2;
      y = height / 2;
    } else {
      width = Math.sqrt(
        Math.pow(this.originalWidth, 2) + Math.pow(this.originalHeight, 2)
      );
      height = width;
      x = this.canvas.height / 2;
      y = this.canvas.width / 2;
    }
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext("2d");
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle * to_radians);
    ctx.drawImage(
      this.canvas,
      -this.canvas.width / 2,
      -this.canvas.height / 2,
      this.canvas.width,
      this.canvas.height
    );
    ctx.restore();
    return this.replaceCanvas(canvas);
  });
  Caman.Filter.register("rotate", function () {
    return this.processPlugin(
      "rotate",
      Array.prototype.slice.call(arguments, 0)
    );
  });
  (function () {
    var BlurStack, mul_table, shg_table;
    mul_table = [
      512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292,
      512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292,
      273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259,
      496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292,
      282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373,
      364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259,
      507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381,
      374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292,
      287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461,
      454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373,
      368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309,
      305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259,
      257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442,
      437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381,
      377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332,
      329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292,
      289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259,
    ];
    shg_table = [
      9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17,
      17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19,
      19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
      20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
      21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22,
      22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
      22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
      23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
      23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
      23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
      24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
      24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
      24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
      24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
      24, 24,
    ];
    BlurStack = function () {
      this.r = 0;
      this.g = 0;
      this.b = 0;
      this.a = 0;
      return (this.next = null);
    };
    Caman.Plugin.register("stackBlur", function (radius) {
      var b_in_sum,
        b_out_sum,
        b_sum,
        div,
        g_in_sum,
        g_out_sum,
        g_sum,
        height,
        heightMinus1,
        i,
        mul_sum,
        p,
        pb,
        pg,
        pixels,
        pr,
        r_in_sum,
        r_out_sum,
        r_sum,
        radiusPlus1,
        rbs,
        shg_sum,
        stack,
        stackEnd,
        stackIn,
        stackOut,
        stackStart,
        sumFactor,
        w4,
        width,
        widthMinus1,
        x,
        y,
        yi,
        yp,
        yw,
        _i,
        _j,
        _k,
        _l,
        _m,
        _n,
        _o,
        _p,
        _q;
      if (isNaN(radius) || radius < 1) {
        return;
      }
      radius |= 0;
      pixels = this.pixelData;
      width = this.dimensions.width;
      height = this.dimensions.height;
      div = radius + radius + 1;
      w4 = width << 2;
      widthMinus1 = width - 1;
      heightMinus1 = height - 1;
      radiusPlus1 = radius + 1;
      sumFactor = (radiusPlus1 * (radiusPlus1 + 1)) / 2;
      stackStart = new BlurStack();
      stack = stackStart;
      for (
        i = _i = 1;
        1 <= div ? _i < div : _i > div;
        i = 1 <= div ? ++_i : --_i
      ) {
        stack = stack.next = new BlurStack();
        if (i === radiusPlus1) {
          stackEnd = stack;
        }
      }
      stack.next = stackStart;
      stackIn = null;
      stackOut = null;
      yw = yi = 0;
      mul_sum = mul_table[radius];
      shg_sum = shg_table[radius];
      for (
        y = _j = 0;
        0 <= height ? _j < height : _j > height;
        y = 0 <= height ? ++_j : --_j
      ) {
        r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;
        r_out_sum = radiusPlus1 * (pr = pixels[yi]);
        g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
        b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
        r_sum += sumFactor * pr;
        g_sum += sumFactor * pg;
        b_sum += sumFactor * pb;
        stack = stackStart;
        for (
          i = _k = 0;
          0 <= radiusPlus1 ? _k < radiusPlus1 : _k > radiusPlus1;
          i = 0 <= radiusPlus1 ? ++_k : --_k
        ) {
          stack.r = pr;
          stack.g = pg;
          stack.b = pb;
          stack = stack.next;
        }
        for (
          i = _l = 1;
          1 <= radiusPlus1 ? _l < radiusPlus1 : _l > radiusPlus1;
          i = 1 <= radiusPlus1 ? ++_l : --_l
        ) {
          p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
          r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
          g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
          b_sum += (stack.b = pb = pixels[p + 2]) * rbs;
          r_in_sum += pr;
          g_in_sum += pg;
          b_in_sum += pb;
          stack = stack.next;
        }
        stackIn = stackStart;
        stackOut = stackEnd;
        for (
          x = _m = 0;
          0 <= width ? _m < width : _m > width;
          x = 0 <= width ? ++_m : --_m
        ) {
          pixels[yi] = (r_sum * mul_sum) >> shg_sum;
          pixels[yi + 1] = (g_sum * mul_sum) >> shg_sum;
          pixels[yi + 2] = (b_sum * mul_sum) >> shg_sum;
          r_sum -= r_out_sum;
          g_sum -= g_out_sum;
          b_sum -= b_out_sum;
          r_out_sum -= stackIn.r;
          g_out_sum -= stackIn.g;
          b_out_sum -= stackIn.b;
          p =
            (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;
          r_in_sum += stackIn.r = pixels[p];
          g_in_sum += stackIn.g = pixels[p + 1];
          b_in_sum += stackIn.b = pixels[p + 2];
          r_sum += r_in_sum;
          g_sum += g_in_sum;
          b_sum += b_in_sum;
          stackIn = stackIn.next;
          r_out_sum += pr = stackOut.r;
          g_out_sum += pg = stackOut.g;
          b_out_sum += pb = stackOut.b;
          r_in_sum -= pr;
          g_in_sum -= pg;
          b_in_sum -= pb;
          stackOut = stackOut.next;
          yi += 4;
        }
        yw += width;
      }
      for (
        x = _n = 0;
        0 <= width ? _n < width : _n > width;
        x = 0 <= width ? ++_n : --_n
      ) {
        g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;
        yi = x << 2;
        r_out_sum = radiusPlus1 * (pr = pixels[yi]);
        g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
        b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
        r_sum += sumFactor * pr;
        g_sum += sumFactor * pg;
        b_sum += sumFactor * pb;
        stack = stackStart;
        for (
          i = _o = 0;
          0 <= radiusPlus1 ? _o < radiusPlus1 : _o > radiusPlus1;
          i = 0 <= radiusPlus1 ? ++_o : --_o
        ) {
          stack.r = pr;
          stack.g = pg;
          stack.b = pb;
          stack = stack.next;
        }
        yp = width;
        for (
          i = _p = 1;
          1 <= radius ? _p <= radius : _p >= radius;
          i = 1 <= radius ? ++_p : --_p
        ) {
          yi = (yp + x) << 2;
          r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
          g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
          b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;
          r_in_sum += pr;
          g_in_sum += pg;
          b_in_sum += pb;
          stack = stack.next;
          if (i < heightMinus1) {
            yp += width;
          }
        }
        yi = x;
        stackIn = stackStart;
        stackOut = stackEnd;
        for (
          y = _q = 0;
          0 <= height ? _q < height : _q > height;
          y = 0 <= height ? ++_q : --_q
        ) {
          p = yi << 2;
          pixels[p] = (r_sum * mul_sum) >> shg_sum;
          pixels[p + 1] = (g_sum * mul_sum) >> shg_sum;
          pixels[p + 2] = (b_sum * mul_sum) >> shg_sum;
          r_sum -= r_out_sum;
          g_sum -= g_out_sum;
          b_sum -= b_out_sum;
          r_out_sum -= stackIn.r;
          g_out_sum -= stackIn.g;
          b_out_sum -= stackIn.b;
          p =
            (x +
              ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) *
                width) <<
            2;
          r_sum += r_in_sum += stackIn.r = pixels[p];
          g_sum += g_in_sum += stackIn.g = pixels[p + 1];
          b_sum += b_in_sum += stackIn.b = pixels[p + 2];
          stackIn = stackIn.next;
          r_out_sum += pr = stackOut.r;
          g_out_sum += pg = stackOut.g;
          b_out_sum += pb = stackOut.b;
          r_in_sum -= pr;
          g_in_sum -= pg;
          b_in_sum -= pb;
          stackOut = stackOut.next;
          yi += width;
        }
      }
      return this;
    });
    return Caman.Filter.register("stackBlur", function (radius) {
      return this.processPlugin("stackBlur", [radius]);
    });
  })();
  Caman.Filter.register("threshold", function (adjust) {
    return this.process("threshold", function (rgba) {
      var luminance;
      luminance = 0.2126 * rgba.r + 0.7152 * rgba.g + 0.0722 * rgba.b;
      if (luminance < adjust) {
        rgba.r = 0;
        rgba.g = 0;
        rgba.b = 0;
      } else {
        rgba.r = 255;
        rgba.g = 255;
        rgba.b = 255;
      }
      return rgba;
    });
  });
}.call(this));

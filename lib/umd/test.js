(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.test = factory());
}(this, (function () { 'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var BLAME_FUNCTION_INDEX = 3; // [current, parent, *error*, caller to blame, …]

function warnDeprecation(reason) {
  // eslint-disable-line max-statements
  if (process.env.FOLKTALE_ASSERTIONS !== 'none') {
    var stack = new Error('').stack;
    var offender = void 0;
    if (stack) {
      var lines = stack.split('\n');
      offender = lines[BLAME_FUNCTION_INDEX];
    }

    if (offender) {
      console.warn(reason + '\n    Blame: ' + offender.trim());
    } else {
      console.warn(reason);
    }
  }
}

var warnDeprecation_1 = warnDeprecation;

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var keys = Object.keys;
var symbols = Object.getOwnPropertySymbols;
var defineProperty = Object.defineProperty;
var property = Object.getOwnPropertyDescriptor;

/*
 * Extends an objects with own enumerable key/value pairs from other sources.
 *
 * This is used to define objects for the ADTs througout this file, and there
 * are some important differences from Object.assign:
 *
 *   - This code is only concerned with own enumerable property *names*.
 *   - Additionally this code copies all own symbols (important for tags).
 *
 * When copying, this function copies **whole property descriptors**, which
 * means getters/setters are not executed during the copying. The only
 * exception is when the property name is `prototype`, which is not
 * configurable in functions by default.
 *
 * This code only special cases `prototype` because any other non-configurable
 * property is considered an error, and should crash the program so it can be
 * fixed.
 */
function extend(target) {
  for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }

  sources.forEach(function (source) {
    keys(source).forEach(function (key) {
      if (key === 'prototype') {
        target[key] = source[key];
      } else {
        defineProperty(target, key, property(source, key));
      }
    });
    symbols(source).forEach(function (symbol) {
      defineProperty(target, symbol, property(source, symbol));
    });
  });
  return target;
}

var extend_1 = extend;

function _defineEnumerableProperties(obj, descs) { for (var key in descs) { var desc = descs[key]; desc.configurable = desc.enumerable = true; if ("value" in desc) desc.writable = true; Object.defineProperty(obj, key, desc); } return obj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

// --[ Dependencies ]---------------------------------------------------



// --[ Constants and Aliases ]------------------------------------------
var TYPE = Symbol.for('@@folktale:adt:type');
var TAG = Symbol.for('@@folktale:adt:tag');
var META = Symbol.for('@@meta:magical');

var keys$1 = Object.keys;

// --[ Helpers ]--------------------------------------------------------

//
// Returns an array of own enumerable values in an object.
//
function values(object) {
  return keys$1(object).map(function (key) {
    return object[key];
  });
}

//
// Transforms own enumerable key/value pairs.
//
function mapObject(object, transform) {
  return keys$1(object).reduce(function (result, key) {
    result[key] = transform(key, object[key]);
    return result;
  }, {});
}

// --[ Variant implementation ]-----------------------------------------

//
// Defines the variants given a set of patterns and an ADT namespace.
//
function defineVariants(typeId, patterns, adt) {
  return mapObject(patterns, function (name, constructor) {
    var _constructor, _ref, _extend, _mutatorMap, _tag, _type, _constructor2, _extend2, _mutatorMap2;

    // ---[ Variant Internals ]-----------------------------------------
    function InternalConstructor() {}
    InternalConstructor.prototype = Object.create(adt);

    extend_1(InternalConstructor.prototype, (_extend = {}, _defineProperty(_extend, TAG, name), _constructor = 'constructor', _mutatorMap = {}, _mutatorMap[_constructor] = _mutatorMap[_constructor] || {}, _mutatorMap[_constructor].get = function () {
      return constructor;
    }, _ref = 'is' + name, _mutatorMap[_ref] = _mutatorMap[_ref] || {}, _mutatorMap[_ref].get = function () {
      warnDeprecation_1('.is' + name + ' is deprecated. Use ' + name + '.hasInstance(value)\ninstead to check if a value belongs to the ADT variant.');
      return true;
    }, _defineProperty(_extend, 'matchWith', function matchWith(pattern) {
      return pattern[name](this);
    }), _defineEnumerableProperties(_extend, _mutatorMap), _extend));

    function makeInstance() {
      var result = new InternalConstructor(); // eslint-disable-line prefer-const
      extend_1(result, constructor.apply(undefined, arguments) || {});
      return result;
    }

    extend_1(makeInstance, (_extend2 = {}, _defineProperty(_extend2, META, constructor[META]), _tag = 'tag', _mutatorMap2 = {}, _mutatorMap2[_tag] = _mutatorMap2[_tag] || {}, _mutatorMap2[_tag].get = function () {
      return name;
    }, _type = 'type', _mutatorMap2[_type] = _mutatorMap2[_type] || {}, _mutatorMap2[_type].get = function () {
      return typeId;
    }, _constructor2 = 'constructor', _mutatorMap2[_constructor2] = _mutatorMap2[_constructor2] || {}, _mutatorMap2[_constructor2].get = function () {
      return constructor;
    }, _defineProperty(_extend2, 'prototype', InternalConstructor.prototype), _defineProperty(_extend2, 'hasInstance', function hasInstance(value) {
      return Boolean(value) && adt.hasInstance(value) && value[TAG] === name;
    }), _defineEnumerableProperties(_extend2, _mutatorMap2), _extend2));

    return makeInstance;
  });
}

// --[ ADT Implementation ]--------------------------------------------

/*~
 * authors:
 *   - Quildreen Motta
 * 
 * stability: experimental
 * type: |
 *   (String, Object (Array String)) => Union
 */
var union = function union(typeId, patterns) {
  var _extend3;

  var UnionNamespace = Object.create(Union);
  var variants = defineVariants(typeId, patterns, UnionNamespace);

  extend_1(UnionNamespace, variants, (_extend3 = {}, _defineProperty(_extend3, TYPE, typeId), _defineProperty(_extend3, 'variants', values(variants)), _defineProperty(_extend3, 'hasInstance', function hasInstance(value) {
    return Boolean(value) && value[TYPE] === this[TYPE];
  }), _extend3));

  return UnionNamespace;
};

/*~ ~belongsTo : union */
var Union = {
  /*~
   * type: |
   *   Union . (...(Variant, Union) => Any) => Union
   */
  derive: function derive() {
    var _this = this;

    for (var _len = arguments.length, derivations = Array(_len), _key = 0; _key < _len; _key++) {
      derivations[_key] = arguments[_key];
    }

    derivations.forEach(function (derivation) {
      _this.variants.forEach(function (variant) {
        return derivation(variant, _this);
      });
    });
    return this;
  }
};

// --[ Exports ]--------------------------------------------------------
union.Union = Union;
union.typeSymbol = TYPE;
union.tagSymbol = TAG;

var union_1 = union;

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var typeSymbol = union_1.typeSymbol;

var assertType = function (type) {
  return function (method, value) {
    var typeName = type[typeSymbol];
    if (process.env.FOLKTALE_ASSERTIONS !== 'none' && !type.isPrototypeOf(value)) {
      console.warn(typeName + '.' + method + ' expects a value of the same type, but was given ' + value + '.');

      if (process.env.FOLKTALE_ASSERTIONS !== 'minimal') {
        console.warn('\nThis could mean that you\'ve provided the wrong value to the method, in\nwhich case this is a bug in your program, and you should try to track\ndown why the wrong value is getting here.\n\nBut this could also mean that you have more than one ' + typeName + ' library\ninstantiated in your program. This is not **necessarily** a bug, it\ncould happen for several reasons:\n\n 1) You\'re loading the library in Node, and Node\'s cache didn\'t give\n    you back the same instance you had previously requested.\n\n 2) You have more than one Code Realm in your program, and objects\n    created from the same library, in different realms, are interacting.\n\n 3) You have a version conflict of folktale libraries, and objects\n    created from different versions of the library are interacting.\n\nIf your situation fits the cases (1) or (2), you are okay, as long as\nthe objects originate from the same version of the library. Folktale\ndoes not rely on reference checking, only structural checking. However\nyou\'ll want to watch out if you\'re modifying the ' + typeName + '\'s prototype,\nbecause you\'ll have more than one of them, and you\'ll want to make\nsure you do the same change in all of them \u2014 ideally you shouldn\'t\nbe modifying the object, though.\n\nIf your situation fits the case (3), you are *probably* okay if the\nversion difference isn\'t a major one. However, at this point the\nbehaviour of your program using ' + typeName + ' is undefined, and you should\ntry looking into why the version conflict is happening.\n\nParametric modules can help ensuring your program only has a single\ninstance of the folktale library. Check out the Folktale Architecture\ndocumentation for more information.\n      ');
      }
    }
  };
};

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var assertFunction = function (method, transformation) {
  if (typeof transformation !== 'function') {
    throw new TypeError(method + ' expects a function, but was given ' + transformation + '.');
  }
};

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

/*~
 * stability: stable
 * authors:
 *   - Quildreen Motta
 *
 * complexity: O(n), n is the number of own enumerable properties.
 * type: |
 *   (Object 'a, ('a) => 'b) => Object 'b
 */
var mapValues = function mapValues(object, transformation) {
  var keys = Object.keys(object);
  var result = {};

  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];
    result[key] = transformation(object[key]);
  }

  return result;
};

// --[ Convenience ]---------------------------------------------------

/*~
 * stability: stable
 * authors:
 *   - Quildreen Motta
 * 
 * complexity: O(n), n is the number of own enumerable properties.
 * type: |
 *   (Object 'a) . (('a) => 'b) => Object 'b
 */
mapValues.infix = function (transformation) {
  return mapValues(this, transformation);
};

// --[ Exports ]-------------------------------------------------------
var mapValues_1 = mapValues;

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

/*~
 * stability : stable
 * authors:
 *   - Quildreen Motta
 *
 * complexity : O(n), n is the number of own enumerable properties.
 * type: |
 *   (Object 'a) => Array 'a
 */
var values$1 = function values(object) {
  return Object.keys(object).map(function (k) {
    return object[k];
  });
};

// --[ Exports ]-------------------------------------------------------
var values_1 = values$1;

function _defineProperty$1(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

// --[ Dependencies ]---------------------------------------------------
var tagSymbol = union_1.tagSymbol,
    typeSymbol$1 = union_1.typeSymbol;





// --[ Constants ]------------------------------------------------------
var typeJsonKey = '@@type';
var tagJsonKey = '@@tag';
var valueJsonKey = '@@value';

// --[ Helpers ]--------------------------------------------------------

/*~
 * type: ((Object 'a) => 'b) => ([Object 'a]) => Object 'b  
 */
var arrayToObject = function arrayToObject(extractKey) {
  return function (array) {
    return array.reduce(function (object, element) {
      object[extractKey(element)] = element;
      return object;
    }, {});
  };
};

/*~
 * type: (String) => (Object 'a) => 'a | None 
 */
var property$1 = function property(propertyName) {
  return function (object) {
    return object[propertyName];
  };
};

/*~
 * type: ([Object 'a]) => Object 'a 
 */
var indexByType = arrayToObject(property$1(typeSymbol$1));

/*~
 * type: (String, String) => Bool
 */
var assertType$2 = function assertType(given, expected) {
  if (expected !== given) {
    throw new TypeError('\n       The JSON structure was generated from ' + expected + '.\n       You are trying to parse it as ' + given + '. \n    ');
  }
};

/*~
 * type: |
 *   type JSONSerialisation = {
 *     "@@type":  String,
 *     "@@tag":   String,
 *     "@@value": Object Any
 *   }
 *   type JSONParser = {
 *     fromJSON: (JSONSerialisation, Array JSONParser) => Variant
 *   }
 * 
 *   (Object JSONParser) => (JSONSerialisation) => Any
 */
var parseValue = function parseValue(parsers) {
  return function (value) {
    if (value !== null && typeof value[typeJsonKey] === 'string') {
      var type = value[typeJsonKey];
      if (parsers[type]) {
        return parsers[type].fromJSON(value, parsers, true);
      } else {
        return value;
      }
    } else {
      return value;
    }
  };
};

/*~
 * type: ('a) => JSON
 */
var serializeValue = function serializeValue(value) {
  return value === undefined ? null : value !== null && typeof value.toJSON === 'function' ? value.toJSON() : /* otherwise */value;
};

// --[ Implementation ]-------------------------------------------------

/*~
 * stability: experimental
 * authors:
 *   - "@boris-marinov"
 * 
 * type: |
 *   (Variant, ADT) => Void 
 */
var serialization = function serialization(variant, adt) {
  var typeName = adt[typeSymbol$1];
  var tagName = variant.prototype[tagSymbol];

  /*~
   * stability: experimental
   * module: null
   * authors:
   *   - "@boris-marinov"
   * 
   * type: |
   *   type JSONSerialisation = {
   *     "@@type":  String,
   *     "@@tag":   String,
   *     "@@value": Object Any
   *   }
   * 
   *   Variant . () => JSONSerialisation
   */
  variant.prototype.toJSON = function () {
    var _ref;

    return _ref = {}, _defineProperty$1(_ref, typeJsonKey, typeName), _defineProperty$1(_ref, tagJsonKey, tagName), _defineProperty$1(_ref, valueJsonKey, mapValues_1(this, serializeValue)), _ref;
  };

  /*~
   * stability: experimental
   * module: null
   * authors:
   *   - "@boris-marinov"
   * 
   * type: |
   *   type JSONSerialisation = {
   *     "@@type":  String,
   *     "@@tag":   String,
   *     "@@value": Object Any
   *   }
   *   type JSONParser = {
   *     fromJSON: (JSONSerialisation, Array JSONParser) => Variant
   *   }
   * 
   *   (JSONSerialisation, Array JSONParser) => Variant
   */
  adt.fromJSON = function (value) {
    var parsers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _defineProperty$1({}, typeName, adt);
    var keysIndicateType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var valueTypeName = value[typeJsonKey];
    var valueTagName = value[tagJsonKey];
    var valueContents = value[valueJsonKey];
    assertType$2(typeName, valueTypeName);
    var parsersByType = keysIndicateType ? parsers : /*otherwise*/indexByType(values_1(parsers));

    var parsedValue = mapValues_1(valueContents, parseValue(parsersByType));
    return extend_1(Object.create(adt[valueTagName].prototype), parsedValue);
  };
};

// --[ Exports ]--------------------------------------------------------
var serialization_1 = serialization;

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var fantasyLand = {
  equals: 'fantasy-land/equals',
  concat: 'fantasy-land/concat',
  empty: 'fantasy-land/empty',
  map: 'fantasy-land/map',
  ap: 'fantasy-land/ap',
  of: 'fantasy-land/of',
  reduce: 'fantasy-land/reduce',
  traverse: 'fantasy-land/traverse',
  chain: 'fantasy-land/chain',
  chainRec: 'fantasy-land/chainRec',
  extend: 'fantasy-land/extend',
  extract: 'fantasy-land/extract',
  bimap: 'fantasy-land/bimap',
  promap: 'fantasy-land/promap'
};

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

/*~
 * stability: experimental
 * authors:
 *   - Quildreen Motta
 *
 * type: |
 *   (Number, (Any...) => 'a) => Any... => 'a or ((Any...) => 'a)
 */
var curry = function curry(arity, fn) {
  var curried = function curried(oldArgs) {
    return function () {
      for (var _len = arguments.length, newArgs = Array(_len), _key = 0; _key < _len; _key++) {
        newArgs[_key] = arguments[_key];
      }

      var allArgs = oldArgs.concat(newArgs);
      var argCount = allArgs.length;

      return argCount < arity ? curried(allArgs) : /* otherwise */fn.apply(undefined, _toConsumableArray(allArgs));
    };
  };

  return curried([]);
};

// --[ Exports ]-------------------------------------------------------
var curry_1 = curry;

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------



var warnDeprecatedMethod = function (methodName) {
  return function (result) {
    warnDeprecation_1('Type.' + methodName + '() is being deprecated in favour of Type[\'fantasy-land/' + methodName + '\'](). \n    Your data structure is using the old-style fantasy-land methods,\n    and these won\'t be supported in Folktale 3');
    return result;
  };
};

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var unsupportedMethod = function (methodName) {
  return function (object) {
    throw new TypeError(object + " does not have a method '" + methodName + "'.");
  };
};

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var flEquals = fantasyLand.equals;


var warn = warnDeprecatedMethod('equals');
var unsupported = unsupportedMethod('equals');

var isNew = function isNew(a) {
  return typeof a[flEquals] === 'function';
};
var isOld = function isOld(a) {
  return typeof a.equals === 'function';
};

/*~
 * stability: experimental
 * authors:
 *   - "@boris-marinov"
 *   - Quildreen Motta
 * 
 * type: |
 *   forall S, a:
 *     (S a, S a) => Boolean
 *   where S is Setoid
 */
var equals = function equals(setoidLeft, setoidRight) {
  return isNew(setoidLeft) ? setoidLeft[flEquals](setoidRight) : isOld(setoidLeft) ? warn(setoidLeft.equals(setoidRight)) : /*otherwise*/unsupported(setoidLeft);
};

/*~
 * stability: experimental
 * authors:
 *   - "@boris-marinov"
 *   - Quildreen Motta
 * 
 * type: |
 *   forall S, a:
 *     (S a) => (S a) => Boolean
 *   where S is Setoid
 */
equals.curried = curry_1(2, function (setoidRight, setoidLeft) {
  return (// eslint-disable-line no-magic-numbers
    equals(setoidLeft, setoidRight)
  );
});

/*~
 * stability: experimental
 * authors:
 *   - Quildreen Motta
 * 
 * type: |
 *   forall S, a:
 *     (S a).(S a) => Boolean
 *   where S is Setoid
 */
equals.infix = function (aSetoid) {
  return equals(this, aSetoid);
};

var equals_1 = equals;

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------


var aliases = {
  equals: {
    /*~
     * module: null
     * type: |
     *   ('S 'a).('S 'a) => Boolean
     *   where 'S is Setoid
     */
    'fantasy-land/equals': function fantasyLandEquals(that) {
      return this.equals(that);
    }
  },

  concat: {
    /*~
     * module: null
     * type: |
     *   ('S 'a).('S 'a) => 'S 'a
     *   where 'S is Semigroup
     */
    'fantasy-land/concat': function fantasyLandConcat(that) {
      return this.concat(that);
    }
  },

  empty: {
    /*~
     * module: null
     * type: |
     *   ('M).() => 'M a
     *   where 'M is Monoid
     */
    'fantasy-land/empty': function fantasyLandEmpty() {
      return this.empty();
    }
  },

  map: {
    /*~
     * module: null
     * type: |
     *   ('F 'a).(('a) => 'b) => 'F 'b
     *   where 'F is Functor
     */
    'fantasy-land/map': function fantasyLandMap(transformation) {
      return this.map(transformation);
    }
  },

  apply: {
    /*~
     * module: null
     * type: |
     *   ('F ('a) => b).('F 'a) => 'F 'b
     *   where 'F is Apply
     */
    ap: function ap(that) {
      return this.apply(that);
    },


    /*~
     * module: null
     * type: |
     *   ('F 'a).('F ('a) => 'b) => 'F 'b
     *   where 'F is Apply
     */
    'fantasy-land/ap': function fantasyLandAp(that) {
      return that.apply(this);
    }
  },

  of: {
    /*~
     * module: null
     * type: |
     *   forall F, a:
     *     (F).(a) => F a
     *   where F is Applicative 
     */
    'fantasy-land/of': function fantasyLandOf(value) {
      return this.of(value);
    }
  },

  reduce: {
    /*~
     * module: null
     * type: |
     *   forall F, a, b:
     *     (F a).((b, a) => b, b) => b
     *   where F is Foldable  
     */
    'fantasy-land/reduce': function fantasyLandReduce(combinator, initial) {
      return this.reduce(combinator, initial);
    }
  },

  traverse: {
    /*~
     * module: null
     * type: |
     *   forall F, T, a, b:
     *     (T a).((a) => F b, (c) => F c) => F (T b)
     *   where F is Apply, T is Traversable
     */
    'fantasy-land/traverse': function fantasyLandTraverse(transformation, lift) {
      return this.traverse(transformation, lift);
    }
  },

  chain: {
    /*~
     * module: null
     * type: |
     *   forall M, a, b:
     *     (M a).((a) => M b) => M b
     *   where M is Chain
     */
    'fantasy-land/chain': function fantasyLandChain(transformation) {
      return this.chain(transformation);
    }
  },

  chainRecursively: {
    /*~
     * module: null
     * type: |
     *   forall M, a, b, c:
     *     (M).(
     *       Step:    ((a) => c, (b) => c, a) => M c,
     *       Initial: a
     *     ) => M b
     *   where M is ChainRec 
     */
    chainRec: function chainRec(step, initial) {
      return this.chainRecursively(step, initial);
    },


    /*~
     * module: null
     * type: |
     *   forall M, a, b, c:
     *     (M).(
     *       Step:    ((a) => c, (b) => c, a) => M c,
     *       Initial: a
     *     ) => M b
     *   where M is ChainRec 
     */
    'fantasy-land/chainRec': function fantasyLandChainRec(step, initial) {
      return this.chainRecursively(step, initial);
    }
  },

  extend: {
    /*~
     * module: null
     * type: |
     *   forall W, a, b:
     *     (W a).((W a) => b) => W b
     *   where W is Extend
     */
    'fantasy-land/extend': function fantasyLandExtend(transformation) {
      return this.extend(transformation);
    }
  },

  extract: {
    /*~
     * module: null
     * type: |
     *   forall W, a, b:
     *     (W a).() => a
     *   where W is Comonad
     */
    'fantasy-land/extract': function fantasyLandExtract() {
      return this.extract();
    }
  },

  bimap: {
    /*~
     * module: null
     * type: |
     *   forall F, a, b, c, d:
     *     (F a b).((a) => c, (b) => d) => F c d
     *   where F is Bifunctor
     */
    'fantasy-land/bimap': function fantasyLandBimap(f, g) {
      return this.bimap(f, g);
    }
  },

  promap: {
    /*~
     * module: null
     * type: |
     *   forall P, a, b, c, d:
     *     (P a b).((c) => a, (b) => d) => P c d
     */
    'fantasy-land/promap': function fantasyLandPromap(f, g) {
      return this.promap(f, g);
    }
  }
};

var provideAliases = function provideAliases(structure) {
  Object.keys(aliases).forEach(function (method) {
    if (typeof structure[method] === 'function') {
      Object.keys(aliases[method]).forEach(function (alias) {
        structure[alias] = aliases[method][alias];
      });
    }
  });
};

var provideFantasyLandAliases = provideAliases;

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var mm = Symbol.for('@@meta:magical');

var copyDocumentation = function copyDocumentation(source, target) {
  var extensions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (process.env.FOLKTALE_DOCS !== 'false') {
    target[mm] = Object.assign({}, source[mm] || {}, extensions);
  }
};

var copyDocumentation_1 = copyDocumentation;

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

// --[ Dependencies ]---------------------------------------------------






var tagSymbol$1 = union_1.tagSymbol,
    typeSymbol$2 = union_1.typeSymbol;

var toString = Object.prototype.toString;
var prototypeOf = Object.getPrototypeOf;

// --[ Helpers ]--------------------------------------------------------

/*~
 * type: (Any) => Boolean
 */
var isSetoid = function isSetoid(value) {
  return value != null && (typeof value[fantasyLand.equals] === 'function' || typeof value.equals === 'function');
};

/*~
 * type: (Variant, Variant) => Boolean
 */
var sameType = function sameType(a, b) {
  return a[typeSymbol$2] === b[typeSymbol$2] && a[tagSymbol$1] === b[tagSymbol$1];
};

var isPlainObject = function isPlainObject(object) {
  if (Object(object) !== object) return false;

  return !prototypeOf(object) || !object.toString || toString.call(object) === object.toString();
};

var deepEquals = function deepEquals(a, b) {
  if (a === b) return true;

  var leftSetoid = isSetoid(a);
  var rightSetoid = isSetoid(b);
  if (leftSetoid) {
    if (rightSetoid) return equals_1(a, b);else return false;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every(function (x, i) {
      return deepEquals(x, b[i]);
    });
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    var keysA = Object.keys(a);
    var keysB = Object.keys(b);
    var setB = new Set(keysB);
    return keysA.length === keysB.length && prototypeOf(a) === prototypeOf(b) && keysA.every(function (k) {
      return setB.has(k) && a[k] === b[k];
    });
  }

  return false;
};

// --[ Implementation ]------------------------------------------------
/*~
 * stability: experimental
 * authors:
 *   - "@boris-marinov"
 * 
 * type: |
 *   (('a, 'a) => Boolean) => (Variant, Union) => Void
 */
var createDerivation = function createDerivation(valuesEqual) {
  /*~
   * type: ('a, 'a) => Boolean
   */
  var equals = function equals(a, b) {
    // identical objects must be equal
    if (a === b) return true;

    // we require both values to be setoids if one of them is
    var leftSetoid = isSetoid(a);
    var rightSetoid = isSetoid(b);
    if (leftSetoid) {
      if (rightSetoid) return equals_1(a, b);else return false;
    }

    // fall back to the provided equality
    return valuesEqual(a, b);
  };

  /*~
   * type: (Object Any, Object Any, Array String) => Boolean
   */
  var compositesEqual = function compositesEqual(a, b, keys) {
    for (var i = 0; i < keys.length; ++i) {
      var keyA = a[keys[i]];
      var keyB = b[keys[i]];
      if (!equals(keyA, keyB)) {
        return false;
      }
    }
    return true;
  };

  var derivation = function derivation(variant, adt) {
    /*~
     * stability: experimental
     * module: null
     * authors:
     *   - "@boris-marinov"
     *   - Quildreen Motta
     * 
     * type: |
     *   forall S, a:
     *     (S a).(S a) => Boolean
     *   where S is Setoid
     */
    variant.prototype.equals = function (value) {
      assertType(adt)(this[tagSymbol$1] + '#equals', value);
      return sameType(this, value) && compositesEqual(this, value, Object.keys(this));
    };
    provideFantasyLandAliases(variant.prototype);
    return variant;
  };
  copyDocumentation_1(createDerivation, derivation, {
    type: '(Variant, Union) => Void'
  });

  return derivation;
};

// --[ Exports ]-------------------------------------------------------

/*~~inheritsMeta: createDerivation */
var equality = createDerivation(deepEquals);

var withCustomComparison = createDerivation;
equality.withCustomComparison = withCustomComparison;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

// --[ Dependencies ]---------------------------------------------------
var tagSymbol$2 = union_1.tagSymbol,
    typeSymbol$3 = union_1.typeSymbol;

// --[ Helpers ]--------------------------------------------------------
/*~
 * type: (Object Any) => String
 */


var objectToKeyValuePairs = function objectToKeyValuePairs(object) {
  return Object.keys(object).map(function (key) {
    return key + ': ' + showValue(object[key]);
  }).join(', ');
};

/*~
 * type: (Object Any).() => String
 */
var plainObjectToString = function plainObjectToString() {
  return '{ ' + objectToKeyValuePairs(this) + ' }';
};

/*~
 * type: (Array Any).() => String
 */
var arrayToString = function arrayToString() {
  return '[' + this.map(showValue).join(', ') + ']';
};

/*~
 * type: (Function) => String
 */
var functionNameToString = function functionNameToString(fn) {
  return fn.name !== '' ? ': ' + fn.name : '';
};

/*~
 * type: (Function) => String
 */
var functionToString = function functionToString(fn) {
  return '[Function' + functionNameToString(fn) + ']';
};

/*~
 * type: () => String
 */
var nullToString = function nullToString() {
  return 'null';
};

/*~
 * type: (Any) => Bool
 */
var isPlainObject$1 = function isPlainObject(object) {
  return !object.toString || object.toString === Object.prototype.toString;
};

/*~
 * type: (Null | Object Any) => String
 */
var objectToString = function objectToString(object) {
  return object === null ? nullToString : Array.isArray(object) ? arrayToString : isPlainObject$1(object) ? plainObjectToString : /* otherwise */object.toString;
};

/*~
 * type: (Any) => String
 */
var showValue = function showValue(value) {
  return typeof value === 'undefined' ? 'undefined' : typeof value === 'function' ? functionToString(value) : (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'symbol' ? value.toString() : (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' ? objectToString(value).call(value) : /* otherwise */JSON.stringify(value);
};

// --[ Implementation ]------------------------------------------------

/*~
 * stability: experimental
 * authors:
 *   - "@boris-marinov"
 * 
 * type: |
 *   (Variant, Union) => Void
 */
var debugRepresentation = function debugRepresentation(variant, adt) {
  // eslint-disable-line max-statements
  var typeName = adt[typeSymbol$3];
  var variantName = adt[typeSymbol$3] + '.' + variant.prototype[tagSymbol$2];

  // (for Object.prototype.toString)
  adt[Symbol.toStringTag] = typeName;
  variant.prototype[Symbol.toStringTag] = variantName;

  // (regular JavaScript representations)
  /*~
   * stability: experimental
   * module: null
   * authors:
   *   - "@boris-marinov"
   * 
   * type: |
   *   () => String
   */
  adt.toString = function () {
    return typeName;
  };

  /*~
   * stability: experimental
   * mmodule: null
   * authors:
   *   - "@boris-marinov"
   * 
   * type: |
   *   () => String
   */
  variant.toString = function () {
    return variantName;
  };

  /*~
   * stability: experimental
   * module: null
   * authors:
   *   - "@boris-marinov"
   * 
   * type: |
   *   (Union).() => String
   */
  variant.prototype.toString = function () {
    return variantName + '(' + plainObjectToString.call(this) + ')';
  };

  // (Node REPL representations)
  adt.inspect = adt.toString;
  variant.inspect = variant.toString;
  variant.prototype.inspect = variant.prototype.toString;

  return variant;
};

// --[ Exports ]-------------------------------------------------------
var debugRepresentation_1 = debugRepresentation;

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

/*~
 * stability: experimental
 * name: module folktale/adt/union/derivations
 */
var derivations = {
  serialization: serialization_1,
  equality: equality,
  debugRepresentation: debugRepresentation_1
};

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

/*~
 * stability: experimental
 * name: module folktale/adt/union
 */
var union$1 = {
  union: union_1,
  derivations: derivations
};

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------



var defineAdtMethod = function defineAdtMethod(adt, definitions) {
  Object.keys(definitions).forEach(function (name) {
    var methods = definitions[name];
    adt.variants.forEach(function (variant) {
      var method = methods[variant.tag];
      if (!method) {
        throw new TypeError('Method ' + name + ' not defined for ' + variant.tag);
      }
      copyDocumentation_1(methods, method);
      variant.prototype[name] = method;
    });
  });
};

var defineAdtMethods = defineAdtMethod;

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var Error$1 = result.Error,
    Ok = result.Ok;

/*~
 * stability: stable
 * authors:
 *   - "@boris-marinov"
 * 
 * type: |
 *   forall a, b:
 *      (Validation a b) => Result a b
 */


var validationToResult = function validationToResult(aValidation) {
  return aValidation.matchWith({
    Failure: function Failure(_ref) {
      var value = _ref.value;
      return Error$1(value);
    },
    Success: function Success(_ref2) {
      var value = _ref2.value;
      return Ok(value);
    }
  });
};

var validationToResult_1 = validationToResult;

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var Error$2 = result.Error,
    Ok$1 = result.Ok;

/*~
 * stability: stable
 * authors:
 *   - "@boris-marinov"
 * 
 * type: |
 *   forall a, b:
 *     (Maybe a, b) => Result b a
 */


var maybeToResult = function maybeToResult(aMaybe, failureValue) {
  return aMaybe.matchWith({
    Nothing: function Nothing() {
      return Error$2(failureValue);
    },
    Just: function Just(_ref) {
      var value = _ref.value;
      return Ok$1(value);
    }
  });
};

var maybeToResult_1 = maybeToResult;

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var Success = validation.Success,
    Failure = validation.Failure;

/*~
 * stability: stable
 * authors:
 *   - "@boris-marinov"
 * 
 * type: |
 *   forall a, b:
 *     (Maybe a, b) => Validation b a
 */


var maybeToValidation = function maybeToValidation(aMaybe, failureValue) {
  return aMaybe.matchWith({
    Nothing: function Nothing() {
      return Failure(failureValue);
    },
    Just: function Just(_ref) {
      var value = _ref.value;
      return Success(value);
    }
  });
};

var maybeToValidation_1 = maybeToValidation;

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------




var union$3 = union$1.union,
    derivations$2 = union$1.derivations;






var equality$2 = derivations$2.equality,
    debugRepresentation$1 = derivations$2.debugRepresentation,
    serialization$1 = derivations$2.serialization;

/*~ stability: stable */

var Maybe = union$3('folktale:Maybe', {
  /*~
   * type: |
   *   forall a: () => Maybe a
   */
  Nothing: function Nothing() {},


  /*~
   * type: |
   *   forall a: (a) => Maybe a
   */
  Just: function Just(value) {
    return { value: value };
  }
}).derive(equality$2, debugRepresentation$1, serialization$1);

var Nothing = Maybe.Nothing,
    _Just = Maybe.Just;

var assertMaybe = assertType(Maybe);

extend_1(_Just.prototype, {
  /*~
   * isRequired: true
   * type: |
   *   forall a: get (Maybe a) => a
   */
  get value() {
    throw new TypeError('`value` can’t be accessed in an abstract instance of Maybe.Just');
  }
});

/*~~belongsTo: Maybe */
defineAdtMethods(Maybe, {
  /*~
   * stability: stable
   * type: |
   *   forall a, b: (Maybe a).((a) => b) => Maybe b
   */
  map: {
    /*~*/
    Nothing: function map(transformation) {
      assertFunction('Maybe.Nothing#map', transformation);
      return this;
    },

    /*~*/
    Just: function map(transformation) {
      assertFunction('Maybe.Just#map', transformation);
      return _Just(transformation(this.value));
    }
  },

  /*~
   * stability: stable
   * type: |
   *   forall a, b: (Maybe (a) => b).(Maybe a) => Maybe b
   */
  apply: {
    /*~*/
    Nothing: function apply(aMaybe) {
      assertMaybe('Maybe.Nothing#apply', aMaybe);
      return this;
    },

    /*~*/
    Just: function apply(aMaybe) {
      assertMaybe('Maybe.Just#apply', aMaybe);
      return aMaybe.map(this.value);
    }
  },

  /*~
   * stability: stable
   * type: |
   *   forall a, b: (Maybe a).((a) => Maybe b) => Maybe b
   */
  chain: {
    /*~*/
    Nothing: function chain(transformation) {
      assertFunction('Maybe.Nothing#chain', transformation);
      return this;
    },

    /*~*/
    Just: function chain(transformation) {
      assertFunction('Maybe.Just#chain', transformation);
      return transformation(this.value);
    }
  },

  /*~
   * type: |
   *   forall a: (Maybe a).() => a :: (throws TypeError)
   */
  unsafeGet: {
    /*~*/
    Nothing: function unsafeGet() {
      throw new TypeError('Can\'t extract the value of a Nothing.\n\n    Since Nothing holds no values, it\'s not possible to extract one from them.\n    You might consider switching from Maybe#get to Maybe#getOrElse, or some other method\n    that is not partial.\n      ');
    },

    /*~*/
    Just: function unsafeGet() {
      return this.value;
    }
  },

  /*~
   * type: |
   *   forall a: (Maybe a).(a) => a
   */
  getOrElse: {
    /*~*/
    Nothing: function getOrElse(_default) {
      return _default;
    },

    /*~*/
    Just: function getOrElse(_default) {
      return this.value;
    }
  },

  /*~
   * type: |
   *   forall a: (Maybe a).((a) => Maybe a) => Maybe a
   */
  orElse: {
    /*~*/
    Nothing: function orElse(handler) {
      assertFunction('Maybe.Nothing#orElse', handler);
      return handler(this.value);
    },

    /*~*/
    Just: function orElse(handler) {
      assertFunction('Maybe.Nothing#orElse', handler);
      return this;
    }
  },

  /*~
   * authors:
   *   - "@diasbruno"
   * type: |
   *   forall a: (Maybe a).(Maybe a) => Maybe a
   *   where a is Semigroup
   */
  concat: {
    /*~*/
    Nothing: function concat(aMaybe) {
      assertMaybe('Maybe.Nothing#concat', aMaybe);
      return aMaybe;
    },

    /*~*/
    Just: function concat(aMaybe) {
      var _this = this;

      assertMaybe('Maybe.Just#concat', aMaybe);
      return aMaybe.matchWith({
        Nothing: function Nothing() {
          return _Just(_this.value);
        },
        Just: function Just(a) {
          return _Just(_this.value.concat(a.value));
        }
      });
    }
  },

  /*~
   * deprecated:
   *   since: 2.0.0
   *   replacedBy: .matchWith(pattern)
   * 
   * type: |
   *   forall a, b:
   *     (Maybe a).({
   *       Nothing: () => b,
   *       Just: (a) => b
   *     }) => b
   */
  cata: {
    /*~*/
    Nothing: function cata(pattern) {
      warnDeprecation_1('`.cata(pattern)` is deprecated. Use `.matchWith(pattern)` instead.');
      return pattern.Nothing();
    },

    /*~*/
    Just: function cata(pattern) {
      warnDeprecation_1('`.cata(pattern)` is deprecated. Use `.matchWith(pattern)` instead.');
      return pattern.Just(this.value);
    }
  },

  /*~
   * type: |
   *   forall a, b: (Maybe a).(() => b, (a) => b) => b
   */
  fold: {
    /*~*/
    Nothing: function Nothing(transformNothing, transformJust) {
      assertFunction('Maybe.Nothing#fold', transformNothing);
      assertFunction('Maybe.Nothing#fold', transformJust);
      return transformNothing();
    },

    /*~*/
    Just: function Just(transformNothing, transformJust) {
      assertFunction('Maybe.Just#fold', transformNothing);
      assertFunction('Maybe.Just#fold', transformJust);
      return transformJust(this.value);
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   forall a: (Maybe a).((a) => Boolean) => Maybe a
   */
  filter: {
    /*~*/
    Nothing: function filter(predicate) {
      assertFunction('Maybe.Nothing#filter', predicate);
      return this;
    },

    /*~*/
    Just: function filter(predicate) {
      assertFunction('Maybe.Just#filter', predicate);
      return predicate(this.value) ? this : Nothing();
    }
  }
});

Object.assign(Maybe, {
  /*~
   * stability: stable
   * type: |
   *   forall a: (a) => Maybe a
   */
  of: function of(value) {
    return _Just(value);
  },


  /*~
   * authors:
   *   - "@diasbruno"
   * type: |
   *   forall a: () => Maybe a
   */
  empty: function empty() {
    return Nothing();
  },


  /*~
   * deprecated:
   *   since: 2.0.0
   *   replacedBy: .unsafeGet()
   * type: |
   *   forall a: (Maybe a).() => a :: (throws TypeError)
   */
  'get': function get() {
    warnDeprecation_1('`.get()` is deprecated, and has been renamed to `.unsafeGet()`.');
    return this.unsafeGet();
  },


  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (Maybe a).(b) => Result b a
   */
  toResult: function toResult(fallbackValue) {
    return maybeToResult_1(this, fallbackValue);
  },


  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (Maybe a).(b) => Result b a
   */
  toValidation: function toValidation(fallbackValue) {
    return maybeToValidation_1(this, fallbackValue);
  }
});

provideFantasyLandAliases(_Just.prototype);
provideFantasyLandAliases(Nothing.prototype);
provideFantasyLandAliases(Maybe);

var maybe = Maybe;

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var Just = maybe.Just,
    Nothing$1 = maybe.Nothing;

/*~
 * stability: stable
 * authors: 
 *   - "@boris-marinov"
 * 
 * type: |
 *   forall a, b:
 *     (Validation a b) => Maybe b
 */


var validationToMaybe = function validationToMaybe(aValidation) {
  return aValidation.matchWith({
    Failure: function Failure() {
      return Nothing$1();
    },
    Success: function Success(_ref) {
      var value = _ref.value;
      return Just(value);
    }
  });
};

var validationToMaybe_1 = validationToMaybe;

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------




var union$4 = union$1.union,
    derivations$3 = union$1.derivations;






var equality$3 = derivations$3.equality,
    debugRepresentation$2 = derivations$3.debugRepresentation,
    serialization$2 = derivations$3.serialization;

/*~ stability: experimental */

var Validation = union$4('folktale:Validation', {
  /*~
   * type: |
   *   forall a, b: (a) => Validation a b
   */
  Failure: function Failure(value) {
    return { value: value };
  },


  /*~
   * type: |
   *   forall a, b: (b) => Validation a b
   */
  Success: function Success(value) {
    return { value: value };
  }
}).derive(equality$3, debugRepresentation$2, serialization$2);

var Success$1 = Validation.Success,
    Failure$1 = Validation.Failure;

var assertValidation = assertType(Validation);

extend_1(Failure$1.prototype, {
  /*~
   * isRequired: true
   * type: |
   *   forall a, b: get (Validation a b) => a
   */
  get value() {
    throw new TypeError('`value` can’t be accessed in an abstract instance of Validation.Failure');
  }
});

extend_1(Success$1.prototype, {
  /*~
   * isRequired: true
   * type: |
   *   forall a, b: get (Validation a b) => b
   */
  get value() {
    throw new TypeError('`value` can’t be accessed in an abstract instance of Validation.Success');
  }
});

/*~~belongsTo: Validation */
defineAdtMethods(Validation, {
  /*~
   * type: |
   *   forall a, b, c: (Validation a b).((b) => c) => Validation a c
   */
  map: {
    /*~*/
    Failure: function map(transformation) {
      assertFunction('Validation.Failure#map', transformation);
      return this;
    },

    /*~*/
    Success: function map(transformation) {
      assertFunction('Validation.Success#map', transformation);
      return Success$1(transformation(this.value));
    }
  },

  /*~
   * type: |
   *   forall a, b, c: (Validation (b) => c).(Validation a b) => Validation a c
   */
  apply: {
    /*~*/
    Failure: function apply(aValidation) {
      assertValidation('Failure#apply', aValidation);
      return Failure$1.hasInstance(aValidation) ? Failure$1(this.value.concat(aValidation.value)) : /* otherwise */this;
    },

    /*~*/
    Success: function apply(aValidation) {
      assertValidation('Success#apply', aValidation);
      return Failure$1.hasInstance(aValidation) ? aValidation : /* otherwise */aValidation.map(this.value);
    }
  },

  /*~
   * type: |
   *   forall a, b: (Validation a b).() => b :: throws TypeError
   */
  unsafeGet: {
    /*~*/
    Failure: function unsafeGet() {
      throw new TypeError('Can\'t extract the value of a Failure.\n\n    Failure does not contain a normal value - it contains an error.\n    You might consider switching from Validation#get to Validation#getOrElse, or some other method\n    that is not partial.\n      ');
    },

    /*~*/
    Success: function unsafeGet() {
      return this.value;
    }
  },

  /*~
   * type: |
   *   forall a, b: (Validation a b).(b) => b
   */
  getOrElse: {
    /*~*/
    Failure: function getOrElse(_default) {
      return _default;
    },

    /*~*/
    Success: function getOrElse(_default) {
      return this.value;
    }
  },

  /*~
   * type: |
   *   forall a, b, c:
   *     (Validation a b).((a) => Validation c b) => Validation c b
   */
  orElse: {
    /*~*/
    Failure: function orElse(handler) {
      assertFunction('Validation.Failure#orElse', handler);
      return handler(this.value);
    },

    /*~*/
    Success: function orElse(handler) {
      assertFunction('Validation.Success#orElse', handler);
      return this;
    }
  },

  /*~
   * type: |
   *   forall a, b:
   *     (Validation a b).(Validation a b) => Validation a b
   *   where a is Semigroup
   */
  concat: {
    /*~*/
    Failure: function concat(aValidation) {
      assertValidation('Validation.Failure#concat', aValidation);
      if (Failure$1.hasInstance(aValidation)) {
        return Failure$1(this.value.concat(aValidation.value));
      } else {
        return this;
      }
    },

    /*~*/
    Success: function concat(aValidation) {
      assertValidation('Validation.Success#concat', aValidation);
      return aValidation;
    }
  },

  /*~
   * type: |
   *   forall a, b, c:
   *     (Validation a b).((a) => c, (b) => c) => c
   */
  fold: {
    /*~*/
    Failure: function fold(failureTransformation, successTransformation) {
      assertFunction('Validation.Failure#fold', failureTransformation);
      assertFunction('Validation.Failure#fold', successTransformation);
      return failureTransformation(this.value);
    },

    /*~*/
    Success: function fold(failureTransformation, successTransformation) {
      assertFunction('Validation.Success#fold', failureTransformation);
      assertFunction('Validation.Success#fold', successTransformation);
      return successTransformation(this.value);
    }
  },

  /*~
   * type: |
   *   forall a, b: (Validation a b).() => Validation b a
   */
  swap: {
    /*~*/
    Failure: function swap() {
      return Success$1(this.value);
    },

    /*~*/
    Success: function swap() {
      return Failure$1(this.value);
    }
  },

  /*~
   * type: |
   *   forall a, b, c, d:
   *     (Validation a b).((a) => c, (b) => d) => Validation c d
   */
  bimap: {
    /*~*/
    Failure: function bimap(failureTransformation, successTransformation) {
      assertFunction('Validation.Failure#fold', failureTransformation);
      assertFunction('Validation.Failure#fold', successTransformation);
      return Failure$1(failureTransformation(this.value));
    },

    /*~*/
    Success: function bimap(failureTransformation, successTransformation) {
      assertFunction('Validation.Success#fold', failureTransformation);
      assertFunction('Validation.Success#fold', successTransformation);
      return Success$1(successTransformation(this.value));
    }
  },

  /*~
   * type: |
   *   forall a, b, c:
   *     (Validation a b).((a) => c) Validation c b
   */
  mapFailure: {
    /*~*/
    Failure: function mapFailure(transformation) {
      assertFunction('Validation.Failure#mapFailure', transformation);
      return Failure$1(transformation(this.value));
    },

    /*~*/
    Success: function mapFailure(transformation) {
      assertFunction('Validation.Failure#mapFailure', transformation);
      return this;
    }
  }
});

Object.assign(Validation, {
  /*~
   * type: |
   *   forall a, b: (b) => Validation a b
   */
  of: function of(value) {
    return Success$1(value);
  },


  /*~
   * type: |
   *   forall a, b: (Validation a b).() => b :: throws TypeError
   */
  'get': function get() {
    warnDeprecation_1('`.get()` is deprecated, and has been renamed to `.unsafeGet()`.');
    return this.unsafeGet();
  },


  /*~
   * type: |
   *   forall a, b: (Validation a b).() => a or b
   */
  merge: function merge() {
    return this.value;
  },


  /*~
   * type: |
   *   forall a, b: (Validation a b).() => Result a b
   */
  toResult: function toResult() {
    return validationToResult_1(this);
  },


  /*~
   * type: |
   *   forall a, b: (Validation a b).() => Maybe b
   */
  toMaybe: function toMaybe() {
    return validationToMaybe_1(this);
  }
});

provideFantasyLandAliases(Success$1.prototype);
provideFantasyLandAliases(Failure$1.prototype);
provideFantasyLandAliases(Validation);

var validation = Validation;

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var Success$2 = validation.Success,
    Failure$2 = validation.Failure;

/*~
 * stability: stable
 * authors:
 *   - "@boris-marinov"
 * 
 * type: |
 *   forall a, b:
 *     (Result a b) => Validation a b
 */


var resultToValidation = function resultToValidation(aResult) {
  return aResult.matchWith({
    Error: function Error(_ref) {
      var value = _ref.value;
      return Failure$2(value);
    },
    Ok: function Ok(_ref2) {
      var value = _ref2.value;
      return Success$2(value);
    }
  });
};

var resultToValidation_1 = resultToValidation;

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var Just$1 = maybe.Just,
    Nothing$2 = maybe.Nothing;

/*~
 * stability: stable
 * authors:
 *   - "@boris-marinov"
 *
 * type: |
 *   forall a, b:
 *     (Result a b) => Maybe b
 */


var resultToMaybe = function resultToMaybe(aResult) {
  return aResult.matchWith({
    Error: function Error(_ref) {
      var _ = _ref.value;
      return Nothing$2();
    },
    Ok: function Ok(_ref2) {
      var value = _ref2.value;
      return Just$1(value);
    }
  });
};

var resultToMaybe_1 = resultToMaybe;

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------




var union$5 = union$1.union,
    derivations$4 = union$1.derivations;






var equality$4 = derivations$4.equality,
    debugRepresentation$3 = derivations$4.debugRepresentation,
    serialization$3 = derivations$4.serialization;

/*~ stability: experimental */

var Result = union$5('folktale:Result', {
  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (a) => Result a b
   */
  Error: function Error(value) {
    return { value: value };
  },


  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (b) => Result a b
   */
  Ok: function Ok(value) {
    return { value: value };
  }
}).derive(equality$4, debugRepresentation$3, serialization$3);

var Error$3 = Result.Error,
    Ok$2 = Result.Ok;


var assertResult = assertType(Result);

extend_1(Error$3.prototype, {
  /*~
   * isRequired: true
   * type: |
   *   forall a, b: get (Result a b) => a
   */
  get value() {
    throw new TypeError('`value` can’t be accessed in an abstract instance of Result.Error');
  }
});

extend_1(Ok$2.prototype, {
  /*~
   * isRequired: true
   * type: |
   *   forall a, b: get (Result a b) => b
   */
  get value() {
    throw new TypeError('`value` can’t be accessed in an abstract instance of Result.Ok');
  }
});

/*~
 * ~belongsTo: Result
 */
defineAdtMethods(Result, {
  /*~
   * stability: experimental
   * type: |
   *   forall a, b, c:
   *     (Result a b).((b) => c) => Result a c
   */
  map: {
    /*~*/
    Error: function map(f) {
      assertFunction('Result.Error#map', f);
      return this;
    },

    /*~*/
    Ok: function map(f) {
      assertFunction('Result.Ok#map', f);
      return Ok$2(f(this.value));
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   forall a, b, c:
   *     (Result a ((b) => c)).(Result a b) => Result a c
   */
  apply: {
    /*~*/
    Error: function apply(anResult) {
      assertResult('Result.Error#apply', anResult);
      return this;
    },

    /*~*/
    Ok: function apply(anResult) {
      assertResult('Result.Ok#apply', anResult);
      return anResult.map(this.value);
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   forall a, b, c:
   *     (Result a b).((b) => Result a c) => Result a c
   */
  chain: {
    /*~*/
    Error: function chain(f) {
      assertFunction('Result.Error#chain', f);
      return this;
    },

    /*~*/
    Ok: function chain(f) {
      assertFunction('Result.Ok#chain', f);
      return f(this.value);
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (Result a b).() => b :: throws TypeError
   */
  unsafeGet: {
    /*~*/
    Error: function unsafeGet() {
      throw new TypeError('Can\'t extract the value of an Error.\n\nError does not contain a normal value - it contains an error.\nYou might consider switching from Result#unsafeGet to Result#getOrElse,\nor some other method that is not partial.\n      ');
    },

    /*~*/
    Ok: function unsafeGet() {
      return this.value;
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (Result a b).(b) => b
   */
  getOrElse: {
    /*~*/
    Error: function getOrElse(_default) {
      return _default;
    },

    /*~*/
    Ok: function getOrElse(_default) {
      return this.value;
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   forall a, b, c:
   *     (Result a b).((a) => Result c b) => Result c b
   */
  orElse: {
    /*~*/
    Error: function orElse(handler) {
      assertFunction('Result.Error#orElse', handler);
      return handler(this.value);
    },

    /*~*/
    Ok: function orElse(handler) {
      assertFunction('Result.Ok#orElse', handler);
      return this;
    }
  },

  /*~
   * stability: stable
   * type: |
   *   forall a, b: (Result a b).(Result a b) => Result a b
   *   where b is Semigroup
   */
  concat: {
    /*~*/
    Error: function concat(aResult) {
      assertResult('Result.Error#concat', aResult);
      return this;
    },

    /*~*/
    Ok: function concat(aResult) {
      var _this = this;

      assertResult('Result.Ok#concat', aResult);
      return aResult.map(function (xs) {
        return _this.value.concat(xs);
      });
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   forall a, b, c:
   *     (Result a b).((a) => c, (b) => c) => c
   */
  fold: {
    /*~*/
    Error: function fold(f, g) {
      assertFunction('Result.Error#fold', f);
      assertFunction('Result.Error#fold', g);
      return f(this.value);
    },

    /*~*/
    Ok: function fold(f, g) {
      assertFunction('Result.Ok#fold', f);
      assertFunction('Result.Ok#fold', g);
      return g(this.value);
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (Result a b).() => Result b a
   */
  swap: {
    /*~*/
    Error: function swap() {
      return Ok$2(this.value);
    },

    /*~*/
    Ok: function swap() {
      return Error$3(this.value);
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   (Result a b).((a) => c, (b) => d) => Result c d
   */
  bimap: {
    /*~*/
    Error: function bimap(f, g) {
      assertFunction('Result.Error#bimap', f);
      assertFunction('Result.Error#bimap', g);
      return Error$3(f(this.value));
    },

    /*~*/
    Ok: function bimap(f, g) {
      assertFunction('Result.Ok#bimap', f);
      assertFunction('Result.Ok#bimap', g);
      return Ok$2(g(this.value));
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   forall a, b, c:
   *     (Result a b).((a) => c) => Result c b
   */
  mapError: {
    /*~*/
    Error: function mapError(f) {
      assertFunction('Result.Error#mapError', f);
      return Error$3(f(this.value));
    },

    /*~*/
    Ok: function mapError(f) {
      assertFunction('Result.Ok#mapError', f);
      return this;
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   forall a: (Maybe a).((a) => Boolean) => Maybe a
   */
  filter: {
    /*~*/
    Error: function filter(predicate) {
      assertFunction('Result.Error#filter', predicate);
      return this;
    },

    /*~*/
    Ok: function filter(predicate) {
      assertFunction('Result.Ok#filter', predicate);
      return predicate(this.value) ? this : Error$3();
    }
  }
});

Object.assign(Result, {
  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (b) => Result a b
   */
  of: function of(value) {
    return Ok$2(value);
  },


  /*~
   * deprecated:
   *   since: 2.0.0
   *   replacedBy: .unsafeGet()
   * type: |
   *   forall a, b: (Result a b).() => b :: (throws TypeError)
   */
  'get': function get() {
    warnDeprecation_1('`.get()` is deprecated, and has been renamed to `.unsafeGet()`.');
    return this.unsafeGet();
  },


  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (Result a b).() => a or b
   */
  merge: function merge() {
    return this.value;
  },


  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (Result a b).() => Validation a b
   */
  toValidation: function toValidation() {
    return resultToValidation_1(this);
  },


  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (Result a b).() => Maybe b
   */
  toMaybe: function toMaybe() {
    return resultToMaybe_1(this);
  }
});

provideFantasyLandAliases(Error$3.prototype);
provideFantasyLandAliases(Ok$2.prototype);
provideFantasyLandAliases(Result);

var result = Result;

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var Error$4 = result.Error,
    Ok$3 = result.Ok;

/*~
 * stability: experimental
 * authors:
 *   - "@boris-marinov"
 * 
 * type: |
 *   forall a, b: (() => b :: throws a) => Result a b
 */


var _try = function _try(f) {
  try {
    return Ok$3(f());
  } catch (e) {
    return Error$4(e);
  }
};

var _try_1 = _try;

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var Error$5 = result.Error,
    Ok$4 = result.Ok;



/*~
 * stability: stable
 * authors:
 *   - "@boris-marinov"
 * 
 * type: |
 *   forall a, b:
 *     (a or None, b) => Result b a
 *   & (a or None) => Result None a
 */
var nullableToResult = function nullableToResult(a, givenFallback) {
  var oldBehaviour = arguments.length < 2; // eslint-disable-line prefer-rest-params
  if (oldBehaviour) {
    warnDeprecation_1('nullableToResult(value) is being deprecated in favour of providing an explicit fallback value.\nnullableToResult(value, fallback) is the new preferred form of this function.\n');
  }

  var fallback = oldBehaviour ? a : givenFallback;
  return a != null ? Ok$4(a) : /* else */Error$5(fallback);
};

var nullableToResult_1 = nullableToResult;

var _module$exports;

function _defineProperty$2(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------



var typeSymbol$4 = union_1.typeSymbol;

/*~
 * stability: stable
 * name: module folktale/result
 */


var result$2 = (_module$exports = {
  Error: result.Error,
  Ok: result.Ok,
  hasInstance: result.hasInstance,
  of: result.of,
  fromJSON: result.fromJSON
}, _defineProperty$2(_module$exports, typeSymbol$4, result[typeSymbol$4]), _defineProperty$2(_module$exports, 'try', _try_1), _defineProperty$2(_module$exports, 'fromNullable', function fromNullable(aNullable, fallbackValue) {
  var nullableToResult = nullableToResult_1;

  if (arguments.length > 1) {
    // eslint-disable-line prefer-rest-params 
    return nullableToResult(aNullable, fallbackValue);
  } else {
    return nullableToResult(aNullable);
  }
}), _defineProperty$2(_module$exports, 'fromValidation', function fromValidation(aValidation) {
  return validationToResult_1(aValidation);
}), _defineProperty$2(_module$exports, 'fromMaybe', function fromMaybe(aMaybe, failureValue) {
  return maybeToResult_1(aMaybe, failureValue);
}), _module$exports);

var maybeNull = function maybeNull(x) {
  return x ? 'success' : null;
};

var testFunction = function testFunction(val) {
  return result$2.fromNullable(maybeNull(val));
};

return testFunction;

})));

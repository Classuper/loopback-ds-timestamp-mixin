"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _debug2 = _interopRequireDefault(require("./debug"));

var debug = (0, _debug2.default)();
var warn = (0, _debug2.default)(); // create a namespaced warning

warn.log = console.warn.bind(console); // eslint-disable-line no-console

var _default = function _default(Model) {
  var bootOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  debug('TimeStamp mixin for Model %s', Model.modelName);
  var options = (0, _extends2.default)({
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    required: true,
    validateUpsert: false,
    // default to turning validation off
    silenceWarnings: false,
    index: false
  }, bootOptions);
  debug('options', options);

  if (typeof options.createdAt === 'string') {
    options.createdAt = {
      name: options.createdAt,
      required: options.required
    };
  }

  if (typeof options.updatedAt === 'string') {
    options.updatedAt = {
      name: options.updatedAt,
      required: options.required
    };
  } // enable our warnings via the options


  warn.enabled = !options.silenceWarnings;

  if (!options.validateUpsert && Model.settings.validateUpsert) {
    Model.settings.validateUpsert = false;
    warn("".concat(Model.pluralModelName, " settings.validateUpsert was overriden to false"));
  }

  if (Model.settings.validateUpsert && (options.createdAt.required || options.updatedAt.required)) {
    warn("Upserts for ".concat(Model.pluralModelName, " will fail when\n          validation is turned on and time stamps are required"));
  }

  Model.defineProperty(options.createdAt.name, (0, _objectSpread2.default)({
    type: Date,
    defaultFn: 'now',
    index: options.index
  }, options.createdAt));
  Model.defineProperty(options.updatedAt.name, (0, _objectSpread2.default)({
    type: Date,
    index: options.index
  }, options.updatedAt));
  Model.observe('before save', function (ctx, next) {
    debug('ctx.options', ctx.options);

    if (ctx.options && ctx.options.skipUpdatedAt) {
      return next();
    }

    if (ctx.instance) {
      debug('%s.%s before save: %s', ctx.Model.modelName, options.updatedAt.name, ctx.instance.id);
      ctx.instance[options.updatedAt.name] = new Date();
    } else {
      debug('%s.%s before update matching %j', ctx.Model.pluralModelName, options.updatedAt.name, ctx.where);
      ctx.data[options.updatedAt.name] = new Date();
    }

    return next();
  });
};

exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=time-stamp.js.map

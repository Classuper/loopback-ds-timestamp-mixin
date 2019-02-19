"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _debug = _interopRequireDefault(require("debug"));

var _default = function _default() {
  var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'time-stamp';
  return (0, _debug.default)("loopback:mixins:".concat(name));
};

exports.default = _default;
//# sourceMappingURL=debug.js.map

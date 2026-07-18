// CJS implementation of @babel/runtime/helpers/interopRequireDefault.
// The pnpm "import" condition in conditionNames resolves the real package to its
// ESM version (export { fn as default }), which webpack wraps as { default: fn }.
// CJS callers like next-auth then get an object, not a function, and crash.
// This stub always exports the function directly so require() returns a callable.
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { "default": obj };
}
module.exports = _interopRequireDefault;
module.exports.__esModule = true;
module.exports["default"] = module.exports;

function DebugHelper(helper) {
  this._helper = helper;
}

DebugHelper.prototype.log = function(_variable_args_) {
  var args = Array.prototype.splice.call(arguments, 0);
  args.unshift('testDebugLogged', this._helper._wrapper);
  this._helper._emitter.emit.apply(this._helper._emitter, args);
};

exports = module.exports = DebugHelper;

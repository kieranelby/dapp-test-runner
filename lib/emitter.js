function Emitter() {
  this._reporters = [];
}

Emitter.prototype.addReporter = function(reporter) {
  this._reporters.push(reporter);
};

Emitter.prototype.emit = function(eventName, _variable_args_) {
  var self = this;
  var params = Array.prototype.slice.call(arguments, 1);
  this._reporters.forEach(function (reporter) {
    if (reporter[eventName] !== undefined) {
      reporter[eventName].apply(reporter, params);
    }
  });
};

exports = module.exports = Emitter;

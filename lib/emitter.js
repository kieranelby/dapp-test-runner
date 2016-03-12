function Emitter() {
  this._reporters = [];
}

// See console-reporter.js for the functions a reporter can have.
Emitter.prototype.addReporter = function(reporter) {
  this._reporters.push(reporter);
};

Emitter.prototype.emit = function(eventName, _variable_args_) {
  var params = Array.prototype.slice.call(arguments, 1);
  var self = this;
  this._reporters.forEach(function (reporter) {
    if (reporter[eventName] !== undefined) {
      reporter[eventName].apply(reporter, params);
    }
  });
};

exports = module.exports = Emitter;

/*global $, _, ko*/


'use strict';


////////////////////////////////////////////////////////////////////////////////


var map       = Object(null);
var SUFFIX_RE = /-(\d+)$/;


////////////////////////////////////////////////////////////////////////////////


function findFreeName(name) {
  var index = 1;

  while (map[name]) {
    name = name.replace(SUFFIX_RE, '') + '-' + index;
    index++;
  }

  return name;
}


function allocate(model, name, prevName) {
  var conflict = map[name];

  if (model === map[prevName]) {
    map[prevName] = null;
  }

  map[name] = model;

  if (conflict && conflict !== model) {
    conflict.name(findFreeName(name));
  }
}


module.exports = function (model) {
  var prev = model.name();

  // keep track on previous name value
  model.name.subscribe(function (name) {
    prev = name;
  }, model, 'beforeChange');

  // handle name change. and call allocation
  model.name.subscribe(function (name) {
    if (model.selected()) {
      allocate(model, name, prev);
    }
  });

  // keep track on selected state, before it's actual change
  // handling beforeChange in order to be able to change name
  // (when it's going to be selected) before allocation handler
  model.selected.subscribe(function (value) {
    var name = model.name();

    // glyph is going to be unselected:
    // remove from the map
    if (value) {
      map[name] = null;
      return;
    }

    // glyphs is going to be selected, but it's name already "taken":
    // find free name and update model
    if (map[name]) {
      name = findFreeName(name);
      model.name(name);
    }

    map[name] = model;
  }, model, 'beforeChange');
};

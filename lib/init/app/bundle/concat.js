// Concats js/css resources per-package
//
//  .
//  |- /bundle/
//  |   |- <package>.<locale>.js
//  |   `- ...
//  `- ...
//


'use strict';


/*global N*/


// stdlib
var fs    = require('fs');
var path  = require('path');


// 3rd-party
var _       = require('underscore');
var async   = require('nlib').Vendor.Async;
var fstools = require('nlib').Vendor.FsTools;


////////////////////////////////////////////////////////////////////////////////


function concatJavascripts(pkgName, tmpdir, callback) {
  var base = '';

  async.forEachSeries([ 'server', 'views', 'client' ], function (part, next) {
    var filename = path.join(tmpdir, part, pkgName + '.js');

    fs.exists(filename, function (exists) {
      if (!exists) {
        next();
        return;
      }

      fs.readFile(filename, 'utf8', function (err, str) {
        if (err) {
          next(err);
          return;
        }

        base += str;
        next();
      });
    });
  }, function (err) {
    async.forEachSeries(N.config.locales['enabled'], function (locale, next) {
      var
      filename  = path.join(tmpdir, 'i18n', pkgName, locale + '.js'),
      outfile   = path.join(tmpdir, 'bundle', pkgName + '.' + locale + '.js');

      fs.exists(filename, function (exists) {
        if (!exists) {
          fs.writeFile(outfile, base, 'utf8', next);
          return;
        }

        fs.readFile(filename, 'utf8', function (err, str) {
          if (err) {
            next(err);
            return;
          }

          fs.writeFile(outfile, base + str, 'utf8', next);
        });
      });
    }, callback);
  });
}


////////////////////////////////////////////////////////////////////////////////


module.exports = function (tmpdir, config, callback) {
  var pkgNames = _.keys(config.packages);

  fstools.mkdir(path.join(tmpdir, 'bundle'), function (err) {
    if (err) {
      callback(err);
      return;
    }

    async.forEachSeries(pkgNames, function (pkgName, next) {
      concatJavascripts(pkgName, tmpdir, next);
    }, callback);
  });
};

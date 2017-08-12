'use strict'

require('./css/general.scss')

require('font-awesome/css/font-awesome.css')

require('spectre.css')
require('spectre.css/dist/spectre-icons.css')
require('spectre.css/dist/spectre-exp.css')

// require('ace-css/css/ace.css');
// require('font-awesome/css/font-awesome.css');

// Require index.html so it gets copied to dist
require('./index.html')

const Elm = require('./Main.elm')
const mountNode = document.getElementById('main')

// .embed() can take an optional second argument. This would be an object describing the data we need to start a program, i.e. a userID or some token
const app = Elm.Main.embed(mountNode)


document.addEventListener('mouseup', function () {
  app.ports.mouseUp.send(null)
})

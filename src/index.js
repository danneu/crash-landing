'use strict'

require('font-awesome/css/font-awesome.css')

require('spectre.css')
// require("spectre.css/dist/spectre-icons.css")
require('spectre.css/dist/spectre-exp.css')

require('./css/general.scss')

const Elm = require('./Main.elm')
const mountNode = document.getElementById('main')

// .embed() can take an optional second argument. This would be an object describing the data we need to start a program, i.e. a userID or some token
const app = Elm.Main.embed(mountNode, {
  isDev: window.location.hash === '#dev'
})

document.addEventListener('mouseup', () => {
  app.ports.mouseUp.send(null)
})

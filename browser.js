var React = require('react');
var ReactDOM = require('react-dom');

var Component = React.createFactory(require('./Component'));

window.renderApp = function(msg){
    ReactDOM.render(Component({msg: msg}), document.getElementById('root')); 
}
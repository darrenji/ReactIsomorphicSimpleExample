var React = require('react');
var ReactDOM = require('react-dom');

var Component = React.createClass({
    clickHandler: function(){
        alert(this.props.msg)
    },
    
    render: function(){
        return React.createElement('button', {onClick: this.clickHandler}, this.props.msg)
    }

})

module.exports = Component;
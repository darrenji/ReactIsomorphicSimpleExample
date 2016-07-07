var express  = require('express');
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var fs = require('fs');
var Component = React.createFactory(require('./Component'));

//原先把文件读出来
var BUNDLE = fs.readFileSync('./bundle.js',{encoding:'utf8'});
var TEMPLATE = fs.readFileSync('./index.html',{encoding:'utf8'});

var app = express();

function home(req, res){
    var msg = req.params.msg || 'Hello';
    var comp = Component({msg: msg});
    
    //@@@占位符的地方放组件
    var page = TEMPLATE.replace('@@@', ReactDOMServer.renderToString(comp));
    
    //###占位符的地方放js
    page = page.replace('###', '<script>renderApp("'+msg+'")</script>')
    res.send(page);
}

//路由
app.get('', home);
app.get('/bundle.js', function(req, res){
    res.send(BUNDLE);
})
app.get('/:msg', home);

app.listen(4000);
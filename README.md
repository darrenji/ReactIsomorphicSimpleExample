> 通常，当客户端请求一个包含React组件页面的时候，服务端首先响应输出这个页面，客户端和服务端有了第一次交互。然后，如果加载组件的过程需要向服务端发出Ajax请求等，客户端和服务端又进行了一次交互，这样，耗时相对较长。服务端是否可以在页面初次加载时把所有方面渲染好再一次性响应给客户端呢？

「React同构直出」就是用来解决这个问题的，做到「秒开」页面。过程大致是这样滴：

**1、在需要同构直出的页面(比如是index.html)放上占位符**

	<div id="root">@@@</div>
    ###
以上，当客户端发出首次请求，服务端渲染出组件的html内容放@@@这个位置，然后服务端再渲染出类似`<script>renderApp()</script>`这样的js代码段把组件最终渲染到DOM上。也就是说，renderApp方法实际上就是在渲染组件。

**2、而为了直接调用renderApp方法，必须让renderApp方法成为window下的方法**

	window.renderApp = function(){ReactDOM.render(...)}

**3、服务端取出index.html，渲染出占位符的内容，替代占位符，并一次性响应给客户端**
    
<br>

**通过一个例子来体会。**

## 文件结构 ##

	browser.js(在这里把渲染组件的过程赋值给window.renderApp)
	bundle.js(把browser.js内容bundle到这里)
	Component.js(组件在这里定义)
	express.js(服务端)
	index.html(同构直出的页面)
	package.json

##  index.html，直出页面放上占位符  ##

	<!doctype html>
	<html>
	<head>
	    <meta charset="UTF-8">
	    <title>Untitled Document</title>
	</head>
	<body>
	
	    <div id="root">@@@</div>
	    <script src="bundle.js"></script>
	    ###
	</body>
	</html>

## Component.js，在这里定义组件 ##

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

## browser.js,把组件渲染过程赋值给window对象 ##

	var React = require('react');
	var ReactDOM = require('react-dom');
	
	var Component = React.createFactory(require('./Component'));
	
	window.renderApp = function(msg){
	    ReactDOM.render(Component({msg: msg}), document.getElementById('root')); 
	}
可以通过`<script>render()</script>`来触发组件的渲染。稍后，在服务端会把这段代码渲染出来。

## express.js,服务端 ##

以上，需要直出的页面有了占位符，定义了组件，并把渲染组件的过程赋值给了window对象，服务端现在要做的工作就是：生成组件的html和渲染组件的js，放到直出页面index.html的占位符位置。

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

## package.json中的配置 ##

	"scripts": {
	"start": "watchify ./browser.js -o ./bundle.js"
	},

**运行：npm start**

**运行：node express.js**

**浏览：localhost:4000**

> 项目地址：https://github.com/darrenji/ReactIsomorphicSimpleExample








'use strict';

const http = require('http');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());

const random = (array)=>{
	return array[Math.floor(Math.random()*array.length)];
}
const genUrl = (id,{w='1200',h='280',blur=false,gray=false}) =>{
	return `http://unsplash.it/${(gray)?'g/':''}${w}/${h}/?image=${id}${(blur)?'&blur':''}`;
}

let unsplashIdList = [];

http.get('http://unsplash.it/list', res => {
	let str = '';
	res.on('data',chunk => {
		str += chunk.toString();
	});
	res.on('end',()=>{
		unsplashIdList = JSON.parse(str).map(e=>e.id);
		console.log(genUrl(random(unsplashIdList),{w:800,h:800,blur:true,gray:true}));
	});
})

app.get('/photo.html',(req, res, next) =>{
	let item = random(unsplashIdList);
	let opt = req.query;
	console.log(req.cookies);
	let now = new Date();
	if(req.cookies.expires > now.toUTCString()&& req.cookies.id != undefined && req.cookies.expires != undefined){
		console.log(1);
		let url = genUrl(req.cookies.id,opt);
		let now = new Date(req.cookies.expires);
		now.setSeconds(now.getSeconds()+5);		//每次访问后 cookie生存周期加 5s 以防同张页面请求出不同的随机图片
		console.log(now.toUTCString());
		res.setHeader('Set-Cookie',['id='+req.cookies.id,'expires='+now.toUTCString()]);
		res.writeHead(302,{'Content-Type':'text/html','Location': url});
	}else{
		console.log(2);
		let url = genUrl(item,opt);
		now.setSeconds(now.getSeconds()+60);
		res.setHeader('Set-Cookie',['id='+item,'expires='+now.toUTCString()]);
		res.writeHead(302,{'Content-Type':'text/html','Location': url});
	}
	res.end();
});

app.get('/index.html',(req,res,next) =>{
	res.writeHead(200,{'Content-Type':'text/html'});
	res.end(`<img src = 'http://localhost/photo.html?w=2300&h=1300'>
			<img src = 'http://localhost/photo.html?blur=true&w=2300&h=1300'>`)
})

app.get('/like',(req,rex,next) =>{

})
app.listen('80');
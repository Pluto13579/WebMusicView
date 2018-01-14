function $(s){
	//返回的是DOM元素或列表，不是jquery的包装对象，老师用function $(s)模拟了jQuery选择器。
	return document.querySelectorAll(s);
}

var lis = $("#list li");

var initListStyle = function(){
	for(var i = 0; i < lis.length ; i++)
	{
		lis[i].className = "";
	}
}

for(var i = 0; i < lis.length ; i++)
{
	lis[i].onclick = function(){
		initListStyle();
		this.className = "selected";
		load("/media/"+this.title);
	}
}




//ajax request
var xhr = new XMLHttpRequest();
var ac = new (window.AudioContext || window.webkitAudioContext)();
var gainNode = ac[ac.createGain?"createGain":"createGainNode"]();
gainNode.connect(ac.destination);

//音频分析
var analyser = ac.createAnalyser();
var size = 128;
analyser.fftSize = size * 2;
analyser.connect(gainNode);

var source = null ;// 存放当前播放的对象，方便下次停止

var count = 0 ;//  记录当前播放的index

//  创建canvas
var box = $("#box")[0];
var height ,width;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
box.appendChild(canvas);

var line ; 
var resize = function(){
	height = box.clientHeight;
	width = box.clientWidth ;
	canvas.width = width ; 
	canvas.height = height ;
	line = ctx.createLinearGradient(0,0,0,height);// 线性渐变
	line.addColorStop(0,"red");
	line.addColorStop(0.5,"yellow");
	line.addColorStop(1,"green");

	getDots();//修改点阵
}
// 绘制图形
var draw = function(arr){
	ctx.clearRect(0,0,width,height);
	var w = width/size;
	ctx.fillStyle = line; // 这个渐变会填充到绘制的图形中
	for(var i = 0 ; i < size ; i++)
	{
		if(draw.type == "column")
		{
			var h = arr[i]/256 * height ;//  高度从0到height
			ctx.fillRect(w*i, height-h , w*0.6 , h);
		}
		else
		{
			ctx.beginPath();
			// 绘制圆
			var o = Dots[i];
			var r = arr[i]/256 * 50 //半径0到50间
			ctx.arc(o.x,o.y,r,0,Math.PI*2,true);
			//ctx.strokeStyle = "#fff";//o.color;
			//创建渐变
			var g = ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,r);
			g.addColorStop(0,"#fff");
			g.addColorStop(1,o.color);
			ctx.fillStyle = g ;
			ctx.fill();
			//ctx.stroke();
		}
	}
}

/** dot 和 Columns按钮切换代码**/
var Dots = [];
draw.type = "column";
var random = function(m,n){
	return Math.round(Math.random()*(n-m)+m);
}
var getDots = function(){
	Dots = [];
	for(var i = 0 ; i < size ; i++)
	{
		var x = random(0,width);
		var y = random(0,height);
		var color = "rgb("+random(0,255)+","+random(0,255)+","+random(0,255)+")";
		Dots.push({
			x:x,
			y:y,
			color:color
		});
	}
}
var types = $("#type li");

var initTypeStyle = function(){
	for(var i = 0; i < types.length ; i++)
	{
		types[i].className = "";
	}
}

for(var i = 0; i < types.length ; i++)
{
	types[i].onclick = function(){
		initTypeStyle();
		this.className = "selected";
		draw.type = this.getAttribute("data-type");
	}
}

// 监听浏览器尺寸改变
resize();
window.onresize = resize ;

var load = function(url){
	var n = ++count;
	// 停止当前正在播放的
	source && source[source.stop ? "stop" :"noteOff"]();
	xhr.abort(); //停止上一个请求
	xhr.open("GET",url);
	xhr.responseType = "arraybuffer"; // 二进制返回
	xhr.onload = function(){
		//获取到音频二进制数据
		//console.log(xhr.response);
		// 利用AudioContext进行解码
		if(n != count ) return ;// 说明已经切换到别的音乐在播放
		ac.decodeAudioData(xhr.response,function(buffer){
			if(n != count ) return ;
			var bufferSource = ac.createBufferSource();
			bufferSource.buffer = buffer ;
			bufferSource.connect(analyser); // connect 就相当于连接，过滤作用
			//bufferSource.connect(ac.destination);
			//bufferSource.start(0); //开始播放
			bufferSource[bufferSource.start?"start":"noteOn"](0);
			source = bufferSource ;
		},function(err){
			console.log(err);
		});
	};
	xhr.send();

}

function visualizer(){
	var arr = new Uint8Array(analyser.frequencyBinCount); // fftSize
	// 把分析的音频数据复制到arr中
	analyser.getByteFrequencyData(arr);
	//console.log(arr);
	requestAnimationFrame = window.requestAnimationFrame ||
							window.webkitRequestAnimationFrame ||
							window.mozRequestAnimationFrame;
	var v = function(){
		analyser.getByteFrequencyData(arr);
		//console.log(arr);
		// 绘制图形
		draw(arr);
		requestAnimationFrame(v);
	}
	requestAnimationFrame(v); // 1秒60次
}

// 初始化调用一次分析音频函数
visualizer();

var changeVolume = function(percent){
	gainNode.gain.value = percent * percent;
}

$("#volum")[0].onchange = function(){
	changeVolume(this.value/this.max);
}
// 初始化调用一次
$("#volum")[0].onchange();




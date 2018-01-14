function $(s){
	//返回的是DOM元素或列表，不是jquery的包装对象，老师用function $(s)模拟了jQuery选择器。
	return document.querySelectorAll(s);
}

var lis = $("#list li");
//  创建canvas
var box = $("#box")[0];
var height ,width;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
box.appendChild(canvas);
var line ; 
/** dot 和 Columns按钮切换代码**/
var Dots = [];
var draw_type = "column";
var types = $("#type li");
var size = 128;



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
		//load("/media/"+this.title);
		mv.play("/media/"+this.title);
	}
}

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
	var cw = w * 0.6 ; 
	var capH = cw;
	var capgap = 10;
	ctx.fillStyle = line; // 这个渐变会填充到绘制的图形中
	for(var i = 0 ; i < size ; i++)
	{
		var o = Dots[i];
		if(draw_type == "column")
		{
			var h = arr[i]/256 * height ;//  高度从0到height
			ctx.fillRect(w*i, height-h , cw , h); 
			ctx.fillRect(w*i, height-(o.cap+capH) , cw , capH);//小帽
			o.cap--;
			if(o.cap < 0)
				o.cap = 0;
			if(h > 0 && o.cap < h+capgap)
				o.cap = h+capgap > height - capH ? height - capH: h+capgap ;
		}
		else
		{
			ctx.beginPath();
			// 绘制圆
			var r = 10 + arr[i]/256 * (height>width?width:height)/10; //半径最小是10，大小是浏览器宽高最小值除以10
			ctx.arc(o.x,o.y,r,0,Math.PI*2,true);
			//ctx.strokeStyle = "#fff";//o.color;
			//创建渐变
			var g = ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,r);
			g.addColorStop(0,"#fff");
			g.addColorStop(1,o.color);
			ctx.fillStyle = g ;
			ctx.fill();
			o.x += o.dx; //向右移动
			o.x = o.x > width ? 0 : o.x ;
			//ctx.stroke();
		}
	}
}


var random = function(m,n){
	return Math.round(Math.random()*(n-m)+m);
}
var getDots = function(){
	Dots = [];
	for(var i = 0 ; i < size ; i++)
	{
		var x = random(0,width);
		var y = random(0,height);
		var color = "rgba("+random(0,255)+","+random(0,255)+","+random(0,255)+",0)";
		Dots.push({
			x:x,
			y:y,
			dx:random(1,4),
			color:color,
			cap:0 // 柱形小帽最底层距离
		});
	}
}

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
		draw_type = this.getAttribute("data-type");
	}
}

// 监听浏览器尺寸改变
resize();
window.onresize = resize ;
var mv = new MusicVisualizer(
	{
		size:size,
		visualizer:draw
	});


$("#volum")[0].onchange = function(){
	mv.changeVolume(this.value/this.max);
}
// 初始化调用一次
$("#volum")[0].onchange();






function MusicVisualizer(obj){
	this.source = null ;
	this.count = 0 ;

	this.analyser = MusicVisualizer.ac.createAnalyser();
	this.size = obj.size ;
	this.analyser.fftSize = this.size * 2;

	this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain?"createGain":"createGainNode"]();
	this.gainNode.connect(MusicVisualizer.ac.destination);

	this.analyser.connect(this.gainNode);

	this.xhr = new XMLHttpRequest();

	this.visualizer = obj.visualizer ;

	this.visualize();

}

MusicVisualizer.ac = new (window.AudioContext || window.webkitAudioContext)(); 

// ajax加载数据
MusicVisualizer.prototype.load = function(url,fun) {
	this.xhr.abort(); //停止上一个请求
	this.xhr.open("GET",url);
	this.xhr.responseType = "arraybuffer"; // 二进制返回
	var self = this;  //这里保存当前的this，方便onload里面代码调用使用
	this.xhr.onload = function(){
		fun(self.xhr.response);
	}
	this.xhr.send();
};

MusicVisualizer.prototype.decode = function(arraybuffer,fun) {
	MusicVisualizer.ac.decodeAudioData(arraybuffer,function(buffer){
		fun(buffer);
	},function(err){
		console.log(err);
	});
}
// 播放
MusicVisualizer.prototype.play = function(url) {
	var n = ++this.count ;
	var self = this; 
	this.source && this.stop()
	this.load(url,function(arraybuffer){
		if(n != self.count) return ;
		self.decode(arraybuffer,function(buffer){
			if(n != self.count) return ;
			var bs = MusicVisualizer.ac.createBufferSource();
			bs.connect(self.analyser);
			bs.buffer = buffer ; 
			bs[bs.start ? "start" : "noteOn"](0);
			self.source = bs ;
		});
	});
};

MusicVisualizer.prototype.stop = function() {
	this.source[this.source.stop ? "stop" :"noteOff"]();
};

MusicVisualizer.prototype.changeVolume = function(percent) {
	this.gainNode.gain.value = percent * percent ;
};

MusicVisualizer.prototype.visualize = function() {
	var arr = new Uint8Array(this.analyser.frequencyBinCount); // fftSize
	// 把分析的音频数据复制到arr中
	this.analyser.getByteFrequencyData(arr);
	//console.log(arr);
	requestAnimationFrame = window.requestAnimationFrame ||
							window.webkitRequestAnimationFrame ||
							window.mozRequestAnimationFrame;
	var self = this ;
	var v = function(){
		self.analyser.getByteFrequencyData(arr);
		//console.log(arr);
		// 绘制图形
		//draw(arr);
		self.visualizer(arr);
		requestAnimationFrame(v);
	}
	requestAnimationFrame(v); // 1秒60次
};
$(function () {
	// FPS
	var FPS = function (target) {
		this.target = target;
		this.interval = 1000 / target;
		this.checkpoint = new Date();
		this.fps = 0;
	};
	FPS.prototype = {
		check: function () {
			// fps計算
			var now = new Date();
			this.fps = 1000 / (now - this.checkpoint);
			this.checkpoint = new Date();
		},
		getFPS: function() {
			// fps取得
			return this.fps.toFixed(2);
		},
		getInterval: function () {
			// インターバル取得
			var elapsed = new Date() - this.checkpoint;
			return this.interval - elapsed > 10 ? this.interval - elapsed : 10;
		}
	};

	var fps = new FPS(30);

	// canvas
	$canvas = $("canvas")
	$canvas.css({
		border: "1px solid black",
		background: "gray"
	});

	// retina対応
	var scale = 1;
	if (window.devicePixelRatio == 2) {
		$canvas.attr({
			width: 800,
			height: 600
		});
		
		$canvas.scaleCanvas({
			scale: 2
		});
		
		scale = 2;
	}

	// 画面領域
	var canvasX = $canvas.width();
	var canvasY = $canvas.height();
	console.log("画面", canvasX, canvasY);

	var centerX = canvasX / 2;
	var centerY = canvasY / 2;
	console.log("中心", centerX, centerY);

	// 指
	var Finger = function () {
		this.x = 0;
		this.y = 0;
		this.r = 5;
	};
	Finger.prototype = {
		draw: function () {
			$canvas.drawArc({
				fillStyle: "green",
				x: this.x/scale, y: this.y/scale,
				radius: this.r
			});
		}
	};

	var f1 = new Finger();

	// Laep Motion
	Leap.loop(function (frame) {
		if (frame.fingers[0]) {
			f1.x = centerX + ~~frame.fingers[0].tipPosition[0];
			f1.y = canvasY - ~~frame.fingers[0].tipPosition[1];
		}
	});

	// circle
	var Circle = function (r, c) {
		this.x = centerX;
		this.y = centerY;
		this.r = r;
		this.c = c;
	}
	Circle.prototype = {
		draw: function () {
			$canvas.drawArc({
				strokeStyle: this.c,
				strokeWidth: 4,
				x: this.x/scale, y: this.y/scale,
				radius: this.r
			});
		}
	};

	var c1 = new Circle(8, "blue");

	var collision = function (obj1, obj2) {
		var dx = obj2.x - obj1.x;
		var dy = obj2.y - obj1.y;
		var distance = Math.sqrt(dx*dx + dy*dy);
		var surface = obj1.r + obj2.r;
		
		return distance < surface;
	};

	// 画面更新
	var update = function update () {
		fps.check();
		$canvas.clearCanvas();

		// fps
		$canvas.drawText({
			fillStyle: "black",
			fontStyle: "bold",
			fontSize: "5pt",
			align: "left",
			x: (canvasX)/scale*0.1, y: (canvasY/scale)*0.05,
			text: "FPS: " + fps.getFPS()
				+ "\nf: " +  ("00"+(f1.x)).slice(-3) + " " + ("00"+(f1.y)).slice(-3)
		});
		
		// title
		$canvas.drawText({
			fillStyle: "black",
			fontStyle: "bold",
			fontSize: "30pt",
			x: centerX/scale, y: (centerY-100)/scale,
			text: "Hello World."
		});

		// start
		$canvas.drawText({
			fillStyle: "white",
			fontStyle: "bold",
			fontSize: "15pt",
			x: centerX/scale, y: (centerY+100)/scale,
			text: "hold your finger"
		});

		if(collision(c1, f1)) {
			c1.c = "red";
		} else {
			c1.c = "blue";
		};

		c1.draw();

		f1.draw();

		setTimeout(update, fps.getInterval());
	};

	update();
});

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

	// Ring
	var Ring = function (r, c) {
		this.x = centerX;
		this.y = centerY;
		this.r = r;
		this.c = c;
	};
	Ring.prototype = {
		draw: function () {
			$canvas.drawArc({
				strokeStyle: r1.collision(f1) ? "red" : this.c,
				strokeWidth: 4,
				x: this.x/scale, y: this.y/scale,
				radius: this.r
			});
		},
		collision: function (target) {
			var dx = target.x - this.x;
			var dy = target.y - this.y;
			var distance = Math.sqrt(dx*dx + dy*dy);
			var surface = this.r + target.r;

			return distance < surface;
		}
	};

	var Arrow = function (direction) {
		this.x = 0;
		this.y = canvasY/4;
		this.c = "blue";
		if (direction == "right") {
			this.r = 45;
			this.m = 10
		} else {
			this.r = -45;
			this.m = -10;
		};
	};
	Arrow.prototype = {
		draw: function () {
			$canvas.drawRect({
				fillStyle: this.c,
				x: (this.x - canvasX*0.25/4)/scale,
				y: (this.y - canvasX*0.25/4)/scale,
				width: canvasX/scale*0.25, height: canvasY/scale*0.1,
				rotate: this.r,
			})
			.drawRect({
				fillStyle: this.c,
				x: (this.x - canvasX*0.25/4)/scale,
				y: (this.y + canvasX*0.25/4)/scale,
				width: canvasX/scale*0.25, height: canvasY/scale*0.1,
				rotate: -this.r,
			});

			this.update();
		},
		update: function () {
			this.x = this.x + this.m;

			if (this.m > 0) {
				if (this.x > canvasX + canvasX*0.25)
				this.x = - canvasX*0.25;
			} else {
				if (this.x < -canvasX*0.25)
				this.x = canvasX + canvasX*0.25;
			}
		}
	};

	var f1 = new Finger();
	var r1 = new Ring(8, "blue");
	var a1 = new Arrow("right");

	// Laep Motion
	Leap.loop(function (frame) {
		if (frame.fingers[0]) {
			f1.x = centerX + ~~frame.fingers[0].tipPosition[0];
			f1.y = canvasY - ~~frame.fingers[0].tipPosition[1];
		}
	});

	// 画面更新
	var update = function update () {
		fps.check();
		$canvas.clearCanvas();

		a1.draw();

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

		r1.draw();

		f1.draw();

		setTimeout(update, fps.getInterval());
	};

	update();
});

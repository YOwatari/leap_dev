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
	var Layers = [];
	Layers.push($("canvas#layer0"));
	Layers.push($("canvas#layer1"));
	Layers.push($("canvas#layer2"));
	Layers.push($("canvas#layer3"));

	// retina対応
	var scale = 1;
	if (window.devicePixelRatio == 2) {
		$.each(Layers, function (index, value) {
			value.attr({
				width: 800,
				height: 600
			});

			value.scaleCanvas({
				scale: 2
			});
		});
		
		scale = 2;
	}

	// 画面領域
	var canvasX = Layers[0].width();
	var canvasY = Layers[0].height();
	var centerX = canvasX / 2;
	var centerY = canvasY / 2;

	var NEXT = false;
	var nextGame = false;

	// 指
	var Finger = function () {
		this.x = 0;
		this.y = 0;
		this.r = 5;
	};
	Finger.prototype = {
		draw: function (layer) {
			layer.drawArc({
				fillStyle: "green",
				x: this.x/scale, y: this.y/scale,
				radius: this.r
			});
		}
	};

	// Ring
	var Ring = function (x, y, r, c, target) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.c = c;
		this.target = target;
	};
	Ring.prototype = {
		draw: function (layer) {
			layer.drawArc({
				strokeStyle: this.collision() ? "red" : this.c,
				strokeWidth: 4,
				x: this.x/scale, y: this.y/scale,
				radius: this.r
			});
		},
		collision: function () {
			var dx = this.target.x - this.x;
			var dy = this.target.y - this.y;
			var distance = Math.sqrt(dx*dx + dy*dy);
			var surface = this.r + this.target.r;

			return distance < surface;
		}
	};

	var Arrow = function (x, y, color, direction) {
		if (x <= 0) {
			this.x = x - canvasX/4;
		} else {
			this.x = x + canvasX/4;
		}
		this.x = x;
		this.y = y;
		this.c = color;
		if (direction == "right") {
			this.r = 45;
			this.m = 10;
		} else {
			this.r = -45;
			this.m = -10;
		};
	};
	Arrow.prototype = {
		draw: function (layer) {
			layer.drawRect({
				fillStyle: this.c,
				x: (this.x - canvasX*0.25/4)/scale,
				y: (this.y - canvasX*0.25/4)/scale,
				width: canvasX/scale*0.25, height: canvasY/scale*0.1,
				rotate: this.r,
				cornerRadius: 10
			})
			.drawRect({
				fillStyle: this.c,
				x: (this.x - canvasX*0.25/4)/scale,
				y: (this.y + canvasX*0.25/4)/scale,
				width: canvasX/scale*0.25, height: canvasY/scale*0.1,
				rotate: -this.r,
				cornerRadius: 10
			});

			this.update();
		},
		update: function () {
			this.x = this.x + this.m;

			if (this.m > 0) {
				if (this.x > canvasX + canvasX/4)
					this.x = -canvasX;
			} else {
				if (this.x < -canvasX/4)
					this.x = 2*canvasX;
			}
		}
	};

	// Arc
	var Arc = function (color) {
		this.x = 0;
		this.y = 0;
		this.c = color;
		this.direction = 0;
		this.radius = 0;
		this.speed = 1.5;

		this.init();
	};
	Arc.prototype = {
		init: function () {
			this.x = Math.floor( Math.random() * canvasX );
			this.y = Math.floor( Math.random() * canvasY );
			this.direction = Math.floor( Math.random() * 2*Math.PI );
			this.radius = 30 + Math.floor( Math.random() * 70 );
			this.speed = 1 + Math.floor( Math.random() );
		},
		draw: function (layer) {
			layer.drawArc({
				fillStyle: this.c,
				x: this.x/scale, y: this.y/scale,
				radius: this.radius
			});

			this.update();
		},
		update: function () {
			this.x = this.x + this.speed*Math.sin(this.direction);
			this.y = this.y + this.speed*Math.cos(this.direction);

			if (this.x - this.radius*2 > canvasX
				|| this.x + this.radius*2 < 0
				|| this.y - this.radius*2 > canvasY
				|| this.y + this.radius*2 < 0) {
				this.init();
			}
		}
	};

	var Curtain = function (layer) {
		this.wL = 0;
		this.wR = 0;
		this.c = "white";
		this.openSpeed = 15;
		this.l = layer;
	};
	Curtain.prototype = {
		draw: function (layer) {
			layer.drawRect({
				fillStyle: this.c,
				x: centerX/scale,
				y: 0,
				width: this.wL/scale, height: canvasY/scale,
				fromCenter: false
			});

			layer.drawRect({
				fillStyle: this.c,
				x: centerX/scale,
				y: 0,
				width: this.wR/scale, height: canvasY/scale,
				fromCenter: false
			});

			this.update();
		},
		update: function () {
			if (this.wL > -centerX || this.wR < centerX) {
				this.wL -= this.openSpeed;
				this.wR += this.openSpeed;
			} else {
				NEXT = false;
			}
		}
	};

	var f1 = new Finger();
	var r1 = new Ring(centerX-150, centerY+25, 10, "blue", f1);
	var r2 = new Ring(centerX+150, centerY+25, 10, "green", f1);

	var aR1 = new Arrow(0, canvasY/4, "blue", "right");
	var aR2 = new Arrow(-canvasX*1/4, canvasY/4, "blue", "right");
	var aR3 = new Arrow(-canvasX*2/4, canvasY/4, "blue", "right");
	var aR4 = new Arrow(-canvasX*3/4, canvasY/4, "blue", "right");

	var aL1 = new Arrow(canvasX, canvasY*3/4, "red", "left");
	var aL2 = new Arrow(canvasX + canvasX*1/4, canvasY*3/4, "red", "left");
	var aL3 = new Arrow(canvasX + canvasX*2/4, canvasY*3/4, "red", "left");
	var aL4 = new Arrow(canvasX + canvasX*3/4, canvasY*3/4, "red", "left");

	var colors = [
		"#ffc6c6",
		"#ffc6e2",
		"#ffc6ff",
		"#e2c6ff",
		"#c6c6ff",
		"#c6e2ff",
		"#c6ffff",
		"#c6ffe2",
		"#c6ffc6",
		"#e2ffc6",
		"#ffffc6",
		"#ffe2c6"
	];
	var circle = $.map(colors, function (value, index) {
		return new Arc(value);
	});
	var curtain = new Curtain();

	// Laep Motion
	Leap.loop(function (frame) {
		if (frame.fingers[0]) {
			f1.x = centerX + ~~frame.fingers[0].tipPosition[0];
			f1.y = canvasY - ~~frame.fingers[0].tipPosition[1];
		}
	});

	var Layer0Update = function L0Update () {
		for (var i = circle.length - 1; i >= 0; i--) {
			circle[i].draw(Layers[0]);
		};

		Layers[0].drawRect({
			fillStyle: "rgba(255,255,255,0.7)",
			x: centerX/scale,
			y: centerY/scale,
			width: 0.9*canvasX/scale, height: 0.9*canvasY/scale,
			cornerRadius: 10
		})
	};

	var Layer1Update = function L1Update () {
		// sub title
		Layers[1].drawText({
			fillStyle: "black",
			fontStyle: "bold",
			fontSize: "8pt",
			x: 0.75*centerX/scale, y: (centerY-150)/scale,
			text: "瞬間バディパーティゲーム"
		});

		// title
		Layers[1].drawText({
			fillStyle: "black",
			fontStyle: "bold",
			fontSize: "30pt",
			x: centerX/scale, y: (centerY-100)/scale,
			text: "ユビフレ"
		});

		// start
		Layers[1].drawText({
			fillStyle: "black",
			fontStyle: "bold",
			fontSize: "15pt",
			x: centerX/scale, y: (centerY+150)/scale,
			text: "hold your finger and slide"
		});
	};

	var Layer2Update = function L2Update () {
		r1.draw(Layers[2]);
		r2.draw(Layers[2]);

		//aR1.draw();
		//aR2.draw();
		//aR3.draw();
		//aR4.draw();

		//aL1.draw();
		//aL2.draw();
		//aL3.draw();
		//aL4.draw();
	};

	var Layer3Update = function L3Update () {
		f1.draw(Layers[3]);
	};
	Layers[3].bind("click", function(){
		NEXT = true;
	});


	// 画面更新
	var update = function update () {
		fps.check();

		$.each(Layers, function (index, value) {
			value.clearCanvas();
		});

		Layer0Update();
		Layer1Update();
		Layer2Update();
		Layer3Update();

		if (NEXT)
			curtain.draw(Layers[2]);
		

		// fps
		Layers[3].drawText({
			fillStyle: "black",
			fontStyle: "bold",
			fontSize: "5pt",
			align: "left",
			x: (canvasX)/scale*0.1, y: (canvasY/scale)*0.05,
			text: "FPS: " + fps.getFPS()
				+ "\nf: " +  ("00"+(f1.x)).slice(-3) + " " + ("00"+(f1.y)).slice(-3)
		});

		setTimeout(update, fps.getInterval());
	};

	var nextUpdate = update();

	if (!nextGame) {
		update();
	} else {
		nextUpdate();
	}
});

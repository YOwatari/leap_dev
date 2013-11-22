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

	// 各種レイヤー
	var CanvasLayers = [];
	CanvasLayers.push($("canvas#layer0"));
	CanvasLayers.push($("canvas#layer1"));
	CanvasLayers.push($("canvas#layer2"));
	CanvasLayers.push($("canvas#layer3"));

	// retina対応
	var	SCALE = 1;
	if (window.devicePixelRatio == 2) {
		$.each(CanvasLayers, function (index, value) {
			value.attr({
				width: 800,
				height: 600
			});

			value.scaleCanvas({
				scale: 2
			});
		});
		
		SCALE  = 2;
	}

	// 画面領域
	var canvasX = CanvasLayers[0].width();
	var canvasY = CanvasLayers[0].height();
	var centerX = canvasX / 2;
	var centerY = canvasY / 2;

	// シーン状態
	var Scene = [
		"Title",
		"Game1",
		"Quiz1",
		"Game2",
		"Game3",
		"Quiz2",
		"End"
	];

	// 現状態
	var State = Scene[0];

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
				x: this.x/SCALE, y: this.y/SCALE,
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
				x: this.x/SCALE, y: this.y/SCALE,
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
				x: (this.x - canvasX*0.25/4)/SCALE,
				y: (this.y - canvasX*0.25/4)/SCALE,
				width: canvasX/SCALE*0.25, height: canvasY/SCALE*0.1,
				rotate: this.r,
				cornerRadius: 10
			})
			.drawRect({
				fillStyle: this.c,
				x: (this.x - canvasX*0.25/4)/SCALE,
				y: (this.y + canvasX*0.25/4)/SCALE,
				width: canvasX/SCALE*0.25, height: canvasY/SCALE*0.1,
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
				x: this.x/SCALE, y: this.y/SCALE,
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
				x: centerX/SCALE,
				y: 0,
				width: this.wL/SCALE, height: canvasY/SCALE,
				fromCenter: false
			});

			layer.drawRect({
				fillStyle: this.c,
				x: centerX/SCALE,
				y: 0,
				width: this.wR/SCALE, height: canvasY/SCALE,
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

	// 指ポインタ
	var f1 = new Finger();

	var TitleScene = function () {
		this.r1 = new Ring(centerX-150, centerY+25, 10, "blue", f1);
		this.r2 = new Ring(centerX+150, centerY+25, 10, "green", f1);

		this.aR1 = new Arrow(0, canvasY/4, "blue", "right");
		this.aR2 = new Arrow(-canvasX*1/4, canvasY/4, "blue", "right");
		this.aR3 = new Arrow(-canvasX*2/4, canvasY/4, "blue", "right");
		this.aR4 = new Arrow(-canvasX*3/4, canvasY/4, "blue", "right");

		this.aL1 = new Arrow(canvasX, canvasY*3/4, "red", "left");
		this.aL2 = new Arrow(canvasX + canvasX*1/4, canvasY*3/4, "red", "left");
		this.aL3 = new Arrow(canvasX + canvasX*2/4, canvasY*3/4, "red", "left");
		this.aL4 = new Arrow(canvasX + canvasX*3/4, canvasY*3/4, "red", "left");

		this.colors = [
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
		this.circle = $.map(this.colors, function (value, index) {
			return new Arc(value);
		});
		this.curtain = new Curtain();
	};
	TitleScene.prototype = {
		update: function () {
			this.layer0();
			this.layer1();
			this.layer2();
			this.layer3();
		},
		layer0: function () {
			for (var i = this.circle.length - 1; i >= 0; i--) {
				this.circle[i].draw(CanvasLayers[0]);
			};

			CanvasLayers[0].drawRect({
				fillStyle: "rgba(255,255,255,0.7)",
				x: centerX/SCALE,
				y: centerY/SCALE,
				width: 0.9*canvasX/SCALE, height: 0.9*canvasY/SCALE,
				cornerRadius: 10
			})
		},
		layer1: function () {
			// sub title
			CanvasLayers[1].drawText({
				fillStyle: "black",
				fontStyle: "bold",
				fontSize: "8pt",
				x: 0.75*centerX/SCALE, y: (centerY-150)/SCALE,
				text: "瞬間バディパーティゲーム"
			});

			// title
			CanvasLayers[1].drawText({
				fillStyle: "black",
				fontStyle: "bold",
				fontSize: "30pt",
				x: centerX/SCALE, y: (centerY-100)/SCALE,
				text: "ユビフレ"
			});

			// start
			CanvasLayers[1].drawText({
				fillStyle: "black",
				fontStyle: "bold",
				fontSize: "15pt",
				x: centerX/SCALE, y: (centerY+150)/SCALE,
				text: "hold your finger and slide"
			});
		},
		layer2: function () {
			this.r1.draw(CanvasLayers[2]);
			this.r2.draw(CanvasLayers[2]);

			//aR1.draw();
			//aR2.draw();
			//aR3.draw();
			//aR4.draw();

			//aL1.draw();
			//aL2.draw();
			//aL3.draw();
			//aL4.draw();
		},
		layer3: function () {
			f1.draw(CanvasLayers[3]);
		}
	};

	var tScene = new TitleScene();

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

		$.each(CanvasLayers, function (index, value) {
			value.clearCanvas();
		});

		switch (State) {
			case Scene[0]:
				// タイトル
				tScene.update();
				break;
			case Scene[1]:
				// ゲーム1
				break;
			case Scene[2]:
				// クイズ1
				break;
			case Scene[3]:
				// ゲーム2
				break;
			case Scene[4]:
				// ゲーム3
				break;
			case Scene[5]:
				// クイズ2
				break;
			case Scene[6]:
				// エンド
				break;
		}

		// fps
		CanvasLayers[3].drawText({
			fillStyle: "black",
			fontStyle: "bold",
			fontSize: "5pt",
			align: "left",
			x: (canvasX)/SCALE*0.1, y: (canvasY/SCALE)*0.05,
			text: "FPS: " + fps.getFPS()
				+ "\nf: " +  ("00"+(f1.x)).slice(-3) + " " + ("00"+(f1.y)).slice(-3)
		});

		setTimeout(update, fps.getInterval());
	};

	update();
});

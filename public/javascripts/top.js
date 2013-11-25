$(window).load(function () {
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
	var canvasW = CanvasLayers[0].width();
	var canvasH = CanvasLayers[0].height();
	var centerX = canvasW / 2;
	var centerY = canvasH / 2;

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
	var sIndex = 4;
	var State = Scene[sIndex];

	// 指
	var Finger = function (color) {
		this.x = centerX;
		this.y = centerY;
		this.r = 10;
        this.c = color;
	};
	Finger.prototype = {
		draw: function (layer) {
			layer.drawArc({
				fillStyle: this.c,
				x: this.x/SCALE, y: this.y/SCALE,
				radius: this.r/SCALE
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
			this.x = x - canvasW/4;
		} else {
			this.x = x + canvasW/4;
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
				x: (this.x - canvasW*0.25/4)/SCALE,
				y: (this.y - canvasW*0.25/4)/SCALE,
				width: canvasW/SCALE*0.25, height: canvasH/SCALE*0.1,
				rotate: this.r,
				cornerRadius: 10
			})
			.drawRect({
				fillStyle: this.c,
				x: (this.x - canvasW*0.25/4)/SCALE,
				y: (this.y + canvasW*0.25/4)/SCALE,
				width: canvasW/SCALE*0.25, height: canvasH/SCALE*0.1,
				rotate: -this.r,
				cornerRadius: 10
			});

			this.update();
		},
		update: function () {
			this.x = this.x + this.m;

			if (this.m > 0) {
				if (this.x > canvasW + canvasW/4)
					this.x = -canvasW;
			} else {
				if (this.x < -canvasW/4)
					this.x = 2*canvasW;
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
			this.x = Math.floor( Math.random() * canvasW );
			this.y = Math.floor( Math.random() * canvasH );
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

			if (this.x - this.radius*2 > canvasW
				|| this.x + this.radius*2 < 0
				|| this.y - this.radius*2 > canvasH
				|| this.y + this.radius*2 < 0) {
				this.init();
			}
		}
	};

	var Curtain = function (mode) {
		this.wL = 0;
		this.wR = 0;
		this.c = "white";
		this.openSpeed = 10;
		this.closeSpeed = 15;
		this.mode = mode;
	};
	Curtain.prototype = {
		draw: function (layer) {
			layer.drawRect({
				fillStyle: this.mode ? "white" : "black",
				x: this.mode ? centerX/SCALE : 0,
				y: 0,
				width: this.wL/SCALE, height: canvasH/SCALE,
				fromCenter: false
			});

			layer.drawRect({
				fillStyle: this.mode ? "white" : "black",
				x: this.mode ? centerX/SCALE : canvasW/SCALE,
				y: 0,
				width: this.wR/SCALE, height: canvasH/SCALE,
				fromCenter: false
			});

			this.update();
		},
		update: function () {
			switch (this.mode) {
				case true:
					if (this.wL > -centerX || this.wR < centerX) {
						this.wL -= this.openSpeed;
						this.wR += this.openSpeed;
					} else {
						this.mode = null;
						sIndex++;
						State = Scene[sIndex];
					}
					break;
				case false:
					if (this.wL < centerX || this.wR > centerX) {
						this.wL += this.closeSpeed;
						this.wR -= this.closeSpeed;
					} else {
						this.wL = 0;
						this.wR = 0;
						this.mode = true;
					}
					break;
				default:
					break;
			}
			
		}
	};

	// 指ポインタ
	var f1 = new Finger("blue");
    var f2 = new Finger("green");

	var TitleScene = function () {
		this.r1 = new Ring(centerX-100, centerY+25, 10, "blue", f1);
		this.r2 = new Ring(centerX+100, centerY+25, 10, "green", f2);

		/*
		this.aR1 = new Arrow(0, canvasH/4, "blue", "right");
		this.aR2 = new Arrow(-canvasW*1/4, canvasH/4, "blue", "right");
		this.aR3 = new Arrow(-canvasW*2/4, canvasH/4, "blue", "right");
		this.aR4 = new Arrow(-canvasW*3/4, canvasH/4, "blue", "right");

		this.aL1 = new Arrow(canvasW, canvasH*3/4, "red", "left");
		this.aL2 = new Arrow(canvasW + canvasW*1/4, canvasH*3/4, "red", "left");
		this.aL3 = new Arrow(canvasW + canvasW*2/4, canvasH*3/4, "red", "left");
		this.aL4 = new Arrow(canvasW + canvasW*3/4, canvasH*3/4, "red", "left");
		*/

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
		this.curtain = new Curtain(false);
		var end = false;
	};
	TitleScene.prototype = {
		update: function () {
			this.layer0();
			this.layer1();
			this.layer2();
		},
		layer0: function () {
			if (!this.curtain.mode) {
				for (var i = this.circle.length - 1; i >= 0; i--) {
					this.circle[i].draw(CanvasLayers[0]);
				};

				CanvasLayers[0].drawRect({
					fillStyle: "rgba(255,255,255,0.7)",
					x: centerX/SCALE,
					y: centerY/SCALE,
					width: 0.9*canvasW/SCALE, height: 0.9*canvasH/SCALE,
					cornerRadius: 10
				})
			} else {
				CanvasLayers[0].drawRect({
					fillStyle: "black",
					x: 0, y: 0,
					width: canvasW, height: canvasH
				});
			}
		},
		layer1: function () {
			if (!this.curtain.mode) {
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
					text: "◯を指さしてスタート"
				});
			} else {
				CanvasLayers[1].drawRect({
					fillStyle: "black",
					x: 0, y: 0,
					width: canvasW, height: canvasH
				});
			}
		},
		layer2: function () {
			this.r1.draw(CanvasLayers[2]);
			this.r2.draw(CanvasLayers[2]);

			if (this.r1.collision() && this.r2.collision()) {
				this.end = true;
			}

			if (this.end) {
				this.curtain.draw(CanvasLayers[2]);
				if (this.curtain.mode == true) {

				};
			}	

			//aR1.draw();
			//aR2.draw();
			//aR3.draw();
			//aR4.draw();

			//aL1.draw();
			//aL2.draw();
			//aL3.draw();
			//aL4.draw();
		}
	};

    // 間違い箇所
    var Difference = function (x, y, r, target) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.target = target;
        this.visible = false;
        this.audio = new Audio("/audio/correct.mp3");
    };
    Difference.prototype = {
        collision: function () {
        	var x = this.x < 0 ? -1*this.x*(centerX/698)/SCALE : (centerX + this.x*(centerX/698))/SCALE;
            var dx = this.target.x/SCALE - x;
            var dy = this.target.y/SCALE - ((centerY/2 + 1*this.y*(centerY/524))/SCALE);
            var distance = Math.sqrt(dx*dx + dy*dy);
            var surface = this.r + this.target.r;

            return  distance < surface;
        }, 
        draw: function (layer) {
            layer.drawArc({
              strokeStyle: this.visible ? "rgba(255,0,0,1.0)" : "rgba(0,0,0,0.0)",
              strokeWidth: 1,
              x: this.x < 0 ? -1*this.x*(centerX/698)/SCALE : (centerX + this.x*(centerX/698))/SCALE,
              y: (centerY/2 + 1*this.y*(centerY/524))/SCALE,
              radius: this.r/SCALE
            });
        }
    };

    // 表示画像
    var Picture = function (x, y, imgSrc, imgWidth, imgHeight, differencesP) {
        this.x = x;
        this.y = y;
        this.width = imgWidth;
        this.height = imgHeight;

        // Differencesオブジェクト配列
        this.differences = $.map(differencesP, function(item, index) {
                return new Difference(item[0], item[1], item[2], item[3]);
        });

        this.src = imgSrc;
    };
    Picture.prototype = {
        draw: function (layer) {
            // 画像表示
            layer.drawImage({
                source: this.src,
                x: this.x/SCALE, y: (centerY-(this.height*centerX/this.width)/2)/SCALE,
                width: centerX/SCALE,
                height: this.height*centerX/this.width/SCALE,
                fromCenter: false
            });
        }
    };

    // 左画像
    var imageL = new Object();
    imageL.src = "/images/machigaiSagashi1.png";
    imageL.width = 698;
    imageL.height = 524;

    var differencesL = new Array();
    // 汗
    differencesL.push([-1*imageL.width*85/325, imageL.height*151/243.8, 10, f1]);
    // 青い靴
    differencesL.push([-1*imageL.width*80/325, imageL.height*209/243.8, 10, f1]);
    // ドーナツの色
    differencesL.push([-1*imageL.width*203/325, imageL.height*113/243.8, 10, f1]);
    // リボンの色
    differencesL.push([-1*imageL.width*228/325, imageL.height*105/243.8, 10, f1]);
    // ネックレスの色1
    differencesL.push([-1*imageL.width*172/325, imageL.height*101/243.8, 10, f1]);
    // ネックレスの色2
    differencesL.push([-1*imageL.width*260/325, imageL.height*165/243.8, 10, f1]);
    // 赤ちゃんの口下
    differencesL.push([-1*imageL.width*217/325, imageL.height*123/243.8, 10, f1]);
    // サンダルの色1
    differencesL.push([-1*imageL.width*255/325, imageL.height*205/243.8, 10, f1]);
    // サンダルの色2
    differencesL.push([-1*imageL.width*274/325, imageL.height*205/243.8, 10, f1]);

    // 右画像
    var imageR = new Object();
    imageR.src = "/images/machigaiSagashi2.png";
    imageR.width = 698;
    imageR.height = 524;
    var differencesR = new Array();
    // 汗
    differencesR.push([imageR.width*85/325, imageR.height*151/243.8, 10, f2]);
    // 青い靴
    differencesR.push([imageR.width*80/325, imageR.height*209/243.8, 10, f2]);
    // ドーナツの色
    differencesR.push([imageR.width*203/325, imageR.height*113/243.8, 10, f2]);
    // リボンの色
    differencesR.push([imageR.width*228/325, imageR.height*105/243.8, 10, f2]);
    // ネックレスの色1
    differencesR.push([imageR.width*172/325, imageR.height*101/243.8, 10, f2]);
    // ネックレスの色2
    differencesR.push([imageR.width*260/325, imageR.height*165/243.8, 10, f2]);
    // 赤ちゃんの口下
    differencesR.push([imageR.width*217/325, imageR.height*123/243.8, 10, f2]);
    // サンダルの色1
    differencesR.push([imageR.width*255/325, imageR.height*205/243.8, 10, f2]);
    // サンダルの色2
    differencesR.push([imageR.width*274/325, imageR.height*205/243.8, 10, f2]);

    // 描画
    var DifferenceScene = function () {
        this.PicLeft = new Picture(0, 0, imageL.src, imageL.width, imageL.height, differencesL);
        this.PicRight = new Picture(centerX, 0, imageR.src, imageR.width, imageR.height, differencesR);

        //console.log(this.PicLeft.src, this.PicLeft.width, this.PicLeft.height);
        //console.log(this.PicRight.src, this.PicRight.width, this.PicRight.height);
        //console.log(this.PicLeft.differences, this.PicRight.differences);   

        this.curtain = new Curtain(false);

        this.timeup = false;
        this.Score = 0;
        setTimeout(function (e) {
        	e.timeup = true;
        }, 20*1000, this);
    };
    DifferenceScene.prototype = {
        update: function () {
            this.layer0();
            this.layer1();
            this.layer2();
        },
        layer0: function () {
        	this.PicLeft.draw(CanvasLayers[0]);
            this.PicRight.draw(CanvasLayers[0]);
        },
        layer1: function () {
        	for (var i = this.PicLeft.differences.length - 1; i >= 0; i--) {
        		this.PicLeft.differences[i].draw(CanvasLayers[2]);
        		this.PicRight.differences[i].draw(CanvasLayers[2]);
    			if (!this.PicLeft.differences[i].visible && this.PicLeft.differences[i].collision() && this.PicRight.differences[i].collision()) {
        			this.PicLeft.differences[i].visible = true;
        			this.PicRight.differences[i].visible = true;

        			this.PicLeft.differences[i].audio.play();
            	}
        	};
        },
        layer2: function () {
        	var tmp = 0;
        	$.each(this.PicLeft.differences, function(index, val) {
        		 if (val.visible)
        		 	tmp++;
        	});
        	this.Score = tmp;

        	if (this.Score < 9 && !this.timeup) {
        		CanvasLayers[2].drawText({
	        		fillStyle: "black",
					fontStyle: "bold",
					fontSize: "24pt",
					x: centerX/SCALE, y: 100/SCALE,
					text: "左右の間違いを指せ！"
	        	});

	        	CanvasLayers[2].drawText({
	        		fillStyle: "black",
					fontStyle: "bold",
					fontSize: "24pt",
					x: centerX/SCALE, y: (canvasH-100)/SCALE,
					text: this.Score + "/9"
	        	});
        	} else {
        		this.curtain.draw(CanvasLayers[2]);
        	}
        }
    };

    var Quiz = function (q, a, image1, image2, c1, c2) {
    	this.question = q;
		this.answer = a;
		this.ImgSrcL = image1;
		this.ImgSrcR = image2;
		this.charL = c1;
		this.charR = c2;

		this.count = 0;
		this.speed = 150;

		this.phases = [
			"Title",
			"Choice",
			"Result1",
			"Result2",
			"End"
		];
		this.results = [
			"Miss",
			"Left",
			"Right"
		];
		this.result = this.results[0];
		this.state = this.phases[0];

		this.left = canvasW*3/8;
		this.right = canvasW*5/8;
    };
    Quiz.prototype = {
    	check: function (fingerX1, fingerX2) {
		    if (fingerX1 < this.left && fingerX2 < this.left) {
				this.result = this.results[1];
		    } else if (fingerX1 > this.right && fingerX2 > this.right) {
				this.result = this.results[2];
		    } else {
				this.result = this.results[0];
		    }
    	},
    	draw: function () {
    		switch (this.state) {
    			case this.phases[0]:
    				// 質問
	    			CanvasLayers[2].drawText({
					    fillStyle: "#ff0",
					    strokeStyle: "#ffa500",
					    strokeWidth: 2,
					    x: centerX/SCALE, y: centerY/SCALE,
					    fontSize: this.count,
					    text: this.question
					});
    				break;
    			case this.phases[1]:
    				// 左側 背景
					CanvasLayers[0].drawRect({
					    fillStyle: "#afeeee",
					    x: 0, y: 0,
					    width: this.left/SCALE,
					    height: canvasH/SCALE,
					    fromCenter: false
					});
					// 左側 文字
					CanvasLayers[0].drawText({
						fillStyle: "black",
						strokeStyle: "black",
						strokeWidth: 1,
						x: canvasW*3/16/SCALE, y: canvasH/6/SCALE,
						fontSize: 36,
						text: this.charL
					});
					// 左側 画像
					CanvasLayers[1].drawImage({
					    source: this.ImgSrcL,
					    x: 0, y: canvasH*3/8/SCALE,
					    width: this.left/SCALE,
					    height: canvasH*7/12/SCALE,
					    fromCenter: false
					});

					// 右側 背景
					CanvasLayers[0].drawRect({
					    fillStyle: "#ffc0cb",
					    x: this.right/SCALE, y: 0,
					    width: centerX/SCALE,
					    height: canvasH/SCALE,
					    fromCenter: false
					});
					// 右側 文字
					CanvasLayers[0].drawText({
					    fillStyle: "black",
					    strokeStyle: "black",
					    strokeWidth: 1,
					    x: canvasW*13/16/SCALE, y: canvasH/6/SCALE,
					    fontSize: 36,
					    text: this.charR
					});
					// 右側 画像
					CanvasLayers[1].drawImage({
					    source: this.ImgSrcR,
					    x: this.right/SCALE, y: canvasH*3/8/SCALE,
					    width: this.left/SCALE,
					    height: canvasH*7/12/SCALE,
					    fromCenter: false
					});

					// タイマー
					CanvasLayers[2].drawText({
						fillStyle: this.count<=500 ? "black" : "red",
						strokeStyle: this.count<+500 ? "black" : "red",
						strokeWidth: 1,
						x: centerX/SCALE, y: canvasH/3/SCALE,
						fontSize: 150,
						text: Math.floor(((900 - this.count)/100))
				    });
    				break;
    			case this.phases[2]:
    				// 左側 画像
					CanvasLayers[1].drawImage({
					    source: this.ImgSrcL,
					    x: this.result==this.results[1] ? ((centerX-this.left/2)*this.count/this.speed)/SCALE : 0,
					    y: canvasH*3/8/SCALE,
					    width: this.left/SCALE,
					    height: canvasH*7/12/SCALE,
					    fromCenter: false,
					    opacity: this.result==this.results[1] ? 1 : 1 - (this.count/this.speed)
					});
					// 右側 画像
					CanvasLayers[1].drawImage({
					    source: this.ImgSrcR,
					    x: this.result==this.results[2] ? (this.right - ((this.right-centerX/2)*this.count/this.speed))/SCALE : this.right/SCALE,
					    y: canvasH*3/8/SCALE,
					    width: this.left/SCALE,
					    height: canvasH*7/12/SCALE,
					    fromCenter: false,
					    opacity: this.result==this.results[2] ? 1 : 1 - (this.count/this.speed)
					});
    				break;
    			case this.phases[3]:
	    			// 相性 結果
					CanvasLayers[2].drawText({
						fillStyle: this.result != this.results[0] ? "#ff7f50" : "#4169e1",
						strokeStyle: this.result != this.results[0] ? "#dc143c" : "#191970",
						strokeWidth: 2,
						x: canvasW/2/SCALE, y: canvasH/3/SCALE,
						fontSize: this.count,
						text: this.result != this.results[0] ? "相性ピッタリ！！" : "相性イマイチ..."
				    });
    				break;
    			default:
    				break;
    		}

    	},
		update: function () {
			switch (this.state) {
				case this.phases[0]:
					if (this.count > 100) {
					    this.count = 0;
					    this.state = this.phases[1];
					} else {
						this.elseFunc();
					}
					break;
				case this.phases[1]:
					this.check(f1.x, f2.x);
					if (this.result!=this.results[0] || this.count > 900) {
					    this.count = 0;
					    this.state = this.phases[2];
					} else {
						this.elseFunc();
					}
					break;
				case this.phases[2]:
					if(this.count == this.speed){
					    this.count = 0;
					    this.state = this.phases[3];
					}else{
						this.elseFunc();
					}
					break;
				case this.phases[3]:
					if (this.count == 100) {
						this.count = 0;
						this.state = this.phases[4];
				    } else {
				    	this.elseFunc();
					}
					break;
				default:
					break;
			}
		},
		elseFunc: function () {
			this.draw();
			this.count++;
		}
    };

    var QuizScene = function () {
		this.quizzes = []
		for (i = 0; i < arguments.length; i++) {
    		this.quizzes.push(arguments[i]);
  		}

  		this.Qnum = 0;

  		this.curtain = new Curtain(false);
    };
    QuizScene.prototype = {
    	update: function () {
       		if (this.Qnum < this.quizzes.length) {
	    		if (this.quizzes[this.Qnum].state != "End") {
	    			this.quizzes[this.Qnum].update();
	    		} else {
	    			this.Qnum++;
	    		}
	    	} else {
	    		this.curtain.draw(CanvasLayers[2]);
	    	}
    	}
    };

    var Clock = function () {
		this.x = centerX;
		this.y = centerY + canvasH*1/12;
    };
    Clock.prototype = {
		draw: function (layer, degree) {
		    layer.drawImage({
				source: "/images/tokei.gif",
				x: this.x/SCALE, y: this.y/SCALE,
				width: canvasW*9/16/SCALE,
				height: canvasW*9/16/SCALE
		    });
		    layer.drawLine({
				strokeStyle: "#000",
				strokeWidth: 10,
				x1: this.x/SCALE, y1: this.y/SCALE,
				x2: (canvasW*1/4 * Math.cos(degree*Math.PI/180 - Math.PI/2) + this.x)/SCALE,
				y2: (canvasW*1/4 * Math.sin(degree*Math.PI/180 - Math.PI/2) + this.y)/SCALE
			    });
		    layer.drawLine({
				strokeStyle: "#000",
				strokeWidth: 10,
				x1: this.x/SCALE, y1: this.y/SCALE,
				x2: (canvasW*13/80 * Math.cos(degree*Math.PI/2160 - Math.PI) + this.x)/SCALE,
				y2: (canvasW*13/80 * Math.sin(degree*Math.PI/2160 - Math.PI) + this.y)/SCALE
		    });
		}
    };

    var ClockScene = function () {
		this.time = 0;

		this.count = 0;
		this.degree = 0;

		this.stage = 0;

		this.ClockQuizzes = []
		for (i = 0; i < arguments.length; i++) {
    		this.ClockQuizzes.push(arguments[i]);
  		}

  		this.audio = new Audio("/audio/correct.mp3");
  		this.clock = new Clock();
  		this.curtain = new Curtain(false);
    };
    ClockScene.prototype = {
    	draw: function (layer) {
		    layer.drawText({
				fillStyle: "black",
				strokeStyle: "black",
				strokeWidth: 2,
				x: centerX/SCALE, y: canvasH*7/60/SCALE,
				fontSize: 60,
				text: this.stage < this.ClockQuizzes.length ? this.ClockQuizzes[this.stage][0] : ""
		    });
		},
		check: function () {
			if (this.count == this.ClockQuizzes[this.stage][1]) {
				this.audio.play();
				this.stage++;
			}
		},
		update: function () {
			this.time++;
			if (this.time < 1600 && this.stage < this.ClockQuizzes.length) {
				this.check();

				this.draw(CanvasLayers[2]);
				this.clock.draw(CanvasLayers[1], this.degree);
			} else {
				this.curtain.draw(CanvasLayers[2]);
			}
		}

    };

	var quiz1 = new Quiz("どっちが好き？", "OK", "images/dog.jpg", "images/cat.jpg", "犬", "猫");
	var quiz2 = new Quiz("好きなラーメンは？", "OK", "images/kotteri.jpg", "images/assari.jpg", "こってり", "あっさり");
	var quiz3 = new Quiz("週末は？", "OK", "images/indoor.jpg", "images/outdoor.jpg", "インドア", "アウトドア");
    var quiz4 = new Quiz("消したい過去が…", "OK", "images/yes.jpg", "images/no.jpeg", "ある", "ない");
    var quiz5 = new Quiz("付き合うなら？", "OK", "images/ue.jpg", "images/sita.jpg", "年上", "年下");
    var q1Scene = new QuizScene(quiz1, quiz2);
    var q2Scene = new QuizScene(quiz3, quiz4, quiz5);

    var cScene = new ClockScene(["9:30", 180], ["10:45", 630], ["8:23", -224]);

    var dScene = new DifferenceScene();
    var tScene = new TitleScene();

	// Laep Motion
	Leap.loop({enableGestures: true}, function (frame) {
		if (frame.hands.length >= 2 && frame.fingers[0] && frame.fingers[1]) {
			f1.x = centerX + ~~frame.fingers[0].tipPosition[0];
			f1.y = canvasH - ~~frame.fingers[0].tipPosition[1];
            f2.x = centerX + ~~frame.fingers[1].tipPosition[0];
            f2.y = canvasH - ~~frame.fingers[1].tipPosition[1];
		}

		if (frame.gestures.length > 0 && frame.gestures[0].type == "circle") {
			if (frame.gestures[0].normal[2] < 0) {
			    cScene.degree += 2;
			    cScene.count += 2;
			}else{
			    cScene.degree -= 2;
			    cScene.count -= 2;
			}
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
                dScene.update();
				break;
			case Scene[2]:
				// クイズ1
				q1Scene.update();
				break;
			case Scene[3]:
				// ゲーム2
				cScene.update();
				break;
			case Scene[4]:
				// ゲーム3
				CanvasLayers[2].drawText({
				    fillStyle: "black",
				    x: centerX/SCALE, y: centerY/SCALE,
				    fontSize: 50,
				    text: "＞未実装＜"
				});
				break;
			case Scene[5]:
				// クイズ2
				q2Scene.update();
				break;
			case Scene[6]:
				// エンド
				CanvasLayers[2].drawText({
				    fillStyle: "black",
				    x: centerX/SCALE, y: centerY/SCALE,
				    fontSize: 50,
				    text: "End."
				});
				break;
		}

        f1.draw(CanvasLayers[3]);
        f2.draw(CanvasLayers[3]);

        /*
		// fps
		CanvasLayers[3].drawText({
			fillStyle: "black",
			fontStyle: "bold",
			fontSize: "5pt",
			align: "left",
			x: (canvasW)/SCALE*0.1, y: (canvasH/SCALE)*0.1,
			text: "FPS: " + fps.getFPS()
				+ "\nf: " +  ("00"+(f1.x)).slice(-3) + " " + ("00"+(f1.y)).slice(-3)
				+ "\nf: " +  ("00"+(f2.x)).slice(-3) + " " + ("00"+(f2.y)).slice(-3)
		});
		*/

		setTimeout(update, fps.getInterval());
	};

	update();
});

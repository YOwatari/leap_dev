$(function () {
	$canvas = $("canvas");
	$canvas.css({
		border: "1px solid black",
		background: "gray"
	});

	$scale = 1;
	if (window.devicePixelRatio == 2) {
		$canvas.attr({
			width: 800,
			height: 600
		});
		
		$canvas.scaleCanvas({
			scale: 2
		});
		$scale = 2;
	}

	$canvasX = $canvas.width();
	$canvasY = $canvas.height();
	console.log("全体", $canvasX, $canvasY);

	$centerX = $canvasX / 2;
	$centerY = $canvasY / 2;
	console.log("中心",$centerX, $centerY);

	update($centerX, $centerY);

	Leap.loop(function (frame) {
		if (frame.fingers[0]) {
			$x = frame.fingers[0].tipPosition[0];
			$y = frame.fingers[0].tipPosition[1];

			update(($centerX + $x)/$scale, ($canvasY - $y)/$scale);
		}
	});

	function update (fx, fy) {
		$canvas.clearCanvas();
		
		$canvas.drawText({
			fillStyle: "black",
			fontStyle: "bold",
			fontSize: "30pt",
			x: $centerX/$scale, y: ($centerY-100)/$scale,
			text: "Hello World."
		});

		$canvas.drawText({
			fillStyle: "white",
			fontStyle: "bold",
			fontSize: "15pt",
			x: $centerX/$scale, y: ($centerY+100)/$scale,
			text: "hold your finger"
		});

		$canvas.drawArc({
			strokeStyle: "blue",
			strokeWidth: 3,
			x: $centerX/$scale, y: $centerY/$scale,
			radius: 6,
			scale: $scale
		});
		
		$canvas.drawArc({
			fillStyle: "green",
			x: fx, y: fy,
			radius: 5
		});
	};

});

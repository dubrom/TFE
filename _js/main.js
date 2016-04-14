
	var hexa = [0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F'];

	// var userID;

// LEAP

	var palmPosition;
	var palms = [];

	var leapBorders = [
		x = {
			min: -250,
			max: 250,
			rightMin: 0
		},
		y = {min: 40, max: 400},
		z = {min: -250,max: 250}
	];
	var actionZone = 250;

	var oneOnTwo = 0;

	var current = 6;

// VISUAL

	var r = document.getElementById("right-hand");
	var rCtx = r.getContext("2d");

	var l = document.getElementById("left-hand");
	var lCtx = l.getContext("2d");

	var w = document.getElementById("waves");
	var wCtx = w.getContext("2d");

	var waveformGradient;

	var WIDTH = window.innerWidth;
	var HEIGHT = window.innerHeight;

	var divScreen = 8;

	var visualNote = [];

	var currentColor;

// SOUND
	var notes = ['C','D','E','F','G','A','B'];
	var colors = ['#D32F2F','#F57C00','#FFEB3B','#4CAF50','#039BE5','#3F51B5','#7B1FA2'];
	var colorsHover = ['#FF1744','#FF9800','#FFFF00','#00E676','#00B0FF','#3D5AFE','#D500F9'];

	var nots = ['do','re','mi','fa','sol','la','si'];
	var piano = [];

	var waveform = new Tone.Analyser(1024, "waveform");

	var reverb = new Tone.JCReverb(1,1).connect(waveform);
	var delay = new Tone.FeedbackDelay(0.5); 

	var oscillators = {
		square:{
			synth: new Tone.PolySynth(7,Tone.MonoSynth).fan(waveform).toMaster(),
			type: "square"
		},
		sine:{
			synth: new Tone.PolySynth(7,Tone.MonoSynth).fan(waveform).toMaster(),
			type: "sine"
		},
		triangle:{
			synth: new Tone.PolySynth(7,Tone.MonoSynth).fan(waveform).toMaster(),
			type: "triangle"
		},
		pwm:{
			synth: new Tone.PolySynth(7,Tone.MonoSynth).fan(waveform).toMaster(),
			type: "pwm"
		}
	}


	var currentNote = "C";
	var precNote;

// DATA TO SEND TO OTHERS USERS
	
	var datas = {
		leftHand: {
			palm: {
				// x: 0,
				y: 40
				// z: 0
			}
		},
		rightHand: {
			palm: {
				// x: 0,
				y: 40
				// z: 0
			}
		} 
	}

	var datasY = 0;

// DATAS RECEIVED FROM OTHERS USERS

	var datasToUse;

// FUNCTIONS

	init();
	Leap.loop( {background: true}, leapAnimate ).connect();

	function init(){
		for (var i = 0; i < 7; i++) {
			for (var j = 0; j < notes.length; j++) {
				var note = notes[j]+ (( i % 7) + 1);
				piano.push(note);
			}
		}

		for (var i = 0; i < 7; i++) {
			oscillators.square.synth.voices[i].oscillator.type = oscillators.square.type;
			oscillators.sine.synth.voices[i].oscillator.type = oscillators.sine.type;
			oscillators.triangle.synth.voices[i].oscillator.type = oscillators.triangle.type;
			oscillators.pwm.synth.voices[i].oscillator.type = oscillators.pwm.type;
		}

		setCanvasSize(l,WIDTH/divScreen);
		setCanvasSize(r,(WIDTH/divScreen) * (divScreen - 1));
		setCanvasSize(w,(WIDTH/divScreen) * (divScreen - 1));

		waveformGradient = wCtx.createLinearGradient(0, 0, (WIDTH/divScreen) * (divScreen - 1), HEIGHT);
		waveformGradient.addColorStop(0, "#ddd");
		waveformGradient.addColorStop(1, "#000");

		window.addEventListener( 'resize', onWindowResize, false );
	}

	function onWindowResize() {
		WIDTH = window.innerWidth;
		HEIGHT = window.innerHeight;

		setCanvasSize(l,WIDTH/divScreen);
		setCanvasSize(r,(WIDTH/divScreen) * (divScreen - 1));
		setCanvasSize(w,(WIDTH/divScreen) * (divScreen - 1));

		waveformGradient = wCtx.createLinearGradient(0, 0, (WIDTH/divScreen) * (divScreen - 1), HEIGHT);
		waveformGradient.addColorStop(0, "#ddd");
		waveformGradient.addColorStop(1, "#000");
	}

	function setCanvasSize(canvas,w){
		canvas.width = w;
		canvas.height = HEIGHT;
	}

	var mmm = 0;
	function leapAnimate(frame){

		lCtx.clearRect(0, 0, WIDTH, HEIGHT);
		rCtx.clearRect(0, 0, WIDTH, HEIGHT);

		// if(mmm <= 100){
		// 	console.log(datasToUse);
		// 	mmm++;
		// }

		for (var i = 0; i < 7; i++) {
			lCtx.beginPath(); 

			if(i == current){ lCtx.globalAlpha = 1; }
			else{ lCtx.globalAlpha = 0.5; }

			lCtx.fillStyle = colors[i];
			lCtx.fillRect(0, HEIGHT - ((HEIGHT / 7) * (i + 1)), l.width, HEIGHT/7);
		}

		for ( var hand of frame.hands ) {

			var palmPosition = hand.palmPosition;

			if(hand.type == 'left'){
				if(leapBorders[1].min <= palmPosition[1] && palmPosition[1] <= leapBorders[1].max  ){

					datas.leftHand.palm.y = palmPosition[1];

					precNote = currentNote;
					current = Math.floor(yOnScale(palmPosition[1],7));
					currentNote = notes[current];
					currentColor = colors[current];
				}
			}

			if(hand.type == 'right'){
				for (var i = 0; i < hand.fingers.length; i++){
					var finger = hand.fingers[i];

					var pos = finger.distal.nextJoint;

					var x = xRightOnScale(pos[0],(WIDTH/divScreen)*(divScreen - 1));
					var y = pos[1];
					var z = xzOnScale(pos[2],HEIGHT);

					if( leapBorders[0].rightMin <= pos[0] && pos[0] <= leapBorders[0].max ){
						if( leapBorders[2].min <= pos[2] && pos[2] <= leapBorders[2].max ){
							addRightFingers(x,y,z);

							// SOUND
					
							// indexFinger
							if(i == 1){
								var self = oscillators.square;
								playOsc(self,pos);
								addVisualNote(x,y,z,oneOnTwo);
							}
							
							// middleFinger
							if(i == 2){
								var self = oscillators.sine;
								playOsc(self,pos);
								addVisualNote(x,y,z,oneOnTwo);
							}
							
							// ringFinger
							if(i == 3){
								var self = oscillators.pwm;
								playOsc(self,pos);
								addVisualNote(x,y,z,oneOnTwo);
							}
						}
					}
				}
			}
		}

		// DRAW THE EVENTUAL NOTES PLAYED
		var splice = 0;

		for (var i = 0; i < visualNote.length; i++) {
			var thisNote = visualNote[i];

			if(thisNote.opacity <= 0){
				splice += 1;
			}else{
				rCtx.globalAlpha = thisNote.opacity;
				rCtx.beginPath();
				rCtx.fillStyle = thisNote.color;
				rCtx.arc(thisNote.posX, thisNote.posY, thisNote.width, 0, 2 * Math.PI);
				rCtx.fill();

				thisNote.width += 1.5;
				thisNote.opacity -= 0.05;
			}
		}
		for (var i = 0; i < splice; i++) { visualNote.shift(); }
		oneOnTwo++;

		if(datasToUse != undefined){
			var nGrey = Math.floor(yOnScale(datasToUse.leftHand.palm.y,17));
			changeBackground(nGrey);
		}

		var waveformValues = waveform.analyse();
		drawWaveform(waveformValues);

		// send the position of the hands to other user
		sendData(datas);
	}

	// add the visual
	function addRightFingers(x,y,z){
		rCtx.globalAlpha = 1;
		rCtx.beginPath();

		if( y <= actionZone){rCtx.fillStyle = "#555555"}
		else{rCtx.fillStyle = "#FFFFFF"}
		
		rCtx.arc(x, z, 10, 0, 2 * Math.PI);
		rCtx.fill();
	}
	// function addLeftPalm(y){
	// 	lCtx.beginPath();
	// 	lCtx.strokeStyle = '#000000'; 
	// 	lCtx.moveTo(0,HEIGHT-y);
	// 	lCtx.lineTo(l.width,HEIGHT-y);
	// 	lCtx.stroke();
	// }

	// playing or stoping osc
	function playOsc(el,pos){
		var notesToPlay = [];
		var notesToEnd = [];
		
		for (var i = 1; i <= 7; i++) {
			var note = currentNote + i;
			var ancNote = precNote + i;
		
			notesToPlay.push(note);
			notesToEnd.push(ancNote);
		}

		if(pos[1] <= actionZone){
			el.synth.triggerRelease(notesToEnd);
			el.synth.triggerAttack(notesToPlay);
		}else{
			el.synth.triggerRelease(notesToEnd);
		}
	}

	function drawWaveform(values){
		//draw the waveform
		var canvasWidth = waves.width;
		var canvasHeight = waves.height;

		wCtx.clearRect(0, 0, canvasWidth, canvasHeight);

		var values = waveform.analyse();
		wCtx.beginPath();
		wCtx.lineJoin = "round";
		wCtx.lineWidth = 6;
		wCtx.strokeStyle = waveformGradient;
		wCtx.moveTo(0, (values[0] / 255) * canvasHeight);

		for (var i = 1, len = values.length; i < len; i++){
			var val = values[i] / 255;
			var x = canvasWidth * (i / len);
			var y = val * canvasHeight;
			wCtx.lineTo(x, y);
		}
		wCtx.stroke();
	}

	function addVisualNote(x,y,z,count){
		if(count%4 == 0){
			if(y <= actionZone){
				var note = {};
				note.width = 10;
				note.posX = x;
				note.posY = z;
				note.color = currentColor;
				note.opacity = 1;
				visualNote.push(note);
			}
		}
	}

	// function to transform x,y,z value in the scale we want
	function xzOnScale(n,scale){
		var number = ((n + 250)/ 500) * scale;
		return number;
	}
	function xRightOnScale(n,scale){
		var number = (n / 250) * scale;
		return number;
	}
	function yOnScale(n,scale){
		var number = ((n - 40)/ 360) * scale;
		return number;
	}

	function changeBackground(n){
		$('#right-hand').css({
			'background': getBackgroundGrey(n)
		});
	}
	function getBackgroundGrey (n){
		var letters = '0123456789ABCDEF'.split('');
	    var color = '#';
	    for (var i = 0; i < 6; i++ ) {
	        color += letters[n];
	    }
	    return color;
	}

	function getRandomColor() {
	    var letters = '0123456789ABCDEF'.split('');
	    var color = '#';
	    for (var i = 0; i < 6; i++ ) {
	        color += letters[Math.floor(Math.random() * 16)];
	    }
	    return color;
	}





	

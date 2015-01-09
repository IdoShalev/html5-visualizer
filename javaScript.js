document.getElementById('audio_box').onchange = function () {
//window.addEventListener("load", initMp3Player, false);
var canvas, ctx, analyser, elapsedFrames=0, particles_array, lights_array, audio;
		var img = new Image();
			img.src = 'Vinyl_Disc_Record_clip_art.svg';

		var hueUtil = {
		    // hue = 0 to 360
		    // Returns 0 to 360
		    shift: function(hue, shift) {
		        hue += shift;
		        if (hue >= 360) {
		            return hue - 360;
		        } else if (hue < 0) {
		            return hue + 360;
		        } else {
		            return hue;
		        }
		    },
		    // hue = -180 to 180
		    // Returns 0 to 360
		    unsigned: function(hue, shift) {
		        if (hue < 0) {
		            return this.shift(hue + 360, shift);
		        } else {
		            return this.shift(hue, shift);
		        }
		    },
		    // hue = 0 to 360
		    // Returns -180 to 180
		    signed: function(hue, sh) {
		        hue = this.shift(hue, sh);
		        if (hue >= 180) {
		            return hue - 360;
		        } else {
		            return hue;
		        }
		    }
		};
$(document).ready(function () {
  if (window.webkitURL) window.URL = window.webkitURL;
	$(function() {
	    var audio_box = $('#audio_box')[0];
	    //when files have been selected
	    $(function() {
	        var files = audio_box.files;
	        for (var i = 0; i < files.length; i++) {
	            var file = files[i];
	            var objectURL = window.URL.createObjectURL(file);
	            //create object url
	            audio = $('<audio />', {
	                src: objectURL,
	                controls: 'controls',
	                preload: 'auto'
	                
	            })[0];
	            document.getElementById('audioBox').appendChild(audio);
	        }
	        initMp3Player();
	        console.log("yay");
	    });
	});

});
		function initMp3Player(){
	    
			document.getElementById('audioBox').appendChild(audio);
			var context =  new AudioContext();
			analyser = context.createAnalyser();
			canvas = document.getElementById('analyser_render');
			ctx = canvas.getContext('2d');

			var source = context.createMediaElementSource(audio);
			source.connect(analyser);
			analyser.connect(context.destination);

			particles_array = [];
			lights_array = [];
			frameLooper();
		}

		function frameLooper(){
			ctx.save();
			window.requestAnimationFrame(frameLooper);
			var fbc_array = new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(fbc_array);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			elapsedFrames++;
			particles();
			updateParticles();
			generateParticles();
			lights();
			updateLights();
			generateLights();
			var recordSpin = elapsedFrames;
			ctx.translate(canvas.width/2,canvas.height/2);
			ctx.rotate(recordSpin*Math.PI/180);
			ctx.scale(3,3);
			ctx.drawImage(img, -32, -32, 64, 64);
			ctx.rotate(-recordSpin*Math.PI/180);
			ctx.rotate((recordSpin/30)*Math.PI/180);
			generatebars(fbc_array);
			//generatebars1(fbc_array);
			ctx.restore();
		}

		function generatebars(fbc_array){
			bars = 300;
			for (var i = 0; i < bars; i++) {
				ctx.save();
				ctx.rotate((i/bars)*(2*Math.PI));
				var x=30;
				var bar_height = ((fbc_array[i] / 2))*(canvas.width+canvas.height);
				var hue = (fbc_array[i]/256)*360;
				hue = hueUtil.unsigned(hueUtil.signed(hue, -240) * 0.35, 240);
				var light = (fbc_array[i]/256)*60;
				ctx.fillStyle = 'hsl('+hue+',100%,'+light+'%)';
				ctx.beginPath();
				
				ctx.fillRect(
				x+((bar_height/(canvas.width*2))*(x/90)),
				0,
				1,
				2);
				
				ctx.restore();
			}
		}

		function particles() {
			for (var i = particles_array.length - 1; i >= 0; i--) {
				ctx.save();
				var p = particles_array[i];
				ctx.beginPath();
				ctx.fillStyle = 'hsla('+p.p_hue+',100%,50%,'+p.alpha+')';
				ctx.translate(p.x,p.y);
				ctx.rotate(Math.PI*3/4);
				ctx.scale(2,2.3);
				ctx.shadowBlur=200;
				ctx.shadowOffsetY=1;
				ctx.shadowColor='hsl('+p.p_hue+',100%,50%)';
				ctx.arc(0,0,25,0,2*Math.PI);
				ctx.fill();
				ctx.restore();
			};
		}

		function updateParticles(){
			for (var i = particles_array.length - 1; i >= 0; i--) {
				var p = particles_array[i];
				p.y--;

				if(p.startup>0){
					p.alpha = (1-p.startup)*0.3;
					p.startup -= 0.01;
				}else{
					p.alpha-=0.0008;
				}

				if(p.y<-60){
					particles_array.splice(i,1);
				}
			};
		}

		function generateParticles(){
			if(elapsedFrames%60 == 0){
				var hue = Math.floor(Math.random()*360);
				hue = hueUtil.unsigned(hueUtil.signed(hue, -240) * 0.4, 230);
				particles_array.push({
					x:Math.floor(Math.random()*canvas.width)+1,
					y:Math.floor(Math.random()*canvas.height)+1,
					p_hue:hue,
					alpha:0,
					startup:1
					//p_rot:Math.random()*Math.PI*2
				});
			}
		}

		function lights(){
			for (var i = lights_array.length - 1; i >= 0; i--) {
				ctx.save();
				var l = lights_array[i];
				ctx.beginPath();
				var grd = ctx.createRadialGradient(0, 0, 0, 0, 0, 500);
				grd.addColorStop(0, "hsla("+l.hue+",100%,50%,"+l.alpha+")");
				grd.addColorStop(1, "transparent");
				ctx.fillStyle = grd;
				ctx.translate(l.x,l.y);
				ctx.fillRect(-1500/2, -1000/2, 1500, 1000);
				ctx.restore();
			};
		}

		function updateLights(){
			for (var i = lights_array.length - 1; i >= 0; i--) {
				var l = lights_array[i];

				if(l.startup>0){
					l.alpha = (1-l.startup)*0.4;
					l.startup -= 0.01;
				}else{
					l.alpha-=0.008;
				}

				if(l.alpha<0){
					lights_array.splice(i,1);
				}
			};
		}

		function generateLights(){
			if(audio.currentTime>3){
				var hue = Math.floor(Math.random()*360);
				if(elapsedFrames%60 == 0){
					lights_array.push({
						x:Math.floor(Math.random()*canvas.width)+1,
						y:Math.floor(Math.random()*canvas.height)+1,
						alpha:0,
						startup:1,
						hue:hue
					});
				}
			}
			
		}
};
const Visualizer = {
    mounted() {
      const canvas = this.el;
      const ctx = canvas.getContext('2d');
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      let audioCtx = null;
      let analyser = null;
      let currentAudio = null;
      let isPlaying = false;
      let visualMode = 'bars';
      
      const drawBars = () => {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        
        for(let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] * 2;
          ctx.fillStyle = `rgb(${barHeight + 100},50,50)`;
          ctx.fillRect(x, canvas.height - barHeight/2, barWidth, barHeight);
          x += barWidth + 1;
        }
      };

      const drawWaveform = () => {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);
        
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgb(0, 255, 0)';
        ctx.beginPath();
        
        const sliceWidth = canvas.width / bufferLength;
        let x = 0;
        
        for(let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = v * canvas.height/2;
          
          if(i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        
        ctx.lineTo(canvas.width, canvas.height/2);
        ctx.stroke();
      };
      
      this.el.addEventListener('click', async () => {
        try {
          if (isPlaying) {
            // Stop current playback
            currentAudio.pause();
            currentAudio.currentTime = 0;
            isPlaying = false;
            return;
          }
  
          // Create AudioContext on first play
          if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
          }
          
          await audioCtx.resume();
          currentAudio = new Audio('/audio/Tataki.mp3');
          const source = audioCtx.createMediaElementSource(currentAudio);
          source.connect(analyser);
          analyser.connect(audioCtx.destination);
          currentAudio.play();
          isPlaying = true;
          draw();
        } catch (err) {
          console.error('Error:', err);
        }
      });
  
      const draw = () => {
        if (!isPlaying) return;
        visualMode === 'bars' ? drawBars() : drawWaveform();
        requestAnimationFrame(draw);
      };

      // Add key press to toggle visualization
      window.addEventListener('keypress', (e) => {
        if (e.key === 'v') {
          visualMode = visualMode === 'bars' ? 'waveform' : 'bars';
        }
      });
    }
  };

  export default Visualizer
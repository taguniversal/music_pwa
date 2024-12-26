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

      const draw = () => {
        if (!isPlaying) return;
        visualMode === 'bars' ? drawBars() : drawWaveform();
        requestAnimationFrame(draw);
      };


      function createBeepSound(context) {
        const sampleRate = 44100;
        const duration = 2.0;       // 2 seconds
        const startFreq = 220;      // Start at A3
        const endFreq = 880;        // Sweep up to A5
        const volume = 0.5;
        
        const arrayBuffer = context.createBuffer(1, sampleRate * duration, sampleRate);
        const channelData = arrayBuffer.getChannelData(0);
        
        for (let i = 0; i < sampleRate * duration; i++) {
          // Calculate frequency at this point in time
          const t = i / sampleRate;
          const freq = startFreq + (endFreq - startFreq) * (t / duration);
          
          // Phase accumulation for smooth frequency change
          const phase = 2 * Math.PI * freq * t;
          
          // Add envelope to avoid clicks
          const envelope = Math.min(1, 10 * t) * Math.min(1, 10 * (duration - t));
          
          channelData[i] = Math.sin(phase) * volume * envelope;
        }
      
        const source = context.createBufferSource();
        source.buffer = arrayBuffer;
        return source;
      }

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

      window.addEventListener('keypress', (e) => {
        if (e.key === 'v') {
          visualMode = visualMode === 'bars' ? 'waveform' : 'bars';
        }
      });

      this.el.addEventListener('click', async () => {
        try {
          console.log("Click detected");
          if (isPlaying) {
            console.log("Stopping audio");
            currentAudio.stop();
            isPlaying = false;
            return;
          }

          console.log("Starting new audio");
          if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            console.log("Created new AudioContext:", audioCtx.state);
          }

          await audioCtx.resume();
          console.log("AudioContext resumed:", audioCtx.state);
          currentAudio = createBeepSound(audioCtx);
          console.log("Created beep sound");
          currentAudio.connect(analyser);
          analyser.connect(audioCtx.destination);
          currentAudio.start();
          console.log("Started audio playback");
          isPlaying = true;
          draw();
        } catch (err) {
          console.error('Error:', err);
        }
      });


    }
};

export default Visualizer
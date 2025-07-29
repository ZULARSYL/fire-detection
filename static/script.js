const video = document.getElementById('videoElem');
const canvas = document.getElementById('canvasElem');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

let ws = null;
let streaming = false;

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();
  } catch (e) {
    alert('Gagal membuka kamera: ' + e.message);
  }
}

function drawImageWithBoxes(b64frame) {
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
  img.src = 'data:image/jpeg;base64,' + b64frame;
}

function connectWebSocket() {
  ws = new WebSocket('ws://' + window.location.host + '/ws');
  ws.onopen = () => {
    console.log('WebSocket connected');
    streaming = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    requestFrame();
  };
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.frame) {
      drawImageWithBoxes(data.frame);
      if (streaming) requestFrame();
    } else if (data.error) {
      console.error('Error:', data.error);
    }
  };
  ws.onclose = () => {
    streaming = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log('WebSocket disconnected');
  };
}

function requestFrame() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send('get_frame');
  }
}

startBtn.onclick = async () => {
  await startCamera();
  connectWebSocket();
};

stopBtn.onclick = () => {
  if (ws) {
    ws.send('stop');
    ws.close();
  }
};

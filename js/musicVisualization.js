// 音乐可视化

let audioContext = null;
let audioSourceNode = null;
let analyser = null;
let animationFrameId = null;

var music_visualize_toggle = getLocalStorageItem("music_visualize_toggle") ?? true;
window.parent.music_visualize_toggle = music_visualize_toggle;


function startVisualization() {
    const musicPlayer = document.getElementById('musicPlayerAudio');

    if (!music_visualize_toggle) {
        disableVisualization();
        return;
    }

    // 检查或创建 AudioContext
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    // 创建音频源节点
    if (!audioSourceNode) {
        audioSourceNode = audioContext.createMediaElementSource(musicPlayer);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        // 连接节点
        audioSourceNode.connect(analyser);
        analyser.connect(audioContext.destination);
    }

    // 启用可视化
    enableVisualization(analyser);
    console.log("开始可视化");
}

function enableVisualization(analyser) {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = document.getElementById('visualizer');
    const canvasCtx = canvas.getContext('2d');

    // 初始化画布大小
    resizeCanvas();

    // 添加窗口大小变化监听器
    window.addEventListener('resize', resizeCanvas);

    function resizeCanvas() {
        // 设置画布实际像素大小为 CSS 尺寸
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    function draw() {
        animationFrameId = requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        // 清除画布
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] * 1.5;
            canvasCtx.fillStyle = `rgba(${barHeight + 100}, 50, 150,0.6)`;
            canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }

    draw();
}

function disableVisualization() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // 移除窗口大小监听器
    try {
        window.removeEventListener('resize', resizeCanvas);
    } catch (error) {
        console.debug("移除窗口大小监听器失败");
    }

    const canvas = document.getElementById('visualizer');
    const canvasCtx = canvas.getContext('2d');
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}
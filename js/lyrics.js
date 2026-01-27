var lyrics_layer = getLocalStorageItem("lyrics_layer") ?? 300;

window.parent.lyrics_layer = lyrics_layer;
// 歌词偏移量
var lyrics_timer = null;

// window.parent.lyrics_timer = lyrics_timer;
// 歌词定时器变量

var lyrics_scroll_time = getLocalStorageItem("lyrics_scroll_time") ?? 450;
window.parent.lyrics_scroll_time = lyrics_scroll_time;
// 自动滚动检测间隔

// 调整的用法
// window.parent.lyrics_scroll_time = xxxx
// setLyrics_interval()
// 或者
// window.parent.lyrics_layer = xxxx
// 就可以了


function setLyrics_interval() {
	console.debug("清除旧定时器:", lyrics_timer);
	clearInterval(lyrics_timer);
	lyrics_timer = null;

	lyrics_timer = setInterval(() => {
		const currentTime = isFinite(audio.currentTime) ? audio.currentTime : 0.1;
		let current_time_ms = Math.floor(Number(currentTime * 1000) + Number(lyrics_layer));

		// 限制时间范围，避免异常值
		current_time_ms = Math.max(0, current_time_ms);

		scrollLyrics(current_time_ms);
	}, lyrics_scroll_time);
	// console.debug("设置新定时器:", lyrics_timer);
}



function removeLyrics_interval() {
	// console.debug("强制清除定时器:", lyrics_timer);
	clearInterval(lyrics_timer);
	lyrics_timer = null;
}

async function loadLyrics(songId) {
	const lyricsContainer = document.getElementById('lyrics');
	const api = window.top.api;
	const lyrics = await api.getLyricsHelper(songId);

	// 清空现有歌词
	lyricsContainer.innerHTML = '';




	// 过滤和处理歌词 (only fitter eng)
	const processedLyrics = lyrics.map(line => {

		// 将中文 ’ 替换为  英文 '
		line.value = line.value.replace(/’/g, "'");

		// 如果歌词包含外文且后面是纯中文翻译，剔除翻译部分
		const match = line.value.match(/^([\x00-\x7F]+)\s+([\u4e00-\u9fa5].*)$/); // 匹配前半部分为外文，后半部分为中文
		if (match) {
			const [_, foreignPart, chinesePart] = match;
			if (/[\u4e00-\u9fa5]/.test(foreignPart)) {
				// 外文中夹杂中文的情况，保留整行
				return line;
			} else {
				// 外文和翻译分开，剔除中文翻译部分
				return { ...line, value: foreignPart.trim() };
			}
		}
		return line; // 其他情况保留原始行
	});

	// 插入歌词
	processedLyrics.forEach(line => {
		const lineElement = document.createElement('div');
		lineElement.classList.add('lyrics-line');

		lineElement.textContent = line.value;

		// let space_list = line.value.split("　");
		// let inj_mix = "";

		// for (const element of space_list) {
		//     inj_mix += element + "<br />";
		// }

		// lineElement.innerHTML = inj_mix; 
		// 插入歌词内容
		lineElement.dataset.start = line.start;
		lyricsContainer.appendChild(lineElement);
	});

	// 计算并设置歌词容器的初始 translateY 偏移量
	const firstLine = lyricsContainer.querySelector('.lyrics-line');
	if (firstLine) {
		firstLine.classList.add('active');
		const containerHeight = lyricsContainer.offsetHeight;
		const firstLineHeight = firstLine.offsetHeight;

		// 通过正数偏移来确保第一个歌词居中显示
		const initialOffset = (firstLine.offsetTop - containerHeight / 2) + firstLineHeight / 2;
		lyricsContainer.style.transform = `translateY(${initialOffset}px)`;
	}

	lastActiveIndex = -1;
	cachedLines = null;
	cachedContainer = null;
	// 迷惑修复
}

// 缓存DOM元素和状态
var lastActiveIndex = -1;
var cachedLines = null;
var cachedContainer = null;

function scrollLyrics(currentTime) {
    const lyricsContainer = document.getElementById('lyrics');
    if (!cachedContainer || cachedContainer !== lyricsContainer) {
        cachedContainer = lyricsContainer;
        cachedLines = lyricsContainer.querySelectorAll('.lyrics-line');
    }

    const lines = cachedLines;
    if (lines.length === 0) return;

    // 新增：检测时间跳变（循环或拖拽进度条）
    let startIndex = 0;
    if (lastActiveIndex >= 0) {
        const lastActiveLine = lines[lastActiveIndex];
        const lastStartTime = parseFloat(lastActiveLine.dataset.start);
        
        // 核心修复：当时间回退时重置检测起点
        if (currentTime < lastStartTime) {
            lastActiveIndex = -1; // 强制重置活动索引
            startIndex = 0;        // 从第一行开始检测
        } else {
            startIndex = Math.max(0, lastActiveIndex - 1);
        }
    }

    // 查找当前歌词行
    let activeLineIndex = -1;
    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        const startTime = parseFloat(line.dataset.start);
        const nextLine = lines[i + 1];
        const endTime = nextLine ? parseFloat(nextLine.dataset.start) : Infinity;

        if (currentTime >= startTime && currentTime < endTime) {
            activeLineIndex = i;
            break;
        }
    }

    // 处理歌曲结束时的情况
    if (activeLineIndex === -1) {
        // 新增：歌曲结束时重置索引
        if (currentTime >= parseFloat(lines[lines.length - 1].dataset.start)) {
            lastActiveIndex = -1;
            return;
        }
        activeLineIndex = lastActiveIndex >= 0 ? lastActiveIndex : 0;
    }

    // 跳过无变化的行
    if (activeLineIndex === lastActiveIndex) return;

	// 更新活动行样式

	// 先清空所有 active，避免出现多个
	lines.forEach(line => line.classList.remove('active'));

	if (lastActiveIndex >= 0 && lastActiveIndex < lines.length) {
		lines[lastActiveIndex].classList.remove('active');
	}
	lines[activeLineIndex].classList.add('active');
	lastActiveIndex = activeLineIndex;

	// 应用模糊效果 - 只更新附近的行
	const visibleRange = 10; // 只模糊附近N行歌词
	const startIdx = Math.max(0, activeLineIndex - visibleRange);
	const endIdx = Math.min(lines.length - 1, activeLineIndex + visibleRange);

	for (let i = startIdx; i <= endIdx; i++) {
		const line = lines[i];
		const distance = Math.abs(i - activeLineIndex);

		if (distance === 0) {
			// 当前行 - 无模糊
			line.style.filter = 'none';
			line.style.opacity = '1';
		} else {
			// 根据距离设置模糊度
			const blurValue = Math.min(0 + distance * 0.8, 6);
			const opacityValue = Math.max(1 - distance * 0.2, 0.02);
			line.style.filter = `blur(${blurValue}px)`;
			line.style.opacity = opacityValue;
		}
	}

	// 使用requestAnimationFrame优化滚动性能
	requestAnimationFrame(() => {
		const activeLine = lines[activeLineIndex];
		const containerHeight = lyricsContainer.offsetHeight;
		const lineOffset = activeLine.offsetTop;
		const lineHeight = activeLine.offsetHeight;

		// 计算居中位置
		const translateY = containerHeight / 2 - lineOffset - lineHeight / 2;
		lyricsContainer.style.transform = `translateY(${translateY}px)`;
	});
}
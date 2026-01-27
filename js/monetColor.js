function monetColorExtraction(imageSrc, callback) {
	// 创建虚拟画布处理图像
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	const img = new Image();
	
	// 处理跨域资源
	img.crossOrigin = 'Anonymous';
	img.src = imageSrc;
	
	img.onload = function() {
	  // 设置画布尺寸
	  canvas.width = img.width;
	  canvas.height = img.height;
	  
	  // 绘制图像到画布
	  ctx.drawImage(img, 0, 0, img.width, img.height);
	  
	  // 获取像素数据
	  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	  const data = imageData.data;
	  
	  // 莫奈风格色彩处理
	  for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		
		// 应用莫奈风格滤镜
		const monetized = applyMonetFilter(r, g, b);
		
		// 更新像素数据
		data[i] = monetized.r;
		data[i + 1] = monetized.g;
		data[i + 2] = monetized.b;
	  }
	  
	  // 创建新图像展示结果
	  ctx.putImageData(imageData, 0, 0);
	  const monetImage = new Image();
	  monetImage.src = canvas.toDataURL('image/png');
	  
	  // 提取主要色板
	  const colorPalette = extractColorPalette(imageData);
	  
	  // 返回处理结果
	  callback({
		original: img,
		monetized: monetImage,
		palette: colorPalette
	  });
	};
  
	// 莫奈风格滤镜算法
	function applyMonetFilter(r, g, b) {
	  // 降低饱和度
	  const avg = (r + g + b) / 3;
	  const desatR = (r * 0.6) + (avg * 0.4);
	  const desatG = (g * 0.6) + (avg * 0.4);
	  const desatB = (b * 0.6) + (avg * 0.4);
	  
	  // 添加蓝色/紫色色调偏移
	  return {
		r: Math.min(255, desatR * 0.9 + desatB * 0.1),
		g: Math.min(255, desatG * 0.95),
		b: Math.min(255, desatB * 0.9 + desatR * 0.1)
	  };
	}
  
	// 提取主要色板
	function extractColorPalette(imageData) {
	  const data = imageData.data;
	  const colorMap = new Map();
	  
	  // 采样像素并计数
	  for (let i = 0; i < data.length; i += 16) {
		const key = `${data[i]},${data[i+1]},${data[i+2]}`;
		colorMap.set(key, (colorMap.get(key) || 0) + 1);
	  }
	  
	  // 按出现频率排序
	  return [...colorMap.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5)
		.map(([color]) => {
		  const [r, g, b] = color.split(',').map(Number);
		  return { r, g, b };
		});
	}
  }
  

// 调用函数处理图片
// monetColorExtraction('your-image.jpg', result => {
// 	console.log('莫奈风格色板:', result.palette);
	
// 	// 在DOM中显示结果
// 	document.body.appendChild(result.original);
// 	document.body.appendChild(result.monetized);
	
// 	// 创建色板展示
// 	result.palette.forEach(color => {
// 	  const swatch = document.createElement('div');
// 	  swatch.style.backgroundColor = `rgb(${color.r},${color.g},${color.b})`;
// 	  swatch.style.width = '50px';
// 	  swatch.style.height = '50px';
// 	  document.body.appendChild(swatch);
// 	});
//   });
  
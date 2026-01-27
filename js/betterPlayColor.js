// /**
//  * 从图片中提取主题色并生成播放页配色方案
//  * @param {string} src - 图片URL
//  * @returns {Promise<Object>} 包含聚焦歌词色和未聚焦歌词色的对象（尽可能让文字显眼）
//  */
// async function extractThemeColors(src) {
// 	// 创建图片元素并加载
// 	const img = new Image();
// 	img.crossOrigin = "Anonymous"; // 处理跨域请求
// 	img.src = src;

// 	// 等待图片加载完成
// 	await new Promise((resolve, reject) => {
// 		img.onload = resolve;
// 		img.onerror = reject;
// 	});

// 	// 创建canvas处理图像
// 	const canvas = document.createElement('canvas');
// 	const ctx = canvas.getContext('2d');
// 	canvas.width = img.width;
// 	canvas.height = img.height;

// 	// 绘制图片到canvas
// 	ctx.drawImage(img, 0, 0);

// 	// 获取图像数据
// 	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
// 	const pixels = imageData.data;

// 	// 分析像素颜色
// 	const colorCount = {};
// 	const sampleStep = 8; // 采样步长（优化性能）

// 	for (let i = 0; i < pixels.length; i += sampleStep * 4) {
// 		const r = pixels[i];
// 		const g = pixels[i + 1];
// 		const b = pixels[i + 2];

// 		// 跳过透明/接近白色的像素
// 		if (pixels[i + 3] < 128 || (r > 240 && g > 240 && b > 240)) continue;

// 		// 颜色分组（减少色阶精度）
// 		const colorKey = `${Math.round(r / 10) * 10},${Math.round(g / 10) * 10},${Math.round(b / 10) * 10}`;
// 		colorCount[colorKey] = (colorCount[colorKey] || 0) + 1;
// 	}

// 	// 找到出现频率最高的颜色
// 	let dominantColor = [0, 0, 0];
// 	let maxCount = 0;

// 	Object.entries(colorCount).forEach(([key, count]) => {
// 		if (count > maxCount) {
// 			maxCount = count;
// 			dominantColor = key.split(',').map(Number);
// 		}
// 	});

// 	// 转换RGB为HSL格式（方便调整）
// 	const [r, g, b] = dominantColor;
// 	const hsl = rgbToHsl(r, g, b);

// 	// 生成播放页配色方案
// 	return {
// 		// 背景色：降低饱和度、提高亮度
// 		backgroundColor: hslToRgb(hsl[0], Math.max(0.1, hsl[1] * 0.4), Math.min(0.95, hsl[2] * 1.5)),

// 		// 聚焦歌词色：深色（高对比度）
// 		focusTextColor: getContrastColor(hsl),

// 		// 未聚焦歌词色：灰色调（降低对比度）
// 		unfocusTextColor: getGrayishColor(hsl)
// 	};
// }

// // RGB转HSL辅助函数
// function rgbToHsl(r, g, b) {
// 	r /= 255; g /= 255; b /= 255;
// 	const max = Math.max(r, g, b), min = Math.min(r, g, b);
// 	let h, s, l = (max + min) / 2;

// 	if (max === min) {
// 		h = s = 0; // 灰色
// 	} else {
// 		const d = max - min;
// 		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
// 		switch (max) {
// 			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
// 			case g: h = (b - r) / d + 2; break;
// 			case b: h = (r - g) / d + 4; break;
// 		}
// 		h = (h * 60) % 360;
// 	}
// 	return [h, s, l];
// }

// // HSL转RGB辅助函数
// function hslToRgb(h, s, l) {
// 	let r, g, b;

// 	if (s === 0) {
// 		r = g = b = l; // 灰色
// 	} else {
// 		const hue2rgb = (p, q, t) => {
// 			if (t < 0) t += 1;
// 			if (t > 1) t -= 1;
// 			if (t < 1 / 6) return p + (q - p) * 6 * t;
// 			if (t < 1 / 2) return q;
// 			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
// 			return p;
// 		};

// 		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
// 		const p = 2 * l - q;
// 		r = hue2rgb(p, q, h / 360 + 1 / 3);
// 		g = hue2rgb(p, q, h / 360);
// 		b = hue2rgb(p, q, h / 360 - 1 / 3);
// 	}

// 	return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
// }

// // 获取高对比度文本颜色
// function getContrastColor(hsl) {
// 	// 根据背景亮度选择白色或黑色
// 	return hsl[2] > 0.6 ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)';
// }

// // 获取未聚焦文本颜色
// function getGrayishColor(hsl) {
// 	// 降低饱和度，调整亮度
// 	const lightness = hsl[2] > 0.7 ? 0.6 : hsl[2] < 0.3 ? 0.4 : hsl[2] * 0.8;
// 	return hslToRgb(hsl[0], hsl[1] * 0.2, lightness);
// }



// 使用示例
//   extractThemeColors('album-cover.jpg')
// 	.then(colors => {
// 	  console.log('背景色:', colors.backgroundColor);
// 	  console.log('聚焦歌词色:', colors.focusTextColor);
// 	  console.log('未聚焦歌词色:', colors.unfocusTextColor);
// 	});

// 设置多个样式属性
// document.getElementById("myElement").style.cssText = "color: green; font-size: 18px;";

// const b_bg_elw = document.getElementsByClassName("bigMusicOverPage")[0]
// const b_ly_lines = document.getElementsByClassName("lyrics-line")
// const b_ly_act_lines = document.getElementsByClassName("")


// /**
//  * 获取文字下方图片的主要颜色并返回对比度优化建议
//  * @param {HTMLElement} textElement - 文字元素
//  * @param {HTMLElement} imageElement - 图片元素（可选，如果不提供则自动检测文字下方的图片）
//  * @returns {string} - 返回一个对比度更高的颜色（十六进制格式）
//  */
// function getContrastOptimizedColor(textElement, imageElement = null) {
//     // 1. 获取文字下方的图片元素
//     const targetImage = imageElement || findImageUnderElement(textElement);
//     if (!targetImage) {
//         console.warn("未找到文字下方的图片元素");
//         return "#ffffff"; // 默认返回白色
//     }

//     // 2. 确保图片已加载
//     if (!targetImage.complete) {
//         console.warn("图片尚未加载完成，结果可能不准确");
//     }

//     // 3. 创建canvas来分析图片颜色
//     const canvas = document.createElement('canvas');
//     const ctx = canvas.getContext('2d');
//     if (!ctx) {
//         console.error("无法获取canvas上下文");
//         return "#ffffff";
//     }

//     // 设置canvas尺寸与图片相同
//     canvas.width = targetImage.naturalWidth || targetImage.width;
//     canvas.height = targetImage.naturalHeight || targetImage.height;

//     // 4. 绘制图片到canvas
//     ctx.drawImage(targetImage, 0, 0, canvas.width, canvas.height);

//     // 5. 获取文字在图片上的位置
//     const textRect = textElement.getBoundingClientRect();
//     const imageRect = targetImage.getBoundingClientRect();
    
//     // 计算文字相对于图片的位置
//     const x = textRect.left - imageRect.left;
//     const y = textRect.top - imageRect.top;
//     const width = textRect.width;
//     const height = textRect.height;

//     // 6. 获取文字区域下方的像素数据（向下延伸20像素）
//     const pixelsToCheck = 20;
//     const startY = Math.min(y + height, canvas.height - 1);
//     const endY = Math.min(startY + pixelsToCheck, canvas.height - 1);
    
//     const imageData = ctx.getImageData(
//         Math.max(0, x), 
//         Math.max(0, startY), 
//         Math.min(width, canvas.width - x), 
//         endY - startY
//     );
    
//     // 7. 分析颜色
//     let r = 0, g = 0, b = 0, count = 0;
//     const data = imageData.data;
    
//     for (let i = 0; i < data.length; i += 4) {
//         r += data[i];
//         g += data[i + 1];
//         b += data[i + 2];
//         count++;
//     }
    
//     if (count === 0) {
//         return "#ffffff";
//     }
    
//     // 计算平均颜色
//     r = Math.round(r / count);
//     g = Math.round(g / count);
//     b = Math.round(b / count);
    
//     // 8. 计算亮度 (0-255)
//     const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
//     console.log("亮度=",brightness)
//     // 9. 根据亮度返回对比色
//     if (brightness < 128) {
//         // 背景较暗，返回亮色
//         return getBrightColor(r, g, b);
//     } else {
//         // 背景较亮，返回暗色
//         return getDarkColor(r, g, b);
//     }
// }

// /**
//  * 查找元素下方的图片元素
//  */
// function findImageUnderElement(element) {
//     let current = element;
//     while (current) {
//         const rect = current.getBoundingClientRect();
//         const belowElements = document.elementsFromPoint(
//             rect.left + rect.width / 2, 
//             rect.bottom + 1
//         );
        
//         for (const el of belowElements) {
//             if (el.tagName === 'IMG' && el !== element) {
//                 return el;
//             }
//         }
        
//         current = current.parentElement;
//     }
//     return null;
// }

// /**
//  * 根据背景色返回一个较亮的颜色
//  */
// function getBrightColor(r, g, b) {
//     // 增加亮度，确保与背景有足够对比度
//     const contrastRatio = 4.5; // WCAG AA标准
    
//     // 尝试白色
//     const whiteContrast = getContrastRatio(r, g, b, 255, 255, 255);
//     if (whiteContrast >= contrastRatio) {
//         return "#ffffff";
//     }
    
//     // 尝试浅灰色
//     const lightGrayContrast = getContrastRatio(r, g, b, 200, 200, 200);
//     if (lightGrayContrast >= contrastRatio) {
//         return "#c8c8c8";
//     }
    
//     // 如果都不行，返回与背景色互补的亮色
//     return getComplementaryColor(r, g, b, true);
// }

// /**
//  * 根据背景色返回一个较暗的颜色
//  */
// function getDarkColor(r, g, b) {
//     // 减少亮度，确保与背景有足够对比度
//     const contrastRatio = 4.5; // WCAG AA标准
    
//     // 尝试黑色
//     const blackContrast = getContrastRatio(r, g, b, 0, 0, 0);
//     if (blackContrast >= contrastRatio) {
//         return "#000000";
//     }
    
//     // 尝试深灰色
//     const darkGrayContrast = getContrastRatio(r, g, b, 55, 55, 55);
//     if (darkGrayContrast >= contrastRatio) {
//         return "#373737";
//     }
    
//     // 如果都不行，返回与背景色互补的暗色
//     return getComplementaryColor(r, g, b, false);
// }

// /**
//  * 计算两种颜色的对比度比率
//  */
// function getContrastRatio(r1, g1, b1, r2, g2, b2) {
//     const luminance1 = getLuminance(r1, g1, b1);
//     const luminance2 = getLuminance(r2, g2, b2);
    
//     const lighter = Math.max(luminance1, luminance2);
//     const darker = Math.min(luminance1, luminance2);
    
//     return (lighter + 0.05) / (darker + 0.05);
// }

// /**
//  * 计算颜色的相对亮度
//  */
// function getLuminance(r, g, b) {
//     const a = [r, g, b].map(v => {
//         v /= 255;
//         return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
//     });
//     return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
// }

// /**
//  * 获取互补色
//  */
// function getComplementaryColor(r, g, b, light) {
//     // 转换为HSL色彩空间更容易计算互补色
//     let [h, s, l] = rgbToHsl(r, g, b);
    
//     // 计算互补色（色相旋转180度）
//     h = (h + 180) % 360;
    
//     // 根据需要调整亮度
//     if (light) {
//         l = Math.min(0.9, l + 0.5);
//     } else {
//         l = Math.max(0.1, l - 0.5);
//     }
    
//     // 转换回RGB
//     const [nr, ng, nb] = hslToRgb(h, s, l);
//     return rgbToHex(nr, ng, nb);
// }

// // RGB转HSL
// function rgbToHsl(r, g, b) {
//     r /= 255, g /= 255, b /= 255;
//     const max = Math.max(r, g, b), min = Math.min(r, g, b);
//     let h, s, l = (max + min) / 2;

//     if (max === min) {
//         h = s = 0; // achromatic
//     } else {
//         const d = max - min;
//         s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
//         switch (max) {
//             case r: h = (g - b) / d + (g < b ? 6 : 0); break;
//             case g: h = (b - r) / d + 2; break;
//             case b: h = (r - g) / d + 4; break;
//         }
//         h /= 6;
//     }

//     return [h * 360, s, l];
// }

// // HSL转RGB
// function hslToRgb(h, s, l) {
//     h /= 360;
//     let r, g, b;

//     if (s === 0) {
//         r = g = b = l; // achromatic
//     } else {
//         const hue2rgb = (p, q, t) => {
//             if (t < 0) t += 1;
//             if (t > 1) t -= 1;
//             if (t < 1/6) return p + (q - p) * 6 * t;
//             if (t < 1/2) return q;
//             if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
//             return p;
//         };

//         const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
//         const p = 2 * l - q;
//         r = hue2rgb(p, q, h + 1/3);
//         g = hue2rgb(p, q, h);
//         b = hue2rgb(p, q, h - 1/3);
//     }

//     return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
// }

// // RGB转十六进制
// function rgbToHex(r, g, b) {
//     return "#" + [r, g, b].map(x => {
//         const hex = x.toString(16);
//         return hex.length === 1 ? "0" + hex : hex;
//     }).join("");
// }

/**
 * 从图片中提取主题色并生成播放页配色方案
 * @param {string} src - 图片URL
 * @returns {Promise<Object>} 包含聚焦歌词色和未聚焦歌词色的对象
 */
function generateLyricColors(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // 处理跨域图片
      
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置canvas尺寸（使用缩小尺寸加速处理）
        const scale = 0.2;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // 绘制图片到canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // 获取像素数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        // 分析主要颜色（简化版中位切分算法）
        const colorCount = {};
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];
          
          // 跳过透明像素
          if (a < 128) continue;
          
          const colorKey = `${r},${g},${b}`;
          colorCount[colorKey] = (colorCount[colorKey] || 0) + 1;
        }
        
        // 找出出现频率最高的颜色作为主题色
        let maxCount = 0;
        let dominantColor = [0, 0, 0];
        for (const [color, count] of Object.entries(colorCount)) {
          if (count > maxCount) {
            maxCount = count;
            dominantColor = color.split(',').map(Number);
          }
        }
        
        // 生成高对比度歌词配色
        const [r, g, b] = dominantColor;
        const { focused, unfocused } = generateContrastColors(r, g, b);
        
        resolve({
          focusedLyricColor: focused,
          unfocusedLyricColor: unfocused
        });
      };
      
      img.onerror = reject;
      img.src = src;
    });
  }
  
  /**
   * 根据主题色生成高对比度文字配色
   * @param {number} r - 红色通道 (0-255)
   * @param {number} g - 绿色通道 (0-255)
   * @param {number} b - 蓝色通道 (0-255)
   * @returns {Object} 包含聚焦色和未聚焦色的对象
   */
  function generateContrastColors(r, g, b) {
    // 计算主题色亮度（WCAG标准）
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    // 根据亮度选择最佳对比色（亮背景用深色，暗背景用浅色）
    const focusedColor = luminance > 128 ? [0, 0, 0] : [255, 255, 255];
    
    // 创建未聚焦色（降低对比度）
    const unfocusedColor = luminance > 128 ? 
      `rgba(0, 0, 0, 0.7)` : // 深色半透明
      `rgba(255, 255, 255, 0.7)`; // 浅色半透明
    
    return {
      focused: `rgb(${focusedColor.join(',')})`,
      unfocused: unfocusedColor
    };
  }
  
  // 使用示例
//   generateLyricColors('https://example.com/album-cover.jpg')
//     .then(colors => {
//       console.log('聚焦歌词色:', colors.focusedLyricColor);
//       console.log('未聚焦歌词色:', colors.unfocusedLyricColor);
//     })
//     .catch(console.error);
  



var play_colors_catch = null;

function change_bigPlayer_main_color(cover_src) {
	// console.log("run this shit?")
	// console.debug("src==", cover_src)


    generateLyricColors(cover_src)
    .then(colors => {

        while (document.styleSheets[7].cssRules.length !== 0) {
            document.styleSheets[7].deleteRule(0);
        }
        // 不是 还会自动前移 可能是我大半夜脑子昏了吧..
        
        document.styleSheets[7].insertRule(`.bmBackGroundCover  {background-image: url("${cover_src}");}`)
        

      console.log('聚焦歌词色:', colors.focusedLyricColor);
      console.log('未聚焦歌词色:', colors.unfocusedLyricColor);

        // document.styleSheets[7].insertRule(`.lyrics-line {color: ${colors.unfocusedLyricColor};}`)
		// document.styleSheets[7].insertRule(`.lyrics-line.active {color: ${colors.focusedLyricColor};}`)
        
        // document.styleSheets[7].insertRule(`.progress_time {color: ${colors.focusedLyricColor};}`)
		// document.styleSheets[7].insertRule(`.bigMusicProgress_current_time progress_time {color: ${colors.focusedLyricColor};}`)
		// document.styleSheets[7].insertRule(`.musicInfo > span:first-child {color: ${colors.focusedLyricColor};}`)
		// document.styleSheets[7].insertRule(`.musicInfo > span:last-child {color: ${colors.unfocusedLyricColor};}`)
	

    }).catch(console.error);
    

	return;



	extractThemeColors(cover_src).then(colors => {
		// console.log("color_list", colors)
		// console.log("wtf length",document.styleSheets[7].cssRules.length)

		})

}
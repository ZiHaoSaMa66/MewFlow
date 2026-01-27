

const musicLists = document.querySelector('.musicLists');

let touchTimer = null; // 定时器用于检测长按
let touchStartX = 0, touchStartY = 0; // 起始触摸点
let menuVisible = false; // 标志是否已显示菜单

// 桌面端右键菜单
musicLists.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    handleContextMenu(event);
});

// 手机端长按触发右键菜单
musicLists.addEventListener('touchstart', (event) => {
    const target = event.target.closest('.musicListItem');
    if (!target) return;

    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;

    touchTimer = setTimeout(() => {
        menuVisible = true; // 标志菜单已显示
        const fakeEvent = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: touch.clientX,
            clientY: touch.clientY,
        });
        target.dispatchEvent(fakeEvent);
    }, 500); // 500ms 长按时间阈值
});

musicLists.addEventListener('touchend', () => {
    clearTimeout(touchTimer); // 取消长按计时器
    setTimeout(() => (menuVisible = false), 300); // 延迟清理，防止冲突
});

musicLists.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartX);
    const deltaY = Math.abs(touch.clientY - touchStartY);

    // 如果手指移动，取消长按触发
    if (deltaX > 10 || deltaY > 10) {
        clearTimeout(touchTimer);
    }
});

function handleContextMenu(event) {
    const target = event.target.closest('.musicListItem');
    if (!target) return;

    event.preventDefault();

    // 清理现有菜单
    const existingMenu = document.querySelector('.contextMenu');
    if (existingMenu) {
        document.body.removeChild(existingMenu);
    }

    // 创建新菜单
    const contextMenu = document.createElement('div');
    contextMenu.className = 'contextMenu';
    contextMenu.innerHTML = `
        <div class="menuItem" data-action="addToEnd">添加到播放列表末尾</div>
        <div class="menuItem" data-action="addNext">添加到下一首</div>
        <div class="menuItem" data-action="replaceCurrent">替换当前播放</div>
    `;
    document.body.appendChild(contextMenu);

    // 定位菜单
    const { clientX: mouseX, clientY: mouseY } = event;
    const { innerWidth: windowWidth, innerHeight: windowHeight } = window;

    const menuWidth = 150; // 假设菜单宽度
    const menuHeight = 100; // 假设菜单高度
    const adjustedX = (mouseX + menuWidth > windowWidth) ? (windowWidth - menuWidth) : mouseX;
    const adjustedY = (mouseY + menuHeight > windowHeight) ? (windowHeight - menuHeight) : mouseY;

    contextMenu.style.top = `${adjustedY}px`;
    contextMenu.style.left = `${adjustedX}px`;

    // 菜单操作
    const handleMenuAction = (menuEvent) => {
        const action = menuEvent.target.dataset.action;


        const musicId = target.dataset.musicId;
        const musicTitle = target.querySelector('.musicInfo span:first-child').textContent;
        const musicArtist = target.querySelector('.musicInfo .musics_artist').textContent;
        const coverUrl = target.querySelector('img').src;


        if (action) {
            console.debug(`触发菜单动作: ${action}`);

            if (action === "addToEnd") {
                parent.playList.push({ musicId, musicTitle, musicArtist, CoverUrl: coverUrl });
                parent.showNotification("已添加到播放列表末尾", 'success', 1500);
            } else if (action === "addNext") {
                parent.playList.splice(parent.currentIndex + 1, 0, { musicId, musicTitle, musicArtist, CoverUrl: coverUrl });
                parent.showNotification("已添加到下一首", 'success', 1500);
            } else if (action === "replaceCurrent") {
                currentIndex = parent.playList.findIndex(item => item.musicId === musicId);
                if (currentIndex === -1) {
                    parent.playList.unshift({ musicId, musicTitle, musicArtist, CoverUrl: coverUrl });
                    currentIndex = 0;
                }
                parent.playMusic_with_infos(musicId, musicTitle, musicArtist, coverUrl);
                parent.showNotification("已替换当前播放", 'success', 1500);
            }

        }
        document.body.removeChild(contextMenu);
        window.removeEventListener('click', closeContextMenu);
    };

    // 菜单关闭
    const closeContextMenu = () => {
        if (document.body.contains(contextMenu)) {
            document.body.removeChild(contextMenu);
        }
        window.removeEventListener('click', closeContextMenu);
    };

    contextMenu.addEventListener('click', handleMenuAction);
    window.addEventListener('click', closeContextMenu);
}

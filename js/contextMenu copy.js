const musicLists = document.querySelector('.musicLists');
musicLists.addEventListener('contextmenu', (event) => {
    const target = event.target.closest('.musicListItem');
    if (target) {
        event.preventDefault();
        console.debug("右键菜单被触发");

        // 检查是否已有其他菜单
        const existingMenu = document.querySelector('.contextMenu');
        if (existingMenu) {
            document.body.removeChild(existingMenu);
        }

        const contextMenu = document.createElement('div');
        contextMenu.className = 'contextMenu';
        contextMenu.innerHTML = `
                <div class="menuItem" data-action="addToEnd">添加到播放列表末尾</div>
                <div class="menuItem" data-action="addNext">添加到下一首</div>
                <div class="menuItem" data-action="replaceCurrent">替换当前播放</div>
            `;
        document.body.appendChild(contextMenu);

        const { clientX: mouseX, clientY: mouseY } = event;
        const { innerWidth: windowWidth, innerHeight: windowHeight } = window;

        // 检查菜单是否超出视窗
        const menuWidth = 150; // 假设菜单宽度
        const menuHeight = 100; // 假设菜单高度
        const adjustedX = (mouseX + menuWidth > windowWidth) ? (windowWidth - menuWidth) : mouseX;
        let adjustedY;

        // 如果菜单高度超出视窗底部，向上展示菜单
        if (mouseY + menuHeight > windowHeight) {
            adjustedY = Math.max(0, mouseY - menuHeight); // 向上显示并确保不会超出顶部
        } else {
            adjustedY = mouseY;
        }

        contextMenu.style.top = `${adjustedY}px`;
        contextMenu.style.left = `${adjustedX}px`;

        const handleMenuAction = (menuEvent) => {
            const action = menuEvent.target.dataset.action;
            const musicId = target.dataset.musicId;
            const musicTitle = target.querySelector('.musicInfo span:first-child').textContent;
            const musicArtist = target.querySelector('.musicInfo span:last-child').textContent;
            const coverUrl = target.querySelector('img').src;

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

            document.body.removeChild(contextMenu);
            window.removeEventListener('click', closeContextMenu);
        };

        const closeContextMenu = () => {
            if (document.body.contains(contextMenu)) {
                document.body.removeChild(contextMenu);
            }
            window.removeEventListener('click', closeContextMenu);
        };

        contextMenu.addEventListener('click', handleMenuAction);
        window.addEventListener('click', closeContextMenu);
    }
});

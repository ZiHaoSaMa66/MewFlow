function navigateTo(targetPage) {
    if (parent && typeof parent.changeIframeSrc === 'function') {
        parent.changeIframeSrc(targetPage); // 调用主页面中的函数
    } else {
        console.error("无法访问主页面函数！");
    }
}

function navTo(targetPage){
    navigateTo(targetPage);
}

function openSubPage(trgPage){
    window.parent.showSubPage(trgPage)
}

function showNotification(message, level = 'info', duration = 3000) {
    const container = window.top.document.getElementById('notification-container');

    if (!container) {
        console.error('Notification container not found!');
        return;  // 如果没有找到容器，就退出函数
    }

    // 创建通知元素
    const notification = document.createElement('div');

    level = "notification-" + level;

    notification.classList.add('notification', level);
    notification.innerText = message;

    // 倒计时条
    const progressBar = document.createElement('div');
    progressBar.classList.add('notification-progress-bar');
    notification.appendChild(progressBar);

    // 添加通知到容器
    container.appendChild(notification);

    // 进入动画
    setTimeout(() => {
        notification.classList.add('notification-show');
    }, 100);

    // 倒计时动画
    progressBar.style.transition = `width ${duration}ms linear`;
    setTimeout(() => {
        progressBar.style.width = '0%';
    }, 100);

    // 自动关闭
    setTimeout(() => {
        notification.classList.remove('notification-show');
        notification.classList.add('notification-hide');
        setTimeout(() => {
            container.removeChild(notification);
        }, 300); // 等待退出动画结束后移除通知
    }, duration);
}


function setLocalStorageItem(key, value) {
    localStorage.setItem(key, value);
}

function getLocalStorageItem(key) {
    return localStorage.getItem(key);    
}

function removeLocalStorageItem(key) {
    localStorage.removeItem(key);
}

function clearLocalStorage() {
    localStorage.clear();
}


function changeTitle(title) {
    document.title = title;
}

document.addEventListener("keydown", function(event) {

// 如果鼠标焦点处于输入框，则忽略按键事件
    if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
        return;
    }

    // 判断按下的键
    switch (event.key) {
        case " ":
            event.preventDefault(); 
            // 防止页面滚动（空格键默认行为）
            window.parent.togglePlayMusic();
            break;
        case "m":
            window.parent.switch_play_que_mode();
            break;
        case "M":
            window.parent.switch_play_que_mode();
            break;

        case "p":
            window.parent.togglePlayMusic();
            break;
        case "P":
            window.parent.togglePlayMusic();
            break;
        case "[":
            window.parent.prevMusic();
            break;
        case "]":
            window.parent.nextMusic();
            break;
        case "【":
            window.parent.prevMusic();
            break;
        case "】":
            window.parent.nextMusic();
            break;

        default:
            // 其他按键可以忽略
            break;
    }
});



function load_theme() {
    let html = document.documentElement;
    // html.classList.remove("dark-theme","red-theme")

    const sel_theme = getLocalStorageItem("select-theme") 
    console.log("try set theme = "+sel_theme)
    html.classList.remove("red-theme","dark-theme")
    if (sel_theme != null){
        const mix = `${sel_theme}-theme`
        html.classList.add(mix)
    }

}

load_theme()
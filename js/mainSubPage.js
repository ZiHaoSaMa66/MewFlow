var subPageIframe = document.getElementById("subIframe");
var subMainBlock = document.getElementsByClassName("subIframeApp")[0]

function showSubPage(pageRoute) {
    subPageIframe.src = pageRoute;

    // 添加一点动画效果
    subMainBlock.style.opacity = 0;
    setTimeout(function() {
        subMainBlock.style.opacity = 1;
    }, 100);

    subMainBlock.style.display = "flex";
}

function closeSubIframe() {

    subMainBlock.style.transition = "opacity 0.1s ease"; // 添加过渡效果
    subMainBlock.style.opacity = 0;

    setTimeout(function() {
        subPageIframe.src = "about:blank";
        subMainBlock.style.display = "none";
    }, 100); 
}


window.parent.showSubPage = showSubPage;
window.parent.closeSubIframe = closeSubIframe;


var temp_iframe_url = "";

function openBlockOverPage(titleName, iframe_url) {
    const blockOverPage = document.getElementsByClassName("blockOverPage")[0];

    document.getElementsByClassName("blockOverPage_title")[0].innerHTML = titleName || "";

    if (iframe_url!== temp_iframe_url){
        document.getElementById("blockOverIframe").src = iframe_url || "";
        temp_iframe_url = iframe_url;
    }


    // 移除关闭动画，确保重新触发打开动画
    blockOverPage.classList.remove("fadeOut");
    blockOverPage.style.display = "flex";
    
    // 触发弹出动画
    setTimeout(() => {
        blockOverPage.classList.add("fadeIn");
    }, 10); // 小延迟触发动画
}

function closeBlockOverPage() {
    const blockOverPage = document.getElementsByClassName("blockOverPage")[0];

    // 替换为关闭动画
    blockOverPage.classList.remove("fadeIn");
    blockOverPage.classList.add("fadeOut");

    // 动画结束后隐藏元素
    blockOverPage.addEventListener("animationend", function handler() {
        blockOverPage.style.display = "none";
        blockOverPage.classList.remove("fadeOut");
        blockOverPage.removeEventListener("animationend", handler);
    });
}

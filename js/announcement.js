document.addEventListener('DOMContentLoaded', function() {

    // showNotification("Welcome back!","success",3000);
    showNotification("MewFlow v0.5.8-B","success",3500);
    
    // changeLog
    // 0.5.6-A
    // html lang=en -> zh-cn
    // -B
    // 顶栏在切换页面的时候不重载
    // 基础版的歌词自动模糊(有点影响性能
    // 搞了个自动取色
    // -C
    // dsR1改进了一下模糊算法的性能问题
    // 手动修复了一个神秘的只滚动第一首的问题
    // 修复循环播放时歌词卡死在最后的问题
    // -D
    // 加了个自动取主题色
    // 修复插入css删不干净样式的问题
    // 删掉自动取色 换成封面贴在后面
    // -E
    // 尝试改进自动文字颜色 （去掉了）
    // 改进了歌词动画
    // 感觉不如白色
    // -F
    // 改了播放页结构
    // -G
    // 添加无限播放模式

    // 0.5.7
    // 修复无限模式已知问题

    // -A
    // 直接访问index.html时检测api是否未定义并自动重定向至main.html
    // -B
    // 修改项目结构
    // 0.5.8
    // 添加一起听功能
    // 修复重复打开同一页面会重置窗口内嵌页面
    // 改进请求歌曲的播放加载性能
    // 修复当提交新歌曲请求时自己会因为广播而再次播放

    // 0.5.8-A
    // 修了歌词行会出现多个Active的歌词的问题
    // -B
    // 一个登录页文字颜色问题

    setTimeout(function(){

        // load_playList();

    }, 3500);

});
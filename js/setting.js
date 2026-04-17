// 歌词设置

function save_lyrics_setting(){
    let lyric_delay = document.getElementById("lyric-delay-control").value;
    let duration = document.getElementById("lyric-duration-control").value;
    // 检测是否合法
    if(isNaN(lyric_delay) || isNaN(duration)){
        parent.showNotification("歌词设置项目有误", "error",2300);
        return;
    }
    window.parent.lyrics_layer = Number(lyric_delay)
    window.parent.lyrics_scroll_time = Number(duration)
    parent.setLyrics_interval();

    parent.setLocalStorageItem("lyrics_layer", Number(lyric_delay))
    parent.setLocalStorageItem("lyrics_scroll_time", Number(duration))

}
function load_lyrics_setting(){
    let lyric_delay = window.parent.lyrics_layer
    let duration = window.parent.lyrics_scroll_time
    document.getElementById("lyric-delay-control").value = lyric_delay
    document.getElementById("lyric-duration-control").value = duration
}

// 播放设置
function save_play_setting(){
    window.parent.musicPlayerAudio.volume = document.getElementById("volume-control").value / 100;
    // 获取SELECT元素的值
    let select_value = document.getElementById("audio-load-mode").value;
    window.parent.music_load_mode = select_value;
    parent.setLocalStorageItem("music_load_mode", select_value)
    // parent.showNotification("播放设置保存成功", "success",2000);

    // 获取checkbox元素的值
    let checkbox_value = document.getElementById("music_visualize_toggle").checked;
    window.parent.music_visualize_toggle = checkbox_value;
    parent.setLocalStorageItem("music_visualize_toggle", checkbox_value)

}

function load_play_setting(){
    document.getElementById("volume-control").value = window.parent.musicPlayerAudio.volume * 100;
    let select_value = window.parent.music_load_mode == "full" ? "default" : window.parent.music_load_mode;
    // 老版本兼容
    document.getElementById("audio-load-mode").value = select_value;
    document.getElementById("music_visualize_toggle").checked = window.parent.music_visualize_toggle

}


document.getElementById('volume-control').addEventListener('change', function() {
    window.parent.musicPlayerAudio.volume = document.getElementById("volume-control").value / 100;
});

// 外观设置
function save_style_setting(){
    let cover_block_sizes = document.getElementById("block-how-many-size-cover").value;
    window.parent.cover_block_sizes = Number(cover_block_sizes);
    parent.setLocalStorageItem("cover_block_sizes", Number(cover_block_sizes))
    
    let sel_theme = document.getElementById("theme-select").value

    sel_theme != "default" ? parent.setLocalStorageItem("select-theme",sel_theme) : parent.setLocalStorageItem("select-theme",null)

    console.debug("save and apply ing theme...")
    // parent.load_theme()
    load_theme()
    window.top.load_theme()

}

function load_style_setting(){
    let cover_block_sizes = window.parent.cover_block_sizes;
    document.getElementById("block-how-many-size-cover").value = cover_block_sizes;

    let sel_theme = parent.getLocalStorageItem("select-theme")
    // console.log("sel_theme_read="+sel_theme)
    if (sel_theme == '' || sel_theme == null || sel_theme == 'null'){
        sel_theme = "default"
        // console.log("changed!!!")
    }
    document.getElementById("theme-select").value = sel_theme

}

// 初始化所有设置
function init_all_setting(){

    load_style_setting()
    load_lyrics_setting()
    load_play_setting()
}

function save_all_setting(){

    save_style_setting()
    save_lyrics_setting()
    save_play_setting()

    parent.showNotification("设置保存成功", "success",2000);
}


function clear_and_logout() {
    window.removeLocalStorageItem("server_url");
    window.removeLocalStorageItem("username");
    window.removeLocalStorageItem("password");
    window.top.api = null;
    window.api = null;
    parent.navTo('./app_pages/login.html');
}
// 主页面中定义切换 iframe 页面内容的函数
function changeIframeSrc(newSrc) {
    const iframe = document.getElementById('mainIframe');
    if (iframe) {
        // Step 1: 添加隐藏类，触发淡出动画
        iframe.classList.add('hidden');

        // Step 3: 更改 src 后，监听 iframe 加载完成事件
        iframe.onload = () => {
            // 新内容加载完成后，移除隐藏类，触发淡入动画
            iframe.classList.remove('hidden');
        };

        // Step 4: 更改 src
        iframe.src = newSrc;
    }
}



// 主页面控制音乐播放器显示/隐藏的函数
function showMusicPlayer() {
    const musicPlayer = document.getElementsByClassName('musicPlayer')[0];
    if (musicPlayer) {
        musicPlayer.classList.add('show');
    }
    setNegPxToIframe('mainIframe',151);
    setNegPxToIframe('subIframeApp',70.5);

}

function hideMusicPlayer() {
    const musicPlayer = document.getElementsByClassName('musicPlayer')[0];
    if (musicPlayer) {
        musicPlayer.classList.remove('show');
    }
    setNegPxToIframe('mainIframe',81.2);
    // set100vhToIframe('mainIframe');
    // set100vhToIframe("subIframeApp");
}

// 创建观察器实例
const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      const height = entry.contentRect.height;
      console.log('元素高度变化:', height);
      // 你的响应逻辑
      const musicPlayer = document.getElementsByClassName('musicPlayer')[0];
    //   console.log("debug1")
    //   console.log(height)
    //   console.log(musicPlayer.classList.contains("show"))
      if (height < 50 && musicPlayer.classList.contains("show")){
          setNegPxToIframe('mainIframe',131);
          return;
        }
        else if (musicPlayer.classList.contains("show")){
            setNegPxToIframe('mainIframe',151);
            return;
        }
        setNegPxToIframe('mainIframe',81.2);
    }
  });

// 开始观察某个元素
resizeObserver.observe(document.querySelector('.main-header'));

function set100vhToIframe(element_name) {
    const iframe = document.getElementById(element_name);
    if (iframe) {
        iframe.style.height = '100vh';
    }
}

function setNegPxToIframe(element_name,NegNum) {
    const iframe = document.getElementById(element_name);
    if (iframe) {
        iframe.style.height = `calc(100vh - ${NegNum}px)`;
    }
}





cover_block_sizes = getLocalStorageItem('cover_block_sizes') ?? 0;

window.parent.cover_block_sizes = cover_block_sizes;





var MewFlow_catch = {
    "playQueue": [],
};

window.parent.MewFlow_catch = MewFlow_catch;


function dbg(s) {

    (async () => {
        // let res = await window.top.api.getSong("9dadbf457aaacb14a9d801ff2462681e")
        const api = window.top.api;
        // let res = await api.getSongSortList(20, "DESC", "createdAt", 0)

        console.debug('MewFlow - DEBUG');
        // let res = await api.getLyricsBySongId(s)
        let res = await api.getArtist(s)
        console.debug(res);
        console.debug(res.toString());

        // let res = await api.getPlayList(10,"DESC","createdAt",0)
        // // let res = await api.authAndLogin();
        // // console.debug(res);
        // console.debug("getPlayList",res);

        // let res2 = await api.getPlayListInfo("f6ea93f1-43c0-4b72-8d63-54d00134a6b0")
        // console.debug("getPlayListInfo",res2);

        // let res3 = await api.getPlayListSongs("f6ea93f1-43c0-4b72-8d63-54d00134a6b0",10,"DESC","createdAt",0)
        // console.debug("getPlayListSongs",res3);

        // let test = await api.getPlayList(20,"DESC","createdAt",10)
        // console.debug("getPlayList",test);

    })();

}

function lauchDemoMode() {
    setLocalStorageItem("server_url","https://demo.navidrome.org");
    setLocalStorageItem("username","demo");
    setLocalStorageItem("password","demo");
    showNotification("以演示模式启动","info",1500);
    init();
}

function init() {

    const server_url = getLocalStorageItem("server_url");
    const username = getLocalStorageItem("username");
    const password = getLocalStorageItem("password");

    if (!server_url && !username && !password) {
        // alert("请先设置服务器地址、用户名和密码");
        showNotification("无缓存配置,请先配置", 'info', 3000)
        return;
    }


    var api = new NavidromeAPI(server_url, username, password);

    window.api = api;
    window.top.api = api;

    // 将类实例转换为 JSON 字符串并存储到 localStorage 中
    setLocalStorageItem("api", JSON.stringify(api));

    (async () => {

        showNotification("正在尝试连接到服务器...", 'info', 1500)

        const pingRes = await api.ping();
        console.debug(pingRes);
        // pingRes
        if (pingRes.status !== 'ok') {
            showNotification("连接服务器异常", 'error', 1500)
            return;
        }

        const __l = await api.authAndLogin();

        changeIframeSrc('./app_pages/index.html');



    })();

}


// 播放列表及播放模式管理
var playList = [];
var currentIndex = 0;
var playMode = getLocalStorageItem("queue_play_mode") ?? "listLoop"; // 默认模式: 列表循环, 可选: "singleLoop", "listLoop", "listRandom"

var inf_play_mode = false


reflash_play_que_icon();
// 刷新一下

window.parent.inf_play_mode = inf_play_mode;

window.parent.playList = playList;
window.parent.currentIndex = currentIndex;
window.parent.playMode = playMode;

window.top.playList = playList;
window.top.currentIndex = currentIndex;


// 添加歌曲到播放列表
// @param musicId 歌曲 ID
// @param musicTitle 歌曲标题
// @param musicArtist 歌曲艺术家
// @param CoverUrl 歌曲封面 URL
function addMusicToPlayList(musicId, musicTitle, musicArtist, CoverUrl) {
    playList.push({ musicId, musicTitle, musicArtist, CoverUrl });
}


function togglePlayMusic() {
    const musicPlayer = document.getElementById('musicPlayerAudio');
    window.top.tl_enevt_handler.submit_pause(musicPlayer.paused);

    if (musicPlayer.paused) {
        musicPlayer.play();
    } else {
        musicPlayer.pause();
        changeTitle("MewFlow")
    }
}

const mediaSource = new MediaSource();


// 修复方法：支持切换音乐播放时正确加载新音乐
// 播放音乐并更新播放信息
function playMusic_with_infos(musicId, musicTitle, musicArtist, CoverUrl) {
    (async () => {
        const api = window.top.api;
        const tip_show_times = music_load_mode == "block" ? 600 : 800;

        window.top.tl_enevt_handler.submit_new_music_id(musicId)

        showNotification("本喵正在缓冲乐曲流，请稍等喵..", 'info', tip_show_times);

        // 💿 播放列表管理
        if (playList.length === 0) {
            playList.push({ musicId, musicTitle, musicArtist, CoverUrl });
        } else if (playList[currentIndex].musicId !== musicId) {
            playList.splice(currentIndex, 1, { musicId, musicTitle, musicArtist, CoverUrl });
        }

        currentIndex = playList.findIndex(item => item.musicId === musicId);
        if (!check_is_big_music_ui_show()) showMusicPlayer();

        init_queue_ui_list();
        save_playList(true);

        // 🐾 立即加载音乐流（优先）
        const musicStreamUrl = await api.streamUrl(musicId);
        if (music_load_mode === "block") {
            blockFlowLoader(musicStreamUrl);
        } else {
            if (music_load_mode === "full") {
                music_load_mode = "default";
                setLocalStorageItem("music_load_mode", music_load_mode);
            }
            defaultFlowLoader(musicStreamUrl);
        }

        showNotification("正在播放: " + musicTitle, 'success', 2000);
        console.log("Now Playing " + musicTitle);

        // 🖼️ 快速展示基本信息
        let elw = document.getElementsByClassName('musicPlayer_info')[0];
        let cover = document.getElementsByClassName('musicPlayer_cover')[0];
        cover.src = CoverUrl;
        cover.alt = musicTitle;

        elw.innerHTML = `
        <span class="musicPlayer_title">${musicTitle}</span>
        <span class="musicPlayer_artist">${musicArtist}</span>
        `;

        changeTitle("MewFlow - " + musicTitle);

        // ⏳ 懒加载封面图、大封面、歌词、时长，不阻塞播放
        api.getCoverArt(musicId, 400).then(bigCover => {
            update_big_music_ui(musicTitle, musicArtist, bigCover);
        });

        api.getSong(musicId).then(songData => {
            audio.dataset.total_duration = Number(songData.song.duration);
        });

        loadLyrics(musicId).catch(err => {
            console.warn("歌词加载失败喵~", err);
        });

    })();
}

var music_load_mode = getLocalStorageItem("music_load_mode") ?? "default";
// 默认加载模式: 块加载模式 / 完整加载模式, 可选: "block", "default"

window.parent.music_load_mode = music_load_mode;


function defaultFlowLoader(musicStreamUrl) {
    const musicPlayer = document.getElementById('musicPlayerAudio');

    musicPlayer.src = musicStreamUrl;

    musicPlayer.play();

    // startVisualization();
}

function blockFlowLoader(musicStreamUrl) {
    const musicPlayer = document.getElementById('musicPlayerAudio');
    const mediaSource = new MediaSource();

    // 释放之前的 MediaSource 实例，确保新的音乐流可以正常加载
    if (musicPlayer.mediaSourceInstance) {
        try {
            if (musicPlayer.mediaSourceInstance.readyState === 'open') {
                musicPlayer.mediaSourceInstance.endOfStream();
            }
        } catch (err) {
            console.warn('Error ending previous MediaSource stream:', err);
        }
        musicPlayer.mediaSourceInstance.removeEventListener('sourceopen', musicPlayer.sourceOpenHandler);
        musicPlayer.mediaSourceInstance = null;
        musicPlayer.src = '';
    }

    musicPlayer.mediaSourceInstance = mediaSource;
    musicPlayer.src = URL.createObjectURL(mediaSource);

    musicPlayer.sourceOpenHandler = async () => {
        const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
        const response = await fetch(musicStreamUrl);
        const reader = response.body.getReader();

        let queue = [];
        let processing = false;
        let isEnded = false;

        // 处理队列中的数据块
        const processQueue = () => {
            if (queue.length > 0 && !processing && !isEnded) {
                processing = true;
                const data = queue.shift();

                if (!sourceBuffer.updating) {
                    try {
                        // 检查是否需要清理旧的缓冲区
                        const buffered = sourceBuffer.buffered;
                        if (buffered.length > 0) {
                            const currentTime = musicPlayer.currentTime;
                            const removeBefore = buffered.start(0);

                            // 如果缓冲区太大（大于 300 秒），移除早期的部分
                            if (currentTime - removeBefore > 300) {
                                sourceBuffer.remove(removeBefore, currentTime - 10);
                            }
                        }

                        // 附加数据块
                        sourceBuffer.appendBuffer(data);
                    } catch (err) {
                        console.warn('Error appending buffer:', err);
                        queue.unshift(data); // 如果出错，将数据块重新放回队列
                    }
                } else {
                    // 如果 sourceBuffer 正在更新，将数据块重新放回队列
                    queue.unshift(data);
                }
            }
        };

        const handleBufferFull = () => {
            const buffered = sourceBuffer.buffered;
            if (buffered.length > 0) {
                const currentTime = musicPlayer.currentTime;
                musicPlayer.currentTime = Math.max(currentTime, buffered.start(0) + 10);
            }
        };

        // 当操作完成时触发，处理下一个数据块
        sourceBuffer.addEventListener('updateend', () => {
            processing = false;
            processQueue(); // 尝试处理队列
        });

        sourceBuffer.addEventListener('error', (err) => {
            console.warn('SourceBuffer error:', err);
            handleBufferFull();
        });

        // 读取流数据
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                if (!isEnded) {
                    isEnded = true;
                    // 确保 MediaSource 的状态是 'open' 后再调用 endOfStream()
                    if (mediaSource.readyState === 'open') {
                        if (!sourceBuffer.updating) {
                            mediaSource.endOfStream();
                        } else {
                            sourceBuffer.addEventListener('updateend', () => {
                                if (mediaSource.readyState === 'open') {
                                    mediaSource.endOfStream();
                                }
                            }, { once: true });
                        }
                    }
                }
                break;
            }

            // 将数据块分成更小的块
            const chunkSize = 1024 * 100; // 100KB
            for (let i = 0; i < value.byteLength; i += chunkSize) {
                queue.push(value.slice(i, i + chunkSize));
            }

            processQueue(); // 尝试处理队列
        }

    };

    mediaSource.addEventListener('sourceopen', musicPlayer.sourceOpenHandler, { once: true });

    musicPlayer.play();
}



function toggle_inf_play_mode() {
    inf_play_mode = !inf_play_mode;
    let v = inf_play_mode == false ? "禁" : "启"
    showNotification(`无限播放模式已${v}用`,"success",900)
    init_inf_play_mode();
}

function init_inf_play_mode() {
    if (inf_play_mode != true) return false;
    (async () => { 
        var nv = await window.parent.api.getSongSortList(1, "DESC", "random", 0);
        nv = nv[0];
        if (playList.length == 0) {
            playMusic_with_musicId(nv.id)
            return;
        }
        top.playList.splice(parent.currentIndex + 1, 0, { musicId:nv.id,musicTitle:nv.title, musicArtist:nv.artist, CoverUrl: ""});
        remove_this_song_from_queue(parent.currentIndex); 
    })();
    return true;
}


var audio = document.getElementById('musicPlayerAudio');
window.parent.musicPlayerAudio = audio;


audio.addEventListener('ended', () => {
    console.log("结束的判定模式", playMode);


    if (init_inf_play_mode()) return;


    if ((playMode == "listLoop" || playMode == "listRandom") && playList.length > 1) {
        nextMusic();
    } else if (playMode == "singleLoop") {
        // audio.loop = true;
        music_load_mode == "block" ? nextMusic() : audio.play();

    } else {
        showNotification("乐曲都放完了喵", 'info', 1500);
    }
});




function playMusic_with_musicId(musicId) {
    (async () => {
        let song_detail = await api.getSong(musicId); // 仅获取基础信息
        let title = song_detail.song.title;
        let artist = song_detail.song.artist;

        // 提前显示默认封面占位图，懒加载真实封面
        let defaultCover = "./img/def_cover.png";

        playMusic_with_infos(musicId, title, artist, defaultCover);

        // 👇懒加载真实封面（不阻塞播放）
        api.getCoverArt(musicId, 75).then(realCover => {
            playList[currentIndex].CoverUrl = realCover;
            document.getElementsByClassName('musicPlayer_cover')[0].src = realCover;
        });
    })();
}

function pauseMusic() {
    const musicPlayer = document.getElementById('musicPlayerAudio');
    musicPlayer.pause();
}

// 切换到播放列表上一首
function prevMusic() {

    if (init_inf_play_mode()) return;
    if (playList.length === 0) return;

    if (playMode === "listRandom") {

        // 随机模式下，避免选择当前播放的歌曲
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * playList.length);
        } while (newIndex === currentIndex); // 确保随机到的不是当前歌曲的索引

        currentIndex = newIndex;

    } else {
        currentIndex = (currentIndex - 1 + playList.length) % playList.length;
    }

    const { musicId, musicTitle, musicArtist, CoverUrl } = playList[currentIndex];

    // 刷新播放列表 UI
    init_queue_ui_list();

    playMusic_with_infos(musicId, musicTitle, musicArtist, CoverUrl);
}

// 切换到播放列表下一首
function nextMusic() {
    if (init_inf_play_mode()) return;

    if (playList.length === 0) return;

    if (playMode === "listRandom") {
        // 随机模式下，避免选择当前播放的歌曲
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * playList.length);
        } while (newIndex === currentIndex); // 确保随机到的不是当前歌曲的索引

        currentIndex = newIndex;
    } else {
        // 顺序模式下，直接切换到下一个
        currentIndex = (currentIndex + 1) % playList.length;
    }

    // 刷新播放列表 UI
    init_queue_ui_list();

    // 获取新的歌曲信息
    const { musicId, musicTitle, musicArtist, CoverUrl } = playList[currentIndex];
    playMusic_with_infos(musicId, musicTitle, musicArtist, CoverUrl);
}

// 刷新播放列表播放模式 图标
function reflash_play_que_icon() {
    const icon = {
        "singleLoop": "🔂",
        "listLoop": "🔁",
        "listRandom": "🔀"
    }

    const elw = document.getElementsByClassName("que_mode_btn")

    for (let i = 0; i < elw.length; i++) {
        elw[i].innerHTML = icon[playMode];
    }
}

// 切换播放列表模式
function switch_play_que_mode() {
    const modes = ["singleLoop", "listLoop", "listRandom"];
    const currentModeIndex = modes.indexOf(playMode);
    playMode = modes[(currentModeIndex + 1) % modes.length];

    const icon = {
        "singleLoop": "🔂",
        "listLoop": "🔁",
        "listRandom": "🔀"
    }

    const cn_lang = {
        "singleLoop": "单曲循环",
        "listLoop": "列表循环",
        "listRandom": "随机播放"
    }

    let text = cn_lang[playMode];

    showNotification(`播放模式已切换为: ${text}`, 'info', 1500);
    let elw = document.getElementsByClassName("que_mode_btn")

    for (let i = 0; i < elw.length; i++) {
        elw[i].innerHTML = icon[playMode];
    }


    setLocalStorageItem("queue_play_mode", playMode);

    // elw.innerHTML = icon[playMode];

}

var ps_play_emoji = {
    "pause": "⏸",
    "play": "▶",
}

function change_pause_or_play_emoji(change_for){
    const el = document.getElementsByClassName("audio_plays_btn")

    for (let index = 0; index < el.length; index++) {
        const element = el[index];
        element.innerHTML = ps_play_emoji[change_for]
    }

}


// document.addEventListener("DOMContentLoaded", () => {
//     const titleElement = document.getElementsByClassName(".musicPlayer_title")[0];

//     function enableScrolling() {
//         if (titleElement.scrollWidth > titleElement.clientWidth) {
//             titleElement.classList.add("scroll");
//         } else {
//             titleElement.classList.remove("scroll");
//         }
//     }

//     // 初始化时判断
//     enableScrolling();

//     // 在更改标题内容时重新判断
//     const observer = new MutationObserver(() => {
//         enableScrolling();
//     });

//     observer.observe(titleElement, { childList: true, subtree: true });
// });



function save_playList(isSlient = false) {
    let currentIndex = window.parent.currentIndex;
    let playLists = window.parent.playList;

    // copy playList var
    // let fuckJs = []

    // for (let i = 0; i < window.parent.playList.length; i++) {
    //     fuckJs.push(window.parent.playList[i]);
    // }

    // let playLists = fuckJs;

    // playLists.map(item => {
    //     item.CoverUrl = null;
    //     // 标记为过期
    // });

    let playList_json = JSON.stringify(playLists);
    setLocalStorageItem("save_playList", playList_json);
    setLocalStorageItem("save_currentIndex", currentIndex);

    if (!isSlient) {
        showNotification("已保存播放列表", 'info', 1500);
    }

    // showNotification("已保存播放列表", 'info', 1500);

}

function load_playList() {
    let playList_json = getLocalStorageItem("save_playList");
    if (playList_json) {
        let playList = JSON.parse(playList_json);
        window.parent.playList = playList;

        let currentIndex = getLocalStorageItem("save_currentIndex");
        if (currentIndex) {
            window.parent.currentIndex = currentIndex;
        }

        fix_queue_ui_list_img_broken();

        init_queue_ui_list();

        showNotification("已加载上一次的播放列表", 'info', 2000);

        playMusic_with_musicId(playList[currentIndex].musicId);
    }

}
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
    // console.debug("清除旧定时器:", lyrics_timer);
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






document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('musicPlayerAudio');
    const progressBar = document.querySelector('.progress_bar');
    const progressBarFill = document.querySelector('.progress_bar_fill');
    const currentTimeDisplay = document.querySelector('.current_time');
    const totalTimeDisplay = document.querySelector('.total_time');

    const buffer_bar_fill = document.querySelector('.progress_bar_flow_loaded');

    const progress_bar_2 = document.querySelector('.bigMusic_progress_bar');
    const progress_bar_fill_2 = document.querySelector('.bigMusic_progress_bar_fill');
    const current_time_2 = document.querySelector('.bigMusicProgress_current_time');
    const total_time_2 = document.querySelector('.bigMusic_progress_all_time');

    const buffer_bar_fill_2 = document.querySelector('.bigMusic_progress_bar_flow_loaded');

    function updateProgressBar() {
        const currentTime = audio.currentTime || 0;
        const duration = audio.duration == Infinity ? audio.dataset.total_duration : audio.duration;
        // const audio_dataset_duration = audio.dataset.total_duration;
        // 如果 duration 无效（为 Infinity），则取 audio元素的 total_duration 属性


        // 设置总时间
        totalTimeDisplay.textContent = formatTime(duration);
        total_time_2.textContent = formatTime(duration);

        // 更新当前时间
        currentTimeDisplay.textContent = formatTime(currentTime);
        current_time_2.textContent = formatTime(currentTime);

        // 更新进度条宽度
        const progressPercent = (currentTime / duration) * 100;
        progressBarFill.style.width = progressPercent + '%';
        progress_bar_fill_2.style.width = progressPercent + '%';

        const flowLoaderPercent = isNaN((audio.buffered.end(0) / duration) * 100) || music_load_mode == "default" ? 0 : (audio.buffered.end(0) / duration) * 100;

        buffer_bar_fill.style.width =   flowLoaderPercent + '%';
        buffer_bar_fill_2.style.width = flowLoaderPercent + '%';
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' + secs : secs}`;
    }

    // 点击进度条跳转
    function setAudioProgress(event) {
        const progressBarRect = progressBar.getBoundingClientRect();
        const clickX = event.clientX - progressBarRect.left;
        const progressPercent = clickX / progressBarRect.width;

        const duration = audio.duration == Infinity ? Number(audio.dataset.total_duration) : audio.duration;
        const flowLoaderPercent = (audio.buffered.end(0) / duration) * 100

        // console.log("dur =", duration);
        // console.log("flowLoaderPercent", flowLoaderPercent);
        // console.log("progressPercent * 100", (progressPercent * 100));
        

        if (audio.duration && audio.duration !== Infinity) {
            // 正常跳转
            audio.currentTime = audio.duration * progressPercent;
        } else if (audio.buffered.length > 0) {
            // 使用缓冲区长度计算跳转位置
            const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);

            // console.log("bufferedEnd",bufferedEnd);

            if ((progressPercent * 100) > flowLoaderPercent) {
                // 如果点击到缓冲区外面则跳转到缓冲区末尾
                audio.currentTime = bufferedEnd * 100;
            } else {
                // 否则就按照dataset.total_duration计算
                // console.log("audio.duration * progressPercent",(audio.duration * progressPercent));
                audio.currentTime = duration * progressPercent;
            }

        }

        window.top.tl_enevt_handler.submit_seek(audio.currentTime);

    }

    function setAudioProgress_2(event) {
        const progressBarRect = progress_bar_2.getBoundingClientRect();
        const clickX = event.clientX - progressBarRect.left;
        const progressPercent = clickX / progressBarRect.width;

        const duration = audio.duration == Infinity ? audio.dataset.total_duration : audio.duration;
        const flowLoaderPercent = (audio.buffered.end(0) / duration) * 100

        if (audio.duration && audio.duration !== Infinity) {
            // 正常跳转
            audio.currentTime = audio.duration * progressPercent;
        } else if (audio.buffered.length > 0) {
            // 使用缓冲区长度计算跳转位置
            const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
            if ((progressPercent * 100) > flowLoaderPercent) {
                audio.currentTime = bufferedEnd * 100;
            } else {
                audio.currentTime = duration * progressPercent;
            }

        }

        window.top.tl_enevt_handler.submit_seek(audio.currentTime);
    }

    progressBar.addEventListener('click', setAudioProgress);
    progress_bar_2.addEventListener('click', setAudioProgress_2);

    audio.addEventListener('loadedmetadata', () => {
        totalTimeDisplay.textContent = formatTime(audio.duration || 0);
        total_time_2.textContent = formatTime(audio.duration || 0);
        updateProgressBar();
    });

    audio.addEventListener('timeupdate', updateProgressBar);

    const musicPlayer_cover = document.getElementsByClassName('musicPlayer_cover')[0];
    musicPlayer_cover.addEventListener('click', () => {
        toogle_BigMusicUi();
    });


    const move_to_info_btn = document.getElementsByClassName("bMc_topBar_title")
    const move_to_lyrics_btn = document.getElementsByClassName("bMc_topBar_lyric")

    move_to_info_btn[0].addEventListener('click', () => {
        const target = document.getElementsByClassName('bigMusicPlayer_cover_class')[0]; // 获取目标方块
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    })

    move_to_lyrics_btn[0].addEventListener('click', () => {
        const target = document.getElementsByClassName('bigMusic_lyrics')[0]; // 获取目标方块
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    })


});

function check_is_big_music_ui_show() {
    const musicPlay = document.getElementsByClassName("musicPlayer")[0]
    for (item of musicPlay.classList.values()) {
        if (item === "show") {
            return true;
        }
    }
    return false;
}

function toogle_BigMusicUi() {
    // 检查是否有 show 类
    const musicPlay = document.getElementsByClassName("musicPlayer")[0]

    if (check_is_big_music_ui_show()) {
        // 需要隐藏
        musicPlay.classList.remove("show");
        // 并展示大UI详情页
        showBigMusicUi();
        return;
        // 如果musicPlayer 没有 show 类，则需要隐藏大UI详情页
    }
    hideBigMusicUi();
}

const bigMusicUi = document.getElementsByClassName("bigMusicOverPage")[0];

function showBigMusicUi() {
    bigMusicUi.classList.add("show");
    hideMusicPlayer();

    setLyrics_interval();
    startVisualization();
    // 启用歌词和可视化
    setTimeout(() => {
        setLyrics_interval();
    }, 3000);
    // 真的很奇怪 为什么歌词会反复跳呢
    // 自适应修复了
}

function hideBigMusicUi() {
    bigMusicUi.classList.remove("show");
    showMusicPlayer();

    removeLyrics_interval();

    setTimeout(() => {
        removeLyrics_interval();
        disableVisualization();
    }, 1000);

    // 禁用歌词和可视化
}

function update_big_music_ui(musicTitle, musicArtist, CoverUrl) {
    let title_elw = document.getElementsByClassName("musicInfo_title")[0]
    let artist_elw = document.getElementsByClassName("musicInfo_artist")[0]
    let cover_elw = document.getElementsByClassName("bigMusicPlayer_cover")[0]

    let main_big_ui = document.getElementsByClassName("bigMusicOverPage")[0]

    // main_big_ui.style.backgroundImage = "url("+CoverUrl+")";

    title_elw.textContent = musicTitle;
    artist_elw.textContent = musicArtist;
    cover_elw.src = CoverUrl;

    change_bigPlayer_main_color(CoverUrl)
    
    

}





function show_big_music_queue_ui() {
    let big_music_queue_ui = document.getElementsByClassName("bigMusic_queue_ui")[0];
    big_music_queue_ui.classList.add("show");
    init_queue_ui_list();
}

function hide_big_music_queue_ui() {
    let big_music_queue_ui = document.getElementsByClassName("bigMusic_queue_ui")[0];
    big_music_queue_ui.classList.remove("show");
}

function toggle_big_music_queue_ui() {
    let big_music_queue_ui = document.getElementsByClassName("bigMusic_queue_ui")[0];
    if (big_music_queue_ui.classList.contains("show")) {
        hide_big_music_queue_ui();
    } else {
        show_big_music_queue_ui();
    }
}


function drop_this_song_in_queue(index) {

}

function clear_queue_ui_list() {
    let elw = document.getElementsByClassName("bigMusic_queue_list")[0];
    elw.innerHTML = "";
}

function move_song_to_next_play(index) {
    let playList = window.parent.playList;
    let currentIndex = window.parent.currentIndex;

    // 检查索引范围
    if (index < 0 || index >= playList.length || currentIndex < 0 || currentIndex >= playList.length) {
        console.error("Invalid index or currentIndex:", { index, currentIndex });
        showNotification("操作失败：索引无效", "error", 1500);
        return;
    }

    // 确保索引不等于当前播放索引
    if (index === currentIndex) {
        showNotification("无法移动当前播放的歌曲", "error", 1500);
        return;
    }

    // 获取目标歌曲
    let song = playList[index];

    // 移除目标歌曲，确保播放列表完整
    let playListNew = [...playList.slice(0, index), ...playList.slice(index + 1)];

    // 计算目标插入位置
    let insertIndex = currentIndex + 1;

    // 如果 index 在 currentIndex 之前，插入位置需要减少 1
    if (index < currentIndex) {
        insertIndex -= 1;
        currentIndex -= 1;
    }

    // 插入目标歌曲到新的位置
    playListNew.splice(insertIndex, 0, song);

    // 更新播放列表
    window.parent.playList = playListNew;
    window.parent.currentIndex = currentIndex;

    // 显示通知
    showNotification(`已将 "${song.musicTitle}" 提升至下一首播放`, "info", 1500);

    // 更新播放队列 UI
    init_queue_ui_list();
}


// function move_song_to_next_play(index){
//     let playList = window.parent.playList;
//     let song = playList[index];
//     let musicId = song["musicId"];
//     let musicTitle = song["musicTitle"];
//     let musicArtist = song["musicArtist"];
//     let CoverUrl = song["CoverUrl"];

//     let playList_new = [...playList.slice(0,index),...playList.slice(index+1)];

//     window.parent.playList = playList_new;
//     window.parent.currentIndex = index;

//     showNotification(`已将 "${musicTitle}" 移至下一首播放`, 'info', 1500);

//     // playMusic_with_infos(musicId, musicTitle, musicArtist, CoverUrl);

//     init_queue_ui_list();

// }


function dircet_play_this_song(index) {
    let playList = window.parent.playList;
    let song = playList[index];
    let musicId = song["musicId"];
    let musicTitle = song["musicTitle"];
    let musicArtist = song["musicArtist"];
    let CoverUrl = song["CoverUrl"];

    window.parent.currentIndex = index;

    showNotification(`直接跳转播放`, 'info', 1500);

    playMusic_with_infos(musicId, musicTitle, musicArtist, CoverUrl);

    init_queue_ui_list();

}

function remove_this_song_from_queue(index) {
    let playList = window.parent.playList;
    let song = playList[index];
    let musicTitle = song["musicTitle"];

    // 获取当前播放的索引
    let old_currentIndex = window.parent.currentIndex;

    
    // 处理移除当前播放的歌曲逻辑
    if (index === old_currentIndex) {
        remove_music_src(); // 移除当前播放的歌曲音源
        if (playList.length > 1) {
            // 如果播放列表不止一首歌，播放下一首
            // let nextIndex = (index + 1) % playList.length; 
            // 计算下一首索引
            // window.parent.currentIndex = nextIndex; 
            // 更新当前播放索引
            // nextMusic();
            // playMusic_with_musicId(playList[nextIndex].musicId); // 播放下一首歌曲
        } else {
            // 如果播放列表只有一首歌，重置播放状态
            window.parent.currentIndex = -1;
        }
    } else if (index < old_currentIndex) {
        // 如果移除的歌曲在当前播放歌曲之前，调整currentIndex
        window.parent.currentIndex--;
    }

    // 重新生成播放列表
    let playList_new = [...playList.slice(0, index), ...playList.slice(index + 1)];
    window.parent.playList = playList_new;

    // 通知用户歌曲已移除
    showNotification(`已将 "${musicTitle}" 从播放列表移除`, 'info', 1500);

    
    
    // 更新播放列表UI
    init_queue_ui_list();
    
    
    // console.log('playList[old_currentIndex]["musicTitle"]',playList[old_currentIndex]["musicTitle"])
    // console.log('playList_new[index]["musicTitle"]',playList_new[window.parent.currentIndex]["musicTitle"])
    

    playList[old_currentIndex]["musicTitle"] === playList_new[window.parent.currentIndex]["musicTitle"] ? null : playMusic_with_musicId(window.parent.playList[window.parent.currentIndex].musicId);

}


function remove_all_songs_from_queue() {
    let playList = window.parent.playList;
    playList = [];
    window.parent.playList = playList;
    window.parent.currentIndex = 0;

    showNotification(`已清空播放列表`, 'info', 1500);

    remove_music_src();

    save_playList(true);

    init_queue_ui_list();

}


function init_queue_ui_list() {

    clear_queue_ui_list();

    let playList = window.parent.playList;
    let currentIndex = window.parent.currentIndex;


    let list = document.getElementsByClassName("bigMusic_queue_list")[0];
    let indexs = 1;

    for (const element of playList) {
        let musicId = element["musicId"];
        let musicTitle = element["musicTitle"];
        let musicArtist = element["musicArtist"];
        let CoverUrl = element["CoverUrl"];

        // console.log(element);

        let active = "";

        if (currentIndex === indexs - 1) {
            active = "nowPlaying"
        }

        let added = `<div class="queue_item ${active}">

            <span class="queue_item_no pointer" onclick="dircet_play_this_song(${indexs - 1})">#${indexs}</span>

            <div class="queue_item_cover pointer" onclick="dircet_play_this_song(${indexs - 1})">
                <div class="queue_item_cover_2">
                    <img class="queue_item_cover_img" src="${CoverUrl}" alt="">
                </div>
            </div>
            <div class="queue_item_info pointer" onclick="dircet_play_this_song(${indexs - 1})">
                <span class="queue_item_title">${musicTitle}</span>
                <span class="queue_item_artist">${musicArtist}</span>
            </div>

            <span class="pointer" onclick="move_song_to_next_play(${indexs - 1})">⏫</span>
            <span class="pointer" onclick="remove_this_song_from_queue(${indexs - 1})">❌</span>
        </div>`

        list.innerHTML += added;
        indexs++;


    }


}

function fix_queue_ui_list_img_broken() {
    (async () => {
        const api = window.top.api;
        let playList = [...window.parent.playList];

        for (let element of playList) {
            let CoverUrl = element["CoverUrl"];

            if (CoverUrl === null || CoverUrl == "./img/def_cover.png") {
                let new_url = await api.getCoverArt(element["musicId"], 70);
                element["CoverUrl"] = new_url;
                init_queue_ui_list();
            }

            // 检查图片的blob是否有效
            let isValid = await fetch(CoverUrl, { method: 'HEAD' })
                .then(response => response.ok) // 检查是否成功返回
                .catch(() => false);          // 捕获异常

            // 如果图片的blob无效，则重新获取图片的blob
            if (!isValid) {
                let new_url = await api.getCoverArt(element["musicId"], 70);
                element["CoverUrl"] = new_url;
            }
        }

        // 更新全局播放列表并重新初始化UI队列
        window.parent.playList = playList;
        init_queue_ui_list();
    })();
}


function remove_music_src() {
    try {
        const musicPlayer = document.getElementById('musicPlayerAudio');
        musicPlayer.src = ''
        musicPlayer.mediaSourceInstance.removeEventListener('sourceopen', musicPlayer.sourceOpenHandler);
        musicPlayer.mediaSourceInstance = null;
    } catch (error) {

    }
}



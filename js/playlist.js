
function add_playlist_card(playlistName, CoverUrl, innerSongCount,playlistId) {
    // 获取目标容器
    const playListsContainer = document.querySelector('.musicPlayLists');

    // // 检查目标容器是否存在
    // if (!playListsContainer) {
    //     console.error("Container '.musicPlayLists' not found!");
    //     return;
    // }

    // 创建播放列表卡片的模板
    const playlistCard = `
        <div class="musicPlayListsItem" data-playlist-id="${playlistId}">
            <img src="${CoverUrl}" alt="播放列表封面" />
            <span class="playListName">${playlistName}</span>
            <span class="playListSongsCount">${innerSongCount}</span>
        </div>
    `;

    // 插入模板到容器中
    playListsContainer.insertAdjacentHTML('beforeend', playlistCard);
}


// 静态委托绑定事件

// 获取需要的 DOM 元素
const musicPlayListsContainer = document.querySelector('.musicPlayLists');
const overPage = document.querySelector('.overPage');
const hideButton = document.querySelector('.hideOverPage');
const playListNameDisplay = document.querySelector('.selectPlayListName');

// 通过静态委托监听播放列表点击事件
musicPlayListsContainer.addEventListener('click', (event) => {
    // 检查点击的元素是否是或包含播放列表项
    const playList = event.target.closest('.musicPlayListsItem');
    if (playList) {
        const playListName = playList.querySelector('.playListName').textContent;
        playListNameDisplay.textContent = playListName; // 更新覆盖层标题
        overPage.classList.add('visible'); // 显示覆盖层
        overPage.dataset.playlistId = playList.dataset.playlistId; // 设置覆盖层数据属性
        init_playlist_library(); // 初始化播放列表歌曲列表
    }
});

// 点击收起按钮隐藏覆盖层
hideButton.addEventListener('click', () => {
    overPage.classList.remove('visible'); // 隐藏覆盖层
});


function init_all_playlist_cards() {
    (async () => {
        const api = window.top.api;

        let currentPlayList = await api.getPlayList(10, "DESC", "createdAt", 0);
        console.debug(currentPlayList);

        for (const item of currentPlayList) {
            // 使用局部作用域变量，避免全局变量冲突
            const inner_song_data = await api.getPlayListSongs(item.id, 1, "ASC", "createdAt", 0);

            let artUrl;
            if (inner_song_data.length !== 0) {
                const songId = inner_song_data[0].mediaFileId;
                console.debug("songId", songId);
                artUrl = await api.getCoverArt(songId,150);
            } else {
                artUrl = "./img/def_cover.png";
            }

            const playListInfo = await api.getPlayListInfo(item.id);
            add_playlist_card(item.name, artUrl, playListInfo.songCount,item.id);
        }
    })();
}

var curr_play_list_id = "";
// 存放当前已经打开的播放列表的 id
// 避免重复请求播放列表歌曲列表

function init_playlist_library() {
    (async () => {

        
        const api = window.top.api;

        let playListId = overPage.dataset.playlistId;
        
        if (playListId === curr_play_list_id) {
            return;
        }
        
        curr_sort_func = getCurrentSortOrder();
        curr_sort_order_func = getCurrentSortFunc();
        clear_library();

        let playLists = await api.getPlayListSongs(playListId, 10 , curr_sort_order_func, curr_sort_func, 0);

        curr_play_list_id = playListId;
        
        can_this_get_more_result = true;
        
        for (const item of playLists) {
        

            let coverArtUrl = await api.getCoverArt(item.mediaFileId,150);

            // 计算时间
            let time = item.duration;
            let minutes = Math.floor(time / 60);
            let seconds = Math.floor(time % 60);
            let duration = minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);

            addMusicCard(item.mediaFileId, item.title, item.artist,item.album, coverArtUrl, duration,item.artistId, item.albumId);
        
        }

        added_obsv();

})();
}



var ends = 15;
var curr_index = 0;
var curr_sort_func = "createdAt";
var can_this_get_more_result = true;
var curr_sort_order_func = "DESC";

function clear_library() {
    let musicList = document.getElementsByClassName('musicLists')[0];
    musicList.innerHTML = "";
    ends = 15;
    curr_index = 0;
    curr_sort_func = getCurrentSortOrder()
    curr_sort_order_func = getCurrentSortFunc()
}



function added_obsv() {

    clear_obsv();

    let el = document.getElementsByClassName('musicLists')[0];
    // el.innerHTML += '<div id="in_the_end"></div>';
    let temp_obsv = document.createElement('div')
    temp_obsv.id = "in_the_end"
    el.appendChild(temp_obsv);

    // 定义 IntersectionObserver 回调
    const callback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {


                request_new_songs();

                observer.unobserve(entry.target); // 可选：停止观察
            }
        });
    };

    // 创建 IntersectionObserver 实例
    const observer = new IntersectionObserver(callback, {
        root: null, // 默认为视口
        rootMargin: '0px', // 设置触发范围的边距
        threshold: 0.5, // 元素进入可视范围的比例，0.5 表示元素至少 50% 进入视口
    });

    // 选择目标元素并开始观察
    const targetElement = document.getElementById('in_the_end');
    if (targetElement) {
        observer.observe(targetElement);
    } else {
        console.error("在added_obsv时未找到目标元素");
    }
}

function addMusicCard(playedMusicId, musicTitle, musicArtist,music_Album, musicCoverUrl, duration, musicArtistId, musicAlbumId) {
    // 获取现有的音乐卡片数量，并计算新的 musicId
    const musicList = document.querySelector('.musicLists');
    const musicId = musicList.children.length + 1;  // musicId 是当前卡片数量加 1

    // 创建一个新的音乐卡片元素
    const musicCard = document.createElement('div');
    musicCard.classList.add('musicListItem');

    // 添加 musicId 到 musicCard
    musicCard.dataset.musicId = playedMusicId;

    // 设置新的音乐卡片内容
    musicCard.innerHTML = `
        <span>#${musicId}</span>
        <img src="${musicCoverUrl}" alt="封面">
        <div class="musicInfo">
            <span>${musicTitle}</span>
            <span><span class="musics_artist" onclick="openSubPage('./app_pages/artist.html?artistId=${musicArtistId}')">${musicArtist}</span> | <span class="musics_album" onclick="openSubPage('./app_pages/album.html?albumId=${musicAlbumId}')">${music_Album}</span></span>
        </div>
        <span>${duration}</span>
    `;

    musicList.appendChild(musicCard);

}
// 静态委托绑定事件
document.querySelector('.musicLists').addEventListener('click', (event) => {
    const musicCard = event.target.closest('.musicListItem');
    if (musicCard) {
        const playedMusicId = musicCard.dataset.musicId;
        const musicTitle = musicCard.querySelector('.musicInfo span:first-child').textContent;
        const musicArtist = musicCard.querySelector('.musicInfo .musics_artist').textContent;
        const musicCoverUrl = musicCard.querySelector('img').src;
        parent.playMusic_with_infos(playedMusicId, musicTitle, musicArtist, musicCoverUrl);
    }
});


function added_obsv() {

    clear_obsv();

    let el = document.getElementsByClassName('musicLists')[0];
    el.innerHTML += '<div id="in_the_end"></div>';

    // 定义 IntersectionObserver 回调
    const callback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {


                request_new_songs();

                observer.unobserve(entry.target); // 可选：停止观察
            }
        });
    };

    // 创建 IntersectionObserver 实例
    const observer = new IntersectionObserver(callback, {
        root: null, // 默认为视口
        rootMargin: '0px', // 设置触发范围的边距
        threshold: 0.5, // 元素进入可视范围的比例，0.5 表示元素至少 50% 进入视口
    });

    // 选择目标元素并开始观察
    const targetElement = document.getElementById('in_the_end');
    if (targetElement) {
        console.debug("启动观察了");
        observer.observe(targetElement);
    } else {
        console.error("在added_obsv时未找到目标元素");
    }
}

function clear_obsv() {
    // 删除元素自己
    let el = document.getElementById('in_the_end');
    if (el) {
        el.parentNode.removeChild(el);
    } 
    // else {
    //     console.error("在clear_obsv时未找到目标元素");
    // }
}

async function songData_to_addMusicCard(songData) {
    // 等待所有异步操作完成
    for (const element of songData) {
        const api = window.top.api;

        let coverArtUrl = await api.getCoverArt(element.mediaFileId,150);

        // 计算时间
        let time = element.duration;
        let minutes = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);
        let duration = minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);

        addMusicCard(element.mediaFileId, element.title, element.artist,element.album, coverArtUrl, duration,element.artistId, element.albumId);
    }
}

function request_new_songs() {
    clear_obsv();
    (async () => {
        if (can_this_get_more_result) {

            curr_sort_func = getCurrentSortOrder();
            curr_sort_order_func = getCurrentSortFunc();

            let playListId = overPage.dataset.playlistId;

            parent.showNotification("正在加载更多歌曲", 'info', 1500);
            const api = window.top.api;
            curr_index += 10;
            ends += 10;

            let songs_data = await api.getPlayListSongs(playListId, ends, curr_sort_order_func, curr_sort_func, curr_index);

            // let songs_data = await api.getSongSortList(ends, "DESC", curr_sort_func, curr_index);

            if (songs_data.length === 0) {
                can_this_get_more_result = false;
                // console.debug("没有更多歌曲了");
                window.parent.showNotification("没有更多歌曲了", 'info', 3000)
                return;
            }

            // 等待所有异步操作完成

            await songData_to_addMusicCard(songs_data);
            added_obsv();
        }
    })()
}

function play_current_list_all_music() {
    // 添加当前歌单全部的歌曲至播放列表
    (async () => {
        const api = window.top.api;
        const playListId = overPage.dataset.playlistId;
        console.log("play_current_list_all_music listId ->", playListId);
        var _song_index = 0;
        var _song_ends = 50;
        while (true) {
            const songs_data = await api.getPlayListSongs(playListId, _song_ends, "DESC", "createdAt", _song_index);
            console.log("songs_data", songs_data);
            for (const element of songs_data) {
                parent.addMusicToPlayList(element.mediaFileId,element.title,element.artist,'./img/def_cover.png')
            }
            _song_index += 50;
            _song_ends += 50;
            if (songs_data.length < 50) {
                break;
            }
        }
    }
    )();
}
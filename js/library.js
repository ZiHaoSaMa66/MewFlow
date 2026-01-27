function addMusicCard(playedMusicId, musicTitle, musicArtist, music_Album, musicCoverUrl, duration, musicArtistId, musicAlbumId) {
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
            <span class="musics_title">${musicTitle}</span>
            <span><span class="musics_artist" onclick="openSubPage('./app_pages/artist.html?artistId=${musicArtistId}')">${musicArtist}</span> | <span class="musics_album" onclick="openSubPage('./app_pages/album.html?albumId=${musicAlbumId}')">${music_Album}</span></span>
        </div>
        <span>${duration}</span>
    `;

    musicList.appendChild(musicCard);

}
// 静态委托绑定事件
document.querySelector('.musicLists').addEventListener('click', (event) => {
    const musicCard = event.target.closest('.musicListItem');

    // 如果点击到文字部分则不做任何操作
    if (event.target.classList.contains('musics_artist') || event.target.classList.contains('musics_album')) {
        console.log('skip click');
        return;
    }

    if (musicCard) {
        const playedMusicId = musicCard.dataset.musicId;
        const musicTitle = musicCard.querySelector('.musicInfo span:first-child').textContent;
        const musicArtist = musicCard.querySelector('.musicInfo .musics_artist').textContent;
        const musicCoverUrl = musicCard.querySelector('img').src;
        parent.playMusic_with_infos(playedMusicId, musicTitle, musicArtist, musicCoverUrl);
    }
});


function myFunction() {
    alert('目标元素已进入可视范围！');
}

var curr_index = 0;
var ends = 10;
var curr_sort_func = "createdAt";
var curr_sort_order_func = "DESC";

var can_this_get_more_result = true;




async function init_library() {

    // 如果已经绑定了事件，则先解绑
    document.getElementById('sortOrder').removeEventListener('change', init_library);

    // 绑定事件
    document.getElementById('sortOrder').addEventListener('change', init_library);

    // 获取当前排序方式

    curr_sort_order_func = getCurrentSortFunc();
    curr_sort_func = getCurrentSortOrder();




    curr_index = 0;
    ends = 10;
    can_this_get_more_result = true;

    clear_library();

    const api = window.top.api;
    let songs_data = await api.getSongSortList(ends, curr_sort_order_func, curr_sort_func, curr_index);

    // 确保所有歌曲数据处理完成
    await songData_to_addMusicCard(songs_data);

    // 添加目标元素并启动观察
    added_obsv();
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

function clear_library() {
    let musicList = document.getElementsByClassName('musicLists')[0];
    musicList.innerHTML = "";
    ends = 10;
    curr_index = 0;
    curr_sort_func = getCurrentSortOrder()
}

async function songData_to_addMusicCard(songData) {
    // 等待所有异步操作完成
    for (const element of songData) {
        const api = window.top.api;

        let coverArtUrl = await api.getCoverArt(element.id, 90);

        // 计算时间
        let time = element.duration;
        let minutes = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);
        let duration = minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);

        addMusicCard(element.id, element.title, element.artist, element.album, coverArtUrl, duration, element.artistId, element.albumId);
    }
}

function searchSomeThing() {
    (async () => {

        can_this_get_more_result = false;

        const keyword = document.getElementById('searchInput').value;

        if (keyword === "") {
            can_this_get_more_result = true;
            init_library();
            return;
        }

        const api = window.top.api;
        let songs_data = await api.search3(keyword)
        console.debug(songs_data);

        let result = songs_data.searchResult3

        // 判断resut object是否为 {}
        if (Object.keys(result).length === 0) {
            parent.showNotification("没有找到关键词歌曲", 'error', 4000);
            return;
        }

        clear_library();
        await songData_to_addMusicCard(result.song);



    })()
}

function clear_obsv() {
    // 删除元素自己
    let el = document.getElementById('in_the_end');
    if (el) {
        el.parentNode.removeChild(el);
    }
}

function handleKeyDown(event) {
    if (event.key === 'Enter') {
        searchSomeThing(); // 调用搜索按钮绑定的函数
    }
}

function request_new_songs() {
    clear_obsv();
    (async () => {
        if (can_this_get_more_result) {

            curr_sort_func = getCurrentSortOrder();
            curr_sort_order_func = getCurrentSortFunc();

            parent.showNotification("正在加载更多歌曲", 'info', 2000);
            const api = window.top.api;
            curr_index += 10;
            ends += 10;

            let songs_data = await api.getSongSortList(ends, curr_sort_order_func, curr_sort_func, curr_index);


            if (songs_data.length === 0) {
                can_this_get_more_result = false;
                // console.debug("没有更多歌曲了");
                parent.showNotification("没有更多歌曲了", 'info', 3000)
                return;
            }

            // 等待所有异步操作完成

            await songData_to_addMusicCard(songs_data);
            added_obsv();
        }
    })()
}

function play_library_all() {

    (async () => {

        // parent.showNotification("11","info",1000)

        let playHowMany = getLocalStorageItem("library_one_time_play_num") ?? 40;

        const api = window.top.api;
        let songs_data = await api.getSongSortList(playHowMany, curr_sort_order_func, curr_sort_func, 0);


        if (songs_data.length === 0) {
            parent.showNotification("没有歌曲可播放", 'error', 3000)
            return;
        }


        for (const element of songs_data) {

            let data = {
                CoverUrl: "../img/def_cover.png",
                musicArtist: element.artist,
                musicTitle: element.title,
                musicId: element.id,
            }

            window.parent.playList.push(data)

        }

        parent.showNotification(`已将${songs_data.length}首歌曲加入播放列表`, 'success', 2500)



    })();

}
var temp_music_data_list = [];

function init_artist() {

    (async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const artistId = urlParams.get('artistId');

        if (!artistId) {
            console.error("artistId 参数未找到！");
            return;
        }

        // clear_playlist_lists();

        console.log("artistId="+artistId)

        const api = window.top.api
        const artist_data = await api.getArtist(artistId);

        console.log(artist_data)

        const artist_name = artist_data.artist.name

        document.getElementsByClassName("album-title")[0].innerHTML = artist_name;

        const artist_album_list = artist_data.artist.album

        if (!artist_album_list) {
            console.error("专辑列表为空?")
            return;
        }
        
        for (let index = 0; index < artist_album_list.length; index++) {
            const element = artist_album_list[index];
            let listName = element.name
            const artId = element.coverArt
            let blob_url = await api.getCoverArt(artId,105);
            let songCount = element.songCount
            let playlistid = element.id
            add_playlist_card(listName,blob_url,songCount,playlistid)

        }

        
        // 后加载图片 优化差网体验
        // console.debug("lazy load start..")
        // for (let index = 0; index < artist_album_list.length; index++) {
        //     const element = artist_album_list[index];
        //     
            
        //     console.debug("lazy load blob url ="+blob_url)
        //     const musicCover = document.getElementsByClassName("musicPlayListsItem")[index].getElementsByTagName("img")
        //     musicCover.src = blob_url
        // }

    })();

}




function clear_playlist_lists() {
    document.getElementsByClassName("musicPlayLists")[0].innerHTML = ""
}

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
        init_sub_pages();
        // 初始化播放列表歌曲列表
    }
});

// 点击收起按钮隐藏覆盖层
hideButton.addEventListener('click', () => {
    overPage.classList.remove('visible'); // 隐藏覆盖层
});

function init_sub_pages() {
    (async () => {

        const albumId = overPage.dataset.playlistId;
        document.getElementById("artistSubPage").src = `./app_pages/album.html?albumId=${albumId}&hideHead=1`


    })();
}
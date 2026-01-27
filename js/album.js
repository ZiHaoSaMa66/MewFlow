var temp_music_data_list = [];

var view_ends = 0;

function init_album_list() {

    (async () => {


        temp_music_data_list = []
        // 清空缓存

        const urlParams = new URLSearchParams(window.location.search);
        const albumId = urlParams.get('albumId'); // 获取 albumId 参数

        const isNeedHideHead = urlParams.get("hideHead");

        if (isNeedHideHead == 1) {
            const head = document.getElementsByClassName('album-header')[0]
            head.style.display = "none";
            const body_ = document.querySelector("body")
            body_.style.background = "unset";
        }

        if (!albumId) {
            // 使用 albumId 做您需要的操作
            console.error("albumId 参数未找到！");
            return;
        }

        console.log("Album ID:", albumId);
        // document.getElementById("debug").innerHTML = "Album ID: " + albumId;



        const api = window.top.api;
        const album_data = await api.getAlbum(albumId);
        // console.log("执行请求");
        // console.log(album_data);

        // artist
        document.getElementsByClassName("album-title")[0].innerHTML = album_data.album.name;
        document.getElementsByClassName("album-artist")[0].innerHTML = album_data.album.artist;

        // 显示封面
        let cover_id = album_data.album.coverArt;

        let blob_url = await api.getCoverArt(cover_id , 150)

        document.getElementsByClassName("album-cover")[0].src = blob_url;


        temp_music_data_list = album_data.album.song;

        console.log("temp_music_data_list >",temp_music_data_list);

        add_music_item(0, 10, true) // 显示前 10 首歌曲

        // add_obsv(); 
        // 添加 IntersectionObserver 监听

    })();
}



function clear_display_music_list() {
    document.getElementsByClassName('album-tracks-list')[0].innerHTML = "";
}


async function add_music_item(start, end, is_init = false) {
    // start: 开始索引 [0~?]
    // end: 结束索引 [start~?]
    // is_init: 是否是初始化，如果是，则清空原有列表

    // 遍历 music_data_list 并添加到页面中
    
    let index = start + 1;
    // let index = 1;
    
    if (is_init) {
        clear_display_music_list()
    }

    let display_elw = document.getElementsByClassName('album-tracks-list')[0]

    let music_data_list = temp_music_data_list.slice(start, end)

    if (music_data_list.length == 0) {
        window.parent.showNotification("没有更多歌曲了！",'info',2000);
        clear_obsv();
        return;
    }

    for (const element of music_data_list) {

        let time = element.duration;
        let minutes = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);
        let duration = minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);

        let cover_id = element.coverArt;

        const api = window.top.api;

        let blob_url = await api.getCoverArt(cover_id, 65)

        const musicCard = document.createElement('div');
        musicCard.classList.add('album-tracks-item');
        musicCard.dataset.musicId = element.id;

        musicCard.innerHTML = `
                    <span class="album-tracks-item-number">#${index}</span>
                    <img src="${blob_url}" alt="">
                    <div class="album-tracks-item-duration">
                        
                        <span class="album-tracks-item-title">${element.title}</span>
                        <span class="album-tracks-item-artist">${element.artist}</span>

                    </div>
                    <span class="album-tracks-item-times">${duration}</span>
                `

        // display_elw.innerHTML += addHtml;
        display_elw.appendChild(musicCard);

        index++;
   }

   
   add_obsv(); 

}

function clear_obsv() {
    // 删除元素自己
    let el = document.getElementById('in_the_end');
    if (el) {
        el.parentNode.removeChild(el);
    }
}

function add_obsv() {

    clear_obsv();

    let el = document.getElementsByClassName('album-tracks-list')[0];
    // el.innerHTML += '<div id="in_the_end"></div>';
    let temp_obsv = document.createElement('div')
    temp_obsv.id = "in_the_end"
    el.appendChild(temp_obsv);

    // 定义 IntersectionObserver 回调
    const callback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {

                view_ends += 10;

                add_music_item(view_ends, view_ends + 10, false)

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

// 静态委托绑定事件
document.querySelector('.album-tracks-list').addEventListener('click', (event) => {
    const musicCard = event.target.closest('.album-tracks-item');

    // console.log("触发点击歌曲");

    if (musicCard) {
        const playedMusicId = musicCard.dataset.musicId;
        const musicTitle = musicCard.querySelector('.album-tracks-item-title').textContent;
        const musicArtist = musicCard.querySelector('.album-tracks-item-artist').textContent;
        const musicCoverUrl = musicCard.querySelector('img').src;
        window.top.playMusic_with_infos(playedMusicId, musicTitle, musicArtist, musicCoverUrl);
    }

});




function addMusicCard(musicId, musicTitle, musicArtist, musicImgUrl) {
    const musicCard = document.createElement('div');
    musicCard.classList.add('music-card');
    musicCard.dataset.musicId = musicId;  // 将 musicId 添加到 musicCard
    musicCard.style.opacity = 0;  // 初始状态为透明

    // 创建专辑封面图
    const albumArt = document.createElement('img');
    albumArt.src = musicImgUrl;
    albumArt.alt = '专辑封面';
    albumArt.classList.add('album-art');

    // 创建音乐信息部分
    const musicInfo = document.createElement('div');
    musicInfo.classList.add('music-info');
    musicInfo.innerHTML = `
        <h3 class="song-title">${musicTitle}</h3>
        <p class="artist-name">${musicArtist}</p>
        <button class="play-btn">播放</button>
    `;

    // 为播放按钮添加事件监听器
    musicInfo.querySelector('.play-btn').addEventListener('click', () => {
        parent.playMusic_with_infos(musicId, musicTitle, musicArtist, musicImgUrl);  
        // 传递 musicId
    });

    // 添加元素到 musicCard
    musicCard.appendChild(albumArt);
    musicCard.appendChild(musicInfo);

    // 将 musicCard 添加到页面中
    document.querySelector('.music-section').appendChild(musicCard);

    // 触发透明度动画
    setTimeout(() => {
        musicCard.style.opacity = 1;
    }, 100);
}

function init_index() {

    (async () => {

        const api = window.top.api;

        if (typeof(api) == "undefined"){
            // js... 神了..
            window.location.href += "main.html"
        }

        let randomSongs = await api.getRandomSongs();
        console.debug(randomSongs);

        randomSongs.randomSongs.song.forEach(element => {
            
            ( async () => {
                let coverArtUrl = await api.getCoverArt(element.id,400)
                addMusicCard(element.id,element.title, element.artist,coverArtUrl);
            } )();
            

        });

    })();

}
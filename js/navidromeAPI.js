
/**
 * NavidromeAPI 类
 * 提供与 Navidrome 服务器的通信接口，支持生成认证 token、构建请求 URL、发送请求等功能。
 */
class NavidromeAPI {
    /**
     * 构造函数
     * @param {string} baseURL - Navidrome 服务器的基本 URL。
     * @param {string} username - 用户名，用于认证。
     * @param {string} password - 密码，用于生成认证 token。
     */
    constructor(baseURL, username, password) {
        this.baseURL = baseURL;
        this.username = username;
        this.password = password;
        this.clientName = 'MewFlow'; // 客户端名称
        this.version = '1.16.1'; // Subsonic API 版本
        this.x_nd_authToken = null; // 认证 token
    }

    /**
     * 生成认证 token
     * 使用用户名和密码生成一个加盐的认证 token，返回盐值和 token。
     * @returns {Object} - 包含盐值和 token 的对象。
     * @property {string} salt - 盐值。
     * @property {string} token - 生成的认证 token。
     */
    generateAuthToken() {
        const salt = this.generateRandomString();
        const token = md5(`${this.password}${salt}`);
        return { salt, token };
    }

    /**
     * 生成随机字符串
     * @param {number} [length=6] - 随机字符串的长度，默认为 6。
     * @returns {string} - 生成的随机字符串。
     */
    generateRandomString(length = 6) {
        return Math.random().toString(36).substring(2, 2 + length);
    }

    /**
     * 构建请求 URL
     * 根据提供的 endpoint 和参数，构建完整的请求 URL。
     * @param {string} endpoint - API 接口名称。
     * @param {Object} [params={}] - 请求参数对象。
     * @returns {string} - 完整的请求 URL。
     */
    buildURL(endpoint, params = {}) {
        const { salt, token } = this.generateAuthToken();
        const url = new URL(`${this.baseURL}/rest/${endpoint}.view`);
        url.searchParams.append('u', this.username);
        url.searchParams.append('t', token);
        url.searchParams.append('s', salt);
        url.searchParams.append('v', this.version);
        url.searchParams.append('c', this.clientName);
        url.searchParams.append('f', 'json');

        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });

        return url.toString();
    }

    /**
     * 执行 API 请求
     * 根据 endpoint 和参数发送请求，处理返回结果。如果返回的是图片或音频文件，则返回该文件的 URL；如果是 JSON 数据，则返回解析后的 JSON 对象。
     * @param {string} endpoint - API 接口名称。
     * @param {Object} [params={}] - 请求参数对象。
     * @returns {Promise<Object|string>} - 返回 JSON 数据或媒体文件的 URL。
     * @throws {Error} - 如果请求失败或返回错误信息，将抛出错误。
     */
    async request_rest(endpoint, params = {}) {
        const url = this.buildURL(endpoint, params);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const contentType = response.headers.get("Content-Type");

        if (contentType && contentType.startsWith("audio/")) {

            const audio_blob = await response.blob();
            const audio_blob_url = URL.createObjectURL(audio_blob);
            return audio_blob_url;

        }

        if (contentType && contentType.startsWith("image/")) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            return imageUrl;
        }

        const data = await response.json();
        if (data['subsonic-response'].status !== 'ok') {
            showNotification(`请求服务器失败: ${response.status} ${response.statusText}`, 'error', 1000);
            throw new Error(`API error! Message: ${data['subsonic-response'].error.message}`);
        }

        return data['subsonic-response'];
    }


    async request_api(endpoint, urlParams = {}, params = {}, method = 'GET') {

        // 创建 URL 对象
        const url = new URL(`${this.baseURL}/${endpoint}`);

        // 如果有查询参数，附加到 URL 中
        Object.keys(urlParams).forEach(key => {
            url.searchParams.append(key, urlParams[key]);
        });
        // console.debug(url.toString());
        // return;
        const options = {
            method: method,
            // mode: 'cors',
            headers: {
                "Client": "MewFlow",
                "Content-Type": "application/json", // 修复 Content-Type

            },
        };

        // 如果有 token，则添加到请求头
        if (this.x_nd_authToken != null) {
            options.headers['x-nd-authorization'] = `Bearer ${this.x_nd_authToken}`;
        }

        // 如果是 POST 请求，添加请求体
        if (method === 'POST' || method === 'PUT') {
            options.body = JSON.stringify(params); // 修复: 将 data 改为 body
        }

        try {

            // if (method === 'GET') {
            //     var response = await fetch(url);
            // }else{
            //     var response = await fetch(url, options);
            // }

            const response = await fetch(url, options);

            if (!response.ok) {
                showNotification("请求服务器失败!", 'error', 5000);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }


            const data = await response.json();

            console.debug("apiRequest > ", endpoint, " > ", data);

            return data;

        } catch (error) {
            console.error("API请求错误:", error);
            throw error;
        }
    }

    async authAndLogin() {
        const data = await this.request_api('auth/login', {}, {
            password: this.password,
            username: this.username,
        }, "POST");
        // console.debug(data);
        this.x_nd_authToken = data.token;
        return data;
    }


    /**
     * 获取当前用户的歌单列表
     * @returns {Promise<Array>} - 返回歌单列表数据。
     */
    async getPlayList(_end, _order, _sort, _start) {
        const data = await this.request_api('api/playlist', { _end: _end, _order: _order, _sort: _sort, _start: _start }, {}, "GET");
        return data;
    }

    /**
     * 获取指定歌单的信息
     * 
     */
    async getPlayListInfo(playlistId) {
        const data = await this.request_api(`api/playlist/${playlistId}`, {}, {}, "GET");
        return data;
    }

    /**
     * 获取歌单中的歌曲列表
     */
    async getPlayListSongs(playlistId, _end, _order, _sort, _start) {
        const data = await this.request_api(`api/playlist/${playlistId}/tracks`, { _end: _end, _order: _order, _sort: _sort, _start: _start }, {}, "GET");
        return data;
    }
    /**
     * 获取音乐文件夹
     * 请求获取用户的音乐文件夹列表。
     * @returns {Promise<Object>} - 返回音乐文件夹的列表数据。
     */
    async getMusicFolders() {
        return this.request_rest('getMusicFolders');
    }

    /**
     * 获取艺术家列表
     * 请求获取艺术家列表。
     * @returns {Promise<Object>} - 返回艺术家列表数据。
     */
    async getArtists() {
        return this.request_rest('getArtists');
    }

    /**
     * 根据艺术家 ID 获取专辑列表
     * 请求获取指定艺术家的专辑列表。
     * @param {string} artistId - 艺术家的 ID。
     * @returns {Promise<Object>} - 返回该艺术家的专辑列表数据。
     */
    async getArtist(artistId) {
        return this.request_rest('getArtist', { id: artistId });
    }

    /**
     * 根据专辑 ID 获取歌曲列表
     * 请求获取指定专辑的歌曲列表。
     * @param {string} albumId - 专辑的 ID。
     * @returns {Promise<Object>} - 返回该专辑的歌曲列表数据。
     */
    async getAlbum(albumId) {

        return this.request_rest('getAlbum', { id: albumId });
    }

    /**
     * 根据歌曲 ID 获取歌曲详情
     * 请求获取指定歌曲的详细信息。
     * @param {string} songId - 歌曲的 ID。
     * @returns {Promise<Object>} - 返回该歌曲的详细信息。
     */
    async getSong(songId) {
        return this.request_rest('getSong', { id: songId });
    }

    /**
     * 搜索音乐
     * 根据搜索关键字查询音乐。
     * @param {string} query - 搜索关键字。
     * @returns {Promise<Object>} - 返回搜索结果。
     */
    async search3(query) {
        return this.request_rest('search3', { query });
    }

    /**
     * 检查服务器是否在线
     * 发送 ping 请求，检查 Navidrome 服务器的状态。
     * @returns {Promise<Object>} - 返回服务器响应的数据。
     */
    async ping() {
        return this.request_rest('ping');
    }

    /**
     * 获取随机歌曲
     * 请求获取一组随机歌曲。
     * @returns {Promise<Object>} - 返回随机歌曲列表。
     */
    async getRandomSongs() {
        return this.request_rest('getRandomSongs');
    }

    /**
     * 获取歌曲封面
     * 根据歌曲 ID 获取封面艺术，支持指定大小。
     * @param {string} songId - 歌曲 ID。
     * @returns {Promise<Object>} - 返回封面艺术数据。
     */
    async getCoverArt(songId, size) {

        if (cover_block_sizes < size) {
            return this.request_rest("getCoverArt", { id: songId, size: size });
        } else {
            return '../img/def_cover.png'
        }
    }

    /**
     * 获取歌曲流
     * 根据歌曲 ID 获取歌曲的流媒体播放 URL。
     * @param {string} songId - 歌曲 ID。
     * @returns {Promise<blob>} - 返回歌曲流数据。
     */
    async streamBlob(songId) {
        return this.request_rest('stream', { id: songId });
    }

    /**
     * 获取歌曲流 URL
     * 根据歌曲 ID 获取歌曲的流媒体播放 URL。
     * @param {string} songId - 歌曲 ID。
     * @returns {Promise<string>} - 返回歌曲流请求的 URL。
     */
    async streamUrl(songId) {
        const url = this.buildURL('stream', { id: songId });
        return url;
    }


    /**
     * 歌曲打歌
     * 向服务器报告某首歌曲的播放情况。
     * @param {string} songId - 歌曲 ID。
     * @returns {Promise<Object>} - 返回打歌操作的结果。
     */
    async scrobble(songId) {
        return this.request_rest('scrobble', { id: songId });
    }

    /**
     * 获取歌曲排序列表
     * 根据排序方式和其他参数获取指定范围内的歌曲列表。
     * @param {number} _end - 返回的最大歌曲数量。
     * @param {string} _order - 排序方式，升序或降序。
     * @param {string} _sort - 排序字段，如按播放量、评分等。
     * @param {number} _start - 起始位置，用于分页。
     * @returns {Promise<Object>} - 返回排序后的歌曲列表。
     */
    async getSongSortList(_end, _order, _sort, _start) {
        return this.request_api('api/song', { _end: _end, _order: _order, _sort: _sort, _start: _start }, {});
    }
    /**
     * 根据歌曲 ID 获取歌词的嵌入歌词
     * @param {string} songId - 歌曲 ID。
     * @returns {Promise<Object>} - 返回歌词的嵌入歌词。
     */
    async getLyricsBySongId(songId) {
        return this.request_rest('getLyricsBySongId', { id: songId }, {});
    }

    /**
     * 根据歌曲 ID 获取歌词的嵌入歌词
     * @param {string} songId - 歌曲 ID。
     * @returns {Array} - 返回歌词的数组。
     * 示例返回数据: 
     * [{start:0,value:"歌词1"},{start:10,value:"歌词2"},{start:20,value:"歌词3"}]
     */
    async getLyricsHelper(songId) {
        const reqs = await this.request_rest('getLyricsBySongId', { id: songId }, {});

        if (reqs.lyricsList.structuredLyrics == null) {
            return [];
        }
        return reqs.lyricsList.structuredLyrics[0].line
    }

    /**
     * 扫描是否有新歌曲
     * 请求服务器扫描是否有新歌曲。
     * @param {boolean} isFullScan - 是否进行完整扫描 (Slow)。
     * @returns {Promise<Object>} - 返回扫描结果。
     */
    async scanNewSongs(isFullScan) {
        const req = await this.request_rest("startScan", { fullScan: isFullScan })
        return req;
    }

    /**
     * 获取扫描乐曲的状态
     * 请求获取扫描状态。
     * @returns {Promise<Object>} - 返回扫描状态。
     */
    async getScanStatus() {
        const req = await this.request_rest("getScanStatus")
        return req;
    }

}


function md5(string) {
    return CryptoJS.MD5(string).toString();
}
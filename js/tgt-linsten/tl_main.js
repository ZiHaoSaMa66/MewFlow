var window_top = window.top;

var ws = window_top.tl_ws;
var tl_server_url = window_top.tl_server_url;
var tl_room_id = window_top.tl_room_id;
var tl_user_name = window_top.tl_user_name;

/** 
 * @param {string} action 消息类型
 * @param {Object} message > data
*/
function dbg_send_tl_message(action, message) {
    window_top.tl_ws.send(JSON.stringify({ "action": action, "data": message }));
}


function analyze_share_link(link_url) {
    try {

        const secretKey = "mewflow_tl_share";

        // 🐱 正则提取加密串（假设加密串由字母/数字+/=组成）
        const match = link_url.match(/([A-Za-z0-9+/=]{32,})/);
        if (!match) {
            window_top.showNotification("没有找到有效的房间码内容", "error", 3000);
            throw new Error("没有找到有效的房间码内容");
        }

        const encryptedText = match[1];

        // ✨ AES 解密
        const bytes = window_top.CryptoJS.AES.decrypt(encryptedText, secretKey);
        const decrypted = bytes.toString(window_top.CryptoJS.enc.Utf8);


        if (!decrypted) {
            window_top.showNotification("解密失败，可能密钥错误或数据被篡改", "error", 3000);
            throw new Error("解密失败，可能密钥错误或数据被篡改~")
        };

        const data = JSON.parse(decrypted);

        if (!data.server || !data.room) {
            window_top.showNotification("链接解析出数据不完整", "error", 3000);
            throw new Error("解析出来的数据不完整~");
        }

        return {
            server: data.server,
            roomId: data.room
        };
    } catch (err) {
        window_top.showNotification("解析失败: " + err.message, "error", 3000);
        console.error("解析失败:", err.message);
        return null;
    }
}

// function generate_share_link() {}

function generate_share_link() {
    const serverUrl = tl_server_url;
    const roomId = tl_room_id;
    const userName = tl_user_name;
    const secretKey = "mewflow_tl_share";

    if (!serverUrl || !roomId) {
        window_top.showNotification("生成分享链接失败,缺少参数", "error", 2500);
        return;
    }

    const rawContent = JSON.stringify({
        server: serverUrl,
        room: roomId
    });

    const encrypted = window_top.CryptoJS.AES.encrypt(rawContent, secretKey).toString();

    // 文案池
    const templates = [
        `欸，在MewFlow开了个房间摸鱼听歌，来不来？房间码👉 ${encrypted} 复制戳开App就行~ 歌单随机，惊喜盲盒🎁`,
        `刚淘到几张超绝的City Pop bootleg，放我MewFlow房间了！速来品鉴 👉 ${encrypted} (复制整段开App直达) 等你锐评👂`,
        `窗外雨声+耳机里的低保真=完美周末🍃 我房间开着呢，房间号：${encrypted} 复制粘贴进MewFlow，一起瘫着？`,
        `听歌房开播了！${userName} @你 🔑 ${encrypted} 复制→打开MewFlow→开听。速进，前奏刚起🎶`,
        `失眠？来我MewFlow房间听点安静的吧。房间码 ${encrypted} 复制打开App就好。音量调低，世界晚安🌙`,
        `能量告急⚡️！急需音乐充电！我MewFlow房间在放超嗨歌单，房间号 ${encrypted} 复制→打开App→加入→开蹦！💃`,

        `🌸 ${userName} 邀请你来 MewFlow 一起听歌喵~\n🎵 复制整段到 App 内加入房间~\n[${encrypted}]\n🎧 快来一起沉浸音乐吧~♪`,
        `🎶 ${userName} 的音乐房间等你加入！\n✨ 复制以下文字到 MewFlow App~\n[${encrypted}]\n💌 一起感受音乐的温度喵~`,
        `🎉 ${userName} 的专属音乐派对开始啦~\n🎵 复制下面内容加入 MewFlow 房间~\n[${encrypted}]\n🌟 一起来High翻天喵~`,
        `✨ 喵呜~ ${userName} 在MewFlow等你~\n🎧 复制这段到 App 就能加入啦~\n[${encrypted}]\n🎶 让我们一起听喜欢的歌吧~ฅ^•ﻌ•^ฅ`,
        `💌 ${userName} 邀请你加入 MewFlow 房间~\n🎵 复制整段文字加入吧~\n[${encrypted}]\n🎶 音乐和我都在等你喵~`,
        `🎶 ${userName} 的房间正在播放好歌~\n✨ 复制以下到 MewFlow App 进入~\n[${encrypted}]\n🌸 快来一起听~`,
        `🌸 ${userName} 打开了一扇音乐之门~\n🎵 复制以下文字进入 MewFlow 房间~\n[${encrypted}]\n🌟 我在里面等你喵~`,
        `🎉 ${userName} 的音乐派对上线啦！\n🎶 复制这段文字进入房间~\n[${encrypted}]\n💌 快来和我一起嗨~ฅ(≧▽≦)ฅ`,

        `✨ ${userName} 在 MewFlow 开房了（音乐的那种！）\n🎵 复制以下文字加入~\n[${encrypted}]\n🎧 快来一起享受吧喵~`,
        `🌸 ${userName} 邀请你加入私人听歌派对~\n🎶 复制这段到 MewFlow App~\n[${encrypted}]\n💌 有惊喜等你哦喵~`,
        `🎶 ${userName} 在 MewFlow 等你上线！\n✨ 快复制这段文字加入房间吧~\n[${encrypted}]\n🎧 我们一起听歌聊人生~`,
        `💖 ${userName} 想和你共享耳机（心）~\n🎼 复制整段文字进入房间~\n[${encrypted}]\n🌟 让我也听听你的心跳吧喵~`,
        `🎉 ${userName} 的音乐列车已发车~\n🎵 复制以下文字到 App 上车~\n[${encrypted}]\n💌 别错过这班车喵~`,
        `✨ ${userName} 的专属音乐世界等你加入~\n🎧 复制整段进入 MewFlow 房间~\n[${encrypted}]\n🌸 一起躺平听歌喵~`,
        `🎶 ${userName} 的音乐小窝欢迎你~\n🎼 复制这段文字加入吧~\n[${encrypted}]\n💖 我已经煮好奶茶等你了喵~`
    ];

    // 随机选择一个模板
    const randomIndex = Math.floor(Math.random() * templates.length);
    const shareText = templates[randomIndex].trim();

    document.getElementsByClassName("tl_share_link_output")[0].value = shareText;

    return {
        encrypted,
        shareText
    };
}



function init_join_together_linsten() {

    let ipt_server_url = document.getElementById("tl_ws_server_url").value;
    let ipt_user_name = document.getElementById("tl_user_name").value;
    let ipt_room_id = document.getElementById("tl_room_id").value;

    let ipt_share_link = document.getElementById("tl_share_link").value;

    if (ipt_share_link) {

        let data = analyze_share_link(ipt_share_link);
        let tmp_server_url = data.server;
        let tmp_room_id = data.roomId;

        // console.log("analyze_share_link v")
        // console.log("tmp_server_url:",tmp_server_url,"tmp_room_id:",tmp_room_id);
        if (tmp_server_url && tmp_room_id) {
            ipt_server_url = tmp_server_url;
            ipt_room_id = tmp_room_id;
        }
    }


    if (!ipt_user_name || !ipt_room_id) {
        window_top.showNotification("用户名或房间号是必填的", "error", 2000);
        return;
    }

    if (!ipt_server_url) {
        let tmp = get_online_tl_server_url();
        if (!tmp) {
            window_top.showNotification("请填写服务器地址", "error", 3000);
            return;
        } else {
            ipt_server_url = tmp;
            tl_server_url = tmp;
        }
    }

    save_tl_config(ipt_server_url, ipt_user_name, ipt_room_id);

    join_tl_room(ipt_room_id, ipt_user_name);
}


function update_room_status(status) {
    document.getElementById("tl_room_id_show").innerText = tl_room_id;

    console.log("update_room_status:", status);

    document.getElementById("tl_online_count").innerText = status.users.length;
    let s = ""
    status.users.forEach(user => {
        s += `${user},`
    })
    s = s.slice(0, -1)

    document.getElementById("tl_current_user").innerText = s;
    document.getElementById("tl_current_music").innerText = status.music_id || "null";
}

function join_tl_room(room_id, user_name) {
    if (tl_server_url === undefined || tl_server_url === null) {
        window_top.showNotification("加入房间失败,无缓存的参数", "error", 2000)
        return;
    }
    try {
        ws = new WebSocket(tl_server_url + room_id + "?user_name=" + user_name);
        console.log("ws.url:", ws.url);
        window_top.tl_ws = ws;

    } catch (error) {
        window_top.showNotification("连接服务器失败: " + error, "error", 3000);
        ws = null
        return;
    }

    hide_tl_config();

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.action === "get_status") {
            // audio.src = msg.data.stream_url;
            // if (msg.data.is_playing) audio.play();
            update_room_status(msg.data);

        }
        if (msg.action === "new_join") {
            window_top.showNotification("新用户来咯: " + msg.data, "info", 1000);
        }
        if (msg.action === "user_left") {
            window_top.showNotification("用户离开了: " + msg.data, "info", 1000);
        }

        // if (msg.action === "sync_playlist"){
        //     // update playlist

        // }

        if (msg.action === "new_stream_url") {
            audio.src = msg.data;
            window_top.audio.play();
        }

        if (msg.action === "play") {
            let stream_url = msg.data.stream_url;
            let dir_music_id = msg.data.music_id;
            if (stream_url) {
                window_top.audio.src = msg.data.stream_url;
            } else if (dir_music_id) {
                console.log("tl play music_id:", dir_music_id)
                
                // console.log("window_top.playList[window_top.currentIndex].musicId",window_top.playList[window_top.currentIndex].musicId)
                
                if (window_top.playList.length == 0) {
                    window_top.playMusic_with_musicId(dir_music_id);
                    return;
                }

                if (dir_music_id != window_top.playList[window_top.currentIndex].musicId) {
                    window_top.playMusic_with_musicId(dir_music_id);
                }

                return;
            }
            window_top.audio.play();
        }
        if (msg.action === "pause") {
            // window_top.audio.pause();
            msg.data.is_playing ? window_top.audio.play() : window_top.audio.pause();
            // if (msg.data.is_playing) {
            //     window_top.audio.play();
            //     return
            // }
            // window_top.audio.pause();
            

        }
        if (msg.action === "seek") {
            window_top.audio.currentTime = msg.data.position;
        }
    };


    ws.onclose = (event) => {
        window_top.showNotification("连接断开: " + event.reason, "error", 3000);
        ws = null;
        show_tl_config();
    }
}


function leave_tl_room() {
    ws.close();
}

class tl_enevt_handler {
    constructor() {
    }

    send_message(action, data) {

        if (!window_top.tl_ws) {
            console.warn("ws is not ready");
            // window_top.showNotification("没有缓存的一起听服务器连接?", "error", 3000);
            return;
        }
        console.log("send_message:", action, data)
        window_top.tl_ws.send(JSON.stringify({ "action": action, "data": data }));
    }


    /**
     * 发送新的音乐id > play
     * @param {string} music_id 音乐id
     */
    submit_new_music_id(music_id) {
        this.send_message("play", {"music_id": music_id});
    }

    /**
     * 发送新的流地址 > new_stream_url
     * @param {string} stream_url 流地址
     */
    submit_new_stream_url(stream_url) {
        this.send_message("play", {"stream_url": stream_url});
    }
    
    /**
    * 发送当前进度条位置 > seek
     * @param {number} position 位置
    */
   submit_seek(position) {
       this.send_message("seek", {"position": position});
    }
    /**
     * 发送当前是否暂停 > pause
     * @param {boolean} is_pause 是否暂停
     */ 
    submit_pause(is_pause) {
        this.send_message("pause", {"is_playing": is_pause});
    }

    /**
     * 同步播放列表 > sync_playlist
     * @param {array} playlist 播放列表
     * @param {number} index 当前播放索引
     * @param {boolean} need_play_new 是否需要播放新歌曲(如果出现去除已有或正在播放的情况)
     */
    submit_sync_playlist_index(playlist,index,need_play_new=false) {
        this.send_message("sync_playlist", {"playlist": playlist,"index":index});
        if (need_play_new) this.submit_new_music_id(playlist[index].musicId);
    }
}
if (!window_top.tl_enevt_handler) {
    window_top.tl_enevt_handler = new tl_enevt_handler();
    console.log("register tl_enevt_handler")
}
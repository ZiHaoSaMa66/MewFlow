
var isAgentEnable = false;
var isRequestLock = false;

var agentApiUrl = null;
var agentApiKey = null;
var agentModel = null;
var baseLiked = null;

// 记录最近播放/切歌行为，用于后续判断场景和喜好
let agent_playHistory = {};
// {musicid: {songname,id,action(fullplay/unfull_play/next10,next30)}}
// 改成musicId好索引一点.

function init_agent_setting() {
  console.debug("init agent");
  let agentAllSettings = JSON.parse(window.getLocalStorageItem("agentAllSettings"))
  agentApiUrl = agentAllSettings.agentApiUrl
  agentApiKey = agentAllSettings.agentApiKey
  agentModel = agentAllSettings.agentModel

  agent_playHistory = JSON.parse(window.getLocalStorageItem("agentPlayHistory")) || {};

  baseLiked = window.getLocalStorageItem("agentBaseLiked");
  console.debug("init -> baseLiked = " + baseLiked);

}

// document.addEventListener('DOMContentLoaded', () => {
//   init_agent_setting()
// });



// let isFirstTimeShowForm = window.getLocalStorageItem("agentFTShowForm");

let y = 2;

var currentScene = "";
// 当前场景（会随用户行为更新）

// 当前播放队列（agent_play_queue）
// let agentPlayQueueHistory = [];



function startAgent(scene) {
  init_agent_setting()
  if (agentApiKey && agentApiUrl && agentModel) {
    isAgentEnable = !isAgentEnable
  } else {
    window.top.showNotification("请先在设置中配置Agent", 'error', 3000);
  }

  if (isAgentEnable == false) {
    window.top.showNotification("已关闭推荐电台..", "success", 2000);
    return;
  }
  console.debug(`获取到的场景${scene}`)

  window.top.playList = [];
  window.top.audio.src = '';
  window.top.showNotification("启动电台.. 将清空播放列表", 'success', 2000);

  currentScene = scene;

  // 问卷
  if (scene == 'stable') {
    window.top.openBlockOverPage("在推荐开始之前...", '')
    window.top.openBlockOverPage("在推荐开始之前...", './app_pages/agent_init_ask.html' +
      (baseLiked == '' || baseLiked == null ? '' : '?to_select_scene=1'));
  }
}

// var agent_blackLists_ListenBefore = [];
// 从x小时内听过
// var agent_blackLists_directNextSong = [];
// 当前场景的10秒内切歌
// 
// [{
//   "title": "...",
//   "album": "",
//   "artist": "",
//   "musicId":""
// }]



function formCallBackStart(baseLiked_, scene) {
  // if (baseLiked == [] && scene.length != 0) {
  //   // 为
  // }

  if (baseLiked_.length != 0) {
    baseLiked = baseLiked_.toString()
    window.setLocalStorageItem("agentBaseLiked", baseLiked_.toString());
  }

  // 填完问卷的回调
  window.top.closeBlockOverPage();

  // fitter = []
  // const fix = window.getLocalStorageItem("agentBaseLiked");
  currentScene = String(scene);
  console.debug("问卷回调传入参数 baseLiked >"+baseLiked)
  console.debug("问卷回调传入参数 currentScene >"+currentScene)

  run_onetime_push_music_workFlow(baseLiked,currentScene);
}

function run_onetime_push_music_workFlow(baseLiked, scene) {
  (async () => {
    let r_res = await window.top.api.getSongSortList(30, "DESC", "random", 0);
    let temp_saves = []
    let music_title_2_id_ray = {}

    for (const element of r_res) {
      try {
        const history_action = agent_playHistory[element.id].aciton
        const history_scene = agent_playHistory[element.id].scene
        if (history_action == "next10" ||
          (history_scene == scene &&
            (history_action == 'next10' || history_action == 'next30')
          )) {
          console.debug(`跳过了${element.title}的筛选`)
          continue;
        }
      } catch (error) {
        // console.debug(error);
        // console.debug("大概是没有这个歌曲的数据..");
      }

      const datas = {
        musicTitle: element.title,
        albumName: element.album,
        artistName: element.artist
      }
      temp_saves.push(datas);
      music_title_2_id_ray[element.title] = {
        id: element.id,
        album: element.album,
        artist: element.artist
      };
    };

    console.log(`基础筛选后剩余${temp_saves.length}首歌曲`);

    let p = [
      { role: 'system', content: buildAskAiPrompt(2, baseLiked, scene) },
      { role: 'user', content: JSON.stringify(temp_saves) }
    ]
    let llmresRaw = await callLLM_with_messages(p);

    // 调用示例返回值（字符串）
    // {
    //   "action": {
    //     "agent_play_queue": [
    //       { "song_name": "追风赶月的人", "priority": 1, "match_score": 95, "type": "main" },
    //       { "song_name": "Otto Croy", "priority": 2, "match_score": 88, "type": "backup" }
    //     ]
    //   },
    //   "msg_output": "..."
    // }

    // ① 判空
    if (!llmresRaw) {
      console.warn("LLM 返回为空，跳过播放队列构建");
      return;
    }

    // ② 安全解析 JSON 字符串
    let llmres;
    try {
      llmres = JSON.parse(llmresRaw);
    } catch (e) {
      console.error("LLM 返回 JSON 解析失败:", e, "\n原始内容:", llmresRaw);
      return;
    }

    // ③ 校验结构
    if (!llmres?.action?.agent_play_queue) {
      console.warn("LLM 返回缺少 action.agent_play_queue，跳过播放队列构建");
      return;
    }

    // ④ 倒序遍历 agent_play_queue，将音乐加入播放列表
    for (const element of llmres.action.agent_play_queue) {
      const song_ray_datas = music_title_2_id_ray[element.song_name];
      const id = song_ray_datas.id;
      // if (id) {
      //   agentPlayQueueHistory.push({ "song_name": element.song_name, "id": id });
      // }

      window.top.playList.push({
        CoverUrl: null,
        musicArtist: song_ray_datas.artist,
        musicId: id,
        musicTitle: element.song_name,
        musicAlbum: element.album,
        currentScene: currentScene,
      })
    }

    // 如果当前音乐元素没有src 即处于空闲状态的话
    if (window.top.audio.currentSrc == '') {
      // TODO: 就手动触发一下用音乐id播放函数
      const id = window.top.playList[0].musicId
      // 取
      window.top.playMusic_with_musicId(id)
    }

    // 直接追加的没有封面图 fix一下.
    window.top.fix_queue_ui_list_img_broken();

  }
  )();
}

// [{ role: 'system', content: '' },
// { role: 'user', content: '' }]
async function callLLM_with_messages(messages) {
  try {
    const result = await callLLM(
      agentApiUrl,
      // baseURL，不要以 /v1 结尾
      agentApiKey,
      // OpenAI API Key
      {
        model: agentModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: 5000,
        // stream: true,             
        // 如果不需要流式，可省略（默认false）
      }
    );

    console.log('回复:', result.choices[0].message.content);
    return result.choices[0].message.content
  } catch (error) {
    console.error('调用失败:', error.message);
    return null
  }
}

window.top.agent = {
  startAgent,
  formCallBackStart,
  callLLM_with_messages,
  agent_next_music_callback,
  run_onetime_push_music_workFlow,
  init_agent_setting,
}
// window.top.agent.formCallBackStart
// 检查现在播放列表还剩多少歌 歌曲数量小于等于2就接着推
function check_now_playList_leftSongs() {
  const i = window.top.currentIndex + 1;
  return window.top.playList.length - i;
}


function agent_next_music_callback() {
  if (!isAgentEnable) return;
  // 如果没开模式就跳过触发器

  const now = new Date();

  const next_timing = parseInt(window.top.audio.currentTime)
  const full_duration = parseInt(window.top.audio.duration)
  const before_song_info = window.top.playList[window.top.currentIndex]
  let action
  if (next_timing <= 10) {
    action = "next10"
  } else if (next_timing <= 30) {
    action = "next30"
  } else if (full_duration <= next_timing + 1) {
    action = "fullPlay"
  } else {
    action = "played"
  }

  agent_playHistory[before_song_info.musicId] = {
    musicId: before_song_info.musicId,
    artist: before_song_info.musicArtist,
    title: before_song_info.musicTitle,
    album: before_song_info.musicAlbum || "",
    currentScene: before_song_info.currentScene || "",
    aciton: action,
    trigerTiming: now.getTime(),
  }

  // push后保存一次
  window.setLocalStorageItem("agentPlayHistory",JSON.stringify(agent_playHistory));

  // 获取当前播放列表还剩多少歌
  if (check_now_playList_leftSongs() <= 2) {
    run_onetime_push_music_workFlow(baseLiked, currentScene)
  }
}

function buildAskAiPrompt(n, baseLiked, scene) {
  const now = new Date();
  const currentTimeStr = `${now.getHours()}点${now.getMinutes()}分`;

  return `
当前时间：${currentTimeStr}
当前所处场景：${scene != 'stable' ? scene : "无明确场景"}
用户基础喜好：${baseLiked || "暂无明确喜好，请优先推荐热门或通用好听的歌曲"}

请根据当前场景和用户喜好,推荐共${n * 2}首适合现在播放的歌曲(按照优先主推1首,备推1首的顺序)。
要求：
1. 优先推荐符合当前场景的歌曲（上课/下课/休息/运动等）
2. 考虑用户长期喜好和短期行为
3. 输出格式必须严格遵循以下示例JSON结构,不要输出任何多余文字:

{
  "action": {
    "agent_play_queue": [
      {"song_name": "歌曲名1", "priority": 1, "match_score": 95, "type": "main"},
      {"song_name": "歌曲名2", "priority": 2, "match_score": 80, "type": "backup"}
      {"song_name": "歌曲名3", "priority": 3, "match_score": 90, "type": "main"},
      {"song_name": "歌曲名4", "priority": 4, "match_score": 70, "type": "backup"}
    ]
  },
  "msg_output": "给用户的自然语言解释(可选)"
}
`;
}


async function callLLM(baseURL, apiKey, request) {
  const normalizedBaseURL = baseURL.replace(/\/+$/, '');
  const url = `${normalizedBaseURL}/v1/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      ...request,
      stream: request.stream ?? false,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`LLM API 错误: ${response.status} ${err}`);
  }
  return response.json();
}
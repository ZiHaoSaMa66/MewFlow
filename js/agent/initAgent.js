
var isAgentEnable = false;
var isRequestLock = false;

var agentApiUrl = null;
var agentApiKey = null;
var agentModel = null;

function init_agent_setting() {
  console.log("init agent");
  let agentAllSettings = JSON.parse(window.getLocalStorageItem("agentAllSettings"))
  agentApiUrl = agentAllSettings.agentApiUrl
  agentApiKey = agentAllSettings.agentApiKey
  agentModel = agentAllSettings.agentModel
}

// document.addEventListener('DOMContentLoaded', () => {
//   init_agent_setting()
// });


let baseLiked = window.getLocalStorageItem("agentBaseLiked");
// let isFirstTimeShowForm = window.getLocalStorageItem("agentFTShowForm");

let y = 2;

var currentScene = "";
// 当前场景（会随用户行为更新）

// 当前播放队列（agent_play_queue）
let agentPlayQueueHistory = [];

// 记录最近播放/切歌行为，用于后续判断场景和喜好
let playHistory = [];

function startAgent(scene) {
  init_agent_setting()
  if (agentApiKey && agentApiUrl && agentModel) {
    isAgentEnable = !isAgentEnable
  } else {
    window.top.showNotification("请先在设置中配置Agent", 'error', 3000);
  }

  if (isAgentEnable == false) { return; }
  console.log(`获取到的场景${scene}`)

  // 问卷
  // if (scene == 'stable') {
  window.top.openBlockOverPage("在推荐开始之前...", '')
  window.top.openBlockOverPage("在推荐开始之前...", './app_pages/agent_init_ask.html' +
    (baseLiked == '' || baseLiked == null ? '' : '?to_select_scene=1'));
  // }

}

var agent_blackLists_ListenBefore = [];
// 从x小时内听过
var agent_blackLists_directNextSong = [];
// 当前场景的10秒内切歌
// 
// [{
//   "title": "...",
//   "album": "",
//   "artist": "",
//   "musicId":""
// }]

function formCallBackStart(baseLiked, scene) {
  // if (baseLiked == [] && scene.length != 0) {
  //   // 为
  // }

  // 填完问卷的回调
  window.top.closeBlockOverPage();

  // fitter = []

  // currentScene = toString(scene);

  (async () => {
    let r_res = await window.top.api.getSongSortList(30, "DESC", "random", 0);
    // [{
    //   "orderTitle":"",
    //   "album":"",
    //   "artist":"",
    // }]
    let temp_saves = []
    let music_title_2_id_ray = {}

    for (const element of r_res) {
      const datas = {
        musicTitle: element.title,
        albumName: element.album,
        artistName: element.artist
      }
      temp_saves.push(datas);
      music_title_2_id_ray[element.title] = element.id;
    }

    // console.warn(temp_saves)
    // console.warn(music_title_2_id_ray)
    let p = [
      { role: 'system', content: buildAskAiPrompt(1, baseLiked, scene) },
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
    for (let i = llmres.action.agent_play_queue.length - 1; i >= 0; i--) {
      const element = llmres.action.agent_play_queue[i];
      const id = music_title_2_id_ray[element.song_name];
      if (id) {
        agentPlayQueueHistory.push({ "song_name": element.song_name, "id": id });
      }
      window.top.playList.push({
        CoverUrl: null,
        musicArtist: null,
        musicId: id,
        musicTitle: null
      })
    }
    // 如果当前音乐元素没有src 即处于空闲状态的话
    if (window.top.audio.currentSrc == '') {
      // TODO: 就手动触发一下用音乐id播放函数

    }

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
  formCallBackStart
}
// window.top.agent.formCallBackStart

function buildAskAiPrompt(n, baseLiked, scene) {
  const now = new Date();
  const currentTimeStr = `${now.getHours()}点${now.getMinutes()}分`;

  return `
当前时间：${currentTimeStr}
当前所处场景：${scene != 'stable' ? scene : "无明确场景"}
用户基础喜好：${baseLiked || "暂无明确喜好，请优先推荐热门或通用好听的歌曲"}

请根据当前场景和用户喜好,推荐${n}*2首适合现在播放的歌曲(优先主推1首,备推1首)。
要求：
1. 优先推荐符合当前场景的歌曲（上课/下课/休息/运动等）
2. 考虑用户长期喜好和短期行为
3. 输出格式必须严格遵循以下JSON结构,不要输出任何多余文字:

{
  "action": {
    "agent_play_queue": [
      {"song_name": "歌曲名1", "priority": 1, "match_score": 95, "type": "main"},
      {"song_name": "歌曲名2", "priority": 2, "match_score": 88, "type": "backup"}
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
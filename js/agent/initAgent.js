var isAgentEnable = false;
var isRequestLock = false;

let agentApiUrl = window.getLocalStorageItem("agentApiUrl");
let agentApiKey = window.getLocalStorageItem("agentApiKey");
let baseLiked = window.getLocalStorageItem("agentBaseLiked");

let y = 2;

let currentScene = "";
// 当前场景（会随用户行为更新）

// 当前播放队列（agent_play_queue）
let agentPlayQueue = [];

// 记录最近播放/切歌行为，用于后续判断场景和喜好
let playHistory = [];

function startAgent(scene) {
    if (agentApiKey && agentApiUrl) {
        isAgentEnable = !isAgentEnable
        if (isAgentEnable == false) return;
    } else {
        window.top.showNotification("请先在设置中配置ApiUrl和Key", 'error', 3000)
    }


    // 问卷
    openBlockOverPage("")

}

function buildAskAiPrompt() {
    const now = new Date();
    const currentTimeStr = `${now.getHours()}点${now.getMinutes()}分`;

    return `
当前时间：${currentTimeStr}
当前所处场景：${currentScene == 'stable' ? currentScene : "无明确场景"}
用户基础喜好：${baseLiked || "暂无明确喜好，请优先推荐热门或通用好听的歌曲"}

请根据当前场景和用户喜好,推荐n*2首适合现在播放的歌曲(优先主推1首,备推1首)。
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
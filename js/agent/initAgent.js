var isAgentEnable = false;
var isRequestLock = false;

let agentApiUrl = window.getLocalStorageItem("agentApiUrl");
let agentApiKey = window.getLocalStorageItem("agentApiKey");

function startAgent() {
    if (agentApiKey && agentApiUrl) {
        isAgentEnable = !isAgentEnable
        if (isAgentEnable == false) return;
    } else {
        window.top.showNotification("请先在设置中配置ApiUrl和Key",'error',3000)
    }

    


}

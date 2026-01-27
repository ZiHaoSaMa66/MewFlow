function miaoplay_entry() {
    // showNotification("非开发环境,请自行完成配置", "error", 3500)
    setLocalStorageItem("server_url","http://103.239.245.46:41128");
    setLocalStorageItem("username","debuger");
    setLocalStorageItem("password","test123!");
    showNotification("以内置的服务器账号启动","info",1500)
    
}


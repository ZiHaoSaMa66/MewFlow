function loginSaveConfig() {

    const su = document.getElementById("server_url");
    const un = document.getElementById("username");
    const pd = document.getElementById("password");

    setLocalStorageItem('server_url', su.value);
    setLocalStorageItem('username', un.value);
    setLocalStorageItem('password', pd.value);

    parent.init();

}


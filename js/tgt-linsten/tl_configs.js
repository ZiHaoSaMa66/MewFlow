
function save_tl_config(url,user_name,room_id) {

    let ipt_server_url = url || document.getElementById("tl_ws_server_url").value;
    let ipt_user_name = user_name || document.getElementById("tl_user_name").value;
    let ipt_room_id = room_id || document.getElementById("tl_room_id").value;

    tl_server_url = ipt_server_url;
    tl_room_id = ipt_room_id;
    tl_user_name = ipt_user_name;

    window_top.tl_server_url = ipt_server_url;
    window_top.tl_room_id = ipt_room_id;
    window_top.tl_user_name = ipt_user_name;

    localStorage.setItem("mf_tl_server_url", ipt_server_url);
    localStorage.setItem("mf_tl_user_name", ipt_user_name);
    localStorage.setItem("mf_tl_room_id", ipt_room_id);
}

function load_tl_config() {
    let ipt_server_url = localStorage.getItem("mf_tl_server_url");
    let ipt_user_name = localStorage.getItem("mf_tl_user_name");
    let ipt_room_id = localStorage.getItem("mf_tl_room_id");

    if (ipt_server_url) {
        document.getElementById("tl_ws_server_url").value = ipt_server_url;
    }
    if (ipt_user_name) {
        document.getElementById("tl_user_name").value = ipt_user_name;
    }
    if (ipt_room_id) {
        document.getElementById("tl_room_id").value = ipt_room_id;
    }
}

function get_dev_tl_server_url() {
    return "ws://192.168.16.109:8000/tolisten/ws/";
}

function get_online_tl_server_url() {
    // return get_dev_tl_server_url()
    return "ws://103.40.13.47:59990/tolisten/ws/"
}

function dbg_config_tl(){
    tl_server_url = get_online_tl_server_url();
    tl_room_id = "r101";
    tl_user_name = "ZiHao";
}
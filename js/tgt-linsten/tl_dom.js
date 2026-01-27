function hide_tl_config() {
    let e = document.getElementsByClassName("configs")
    let r = document.getElementsByClassName("room_status")
    pass_if(e,r,"none","flex");
}

function pass_if(e,r,set_style,set2_style){
    if (e.length > 0){
        e[0].style.display = set_style;
    }
    if (r.length > 0){
        r[0].style.display = set2_style;
    }
}

function show_tl_config() {
    let e = document.getElementsByClassName("configs");
    let r = document.getElementsByClassName("room_status");
    pass_if(e,r,"flex","none");
}
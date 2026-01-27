
function init_sort_func() {

    let saved_sort_order = parent.getLocalStorageItem("library_sort_order");
    
    let saved_sort_func = parent.getLocalStorageItem("library_sort_func");

    if (saved_sort_order != null && saved_sort_func!= null && saved_sort_order!= "" && saved_sort_func!= "") {
        setCurrSortOrder(saved_sort_order);
        setCurrSortFunc(saved_sort_func);
    }

}

function getCurrentSortFunc() {
    const selectElement = document.getElementById('sortFunc');
    const selectedValue = selectElement.value;
    console.debug(`当前选择的排序顺序是: ${selectedValue}`);
    parent.setLocalStorageItem("library_sort_func", selectedValue);
    return selectedValue;
}

function getCurrentSortOrder() {
    const selectElement = document.getElementById('sortOrder');
    const selectedValue = selectElement.value;
    console.debug(`当前选择的排序依据是: ${selectedValue}`);
    parent.setLocalStorageItem("library_sort_order", selectedValue);
    return selectedValue;
}

function setCurrSortFunc(sortFunc) {
    const selectElement = document.getElementById('sortFunc');
    selectElement.value = sortFunc;
    // console.debug(`当前选择的排序顺序是: ${sortFunc}`);
    parent.setLocalStorageItem("library_sort_func", sortFunc);
}

function setCurrSortOrder(sortOrder) {
    const selectElement = document.getElementById('sortOrder');
    selectElement.value = sortOrder;
    // console.debug(`当前选择的排序依据是: ${sortOrder}`);
    parent.setLocalStorageItem("library_sort_order", sortOrder);
}
$(document).ready(function() {
    $('#add-wish-list').on('click', addToWishList);

});

var listFavorProducts = [];

function toast(title, msg, type = 'info') {
    $.toast({
        heading: title,
        text: msg,
        showHideTransition: 'plain',
        icon: type,
        position: 'bottom-right',
    });
}

function addToWishList() {
    console.log("add to wish list");
    var cart = $(this).data('cart');
    var product = $(this).data('product');
    var sessionID = $(this).data('seasonid');

    if (cart !== null) {
        listFavorProducts = cart.listFavorProducts;
    };
    const added = checkProductInList(product, listFavorProducts);
    if (!added) {
        listFavorProducts.push(product);
        let data = {
            sessionID: sessionID,
            listFavorProducts: listFavorProducts
        }
        $.ajax({
            url: `/api/updateFavor`,
            dataType: "json",
            data: data,
            method: 'POST',
            success: function(data) {
                if (data.success) {
                    toast('Thông báo', 'Thêm thành công !', 'success');
                    $('#wish-list-length').text(listFavorProducts.length);
                } else {
                    toast('Thông báo', 'Lỗi hệ thống !', 'error');
                }
            }
        });

    } else {
        toast('Thông báo', 'Sản phẩm đã tồn tại trong danh sách ưa thích của bạn ', 'info');
    }
}



function checkProductInList(product, list) {
    let result = false;
    list.forEach(item => {
        if (item._id == product._id) {
            result = true;
        }
    });
    return result;
}
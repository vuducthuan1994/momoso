$(document).ready(function() {
    $('#submitFromFooter').on('click', function() {
        const email = ($('#subscribe_email').val());
        submitSubscribeHandler(email);
    });
    $('#submitFromModal').on('click', function() {
        const email = $('.modalSubscribe input').val();

        submitSubscribeHandler(email)
    });
    $('#newsletter-permission').on('input', function() {
        const isShowPopup = $('#newsletter-permission').is(':checked');
        if (isShowPopup) {
            localStorage.setItem('isShowPopup', false);
        }
    });
    $('.show-quick-modal').on('click', function() {
        const productID = $(this).data('idproduct');
        getProductById(productID);
    });
    getPriceVND();
});

function getPriceVND() {
    $('.product-price-vnd').each(function(index, element) {
        var price = parseInt($(this).data('price'));
        price = price.toLocaleString('it-IT', { style: 'currency', currency: 'VND' });
        $(this).text(price);
    });
}

function showToastSubscribe() {
    // https://github.com/kamranahmedse/jquery-toast-plugin
    $.toast({
        text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Hic, consequuntur doloremque eveniet eius eaque dicta repudiandae illo ullam. Minima itaque sint magnam dolorum asperiores repudiandae dignissimos expedita, voluptatum vitae velit.",
        hideAfter: false
    });
}

function validateEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

function toast(title, msg, type = 'info') {
    $.toast({
        heading: title,
        text: msg,
        showHideTransition: 'plain',
        icon: type,
        position: 'bottom-right',
    });
}


function resetDataModalProduct() {
    const myNode = document.getElementById("modal-product-images");
    myNode.textContent = '';
    // const myNode1 = document.getElementById("thumb-menu-owl");
    // myNode1.textContent = '';
    // $('#thumb-menu-owl').removeClass('owl-loaded');
    // $('#thumb-menu-owl').removeClass('owl-drag');
}

function getProductById(id) {
    $.ajax({
        url: `/api/product/${id}`,
        method: 'GET',
        success: function(data) {
            if (data.success) {
                resetDataModalProduct();
                $('#modal-product-name').text(data.data.name);
                $('#modal-product-price').text(data.data.price);
                $('#modal-product-total-review').text(data.data.totalReview);
                $('#modal-product-price').attr('data-price', data.data.price);
                $('#modal-product-code').text(data.data.code);
                $('#modal-product-point').text(data.data.point);
                let htmlOWL = '';
                data.data.listImages.forEach((value, index) => {
                    let imageItem = `<div id="thumb${index+1}" class="tab-pane ${index == 0 ? 'fade in active' : 'fade'}">
                <img src="${value}" alt="product-thumbnail" /> </div>`

                    let owl_item = `<div  ${index == 0 ? 'class="active"' : ''}> <a data-toggle="tab" href="#thumb${index+1}"> <img src="${value}"
                    alt="product-thumbnail"></a> </div>`
                    $('#modal-product-images').append(imageItem);
                    htmlOWL += owl_item;
                });
                $('.thumb-menu').trigger('replace.owl.carousel', htmlOWL).trigger('refresh.owl.carousel');
                getPriceVND();
                console.log(data);
                $('#myModal').modal('show');
            } else {
                toast('Thông báo', 'Hệ thống đang gặp sự cố, vui lòng thử lại sau', 'info')
            }
        }
    });
}

function submitSubscribeHandler(email) {
    if (!email || !(validateEmail(email))) {
        toast('Thông báo', 'Vui lòng nhập đúng địa chỉ email !', 'warning');
    } else {
        let data = {
            email: email
        }
        $.ajax({
            url: '/api/subscribe',
            dataType: "json",
            data: data,
            method: 'POST',
            success: function(data) {
                $(".popup_wrapper").fadeOut(500);
                if (data.success) {
                    toast('Thông báo', 'Cám ơn bạn đã subscibe !', 'success');
                } else {
                    toast('Thông báo', 'Email này đã được subscibe', 'info');
                }
            }
        });
    }

}
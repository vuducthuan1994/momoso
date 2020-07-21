$(document).ready(function() {


    initFilterPrice();
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
    $('.pro-desc-list').on('click', '.button-color', setActiveColor);
    $('.pro-desc-list').on('click', '.button-size', setActiveSize);
    getPriceVND();
    initPageSizeForCategory();
    initSortByForCategory();
    initSelectPage();

});
var R_BASE_IMAGE_QUICK_VIEW = 'https://momostudio.vn';

function setActiveColor() {
    $(this).parent().find('li').removeClass('active');
    $(this).addClass('active');
    const idActive = $(this).find('a').attr('href');
    $(idActive).parent().find('div').removeClass('active in');
    $(idActive).addClass('active in');

}

function setActiveSize() {
    $(this).parent().parent().find('li').removeClass('active');
    $(this).parent().addClass('active');
}

function initFilterPrice() {
    initMinValue = $("#minPrice").data('price');
    initMaxValue = $("#maxPrice").data('price');
    if (initMinValue !== undefined && initMaxValue !== undefined) {
        $("#minPrice").text(initMinValue.toLocaleString('it-IT', { style: 'currency', currency: 'VND' }));
        $("#maxPrice").text(initMaxValue.toLocaleString('it-IT', { style: 'currency', currency: 'VND' }));
        $("#slider-range").slider({
            range: true,
            min: 100000,
            max: 3000000,
            step: 10000,
            values: [initMinValue, initMaxValue],
            slide: function(event, ui) {
                var minPrice = parseInt(ui.values[0]);
                var maxPrice = parseInt(ui.values[1]);
                $("#minPrice").attr('data-price', minPrice);
                $("#maxPrice").attr('data-price', maxPrice);
                let url = replaceUrlParam(window.location.href, 'minPrice', minPrice);
                url = replaceUrlParam(url, 'maxPrice', maxPrice);
                $('#submitPrice').attr('href', url);
                $("#minPrice").text(minPrice.toLocaleString('it-IT', { style: 'currency', currency: 'VND' }));
                $("#maxPrice").text(maxPrice.toLocaleString('it-IT', { style: 'currency', currency: 'VND' }));
            }
        });
    }

}

function initPageSizeForCategory() {
    if ($('#pageSizeCategory').length) {
        document.getElementById("pageSizeCategory").addEventListener("change", function(event) {
            location.href = event.target.value;
        });
        $('#pageSizeCategory option').each(function(index, element) {
            const pageSize = $(this).attr('value');
            let url = replaceUrlParam(window.location.href, 'pageSize', pageSize);
            $(this).attr('value', url);
        });
    }

}

function initSortByForCategory() {
    if ($('#shorter').length) {
        document.getElementById("shorter").addEventListener("change", function(event) {
            location.href = event.target.value;
        });
        $('#shorter option').each(function(index, element) {

            const sortType = $(this).attr('value');
            var baseUrl = window.location.href.substring(0, window.location.href.indexOf('?'));

            let url = replaceUrlParam(baseUrl, 'sortType', sortType);
            $(this).attr('value', url);
        });
    }
}

function initSelectPage() {
    $('.page-container li a').each(function(index, element) {
        currentUrl = window.location.href;
        var page = $(this).data('page');
        var newUrl = replaceUrlParam(currentUrl, 'page', page);
        $(this).attr('href', newUrl);
    });
}



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
}

function getProductById(id) {
    $.ajax({
        url: `/api/product/${id}`,
        method: 'GET',
        success: function(data) {
            if (data.success) {
                $('#quick-view-add-to-cart').attr('data-product', JSON.stringify(data.data));
                $('#quick-view-add-to-wishlish').attr('data-product', JSON.stringify(data.data));
                resetDataModalProduct();
                $('#modal-product-name').text(data.data.name);
                $('#modal-product-price').text(data.data.price);
                $('#modal-product-total-review').text(data.data.totalReview);
                $('#modal-product-price').attr('data-price', data.data.price);
                $('#modal-product-code').text(data.data.code);
                // $('#modal-product-point').text(data.data.point);
                $('#modal-product-status').text(data.data.quantity > 0 ? 'Sẵn hàng' : 'Hàng Order');
                let htmlOWL = '';
                data.data.listImages.forEach((imageURL, index) => {
                    imageURL = R_BASE_IMAGE_QUICK_VIEW + imageURL;
                    let imageItem = `<div id="thumb${index+1}" class="tab-pane ${index == 0 ? 'fade in active' : 'fade'}">
                    <img src="${imageURL}" alt="product-thumbnail" /> </div>`

                    let owl_item = `<div  ${index == 0 ? 'class="active"' : ''}> <a data-toggle="tab" href="#thumb${index+1}"> <img src="${imageURL}"
                    alt="product-thumbnail"></a> </div>`
                    $('#modal-product-images').append(imageItem);
                    htmlOWL += owl_item;
                });
                let listImageHTML = '';
                data.data.blocksColor.forEach((colorItem, index) => {
                    if (colorItem.listImages && colorItem.listImages.length > 0) {

                        const imageColorUrl = R_BASE_IMAGE_QUICK_VIEW + colorItem.listImages[0];
                        listImageHTML += ` <li data-code = "${colorItem.colorCode}" class = 'button-color'><a  data-toggle="tab" href="#thumb${data.data.listImages.length +  index + 1}">  <img alt="product-thumbnail" src ="${imageColorUrl}"> </a></li>`



                        let imageItem = `<div id="thumb${data.data.listImages.length + index + 1 }" class="tab-pane fade">
                        <img src="${imageColorUrl}" alt="product-thumbnail" /> </div>`
                        $('#modal-product-images').append(imageItem);
                    }
                });
                let listSizeHTML = '';
                data.data.blocksSize.forEach((sizeItem, index) => {


                    listSizeHTML += `<li data-code = "${sizeItem.sizeCode}" >
                        <button class="btn button-size">${sizeItem.sizeName}</button>
                       </li>`

                });

                $('#quick-view-listColor ul').html(listImageHTML);
                $('#quick-view-listSize ul').html(listSizeHTML);
                $('#thumb-menu-owl').owlCarousel({
                    loop: false,
                    navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
                    margin: 15,
                    smartSpeed: 1000,
                    nav: true,
                    dots: false,
                    responsive: {
                        0: {
                            items: 4
                        },
                        600: {
                            items: 4
                        },
                        1000: {
                            items: 4
                        }
                    }
                })

                $('#thumb-menu-owl').trigger('replace.owl.carousel', htmlOWL).trigger('refresh.owl.carousel');
                getPriceVND();
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

function replaceUrlParam(url, paramName, paramValue) {
    if (paramValue == null) {
        paramValue = '';
    }
    var pattern = new RegExp('\\b(' + paramName + '=).*?(&|#|$)');
    if (url.search(pattern) >= 0) {
        return url.replace(pattern, '$1' + paramValue + '$2');
    }
    url = url.replace(/[?#]$/, '');
    return url + (url.indexOf('?') > 0 ? '&' : '?') + paramName + '=' + paramValue;
}
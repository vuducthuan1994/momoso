
$(document).ready(function () {


    initFilterPrice();
    $('#submitFromFooter').on('click', function () {
        const email = ($('#subscribe_email').val());
        submitSubscribeHandler(email);
    });
    $('#btn-search-product-desktop').on('click', function () {
        if ($('#formSearchProduct input').val()) {
            document.getElementById("formSearchProduct").submit();
        }
    });

    $('#btn-search-product-mobile').on('click', function () {
        if ($('#form-search-produc-mobile input').val()) {
            document.getElementById("form-search-produc-mobile").submit();
        }
    });

    $('#submitFromModal').on('click', function () {
        const email = $('.modalSubscribe input').val();

        submitSubscribeHandler(email)
    });
    $('#newsletter-permission').on('input', function () {
        const isShowPopup = $('#newsletter-permission').is(':checked');
        if (isShowPopup) {
            localStorage.setItem('isShowPopup', false);
        }
    });
 

    getPriceVND();
    initPageSizeForCategory();
    initSortByForCategory();
    initSelectPage();

});
var R_BASE_IMAGE_QUICK_VIEW = 'https://momostudio.vn';



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
            slide: function (event, ui) {
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
        document.getElementById("pageSizeCategory").addEventListener("change", function (event) {
            location.href = event.target.value;
        });
        $('#pageSizeCategory option').each(function (index, element) {
            const pageSize = $(this).attr('value');
            let url = replaceUrlParam(window.location.href, 'pageSize', pageSize);
            $(this).attr('value', url);
        });
    }

}

function initSortByForCategory() {
    if ($('#shorter').length) {
        document.getElementById("shorter").addEventListener("change", function (event) {
            location.href = event.target.value;
        });
        $('#shorter option').each(function (index, element) {

            const sortType = $(this).attr('value');
            var baseUrl = window.location.href.substring(0, window.location.href.indexOf('?'));

            let url = replaceUrlParam(baseUrl, 'sortType', sortType);
            $(this).attr('value', url);
        });
    }
}

function initSelectPage() {
    $('.page-container li a').each(function (index, element) {
        currentUrl = window.location.href;
        var page = $(this).data('page');
        var newUrl = replaceUrlParam(currentUrl, 'page', page);
        $(this).attr('href', newUrl);
    });
}



function getPriceVND() {
    $('.product-price-vnd').each(function (index, element) {
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
            success: function (data) {
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


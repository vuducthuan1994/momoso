require('dotenv').config();
var url = require('url');
var uslug = require('uslug');

function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}

function getProtocol(req) {
    var proto = req.connection.encrypted ? 'https' : 'http';
    // only do this if you trust the proxy
    proto = req.headers['x-forwarded-proto'] || proto;
    return proto.split(/\s*,\s*/)[0];
}

function convertNumber(num, digits) {
    var si = [
        { value: 1, symbol: "" },
        { value: 1E3, symbol: "k" },
        { value: 1E6, symbol: "M" },
        { value: 1E9, symbol: "G" },
        { value: 1E12, symbol: "T" },
        { value: 1E15, symbol: "P" },
        { value: 1E18, symbol: "E" }
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}
module.exports = {
    buildFullDomain(link) {
        if (link == '#') {
            return 'Chưa upload file !';
        }
        return process.env.DOMAIN + link;
    },
    createSlugFromTitle: function(title, link) {
        var slugFromTitle = uslug(title, { lower: true });
        var id = youtube_parser(link);
        return '/' + process.env.R_VIDEO + '/' + id + '/' + slugFromTitle;
    },
    convertNumber: function(num, digits) {
        var si = [
            { value: 1, symbol: "" },
            { value: 1E3, symbol: "k" },
            { value: 1E6, symbol: "M" },
            { value: 1E9, symbol: "G" },
            { value: 1E12, symbol: "T" },
            { value: 1E15, symbol: "P" },
            { value: 1E18, symbol: "E" }
        ];
        var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        var i;
        for (i = si.length - 1; i > 0; i--) {
            if (num >= si[i].value) {
                break;
            }
        }
        return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
    },

    convertDescription: function(string) {
        if (string == null || string == '' || string == undefined) {
            return string;
        }
        return string.replace('\n', '<br>');
    },
    createShareFbLink(url) {
        const BASE_URL = 'https://www.facebook.com/sharer/sharer.php?u=';
        return BASE_URL + url;
    },
    createTwitterShareLink(url) {
        const BASE_URL = 'https://twitter.com/share?url=';
        return BASE_URL + url;
    },
    fullUrlFromRequest(req) {
        return decodeURIComponent(url.format({
            protocol: getProtocol(req),
            host: req.get('host'),
            pathname: req.originalUrl
        }));
    },
    buildRouteDownloadDetail(id, title) {
        var slugFromTitle = uslug(title, { lower: true });
        const url = '/' + process.env.R_DOWNLOAD + '/' + id + '/' + slugFromTitle;
        return url;
    },
    decodeString(str) {
        if (str == null || str == '' || str == undefined) {
            return str;
        }
        return str.replace(/(?:\r\n|\r|\n)/g, '<br>');
    },
    convertStringToNumber(str) {
        if (str == null || str == '' || str == undefined) {
            return 0;
        }
        let view_count = str.replace('views', '').trim();
        view_count = view_count.split(',').join('');
        const result = view_count ? convertNumber(parseInt(view_count), 2) : 0;
        return result;
    },
    createLinkYoutube(videoId) {
        return 'https://www.youtube.com/watch?v=' + videoId;
    },
    checkLength(array) {
        if (array.length <= 0) {
            return true;
        }
        return false
    },
    timeDifference(previous) {
        const current = new Date().getTime();
        var msPerMinute = 60 * 1000;
        var msPerHour = msPerMinute * 60;
        var msPerDay = msPerHour * 24;
        var msPerMonth = msPerDay * 30;
        var msPerYear = msPerDay * 365;

        var elapsed = current - previous;

        if (elapsed < msPerMinute) {
            return Math.round(elapsed / 1000) + ' seconds ago';
        } else if (elapsed < msPerHour) {
            return Math.round(elapsed / msPerMinute) + ' minutes ago';
        } else if (elapsed < msPerDay) {
            return Math.round(elapsed / msPerHour) + ' hours ago';
        } else if (elapsed < msPerMonth) {
            return 'approximately ' + Math.round(elapsed / msPerDay) + ' days ago';
        } else if (elapsed < msPerYear) {
            return 'approximately ' + Math.round(elapsed / msPerMonth) + ' months ago';
        } else {
            return 'approximately ' + Math.round(elapsed / msPerYear) + ' years ago';
        }
    },
    checkNull(str) {
        if (str == null || str == '' || str == undefined) {
            return 'recently';
        }
        return str;
    },
    objectToString(obj) {
        return JSON.stringify(obj);
    },
    createWishLishURL() {
        return process.env.FAVOR_LIST;
    },
    createCartDetailURL() {
        return process.env.CART;
    },
    createURLProduct(urlSeo) {
        return `${process.env.PRODUCT}/${urlSeo}`
    },
    formatDate(dt) {
        return (`${
            (dt.getMonth()+1).toString().padStart(2, '0')}/${
            dt.getDate().toString().padStart(2, '0')}/${
            dt.getFullYear().toString().padStart(4, '0')} ${
            dt.getHours().toString().padStart(2, '0')}:${
            dt.getMinutes().toString().padStart(2, '0')}:${
            dt.getSeconds().toString().padStart(2, '0')}`);
    },
    createFieldName(index, data) {
        // console.log(data);
        return data.replace('0', index);
    },
    bytesToSize(bytes) {

        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    },
    checked(currentValue) {
        if (currentValue == 'off') {
            return '';
        }
        if (currentValue == 'on') {
            return 'checked';
        }
        return currentValue ? 'checked' : '';
    },
    checkTypeCategory1(type) {
        if (type == 'small') {
            return 'col-sm-4'
        } else {
            return 'col-sm-8'
        }
    },
    checkTypeCategory2(type) {
        if (type == 0 || type == 1 || type == 5 || type == 6 || type == 9 || type == 10) {
            return 'single-banner zoom mb-30'
        } else {
            return 'single-banner zoom'
        }
    },
    getAvatarImage(type, listImages) {
        if (type == 'primary') {
            return listImages.length > 0 ? process.env.R_BASE_IMAGE + listImages[0] : `/img/new-products/1_2.jpg`;
        } else {
            return listImages.length > 1 ? process.env.R_BASE_IMAGE + listImages[1] : listImages.length > 0 ? process.env.R_BASE_IMAGE + listImages[0] : '/img/new-products/1_2.jpg';
        }
    },
    getActiveCategory(value1, value2) {
        if (value1 == value2) {
            return 'active'
        }
        return '';

    },
    fullPathImage(url) {
        return process.env.R_BASE_IMAGE + url;
    },
    getActiveProductImage(listImages) {
        return listImages.length > 0 ? process.env.R_BASE_IMAGE + listImages[0] : '/img/new-products/1_2.jpg';
    },
    getTotalPrice(listProducts) {
        let total = 0;
        if (listProducts !== null && listProducts !== undefined) {
            listProducts.forEach(element => {
                total = element.quantity * (parseInt(total) + parseInt(element.price));
            });
        }
        return total;
    },
    selected(option, value) {
        if (option && value) {
            return option.toLowerCase() == value.toLowerCase() ? 'selected' : '';
        } else {
            if (option == 'new') {
                return 'selected';
            }
        }
    },
    createPostDetailURL(urlSeo) {
        return process.env.R_DOMAIN + process.env.POST + '/' + urlSeo;
    },

    typeImageSelected(value, optionValue) {
        if (value == optionValue) {
            return 'selected';
        } else {
            return '';
        }
    },
    checkCategoryShow(value) {
        if (value == 'on') {
            return ' <span class = "text-success" > Đã hiển thị trên trang chủ</span> ';
        } else {
            return ' <span class = "text-danger" > Đã ẩn khỏi trang chủ</span> ';
        }
    },
    typeParentSelected(value, optionValue) {
        if (optionValue && value == optionValue.toString()) {
            return 'selected';
        } else {
            return '';
        }
    },
    getStatusPost(isPublic) {
        if (isPublic) {
            return 'Đã xuất bản';
        } else {
            return "Nháp";
        }
    },
    buildActionPosts(id) {
        if (id == null || id == undefined) {
            return '/admin/posts';
        } else {
            return (`/admin/posts/edit-post/${id}`)
        }
    },
    buildActionBanner(id) {
        if (id == null || id == undefined) {
            return '/admin/config/banner';
        } else {
            return (`/admin/config/banner/edit-banner/${id}`)
        }
    },
    buildActionStorage(id) {
        if (id == null || id == undefined) {
            return '/admin/storage';
        } else {
            return (`/admin/storage/edit-storage/${id}`)
        }
    },
    buildActionCategory(id) {
        if (id == null || id == undefined) {
            return '/admin/category';
        } else {
            return (`/admin/category/edit-category/${id}`)
        }
    },
    productTotalSub(quantity, price) {
        return quantity * price;
    },
    buildActionCategoryPost(id) {
        if (id == null || id == undefined) {
            return '/admin/category-post';
        } else {
            return (`/admin/category-post/edit-category/${id}`)
        }
    },
    buildActionInstagram(id) {
        if (id == null || id == undefined) {
            return '/admin/instagram';
        } else {
            return (`/admin/instagram/edit-instagram/${id}`)
        }
    },
    getDescriptionArtiles(description) {
        var result = description.substring(0, 85) + '...';
        return result;
    },
    getPostDetailDate(dt) {
        return `<span>${dt.getDate().toString().padStart(2, '0')}</span> Tháng ${(dt.getMonth()+1).toString().padStart(2, '0')}`;
    },
    getDateArtiles(dt) {
        return `${dt.getDate().toString().padStart(2, '0')}-${(dt.getMonth()+1).toString().padStart(2, '0')}-${dt.getFullYear().toString().padStart(4, '0')}`
    },
    getFormattedDate(date) {
        let year = date.getFullYear().toString().padStart(2, '0');
        let month = (1 + date.getMonth()).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0');

        return day + '/' + month + '/' + year;
    },
    getStar(rate) {
        let result = '';
        const rating = Math.ceil(rate);
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                result += `<i class="fa fa-star"></i>`;
            } else {
                result += `<i class="fa fa-star-o"></i>`;
            }
        }
        return result;
    },
    ifEquals(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    },
    ifBigger(arg1, arg2, options) {
        return (arg1 >= arg2) ? options.fn(this) : options.inverse(this);
    },
    createURLCategory(url) {
        return process.env.R_DOMAIN + process.env.CATEGORY_PRODUCT + '/' + url;
    },
    getTotalPage(totalProduct, pageSize) {
        const totalPage = totalProduct / pageSize;

        if (Number(totalPage) === totalPage && totalPage % 1 === 0) {
            return totalPage;
        } else {
            return Math.floor(totalPage) + 1;
        }
    },
    createNumberNextPage(currentPage, next) {
        return currentPage + next;
    },
    createNumberPrevPage(currentPage, prev) {
        return currentPage - prev;
    },
    checkNextPage(currentPage, pageSize, totalProduct, options) {
        if (pageSize * (currentPage) < totalProduct) {
            return options.fn(this)
        } else {
            return options.inverse(this);
        }
    },
    initPageSize(pageSize, value) {
        if (pageSize == value) {
            return 'selected';
        }
        return '';
    },
    initSortType(sortType, value) {
        if (sortType == value) {
            return 'selected';
        }
        return '';
    },
    getMoney(price, count) {
        return JSON.parse(price) * JSON.parse(count);
    },
    createThumbCartImage(url) {
        if (url) {
            return process.env.R_BASE_IMAGE + url;
        } else {
            return '/img/menu/1.jpg'
        }
    }

}
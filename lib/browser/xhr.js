// commonjscript XMLHttpRequest client
// @see http://wiki.commonjs.org/wiki/HTTP_Client/B

exports.XMLHttpRequest = function () {
    return new ActiveXObject("MSXML2.ServerXMLHTTP");
};

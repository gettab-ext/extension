const toDataUrl = function(url) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function() {
            var reader = new FileReader();
            reader.onloadend = function() {
                resolve(reader.result);
            };
            reader.readAsDataURL(xhr.response);
        };
        xhr.onerror = function(e) {
            reject(e);
        };
        xhr.open('GET', url);
        xhr.send();
    });
};

export default toDataUrl;

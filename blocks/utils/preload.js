function preload(url) {
    const o = document.createElement('object');
    o.data = url;
    document.body.appendChild(o);
}

export default preload;

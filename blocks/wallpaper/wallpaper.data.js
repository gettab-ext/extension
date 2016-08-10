const pathResolver = function(basePath, wp) {
    return Object.assign(wp, {
        path: `${basePath}/${wp.filename}`,
        thumb: `${basePath}/${wp.thumb_filename}`,
    });
};

const EMBEDED_BASE_PATH = './wallpapers/';

export const EMBEDDED_WALLPAPERS = [{
    "filename": '1.png',
    "thumb_filename": '1_thumb.png',
    "name": "Default",
    "desc": "Dark mountain theme",
    "embedded": true
}, {
    "filename": '2.png',
    "thumb_filename": '2_thumb.png',
    "name": "Peak",
    "desc": "Apple peak theme",
    "embedded": true
}, {
    "filename": '3.png',
    "thumb_filename": '3_thumb.png',
    "name": "Bird's-eye view",
    "desc": "From a height",
    "embedded": true
}].map(pathResolver.bind({}, EMBEDED_BASE_PATH));

export const DEFAULT_WALLPAPER = EMBEDDED_WALLPAPERS[0];


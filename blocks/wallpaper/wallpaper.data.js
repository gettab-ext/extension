export const pathResolver = function(basePath, wp) {
    return Object.assign(wp, {
        path: `${basePath}/${wp.filename}`,
        thumb: `${basePath}/${wp.thumb_filename}`,
    });
};

const EMBEDED_BASE_PATH = './wallpapers/';

export const EMBEDDED_WALLPAPERS = [{
    "filename": '1.png',
    "thumb_filename": '1_thumb.png',
    "name": "GetTab",
    "desc": "Default GetTab theme",
    "embedded": true
}, {
    "filename": '3.png',
    "thumb_filename": '3_thumb.png',
    "name": "Bird's-eye view",
    "desc": "From a height",
    "embedded": true
}].map(pathResolver.bind({}, EMBEDED_BASE_PATH));

export const DEFAULT_WALLPAPER = EMBEDDED_WALLPAPERS[0];


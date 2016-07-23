import windows from '../utils/windows';
import {API} from '../config/config';

const PLAYER_URL = `${API}/player`;

let windowId = null;

const music = {
    init() {
        $("#open-music").on('click', () => this.openMusicPlayer());
    },
    createPlayerWindow() {
        windows.create({
            url: PLAYER_URL,
            width: 816,
            height: 360,
            focused: true,
            type: 'popup'
        }, function (error, win) {
            if (error) {
                return;
            }

            windowId = win.id;
        });
    },
    openMusicPlayer() {
        if (windowId !== null &&
            (
                (typeof windowId.closed === 'undefined' || windowId.closed === null) ||
                windowId.closed === false
            )
        ) {
            windows.update(windowId, {
                focused: true
            }, e => {
                if (e) {
                    this.createPlayerWindow();
                }
            });
        }

        this.createPlayerWindow();

        return true;
    }

};

music.init();

export default music;

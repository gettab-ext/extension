const stat = {
    init() {
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','analytics.js','ga');

        ga('create', 'UA-81203673-1', 'auto');
        ga('set', 'checkProtocolTask', function(){});
        ga('set', 'transport', 'beacon');

        chrome.runtime.onMessage.addListener(message => {
            if (!message || message.target !== 'stat') {
                return;
            }
            if (message.action === 'pageview') {
                ga('send', 'pageview', '/index.html');
            }
            if (message.action === 'event') {
                stat._sendGaEvent(message.path);
            }
        });
    },
    sendPageView() {
        chrome.runtime.sendMessage({
            target: 'stat',
            action: 'pageview'
        });
    },
    send(path) {
        chrome.runtime.sendMessage({
            target: 'stat',
            action: 'event',
            path: path
        });
    },

    _sendGaEvent(path) {
        const eventData = path.split('.');
        const eventCategory = eventData[0];
        const eventAction = eventData[1];
        const eventLabel = eventData[2];
        const eventValue = eventData[3];

        const options = {};

        ga('send', 'event', eventCategory, eventAction, eventLabel, eventValue, options);
    }
};

export default stat;

const stat = {
    init() {
        this.initGa();
    },
    initGa() {
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

        ga('create', 'UA-81203673-1', 'auto');
        ga('set', 'checkProtocolTask', function(){});
        ga('send', 'pageview', '/index.html');
    },
    send(event, nonInteraction) {
        const eventData = event.split('.');
        const eventCategory = eventData[0];
        const eventAction = eventData[1];
        const eventLabel = eventData[2];
        const eventValue = eventData[3];

        const passNonInteraction = (nonInteraction
            ? { nonInteraction: true }
            : undefined
        );

        ga('send', 'event', eventCategory, eventAction, eventLabel, eventValue, passNonInteraction);
    }
};

export default stat;
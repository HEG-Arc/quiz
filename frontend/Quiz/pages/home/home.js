// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.UI.Pages.define("/pages/home/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            this.startButton = element.querySelector("#start");
            this.pic = element.querySelector(".slide");
            this.element = element;
            this.fetchData();
            
        },
        fetchData: function(){
            WinJS.Promise.timeout(3000, WinJS.xhr({
                url: Game.apiUrl + '/home',
                headers: {
                    "If-Modified-Since": "Mon, 27 Mar 1972 00:00:00 GMT"
                }
            }).then(
                function (request) {
                    var data = JSON.parse(request.responseText);
                    this.data = data;
                    this.picIndex = 0;
                    this.startButton.innerText = this.data.startTxt;
                    this.startButton.addEventListener("click", this.handleStart.bind(this));
                    this.nextPic();
                    this.timer = setInterval(this.nextPic.bind(this), data.stimeout * 1000);

                }.bind(this),
                function error() {
                    this.fetchData();
                }.bind(this)
            ));
        },
        nextPic: function () {
            if (this.picIndex >= this.data.slideshow.length) {
                this.picIndex = 0;
            }
            WinJS.UI.Animation.fadeOut(this.pic).done(function () {
                this.pic.src = Game.apiUrl + '/slideshow/' + this.data.slideshow[this.picIndex];
                this.picIndex++;
                setTimeout(function () {
                    WinJS.UI.Animation.fadeIn(this.pic);
                }.bind(this), 100);
            }.bind(this));
            
        },
        unload: function () {
            // TODO: Respond to navigations away from this page.
            clearInterval(this.timer);
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        },

        handleStart: function (mouseEvent) {
            this.startButton.innerText = this.startButton.innerText = this.data.loadingTxt;
            Game.start();
        }
    });

})();

// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/score/score.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            element.querySelector('#score-info').innerText = Game.data.scoreInfo;
            element.querySelector('#score').innerText = Game.data.scores[Math.min(options.score, Game.data.scores.length-1)];
            var ticketTxt = element.querySelector('.ticket');
            ticketTxt.innerHTML = Game.data.printWaitTxt;
            WinJS.xhr({
                type: 'post',
                headers: {
                    "Content-type": "application/x-www-form-urlencoded",
                    "If-Modified-Since": "Mon, 27 Mar 1972 00:00:00 GMT"
                },
                url: Game.apiUrl + '/score',
                data: 'session=' + Game.data.session + '&raw_score=' + options.score
            }).then(function (request) {
                try {
                    var data = JSON.parse(request.responseText);
                    var total = data.reduce(function (total, item) {
                        return total + item;
                    }, 0);

                    var increment = 100 / (Game.data.scores.length);
                    var width = 100 / (Game.data.scores.length + 1);
                    //build graph
                    Game.data.scores.forEach(function (score, index) {
                        var percent = 0;
                        if (data[index]) {
                            percent = Math.round(data[index] / total * 100);
                        }
                        var bar = document.createElement("div");
                        bar.className = 'bar';
                        if (index === options.score) {
                            bar.className += ' active';
                        }
                        bar.style.left = increment * index + '%';
                        bar.style.height = (percent === 0 ? 1 : percent) + '%';
                        bar.style.width = width + '%';
                        var percentDom = document.createElement("div");
                        percentDom.className = 'percent';
                        percentDom.innerText = percent + '%';
                        var scoreDom = document.createElement("div");
                        scoreDom.className = 'x-score';
                        scoreDom.innerText = score;
                        bar.appendChild(percentDom);
                        bar.appendChild(scoreDom);
                        element.querySelector('#graph').appendChild(bar);
                    })
                } catch (e) {
                    var md = new Windows.UI.Popups.MessageDialog("Error fetching data from the service: " + e.message);
                    md.showAsync();
                }
            }).then(function () {
                //print score
                WinJS.xhr({
                    type: 'post',
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded",
                        "If-Modified-Since": "Mon, 27 Mar 1972 00:00:00 GMT"
                    },
                    url: Game.apiUrl + '/print',
                    data: 'session=' + Game.data.session + '&raw_score=' + options.score
                }).then(function () {
                    ticketTxt.innerHTML = Game.data.printDoneTxt;
                    WinJS.UI.Animation.fadeIn(element.querySelector('.down-arrow'));
                    var bell = WinJS.Utilities.query('#bell')[0];
                    bell.currentTime = 0;
                    bell.play();
                });
            }.bind(this));
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        }
    });
})();

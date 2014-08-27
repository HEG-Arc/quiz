// For an introduction to the Navigation template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232506
(function () {
    "use strict";

    var activation = Windows.ApplicationModel.Activation;
    var app = WinJS.Application;
    var nav = WinJS.Navigation;
    var sched = WinJS.Utilities.Scheduler;
    var ui = WinJS.UI;

    WinJS.Namespace.define("Game", {
        apiUrl: "http://127.0.0.1:9002",
        start: function start() {



            /*
            var progress = WinJS.Utilities.query('#progressOverlay');
            var contenthost = WinJS.Utilities.query('#contenthost');

            progress.setStyle('display', 'block');
            contenthost.setStyle('visibility', 'hidden');
            setTimeout(function () {
                Data.load(function () {
                    progress.setStyle('display', 'none');
                    contenthost.setStyle('visibility', 'visible');
                    if (typeof callback == "function") {
                        callback();
                    }
                });
            }, 100);
            */

            this.score = 0;
            var self = this;
            //Start loading

            WinJS.xhr({ url: this.apiUrl + '/start' }).then(
                function (request) {
                    var md;
                    //STOP loading
                    try {
                        var data = JSON.parse(request.responseText);
                        if (data.error) {
                            md = new Windows.UI.Popups.MessageDialog("Error: " + data.error);
                            md.showAsync();
                        } else {
                            self.data = data;
                            self.next();
                        }
                    } catch (e) {
                        md = new Windows.UI.Popups.MessageDialog("Error fetching data from the service: " + e.message);
                        md.showAsync();
                    }
                }
            );
        },
        next: function next() {
            if (this.data.questions.length > 0) {
                //naviguateToNextQuestion
                var question = this.data.questions.shift();
                nav.navigate("/pages/question/question.html", { question: question });
            } else {
                //naviguate to score
                nav.navigate("/pages/score/score.html", { score: this.score });
                //print score
                //TODO
            }
        },
        answer: function (question, answer) {
            if (answer === 0) {
                this.score++;
            }
            //log
            //TODO
            //this.data.session, question, answer
            
        }
    });


    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            nav.history = app.sessionState.history || {};
            nav.history.current.initialPlaceholder = true;

            // Optimize the load of the application and while the splash screen is shown, execute high priority scheduled work.
            ui.disableAnimations();
            var p = ui.processAll().then(function () {
                return nav.navigate(nav.location || Application.navigator.home, nav.state);
            }).then(function () {
                return sched.requestDrain(sched.Priority.aboveNormal + 1);
            }).then(function () {
                ui.enableAnimations();
            });

            args.setPromise(p);
        }
    });

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        app.sessionState.history = nav.history;
    };

    app.start();
})();

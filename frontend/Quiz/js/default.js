// For an introduction to the Navigation template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232506
(function () {
    "use strict";

    var activation = Windows.ApplicationModel.Activation;
    var app = WinJS.Application;
    var nav = WinJS.Navigation;
    var sched = WinJS.Utilities.Scheduler;
    var ui = WinJS.UI;

    WinJS.Namespace.define("Timeout", {
        r: 40,
        lastFrame: 0,
		stopwatch: 0,
        init: function(){
            this.ring = WinJS.Utilities.query('svg path')[0];
            this.ring.setAttribute('transform', 'translate(' + this.r + ', ' + this.r + ')');
            requestAnimationFrame(this.updateTime.bind(this));
        },
        draw: function (value) {
            var r = this.r;
            // Update the wheel giving to it a value in degrees,
            // getted from the percentage of the input value
            // a.k.a. (value * 360) / 100
            var degrees = value * 3.5999,
                // Convert the degrees value to radians
                rad = degrees * Math.PI / 180,
                // Determine X and cut to 2 decimals
                x = (Math.sin(rad) * r).toFixed(2),
                // Determine Y and cut to 2 decimals
                y = -(Math.cos(rad) * r).toFixed(2),
                // The another half ring. Same as (deg > 180) ? 1 : 0
                lenghty = Number(degrees > 180),
                // Moveto + Arcto
                descriptions = ['M', 0, 0, 'v', -r, 'A', r, r, 1, lenghty, 1, x, y, 'z'];
            // Apply changes to the path
            this.ring.setAttribute('d', descriptions.join(' '));
        },
        updateTime: function (now) {
			
            var delta = now - this.lastFrame;
            this.lastFrame = now;
			this.stopwatch += delta;
			var timeout = Infinity;
			if (Game.data) {
			    if (Game.state === 'score') {
			        timeout = Game.data.ptimeout;
			    }
			    else if (Game.state === 'answer') {
			        timeout = Game.data.atimeout;
			    }else{
			        timeout = Game.data.qtimeout;
			    }
			    timeout = timeout * 1000;
			}
			if(this.stopwatch > timeout){
			    if (Game.state === 'answer') {
			        Game.next();
			    } else {
			        Game.reset();
			    }
			}
            this.draw(Math.min(this.stopwatch / timeout * 100, 100));
            requestAnimationFrame(this.updateTime.bind(this));
        }
    });

    WinJS.Namespace.define("Game", {
        apiUrl: "http://127.0.0.1:9002",
        start: function start() {
            this.score = 0;
            var self = this;

            //Start loading
            //Ensuring that the client resends requests http://msdn.microsoft.com/en-us/library/windows/apps/hh868281.aspx
            WinJS.Promise.timeout(3000, WinJS.xhr({
                url: this.apiUrl + '/start',
                headers: {
                    "If-Modified-Since": "Mon, 27 Mar 1972 00:00:00 GMT"
                }
                }).then(
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
                                self.updateScore();
                                var progress = WinJS.Utilities.query('#progress')[0];
                                self.questions = new WinJS.Binding.List([]);
                                self.data.questions.forEach(function (item, index) {
                                    //winjs is horrible we need real css property values cannot use true/false...
                                    self.questions.push({ nb: index + 1, cls: 'question-status', last: self.data.questions.length - 1 === index ? 'none' : 'inline-block' });
                                })
                                progress.winControl.data = self.questions;
                            
                                self.next();
                            }
                        } catch (e) {
                            md = new Windows.UI.Popups.MessageDialog("Error fetching data from the service: " + e.message);
                            md.showAsync();
                        }
                    },
                    function error() {
                        var md = new Windows.UI.Popups.MessageDialog("Unable to contact server. Try again or contact Staff.");
                        md.showAsync();
                    }
            ));
        },
        next: function next() {
            Timeout.stopwatch = 0;
            if (this.data.questions.length > 0) {
                //naviguateToNextQuestion
                this.index = this.questions.length - this.data.questions.length;
                
                var obj = this.questions.getAt(this.index)
                obj.cls = 'question-status active';
                //hack to trigger repeater update... winjs bad...
                this.questions.setAt(this.index, obj);
                WinJS.Utilities.query('.question-status-repeater')[this.index].scrollIntoView();
                var question = this.data.questions.shift();
                nav.navigate("/pages/question/question.html", { question: question });
                this.state = "question";
            } else {
                //naviguate to score
                nav.navigate("/pages/score/score.html", { score: this.score });
                this.state = "score";
            }
        },
        answer: function (question, answer) {
            var obj = this.questions.getAt(this.index)
            if (answer === 0) {
                this.score++;
                obj.cls = 'question-status right';
            } else {
                obj.cls = 'question-status wrong';
            }
            //hack to trigger repeater update... winjs bad...
            this.questions.setAt(this.index, obj);
            this.updateScore();
            //log
            WinJS.xhr({
                type: 'post',
                headers: {
                    "Content-type": "application/x-www-form-urlencoded",
                    "If-Modified-Since": "Mon, 27 Mar 1972 00:00:00 GMT"
                },
                url: this.apiUrl + '/log',
                data: 'session=' + this.data.session + '&question=' + question + '&answer='  + answer
            });
            
        },
        reset: function () {
            delete this.data;
            delete this.questions;
            delete this.questions;
            delete this.index;
            delete this.score;
            this.updateScore();
            var progress = WinJS.Utilities.query('#progress')[0];
            //winjs binding not working with repeater.........
            progress.winControl.data = new WinJS.Binding.List([]);
            nav.navigate("/pages/home/home.html");
            this.state = "home";
        },
        updateScore: function () {
            //manual upate, making winjs binding to comlicated...
            var score = WinJS.Utilities.query('#score-display')[0];
            score.innerText =  this.data ? this.data.scores[Math.min(this.score, this.data.scores.length-1)] : '';
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
                Timeout.init();
                Game.reset();
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

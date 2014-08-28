// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    //http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    var answersList;
    var self;

    WinJS.UI.Pages.define("/pages/question/question.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            self = this;
            this.question = options.question;
            element.querySelector('#question').innerText = this.question.question;
            var answers = shuffle(this.question.answers.slice(0));
            
            answersList = element.querySelector('#answers')
            answersList.winControl.itemDataSource = new WinJS.Binding.List(answers).dataSource;
            answersList.addEventListener("iteminvoked", this.itemClick.bind(this));
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        },
        itemClick: function (event) {
            //log item with index of real answer not shuffled
            var realIndex =  self.question.answers.indexOf(answersList.winControl.itemDataSource.list.getAt(event.detail.itemIndex));
            Game.answer(self.question.id,realIndex);
            //display answer + next button
            var msg = realIndex === 0 ? 'Correct!' : 'Faux!';
            var myMessage = new Windows.UI.Popups.MessageDialog(this.question.explain, msg);
            myMessage.commands.append(new Windows.UI.Popups.UICommand('Suivant', this.handleNext));
            myMessage.showAsync();

        },
        handleNext: function (mouseEvent) {
            Game.next();
        }
    });
})();

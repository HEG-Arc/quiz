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


    WinJS.UI.Pages.define("/pages/question/question.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            this.question = options.question;
            element.querySelector('#question').innerText = this.question.question;
            var answers = shuffle(this.question.answers.slice(0));
            
            element.querySelector('#answers').winControl.itemDataSource = new WinJS.Binding.List(answers).dataSource;

            var nextButton = element.querySelector("#next");
            nextButton.addEventListener("click", this.handleNext);
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        },
        itemClick: function () {
            var answer;
            //log item
            Game.answer(this.question.id, this.question.answers.indexOf(answer));
            //display answer + next button

        },
        handleNext: function (mouseEvent) {
            Game.next();
        }
    });
})();

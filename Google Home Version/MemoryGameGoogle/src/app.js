'use strict';

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { GoogleAssistant } = require('jovo-platform-googleassistant');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');

const app = new App();

app.use(
    new Alexa(),
    new GoogleAssistant(),
    new JovoDebugger(),
    new FileDb()
);


// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------
//States and user data
let player1Name = "";
let player2Name = "";
let playerState = "";
let currentState = "";
let numberOfTimesLoggedIn = 0;

//Variables for the game


app.setHandler({
    LAUNCH() {
        //Current state is the start
        currentState = "start";

        //Set speech and reprompt
        let speech = '<audio src="https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/bgm.mp3"/>'+
                     '<p><s>Welcome to the Memory Game!</s><s>It is advised to play this game with two players.</s></p>'+
                     '<p><s>Do you want to play by yourself?</s>Please answer with a yes or no!</p>';
        let reprompt = Reprompt();

        //Ask user about how many players are playing
        this.ask(speech, reprompt);
    },

    NameIntent(){
        //Get the name of one player
        player1Name = this.$inputs.playerName.value;
        return this.toIntent('GiveMenuIntent');
    },

    DoubleNameIntent(){
        //Get the name of two players
        player1Name = this.$inputs.firstPlayerName.value;
        player2Name = this.$inputs.secondPlayerName.value;
        return this.toIntent('GiveMenuIntent');
    },

    GetResponseIntent(){
        let userAnswer = this.$inputs.inputAnswer.value;
        if(currentState == "start"){
            //Current state is getting names
            currentState = "gettingNames";
            if(userAnswer == "yes"){
                //Tell the user
                this.tell("<p>Ok, you have chosen to play alone for both player 1 and 2!</p>");
                playerState = "OnePlayer";

                //Ask the user's name
                let speech = '<p>Since you are playing for both players, can you please tell me what to call you by?</p>';
                let reprompt = Reprompt();
                this.ask(speech, reprompt);
            }else if(userAnswer == "no"){
                //Tell the user
                this.tell("<p>Ok, there are two players!</p>");
                playerState = "TwoPlayer";

                //Ask the two user's names
                let speech = '<p>Since there are two players, can you please tell me what to call you both by?</p>';
                let reprompt = Reprompt();
                this.ask(speech, reprompt);
            }
        }
    },

    GiveMenuIntent(){
        //Current state is the tutorial
        currentState = "mainMenu";
        //Set player response
        let speech = "";
        if(playerState == "OnePlayer"){
            speech = 'Nice to meet you '+ player1Name+'<break time="1" /> ';
        }else if(playerState == "TwoPlayer"){
            speech = 'Nice to meet you; '+player1Name+' and '+player2Name+'<break time="1" /> ';
        }
        //if it's the players first time logging in, then player a slightly larger introduction to the menu
        if(numberOfTimesLoggedIn == 0){
            speech += '<p>When playing the memory game, from the main menu you can select to either</p><break time="0.1" />'+
                      '<p>Start!</p><break time="0.1" />'+
                      '<p>Show my rank!</p><break time="0.1" />'+
                      '<p>Ask for help via the tutorial</p><break time="0.1" />'+
                      '<p>Or exit the game</p><break time="0.1" />'+
                      'Which option would you like to select?';
            numberOfTimesLoggedIn++;
        }else{
            speech += '<p>Please select either Start!, Show my rank!, Ask for help via the tutorial!, or exit the game';
            numberOfTimesLoggedIn++;
        }

        //set reprompt
        let reprompt = Reprompt();
        this.ask(speech, reprompt);
    },

    MenuSelectionIntent(){
        //Current state is the main menu
        currentState = "mainMenu";
        //Set player response
        let speech = "";
        let chosenMenuOption = this.$inputs.menuOption.value;

        if(chosenMenuOption == "exit"){
            speech = "You have chosen to exit";
        }else if(chosenMenuOption == "help"){
            speech = "You have chosen to go to the help menu";
        }else if(chosenMenuOption == "rank"){
            speech = "You have chosen to go to the ranking menu";
        }else if(chosenMenuOption == "play"){
            speech = "You have chosen to play";
        }

        //tell user
        this.tell(speech);
    },
});

module.exports.app = app;


// ------------------------------------------------------------------
// FUNCTIONS
// ------------------------------------------------------------------
function Reprompt(){
    let text = "";
    if(currentState === "start"){
        text = "Do you want to play as one player or with two players?";
    }else if(currentState === "mainMenu"){
        text = "Please select a main menu option from either: Start, show my rank, ask for help or exit the game!";
    }else if(currentState === "gettingNames"){
        text = "Please give me a name to call you by!"
    }

    return text;
}

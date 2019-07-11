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
var currentState = ""; //Current game state
var playerState = ""; //Current player state (2 players or 1)

var player1Name = "";
var player2Name = "";
var numberOfTimesLoggedIn = 0;
var userAnswer = "";

//Current States
// - Start: Beginning state. Only a yes or a no are acceptable for playing either one or two players
// -


app.setHandler({
    LAUNCH() {
        //Current state is the start
        currentState = "start";

        //Set speech and reprompt
        this.$speech.addText(
            '<audio src="https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/bgm.mp3"/>'+
            '<p><s>Welcome to the Memory Game!</s><s>It is advised to play this game with two players.</s></p>'+
            '<p><s>Do you want to play by yourself?</s>Please answer with a yes or no!</p>'
        );
        this.$reprompt.addText(Reprompt());

        //Ask user about how many players are playing with state promise
        this.followUpState('StartState').ask(this.$speech, this.$reprompt);
    },

    //Start state: Only yes or no are accepted for playing either one or two players
    StartState: {
        //Yes/no answers
        YesIntent(){
            currentState = "gettingNames";
            //Set player state
            playerState = "OnePlayer";

            //Ask user for their name
            this.$speech.addText("<p>Since you are playing for both players, can you please tell me what to call you by?</p>");
            this.$reprompt.addText(Reprompt());
            this.followUpState('GetSingleNameState').ask(this.$speech, this.$reprompt);
        },
        NoIntent(){
            currentState = "gettingNames";
            //Set player state
            playerState = "TwoPlayer";

            //Ask users for their names
            this.$speech.addText("<p>Since there are two players, can you please tell me what to call you both by?</p>");
            this.$reprompt.addText(Reprompt());
            this.followUpState('GetDoubleNameState').ask(this.$speech, this.$reprompt);
        },
        Unhandled(){
            //Try again
            this.$speech.addText("<p>Sorry, I could not understand you.</p>" + Reprompt());
            this.$reprompt.addText(Reprompt());

            this.followUpState('StartState').ask(this.$speech, this.$reprompt);
        },
    },

    //Get name state: Only one name is acceptable
    GetSingleNameState: {
        //Name Intent
        NameIntent(){
            //Get the name of one player
            player1Name = this.$inputs.playerName.value;
            return this.toStatelessIntent('GiveMenu');
        },
    },

    //Get double name state: Only two names are acceptable
    GetDoubleNameState: {
        //Double Name Intent
        DoubleNameIntent(){
            //Get the name of two players
            player1Name = this.$inputs.firstPlayerName.value;
            player2Name = this.$inputs.secondPlayerName.value;
            return this.toStatelessIntent('GiveMenu');
        },
    },

    GiveMenu(){
        //Current state is the tutorial
        currentState = "mainMenu";
        //Set player response
        let speech = "";
        if(playerState == "OnePlayer"){
            speech = 'Nice to meet you '+ player1Name+'.<break time="1" /> ';
        }else if(playerState == "TwoPlayer"){
            speech = 'Nice to meet you; '+player1Name+' and '+player2Name+'.<break time="1" /> ';
        }
        //if it's the players first time logging in, then play a slightly larger introduction to the menu
        if(numberOfTimesLoggedIn == 0){
            speech += '<p>When playing the memory game, from the main menu you can select to either</p>'+
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
        this.$speech.addText(speech);
        this.$reprompt.addText(Reprompt());
        this.followUpState('MenuSelectionState').ask(this.$speech, this.$reprompt);
    },

    MenuSelectionState: {
        MenuSelectionIntent(){
            //Current state is the main menu
            currentState = "mainMenu";
            //Set player response
            let speech = "";
            let chosenMenuOption = this.$inputs.menuOption.value;

            if(chosenMenuOption == "exit"){
                if(playerState == "OnePlayer"){
                    speech = "Thank you and have a good day " + player1Name + ". We hope you enjoyed our memory game";
                }else{
                    speech = "Thank you and have a good day " + player1Name + " and " + player2Name + ". We hope you enjoyed our memory game";
                }
            }else if(chosenMenuOption == "help"){
                //TO-DO: Add preset help. This ISN'T the contextual help but rather a tutorial for the game
                //Need to fix up the language used in the contextual help function

                speech = "You have chosen to go to the help menu";
            }else if(chosenMenuOption == "rank"){
                //TO-DO: Add ranking menu - Needs to be a variable for ranking/scoring.
                //User needs to be able to go back to main menu from the ranking menu or exit the game or
                //return to the stateless GiveMenu function

                speech = "You have chosen to go to the ranking menu";
            }else if(chosenMenuOption == "play"){
                //TO-DO: Add game fuinctions and intents. The user must be able to go back
                //to the main menu at any point

                speech = "You have chosen to play";
            }

            //tell user
            this.$speech.addText(speech);
            this.tell(this.$speech);
        },
        Unhandled(){
            //Try again
            this.$speech.addText("<p>Sorry, I could not understand you.</p>" + Reprompt());
            this.$reprompt.addText(Reprompt());

            this.followUpState('MenuSelectionState').ask(this.$speech, this.$reprompt);
        },
    },
});

module.exports.app = app;


// ------------------------------------------------------------------
// FUNCTIONS
// ------------------------------------------------------------------
function Reprompt(){
    let text = "";
    if(currentState === "start"){
        text = "Do you want to play as one player or with two players? Please Answer with a yes or a no!";
    }else if(currentState === "mainMenu"){
        text = "Please select a main menu option from either: Start, show my rank, ask for help or exit the game!";
    }else if(currentState === "gettingNames"){
        text = "Please give me a name to call you by!"
    }
    return text;
}

/*
    ContextualHelp() function will give help only relative to the current state the game is in.
*/
function ContextualHelp()
{
    let helpText

    if(currentState === "start")
    {
        helpText = "This game can be played either alone or with a friend. The current menu you are in is asking if you want to play the game in either 1 player, or 2 player mode."; //Start menu is only choosing between either 1 player or 2 players??
    }
    else if(currentState === "gettingNames")
    {
        helpText = "This menu will ask you for a name to be assigned to player 1 and player 2."
    }
    else if(currentState === "mainMenu")
    {
        helpText = "This is the main menu, from this menu you can choose to either start the game, show your rank compared to others globaly and locally, access the advanced help menu, or exit the game";//What does the help option in the main menu do??
    }
    else if(currentState === "soundSelect")
    {
        helpText = "This is the sound select menu, from this menu you can choose which sound package to use, for example you can select the 'Farm animal' package to play with."
        + "To select a sound package say either the package number, or the package name. For example you could say 'one' to "
        + "select the farm animal pack, or you could say 'farm animals' to select the farm animal pack.";
    }
    else if(currentState === "levelSelect")
    {
        helpText = "This is the level select menu, from this menu you can choose the level/diffuculty to play on. A higher level will require you to match more sounds than a lower level would."
        + "Each sound pack has it's own amount of levels unlocked, so if you unlocked"
        + "more levels with with the farm animals pack, it will only be unlocked on the farm animals pack.";
    }
    else if(currentState === "inGame")
    {
        helpText = "........."
    }

    return helpText;
}

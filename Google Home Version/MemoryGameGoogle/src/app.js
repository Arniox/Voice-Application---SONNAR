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
let currentState = ""; //Current game state
let playerState = ""; //Current player state (2 players or 1)

let player1Name = "";
let player2Name = "";
let numberOfTimesLoggedIn = 0;

<<<<<<< HEAD
=======
//Player names
var player1Name = "";
var player2Name = "";

//Count number of times logged in/activated application
var numberOfTimesLoggedIn = 0;

//Highest Score
var bestScore = 0;
>>>>>>> 6147cd13667192b39c7458c72133625d735a40f2

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
            speech = 'Nice to meet you '+ this.$inputs.playerName.value+'<break time="1" /> ';
        }
        else if(playerState == "TwoPlayer"){
            speech = 'Nice to meet you; '+this.$inputs.firstPlayerName.value+' and '+this.$inputs.secondPlayerName.value+'<break time="1" /> ';
        }
        //if it's the players first time logging in, then play a slightly larger introduction to the menu
        if(numberOfTimesLoggedIn == 0){
            speech += '<p>When playing the memory game, from the main menu you can select to either</p><break time="0.1" />'+
                      '<p>Start the game!</p><break time="0.1" />'+
                      '<p>Show my rank!</p><break time="0.1" />'+
                      '<p>Ask for help</p><break time="0.1" />'+
                      '<p>Or exit the game</p><break time="0.1" />'+
                      'Which option would you like to select?';
            numberOfTimesLoggedIn++;
        }else{
            speech += '<p>Please select either Start!, Show my rank!, Ask for help!, or exit the game';
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

<<<<<<< HEAD
    InGameState:
    {
        BoxIntent()
        {
            currentState = "inGame";

            //create an array of animal objects
            const animals = [
                {
                name: "dog",
                resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/dog.mp3' />",
                opened: false
                },{
                name: "cat",
                resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/cat.mp3' />",
                opened: false
                },{
                name: "chicken",
                resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/chicken.mp3' />",
                opened: false
                },{
                name: "cow",
                resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/cow.mp3' />",
                opened: false
                },{
                name: "turkey",
                resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/turkey.mp3' />",
                opened: false
                },{
                name: "frog",
                resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/frog.mp3' />",
                opened: false
                },{
                name: "goat",
                resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/goat.mp3' />",
                opened: false
                },{
                name: "goose",
                resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/goose.mp3' />",
                opened: false
                },{
                name: "horse",
                resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/horse.mp3' />",
                opened: false
                },{
                name: "pig",
                resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/pig.mp3' />",
                opened: false
                },{
                name: "sheep",
                resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/sheep.mp3' />",
                opened: false
                },{
                name: "elephant",
                resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/elephant.mp3' />",
                opened: false
                }
            ];

            let firstBoxChoice = 0;
            let secondBoxChoice = 0;
            let player1Score = 0;
            let player2Score = 0;

            //Assign animal objects to boxes and then randomize them
            let speech = ""; 

            speech = 'lets begin!' + this.$inputs.firstPlayerName.value+" will start first, Please select a box from 1 to <num of animal sounds * 2>";
        },       

    }
=======
    HelpMenuState: {
        
    },
>>>>>>> 6147cd13667192b39c7458c72133625d735a40f2
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
    else if(currentState === "soundSelect"){
        text = "Please choose a sound package to play!, the available sound packages are: <list packages>"
    }
    else if(currentState === "levelSelect"){
        text = "Please choose a level to play!, the levels available are: <list available levels>"
    }
    else if(currentState === "inGame"){
        text = "Please choose a box and then another one to match it, the unopen boxes are: <list unopened boxes>"
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
        helpText = "To play this game you must select a box that will contain an animal sound and match it with another one that contains the same sound. To select a box just choose a number when asked, and then choose"
        +" another box that you think will contain the same sound of your first chosen box.";
    }

    return helpText;
}

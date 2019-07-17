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
let numberOfTimesLoggedIn = 0;

//Player names
var playerName = "";
//Highest Score
var bestScore = 0;
//Number of times played
var numOfTimesPlayed = 0;

//Users first and second box choice
var firstBoxChoice = 0;
var secondBoxChoice = 0;

//players current ingame score
var playerScore = 0;

//levels unlocked
const levelsUnlocked = [
    {
        id: 1,
        name: "level 1",
        unlocked: true,
        numberOfSounds: 3
    },{
        id: 2,
        name: "level 2",
        unlocked: false,
        numberOfSounds: 4
    },{
        id: 3,
        name: "level 3",
        unlocked: false,
        numberOfSounds: 6
    },{
        id: 4,
        name: "level 4",
        unlocked: false,
        numberOfSounds: 8
    },{
        id: 5,
        name: "level 5",
        unlocked: false,
        numberOfSounds: 10
    },{
        id: 6,
        name: "level 6",
        unlocked: false,
        numberOfSounds: 12
    }
];

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

//Current States
// - start: Beginning state. Only a yes or a no are acceptable for playing either one or two players
// - gettingNames: The program is looking for a users name. Only a common name is accpetable
// - mainMenu: The stateless main menu intent is just to give the user information
// - exitGame: Exit game intent and state. Nothing is required from the user.
// - helpMenuState: The help menu. The game expects the user to go back to main menu and nothing else
// - rankMenuState: Rank menu. The game expects the user to go back to the main menu and nothing else

app.setHandler({
    LAUNCH() {
        //Current state is the start
        currentState = "start";

        //Set speech and reprompt
        this.$speech.addText(
            '<audio src="https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/bgm.mp3"/>'+
            '<p>Welcome to the Memory Game! </p>'+
            '<p>Are you ready to test your memory?</p>'
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

            //Ask user for their name
            this.$speech.addText("<p>I hope your excited, but before we can start, can you please tell me what to call you by?</p>");
            this.$reprompt.addText(Reprompt());
            this.followUpState('GetSingleNameState').ask(this.$speech, this.$reprompt);
        },
        NoIntent(){
            currentState = "gettingNames";

            //Ask users for their names
            this.$speech.addText("<p>Ok then, have an exciting day. Good bye!</p>");
            this.$reprompt.addText(Reprompt());
            this.tell(this.$speech, this.$reprompt);
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
            playerName = this.$inputs.playerName.value;
            return this.toStatelessIntent('GiveMenu');
        },
        Unhandled(){
            //Try again
            this.$speech.addText("<p>Sorry, I could not understand you.</p>" + Reprompt());
            this.$reprompt.addText(Reprompt());

            this.followUpState('GetSingleNameState').ask(this.$speech, this.$reprompt);
        },
    },

    //Stateless intent for giving menu
    GiveMenu(){
        //Current state is the tutorial
        currentState = "mainMenu";
        //Set player response
        let speech = "";

        //if it's the players first time logging in, then play a slightly larger introduction to the menu
        if(numberOfTimesLoggedIn == 0){
            speech = 'Nice to meet you ' + playerName + '<break time="1" /> ';

            speech += '<p>When playing the memory game, from the main menu you can select to either</p>'+
                      '<p>Start the game!</p><break time="0.1" />'+
                      '<p>Show my rank!</p><break time="0.1" />'+
                      '<p>Ask for help</p><break time="0.1" />'+
                      '<p>Or exit the game</p><break time="0.1" />'+
                      'Which option would you like to select?';
            numberOfTimesLoggedIn++;
        }else{
            speech += '<p>Welcome back ' + playerName + '</p>'+
                      '<p>Please select either Start!</p>'+
                      '<p>Show my rank!</p>'+
                      '<p>Ask for help!</p>'+
                      '<p>or exit the game</p>';
            numberOfTimesLoggedIn++;
        }
        //set reprompt
        this.$speech.addText(speech);
        this.$reprompt.addText(Reprompt());
        this.followUpState('MenuSelectionState').ask(this.$speech, this.$reprompt);
    },

    MenuSelectionState: {
        ExitIntent(){
            //Current state is the main menu
            currentState = "exitGame";
            //Set player response
            this.$speech.addText("Thank you for playing our animal memory game, good bye!");
            this.tell(this.$speech);
        },
        HelpIntent(){
            //Current state is the main menu
            currentState = "helpMenuState";
            //Set player response
            this.$speech.addText("<p>To play this game you will be given a set amount of noise boxes to open.</p>"+
                                 "<p>Each one will contain an animal sound that will match up to one other box in the set</p>"+
                                 "<p>Your job is to give me a pair of boxes to match up and I will open them and let you listen to the sounds within</p>"+
                                 "<p>If they match up, you will get a point and those two boxes will be closed and unable to open again</p>"+
                                 "<p>If they do not match up, you will hear a buzzer and be told you where incorrect</p>"+
                                 "<p>The goal of each level is to match up all the boxes to their correct counterparts</p>"+
                                 "<p>Good luck and have fun.</p>"+
                                 "<p>Please say back to go to the main menu!</p>");
            this.$reprompt.addText(Reprompt());

            this.followUpState('BackToMainMenuState').ask(this.$speech, this.$reprompt);
        },
        RankIntent(){
            //Current state is the main menu
            currentState = "rankMenuState";
            this.$speech.addText("<p>Your current highest score in our Animal Memory Game is:</p>" +
                                 "<p>" + bestScore + "</p>" +
                                 "<p>Please say back to go to the main menu!</p>");
            this.$reprompt.addText(Reprompt());

            this.followUpState('BackToMainMenuState').ask(this.$speech, this.$reprompt);
        },
        PlayIntent(){
            //Return to the stateless playintent menu giver so that the level selection can be reused
            return this.toStatelessIntent('PlayIntentMenuGiver');
        },
        Unhandled(){
            //Try again
            this.$speech.addText("<p>Sorry, I could not understand you.</p>" + Reprompt());
            this.$reprompt.addText(Reprompt());

            this.followUpState('MenuSelectionState').ask(this.$speech, this.$reprompt);
        },
    },

    //Stateless play intent
    PlayIntentMenuGiver(){
        currentState = "playingGame";
        let speech = "";
        //If num of times played equal to 0 then introduce the player
        if(numOfTimesPlayed == 0){
            speech += "<p>We hope you are ready for our memory game.</p>";
        }

        //Else just continue
        speech += "<p>You have, so far, unlocked:</p>";
        for(const level of levelsUnlocked){
            if(level.unlocked == true){
                speech += level.name + ", ";
            }
        }
        speech += "<p>Which level would you like to play?</p>";
        this.$speech.addText(speech);
        this.$reprompt.addText(Reprompt());
        this.followUpState('LevelSelectionState').ask(this.$speech, this.$reprompt);
    },

    LevelSelectionState: {
        LevelSelectionIntent(){
            let userLevelSelected = this.$inputs.levelNumber.value;
            //Check if the user has selected a non-existant level
            if(!(userLevelSelected > 6 || userLevelSelected < 1)){
                //Check if the user has selected a locked level
                if(levelsUnlocked[userLevelSelected-1].unlocked == true){
                    //Instructions - only needed for new players
                    if(numberOfTimesLoggedIn < 3){
                        let speech = "<p>At any point in time during the level; you can say exit to quit the game,"+
                        " back to go back to level selection or score to check your current score</p>"+
                        "<p>You will also be asked for two boxes to match up together!</p>";
                    }   
                    //Level info
                    speech += "<p>" + levelsUnlocked[userLevelSelected-1].name + " has " +
                    levelsUnlocked[userLevelSelected-1].numberOfSounds + " sounds to discover. Meaning a total of " +
                    (levelsUnlocked[userLevelSelected-1].numberOfSounds*2) + " pairs to match up!</p>";                 
                    //Query
                    speech += "<p>Ok, are you ready to play " + levelsUnlocked[userLevelSelected-1].name + "?</p>";
                    this.$speech.addText(speech);
                    this.$reprompt.addText(Reprompt());
                    this.tell(this.$speech);
                    //Create boxes with animals in them
                    
                }else{
                    this.$speech.addText("<p>Sorry this level needs to be unlocked by playing the prior levels in order.</p>" + Reprompt());
                    this.$reprompt.addText(Reprompt());
                    this.followUpState('LevelSelectionState').ask(this.$speech, this.$reprompt);
                }
            }else{
                this.$speech.addText("<p>Sorry this level does not exist.</p>" + Reprompt());
                this.$reprompt.addText(Reprompt());
                this.followUpState('LevelSelectionState').ask(this.$speech, this.$reprompt);
            }
        },
        Unhandled(){
            //Try again
            this.$speech.addText("<p>Sorry, I could not understand you.</p>" + Reprompt());
            this.$reprompt.addText(Reprompt());

            this.followUpState('LevelSelectionState').ask(this.$speech, this.$reprompt);
        },
    },
    

    InGameState: {
        BoxIntent()
        {
            currentState = "inGame";            

            //Assign animal objects to boxes and then randomize them
            let speech = "";

            speech = "lets begin! Please select a box from 1 to" + (levelsUnlocked[userLevelSelected-1].numberOfSounds*2);
        },
        Unhandled(){
            //Try again
            this.$speech.addText("<p>Sorry, I could not understand you.</p>" + Reprompt());
            this.$reprompt.addText(Reprompt());

            this.followUpState('BackToMainMenuState').ask(this.$speech, this.$reprompt);
        },
    },

    BackToMainMenuState: {
        BackToMenuIntent() {
            return this.toStatelessIntent('GiveMenu');
        },
        Unhandled(){
            //Try again
            this.$speech.addText("<p>Sorry, I could not understand you.</p>" + Reprompt());
            this.$reprompt.addText(Reprompt());

            this.followUpState('BackToMainMenuState').ask(this.$speech, this.$reprompt);
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
        text = "Are you ready to play the animal memory game?";
    }else if(currentState === "mainMenu"){
        text = "Please select a main menu option from either: Start, show my rank, ask for help or exit the game!";
    }else if(currentState === "gettingNames"){
        text = "Please give me a name to call you by!";
    }else if(currentState === "helpMenuState" || currentState === "rankMenuState"){
        text = "Please let me know if you wish to go back";
    }else if(currentState === "soundSelect"){
        text = "Please choose a sound package to play!, the available sound packages are: <list packages>";
    }else if(currentState === "levelSelect"){
        text = "Please choose a level to play!, the levels available are: <list available levels>";
    }else if(currentState === "inGame"){
        text = "Please choose a box and then another one to match it, the unopen boxes are: <list unopened boxes>";
    }else if(currentState === "playingGame"){
        text = "Please choose a level to select and play";
    }
    return text;
}
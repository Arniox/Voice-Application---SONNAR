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
var userLevelSelected;
var outSideSpeech = "";

//players current ingame score
var playerScore = 0;

//Current state object
const currentStateOb = [
    {
        state: 0,
        stateName: "START",
        userAttempts: 0
    }
]
//All states
const states = [
    {
        state: 0,
        stateName: "START",
        userAttempts: 0
    },{
        state: 1,
        stateName: "MAIN_MENU",
        userAttempts: 0
    },{
        state: 2,
        stateName: "EXIT_GAME",
        userAttempts: 0
    },{
        state: 3,
        stateName: "HELP_MENU",
        userAttempts: 0
    },{
        state: 4,
        stateName: "RANK_MEMU",
        userAttempts: 0
    }
]

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

//Create empty array for the game initialisation
let inGameSounds = [];

//Current States
// - start: Beginning state. Only a yes or a no are acceptable for playing either one or two players
// - mainMenu: The stateless main menu intent is just to give the user information
// - exitGame: Exit game intent and state. Nothing is required from the user.
// - helpMenuState: The help menu. The game expects the user to go back to main menu and nothing else
// - rankMenuState: Rank menu. The game expects the user to go back to the main menu and nothing else

app.setHandler({
    LAUNCH() {
        //Current state is START
        currentStateOb.state = states[0].state;
        currentStateOb.stateName = states[0].stateName;
        currentStateOb.userAttempts = states[0].userAttempts;

        //Grab data from data base

        if(numberOfTimesLoggedIn > 3){
            this.$speech.addText(
                '<audio src="https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/bgm.mp3"/>'+
                '<p>Welcome back!. Are you ready to play?</p>'
            );
        }else{
            this.$speech.addText(
                '<audio src="https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/bgm.mp3"/>'+
                '<p>Hello and welcome. We have recieved a new supply of crates and your goal is to match the '+
                'crates up so that the pair of animals gets shipped off together!</p> '+
                '<p>Are you ready to help ship them off?</p>'
            );
        }
        this.$reprompt.addText(Reprompt());

        //Ask user about how many players are playing with state promise
        this.followUpState('StartState').ask(this.$speech, this.$reprompt);
    },

    //Start state: Only yes or no are accepted for playing either one or two players
    StartState: {
        //Yes/no answers
        YesIntent(){
            return this.toStatelessIntent('GiveMenu');
        },
        NoIntent(){
            //Exit game
            this.$speech.addText("<p>Ok then, have an exciting day. Good bye!</p>");
            this.tell(this.$speech);
        },
        Unhandled(){
            switch(currentStateOb.userAttempts){
                case(0):
                    this.$speech.addText("<p>Sorry, did you want to begin the game or not?</p>");
                    this.$reprompt.addText("<p>Sorry, did you want to begin the game or not?</p>");
                    break;
                case(1):
                    this.$speech.addText("<p>Please answer with a YES or a NO!</p>");
                    this.$reprompt.addText("<p>Please answer with a YES or a NO!</p>");
                    break;
                case(2):
                    this.$speech.addText("<p>Sorry, maybe you are getting confused. You can try again later. Have a good day!</p>");
            }
            currentStateOb.userAttempts++;

            if(currentStateOb.userAttempts >= 3){
                this.tell(this.$speech);
            }else{
                this.followUpState('StartState').ask(this.$speech, this.$reprompt);
            }
        },
    },

    //Stateless intent for giving menu
    GiveMenu(){
        //Current state is the MAIN_MENU
        currentStateOb.state = states[1].state;
        currentStateOb.stateName = states[1].stateName;
        currentStateOb.userAttempts = states[1].userAttempts;
        //Set player response
        let speech = "";

        //if it's the players first, second or third time logging in, then play a slightly larger introduction to the menu
        if(numberOfTimesLoggedIn < 3){
            speech += '<p>From the main menu you can either choose to: '+
                      '<p>Start the game! </p>'+
                      '<p>Show my rank! </p>'+
                      '<p>Ask for help! </p>'+
                      '<p>Or quit the game! </p>'+
                      '<p>Which option would you like to select?</p>';
            numberOfTimesLoggedIn++;
        }else{
            speech += '<p>Please choose either to play, </p>'+
                      '<p>Show my rank! </p>'+
                      '<p>Ask for help! </p>'+
                      '<p>or quit the game</p>';
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
            speech += "<p>We hope you are ready for our memory game. </p>";
        }

        //Else just continue
        speech += "<p>You have, so far, unlocked: </p>";
        for(const level of levelsUnlocked){
            if(level.unlocked == true){
                speech += level.name + ", ";
            }
        }
        speech += "<p>Which level would you like to play? You can also go back to the main menu. </p>";
        this.$speech.addText(speech);
        this.$reprompt.addText(Reprompt());
        this.followUpState('LevelSelectionState').ask(this.$speech, this.$reprompt);
    },

    LevelSelectionState: {
        LevelSelectionIntent(){
            userLevelSelected = this.$inputs.levelNumber.value;
            //Check if the user has selected a non-existant level
            if(!(userLevelSelected > 6 || userLevelSelected < 1)){
                //Check if the user has selected a locked level
                if(levelsUnlocked[userLevelSelected-1].unlocked == true){
                    //Go to initialisation stateless function
                    return this.toStatelessIntent('InitialisationIntent');

                }else{
                    this.$speech.addText("<p>Sorry this level needs to be unlocked by playing the prior levels in order. </p>" + Reprompt());
                    this.$reprompt.addText(Reprompt());
                    this.followUpState('LevelSelectionState').ask(this.$speech, this.$reprompt);
                }
            }else{
                this.$speech.addText("<p>Sorry this level does not exist. </p>" + Reprompt());
                this.$reprompt.addText(Reprompt());
                this.followUpState('LevelSelectionState').ask(this.$speech, this.$reprompt);
            }
        },
        BackToMenuIntent() {
            //Go back to main menu
            return this.toStatelessIntent('GiveMenu');
        },
        Unhandled(){
            //Try again
            this.$speech.addText("<p>Sorry, I could not understand you. </p>" + Reprompt());
            this.$reprompt.addText(Reprompt());

            this.followUpState('LevelSelectionState').ask(this.$speech, this.$reprompt);
        },
    },

    //Stateless initialisation function
    InitialisationIntent(){
        //Initialise things first
        //Set state
        currentState = "inGame";
        //Set up random boxes
        let animalNoises = levelsUnlocked[userLevelSelected-1].numberOfSounds;
        shuffle(animals); //shuffle animal array to pick from
        //Reset array
        inGameSounds = [];
        //Fill array
        for(let i=0; i<animalNoises; i++){
            //Add in number of animal noises
            inGameSounds.push({
                name: animals[i].name,
                resource: animals[i].resource,
                opened: false
            });
            //Double animal noises
            inGameSounds.push({
                name: animals[i].name,
                resource: animals[i].resource,
                opened: false
            });
        }
        //Shuffle new const
        shuffle(inGameSounds);

        //Instructions - only needed for new players
        let speech = "";
        if(numberOfTimesLoggedIn < 3){
            speech += "<p>At any point in time during the level; you can say exit to quit the game,"+
            " back to go back to level selection, help to ask for help, "+
            "check opened to see any opened boxes or score to check your current score! </p>"+
            "<p>You will also be asked for two boxes to match up together! </p>";
        }
        //Level info
        speech += "<p>" + levelsUnlocked[userLevelSelected-1].name + " has " +
        (levelsUnlocked[userLevelSelected-1].numberOfSounds*2) + " sounds to discover. Meaning a total of " +
        levelsUnlocked[userLevelSelected-1].numberOfSounds + " pairs to match up! </p>";
        //Query
        speech += "<p>Ok please choose two boxes to start off between 1 and "+inGameSounds.length;
        //Increase num of times played and reset score
        numOfTimesPlayed++;
        //Reset current player score
        playerScore = 0;
        this.$speech.addText(speech);
        this.$reprompt.addText(Reprompt());
        this.followUpState('InGameState').ask(this.$speech, this.$reprompt);
    },

    InGameState: {
        BoxIntent()
        {
            //Assign animal objects to boxes and then randomize them
            let speech = "";
            let indexSelected1 = this.$inputs.boxNumberONE.value-1;
            let indexSelected2 = this.$inputs.boxNumberTWO.value-1;

            //Check if values where entered at all
            if(isEmpty(indexSelected1) || isEmpty(indexSelected2)){
                speech = "<p>You only chose one box. Please select two boxes to open. </p>";
            }else{
                //Check if boxes exist
                if(!(indexSelected1+1 > inGameSounds.length || indexSelected2+1 > inGameSounds.length)){
                    //Check that the user didn't choose the same boxes
                    if(!(indexSelected1 == indexSelected2)){
                        //Check if either box picked is already opened
                        if(inGameSounds[indexSelected1].opened == true && inGameSounds[indexSelected2].opened == true){
                            speech = "<p>both boxes have already opened. </p>";

                        }else if(inGameSounds[indexSelected1].opened == true){
                            speech = "<p>box "+(indexSelected1+1)+
                                      " is already opened. </p>";
                        }else if(inGameSounds[indexSelected2].opened == true){
                            speech = "<p>box "+(indexSelected2+1)+
                                      " is already opened. </p>";
                        }else{
                            //Play animal sounds
                            speech += "<p>"+inGameSounds[indexSelected1].resource+" </p>"+
                                      "<p>"+inGameSounds[indexSelected2].resource+" </p>";

                            //Check now if they match or not
                            if(inGameSounds[indexSelected1].name == inGameSounds[indexSelected2].name){
                                //Tell user they where correct
                                speech += "<p>NICE <audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/success.mp3'/>"+
                                          " Good work! you found a pair of "+inGameSounds[indexSelected1].name+"s! </p>";
                                //Set now opened boxes to true
                                inGameSounds[indexSelected1].opened = true;
                                inGameSounds[indexSelected2].opened = true;

                                //Increase score
                                playerScore++;

                                //Check if every box has now finished
                                if(checkEveryBox() == inGameSounds.length){
                                    //Save last sounds to play in stateless intent
                                    outSideSpeech = "<p>"+inGameSounds[indexSelected1].resource+" </p>"+
                                                    "<p>"+inGameSounds[indexSelected2].resource+" </p>";
                                    //Go to win state
                                    return this.toStatelessIntent('WinStatelessFunction');
                                }
                            }else{
                                //Tell user they where incorrect
                                speech += "<p>WRONG <audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/fail2.mp3'/>"+
                                          " animals from two boxes were not same. </p>";
                                //Decrement score
                                playerScore--;
                            }
                        }
                    }else{
                        speech = "<p>Sorry, your two choices are the same. No cheating! </p>";
                    }
                }else{
                    speech = "<p>One of your box choices does not exist. </p>";
                }
            }


            speech += "<p>please select two boxes to continue between 1 and "+inGameSounds.length+" </p>";
            //Send out prompt
            this.$speech.addText(speech);
            this.$reprompt.addText(Reprompt());
            this.followUpState('InGameState').ask(this.$speech, this.$reprompt);
        },
        RankIntent(){
            let speech = "";
            speech += "<p>Your highest score so far in this game is: "+playerScore+" </p>";

            //Reprompt the user
            speech += "<p>Ok please choose two boxes to continue between 1 and "+inGameSounds.length;
            this.$speech.addText(speech);
            this.$reprompt.addText(Reprompt());
            this.followUpState('InGameState').ask(this.$speech, this.$reprompt);
        },
        OpenedIntent(){
            let speech = "";
            speech += "<p>You have opened: </p>";
            //Check which boxes where opened
            let ifNoneOpened = true;
            for(let i = 0; i < inGameSounds.length; i++){
                if(inGameSounds[i].opened == true){
                    ifNoneOpened = false;
                    speech += "<p>box number "+(i+1)+". It was a "+inGameSounds[i].name+". </p>";
                    //Add middle text
                    if(!(i%2==0)){
                        speech += "<p>and you've opened </p>";
                    }
                }
            }
            //Check if no boxes are opened
            if(ifNoneOpened == true){
                speech += "<p>No boxes have been opened yet! </p>";
            }

            //Reprompt the user
            speech += "<p>please select two boxes to continue between 1 and "+inGameSounds.length;
            this.$speech.addText(speech);
            this.$reprompt.addText(Reprompt());
            this.followUpState('InGameState').ask(this.$speech, this.$reprompt);
        },
        HelpIntent(){
            //Reprompt the user and let them know how to use the app whilst playing
            let speech = "";
            speech += "<p>At any point in time during the level; you can say exit to quit the game,"+
                      " back to go back to level selection, help to ask for help or score to check your current score! </p>";
            speech += "<p>You will also be asked for two boxes to match up together! </p>";
            speech += "<p>please select two boxes to continue between 1 and "+inGameSounds.length;

            this.$speech.addText(speech);
            this.$reprompt.addText(Reprompt());
            this.followUpState('InGameState').ask(this.$speech, this.$reprompt);
        },
        BackToMenuIntent() {
            //Go back to main menu
            return this.toStatelessIntent('GiveMenu');
        },
        BackToLevelSelectionIntent(){
            //Go back to level selection
            return this.toStatelessIntent('PlayIntentMenuGiver');
        },
        ExitIntent(){
            //Current state is the main menu
            currentState = "exitGame";
            //Set player response
            this.$speech.addText("Thank you for playing our animal memory game, good bye!");
            this.tell(this.$speech);
        },
        Unhandled(){
            //Try again
            this.$speech.addText("<p>Sorry, I could not understand you.</p>" + Reprompt());
            this.$reprompt.addText(Reprompt());

            this.followUpState('BackToMainMenuState').ask(this.$speech, this.$reprompt);
        },
    },

    //Win stateless function
    WinStatelessFunction(){
        //Set state
        currentState = "winState";

        //Set final winning text
        let speech = "";
        speech += outSideSpeech;
        speech += "<p>Congradulations on winning "+levelsUnlocked[userLevelSelected-1].name+". </p>";

        //Unlock next level
        if(!(userLevelSelected > levelsUnlocked.length-1)){
            levelsUnlocked[userLevelSelected].unlocked = true;
            speech += "<p>You've now unlocked "+levelsUnlocked[userLevelSelected].name+". </p>";
        }else{
            speech += "<p>You have reached the max level for the animal sound pack. </p>";
        }
        //If current score is better than highest score than save
        if(playerScore > bestScore){
            bestScore = playerScore;
            //Tell player
            speech += "<p>You've achieved a new highest score of "+bestScore+". Congratulations!!!!!!!! </p>";
        }

        speech += "<p>Say level selection to go play your newly unlocked level or say back to go back to the main menu. </p>";

        //Prompt
        this.$speech.addText(speech);
        this.$reprompt.addText(Reprompt());

        this.followUpState('BackToMainMenuState').ask(this.$speech, this.$reprompt);
    },

    BackToMainMenuState: {
        BackToMenuIntent() {
            return this.toStatelessIntent('GiveMenu');
        },
        BackToLevelSelectionIntent(){
            //Go back to level selection
            return this.toStatelessIntent('PlayIntentMenuGiver');
        },
        Unhandled(){
            //Try again
            this.$speech.addText("<p>Sorry, I could not understand you. </p>" + Reprompt());
            this.$reprompt.addText(Reprompt());

            this.followUpState('BackToMainMenuState').ask(this.$speech, this.$reprompt);
        },
    },
});

module.exports.app = app;


// ------------------------------------------------------------------
// FUNCTIONS
// ------------------------------------------------------------------
//Is empty function
function isEmpty(value){
  return (value == null || value.length === 0 || typeof value == 'undefined');
}

//Check if every box has been Opened
function checkEveryBox(){
    //Go through all boxes and check how many are opened
    let countedOpenedBoxes = 0;
    for(let p=0; p<inGameSounds.length; p++){
        if(inGameSounds[p].opened == true){
            countedOpenedBoxes++;
        }
    }

    //Return count of opened boxes
    return countedOpenedBoxes;
}

//shuffeling function
function shuffle(array){
    for(let i = array.length - 1; i > 0; i--){
        let j = Math.floor(Math.random() * (i+1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

//Dynamic reprompt function
function Reprompt(){
    let text = "";
    if(currentState === "start"){
        text = "Are you ready to play the animal memory game?";
    }else if(currentState === "mainMenu"){
        text = "Please select a main menu option from either: Start, show my rank, ask for help or exit the game!";
    }else if(currentState === "helpMenuState" || currentState === "rankMenuState"){
        text = "Please let me know if you wish to go back";
    }else if(currentState === "soundSelect"){
        text = "Please choose a sound package to play!, the available sound packages are: <list packages>";
    }else if(currentState === "levelSelect"){
        text = "Please choose a level to play or go back to the main menu";
    }else if(currentState === "inGame"){
        text = "Please choose a box and then another one to match it, or you can choose to either exit, back to menu, back to level select, help, check your score or check opened boxes";
    }else if(currentState === "winState"){
        text = "Please choose to either go back to the level selection menu or the main menu";
    }else if(currentState === "playingGame"){
        text = "Please choose a level to select and play";
    }
    return text;
}

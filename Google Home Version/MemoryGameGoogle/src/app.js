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

//Highest Score
var bestScore = 0;
//Current level
var currentLevel = 1;
var fromMenu = true;

//Users first and second box choice
var firstBoxChoice = 9999;
var secondBoxChoice = 9999;
var hasFirstSelected = false;

var userLevelSelected;
var outSideSpeech = "";

//players current ingame score
var playerScore = 0;

//Previous text from winning
var outsideText = "";

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
        stateName: "HELP_MENU",
        userAttempts: 0
    },{
        state: 3,
        stateName: "RANK_MENU",
        userAttempts: 0
    },{
        state: 4,
        stateName: "INGAME",
        userAttempts: 0
    }
]

//levels unlocked
const levelsUnlocked = [
    {
        id: 1,
        name: "Level 1",
        unlocked: true,
        numberOfSounds: 3,
        minimumTries: 3,
        tries: 0
    },{
        id: 2,
        name: "Level 2",
        unlocked: false,
        numberOfSounds: 4,
        minimumTries: 4,
        tries: 0
    },{
        id: 3,
        name: "Level 3",
        unlocked: false,
        numberOfSounds: 6,
        minimumTries: 6,
        tries: 0
    },{
        id: 4,
        name: "Level 4",
        unlocked: false,
        numberOfSounds: 8,
        minimumTries: 6,
        tries: 0
    },{
        id: 5,
        name: "Level 5",
        unlocked: false,
        numberOfSounds: 10,
        minimumTries: 6,
        tries: 0
    },{
        id: 6,
        name: "Level 6",
        unlocked: false,
        numberOfSounds: 12,
        minimumTries: 6,
        tries: 0
    }
];

//create an array of animal objects
const animals = [
    {
        name: "dog",
        pluralName: "dogs",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/dog.mp3' />",
        opened: false
    },{
        name: "cat",
        pluralName: "cats",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/cat.mp3' />",
        opened: false
    },{
        name: "chicken",
        pluralName: "chickens",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/chicken.mp3' />",
        opened: false
    },{
        name: "cow",
        pluralName: "cows",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/cow.mp3' />",
        opened: false
    },{
        name: "turkey",
        pluralName: "tukeys",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/turkey.mp3' />",
        opened: false
    },{
        name: "frog",
        pluralName: "frogs",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/frog.mp3' />",
        opened: false
    },{
        name: "goat",
        pluralName: "goats",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/goat.mp3' />",
        opened: false
    },{
        name: "goose",
        pluralName: "geese",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/goose.mp3' />",
        opened: false
    },{
        name: "horse",
        pluralName: "horses",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/horse.mp3' />",
        opened: false
    },{
        name: "pig",
        pluralName: "pigs",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/pig.mp3' />",
        opened: false
    },{
        name: "sheep",
        pluralName: "sheeps",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/sheep.mp3' />",
        opened: false
    },{
        name: "elephant",
        pluralName: "elephants",
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

        numberOfTimesLoggedIn++;
        console.log("Number of times logged in: "+numberOfTimesLoggedIn);
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

        //Add winning speech
        console.log("outSideSpeech at givemenu function: " + outSideSpeech);
        if(outSideSpeech != ""){
            speech += outsideText;
        }

        //if it's the players first, second or third time logging in, then play a slightly larger introduction to the menu
        if(numberOfTimesLoggedIn < 3){
            speech += '<p>From the main menu you can either choose to: </p>'+
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
            //Set player response
            this.$speech.addText("Thank you for playing our animal memory game, good bye!");
            this.tell(this.$speech);
        },
        HelpIntent(){
            //Current state is the main menu
            currentStateOb.state = states[2].state;
            currentStateOb.stateName = states[2].stateName;
            currentStateOb.userAttempts = states[2].userAttempts;
            //Set player response
            this.$speech.addText("<p>To help our farm ship off animals, you will be given a set amount of crates to open. </p>"+
                                 "<p>Each crate contains a sound that you have to match up with one other crate. </p>"+
                                 "<p>Once all crates are open and shipped off, the next level will begin with even more crates to help with. </p>"+
                                 "<p>If you decide to go back to the main menu or quit, your score will be tallied up and saved at that point. </p>");
            this.$speech.addText("<p>Please choose to either play, show my rank, ask for help or quit the game!</p>");
            this.$reprompt.addText(Reprompt());

            this.followUpState('MenuSelectionState').ask(this.$speech, this.$reprompt);
        },
        RankIntent(){
            //Current state is the main menu
            currentStateOb.state = states[3].state;
            currentStateOb.stateName = states[3].stateName;
            currentStateOb.userAttempts = states[3].userAttempts;
            //Set player response
            this.$speech.addText("<p>Your current highest score in our Animal Memory Game is:</p>" +
                                 "<p>" + bestScore + "</p>");
            this.$speech.addText("<p>Please choose to either play, show my rank, ask for help or quit the game!</p>");
            this.$reprompt.addText(Reprompt());

            this.followUpState('MenuSelectionState').ask(this.$speech, this.$reprompt);
        },
        PlayIntent(){
            //Return to the stateless playintent menu giver so that the level selection can be reused
            fromMenu = true;
            return this.toStatelessIntent('InitialisationIntent');
        },
        Unhandled(){
            switch(currentStateOb.userAttempts){
                case(0):
                    this.$speech.addText("<p>Sorry, I may have miss-heard, can you please choose an main menu option?</p>");
                    this.$reprompt.addText("<p>Sorry, I may have miss-heard, can you please choose an main menu option?</p>");
                    break;
                case(1):
                    this.$speech.addText("<p>Please select either to play, show my rank, ask for help or quit the game!</p>");
                    this.$reprompt.addText("<p>Please select either to play, show my rank, ask for help or quit the game!</p>");
                    break;
                case(2):
                    this.$speech.addText("<p>Sorry, maybe I am having trouble hearing you so we'll try again later. Have a good day!</p>");
            }
            currentStateOb.userAttempts++;

            if(currentStateOb.userAttempts >= 3){
                this.tell(this.$speech);
            }else{
                this.followUpState('MenuSelectionState').ask(this.$speech, this.$reprompt);
            }
        },
    },

    //Stateless initialisation function
    InitialisationIntent(){
        //Set user state
        currentStateOb.state = states[4].state;
        currentStateOb.stateName = states[4].stateName;
        currentStateOb.userAttempts = states[4].userAttempts;

        //Initialise things first
        //Set up speech
        let speech = "";
        //Set up random boxes
        let animalNoises = levelsUnlocked[currentLevel-1].numberOfSounds;
        shuffle(animals); //shuffle animal array to pick from
        //Reset array
        inGameSounds = [];
        //Fill array
        for(let i=0; i<animalNoises; i++){
            //Add in number of animal noises
            inGameSounds.push({
                name: animals[i].name,
                pluralName: animals[i].pluralName,
                resource: animals[i].resource,
                opened: false
            });
            //Double animal noises
            inGameSounds.push({
                name: animals[i].name,
                pluralName: animals[i].pluralName,
                resource: animals[i].resource,
                opened: false
            });
        }
        //Shuffle new const
        shuffle(inGameSounds);

        console.log("inGameSounds length: " + inGameSounds.length);

        //----------------Add previous win text if any----
        console.log("outSideSpeech at initialisation function: " + outSideSpeech);
        //Add winning speech
        if(outSideSpeech != ""){
            speech += outsideText;
        }

        //----------------Intro---------------------
        if(numberOfTimesLoggedIn < 5){
            if(fromMenu){
                //Welcome from the menu to the game
                speech += "<p>We hope you are ready for our memory game. </p>";
            }
            //Introduction to the game
            speech += "<p>At any point in time during the level; you can say exit to quit the game, "+
                      "ask for help, check your score, restart the game, or go back to the main menu. </p>"+
                      "<p>You must also pick a box to play! </p>";
        }else{
            if(fromMenu){
                //Welcome from the menu to the game
                speech += "<p>Welcome back player! </p>";
            }
        }

        //-------------Level Info-------------------
        if(numberOfTimesLoggedIn < 5){
            //Level info
            speech += "<p> " + levelsUnlocked[currentLevel-1].name + " has " +
            (levelsUnlocked[currentLevel-1].numberOfSounds*2) + " sounds to discover. Meaning a total of " +
            levelsUnlocked[currentLevel-1].numberOfSounds + " pairs to match up! </p>";

            speech += "<p>Please choose a box to start off between 1 and "+inGameSounds.length;
        }else{
            speech += "<p> " + levelsUnlocked[currentLevel-1].name + "! </p>" +
            "<p>" + (levelsUnlocked[currentLevel-1].numberOfSounds*2) + " sounds! </p>" +
            "<p>" + levelsUnlocked[currentLevel-1].numberOfSounds + " pairs! Ready, set, GO! </p>";
        }

        //Reset current player score if from menu
        if(currentLevel == 1){
            playerScore = 0;
        }else{
            //Player score = (1000*currentLevel.minimumTries/currentLevel.tries)
            playerScore = 0;
            for(let i=0;i < currentLevel; i++){
                playerScore += 1000 * (levelsUnlocked[currentLevel-1].minimumTries/levelsUnlocked[currentLevel-1].tries);
            }
        }

        fromMenu = false;
        this.$speech.addText(speech);
        this.$reprompt.addText(Reprompt());
        this.followUpState('InGameState').ask(this.$speech, this.$reprompt);
    },

    InGameState: {
        BoxIntent(){
            let speech = "";

            //Check if first box or second box is being chosen
            if(!hasFirstSelected){
                firstBoxChoice = this.$inputs.boxNumberSelected.value-1;
            }else{
                secondBoxChoice = this.$inputs.boxNumberSelected.value-1;
            }

            //Log
            console.log("Has the first box been selected: " + hasFirstSelected);
            console.log("First box choice: " + firstBoxChoice);
            console.log("Second box choice: " + secondBoxChoice);

            //Check if box exists
            if(!(firstBoxChoice+1 > inGameSounds.length || (!hasFirstSelected ? false : secondBoxChoice+1 > inGameSounds.length))){
                //Open first box
                if(!hasFirstSelected){
                    //Check if FIRST box has been opened or not
                    if(inGameSounds[firstBoxChoice].opened){
                        speech += inGameSounds[firstBoxChoice].resource + "<p> This box has already been opened! </p>";
                    }else{
                        speech += "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Boxes/door_open.mp3'/>";
                        speech += inGameSounds[firstBoxChoice].resource;
                        //Move onto second box
                        hasFirstSelected = true;

                        //Tell user
                        speech += getRandomSpeech("choosingFirst");
                    }
                }else{
                    //Check if you picked the same box
                    if(!(firstBoxChoice == secondBoxChoice)){
                        //Check if SECOND box has been opened or not
                        if(inGameSounds[secondBoxChoice].opened){
                            speech += inGameSounds[secondBoxChoice].resource + "<p> This box has already been opened! </p>";
                        }else{
                            speech += "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Boxes/door_open.mp3'/>";
                            speech += inGameSounds[secondBoxChoice].resource;

                            //Move on to checking the two boxes
                            //Check now if they match or not
                            if(inGameSounds[firstBoxChoice].name == inGameSounds[secondBoxChoice].name){
                                //Tell user they where correct
                                speech += "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/success.mp3'/>";

                                inGameSounds[firstBoxChoice].opened = true;
                                inGameSounds[secondBoxChoice].opened = true;

                                //Tell user
                                speech += getRandomSpeech("winGuess");

                                resetSelection();
                            }else{
                                //Tell user they where incorrect
                                speech += "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/fail2.mp3'/>"+
                                          "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Boxes/door_slam.mp3'/>"+
                                          "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Boxes/door_slam.mp3'/>";

                                //Tell user
                                speech += "<p>"+getRandomSpeech("looseGuess")+"</p>";

                                resetSelection();
                            }
                            //Increment tries
                            levelsUnlocked[currentLevel-1].tries++;

                            console.log("Total tries for "+levelsUnlocked[currentLevel-1].name+": "+levelsUnlocked[currentLevel-1].tries);

                            //Check if every box has now finished
                            if(checkEveryBox() == inGameSounds.length){
                                //Go to win state
                                return this.toStatelessIntent('WinStatelessFunction');
                            }
                        }
                    }else{
                        speech += "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/fail2.mp3'/>";
                        speech += "<p>No cheating! Your two choices must be different crates! </p>";
                    }
                }
            }else{
                speech += "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/fail2.mp3'/>";
                speech += "<p>Sorry, this box does not exist! </p>";
            }

            //Send out prompt
            this.$speech.addText(speech);
            this.$reprompt.addText(Reprompt());
            this.followUpState('InGameState').ask(this.$speech, this.$reprompt);
        },
        RankIntent(){
            let speech = "";
            speech += "<p>Your highest score so far in this game is: "+playerScore+" </p>";

            //Reprompt the user
            speech += "<p>Please choose a box to continue between 1 and "+inGameSounds.length;
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
            speech += "<p>Please select two boxes to continue between 1 and "+inGameSounds.length;

            this.$speech.addText(speech);
            this.$reprompt.addText(Reprompt());
            this.followUpState('InGameState').ask(this.$speech, this.$reprompt);
        },
        BackToMenuIntent() {
            //Go back to main menu
            return this.toStatelessIntent('GiveMenu');
        },
        ExitIntent(){
            //Current state is the main menu
            currentState = "exitGame";
            //Set player response
            this.$speech.addText("Thank you for playing our animal memory game, good bye!");
            this.tell(this.$speech);
        },
        Unhandled(){
            //Switch case on the current state userattemps
            switch(currentStateOb.userAttempts){
                case(0):
                    this.$speech.addText("<p>Your answer was confusing. Please choose a box to select or another menu option?</p>");
                    this.$reprompt.addText("<p>Your answer was confusing. Please choose a box to select or another menu option?</p>");
                    break;
                case(1):
                    this.$speech.addText("<p>Please choose a box, or show my rank, or ask for help, or restart the game, or back to menu!</p>");
                    this.$reprompt.addText("<p>Please choose a box, or show my rank, or ask for help, or restart the game, or back to menu!</p>");
                    break;
                case(2):
                    this.$speech.addText("<p>hmmm, this didn't sound right. Please ask me to open a crate such as the first one!</p>");
                    this.$reprompt.addText("<p>hmmm, this didn't sound right. Please ask me to open a crate such as the first one!</p>");
                    break;
                case(3):
                    this.$speech.addText("<p>Please say a number, such as ONE to select a box</p>");
                    this.$reprompt.addText("<p>Please say a number, such as ONE to select a box</p>");
                    break;
                case(4):
                    this.$speech.addText("<p>This game might have been too challanging but that's ok. </p>" +
                                         "<p>You will be redirected to the main menu to try again!</p>");
            }
            currentStateOb.userAttempts++;

            if(currentStateOb.userAttempts >= 5){
                //Set current state to main menu
                currentStateOb.state = states[1].state;
                currentStateOb.stateName = states[1].stateName;
                currentStateOb.userAttempts = states[1].userAttempts;

                //Set up playback
                let speech = ""

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
                //set reprompt and redirect to the main menu
                this.$speech.addText(speech);
                this.$reprompt.addText(Reprompt());
                this.followUpState('MenuSelectionState').ask(this.$speech, this.$reprompt);
            }else{
                this.followUpState('InGameState').ask(this.$speech, this.$reprompt);
            }
        },
    },

    //Win stateless function
    WinStatelessFunction(){
        //Set state
        currentState = "winState";

        //Set final winning text
        let speech = "";
        speech += "<p>Congradulations on winning "+levelsUnlocked[currentLevel-1].name+". </p>";

        //Unlock next level
        if(!(currentLevel > levelsUnlocked.length-1)){
            levelsUnlocked[currentLevel].unlocked = true;
            speech += "<p>You're now ready for </p>" + levelsUnlocked[currentLevel].name;
        }else{
            speech += "<p>You've finished the game!!! </p>";
        }

        //Increment the levels
        currentLevel++;

        console.log("Bestscore is: "+bestscore+". PlayerScore is: "+playerScore);
        console.log("Player is moving from: "+currentLevel-1+" to "+currentLevel);

        //If current score is better than highest score than save
        if(playerScore > bestScore){
            bestScore = playerScore;
            //Tell player
            speech += "<p>You've achieved a new highest score of "+bestScore+". Congratulations!!!!!!!! </p>";

            //Return to the main menu
            outsideText = speech;
            console.log("outSideSpeech: " + outSideSpeech);
            return this.toStatelessIntent('GiveMenu');
        }

        //Send to next level
        outsideText = speech;
        console.log("outSideSpeech: " + outSideSpeech);
        return this.toStatelessIntent('InitialisationIntent');
    },

    END() {
        this.$speech.addText("Sorry to see you go. Good bye!");
        this.tell(this.$speech);
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

//Reset selection
function resetSelection(){
    //Reset selections
    firstBoxChoice = 9999;
    secondBoxChoice = 9999;
    hasFirstSelected = false;
}

//Random text
function getRandomSpeech(state){
    let speech = "";
    let randomSpeech = Math.floor(Math.random() * 6);

    console.log("current state is: "+state+". randomSpeech num: "+randomSpeech);

    switch(state){
        case "choosingFirst":
            switch(randomSpeech){
                case 0:
                    speech = "Ok, choose another crate to open!";
                    break;
                case 1:
                    speech = "Just one more left!";
                    break;
                case 2:
                    speech = "We need to crack one more open!";
                    break;
                case 3:
                    speech = "Nice guess. Just one left!";
                    break;
                case 4:
                    speech = "You're doing well!";
                    break;
                case 5:
                    speech = "hmmmmmm";
                    break;
            }
            break;
        case "winGuess":
            switch(randomSpeech){
                case 0:
                    speech = "Nice, you found a pair of "+inGameSounds[firstBoxChoice].pluralName;
                    break;
                case 1:
                    speech = "Oh wow, nice!";
                    break;
                case 2:
                    speech = inGameSounds[firstBoxChoice].pluralName + ", awe, so adorable!";
                    break;
                case 3:
                    speech = "Congradulations! These two will go nicely together";
                    break;
                case 4:
                    speech = inGameSounds[firstBoxChoice].pluralName + " is such a strange word, don't ya think?";
                    break;
                case 5:
                    speech = "mmmmm";
                    break;
            }
            break;
        case "looseGuess":
            switch(randomSpeech){
                case 0:
                    speech = "Awe, that's a shame. Better luck next time!";
                    break;
                case 1:
                    speech = "Sorry, these two where incorrect";
                    break;
                case 2:
                    speech = "Pretty sure a " + inGameSounds[firstBoxChoice].name + " and a "+inGameSounds[secondBoxChoice].name + " are not the same.... Or are they!?!";
                    break;
                case 3:
                    speech = "This was a missmatched pair. Maybe try a different combo?";
                    break;
                case 4:
                    speech = "That's alright. Try again for more luck!";
                    break;
                case 5:
                    speech = "Awe.....";
                    break;
            }
            break;
    }

    //return it
    console.log("speech to return: "+speech);
    return speech;
}

//Dynamic reprompt function
function Reprompt(){
    let text = "";
    if(currentStateOb.stateName === "START"){
        text = "Are you ready to play the animal memory game?";
    }else if(currentStateOb.stateName === "MAIN_MENU"){
        text = "Please select a main menu option from either: Start, show my rank, ask for help or exit the game!";
    }else if(currentStateOb.stateName === "HELP_MENU" || currentStateOb.stateName === "RANK_MEMU"){
        text = "Please let me know if you wish to go back";
    }else if(currentStateOb.stateName  === "SOUND_SELECT"){
        text = "Please choose a sound package to play!, the available sound packages are: <list packages>";
    }else if(currentStateOb.stateName  === "INGAME"){
        text = "Please choose a box and then another one to match it, or you can choose to either exit, back to menu, back to level select, help, check your score or check opened boxes";
    }else if(currentStateOb.stateName  === "WIN_STATE"){
        text = "Please choose to either go back to the level selection menu or the main menu";
    }else if(currentStateOb.stateName  === "PLAYING_GAME"){
        text = "Please choose a level to select and play";
    }
    return text;
}

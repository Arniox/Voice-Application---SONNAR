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
                    this.$speech.addText("<p>Sorry, I may have missheard, can you please choose an main menu option?</p>");
                    this.$reprompt.addText("<p>Sorry, I may have missheard, can you please choose an main menu option?</p>");
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
        //Set up speech
        let speech = "";
        //If num of times played less than 3, then introduce the player
        if(fromMenu){
            speech += "<p>We hope you are ready for our memory game. </p>";
        }

        //Initialise things first
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
        if(numberOfTimesLoggedIn < 5 && fromMenu){
            speech += "<p>At any point in time during the level; you can say exit to quit the game, "+
                      "ask for help, check your score, restart the game, or go back to the main menu. </p>"+
                      "<p>You must also pick a box to play! </p>";
        }
        //Level info
        speech += "<p>" + levelsUnlocked[currentLevel-1].name + " has " +
        (levelsUnlocked[currentLevel-1].numberOfSounds*2) + " sounds to discover. Meaning a total of " +
        levelsUnlocked[currentLevel-1].numberOfSounds + " pairs to match up! </p>";
        //Query
        speech += "<p>Please choose a box to start off between 1 and "+inGameSounds.length;
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
    END() {
        let reason = this.getEndReason();

        console.log(reason);

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

'use strict';

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { GoogleAssistant,
    List,
    OptionItem,
    } = require('jovo-platform-googleassistant'); 
const { JovoDebugger } = require('jovo-plugin-debugger');
//const { FileDb } = require('jovo-db-filedb'); //<----- FileDB
const { DynamoDb } = require('jovo-db-dynamodb'); // <----- DynamoDB

const app = new App();

app.use(
    new Alexa(),
    new GoogleAssistant(),
    new JovoDebugger(),
    //new FileDb(), <----- FileDB
    new DynamoDb() // < ---- DynamoDB
);

// ------------------------------------------------------------------
// DATABASING VARIABLES
// this.$user.$data.score = 2; <--- creates an item in the database (deviceID is auto primary key)
// let score = this.$user.$data.score; <--- creates a local variable with data retrieved from the DB
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------
//States and user data
let currentState = ""; //Current game state
let numberOfTimesLoggedIn = 0;
var finishedAllLevels = false;
let speech = "";

// ------------------------------------------------------------------
// DISPLAY VARIABLES
// ------------------------------------------------------------------
let title = 'Card Title Default';
let content = 'Card Content Default';
let imageUrl = 'https://s3.amazonaws.com/jovocards/SampleImageCardSmall.png';

// UI List items -----------------------------------------------------------------------------------
let yesItem = new OptionItem();
yesItem.setTitle("yes");
yesItem.setDescription("Brings you to the main menu");
yesItem.setKey("StartYesOption");
yesItem.addSynonym("yes");

let noItem = new OptionItem();
noItem.setTitle("no");
noItem.setDescription("Exits the App");
noItem.setKey("StartNoOption");
noItem.addSynonym("no");

let playItem = new OptionItem();
playItem.setTitle("play");
playItem.setDescription("Starts the game");
playItem.setKey("MainMenuPlayOption");
playItem.addSynonym("play");

let rankItem = new OptionItem();
rankItem.setTitle("rank");
rankItem.setDescription("Shows your highest Score and global rank");
rankItem.setKey("MainMenuRankOption");

let helpItem = new OptionItem();
helpItem.setTitle("help");
helpItem.setDescription("Describes the game and options available");
helpItem.setKey("MainMenuHelpOption");

let quitItem = new OptionItem();
quitItem.setTitle("quit");
quitItem.setDescription("Exits the App completely");
quitItem.setKey("MainMenuQuitOption");
quitItem.addSynonym("quit");
// UI List items End-----------------------------------------------------------------------------------

//Current level
var currentLevel = 1;
var fromMenu = true;
var fromReset = false;

//Users first and second box choice
var firstBoxChoice = 9999;
var secondBoxChoice = 9999;
var hasFirstSelected = false;

//players current ingame score
var playerScore = 0;

//Players bestscore
var bestScore = 0;

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
        minimumTries: 8,
        tries: 0
    },{
        id: 5,
        name: "Level 5",
        unlocked: false,
        numberOfSounds: 10,
        minimumTries: 10,
        tries: 0
    },{
        id: 6,
        name: "Level 6",
        unlocked: false,
        numberOfSounds: 12,
        minimumTries: 12,
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

        
        if(this.$user.$data.timesLoggedIn == 0 || this.$user.$data.timesLoggedIn == null)//checks if the user has logged in before
        {
            this.$user.$data.timesLoggedIn = 1; //first time users will have their 'timesLoggedIn' field set to 1 in the database 
            this.$user.$data.bestScore = 0; //Set new users best score to 0 in database
        }
        else
        {
            this.$user.$data.timesLoggedIn += 1; //repeat users will increment their 'timesLoggedIn' field by 1
            bestScore = this.$user.$data.bestScore; //assign a repeat users best score in DB to a local bestScore variable
            
        }
        numberOfTimesLoggedIn = this.$user.$data.timesLoggedIn; //assign the users 'timesLoggedIn' value to a local 'numberOfTimesLoggedIn' variable        
        
        outsideText = "";
        //Logs
        console.log("Local Number of times logged in: "+numberOfTimesLoggedIn);
        console.log("DB Number of times logged in: "+this.$user.$data.timesLoggedIn);
        console.log("bestScore in DB: " + this.$user.$data.bestScore);
        console.log("local bestScore var: " +bestScore);      

        if(numberOfTimesLoggedIn > 3){ //Short welcome for repeat users, long intro for new users
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

        // //---------Display Generation-----------------------------
        // let menuList = new List();
        // menuList.setTitle('MainMenu');
        // menuList.addItem(yesItem);
        // menuList.addItem(noItem);
        // this.$googleAction.showList(menuList);
        // //---------Display Generation-----------------------------

        this.$reprompt.addText(Reprompt());
        // GenerateDisplayTexts();
        // this.showImageCard(title, content, imageUrl);
        this.followUpState('StartState').ask(this.$speech, this.$reprompt);
    },   

    //---Start state: Only yes or no are accepted-------------------------------------------------------------------------------------------------------------------------------
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
        if(finishedAllLevels == false)
        {
            speech = "";
        }

        //Add winning speech
        console.log("outsideText at givemenu function: " + outsideText);
        if(outsideText != ""){
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
        
        //---------Display Generation-----------------------------
        // let menuList = new List();
        // menuList.setTitle('MainMenu');
        // menuList.addItem(playItem);
        // menuList.addItem(rankItem);
        // menuList.addItem(helpItem);
        // menuList.addItem(quitItem);
        // this.$googleAction.showList(menuList);
        //---------Display Generation-----------------------------

        //set speech and reprompt, as well as reset any temporarily changed variables
        finishedAllLevels = false;        
        this.$speech.addText(speech);
        this.$reprompt.addText(Reprompt());
        this.followUpState('MenuSelectionState').ask(this.$speech, this.$reprompt);
        
    },
    //---MenuSelectState------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    MenuSelectionState: {

        // ON_ELEMENT_SELECTED() {
        //     let selectedElement = this.getSelectedElementId();
        //     if (selectedElement === 'MainMenuPlayOption')
        //     {
        //         return this.toIntent('PlayIntent');
        //     }
        //     else if(selectedElement === 'MainMenuQuitOption') 
        //     {
        //         return this.toIntent('ExitIntent');
        //     }
        // },

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

            //---------Display Generation-----------------------------
                // let menuList = new List();
                // menuList.setTitle('MainMenu');
                // menuList.addItem(playItem);
                // menuList.addItem(rankItem);
                // menuList.addItem(helpItem);
                // menuList.addItem(quitItem);
                // this.$googleAction.showList(menuList);
            //---------Display Generation-----------------------------
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

            //---------Display Generation-----------------------------
                // let menuList = new List();
                // menuList.setTitle('MainMenu');
                // menuList.addItem(playItem);
                // menuList.addItem(rankItem);
                // menuList.addItem(helpItem);
                // menuList.addItem(quitItem);
                // this.$googleAction.showList(menuList);
            //---------Display Generation-----------------------------
        
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
                    this.$speech.addText("<p>Sorry, I may have miss-heard, can you please choose a main menu option?</p>");
                    this.$reprompt.addText("<p>Sorry, I may have miss-heard, can you please choose a main menu option?</p>");
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
    },//---End of MenuSelectionState----------------------------------------------------

    //---Stateless initialisation function--------------------------------------------------------------------------------------------------------------------------------------
    InitialisationIntent(){
        //Set user state
        currentStateOb.state = states[4].state;
        currentStateOb.stateName = states[4].stateName;
        currentStateOb.userAttempts = states[4].userAttempts;
   
        //Set up speech
        speech  = "";
        if(fromReset == true)
        {
            speech += "<p>Game Reset! </p>";
            if(checkScore() == true);
            {
               this.$user.$data.bestScore = bestScore;
            }
            resetAllLevels();
        }
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

        //----------------Add previous win text if any---------------
        console.log("outsideText at initialisation function: " + outsideText);
        //Add winning speech
        if(outsideText != ""){
            speech += outsideText;
        }        

        //----------------Intro---------------------
        if(numberOfTimesLoggedIn < 5){
            if(fromMenu){
                //Welcome from the menu to the game
                speech += "<p>We hope you are ready for our memory game. </p>";
            }
            //Introduction to the game
            speech += "<p>You can select a main menu option at anytime during the game to exit out of it! </p>"+
                      "<p>You must also pick a box to play! </p>";
        }
        else{
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
        }else if (numberOfTimesLoggedIn >= 5 && currentLevel < 6) //Shortened level info 
        {
            speech += "<p> " + levelsUnlocked[currentLevel-1].name + "! </p>" +
            "<p>" + (levelsUnlocked[currentLevel-1].numberOfSounds*2) + " sounds! </p>" +
            "<p>" + levelsUnlocked[currentLevel-1].numberOfSounds + " pairs! Ready, set, GO! </p>";
        }
        else{//Short intro to introduce the final level
            speech += "<p> " + levelsUnlocked[currentLevel-1].name + "! The final level! </p>" +
            "<p>" + (levelsUnlocked[currentLevel-1].numberOfSounds*2) + " sounds! </p>" +
            "<p>" + levelsUnlocked[currentLevel-1].numberOfSounds + " pairs! Ready, set, GO! </p>";
        }
        
        //---------Display Generation-----------------------------
        
        //---------Display Generation-----------------------------
        fromReset = false;
        outsideText = "";
        fromMenu = false;
        this.$speech.addText(speech);
        this.$reprompt.addText(Reprompt());
        this.followUpState('InGameState').ask(this.$speech, this.$reprompt);
    },//------------ END OF INITIALIZATION---------------------------------------------------------------------------------------------------------------------------------

    //Asks the user if they're sure they want to reset the game or not
    ResetGameState: {
        YesIntent(){            
            fromReset = true;
            return this.toStatelessIntent('InitialisationIntent');
        },

        NoIntent()
        {
            speech = ""; 
            speech += "<p>Back to the game! Please select your first box </p>";
            this.$speech.addText(speech);
            this.$reprompt.addText(Reprompt());
            this.followUpState('InGameState').ask(this.$speech, this.$reprompt);
        },
    },
    //Asks the user if theyre sure they want to exit their current game to the main menu
    BackToMenuState:
    {
        YesIntent(){
            return this.toStatelessIntent('GiveMenu');
        },

        NoIntent()
        {
            speech = "";
            if(hasFirstSelected == false)
            {
                speech += "<p>Back to the game! Please select your first box </p>";
            } 
            else{
                speech += "<p>Back to the game! Please select your second box </p>";
            }            
            this.$speech.addText(speech);
            this.$reprompt.addText(Reprompt());
            this.followUpState('InGameState').ask(this.$speech, this.$reprompt);
        },
    },

     //-------------In Game----------------------------------------------------------------------------------------------------------------------------------------------------
    InGameState: {
        BoxIntent(){
            speech = "";

        //---------Display Generation-----------------------------
        
        //---------Display Generation-----------------------------
        
            //Check if first box or second box is being chosen
            if(!hasFirstSelected){
                firstBoxChoice = this.$inputs.boxNumberSelected.value-1;
            }else{
                secondBoxChoice = this.$inputs.boxNumberSelected.value-1;
            }

            //Log
            console.log("Has the first box been selected: " + hasFirstSelected);
            console.log("First box choice: " + (firstBoxChoice+1));
            console.log("Second box choice: " + (secondBoxChoice+1));
            showAnswers();

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
                        if(inGameSounds[secondBoxChoice].opened)
                        {
                            speech += inGameSounds[secondBoxChoice].resource + "<p> This box has already been opened! </p>";
                        }else
                        {
                            speech += "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Boxes/door_open.mp3'/>";
                            speech += inGameSounds[secondBoxChoice].resource;

                            //Move on to checking the two boxes
                            //Check now if they match or not
                            if(inGameSounds[firstBoxChoice].name == inGameSounds[secondBoxChoice].name)
                            {
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
                                speech += "<p>, Choose your first box again!</p>";

                                resetSelection();
                            }
                            //Increment tries
                            levelsUnlocked[currentLevel-1].tries++;

                            console.log("Total tries for "+levelsUnlocked[currentLevel-1].name+": "+levelsUnlocked[currentLevel-1].tries);

                            //Check if every box has now finished
                            if(checkEveryBox() == inGameSounds.length){
                                //Go to win state
                                console.log("******all boxes are opened*********************************************");
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
            speech = "";
            calculateScore();
            speech += "<p>Your current score for this session is: "+playerScore+" </p>";

            //Reprompt the user
            speech += "<p>Please choose a box to continue between 1 and "+inGameSounds.length;
            this.$speech.addText(speech);
            this.$reprompt.addText(Reprompt());
            this.followUpState('InGameState').ask(this.$speech, this.$reprompt);
        },
        HelpIntent(){
            //Reprompt the user and let them know how to use the app whilst playing
            speech = "";
            speech += "<p>At any point in time during the level; you can say exit to quit the game,"+
                      " back to go back to the main menu, help to ask for help, or score to check your current score! </p>";
            speech += "<p>You will also be asked for two boxes to match up together! </p>";
            speech += "<p>Please select two boxes to continue between 1 and "+inGameSounds.length;

            this.$speech.addText(speech);
            this.$reprompt.addText(Reprompt());
            this.followUpState('InGameState').ask(this.$speech, this.$reprompt);
        },
        ResetIntent(){
            speech = "";
            calculateScore();
            if(currentLevel > 1)
            {
                speech += "<p>Are you sure you want to restart your game? you will lose your current score of " + playerScore + 
                " and sent back to the first level </p>";
            }
            else{
                speech += "<p>Are you sure you want to restart your game? you will lose your current score of " + playerScore + " </p>";
            }            

            this.$speech.addText(speech);
            this.$reprompt.addText(Reprompt());
            this.followUpState('ResetGameState').ask(this.$speech, this.$reprompt);
        },
        BackToMenuIntent() {
            speech = "";
            calculateScore();
            if(currentLevel > 1)
            {
                speech += "<p>Are you sure you want to leave your game? you will lose your current score of " + playerScore + 
                " and sent back to level 1 </p>";
            }
            else{
                speech += "<p>Are you sure you want to leave your game? you will lose your current score of " + playerScore + " </p>";
            }            

            this.$speech.addText(speech);
            this.$reprompt.addText(Reprompt());
            this.followUpState('BackToMenuState').ask(this.$speech, this.$reprompt);
        },
        ExitIntent(){
            //Current state is the main menu
            currentState = "exitGame";
            //Set player response
            if(checkScore() == true)
            {
                speech = "";
                this.$speech.addText("Hey you got new highscore of "+playerScore+"! see you tomorrow!");
                this.$user.$data.bestScore = bestScore;
            }
            else
            {
                this.$speech.addText("Better luck next time! have a good day");
            }
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
                speech = ""

                //if it's the players first, second or third time logging in, then play a slightly larger introduction to the menu
                if(numberOfTimesLoggedIn < 5 && currentLevel == 1){
                    speech += '<p>From the main menu you can either choose to: '+
                              '<p>Start the game! </p>'+
                              '<p>Show my rank! </p>'+
                              '<p>Ask for help! </p>'+
                              '<p>Or quit the game! </p>'+
                              '<p>Which option would you like to select?</p>';
                }else{
                    speech += '<p>Please choose either to play, </p>'+
                              '<p>Show my rank! </p>'+
                              '<p>Ask for help! </p>'+
                              '<p>or quit the game</p>';
                }
                //set reprompt and redirect to the main menu
                this.$speech.addText(speech);
                this.$reprompt.addText(Reprompt());
                this.followUpState('MenuSelectionState').ask(this.$speech, this.$reprompt);
            }else{
                this.followUpState('InGameState').ask(this.$speech, this.$reprompt);
            }
        },
    }, //------End of in-game state---------

    //---Win stateless function-------------------------------------------------------------------------------------------------------------------------------------------------------
    WinStatelessFunction(){
        //Set state
        currentState = "winState";

        //Set final winning text
        speech = "";
        
        speech += "<p>Congratulations on winning "+levelsUnlocked[currentLevel-1].name+". </p>";

        //Unlock next level
        if(!(currentLevel > levelsUnlocked.length-1))
        {
            levelsUnlocked[currentLevel].unlocked = true;
            speech += "<p>You're now ready for the next shipment! </p>";
        }
        else //if they have completed all the rounds
        {
            speech += "<p>That's all the shipments sorted! </p>";
            finishedAllLevels = true;
            if(checkScore() == true);
            {
               this.$user.$data.bestScore = bestScore; 
            }          
            resetAllLevels();
            speech += "<p>We hope you enjoyed your time! all the levels have been reset for you to do it all over again! you will now be returned to the main menu. </P>";
            fromMenu = false;
            return this.toStatelessIntent('GiveMenu');
        }

        //Increment the levels
        currentLevel++; //HAVE TO MOVE/CHANGE THIS

        console.log("old DB Bestscore is: "+this.$user.$data.bestScore);
        console.log("old Local BestScore is: " + bestScore);
        console.log("Player is moving from: " + currentLevel-1 +" to "+currentLevel);

        if(checkScore() == true);
        {
            this.$user.$data.bestScore = bestScore;
        }

        console.log("New DB Bestscore is: "+this.$user.$data.bestScore);
        console.log("New Local BestScore is: " + bestScore);

        //Send to next level
        outsideText = speech;
        console.log("outsideText: " + outsideText);
        return this.toStatelessIntent('InitialisationIntent');
    },   
    
    END() {
        if(checkScore() == true)
        {
            this.$speech.addText("Hey you got new highscore of "+playerScore+"! see you tomorrow!");
            this.$user.$data.bestScore = bestScore;
        }
        else
        {
            this.$speech.addText("Better luck next time! have a good day");
        }
        this.tell(this.$speech);
    },
});

module.exports.app = app;


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// FUNCTIONS
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
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
    console.log("amount of boxes in level is: "+ inGameSounds.length);
    console.log("conuntedOpenedBoxes is: " + countedOpenedBoxes);

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
    firstBoxChoice = 9999;
    secondBoxChoice = 9999;
    hasFirstSelected = false;
}

//Show answers of boxes in console, For testing purposes only
function showAnswers()
{
    console.log("*******************ANSWERS***************************");
    for(var i = 0; i < inGameSounds.length; i++)
    {     
        if (inGameSounds[i].opened == false)
        {
           console.log((i + 1) +" = "+ inGameSounds[i].name +" ||| ");
        }        
    }
    console.log("*******************ANSWERS***************************");
}

//Random text
function getRandomSpeech(state){
    speech = "";
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
                    speech = "Congratulations! These two will go nicely together";
                    break;
                case 4:
                    speech = inGameSounds[firstBoxChoice].pluralName + " is such a strange word, don't ya think?";
                    break;
                case 5:
                    speech = "YeeHaw";
                    break;
            }
            break;
        case "looseGuess":
            switch(randomSpeech){
                case 0:
                    speech = "Awe, that's a shame. Better luck next time!";
                    break;
                case 1:
                    speech = "Sorry, these two were incorrect";
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
        text = "Please choose a box and then another one to match it, or you can choose to either exit, back to menu, help, check your score or check opened boxes";
    }else if(currentStateOb.stateName  === "WIN_STATE"){
        text = "Please choose to either go back to the level selection menu or the main menu";
    }else if(currentStateOb.stateName  === "PLAYING_GAME"){
        text = "Please choose a level to select and play";
    }
    return text;
}

//Generates visual text depending on what state the user is in
function GenerateDisplayTexts(){
    if(currentStateOb.stateName === "START"){
        title = "Welcome to the Memory Game!";
        content = "Are you ready to play the animal memory game?";
    }
    else if(currentStateOb.stateName === "MAIN_MENU"){
        title = "Main Menu";
        content = "Please select a main menu option from either: Start, show my rank, ask for help or exit the game!";
    }
    else if(currentStateOb.stateName === "HELP_MENU"){
        title = "HELP MENU";
        content = "Please let me know if you wish to go back";
    }
    else if(currentStateOb.stateName === "RANK_MEMU"){
        title = "YOUR SCOREBOARD";
        content = "Your highest score is: " + bestScore;
    }
    else if(currentStateOb.stateName  === "INGAME"){
        var answers = "";
        title = "In Game!";
        for(var i = 0; i < inGameSounds.length; i++) //ITERATES THROUGH ALL THE BOXES TO DISPLAY THE ANSWERS, USED FOR TESTING PURPOSES
        {     
            if (inGameSounds[i].opened == false)
            {
                answers += (i + 1) +" = "+ inGameSounds[i].name +" ||| ";
            }    
        }
        content = answers;
    }
    else if(currentStateOb.stateName  === "WIN_STATE"){
        title = "You Win!";
        content = "Please choose to either go back to the level selection menu or the main menu";
    }
}


/*
    Calculates/updates the users session score 
*/
function calculateScore()
{
    //Reset current player score if from menu
    console.log("playerScore WAS: "+playerScore);

    playerScore = 0;
    for(let i=0;i < currentLevel - 1; i++)
    {
        if(levelsUnlocked[i].tries == 0) //Checks if the user has any tries on this round, no calculation needed if not (to avoid divide by 0 faults)
        {
            playerScore += 0;
        }
        else
        {
            playerScore += 1000*(Math.pow(levelsUnlocked[i].minimumTries, 1/(levelsUnlocked[i].tries/levelsUnlocked[i].minimumTries)));
            console.log("playerScore is now: "+playerScore);
            console.log("level " +(i + 1)+" tries = " + levelsUnlocked[i].tries);
        }            
    }
}

/*
    Function to check the users current score against their best one, will return true and tell the user if they have a new high score, will only return false if no new highscore has been achieved
*/
function checkScore()
{
    calculateScore();
    if(playerScore > bestScore){
        bestScore = playerScore; //set new highScore to local bestScore variable
        //Tell player
        speech += "<p>You've also achieved a new high score of "+bestScore+". Well done! </p>";
        console.log("new Bestscore is: "+bestScore);
        return true;
    }
    else 
    {
        console.log("no new high score: bestScore = " +bestScore+ " while playerScore = " +playerScore);
        return false;
    }
    
}

/*
    function to reset all levels, will only reset the user's 'tries' variable for level 1 in order to reset level 1 but still keep it available
*/
function resetAllLevels()
{
    levelsUnlocked[0].tries = 0;

    for(var i = 1; i < levelsUnlocked.length; i++) 
    {
        levelsUnlocked[i].unlocked = false;
        levelsUnlocked[i].tries = 0;
    }
    playerScore = 0;
    currentLevel = 1;
}

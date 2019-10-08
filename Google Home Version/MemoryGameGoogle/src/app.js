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
const { FileDb } = require('jovo-db-filedb'); //<----- FileDB
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

//Current level
var currentLevel = 1;
var fromMenu = true;
var fromReset = false;

//Users first and second box choice
var BoxChoiceToChange = 0;
var firstBoxChoice = 9999;
var secondBoxChoice = 9999;
var hasFirstSelected = false;

//players current ingame score
var playerScore = 0;

//Players bestscore
var bestScore = 0;

//Previous text from winning
var outsideText = "";

//Hax used for debugging - will show the answers in the description of the OptionItem. HAX KEY
var hax = false;

// UI List items -----------------------------------------------------------------------------------

/*
    MENU ITEMS ------------------------------------------------------------------ MENU ITEMS
*/

let haxItem = new OptionItem(); //ENSURE 'hacks' PHRASE IS REMOVED FROM JSON FILE
haxItem.setTitle("hacks");
haxItem.setDescription("Hacks to for debugging, Will start the game");
haxItem.setKey("haxOption");
haxItem.addSynonym("hacks");

let restartItem = new OptionItem();
restartItem.setTitle("Restart");
restartItem.setKey("restartOption");
restartItem.addSynonym("restart");

let menuItem = new OptionItem();
menuItem.setTitle("Menu");
menuItem.setKey("menuOption");
menuItem.addSynonym("menu");

let yesItem = new OptionItem();
yesItem.setTitle("Yes");
yesItem.setKey("YesOption");
yesItem.addSynonym("yes");

let noItem = new OptionItem();
noItem.setTitle("No");
noItem.setKey("NoOption");
noItem.addSynonym("no");

let playItem = new OptionItem();
playItem.setTitle("Play");
playItem.setDescription("Starts the game");
playItem.setKey("MainMenuPlayOption");
playItem.addSynonym("play");

let rankItem = new OptionItem();
rankItem.setTitle("Rank");
rankItem.setDescription("Shows your highest Score and global rank");
rankItem.setKey("MainMenuRankOption");
rankItem.addSynonym("rank");

let helpItem = new OptionItem();
helpItem.setTitle("Help");
helpItem.setDescription("Describes the game and options available");
helpItem.setKey("MainMenuHelpOption");
helpItem.addSynonym("help");

let quitItem = new OptionItem();
quitItem.setTitle("Quit");
quitItem.setDescription("Exits the App completely");
quitItem.setKey("MainMenuQuitOption");
quitItem.addSynonym("quit");
/*
    BOX ITEMS ------------------------------------------------------------------ BOX ITEMS
*/
let Box1Item = new OptionItem();//1
Box1Item.setTitle("1");
Box1Item.setDescription("");
Box1Item.setKey("Box1Item");
Box1Item.addSynonym("1");
Box1Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box1.png',
                    accessibilityText: 'Unopened Box'});

let Box2Item = new OptionItem();//2 
Box2Item.setTitle("2");
Box2Item.setDescription("");
Box2Item.setKey("Box2Item");
Box2Item.addSynonym("2");
Box2Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box2.png',
                    accessibilityText: 'Unopened Box'});

let Box3Item = new OptionItem();//3
Box3Item.setTitle("3");
Box3Item.setDescription("");
Box3Item.setKey("Box3Item");
Box3Item.addSynonym("3");
Box3Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box3.png',
                    accessibilityText: 'Unopened Box'});

let Box4Item = new OptionItem();//4
Box4Item.setTitle("4");
Box4Item.setDescription("");
Box4Item.setKey("Box4Item");
Box4Item.addSynonym("4");
Box4Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box4.png',
                    accessibilityText: 'Unopened Box'});

let Box5Item = new OptionItem();//5
Box5Item.setTitle("5");
Box5Item.setDescription("Find out what is inside!");
Box5Item.setKey("Box5Item");
Box5Item.addSynonym("5");
Box5Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box5.png',
                    accessibilityText: 'Unopened Box'});

let Box6Item = new OptionItem();//6
Box6Item.setTitle("6");
Box6Item.setDescription("Find out what is inside!");
Box6Item.setKey("Box6Item");
Box6Item.addSynonym("6");
Box6Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box6.png',
                    accessibilityText: 'Unopened Box'});

let Box7Item = new OptionItem();//7
Box7Item.setTitle("7");
Box7Item.setDescription("Find out what is inside!");
Box7Item.setKey("Box7Item");
Box7Item.addSynonym("7");
Box7Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box7.png',
                    accessibilityText: 'Unopened Box'});

let Box8Item = new OptionItem();//8
Box8Item.setTitle("8");
Box8Item.setDescription("Find out what is inside!");
Box8Item.setKey("Box8Item");
Box8Item.addSynonym("8");
Box8Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box8.png',
                    accessibilityText: 'Unopened Box'});

let Box9Item = new OptionItem();//9
Box9Item.setTitle("9");
Box9Item.setDescription("Find out what is inside!");
Box9Item.setKey("Box9Item");
Box9Item.addSynonym("9");
Box9Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box9.png',
                    accessibilityText: 'Unopened Box'});

let Box10Item = new OptionItem();//10
Box10Item.setTitle("10");
Box10Item.setDescription("Find out what is inside!");
Box10Item.setKey("Box10Item");
Box10Item.addSynonym("10");
Box10Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box10.png',
                    accessibilityText: 'Unopened Box'});

let Box11Item = new OptionItem();//11
Box11Item.setTitle("11");
Box11Item.setDescription("Find out what is inside!");
Box11Item.setKey("Box11Item");
Box11Item.addSynonym("11");
Box11Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box11.png',
                    accessibilityText: 'Unopened Box'});

let Box12Item = new OptionItem();//12
Box12Item.setTitle("12");
Box12Item.setDescription("Find out what is inside!");
Box12Item.setKey("Box12Item");
Box12Item.addSynonym("12");
Box12Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box12.png',
                    accessibilityText: 'Unopened Box'});

let Box13Item = new OptionItem();//13
Box13Item.setTitle("13");
Box13Item.setDescription("Find out what is inside!");
Box13Item.setKey("Box13Item");
Box13Item.addSynonym("13");
Box13Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box13.png',
                    accessibilityText: 'Unopened Box'});

let Box14Item = new OptionItem();//14
Box14Item.setTitle("14");
Box14Item.setDescription("Find out what is inside!");
Box14Item.setKey("Box14Item");
Box14Item.addSynonym("14");
Box14Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box14.png',
                    accessibilityText: 'Unopened Box'});

let Box15Item = new OptionItem();//15
Box15Item.setTitle("15");
Box15Item.setDescription("Find out what is inside!");
Box15Item.setKey("Box15Item");
Box15Item.addSynonym("15");
Box15Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box15.png',
                    accessibilityText: 'Unopened Box'});

let Box16Item = new OptionItem();//16
Box16Item.setTitle("16");
Box16Item.setDescription("Find out what is inside!");
Box16Item.setKey("Box16Item");
Box16Item.addSynonym("16");
Box16Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box16.png',
                    accessibilityText: 'Unopened Box'});

let Box17Item = new OptionItem();//17
Box17Item.setTitle("17");
Box17Item.setDescription("Find out what is inside!");
Box17Item.setKey("Box17Item");
Box17Item.addSynonym("17");
Box17Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box17.png',
                    accessibilityText: 'Unopened Box'});

let Box18Item = new OptionItem();//18
Box18Item.setTitle("18");
Box18Item.setDescription("Find out what is inside!");
Box18Item.setKey("Box18Item");
Box18Item.addSynonym("18");
Box18Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box18.png',
                    accessibilityText: 'Unopened Box'});

let Box19Item = new OptionItem();//19
Box19Item.setTitle("19");
Box19Item.setDescription("Find out what is inside!");
Box19Item.setKey("Box19Item");
Box19Item.addSynonym("19");
Box19Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box19.png',
                    accessibilityText: 'Unopened Box'});

let Box20Item = new OptionItem();//20
Box20Item.setTitle("20");
Box20Item.setDescription("Find out what is inside!");
Box20Item.setKey("Box20Item");
Box20Item.addSynonym("20");
Box20Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box20.png',
                    accessibilityText: 'Unopened Box'});

let Box21Item = new OptionItem();//21
Box21Item.setTitle("21");
Box21Item.setDescription("Find out what is inside!");
Box21Item.setKey("Box21Item");
Box21Item.addSynonym("21");
Box21Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box21.png',
                    accessibilityText: 'Unopened Box'});

let Box22Item = new OptionItem();//22
Box22Item.setTitle("22");
Box22Item.setDescription("Find out what is inside!");
Box22Item.setKey("Box22Item");
Box22Item.addSynonym("22");
Box22Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box22.png',
                    accessibilityText: 'Unopened Box'});

let Box23Item = new OptionItem();//23
Box23Item.setTitle("23");
Box23Item.setDescription("Find out what is inside!");
Box23Item.setKey("Box23Item");
Box23Item.addSynonym("23");
Box23Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box23.png',
                    accessibilityText: 'Unopened Box'});

let Box24Item = new OptionItem();//24
Box24Item.setTitle("24");
Box24Item.setDescription("Find out what is inside!");
Box24Item.setKey("Box24Item");
Box24Item.addSynonym("24");
Box24Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box24.png',
                    accessibilityText: 'Unopened Box'});

// UI List items End-----------------------------------------------------------------------------------

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
        imgUrl: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/dog.png',
        opened: false
    },{
        name: "cat",
        pluralName: "cats",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/cat.mp3' />",
        imgUrl: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/noImage.png',
        opened: false
    },{
        name: "chicken",
        pluralName: "chickens",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/chicken.mp3' />",
        imgUrl: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/chicken.png',
        opened: false
    },{
        name: "cow",
        pluralName: "cows",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/cow.mp3' />",
        imgUrl: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/cow.png',
        opened: false
    },{
        name: "turkey",
        pluralName: "tukeys",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/turkey.mp3' />",
        imgUrl: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/turkey.png',
        opened: false
    },{
        name: "frog",
        pluralName: "frogs",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/frog.mp3' />",
        imgUrl: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/noImage.png',
        opened: false
    },{
        name: "goat",
        pluralName: "goats",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/goat.mp3' />",
        imgUrl: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/goat.png',
        opened: false
    },{
        name: "goose",
        pluralName: "geese",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/goose.mp3' />",
        imgUrl: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/goose.png',
        opened: false
    },{
        name: "horse",
        pluralName: "horses",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/horse.mp3' />",
        imgUrl: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/horse.png',
        opened: false
    },{
        name: "pig",
        pluralName: "pigs",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/pig.mp3' />",
        imgUrl: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/pig.png',
        opened: false
    },{
        name: "sheep",
        pluralName: "sheeps",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/sheep.mp3' />",
        imgUrl: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/sheep.png',
        opened: false
    },{
        name: "elephant",
        pluralName: "elephants",
        resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/elephant.mp3' />",
        imgUrl: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/noImage.png',
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
            bestScore = 0;
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
        console.log("local bestScore var: " +bestScore);
        console.log("bestScore in DB: " + this.$user.$data.bestScore);              

        if(numberOfTimesLoggedIn > 3){ //Short welcome for repeat users, long intro for new users
            this.$speech.addText(
                '<audio src="https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/bgm.mp3"/>'+
                '<p>Welcome back! Are you ready to play?</p>'
            );
        }else{
            this.$speech.addText(
                '<audio src="https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/bgm.mp3"/>'+
                '<audio src="https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Voices/Memory_Welcome.mp3"/> '+
                // '<p>Hello and welcome. We have recieved a new supply of crates and your goal is to match the '+
                // 'crates up so that the pair of animals gets shipped off together!</p> '+
                '<p> Are you ready to help ship them off?</p>'
            );
        }        
        
        this.$reprompt.addText(Reprompt());
        GenerateDisplayTexts();
        this.showImageCard(title, content, imageUrl);
        this.followUpState('StartState').ask(this.$speech, this.$reprompt);
    },   

    //---Start state: Only yes or no are accepted-------------------------------------------------------------------------------------------------------------------------------
    StartState: {
        //Yes/no answers
        ON_ELEMENT_SELECTED() {
            let selectedElement = this.getSelectedElementId();
            if (selectedElement === 'YesOption')
            {
                this.toIntent('YesIntent');
            }
            else if(selectedElement === 'NoOption') 
            {
                this.toIntent('NoIntent');
            }
        },

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
        let menuList = new List();
        menuList.setTitle('MainMenu');
        menuList.addItem(playItem);
        menuList.addItem(rankItem);
        menuList.addItem(helpItem);
        menuList.addItem(quitItem);
        menuList.addItem(haxItem);
        this.$googleAction.showList(menuList);
        //---------Display Generation-----------------------------

        //set speech and reprompt, as well as reset any temporarily changed variables
        hax = false;
        finishedAllLevels = false;        
        this.$speech.addText(speech);
        this.$reprompt.addText(Reprompt());
        this.followUpState('MenuSelectionState').ask(this.$speech, this.$reprompt);
        
    },
    //---MenuSelectState------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    MenuSelectionState: {

        ON_ELEMENT_SELECTED() {
            let selectedElement = this.getSelectedElementId();
            if (selectedElement === 'MainMenuPlayOption')
            {
                this.toIntent('PlayIntent');
            }
            else if(selectedElement === 'MainMenuQuitOption') 
            {
                this.toIntent('ExitIntent');
            }
            else if(selectedElement === 'MainMenuHelpOption') 
            {
                this.toIntent('HelpIntent');
            }
            else if(selectedElement === 'MainMenuRankOption') 
            {
                this.toIntent('RankIntent');
            }
            else if(selectedElement === 'haxOption') 
            {
                hax = true;
                this.toIntent('PlayIntent');
            }
        },

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
            this.$speech.addText("<p>Please choose to either play, show my rank, or quit the game!</p>");
            this.$reprompt.addText(Reprompt());

            //---------Display Generation-----------------------------
                let menuList = new List();
                menuList.setTitle('MainMenu');
                menuList.addItem(playItem);
                menuList.addItem(rankItem);
                menuList.addItem(quitItem);
                this.$googleAction.showList(menuList);
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
            this.$speech.addText("<p>Please choose to either play, ask for help, or quit the game!</p>");
            this.$reprompt.addText(Reprompt());

            //---------Display Generation-----------------------------
                let menuList = new List();
                menuList.setTitle('MainMenu');
                menuList.addItem(playItem);
                menuList.addItem(helpItem);
                menuList.addItem(quitItem);
                this.$googleAction.showList(menuList);
            //---------Display Generation-----------------------------
        
            this.followUpState('MenuSelectionState').ask(this.$speech, this.$reprompt);
        },
        PlayIntent(){
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
                //---------Display Generation-----------------------------
                let menuList = new List();
                menuList.setTitle('MainMenu');
                menuList.addItem(playItem);
                menuList.addItem(rankItem);
                menuList.addItem(helpItem);
                menuList.addItem(quitItem);
                this.$googleAction.showList(menuList);
                //---------Display Generation-----------------------------
                
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
            if(checkScore() == true)
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
        if(numberOfTimesLoggedIn < 5 && currentLevel < 2){
            if(fromMenu){
                //Welcome from the menu to the game
                speech += "<p>We hope you are ready for our memory game. </p>";
            }
            //Introduction to the game
            speech += "<p>You can say back at anytime during the game to return to the menu! </p>";
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

            speech += "<p>Please choose a box between 1 and " + inGameSounds.length + " to start";
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
        
        //Create a dynamic list of boxItems to select from

        //---------Display Generation-----------------------------
         let aBoxList = new List();
         aBoxList.setTitle('Boxes to Choose from');
         displayCurrentLevelBoxes(aBoxList);
         checkBoxImage(aBoxList);
         if(hax == true)
            {
                haxFunc();
            }
         this.$googleAction.showList(aBoxList);
        //---------Display Generation-----------------------------
        fromReset = false;
        outsideText = "";
        fromMenu = false;
        this.$speech.addText(speech);
        this.$reprompt.addText(Reprompt());
        this.followUpState('InGameState').ask(this.$speech, this.$reprompt);
    },//------------ END OF INITIALIZATION---------------------------------------------------------------------------------------------------------------------------------

    FinishedGame()
    {
        speech += "<p>That's all the shipments sorted! </p>";
            finishedAllLevels = true;
            if(checkScore() == true)
            {
               this.$user.$data.bestScore = bestScore; 
            }
            else
            {
                speech += "<p> Unfortunately no new high score has been set! </P>";
            }
            speech += "<p>We hope you enjoyed your time! would you like to return to the main menu or restart the game? </P>";
            fromMenu = false;
        //---------Display Generation-----------------------------
        let gameFinishedList = new List();
        gameFinishedList.setTitle('Game Finished!');
        gameFinishedList.addItem(menuItem);
        gameFinishedList.addItem(restartItem);
        this.$googleAction.showList(gameFinishedList);
        //---------Display Generation-----------------------------
        this.$speech.addText(speech);
        this.$reprompt.addText(Reprompt());
        this.followUpState('FinishedAllLevelsState').ask(this.$speech, this.$reprompt);
    },
    /*
        FinishedAllLevelsState will let the user decide if they want to restart the game or go back to the main menu
    */
    FinishedAllLevelsState: {
        ON_ELEMENT_SELECTED() 
        {
            let selectedElement = this.getSelectedElementId();
            if (selectedElement === 'menuOption')
            {
                this.toIntent('BackToMenuIntent');
            }
            else if(selectedElement === 'restartOption') 
            {
                this.toIntent('ResetIntent');
            }
        },

        BackToMenuIntent()
        {               
            resetAllLevels();
            return this.toStatelessIntent('GiveMenu');
        },

        ResetIntent()
        {               
            resetAllLevels();
            fromReset = true;
            return this.toStatelessIntent('InitialisationIntent');
        },
    },
    //------ END OF FinishedAllLevelsState------------------------------------------------------------------------------

    //Asks the user if they're sure they want to reset the game or not
    ResetGameState: {
        ON_ELEMENT_SELECTED() {
            let selectedElement = this.getSelectedElementId();
            if (selectedElement === 'YesOption')
            {
                this.toIntent('YesIntent');
            }
            else if(selectedElement === 'NoOption') 
            {
                this.toIntent('NoIntent');
            }
        },

        YesIntent(){            
            fromReset = true;
            return this.toStatelessIntent('InitialisationIntent');
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
            //---------Display Generation-----------------------------
            let aBoxList = new List();
            aBoxList.setTitle('Boxes to Choose from');
            displayCurrentLevelBoxes(aBoxList);
            checkBoxImage(aBoxList);
            if(hax == true)
            {
                haxFunc();
            }
            this.$googleAction.showList(aBoxList);
            //---------Display Generation-----------------------------
            this.$speech.addText(speech);
            this.$reprompt.addText(Reprompt());
            this.followUpState('InGameState').ask(this.$speech, this.$reprompt);
        },
    },
    //Asks the user if theyre sure they want to exit their current game to the main menu
    BackToMenuState:
    {
        ON_ELEMENT_SELECTED() {
            let selectedElement = this.getSelectedElementId();
            if (selectedElement === 'YesOption')
            {
                this.toIntent('YesIntent');
            }
            else if(selectedElement === 'NoOption') 
            {
                this.toIntent('NoIntent');
            }
        },

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

            //---------Display Generation-----------------------------
            let aBoxList = new List();
            aBoxList.setTitle('Boxes to Choose from');
            displayCurrentLevelBoxes(aBoxList);
            checkBoxImage(aBoxList);
            if(hax == true)
            {
                haxFunc();
            }
            this.$googleAction.showList(aBoxList);
            //---------Display Generation-----------------------------

            this.$speech.addText(speech);
            this.$reprompt.addText(Reprompt());
            this.followUpState('InGameState').ask(this.$speech, this.$reprompt);
        },
    },

     //-------------In Game----------------------------------------------------------------------------------------------------------------------------------------------------
    InGameState: {

        ON_ELEMENT_SELECTED() {
            let selectedElement = this.getSelectedElementId();
            if (selectedElement === 'Box1Item')
            {
                BoxChoiceToChange = 0;                
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box2Item')
            {
                BoxChoiceToChange = 1; 
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box3Item')
            {
                BoxChoiceToChange = 2; 
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box4Item')
            {
                BoxChoiceToChange = 3;
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box5Item')
            {
                BoxChoiceToChange = 4; 
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box6Item')
            {
                BoxChoiceToChange = 5; 
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box7Item')
            {
                BoxChoiceToChange = 6; 
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box8Item')
            {
                BoxChoiceToChange = 7; 
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box9Item')
            {
                BoxChoiceToChange = 8; 
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box10Item')
            {
                BoxChoiceToChange = 9; 
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box11Item')
            {
                BoxChoiceToChange = 10; 
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box12Item')
            {
                BoxChoiceToChange = 11; 
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box13Item')
            {
                BoxChoiceToChange = 12; 
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box14Item')
            {
                BoxChoiceToChange = 13; 
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box15Item')
            {
                BoxChoiceToChange = 14; 
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box16Item')
            {
                BoxChoiceToChange = 15; 
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box17Item')
            {
                BoxChoiceToChange = 16; 
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box18Item')
            {
                BoxChoiceToChange = 17; 
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box19Item')
            {
                BoxChoiceToChange = 18; 
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box20Item')
            {
                BoxChoiceToChange = 19; 
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box21Item')
            {
                BoxChoiceToChange = 20; 
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box22Item')
            {
                BoxChoiceToChange = 21; 
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box23Item')
            {
                BoxChoiceToChange = 22; 
                this.toIntent('BoxIntent');
            }
            else if (selectedElement === 'Box24Item')
            {
                BoxChoiceToChange = 23; 
                this.toIntent('BoxIntent');
            }
        },

        BoxIntent(){
            speech = "";           

            if(!hasFirstSelected){ //Check if first box or second box is being chosen
                firstBoxChoice = BoxChoiceToChange;
            }else{
                secondBoxChoice = BoxChoiceToChange;
            }

            //Log
            console.log("Has the first box been selected: " + hasFirstSelected);
            console.log("First box choice: " + (firstBoxChoice+1));
            console.log("Second box choice: " + (secondBoxChoice+1));
            console.log("")
            showAnswers();

            //Check if box exists
            if(!(firstBoxChoice+1 > inGameSounds.length || (!hasFirstSelected ? false : secondBoxChoice+1 > inGameSounds.length))){
                //Open first box
                if(!hasFirstSelected){
                    //Check if FIRST box has been opened or not
                    if(inGameSounds[firstBoxChoice].opened){
                        speech += inGameSounds[firstBoxChoice].resource + "<p> This box has already been opened! </p>";
                    }else{
                        inGameSounds[firstBoxChoice].opened = true;
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
                            inGameSounds[secondBoxChoice].opened = true;
                            speech += "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Boxes/door_open.mp3'/>";
                            speech += inGameSounds[secondBoxChoice].resource;

                            //Move on to checking the two boxes
                            //Check now if they match or not
                            if(inGameSounds[firstBoxChoice].name == inGameSounds[secondBoxChoice].name)
                            {
                                //Tell user they where correct
                                speech += "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/success.mp3'/>";

                                //Tell user
                                speech += getRandomSpeech("winGuess");

                                resetSelection();
                            }else{
                                inGameSounds[firstBoxChoice].opened = false;
                                inGameSounds[secondBoxChoice].opened = false;
                                //Tell user they where incorrect
                                speech += //"<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/fail2.mp3'/>"+
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

            //---------Display Generation-----------------------------
            let BboxList = new List();
            BboxList.setTitle('Boxes to Choose from');
            displayCurrentLevelBoxes(BboxList);
            checkBoxImage(BboxList);
            if(hax == true)
            {
                haxFunc();
            }
            this.$googleAction.showList(BboxList);            
            //---------Display Generation-----------------------------

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
            //---------Display Generation-----------------------------
            let BboxList = new List();
            BboxList.setTitle('Boxes to Choose from');
            displayCurrentLevelBoxes(BboxList);
            checkBoxImage(BboxList);
            if(hax == true)
            {
                haxFunc();
            }
            this.$googleAction.showList(BboxList);          
            //---------Display Generation-----------------------------
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
            //---------Display Generation-----------------------------
            let BboxList = new List();
            BboxList.setTitle('Boxes to Choose from');
            displayCurrentLevelBoxes(BboxList);
            checkBoxImage(BboxList);
            if(hax == true)
            {
                haxFunc();
            }
            this.$googleAction.showList(BboxList);            
            //---------Display Generation-----------------------------
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

            //---------Display Generation-----------------------------
            let startList = new List();
            startList.setTitle('Reset Game?');
            startList.addItem(yesItem);
            startList.addItem(noItem);
            this.$googleAction.showList(startList);
            //---------Display Generation-----------------------------  
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
            //---------Display Generation-----------------------------
            let startList = new List();
            startList.setTitle('Return to menu?');
            startList.addItem(yesItem);
            startList.addItem(noItem);
            this.$googleAction.showList(startList);
            //---------Display Generation-----------------------------        

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
            return this.toStatelessIntent('FinishedGame');
        }

        //Increment the levels
        currentLevel++; //HAVE TO MOVE/CHANGE THIS

        console.log("old DB Bestscore is: "+this.$user.$data.bestScore);
        console.log("old Local BestScore is: " + bestScore);
        console.log("Player is moving from: " + currentLevel-1 +" to "+currentLevel);

        if(checkScore() == true)
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
                    speech = "great, now choose another crate to open! ";
                    break;
                case 1:
                    speech = "Just one more left!";
                    break;
                case 2:
                    speech = "We need to crack one more open! ";
                    break;
                case 3:
                    speech = "Nice guess. Just one left! ";
                    break;
                case 4:
                    speech = "What a beautiful " + inGameSounds[firstBoxChoice].name;
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
                    speech = "Oh wow, nice! ";
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
                    speech = "YeeeeeeHaw";
                    break;
            }
            break;
        case "looseGuess":
            switch(randomSpeech){
                case 0:
                    speech = "Awe, that's a shame. ";
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
            playerScore += Math.floor(1000*(Math.pow(levelsUnlocked[i].minimumTries, 1/(levelsUnlocked[i].tries/levelsUnlocked[i].minimumTries))));
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

//debugging function that displays the name of the animal on the boxItem (hax)
function haxFunc()
{
    switch(currentLevel){
        case(1):
            Box1Item.setDescription(inGameSounds[0].name);
            Box2Item.setDescription(inGameSounds[1].name);
            Box3Item.setDescription(inGameSounds[2].name);
            Box4Item.setDescription(inGameSounds[3].name);
            Box5Item.setDescription(inGameSounds[4].name);
            Box6Item.setDescription(inGameSounds[5].name);
            break;
           
        case(2):
            Box1Item.setDescription(inGameSounds[0].name);
            Box2Item.setDescription(inGameSounds[1].name);
            Box3Item.setDescription(inGameSounds[2].name);
            Box4Item.setDescription(inGameSounds[3].name);
            Box5Item.setDescription(inGameSounds[4].name);
            Box6Item.setDescription(inGameSounds[5].name);
            Box7Item.setDescription(inGameSounds[6].name);
            Box8Item.setDescription(inGameSounds[7].name);
            break;

        case(3):
            Box1Item.setDescription(inGameSounds[0].name);
            Box2Item.setDescription(inGameSounds[1].name);
            Box3Item.setDescription(inGameSounds[2].name);
            Box4Item.setDescription(inGameSounds[3].name);
            Box5Item.setDescription(inGameSounds[4].name);
            Box6Item.setDescription(inGameSounds[5].name);
            Box7Item.setDescription(inGameSounds[6].name);
            Box8Item.setDescription(inGameSounds[7].name);
            Box9Item.setDescription(inGameSounds[8].name);
            Box10Item.setDescription(inGameSounds[9].name);
            Box11Item.setDescription(inGameSounds[10].name);
            Box12Item.setDescription(inGameSounds[11].name);
            break;

        case(4):
            Box1Item.setDescription(inGameSounds[0].name);
            Box2Item.setDescription(inGameSounds[1].name);
            Box3Item.setDescription(inGameSounds[2].name);
            Box4Item.setDescription(inGameSounds[3].name);
            Box5Item.setDescription(inGameSounds[4].name);
            Box6Item.setDescription(inGameSounds[5].name);
            Box7Item.setDescription(inGameSounds[6].name);
            Box8Item.setDescription(inGameSounds[7].name);
            Box9Item.setDescription(inGameSounds[8].name);
            Box10Item.setDescription(inGameSounds[9].name);
            Box11Item.setDescription(inGameSounds[10].name);
            Box12Item.setDescription(inGameSounds[11].name);
            Box13Item.setDescription(inGameSounds[12].name);
            Box14Item.setDescription(inGameSounds[13].name);
            Box15Item.setDescription(inGameSounds[14].name);
            Box16Item.setDescription(inGameSounds[15].name);
            break; 

        case(5):
            Box1Item.setDescription(inGameSounds[0].name);
            Box2Item.setDescription(inGameSounds[1].name);
            Box3Item.setDescription(inGameSounds[2].name);
            Box4Item.setDescription(inGameSounds[3].name);
            Box5Item.setDescription(inGameSounds[4].name);
            Box6Item.setDescription(inGameSounds[5].name);
            Box7Item.setDescription(inGameSounds[6].name);
            Box8Item.setDescription(inGameSounds[7].name);
            Box9Item.setDescription(inGameSounds[8].name);
            Box10Item.setDescription(inGameSounds[9].name);
            Box11Item.setDescription(inGameSounds[10].name);
            Box12Item.setDescription(inGameSounds[11].name);
            Box13Item.setDescription(inGameSounds[12].name);
            Box14Item.setDescription(inGameSounds[13].name);
            Box15Item.setDescription(inGameSounds[14].name);
            Box16Item.setDescription(inGameSounds[15].name);
            Box17Item.setDescription(inGameSounds[16].name);
            Box18Item.setDescription(inGameSounds[17].name);
            Box19Item.setDescription(inGameSounds[18].name);
            Box20Item.setDescription(inGameSounds[19].name);
            break;

        case(6):
            Box1Item.setDescription(inGameSounds[0].name);
            Box2Item.setDescription(inGameSounds[1].name);
            Box3Item.setDescription(inGameSounds[2].name);
            Box4Item.setDescription(inGameSounds[3].name);
            Box5Item.setDescription(inGameSounds[4].name);
            Box6Item.setDescription(inGameSounds[5].name);
            Box7Item.setDescription(inGameSounds[6].name);
            Box8Item.setDescription(inGameSounds[7].name);
            Box9Item.setDescription(inGameSounds[8].name);
            Box10Item.setDescription(inGameSounds[9].name);
            Box11Item.setDescription(inGameSounds[10].name);
            Box12Item.setDescription(inGameSounds[11].name);
            Box13Item.setDescription(inGameSounds[12].name);
            Box14Item.setDescription(inGameSounds[13].name);
            Box15Item.setDescription(inGameSounds[14].name);
            Box16Item.setDescription(inGameSounds[15].name);
            Box17Item.setDescription(inGameSounds[16].name);
            Box18Item.setDescription(inGameSounds[17].name);
            Box19Item.setDescription(inGameSounds[18].name);
            Box20Item.setDescription(inGameSounds[19].name);
            Box21Item.setDescription(inGameSounds[20].name);
            Box22Item.setDescription(inGameSounds[21].name);
            Box23Item.setDescription(inGameSounds[22].name);
            Box24Item.setDescription(inGameSounds[23].name);
            break;        
    }
}

/*
    Adds the appropriate amount of boxes items to the list, according to what level the user is on
*/
function displayCurrentLevelBoxes(passedInList)
{
    switch(currentLevel){
        case(1):
            Box1Item.setDescription(inGameSounds[0].name);
            Box2Item.setDescription(inGameSounds[1].name);
            Box3Item.setDescription(inGameSounds[2].name);
            Box4Item.setDescription(inGameSounds[3].name);
            Box5Item.setDescription(inGameSounds[4].name);
            Box6Item.setDescription(inGameSounds[5].name);

            passedInList.addItem(Box1Item);
            passedInList.addItem(Box2Item);
            passedInList.addItem(Box3Item);
            passedInList.addItem(Box4Item);
            passedInList.addItem(Box5Item);
            passedInList.addItem(Box6Item);
            break;
           
        case(2):
        Box1Item.setDescription(inGameSounds[0].name);
        Box2Item.setDescription(inGameSounds[1].name);
        Box3Item.setDescription(inGameSounds[2].name);
        Box4Item.setDescription(inGameSounds[3].name);
        Box5Item.setDescription(inGameSounds[4].name);
        Box6Item.setDescription(inGameSounds[5].name);
        Box7Item.setDescription(inGameSounds[6].name);
        Box8Item.setDescription(inGameSounds[7].name);

            passedInList.addItem(Box1Item);
            passedInList.addItem(Box2Item);
            passedInList.addItem(Box3Item);
            passedInList.addItem(Box4Item);
            passedInList.addItem(Box5Item);
            passedInList.addItem(Box6Item);
            passedInList.addItem(Box7Item);
            passedInList.addItem(Box8Item);
            break;

        case(3):
        Box1Item.setDescription(inGameSounds[0].name);
        Box2Item.setDescription(inGameSounds[1].name);
        Box3Item.setDescription(inGameSounds[2].name);
        Box4Item.setDescription(inGameSounds[3].name);
        Box5Item.setDescription(inGameSounds[4].name);
        Box6Item.setDescription(inGameSounds[5].name);
        Box7Item.setDescription(inGameSounds[6].name);
        Box8Item.setDescription(inGameSounds[7].name);
        Box9Item.setDescription(inGameSounds[8].name);
        Box10Item.setDescription(inGameSounds[9].name);
        Box11Item.setDescription(inGameSounds[10].name);
        Box12Item.setDescription(inGameSounds[11].name);

            passedInList.addItem(Box1Item);
            passedInList.addItem(Box2Item);
            passedInList.addItem(Box3Item);
            passedInList.addItem(Box4Item);
            passedInList.addItem(Box5Item);
            passedInList.addItem(Box6Item);
            passedInList.addItem(Box7Item);
            passedInList.addItem(Box8Item);
            passedInList.addItem(Box9Item);
            passedInList.addItem(Box10Item);
            passedInList.addItem(Box11Item);
            passedInList.addItem(Box12Item);
            break;

        case(4):
            Box1Item.setDescription(inGameSounds[0].name);
            Box2Item.setDescription(inGameSounds[1].name);
            Box3Item.setDescription(inGameSounds[2].name);
            Box4Item.setDescription(inGameSounds[3].name);
            Box5Item.setDescription(inGameSounds[4].name);
            Box6Item.setDescription(inGameSounds[5].name);
            Box7Item.setDescription(inGameSounds[6].name);
            Box8Item.setDescription(inGameSounds[7].name);
            Box9Item.setDescription(inGameSounds[8].name);
            Box10Item.setDescription(inGameSounds[9].name);
            Box11Item.setDescription(inGameSounds[10].name);
            Box12Item.setDescription(inGameSounds[11].name);

            passedInList.addItem(Box1Item);
            passedInList.addItem(Box2Item);
            passedInList.addItem(Box3Item);
            passedInList.addItem(Box4Item);
            passedInList.addItem(Box5Item);
            passedInList.addItem(Box6Item);
            passedInList.addItem(Box7Item);
            passedInList.addItem(Box8Item);
            passedInList.addItem(Box9Item);
            passedInList.addItem(Box10Item);
            passedInList.addItem(Box11Item);
            passedInList.addItem(Box12Item);
            passedInList.addItem(Box13Item);
            passedInList.addItem(Box14Item);
            passedInList.addItem(Box15Item);
            passedInList.addItem(Box16Item);
            break; 

        case(5):
            passedInList.addItem(Box1Item);
            passedInList.addItem(Box2Item);
            passedInList.addItem(Box3Item);
            passedInList.addItem(Box4Item);
            passedInList.addItem(Box5Item);
            passedInList.addItem(Box6Item);
            passedInList.addItem(Box7Item);
            passedInList.addItem(Box8Item);
            passedInList.addItem(Box9Item);
            passedInList.addItem(Box10Item);
            passedInList.addItem(Box11Item);
            passedInList.addItem(Box12Item);
            passedInList.addItem(Box13Item);
            passedInList.addItem(Box14Item);
            passedInList.addItem(Box15Item);
            passedInList.addItem(Box16Item);
            passedInList.addItem(Box17Item);
            passedInList.addItem(Box18Item);
            passedInList.addItem(Box19Item);
            passedInList.addItem(Box20Item);
            break;

        case(6):
            passedInList.addItem(Box1Item);
            passedInList.addItem(Box2Item);
            passedInList.addItem(Box3Item);
            passedInList.addItem(Box4Item);
            passedInList.addItem(Box5Item);
            passedInList.addItem(Box6Item);
            passedInList.addItem(Box7Item);
            passedInList.addItem(Box8Item);
            passedInList.addItem(Box9Item);
            passedInList.addItem(Box10Item);
            passedInList.addItem(Box11Item);
            passedInList.addItem(Box12Item);
            passedInList.addItem(Box13Item);
            passedInList.addItem(Box14Item);
            passedInList.addItem(Box15Item);
            passedInList.addItem(Box16Item);
            passedInList.addItem(Box17Item);
            passedInList.addItem(Box18Item);
            passedInList.addItem(Box19Item);
            passedInList.addItem(Box20Item);
            passedInList.addItem(Box21Item);
            passedInList.addItem(Box22Item);
            passedInList.addItem(Box23Item);
            passedInList.addItem(Box24Item);
            break;        
    }
}

function checkBoxImage()
{
    for(var i = 0; i < inGameSounds.length ; i++)
    {
        if(inGameSounds[i].opened == true)
        {
            switch(i)
            {
                case(0):                        
                setBoxItemsToOpenImage(1);
                break;

                case(1):
                setBoxItemsToOpenImage(2);
                break;

                case(2):
                setBoxItemsToOpenImage(3);
                break;

                case(3):
                setBoxItemsToOpenImage(4);
                break;

                case(4):
                setBoxItemsToOpenImage(5);
                break;

                case(5):
                setBoxItemsToOpenImage(6);
                break;

                case(6):                        
                setBoxItemsToOpenImage(7);
                break;

                case(7):
                setBoxItemsToOpenImage(8);
                break;

                case(8):
                setBoxItemsToOpenImage(9);
                break;

                case(9):
                setBoxItemsToOpenImage(10);
                break;

                case(10):
                setBoxItemsToOpenImage(11);
                break;

                case(11):
                setBoxItemsToOpenImage(12);
                break;

                case(12):                        
                setBoxItemsToOpenImage(13);
                break;

                case(13):
                setBoxItemsToOpenImage(14);
                break;

                case(14):
                setBoxItemsToOpenImage(15);
                break;

                case(15):
                setBoxItemsToOpenImage(16);
                break;

                case(16):
                setBoxItemsToOpenImage(17);
                break;

                case(17):
                setBoxItemsToOpenImage(18);
                break;

                case(18):                        
                setBoxItemsToOpenImage(19);
                break;

                case(19):
                setBoxItemsToOpenImage(20);
                break;

                case(20):
                setBoxItemsToOpenImage(21);
                break;

                case(21):
                setBoxItemsToOpenImage(22);
                break;

                case(22):
                setBoxItemsToOpenImage(23);
                break;

                case(23):
                setBoxItemsToOpenImage(24);
                break;
            }
        }
        else //set back to default
        {
            switch(i)
            {
                case(0):
                    setBoxItemsToDefault(1);
                break;

                case(1):
                    setBoxItemsToDefault(2);
                break;

                case(2):
                    setBoxItemsToDefault(3);
                break;

                case(3):
                    setBoxItemsToDefault(4);
                break;

                case(4):
                    setBoxItemsToDefault(5);
                break;

                case(5):
                    setBoxItemsToDefault(6);
                break;

                case(6):
                    setBoxItemsToDefault(7);
                break;

                case(7):
                    setBoxItemsToDefault(8);
                break;

                case(8):
                    setBoxItemsToDefault(9);
                break;

                case(9):
                    setBoxItemsToDefault(10);
                break;

                case(10):
                    setBoxItemsToDefault(11);
                break;

                case(11):
                    setBoxItemsToDefault(12);
                break;

                case(12):
                    setBoxItemsToDefault(13);
                break;

                case(13):
                    setBoxItemsToDefault(14);
                break;

                case(14):
                    setBoxItemsToDefault(15);
                break;

                case(15):
                    setBoxItemsToDefault(16);
                break;

                case(16):
                    setBoxItemsToDefault(17);
                break;

                case(17):
                    setBoxItemsToDefault(18);
                break;

                case(18):
                    setBoxItemsToDefault(19);
                break;

                case(19):
                    setBoxItemsToDefault(20);
                break;

                case(20):
                    setBoxItemsToDefault(21);
                break;

                case(21):
                    setBoxItemsToDefault(22);
                break;

                case(22):
                    setBoxItemsToDefault(23);
                break;

                case(23):
                    setBoxItemsToDefault(24);
                break;
            }
        }
    }    
}

function setBoxItemsToDefault(boxNum)
{
    switch(boxNum)
    {
        case(1):
        Box1Item.setDescription("Find out what is inside!");
                        Box1Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box1.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(2):
        Box2Item.setDescription("Find out what is inside!");
                        Box2Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box2.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(3):
        Box3Item.setDescription("Find out what is inside!");
                        Box3Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box3.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(4):
        Box4Item.setDescription("Find out what is inside!");
                        Box4Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box4.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(5):
        Box5Item.setDescription("Find out what is inside!");
                        Box5Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box5.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(6):
        Box6Item.setDescription("Find out what is inside!");
                        Box6Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box6.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(7):
        Box7Item.setDescription("Find out what is inside!");
                        Box7Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box7.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(8):
        Box8Item.setDescription("Find out what is inside!");
                        Box8Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box8.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(9):
        Box9Item.setDescription("Find out what is inside!");
                        Box9Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box9.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(10):
        Box10Item.setDescription("Find out what is inside!");
                        Box10Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box10.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(11):
        Box11Item.setDescription("Find out what is inside!");
                        Box11Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box11.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(12):
        Box12Item.setDescription("Find out what is inside!");
                        Box12Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box12.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(13):
        Box13Item.setDescription("Find out what is inside!");
                        Box13Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box13.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(14):
        Box14Item.setDescription("Find out what is inside!");
                        Box14Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box14.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(15):
        Box15Item.setDescription("Find out what is inside!");
                        Box15Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box15.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(16):
        Box16Item.setDescription("Find out what is inside!");
                        Box16Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box16.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(17):
        Box17Item.setDescription("Find out what is inside!");
                        Box17Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box17.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(18):
        Box18Item.setDescription("Find out what is inside!");
                        Box18Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box18.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(19):
        Box19Item.setDescription("Find out what is inside!");
                        Box19Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box19.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(20):
        Box20Item.setDescription("Find out what is inside!");
                        Box20Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box20.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(21):
        Box21Item.setDescription("Find out what is inside!");
                        Box21Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box21.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(22):
        Box22Item.setDescription("Find out what is inside!");
                        Box22Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box22.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(23):
        Box23Item.setDescription("Find out what is inside!");
                        Box23Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box23.png',
                        accessibilityText: 'Unopened Box'});
        break;

        case(24):
        Box24Item.setDescription("Find out what is inside!");
                        Box24Item.setImage({ url: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box24.png',
                        accessibilityText: 'Unopened Box'});
        break;
    }    
}

function setBoxItemsToOpenImage(boxNum)
{
    var i = (boxNum - 1); //i is used to access 'inGameSounds' index, it is initialized to (boxNum - 1) because the number passed into the function will represent the boxItem number - which starts at 1 for readibility purposes.  

    switch(boxNum)
    {
        case(1):                        
            Box1Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                                accessibilityText: 'Opened Box'});
            Box1Item.setDescription(inGameSounds[i].name);
        break;

        case(2):
            Box2Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                                accessibilityText: 'Opened Box'});
            Box2Item.setDescription(inGameSounds[i].name);
        break;

        case(3):
            Box3Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                                accessibilityText: 'Opened Box'});
            Box3Item.setDescription(inGameSounds[i].name);
        break;

        case(4):
            Box4Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                                accessibilityText: 'Opened Box'});
            Box4Item.setDescription(inGameSounds[i].name);
        break;

        case(5):
            Box5Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                                accessibilityText: 'Opened Box'});
            Box5Item.setDescription(inGameSounds[i].name);
        break;

        case(6):
            Box6Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                                accessibilityText: 'Opened Box'});
            Box6Item.setDescription(inGameSounds[i].name);
        break;

        case(7):
        Box7Item.setDescription(inGameSounds[i].name);
        Box7Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                            accessibilityText: 'Opened Box'});
        break;

        case(8):
        Box8Item.setDescription(inGameSounds[i].name);
        Box8Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                            accessibilityText: 'Opened Box'});
        break;

        case(9):
        Box9Item.setDescription(inGameSounds[i].name);
        Box9Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                            accessibilityText: 'Opened Box'});
        break;

        case(10):
        Box10Item.setDescription(inGameSounds[i].name);
        Box10Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                            accessibilityText: 'Opened Box'});
        break;

        case(11):
        Box11Item.setDescription(inGameSounds[i].name);
        Box11Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                            accessibilityText: 'Opened Box'});
        break;

        case(12):
        Box12Item.setDescription(inGameSounds[i].name);
        Box12Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                            accessibilityText: 'Opened Box'});
        break;

        case(13):
        Box13Item.setDescription(inGameSounds[i].name);
        Box13Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                            accessibilityText: 'Opened Box'});
        break;

        case(14):
        Box14Item.setDescription(inGameSounds[i].name);
        Box14Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                            accessibilityText: 'Opened Box'});
        break;

        case(15):
        Box15Item.setDescription(inGameSounds[i].name);
        Box15Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                            accessibilityText: 'Opened Box'});
        break;

        case(16):
        Box16Item.setDescription(inGameSounds[i].name);
        Box16Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                            accessibilityText: 'Opened Box'});
        break;

        case(17):
        Box17Item.setDescription(inGameSounds[i].name);
        Box17Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                            accessibilityText: 'Opened Box'});
        break;

        case(18):
        Box18Item.setDescription(inGameSounds[i].name);
        Box18Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                            accessibilityText: 'Opened Box'});
        break;

        case(19):
        Box19Item.setDescription(inGameSounds[i].name);
        Box19Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                            accessibilityText: 'Opened Box'});
        break;

        case(20):
        Box20Item.setDescription(inGameSounds[i].name);
        Box20Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                            accessibilityText: 'Opened Box'});
        break;

        case(21):
        Box21Item.setDescription(inGameSounds[i].name);
        Box21Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                            accessibilityText: 'Opened Box'});
        break;

        case(22):
        Box22Item.setDescription(inGameSounds[i].name);
        Box22Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                            accessibilityText: 'Opened Box'});
        break;

        case(23):
        Box23Item.setDescription(inGameSounds[i].name);
        Box23Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                            accessibilityText: 'Opened Box'});
        break;

        case(24):
        Box24Item.setDescription(inGameSounds[i].name);
        Box24Item.setImage({ url: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/" + inGameSounds[i].name +".png",
                            accessibilityText: 'Opened Box'});
        break;
    }    
}
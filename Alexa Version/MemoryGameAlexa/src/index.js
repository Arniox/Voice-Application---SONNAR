
/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const AWS = require('aws-sdk');
AWS.config.apiVersions = {
  dynamodb: '2012-08-10',
  // other service API versions
};
const ddbTableName = 'Memory-Game';
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');
//Execute query to get rank
const RankQuery = function(userId,highScore){
  return new Promise(function (resolve, reject) {
    var dynamodb = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName:ddbTableName,
        ProjectionExpression: "#att.#hS",
        FilterExpression: "#att.#hS > :hS",
        ExpressionAttributeNames: {
          "#att": "attributes",
          "#hS": "highScore"
        },
        ExpressionAttributeValues: {
            ":hS": highScore
        }
    };
    dynamodb.scan(params,function(err, data) {
      if(err){
        console.log(err,err.stack);
        return reject(JSON.stringify(err,null,2)); // an error occurred
      }else{
        console.log(data);
         data.Items.forEach(function(attributes) {
           console.log(attributes);
        });
        resolve(data.Count+1);
      }
    });
  });
};

const GetRank = function(userId,attributes){
  return RankQuery(userId, attributes.highScore).then((rank) => {
        attributes.rank = rank;
  });
};

var errorCount = 0;


//states into String
const stateStr = {
  launch: "launch",
  menu: "menu",
  inGame: "inGame",
  win: "win",
  reset: "reset",
  naming: "naming",
  levelSelect: "levelSelect"
};

//Box turn into String
const boxTurnStr = {
  first: "first",
  second: "second"
};

//String value : undefined
const undefinedStr = 'undefined';

//Alexa presentation APL String value
const alexaPresentationAPL = {
  renderDocument: "Alexa.Presentation.APL.RenderDocument",
  userEvent: "Alexa.Presentation.APL.UserEvent"
};

//animal array
const animals = [
  {
    name: "dog",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/dog.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/dog.png",
    opened: false
  },{
    name: "cat",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/cat.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/noImage.png",
    opened: false
  },{
    name: "chicken",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/chicken.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/chicken.png",
    opened: false
  },{
    name: "cow",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/cow.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/cow.png",
    opened: false
  },{
    name: "turkey",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/turkey.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/turkey.png",
    opened: false
  },{
    name: "frog",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/frog.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/noImage.png",
    opened: false
  },{
    name: "goat",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/goat.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/goat.png",
    opened: false
  },{
    name: "goose",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/goose.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/goose.png",
    opened: false
  },{
    name: "horse",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/horse.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/horse.png",
    opened: false
  },{
    name: "pig",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/pig.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/pig.png",
    opened: false
  },{
    name: "sheep",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/sheep.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/sheep.png",
    opened: false
  },{
    name: "elephant",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/elephant.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/noImage.png",
    opened: false
  }
];

const boxImage = [
  {
    name: "box1",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box1.png",
    current: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box1.png'
  },{
    name: "box2",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box2.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box2.png"
  },{
    name: "box3",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box3.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box3.png"
  },{
    name: "box4",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box4.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box4.png"
  },{
    name: "box5",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box5.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box5.png"
  },{
    name: "box6",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box6.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box6.png"
  },{
    name: "box7",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box7.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box7.png"
  },{
    name: "box8",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box8.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box8.png"
  },{
    name: "box9",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box9.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box9.png"
  },{
    name: "box10",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box10.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box10.png"
  },{
    name: "box11",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box11.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box11.png"
  },{
    name: "box12",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box12.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box12.png"
  },{
    name: "box13",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box13.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box13.png"
  },{
    name: "box14",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box14.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box14.png"
  },{
    name: "box15",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box15.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box15.png"
  },{
    name: "box16",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box16.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box16.png"
  },{
    name: "box17",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box17.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box17.png"
  },{
    name: "box18",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box18.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box18.png"
  },{
    name: "box19",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box19.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box19.png"
  },{
    name: "box20",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box20.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box20.png"
  },{
    name: "box21",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box21.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box21.png"
  },{
    name: "box22",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box22.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box22.png"
  },{
    name: "box23",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box23.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box23.png"
  },{
    name: "box24",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box24.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box24.png"
  }
];

const levelsUnlocked = [
    {
        id: 1,
        resource: "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Voices/Memory_Box_Ammount_6.mp3'/>",
        name: "level 1",
        unlocked: false,
        numberOfSounds: 3,
        pageName: "./aplDocuments/threeSoundsPage.json",
        bestTry: 3
    },{
        id: 2,
        resource: "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Voices/Memory_Box_Ammount_8.mp3'/>",
        name: "level 2",
        unlocked: false,
        numberOfSounds: 4,
        pageName: "./aplDocuments/fourSoundsPage.json",
        bestTry: 4
    },{
        id: 3,
        resource: "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Voices/Memory_Box_Ammount_12.mp3'/>",
        name: "level 3",
        unlocked: false,
        numberOfSounds: 6,
        pageName: "./aplDocuments/sixSoundsPage.json",
        bestTry: 6
    },{
        id: 4,
        resource: "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Voices/Memory_Box_Ammount_16.mp3'/>",
        name: "level 4",
        unlocked: false,
        numberOfSounds: 8,
        pageName: "./aplDocuments/eightSoundsPage.json",
        bestTry: 8
    },{
        id: 5,
        resource: "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Voices/Memory_Box_Ammount_20.mp3'/>",
        name: "level 5",
        unlocked: false,
        numberOfSounds: 10,
        pageName: "./aplDocuments/tenSoundsPage.json",
        bestTry: 10
    },{
        id: 6,
        resource: "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Voices/Memory_Box_Ammount_24.mp3'/>",
        name: "level 6",
        unlocked: false,
        numberOfSounds: 12,
        pageName: "./aplDocuments/twelveSoundsPage.json",
        bestTry: 12
    }
];

/*
Text/speeches used for game.
Array type of values(variables) are for speeches, used with attributes.
The last element of a array shows how elements and attributes should be used together.
However, if any speeches are not followed by any attributes, then it is not an array
*/
const speech = {
  repromptLaunch: "Are you ready to play?",
  repromptMenu: "Please select a option from: Start, show my rank, ask for help or exit the game!",
  repromptinGame: ["Please, choose the "," box!","Please choose the + attributes.boxTurn+ box!"],
  repromptWin: "Say good bye, to exit game or say menu, to go back to the main menu.",
  
  welcomeNewUser: "Hello and welcome. We have recieved a new supply of crates. And your goal is to match the  crates up. So that, the pair of animals gets shipped off together! Are you ready to help ship them off?",
  welcomeBack: "Welcome back! Are you ready to play?",
  
  startNotFromMenu: "You can only start the game from the menu. ",

  inGamePleaseChooseBox: ["Please, choose the first box to start off between 1 and ", "Please choose the first box to start off between 1 and +attributes.boxes.length"],
  inGameBoxInRange: ["Choose from 1 to ", "Choose from 1 to + attributes.boxes.length"],
  inGameBackToMenu: "if you go back to menu, you will lose your current level progress. do you really wanna go back to menu? if yes, please say menu again. if not, ",
  inGameBoxChosen: "The box is already choosen for your first box! Choose another box. ",
  inGameBoxOpened: "The chosen box is already opened! Choose another box. ",
  inGameBoxMatches: " Good work! ",
  inGameGoNextLevel: "Let's move on next level. ",
  
  levelWin: ["Congradulations on winning ", "audios.levelWin+Congradulations on winning + attributes.currentLevel.name"],
  gameWin: ["You bit the last level! ", "You bit the last level! + speech.score"],
  
  errorGameNotStarted: "You didn't start the game yet!",
  errorNoBoxOpened: "There is no box opened. ",
  error1: "Sorry, I don't understand." ,
  error3: "Thank you for playing! See you next time!",
  
  menuNewUser: "From the main menu, you can either choose to: start the game! show my rank! ask for help! or, quit the game. Which option would you like to select?",
  menu: "Please choose either to: start! show my rank! help! or, quit the game. ",
  score: ["Your score is ", "Your score is +attributes.totalScore"], 
  
  yes: "Yes, yes, yes, ",
  no: "No, no, no, ",
  
  gameContinue: "Okay, the game continues! ",
  help: "To help our farm ship off animals, you will be given a set amount of crates to open. Each crate contains a sound, that you have to match up with one other crate. Once all crates are opened, and shipped off, the next level will begin, with even more crates to help with. If you decide to go back to main menu, or quit, your score will be tallied up, and saved at that point. ",
  helpInMenu: "Are you ready to play the game? ",
  helpInGame: "Are you ready to continue the game? "
};

//Extra sound effects' sources
const audios = {
  launchBGM: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/bgm.mp3'/>",
  memoryWelcome: "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Voices/Memory_Welcome.mp3'/> ",
  
  openingBox: "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Boxes/door_open.mp3' />",
  closingBox: "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Boxes/door_slam.mp3' />",
  success: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/success.mp3' />",
  fail: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/fail2.mp3' />",
  
  levelWin: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/win2.mp3' />",

};

const InitiateGame = function(attributes){
  //Set boxes for the level
  attributes.boxes = shuffleSounds(attributes.currentLevel.numberOfSounds);
  //Selected box index
  attributes.firstBox = undefinedStr;
  attributes.secondBox = undefinedStr;
  //Score for checking the level finished
  attributes.score = 0;
  attributes.win = false;
  //Which box have to be choosen
  attributes.boxTurn = boxTurnStr.first;
  //Number of tries in this level
  attributes.numOfTry = 0;
  attributes.uipage = "./aplDocuments/threeSoundsPage.json";
};

const shuffleSounds = function(numOfanimals){
  var boxes = animals.sort((a,b) => 0.5 - Math.random());
  boxes = boxes.slice(0,numOfanimals);
  boxes = boxes.concat(boxes);
  boxes = boxes.sort((a,b) => 0.5 - Math.random());
  return boxes;
};

const RepromptText = function(attributes){
  var text = "";
  if(attributes.state === stateStr.launch){
    text = speech.repromptLaunch;
  }else if(attributes.state === stateStr.menu){
    text = speech.repromptMenu;
  }else if(attributes.state === stateStr.inGame){
    text = speech.repromptinGame[0]+attributes.boxTurn+speech.repromptinGame[1];
  }else if(attributes.win){
    text = speech.repromptWin;
  }
  return text;
};

const RecordScore = function(attributes){
  if(attributes.totalScore > attributes.highScore){
    attributes.highScore = attributes.totalScore;
  } 
};

const SupportsAPL = function(handlerInput) {
  const supportedInterfaces = 
  handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
  const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
  return aplInterface != null && aplInterface !== undefined;
};

const resetBoxImage = function(){
  for(var i = 0; i < 24; i++){
    boxImage[i].current = boxImage[i].resource;
  }
}

const frozenUI = function(milliseconds) {
  setTimeout(function(){ 
  }, 5000);
}

const LaunchHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    var speechOutput = "";
    var repromptText = "";
    speechOutput=audios.launchBGM;  
    //Reset Session attributes
    const p_attributes = await handlerInput.attributesManager.getPersistentAttributes() || {};

    //Get persistent attributes
    if(Object.keys(p_attributes).length === 0){
      p_attributes.logInTimes = 1;
      p_attributes.highScore = 0;
    }else{
      p_attributes.logInTimes ++;
    }
    handlerInput.attributesManager.setSessionAttributes(p_attributes);
    const attributes = handlerInput.attributesManager.getSessionAttributes();
  
    if(attributes.logInTimes<3){
      attributes.state = stateStr.launch;
      speechOutput += speech.welcomeNewUser;
    }else{
      attributes.state = stateStr.launch;
      speechOutput += speech.welcomeBack;
    }
    repromptText = RepromptText(attributes);
    
    //UI
    if (SupportsAPL(handlerInput)) {
      handlerInput.responseBuilder.addDirective({
        type: alexaPresentationAPL.renderDocument,
        document: require('./aplDocuments/launch.json'),
        datasources: {
          'launchData': {
            "text": "Are you ready to Play?"
          }
        },
      });
    }
    
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const StartHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest' && request.intent.name === 'StartIntent')
    || (request.type === alexaPresentationAPL.userEvent && request.arguments[0] === 'StartIntent');
  },
  handle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput="";
    var repromptText="";
    // Reset Error Count
    errorCount = 0;

    if(attributes.state === stateStr.menu){
      resetBoxImage();
      attributes.state = stateStr.inGame;
      attributes.totalScore = 0;
      speechOutput += audios.memoryWelcome;
      attributes.currentLevel = levelsUnlocked[0];
      InitiateGame(attributes);
      speechOutput += attributes.currentLevel.resource;
      speechOutput += speech.inGamePleaseChooseBox[0] + attributes.boxes.length;
      if (SupportsAPL(handlerInput)) {
        handlerInput.responseBuilder.addDirective({
          type: alexaPresentationAPL.renderDocument,
          document: require('./aplDocuments/threeSoundsPage.json'),
          datasources: {
            'pageData': {
                "score" : "Score: " + attributes.totalScore,
                "currentLevel" : "Level " + attributes.currentLevel.id,
                "Box1": boxImage[0].current,
                "Box2": boxImage[1].current,
                "Box3": boxImage[2].current,
                "Box4": boxImage[3].current,
                "Box5": boxImage[4].current,
                "Box6": boxImage[5].current
            }
          },
        });
      }
    }else{
      //point!!
      speechOutput = speech.startNotFromMenu + RepromptText(attributes);
    }
    repromptText = RepromptText(attributes);
    
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const MenuHandler = {
  canHandle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest' && request.intent.name === 'MenuIntent')
    || (request.type === alexaPresentationAPL.userEvent && request.arguments[0] === 'MenuIntent');
  },
  handle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput="";
    var repromptText="";
    resetBoxImage();
    // Reset Error Count
    errorCount = 0;
    if(attributes.state === stateStr.inGame){
      if(typeof attributes.backToMenu === undefinedStr){
        speechOutput += speech.innGameBackToMenu + RepromptText(attributes);
        attributes.backToMenu = true;
      }else{
        attributes.state = stateStr.menu;
        attributes.backToMenu = undefined;
        speechOutput += RepromptText(attributes);
        
        if (SupportsAPL(handlerInput)) {
          handlerInput.responseBuilder.addDirective({
            type: alexaPresentationAPL.renderDocument,
            document: require('./aplDocuments/menu.json'),
            datasources: {
              'menuData': {
              }
            },
          });
        }
      }
    }else{
        attributes.state = stateStr.menu;
        attributes.backToMenu = undefined;
        speechOutput += RepromptText(attributes);
        
      if (SupportsAPL(handlerInput)) {
        handlerInput.responseBuilder.addDirective({
          type: alexaPresentationAPL.renderDocument,
          document: require('./aplDocuments/menu.json'),
          datasources: {
            'menuData': {
            }
          },
        });
      }
    }
    
    repromptText = RepromptText(attributes);
    
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};


const BoxHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return (request.type === 'IntentRequest' && request.intent.name === 'BoxIntent')
    || (request.type === alexaPresentationAPL.userEvent && request.arguments[0] === 'Box');
  },
  async handle(handlerInput) {
    //Get Session attributes
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput="";
    var repromptText="";

    // Reset Error Count
    errorCount = 0;

    //distinguish UI input or Voice Input
    if(request.type === 'IntentRequest')
      var userInput = request.intent.slots.boxNumber.value;
    else
      var userInput = request.arguments[1];

    var choosedIndex = userInput-1;
    if(attributes.state === stateStr.inGame){
      //if the game is not over, keep going
      if(!attributes.win){
        if(userInput>=1&&userInput<=attributes.boxes.length){
          //if the choosed box is already selected
          if(attributes.boxTurn===boxTurnStr.second && (attributes.firstBox === choosedIndex)){
            speechOutput = attributes.boxes[choosedIndex].resource+speech.inGameBoxChosen;
          }
          
          //if the choosed box is already opened
          else if(attributes.boxes[choosedIndex].opened){
            speechOutput = attributes.boxes[choosedIndex].resource+speech.inGameBoxOpened;
          }else{
            //Check the box turn
            if(attributes.boxTurn === boxTurnStr.first){
              attributes.firstBox = choosedIndex;
              //speechOutput = "Box Number "+userInput + " is " + attributes.boxes[choosedIndex].resource;
              speechOutput = audios.openingBox+attributes.boxes[choosedIndex].resource;
              boxImage[choosedIndex].current = attributes.boxes[choosedIndex].image;
              //it is about to second turn to choose a box
              attributes.boxTurn = boxTurnStr.second;
            }else{
              attributes.numOfTry++;
              attributes.secondBox = choosedIndex;
              // speechOutput = "Box Number "+userInput + " is " + attributes.boxes[choosedIndex].resource;
              speechOutput = audios.openingBox+attributes.boxes[choosedIndex].resource;
              boxImage[choosedIndex].current = attributes.boxes[choosedIndex].image;
              //Check selected boxes are the same ==> get score and keep the turn
              if(attributes.boxes[attributes.firstBox].name === attributes.boxes[attributes.secondBox].name){
                speechOutput += audios.success+speech.inGameBoxMatches;
                //open the same boxes
                attributes.boxes[attributes.firstBox].opened = true;
                attributes.boxes[attributes.secondBox].opened = true;
                //Give one score
                attributes.score++;
                //Check the player finished the current level
                attributes.win = (attributes.score === attributes.currentLevel.numberOfSounds);
               
                if(attributes.win){
                  speechOutput +=  audios.levelWin
                  +speech.levelWin[0]+attributes.currentLevel.name
                  +". ";
                  attributes.totalScore += Math.round((attributes.currentLevel.bestTry*1.0 / attributes.numOfTry)*attributes.currentLevel.id*100);
                  attributes.scoreText = "Score: " + attributes.totalScore;
                  RecordScore(attributes);
                  if(attributes.currentLevel.id === 6){
                    attributes.state = stateStr.win;
                    speechOutput += speech.gameWin[0]+ speech.score[0] + attributes.totalScore+". ";
                    handlerInput.attributesManager.setPersistentAttributes(attributes);
                    await handlerInput.attributesManager.savePersistentAttributes();
                  }else{
                    levelsUnlocked[attributes.currentLevel.id-1].unlocked = true;
                    speechOutput += speech.inGameGoNextLevel;
                    attributes.currentLevel = levelsUnlocked[attributes.currentLevel.id];
                    InitiateGame(attributes);
                    attributes.uipage = levelsUnlocked[attributes.currentLevel.id-1].pageName;
                    resetBoxImage();
                    //attributes.uipage = levelsUnlocked[0].pageName;
                    speechOutput += attributes.currentLevel.resource;
                    speechOutput += speech.inGamePleaseChooseBox[0]+attributes.boxes.length+". ";
                  }//Check is level 6 End
                }//Check win End
              }else{
                speechOutput += audios.fail
                +audios.closingBox
                +audios.closingBox;
                boxImage[attributes.firstBox].current = boxImage[attributes.firstBox].resource;
                boxImage[attributes.secondBox].current = boxImage[attributes.secondBox].resource;
              }//Check selected boxes are the same End 
              //Change the box turn
              attributes.firstBox = undefinedStr;
              attributes.secondBox = undefinedStr;
              attributes.boxTurn =boxTurnStr.first;
            }//Check the box turn End
          }//Check box opened End
        }else{//Check user input
          speechOutput = speech.inGameBoxInRange[0] + attributes.boxes.length + ". ";
        }//Check user input valid End
      }//Check the game over End
    }
    speechOutput += RepromptText(attributes);
    repromptText = RepromptText(attributes);
    
    if (SupportsAPL(handlerInput)) {
      handlerInput.responseBuilder.addDirective({
        type: alexaPresentationAPL.renderDocument,
        document: require(attributes.uipage),
        datasources: {
          'pageData': {
              "score" : "Score: " + attributes.totalScore,
              "currentLevel" : "Level " + attributes.currentLevel.id,
              "Box1": boxImage[0].current,
              "Box2": boxImage[1].current,
              "Box3": boxImage[2].current,
              "Box4": boxImage[3].current,
              "Box5": boxImage[4].current,
              "Box6": boxImage[5].current,
              "Box7": boxImage[6].current,
              "Box8": boxImage[7].current,
              "Box9": boxImage[8].current,
              "Box10": boxImage[9].current,
              "Box11": boxImage[10].current,
              "Box12": boxImage[11].current,
              "Box13": boxImage[12].current,
              "Box14": boxImage[13].current,
              "Box15": boxImage[14].current,
              "Box16": boxImage[15].current,
              "Box17": boxImage[16].current,
              "Box18": boxImage[17].current,
              "Box19": boxImage[18].current,
              "Box20": boxImage[19].current,
              "Box21": boxImage[20].current,
              "Box22": boxImage[21].current,
              "Box23": boxImage[22].current,
              "Box24": boxImage[23].current
          }
        },
      });
    }    
      
    //Save Session attributes
    handlerInput.attributesManager.setSessionAttributes(attributes);
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const ScoreHandler = {
  canHandle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' 
    && request.intent.name === 'ScoreIntent';
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "";
    var repromptText = "";
    // Reset Error Count
    errorCount = 0;
    if(attributes.state === stateStr.inGame){
      speechOutput = speech.score[0] +attributes.totalScore+". ";
    }else{
      speechOutput = speech.errorGameNotStarted;
    }
    speechOutput += RepromptText(attributes);
    repromptText = RepromptText(attributes); 
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const OpenedHandler = {
  canHandle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' 
    && request.intent.name === 'OpenedIntent';
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "";
    // Reset Error Count
    errorCount = 0;

    //Refactoring needed
    if(attributes.state === stateStr.inGame){
      var opened = [];
      for (var i = 0; i < attributes.boxes.length; i++)
      {
        if(attributes.boxes[i].opened)
          opened.push(i+1);
      }
      if(opened.length > 0){
        speechOutput = "Opened boxes are. ";
        opened.forEach(function(item){speechOutput+= item + ". ";});
      }else{
        speechOutput = "there is no box opened. ";
      }
    }else{
      speechOutput = "You didn't start the game yet! ";
    }

    speechOutput += RepromptText(attributes);
    var repromptText = RepromptText(attributes);
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};



const YesHandler = {
  canHandle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    
    return (request.type === 'IntentRequest' && request.intent.name === 'AMAZON.YesIntent')
    || (request.type === alexaPresentationAPL.userEvent && request.arguments[0] === 'YesIntent');
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    
    var speechOutput = "";
    
    // Reset Error Count
    errorCount = 0;
    if(attributes.state ===stateStr.launch){
      attributes.state = stateStr.menu;
      if(attributes.logInTimes < 3){
        speechOutput = "From the main menu you can either choose to: "
        +"Start the game! "
        +"Show my rank! "
        +"Ask for help! "
        +"Or quit the game. "
        +"Which option would you like to select? ";
      }else{
        speechOutput = "Please choose either to start, "
        +"Show my rank! "
        +"Ask for help! "
        +"Or quit the game. ";
      }
    }else{
      speechOutput = 'Yes yes yes, ';
      speechOutput += RepromptText(attributes);
    }
    
    var repromptText = RepromptText(attributes);
    
    if (SupportsAPL(handlerInput)) {
      handlerInput.responseBuilder.addDirective({
        type: alexaPresentationAPL.renderDocument,
        document: require('./aplDocuments/menu.json'),
        datasources: {
          'menuData': {
          }
        },
      });
    }
    
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const NoHandler = {
  canHandle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return (request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NoIntent' && attributes.state !== "launch");
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "";
    var repromptText = "";
    
    // Reset Error Count
    errorCount = 0;
    
    if(attributes.state === stateStr.reset){
      attributes.state = stateStr.inGame;
      speechOutput = "Okay, the game continues! "+RepromptText(attributes);
    }else{
      speechOutput = 'No no no, '+RepromptText(attributes);
      repromptText = RepromptText(attributes);
    }
    
    handlerInput.attributesManager.setSessionAttributes(attributes);
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const RankHandler = {
  canHandle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    //Get Session attributes
    return (request.type === 'IntentRequest' && request.intent.name === 'RankIntent')
    || (request.type === alexaPresentationAPL.userEvent && request.arguments[0] === 'RankIntent');
  },
  async handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "";
    var repromptText = RepromptText(attributes);
    // Reset Error Count
    errorCount = 0;
    const userId = handlerInput.requestEnvelope.context.System.user.userId;
    await GetRank(userId,attributes);
    speechOutput += "Your best score is " + attributes.highScore + ", You are number ";
    speechOutput +=  attributes.rank + " in the world.";
    
    if (SupportsAPL(handlerInput)) {
      handlerInput.responseBuilder.addDirective({
        type: alexaPresentationAPL.renderDocument,
        document: require('./aplDocuments/rank.json'),
        datasources: {
          'rankData': {
            "text" : speechOutput
          }
        },
      });
    }

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent')
    || (request.type === alexaPresentationAPL.userEvent && request.arguments[0] === 'HelpIntent');
  },
  handle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = ""; 
    var repromptText = "";
    
    // Reset Error Count
    errorCount = 0;

    switch(attributes.state){
      case stateStr.menu:
        speechOutput = "You will be asked to choose the level of the game. The level will be unlocked as you clear the previous level. During the game, you will be asked for two boxes to match up together. If you choose two boxes with same animal's sound, the box will stay opened. The game will be finished when all the boxes are opened. ";
        speechOutput += "are you ready to play the game? "+RepromptText(attributes);      
        break;
      case stateStr.inGame:
        speechOutput = "There are " + attributes.boxes.length + " boxes with animal hidden inside. You need to match two boxes with identical animals. When you found the same two animals, those boxes will stay open. As soon as all the boxes are matched and opened, the game will be finished. To check score, say, Score. To check opened boxes, say, opened. ";
        speechOutput += "are you ready to continue the game? " +RepromptText(attributes);
        break;
      default:
        speechOutput += RepromptText(attributes);
    }
    repromptText = RepromptText(attributes);
    var intent = attributes.state === stateStr.inGame ? "Box" : "MenuIntent";
    
    if (SupportsAPL(handlerInput)) {
      handlerInput.responseBuilder.addDirective({
        type: alexaPresentationAPL.renderDocument,
        document: require('./aplDocuments/helpUI.json'),
        datasources: {
          'helpData': {
            "text" : speechOutput,
            "state" : intent
          }
        },
      });
    }
    
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return (request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent' 
        || (request.intent.name === 'AMAZON.NoIntent' && (attributes.win|| attributes.state === stateStr.launch))))
        || (request.type === alexaPresentationAPL.userEvent && request.arguments[0] === 'ExitIntent');
  },
  async handle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    
    if(attributes.state === stateStr.inGame){
      RecordScore(attributes);
    }
    const userId = handlerInput.requestEnvelope.context.System.user.userId;
    handlerInput.attributesManager.setPersistentAttributes(attributes);
    await handlerInput.attributesManager.savePersistentAttributes();
    
    var speechOutput = "Thank you for playing. ";
    if(attributes.highScore > 0){
      if(attributes.state === stateStr.inGame || attributes.state === stateStr.win){
        await GetRank(userId, attributes);
        speechOutput +="Your best score is "+attributes.highScore
        +". Your rank is number "+ attributes.rank 
        +". See you next time!";
      }
    }
    
    
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};


const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    
  
    return handlerInput.responseBuilder
      .speak()
      .withShouldEndSession(true)
      .getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "";
    var repromptText = RepromptText(attributes);
    errorCount ++;
    // error count 1 => tell user that we don't understand what they said
    if(errorCount === 1){
      speechOutput = "Sorry, I don't understand. ";
    // error count 2 => give user what is valid input
    }else if(errorCount === 2){
      if(attributes.state === stateStr.naming){
        speechOutput += "";
      }else if(attributes.state === stateStr.levelSelect){
        speechOutput += "Please choose a level between 1 and 6. ";
      }else if(attributes.state === stateStr.inGame){
        speechOutput += "Choose a box number from 1 to "+attributes.boxes.length+". ";
      }
      speechOutput += RepromptText(attributes);
    // error count 3 => kick user out from the skill.
    }else if(errorCount === 3){
      speechOutput = "Thank you for playing! See you next time!";
      return handlerInput.responseBuilder
      .speak(speechOutput)
      .withShouldEndSession(true)
      .getResponse();
    }
    
    
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();    

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchHandler,
    YesHandler,
    NoHandler,
    OpenedHandler,
    ScoreHandler,
    BoxHandler,
    RankHandler,
    HelpHandler,
    StartHandler,
    MenuHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .withPersistenceAdapter(new DynamoDbPersistenceAdapter({
    tableName: ddbTableName,
    createTable: true
  }))
  .addErrorHandlers(ErrorHandler)
  .lambda();
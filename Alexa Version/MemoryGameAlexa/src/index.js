
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
}

var errorCount = 0;
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

const InitiateGame = function(attributes){
  attributes.boxes = shuffleSounds(attributes.currentLevel.numberOfSounds);
  attributes.firstBox = 'undefined';
  attributes.secondBox = 'undefined';
  attributes.score = 0;
  attributes.win = false;
  //boxChoose tells it is about to choose first box or second box.
  attributes.boxTurn = "first";
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
  if(attributes.state === "launch"){
    text = "Are you ready to play?";
  }else if(attributes.state === "menu"){
    text = "Please select a option from: Start, show my rank, ask for help or exit the game! ";
  }else if(attributes.state === "levelSelect"){
    text = "you have, so far, unlocked: level one ";
    if(attributes.maxLevel> 1){
      text += "to "+attributes.maxLevel+". ";
    }
    text += "Please choose a level to play. ";
  }else if(attributes.state === "inGame"){
    text = "please choose the "+attributes.boxTurn+" box!";
  }else if(attributes.win){
    text = "Say good bye to exit game or say menu to go back to the main menu. ";
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
    speechOutput="<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/bgm.mp3'/>";  
    //Reset Session attributes
    const p_attributes = await handlerInput.attributesManager.getPersistentAttributes() || {};
    if(Object.keys(p_attributes).length === 0){
      p_attributes.logInTimes = 1;
      p_attributes.highScore = 0;
    }else{
      p_attributes.logInTimes ++;
    }
    handlerInput.attributesManager.setSessionAttributes(p_attributes);
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    
  
    if(attributes.logInTimes<3){
      attributes.state = "launch";
      speechOutput += "Hello and welcome. We have recieved a new supply of crates and your goal is to match the "+
                "crates up so that the pair of animals gets shipped off together! Are you ready to help ship them off?";
    }else{
      attributes.state = "launch";
      speechOutput += "Welcome back! Are you ready to play?";
    }
    repromptText = RepromptText(attributes);
    
    if (SupportsAPL(handlerInput)) {
      handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
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
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest' && request.intent.name === 'StartIntent'&& attributes.state === "menu")
    || (request.type === 'Alexa.Presentation.APL.UserEvent' && request.arguments[0] === 'StartIntent');
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
    attributes.state = "inGame";
    attributes.totalScore = 0;
    speechOutput += "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Voices/Memory_Welcome.mp3'/> ";
    attributes.currentLevel = levelsUnlocked[0];
    InitiateGame(attributes);
    speechOutput += attributes.currentLevel.resource;
    speechOutput += "please choose the first box to start off between 1 and "+attributes.boxes.length;
   
    repromptText = RepromptText(attributes);
    
    if (SupportsAPL(handlerInput)) {
      handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
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
    || (request.type === 'Alexa.Presentation.APL.UserEvent' && request.arguments[0] === 'MenuIntent');
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
    if(attributes.state === "inGame"){
      if(typeof attributes.backToMenu === 'undefined'){
        speechOutput += "if you go back to menu, you will lose your current level progress. do you really wanna go back to menu? if yes, please say menu again. if not, " + RepromptText(attributes);
        attributes.backToMenu = true;
      }else{
        attributes.state = "menu";
        attributes.backToMenu = undefined;
        speechOutput += RepromptText(attributes);
        
        if (SupportsAPL(handlerInput)) {
          handlerInput.responseBuilder.addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: require('./aplDocuments/menu.json'),
            datasources: {
              'menuData': {
              }
            },
          });
        }
      }
    }else{
        attributes.state = "menu";
        attributes.backToMenu = undefined;
        speechOutput += RepromptText(attributes);
        
      if (SupportsAPL(handlerInput)) {
        handlerInput.responseBuilder.addDirective({
          type: 'Alexa.Presentation.APL.RenderDocument',
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
    || (request.type === 'Alexa.Presentation.APL.UserEvent' && request.arguments[0] === 'Box');
  },
  async handle(handlerInput) {
    //Get Session attributes
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput="";
    var repromptText="";
    // Reset Error Count
    errorCount = 0;
    if(request.type === 'IntentRequest')
      var userInput = request.intent.slots.boxNumber.value;
    else
      var userInput = request.arguments[1];
    var choosedIndex = userInput-1;
    if(attributes.state === "inGame"){
      //if the game is not over, keep going
      if(!attributes.win){
        if(userInput>=1&&userInput<=attributes.boxes.length){
          //if the choosed box is already selected
          if(attributes.boxTurn==="second" && (attributes.firstBox === choosedIndex)){
            speechOutput = attributes.boxes[choosedIndex].resource+"The box is already choosen for your first box! Choose another box. ";
          }
          //if the choosed box is already opened
          else if(attributes.boxes[choosedIndex].opened){
            speechOutput = attributes.boxes[choosedIndex].resource+"the chosen box is already opened! Choose another box. ";
          }else{
            //Check the box turn
            if(attributes.boxTurn === "first"){
              attributes.firstBox = choosedIndex;
              //speechOutput = "Box Number "+userInput + " is " + attributes.boxes[choosedIndex].resource;
              speechOutput = "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Boxes/door_open.mp3' />"+attributes.boxes[choosedIndex].resource;
              boxImage[choosedIndex].current = attributes.boxes[choosedIndex].image;
              //it is about to second turn to choose a box
              attributes.boxTurn = "second";
            }else{
              attributes.numOfTry++;
              attributes.secondBox = choosedIndex;
              // speechOutput = "Box Number "+userInput + " is " + attributes.boxes[choosedIndex].resource;
              speechOutput = "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Boxes/door_open.mp3' />"+attributes.boxes[choosedIndex].resource;
              boxImage[choosedIndex].current = attributes.boxes[choosedIndex].image;
              //Check selected boxes are the same ==> get score and keep the turn
              if(attributes.boxes[attributes.firstBox].name === attributes.boxes[attributes.secondBox].name){
                speechOutput += "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/success.mp3' />Good work!";
                //open the same boxes
                attributes.boxes[attributes.firstBox].opened = true;
                attributes.boxes[attributes.secondBox].opened = true;
                //Give one score
                attributes.score++;
                //Check the player finished the current level
                attributes.win = (attributes.score === attributes.currentLevel.numberOfSounds);
               
                if(attributes.win){
                  speechOutput +=  "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/win2.mp3' />"
                  +"Congradulations on winning "+attributes.currentLevel.name
                  +". ";
                  attributes.totalScore += Math.round((attributes.currentLevel.bestTry*1.0 / attributes.numOfTry)*attributes.currentLevel.id*100);
                  attributes.scoreText = "Score: " + attributes.totalScore;
                  RecordScore(attributes);
                  if(attributes.currentLevel.id === 6){
                    attributes.state = "win";
                    speechOutput += "You bit the last level! your score is"+attributes.totalScore+". ";
                    handlerInput.attributesManager.setPersistentAttributes(attributes);
                    await handlerInput.attributesManager.savePersistentAttributes();
                  }else{
                    levelsUnlocked[attributes.currentLevel.id-1].unlocked = true;
                    speechOutput += "Let's move on next level. ";
                    attributes.currentLevel = levelsUnlocked[attributes.currentLevel.id];
                    InitiateGame(attributes);
                    attributes.uipage = levelsUnlocked[attributes.currentLevel.id-1].pageName;
                    resetBoxImage();
                    //attributes.uipage = levelsUnlocked[0].pageName;
                    speechOutput += attributes.currentLevel.resource;
                    speechOutput += "please choose the first box to start off between 1 and "+attributes.boxes.length+". ";
                  }//Check is level 6 End
                }//Check win End
              }else{
                speechOutput += "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/fail2.mp3' />"
                +"<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Boxes/door_slam.mp3' />"
                +"<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Boxes/door_slam.mp3' />";
                boxImage[attributes.firstBox].current = boxImage[attributes.firstBox].resource;
                boxImage[attributes.secondBox].current = boxImage[attributes.secondBox].resource;
              }//Check selected boxes are the same End 
              //Change the box turn
              attributes.firstBox = 'undefined';
              attributes.secondBox = 'undefined';
              attributes.boxTurn ="first";
            }//Check the box turn End
          }//Check box opened End
        }else{//Check user input
          speechOutput = "Choose from 1 to "+ attributes.boxes.length +". ";
        }//Check user input valid End
      }//Check the game over End
    }
    speechOutput += RepromptText(attributes);
    repromptText = RepromptText(attributes);
    // var source = "";
    // attributes.boxes[0].opened? source ="https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box2.png":source ="https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box1.png"
    
    if (SupportsAPL(handlerInput)) {
      handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
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
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
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
    if(attributes.state === "inGame"){
      speechOutput = "Your score is "+attributes.totalScore+".";
    }else{
      speechOutput = "You didn't start the game yet! ";
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
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return request.type === 'IntentRequest' 
    && request.intent.name === 'OpenedIntent';
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "";
    // Reset Error Count
    errorCount = 0;
    if(attributes.state === "inGame"){
      var opened = [];
      for (var i = 0; i < attributes.boxes.length; i++)
      {
        speechOutput += attributes.boxes[i].opened?opened.push(i+1):"";
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
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return (request.type === 'IntentRequest' && request.intent.name === 'AMAZON.YesIntent')
    || (request.type === 'Alexa.Presentation.APL.UserEvent' && request.arguments[0] === 'YesIntent');
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    
    var speechOutput = "";
    
    // Reset Error Count
    errorCount = 0;
    if(attributes.state ==='launch'){
      attributes.state = "menu";
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
        type: 'Alexa.Presentation.APL.RenderDocument',
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
    
    if(attributes.state === "reset"){
      attributes.state = "inGame";
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
    || (request.type === 'Alexa.Presentation.APL.UserEvent' && request.arguments[0] === 'RankIntent');
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
        type: 'Alexa.Presentation.APL.RenderDocument',
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
    || (request.type === 'Alexa.Presentation.APL.UserEvent' && request.arguments[0] === 'HelpIntent');
  },
  handle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = ""; 
    var repromptText = "";
    
    // Reset Error Count
    errorCount = 0;

    switch(attributes.state){
      case "menu":
        speechOutput = "You will be asked to choose the level of the game. The level will be unlocked as you clear the previous level. During the game, you will be asked for two boxes to match up together. If you choose two boxes with same animal's sound, the box will stay opened. The game will be finished when all the boxes are opened. ";
        speechOutput += "are you ready to play the game? "+RepromptText(attributes);      
        break;
      case "inGame":
        speechOutput = "There are " + attributes.boxes.length + " boxes with animal hidden inside. You need to match two boxes with identical animals. When you found the same two animals, those boxes will stay open. As soon as all the boxes are matched and opened, the game will be finished. To check score, say, Score. To check opened boxes, say, opened. ";
        speechOutput += "are you ready to continue the game? " +RepromptText(attributes);
        break;
      default:
        speechOutput += RepromptText(attributes);
    }
    repromptText = RepromptText(attributes);
    var intent = attributes.state === 'inGame'? "Box" : "MenuIntent";
    
    if (SupportsAPL(handlerInput)) {
      handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
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
        || (request.intent.name === 'AMAZON.NoIntent' && (attributes.win|| attributes.state === "launch"))))
        || (request.type === 'Alexa.Presentation.APL.UserEvent' && request.arguments[0] === 'ExitIntent');
  },
  async handle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    
    if(attributes.state === "in game"){
      RecordScore(attributes);
    }
    const userId = handlerInput.requestEnvelope.context.System.user.userId;
    handlerInput.attributesManager.setPersistentAttributes(attributes);
    await handlerInput.attributesManager.savePersistentAttributes();
    
    var speechOutput = "Thank you for playing. ";
    if(attributes.highScore > 0){
      if(attributes.state === "inGame" || attributes.state === "win"){
        await GetRank(userId, attributes.highScore);
        speechOutput +="Your best score is "+attributes.highScore
        +". Your rank is number "+ user_rank 
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
    
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "Thank you for playing,";
    if(attributes.state === "inGame" || attributes.state === "win"){ 
      speechOutput +="Your score is "+attributes.totalScore
      +". Your rank is number 1. "
      +"See you next time!";
    }
  
    return handlerInput.responseBuilder
      .speak(speechOutput)
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
      if(attributes.state === "naming"){
        speechOutput += "";
      }else if(attributes.state === "levelSelect"){
        speechOutput += "Please choose a level between 1 and 6. ";
      }else if(attributes.state === "inGame"){
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
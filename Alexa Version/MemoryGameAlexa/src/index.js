/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const ddbTableName = 'Memory-Game';
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');

var errorCount = 0;
//animal array
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

const levelsUnlocked = [
    {
        id: 1,
        resource: "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Voices/Memory_Box_Ammount_6.mp3'/>",
        name: "level 1",
        unlocked: false,
        numberOfSounds: 3,
        bestTry: 3
    },{
        id: 2,
        resource: "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Voices/Memory_Box_Ammount_8.mp3'/>",
        name: "level 2",
        unlocked: false,
        numberOfSounds: 4,
        bestTry: 4
    },{
        id: 3,
        resource: "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Voices/Memory_Box_Ammount_12.mp3'/>",
        name: "level 3",
        unlocked: false,
        numberOfSounds: 6,
        bestTry: 6
    },{
        id: 4,
        resource: "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Voices/Memory_Box_Ammount_16.mp3'/>",
        name: "level 4",
        unlocked: false,
        numberOfSounds: 8,
        bestTry: 8
    },{
        id: 5,
        resource: "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Voices/Memory_Box_Ammount_20.mp3'/>",
        name: "level 5",
        unlocked: false,
        numberOfSounds: 10,
        bestTry: 10
    },{
        id: 6,
        resource: "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Voices/Memory_Box_Ammount_24.mp3'/>",
        name: "level 6",
        unlocked: false,
        numberOfSounds: 12,
        bestTry: 12
    }
];


const InitiateGame = function(attributes){
  attributes.boxes = shuffleSounds(attributes.currentLevel.numberOfSounds);
  attributes.firstBox = 0;
  attributes.secondBox = 0;
  attributes.score = 0;
  attributes.win = false;
  //boxChoose tells it is about to choose first box or second box.
  attributes.boxTurn = "first";
  attributes.numOfTry = 0;
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
  attributes.scores.push({
    name: attributes.player,
    score: attributes.totalScore
  });
  attributes.scores.sort(function(a, b){return a.score-b.score});
  if(attributes.scores.length > 5){
    attributes.scores.pop();
  }
};



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
      p_attributes.bestScore = 0;
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

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const NameHandler = {
  canHandle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
        && request.intent.name === 'NameIntent';
  },
  async handle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput="";
    var repromptText="";
    // Reset Error Count
    errorCount = 0;
    if(attributes.state === "launch"){
      attributes.state = "menu";
      attributes.player = request.intent.slots.name.value;
      speechOutput = "Nice to meet you, "+attributes.player
      +"! When playing the memory game, from the main menu you can select to either "
      +"Start the game! "
      +"Show my rank! "
      +"Ask for help! "
      +"Or exit the game. "
      +"Which option would you like to select? ";
    }else{
      speechOutput = RepromptText(attributes);
    }
    repromptText = RepromptText(attributes);
    //Save Session attributes
    handlerInput.attributesManager.setSessionAttributes(attributes);


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
    return request.type === 'IntentRequest'
        && request.intent.name === 'StartIntent'&& attributes.state === "menu";
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
    if(typeof attributes.player !== 'undefined'){
      attributes.state = "inGame";
      attributes.totalScore = 0;
      speechOutput += "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Voices/Memory_Welcome.mp3'/> ";
      attributes.currentLevel = levelsUnlocked[0];
      InitiateGame(attributes);
      speechOutput += attributes.currentLevel.resource;
      speechOutput += "please choose the first box to start off between 1 and "+attributes.boxes.length;

    }else{
      attributes.state = "naming";
      speechOutput = "before we start the game, can you please tell me what to call you by? ";
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
    return request.type === 'IntentRequest'
        && request.intent.name === 'MenuIntent';
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
    if(typeof attributes.player ==='undefined'){
      attributes.state = "naming";
    }
    if(attributes.state === "inGame"){
      if(typeof attributes.backToMenu === 'undefined'){
        speechOutput += "if you go back to menu, you will lose your current level progress. do you really wanna go back to menu? if yes, please say menu again. if not, " + RepromptText(attributes);
        attributes.backToMenu = true;
      }else{
        attributes.state = "menu";
        attributes.backToMenu = undefined;
        speechOutput += RepromptText(attributes);
      }
    }else if(attributes.state !== "naming"){
      attributes.state = "menu";
      speechOutput += RepromptText(attributes);
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
    return request.type === 'IntentRequest'
        && request.intent.name === 'BoxIntent';
  },
  async handle(handlerInput) {
    //Get Session attributes
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput="";
    var repromptText="";
    // Reset Error Count
    errorCount = 0;
    var userInput = request.intent.slots.boxNumber.value;
    var choosedIndex = userInput-1;
    if(typeof attributes.player ==='undefined'){
      attributes.state = "naming";
    }
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
              //it is about to second turn to choose a box
              attributes.boxTurn = "second";
            }else{
              attributes.numOfTry++;
              attributes.secondBox = choosedIndex;
              // speechOutput = "Box Number "+userInput + " is " + attributes.boxes[choosedIndex].resource;
              speechOutput = "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Boxes/door_open.mp3' />"+attributes.boxes[choosedIndex].resource;
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
                    speechOutput += attributes.currentLevel.resource;
                    speechOutput += "please choose the first box to start off between 1 and "+attributes.boxes.length+". ";
                  }//Check is level 6 End
                }//Check win End
              }else{
                speechOutput += "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/fail2.mp3' />"
                +"<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Boxes/door_slam.mp3' />"
                +"<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Boxes/door_slam.mp3' />";
              }//Check selected boxes are the same End
              //Change the box turn
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
      speechOutput = "You have tried "+attributes.numOfTry+" times so far. and you revealed "+attributes.score+" animals in total.";
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
const SkipHandler = {
  canHandle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
    && request.intent.name === 'SkipIntent';
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "";
    var repromptText = "";
    // Reset Error Count
    errorCount = 0;
    speechOutput += RepromptText(attributes);
    repromptText += RepromptText(attributes);
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
    return request.type === 'IntentRequest'
    && request.intent.name === 'AMAZON.YesIntent';
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    var speechOutput = "";

    // Reset Error Count
    errorCount = 0;
    if(attributes.state === 'reset'){
      attributes.state = "inGame";
      InitiateGame(attributes);
      speechOutput = "The game is reset with new animal sounds!";
    }else if(attributes.state ==='launch'){
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
    return request.type === 'IntentRequest'
    && request.intent.name === 'AMAZON.NoIntent' && attributes.state !== "launch";
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

const HelpHandler = {
  canHandle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.HelpIntent' || (request.intent.name === "AMAZON.YesIntent" && attributes.state === "tutorial"));
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
      case "levelSelect":
        speechOutput = "You need to select the level to start a game. The level will be unlocked when you clear the previous level. ";
        speechOutput += RepromptText(attributes);
        break;
      case "rank":
        speechOutput = "rank system is not supported yet. ";
        speechOutput += RepromptText(attributes);
        break;
      default:
        speechOutput += RepromptText(attributes);
    }
    repromptText = RepromptText(attributes);
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
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent'
        || (request.intent.name === 'AMAZON.NoIntent' && (attributes.win|| attributes.state === "launch")));
  },
  async handle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    if(attributes.state === "in game"){
      RecordScore(attributes);
    }

    handlerInput.attributesManager.setPersistentAttributes(attributes);
    await handlerInput.attributesManager.savePersistentAttributes();

    var speechOutput = "Thank you for playing";
    if(attributes.totalScore > 0){
      if(attributes.state === "inGame" || attributes.state === "win"){
        speechOutput +="Your score is "+attributes.totalScore
        +". Your rank is number 1. "
        +"See you next time!";
      }
    }


    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const ResetHandler = {
  canHandle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return request.type === 'IntentRequest'
    && request.intent.name === 'ResetIntent';
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "";
    var repromptText = "";

    // Reset Error Count
    errorCount = 0;

    if(attributes.state ==="inGame"){
      speechOutput = "Do you really want to reset the game?";
      repromptText = "really? reset?";
      attributes.state="reset";
    }else{
      speechOutput = RepromptText(attributes);
      repromptText = RepromptText(attributes);
    }
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
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
    if(typeof attributes.player !== 'undefined'){
      speechOutput += attributes.player+"! "
      if(attributes.state === "inGame" || attributes.state === "win"){
        speechOutput +="Your score is "+attributes.totalScore
        +". Your rank is number 1. "
        +"See you next time!";
      }
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
    NameHandler,
    YesHandler,
    NoHandler,
    SkipHandler,
    OpenedHandler,
    ScoreHandler,
    ResetHandler,
    BoxHandler,
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

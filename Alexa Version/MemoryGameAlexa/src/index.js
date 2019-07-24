/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');

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
        name: "level 1",
        unlocked: true,
        numberOfSounds: 3,
        bestTry: 0
    },{
        id: 2,
        name: "level 2",
        unlocked: false,
        numberOfSounds: 4,
        bestTry: 0
    },{
        id: 3,
        name: "level 3",
        unlocked: false,
        numberOfSounds: 6,
        bestTry: 0
    },{
        id: 4,
        name: "level 4",
        unlocked: false,
        numberOfSounds: 8,
        bestTry: 0
    },{
        id: 5,
        name: "level 5",
        unlocked: false,
        numberOfSounds: 10,
        bestTry: 0
    },{
        id: 6,
        name: "level 6",
        unlocked: false,
        numberOfSounds: 12,
        bestTry: 0
    }
];


const LaunchHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    var speechOutput = "";
    var repromptText = "";
    speechOutput="<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/bgm.mp3'/>Welcome to the Memory Game! ";  
    //Reset Session attributes
    handlerInput.attributesManager.setSessionAttributes({});
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    if(typeof attributes.player === 'undefined'){
      attributes.state = "naming";
      speechOutput += "I hope you're excited, but before we can start, can you please tell me what to call you by?";
    }else{
      attributes.state = "menu";
      speechOutput += "Welcome back, "+ attributes.player +"!" +"Please select either Start! Show my rank! Ask for help! or exit the game. ";
    }
    handlerInput.attributesManager.setSessionAttributes(attributes);
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
  handle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput="";
    var repromptText="";
    if(attributes.state === "naming"){
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
}

const RepromptText = function(attributes){
  var text = "";
  if(attributes.state === "tutorial"){
    text = "Do you need tutorial?";
  }else if(attributes.state === "naming"){
    text = "Please give me a name to call you by! ";
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
    text = "Select level to play another game or say menu to go back to the main menu. ";
  }
  return text;
};



const StartHandler = {
  canHandle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
        && request.intent.name === 'StartIntent';
  },
  handle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput="";
    var repromptText="";
    if(typeof attributes.player !== 'undefined'){
      attributes.state = "levelSelect";
      speechOutput += "We hope you are ready for our memory game. ";
      speechOutput += "You have, so far, unlocked: ";
      attributes.maxLevel = 0;
      for(var i=0;i<levelsUnlocked.length;i++){
        if(levelsUnlocked[i].unlocked){
          attributes.maxLevel = levelsUnlocked[i].id;
        }
      }
      if(attributes.maxLevel > 1){
        speechOutput += "level one to "+attributes.maxLevel+". ";
      }else{
        speechOutput += "level one. ";
      }
      speechOutput += "Which level would you like to play?";
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
    if(typeof attributes.player ==='undefined'){
      attributes.state = "naming";
    }
    if(attributes.state === "inGame"){
      if(typeof attributes.backToMenu === 'undefined'){
        speechOutput += "if you go back to menu, you will lose your current game progress. do you really wanna go back to menu? if yes, please say menu again. if not, " + RepromptText(attributes);
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

const LevelHandler = {
  canHandle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
        && request.intent.name === 'LevelIntent';
  },
  handle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput="";
    var repromptText="";
    var userInput = request.intent.slots.level.value;
    if(typeof attributes.player ==='undefined'){
      attributes.state = "naming";
    }
    if(attributes.state === "win"){
      attributes.state = "levelSelect";
    }
    if(attributes.state === "levelSelect"){
       if(userInput<1 || userInput>6){
        speechOutput += "please select a level. ";
        speechOutput += RepromptText(attributes);
      }else if(!levelsUnlocked[userInput-1].unlocked){
        speechOutput += "Sorry this level needs to be unlocked by playing the prior levels in order. ";
      }else{
        attributes.state = "inGame";
        attributes.currentLevel = levelsUnlocked[userInput-1];
        InitiateGame(attributes);
        speechOutput += levelsUnlocked[userInput-1].name + " has " 
        + (levelsUnlocked[userInput-1].numberOfSounds*2) 
        + " sounds to discover. Meaning a total of " 
        + levelsUnlocked[userInput-1].numberOfSounds + " pairs to match up! ";
        speechOutput += "Ok, please choose the first box to start off between 1 and "+attributes.boxes.length;
      }
    }else{
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
  handle(handlerInput) {
    //Get Session attributes
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput="";
    var repromptText="";
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
            speechOutput = "The box is already opened for your first box! Choose another box. ";
          }
          //if the choosed box is already opened
          else if(attributes.boxes[choosedIndex].opened){
            speechOutput = "the chosen box is already opened! Choose another box. ";
          }else{
            //Check the box turn
            if(attributes.boxTurn === "first"){
              attributes.firstBox = choosedIndex;
              speechOutput = "Box Number "+userInput + " is " + attributes.boxes[choosedIndex].resource;
              //it is about to second turn to choose a box
              attributes.boxTurn = "second";
            }else{
              attributes.numOfTry++;
              attributes.secondBox = choosedIndex;
              speechOutput = "Box Number "+userInput + " is " + attributes.boxes[choosedIndex].resource;
              //Check selected boxes are the same ==> get score and keep the turn
              if(attributes.boxes[attributes.firstBox].name === attributes.boxes[attributes.secondBox].name){
                speechOutput += "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/success.mp3' />Good work!";
                //open the same boxes
                attributes.boxes[attributes.firstBox].opened = true;
                attributes.boxes[attributes.secondBox].opened = true;
                //Give one score
                attributes.score++;
                //Check turn player win the game
                attributes.win = (attributes.score === attributes.currentLevel.numberOfSounds);
               
                 //quit the skill if game is over
                if(attributes.win){
                  attributes.state = "win";
                  speechOutput +=  "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/win2.mp3' />"
                  +"Congradulations on winning "+attributes.currentLevel.name
                  +". ";
                  if(attributes.currentLevel.id === 6){
                    speechOutput += "You have reached the max level for the animal sound pack.";
                  }else{
                    if(attributes.currentLevel.bestTry === 0){
                      levelsUnlocked[attributes.currentLevel.id-1].bestTry = attributes.numOfTry;
                      levelsUnlocked[attributes.currentLevel.id].unlocked = true;
                      attributes.maxLevel++;
                      speechOutput += "You've now unlocked "+levelsUnlocked[attributes.currentLevel.id].name+". ";
                    }else{
                      if(attributes.numOfTry < attributes.currentLevel.bestTry){
                        levelsUnlocked[attributes.currentLevel.id-1].bestTry = attributes.numOfTry;
                        speechOutput += "You've achieved a new best try of "+attributes.numOfTry+". Congratulations!!!!!!!!";
                      }else{
                        speechOutput += "You tried "+attributes.numOfTry
                        +" times. your best try is "+attributes.currentLevel.bestTry
                        +". Please try hard to get the best try! ";
                      }//Check best try End
                    }//Check the first clear End
                  }//Check is level 6 End
                }//Check win End
              }else{
                speechOutput += "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/fail2.mp3' /> animals from two boxes were not same. ";
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
    && request.intent.name === 'AMAZON.YesIntent'
    && attributes.state !== "tutorial"
    && ((attributes.win && attributes.state === "inGame")
    || attributes.state === 'reset');
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "";
    if(attributes.state === 'reset'){
      attributes.state = "inGame";
      InitiateGame(attributes);
      speechOutput = "The game is reset with new animal sounds!";
    }else{
      speechOutput = 'Yes yes yes, ';
    }
    speechOutput += RepromptText(attributes);
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
    && request.intent.name === 'AMAZON.NoIntent' && (typeof attributes.win === 'undefined' || !attributes.win);
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "";
    var repromptText = "";
    
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
        || (request.intent.name === 'AMAZON.NoIntent' && attributes.win));
  },
  handle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "See you next time";
    if(typeof attributes.player !== 'undefined'){
      speechOutput += ", "+attributes.player+". ";
    }else{
      speechOutput += ". ";
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
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
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
    attributes.errorCount ++;
    if(attributes.errorCount === 5){
      speechOutput += "Aw, stop it. ";
      attributes.errorCount = 0;
    }
    //speechOutput = "Oh, right, so you are not gonna follow my instruction..well..you know what? in the avengers end game, the iron man will... do you feel like to follow my instructions now?";
    if(attributes.state === "naming"){
      speechOutput += "";
    }else if(attributes.state === "levelSelect"){
      speechOutput += "Please choose a level between 1 and 6. ";
    }else if(attributes.state === "inGame"){
      speechOutput += "Choose a box number from 1 to "+attributes.boxes.length+". ";
    }
    
    
    speechOutput += RepromptText(attributes);
    
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};



const skillBuilder = Alexa.SkillBuilders.standard();

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
    LevelHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
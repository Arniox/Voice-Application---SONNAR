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
  attributes.boxes = shuffleSounds(attributes.numOfanimals);
  attributes.firstBox = 0;
  attributes.secondBox = 0;
  attributes.score = 0;
  attributes.win = false;
  //boxChoose tells it is about to choose first box or second box.
  attributes.boxTurn = "first";
};

const ResetGame = function(attributes){
  attributes.boxes= shuffleSounds(attributes.numOfanimals);
  attributes.score = 0;
  attributes.win = false;
  attributes.boxTurn = "first";
}

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
    text = attributes.player+", please choose the "+attributes.boxTurn+" box!";
  }else if(attributes.gameover){
    text = GameOverPrompt(attributes);
  }
  return text;
};

const GameOverPrompt = function(attributes){
  return "Game is over. The winner is " + attributes.turn +". Do you want to play again? Please say yes or no.";
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
      attributes.maxLevel = 1;
      for(var i=0;i<levelsUnlocked.length;i++){
        if(!levelsUnlocked[i].unlocked){
          attributes.maxLevel = i;
          break;
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
    if(userInput<1 || userInput>attributes.maxLevel){
      speechOutput += "please select a valid level. ";
      speechOutput += RepromptText(attributes);
    }else{
      attributes.state = "inGame";
      attributes.numOfanimals = levelsUnlocked[userInput-1].numberOfSounds;
      InitiateGame(attributes);  
      speechOutput += levelsUnlocked[userInput-1].name + " has " 
      + (levelsUnlocked[userInput-1].numberOfSounds*2) 
      + " sounds to discover. Meaning a total of " 
      + levelsUnlocked[userInput-1].numberOfSounds + " pairs to match up!";
      speechOutput += "Ok please choose the first box to start off between 1 and "+attributes.boxes.length;
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
    
    if(attributes.state === "inGame"){
      //if the game is not over, keep going
      if(!attributes.gameover){
        if(userInput>=1&&userInput<=attributes.numOfanimals*2){
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
              attributes.secondBox = choosedIndex;
              speechOutput = "Box Number "+userInput + " is " + attributes.boxes[choosedIndex].resource;
              //Check selected boxes are the same ==> get score and keep the turn
              if(attributes.boxes[attributes.firstBox].name === attributes.boxes[attributes.secondBox].name){
                speechOutput += "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/success.mp3' />Good work! you found a pair of same animal!";
                //open the same boxes
                attributes.boxes[attributes.firstBox].opened = true;
                attributes.boxes[attributes.secondBox].opened = true;
                //Give one score
                attributes.turn === attributes.playerOne?attributes.scoreOne++:attributes.scoreTwo++;
                //Tell score if not game over
                speechOutput += attributes.gameover?"":" now the score is, "+attributes.scoreOne+" to "+attributes.scoreTwo+"! ";
                //Check turn player win the game
                attributes.gameover = (attributes.scoreOne>=attributes.winScore||attributes.scoreTwo>=attributes.winScore)? true : false;
                //quit the skill if game is over
                speechOutput += attributes.gameover? "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/win2.mp3' />Congratulations, " + attributes.turn
                +"! You are the winner!! Do you want to play again? Please say yes or no. ":"";
                //Game over if one player won the game
                speechOutput += attributes.gameover?"": attributes.turn+"'s turn is keep going!";
              }else{
                speechOutput += "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/fail2.mp3' /> animals from two boxes were not same. ";
                //Change the player turn
                attributes.turn = attributes.turn===attributes.playerOne?attributes.playerTwo:attributes.playerOne;
                speechOutput += "now, it's "+attributes.turn+"'s turn! ";
              }//Check selected boxes are the same End 
              //Change the box turn
              attributes.boxTurn ="first";
            }//Check the box turn End
          }//Check box opened End
        }else{//Check user input
          speechOutput = "Choose from 1 to "+ attributes.numOfanimals*2 +". ";
        } 
        speechOutput += attributes.gameover? "" : RepromptText(attributes);
        repromptText = attributes.gameover? "" : RepromptText(attributes);
      }else{// Check Game over End
        speechOutput = GameOverPrompt(attributes);
      }
    // if the state is not "inGame" or 'levelSelect'
    }else{
      speechOutput = RepromptText(attributes);
      repromptText = RepromptText(attributes);
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
    if(attributes.state === "inGame"){
      speechOutput = "the score for "+attributes.playerOne+" is, "+attributes.scoreOne+". and the score for "+attributes.playerTwo+" is, "+attributes.scoreTwo+". To win the game, you need to get "+attributes.winScore+" first. Okay, then, good luck! ";
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
    && ((attributes.gameover && attributes.state === "inGame")
    || attributes.state === 'reset');
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "";
    if(attributes.state === 'reset'){
      attributes.state = "inGame";
      ResetGame(attributes);
      speechOutput = "The game is reset. you know what? <amazon:effect name=\"whispered\"> boxes are still in the same order. </amazon:effect> ";
    }else if(attributes.gameover&&attributes.state==="inGame"){
      attributes.state = "levelSelect";
      speechOutput = "Let's play the game!! ";
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
    && request.intent.name === 'AMAZON.NoIntent' && (attributes.gameover === 'undefined' || !attributes.gameover);
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "";
    var repromptText = "";
    
    if(attributes.state === "tutorial"){
      attributes.state = "naming";
      speechOutput = RepromptText(attributes);
      repromptText = RepromptText(attributes);
    }else if(attributes.state === "reset"){
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
    var speechOutput = "this game needs two players to play. there are pairs of animals in boxes! On your turn, you choose two boxes. if there're same animals inside two boxes, you will get one score. The boxes will stay opened. You will need to choose not opened boxes. Your turn will be continued until you make the wrong boxes. The wrong boxes with different animals will be closed at the next turn. The game will be continued until one player wins. A player with higher score will be the winner. during the game, to check the score, say score. to check opened boxes, say opened. To reset the game, in the other person's turn, say reset. for more help, say help. "; 
    var repromptText = RepromptText(attributes);
    if(attributes.state === "tutorial"){
      attributes.state = "naming";
      speechOutput += "are you ready to play the game? "+RepromptText(attributes);      
    }else{
      speechOutput += RepromptText(attributes);
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
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent' 
        || (request.intent.name === 'AMAZON.NoIntent' && attributes.gameover));
  },
  handle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "See you next time";
    if(attributes.state === "inGame" || attributes.state === "levelSelect"){
      speechOutput += ", "+attributes.playerOne+" and "+attributes.playerTwo+". ";
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
    if(attributes.state === "tutorial" || attributes.gameover){
      speechOutput += "Please say yes or no. ";
    }else if(attributes.state === "naming"){
      speechOutput += "";
    }else if(attributes.state === "levelSelect"){
      speechOutput += "Please choose an odd number between 3 and 11. ";
    }else if(attributes.state === "inGame"){
      speechOutput += "Please tell me a number from 1 to "+attributes.numOfanimals*2+". ";
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
    LevelHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
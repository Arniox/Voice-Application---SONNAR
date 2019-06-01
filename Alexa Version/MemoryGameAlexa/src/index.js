/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');


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
    speechOutput="<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/bgm.mp3'/> Welcome to the Memory Game! this game needs two players to play. You want to play yourself? Don't worry! <amazon:effect name=\"whispered\">I will not tell anyone if you played both player1 and 2.</amazon:effect> Do you need tutorial?";
    //Reset Session attributes
    handlerInput.attributesManager.setSessionAttributes({});
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.state = "tutorial";
    attributes.errorCount = 0;
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
        && request.intent.name === 'NameIntent'
        && attributes.state !== "tutorial"
        && (typeof attributes.playerOne === 'undefined'
        || typeof attributes.playerTwo ==='undefined');
  },
  handle(handlerInput) {
    //Get request obj
    const request = handlerInput.requestEnvelope.request;
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.state = "naming";
    var speechOutput="";
    var repromptText="";
    //Check it is the name of the player one
    if(typeof attributes.playerOne === 'undefined'){
      attributes.playerOne = request.intent.slots.name.value;
      speechOutput = "Thank you, "+attributes.playerOne+"! and player two! what's your name? ";
    }else{
      attributes.playerTwo = request.intent.slots.name.value;
      speechOutput = "Thank you, "+attributes.playerTwo+"! Now, Let's play the game!! How many pairs of animals do you want to play with? you can choose an odd number between 3 and 11. ";
      attributes.state = "leveling";
    }
    repromptText = RepromptText(repromptText);
    //Save Session attributes
    handlerInput.attributesManager.setSessionAttributes(attributes);

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const InitiateGame = function(attributes){

  //turn tells who's turn it is
  attributes.turn = attributes.playerOne;
  //boxChoose tells it is about to choose first box or second box.
  attributes.boxTurn = "first";
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
  // attributes.boxopened = [false,false,false,false,false,false,false,false,false,false];
  // attributes.boxes = ["spade ace","heart ace","clover ace","diamond ace","spade two","spade ace","heart ace","clover ace","diamond ace","spade two"];
  attributes.boxes = animals.sort((a,b) => 0.5 - Math.random());
  attributes.boxes = attributes.boxes.slice(0,attributes.numOfanimals);
  attributes.boxes = attributes.boxes.concat(attributes.boxes);
  //shuffle boxes
  attributes.boxes = attributes.boxes.sort((a,b) => 0.5 - Math.random());
  attributes.firstBox = 0;
  attributes.secondBox = 0;
  attributes.scoreOne = 0;
  attributes.scoreTwo = 0;
  attributes.gameover = false;
  attributes.winScore = parseInt(attributes.numOfanimals/2)+1;
};

const ResetGame = function(attributes){
  attributes.boxes.forEach(function(item){item.opened = false;});
  attributes.scoreOne = 0;
  attributes.scoreTwo = 0;
  attributes.gameover = false;
  attributes.boxTurn = "first";
}

const RepromptText = function(attributes){
  var text = "";
  if(attributes.state === "tutorial"){
    text = "Do you need tutorial?";
  }else if(attributes.state === "naming" && typeof attributes.playerOne === 'undefined'){
    text = "player one! please tell me your name.";
  }else if(attributes.state === "naming" && typeof attributes.playerTwo ==='undefined'){
    text = "player two! "+ attributes.playerOne +" is waiting for you. please tell me your name.";
  }else if(attributes.state === "leveling"){
    text = "How many pairs of animals do you want to play with? ";
  }else if(attributes.state === "in game"){
    text = attributes.turn+", please choose the "+attributes.boxTurn+" box!";
  }else if(attributes.gameover){
    text = GameOverPrompt(attributes);
  }
  return text;
};

const GameOverPrompt = function(attributes){
  return "Game is over. The winner is " + attributes.turn +". Do you want to play again? Please say yes or no.";
};

const BoxHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    return request.type === 'IntentRequest'
        && (request.intent.name === 'BoxIntent'
        && (attributes.state === 'leveling' || attributes.state === 'in game'));
  },
  handle(handlerInput) {
    //Get Session attributes
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput="";
    var repromptText="";
    var userInput = request.intent.slots.boxNumber.value;
    var choosedIndex = userInput-1;
    if(attributes.state === "leveling"){
      if((userInput<12 && userInput>=3)&& userInput%2 === 1){
        attributes.state = "in game";
        attributes.numOfanimals = parseInt(userInput);
        InitiateGame(attributes);
        speechOutput = "Alright! let's start with " + userInput
        +" pairs of animals! Our adorable animals are hidden in "
        + userInput*2 + " boxes. please choose the box between one and "+userInput*2+". "
        +RepromptText(attributes);

      }else{
        speechOutput = "Choose an odd number between 3 and 11. "+RepromptText(attributes);
      }

    }else{
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
    && request.intent.name === 'ScoreIntent'&& attributes.state === 'in game';
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "";
    var repromptText = "";
    if(typeof attributes.playerOne !== 'undefined' &&typeof attributes.playerTwo !=='undefined'){
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
    && request.intent.name === 'OpenedIntent' && attributes.state === 'in game';
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "";
    if(typeof attributes.playerOne !== 'undefined' &&typeof attributes.playerTwo !=='undefined'){

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
    && ((attributes.gameover && attributes.state === 'in game')
    || attributes.state === 'reset');
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "";
    if(attributes.state === 'reset'){
      attributes.state = 'in game';
      ResetGame(attributes);
      speechOutput = "The game is reset. you know what? <amazon:effect name=\"whispered\"> boxes are still in the same order. </amazon:effect> ";
    }else if(attributes.gameover&&attributes.state==="in game"){
      attributes.state = "leveling";
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
    && (request.intent.name === 'AMAZON.NoIntent'
    && (attributes.state === "tutorial" //Check the state is tutorial
    || attributes.state === "reset"
    ||(typeof attributes.gameover ==='undefined' //Check the game is over
    ||(typeof attributes.gameover !=='undefined'
    &&!attributes.gameover))));
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
      attributes.state = "in game";
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
      && (request.intent.name === 'AMAZON.HelpIntent' || request.intent.name === "AMAZON.YesIntent" && attributes.state === "tutorial");
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
    if(attributes.state === "in game" || attributes.state === "leveling"){
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
    && request.intent.name === 'ResetIntent'
    && attributes.state === "in game";
  },
  handle(handlerInput) {
    //Get Session attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var speechOutput = "Do you really want to reset the game?";
    var repromptText = "really? reset?";
    attributes.state="reset";
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
    }else if(attributes.state === "leveling"){
      speechOutput += "Please choose an odd number between 3 and 11. ";
    }else if(attributes.state === "in game"){
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
    OpenedHandler,
    ScoreHandler,
    ResetHandler,
    BoxHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

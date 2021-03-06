/* eslint-disable  func-names */
/* eslint-disable  no-console */
const Alexa = require('ask-sdk');
const AWS = require('aws-sdk');
AWS.config.apiVersions = {
    dynamodb: '2012-08-10',
    // other service API versions
};
const ddbTableName = 'MemoryGameUsers';
const {
    DynamoDbPersistenceAdapter
} = require('ask-sdk-dynamodb-persistence-adapter');
var gameInfo = {};

//Execute query to get rank
const RankQuery = function(bestScore) {
    return new Promise(function(resolve, reject) {
        var dynamodb = new AWS.DynamoDB.DocumentClient();
        var params = {
            TableName: ddbTableName,
            ProjectionExpression: "#ud.#dt.#bS",
            FilterExpression: "#ud.#dt.#bS > :bS",
            ExpressionAttributeNames: {
                "#ud": "userData",
                "#dt": "data",
                "#bS": "bestScore"
            },
            ExpressionAttributeValues: {
                ":bS": bestScore
            }
        };
        dynamodb.scan(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);
                return reject(JSON.stringify(err, null, 2)); // an error occurred
            } else {
                console.log(data);
                data.Items.forEach(function(attributes) {
                    console.log(attributes);
                });
                resolve(data.Count + 1);
            }
        });
    });
};

const GetRank = function(attributes) {
    return RankQuery(attributes.data.bestScore).then((rank) => {
        gameInfo.rank = rank;
    });
};

var errorCount = 0;


//states into String
const stateStr = {
    launch: "launch",
    menu: "menu",
    inGame: "inGame",
    win: "win",
    restart: "restart",
    bactToMenu: "backToMenu"
};

//Box turn into String
const boxTurnStr = {
    first: "first",
    second: "second"
};

//Alexa presentation APL String value
const alexaPresentationAPL = {
    renderDocument: "Alexa.Presentation.APL.RenderDocument",
    userEvent: "Alexa.Presentation.APL.UserEvent"
};

//animal array
const animals = [{
    name: "dog",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/dog.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/dog.png",
    opened: false
}, {
    name: "cat",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/cat.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/cat.png",
    opened: false
}, {
    name: "chicken",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/chicken.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/chicken.png",
    opened: false
}, {
    name: "cow",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/cow.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/cow.png",
    opened: false
}, {
    name: "turkey",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/turkey.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/turkey.png",
    opened: false
}, {
    name: "frog",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/frog.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/frog.png",
    opened: false
}, {
    name: "goat",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/goat.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/goat.png",
    opened: false
}, {
    name: "goose",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/goose.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/goose.png",
    opened: false
}, {
    name: "horse",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/horse.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/horse.png",
    opened: false
}, {
    name: "pig",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/pig.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/pig.png",
    opened: false
}, {
    name: "sheep",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/sheep.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/sheep.png",
    opened: false
}, {
    name: "elephant",
    resource: "<audio src='https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/sounds/Animals/elephant.mp3' />",
    image: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/elephant.png",
    opened: false
}];

const boxImage = [{
    name: "box1",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box1.png",
    current: 'https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box1.png'
}, {
    name: "box2",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box2.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box2.png"
}, {
    name: "box3",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box3.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box3.png"
}, {
    name: "box4",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box4.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box4.png"
}, {
    name: "box5",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box5.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box5.png"
}, {
    name: "box6",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box6.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box6.png"
}, {
    name: "box7",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box7.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box7.png"
}, {
    name: "box8",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box8.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box8.png"
}, {
    name: "box9",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box9.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box9.png"
}, {
    name: "box10",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box10.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box10.png"
}, {
    name: "box11",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box11.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box11.png"
}, {
    name: "box12",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box12.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box12.png"
}, {
    name: "box13",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box13.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box13.png"
}, {
    name: "box14",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box14.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box14.png"
}, {
    name: "box15",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box15.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box15.png"
}, {
    name: "box16",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box16.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box16.png"
}, {
    name: "box17",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box17.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box17.png"
}, {
    name: "box18",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box18.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box18.png"
}, {
    name: "box19",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box19.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box19.png"
}, {
    name: "box20",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box20.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box20.png"
}, {
    name: "box21",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box21.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box21.png"
}, {
    name: "box22",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box22.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box22.png"
}, {
    name: "box23",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box23.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box23.png"
}, {
    name: "box24",
    resource: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box24.png",
    current: "https://s3.amazonaws.com/alexa-hackathon-memory-game-assets/Image/Box24.png"
}];

const levelsUnlocked = [{
        id: 1,
        resource: "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Voices/Memory_Box_Ammount_6.mp3'/>",
        name: "level 1",
        unlocked: false,
        numberOfSounds: 3,
        pageName: "./aplDocuments/threeSoundsPage.json",
        bestTry: 3
    }, {
        id: 2,
        resource: "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Voices/Memory_Box_Ammount_8.mp3'/>",
        name: "level 2",
        unlocked: false,
        numberOfSounds: 4,
        pageName: "./aplDocuments/fourSoundsPage.json",
        bestTry: 4
    }, {
        id: 3,
        resource: "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Voices/Memory_Box_Ammount_12.mp3'/>",
        name: "level 3",
        unlocked: false,
        numberOfSounds: 6,
        pageName: "./aplDocuments/sixSoundsPage.json",
        bestTry: 6
    }, {
        id: 4,
        resource: "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Voices/Memory_Box_Ammount_16.mp3'/>",
        name: "level 4",
        unlocked: false,
        numberOfSounds: 8,
        pageName: "./aplDocuments/eightSoundsPage.json",
        bestTry: 8
    },
    {
        id: 5,
        resource: "<audio src='https://alexa-hackathon-memory-game-assets.s3.amazonaws.com/sounds/Voices/Memory_Box_Ammount_20.mp3'/>",
        name: "level 5",
        unlocked: false,
        numberOfSounds: 10,
        pageName: "./aplDocuments/tenSoundsPage.json",
        bestTry: 10
    }, {
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
    repromptMenu: "Please select a option from: Start, show my rank, ask for help or exit the game!",
    repromptinGame: ["Choose the ", " box!", "Please choose the + gameInfoboxTurn+ box!"],
    repromptWin: "Do you wanna play a new game?",
    repromptBackToMenu: "Are you sure you want to go back to menu?",
    repromptRestart: "Do you really want to restart the game?",

    welcomeNewUser: "Hello and welcome. We have recieved a new supply of crates. And your goal is to match those crates up, so that the pair of animals gets shipped off together! ",
    welcomeBack: "Welcome back! ",

    startNotFromMenu: "You can only start the game from the menu. ",

    inGamePleaseChooseBox: ["Please, choose the first box to start off between 1 and ", "Please choose the first box to start off between 1 and +gameInfo.boxes.length"],
    inGameBoxInRange: ["You can choose a box number from 1 to ", "Choose from 1 to + gameInfo.boxes.length"],
    inGameBackToMenu: "if you go back to menu, you will lose your current score ",
    inGameBoxChosen: "The box is already choosen for your first box! There are other closed boxes waiting for you. ",
    inGameBoxOpened: "The chosen box is already opened! There are other closed boxes waiting for you. ",
    inGameGoNextLevel: "Let's move on next level. ",
    inGameRestart: "If you restart the game, you will lose your current score ",

    levelWin: ["Congratulations on winning ", "audios.levelWin+Congradulations on winning + gameInfocurrentLevel.name"],
    gameWin: ["You beat the last level! ", "You beat the last level! + speech.score"],

    errorGameNotStarted: "You didn't start the game yet!",
    errorNoBoxOpened: "There is no box opened. ",
    error1: "Sorry, I don't understand.",
    error3: "Thank you for playing! See you next time!",

    menuNewUser: "From the main menu, you can either choose to: start the game! show my rank! ask for help! or, quit the game. Which option would you like to select?",
    menu: "Please choose either to: start! show my rank! help! or, quit the game. ",
    score: ["Your score is ", "Your score is +gameInfototalScore"],

    yes: "Yes yes yes, ",
    no: "No no no, ",

    gameContinue: "Okay, the game continues! ",
    help: "There is a set of boxes with animal hidden inside. You need to open two boxes and find same animals inside. When you have found the same animals within a turn, those boxes will stay open. As soon as every boxes are matched and opened, you will go to the next level. When you finish level six, You will win the game. The score will be calculated every end of levels.",
    helpInMenu: " .",
    helpInGame: "To check score, say, Score. To check opened boxes, say, opened. To restart the game, say, restart. To go back to menu, say, menu. Now Let's go back to game!"
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

const InitiateGame = function() {
    animals.forEach((item) => {
        item.opened = false;
    });
    //Set boxes for the level
    gameInfo.boxes = shuffleSounds(gameInfo.currentLevel.numberOfSounds);
    //Selected box index
    gameInfo.firstBox = undefined;
    gameInfo.secondBox = undefined;
    //Score for checking the level finished
    gameInfo.score = 0;
    gameInfo.win = false;
    //Which box have to be choosen
    gameInfo.boxTurn = boxTurnStr.first;
    //Number of tries in this level
    gameInfo.numOfTry = 0;
    // The inital ingame page set to three sounds
    gameInfo.uipage = "./aplDocuments/threeSoundsPage.json";

    gameInfo.specificHandlerInput = undefined;
    gameInfo.specificAttributes = undefined;

    // gameInfo.allowYesNo = false;
};

const getSpecificHandlerInput = function(handlerInput) {
    return handlerInput;
};

const getSpecificAttribute = function(attribute) {
    return attribute;
};

const shuffleSounds = function(numOfanimals) {
    var boxes = animals.sort((a, b) => 0.5 - Math.random());
    boxes = boxes.slice(0, numOfanimals);
    boxes = boxes.concat(boxes);
    boxes = boxes.sort((a, b) => 0.5 - Math.random());
    return boxes;
};

const RepromptText = function() {
    var text = "";
    if (gameInfo.state === stateStr.launch) {
        text = speech.repromptLaunch;
    } else if (gameInfo.state === stateStr.menu) {
        text = speech.repromptMenu;
    } else if (gameInfo.state === stateStr.inGame) {
        text = speech.repromptinGame[0] + gameInfo.boxTurn + speech.repromptinGame[1];
    } else if (gameInfo.win) {
        text = speech.repromptWin;
    } else if (gameInfo.state === stateStr.backToMenu) {
    	text = speech.repromptBackToMenu;
    } else if (gameInfo.state === stateStr.restart) {
    	text = speech.repromptRestart;
    }
    return text;
};

const RecordScore = function(attributes) {
    if (gameInfo.totalScore > attributes.data.bestScore) {
        attributes.data.bestScore = gameInfo.totalScore;
    }
};

//To identify the current device support the APL or not
const SupportsAPL = function(handlerInput) {
    const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
    const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
    return aplInterface != null && aplInterface !== 'undefined';
};

const resetBoxImage = function() {
    for (var i = 0; i < 24; i++) {
        boxImage[i].current = boxImage[i].resource;
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
        speechOutput = audios.launchBGM;
        //Reset Session attributes
        const p_attributes = await handlerInput.attributesManager.getPersistentAttributes() || {};

        //Get persistent attributes
        if (Object.keys(p_attributes).length === 0) {
            p_attributes.data = {};
            p_attributes.data.timesLoggedIn = 1;
            p_attributes.data.bestScore = 0;
        } else {
            p_attributes.data.timesLoggedIn++;
        }
        handlerInput.attributesManager.setSessionAttributes(p_attributes);
        const attributes = handlerInput.attributesManager.getSessionAttributes();

        errorCount = 0;
        gameInfo.state = stateStr.menu;
        if (attributes.data.timesLoggedIn < 3) {
            speechOutput += speech.welcomeNewUser + speech.menuNewUser;
        } else {
            speechOutput += speech.welcomeBack + speech.menu;
        }

        repromptText = RepromptText();

        if (SupportsAPL(handlerInput)) {
            handlerInput.responseBuilder.addDirective({
                type: alexaPresentationAPL.renderDocument,
                document: require('./aplDocuments/menu.json'),
                datasources: {
                    'menuData': {}
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
        return (request.type === 'IntentRequest' && (request.intent.name === 'StartIntent' || (request.intent.name === 'AMAZON.YesIntent' && (gameInfo.state === stateStr.win || gameInfo.state === stateStr.restart)))) ||
            (request.type === alexaPresentationAPL.userEvent && (request.arguments[0] === 'StartIntent' || (request.arguments[0] === 'YesIntent' && (gameInfo.state === stateStr.win || gameInfo.state === stateStr.restart))));
    },
    handle(handlerInput) {
        //Get request obj
        const request = handlerInput.requestEnvelope.request;
        //Get Session attributes
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        var speechOutput = "";
        var repromptText = "";
        // Reset Error Count
        errorCount = 0;

        if (gameInfo.state === stateStr.menu || gameInfo.state === stateStr.win || gameInfo.state === stateStr.restart) {
            resetBoxImage();
            gameInfo.state = stateStr.inGame;
            gameInfo.totalScore = 0;
            speechOutput += audios.memoryWelcome;
            gameInfo.currentLevel = levelsUnlocked[0];
            InitiateGame();
            console.log(gameInfo.boxes);
            speechOutput += gameInfo.currentLevel.resource;
            speechOutput += speech.inGamePleaseChooseBox[0] + gameInfo.boxes.length;
            if (SupportsAPL(handlerInput)) {
                handlerInput.responseBuilder.addDirective({
                    type: alexaPresentationAPL.renderDocument,
                    document: require(gameInfo.uipage),
                    datasources: {
                        'pageData': {
                            "score": "Score: " + gameInfo.totalScore,
                            "currentLevel": "Level " + gameInfo.currentLevel.id,
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
        } else {
            //point!!
            speechOutput = speech.startNotFromMenu + RepromptText();
        }
        repromptText = RepromptText();

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(repromptText)
            .getResponse();
    },
};

const MenuHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return (request.type === 'IntentRequest' && request.intent.name === 'MenuIntent') ||
            (request.type === alexaPresentationAPL.userEvent && request.arguments[0] === 'MenuIntent');
    },
    handle(handlerInput) {
        var speechOutput = "";
        var repromptText = "";
        // Reset Error Count
        errorCount = 0;
        if (gameInfo.state === stateStr.inGame) {
        	gameInfo.state = stateStr.backToMenu;
            speechOutput += speech.inGameBackToMenu + gameInfo.totalScore + ". ";
            speechOutput += speech.repromptBackToMenu;
            if (SupportsAPL(handlerInput)) {
                handlerInput.responseBuilder.addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    document: require('./aplDocuments/yesOrNo.json'),
                    datasources: {
                        'yesOrNoData': {
                            "textTop": "Do you really want to",
                            "textMid": "Go back to Menu?",
                            "textBot": "You will lose the score " + gameInfo.totalScore + ". ",
                        }
                    },
                });
            }
        } else {
            gameInfo.state = stateStr.menu;
            speechOutput += RepromptText();
            if (SupportsAPL(handlerInput)) {
                handlerInput.responseBuilder.addDirective({
                    type: alexaPresentationAPL.renderDocument,
                    document: require('./aplDocuments/menu.json'),
                    datasources: {
                        'menuData': {}
                    },
                });
            }
        }

        repromptText = RepromptText();

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(repromptText)
            .getResponse();
    },
};


const BoxHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return (request.type === 'IntentRequest' && request.intent.name === 'BoxIntent') ||
            (request.type === alexaPresentationAPL.userEvent && request.arguments[0] === 'BoxIntent');
    },
    async handle(handlerInput) {
        //Get Session attributes
        const request = handlerInput.requestEnvelope.request;
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        var speechOutput = "";
        var repromptText = "";

        gameInfo.specificAttributes = getSpecificAttribute(attributes);
        gameInfo.specificHandlerInput = getSpecificHandlerInput(handlerInput);
        // Reset Error Count
        errorCount = 0;

        //distinguish UI input or Voice Input
        var userInput = "";
        if (request.type === 'IntentRequest')
            userInput = request.intent.slots.boxNumber.value;
        else
            userInput = request.arguments[1];

        var choosedIndex = userInput - 1;
        if (gameInfo.state === stateStr.inGame) {
            //if the game is not over, keep going
            if (!gameInfo.win) {
                if (userInput >= 1 && userInput <= gameInfo.boxes.length) {
                    //if the choosed box is already selected
                    if (gameInfo.boxTurn === boxTurnStr.second && (gameInfo.firstBox === choosedIndex)) {
                        speechOutput = gameInfo.boxes[choosedIndex].resource + speech.inGameBoxChosen;
                        speechOutput += RepromptText();
                        repromptText = RepromptText();

                    }

                    //if the choosed box is already opened
                    else if (gameInfo.boxes[choosedIndex].opened) {
                        speechOutput = gameInfo.boxes[choosedIndex].resource + speech.inGameBoxOpened;
                        speechOutput += RepromptText();
                        repromptText = RepromptText();
                    } else {
                        //Check the box turn
                        if (gameInfo.boxTurn === boxTurnStr.first) {
                            gameInfo.firstBox = choosedIndex;
                            speechOutput = audios.openingBox + gameInfo.boxes[choosedIndex].resource;
                            boxImage[choosedIndex].current = gameInfo.boxes[choosedIndex].image;
                            //it is about to second turn to choose a box
                            gameInfo.boxTurn = boxTurnStr.second;
                            speechOutput += RepromptText();
                            repromptText = RepromptText();
                        } else {
                            gameInfo.numOfTry++;
                            gameInfo.secondBox = choosedIndex;
                            speechOutput = audios.openingBox + gameInfo.boxes[choosedIndex].resource;
                            boxImage[choosedIndex].current = gameInfo.boxes[choosedIndex].image;

                            //Check selected boxes are the same ==> get score
                            if (gameInfo.boxes[gameInfo.firstBox].name === gameInfo.boxes[gameInfo.secondBox].name) {
                                speechOutput += audios.success;
                                //open the same boxes
                                gameInfo.boxes[gameInfo.firstBox].opened = true;
                                gameInfo.boxes[gameInfo.secondBox].opened = true;
                                //Give one score
                                gameInfo.score++;
                                //Check the player finished the current level

                                gameInfo.firstBox = undefined;
                                gameInfo.secondBox = undefined;
                                gameInfo.boxTurn = boxTurnStr.first;

                                gameInfo.win = (gameInfo.score === gameInfo.currentLevel.numberOfSounds);

                                if (!gameInfo.win) {
                                    speechOutput += RepromptText();
                                    repromptText = RepromptText();
                                } else {
                                    if (SupportsAPL(handlerInput)) {
                                        handlerInput.responseBuilder.addDirective({
                                            type: alexaPresentationAPL.renderDocument,
                                            document: require(gameInfo.uipage),
                                            datasources: {
                                                'pageData': {
                                                    "score": "Score: " + gameInfo.totalScore,
                                                    "currentLevel": "Level " + gameInfo.currentLevel.id,
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

                                    speechOutput += speech.levelWin[0] + gameInfo.currentLevel.name +
                                        ". ";

                                    return handlerInput.responseBuilder
                                        .speak(speechOutput)
                                        .addDirective({
                                            'type': 'GameEngine.StartInputHandler',
                                            'timeout': 8000,
                                            'recognizers': {
                                                'buttonPressedRecognizer': {
                                                    'type': 'match',
                                                    'fuzzy': true,
                                                    'anchor': 'anywhere',
                                                    'pattern': [{
                                                        'action': 'ACTION@'
                                                    }]
                                                }
                                            },
                                            'events': {
                                                'time_out_event': {
                                                    'meets': [
                                                        'timed out'
                                                    ],
                                                    'fails': [
                                                        'buttonPressedRecognizer'
                                                    ],
                                                    'shouldEndInputHandler': true
                                                }
                                            }
                                        })
                                        .getResponse();
                                }
                            } else {
                                if (SupportsAPL(handlerInput)) {
                                    handlerInput.responseBuilder.addDirective({
                                        type: alexaPresentationAPL.renderDocument,
                                        document: require(gameInfo.uipage),
                                        datasources: {
                                            'pageData': {
                                                "score": "Score: " + gameInfo.totalScore,
                                                "currentLevel": "Level " + gameInfo.currentLevel.id,
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

                                return handlerInput.responseBuilder
                                    .speak(speechOutput)
                                    .addDirective({
                                        'type': 'GameEngine.StartInputHandler',
                                        'timeout': 3000,
                                        'recognizers': {
                                            'buttonPressedRecognizer': {
                                                'type': 'match',
                                                'fuzzy': true,
                                                'anchor': 'anywhere',
                                                'pattern': [{
                                                    'action': 'ACTION@'
                                                }]
                                            }
                                        },
                                        'events': {
                                            'time_out_event': {
                                                'meets': [
                                                    'timed out'
                                                ],
                                                'fails': [
                                                    'buttonPressedRecognizer'
                                                ],
                                                'shouldEndInputHandler': true
                                            }
                                        }
                                    })
                                    .getResponse();
                            } //Check selected boxes are the same End 
                            //Change the box turn
                        } //Check the box turn End
                    } //Check box opened End
                } else { //Check user input
                    speechOutput = speech.inGameBoxInRange[0] + gameInfo.boxes.length + ". ";
                } //Check user input valid End
            } //Check the game over End
        }
        if (SupportsAPL(handlerInput)) {
            handlerInput.responseBuilder.addDirective({
                type: alexaPresentationAPL.renderDocument,
                document: require(gameInfo.uipage),
                datasources: {
                    'pageData': {
                        "score": "Score: " + gameInfo.totalScore,
                        "currentLevel": "Level " + gameInfo.currentLevel.id,
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

const RestartHandler = {
    canHandle(handlerInput) {
        console.log('RestartHandler: canHandle');
        const request = handlerInput.requestEnvelope.request;
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        return (request.type === 'IntentRequest' &&
                request.intent.name === 'RestartIntent');
    },

    handle(handlerInput) {
        console.log('RestartHandler: handle');

        gameInfo.state = stateStr.restart;
        var speechOutput = "";
        var repromptText = RepromptText();
        speechOutput += speech.inGameRestart + gameInfo.totalScore + ". ";
        speechOutput += repromptText;

        if (SupportsAPL(handlerInput)) {
            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: require('./aplDocuments/yesOrNo.json'),
                datasources: {
                    'yesOrNoData': {
                        "textTop": "Do you really want to",
                        "textMid": "Restart the Game?",
                        "textBot": "You will lose the score " + gameInfo.totalScore + "!",
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

const ScoreHandler = {
    canHandle(handlerInput) {
        //Get request obj
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'ScoreIntent';
    },
    handle(handlerInput) {
        //Get Session attributes
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        var speechOutput = "";
        var repromptText = "";
        // Reset Error Count
        errorCount = 0;
        if (gameInfo.state === stateStr.inGame) {
            speechOutput = speech.score[0] + gameInfo.totalScore + ". ";
        } else {
            speechOutput = speech.errorGameNotStarted;
        }
        speechOutput += RepromptText();
        repromptText = RepromptText();
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
        return request.type === 'IntentRequest' &&
            request.intent.name === 'OpenedIntent';
    },
    handle(handlerInput) {
        //Get Session attributes
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        var speechOutput = "";
        // Reset Error Count
        errorCount = 0;

        //Refactoring needed
        if (gameInfo.state === stateStr.inGame) {
            var opened = [];
            for (var i = 0; i < gameInfo.boxes.length; i++) {
                if (gameInfo.boxes[i].opened)
                    opened.push(i + 1);
            }
            if (opened.length > 0) {
                speechOutput = "Opened boxes are. ";
                opened.forEach(function(item) {
                    speechOutput += item + ". ";
                });
            } else {
                speechOutput = "there is no box opened. ";
            }
        } else {
            speechOutput = "You didn't start the game yet! ";
        }

        speechOutput += RepromptText();
        var repromptText = RepromptText();
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

        return (request.type === 'IntentRequest' && request.intent.name === 'AMAZON.YesIntent' && (gameInfo.state !== stateStr.win && gameInfo.state !== stateStr.restart)) ||
            (request.type === alexaPresentationAPL.userEvent && request.arguments[0] === 'YesIntent' && (gameInfo.state !== stateStr.win && gameInfo.state !== stateStr.restart));
    },
    handle(handlerInput) {

        var speechOutput = "";

        // Reset Error Count
        errorCount = 0;
        if (gameInfo.state === stateStr.backToMenu) {
            gameInfo.state = stateStr.menu;
            if (gameInfo.timesLoggedIn < 3) {
                speechOutput = speech.menuNewUser;
            } else {
                speechOutput = speech.menu;
            }
            if (SupportsAPL(handlerInput)) {
                handlerInput.responseBuilder.addDirective({
                    type: alexaPresentationAPL.renderDocument,
                    document: require('./aplDocuments/menu.json'),
                    datasources: {
                        'menuData': {}
                    },
                });
            }
        } else {
            speechOutput = speech.yes;
            speechOutput += RepromptText();
        }

        var repromptText = RepromptText();

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
        return (request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NoIntent' && gameInfo.state !== stateStr.win) ||
            (request.type === alexaPresentationAPL.userEvent && request.arguments[0] === 'NoIntent' && gameInfo.state !== stateStr.win);
    },
    handle(handlerInput) {
        var speechOutput = "";
        var repromptText = "";

        // Reset Error Count
        errorCount = 0;
        if (gameInfo.state === stateStr.backToMenu|| gameInfo.state === stateStr.restart) {
            // gameInfo.allowYesNo = false;
            gameInfo.state = stateStr.inGame;
            speechOutput += speech.gameContinue;
            speechOutput += RepromptText();
            if (SupportsAPL(handlerInput)) {
                handlerInput.responseBuilder.addDirective({
                    type: alexaPresentationAPL.renderDocument,
                    document: require(gameInfo.uipage),
                    datasources: {
                        'pageData': {
                            "score": "Score: " + gameInfo.totalScore,
                            "currentLevel": "Level " + gameInfo.currentLevel.id,
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
        } else {
            speechOutput = speech.no + RepromptText();
        }

        repromptText = RepromptText();
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
        return (request.type === 'IntentRequest' && request.intent.name === 'RankIntent') ||
            (request.type === alexaPresentationAPL.userEvent && request.arguments[0] === 'RankIntent');
    },
    async handle(handlerInput) {
        //Get Session attributes
        const attributes = handlerInput.attributesManager.getSessionAttributes();

        var speechOutput = "";
        // Reset Error Count
        errorCount = 0;
        await GetRank(attributes);
        speechOutput += "Your best score is " + attributes.data.bestScore + ", You are number ";
        speechOutput += gameInfo.rank + " in the world. ";

        if (SupportsAPL(handlerInput)) {
            handlerInput.responseBuilder.addDirective({
                type: alexaPresentationAPL.renderDocument,
                document: require('./aplDocuments/rank.json'),
                datasources: {
                    'rankData': {
                        "text": speechOutput
                    }
                },
            });
        }
        var time = 4500;
        if (speechOutput.length > 50) time += (speechOutput.length - 50) * 200;

        gameInfo.specificAttributes = getSpecificAttribute(attributes);
        gameInfo.specificHandlerInput = getSpecificHandlerInput(handlerInput);

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .addDirective({
                'type': 'GameEngine.StartInputHandler',
                'timeout': time,
                'recognizers': {
                    'buttonPressedRecognizer': {
                        'type': 'match',
                        'fuzzy': true,
                        'anchor': 'anywhere',
                        'pattern': [{
                            'action': 'ACTION@'
                        }]
                    }
                },
                'events': {
                    'time_out_event': {
                        'meets': [
                            'timed out'
                        ],
                        'fails': [
                            'buttonPressedRecognizer'
                        ],
                        'shouldEndInputHandler': true
                    }
                }
            })
            .getResponse();

    },
};

const HelpHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return (request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent') ||
            (request.type === alexaPresentationAPL.userEvent && request.arguments[0] === 'HelpIntent');
    },
    handle(handlerInput) {
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        var speechOutput = "";
        var repromptText = "";

        // Reset Error Count
        errorCount = 0;

        switch (gameInfo.state) {
            case stateStr.menu:
                speechOutput = speech.help;
                speechOutput += speech.helpInMenu + RepromptText();
                break;
            case stateStr.inGame:
                speechOutput = "There are " + gameInfo.boxes.length + " boxes with animal hidden inside. You need to open two boxes and find same animals inside. When you have found the same animals within a turn, those boxes will stay open. As soon as every boxes are matched and opened, you will go to the next level. When you finish level six, You will win the game. The score will be calculated every end of levels. ";
                speechOutput += speech.helpInGame + RepromptText();
                break;
            default:
                speechOutput += RepromptText();
        }
        repromptText = RepromptText();

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
        return (request.type === 'IntentRequest' &&
                (request.intent.name === 'AMAZON.CancelIntent' ||
                    request.intent.name === 'AMAZON.StopIntent' ||
                    (request.intent.name === 'AMAZON.NoIntent' && gameInfo.state === stateStr.win))) ||
            (request.type === alexaPresentationAPL.userEvent && request.arguments[0] === 'NoIntent' && gameInfo.state === stateStr.win);
    },
    async handle(handlerInput) {
        const attributes = handlerInput.attributesManager.getSessionAttributes();

        if (gameInfo.state === stateStr.inGame || gameInfo.state === stateStr.win) {
            RecordScore(attributes);
            console.log("in win state");
        }
        const userId = handlerInput.requestEnvelope.context.System.user.userId;
        handlerInput.attributesManager.setPersistentAttributes(attributes);
        await handlerInput.attributesManager.savePersistentAttributes();

        var speechOutput = "Thank you for playing. ";
        if (attributes.data.bestScore > 0) {
            if (gameInfo.state === stateStr.inGame || gameInfo.state === stateStr.win) {
                await GetRank(attributes);
                speechOutput += "Your best score is " + attributes.data.bestScore +
                    ". Your rank is number " + gameInfo.rank +
                    " in the world. See you next time!";
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
        var repromptText = RepromptText();
        errorCount++;
        // error count 1 => tell user that we don't understand what they said
        if (errorCount === 1) {
            speechOutput = "Sorry, I don't understand. ";
            // error count 2 => give user what is valid input
        } else if (errorCount === 2) {
            if (gameInfo.state === stateStr.inGame) {
                speechOutput += "Choose a box number from 1 to " + gameInfo.boxes.length + ". ";
            }
            speechOutput += RepromptText();
            // error count 3 => kick user out from the skill.
        } else if (errorCount === 3) {
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

/**
 * Events from the game engine
 */
const ButtonTriggerHandler = {
    canHandle(handlerInput) {
        console.log('GameEventHandler: canHandle');
        let {
            attributesManager,
            requestEnvelope
        } = handlerInput;

        return requestEnvelope.request.type === 'GameEngine.InputHandlerEvent';
    },

    handle(handlerInput) {
        console.log('GameEventHandler: handle');

        HandleGameInputEvent(handlerInput);
        return handlerInput.responseBuilder.getResponse();
    }
};

const HandleGameInputEvent = async function(handlerInput) {
    let {
        requestEnvelope,
        attributesManager
    } = handlerInput;

    let ctx = attributesManager.getRequestAttributes();
    let sessionAttributes = attributesManager.getSessionAttributes();
    let gameEngineEvents = requestEnvelope.request.events;
    var speechOutput = "";
    var repromptText = "";
    var intentName = "";
    if (gameInfo.specificHandlerInput.requestEnvelope.request.type === 'IntentRequest') {
        intentName = gameInfo.specificHandlerInput.requestEnvelope.request.intent.name;
    } else {
        intentName = gameInfo.specificHandlerInput.requestEnvelope.request.arguments[0];
    }

    console.log("IntentName is :", intentName);

    switch (gameEngineEvents[0].name) {
        case 'time_out_event': {
            console.log('Game: time out event');
            if (intentName === "RankIntent") {
                if (gameInfo.state === stateStr.menu) {
                    console.log('State menu');
                    if (SupportsAPL(handlerInput)) {
                        handlerInput.responseBuilder.addDirective({
                            type: alexaPresentationAPL.renderDocument,
                            document: require('./aplDocuments/menu.json'),
                            datasources: {
                                'menuData': {}
                            },

                        });
                    }

                    speechOutput += RepromptText();
                } else if (gameInfo.state === stateStr.inGame) {
                    console.log('State inGame');
                    if (SupportsAPL(handlerInput)) {
                        handlerInput.responseBuilder.addDirective({

                            type: alexaPresentationAPL.renderDocument,
                            document: require(gameInfo.uipage),
                            datasources: {
                                'pageData': {
                                    "score": "Score: " + gameInfo.totalScore,
                                    "currentLevel": "Level " + gameInfo.currentLevel.id,
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
					speechOutput += RepromptText();
                }
            } else if (intentName === "BoxIntent") {

                console.log('State inGame');
                if (gameInfo.win) {

                    gameInfo.totalScore += Math.round(1000 * (Math.pow(gameInfo.currentLevel.bestTry, 1 / (gameInfo.numOfTry / gameInfo.currentLevel.bestTry * 1.0))));
                    gameInfo.scoreText = "Score: " + gameInfo.totalScore;
                    RecordScore(sessionAttributes);


                    if (gameInfo.currentLevel.id < 2) { //TEST DONA
                        levelsUnlocked[gameInfo.currentLevel.id - 1].unlocked = true;
                        speechOutput += speech.inGameGoNextLevel;
                        gameInfo.currentLevel = levelsUnlocked[gameInfo.currentLevel.id];
                        InitiateGame();
                        console.log(gameInfo.boxes);
                        gameInfo.uipage = levelsUnlocked[gameInfo.currentLevel.id - 1].pageName;
                        resetBoxImage();
                        speechOutput += gameInfo.currentLevel.resource;
                        speechOutput += speech.inGamePleaseChooseBox[0] + gameInfo.boxes.length + ". ";
                        speechOutput += ' <break time="1s" />';
                        if (SupportsAPL(handlerInput)) {
                            handlerInput.responseBuilder.addDirective({

                                type: alexaPresentationAPL.renderDocument,
                                document: require(gameInfo.uipage),
                                datasources: {
                                    'pageData': {
                                        "score": "Score: " + gameInfo.totalScore,
                                        "currentLevel": "Level " + gameInfo.currentLevel.id,
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
                    } else {
                        gameInfo.state = stateStr.win;
                        speechOutput += audios.levelWin;
                        speechOutput += speech.gameWin[0] + speech.score[0] + gameInfo.totalScore + ". ";
                        gameInfo.specificHandlerInput.attributesManager.setPersistentAttributes(gameInfo.specificAttributes);
                        await handlerInput.attributesManager.savePersistentAttributes();

                        if (SupportsAPL(handlerInput)) {
                            handlerInput.responseBuilder.addDirective({
                                type: alexaPresentationAPL.renderDocument,
                                document: require('./aplDocuments/yesOrNo.json'),
                                datasources: {
                                    'yesOrNoData': {
                                        "textTop": "Congratulations!",
                                        "textMid": "Your score is " + gameInfo.totalScore + "! ",
                                        "textBot": "Do you want to play again?"
                                    }
                                },
                            });
                        }
                        speechOutput += RepromptText();
                    }

                } else {
                    speechOutput += audios.closingBox +
                        audios.closingBox;

                    boxImage[gameInfo.firstBox].current = boxImage[gameInfo.firstBox].resource;
                    boxImage[gameInfo.secondBox].current = boxImage[gameInfo.secondBox].resource;

                    if (SupportsAPL(handlerInput)) {
                        handlerInput.responseBuilder.addDirective({

                            type: alexaPresentationAPL.renderDocument,
                            document: require(gameInfo.uipage),
                            datasources: {
                                'pageData': {
                                    "score": "Score: " + gameInfo.totalScore,
                                    "currentLevel": "Level " + gameInfo.currentLevel.id,
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
                    gameInfo.firstBox = undefined;
                    gameInfo.secondBox = undefined;
                    gameInfo.boxTurn = boxTurnStr.first;
                    speechOutput += RepromptText();
                }
                attributesManager.setSessionAttributes(sessionAttributes);
            } else {
                console.log('time out event triggered in wrong state');
            }

            repromptText = RepromptText();
            ctx.openMicrophone = true;
            gameInfo.specificHandlerInput = undefined;
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .reprompt(repromptText)
                .getResponse();
        }

        default:
            console.log('exception: echo button pressed');
    }
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
        RestartHandler,
        MenuHandler,
        ExitHandler,
        ButtonTriggerHandler,
        SessionEndedRequestHandler
    )
    .withPersistenceAdapter(new DynamoDbPersistenceAdapter({
        tableName: ddbTableName,
        createTable: true
    }))
    .addErrorHandlers(ErrorHandler)
    .lambda();
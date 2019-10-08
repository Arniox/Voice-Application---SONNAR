// ------------------------------------------------------------------
// APP CONFIGURATION
// ------------------------------------------------------------------

module.exports = {
    logging: true,
 
    intentMap: {
       'AMAZON.StopIntent': 'END',
    },
 
    db: {
        DynamoDb: {
            //enabled: true,
            tableName: 'MemoryGameUsers',

            awsConfig: {
               accessKeyId: 'AKIAJTFDYQ44HY4CM6JA',
               secretAccessKey: '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', 
               region:  'us-east-1',
            },
        },
    },
 };
 
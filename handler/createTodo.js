const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

const TODO_TABLE = process.env.TODO_TABLE;
const client = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(client);
const uuid = require("uuid");

module.exports.createTodo = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = event.todo;
  if (typeof data !== "string") {
    console.error("Validation Failed");
    return;
  }

  const params = {
    TableName: TODO_TABLE,
    Item: {
      userId: uuid.v1(),
      todo: data,
      checked: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  dynamoDbClient.send(new PutCommand(params), (error, data) => {
    if (error) {
      console.error(error);
      callback(new Error(error));
      return;
    }
    // Create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(data.Item),
    };

    callback(null, response);
  });
};

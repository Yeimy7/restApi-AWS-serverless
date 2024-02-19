const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  DeleteCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

const TODO_TABLE = process.env.TODO_TABLE;
const client = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(client);

module.exports.deleteTodo = async (event, context, callback) => {
  const params = {
    TableName: TODO_TABLE,
    Key: {
      userId: event.pathParameters.id,
    },
  };

  try {
    await dynamoDbClient.send(new DeleteCommand(params));
    const response = {
      statusCode: 200,
      body: JSON.stringify({ message: "Todo deleted successfully" }),
    };

    return response;
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

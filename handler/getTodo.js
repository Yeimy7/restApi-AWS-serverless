const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

const TODO_TABLE = process.env.TODO_TABLE;
const client = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(client);

module.exports.getTodo = async (event, context, callback) => {
  const params = {
    TableName: TODO_TABLE,
    Key: {
      userId: event.pathParameters.id,
    },
  };

  try {
    const { Item } = await dynamoDbClient.send(new GetCommand(params));
    const response = Item
      ? {
          statusCode: 200,
          body: JSON.stringify(Item),
        }
      : {
          statusCode: 404,
          body: JSON.stringify({ message: "Todo not found" }),
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

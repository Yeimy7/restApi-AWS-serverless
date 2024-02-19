const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

const TODO_TABLE = process.env.TODO_TABLE;
const client = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(client);

module.exports.listTodos = async (event, context) => {
  const params = {
    TableName: TODO_TABLE,
  };

  try {
    const command = new ScanCommand(params);
    const data = await dynamoDbClient.send(command);
    console.log("la data -> ", data);
    const response = {
      statusCode: 200,
      body: JSON.stringify(data.Items),
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

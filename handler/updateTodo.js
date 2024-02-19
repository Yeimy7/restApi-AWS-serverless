const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");

const TODO_TABLE = process.env.TODO_TABLE;
const client = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(client);

module.exports.updateTodo = async (event, context, callback) => {
  const datetime = new Date().toISOString();
  console.log('la data -> ', event.body)
  console.log('El typeof -> ', typeof event.body);
//   const { todo, checked } = event.body;
  const data =JSON.parse(event.body)

  if (typeof data.todo !== "string" || typeof data.checked !== "boolean") {
    console.error("value of todo or done is invalide");
    return;
  }
  try {
    const params = {
      TableName: TODO_TABLE,
      Key: {
        userId: event.pathParameters.id,
      },
      ExpressionAttributeNames: {
        "#todo_text": "todo",
      },
      ExpressionAttributeValues: {
        ":todo": data.todo,
        ":checked": data.checked,
        ":updatedAt": datetime,
      },
      UpdateExpression:
        "SET #todo_text = :todo, checked = :checked, updatedAt = :updatedAt",
      ReturnValues: "ALL_NEW",
    };
    const { Attributes } = await dynamoDbClient.send(new UpdateCommand(params));
    const response = {
      statusCode: 200,
      body: JSON.stringify(Attributes),
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

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  DeleteCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const uuid = require("uuid");
const TODO_TABLE = process.env.TODO_TABLE;

const client = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(client);

const createTodo = async (data) => {
  const timestamp = new Date().getTime();
  const params = {
    TableName: TODO_TABLE,
    Item: {
      userId: uuid.v1(),
      todo: data.todo,
      checked: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };
  await dynamoDbClient.send(new PutCommand(params));
  return params.Item;
};

const listTodos = async () => {
  const params = {
    TableName: TODO_TABLE,
  };
  const { Items } = await dynamoDbClient.send(new ScanCommand(params));
  return Items;
};

const getOneTodo = async (data) => {
  const params = {
    TableName: TODO_TABLE,
    Key: {
      userId: data.id,
    },
  };
  const { Item } = await dynamoDbClient.send(new GetCommand(params));
  return Item;
};
const updateTodo = async (data) => {
  const datetime = new Date().toISOString();

  if (typeof data.todo !== "string" || typeof data.checked !== "boolean") {
    console.error("value of todo or done is invalide");
    return;
  }
  const params = {
    TableName: TODO_TABLE,
    Key: {
      userId: data.id,
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
  return Attributes;
};
const deleteTodo = async (data) => {
  const params = {
    TableName: TODO_TABLE,
    Key: {
      userId: data.id,
    },
  };
  await dynamoDbClient.send(new DeleteCommand(params));
  return { message: "Todo deleted successfully" };
};

module.exports.restApi = async (event, context) => {
  try {
    const data = JSON.parse(event.body);
    if (!data.action) {
      console.error("Especifique la acción a realizar");
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Especifique la acción a realizar" }),
      };
    }

    switch (data.action) {
      case "create":
        const createdTodo = await createTodo(data.payload);
        return {
          statusCode: 200,
          body: JSON.stringify(createdTodo),
        };
      case "list":
        const todos = await listTodos();
        return {
          statusCode: 200,
          body: JSON.stringify(todos),
        };
      case "getOne":
        const getOne = await getOneTodo(data.payload);
        const response = getOne
          ? {
              statusCode: 200,
              body: JSON.stringify(getOne),
            }
          : {
              statusCode: 404,
              body: JSON.stringify({ message: "Todo not found" }),
            };
        return response;
      case "update":
        const updatedTodo = await updateTodo(data.payload);
        return {
          statusCode: 200,
          body: JSON.stringify(updatedTodo),
        };
      case "remove":
        const removedTodo = await deleteTodo(data.payload);
        return {
          statusCode: 200,
          body: JSON.stringify(removedTodo),
        };
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Acción no válida" }),
        };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

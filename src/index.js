const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return res.status(404).json({ error: "User does not exist in the database" });
  }

  req.user = user;
  return next();
}

app.post('/users', (req, res) => {
  const { name, username } = req.body;

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);
  return res.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  return res.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { title, deadline } = req.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);
  return res.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;
  const { title, deadline } = req.body;

  const todo = user.todos.find(todo => todo.id === id);

  todo.title = title;
  todo.deadline = new Date(deadline);

  return res.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const todo = user.todos.find(todo => todo.id === id);

  todo.done = true;

  return res.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    res.status(400).json({ error: "The task does not exist" });
  }

  user.todos = user.todos.filter(todo => todo.id !== id);
  return res.status(200).json(user.todos);
});

module.exports = app;
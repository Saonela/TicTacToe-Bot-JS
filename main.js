'use strict'
var request = require('request');

console.log('hey!', process.argv[2]);
let room = process.argv[2];
let player = process.argv[3];
let url = 'http://tictactoe.homedir.eu/game/' + room + '/player/' + player;
console.log(url)

let message = '[[\"x\", 2, \"y\",  0, \"v\", \"o\"], [\"x\",  0,   \"y\",   0, \"v\", \"x\"], [\"x\", 1,  \"y\",  1,   \"v\", \"x\"],  [\"x\",   2,  \"y\",  2, \"v\", \"o\"]]';
console.log(message);
console.log('              ');

parse(message);
play(url, 'no moves')


function play(url, moves) {
  console.log(moves);
  postRequest(url);
  getRequest(url);
}

function postRequest(url) {
  request({
      url: url.slice(0, -1) + '2',
      method: "POST",
      body: "[[\"x\", 2, \"y\",  0, \"v\", \"o\"]]",
      headers: {
       "Content-Type": "application/json+list"
     }
  }, function (error, response, body){
      // console.log(response);
      // console.log(response.statusCode);
  });
}

function getRequest(url) {
  request({
    url: url,
    method: "GET",
    headers: { "Accept": "application/json+list" }
   }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        play(url, response.body);
      } else {
        console.log('Error during GET. Status code:', response.statusCode);
      }
  })
}

function parse(data) {
  let list = data.replace(/\s/g,'').substring(1);
  let moves = parseList(list, []);
  console.log('moves',moves);
}

function parseList(data, moves) {
  if(data == ']' || data == '') {
    return;
  } else {
    moves.push(parseMove(data))
    parseList(trimToNextMove(data), moves);
    return moves;
  }
}

function parseMove(data) {
  let xPrefix = data.substring(5);
  let coordX = parseInt(xPrefix[0],10);
  let yPrefix = xPrefix.substring(6);
  let coordY = parseInt(yPrefix[0],10);
  let playerPrefix = yPrefix.substring(7);
  let player = playerPrefix[0];
  return [coordX, coordY, player];
}

function trimToNextMove(data) {
  return data.substring(22);
}

'use strict'
var request = require('request');

let room = process.argv[2];
let player = process.argv[3];
let url = 'http://tictactoe.homedir.eu/game/' + room + '/player/' + player;
let playerSymbol =  process.argv[3] == 1 ? 'x' : 'o';

// let message = '[[\"x\", 2, \"y\",  0, \"v\", \"x\"], [\"x\",  0,   \"y\",   0, \"v\", \"x\"], [\"x\", 1,  \"y\",  1,   \"v\", \"x\"],]';
// let message = '[[\"x\", 2, \"y\",  0, \"v\", \"x\"]]';

// console.log('PARSE', parse(message));

play(url, '', playerSymbol)


function play(url, moves, player) {
  if(moves == '' && player == 'x') {
    let body = makeMove(moves, player);
    postRequest(url, body);
    play(url, body, playerSymbol)
  } else {
    getRequest(url, player);
  }
}

function makeMove (moves, player) {
  if(moves == '') {
    return '[[\"x\", 1, \"y\",   1, \"v\", \"' + player + '\"]]';
  } else {
    let movesArr = parse(moves);
    let status = defend(movesArr, player);
    if(status) {
      return moves.slice(0, -1) + ', ' + status + ']';
    } else {
      return moves.slice(0, -1) + ', ' + makeRandomDiagMove(movesArr, 0, 0, player) + ']';
    }
  }
}

function makeRandomMove(moves, x, y, player) {
  console.log('makeRandomMove',x,' ',y);
  let result;
  if (x == 3) {
    console.log('no moves left!');
  } else if (y == 3) {
    makeRandomMove(moves, x+1, 0, player)
  } else {
    let cell = moves.filter((move) => {
      return move.x == x && move.y == y;
    });
    console.log('cell',cell);
    if(cell.length == 0) {
      console.log('Kai cia ateina x nuluzta kazkodel.',cell);
      result =  buildMove(x, y, player);
      return result;
    } else {
      return makeRandomMove(moves, x, y+1 ,player);
    }
  }
  return result;
}

function makeRandomDiagMove(moves, x, y, player) {
    console.log('makeRandomDiAGMove',x,' ',y);
  if (x == 4) {
    let some =  makeRandomMove(moves, 0, 0, player);
    console.log('MAKE RANDOM MOVIE RESULT', some)
    return some;
  } else if (y == 4) {
    let some =  makeRandomMove(moves, 0, 0, player);
    console.log('MAKE RANDOM MOVIE GOOD RESULT', some)
    return some;
  } else {
    if (isCenterFree(moves) && player == 'o') {
      return makeRandomMove(moves, 0, 0, player);
    } else {
      let cell = moves.filter((move) => {
        return move.x == x && move.y == y;
      });
      if(cell.length == 0) {
        return buildMove(x, y, player);
      } else {
        return makeRandomDiagMove(moves, x, y+2 ,player);
      }
    }
  }
}

function isCenterFree(moves) {
  return moves.filter((move) => {
    return move.x == 1 && move.y == 1;
  });
}

function defend (moves, player) {
  let columnStatus = checkColumns(moves,2,player);
  let rowStatus = checkRows(moves,2,player);
  let diagonalStatus = checkDiagonals(moves,2,player);
  if(rowStatus != false) {
    return '[\"x\",' + rowStatus.x + ', \"y\", ' + rowStatus.y + ', \"v\", \"' + player + '\"]';
  } else if(columnStatus != false) {
    return '[\"x\",' + columnStatus.x + ', \"y\", ' + columnStatus.y + ', \"v\", \"' + player + '\"]';
  } else if(diagonalStatus != false) {
    return diagonalStatus;
  } else {
    return false;
  }
}

function checkRows (moves, pos, player) {
  if(pos == -1) {
    return false;
  } else {
    let row = moves.filter((move) => {
        return move.x == pos;
    })
    let countX = countPlayers(row, 'x')
    let countO = countPlayers(row, 'o')
    if((countX == 2 && countO == 0) || (countO == 2  && countX == 0)) {
        let moveCoor = checkEmpty(row, 'y');
      if(moveCoor) {
        return {x:pos, y:moveCoor};
      }
    }
    return checkRows(moves, pos-1, player)
  }
}

function checkColumns (moves, pos, player) {
  if(pos == -1) {
    return false;
  } else {
    let column = moves.filter((move) => {
        return move.y == pos;
    })
    let countX = countPlayers(column, 'x')
    let countO = countPlayers(column, 'o')
    if((countX == 2 && countO == 0) || (countO == 2  && countX == 0)) {
      let moveCoor = checkEmpty(column, 'x');
      if(moveCoor) {
        return {x:moveCoor, y:pos};
      }
    }
    return checkColumns(moves, pos-1, player)
  }
}

function checkDiagonals (moves, pos, player) {
  let dg1 = checkDiagonal1(moves, pos, player);
  let dg2 = checkDiagonal2(moves, pos, player);
  if(dg1 != false) {
    return '[\"x\",' + dg1.x + ', \"y\", ' + dg1.y + ', \"v\", \"' + player + '\"]';
  } else if(dg2 != false) {
    return '[\"x\",' + dg2.x + ', \"y\", ' + dg2.y + ', \"v\", \"' + player + '\"]';
  } else {
    return false;
  }
}

function checkDiagonal1 (moves, pos, player) {
  let diag = moves.filter((move) => {
      return (move.x == move.y &&  move.player != player);
  })
  let countX = countPlayers(diag, 'x')
  let countO = countPlayers(diag, 'o')
  if((countX == 2 && countO == 0) || (countO == 2  && countX == 0)) {
      let moveCoor = checkEmpty(diag, 'x');
      if(moveCoor) {
        return {x:moveCoor, y:pos};
      }
  }
  return false;
}

function checkDiagonal2 (moves, pos, player) {
  let diag = getDiagonal2(moves,pos,[],player);
  let countX = countPlayers(diag, 'x')
  let countO = countPlayers(diag, 'o')
  if((countX == 2 && countO == 0) || (countO == 2  && countX == 0)) {
      let moveCoor = checkEmpty(diag, 'x');
      if(moveCoor) {
        return {x:moveCoor, y:Math.abs(moveCoor-2)};
      }
  }
  return false;
}

function getDiagonal2 (moves, pos, data, player) {
  if(pos == -1) {
    return data;
  } else {
    let diag = moves.filter((move) => {
        return (move.x == pos && move.y == Math.abs(pos-2));
    })
    if(diag[0]) {
      data.push(diag[0])
    }
  }
  return getDiagonal2(moves, pos-1, data, player);
}

function checkEmpty (moves, prop) {
  let possiblePlaces = [0,1,2];
  moves.forEach((move)=>{
    let ind = possiblePlaces.indexOf(move[prop]);
    if(ind > -1) {
      possiblePlaces.splice(ind,1)
    }
  })
  if(possiblePlaces.length == 1) {
    return possiblePlaces[0];
  } else {
    return false;
  }
}

function buildMove(x, y, player) {
  return '[\"x\",' + x + ', \"y\", ' + y + ', \"v\", \"' + player + '\"]';
}

function countPlayers(arr, player) {
  return arr.reduce((acc, move) => {
    if(move.player == player) {
      return acc + 1;
    } else {
     return acc;
   }
  },0);
}

function postRequest(url, body) {
  request({
      url: url,
      method: "POST",
      body: body,
      headers: {
       "Content-Type": "application/json+list"
     }
  }, function (error, response, body){
  });
}

function getRequest(url, player) {
  request({
    url: url,
    method: "GET",
    headers: { "Accept": "application/json+list" }
   }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          let body = makeMove(response.body, player);
          postRequest(url, body);
          play(url, response.body, player);
      } else {
        console.log('Error during GET. Status code:', response.statusCode);
      }
  })
}

function parse(data) {
  let list = data.replace(/\s/g,'').substring(1);
  let moves = parseList(list, []);
  return moves;
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
  return {x:coordX, y:coordY, player};
}

function trimToNextMove(data) {
  return data.substring(22);
}

'use strict'
var request = require('request');

let room = process.argv[2];
let player = process.argv[3];
let url = 'http://tictactoe.homedir.eu/game/' + room + '/player/' + player;
let playerSymbol =  process.argv[3] == 1 ? 'x' : 'o';

// let message = '[[\"x\", 2, \"y\",  0, \"v\", \"x\"], [\"x\",  0,   \"y\",   0, \"v\", \"x\"], [\"x\", 1,  \"y\",  1,   \"v\", \"x\"],]';
let message = '[[\"x\", 0, \"y\",  0, \"v\", \"x\"]]';
let message5 = '[[\"x\", 0, \"y\",  0, \"v\", \"x\"],[\"x\", 1, \"y\",  1, \"v\", \"o\"],[\"x\", 0, \"y\",  2, \"v\", \"x\"],[\"x\", 0, \"y\",  1, \"v\", \"o\"],[\"x\", 2, \"y\",  1, \"v\", \"x\"],[\"x\", 1, \"y\",  2, \"v\", \"o\"]]';

// console.log('PARSE', parse(message));

// console.log('DEFENDDD', defend(parse(message5), 'x'));

// console.log(this().play());
//
// this().play(url, '', playerSymbol)

// module.exports.this = this;

class TicToc {
    constructor() {}
    play (url, moves, player){
      if (moves == '' && player == 'x') {
        let body = this.makeMove(moves, player);
        this.postRequest(url, body);
        this.play(url, body, playerSymbol)
      } else {
        this.getRequest(url, player);
      }
    }

    makeMove (moves, player) {
      if (moves == '') {
        // return '[[\"x\", 1, \"y\",   1, \"v\", \"' + player + '\"]]';
        return '[[\"x\", 0, \"y\",   0, \"v\", \"' + player + '\"]]';
      } else {
        let movesArr = this.parse(moves);
        let status = this.defend(movesArr, player);
        if (status) {
          return moves.slice(0, -1) + ', ' + status + ']';
        } else {
          return moves.slice(0, -1) + ', ' + this.makeRandomDiagMove(movesArr, 0, 0, player) + ']';
        }
      }
    }

    makeRandomMove (moves, x, y, player) {
      let result;
      if (x >= 3) {
        console.log('no moves left!');
        return;
        // return makeRandomDiagMove(moves, 0, 0 ,player);;
      } else if (y >= 3) {
        return this.makeRandomMove(moves, x+1, 0, player)
      } else {
        let cell = moves.filter((move) => {
          return move.x == x && move.y == y;
        });
        if (cell.length == 0) {
          result =  this.buildMove(x, y, player);
          return result;
        } else {
          return this.makeRandomMove(moves, x, y+1 ,player);
        }
      }
    }

    makeRandomDiagMove (moves, x, y, player) {
      if (x == 4) {
        let some = this.makeRandomMove(moves, 0, 0, player);
        return some;
      } else if (y == 4) {
        let some = this.makeRandomDiagMove(moves, x+2, 0, player);
        return some;
      } else {
        if (this.isCenterFree(moves).length == 0 && player == 'o') {
          return this.makeRandomMove(moves, 1, 1, player);
        } else {
          let cell = moves.filter((move) => {
            return move.x == x && move.y == y;
          });
          if (cell.length == 0) {
            return this.buildMove(x, y, player);
          } else {
            return this.makeRandomDiagMove(moves, x, y+2 ,player);
          }
        }
      }
    }

    isCenterFree (moves) {
      return moves.filter((move) => {
        return move.x == 1 && move.y == 1;
      });
    }

    defend (moves, player) {
      let columnStatus = this.checkColumns(moves,2,player);
      let rowStatus = this.checkRows(moves,2,player);
      let diagonalStatus = this.checkDiagonals(moves,2,player);
      console.log('C',columnStatus,'R',rowStatus,'D',diagonalStatus);
      if (rowStatus != false) {
        return '[\"x\",' + rowStatus.x + ', \"y\", ' + rowStatus.y + ', \"v\", \"' + player + '\"]';
      } else if(columnStatus != false) {
        return '[\"x\",' + columnStatus.x + ', \"y\", ' + columnStatus.y + ', \"v\", \"' + player + '\"]';
      } else if(diagonalStatus != false) {
        return diagonalStatus;
      } else {
        return false;
      }
    }

    checkRows (moves, pos, player) {
      if (pos == -1) {
        return false;
      } else {
        let row = moves.filter((move) => {
            return move.x == pos;
        })
        let countX = this.countPlayers(row, 'x')
        let countO = this.countPlayers(row, 'o')
        if ((countX == 2 && countO == 0) || (countO == 2  && countX == 0)) {
            let moveCoor = this.checkEmpty(row, 'y');
          if (moveCoor !== false) {
            return {x:pos, y:moveCoor};
          }
        }
        return this.checkRows(moves, pos-1, player)
      }
    }

    checkColumns (moves, pos, player) {
      if (pos == -1) {
        return false;
      } else {
        let column = moves.filter((move) => {
            return move.y == pos;
        })
        let countX = this.countPlayers(column, 'x')
        let countO = this.countPlayers(column, 'o')
        if((countX == 2 && countO == 0) || (countO == 2  && countX == 0)) {
          let moveCoor = this.checkEmpty(column, 'x');
          if (moveCoor) {
            return {x:moveCoor, y:pos};
          }
        }
        return this.checkColumns(moves, pos-1, player)
      }
    }

    checkDiagonals (moves, pos, player) {
      let dg1 = this.checkDiagonal1(moves, pos, player);
      let dg2 = this.checkDiagonal2(moves, pos, player);
      if (dg1 != false) {
        return '[\"x\",' + dg1.x + ', \"y\", ' + dg1.y + ', \"v\", \"' + player + '\"]';
      } else if (dg2 != false) {
        return '[\"x\",' + dg2.x + ', \"y\", ' + dg2.y + ', \"v\", \"' + player + '\"]';
      } else {
        return false;
      }
    }

    checkDiagonal1 (moves, pos, player) {
      let diag = moves.filter((move) => {
          return (move.x == move.y &&  move.player != player);
      })
      let countX = this.countPlayers(diag, 'x')
      let countO = this.countPlayers(diag, 'o')
      if((countX == 2 && countO == 0) || (countO == 2  && countX == 0)) {
          let moveCoor = this.checkEmpty(diag, 'x');
          if(moveCoor) {
            return {x:moveCoor, y:pos};
          }
      }
      return false;
    }

    checkDiagonal2 (moves, pos, player) {
      let diag = this.getDiagonal2(moves,pos,[],player);
      let countX = this.countPlayers(diag, 'x')
      let countO = this.countPlayers(diag, 'o')
      if ((countX == 2 && countO == 0) || (countO == 2  && countX == 0)) {
          let moveCoor = this.checkEmpty(diag, 'x');
          if (moveCoor) {
            return {x:moveCoor, y:Math.abs(moveCoor-2)};
          }
      }
      return false;
    }

    getDiagonal2 (moves, pos, data, player) {
      if (pos == -1) {
        return data;
      } else {
        let diag = moves.filter((move) => {
            return (move.x == pos && move.y == Math.abs(pos-2));
        })
        if (diag[0]) {
          data.push(diag[0])
        }
      }
      return this.getDiagonal2(moves, pos-1, data, player);
    }

    checkEmpty (moves, prop) {
      let possiblePlaces = [0,1,2];
      moves.forEach((move)=>{
        let ind = possiblePlaces.indexOf(move[prop]);
        if (ind > -1) {
          possiblePlaces.splice(ind,1)
        }
      })
      if (possiblePlaces.length == 1) {
        return possiblePlaces[0];
      } else {
        return false;
      }
    }

    buildMove (x, y, player) {
      return '[\"x\",' + x + ', \"y\", ' + y + ', \"v\", \"' + player + '\"]';
    }

    countPlayers (arr, player) {
      return arr.reduce((acc, move) => {
        if (move.player == player) {
          return acc + 1;
        } else {
         return acc;
       }
      },0);
    }

    postRequest (url, body) {
      let that = this;

      request({
          url: url,
          method: "POST",
          body: body,
          headers: {
           "Content-Type": "application/json+list"
         }
      }, function (error, response, body){
          if (!error && response.statusCode == 200) {
            console.log('SIUNCIAM');
          }

      });
    }

    getRequest (url, player) {
      let that = this;
      request({
        url: url,
        method: "GET",
        headers: { "Accept": "application/json+list" }
       }, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log('LAUKIAM');

              let body = that.makeMove(response.body, player);
              console.log('RES',body)
              that.postRequest(url, body);
              that.play(url, response.body, player);
          } else {
            console.log('Error during GET. Status code:', response.statusCode);
            console.log(response.body);
          }
      })
    }

    parse (data) {
      let list = data.replace(/\s/g,'').substring(1);
      let moves = this.parseList(list, []);
      return moves;
    }

    parseList (data, moves) {
      if (data == ']' || data == '') {
        return;
      } else {
        moves.push(this.parseMove(data))
        this.parseList(this.trimToNextMove(data), moves);
        return moves;
      }
    }

    parseMove (data) {
      let xPrefix = data.substring(5);
      let coordX = parseInt(xPrefix[0],10);
      let yPrefix = xPrefix.substring(6);
      let coordY = parseInt(yPrefix[0],10);
      let playerPrefix = yPrefix.substring(7);
      let player = playerPrefix[0];
      return {x:coordX, y:coordY, player};
    }

    trimToNextMove (data) {
      return data.substring(22);
    }
}
module.exports.this = this;

var ticToc = new TicToc;
ticToc.play(url, '', playerSymbol)

// class MyClass {
//
//     constructor() {}
//
//     foo(req, res, next) {
//         return 'foo';
//     }
//
//     bar(req, res, next) {
//         return this.foo();
//     }
// }
//
//
// var lsd = new MyClass;
// console.log(lsd.bar());
// module.exports = new MyClass();

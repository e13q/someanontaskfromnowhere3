var WordTable = require('word-table'); //table
var hmac = require("crypto-js/hmac-sha256"); //hmac
var SecureRandom = require('securerandom'); // keyGen
var prompt = require("prompt-sync")({ sigint: true }); //read console input

let args = [];
let alph = [];
let flagError = false;

class TableHelpGenerate
{
    constructor(moves, rules)
    {
        this.moves = moves;
        this.rules = rules;
    }
    getTable = function()
    {
        let header = [];
        header.push(" v PC\\User > ");
        for (let i=0;i<this.moves.length;i++)
        {
            header.push(this.moves[i]);
        }
        let body = [];
        for (let i=0;i<this.moves.length;i++)
        {
            let row = [];
            row.push(this.moves[i]);
            for (let j=0;j<this.rules[i].condition.length;j++)
            {
                if (this.rules[i].condition[j] == "Lose")
                {
                    row.push("Win");
                }
                else if(this.rules[i].condition[j] == "Win")
                {
                    row.push("Lose");
                }            
                else
                {
                    row.push(this.rules[i].condition[j]);
                }
            }
            body.push(row);
        }
        return (new WordTable(header, body)).string();
    }

}
class RulesDef
{
    constructor(moves)
    {
        this.moves = moves;
    }
    getRules = function()
    {
        let rules = [];
        for (let i=0;i<this.moves.length;i++)
        {
            rules.push({name: this.moves[i], condition: []});
            let loses = (this.moves.length - 1)/2;
            for (let j=0;j<this.moves.length;j++)
            {      
                if (i<j)
                {
                    if (loses>0)
                    {
                        rules[i].condition.push("Lose");
                        loses-=1;
                    }
                    else
                    {
                        rules[i].condition.push("Win");
                    }
                }
                else  
                if (i == j)
                {
                    rules[i].condition.push("Draw")
                }
                else
                {
                    if ((i > (this.moves.length - 1)/2) && (i+loses>this.moves.length-1))
                    {
                        if (loses > 0)
                        {
                            rules[i].condition.push("Lose");
                            loses-=1;
                        }
                        else
                        {
                            rules[i].condition.push("Win");
                        }
                    }
                    else
                    {
                        rules[i].condition.push("Win");
                    }
                }
            }
        }
        return rules;
    }
}
class CryptoKeyGen
{
    constructor(byteSize)
    {
        this.byteSize = byteSize;
    }
    getKey = function()
    {
        return SecureRandom.hex(32);
    }
}
class Hmac
{
    constructor(msg, key)
    {
        this.msg = msg;
        this.key = key;
    }
    getString = function()
    {
        return (hmac(this.msg, this.key)+'');
    }
}
function randomIntFromInterval(min, max) 
{ 
    return Math.floor(Math.random() * (max - min + 1) + min)
}
for (let i = 2; i < process.argv.length; i++) {
    if (args.includes(process.argv[i]))
    {
        console.log("Name of each move must be unique")
        flagError = true;
    }
    alph[process.argv[i]] = i-2;
    args.push(process.argv[i]);
}
if (args.length % 2 != 1)
{   
    console.log("Count of moves must be odd")
    flagError = true;
}
if (args.length < 3)
{
    console.log("Count of moves must be => 3");
    flagError = true;
}
if (flagError)
{
    console.log("Example of command use: node main.js rock Spock paper lizard scissors");
    return 0;
}

let rules = (new RulesDef(args)).getRules();
//let msg = "rock"; 
let msg = args[randomIntFromInterval(0, args.length-1)]; 
//let key = "BD9BE48334BB9C5EC263953DA54727F707E95544739FCE7359C267E734E380A2";
let key = (new CryptoKeyGen(32)).getKey().toUpperCase();
let hmacStr = (new Hmac(msg,key)).getString().toUpperCase();
while(true)
{
    console.log(`HMAC: ${hmacStr}`);
    for (let i= 0;i<args.length;i++)
    {
        console.log(i+1+" = "+args[i]);
    }
    console.log("0 = exit");
    console.log("? = help");
    let userMove = prompt("Enter your move: ");
    if (userMove == 0)
    {
        console.log(`Your move: exit`);
        return 0;
    }
    else
    if (userMove == '?')
    {
        console.log(`Your move: help`);   
        console.log((new TableHelpGenerate(args, rules)).getTable());
    }
    else
    {
        userMove-=1;
        userMove = args[userMove];
        if (typeof userMove == "undefined")
        {
            console.log(`Incorrect input. Try more.`);
            continue;
        }
        console.log(`Your move: ${userMove}`);
        console.log(`Computer move: ${msg}`);
        console.log(`You ${rules[alph[userMove]].condition[alph[msg]]}!`);
        console.log(`HMAC key: ${key}`);    
        return 0;
    }
}



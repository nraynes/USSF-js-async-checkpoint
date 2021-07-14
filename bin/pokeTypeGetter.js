#!/usr/bin/env node

//import modules
const yargs = require("yargs");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

//create parameter to take input path from user
const options = yargs
 .usage("Usage: -i <input>")
 .option("i", { alias: "input", describe: "The input file to search", type: "string", })
 .argv;

//resolve path and base greeting on whether or not a file path was provided
let strGreet;
let pokeListFile;
if (Boolean(options.input) !== false) {
    strGreet = 'Please wait a moment while I grab the data from the file you supplied.'
    pokeListFile = path.resolve(__dirname, `${options.input}`);
} else {
    //if no path is specified, a default path will be used
    strGreet = 'Since you did not supply a file, I am going to look through my test file.'
    pokeListFile = path.resolve(__dirname, '../file-to-search.txt');
}

//declare a function that greets the user and accepts a callback
var greeting = (callback) => {
    console.log('\nHello! Thank you for using my Pokemon type getter console application!\nPlease wait while I check for files...')
    setTimeout((callback) => {
        console.log(`\n${strGreet}`);
        setTimeout((callback) => {
            console.log('\n\tThank you so much!\n\tPlease hold...\n')
            //execute callback that grabs the data and displays it
            callback();
        }, 1500, callback);
    }, 2000, callback);
}

//display greeting and define callback
greeting(function() {
    //read the file based on the file path provided, if there is an error then terminate and log the error
    fs.readFile(`${pokeListFile}`, 'utf8', function(err, pokeList) {
        if (err) {
            console.error('There was an error reading that file.');
            console.error(err);
            return;
        } else {
            //split the contents of the file read into each line into an array
            pokeList = pokeList.split('\n');
            //declare an empty array to store promises
            let arrPromises = [];
            //check through all the items needing to be compared to the database
            for (let i=0;i < pokeList.length;i++) {
                //create a promise that will check the database for the appropriate information
                let objPromise = new Promise((resolve) => {
                    fetch(`https://pokeapi.co/api/v2/pokemon/${pokeList[i].toLowerCase()}`)
                        .then((result) => result.json())
                        .then((data) => {
                            //declare variable to hold type information of pokemon
                            let arrTypes = [];
                            //add each type for the current pokemon to the placeholder array
                            for (let p=0;p < data.types.length;p++) {arrTypes.push(data.types[p].type.name)};
                            //build a string variable to hold the name of the pokemon and all of its types
                            let strVal = `${pokeList[i][0].toUpperCase()}${pokeList[i].slice(1).toLowerCase()}: `;
                            strVal += `${arrTypes[0]}`;
                            if (arrTypes.length > 1) {
                                for (let k=1;k < arrTypes.length;k++) {
                                    strVal += `, ${arrTypes[k]}`;
                                };
                            };
                            resolve(strVal);
                        })
                        .catch((err) => {
                            //add an error statement if not found
                            resolve(`I can't seem to find ${pokeList[i].toLowerCase()}.`);
                        });
                });
                //add current promise to the array of promises 
                arrPromises.push(objPromise) 
            };
            //execute the promises in the array of promises then log the results
            Promise.all(arrPromises)
                .then((result) => {
                    console.log()
                    for (let i=0;i < result.length;i++) {
                        console.log(result[i]);
                    };
                    console.log(`\n\tGoodbye!\n`);
                })
        };
    });
});
 
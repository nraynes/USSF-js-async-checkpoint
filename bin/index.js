#!/usr/bin/env node

//import modules
const yargs = require("yargs");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const { callbackify } = require("util");

//create parameter to take input path from user
const options = yargs
 .usage("Usage: -i <url>")
 .option("i", { alias: "input", describe: "The input file to search", type: "string", })
 .argv;

//declare a function that greets the user and accepts a callback
var greeting = (callback) => {
    console.log('\nHello! Thank you for using my Pokemon type getter console application!')
    setTimeout((callback) => {
        console.log('Please wait a moment while I grab the data from the file you supplied.\nIf you did not supply a file path, then I will just use my own test file.');
        setTimeout((callback) => {
            console.log('\n\tThank you so much!\n\tPlease hold...\n')
            callback();
        }, 1500, callback);
    }, 2000, callback);
}

//resolve path and create variable for database
let pokeListFile;
if (Boolean(options.input) !== false) {
    pokeListFile = path.resolve(__dirname, `${options.input}`);
} else {
    //if no path is specified, a default path will be used
    pokeListFile = path.resolve(__dirname, '../file-to-search.txt');
}
const pokeData = 'https://pokeapi.co/api/v2/pokemon'

//create promise to asyncronously gather the appropriate data and format it
let readAndFormat = new Promise((resolve,reject) => {
    //read the file based on the file path provided, if there is an error then terminate and log the error
    fs.readFile(`${pokeListFile}`, 'utf8', function(err, pokeList) {
        if (err) {
            console.error('There was an error reading that file.');
            console.error(err);
            return;
        } else {
            //split the contents of the file read into each line into an array.
            pokeList = pokeList.split('\n');
            //acquire the data from the databas asynchronously
            fetch(pokeData)
                .then((result) => {
                    //check to see if the database was able to be reached.
                    if (result.ok === true) {
                        //conver database results to json and pass to next .then
                        return result.json();
                    } else {
                        throw new Error('There was a problem trying to access the pokemon database.');
                    };
                })
                .then((data) => {
                    //declare initial placeholder variables and array with type objects for pokemon names.
                    let arrObjects = data.results;
                    var arrTypes = [];
                    let doesContain;
                    //create an asynchronous function that gets the types for each pokemon and formats it
                    async function getFetch() {
                        //check through all the items needing to be compared to the database
                        for (let i=0;i < pokeList.length;i++) {
                            //set value to all lowercase for compatability
                            pokeList[i] = pokeList[i].toLowerCase();
                            //set boolean variable to signify whether a match was found
                            doesContain = false;
                            //check through each pokemon in the database
                            for (let j=0;j < arrObjects.length;j++) {
                                if (pokeList[i] === arrObjects[j].name) {
                                    //if a match is found, set boolean to true
                                    doesContain = true;
                                    //wait while fetching the information from the database regarding a specific pokemon
                                    await fetch(arrObjects[j].url)
                                        //convert information to json
                                        .then((result) => result.json())
                                        .then((data) => {
                                            //declare variable to hold type information of pokemon and declare init variable
                                            let arrObjTypes = data.types;
                                            let arrCurTypes = [];
                                            //apply each type for the pokemon to the placeholder
                                            for (let p=0;p < arrObjTypes.length;p++) {
                                                arrCurTypes.push(arrObjTypes[p].type.name)
                                            };
                                            //format a string variable to hold the name of the pokemon and all of its types
                                            let curStr = `${pokeList[i]}: `;
                                            curStr += `${arrCurTypes[0]}`;
                                            if (arrCurTypes.length > 1) {
                                                for (let k=1;k < arrCurTypes.length;k++) {
                                                    curStr += `, ${arrCurTypes[k]}`;
                                                };
                                            };
                                            //push the current string variable to the resultant array
                                            arrTypes.push(curStr);
                                        })
                                };
                            };
                            //if no match is found, output an error message to the resultant list
                            if (doesContain === false) {
                                arrTypes.push(`I can't seem to find ${pokeList[i]} in my database.`);
                            }
                        }
                        //resolve the current promise after all async functions have been awaited for
                        resolve(arrTypes);
                    };
                    //call async function
                    getFetch()
                })
                //catch any errors from the promise
                .catch(function(err) {
                    console.error(err);
                });
        };
    });
});
//display greeting
greeting(function() {
    //execute promise, then display the results
    readAndFormat.then((result) => {
        console.log()
        for (let i=0;i < result.length;i++) {
            console.log(result[i]);
        };
        console.log(`\n\tGoodbye!\n`);
    });
    return;
});
 
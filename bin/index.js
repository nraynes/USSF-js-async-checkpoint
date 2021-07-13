#!/usr/bin/env node

const yargs = require("yargs");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const options = yargs
 .usage("Usage: -i <url>")
 .option("i", { alias: "input", describe: "The input file to search", type: "string", demandOption: true })
 .argv;

 const pokeListFile = path.resolve(__dirname, `${options.input}`);
 const pokeData = 'https://pokeapi.co/api/v2/pokemon'

fs.readFile(`${pokeListFile}`, 'utf8', function(err, pokeList) {
    if (err) {
        console.error('There was an error reading that file.');
        console.error(err);
        return;
    } else {
        pokeList = pokeList.split('\n')
        //the list here has remained in tact so far. This is now an array of pokemon names.
        fetch(pokeData)
            .then((result) => {
                if (result.ok === true) {
                    return result.json();
                } else {
                    throw new Error('There was a problem trying to access the pokemon database.');
                };
            })
            .then((data) => {
                //this is where most of the sorting and work is done.
                let arrObjects = data.results;

                let arrTypes = [];
                let doesContain;
                for (let i=0;i < pokeList.length;i++) {
                    doesContain = false;
                    for (let j=0;j < arrObjects.length;j++) {
                        if (pokeList[i] === arrObjects[j].name) {
                            doesContain = true;
                            fetch(arrObjects[j].url)
                                .then((result) => result.json())
                                .then((data) => console.log(data));
                                .catch((err) => console.error(err));
                            arrTypes.push(`${pokeList[i]}: `)
                        }
                    }
                    if (doesContain === false) {
                        arrTypes.push(`I can't seem to find ${pokeList[i]} in my database.`);
                    }
                }
                console.log();
                for (let i=0;i < arrTypes.length;i++) {
                    console.log(arrTypes[i]);
                };
            })
            .catch(function(err) {
                console.error(err);
            });
    };
});



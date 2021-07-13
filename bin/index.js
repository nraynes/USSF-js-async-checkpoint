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
 let readAndFormat = new Promise((resolve,reject) => {
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
                    var arrTypes = [];
                    let doesContain;
                    async function getFetch() {
                        for (let i=0;i < pokeList.length;i++) {
                            doesContain = false;
                            for (let j=0;j < arrObjects.length;j++) {
                                if (pokeList[i] === arrObjects[j].name) {
                                    doesContain = true;
                                    await fetch(arrObjects[j].url)
                                        .then((result) => result.json())
                                        .then((data) => {
                                            let arrObjTypes = data.types;
                                            let arrCurTypes = [];
                                            for (let p=0;p < arrObjTypes.length;p++) {
                                                arrCurTypes.push(arrObjTypes[p].type.name)
                                            };
                                            let curStr = `${pokeList[i]}: `;
                                            curStr += `${arrCurTypes[0]}`;
                                            if (arrCurTypes.length > 1) {
                                                for (let k=1;k < arrCurTypes.length;k++) {
                                                    curStr += `, ${arrCurTypes[k]}`;
                                                };
                                            };
                                            arrTypes.push(curStr);
                                        });
                                };
                            };
                            if (doesContain === false) {
                                arrTypes.push(`I can't seem to find ${pokeList[i]} in my database.`);
                            }
                        }
                        resolve(arrTypes);
                    };
                    getFetch()
                })
                .catch(function(err) {
                    console.error(err);
                });
        };
    });
 })
 readAndFormat.then((result) => {
    console.log()
    for (let i=0;i < result.length;i++) {
        console.log(result[i]);
    };
    console.log();
  });
const cheerio = require('cheerio');
var express = require('express'); 
const axios = require('axios');
const fs = require('fs');
var bodyParser = require('body-parser');
var app     = express(); 

app.set('view engine' , 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

const writeStream = fs.createWriteStream('data.csv');

function scrapping(productURL){
    const dataa = [];
    return new Promise((resolve) => {
      axios.get(productURL)
      .then((response) => {
        const $ = cheerio.load(response.data);
                // Load the review comments
                const reviews = $('.audience-reviews__review-wrap');
                    reviews.each((i, w) => {
                        // Find the review comments
                        const textReview = $(w).find('.audience-reviews__review').text();
                        // Write Row To CSV
                        writeStream.write(`${textReview}\n`);
                        //pushing data in array
                        dataa.push(`${textReview}` );
                    });
            console.log(dataa);
            // console.log('data saved!');
            resolve(dataa)
              
      }).catch(function (err) {
        console.log(err);
    })
 })
}

const mlOutput = async (arrayData)=>{
    const temp = arrayData.map(elem => {
        return axios.get('http://195121c83135.ngrok.io/', {
            params: {
            query:elem
            }
        }).then ((resp)=> {
            return resp.data;
        }).catch((error)=>{return error});
    })

    const values = await Promise.all(temp)
    // console.log(values)
    const result = [];
    values.forEach(val => {
        result.push(val);
    })
    return [result];
};

async function getoutput(productURL){
    const dataa = await scrapping(productURL);
    let speak = '';
    const [result] = await mlOutput(dataa);
    console.log(result);
    let countPositives = 0;
    let countNegatives = 0;
    for(let j=0; j<result.length; j++){
      if (result[j] == 'positive'){
        countPositives += 1;
      }else{
        countNegatives += 1;
      }
    }
    console.log(countPositives, countNegatives);
    if (countPositives > countNegatives){
      let percentGood = countPositives * 100/(countPositives+countNegatives)
      console.log("its a good movie it has "+ percentGood + " percent of good reviews") ;
    }else{
      let percentBad = countNegatives * 100/(countPositives+countNegatives)
      console.log("its a bad movie it has "+ percentBad + " percent of bad reviews") ;
    }
   
};

let movieName = 'rockstar'
getoutput(`https://www.rottentomatoes.com/m/${movieName}/reviews?type=user`)
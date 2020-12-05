const AWS = require('aws-sdk');
const cheerio = require('cheerio');
const axios = require('axios');



const s3SigV4Client = new AWS.S3({
    signatureVersion: 'v4',
    region: process.env.S3_PERSISTENCE_REGION
});

module.exports.getS3PreSignedUrl = function getS3PreSignedUrl(s3ObjectKey) {

    const bucketName = process.env.S3_PERSISTENCE_BUCKET;
    const s3PreSignedUrl = s3SigV4Client.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: s3ObjectKey,
        Expires: 60*1 // the Expires is capped for 1 minute
    });
    console.log(`Util.s3PreSignedUrl: ${s3ObjectKey} URL ${s3PreSignedUrl}`);
    return s3PreSignedUrl;

}
//custom function
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
                        //pushing data in array
                        dataa.push(`${textReview}` );
                    });
            // console.log(dataa);
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
    let speak = "" ;
    const [result] = await mlOutput(dataa);
    // console.log(result);
    let countPositives = 0;
    let countNegatives = 0;
    for(let j=0; j<result.length; j++){
      if (result[j] === 'positive'){
        countPositives += 1;
      }else{
        countNegatives += 1;
      }
    }
    // console.log(countPositives, countNegatives);
    if (countPositives > countNegatives){
      let percentGood = countPositives * 100/(countPositives+countNegatives)
      speak += "is a good movie it has "+ percentGood + " percent of good reviews";
    }else{
      let percentBad = countNegatives * 100/(countPositives+countNegatives)
       speak += "is a bad movie it has "+ percentBad + " percent of bad reviews";
    }
    return speak;
}


module.exports =  getoutput;


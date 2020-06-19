const fetch = require('node-fetch');


module.exports = async function(userID, accessToken) {

    try {

        let urlGraphFacebook = `https://graph.facebook.com/v2.11/${userID}/?fields=id,email,name&access_token=${accessToken}`;

        let result = await fetch(urlGraphFacebook);
        let json = await result.json();
        console.log(json);

        if (!json.email){
            return Promise.reject({ 'err': "Your FaceBook account is not verified."});
        }

        return Promise.resolve(json.email)

    } catch (err) {
        console.log(err);
        return Promise.reject(err);
    }

}
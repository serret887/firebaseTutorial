import * as functions from 'firebase-functions';

export const spikeyGreetings = functions.https.onRequest((req, resp)=> {
    resp.send("Greetings my friend");
})


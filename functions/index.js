const firebaseFunctions = require(`firebase-functions`);
const admin = require(`firebase-admin`);
const firebaseHelper = require(`firebase-functions-helper`);
const express = require(`express`);
const bodyParser = require(`body-parser`);
const Fuse = require(`fuse.js/dist/fuse`);

admin.initializeApp(firebaseFunctions.config().firebase);

let db = admin.firestore();

let app = express();
let main = express();

main.use(`/api/v1`, app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

const projectCollection = `sc-asset-search`;

exports.realestateApi = firebaseFunctions.https.onRequest(main);

app.get(`/projects`, (req, res) => {
  let sentence = req.query.search;
  firebaseHelper.firestore
    .backup(db, projectCollection)
    .then(data => {
      let docs = data[projectCollection];
      const newData = [];
        for (const key in docs) {
            if (docs.hasOwnProperty(key)) {
              newData.push({
                id: key,
                data: docs[key]
              });
            }
        }
        let options = {
          shouldSort: true,
          threshold: 0.4,
          location: 0,
          distance: 400,
          maxPatternLength: 3000,
          minMatchCharLength: 1,
          keys: [
            "data.projectNameEn",
            "data.projectNameTh",
            "data.attributes.keywords.keywordsTh",
            "data.attributes.keywords.keywordsEn"
          ]
        };
        let fuse = new Fuse(newData, options);
        let result = fuse.search(sentence);
        return res.status(200).send(result);
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).send(error);
    });
});

app.get(`/projects`, (req,res) => {
  let id = req.query.id;
  firebaseHelper.firestore
    .getDocument(db, projectCollection, id)
    .then((doc) => {
      console.info(doc , id);
      return res.status(200).json(doc);
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json(error);
    });
});

app.post(`/projects`, (req,res) => {
  firebaseHelper.firestore
    .createNewDocument(db, projectCollection, req.body)
    .then((doc) => {
      return res.status(200).json(doc);
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json(error);
    });
});

app.get(`/allProjects`, (req, res) => {
  firebaseHelper.firestore
    .backup(db, projectCollection)
    .then(data => {
      let docs = data[projectCollection];
      const newData = [];
        for (const key in docs) {
            if (docs.hasOwnProperty(key)) {
              newData.push({
                id: key,
                data: docs[key]
              });
            }
        }
        return res.status(200).send(newData);
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).send(error);
    });
});
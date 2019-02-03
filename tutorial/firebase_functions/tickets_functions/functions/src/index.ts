import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as vision from "@google-cloud/vision";

process.env.GCLOUD_PROJECT = "tutorial-6efb2";

admin.initializeApp();

const settings = { /* your settings... */ timestampsInSnapshots: true };

const db: FirebaseFirestore.Firestore = admin.firestore();
db.settings(settings);

export const raiseTickets = functions.https.onRequest((req, res) => {
  const user_name: string = req.body.userId;
  const issue: string = req.body.complaint;

  const ticket_id = Date.now().toString();

  const docRef = db.collection("tickets").doc();

  const addDoc = docRef.set({
    id: ticket_id,
    user_id: user_name,
    complaint: issue
  });

  res.setHeader("Content-Type", "text/plain");
  res.write(`A ticket was created with id ${ticket_id}`);
  res.end();
  return addDoc;
});

export const createProductLabels = functions.firestore
  .document("products_info/{prodId}")
  .onCreate((snap, context) => {
    const newDoc: FirebaseFirestore.DocumentData | undefined = snap.data();
    const filePath = newDoc.img_path;
    const docId = snap.id;

    const client = new vision.ImageAnnotatorClient();

   const visionPromise = client
      .labelDetection(filePath)
      .then((results: { labelAnnotations: any[] }[]) => {
        const detections: any[] = results[0].labelAnnotations;
        const docRef = db.collection("products_info").doc(docId);
        const labels = detections.map(label => label.description);
        return docRef.update({ img_labels: labels });
      });
    return Promise.resolve(visionPromise);
  });

import { Timestamp as FirebaseTimestamp } from "firebase-admin/firestore";
import { Timestamp as FirestoreTimestamp } from "firebase/firestore";

export type Timestamp = FirebaseTimestamp | FirestoreTimestamp;

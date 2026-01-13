import "dotenv/config";
import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { r2Client } from "../lib/r2.js";
import env from "../config/env.config.js";

async function emptyBucket() {
  const bucketName = env.r2.bucketName;
  console.log(`Emptying bucket: ${bucketName}...`);

  let continuationToken: string | undefined = undefined;

  do {
    const listParams: any = {
      Bucket: bucketName,
      ContinuationToken: continuationToken,
    };

    const listCommand = new ListObjectsV2Command(listParams);
    const listResponse = await r2Client.send(listCommand);

    if (listResponse.Contents && listResponse.Contents.length > 0) {
      const objectsToDelete = listResponse.Contents.map((obj) => ({
        Key: obj.Key,
      }));

      console.log(`Deleting ${objectsToDelete.length} objects...`);

      const deleteParams = {
        Bucket: bucketName,
        Delete: {
          Objects: objectsToDelete,
          Quiet: true,
        },
      };

      const deleteCommand = new DeleteObjectsCommand(deleteParams);
      await r2Client.send(deleteCommand);
    } else {
      console.log("No objects found to delete in this batch.");
    }

    continuationToken = listResponse.NextContinuationToken;
  } while (continuationToken);

  console.log("Bucket emptied successfully.");
}

emptyBucket().catch((err) => {
  console.error("Error emptying bucket:", err);
  process.exit(1);
});

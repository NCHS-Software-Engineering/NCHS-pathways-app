import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export const S3_PATHWAYS_PREFIX = "pathways/";
export const S3_IMAGES_PREFIX = "endorsements/images/";

function getS3Client(): S3Client {
  return new S3Client({
    region: process.env.S3_REGION ?? "us-east-1",
  });
}

function getBucketName(): string {
  const bucket = process.env.S3_BUCKET_NAME;
  if (!bucket) throw new Error("S3_BUCKET_NAME environment variable is not set.");
  return bucket;
}

export async function s3UploadFile(key: string, body: Buffer, contentType: string): Promise<void> {
  const client = getS3Client();
  const bucket = getBucketName();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function s3DownloadFile(key: string): Promise<Buffer> {
  const client = getS3Client();
  const bucket = getBucketName();

  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  const chunks: Uint8Array[] = [];
  const stream = response.Body as AsyncIterable<Uint8Array>;
  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

export async function s3DeleteFile(key: string): Promise<void> {
  const client = getS3Client();
  const bucket = getBucketName();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

export async function s3FileExists(key: string): Promise<boolean> {
  const client = getS3Client();
  const bucket = getBucketName();

  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (error) {
    const httpStatus =
      error instanceof Error && "$metadata" in error
        ? (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode
        : undefined;
    if (httpStatus === 404 || (error instanceof Error && error.name === "NotFound")) return false;
    throw error;
  }
}

export async function s3ListFiles(prefix: string): Promise<string[]> {
  const client = getS3Client();
  const bucket = getBucketName();

  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );

    for (const object of response.Contents ?? []) {
      if (object.Key) keys.push(object.Key);
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return keys;
}

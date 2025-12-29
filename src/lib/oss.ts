import "server-only";
import crypto from "crypto";

type OssConfig = {
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  endpoint: string;
  region: string | null;
  host: string;
  publicBaseUrl: string;
};

const DEFAULT_MAX_UPLOAD_BYTES = 3 * 1024 * 1024;

const normalizeEndpoint = (value: string) =>
  value.replace(/^https?:\/\//, "").replace(/\/+$/, "");

const normalizeBaseUrl = (value: string) =>
  value.replace(/\/+$/, "");

const buildHost = (bucket: string, endpoint: string) =>
  `https://${bucket}.${endpoint}`;

export const getOssConfig = (): OssConfig => {
  const accessKeyId = process.env.OSS_ACCESS_KEY_ID ?? "";
  const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET ?? "";
  const bucket = process.env.OSS_BUCKET ?? "";
  const endpointRaw = process.env.OSS_ENDPOINT ?? "";
  const endpoint = normalizeEndpoint(endpointRaw);
  const region = process.env.OSS_REGION ?? null;

  if (!accessKeyId || !accessKeySecret || !bucket || !endpoint) {
    throw new Error("OSS configuration is missing.");
  }

  const host = buildHost(bucket, endpoint);
  const publicBaseUrl = normalizeBaseUrl(
    process.env.OSS_PUBLIC_BASE_URL || host
  );

  return {
    accessKeyId,
    accessKeySecret,
    bucket,
    endpoint,
    region,
    host,
    publicBaseUrl,
  };
};

type PolicyOptions = {
  key: string;
  maxBytes?: number;
  contentTypePrefix?: string;
};

export const createOssPolicy = ({
  key,
  maxBytes = DEFAULT_MAX_UPLOAD_BYTES,
  contentTypePrefix = "image/",
}: PolicyOptions) => {
  const config = getOssConfig();
  const expireAt = new Date(Date.now() + 5 * 60 * 1000);
  const policy = {
    expiration: expireAt.toISOString(),
    conditions: [
      ["eq", "$key", key],
      ["starts-with", "$Content-Type", contentTypePrefix],
      ["content-length-range", 0, maxBytes],
      { bucket: config.bucket },
    ],
  };

  const policyBase64 = Buffer.from(JSON.stringify(policy)).toString("base64");
  const signature = crypto
    .createHmac("sha1", config.accessKeySecret)
    .update(policyBase64)
    .digest("base64");

  return {
    host: config.host,
    accessKeyId: config.accessKeyId,
    policy: policyBase64,
    signature,
    expire: Math.floor(expireAt.getTime() / 1000),
    maxBytes,
  };
};

export const buildOssObjectUrl = (key: string) => {
  const { publicBaseUrl } = getOssConfig();
  return `${publicBaseUrl}/${key}`;
};

export const OSS_MAX_UPLOAD_BYTES = DEFAULT_MAX_UPLOAD_BYTES;

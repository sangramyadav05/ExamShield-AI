import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_DB_NAME = 'examshield';
const DEFAULT_LOCAL_HOST = 'mongodb://127.0.0.1:27017';

const buildAtlasFallbackUri = (mongoUri, dbName) => {
  let url;

  try {
    url = new URL(mongoUri);
  } catch {
    return null;
  }

  if (url.protocol !== 'mongodb+srv:') {
    return null;
  }

  const [clusterName, ...domainParts] = url.hostname.split('.');

  if (!clusterName || domainParts.length === 0) {
    return null;
  }

  const domain = domainParts.join('.');
  const safeDecode = (value) => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };
  const username = safeDecode(url.username);
  const password = safeDecode(url.password);
  const credentials = url.username
    ? `${encodeURIComponent(username)}${password ? `:${encodeURIComponent(password)}` : ''}@`
    : '';
  const seeds = ['00', '01', '02']
    .map((nodeId) => `${clusterName}-shard-00-${nodeId}.${domain}:27017`)
    .join(',');
  const params = new URLSearchParams(url.search);

  params.set('tls', 'true');
  if (!params.has('authSource')) {
    params.set('authSource', 'admin');
  }
  if (!params.has('retryWrites')) {
    params.set('retryWrites', 'true');
  }
  if (!params.has('w')) {
    params.set('w', 'majority');
  }

  return `mongodb://${credentials}${seeds}/${dbName}?${params.toString()}`;
};

const buildLocalUri = (localUri, dbName) => {
  if (!localUri) {
    return null;
  }

  let url;

  try {
    url = new URL(localUri);
  } catch {
    return null;
  }

  if (url.protocol !== 'mongodb:') {
    return null;
  }

  if (!url.pathname || url.pathname === '/') {
    url.pathname = `/${dbName}`;
  }

  return url.toString();
};

const connectWithUri = async (uri, dbName) => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  return mongoose.connect(uri, {
    dbName,
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 5000),
  });
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME || DEFAULT_DB_NAME;
  const localUri = buildLocalUri(
    process.env.MONGO_LOCAL_URI || `${DEFAULT_LOCAL_HOST}/${dbName}`,
    dbName,
  );

  const candidates = [];

  if (mongoUri) {
    candidates.push({ label: 'primary', uri: mongoUri });

    const atlasFallbackUri = buildAtlasFallbackUri(mongoUri, dbName);

    if (atlasFallbackUri && atlasFallbackUri !== mongoUri) {
      candidates.push({ label: 'atlas-direct', uri: atlasFallbackUri });
    }
  }

  if (localUri && !candidates.some((candidate) => candidate.uri === localUri)) {
    candidates.push({ label: 'local', uri: localUri });
  }

  if (!candidates.length) {
    throw new Error('No MongoDB connection URI is configured');
  }

  const errors = [];

  for (const candidate of candidates) {
    try {
      const conn = await connectWithUri(candidate.uri, dbName);
      console.log(`MongoDB Connected (${candidate.label}): ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (error) {
      errors.push(`${candidate.label}: ${error.message}`);
    }
  }

  throw new Error(`Could not connect to MongoDB. Tried: ${errors.join(' | ')}`);
};

export default connectDB;

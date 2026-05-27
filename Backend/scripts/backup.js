/**
 * @desc Database Backup Script (Basic Level)
 * Exports all MongoDB collections to JSON files.
 * Usage: node scripts/backup.js
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const BACKUP_DIR = path.join(__dirname, '..', 'backups');

const backupDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for backup...');

    // Create backup directory
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFolder = path.join(BACKUP_DIR, `backup-${timestamp}`);
    fs.mkdirSync(backupFolder, { recursive: true });

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = mongoose.connection.db.collection(collectionName);
      const documents = await collection.find({}).toArray();

      const filePath = path.join(backupFolder, `${collectionName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));

      console.log(`  ✔ Backed up ${collectionName}: ${documents.length} documents`);
    }

    console.log(`\n✅ Backup completed successfully!`);
    console.log(`   Location: ${backupFolder}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
};

backupDatabase();

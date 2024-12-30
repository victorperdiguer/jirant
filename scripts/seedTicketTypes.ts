import mongoose from 'mongoose';
import TicketType from '../models/TicketType';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jirant';

async function seedTicketTypes() {
  await mongoose.connect(MONGO_URI);

  const defaultTypes = [
    'Epic',
    'Story',
    'Task',
    'Subtask',
    'UXUI Task',
    'Bug',
    'Analysis Task',
  ];

  for (const type of defaultTypes) {
    const exists = await TicketType.findOne({ name: type });
    if (!exists) {
      await TicketType.create({ name: type, createdBy: null });
    }
  }

  console.log('Ticket types seeded successfully.');
  mongoose.connection.close();
}

seedTicketTypes().catch((err) => {
  console.error(err);
  mongoose.connection.close();
});
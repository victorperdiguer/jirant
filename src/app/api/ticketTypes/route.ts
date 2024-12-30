import { NextApiRequest, NextApiResponse } from 'next';
import {connectToDatabase} from '../../../../lib/mongodb';
import TicketType from '../../../../models/TicketType';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  const { method } = req;

  switch (method) {
    case 'GET': // Fetch all ticket types
      try {
        const ticketTypes = await TicketType.find();
        res.status(200).json(ticketTypes);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ticket types' });
      }
      break;

    case 'POST': // Create a new ticket type
      try {
        const { name, createdBy } = req.body;
        const ticketType = await TicketType.create({ name, createdBy });
        res.status(201).json(ticketType);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create ticket type' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
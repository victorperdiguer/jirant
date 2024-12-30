import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../../lib/mongodb';
import TicketRelationship from '../../../../models/TicketRelationship';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  const { method } = req;

  switch (method) {
    case 'GET': // Fetch relationships for a given ticket
      try {
        const { ticketId } = req.query;
        const relationships = await TicketRelationship.find({
          ticket1: ticketId,
        }).populate('ticket2');
        res.status(200).json(relationships);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ticket relationships' });
      }
      break;

    case 'POST': // Create a relationship
      try {
        const { ticket1, ticket2, relationshipType } = req.body;
        const relationship = await TicketRelationship.create({
          ticket1,
          ticket2,
          relationshipType,
        });
        res.status(201).json(relationship);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create ticket relationship' });
      }
      break;

    case 'DELETE': // Delete a relationship
      try {
        const { ticket1, ticket2 } = req.body;
        await TicketRelationship.deleteOne({ ticket1, ticket2 });
        res.status(204).end();
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete ticket relationship' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
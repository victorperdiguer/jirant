import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../../lib/mongodb';
import Ticket from '../../../../models/Ticket';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const tickets = await Ticket.find().populate('ticketType').populate('relatedTickets');
        res.status(200).json(tickets);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tickets' });
      }
      break;

    case 'POST':
      try {
        const ticket = await Ticket.create(req.body);
        res.status(201).json(ticket);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create ticket' });
      }
      break;

    case 'PUT': // Update a ticket
      try {
        const { id, ...updateData } = req.body;
        const updatedTicket = await Ticket.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json(updatedTicket);
      } catch (error) {
        res.status(500).json({ error: 'Failed to update ticket' });
      }
      break;

    case 'DELETE': // Delete a ticket
      try {
        const { id } = req.body;
        await Ticket.findByIdAndDelete(id);
        res.status(204).end();
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete ticket' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { table } = req.query;
  const filePath = path.join(process.cwd(), 'database', `${table}.json`);

  if (req.method === 'GET') {
    try {
      if (!fs.existsSync(filePath)) {
        // Return empty structure if file doesn't exist
        const emptyData = getEmptyData(table);
        return res.status(200).json(emptyData);
      }
      
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContents);
      res.status(200).json(data);
    } catch (error) {
      console.error(`Error reading ${table} database:`, error);
      res.status(500).json({ error: `Failed to read ${table} database` });
    }
  } else if (req.method === 'POST') {
    try {
      const data = req.body;
      
      // Ensure database directory exists
      const dbDir = path.join(process.cwd(), 'database');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      res.status(200).json({ success: true, message: `${table} database updated` });
    } catch (error) {
      console.error(`Error writing ${table} database:`, error);
      res.status(500).json({ error: `Failed to write ${table} database` });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function getEmptyData(table) {
  switch (table) {
    case 'users':
      return { users: [] };
    case 'profiles':
      return { profiles: [] };
    case 'ratings':
      return { ratings: [] };
    case 'reviews':
      return { reviews: [] };
    case 'invitations':
      return { invitations: [] };
    default:
      return {};
  }
} 
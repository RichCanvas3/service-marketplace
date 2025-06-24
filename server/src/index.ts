import { config } from 'dotenv'
config()
import express from 'express'
import cors from 'cors'
import mcpRoutes from './routes/mcp.js'
import serviceContractRoutes from './routes/serviceContract.js'



const app = express()
app.use(cors())
app.use(express.json())

app.use('/mcp', mcpRoutes)
app.use('/service-contract', serviceContractRoutes)

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ success: true, message: 'Server is running!', timestamp: new Date().toISOString() });
});

app.listen(3001, () => console.log('MCP Server running on http://localhost:3001'))

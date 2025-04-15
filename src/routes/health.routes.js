const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Simple health check for load balancers and monitoring tools
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: UP
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                 host:
 *                   type: string
 */
router.get('/', healthController.getHealth);

/**
 * @swagger
 * /health/status:
 *   get:
 *     summary: Detailed server status
 *     description: Provides detailed information about server health and resources
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed server status information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 server:
 *                   type: object
 *                 process:
 *                   type: object
 *                 database:
 *                   type: object
 */
router.get('/status', healthController.getStatus);

module.exports = router;
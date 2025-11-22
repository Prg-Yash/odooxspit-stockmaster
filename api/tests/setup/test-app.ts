import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from '../../src/routes/auth.route';
import { userRouter } from '../../src/routes/user.route';
import { warehouseRouter } from '../../src/routes/warehouse.route';
import { productRouter } from '../../src/routes/product.route';
import { stockRouter } from '../../src/routes/stock.route';
import vendorRouter from '../../src/routes/vendor.route';
import receiptRouter from '../../src/routes/receipt.route';
import deliveryRouter from '../../src/routes/delivery.route';
import moveHistoryRouter from '../../src/routes/move-history.route';

/**
 * Create a test Express application with all routes configured
 * This mimics the production server setup without starting an actual HTTP server
 */
export function createTestApp(): Express {
    const app = express();

    // Middleware
    app.use(helmet());
    app.use(
        cors({
            origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            credentials: true,
        })
    );
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    // Health check routes
    app.get('/', (req, res) => {
        res.json({
            success: true,
            message: 'Test API is running',
            version: '1.0.0',
        });
    });

    app.get('/health', (req, res) => {
        res.json({
            success: true,
            message: 'Server is healthy',
            timestamp: new Date().toISOString(),
        });
    });

    // API Routes
    app.use('/auth', authRouter);
    app.use('/user', userRouter);
    app.use('/warehouses', warehouseRouter);
    app.use('/products', productRouter);
    app.use('/stocks', stockRouter);
    app.use('/vendors', vendorRouter);
    app.use('/receipts', receiptRouter);
    app.use('/deliveries', deliveryRouter);
    app.use('/moves', moveHistoryRouter);

    // 404 handler
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Route not found',
        });
    });

    // Global error handler
    app.use(
        (
            err: any,
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            console.error('Test error handler:', err);
            res.status(err.status || 500).json({
                success: false,
                message: err.message || 'Internal server error',
            });
        }
    );

    return app;
}

import { POST } from '@/app/api/midtrans/webhook/route';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
    prisma: {
        purchase: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        enrollment: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    },
}));

// Mock environment variables
process.env.MIDTRANS_SERVER_KEY = 'test-server-key';

describe('Midtrans Webhook API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const createSignature = (orderId: string, statusCode: string, grossAmount: string) => {
        return crypto
            .createHash('sha512')
            .update(orderId + statusCode + grossAmount + process.env.MIDTRANS_SERVER_KEY)
            .digest('hex');
    };

    it('jika server key tidak ada, return 500', async () => {
        const originalKey = process.env.MIDTRANS_SERVER_KEY;
        delete process.env.MIDTRANS_SERVER_KEY;

        const req = {
            json: async () => ({}),
        } as unknown as Request;

        const response = await POST(req);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json.message).toContain('Server API key is missing');

        process.env.MIDTRANS_SERVER_KEY = originalKey;
    });

    it('jika signature tidak valid, return 403', async () => {
        const req = {
            json: async () => ({
                order_id: 'purchase_123',
                status_code: '200',
                gross_amount: '50000',
                signature_key: 'invalid_signature',
                transaction_status: 'settlement',
            }),
        } as unknown as Request;

        const response = await POST(req);
        const json = await response.json();

        expect(response.status).toBe(403);
        expect(json.message).toContain('Invalid signature');
    });

    it('jika purchase tidak ditemukan, return 404', async () => {
        const orderId = 'purchase_123';
        const statusCode = '200';
        const grossAmount = '50000';
        const signatureKey = createSignature(orderId, statusCode, grossAmount);

        (prisma.purchase.findUnique as jest.Mock).mockResolvedValue(null);

        const req = {
            json: async () => ({
                order_id: orderId,
                status_code: statusCode,
                gross_amount: grossAmount,
                signature_key: signatureKey,
                transaction_status: 'settlement',
            }),
        } as unknown as Request;

        const response = await POST(req);
        const json = await response.json();

        expect(response.status).toBe(404);
        expect(json.message).toContain('Order not found');
    });

    it('sukses update status settlement dan auto-enroll user', async () => {
        const orderId = 'purchase_123';
        const statusCode = '200';
        const grossAmount = '50000';
        const signatureKey = createSignature(orderId, statusCode, grossAmount);

        (prisma.purchase.findUnique as jest.Mock).mockResolvedValue({
            id: 'purchase_123',
            userId: 'user_123',
            courseId: 'course_123',
        });

        (prisma.enrollment.findUnique as jest.Mock).mockResolvedValue(null);

        const req = {
            json: async () => ({
                order_id: orderId,
                status_code: statusCode,
                gross_amount: grossAmount,
                signature_key: signatureKey,
                transaction_status: 'settlement',
                payment_type: 'credit_card',
            }),
        } as unknown as Request;

        const response = await POST(req);
        const json = await response.json();

        expect(prisma.purchase.update).toHaveBeenCalledWith({
            where: { id: orderId },
            data: {
                status: 'settlement',
                paymentType: 'credit_card',
            },
        });

        expect(prisma.enrollment.create).toHaveBeenCalledWith({
            data: {
                userId: 'user_123',
                courseId: 'course_123',
            },
        });

        expect(json.received).toBe(true);
    });

    it('status capture dengan fraud accept, auto-enroll user', async () => {
        const orderId = 'purchase_123';
        const statusCode = '200';
        const grossAmount = '50000';
        const signatureKey = createSignature(orderId, statusCode, grossAmount);

        (prisma.purchase.findUnique as jest.Mock).mockResolvedValue({
            id: 'purchase_123',
            userId: 'user_123',
            courseId: 'course_123',
        });

        (prisma.enrollment.findUnique as jest.Mock).mockResolvedValue(null);

        const req = {
            json: async () => ({
                order_id: orderId,
                status_code: statusCode,
                gross_amount: grossAmount,
                signature_key: signatureKey,
                transaction_status: 'capture',
                fraud_status: 'accept',
                payment_type: 'credit_card',
            }),
        } as unknown as Request;

        const response = await POST(req);

        expect(prisma.enrollment.create).toHaveBeenCalled();
    });

    it('status capture dengan fraud challenge, tidak auto-enroll', async () => {
        const orderId = 'purchase_123';
        const statusCode = '200';
        const grossAmount = '50000';
        const signatureKey = createSignature(orderId, statusCode, grossAmount);

        (prisma.purchase.findUnique as jest.Mock).mockResolvedValue({
            id: 'purchase_123',
            userId: 'user_123',
            courseId: 'course_123',
        });

        const req = {
            json: async () => ({
                order_id: orderId,
                status_code: statusCode,
                gross_amount: grossAmount,
                signature_key: signatureKey,
                transaction_status: 'capture',
                fraud_status: 'challenge',
                payment_type: 'credit_card',
            }),
        } as unknown as Request;

        const response = await POST(req);

        expect(prisma.enrollment.create).not.toHaveBeenCalled();
    });

    it('jika user sudah enrolled, tidak create enrollment baru', async () => {
        const orderId = 'purchase_123';
        const statusCode = '200';
        const grossAmount = '50000';
        const signatureKey = createSignature(orderId, statusCode, grossAmount);

        (prisma.purchase.findUnique as jest.Mock).mockResolvedValue({
            id: 'purchase_123',
            userId: 'user_123',
            courseId: 'course_123',
        });

        (prisma.enrollment.findUnique as jest.Mock).mockResolvedValue({
            id: 'enrollment_123',
        });

        const req = {
            json: async () => ({
                order_id: orderId,
                status_code: statusCode,
                gross_amount: grossAmount,
                signature_key: signatureKey,
                transaction_status: 'settlement',
            }),
        } as unknown as Request;

        const response = await POST(req);

        expect(prisma.enrollment.create).not.toHaveBeenCalled();
    });

    it('status cancel/deny/expire, update status tanpa enroll', async () => {
        const orderId = 'purchase_123';
        const statusCode = '200';
        const grossAmount = '50000';
        const signatureKey = createSignature(orderId, statusCode, grossAmount);

        (prisma.purchase.findUnique as jest.Mock).mockResolvedValue({
            id: 'purchase_123',
            userId: 'user_123',
            courseId: 'course_123',
        });

        const testStatuses = ['cancel', 'deny', 'expire'];

        for (const status of testStatuses) {
            jest.clearAllMocks();

            const req = {
                json: async () => ({
                    order_id: orderId,
                    status_code: statusCode,
                    gross_amount: grossAmount,
                    signature_key: signatureKey,
                    transaction_status: status,
                }),
            } as unknown as Request;

            const response = await POST(req);

            expect(prisma.purchase.update).toHaveBeenCalledWith({
                where: { id: orderId },
                data: {
                    status,
                    paymentType: undefined,
                },
            });

            expect(prisma.enrollment.create).not.toHaveBeenCalled();
        }
    });

    it('status pending, update status tanpa enroll', async () => {
        const orderId = 'purchase_123';
        const statusCode = '201';
        const grossAmount = '50000';
        const signatureKey = createSignature(orderId, statusCode, grossAmount);

        (prisma.purchase.findUnique as jest.Mock).mockResolvedValue({
            id: 'purchase_123',
            userId: 'user_123',
            courseId: 'course_123',
        });

        const req = {
            json: async () => ({
                order_id: orderId,
                status_code: statusCode,
                gross_amount: grossAmount,
                signature_key: signatureKey,
                transaction_status: 'pending',
            }),
        } as unknown as Request;

        const response = await POST(req);

        expect(prisma.purchase.update).toHaveBeenCalled();
        expect(prisma.enrollment.create).not.toHaveBeenCalled();
    });
});

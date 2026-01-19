import { snap } from '@/lib/midtrans';
import { prisma } from '@/lib/prisma';
import { POST } from '@/app/api/midtrans/route';
import { NextResponse } from 'next/server';

// Mock dependencies
jest.mock('@/lib/midtrans', () => ({
    snap: {
        createTransaction: jest.fn(),
    },
}));

jest.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
        enrollment: {
            findUnique: jest.fn(),
        },
        purchase: {
            create: jest.fn(),
            update: jest.fn(),
        },
    },
}));

// Mock process.env
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

describe('Midtrans Payment API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Validasi Input', () => {
        it('jika userId atau courseId kosong, return 400', async () => {
            const req = {
                json: async () => ({
                    amount: 50000,
                    userId: '',
                    courseId: 'course_123',
                }),
            } as unknown as Request;

            const response = await POST(req);
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json.error).toContain('Missing userId or courseId');
        });

        it('jika courseId kosong, return 400', async () => {
            const req = {
                json: async () => ({
                    amount: 50000,
                    userId: 'clerk_123',
                    courseId: '',
                }),
            } as unknown as Request;

            const response = await POST(req);
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json.error).toContain('Missing userId or courseId');
        });
    });

    describe('User Lookup', () => {
        it('jika user tidak ditemukan, return 404', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const req = {
                json: async () => ({
                    amount: 50000,
                    userId: 'clerk_123',
                    courseId: 'course_123',
                }),
            } as unknown as Request;

            const response = await POST(req);
            const json = await response.json();

            expect(response.status).toBe(404);
            expect(json.error).toContain('User not found');
        });

        it('menggunakan clerkId untuk mencari user', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user_123' });
            (prisma.enrollment.findUnique as jest.Mock).mockResolvedValue({ id: 'enrollment_123' });

            const req = {
                json: async () => ({
                    amount: 50000,
                    userId: 'clerk_123',
                    courseId: 'course_123',
                }),
            } as unknown as Request;

            await POST(req);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { clerkId: 'clerk_123' },
            });
        });
    });

    describe('Enrollment Check', () => {
        it('jika user sudah terdaftar, return 400', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user_123' });
            (prisma.enrollment.findUnique as jest.Mock).mockResolvedValue({ id: 'enrollment_123' });

            const req = {
                json: async () => ({
                    amount: 50000,
                    userId: 'clerk_123',
                    courseId: 'course_123',
                }),
            } as unknown as Request;

            const response = await POST(req);
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json.error).toContain('User already enrolled');
        });

        it('memeriksa enrollment dengan userId yang sudah diresolve', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user_123' });
            (prisma.enrollment.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.purchase.create as jest.Mock).mockResolvedValue({ id: 'purchase_123' });
            (snap.createTransaction as jest.Mock).mockResolvedValue({ token: 'token', redirect_url: 'url' });

            const req = {
                json: async () => ({
                    amount: 50000,
                    userId: 'clerk_123',
                    courseId: 'course_123',
                }),
            } as unknown as Request;

            await POST(req);

            expect(prisma.enrollment.findUnique).toHaveBeenCalledWith({
                where: {
                    userId_courseId: {
                        userId: 'user_123',
                        courseId: 'course_123',
                    },
                },
            });
        });
    });

    describe('Purchase Creation', () => {
        it('sukses membuat transaksi dengan data lengkap', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user_123' });
            (prisma.enrollment.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.purchase.create as jest.Mock).mockResolvedValue({ id: 'purchase_123' });
            (snap.createTransaction as jest.Mock).mockResolvedValue({
                token: 'snap_token_abc',
                redirect_url: 'http://redirect.url',
            });

            const req = {
                json: async () => ({
                    amount: 50000,
                    userId: 'clerk_123',
                    courseId: 'course_123',
                    itemDetails: [{ id: 'item_1', name: 'Course', price: 50000, quantity: 1 }],
                    customerDetails: { first_name: 'John', email: 'john@test.com' },
                }),
            } as unknown as Request;

            const response = await POST(req);
            const json = await response.json();

            expect(prisma.purchase.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        userId: 'user_123',
                        courseId: 'course_123',
                        price: 50000,
                        status: 'pending',
                    }),
                })
            );

            expect(json.token).toBe('snap_token_abc');
            expect(json.orderId).toBe('purchase_123');
        });

        it('dapat membuat transaksi baru meskipun ada transaksi pending', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user_123' });
            (prisma.enrollment.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.purchase.create as jest.Mock).mockResolvedValue({ id: 'purchase_456' });
            (snap.createTransaction as jest.Mock).mockResolvedValue({ token: 'new_token', redirect_url: 'url' });

            const req = {
                json: async () => ({
                    amount: 50000,
                    userId: 'clerk_123',
                    courseId: 'course_123',
                }),
            } as unknown as Request;

            const response = await POST(req);

            expect(response.status).toBe(200);
            expect(prisma.purchase.create).toHaveBeenCalled();
        });
    });

    describe('Midtrans Integration', () => {
        it('menggunakan purchase ID sebagai order_id', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user_123' });
            (prisma.enrollment.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.purchase.create as jest.Mock).mockResolvedValue({ id: 'purchase_123' });
            (snap.createTransaction as jest.Mock).mockResolvedValue({ token: 'token', redirect_url: 'url' });

            const req = {
                json: async () => ({
                    amount: 50000,
                    userId: 'clerk_123',
                    courseId: 'course_123',
                }),
            } as unknown as Request;

            await POST(req);

            expect(snap.createTransaction).toHaveBeenCalledWith(
                expect.objectContaining({
                    transaction_details: expect.objectContaining({
                        order_id: 'purchase_123',
                        gross_amount: 50000,
                    }),
                })
            );
        });

        it('menyimpan snap token ke purchase setelah sukses', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user_123' });
            (prisma.enrollment.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.purchase.create as jest.Mock).mockResolvedValue({ id: 'purchase_123' });
            (snap.createTransaction as jest.Mock).mockResolvedValue({ token: 'snap_token', redirect_url: 'url' });

            const req = {
                json: async () => ({
                    amount: 50000,
                    userId: 'clerk_123',
                    courseId: 'course_123',
                }),
            } as unknown as Request;

            await POST(req);

            expect(prisma.purchase.update).toHaveBeenCalledWith({
                where: { id: 'purchase_123' },
                data: { snapToken: 'snap_token' },
            });
        });

        it('mengirim callbacks URL yang benar', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user_123' });
            (prisma.enrollment.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.purchase.create as jest.Mock).mockResolvedValue({ id: 'purchase_123' });
            (snap.createTransaction as jest.Mock).mockResolvedValue({ token: 'token', redirect_url: 'url' });

            const req = {
                json: async () => ({
                    amount: 50000,
                    userId: 'clerk_123',
                    courseId: 'course_123',
                }),
            } as unknown as Request;

            await POST(req);

            expect(snap.createTransaction).toHaveBeenCalledWith(
                expect.objectContaining({
                    callbacks: {
                        finish: 'http://localhost:3000/courses/course_123',
                        error: 'http://localhost:3000/courses/course_123?error=payment_failed',
                        pending: 'http://localhost:3000/courses/course_123?pending=true',
                    },
                })
            );
        });
    });

    describe('Error Handling', () => {
        it('jika Midtrans gagal, return 500', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user_123' });
            (prisma.enrollment.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.purchase.create as jest.Mock).mockResolvedValue({ id: 'purchase_123' });
            (snap.createTransaction as jest.Mock).mockRejectedValue(new Error('Midtrans API Error'));

            const req = {
                json: async () => ({
                    amount: 50000,
                    userId: 'clerk_123',
                    courseId: 'course_123',
                }),
            } as unknown as Request;

            const response = await POST(req);
            const json = await response.json();

            expect(response.status).toBe(500);
            expect(json.error).toContain('Failed to create transaction');
        });

        it('jika database error, return 500', async () => {
            (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database Error'));

            const req = {
                json: async () => ({
                    amount: 50000,
                    userId: 'clerk_123',
                    courseId: 'course_123',
                }),
            } as unknown as Request;

            const response = await POST(req);
            const json = await response.json();

            expect(response.status).toBe(500);
            expect(json.error).toContain('Failed to create transaction');
        });
    });
});

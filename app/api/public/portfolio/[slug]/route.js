import { NextResponse } from 'next/server';
//import { prisma } from '@/lib/db';
import { prisma } from '../../../../lib/db.js';
// GET /api/public/portfolio/[slug] - Get a portfolio by slug (public)
export async function GET(request, { params }) {
    try {
        const { slug } = params;

        const portfolio = await prisma.portfolio.findUnique({
            where: { slug },
            include: {
                sections: {
                    where: { isVisible: true },
                    orderBy: { order: 'asc' }
                },
                projects: {
                    orderBy: [
                        { isFeatured: 'desc' },
                        { order: 'asc' }
                    ]
                },
                user: {
                    select: {
                        name: true,
                        username: true,
                        email: true,
                    }
                }
            }
        });

        if (!portfolio) {
            return NextResponse.json(
                { error: 'Portfolio not found' },
                { status: 404 }
            );
        }

        // Only return if published
        if (!portfolio.isPublished) {
            return NextResponse.json(
                { error: 'Portfolio is not published' },
                { status: 403 }
            );
        }

        return NextResponse.json({ portfolio });

    } catch (error) {
        console.error('Get public portfolio error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
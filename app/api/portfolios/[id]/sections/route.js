import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticate } from '@/lib/auth';

// GET /api/portfolios/[id]/sections - Get all sections for a portfolio
export async function GET(request, { params }) {
    try {
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const includeHidden = searchParams.get('includeHidden') === 'true';

        // Check if portfolio exists
        const portfolio = await prisma.portfolio.findUnique({
            where: { id }
        });

        if (!portfolio) {
            return NextResponse.json(
                { error: 'Portfolio not found' },
                { status: 404 }
            );
        }

        // If requesting hidden sections, require authentication
        let whereClause = { portfolioId: id };

        if (!includeHidden) {
            whereClause.isVisible = true;
        } else {
            const user = await authenticate(request);

            if (!user || user.id !== portfolio.userId) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }
        }

        const sections = await prisma.section.findMany({
            where: whereClause,
            orderBy: { order: 'asc' }
        });

        return NextResponse.json({ sections });

    } catch (error) {
        console.error('Get sections error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/portfolios/[id]/sections - Create a new section
export async function POST(request, { params }) {
    try {
        const user = await authenticate(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = params;
        const body = await request.json();
        const { type, title, content, order, isVisible } = body;

        // Validation
        if (!type) {
            return NextResponse.json(
                { error: 'Section type is required' },
                { status: 400 }
            );
        }

        // Valid section types
        const validTypes = ['hero', 'about', 'projects', 'contact', 'custom'];
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: `Invalid section type. Must be one of: ${validTypes.join(', ')}` },
                { status: 400 }
            );
        }

        // Check portfolio ownership
        const portfolio = await prisma.portfolio.findUnique({
            where: { id }
        });

        if (!portfolio) {
            return NextResponse.json(
                { error: 'Portfolio not found' },
                { status: 404 }
            );
        }

        if (portfolio.userId !== user.id) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        // If order not provided, get the next available order
        let sectionOrder = order;
        if (sectionOrder === undefined) {
            const maxOrder = await prisma.section.findFirst({
                where: { portfolioId: id },
                orderBy: { order: 'desc' },
                select: { order: true }
            });
            sectionOrder = (maxOrder?.order || 0) + 1;
        }

        // Create section
        const section = await prisma.section.create({
            data: {
                portfolioId: id,
                type,
                title: title || null,
                content: content || {},
                order: sectionOrder,
                isVisible: isVisible !== undefined ? isVisible : true,
            }
        });

        return NextResponse.json(
            {
                message: 'Section created successfully',
                section
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Create section error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
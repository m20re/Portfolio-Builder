import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticate } from '@/lib/auth';

// PUT /api/sections/[sectionId] - Update a section
export async function PUT(request, { params }) {
    try {
        const user = await authenticate(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { sectionId } = params;
        const body = await request.json();

        // Get section with portfolio info
        const existingSection = await prisma.section.findUnique({
            where: { id: sectionId },
            include: {
                portfolio: true
            }
        });

        if (!existingSection) {
            return NextResponse.json(
                { error: 'Section not found' },
                { status: 404 }
            );
        }

        // Check ownership
        if (existingSection.portfolio.userId !== user.id) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Build update data
        const { type, title, content, order, isVisible } = body;
        const updateData = {};

        if (type !== undefined) updateData.type = type;
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (order !== undefined) updateData.order = order;
        if (isVisible !== undefined) updateData.isVisible = isVisible;

        // Update section
        const section = await prisma.section.update({
            where: { id: sectionId },
            data: updateData,
        });

        return NextResponse.json({
            message: 'Section updated successfully',
            section
        });

    } catch (error) {
        console.error('Update section error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/sections/[sectionId] - Delete a section
export async function DELETE(request, { params }) {
    try {
        const user = await authenticate(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { sectionId } = params;

        // Get section with portfolio info
        const existingSection = await prisma.section.findUnique({
            where: { id: sectionId },
            include: {
                portfolio: true
            }
        });

        if (!existingSection) {
            return NextResponse.json(
                { error: 'Section not found' },
                { status: 404 }
            );
        }

        // Check ownership
        if (existingSection.portfolio.userId !== user.id) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Delete section
        await prisma.section.delete({
            where: { id: sectionId }
        });

        return NextResponse.json({
            message: 'Section deleted successfully'
        });

    } catch (error) {
        console.error('Delete section error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
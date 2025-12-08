import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticate } from '@/lib/auth';
import { uploadToS3 } from '@/lib/s3';

// POST /api/upload - Upload a file to S3
export async function POST(request) {
    try {
        const user = await authenticate(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'uploads';

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size exceeds 10MB limit' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'application/pdf',
            'text/plain',
            'application/zip',
            'application/x-zip-compressed',
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: `File type ${file.type} not allowed` },
                { status: 400 }
            );
        }

        // Upload to S3
        const fileUrl = await uploadToS3(file, folder);

        // Save asset record to database
        const asset = await prisma.asset.create({
            data: {
                userId: user.id,
                filename: file.name.split('.')[0],
                originalName: file.name,
                mimeType: file.type,
                size: file.size,
                url: fileUrl,
            }
        });

        return NextResponse.json(
            {
                message: 'File uploaded successfully',
                asset,
                url: fileUrl,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed: ' + error.message },
            { status: 500 }
        );
    }
}

// GET /api/upload - Get user's uploaded assets
export async function GET(request) {
    try {
        const user = await authenticate(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;
        const mimeType = searchParams.get('type'); // Filter by type

        // Build where clause
        let whereClause = { userId: user.id };
        if (mimeType) {
            whereClause.mimeType = { startsWith: mimeType };
        }

        const [assets, total] = await Promise.all([
            prisma.asset.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.asset.count({
                where: whereClause
            })
        ]);

        return NextResponse.json({
            assets,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            }
        });

    } catch (error) {
        console.error('Get assets error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
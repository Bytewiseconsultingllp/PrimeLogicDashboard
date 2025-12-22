import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to convert file to buffer
async function streamToBuffer(readableStream: ReadableStream): Promise<Buffer> {
  const chunks = [];
  const reader = readableStream.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  return Buffer.concat(chunks);
}

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const projectId = params.projectId;
    
    // Verify project exists and user is the owner
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { clientId: true, clientBriefDocument: true },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.clientId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Only the project owner can upload documents' },
        { status: 403 }
      );
    }

    // Check if document already exists
    if (project.clientBriefDocument) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Document already uploaded and cannot be replaced. This document is permanent and immutable.' 
        },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('document') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, message: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const arrayBuffer = Buffer.from(buffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: `projects/${projectId}/documents`,
          public_id: 'client_brief',
          overwrite: false,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      const readable = new Readable();
      readable.push(arrayBuffer);
      readable.push(null);
      readable.pipe(uploadStream);
    }) as any;

    // Save document reference to database
    await prisma.clientBriefDocument.create({
      data: {
        projectId,
        fileName: file.name,
        fileUrl: uploadResult.secure_url,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Client brief document uploaded successfully',
      data: {
        projectId,
        documentUrl: uploadResult.secure_url,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const projectId = params.projectId;
    
    // Get project with document
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { clientBriefDocument: true },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user has access (owner, admin, or assigned freelancer)
    const hasAccess = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { clientId: session.user.id },
          { assignedFreelancers: { some: { id: session.user.id } } },
        ],
      },
    });

    if (!hasAccess && !session.user.role?.includes('ADMIN') && !session.user.role?.includes('MODERATOR')) {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to view this document' },
        { status: 403 }
      );
    }

    if (!project.clientBriefDocument) {
      return NextResponse.json(
        { success: false, message: 'No document found for this project' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Client brief document retrieved successfully',
      data: {
        projectId: project.id,
        documentUrl: project.clientBriefDocument.fileUrl,
        fileName: project.clientBriefDocument.fileName,
        uploadedAt: project.clientBriefDocument.createdAt.toISOString(),
      },
    });

  } catch (error) {
    console.error('Error retrieving document:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve document' },
      { status: 500 }
    );
  }
}

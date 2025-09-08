import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import dbConnect from '@/lib/database';
import User from '@/models/User';

// In-memory storage for SSE connections (in production, use Redis or similar)
const connections = new Map();

// GET - Server-Sent Events endpoint for real-time notifications
export async function GET(request) {
  try {
    await dbConnect();
    
    // Check if user is admin
    const auth = await authMiddleware(request);
    if (auth.error) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await User.findOne({ clerkUserId: auth.userId });
    if (!user || user.role !== 'admin') {
      return new NextResponse('Forbidden: Admin access required', { status: 403 });
    }

    // Create a readable stream for SSE
    const stream = new ReadableStream({
      start(controller) {
        const clientId = Math.random().toString(36).substr(2, 9);
        
        // Store connection
        connections.set(clientId, controller);

        // Send initial connection message
        const data = JSON.stringify({
          type: 'connected',
          message: 'Connected to admin notifications',
          timestamp: new Date().toISOString()
        });
        controller.enqueue(`data: ${data}\n\n`);

        // Keep connection alive with heartbeat
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`);
          } catch (error) {
            clearInterval(heartbeat);
            connections.delete(clientId);
          }
        }, 30000); // 30 second heartbeat

        // Cleanup on close
        request.signal?.addEventListener('abort', () => {
          clearInterval(heartbeat);
          connections.delete(clientId);
          try {
            controller.close();
          } catch (error) {
            // Connection already closed
          }
        });
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });
  } catch (error) {
    console.error('SSE Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST - Send notification to all connected admin clients
export async function POST(request) {
  try {
    // Check for internal server-to-server authentication first
    const internalSecret = request.headers.get('X-Internal-Secret');
    const isInternalRequest = internalSecret && 
                             process.env.NOTIFICATIONS_INTERNAL_SECRET && 
                             internalSecret === process.env.NOTIFICATIONS_INTERNAL_SECRET;
    
    // If not internal request, require normal authentication
    if (!isInternalRequest) {
      const auth = await authMiddleware(request);
      if (auth.error) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { type, title, message, data } = await request.json();

    const notification = {
      id: Math.random().toString(36).substr(2, 9),
      type: type || 'info',
      title: title || 'Notification',
      message: message || '',
      data: data || {},
      timestamp: new Date().toISOString()
    };

    // Send to all connected admin clients
    const notificationData = `data: ${JSON.stringify(notification)}\n\n`;
    
    for (const [clientId, controller] of connections.entries()) {
      try {
        controller.enqueue(notificationData);
      } catch (error) {
        // Remove dead connection
        connections.delete(clientId);
      }
    }

    console.log(`📡 Notification broadcast: "${notification.title}" to ${connections.size} admin connection(s)`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Notification sent to all connected admins',
      activeConnections: connections.size
    });
  } catch (error) {
    console.error('Notification Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send notification' 
    }, { status: 500 });
  }
}

// Utility function to broadcast notifications (can be imported in other files)
export function broadcastNotification(notification) {
  const notificationData = `data: ${JSON.stringify(notification)}\n\n`;
  
  for (const [clientId, controller] of connections.entries()) {
    try {
      controller.enqueue(notificationData);
    } catch (error) {
      connections.delete(clientId);
    }
  }
}

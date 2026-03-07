import { NextResponse } from 'next/server';
import { parseEnergyEmail } from '@/lib/energy-parser';

interface EmailData {
  subject?: string;
  body?: string;
  from?: string;
  date?: string;
  html?: string;
}

/**
 * API route for receiving forwarded emails
 * 
 * Users can forward their energy emails to this endpoint
 * This works with ANY email provider (Gmail, Outlook, Yahoo, etc.)
 * 
 * Usage:
 * 1. User configures email forwarding in their provider
 * 2. Forwarded emails are sent to this endpoint
 * 3. The energy data is extracted and returned
 * 
 * Headers required:
 * - x-api-key: Your API key for security (if configured)
 */
export async function GET() {
  return NextResponse.json({
    service: 'Energy Email Forwarding API',
    version: '1.0.0',
    description: 'Receive forwarded energy emails from any provider',
    endpoints: {
      POST: {
        path: '/api/email-forward',
        description: 'Submit forwarded email for energy data extraction',
        body: {
          subject: 'Email subject (optional)',
          text: 'Email body text',
          from: 'Sender email (optional)',
          date: 'Email date (optional)',
          html: 'HTML content (optional)'
        }
      }
    },
    setup: {
      gmail: 'Settings > See all settings > Filters > Create a new filter > Forward to your-email@domain.com',
      outlook: 'Settings > Mail > Rules > New Rule > Forward emails to...',
      yahoo: 'Settings > Filters > Add new filter > Forward to...',
      icloud: 'Settings > Mail > Rules > Add Rule > Forward'
    }
  }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    // Check for API key (simple security)
    const apiKey = request.headers.get('x-api-key');
    const expectedApiKey = process.env.EMAIL_FORWARD_API_KEY;
    
    if (expectedApiKey && apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }

    let emailData: EmailData = {};

    // Handle JSON payload
    if (contentType.includes('application/json')) {
      const json = await request.json();
      emailData = {
        subject: json.subject || json.subject || '',
        body: json.text || json.body || json.plain || '',
        from: json.from || '',
        date: json.date || '',
        html: json.html || ''
      };
    } 
    // Handle form-urlencoded (common for email webhooks)
    else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      emailData = {
        subject: formData.get('subject') as string || '',
        body: formData.get('text') as string || formData.get('body') as string || '',
        from: formData.get('from') as string || '',
        date: formData.get('date') as string || '',
        html: formData.get('html') as string || ''
      };
    }
    // Handle raw text (simple forwarding)
    else {
      const text = await request.text();
      emailData.body = text;
    }

    // Combine subject and body for parsing
    const textToParse = [
      emailData.subject || '',
      emailData.body || ''
    ].join('\n');

    if (!textToParse.trim()) {
      return NextResponse.json(
        { error: 'No email content provided' },
        { status: 400 }
      );
    }

    // Parse energy data from email
    const energyData = parseEnergyEmail(textToParse);

    if (!energyData) {
      return NextResponse.json({
        success: false,
        message: 'No energy data found in email',
        received: {
          subject: emailData.subject,
          from: emailData.from,
          date: emailData.date || ''
        }
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      message: 'Energy data extracted successfully',
      data: energyData,
      received: {
        subject: emailData.subject,
        from: emailData.from,
        date: emailData.date
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error processing forwarded email:', error);
    return NextResponse.json(
      { error: 'Failed to process email', details: String(error) },
      { status: 500 }
    );
  }
}

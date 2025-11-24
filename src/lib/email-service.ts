import nodemailer from 'nodemailer';
import { AnalyzedPost } from './ai-service';

// Create a transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendDigestEmail(to: string, posts: { post: any, analysis: AnalyzedPost }[]) {
  if (!posts.length) return;

  // Support multiple recipients separated by commas
  const recipients = to.split(',').map(email => email.trim()).filter(email => email);

  const htmlContent = `
    <h1>Daily Blog Digest</h1>
    <p>Here are the latest updates from the blog:</p>
    ${posts.map(p => `
      <div style="border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
        <h2><a href="${p.post.link}">${p.post.title}</a></h2>
        <p><strong>Date:</strong> ${p.post.pubDate}</p>
        <div style="background-color: #f9f9f9; padding: 10px; margin-top: 10px;">
          <h3>AI Summary</h3>
          <p>${p.analysis.summary}</p>
          
          <h3>Full Content with AI Notes</h3>
          ${p.analysis.paragraphs.map(para => `
            <p>${para.original}</p>
            ${para.explanation ? `
              <div style="background-color: #f0f4ff; padding: 15px; margin: 10px 0; border-left: 4px solid #4f46e5; border-radius: 0 8px 8px 0;">
                <strong style="color: #4338ca; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 5px;">🎓 AI 해설</strong>
                <p style="margin: 0; color: #1e1b4b; font-size: 14px; line-height: 1.6;">${para.explanation.replace('AI 해설: ', '')}</p>
              </div>
            ` : ''}
          `).join('')}
        </div>
      </div>
    `).join('')}
  `;

  try {
    const info = await transporter.sendMail({
      from: '"Blog AI Digest" <noreply@example.com>',
      to: recipients.join(', '), // Send to all recipients
      subject: `Daily Blog Digest - ${new Date().toLocaleDateString()}`,
      html: htmlContent,
    });

    console.log('Message sent to %d recipients: %s', recipients.length, info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

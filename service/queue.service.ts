// services/queue.service.ts
import Queue, { Job } from 'bull';
import { sendEmail, emailTemplates } from './email.service';
import { connectDB } from '@/lib/mongo_db';
import { JobApplication } from '@/models/jobApplication';
import { Notification } from '@/models/notification';

const redisConnectionString = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const parsedUrl = new URL(redisConnectionString);
const redisOpts = {
  host: parsedUrl.hostname,
  port: parseInt(parsedUrl.port || '6379', 10),
  password: parsedUrl.password || undefined,
  username: parsedUrl.username || undefined,
  db: parsedUrl.pathname ? parseInt(parsedUrl.pathname.slice(1) || '0', 10) : undefined,
  tls: parsedUrl.protocol === 'rediss:' ? {} : undefined,
};

// Remove undefined values to avoid object assignment issues
Object.keys(redisOpts).forEach(key => redisOpts[key as keyof typeof redisOpts] === undefined && delete redisOpts[key as keyof typeof redisOpts]);

export const followUpQueue = new Queue('follow-up emails', { redis: redisOpts });
export const notificationQueue = new Queue('notifications', { redis: redisOpts });
// Process follow-up emails
followUpQueue.process(async (job:Job) => {
  const { applicationId, userId, userName, application } = job.data;
  
  await connectDB();
  
  try {
    // Send follow-up email
    const template = emailTemplates.followUp(
      application.companyName,
      application.position,
      userName
    );
    
    const emailResult = await sendEmail({
      to: application.hrEmail,
      subject: template.subject,
      html: template.html,
    });
    
    if (emailResult.success) {
      // Update application
      await JobApplication.findByIdAndUpdate(applicationId, {
        lastEmailSent: new Date(),
        status: 'follow-up',
      });
      
      // Create notification
      await Notification.create({
        userId,
        title: 'Follow-up Email Sent',
        message: `Follow-up email sent to ${application.companyName}`,
        type: 'email',
        applicationId,
      });
    }
    
    return emailResult;
  } catch (error) {
    console.error(`Failed to send follow-up for ${applicationId}:`, error);
    throw error;
  }
});

// Schedule follow-up email
export async function scheduleFollowUp(applicationId: string, followUpDate: Date, userId: string, userName: string, application: any) {
  await followUpQueue.add(
    { applicationId, userId, userName, application },
    { delay: followUpDate.getTime() - Date.now() }
  );
}
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT ?? '587', 10),
        secure: false,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
    } else {
      this.logger.warn('SMTP not configured — email sending disabled');
    }
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.transporter) return;
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM ?? 'Bayit <noreply@bayit.ng>',
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${(err as Error).message}`);
    }
  }

  private wrap(title: string, body: string): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F7FA;font-family:Inter,system-ui,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E2E8F0">
    <div style="background:#0B1F3A;padding:24px 32px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:22px;font-family:Georgia,serif">Bayit</h1>
      <p style="margin:4px 0 0;color:#8A9AB2;font-size:12px">בַּיִת — Your Home</p>
    </div>
    <div style="padding:32px">
      <h2 style="margin:0 0 16px;color:#0B1F3A;font-size:18px;font-family:Georgia,serif">${title}</h2>
      ${body}
      <p style="margin:32px 0 0;padding-top:24px;border-top:1px solid #E2E8F0;font-size:12px;color:#8A9AB2">
        This email was sent by Bayit Real Estate. If you did not expect this, please ignore it.
      </p>
    </div>
  </div>
</body>
</html>`;
  }

  async sendWelcome(to: string, name: string) {
    await this.send(
      to,
      'Welcome to Bayit',
      this.wrap('Welcome, ' + name + '!', `
        <p style="color:#4A5A72;line-height:1.6">Your Bayit account is ready. You can now browse properties, book inspections, and manage your reservations from your dashboard.</p>
        <a href="${process.env.FRONTEND_URL}/properties" style="display:inline-block;margin-top:16px;background:#0D7377;color:#fff;padding:12px 24px;border-radius:100px;text-decoration:none;font-size:14px;font-weight:600">Browse Properties →</a>
      `),
    );
  }

  async sendInspectionBooked(to: string, name: string, propertyTitle: string, date: string, time: string, ticketNumber: string) {
    await this.send(
      to,
      `Inspection Booked — ${ticketNumber}`,
      this.wrap('Inspection Confirmed', `
        <p style="color:#4A5A72;line-height:1.6">Hi ${name},</p>
        <p style="color:#4A5A72;line-height:1.6">Your inspection for <strong>${propertyTitle}</strong> has been booked and is pending admin review.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          ${[['Ticket', ticketNumber], ['Date', date], ['Time', time], ['Status', 'Pending Review']].map(([k, v]) => `
            <tr><td style="padding:8px 0;border-bottom:1px solid #E2E8F0;color:#8A9AB2;font-size:13px;width:40%">${k}</td>
                <td style="padding:8px 0;border-bottom:1px solid #E2E8F0;color:#0B1F3A;font-size:13px;font-weight:600">${v}</td></tr>
          `).join('')}
        </table>
        <p style="color:#4A5A72;font-size:13px;line-height:1.6">Please bring a valid ID on the day of inspection.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard/inspections" style="display:inline-block;margin-top:16px;background:#0D7377;color:#fff;padding:12px 24px;border-radius:100px;text-decoration:none;font-size:14px;font-weight:600">View My Inspections →</a>
      `),
    );
  }

  async sendInspectionApproved(to: string, name: string, propertyTitle: string, date: string, time: string) {
    await this.send(
      to,
      `Inspection Approved — ${propertyTitle}`,
      this.wrap('Inspection Approved ✓', `
        <p style="color:#4A5A72;line-height:1.6">Hi ${name}, great news!</p>
        <p style="color:#4A5A72;line-height:1.6">Your inspection for <strong>${propertyTitle}</strong> on <strong>${date}</strong> at <strong>${time}</strong> has been approved.</p>
        <p style="color:#4A5A72;font-size:13px;line-height:1.6">Please arrive on time and bring a valid government-issued ID.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard/inspections" style="display:inline-block;margin-top:16px;background:#0D7377;color:#fff;padding:12px 24px;border-radius:100px;text-decoration:none;font-size:14px;font-weight:600">View Ticket →</a>
      `),
    );
  }

  async sendInspectionRejected(to: string, name: string, propertyTitle: string, reason?: string) {
    await this.send(
      to,
      `Inspection Update — ${propertyTitle}`,
      this.wrap('Inspection Not Approved', `
        <p style="color:#4A5A72;line-height:1.6">Hi ${name},</p>
        <p style="color:#4A5A72;line-height:1.6">Unfortunately your inspection request for <strong>${propertyTitle}</strong> was not approved.${reason ? ` Reason: ${reason}` : ''}</p>
        <p style="color:#4A5A72;font-size:13px;line-height:1.6">You can contact us via chat for more information or to rebook.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard/messages" style="display:inline-block;margin-top:16px;background:#0B1F3A;color:#fff;padding:12px 24px;border-radius:100px;text-decoration:none;font-size:14px;font-weight:600">Contact Support →</a>
      `),
    );
  }

  async sendReservationCreated(to: string, name: string, propertyTitle: string, deposit: string) {
    await this.send(
      to,
      `Reservation Submitted — ${propertyTitle}`,
      this.wrap('Reservation Received', `
        <p style="color:#4A5A72;line-height:1.6">Hi ${name},</p>
        <p style="color:#4A5A72;line-height:1.6">Your reservation request for <strong>${propertyTitle}</strong> has been submitted. Required deposit: <strong>${deposit}</strong>.</p>
        <p style="color:#4A5A72;font-size:13px;line-height:1.6">Our team will review and respond within 1–2 business days.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard/reservations" style="display:inline-block;margin-top:16px;background:#0D7377;color:#fff;padding:12px 24px;border-radius:100px;text-decoration:none;font-size:14px;font-weight:600">View Reservations →</a>
      `),
    );
  }

  async sendReservationApproved(to: string, name: string, propertyTitle: string, reservedUntil: string) {
    await this.send(
      to,
      `Reservation Approved — ${propertyTitle}`,
      this.wrap('Reservation Approved ✓', `
        <p style="color:#4A5A72;line-height:1.6">Hi ${name}, congratulations!</p>
        <p style="color:#4A5A72;line-height:1.6">Your reservation for <strong>${propertyTitle}</strong> has been approved and is valid until <strong>${reservedUntil}</strong>.</p>
        <p style="color:#4A5A72;font-size:13px;line-height:1.6">Please complete your payment before the reservation expires to secure the property.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard/reservations" style="display:inline-block;margin-top:16px;background:#0D7377;color:#fff;padding:12px 24px;border-radius:100px;text-decoration:none;font-size:14px;font-weight:600">View Reservation →</a>
      `),
    );
  }

  async sendPaymentSubmitted(to: string, name: string, propertyTitle: string, amount: string) {
    await this.send(
      to,
      `Payment Received — ${propertyTitle}`,
      this.wrap('Payment Under Review', `
        <p style="color:#4A5A72;line-height:1.6">Hi ${name},</p>
        <p style="color:#4A5A72;line-height:1.6">Your payment of <strong>${amount}</strong> for <strong>${propertyTitle}</strong> has been received and is under review.</p>
        <p style="color:#4A5A72;font-size:13px;line-height:1.6">You will be notified once your payment is confirmed.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard/transactions" style="display:inline-block;margin-top:16px;background:#0D7377;color:#fff;padding:12px 24px;border-radius:100px;text-decoration:none;font-size:14px;font-weight:600">View Transactions →</a>
      `),
    );
  }

  async sendPaymentApproved(to: string, name: string, propertyTitle: string, amount: string) {
    await this.send(
      to,
      `Payment Confirmed — ${propertyTitle}`,
      this.wrap('Payment Confirmed ✓', `
        <p style="color:#4A5A72;line-height:1.6">Hi ${name}, congratulations on your purchase!</p>
        <p style="color:#4A5A72;line-height:1.6">Your payment of <strong>${amount}</strong> for <strong>${propertyTitle}</strong> has been confirmed.</p>
        <p style="color:#4A5A72;font-size:13px;line-height:1.6">Our team will reach out shortly to guide you through the next steps of your property transfer.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="display:inline-block;margin-top:16px;background:#0D7377;color:#fff;padding:12px 24px;border-radius:100px;text-decoration:none;font-size:14px;font-weight:600">Go to Dashboard →</a>
      `),
    );
  }
}

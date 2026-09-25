import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

/**
 * Khởi tạo transporter cho nodemailer.
 * Nếu có cấu hình SMTP trong .env thì dùng SMTP thật.
 */
const createTransporter = () => {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });

  const user = (process.env.SMTP_USER || 'phucle20704@gmail.com').trim();
  const pass = (process.env.SMTP_PASS || 'evqy umre cehe ulop').replace(/\s+/g, '');
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';

  if (user && pass) {
    if (host.includes('gmail.com') || user.endsWith('@gmail.com')) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    }

    return nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
    });
  }
  return null;
};

/**
 * Gửi email chứa mã xác nhận OTP 6 số
 */
export const sendOtpEmail = async (email: string, otp: string, name: string): Promise<boolean> => {
  // Luôn in mã ra console server để dễ kiểm thử và phát triển
  console.log('\n==================================================');
  console.log(`📧 [EMAIL OTP VERIFICATION]`);
  console.log(`Gửi tới: ${name} <${email}>`);
  console.log(`MÃ XÁC THỰC OTP: >>> [ ${otp} ] <<<`);
  console.log(`Hiệu lực: 10 phút`);
  console.log('==================================================\n');

  const transporter = createTransporter();
  if (!transporter) {
    // Không có SMTP config, chế độ mô phỏng hoàn tất thành công
    return true;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; margin: 0; padding: 20px; color: #f1f5f9; }
        .card { max-width: 520px; margin: 0 auto; background-color: #111827; border-radius: 16px; border: 1px solid #253047; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
        .header { background: linear-gradient(135deg, #1e1b4b, #312e81, #1e3a8a); padding: 30px 24px; text-align: center; }
        .logo { font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
        .logo span { color: #38bdf8; }
        .content { padding: 30px 24px; }
        .greeting { font-size: 16px; color: #e2e8f0; margin-bottom: 16px; font-weight: 600; }
        .desc { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
        .otp-box { background-color: #172033; border: 2px dashed #4f46e5; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
        .otp-label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #818cf8; letter-spacing: 1px; margin-bottom: 8px; }
        .otp-code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; }
        .notice { font-size: 12px; color: #64748b; line-height: 1.5; border-top: 1px solid #1e293b; padding-top: 16px; }
        .footer { background-color: #080c14; padding: 16px; text-align: center; font-size: 11px; color: #475569; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">Stock<span>Sim</span></div>
          <p style="color: #c7d2fe; font-size: 13px; margin-top: 6px; margin-bottom: 0;">Sàn Giao Dịch Mô Phỏng Chứng Khoán</p>
        </div>
        <div class="content">
          <div class="greeting">Xin chào ${name},</div>
          <div class="desc">
            Cảm ơn bạn đã đăng ký tài khoản tại <strong>StockSim</strong>. Để hoàn tất quy trình kích hoạt tài khoản của mình, vui lòng nhập mã xác thực OTP sau đây:
          </div>
          <div class="otp-box">
            <div class="otp-label">MÃ XÁC NHẬN CỦA BẠN</div>
            <div class="otp-code">${otp}</div>
          </div>
          <div class="notice">
            ⏰ Mã này có hiệu lực trong vòng <strong>10 phút</strong>.<br>
            🔒 Tuyệt đối không chia sẻ mã OTP này với bất kỳ ai để bảo vệ tài khoản của bạn.
          </div>
        </div>
        <div class="footer">
          © 2026 StockSim Platform. Đây là email tự động, vui lòng không phản hồi lại thư này.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const sender = (process.env.SMTP_USER || 'phucle20704@gmail.com').trim();
    const info = await transporter.sendMail({
      from: `"StockSim Platform" <${sender}>`,
      to: email,
      subject: `[StockSim] ${otp} là mã xác thực đăng ký tài khoản của bạn`,
      html: htmlContent,
    });
    console.log(`✅ [EMAIL SENT SUCCESS] Gửi thành công tới: ${email} | MessageId: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error('❌ Lỗi khi gửi email qua SMTP:', err);
    return true;
  }
};

/**
 * Gửi email chứa mã xác nhận OTP đặt lại mật khẩu
 */
export const sendForgotPasswordEmail = async (email: string, otp: string, name: string): Promise<boolean> => {
  console.log('\n==================================================');
  console.log(`🔑 [EMAIL FORGOT PASSWORD OTP]`);
  console.log(`Gửi tới: ${name} <${email}>`);
  console.log(`MÃ ĐẶT LẠI MẬT KHẨU: >>> [ ${otp} ] <<<`);
  console.log(`Hiệu lực: 10 phút`);
  console.log('==================================================\n');

  const transporter = createTransporter();
  if (!transporter) {
    return true;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; margin: 0; padding: 20px; color: #f1f5f9; }
        .card { max-width: 520px; margin: 0 auto; background-color: #111827; border-radius: 16px; border: 1px solid #253047; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
        .header { background: linear-gradient(135deg, #1e1b4b, #312e81, #1e3a8a); padding: 30px 24px; text-align: center; }
        .logo { font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
        .logo span { color: #38bdf8; }
        .content { padding: 30px 24px; }
        .greeting { font-size: 16px; color: #e2e8f0; margin-bottom: 16px; font-weight: 600; }
        .desc { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
        .otp-box { background-color: #172033; border: 2px dashed #4f46e5; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
        .otp-label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #818cf8; letter-spacing: 1px; margin-bottom: 8px; }
        .otp-code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; }
        .notice { font-size: 12px; color: #64748b; line-height: 1.5; border-top: 1px solid #1e293b; padding-top: 16px; }
        .footer { background-color: #080c14; padding: 16px; text-align: center; font-size: 11px; color: #475569; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">Stock<span>Sim</span></div>
          <p style="color: #c7d2fe; font-size: 13px; margin-top: 6px; margin-bottom: 0;">Yêu cầu Đặt lại Mật khẩu</p>
        </div>
        <div class="content">
          <div class="greeting">Xin chào ${name},</div>
          <div class="desc">
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>StockSim</strong> của bạn. Vui lòng nhập mã xác nhận OTP sau đây để thiết lập mật khẩu mới:
          </div>
          <div class="otp-box">
            <div class="otp-label">MÃ XÁC THỰC ĐẶT LẠI MẬT KHẨU</div>
            <div class="otp-code">${otp}</div>
          </div>
          <div class="notice">
            ⏰ Mã này có hiệu lực trong vòng <strong>10 phút</strong>.<br>
            🔒 Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc đổi mật khẩu để bảo đảm an toàn.
          </div>
        </div>
        <div class="footer">
          © 2026 StockSim Platform. Đây là email tự động, vui lòng không phản hồi lại thư này.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const sender = (process.env.SMTP_USER || 'phucle20704@gmail.com').trim();
    const info = await transporter.sendMail({
      from: `"StockSim Security" <${sender}>`,
      to: email,
      subject: `[StockSim] ${otp} là mã xác nhận đặt lại mật khẩu của bạn`,
      html: htmlContent,
    });
    console.log(`✅ [EMAIL SENT SUCCESS] Gửi thành công tới: ${email} | MessageId: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error('❌ Lỗi khi gửi email qua SMTP:', err);
    return true;
  }
};

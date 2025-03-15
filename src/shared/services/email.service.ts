import { Injectable } from '@nestjs/common'
import fs from 'fs'
import path from 'path'
import { Resend } from 'resend'
import envConfig from 'src/shared/config'


const otpTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/otp.html'), { encoding: 'utf-8' })
@Injectable()
export class EmailService {
  private resend: Resend
  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }

  sendOTP(payload: { email: string; code: string }) {
    const subject = 'Mã OTP'
    return this.resend.emails.send({
      from: 'Ecommerce <no-reply@gocnhinkhacbiet.tech>',
      to: [payload.email],
      subject,
      html: otpTemplate.replace('{{subject}}', subject).replace('{{code}}', payload.code),
    })
  }
}
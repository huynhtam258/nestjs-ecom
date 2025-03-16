import { Injectable } from '@nestjs/common'
import fs from 'fs'
import path from 'path'
import { Resend } from 'resend'
import envConfig from 'src/shared/config'
import * as React from 'react'
import { OTPEmail } from 'emails/otp'
import { render } from '@react-email/render'


const otpTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/otp.html'), { encoding: 'utf-8' })
@Injectable()
export class EmailService {
  private resend: Resend
  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }

  async sendOTP(payload: { email: string; code: string }) {
    const subject = 'Mã OTP'
    const html = await render(React.createElement(OTPEmail, { otpCode: payload.code, title: subject }), {
      pretty: true,
    })
    return this.resend.emails.send({
      from: 'Ecommerce <no-reply@gocnhinkhacbiet.tech>',
      to: [payload.email],
      subject,
      // react: <OTPEmail otpCode={payload.code} title={subject} />,
      html,
    })
  }
}
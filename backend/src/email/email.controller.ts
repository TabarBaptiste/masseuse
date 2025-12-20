import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { EmailService } from './email.service';
import { SendContactDto } from './dto';

@Controller('contact')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 emails par minute max
  async sendContactMessage(@Body() sendContactDto: SendContactDto) {
    await this.emailService.sendContactEmail(sendContactDto);
    return {
      message: 'Message envoyé avec succès',
      success: true,
    };
  }
}

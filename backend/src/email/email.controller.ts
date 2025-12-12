import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendContactDto } from './dto';

@Controller('contact')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  async sendContactMessage(@Body() sendContactDto: SendContactDto) {
    await this.emailService.sendContactEmail(sendContactDto);
    return {
      message: 'Message envoyé avec succès',
      success: true,
    };
  }
}

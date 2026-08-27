import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IsEmail, IsIn, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
class NewsletterDto { @IsEmail() email!: string; @IsOptional() @IsString() @MaxLength(80) name?: string; @IsOptional() @IsString() @MaxLength(80) source?: string; }
class ContactDto { @IsString() @Length(2, 120) name!: string; @IsEmail() email!: string; @IsOptional() @IsIn(['LISTING', 'PARTNERSHIP', 'SUPPORT', 'GENERAL', 'Submit Software for Review', 'Partnership', 'Support', 'General']) inquiryType?: string; @IsString() @Length(10, 5000) message!: string; }
@Controller() export class FormsController {
  constructor(private readonly prisma: PrismaService) {}
  @Post('newsletter/subscribe') @Throttle({ default: { limit: 5, ttl: 60_000 } }) async subscribe(@Body() body: NewsletterDto) { const email = body.email.trim().toLowerCase(); await this.prisma.newsletterSubscriber.upsert({ where: { email }, update: { status: 'Active', name: body.name, source: body.source || 'website' }, create: { email, name: body.name, source: body.source || 'website' } }); return { success: true, message: 'You are subscribed.' }; }
  @Post('contact') @Throttle({ default: { limit: 5, ttl: 60_000 } }) async contact(@Body() body: ContactDto) { const normalized = String(body.inquiryType || 'GENERAL').replace('Submit Software for Review', 'LISTING').replace('Partnership', 'PARTNERSHIP').replace('Support', 'SUPPORT').replace('General', 'GENERAL') as 'LISTING' | 'PARTNERSHIP' | 'SUPPORT' | 'GENERAL'; await this.prisma.contactMessage.create({ data: { name: body.name.trim(), email: body.email.trim().toLowerCase(), inquiryType: normalized, message: body.message.trim() } }); return { success: true, message: 'Message received.' }; }
}

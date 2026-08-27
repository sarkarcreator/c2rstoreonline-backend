import { Controller, Get, NotFoundException, Param, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { safeExternalUrl } from '../common/url';
@Controller('go') export class AffiliatesController {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}
  @Get(':slug') async redirect(@Param('slug') slug: string, @Req() request: Request, @Res() response: Response) { const tool = await this.prisma.tool.findUnique({ where: { slug }, include: { affiliateNetwork: true } }); if (!tool) throw new NotFoundException('Tool not found'); const destination = safeExternalUrl(tool.affiliateUrl || tool.officialUrl); if (!destination) throw new NotFoundException('No valid affiliate destination configured'); destination.searchParams.set('utm_source', tool.affiliateNetwork?.defaultUtmSource || 'c2rstore'); destination.searchParams.set('utm_medium', 'affiliate'); destination.searchParams.set('utm_campaign', tool.slug); const ip = String(request.headers['x-forwarded-for'] || request.ip || '').split(',')[0].trim(); const ipHash = createHmac('sha256', this.config.getOrThrow<string>('JWT_SECRET')).update(ip).digest('hex').slice(0, 32); await this.prisma.$transaction([this.prisma.affiliateClick.create({ data: { toolId: tool.id, toolSlug: tool.slug, toolName: tool.name, targetUrl: destination.toString(), referrer: request.get('referer') || undefined, utmSource: destination.searchParams.get('utm_source') || undefined, utmMedium: destination.searchParams.get('utm_medium') || undefined, utmCampaign: destination.searchParams.get('utm_campaign') || undefined, ipHash } }), this.prisma.tool.update({ where: { id: tool.id }, data: { clicksCount: { increment: 1 } } })]); return response.redirect(302, destination.toString()); }
}

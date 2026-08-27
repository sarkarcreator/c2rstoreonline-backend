import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Res, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { AdminGuard } from '../common/guards/admin.guard';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogService } from '../catalog/catalog.service';
class LoginDto { @IsString() @MinLength(8) password!: string; }
@Controller('admin') export class AdminController {
  constructor(private readonly auth: AuthService, private readonly prisma: PrismaService, private readonly catalog: CatalogService) {}
  @Post('auth/login') @HttpCode(200) async login(@Body() body: LoginDto, @Res({ passthrough: true }) response: Response) { const value = await this.auth.login(body.password); response.cookie('c2r_admin', value.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 8 * 60 * 60 * 1000, path: '/' }); return { success: true, admin: value.admin }; }
  @Post('auth/logout') @HttpCode(200) logout(@Res({ passthrough: true }) response: Response) { response.clearCookie('c2r_admin', { path: '/' }); return { success: true }; }
  @Get('auth/session') @UseGuards(AdminGuard) session() { return { authenticated: true }; }
  @Get('stats') @UseGuards(AdminGuard) async stats() { const [tools, clicks, subscribers, messages, recentClicks] = await Promise.all([this.prisma.tool.count(), this.prisma.affiliateClick.count(), this.prisma.newsletterSubscriber.count(), this.prisma.contactMessage.count(), this.prisma.affiliateClick.findMany({ take: 10, orderBy: { timestamp: 'desc' } })]); return { tools, clicks, subscribers, messages, recentClicks }; }
  @Post('tools') @UseGuards(AdminGuard) async createTool(@Body() body: Record<string, unknown>) { return { success: true, tool: await this.catalog.createTool(body) }; }
  @Get('tools') @UseGuards(AdminGuard) async tools() { return this.catalog.tools({ limit: '100' }); }
  @Put('tools/:id') @UseGuards(AdminGuard) async updateTool(@Param('id') id: string, @Body() body: Record<string, unknown>) { return { success: true, tool: await this.prisma.tool.update({ where: { id }, data: body as any }) }; }
  @Delete('tools/:id') @UseGuards(AdminGuard) async deleteTool(@Param('id') id: string) { await this.prisma.tool.delete({ where: { id } }); return { success: true }; }

  @Get('categories') @UseGuards(AdminGuard) async categories() { return { categories: await this.prisma.category.findMany({ orderBy: { name: 'asc' } }) }; }
  @Post('categories') @UseGuards(AdminGuard) async createCategory(@Body() body: Record<string, unknown>) { return { success: true, category: await this.prisma.category.create({ data: body as any }) }; }
  @Put('categories/:id') @UseGuards(AdminGuard) async updateCategory(@Param('id') id: string, @Body() body: Record<string, unknown>) { return { success: true, category: await this.prisma.category.update({ where: { id }, data: body as any }) }; }
  @Delete('categories/:id') @UseGuards(AdminGuard) async deleteCategory(@Param('id') id: string) { await this.prisma.category.delete({ where: { id } }); return { success: true }; }

  @Get('comparisons') @UseGuards(AdminGuard) async comparisons() { return { comparisons: await this.prisma.comparison.findMany({ orderBy: { createdAt: 'desc' } }) }; }
  @Post('comparisons') @UseGuards(AdminGuard) async createComparison(@Body() body: Record<string, unknown>) { return { success: true, comparison: await this.prisma.comparison.create({ data: body as any }) }; }
  @Put('comparisons/:id') @UseGuards(AdminGuard) async updateComparison(@Param('id') id: string, @Body() body: Record<string, unknown>) { return { success: true, comparison: await this.prisma.comparison.update({ where: { id }, data: body as any }) }; }
  @Delete('comparisons/:id') @UseGuards(AdminGuard) async deleteComparison(@Param('id') id: string) { await this.prisma.comparison.delete({ where: { id } }); return { success: true }; }

  @Get('deals') @UseGuards(AdminGuard) async deals() { return { deals: await this.prisma.deal.findMany({ include: { tool: true }, orderBy: { expiresAt: 'asc' } }) }; }
  @Post('deals') @UseGuards(AdminGuard) async createDeal(@Body() body: Record<string, unknown>) { return { success: true, deal: await this.prisma.deal.create({ data: body as any }) }; }
  @Put('deals/:id') @UseGuards(AdminGuard) async updateDeal(@Param('id') id: string, @Body() body: Record<string, unknown>) { return { success: true, deal: await this.prisma.deal.update({ where: { id }, data: body as any }) }; }
  @Delete('deals/:id') @UseGuards(AdminGuard) async deleteDeal(@Param('id') id: string) { await this.prisma.deal.delete({ where: { id } }); return { success: true }; }

  @Get('guides') @UseGuards(AdminGuard) async guides() { return { guides: await this.prisma.guide.findMany({ orderBy: { publishedAt: 'desc' } }) }; }
  @Post('guides') @UseGuards(AdminGuard) async createGuide(@Body() body: Record<string, unknown>) { return { success: true, guide: await this.prisma.guide.create({ data: body as any }) }; }
  @Put('guides/:id') @UseGuards(AdminGuard) async updateGuide(@Param('id') id: string, @Body() body: Record<string, unknown>) { return { success: true, guide: await this.prisma.guide.update({ where: { id }, data: body as any }) }; }
  @Delete('guides/:id') @UseGuards(AdminGuard) async deleteGuide(@Param('id') id: string) { await this.prisma.guide.delete({ where: { id } }); return { success: true }; }

  @Get('free-tools') @UseGuards(AdminGuard) async freeTools() { return { freeTools: await this.prisma.freeTool.findMany({ orderBy: { name: 'asc' } }) }; }
  @Post('free-tools') @UseGuards(AdminGuard) async createFreeTool(@Body() body: Record<string, unknown>) { return { success: true, freeTool: await this.prisma.freeTool.create({ data: body as any }) }; }
  @Put('free-tools/:id') @UseGuards(AdminGuard) async updateFreeTool(@Param('id') id: string, @Body() body: Record<string, unknown>) { return { success: true, freeTool: await this.prisma.freeTool.update({ where: { id }, data: body as any }) }; }
  @Delete('free-tools/:id') @UseGuards(AdminGuard) async deleteFreeTool(@Param('id') id: string) { await this.prisma.freeTool.delete({ where: { id } }); return { success: true }; }

  @Get('affiliate-networks') @UseGuards(AdminGuard) async networks() { return { affiliateNetworks: await this.prisma.affiliateNetwork.findMany({ orderBy: { name: 'asc' } }) }; }
  @Post('affiliate-networks') @UseGuards(AdminGuard) async createNetwork(@Body() body: Record<string, unknown>) { return { success: true, affiliateNetwork: await this.prisma.affiliateNetwork.create({ data: body as any }) }; }
  @Put('affiliate-networks/:id') @UseGuards(AdminGuard) async updateNetwork(@Param('id') id: string, @Body() body: Record<string, unknown>) { return { success: true, affiliateNetwork: await this.prisma.affiliateNetwork.update({ where: { id }, data: body as any }) }; }
  @Delete('affiliate-networks/:id') @UseGuards(AdminGuard) async deleteNetwork(@Param('id') id: string) { await this.prisma.affiliateNetwork.delete({ where: { id } }); return { success: true }; }
}

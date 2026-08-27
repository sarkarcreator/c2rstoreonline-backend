import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
@Controller() export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}
  @Get('tools') async tools(@Query() query: Record<string, string>) { return this.catalog.tools(query); }
  @Get('tools/:slug') async tool(@Param('slug') slug: string) { return { tool: await this.catalog.toolBySlug(slug) }; }
  @Get('categories') async categories() { return { categories: await this.catalog.categories() }; }
  @Get('categories/:slug') async category(@Param('slug') slug: string) { return { category: await this.catalog.categoryBySlug(slug) }; }
  @Get('comparisons') async comparisons() { return { comparisons: await this.catalog.comparisons() }; }
  @Get('comparisons/:slug') async comparison(@Param('slug') slug: string) { return { comparison: await this.catalog.comparison(slug) }; }
  @Get('deals') async deals(@Query() query: Record<string, string>) { return { deals: await this.catalog.deals(query) }; }
  @Post('deals/:id/upvote') async upvote(@Param('id') id: string) { return { success: true, deal: await this.catalog.upvoteDeal(id) }; }
  @Get('guides') async guides() { return { guides: await this.catalog.guides() }; }
  @Get('guides/:slug') async guide(@Param('slug') slug: string) { return { guide: await this.catalog.guide(slug) }; }
  @Get('free-tools') async freeTools() { return { freeTools: await this.catalog.freeTools() }; }
  @Get('free-tools/:slug') async freeTool(@Param('slug') slug: string) { return { freeTool: await this.catalog.freeTool(slug) }; }
  @Get('search') async search(@Query('q') q = '') { return this.catalog.search(q); }
}

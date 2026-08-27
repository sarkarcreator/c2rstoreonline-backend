import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
class GenerateDto { @IsOptional() @IsString() @MaxLength(100) toolSlug?: string; @IsOptional() @IsObject() inputValues?: Record<string, unknown>; @IsOptional() @IsString() @MaxLength(2000) customPrompt?: string; }
@Controller('ai') export class AiController {
  constructor(private readonly prisma: PrismaService, private readonly ai: AiService) {}
  @Post('generate') @Throttle({ default: { limit: 10, ttl: 60_000 } }) async generate(@Body() body: GenerateDto) { let prompt = body.customPrompt?.trim() || ''; let system = 'You are a helpful C2R Store Online business assistant.'; if (body.toolSlug) { const tool = await this.prisma.freeTool.findUnique({ where: { slug: body.toolSlug.trim().toLowerCase() } }); if (!tool) throw new Error('Free tool not found'); prompt = tool.promptTemplate; system = tool.systemPrompt; Object.entries(body.inputValues || {}).forEach(([key, value]) => { prompt = prompt.replaceAll(`{{${key.replace(/[^a-zA-Z0-9_-]/g, '')}}}`, String(value).replace(/<[^>]*>/g, '').slice(0, 1000)); }); } if (prompt.length < 3 || prompt.length > 2000) throw new Error('Prompt must be between 3 and 2000 characters'); return { success: true, result: await this.ai.generate(prompt, system), generatedAt: new Date().toISOString() }; }
}

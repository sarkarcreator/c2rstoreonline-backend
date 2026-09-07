import { createHmac } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { login, requireAdmin } from '@/lib/auth';
import { catalog } from '@/lib/catalog';
import { generateAi } from '@/lib/ai';
import { safeExternalUrl } from '@/lib/url';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limits = new Map<string, { count: number; reset: number }>();
const adminModels = { tools: 'tool', categories: 'category', comparisons: 'comparison', deals: 'deal', guides: 'guide', 'free-tools': 'freeTool', 'affiliate-networks': 'affiliateNetwork' } as const;
const adminKeys = { tools: 'tool', categories: 'category', comparisons: 'comparison', deals: 'deal', guides: 'guide', 'free-tools': 'freeTool', 'affiliate-networks': 'affiliateNetwork' } as const;
const inquiryTypes = new Set(['LISTING', 'PARTNERSHIP', 'SUPPORT', 'GENERAL', 'Submit Software for Review', 'Partnership', 'Support', 'General']);
type AdminResource = keyof typeof adminModels;

function rateLimit(request: Request, limit: number) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const key = `${ip}:${new URL(request.url).pathname}`;
  const now = Date.now();
  const current = limits.get(key);
  if (!current || current.reset <= now) limits.set(key, { count: 1, reset: now + 60_000 });
  else { current.count++; if (current.count > limit) throw new Error('RATE_LIMITED'); }
}

function json(data: unknown, status = 200) { return NextResponse.json(data, { status }); }

function cors(request: Request, response: NextResponse) {
  const origin = request.headers.get('origin');
  const allowed = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(v => v.trim()).filter(Boolean);
  if (origin && allowed.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Vary', 'Origin');
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production') response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  return response;
}

function errorResponse(request: Request, error: unknown) {
  const message = String((error as any)?.message || 'Internal server error');
  const [code, detail] = message.split(':', 2);
  const status = code === 'UNAUTHORIZED' || code === 'INVALID_CREDENTIALS' ? 401 : code === 'FORBIDDEN' ? 403 : code === 'NOT_FOUND' ? 404 : code === 'RATE_LIMITED' ? 429 : code === 'AI_NOT_CONFIGURED' || code === 'AI_TIMEOUT' || code === 'AI_NO_CONTENT' || code === 'JWT_NOT_CONFIGURED' ? 503 : code === 'BAD_REQUEST' ? 400 : 500;
  return cors(request, json({ success: false, message: detail || message }, status));
}

async function body(request: Request) {
  try { return await request.json(); } catch { throw new Error('BAD_REQUEST:Invalid JSON body'); }
}

function model(resource: string): any { return (prisma as any)[adminModels[resource as AdminResource]]; }

async function handle(request: Request, path: string[], method: string) {
  if (method === 'OPTIONS') return cors(request, new NextResponse(null, { status: 204 }));
  const p = path.map(decodeURIComponent);

  if (p[0] === 'admin') {
    if (p[1] === 'auth' && p[2] === 'login' && method === 'POST') {
      rateLimit(request, 5);
      const b = await body(request);
      if (typeof b?.password !== 'string' || b.password.length < 8) throw new Error('BAD_REQUEST:Invalid password');
      const value = await login(b.password);
      const response = json({ success: true, admin: value.admin });
      response.cookies.set('c2r_admin', value.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 8 * 60 * 60, path: '/' });
      return cors(request, response);
    }
    if (p[1] === 'auth' && p[2] === 'logout' && method === 'POST') {
      const response = json({ success: true });
      response.cookies.set('c2r_admin', '', { httpOnly: true, expires: new Date(0), path: '/' });
      return cors(request, response);
    }
    requireAdmin(request);
    if (p[1] === 'auth' && p[2] === 'session' && method === 'GET') return json({ authenticated: true });
    if (p[1] === 'stats' && method === 'GET') {
      const [tools, clicks, subscribers, messages, recentClicks] = await Promise.all([
        prisma.tool.count(), prisma.affiliateClick.count(), prisma.newsletterSubscriber.count(), prisma.contactMessage.count(),
        prisma.affiliateClick.findMany({ take: 10, orderBy: { timestamp: 'desc' } }),
      ]);
      return json({ tools, clicks, subscribers, messages, recentClicks });
    }
    const resource = p[1] as AdminResource;
    if (!adminModels[resource]) throw new Error('NOT_FOUND:Admin resource not found');
    const id = p[2];
    const db = model(resource);
    if (method === 'GET' && !id) {
      if (resource === 'tools') return json(await catalog.tools({ limit: '100' }));
      const options: any = resource === 'deals' ? { include: { tool: true }, orderBy: { expiresAt: 'asc' } }
        : resource === 'guides' ? { orderBy: { publishedAt: 'desc' } }
        : resource === 'categories' || resource === 'affiliate-networks' || resource === 'free-tools' ? { orderBy: { name: 'asc' } }
        : { orderBy: { createdAt: 'desc' } };
      const values = await db.findMany(options);
      return json({ [resource]: values });
    }
    if (method === 'POST' && !id) {
      const b = await body(request);
      const value = resource === 'tools' ? await catalog.createTool(b) : await db.create({ data: b });
      return json({ success: true, [adminKeys[resource]]: value });
    }
    if (id && method === 'PUT') {
      const value = await db.update({ where: { id }, data: await body(request) });
      return json({ success: true, [adminKeys[resource]]: value });
    }
    if (id && method === 'DELETE') { await db.delete({ where: { id } }); return json({ success: true }); }
    throw new Error('NOT_FOUND:Admin endpoint not found');
  }

  if (p[0] === 'go' && p[1] && method === 'GET') {
    const tool = await prisma.tool.findUnique({ where: { slug: p[1] }, include: { affiliateNetwork: true } });
    if (!tool) throw new Error('NOT_FOUND:Tool not found');
    const destination = safeExternalUrl(tool.affiliateUrl || tool.officialUrl);
    if (!destination) throw new Error('NOT_FOUND:No valid affiliate destination configured');
    destination.searchParams.set('utm_source', tool.affiliateNetwork?.defaultUtmSource || 'c2rstore');
    destination.searchParams.set('utm_medium', 'affiliate');
    destination.searchParams.set('utm_campaign', tool.slug);
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_NOT_CONFIGURED');
    const ipHash = createHmac('sha256', secret).update(ip).digest('hex').slice(0, 32);
    await prisma.$transaction([
      prisma.affiliateClick.create({ data: { toolId: tool.id, toolSlug: tool.slug, toolName: tool.name, targetUrl: destination.toString(), referrer: request.headers.get('referer') || undefined, utmSource: destination.searchParams.get('utm_source') || undefined, utmMedium: destination.searchParams.get('utm_medium') || undefined, utmCampaign: destination.searchParams.get('utm_campaign') || undefined, ipHash } }),
      prisma.tool.update({ where: { id: tool.id }, data: { clicksCount: { increment: 1 } } }),
    ]);
    return NextResponse.redirect(destination.toString(), 302);
  }

  if (p[0] === 'newsletter' && p[1] === 'subscribe' && method === 'POST') {
    rateLimit(request, 5);
    const b = await body(request);
    const email = String(b?.email || '').trim().toLowerCase();
    const name = b?.name == null ? undefined : String(b.name).trim();
    const source = b?.source == null ? 'website' : String(b.source).trim();
    if (!/^\S+@\S+\.\S+$/.test(email) || name && name.length > 80 || source.length > 80) throw new Error('BAD_REQUEST:Invalid newsletter details');
    await prisma.newsletterSubscriber.upsert({ where: { email }, update: { status: 'Active', name, source }, create: { email, name, source } });
    return json({ success: true, message: 'You are subscribed.' });
  }

  if (p[0] === 'contact' && method === 'POST') {
    rateLimit(request, 5);
    const b = await body(request);
    const name = String(b?.name || '').trim();
    const email = String(b?.email || '').trim().toLowerCase();
    const message = String(b?.message || '').trim();
    const inquiryType = String(b?.inquiryType || 'GENERAL');
    if (name.length < 2 || name.length > 120 || !/^\S+@\S+\.\S+$/.test(email) || message.length < 10 || message.length > 5000 || !inquiryTypes.has(inquiryType)) throw new Error('BAD_REQUEST:Invalid contact details');
    const normalized = inquiryType.replace('Submit Software for Review', 'LISTING').replace('Partnership', 'PARTNERSHIP').replace('Support', 'SUPPORT').replace('General', 'GENERAL') as any;
    await prisma.contactMessage.create({ data: { name, email, inquiryType: normalized, message } });
    return json({ success: true, message: 'Message received.' });
  }

  if (p[0] === 'ai' && p[1] === 'generate' && method === 'POST') {
    rateLimit(request, 10);
    const b = await body(request);
    if (b?.toolSlug != null && (typeof b.toolSlug !== 'string' || b.toolSlug.length > 100)) throw new Error('BAD_REQUEST:Invalid tool slug');
    if (b?.customPrompt != null && (typeof b.customPrompt !== 'string' || b.customPrompt.length > 2000)) throw new Error('BAD_REQUEST:Invalid prompt');
    if (b?.inputValues != null && (typeof b.inputValues !== 'object' || Array.isArray(b.inputValues) || b.inputValues === null)) throw new Error('BAD_REQUEST:Invalid input values');
    let prompt = String(b?.customPrompt || '').trim();
    let system = 'You are a helpful C2R Store Online business assistant.';
    if (b?.toolSlug) {
      const tool = await prisma.freeTool.findUnique({ where: { slug: String(b.toolSlug).trim().toLowerCase() } });
      if (!tool) throw new Error('NOT_FOUND:Free tool not found');
      prompt = tool.promptTemplate;
      system = tool.systemPrompt;
      Object.entries(b.inputValues || {}).forEach(([key, value]) => { prompt = prompt.replaceAll(`{{${key.replace(/[^a-zA-Z0-9_-]/g, '')}}}`, String(value).replace(/<[^>]*>/g, '').slice(0, 1000)); });
    }
    if (prompt.length < 3 || prompt.length > 2000) throw new Error('BAD_REQUEST:Prompt must be between 3 and 2000 characters');
    return json({ success: true, result: await generateAi(prompt, system), generatedAt: new Date().toISOString() });
  }

  if (p[0] === 'deals' && p[1] && p[2] === 'upvote' && method === 'POST') return json({ success: true, deal: await catalog.upvoteDeal(p[1]) });

  if (method === 'GET') {
    const query = Object.fromEntries(new URL(request.url).searchParams.entries());
    if (p[0] === 'tools' && !p[1]) return json(await catalog.tools(query));
    if (p[0] === 'tools' && p[1]) { await prisma.tool.update({ where: { slug: p[1] }, data: { viewsCount: { increment: 1 } } }).catch(() => undefined); return json({ tool: await catalog.toolBySlug(p[1]) }); }
    if (p[0] === 'categories' && !p[1]) return json({ categories: await catalog.categories() });
    if (p[0] === 'categories' && p[1]) return json({ category: await catalog.categoryBySlug(p[1]) });
    if (p[0] === 'comparisons' && !p[1]) return json({ comparisons: await catalog.comparisons() });
    if (p[0] === 'comparisons' && p[1]) return json({ comparison: await catalog.comparison(p[1]) });
    if (p[0] === 'deals' && !p[1]) return json({ deals: await catalog.deals(query) });
    if (p[0] === 'guides' && !p[1]) return json({ guides: await catalog.guides() });
    if (p[0] === 'guides' && p[1]) return json({ guide: await catalog.guide(p[1]) });
    if (p[0] === 'free-tools' && !p[1]) return json({ freeTools: await catalog.freeTools() });
    if (p[0] === 'free-tools' && p[1]) return json({ freeTool: await catalog.freeTool(p[1]) });
    if (p[0] === 'search') return json(await catalog.search(query.q || ''));
  }
  throw new Error('NOT_FOUND:Endpoint not found');
}

export async function OPTIONS(request: Request) { return handle(request, [], 'OPTIONS').catch(e => errorResponse(request, e)); }
export async function GET(request: Request, context: { params: Promise<{ path?: string[] }> }) { try { return cors(request, await handle(request, (await context.params).path || [], 'GET')); } catch (e) { return errorResponse(request, e); } }
export async function POST(request: Request, context: { params: Promise<{ path?: string[] }> }) { try { return cors(request, await handle(request, (await context.params).path || [], 'POST')); } catch (e) { return errorResponse(request, e); } }
export async function PUT(request: Request, context: { params: Promise<{ path?: string[] }> }) { try { return cors(request, await handle(request, (await context.params).path || [], 'PUT')); } catch (e) { return errorResponse(request, e); } }
export async function PATCH(request: Request, context: { params: Promise<{ path?: string[] }> }) { try { return cors(request, await handle(request, (await context.params).path || [], 'PATCH')); } catch (e) { return errorResponse(request, e); } }
export async function DELETE(request: Request, context: { params: Promise<{ path?: string[] }> }) { try { return cors(request, await handle(request, (await context.params).path || [], 'DELETE')); } catch (e) { return errorResponse(request, e); } }

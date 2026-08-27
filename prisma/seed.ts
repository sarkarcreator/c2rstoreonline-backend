import { PrismaClient, PriceType, Role, NetworkStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import {
  INITIAL_CATEGORIES,
  INITIAL_TOOLS,
  INITIAL_COMPARISONS,
  INITIAL_DEALS,
  INITIAL_GUIDES,
  INITIAL_FREE_TOOLS,
  INITIAL_AFFILIATE_NETWORKS
} from './source-mock-data';

const prisma = new PrismaClient();

function mapPriceType(pt: string): PriceType {
  const norm = pt.toLowerCase().replace(/\s+/g, '_');
  if (norm.includes('free_trial') || norm === 'free_trial' || norm === 'freetrial') return PriceType.FREE_TRIAL;
  if (norm.includes('freemium')) return PriceType.FREEMIUM;
  if (norm.includes('free')) return PriceType.FREE;
  return PriceType.PAID;
}

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Admin User
  const defaultAdminEmail = process.env.ADMIN_EMAIL;
  const defaultAdminPassword = process.env.ADMIN_PASSWORD;
  if (!defaultAdminEmail || !defaultAdminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required to seed the initial admin account.');
  }
  const passwordHash = await bcrypt.hash(defaultAdminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: defaultAdminEmail },
    update: {
      passwordHash,
      role: Role.ADMIN,
    },
    create: {
      email: defaultAdminEmail,
      name: 'C2R System Administrator',
      passwordHash,
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin user verified: ${admin.email}`);

  // 2. Seed Affiliate Networks
  for (const net of INITIAL_AFFILIATE_NETWORKS) {
    await prisma.affiliateNetwork.upsert({
      where: { name: net.name },
      update: {
        website: net.website,
        trackingParamTemplate: net.trackingParamTemplate,
        defaultUtmSource: 'c2rstore',
        status: net.status === 'Active' ? NetworkStatus.ACTIVE : NetworkStatus.PAUSED,
      },
      create: {
        id: net.id,
        name: net.name,
        website: net.website,
        trackingParamTemplate: net.trackingParamTemplate,
        defaultUtmSource: 'c2rstore',
        status: net.status === 'Active' ? NetworkStatus.ACTIVE : NetworkStatus.PAUSED,
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_AFFILIATE_NETWORKS.length} affiliate networks`);

  // 3. Seed Categories
  for (const cat of INITIAL_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        subCategories: cat.subCategories,
        seoTitle: cat.seoTitle,
        seoDescription: cat.seoDescription,
        introContent: cat.introContent,
        faqs: cat.faqs as any,
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        subCategories: cat.subCategories,
        seoTitle: cat.seoTitle,
        seoDescription: cat.seoDescription,
        introContent: cat.introContent,
        faqs: cat.faqs as any,
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_CATEGORIES.length} categories`);

  // 4. Seed Tools
  for (const tool of INITIAL_TOOLS) {
    await prisma.tool.upsert({
      where: { id: tool.id },
      update: {
        name: tool.name,
        slug: tool.slug,
        tagline: tool.tagline,
        description: tool.description,
        longReview: tool.longReview,
        logo: tool.logo,
        categoryId: tool.categoryId,
        subCategory: tool.subCategory,
        rating: tool.rating,
        reviewCount: tool.reviewCount,
        priceType: mapPriceType(tool.priceType),
        startingPrice: tool.startingPrice,
        freePlanAvailable: tool.freePlanAvailable,
        freeTrialDays: tool.freeTrialDays,
        pricingTiers: tool.pricingTiers as any,
        officialUrl: tool.officialUrl,
        affiliateUrl: tool.affiliateUrl,
        features: tool.features,
        pros: tool.pros,
        cons: tool.cons,
        bestFor: tool.bestFor,
        alternatives: tool.alternatives,
        screenshots: tool.screenshots,
        faqs: tool.faqs as any,
        isFeatured: tool.isFeatured,
        isTrending: tool.isTrending,
        isVerified: tool.isVerified,
        viewsCount: tool.viewsCount || 0,
        clicksCount: tool.clicksCount || 0,
      },
      create: {
        id: tool.id,
        name: tool.name,
        slug: tool.slug,
        tagline: tool.tagline,
        description: tool.description,
        longReview: tool.longReview,
        logo: tool.logo,
        categoryId: tool.categoryId,
        subCategory: tool.subCategory,
        rating: tool.rating,
        reviewCount: tool.reviewCount,
        priceType: mapPriceType(tool.priceType),
        startingPrice: tool.startingPrice,
        freePlanAvailable: tool.freePlanAvailable,
        freeTrialDays: tool.freeTrialDays,
        pricingTiers: tool.pricingTiers as any,
        officialUrl: tool.officialUrl,
        affiliateUrl: tool.affiliateUrl,
        features: tool.features,
        pros: tool.pros,
        cons: tool.cons,
        bestFor: tool.bestFor,
        alternatives: tool.alternatives,
        screenshots: tool.screenshots,
        faqs: tool.faqs as any,
        isFeatured: tool.isFeatured,
        isTrending: tool.isTrending,
        isVerified: tool.isVerified,
        viewsCount: tool.viewsCount || 0,
        clicksCount: tool.clicksCount || 0,
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_TOOLS.length} tools`);

  // 5. Seed Deals
  for (const deal of INITIAL_DEALS) {
    await prisma.deal.upsert({
      where: { id: deal.id },
      update: {
        toolId: deal.toolId,
        title: deal.title,
        discount: deal.discount,
        couponCode: deal.couponCode || null,
        expiresAt: new Date(deal.expiresAt),
        affiliateUrl: deal.affiliateUrl,
        terms: deal.terms,
        isVerified: deal.isVerified,
        isExclusive: deal.isExclusive,
        category: deal.category,
        upvotes: deal.upvotes,
      },
      create: {
        id: deal.id,
        toolId: deal.toolId,
        title: deal.title,
        discount: deal.discount,
        couponCode: deal.couponCode || null,
        expiresAt: new Date(deal.expiresAt),
        affiliateUrl: deal.affiliateUrl,
        terms: deal.terms,
        isVerified: deal.isVerified,
        isExclusive: deal.isExclusive,
        category: deal.category,
        upvotes: deal.upvotes,
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_DEALS.length} deals`);

  // 6. Seed Comparisons
  for (const comp of INITIAL_COMPARISONS) {
    await prisma.comparison.upsert({
      where: { slug: comp.slug },
      update: {
        toolAId: comp.toolAId,
        toolBId: comp.toolBId,
        toolASlug: comp.toolASlug,
        toolBSlug: comp.toolBSlug,
        title: comp.title,
        summary: comp.summary,
        verdict: comp.verdict,
        winnerSlug: comp.winnerSlug,
        scoreA: comp.scoreA,
        scoreB: comp.scoreB,
        categoriesCompared: comp.categoriesCompared as any,
        priceComparison: comp.priceComparison,
        bestForA: comp.bestForA,
        bestForB: comp.bestForB,
        prosA: comp.prosA,
        prosB: comp.prosB,
        consA: comp.consA,
        consB: comp.consB,
        faqs: comp.faqs as any,
      },
      create: {
        id: comp.id,
        slug: comp.slug,
        toolAId: comp.toolAId,
        toolBId: comp.toolBId,
        toolASlug: comp.toolASlug,
        toolBSlug: comp.toolBSlug,
        title: comp.title,
        summary: comp.summary,
        verdict: comp.verdict,
        winnerSlug: comp.winnerSlug,
        scoreA: comp.scoreA,
        scoreB: comp.scoreB,
        categoriesCompared: comp.categoriesCompared as any,
        priceComparison: comp.priceComparison,
        bestForA: comp.bestForA,
        bestForB: comp.bestForB,
        prosA: comp.prosA,
        prosB: comp.prosB,
        consA: comp.consA,
        consB: comp.consB,
        faqs: comp.faqs as any,
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_COMPARISONS.length} comparisons`);

  // 7. Seed Guides
  for (const guide of INITIAL_GUIDES) {
    await prisma.guide.upsert({
      where: { slug: guide.slug },
      update: {
        title: guide.title,
        excerpt: guide.excerpt,
        content: guide.content,
        category: guide.category,
        authorName: guide.author.name,
        authorRole: guide.author.role,
        authorAvatar: guide.author.avatar,
        featuredImage: guide.featuredImage,
        readTimeMinutes: guide.readTimeMinutes,
        recommendedToolSlugs: guide.recommendedToolSlugs,
        faqs: guide.faqs as any,
        tableOfContents: guide.tableOfContents as any,
      },
      create: {
        id: guide.id,
        slug: guide.slug,
        title: guide.title,
        excerpt: guide.excerpt,
        content: guide.content,
        category: guide.category,
        authorName: guide.author.name,
        authorRole: guide.author.role,
        authorAvatar: guide.author.avatar,
        featuredImage: guide.featuredImage,
        readTimeMinutes: guide.readTimeMinutes,
        recommendedToolSlugs: guide.recommendedToolSlugs,
        faqs: guide.faqs as any,
        tableOfContents: guide.tableOfContents as any,
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_GUIDES.length} guides`);

  // 8. Seed Free AI Tools
  for (const ft of INITIAL_FREE_TOOLS) {
    await prisma.freeTool.upsert({
      where: { slug: ft.slug },
      update: {
        name: ft.name,
        description: ft.description,
        icon: ft.icon,
        category: ft.category,
        inputs: ft.inputs as any,
        promptTemplate: ft.promptTemplate,
        systemPrompt: ft.systemPrompt,
        examples: ft.examples as any,
        tips: ft.tips,
        faqs: ft.faqs as any,
      },
      create: {
        id: ft.id,
        slug: ft.slug,
        name: ft.name,
        description: ft.description,
        icon: ft.icon,
        category: ft.category,
        inputs: ft.inputs as any,
        promptTemplate: ft.promptTemplate,
        systemPrompt: ft.systemPrompt,
        examples: ft.examples as any,
        tips: ft.tips,
        faqs: ft.faqs as any,
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_FREE_TOOLS.length} free AI tools`);

  console.log('✨ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

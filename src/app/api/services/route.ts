import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { servicePricing, systemCurrencies } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const services = await db
      .select()
      .from(servicePricing)
      .orderBy(asc(servicePricing.sortOrder), asc(servicePricing.serviceName));

    const currencies = await db
      .select()
      .from(systemCurrencies)
      .where(eq(systemCurrencies.isEnabled, true))
      .orderBy(asc(systemCurrencies.sortOrder));

    const defaultCurrency = currencies.find((c) => c.isDefault) || currencies[0] || null;

    return NextResponse.json({
      success: true,
      services,
      currencies,
      defaultCurrency,
    });
  } catch (error: any) {
    console.error("GET /api/services error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load services" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      id,
      slug,
      serviceName,
      category,
      customerRate,
      ratePaise,
      billingUnit,
      currency,
      currencyId,
      isConfigurable,
      icon,
      description,
      isEnabled,
      sortOrder,
    } = body;

    if (action === "toggle") {
      if (!slug && !id) {
        return NextResponse.json({ success: false, error: "Service identifier is required" }, { status: 400 });
      }
      const [existing] = await db
        .select()
        .from(servicePricing)
        .where(slug ? eq(servicePricing.slug, slug) : eq(servicePricing.id, id))
        .limit(1);
      if (!existing) {
        return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
      }
      const newStatus = isEnabled !== undefined ? Boolean(isEnabled) : !existing.isEnabled;
      await db
        .update(servicePricing)
        .set({ isEnabled: newStatus, updatedAt: new Date() })
        .where(eq(servicePricing.id, existing.id));
      return NextResponse.json({
        success: true,
        message: `Service ${existing.serviceName} is now ${newStatus ? "active" : "disabled"}`,
        isEnabled: newStatus,
      });
    }

    if (action === "update") {
      if (!slug && !id) {
        return NextResponse.json({ success: false, error: "Service identifier is required" }, { status: 400 });
      }
      const [existing] = await db
        .select()
        .from(servicePricing)
        .where(slug ? eq(servicePricing.slug, slug) : eq(servicePricing.id, id))
        .limit(1);
      if (!existing) {
        return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
      }

      await db
        .update(servicePricing)
        .set({
          serviceName: serviceName?.trim() || existing.serviceName,
          customerRate: customerRate?.trim() || existing.customerRate,
          ratePaise: ratePaise !== undefined ? Number(ratePaise) : existing.ratePaise,
          billingUnit: billingUnit?.trim() || existing.billingUnit,
          currency: currency?.trim() || existing.currency,
          currencyId: currencyId !== undefined ? currencyId : existing.currencyId,
          isConfigurable: isConfigurable !== undefined ? Boolean(isConfigurable) : existing.isConfigurable,
          description: description !== undefined ? description?.trim() : existing.description,
          icon: icon?.trim() || existing.icon,
          isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : existing.isEnabled,
          sortOrder: sortOrder !== undefined ? Number(sortOrder) : existing.sortOrder,
          updatedAt: new Date(),
        })
        .where(eq(servicePricing.id, existing.id));

      return NextResponse.json({ success: true, message: "Service rate updated successfully!" });
    }

    if (action === "add") {
      if (!serviceName?.trim() || !customerRate?.trim() || !billingUnit?.trim()) {
        return NextResponse.json(
          { success: false, error: "Name, rate and billing unit are required" },
          { status: 400 }
        );
      }
      const cleanSlug = (slug || serviceName)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const [inserted] = await db
        .insert(servicePricing)
        .values({
          slug: cleanSlug,
          serviceName: serviceName.trim(),
          category: category?.trim() || "calling",
          customerRate: customerRate.trim(),
          ratePaise: ratePaise !== undefined ? Number(ratePaise) : 100,
          billingUnit: billingUnit.trim(),
          currency: currency?.trim() || "INR",
          currencyId: currencyId || null,
          isConfigurable: Boolean(isConfigurable),
          icon: icon?.trim() || "⚡",
          description: description?.trim() || "",
          isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
          sortOrder: sortOrder !== undefined ? Number(sortOrder) : 10,
        })
        .returning();

      return NextResponse.json({ success: true, message: "Service added successfully!", service: inserted });
    }

    if (action === "delete") {
      if (!slug && !id) {
        return NextResponse.json({ success: false, error: "Service identifier is required" }, { status: 400 });
      }
      const [existing] = await db
        .select()
        .from(servicePricing)
        .where(slug ? eq(servicePricing.slug, slug) : eq(servicePricing.id, id))
        .limit(1);
      if (!existing) {
        return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
      }

      await db.delete(servicePricing).where(eq(servicePricing.id, existing.id));
      return NextResponse.json({ success: true, message: `Service ${existing.serviceName} removed!` });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/services error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process service" },
      { status: 500 }
    );
  }
}

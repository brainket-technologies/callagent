import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { systemCurrencies, servicePricing } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const currencies = await db
      .select()
      .from(systemCurrencies)
      .orderBy(asc(systemCurrencies.sortOrder), asc(systemCurrencies.code));

    const defaultCurrency = currencies.find((c) => c.isDefault) || currencies[0] || null;
    const baseCurrency = currencies.find((c) => c.isBaseCurrency) || currencies[0] || null;

    return NextResponse.json({
      success: true,
      currencies,
      defaultCurrency,
      baseCurrency,
    });
  } catch (error: any) {
    console.error("GET /api/currencies error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load currencies" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, code, name, symbol, exchangeRate, isBaseCurrency, isDefault, isEnabled, sortOrder } = body;

    // Toggle enabled/disabled
    if (action === "toggle") {
      if (!id && !code) {
        return NextResponse.json({ success: false, error: "Currency ID or code is required" }, { status: 400 });
      }
      const [existing] = await db
        .select()
        .from(systemCurrencies)
        .where(id ? eq(systemCurrencies.id, id) : eq(systemCurrencies.code, code))
        .limit(1);

      if (!existing) {
        return NextResponse.json({ success: false, error: "Currency not found" }, { status: 404 });
      }

      if (existing.isDefault) {
        return NextResponse.json(
          { success: false, error: "Cannot disable the active default currency!" },
          { status: 400 }
        );
      }

      const newStatus = isEnabled !== undefined ? Boolean(isEnabled) : !existing.isEnabled;
      await db
        .update(systemCurrencies)
        .set({ isEnabled: newStatus, updatedAt: new Date() })
        .where(eq(systemCurrencies.id, existing.id));

      return NextResponse.json({
        success: true,
        message: `Currency ${existing.code} is now ${newStatus ? "enabled" : "disabled"}`,
        isEnabled: newStatus,
      });
    }

    // Set Default Currency: Anchors the entire platform to this currency
    if (action === "set_default") {
      if (!id && !code) {
        return NextResponse.json({ success: false, error: "Currency ID or code is required" }, { status: 400 });
      }

      const allCurrencies = await db.select().from(systemCurrencies);
      const currentDefault = allCurrencies.find((c) => c.isDefault) || allCurrencies[0];
      const target = allCurrencies.find((c) => (id && c.id === id) || (code && c.code === code));

      if (!target) {
        return NextResponse.json({ success: false, error: "Target currency not found" }, { status: 404 });
      }

      if (currentDefault && target.id === currentDefault.id && target.isDefault) {
        return NextResponse.json({
          success: true,
          message: `${target.code} is already the platform default currency.`,
        });
      }

      // Ratio from old default to new default:
      // In terms of old default, 1 oldDefault = targetRate units of target.
      // So newRate = oldRate * ratioToNewDefault
      const oldDefExchangeRate = parseFloat(currentDefault?.exchangeRate || "1.00") || 1.0;
      const targetExchangeRate = parseFloat(target.exchangeRate || "1.00") || 1.0;
      const ratioToNewDefault = targetExchangeRate / oldDefExchangeRate;

      // 1. Re-anchor all currencies to the new default (new default = 1.00, others = rate / ratioToNewDefault)
      for (const curr of allCurrencies) {
        const isNowDefault = curr.id === target.id;
        let newRateStr = "1.00";
        if (!isNowDefault) {
          const currRate = parseFloat(curr.exchangeRate || "1.00") || 1.0;
          const reanchored = currRate / ratioToNewDefault;
          if (reanchored >= 100) {
            newRateStr = reanchored.toFixed(2);
          } else if (reanchored >= 1) {
            newRateStr = reanchored.toFixed(4);
          } else {
            newRateStr = reanchored.toFixed(4);
          }
        }

        await db
          .update(systemCurrencies)
          .set({
            isDefault: isNowDefault,
            isEnabled: isNowDefault ? true : curr.isEnabled,
            exchangeRate: newRateStr,
            updatedAt: new Date(),
          })
          .where(eq(systemCurrencies.id, curr.id));
      }

      // 2. Synchronize all services in servicePricing:
      // Convert their customerRate to the new default currency so services are directly denominated in new default!
      const allServices = await db.select().from(servicePricing);
      for (const s of allServices) {
        const numericMatch = String(s.customerRate).match(/(\d+(?:\.\d+)?)/);
        const oldNumericRate = numericMatch ? parseFloat(numericMatch[1]) : 1.0;
        const convertedRate = oldNumericRate * ratioToNewDefault;
        const formattedRate = convertedRate >= 1 ? convertedRate.toFixed(2) : convertedRate.toFixed(convertedRate < 0.01 ? 4 : 3);
        const newPaise = Math.round(convertedRate * 100);

        await db
          .update(servicePricing)
          .set({
            customerRate: formattedRate,
            ratePaise: newPaise,
            currency: target.code,
            currencyId: target.id,
            updatedAt: new Date(),
          })
          .where(eq(servicePricing.id, s.id));
      }

      return NextResponse.json({
        success: true,
        message: `${target.code} (${target.symbol}) is now the platform default currency! All services and exchange rates are now anchored to ${target.code}.`,
      });
    }

    // Add New Currency
    if (action === "add") {
      if (!code?.trim() || !name?.trim() || !symbol?.trim()) {
        return NextResponse.json(
          { success: false, error: "Currency Code, Name, and Symbol are required" },
          { status: 400 }
        );
      }

      const cleanCode = code.trim().toUpperCase();

      // Check if code already exists
      const [existing] = await db
        .select()
        .from(systemCurrencies)
        .where(eq(systemCurrencies.code, cleanCode))
        .limit(1);

      if (existing) {
        return NextResponse.json(
          { success: false, error: `Currency code ${cleanCode} already exists!` },
          { status: 400 }
        );
      }

      if (Boolean(isDefault)) {
        await db.update(systemCurrencies).set({ isDefault: false });
      }

      const [inserted] = await db
        .insert(systemCurrencies)
        .values({
          code: cleanCode,
          name: name.trim(),
          symbol: symbol.trim(),
          exchangeRate: exchangeRate?.trim() || "1.00",
          isBaseCurrency: Boolean(isBaseCurrency),
          isDefault: Boolean(isDefault),
          isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
          sortOrder: sortOrder !== undefined ? Number(sortOrder) : 10,
        })
        .returning();

      // If set as default on creation, re-anchor services
      if (Boolean(isDefault)) {
        await db
          .update(servicePricing)
          .set({
            currency: inserted.code,
            currencyId: inserted.id,
            updatedAt: new Date(),
          });
      }

      return NextResponse.json({
        success: true,
        message: `Currency ${inserted.code} added successfully!`,
        currency: inserted,
      });
    }

    // Update Existing Currency
    if (action === "update") {
      if (!id && !code) {
        return NextResponse.json({ success: false, error: "Currency ID or code is required" }, { status: 400 });
      }

      const [existing] = await db
        .select()
        .from(systemCurrencies)
        .where(id ? eq(systemCurrencies.id, id) : eq(systemCurrencies.code, code))
        .limit(1);

      if (!existing) {
        return NextResponse.json({ success: false, error: "Currency not found" }, { status: 404 });
      }

      if (Boolean(isDefault) && !existing.isDefault) {
        await db.update(systemCurrencies).set({ isDefault: false });
      }

      await db
        .update(systemCurrencies)
        .set({
          name: name?.trim() || existing.name,
          symbol: symbol?.trim() || existing.symbol,
          exchangeRate: exchangeRate?.trim() || existing.exchangeRate,
          isBaseCurrency: isBaseCurrency !== undefined ? Boolean(isBaseCurrency) : existing.isBaseCurrency,
          isDefault: isDefault !== undefined ? Boolean(isDefault) : existing.isDefault,
          isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : existing.isEnabled,
          sortOrder: sortOrder !== undefined ? Number(sortOrder) : existing.sortOrder,
          updatedAt: new Date(),
        })
        .where(eq(systemCurrencies.id, existing.id));

      return NextResponse.json({
        success: true,
        message: `Currency ${existing.code} updated successfully!`,
      });
    }

    // Delete Currency
    if (action === "delete") {
      if (!id && !code) {
        return NextResponse.json({ success: false, error: "Currency ID or code is required" }, { status: 400 });
      }

      const [existing] = await db
        .select()
        .from(systemCurrencies)
        .where(id ? eq(systemCurrencies.id, id) : eq(systemCurrencies.code, code))
        .limit(1);

      if (!existing) {
        return NextResponse.json({ success: false, error: "Currency not found" }, { status: 404 });
      }

      if (existing.isDefault) {
        return NextResponse.json(
          { success: false, error: `Cannot delete active default currency (${existing.code})! Set another currency as default first.` },
          { status: 400 }
        );
      }

      await db.delete(systemCurrencies).where(eq(systemCurrencies.id, existing.id));

      return NextResponse.json({
        success: true,
        message: `Currency ${existing.code} deleted successfully!`,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/currencies error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process currency action" },
      { status: 500 }
    );
  }
}


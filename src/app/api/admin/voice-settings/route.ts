import { NextRequest, NextResponse } from "next/server";
import { getVoiceProvidersConfig, saveVoiceProvidersConfig } from "@/lib/voice-providers";

export async function GET(req: NextRequest) {
  try {
    const config = await getVoiceProvidersConfig();

    // Mask keys for safety
    const maskKey = (k?: string) => {
      if (!k) return "";
      if (k.length <= 8) return "••••••••";
      return `${k.slice(0, 4)}••••••••${k.slice(-4)}`;
    };

    return NextResponse.json({
      success: true,
      config: {
        elevenlabsApiKey: maskKey(config.elevenlabsApiKey),
        sarvamApiKey: maskKey(config.sarvamApiKey),
        cartesiaApiKey: maskKey(config.cartesiaApiKey),
        openaiApiKey: maskKey(config.openaiApiKey),
        hasElevenlabsKey: Boolean(config.elevenlabsApiKey),
        hasSarvamKey: Boolean(config.sarvamApiKey),
        hasCartesiaKey: Boolean(config.cartesiaApiKey),
        hasOpenaiKey: Boolean(config.openaiApiKey),
        defaultProvider: config.defaultProvider || "elevenlabs",
      },
    });
  } catch (err: any) {
    console.error("GET /api/admin/voice-settings error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load voice settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { elevenlabsApiKey, sarvamApiKey, cartesiaApiKey, openaiApiKey, defaultProvider } = body;

    const current = await getVoiceProvidersConfig();

    const updatePayload: any = {};
    if (elevenlabsApiKey !== undefined) {
      // If user passed masked value (contains •), retain existing
      if (!elevenlabsApiKey.includes("••••")) {
        updatePayload.elevenlabsApiKey = elevenlabsApiKey.trim();
      }
    }
    if (sarvamApiKey !== undefined) {
      if (!sarvamApiKey.includes("••••")) {
        updatePayload.sarvamApiKey = sarvamApiKey.trim();
      }
    }
    if (cartesiaApiKey !== undefined) {
      if (!cartesiaApiKey.includes("••••")) {
        updatePayload.cartesiaApiKey = cartesiaApiKey.trim();
      }
    }
    if (openaiApiKey !== undefined) {
      if (!openaiApiKey.includes("••••")) {
        updatePayload.openaiApiKey = openaiApiKey.trim();
      }
    }
    if (defaultProvider) {
      updatePayload.defaultProvider = defaultProvider;
    }

    const saved = await saveVoiceProvidersConfig(updatePayload);

    return NextResponse.json({
      success: true,
      message: "Voice Provider API credentials saved successfully!",
      hasElevenlabsKey: Boolean(saved.elevenlabsApiKey),
      hasSarvamKey: Boolean(saved.sarvamApiKey),
      hasCartesiaKey: Boolean(saved.cartesiaApiKey),
      hasOpenaiKey: Boolean(saved.openaiApiKey),
      defaultProvider: saved.defaultProvider,
    });
  } catch (err: any) {
    console.error("POST /api/admin/voice-settings error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to save voice settings" },
      { status: 500 }
    );
  }
}
